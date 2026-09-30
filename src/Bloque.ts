export class Bloque {
    private _inicio: number;
    private _tamanio: number;
    private _pid: string | null;  //nombre del proceso o nulo

    constructor(inicio: number, tamanio: number, pid: string | null = null){  //= null, si creás un bloque sin pasarle proceso, arranca libre
        this._inicio = inicio;
        this._tamanio = tamanio;
        this._pid = pid;
    }

    get inicio(): number { return this._inicio; }
    get tamanio(): number { return this._tamanio; }
    get pid(): string | null { return this._pid; }

  
    estaLibre(): boolean {        //devuelve verdadero cuando el pid es null
        return this.pid === null;
    }

    ocupar(pid: string): void { 
        this._pid = pid;
    }

    achicarA(nuevoTamanio: number): void {
        this._tamanio = nuevoTamanio; 
    }

    liberar(): void { 
        this._pid = null;   //el bloque queda libre
    }

    agrandarEn(cantidad: number): void { 
        this._tamanio += cantidad;       //crece al absorber un bloque de al lado
    }
}