import { describe, expect, test } from 'vitest';
import { Proceso } from '../src/Proceso';

describe("Proceso", () => {
    test("se puede crear un proceso con sus datos y arranca en estado nuevo", () => {
        const  p = new Proceso("P1", 200, 5)
        expect(p.pid).toBe("P1");
        expect(p.memoriaNecesaria).toBe(200);
        expect(p.estado).toBe("nuevo");
    });
});