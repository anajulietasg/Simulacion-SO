import { Bloque } from "./Bloque";
import { PoliticaBase } from "./PoliticaBase";

export class FirstFit extends PoliticaBase {        //elige el primer hueco que sirve
  protected esMejor(): boolean {
    return false;       //nunca reemplaza el primero que encuentra
  }
}