import { Bloque } from "./Bloque";
import { Proceso } from "./Proceso";
import { IAsignador } from "./IAsignador";
import { FirstFit } from "./FirstFit";
import { IGestorMemoria } from "./IGestorMemoria";

export class AdminMemoria implements IGestorMemoria {       //la memoria es una lista de bloques
  private _bloques: Bloque[];
  private politica: IAsignador;

  constructor(tamanioTotal: number = 1024, politica: IAsignador = new FirstFit()) {     //al crear el administrador puedo elegir el tamaño y la politica
    this._bloques = [new Bloque(0, tamanioTotal)];     //un solo bloque libre
    this.politica = politica;
  }

  get bloques(): readonly Bloque[] {    //devuelve copias para que nadie modifique la memoria desde afuera
    return this._bloques.map(b => new Bloque(b.inicio, b.tamanio, b.pid));
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
  
  liberar(pid: string): boolean {           //libera el bloque de un proceso que terminó y junta los huecos de al lado
    for (const bloque of this._bloques) {
      if (bloque.pid === pid) {
        bloque.liberar();      //lo marco libre
        this.coalescencia();   //junto los huecos que hayan quedado pegados
        return true;
      }
    }
    return false;              //no habia ningun proceso con ese pid
  }

  private coalescencia(): void {     //une en uno solo bloque los libres que esten uno al lado del otro
    let i = 0;
    while (i < this._bloques.length - 1) {
      const actual = this._bloques[i];
      const siguiente = this._bloques[i + 1];
      if (actual.estaLibre() && siguiente.estaLibre()) {
        actual.agrandarEn(siguiente.tamanio);         //el actual absorbe al siguiente
        this._bloques.splice(i + 1, 1);           //saco al siguiente de la lista, i+1 es la posición del siguiente y el 1 es cuántos elementos borra
      } else {
        i++;     //si no se pueden juntar avanzo al siguiente
      }
    }
  }

  metricas() {       //devuelve los numeros de la memoria en este momento
    const ocupada = this._bloques
      .filter(b => !b.estaLibre())               //me quedo con los ocupados
      .reduce((suma, b) => suma + b.tamanio, 0);    //sumo sus tamaños
    const libres = this._bloques.filter(b => b.estaLibre());
    const libreTotal = libres.reduce((suma, b) => suma + b.tamanio, 0);
    const mayorHueco = libres.length > 0 ? Math.max(...libres.map(b => b.tamanio)) : 0;
    return { ocupada, libreTotal, mayorHueco };
  }
  
  fragmentacionExterna(): number {             //qué tan partida esta la memoria libre
    const m = this.metricas();
    if (m.libreTotal === 0) {     //memroia llena, fragmentación externa = 0
      return 0;             
    }
    return (1 - m.mayorHueco / m.libreTotal) * 100;
  }
}