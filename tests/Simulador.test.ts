import { describe, test, expect } from "vitest";
import { Simulador } from "../src/Simulador";
import { Proceso } from "../src/Proceso";

describe("Simulador", () => {
    test("empieza en tick 0 con memoria y planificador listos", () => {
        const sim = new Simulador(1024, 2);
        expect(sim.tick).toBe(0);
        expect(sim.memoria.bloques.length).toBe(1);           //un solo bloque libre
        expect(sim.planificador.colaListos.length).toBe(0);      // todavia no hay nadie esperando
    });

    test("registra un proceso nuevo en la cola de nuevos", () => {
        const sim = new Simulador(1024, 2);
        sim.registrarProceso(new Proceso("P1", 200, 3));
        expect(sim.colaNuevos.length).toBe(1);
        expect(sim.colaNuevos[0].pid).toBe("P1");
        expect(sim.colaNuevos[0].estado).toBe("nuevo");
    });
});

