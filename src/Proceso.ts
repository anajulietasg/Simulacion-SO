export class Proceso {
  private _pid: string;
  private _memoriaNecesaria: number;
  private _tiempoRestante: number;
  private _estado: string;
  private _quantumConsumido: number;   //ticks seguidos que lleva en la CPU en su turno

  constructor(pid: string, memoriaNecesaria: number, tiempoCpu: number) {
    this._pid = pid;
    this._memoriaNecesaria = memoriaNecesaria;
    this._tiempoRestante = tiempoCpu;
    this._estado = "nuevo";
    this._quantumConsumido = 0;
  }

  get pid(): string { return this._pid; }
  get memoriaNecesaria(): number { return this._memoriaNecesaria; }
  get tiempoRestante(): number { return this._tiempoRestante; }
  get quantumConsumido(): number { return this._quantumConsumido; }
  get estado(): string { return this._estado; }

  ejecutarUnTick(): void {        //usa un tick de CPU, le baja uno a lo que le falta y le suma uno a su quantum
    this._tiempoRestante--;
    this._quantumConsumido++;
  }
}