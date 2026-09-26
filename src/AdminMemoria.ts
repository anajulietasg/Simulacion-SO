import { Bloque } from "./Bloque";
import { Proceso } from "./Proceso";

export class AdminMemoria {       //la memoria es una lista de bloques
  tamanioTotal: number;
  bloques: Bloque[];

  constructor(tamanioTotal: number = 1024) {
    this.tamanioTotal = tamanioTotal;         //es un solo bloque libre al inicio
    this.bloques = [new Bloque(0, tamanioTotal)];
  }
    asignarFirstFit(proceso: Proceso): boolean {
        for (let i = 0; i < this.bloques.length; i++) {        //recorre los bloques
            const bloque = this.bloques[i];
            if (bloque.estaLibre() && bloque.tamanio >= proceso.memoriaNecesaria) {     //si está libre y si es lo bastante grande para el proceso
                this.partirYAsignar(i, bloque, proceso);    //el primero que cumple, lo usa y corta
                return true;
            }
        }
     return false;
    }

  private partirYAsignar(indice: number, bloque: Bloque, proceso: Proceso): void {  
    if (bloque.tamanio > proceso.memoriaNecesaria) {                   //si el hueco es más grande que lo que el proceso necesita
      const sobrante = bloque.tamanio - proceso.memoriaNecesaria;       //calcula el espacio que va a sobrar
      const nuevoLibre = new Bloque(bloque.inicio + proceso.memoriaNecesaria, sobrante);   //nuevo bloque, comienza donde termina el proceso y su tamaño es sobrante
      bloque.tamanio = proceso.memoriaNecesaria;          //achico el bloque y le paso el pid, ahora está ocupado
      bloque.pid = proceso.pid;                             
      this.bloques.splice(indice + 1, 0, nuevoLibre);     //mete el bloque libre nuevo en la lista
    } 
    else {      //si tamaño es justo
      bloque.pid = proceso.pid;   
    }
  }
}