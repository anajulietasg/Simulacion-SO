import { describe, test, expect } from "vitest";
import { EstadoEjecutando } from "../src/EstadoEjecutando";

describe("EstadoEjecutando", () => {
    test("puede pasar a listo, bloqueado o terminado", () => {
        const estado = new EstadoEjecutando();
        expect(estado.puedePasarA("listo")).toBe(true);
        expect(estado.puedePasarA("bloqueado")).toBe(true);
        expect(estado.puedePasarA("terminado")).toBe(true);
        expect(estado.puedePasarA("nuevo")).toBe(false);   
    });
});