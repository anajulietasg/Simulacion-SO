import { IEstado } from "./IEstado";

export class EstadoTerminado implements IEstado {
  nombre(): string {
    return "terminado";
  }
  puedePasarA(destino: string): boolean {          //de terminado no sale a ningun lado
    return false;
  }
}