import { Proceso } from "./Proceso";

export interface IPlanificador {           //lo que el simulador necesita del planificador de CPU
  readonly colaListos: readonly Proceso[];
  readonly enCpu: Proceso | null;
  readonly cambiosDeContexto: number;
  agregarAListos(proceso: Proceso): void;
  ponerAEjecutar(): void;
  ejecutarTick(): Proceso | null;
}