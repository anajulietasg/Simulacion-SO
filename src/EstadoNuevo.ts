import { IEstado } from "./IEstado";

export class EstadoNuevo implements IEstado {
    nombre(): string {
        return "nuevo";
    }
    puedePasarA(destino: string): boolean {          //pasa a listo si consigue memoria, o a esperando memoria si no entra
        return destino === "listo" || destino === "esperando_memoria";
    }
}