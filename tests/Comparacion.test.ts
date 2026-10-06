import { describe, test, expect } from "vitest";
import { Simulador } from "../src/Simulador";
import { Proceso } from "../src/Proceso";
import { IAsignador } from "../src/IAsignador";
import { FirstFit } from "../src/FirstFit";
import { BestFit } from "../src/BestFit";
import { WorstFit } from "../src/WorstFit";

type Llegada = [string, number, number, number];     //pid, memoria, tiempo de CPU, tick en que llega

function correr(memoria: number, politica: IAsignador, lote: Llegada[]) {     //funcion ayudante, corre el lote hasta que terminen todos y anota la fragmentacion de cada tick
    const sim = new Simulador(memoria, 2, politica);
    const frag: number[] = [];
    let ticksEsperando = 0;
    while (sim.estadoActual().terminados.length < lote.length) {
        lote.filter(p => p[3] === sim.tick).forEach(([pid, mem, cpu]) => sim.registrarProceso(new Proceso(pid, mem, cpu)));
        sim.avanzarTick();
        frag.push(sim.metricas().fragmentacion);
        ticksEsperando += sim.estadoActual().esperandoMemoria.length;
    }
    return { sim, frag, ticksEsperando };
}

const loteConsigna: Llegada[] = [["P1", 200, 4, 0], ["P2", 350, 3, 0], ["P3", 150, 2, 0], ["P4", 400, 3, 0]];
const loteConLlegadas: Llegada[] = [["P1", 300, 1, 0], ["P2", 100, 8, 0], ["P3", 100, 1, 0], ["P4", 500, 8, 0],
    ["P5", 50, 3, 4], ["P6", 280, 3, 4], ["P7", 120, 2, 4], ["P8", 250, 2, 8]];

describe("Comparacion de politicas con el mismo lote", () => {
    test("lote de la consigna, las tres politicas dan lo mismo", () => {
        for (const politica of [new FirstFit(), new BestFit(), new WorstFit()]) {
            const { sim, frag } = correr(1024, politica, loteConsigna);
            expect(sim.tick).toBe(12);                       //terminó en el tick 12
            expect(frag[7]).toBeCloseTo(27.01, 2);          //tick 8
            expect(frag[8]).toBeCloseTo(11.86, 2);          //tick 9
            expect(sim.metricas().cambiosDeContexto).toBe(2);
            expect(sim.metricas().usoCpu).toBe(100);
        }
    });

    test("lote con llegadas, Best-Fit deja mas fragmentacion y mas espera que First-Fit y Worst-Fit", () => {
        const ff = correr(1000, new FirstFit(), loteConLlegadas);
        const bf = correr(1000, new BestFit(), loteConLlegadas);
        const wf = correr(1000, new WorstFit(), loteConLlegadas);
        const promedio = (f: number[]) => f.reduce((a, b) => a + b, 0) / f.length;     //promedio de la fragmentación de todos los ticks

        expect(promedio(ff.frag)).toBeCloseTo(17.84, 1);
        expect(promedio(bf.frag)).toBeCloseTo(23.02, 1);
        expect(promedio(wf.frag)).toBeCloseTo(17.84, 1);
        expect(Math.max(...ff.frag)).toBeCloseTo(43.48, 1);
        expect(Math.max(...bf.frag)).toBeCloseTo(48, 1);
        expect(Math.max(...wf.frag)).toBeCloseTo(43.48, 1);
        expect(ff.sim.tick).toBe(28);
        expect(bf.sim.tick).toBe(28);
        expect(wf.sim.tick).toBe(28);
        expect(ff.ticksEsperando).toBe(19);
        expect(bf.ticksEsperando).toBe(28);
        expect(wf.ticksEsperando).toBe(19);
    });
});
