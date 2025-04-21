// Clase Nodo para representar un vértice visitado con su anterior
class NodoBFS {
    constructor(vertice, anterior) {
        this.siguiente = null;
        this.anterior = anterior;
        this.vertice = vertice;
    }
}

// Clase principal BFS
class BFS {
    constructor() {
        this.raiz = null;
        this.ultimo = null;
    }

    insertar(vertice, anterior) {
        const nuevo = new NodoBFS(vertice, anterior);
        if (this.ultimo === null) {
            this.raiz = nuevo;
            this.ultimo = nuevo;
        } else {
            this.ultimo.siguiente = nuevo;
            this.ultimo = nuevo;
        }
    }

    // Retorna el camino en forma de texto
    encontrarOrigen(vertice) {
        if (vertice !== "INICIO") {
            let actual = this.raiz;
            while (actual !== null) {
                if (JSON.stringify(actual.vertice) === JSON.stringify(vertice)) {
                    return this.encontrarOrigen(actual.anterior) + " -> " + vertice;
                }
                actual = actual.siguiente;
            }
            return "ERROR";
        } else {
            return "";
        }
    }

    // Lista de nodos del camino final
    crear_lista_nodos_recorrer(vertice) {
        let camino = [];
        if (vertice !== "INICIO") {
            let actual = this.raiz;
            while (actual !== null) {
                if (JSON.stringify(actual.vertice) === JSON.stringify(vertice)) {
                    camino.push(actual.vertice);
                    if (actual.anterior) {
                        camino = camino.concat(this.crear_lista_nodos_recorrer(actual.anterior));
                    }
                    break;
                }
                actual = actual.siguiente;
            }
        }
        return camino;
    }
}

// Utilidad: convierte [x,y] a string "x,y"
function posToStr(pos) {
    return `${pos[0]},${pos[1]}`;
}

// BFS con debug
function resolverCaminoBFS(inicio, fin) {
    const cola = [inicio];
    const anteriores = {};
    const visitados = new Set();

    anteriores[inicio] = "INICIO";
    visitados.add(posToStr(inicio));

    const estructura = new BFS();
    estructura.insertar(inicio, "INICIO");

    console.log("===== INICIO DEL RECORRIDO BFS =====");

    while (cola.length > 0) {
        const actual = cola.shift();
        const claveActual = posToStr(actual);

        console.log(`Visitando nodo: ${claveActual}`);

        if (claveActual === posToStr(fin)) {
            console.log("FIN encontrado:", claveActual);
            break;
        }

        const sucesores = encontrar_sucesores(actual[0], actual[1]);

        console.log(`Sucesores de ${claveActual}:`, sucesores);

        for (let vecino of sucesores) {
            const claveVecino = posToStr(vecino);
            if (!visitados.has(claveVecino)) {
                anteriores[claveVecino] = actual;
                visitados.add(claveVecino);
                cola.push(vecino);
                estructura.insertar(vecino, actual);
            }
        }
    }

    console.log("===== FIN DEL RECORRIDO BFS =====");

    const rutaTexto = estructura.encontrarOrigen(fin);
    console.log("Ruta encontrada:", rutaTexto);

    let camino = estructura.crear_lista_nodos_recorrer(fin);
    camino = camino.reverse(); // Del inicio al fin
    console.log("Camino óptimo encontrado:", camino);

    // Mostrar nodos visitados que no están en el camino final
    const caminoStr = new Set(camino.map(posToStr));
    const nodosNoTomados = Array.from(visitados).filter(nodo => !caminoStr.has(nodo));
    console.log("Nodos visitados pero NO en el camino óptimo:", nodosNoTomados);

    return camino;
}
