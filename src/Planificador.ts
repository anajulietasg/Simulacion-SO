import { Proceso } from "./Proceso";
import { IPlanificador } from "./IPlanificador";

export class Planificador implements IPlanificador {
    private _colaListos: Proceso[];     //la fila de procesos que esperan la CPU
    private _quantumLimite: number;      //cuantos ticks seguidos puede usar cada uno
    private _enCpu: Proceso | null;     //el unico proceso que está ejecutando, o nadie
    private _cambiosDeContexto: number;

    constructor(quantumLimite: number = 2) {
        if (!Number.isInteger(quantumLimite) || quantumLimite <= 0) {
            throw new Error("El quantum debe ser un entero positivo");
        }
        this._colaListos = [];                //arranca vacia
        this._quantumLimite = quantumLimite;
        this._enCpu = null;
        this._cambiosDeContexto = 0;
    }

    get colaListos(): readonly Proceso[] {   //vista de solo lectura
        return [...this._colaListos];
    }

    get enCpu(): Proceso | null { 
        return this._enCpu; 
    }

    get cambiosDeContexto(): number { 
        return this._cambiosDeContexto; 
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
            this._enCpu = null;       //deja la CPU libre
            return proceso;          //lo devuelve para que el simulador libere su memoria
        }

        if (proceso.debeBloquearse()) {     //el bloqueo por E/S tiene prioridad sobre el quantum
            proceso.bloquearPorES();
            this._enCpu = null;
            this._cambiosDeContexto++;      //el bloqueo cuenta como cambio de contexto
            return proceso;
        }

        if (proceso.agotoQuantum(this._quantumLimite)) {
            if (this._colaListos.length > 0) {        //hay otros esperando, rota y se cuenta un cambio de contexto
                proceso.pasarA("listo");
                this._colaListos.push(proceso);       //vuelve al final de la fila
                this._enCpu = null;
                this._cambiosDeContexto++;
            } else {                                //el único en la lista, renueva su quantum y sigue sin cambio de contexto
                proceso.reiniciarQuantum();
            }
        }
        return null;
    }

}