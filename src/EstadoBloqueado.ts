import { IEstado } from "../src/IEstado";

export class EstadoBloqueado implements IEstado {
  nombre(): string {
    return "bloqueado";
  }
  puedePasarA(destino: string): boolean {         //cuando termina de esperar, vuelve a la fila de listos
    return destino === "listo";
  }
}