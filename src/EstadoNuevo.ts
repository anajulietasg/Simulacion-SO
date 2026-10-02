import { IEstado } from "../src/IEstado";

export class EstadoNuevo implements IEstado {
    nombre(): string {
        return "nuevo";
    }
    puedePasarA(destino: string): boolean {          //desde nuevo solo puede pasar a esperando memoria
        return destino === "esperando_memoria";
    }
}