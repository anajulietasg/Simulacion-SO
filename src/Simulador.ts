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

}