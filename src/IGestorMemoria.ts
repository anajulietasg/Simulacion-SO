import { Bloque } from "../src/Bloque";
import { Proceso } from "../src/Proceso";

export interface IGestorMemoria {          //lo que el simulador necesita de la memoria
  readonly bloques: readonly Bloque[];
  asignar(proceso: Proceso): boolean;
  liberar(pid: string): boolean;
  metricas(): { ocupada: number; libreTotal: number; mayorHueco: number };
  fragmentacionExterna(): number;
}