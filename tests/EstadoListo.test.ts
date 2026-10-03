import { describe, test, expect } from "vitest";
import { EstadoListo } from "../src/EstadoListo";

describe("EstadoListo", () => {
    test("se llama listo y solo pasa a ejecutando", () => {
        const estado = new EstadoListo();
        expect(estado.nombre()).toBe("listo");
        expect(estado.puedePasarA("ejecutando")).toBe(true);
        expect(estado.puedePasarA("terminado")).toBe(false);
    });
});