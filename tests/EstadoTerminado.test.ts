import { describe, test, expect } from "vitest";
import { EstadoTerminado } from "../src/EstadoTerminado";

describe("EstadoTerminado", () => {
    test("se llama terminado y no pasa a ningun lado", () => {
        const estado = new EstadoTerminado();
        expect(estado.nombre()).toBe("terminado");
        expect(estado.puedePasarA("listo")).toBe(false);
        expect(estado.puedePasarA("nuevo")).toBe(false);
    });
});