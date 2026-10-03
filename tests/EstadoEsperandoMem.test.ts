import { describe, test, expect } from "vitest";
import { EstadoEsperandoMem } from "../src/EstadoEsperandoMem";

describe("EstadoEsperandoMem", () => {
  test("se llama esperando_memoria y solo pasa a listo", () => {
    const estado = new EstadoEsperandoMem();
    expect(estado.nombre()).toBe("esperando_memoria");
    expect(estado.puedePasarA("listo")).toBe(true);
    expect(estado.puedePasarA("ejecutando")).toBe(false);
  });
});