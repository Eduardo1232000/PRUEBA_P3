/**************  A*  (A‑Star)  **************/

/* ── Heurística Manhattan ────────────────── */
function heuristica([x1, y1], [x2, y2]) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2)
}

/* ── Nodo para A* ─────────────────────────── */
class NodoAStar {
    constructor(vertice, g, h, anterior = null) {
        this.vertice  = vertice          // [fila, col]
        this.g        = g                // coste real desde el inicio
        this.h        = h                // heurística al destino
        this.f        = g + h            // f = g + h
        this.anterior = anterior         // puntero al nodo anterior
    }
}

/* ── Cola de prioridad min‑heap por f(n) ──── */
class MinHeap {
    constructor() { this.data = [] }

    size() { return this.data.length }

    push(node) {
        this.data.push(node)
        this.#burbujaArriba(this.data.length - 1)
    }

    pop() {
        if (this.data.length === 0) return null
        const min = this.data[0]
        const fin = this.data.pop()
        if (this.data.length > 0) {
            this.data[0] = fin
            this.#burbujaAbajo(0)
        }
        return min
    }

    /* --- helpers privados --- */
    #burbujaArriba(i) {
        while (i > 0) {
            const p = Math.floor((i - 1) / 2)
            if (this.data[i].f >= this.data[p].f) break
            [this.data[i], this.data[p]] = [this.data[p], this.data[i]]
            i = p
        }
    }
    #burbujaAbajo(i) {
        const n = this.data.length
        while (true) {
            let izq = 2 * i + 1,
                der = 2 * i + 2,
                min = i

            if (izq < n && this.data[izq].f < this.data[min].f) min = izq
            if (der < n && this.data[der].f < this.data[min].f) min = der
            if (min === i) break
            [this.data[i], this.data[min]] = [this.data[min], this.data[i]]
            i = min
        }
    }
}

/* ── Funciones de ayuda genéricas ─────────── */
function posToStr([x, y]) { return `${x},${y}` }

async function animarVisita(nodo) {          
    await esperar(500)                      
    caminarHacia(nodo.vertice[0], nodo.vertice[1])
}

/* ── Reconstruir el camino terminado ─────── */
function reconstruirCamino(nodoFinal) {
    const camino = []
    let actual = nodoFinal
    while (actual) {
        camino.push(actual.vertice)
        actual = actual.anterior
    }
    return camino.reverse()
}

/* ── ALGORTIMO PRINCIPAL A* ───────────────── */
async function resolverCaminoAStar(inicio, fin) {
    console.log("INICIO A*")
    /* estructuras principales */
    const abierto = new MinHeap()                        // OPEN
    const cerrado = new Set()                            // CLOSED
    const nodos   = {}                                   // clave‑>NodoAStar

    const h0      = heuristica(inicio, fin)
    const nodoIni = new NodoAStar(inicio, 0, h0, null)
    abierto.push(nodoIni)
    nodos[posToStr(inicio)] = nodoIni

    while (abierto.size() > 0) {
        /* 1) obtener el nodo con f(n) mínimo */
        const actual = abierto.pop()
        const clave  = posToStr(actual.vertice)

        /* 2) si llegamos al final → reconstruir camino */
        if (clave === posToStr(fin)) {
            const ruta = reconstruirCamino(actual)
            console.log("Ruta:", ruta.join(" -> "))
            abrir_emergente()                            
            mover_personaje_inicio(
                personajeContenedor, info_laberinto.inicio[0], info_laberinto.inicio[1]
            )
            eliminar_bloques_recorridos()
            document.getElementById("navbar_seleccion").style.display = "block";
            return ruta
        }

        /* 3) marcar como visitado */
        cerrado.add(clave)
        await animarVisita(actual)                       

        /* 4) expandir sucesores */
        const sucesores = encontrar_sucesores(
            actual.vertice[0], actual.vertice[1]
        )

        for (const vecino of sucesores) {
            const claveVec = posToStr(vecino)
            if (cerrado.has(claveVec)) continue          // ya procesado

            const gTentativo = actual.g + 1              // coste uniforme = 1

            if (!(claveVec in nodos) || gTentativo < nodos[claveVec].g) {
                const h = heuristica(vecino, fin)
                const nuevoNodo = new NodoAStar(vecino, gTentativo, h, actual)
                nodos[claveVec] = nuevoNodo
                abierto.push(nuevoNodo)
            }
        }
    }

    /* Si sale del bucle, no hay camino */
    console.warn("No se encontró ruta.")
    return []
}
