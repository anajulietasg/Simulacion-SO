import { IEstado } from "../src/IEstado";
import { crearEstado } from "../src/FabricaEstados";

export class Proceso {
  private _pid: string;
  private _memoriaNecesaria: number;
  private _tiempoRestante: number;
  private _estado: IEstado;
  private _quantumConsumido: number;      //ticks seguidos que lleva en la CPU en su turno
  private _cpuConsumida: number = 0;      //ticks de CPU que uso en total
  private _bloqueoRestante: number = 0;       //ticks que le faltan esperar
  private _esDisparo: number | null = null;   //despues de cuantos ticks de CPU se dispara la E/S
  private _esDuracion: number = 0;            //cuantos ticks dura la E/S
  
  constructor(pid: string, memoriaNecesaria: number, tiempoCpu: number) {
    if (pid.trim() === "") {
      throw new Error("El pid no puede estar vacio");
    }
    if (!Number.isInteger(memoriaNecesaria) || memoriaNecesaria <= 0) {
      throw new Error("La memoria debe ser un entero positivo");
    }
    if (!Number.isInteger(tiempoCpu) || tiempoCpu <= 0) {
      throw new Error("El tiempo de CPU debe ser un entero positivo");
    }
    this._pid = pid;
    this._memoriaNecesaria = memoriaNecesaria;
    this._tiempoRestante = tiempoCpu;
    this._estado = crearEstado("nuevo");
    this._quantumConsumido = 0;
  }

  get pid(): string { return this._pid; }
  get memoriaNecesaria(): number { return this._memoriaNecesaria; }
  get tiempoRestante(): number { return this._tiempoRestante; }
  get quantumConsumido(): number { return this._quantumConsumido; }
  get bloqueoRestante(): number { return this._bloqueoRestante; }
  get estado(): string { return this._estado.nombre(); }

  ejecutarUnTick(): void {        //usa un tick de CPU, le baja uno a lo que le falta y le suma uno a su quantum
    if (this.estado !== "ejecutando") {
      throw new Error(`El proceso ${this._pid} no esta en la CPU`);
    }
    this._tiempoRestante--;
    this._quantumConsumido++;
    this._cpuConsumida++;
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

  pasarA(destino: string): void {            // cambia el estado del proceso
    if (!this._estado.puedePasarA(destino)) {
      throw new Error(`No se puede pasar de ${this.estado} a ${destino}`);
    }
    this._estado = crearEstado(destino);
  }

  puedePasarA(destino: string): boolean {
    return this._estado.puedePasarA(destino);
  }

  programarES(despuesDeTicks: number, duracion: number): void {     //define una E/S que se dispara despues de cierta cantidad de ticks de CPU
    if (!Number.isInteger(despuesDeTicks) || despuesDeTicks <= 0) {
      throw new Error("El disparo de la E/S debe ser un entero positivo");
    }
    if (!Number.isInteger(duracion) || duracion <= 0) {
      throw new Error("La duracion de la E/S debe ser un entero positivo");
    }
    if (despuesDeTicks <= this._cpuConsumida || despuesDeTicks >= this._cpuConsumida + this._tiempoRestante) {
      throw new Error("La E/S debe dispararse antes de que el proceso termine");
    }
    if (this._esDisparo !== null) {
      throw new Error("El proceso ya tiene una E/S programada");
    }
    this._esDisparo = despuesDeTicks;
    this._esDuracion = duracion;
  }

  debeBloquearse(): boolean {           //avisa si en este momento le toca la E/S
    return this._esDisparo !== null && this._cpuConsumida === this._esDisparo;
  }

  bloquearPorES(): void {              //dispara la E/S programada
    this.pasarA("bloqueado");
    this._bloqueoRestante = this._esDuracion;
    this._esDisparo = null;             //la E/S ya se uso
  }

  descontarBloqueo(): void { 
    if (this.estado !== "bloqueado") {
      throw new Error(`El proceso ${this._pid} no esta bloqueado`);
    }
    this._bloqueoRestante--; 
  }

  terminoBloqueo(): boolean { 
    return this._bloqueoRestante === 0; 
  }
}