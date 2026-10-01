import { Proceso } from "./Proceso";

export class Planificador {
    private _colaListos: Proceso[];     //la fila de procesos que esperan la CPU
    private _quantumLimite: number;      //cuantos ticks seguidos puede usar cada uno
    private _enCpu: Proceso | null;     //el unico proceso que está ejecutando, o nadie

    constructor(quantumLimite: number = 2) {
        this._colaListos = [];                //arranca vacia
        this._quantumLimite = quantumLimite;
        this._enCpu = null;
    }

    get colaListos(): readonly Proceso[] {   //vista de solo lectura
        return [...this._colaListos];
    }

    get enCpu(): Proceso | null { 
        return this._enCpu; 
    }

    agregarAListos(proceso: Proceso): void {          //un proceso que ya tiene memoria entra al final de la fila
        proceso.pasarA("listo");
        this._colaListos.push(proceso);
    }

    ponerAEjecutar(): void {           //si la CPU esta libre y hay procesos esperando, toma el primero de la fila
        if (this._enCpu === null && this._colaListos.length > 0) {
            const proceso = this._colaListos.shift()!;         //saca al primero de la fila
            proceso.pasarA("ejecutando");
            proceso.reiniciarQuantum();                  //arranca su turno de cero
            this._enCpu = proceso;
        }
    }

    ejecutarTick(): Proceso | null {            //ejecuta un tick del proceso que está en la CPU
        if (this._enCpu === null) {
            return null;               //no hay nada que ejecutar
        }

        const proceso = this._enCpu;
        this._enCpu.ejecutarUnTick();

        if (proceso.terminado()) {          //si terminó su tiempo de CPU, lo saco de la CPU y no vuelve a la fila
            proceso.pasarA("terminado");
            this._enCpu = null       //deja la CPU libre
            return proceso;          //lo devuelve para que el simulador libere su memoria
        }
        return null;
    }

}