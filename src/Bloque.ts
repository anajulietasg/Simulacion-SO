export class Bloque {
    inicio: number;
    tamanio: number;
    pid: string | null;  //nombre del proceso o nulo

    constructor(inicio: number, tamanio: number, pid: string | null = null){  //= null, si creás un bloque sin pasarle proceso, arranca libre
        this.inicio = inicio;
        this.tamanio = tamanio;
        this.pid = pid;
    }

    estaLibre(): boolean {        //devuelve verdadero cuando el pid es null
        return this.pid === null;
    }

}