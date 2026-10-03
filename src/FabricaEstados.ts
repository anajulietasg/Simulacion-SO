import { IEstado } from "./IEstado";
import { EstadoNuevo } from "./EstadoNuevo";
import { EstadoEsperandoMem } from "./EstadoEsperandoMem";
import { EstadoListo } from "./EstadoListo";
import { EstadoEjecutando } from "./EstadoEjecutando";
import { EstadoBloqueado } from "./EstadoBloqueado";
import { EstadoTerminado } from "./EstadoTerminado";

export function crearEstado(nombre: string): IEstado {        //dado el nombre de un estado, devuelve el objeto que le corresponde
  switch (nombre) {
    case "nuevo": return new EstadoNuevo();
    case "esperando_memoria": return new EstadoEsperandoMem();
    case "listo": return new EstadoListo();
    case "ejecutando": return new EstadoEjecutando();
    case "bloqueado": return new EstadoBloqueado();
    case "terminado": return new EstadoTerminado();
    default: throw new Error(`Estado desconocido ${nombre}`);
  }
}