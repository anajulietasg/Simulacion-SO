import { Bloque } from "./Bloque";
import { PoliticaBase } from "./PoliticaBase";

export class BestFit extends PoliticaBase {            //elige el hueco mas chico donde el proceso igual entra
  protected esMejor(candidato: Bloque, actual: Bloque): boolean {
    return candidato.tamanio < actual.tamanio;        //es mejor si el candidato es mas chico que el que tenia
  }
}