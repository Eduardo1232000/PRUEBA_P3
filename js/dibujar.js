let bloques_laberinto = [];
let bloques_recorrido = [];
let valor_centradox = 0
let valor_centradoz = 0
let textura3 ;
let material3 ;
let geometry3 ;

function armar_laberinto(scene, cantidad_x, cantidad_z, paredes) {
    const textura = new THREE.TextureLoader().load('./img/cuarzo.png');         //IMAGEN MATERIAL
    const material = new THREE.MeshBasicMaterial({ map: textura });
    const textura2 = new THREE.TextureLoader().load('./img/ladrillonegro.jpg'); //IMAGEN MATERIAL 2
    const material2 = new THREE.MeshBasicMaterial({ map: textura2 });

    textura3 = new THREE.TextureLoader().load('./img/lana.png');
    material3 = new THREE.MeshBasicMaterial({ map: textura3 });
    geometry3 = new THREE.BoxGeometry(1, 0.1, 1);

    const ancho = 1;        // DEL BLOQUE
    const alto = 1;         // DEL BLOQUE
    const Profundidad = 1;  // DEL BLOQUE
    const separacion = 0;   // DEL BLOQUE

    valor_centradox = (cantidad_x * (ancho + separacion)) / 2;     // DISTANCIA PARA QUE QUEDE TODO CENTRADO EN X
    valor_centradoz = (cantidad_z * (Profundidad + separacion)) / 2;      // DISTANCIA PARA QUE QUEDE TODO CENTRADO EN Z

    paredes.forEach(coordenada => {
        const geometry = new THREE.BoxGeometry(ancho, alto, Profundidad);       // GEOMETRIA CAJA
        const block = new THREE.Mesh(geometry, material);                       // TEXTURA
        block.position.set((coordenada[0]) * (ancho + separacion) - valor_centradox, 0.5, (coordenada[1]) * (alto + separacion) - valor_centradoz);                // POSICION
        scene.add(block);                                                       // AGREGAR A ESCENA
        bloques_laberinto.push(block);                                          // GUARDAR LOS BLOQUES EN LA LISTA (PARA BORRARLOS DESPUES)
        mostrarEjes(scene, cantidad_x, cantidad_z, valor_centradox, valor_centradoz);
    });

    //ARMAR PARED EXTERIOR
    function crearBloque(x, z) {
        const geometry = new THREE.BoxGeometry(ancho, alto, Profundidad);
        const block = new THREE.Mesh(geometry, material2);
        block.position.set(
            x * (ancho + separacion) - valor_centradox,
            0.5,
            z * (alto + separacion) - valor_centradoz
        );
        scene.add(block);
        bloques_laberinto.push(block);
    }

    for (let x = -1; x <= cantidad_x; x++) {
        crearBloque(x, -1);               // Borde superior
        crearBloque(x, cantidad_z);       // Borde inferior
    }

    for (let z = 0; z < cantidad_z; z++) {
        crearBloque(-1, z);               // Borde izquierdo
        crearBloque(cantidad_x, z);       // Borde derecho
    }

    //DIBUJAR INICIO Y FIN
    const geometry1 = new THREE.BoxGeometry(ancho, 0.01, Profundidad);
    const block1 = new THREE.Mesh(geometry1, material2);
    block1.position.set(
        info_laberinto.inicio[0] - valor_centradox,
        0.01,
        info_laberinto.inicio[1] - valor_centradoz
    );
    scene.add(block1);
    bloques_laberinto.push(block1);

    const geometry2 = new THREE.BoxGeometry(ancho, 0.01, Profundidad);
    const block2 = new THREE.Mesh(geometry2, material2);
    block2.position.set(
        info_laberinto.fin[0] - valor_centradox,
        0.01,
        info_laberinto.fin[1] - valor_centradoz
    );
    scene.add(block2);
    bloques_laberinto.push(block2);


    //AGREGAR UN DIAMANTE PARA INDICAR EL FIN
    const texturaItem = new THREE.TextureLoader().load('./img/diamante.png');
    const materialItem = new THREE.MeshBasicMaterial({
        map: texturaItem,
        transparent: true,
        side: THREE.DoubleSide
    });
    const geometriaItem = new THREE.PlaneGeometry(0.5, 0.5);
    itemDiamante = new THREE.Mesh(geometriaItem, materialItem);

    itemDiamante.position.set(
        info_laberinto.fin[0] * (ancho + separacion) - valor_centradox,
        0.5,
        info_laberinto.fin[1] * (Profundidad + separacion) - valor_centradoz
    );
    itemDiamante.rotation.y = Math.PI / 3;
    scene.add(itemDiamante);
    bloques_laberinto.push(itemDiamante);
}

function crearTextoSprite(texto) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'white';
    ctx.font = '35px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(texto, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);

    sprite.scale.set(0.8, 0.4, 1);
    bloques_laberinto.push(sprite);
    return sprite;
}

function mostrarEjes(scene, cantidad_x, cantidad_z, centradox, centradoz) {
    for (let x = 0; x < cantidad_x; x++) {
        const textoX = crearTextoSprite(`${x}`);
        textoX.position.set(
            x - centradox,
            1.1,
            -centradoz - 1
        );
        scene.add(textoX);
    }

    for (let z = 0; z < cantidad_z; z++) {
        const textoZ = crearTextoSprite(`${z}`);
        textoZ.position.set(
            -centradox - 1,
            1.1,
            z - centradoz
        );
        scene.add(textoZ);
    }
}

function limpiar_laberinto(scene) {
    bloques_laberinto.forEach(bloque => {
        scene.remove(bloque);                   // QUITAR DE LA ESCENA
        bloque.geometry.dispose();              // QUITAR LA GEOMETRIA
        if (bloque.material.map) bloque.material.map.dispose();
        bloque.material.dispose();              // QUITAR MATERIAL
    });
    bloques_laberinto = [];
    itemDiamante = null
}

function cambiar_marcado(posx, posz) {
    let bloque = bloques_laberinto.find(bloque =>
        bloque.position.x === posx &&
        bloque.position.z === posz
    );

    const block3 = new THREE.Mesh(geometry3, material3);
    block3.position.set(
        posx,
        0.01,
        posz
    );
    scene.add(block3);
    bloques_recorrido.push(block3);

}

function eliminar_bloques_recorridos() {
    bloques_recorrido.forEach(bloque => {
        scene.remove(bloque);                   // QUITAR DE LA ESCENA
        bloque.geometry.dispose();              // QUITAR LA GEOMETRIA
        if (bloque.material.map) bloque.material.map.dispose();
        bloque.material.dispose();              // QUITAR MATERIAL
    });
    bloques_recorrido = [];
}