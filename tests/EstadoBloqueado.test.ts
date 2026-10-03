import { describe, test, expect } from "vitest";
import { EstadoBloqueado } from "../src/EstadoBloqueado";

describe("EstadoBloqueado", () => {
    test("se llama bloqueado y vuelve a listo", () => {
        const estado = new EstadoBloqueado();
        expect(estado.nombre()).toBe("bloqueado");
        expect(estado.puedePasarA("listo")).toBe(true);
        expect(estado.puedePasarA("ejecutando")).toBe(false);
    });
});