import { describe, test, expect } from "vitest";
import { Planificador } from "../src/Planificador";
import { Proceso } from "../src/Proceso";

describe("planificador round robin", () => {
    test("agrega un proceso a la cola de listos y lo pone en ese estado", () => {
        const plan = new Planificador(2);
        const p1 = new Proceso("P1", 200, 3);

        plan.agregarAListos(p1);

        expect(plan.colaListos.length).toBe(1);        //entró a la fila
        expect(plan.colaListos[0].pid).toBe("P1");     
        expect(p1.estado).toBe("listo");              //quedó en estado listo
    });
});