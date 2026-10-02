import { AdminMemoria } from "./AdminMemoria";
import { Planificador } from "./Planificador";
import { Proceso } from "./Proceso";
import { IAsignador } from "./IAsignador";
import { FirstFit } from "./FirstFit";

export class Simulador {
    private _memoria: AdminMemoria;
    private _planificador: Planificador;
    private _tick: number;                  //el reloj, cuántos ticks pasaron
    private _colaNuevos: Proceso[] = [];    //procesos que todavia no tienen memoria
    private _colaBloqueados: Proceso[] = [];     //procesos esperando una entrada o salida
    private _ticksCpuOcupada: number = 0;  
    private _tamanioMemoria: number;
    private _pidsUsados: Set<string> = new Set();   
    private _terminados: Proceso[] = [];


    constructor(
        tamanioMemoria: number = 1024,
        quantum: number = 2,
        politica: IAsignador = new FirstFit()
    ) {
        if (!Number.isInteger(tamanioMemoria) || tamanioMemoria <= 0) {
            throw new Error("La memoria total debe ser un entero positivo");
        }
        if (!Number.isInteger(quantum) || quantum <= 0) {
            throw new Error("El quantum debe ser un entero positivo");
        }
        this._memoria = new AdminMemoria(tamanioMemoria, politica);
        this._planificador = new Planificador(quantum);
        this._tick = 0;
        this._tamanioMemoria = tamanioMemoria;
    }

    get tick(): number { 
        return this._tick; 
    }
    get memoria(): AdminMemoria { 
        return this._memoria; 
    }
    get planificador(): Planificador { 
        return this._planificador; 
    }
    get colaNuevos(): readonly Proceso[] { 
        return [...this._colaNuevos]; 
    }
    get colaBloqueados(): readonly Proceso[] { 
        return [...this._colaBloqueados]; 
    }
    get ticksCpuOcupada(): number { 
        return this._ticksCpuOcupada; 
    }

    registrarProceso(proceso: Proceso): void {           //ingresa un proceso nuevo al sistema, todavia sin memoria
        if (this._pidsUsados.has(proceso.pid)) {
            throw new Error(`Ya existe un proceso con el pid ${proceso.pid}`);
        }
        if (proceso.memoriaNecesaria > this._tamanioMemoria) {
            throw new Error(`El proceso ${proceso.pid} pide mas memoria que la total`);
        }
        this._pidsUsados.add(proceso.pid);
        proceso.pasarA("nuevo");
        this._colaNuevos.push(proceso);
    }

    admitirProcesos(): void {              //intenta darle memoria a los procesos nuevos. Los que entran pasan a listos
        const siguen: Proceso[] = [];     //los que no consiguieron memoria todavia
        for (const proceso of this._colaNuevos) {
            if (this._memoria.asignar(proceso)) {
                this._planificador.agregarAListos(proceso);   //consiguió memoria, va a la fila de la CPU
            } else {
                proceso.pasarA("esperando_memoria");
                siguen.push(proceso);                          //no entró, sigue esperando
            }
        }
        this._colaNuevos = siguen;      //en la cola quedan solo los que no entraron
    }

    actualizarBloqueados(): void {      //a los bloqueados les resta un tick de espera y al que ya cumplió lo manda a listos
        const siguen: Proceso[] = [];
        for (const proceso of this._colaBloqueados) {
            proceso.descontarBloqueo();
            if (proceso.terminoBloqueo()) {
                this._planificador.agregarAListos(proceso);  
            } else {
                siguen.push(proceso);                          
            }
        }
        this._colaBloqueados = siguen;
    }

    avanzarTick(): void {
        this._tick++;
        this.admitirProcesos();        //intento dar memoria a los nuevos
        this.actualizarBloqueados();   //reviso los que esperaban una entrada o salida
        this._planificador.ponerAEjecutar();   //si la CPU esta libre, despacho
        if (this._planificador.enCpu !== null) {
            this._ticksCpuOcupada++;                 //la CPU trabajó en este tick
        }
        const terminado = this._planificador.ejecutarTick();
        if (terminado !== null) {
            this._memoria.liberar(terminado.pid);        //si alguno terminó, libero su memoria
            this._terminados.push(terminado);
        }
    }

    bloquearProcesoEnCpu(ticks: number): void {           //manda a bloqueado al proceso que esta en la CPU, por la cantidad de ticks indicada
        const proceso = this._planificador.sacarDeCpu();
        if (proceso !== null) {
            proceso.bloquearPor(ticks);
            this._colaBloqueados.push(proceso);
        }
    }

    estadoActual() {         // devuelve el estado actual del sistema, de solo lectura
        return {
            tick: this._tick,
            enCpu: this._planificador.enCpu?.pid ?? null,
            listos: this._planificador.colaListos.map(p => p.pid),
            esperandoMemoria: this._colaNuevos.map(p => p.pid),
            bloqueados: this._colaBloqueados.map(p => p.pid),
            terminados: this._terminados.map(p => p.pid),
            mapaMemoria: this._memoria.bloques.map(b => ({
                inicio: b.inicio,
                tamanio: b.tamanio,
                pid: b.pid,
            })),
        };
    }

    metricas() {          //reune las métricas del sistema
        const mem = this._memoria.metricas();
        const usoCpu = this._tick === 0 ? 0 : (this._ticksCpuOcupada / this._tick) * 100;
        return {
            usoCpu,
            ocupacionMemoria: (mem.ocupada / this._tamanioMemoria) * 100,
            cambiosDeContexto: this._planificador.cambiosDeContexto,
            memoriaLibre: mem.libreTotal,
            mayorHueco: mem.mayorHueco,
            fragmentacion: this._memoria.fragmentacionExterna(),
        };
    }

}