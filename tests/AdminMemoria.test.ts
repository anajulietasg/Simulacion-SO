import { describe, expect, test } from "vitest";
import { AdminMemoria } from "../src/AdminMemoria";
import { Proceso } from "../src/Proceso"

describe("AdminMemoria", () => {
  test("empieza con un solo bloque de 1024 y está libre", () => {
    const mem = new AdminMemoria(1024);
    expect(mem.bloques.length).toBe(1);
    expect(mem.bloques[0].tamanio).toBe(1024);
    expect(mem.bloques[0].estaLibre()).toBe(true);
  });
    test("asignar un proceso en el primer hueco y partir", () => {
    const mem = new AdminMemoria(1024);
    const p1 = new Proceso("P1", 200, 5);
    const asignado = mem.asignarFirstFit(p1);
    expect(asignado).toBe(true);
    expect(mem.bloques.length).toBe(2);
    expect(mem.bloques[0].pid).toBe("P1");
    expect(mem.bloques[0].tamanio).toBe(200);
    expect(mem.bloques[1].estaLibre()).toBe(true);
    expect(mem.bloques[1].tamanio).toBe(824);
  });
});