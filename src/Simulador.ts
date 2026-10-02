import { AdminMemoria } from "./AdminMemoria";
import { Planificador } from "./Planificador";
import { Proceso } from "./Proceso";
import { IAsignador } from "./IAsignador";
import { FirstFit } from "./FirstFit";

export class Simulador {
  private _memoria: AdminMemoria;
  private _planificador: Planificador;
  private _tick: number;                  //el reloj, cuántos ticks pasaron

  constructor(
    tamanioMemoria: number = 1024,
    quantum: number = 2,
    politica: IAsignador = new FirstFit()
  ) {
    this._memoria = new AdminMemoria(tamanioMemoria, politica);
    this._planificador = new Planificador(quantum);
    this._tick = 0;
  }

  get tick(): number { return this._tick; }
  get memoria(): AdminMemoria { return this._memoria; }
  get planificador(): Planificador { return this._planificador; }
}