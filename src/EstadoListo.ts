import { IEstado } from "./IEstado";

export class EstadoListo implements IEstado {
  nombre(): string {
    return "listo";
  }
  puedePasarA(destino: string): boolean {         //desde listo solo pasa a ejecutando, cuando le toca la CPU
    return destino === "ejecutando";
  }
}