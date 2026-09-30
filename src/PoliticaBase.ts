import { Bloque } from "./Bloque";
import { IAsignador } from "./IAsignador";

export abstract class PoliticaBase implements IAsignador {      //clase abstracta con la lógica que comparten las tres politicas
  elegirIndice(bloques: readonly Bloque[], memoriaNecesaria: number): number {
    let elegido = -1;     //guarda la posicion del mejor hueco encontrado hasta ahora, comienza en -1
    for (let i = 0; i < bloques.length; i++) {    //recorro todos los bloques
      const b = bloques[i];                         
      if (b.estaLibre() && b.tamanio >= memoriaNecesaria) {     //si esta libre Y  es lo bastante grande para el proceso
        if (elegido === -1 || this.esMejor(b, bloques[elegido])) {    //se queda con el bloque si es el primero o si es mejor que el que tenia
          elegido = i;
        }
      }
    }
    return elegido;
  }

  protected abstract esMejor(candidato: Bloque, actual: Bloque): boolean;    //cada politica tiene su propio criterio, protected: solo lo usan esta clase y sus hijas
}


