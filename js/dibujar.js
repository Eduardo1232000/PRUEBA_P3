

function armar_laberinto(scene, cantidad_x, cantidad_z, paredes) {
    console.log(cantidad_x, cantidad_z, paredes)
    const textura = new THREE.TextureLoader().load('./img/piedra.jpg'); //IMAGEN MATERIAL
    const material = new THREE.MeshBasicMaterial({ map: textura }); 

    const ancho = 1;        // DEL BLOQUE
    const alto = 1;         // DEL BLOQUE
    const Profundidad = 1;  // DEL BLOQUE
    const separacion = 0;   // DEL BLOQUE

    const centradox = (cantidad_x * (ancho + separacion)) / 2;     // DISTANCIA PARA QUE QUEDE TODO CENTRADO EN X
    const centradoz = (cantidad_z * (Profundidad + separacion)) / 2;      // DISTANCIA PARA QUE QUEDE TODO CENTRADO EN Z


    paredes.forEach(coordenada => {
        const geometry = new THREE.BoxGeometry(ancho, alto, Profundidad);       // GEOMETRIA CAJA
        const block = new THREE.Mesh(geometry, material);                       // TEXTURA
        block.position.set((coordenada[0]) * (ancho + separacion) - centradox, 0.5, (coordenada[1])*(alto + separacion)-centradoz);                // POSICION
        scene.add(block);                                                     // AGREGAR A ESCENA
    });

}
