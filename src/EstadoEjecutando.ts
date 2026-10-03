import { IEstado } from "./IEstado";

export class EstadoEjecutando implements IEstado {
    nombre(): string {
        return "ejecutando";
    }
    puedePasarA(destino: string): boolean {                         //desde ejecutando puede ir a listo, bloqueado o terminado
        return destino === "listo" || destino === "bloqueado" || destino === "terminado";
    }
}