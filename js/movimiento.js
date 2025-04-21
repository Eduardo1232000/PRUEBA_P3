function caminarHacia(xFinal, zFinal, velocidad = 2) {
    //console.log(xFinal, zFinal)
    const xmapa = xFinal
    const zmapa = zFinal
    xFinal = xFinal - valor_centradox
    zFinal = zFinal - valor_centradoz
    //console.log("FIN\n")
    const xInicio = personajeContenedor.position.x;
    const zInicio = personajeContenedor.position.z;
    //console.log("POS INICIAL: ", xInicio, "POS FINAL: ", zInicio)
    const distancia = Math.hypot(xFinal - xInicio, zFinal - zInicio);
    const tiempoTotal = distancia / velocidad;

    personajeContenedor.rotation.y = Math.atan2(xFinal - xInicio, zFinal - zInicio);      //NO FUNCIONA, TENGO QUE CORREGIR LA ROTACION
    moverse?.reset().play();

    moviendo = true;
    movimientoData = {
        tiempo: 0,
        tiempoTotal,
        xInicio,
        zInicio,
        xFinal,
        zFinal
    };


    // CAMBIAR TEXTURA DEL BLOQUE CAMINADO
    //console.log("ANTES", xFinal, zFinal)
    cambiar_marcado(xFinal, zFinal)
    return encontrar_sucesores(xmapa, zmapa)
}

function encontrar_sucesores(posx, posz) {
    //console.log("SUCESORES DE: ",posx, posz, "ALTO: ",info_laberinto.ancho, "ANCHO:", info_laberinto.alto)
    let sucesores = []
    if (celda_valida(posx - 1, posz)) {
        sucesores.push([posx - 1, posz])
    }
    if (celda_valida(posx + 1, posz)) {
        sucesores.push([posx + 1, posz])
    }
    if (celda_valida(posx, posz - 1)) {
        sucesores.push([posx, posz - 1])
    }
    if (celda_valida(posx, posz + 1)) {
        sucesores.push([posx, posz + 1])
    }
    //console.log(sucesores)
    return sucesores
}

function celda_valida(valx, valz) {
    const estaDentro = valx >= 0 && valx < info_laberinto.ancho && valz >= 0 && valz < info_laberinto.alto;
    const esPared = info_laberinto.paredes.some(p => p[0] === valx && p[1] === valz);
    return estaDentro && !esPared;
}

function mover_personaje_inicio(personaje, inicio, fin) {
    personaje.position.x = (inicio - valor_centradox)
    personaje.position.z = (fin - valor_centradoz)
}

function caminar() {
    moverse.play();
}

function detenerse() {
    moverse.stop();
}

async function mover_desde_inicio_hasta_nodo(camino){
    //MOVER AL PERSONAJE AL INICIO DEL LABERINTO
    mover_personaje_inicio(personajeContenedor, info_laberinto.inicio[0], info_laberinto.inicio[1])
    //RECORRER EL CAMINO POR ORDEN
    for (let i = 0; i < camino.length; i++) {
        let nodo = camino[i];                           //NODO QUE LE TOCA
        caminarHacia(nodo[0], nodo[1]);                 // CAMINA HACIA EL NODO QUE LE TOCA
        await new Promise(resolve => setTimeout(resolve, 500)); // ESPERAR 1 SEGUNDO
    }

}