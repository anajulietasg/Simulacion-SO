# Simulacion-SO
Biblioteca en TypeScript que simula cómo un sistema operativo reparte la memoria y la CPU entre varios procesos.El tiempo avanza por ticks, y en cada tick los procesos piden memoria, esperan su turno en la CPU con Round-Robin, pueden bloquearse por entrada y salida y liberan su memoria al terminar.

La memoria se asigna con First-Fit, Best-Fit o Worst-Fit, y al liberar un proceso se juntan los huecos libres vecinos (coalescencia).

## Requisitos
- Node.js 18 o superior
- npm (viene con Node.js)
- Git

## Instalación
git clone https://github.com/anajulietasg/Simulacion-SO.git \
cd Simulacion-SO\
npm install

## Correr los tests
comando: npm test\
Tienen que pasar los 69 tests.

## Cobertura
comando: npx vitest run --coverage\
Mide todos los archivos de src. 

## Integración continua
Cada vez que subo un cambio, GitHub Actions corre todos los tests automáticamente. La configuración está en .github/workflows/ci.yml.

## Organización
src: El código del simulador\
tests: Los tests, un archivo por clase, más Comparacion.test.ts con la comparación de las tres políticas\
docs/diagramas: El diagrama de clases y los tres diagramas de secuencia 

## Diagramas
En docs/diagramas están el diagrama de clases y los tres diagramas de secuencia (admisión y asignación de memoria, un tick de Round-Robin, y bloqueo por entrada y salida).
Los .jpg son la versión para ver y los .drawio son los editables, que se abren con draw.io(https://app.diagrams.net).

## Cómo se usa
Se crea un simulador con el tamaño de la memoria, el quantum y la política, se registran procesos y se avanza de a un tick.
```typescript
const sim = new Simulador(1024, 2, new BestFit());
sim.registrarProceso(new Proceso("P1", 200, 3));
sim.avanzarTick();
sim.estadoActual();   //tick, proceso en CPU, colas y mapa de memoria
sim.metricas();       //uso de CPU, ocupación, cambios de contexto y fragmentación
```
## Versiones
La versión estable es la del tag v1.0-entrega.