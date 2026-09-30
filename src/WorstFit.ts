import { Bloque } from "./Bloque";
import { PoliticaBase } from "./PoliticaBase";

export class WorstFit extends PoliticaBase {        //elige el hueco más grande de todos
  protected esMejor(candidato: Bloque, actual: Bloque): boolean {
    return candidato.tamanio > actual.tamanio;        //es mejor si el candidato es más grande que el que tenia
  }
}