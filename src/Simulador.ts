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

    constructor(
        tamanioMemoria: number = 1024,
        quantum: number = 2,
        politica: IAsignador = new FirstFit()
    ) {
        this._memoria = new AdminMemoria(tamanioMemoria, politica);
        this._planificador = new Planificador(quantum);
        this._tick = 0;
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

    registrarProceso(proceso: Proceso): void {           //ingresa un proceso nuevo al sistema, todavia sin memoria
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
        const terminado = this._planificador.ejecutarTick();  // 4. ejecuto un tick
        if (terminado !== null) {
            this._memoria.liberar(terminado.pid);  // si alguno termino, libero su memoria
        }
    }

    bloquearProcesoEnCpu(ticks: number): void {           //manda a bloqueado al proceso que esta en la CPU, por la cantidad de ticks indicada
        const proceso = this._planificador.sacarDeCpu();
        if (proceso !== null) {
            proceso.bloquearPor(ticks);
            this._colaBloqueados.push(proceso);
        }
    }
}