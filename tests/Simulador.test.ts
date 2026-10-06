import { describe, test, expect } from "vitest";
import { Simulador } from "../src/Simulador";
import { Proceso } from "../src/Proceso";
import { BestFit } from "../src/BestFit";
import { WorstFit } from "../src/WorstFit";

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
        expect(sim.estadoActual().terminados).toEqual(["P1"]);
        expect(sim.estadoActual().mapaMemoria).toEqual([{ inicio: 0, tamanio: 1024, pid: null }]);   //P1 terminó y liberó
    });

    test("cuenta los ticks en que la CPU estuvo ocupada", () => {
        const sim = new Simulador(1024, 2);
        sim.registrarProceso(new Proceso("P1", 200, 1));
        sim.registrarProceso(new Proceso("P2", 200, 1));
        sim.avanzarTick();                    //P1 usa la CPU
        sim.avanzarTick();                    //P2 usa la CPU
        sim.avanzarTick();                    //ya no hay nadie, la CPU esta libre
        expect(sim.metricas().usoCpu).toBeCloseTo(66.67);   //2 de 3 ticks
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

    test("rechaza registrar dos procesos con el mismo pid", () => {
        const sim = new Simulador(1024, 2);
        sim.registrarProceso(new Proceso("P1", 200, 3));
        expect(() => sim.registrarProceso(new Proceso("P1", 100, 2))).toThrow();
    });

    test("rechaza procesos que piden más memoria que la disponible", () => {
        const sim = new Simulador(1024, 2);
        expect(() => sim.registrarProceso(new Proceso("P1", 2048, 3))).toThrow();
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

    test("rechaza registrar un proceso que no esta en estado nuevo", () => {
        const sim = new Simulador(1024, 2);
        const p = new Proceso("P1", 100, 2);
        p.pasarA("listo");
        expect(() => sim.registrarProceso(p)).toThrow();
    });

    test("si un proceso no entra, queda esperando y entra en el tick siguiente a una liberacion", () => {
        const sim = new Simulador(1000, 2);
        sim.registrarProceso(new Proceso("P1", 600, 1));
        sim.registrarProceso(new Proceso("P2", 600, 1));
        sim.avanzarTick();                                  //P1 entra y termina, P2 no entró
        expect(sim.estadoActual().esperandoMemoria).toEqual(["P2"]);
        expect(sim.colaNuevos[0].estado).toBe("esperando_memoria");
        sim.avanzarTick();                                  //la memoria liberada se usa en esta admision
        expect(sim.estadoActual().terminados).toEqual(["P1", "P2"]);
    });

    test("un proceso que no entra no frena a otro que si entra", () => {
        const sim = new Simulador(1000, 2);
        sim.registrarProceso(new Proceso("P1", 700, 3));
        sim.registrarProceso(new Proceso("P2", 500, 3));    //no entra
        sim.registrarProceso(new Proceso("P3", 200, 3));    //si entra
        sim.avanzarTick();
        expect(sim.estadoActual().esperandoMemoria).toEqual(["P2"]);
        expect(sim.estadoActual().listos).toEqual(["P3"]);
    });

    test("CASO: Q=2, P1 con CPU 3 y P2 con CPU 2 ejecuta P1 P1 P2 P2 P1 con un cambio de contexto", () => {
        const sim = new Simulador(1024, 2);
        sim.registrarProceso(new Proceso("P1", 200, 3));
        sim.registrarProceso(new Proceso("P2", 200, 2));
        const orden: string[] = [];     //quien usó la CPU en cada tick
        for (let i = 0; i < 5; i++) {
            const terminadosAntes = sim.estadoActual().terminados.length;
            sim.avanzarTick();
            const e = sim.estadoActual();
            orden.push(e.terminados.length > terminadosAntes ? e.terminados.at(-1)! : (e.enCpu ?? e.listos.at(-1)!));
        }
        expect(orden).toEqual(["P1", "P1", "P2", "P2", "P1"]);
        expect(sim.metricas().cambiosDeContexto).toBe(1);
    });

    test("nunca hay duplicados en las colas ni mas de un proceso en CPU", () => {
        const sim = new Simulador(1024, 2);
        ["P1", "P2", "P3"].forEach(pid => sim.registrarProceso(new Proceso(pid, 100, 3)));
        for (let i = 0; i < 6; i++) {
            sim.avanzarTick();
            const e = sim.estadoActual();
            const todos = [...e.listos, ...e.bloqueados, ...e.esperandoMemoria, ...(e.enCpu ? [e.enCpu] : [])];
            expect(new Set(todos).size).toBe(todos.length);
        }
    });

    test("permite elegir la politica al configurar", () => {
        const huecoDondeEntraE = (sim: Simulador) => {          //constante que guarda una función auxiliar
            sim.registrarProceso(new Proceso("P1", 300, 1));   //ocupa 0 a 300 y termina en el tick 1
            sim.registrarProceso(new Proceso("P2", 100, 9));   //ocupa 300 a 400
            sim.registrarProceso(new Proceso("P3", 100, 1));   //ocupa 400 a 500 y termina en el tick 4
            sim.registrarProceso(new Proceso("P4", 500, 9));   //ocupa 500 a 1000
            for (let i = 0; i < 4; i++) sim.avanzarTick();     //quedan huecos de 300 en 0 y de 100 en 400
            sim.registrarProceso(new Proceso("E", 50, 9));
            sim.avanzarTick();
            return sim.estadoActual().mapaMemoria.find(b => b.pid === "E")!.inicio;
        };
        expect(huecoDondeEntraE(new Simulador(1000, 2))).toBe(0);                   //First-Fit, el primero
        expect(huecoDondeEntraE(new Simulador(1000, 2, new BestFit()))).toBe(400);  //Best-Fit, el mas chico
        expect(huecoDondeEntraE(new Simulador(1000, 2, new WorstFit()))).toBe(0);   //Worst-Fit, el mas grande
    });

    test("el estado se entrega como copia y no cambia el sistema", () => {
        const sim = new Simulador(1024, 2);
        sim.registrarProceso(new Proceso("P1", 200, 3));
        sim.avanzarTick();       //p1 en la CPU, listos vacia
        const e = sim.estadoActual();
        e.listos.push("PX");
        e.mapaMemoria[0].pid = "PX";
        expect(sim.estadoActual().listos).toEqual([]);
        expect(sim.estadoActual().mapaMemoria[0].pid).toBe("P1");
    });
});

