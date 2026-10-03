import { describe, test, expect } from "vitest";
import { Simulador } from "../src/Simulador";
import { Proceso } from "../src/Proceso";

describe("Simulador", () => {
    test("empieza en tick 0 con memoria y planificador listos", () => {
        const sim = new Simulador(1024, 2);
        const e = sim.estadoActual();
        expect(e.tick).toBe(0);
        expect(e.mapaMemoria).toEqual([{ inicio: 0, tamanio: 1024, pid: null }]);   //un solo bloque libre
        expect(e.listos).toEqual([]);                  //todavia no hay nadie esperando
        expect(e.enCpu).toBe(null);
        expect(sim.metricas().usoCpu).toBe(0);         //en tick 0 es 0%
    });

    test("registra un proceso nuevo en la cola de nuevos", () => {
        const sim = new Simulador(1024, 2);
        sim.registrarProceso(new Proceso("P1", 200, 3));
        expect(sim.colaNuevos.length).toBe(1);
        expect(sim.colaNuevos[0].pid).toBe("P1");
        expect(sim.colaNuevos[0].estado).toBe("nuevo");
    });

    test("en un tick admite, ejecuta y al terminar libera la memoria", () => {
        const sim = new Simulador(1024, 2);
        sim.registrarProceso(new Proceso("P1", 200, 1));   

        sim.avanzarTick();

        expect(sim.tick).toBe(1);
        expect(sim.estadoActual().mapaMemoria).toEqual([{ inicio: 0, tamanio: 1024, pid: null }]);   //P1 terminó y liberó
    });

    test("informa el estado actual del sistema", () => {
        const sim = new Simulador(1024, 2);
        sim.registrarProceso(new Proceso("P1", 200, 3));
        sim.avanzarTick();

        const estado = sim.estadoActual();

        expect(estado.tick).toBe(1);
        expect(estado.enCpu).toBe("P1");   
    });

    test("cuenta los ticks en que la CPU estuvo ocupada", () => {
        const sim = new Simulador(1024, 2);
        sim.registrarProceso(new Proceso("P1", 200, 3));
        sim.avanzarTick();
        sim.avanzarTick();
        expect(sim.ticksCpuOcupada).toBe(2);  
    });

    test("reune las metricas del sistema", () => {
        const sim = new Simulador(1024, 2);
        sim.registrarProceso(new Proceso("P1", 200, 2));
        sim.avanzarTick();
        const m = sim.metricas();
        expect(m.usoCpu).toBe(100);              // trabajó el unico tick que pasó
        expect(m.ocupacionMemoria).toBeCloseTo(19.53);   //200 de 1024
        expect(m.cambiosDeContexto).toBe(0);
    });

    test("rechaza memoria o quantum invalidos", () => {
        expect(() => new Simulador(0, 2)).toThrow();    
        expect(() => new Simulador(1024, -1)).toThrow(); 
    });

    test("rechaza registrar dos procesos con el mismo pid", () => {
        const sim = new Simulador(1024, 2);
        sim.registrarProceso(new Proceso("P1", 200, 3));
        expect(() => sim.registrarProceso(new Proceso("P1", 100, 2))).toThrow();
    });

    test("rechaza procesos que piden más memoria que la disponible", () => {
        const sim = new Simulador(1024, 2);
        expect(() => sim.registrarProceso(new Proceso("P1", 2048, 3))).toThrow();
    });

    test("el estado muestra los terminados y el mapa de memoria", () => {
        const sim = new Simulador(1024, 2);
        sim.registrarProceso(new Proceso("P1", 200, 1));   
        sim.avanzarTick();
        const estado = sim.estadoActual();
        expect(estado.terminados).toEqual(["P1"]);          
        expect(estado.mapaMemoria.length).toBeGreaterThan(0);  //hay mapa
    });

    test("E/S, bloquea, conserva la memoria, no consume CPU y vuelve a listos al vencer", () => {
        const sim = new Simulador(1024, 2);
        const p1 = new Proceso("P1", 200, 4);
        p1.programarES(1, 2);                               //despues de 1 tick de CPU, dura 2
        sim.registrarProceso(p1);

        sim.avanzarTick();                                  //ejecuta y se bloquea
        let e = sim.estadoActual();
        expect(e.bloqueados).toEqual(["P1"]);
        expect(e.enCpu).toBe(null);
        expect(e.mapaMemoria[0].pid).toBe("P1");            //conserva la memoria
        expect(sim.metricas().cambiosDeContexto).toBe(1);   //el bloqueo cuenta

        sim.avanzarTick();                                  //le queda 1 de espera
        expect(sim.estadoActual().bloqueados).toEqual(["P1"]);
        expect(p1.tiempoRestante).toBe(3);                  //no consumio CPU bloqueado

        sim.avanzarTick();                                  //vence y se despacha en el mismo tick
        e = sim.estadoActual();
        expect(e.bloqueados).toEqual([]);
        expect(e.enCpu).toBe("P1");
        expect(p1.tiempoRestante).toBe(2);
    });
});

