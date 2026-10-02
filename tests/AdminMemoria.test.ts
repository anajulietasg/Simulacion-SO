import { describe, expect, test } from "vitest";
import { AdminMemoria } from "../src/AdminMemoria";
import { Proceso } from "../src/Proceso"

describe("AdminMemoria", () => {
  test("uarranca con un solo bloque libre de 1024", () => {
    const mem = new AdminMemoria(1024);
    expect(mem.bloques.length).toBe(1);
    expect(mem.bloques[0].tamanio).toBe(1024);
    expect(mem.bloques[0].estaLibre()).toBe(true);
  });

  test("asigna un proceso en el primer hueco y parte el bloque", () => {
    const mem = new AdminMemoria(1024);
    const p1 = new Proceso("P1", 200, 5);

    const asignado = mem.asignar(p1);

    expect(asignado).toBe(true);
    expect(mem.bloques.length).toBe(2);
    expect(mem.bloques[0].pid).toBe("P1");
    expect(mem.bloques[0].tamanio).toBe(200);
    expect(mem.bloques[1].estaLibre()).toBe(true);
    expect(mem.bloques[1].tamanio).toBe(824);
  });

  test("una asignacion exacta no deja bloque sobrante", () => {
    const mem = new AdminMemoria(200);
    const p = new Proceso("P1", 200, 5);

    const ok = mem.asignar(p);

    expect(ok).toBe(true);
    expect(mem.bloques.length).toBe(1);
    expect(mem.bloques[0].pid).toBe("P1");
  });

  test("falla si no hay un hueco lo bastante grande", () => {
    const mem = new AdminMemoria(100);
    const p = new Proceso("P1", 200, 5);

    const ok = mem.asignar(p);

    expect(ok).toBe(false);
    expect(mem.bloques.length).toBe(1);
    expect(mem.bloques[0].estaLibre()).toBe(true);
  });

  test("al liberar un proceso, su hueco se junta con el libre de al lado", () => {
    const mem = new AdminMemoria(1024);
    mem.asignar(new Proceso("P1", 200, 5));
    mem.asignar(new Proceso("P2", 300, 5));

    const ok = mem.liberar("P2");

    expect(ok).toBe(true);              //confirma que P2 existia y se liberó
    expect(mem.bloques.length).toBe(2);        //queda P1 y un solo libre
    expect(mem.bloques[1].estaLibre()).toBe(true);
    expect(mem.bloques[1].tamanio).toBe(824);  
  });

  test("al liberar todos los procesos queda un unico bloque libre de 1024", () => {
    const mem = new AdminMemoria(1024);
    mem.asignar(new Proceso("P1", 200, 5));
    mem.asignar(new Proceso("P2", 300, 5));
    mem.asignar(new Proceso("P3", 100, 5));

    mem.liberar("P1");
    mem.liberar("P3");
    mem.liberar("P2");   

    expect(mem.bloques.length).toBe(1);
    expect(mem.bloques[0].estaLibre()).toBe(true);
    expect(mem.bloques[0].tamanio).toBe(1024);
  });

  test("liberar devuelve false si no existe ese proceso", () => {
    const mem = new AdminMemoria(1024);
    expect(mem.liberar("PX")).toBe(false);
  });

  test("calcula memoria ocupada, libre y el mayor hueco", () => {
    const mem = new AdminMemoria(1024);
    mem.asignar(new Proceso("P1", 200, 3));
    const m = mem.metricas();
    expect(m.ocupada).toBe(200);
    expect(m.libreTotal).toBe(824);
    expect(m.mayorHueco).toBe(824);
  });

});