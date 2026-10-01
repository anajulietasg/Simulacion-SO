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

  terminado(): boolean {        //avisa si al proceso ya no le queda tiempo de CPU
    return this._tiempoRestante === 0;      //true cuando su tiempo llegó a cero y false si todavía le queda
  }

  reiniciarQuantum(): void {     //vuelve el quantum a cero para cuando el proceso arranca un nuevo turno
    this._quantumConsumido = 0;
  }

  agotoQuantum(limite: number): boolean {          //avisa si el proceso ya gasto todo el quantum permitido
    return this._quantumConsumido === limite;
  }

  pasarA(nuevoEstado: string): void {            // cambia el estado del proceso
    this._estado = nuevoEstado;
  }
}