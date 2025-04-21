// Clase Nodo para Dijkstra
class NodoDijkstra {
    constructor(vertice, pesoAcumulado, anterior) {
        this.siguiente = null;
        this.peso = pesoAcumulado;
        this.anterior = anterior;
        this.vertice = vertice;
    }
}

// Clase principal Dijkstra
class Dijkstra {
    constructor() {
        this.raiz = null;
        this.ultimo = null;
    }

    insertar(vertice, pesoAcumulado, anterior) {
        const nuevo = new NodoDijkstra(vertice, pesoAcumulado, anterior);
        if (this.ultimo === null) {
            this.raiz = nuevo;
            this.ultimo = nuevo;
        } else {
            this.ultimo.siguiente = nuevo;
            this.ultimo = nuevo;
        }
    }

    modificar(vertice, pesoAcumulado, anterior) {
        let actual = this.raiz;
        while (actual !== null) {
            if (actual.vertice === vertice) {
                actual.peso = pesoAcumulado;
                actual.anterior = anterior;
                return;
            }
            actual = actual.siguiente;
        }
        console.error("ERROR AL MODIFICAR. No existe el vértice:", vertice);
    }

    valorVertice(vertice) {
        let actual = this.raiz;
        while (actual !== null) {
            if (actual.vertice === vertice) {
                return actual.peso;
            }
            actual = actual.siguiente;
        }
        return "ERROR";
    }
    mostrar() {
        let actual = this.raiz;
        while (actual) {
            console.log(`${actual.vertice} , peso: ${actual.peso}, anterior: ${actual.anterior}`);
            actual = actual.siguiente;
        }
    }
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

    crear_lista_nodos_recorrer(vertice) {
        let camino = [];
        if (vertice !== "INICIO") {
            let actual = this.raiz;
            while (actual != null) {
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
        return camino
    }
}


function posToStr(pos) {
    return `${pos[0]},${pos[1]}`;
}

function esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function resolverCaminoDijkstra(inicio, fin) {
    const cola = [inicio];                      //COLA PARA RECORRER
    const distancias = {};
    const anteriores = {};

    let camino_temp=[]

    distancias[inicio] = 0;
    anteriores[inicio] = "INICIO";

    const visitados = new Set();
    const estructura = new Dijkstra();
    estructura.insertar(inicio, 0, "INICIO");


    while (cola.length > 0) {
        const actual = cola.shift();
        const claveActual = actual.toString();
        //console.log(actual.toString(), fin.toString())
        //CAMINAR A LA POSICION
        //await esperar(2000);
        //caminarHacia(actual[0], actual[1]);
        if (claveActual === fin.toString()) break;

        const sucesores = encontrar_sucesores(actual[0], actual[1]);

        for (let vecino of sucesores) {
            const claveVecino = vecino.toString();
            const nuevoPeso = distancias[claveActual] + 1;

            if (!(claveVecino in distancias) || nuevoPeso < distancias[claveVecino]) {
                distancias[claveVecino] = nuevoPeso;
                anteriores[claveVecino] = actual;

                if (!visitados.has(claveVecino)) {
                    cola.push(vecino);
                    visitados.add(claveVecino);
                }

                if (estructura.valorVertice(vecino) === "ERROR") {
                    estructura.insertar(vecino, nuevoPeso, actual);
                } else {
                    estructura.modificar(vecino, nuevoPeso, actual);
                }
            }
        }
        console.log("Ruta:", estructura.encontrarOrigen(actual));
        camino_temp = estructura.crear_lista_nodos_recorrer(actual);
        await mover_desde_inicio_hasta_nodo(camino_temp.reverse())
    }
    console.log("Ruta:", estructura.encontrarOrigen(fin));
    let camino = estructura.crear_lista_nodos_recorrer(fin);
    //console.log(camino)
    //console.log(camino.reverse())
    await mover_desde_inicio_hasta_nodo(camino.reverse())

    /*for (let i = camino.length - 1; i >= 0; i--) {
        console.log(camino[i]); 
    }*/

    //FINALIZACION DE ALGORITMO
    console.log("FINALICE")
    //MOSTRAR LA VENTANA EMERGENTE
    abrir_emergente()

    mover_personaje_inicio(personajeContenedor, info_laberinto.inicio[0], info_laberinto.inicio[1])
    eliminar_bloques_recorridos()
    document.getElementById("navbar_seleccion").style.display = "block";
    return camino.reverse()
}