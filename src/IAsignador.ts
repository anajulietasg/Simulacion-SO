import { Bloque } from "./Bloque";

export interface IAsignador {
  elegirIndice(bloques: readonly Bloque[], memoriaNecesaria: number): number;      //devuelve la posicion del hueco elegido o -1 si no hay ninguno que sirva
}