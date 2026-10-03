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

    test("cuando el proceso termina, lo devuelve y deja la CPU libre", () => {
        const plan = new Planificador(2);
        plan.agregarAListos(new Proceso("P1", 200, 1));    //necesita un solo tick
        plan.ponerAEjecutar();

        const terminado = plan.ejecutarTick();

        expect(terminado?.pid).toBe("P1");            //devolvio a P1
        expect(terminado?.estado).toBe("terminado");
        expect(plan.enCpu).toBe(null);                //la CPU quedó libre
        expect(plan.cambiosDeContexto).toBe(0);        //no hubo cambios de contexto
    });

    test("si se agota el quantum y hay otros, rota y cuenta un cambio de contexto", () => {
        const plan = new Planificador(2);
        plan.agregarAListos(new Proceso("P1", 200, 5));
        plan.agregarAListos(new Proceso("P2", 100, 5));

        plan.ponerAEjecutar();
        plan.ejecutarTick();     
        plan.ejecutarTick();    //P1 usa 2 de 2, se le vence

        expect(plan.enCpu).toBe(null);
        expect(plan.colaListos[0].pid).toBe("P2");   //P2 pasa a ser el primero
        expect(plan.colaListos[1].pid).toBe("P1");   //P1 volvió al final
        expect(plan.cambiosDeContexto).toBe(1);
    });

    test("si se agota el quantum pero esta solo, renueva y sigue", () => {
        const plan = new Planificador(2);
        plan.agregarAListos(new Proceso("P1", 200, 5));

        plan.ponerAEjecutar();
        plan.ejecutarTick();
        plan.ejecutarTick();   //2 de 2, pero no hay otro proceso esperando

        expect(plan.enCpu?.pid).toBe("P1");             //sigue en la CPU
        expect(plan.enCpu?.quantumConsumido).toBe(0);   //renovó el quantum
        expect(plan.cambiosDeContexto).toBe(0);
    });

    test("rechaza un quantum invalido", () => {
        expect(() => new Planificador(0)).toThrow();
        expect(() => new Planificador(1.5)).toThrow();
    });

    test("el bloqueo por E/S libera la CPU, cuenta cambio de contexto y gana sobre el quantum", () => {
        const plan = new Planificador(2);
        const p1 = new Proceso("P1", 200, 5);
        p1.programarES(2, 1);                     //se bloquea justo cuando se le agota el quantum
        plan.agregarAListos(p1);
        plan.agregarAListos(new Proceso("P2", 100, 5));
        plan.ponerAEjecutar();
        plan.ejecutarTick();
        const salio = plan.ejecutarTick();

        expect(salio?.estado).toBe("bloqueado");
        expect(plan.enCpu).toBe(null);
        expect(plan.colaListos.map(p => p.pid)).toEqual(["P2"]);   //no se reencolo por quantum
        expect(plan.cambiosDeContexto).toBe(1);
    });

    test("terminar justo en el limite del quantum no lo reencola", () => {
        const plan = new Planificador(2);
        plan.agregarAListos(new Proceso("P1", 200, 2));
        plan.agregarAListos(new Proceso("P2", 100, 5));
        plan.ponerAEjecutar();
        plan.ejecutarTick();
        const salio = plan.ejecutarTick();       //P1 termina en el tick 2 de 2

        expect(salio?.estado).toBe("terminado");
        expect(plan.colaListos.map(p => p.pid)).toEqual(["P2"]);   //P1 no volvio a la fila
        expect(plan.cambiosDeContexto).toBe(0);
    });

    test("no acepta el mismo proceso dos veces en la cola", () => {
        const plan = new Planificador(2);
        const p = new Proceso("P1", 200, 3);
        plan.agregarAListos(p);
        expect(() => plan.agregarAListos(p)).toThrow();
        expect(plan.colaListos.length).toBe(1);
    });

    test("sin procesos en CPU, ejecutarTick no hace nada", () => {
        const plan = new Planificador(2);
        expect(plan.ejecutarTick()).toBe(null);
    });
});