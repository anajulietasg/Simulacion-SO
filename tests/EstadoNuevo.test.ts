import { describe, test, expect } from "vitest";
import { EstadoNuevo } from "../src/EstadoNuevo";

describe("EstadoNuevo", () => {
    test("se llama nuevo y solo pasa a esperando memoria", () => {
        const estado = new EstadoNuevo();
        expect(estado.nombre()).toBe("nuevo");
        expect(estado.puedePasarA("esperando_memoria")).toBe(true);
        expect(estado.puedePasarA("ejecutando")).toBe(false);  
    });
});