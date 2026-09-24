import { describe, expect, test } from 'vitest';
import { Bloque } from '../src/Bloque';

describe("Bloque", () => {
    test("un bloque nuevo sin proceso está libre", () => {
        const b = new Bloque(0,1024);
        expect(b.inicio).toBe(0);
        expect(b.tamanio).toBe(1024);
        expect(b.estaLibre()).toBe(true);
    });

    test("un bloque con un proceso está ocupado", () => {
        const b = new Bloque(0, 200, "P1");
        expect(b.pid).toBe("P1");
        expect(b.estaLibre()).toBe(false);
    });


}
)