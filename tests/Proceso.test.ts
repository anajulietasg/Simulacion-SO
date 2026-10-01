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

    test("terminado avisa cuando el proceso ya no tiene tiempo", () => {
        const p = new Proceso("P1", 200, 1);   //le falta un solo tick
        expect(p.terminado()).toBe(false);   
        p.ejecutarUnTick();                     //usa su tick
        expect(p.terminado()).toBe(true);      //llega a cero
    });

    test("maneja su quantum, avisa cuando se agota y lo reinicia", () => {
        const p = new Proceso("P1", 200, 5);
        p.ejecutarUnTick();
        expect(p.agotoQuantum(2)).toBe(false);    //lleva 1 de 2
        p.ejecutarUnTick();
        expect(p.agotoQuantum(2)).toBe(true);     //lleva 2 de 2, se agotó
        p.reiniciarQuantum();
        expect(p.quantumConsumido).toBe(0);       //arranca un turno nuevo
    });

    test("pasarA cambia el estado del proceso", () => {
        const p = new Proceso("P1", 200, 5);
        expect(p.estado).toBe("nuevo");   //arranca en nuevo
        p.pasarA("listo");
        expect(p.estado).toBe("listo");   //quedo en el estado nuevo
    });
});