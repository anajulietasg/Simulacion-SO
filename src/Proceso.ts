export class Proceso {
  private _pid: string;
  private _memoriaNecesaria: number;
  private _tiempoRestante: number;
  private _estado: string;

  constructor(pid: string, memoriaNecesaria: number, tiempoCpu: number) {
    this._pid = pid;
    this._memoriaNecesaria = memoriaNecesaria;
    this._tiempoRestante = tiempoCpu;
    this._estado = "nuevo";
  }

  get pid(): string { return this._pid; }
  get memoriaNecesaria(): number { return this._memoriaNecesaria; }
  get tiempoRestante(): number { return this._tiempoRestante; }
  get estado(): string { return this._estado; }

}