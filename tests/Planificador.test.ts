import { describe, test, expect } from "vitest";
import { Planificador } from "../src/Planificador";
import { Proceso } from "../src/Proceso";

describe("planificador round robin", () => {
    test("agrega un proceso a la cola de listos y lo pone en ese estado", () => {
        const plan = new Planificador(2);
        const p1 = new Proceso("P1", 200, 3);

        plan.agregarAListos(p1);

        expect(plan.colaListos.length).toBe(1);        //entró a la fila
        expect(plan.colaListos[0].pid).toBe("P1");     
        expect(p1.estado).toBe("listo");              //quedó en estado listo
    });

    test("pone a ejecutar el primero de la fila en la CPU", () => {
        const plan = new Planificador(2);
        plan.agregarAListos(new Proceso("P1", 200, 3));
        plan.agregarAListos(new Proceso("P2", 100, 2));

        plan.ponerAEjecutar();

        expect(plan.enCpu?.pid).toBe("P1");          //P1 tomó la CPU
        expect(plan.enCpu?.estado).toBe("ejecutando");
        expect(plan.colaListos.length).toBe(1);         //P2 sigue esperando
    });

    test("ejecuta un tick del proceso que está en la CPU", () => {
        const plan = new Planificador(2);
        plan.agregarAListos(new Proceso("P1", 200, 3));      //necesita 3 ticks
        plan.ponerAEjecutar();

        plan.ejecutarTick();

        expect(plan.enCpu?.tiempoRestante).toBe(2);            //usó uno
        expect(plan.enCpu?.quantumConsumido).toBe(1);         //gastó un tick de su turno
    });
});