import { describe, test, expect } from "vitest";
import { Simulador } from "../src/Simulador";

describe("Simulador", () => {
    test("empieza en tick 0 con memoria y planificador listos", () => {
        const sim = new Simulador(1024, 2);
        expect(sim.tick).toBe(0);
        expect(sim.memoria.bloques.length).toBe(1);           //un solo bloque libre
        expect(sim.planificador.colaListos.length).toBe(0);      // todavia no hay nadie esperando
    });
});