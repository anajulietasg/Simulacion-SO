import { describe, expect, test } from "vitest";
import { AdminMemoria } from "../src/AdminMemoria";

describe("AdminMemoria", () => {
  test("empieza con un solo bloque de 1024 y está libre", () => {
    const mem = new AdminMemoria(1024);
    expect(mem.bloques.length).toBe(1);
    expect(mem.bloques[0].tamanio).toBe(1024);
    expect(mem.bloques[0].estaLibre()).toBe(true);
  });
});