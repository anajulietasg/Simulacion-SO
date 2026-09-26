import { Bloque } from "./Bloque";
import { Proceso } from "./Proceso";

export class AdminMemoria {       //la memoria es una lista de bloques
  tamanioTotal: number;
  bloques: Bloque[];

  constructor(tamanioTotal: number = 1024) {
    this.tamanioTotal = tamanioTotal;         //es un solo bloque libre al inicio
    this.bloques = [new Bloque(0, tamanioTotal)];
  }
}