import { Bloque } from "./Bloque";
import { Proceso } from "./Proceso";
import { IAsignador } from "./IAsignador";
import { FirstFit } from "./FirstFit";

export class AdminMemoria {       //la memoria es una lista de bloques
  private _bloques: Bloque[];
  private politica: IAsignador;

  constructor(tamanioTotal: number = 1024, politica: IAsignador = new FirstFit()) {     //al crear el administrador puedo elegir el tamaño y la politica
    this._bloques = [new Bloque(0, tamanioTotal)];     //un solo bloque libre
    this.politica = politica;
  }

  get bloques(): readonly Bloque[] {    //vista readonly para que nadie modifique la lista desde afuera
    return [...this._bloques];          //con [...] armo un array nuevo
  }

  asignar(proceso: Proceso): boolean {
    const indice = this.politica.elegirIndice(this._bloques, proceso.memoriaNecesaria);    //Le pregunto a la politica en qué hueco va
    if (indice === -1) {
      return false;          //no habia lugar, aviso que falló
    }
    this.partirYAsignar(indice, this._bloques[indice], proceso);
    return true;            //si habia lugar, meto el proceso en ese hueco
  }

  private partirYAsignar(indice: number, bloque: Bloque, proceso: Proceso): void {     //mete el proceso en el hueco, si sobra espacio lo parte en dos
    if (bloque.tamanio > proceso.memoriaNecesaria) {     
      const sobrante = bloque.tamanio - proceso.memoriaNecesaria;     //cuanto va a quedar libre despues de meter el proceso
      const nuevoLibre = new Bloque(bloque.inicio + proceso.memoriaNecesaria, sobrante);    //creo nuevo bloque de ese tamaño, comienza donde termina el proceso
      bloque.achicarA(proceso.memoriaNecesaria);     //achico el hueco original al tamaño del proceso
      bloque.ocupar(proceso.pid);            
      this._bloques.splice(indice + 1, 0, nuevoLibre);    //inserto el bloque libre justo despues del que acabo de ocupar
    } else {
      bloque.ocupar(proceso.pid);
    }
  }
}