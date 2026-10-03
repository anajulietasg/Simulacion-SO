import { describe, test, expect } from "vitest";
import { Simulador } from "../src/Simulador";
import { Proceso } from "../src/Proceso";

describe("Simulador", () => {
    test("empieza en tick 0 con memoria y planificador listos", () => {
        const sim = new Simulador(1024, 2);
        expect(sim.tick).toBe(0);
        expect(sim.memoria.bloques.length).toBe(1);           //un solo bloque libre
        expect(sim.planificador.colaListos.length).toBe(0);      // todavia no hay nadie esperando
    });

    test("registra un proceso nuevo en la cola de nuevos", () => {
        const sim = new Simulador(1024, 2);
        sim.registrarProceso(new Proceso("P1", 200, 3));
        expect(sim.colaNuevos.length).toBe(1);
        expect(sim.colaNuevos[0].pid).toBe("P1");
        expect(sim.colaNuevos[0].estado).toBe("nuevo");
    });

    test("baja el bloqueo y manda a listos al que ya espero", () => {
        const sim = new Simulador(1024, 2);
        const p = new Proceso("P1", 200, 3);
        p.pasarA("listo");
        p.pasarA("ejecutando");
        p.bloquearPor(1);                      //le falta 1 tick de espera
        (sim as any)._colaBloqueados.push(p);    //lo meto a bloqueados

        sim.actualizarBloqueados();        //le resta un tick de espera y lo manda a listos 

        expect(sim.colaBloqueados.length).toBe(0);            
        expect(sim.planificador.colaListos[0].pid).toBe("P1"); 
    });

    test("en un tick admite, ejecuta y al terminar libera la memoria", () => {
        const sim = new Simulador(1024, 2);
        sim.registrarProceso(new Proceso("P1", 200, 1));   

        sim.avanzarTick();

        expect(sim.tick).toBe(1);
        expect(sim.memoria.bloques.length).toBe(1);          //P1 terminó y liberó, la memoria vuelve a toda libre
        expect(sim.memoria.bloques[0].tamanio).toBe(1024);
    });

    test("bloquea al proceso que esta en la CPU y libera el procesador", () => {
        const sim = new Simulador(1024, 2);
        sim.registrarProceso(new Proceso("P1", 200, 5));
        sim.avanzarTick();   //P1 entra a la CPU

        sim.bloquearProcesoEnCpu(2);

        expect(sim.planificador.enCpu).toBe(null);           
        expect(sim.colaBloqueados.length).toBe(1);           
        expect(sim.colaBloqueados[0].estado).toBe("bloqueado");
    });

    test("informa el estado actual del sistema", () => {
        const sim = new Simulador(1024, 2);
        sim.registrarProceso(new Proceso("P1", 200, 3));
        sim.avanzarTick();

        const estado = sim.estadoActual();

        expect(estado.tick).toBe(1);
        expect(estado.enCpu).toBe("P1");   
    });

    test("cuenta los ticks en que la CPU estuvo ocupada", () => {
        const sim = new Simulador(1024, 2);
        sim.registrarProceso(new Proceso("P1", 200, 3));
        sim.avanzarTick();
        sim.avanzarTick();
        expect(sim.ticksCpuOcupada).toBe(2);  
    });

    test("reune las metricas del sistema", () => {
        const sim = new Simulador(1024, 2);
        sim.registrarProceso(new Proceso("P1", 200, 2));
        sim.avanzarTick();
        const m = sim.metricas();
        expect(m.usoCpu).toBe(100);              // trabajó el unico tick que pasó
        expect(m.ocupacionMemoria).toBeCloseTo(19.53);   //200 de 1024
        expect(m.cambiosDeContexto).toBe(0);
    });

    test("rechaza memoria o quantum invalidos", () => {
        expect(() => new Simulador(0, 2)).toThrow();    
        expect(() => new Simulador(1024, -1)).toThrow(); 
    });

    test("rechaza registrar dos procesos con el mismo pid", () => {
        const sim = new Simulador(1024, 2);
        sim.registrarProceso(new Proceso("P1", 200, 3));
        expect(() => sim.registrarProceso(new Proceso("P1", 100, 2))).toThrow();
    });

    test("rechaza procesos que piden más memoria que la disponible", () => {
        const sim = new Simulador(1024, 2);
        expect(() => sim.registrarProceso(new Proceso("P1", 2048, 3))).toThrow();
    });

    test("el estado muestra los terminados y el mapa de memoria", () => {
        const sim = new Simulador(1024, 2);
        sim.registrarProceso(new Proceso("P1", 200, 1));   
        sim.avanzarTick();
        const estado = sim.estadoActual();
        expect(estado.terminados).toEqual(["P1"]);          
        expect(estado.mapaMemoria.length).toBeGreaterThan(0);  //hay mapa
    });

    test("bloquear y despues desbloquear un proceso", () => {
        const sim = new Simulador(1024, 2);
        sim.registrarProceso(new Proceso("P1", 200, 5));
        sim.avanzarTick();            
        sim.bloquearProcesoEnCpu(1);  
        expect(sim.colaBloqueados.length).toBe(1);
        sim.avanzarTick();            //pasa el tick de bloqueo, vuelve a listos
        expect(sim.colaBloqueados.length).toBe(0);
  });
});

