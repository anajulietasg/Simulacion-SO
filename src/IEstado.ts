export interface IEstado {
  nombre(): string;
  puedePasarA(destino: string): boolean;
}