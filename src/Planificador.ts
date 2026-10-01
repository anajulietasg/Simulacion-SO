import { Proceso } from "./Proceso";

export class Planificador {
    private _colaListos: Proceso[];     //la fila de procesos que esperan la CPU
    private _quantumLimite: number;      //cuantos ticks seguidos puede usar cada uno

    constructor(quantumLimite: number = 2) {
        this._colaListos = [];                //arranca vacia
        this._quantumLimite = quantumLimite;
    }

    get colaListos(): readonly Proceso[] {   //vista de solo lectura
        return [...this._colaListos];
    }

    agregarAListos(proceso: Proceso): void {          //un proceso que ya tiene memoria entra al final de la fila
        proceso.pasarA("listo");
        this._colaListos.push(proceso);
    }
}