import { describe, expect, test } from 'vitest';
import { Proceso } from '../src/Proceso';

function enCpu(p: Proceso): Proceso {      //lleva al proceso hasta ejecutando
    p.pasarA("listo");
    p.pasarA("ejecutando");
    return p;
}

describe("Proceso", () => {
    test("se puede crear un proceso con sus datos y arranca en estado nuevo", () => {
        const  p = new Proceso("P1", 200, 5)
        expect(p.pid).toBe("P1");
        expect(p.memoriaNecesaria).toBe(200);
        expect(p.estado).toBe("nuevo");
    });

    test("al ejecutar un tick baja el tiempo restante y sube el quantum", () => {
        const p = enCpu(new Proceso("P1", 200, 5));

        p.ejecutarUnTick();

        expect(p.tiempoRestante).toBe(4);      //tenia 5, uso uno
        expect(p.quantumConsumido).toBe(1);    //gasto un tick de su turno
    });

    test("terminado avisa cuando el proceso ya no tiene tiempo", () => {
        const p = enCpu(new Proceso("P1", 200, 1));   //le falta un solo tick
        expect(p.terminado()).toBe(false);   
        p.ejecutarUnTick();                     //usa su tick
        expect(p.terminado()).toBe(true);      //llega a cero
    });

    test("maneja su quantum, avisa cuando se agota y lo reinicia", () => {
        const p = enCpu(new Proceso("P1", 200, 5));
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

    test("rechaza datos invalidos al crear un proceso", () => {
        expect(() => new Proceso("P1", -100, 3)).toThrow();   
        expect(() => new Proceso("P1", 200, 0)).toThrow();    
        expect(() => new Proceso("", 200, 3)).toThrow();      
    });

    test("cada estado conoce sus propias transiciones validas", () => {
        const p = new Proceso("P1", 200, 5);
        expect(p.puedePasarA("esperando_memoria")).toBe(true);     
        expect(p.puedePasarA("listo")).toBe(true);
        p.pasarA("listo");
        p.pasarA("ejecutando");
        expect(p.puedePasarA("bloqueado")).toBe(true);
        expect(p.puedePasarA("nuevo")).toBe(false);
    });

    test("pasarA rechaza transiciones invalidas y no cambia el estado", () => {
        const p = new Proceso("P1", 200, 5);
        expect(() => p.pasarA("ejecutando")).toThrow();
        expect(p.estado).toBe("nuevo");
    });

    test("no puede ejecutar ni descontar bloqueo en un estado incorrecto", () => {
        const p = new Proceso("P1", 200, 5);
        expect(() => p.ejecutarUnTick()).toThrow();
        expect(() => p.descontarBloqueo()).toThrow();
        expect(p.tiempoRestante).toBe(5);
        expect(p.bloqueoRestante).toBe(0);
    });

    test("la E/S se dispara despues de los ticks indicados y bloquea", () => {
        const p = enCpu(new Proceso("P1", 200, 5));
        p.programarES(2, 3);
        p.ejecutarUnTick();
        expect(p.debeBloquearse()).toBe(false);
        p.ejecutarUnTick();
        expect(p.debeBloquearse()).toBe(true);
        p.bloquearPorES();
        expect(p.estado).toBe("bloqueado");
        expect(p.bloqueoRestante).toBe(3);
        expect(p.debeBloquearse()).toBe(false);   //la E/S ya se uso
    });

    test("rechaza eventos de E/S invalidos", () => {
        const p = new Proceso("P1", 200, 5);
        expect(() => p.programarES(0, 2)).toThrow();     //disparo no positivo
        expect(() => p.programarES(2, 0)).toThrow();     //duracion no positiva
        expect(() => p.programarES(5, 2)).toThrow();     //se dispararia cuando ya termino
        p.programarES(2, 2);
        expect(() => p.programarES(3, 2)).toThrow();     //ya tiene una programada
    });
});