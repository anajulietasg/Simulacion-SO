import { describe, test, expect } from "vitest";
import { crearEstado } from "../src/FabricaEstados";

describe("crearEstado", () => {
    test("crea cada estado por su nombre", () => {
        expect(crearEstado("bloqueado").nombre()).toBe("bloqueado");
        expect(crearEstado("terminado").nombre()).toBe("terminado");
    });

    test("tira error si el nombre no existe", () => {
        expect(() => crearEstado("inventado")).toThrow();
    });
});