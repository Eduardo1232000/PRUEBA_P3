const fileInput = document.getElementById('fileInput');
const boton_cargarlaberinto = document.getElementById('boton_cargarlaberinto');
const fileName = document.getElementById('fileName');

let info_laberinto

boton_cargarlaberinto.addEventListener('click', () => {
    fileInput.click(); // Simula el clic al input real
});

fileInput.addEventListener('change', () => {

    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            let jsonData = e.target.result;
            info_laberinto = JSON.parse(jsonData);
            console.log("EXITO AL CARGAR JSON");
            console.log(info_laberinto.ancho, info_laberinto.alto, info_laberinto.inicio, info_laberinto.fin, info_laberinto.paredes)
            armar_laberinto(scene, info_laberinto.ancho, info_laberinto.alto, info_laberinto.paredes)

            const centradox = (info_laberinto.ancho ) / 2;     // DISTANCIA PARA QUE QUEDE TODO CENTRADO EN X
            const centradoz = (info_laberinto.alto  ) / 2;      // DISTANCIA PARA QUE QUEDE TODO CENTRADO EN Z
            model.position.x = (info_laberinto.inicio[0] - centradox  )
            model.position.z = (info_laberinto.inicio[1] - centradoz  )
        } catch (error) {
            console.log("Error al cargar el JSON: " + error);
        }
    };
    reader.readAsText(file);






    const pantalla_menu = document.getElementById('menu_inicio');
    pantalla_menu.classList.add('slide-up');
    setTimeout(() => {
        pantalla_carga.style.display = 'none';
    }, 4000);

});




// ESCENA
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);       // TODO CELESTE, PARA SIMULAR UN CIELO

// CAMARA       PERSPESCTIVA DE LA CAMARA
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);

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





// MODELO 3D (con corrección de typo)
const loader = new THREE.GLTFLoader();


// Variables globales
let model, mixer, AnimacionCaminar, clock;
let moverse;
const personajeContenedor = new THREE.Group();      //CRAMOS UN CONTENEDOR PARA EL PERSONAJE
scene.add(personajeContenedor);

// Cargar el modelo de 'child.glb' y su animación
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
            //EXTRA
        }
    });
    // Luz que solo afecta al personaje

    const luzPersonaje = new THREE.PointLight(0xffffff, 5, 5, 2);
    luzPersonaje.position.set(0, 0, 0); // Posición sobre el personaje
    luzPersonaje.castShadow = false;   // Desactivar sombras (si no quieres que la luz las proyecte)
    personajeContenedor.add(luzPersonaje);

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
                //moverse.play();
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

function caminar() {
    moverse.play();
}

function detenerse() {
    moverse.stop();
}



let walkSpeed = -0.01;                                         // VELOCIDAD DE ANIMACION
function animate() {
    requestAnimationFrame(animate);
    //const delta = clock.getDelta(); // Obtener el tiempo delta

    // Actualizar las animaciones del modelo

    if (mixer) {
        mixer.update(0.7); // Actualizar animación
    }
    // Mover el modelo continuamente
    /*
    if (model) {
        model.position.z -= walkSpeed; // Movimiento hacia adelante (eje Z negativo)
    }*/

    controls.update();
    renderer.render(scene, camera);
}
animate();


// RESPONSIVO
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});