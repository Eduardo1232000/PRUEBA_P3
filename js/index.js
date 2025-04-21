// ESCENA
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);       // TODO CELESTE, PARA SIMULAR UN CIELO

// CAMARA       PERSPESCTIVA DE LA CAMARA
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10, 0);

// RENDER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;                              // SOMBRAS
document.body.appendChild(renderer.domElement);

// CONTROLES
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2.1;

// CÉSPED
const grassTexture = new THREE.TextureLoader().load('./img/t_cesped2.png');
grassTexture.wrapS = THREE.RepeatWrapping;
grassTexture.wrapT = THREE.RepeatWrapping;
grassTexture.repeat.set(50, 50);

const grassMaterial = new THREE.MeshStandardMaterial({
    map: grassTexture,
    roughness: 0.9,
    metalness: 0.5
});

const grassGeometry = new THREE.PlaneGeometry(50, 50);
const grass = new THREE.Mesh(grassGeometry, grassMaterial);
grass.rotation.x = -Math.PI / 2;
grass.receiveShadow = true;                 // MUESTRA LAS SOMBRAS
scene.add(grass);

// ILUMINACIÓN 
scene.add(new THREE.AmbientLight(0xffffff, 0.5));

const sunLight = new THREE.DirectionalLight(0xffffff, 1);
sunLight.position.set(10, 20, 10);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
scene.add(sunLight);

// Luz de relleno
const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
fillLight.position.set(-10, 10, -10);
scene.add(fillLight);


//VARIABLES
const fileInput = document.getElementById('fileInput');
const boton_cargarlaberinto = document.getElementById('boton_cargarlaberinto');
const fileName = document.getElementById('fileName');

let seleccion_algoritmo = 1
let info_laberinto

// Variables globales
let model, mixer, AnimacionCaminar;
const clock = new THREE.Clock();
let moverse;
let moviendo = false;
let movimientoData = null;
let itemDiamante = null
const personajeContenedor = new THREE.Group();      //CREAMOS UN CONTENEDOR PARA EL PERSONAJE
scene.add(personajeContenedor);

// MODELO 3D 
const loader = new THREE.GLTFLoader();

boton_cargarlaberinto.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', () => {        //ACCION CUANDO LEE EL ARCHIVO
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            let jsonData = e.target.result;
            info_laberinto = JSON.parse(jsonData);
            console.log("EXITO AL CARGAR JSON");
            armar_laberinto(scene, info_laberinto.ancho, info_laberinto.alto, info_laberinto.paredes)
            mover_personaje_inicio(personajeContenedor, info_laberinto.inicio[0], info_laberinto.inicio[1])
            camera.position.set(0, info_laberinto.alto + 2, 0);
        } catch (error) {
            console.log("Error al cargar el JSON: " + error);
        }
    };
    reader.readAsText(file);

    const pantalla_menu = document.getElementById('menu_inicio');       //EFECTO DESLIZAMIENTO HACIA ARRIBA
    pantalla_menu.classList.add('slide-up');
    setTimeout(() => {
        pantalla_carga.style.display = 'none'
    }, 4000);
});

// Cargar el modelo personaje
loader.load('./modelos/steve3d.glb', (gltf) => {                  // CARGAMOS MODELO
    //CONFIGURACION PRINCIPAL
    model = gltf.scene;
    model.scale.set(0.5, 0.5, 0.5);                             // TAMAÑO MODELO
    model.position.set(0, 0, 0);                                // POSICION MODELO

    personajeContenedor.add(model);                             //AGREGAMOS EL MODELO AL CONTENEDOR
    personajeContenedor.position.set(0, 0, 0);

    // PARA GUARDAR ANIMACIONES DE MODELO
    mixer = new THREE.AnimationMixer(model);

    //CONFIGURACION DE SOMBRAS
    model.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;                            // EMITE SOMBRA
            //child.receiveShadow = true;                       // RECIBE SOMBRA
        }
    });

    // CARGAR ANIMACION DE CAMINAR (SE CARGA LUEGO DE QUE CARGA EL MODELO)
    loader.load('./animacion/walking.glb', (gltf) => {
        if (gltf.animations && gltf.animations.length > 0) {        //SI CONTIENE ANIMACION
            AnimacionCaminar = gltf.animations[0];
            AnimacionCaminar.tracks = AnimacionCaminar.tracks.filter(   //QUITAR EL EFECTO DE MOVIMIENTO
                track => !track.name.includes('position')
            );
            if (mixer) {
                mixer.timeScale = 0.05
                moverse = mixer.clipAction(AnimacionCaminar);
                //moverse.play();               //PARA INICIAR ANIMACION DE MOVIMIENTO
            }
            const pantalla_carga = document.getElementById('pantalla_carga');
            pantalla_carga.classList.add('slide-up');
            setTimeout(() => {
                pantalla_carga.style.display = 'none';
            }, 4000);
        }
    },
        (xhr) => {                                                      //MIENTRAS CARGA LA ANIMACION
            console.log(`Cargando animación Caminar: ${(xhr.loaded / xhr.total * 100).toFixed(2)}%`);
        },
        (error) => console.error('Error al cargar walking.glb:', error)
    );

},
    (xhr) => {                                                  // MIENTRAS CARGA EL MODELO
        console.log(`Cargando modelo: ${(xhr.loaded / xhr.total * 100).toFixed(2)}%`);
    },
    (error) => console.error('Error al cargar child.glb:', error) //EN CASO DE ERROR
);

function cambiar_color(num) {
    document.getElementById("boton_algoritmo1").style.backgroundImage = "url('../img/botonvacio.png')";
    document.getElementById("boton_algoritmo1").style.color = "white";

    document.getElementById("boton_algoritmo2").style.backgroundImage = "url('../img/botonvacio.png')";
    document.getElementById("boton_algoritmo2").style.color = "white";

    document.getElementById("boton_algoritmo3").style.backgroundImage = "url('../img/botonvacio.png')";
    document.getElementById("boton_algoritmo3").style.color = "white";

    if (num == 1) {
        document.getElementById("boton_algoritmo1").style.backgroundImage = "url('../img/botonmarcado.png')";
    } else if (num == 2) {
        document.getElementById("boton_algoritmo2").style.backgroundImage = "url('../img/botonmarcado.png')";
    } else {
        document.getElementById("boton_algoritmo3").style.backgroundImage = "url('../img/botonmarcado.png')";
    }
}

function algoritmo1() {
    seleccion_algoritmo = 1
    cambiar_color(1)

}

function algoritmo2() {
    seleccion_algoritmo = 2
    cambiar_color(2)
}

function algoritmo3() {
    seleccion_algoritmo = 3
    cambiar_color(3)
}

function iniciar_laberinto() {
    document.getElementById("navbar_seleccion").style.display = "none";
    let camino = [info_laberinto.inicio[0], info_laberinto.inicio[1]]
    if (seleccion_algoritmo === 1) {
        camino = resolverCaminoDijkstra(info_laberinto.inicio, info_laberinto.fin);
    } else if (seleccion_algoritmo === 2) {
        camino = resolverCaminoBFS(info_laberinto.inicio, info_laberinto.fin);
    } else {
        camino = resolverCaminoAStar(info_laberinto.inicio, info_laberinto.fin)
        
    }

    //console.log("Camino encontrado:", camino);

    //QUE EL PERSONAJE RECORRA EL CAMINO
    //recorrer_laberinto(camino)
    


}

async function recorrer_laberinto(camino) {
    for (let i = 0; i < camino.length; i++) {
        let nodo = camino[i];
        caminarHacia(nodo[0], nodo[1]);
        console.log(nodo[0], nodo[1])
        await new Promise(resolve => setTimeout(resolve, 1000)); // espera 1 segundo 
    }
    console.log("FINALICE")
    //MOSTRAR LA VENTANA EMERGENTE
    abrir_emergente()

    mover_personaje_inicio(personajeContenedor, info_laberinto.inicio[0], info_laberinto.inicio[1])
    eliminar_bloques_recorridos()
    document.getElementById("navbar_seleccion").style.display = "block";
}
function reiniciar_animacion() {
    mover_personaje_inicio(personajeContenedor, info_laberinto.inicio[0], info_laberinto.inicio[1])
    iniciar_laberinto()
    document.getElementById("ventana_final").style.display = "none";
    document.getElementById("navbar_seleccion").style.display = "none";
}
function emergente_cambiar_mapa() {
    cerrar_emergente()
    cambiar_mapa()
}

function cambiar_mapa() {
    const pantalla_menu = document.getElementById('menu_inicio');
    pantalla_menu.classList.remove('slide-up');
    setTimeout(() => {
        pantalla_menu.style.display = 'flex';
        limpiar_laberinto(scene);
        document.getElementById("fileInput").value = "";
    }, 3000);
}


function animate() {                                        //ACTUALIZACION CONSTANTE DE IMAGEN
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    // Actualizar las animaciones del modelo
    if (mixer) {
        mixer.update(0.5); // Actualizar animación
    }
    if (moviendo && movimientoData) {
        movimientoData.tiempo += delta;
        const t = Math.min(movimientoData.tiempo / movimientoData.tiempoTotal, 1);

        personajeContenedor.position.x = THREE.MathUtils.lerp(movimientoData.xInicio, movimientoData.xFinal, t);
        personajeContenedor.position.z = THREE.MathUtils.lerp(movimientoData.zInicio, movimientoData.zFinal, t);

        if (t >= 1) {
            moviendo = false;
            moverse?.stop();
        }


    }
    if (itemDiamante) {
        itemDiamante.rotation.y += 0.01;
        itemDiamante.position.y = 0.5 + Math.sin(Date.now() * 0.002) * 0.05;
    }

    controls.update();
    renderer.render(scene, camera);
}
animate();

// RESPONSIVE
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});