export class Proceso {
  pid: string;
  memoriaNecesaria: number;
  tiempoRestante: number;
  estado: string;

  constructor(pid: string, memoriaNecesaria: number, tiempoCpu: number) {
    this.pid = pid;
    this.memoriaNecesaria = memoriaNecesaria;
    this.tiempoRestante = tiempoCpu;
    this.estado = "nuevo";
  }
}