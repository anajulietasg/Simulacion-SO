import { describe, test, expect } from 'vitest';
import { Bloque } from '../src/Bloque';
import { FirstFit } from '../src/FirstFit';
import { BestFit } from '../src/BestFit';
import { WorstFit } from '../src/WorstFit';

describe("Politicas de asignacion", () => {
  const escenario = () => [        //huecos libres de 200, 100 y 400, con ocupados en el medio
    new Bloque(0, 200),
    new Bloque(200, 100, "PX"),
    new Bloque(300, 100),
    new Bloque(400, 200, "PY"),
    new Bloque(600, 400),
  ];

  test("FirstFit elige el primer hueco que sirve", () => {
    expect(new FirstFit().elegirIndice(escenario(), 90)).toBe(0);
  });

  test("BestFit elige el hueco mas chico que sirve", () => {
    expect(new BestFit().elegirIndice(escenario(), 90)).toBe(2);
  });

  test("WorstFit elige el hueco mas grande", () => {
    expect(new WorstFit().elegirIndice(escenario(), 90)).toBe(4);
  });

  test("devuelve -1 si no hay lugar", () => {
    expect(new FirstFit().elegirIndice(escenario(), 500)).toBe(-1);
  });

  test("ante empate eligen la menor direccion", () => {
    const empate = [new Bloque(0, 100), new Bloque(100, 50, "PX"), new Bloque(150, 100)];
    expect(new BestFit().elegirIndice(empate, 80)).toBe(0);
    expect(new WorstFit().elegirIndice(empate, 80)).toBe(0);
  });
});