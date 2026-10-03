import { IEstado } from "./IEstado";

export class EstadoEsperandoMem implements IEstado {
  nombre(): string {
    return "esperando_memoria";
  }
  puedePasarA(destino: string): boolean {       //solo pasa a listo cuando consigue memoria
    return destino === "listo";
  }
}