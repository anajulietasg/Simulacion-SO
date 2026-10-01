import { describe, expect, test } from 'vitest';
import { Proceso } from '../src/Proceso';

describe("Proceso", () => {
    test("se puede crear un proceso con sus datos y arranca en estado nuevo", () => {
        const  p = new Proceso("P1", 200, 5)
        expect(p.pid).toBe("P1");
        expect(p.memoriaNecesaria).toBe(200);
        expect(p.estado).toBe("nuevo");
    });

    test("al ejecutar un tick baja el tiempo restante y sube el quantum", () => {
        const p = new Proceso("P1", 200, 5);

        p.ejecutarUnTick();

        expect(p.tiempoRestante).toBe(4);      //tenia 5, uso uno
        expect(p.quantumConsumido).toBe(1);    //gasto un tick de su turno
    });

});