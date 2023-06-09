import * as THREE from "three";
import { OrbitControls } from "./jsm/controls/OrbitControls.js";
import { GLTFLoader } from "./jsm/loaders/GLTFLoader.js";

let scene, camera, renderer, moon, controls, plane;
let updateParticles; // Declarar la variable aquí
let clock = new THREE.Clock();

init();
animate();

function createParticles() {
  const particleCount = 500;
  const particles = new THREE.BufferGeometry();
  const range = 5000; // Rango de distribución de las partículas

  for (let i = 0; i < particleCount; i++) {
    // Creamos una nueva partícula como una esfera
    const particle = new THREE.Mesh(
      new THREE.SphereGeometry(10, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );

    // Ajustamos las posiciones de las partículas dentro del rango especificado
    particle.position.x = Math.random() * range - range / 2;
    particle.position.y = Math.random() * range - range / 3;
    particle.position.z = Math.random() * range - range / 2;

    const color = new THREE.Color();
    color.r = Math.random() * 0.1; // Rango de valores entre 0 y 0.1 (tonos más oscuros)
    color.g = Math.random() * 0.05; // Rango de valores entre 0 y 0.05 (tonos más oscuros)
    color.b = Math.random() * 0.2; // Rango de valores entre 0 y 0.2 (tonos más oscuros)
    color.r += color.b; // 

    // Asignar el color al material de la partícula
    particle.material.color = color;

    // Agregamos la posición de la partícula a la geometría
    particles.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(particle.position.toArray(), 3)
    );

    // Agregamos la partícula a la escena
    scene.add(particle);
  }

  // Creamos un material para las partículas
  const particleMaterial = new THREE.PointsMaterial({
    vertexColors: true, // Habilitar colores por vértice
    size: 10,
    opacity: 0.2,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: true,
    lights: true, // Habilitar iluminación en las partículas
    shadowSide: THREE.DoubleSide, // Renderizar sombras en ambos lados
    receiveShadow: true, // Permitir que las partículas reciban sombras
  });

  // Creamos un sistema de partículas utilizando la geometría y el material
  const particleSystem = new THREE.Points(particles, particleMaterial);

  // Agregamos el sistema de partículas a la escena
  scene.add(particleSystem);

  // La función de actualización de partículas no necesita cambios
  updateParticles = function () {
    const delta = clock.getDelta();
    const particlePositions = particles.attributes.position.array;

    for (let i = 0; i < particlePositions.length; i += 3) {
      // Obtener la posición actual de la partícula
      const x = particlePositions[i];
      const y = particlePositions[i + 1];
      const z = particlePositions[i + 2];

      // Generar valores de desplazamiento aleatorios para cada coordenada
      const dx = Math.random() * 2 - 1;
      const dy = Math.random() * 2 - 1;
      const dz = Math.random() * 2 - 1;

      // Calcular la nueva posición sumando el desplazamiento y el tiempo transcurrido
      const newX = x + dx * delta;
      const newY = y + dy * delta;
      const newZ = z + dz * delta;

      // Actualizar la posición de la partícula
      particlePositions[i] = newX;
      particlePositions[i + 1] = newY;
      particlePositions[i + 2] = newZ;
    }

    particles.attributes.position.needsUpdate = true;
  };

  // Retornamos la función de actualización de partículas
  return updateParticles;
}

function init() {
  scene = new THREE.Scene();

  //camara
  camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
  );
  camera.position.set(0, 50, 2500);
  camera.lookAt(scene.position);
  /*const helper = new THREE.CameraHelper(camera);
  scene.add(helper);*/
  scene.add(camera);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  /*const controls = new OrbitControls(camera, renderer.domElement)
  controls.noPan = true
  controls.noZoom = true*/
  // particles
  updateParticles = createParticles();

  let controls = new OrbitControls(camera, renderer.domElement);
  controls.addEventListener("change", render);
  controls.minDistance = 500;
  controls.maxDistance = 2000;

  //Texture loaders
  const textureLoader = new THREE.TextureLoader();
  const moonTexture = textureLoader.load("img/moontexture.jpg");
  const planeTexture = textureLoader.load("img/mountains_baseColor.jpeg");

  //Scene background
  let materialArray = [];
  let texture_ft = new THREE.TextureLoader().load("img/corona_ft.png");
  let texture_bk = new THREE.TextureLoader().load("img/corona_bk.png");
  let texture_up = new THREE.TextureLoader().load("img/corona_up.png");
  let texture_dn = new THREE.TextureLoader().load("img/corona_dn.png");
  let texture_rt = new THREE.TextureLoader().load("img/corona_rt.png");
  let texture_lf = new THREE.TextureLoader().load("img/corona_lf.png");

  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_ft }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_bk }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_up }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_dn }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_rt }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_lf }));

  for (let i = 0; i < 6; i++) materialArray[i].side = THREE.BackSide;
  let skyboxGeo = new THREE.BoxGeometry(10000, 10000, 10000);
  let skybox = new THREE.Mesh(skyboxGeo, materialArray);
  scene.add(skybox);

  //luces
  /*const directionaLight = new THREE.DirectionalLight(0xffffff, 1);
  directionaLight.position.set(0, 1, 0);
  directionaLight.castShadow = true;
  scene.add(directionaLight);*/

  //la luna
  const moonGeom = new THREE.SphereGeometry(500, 1000, 1000);
  const moonMat = new THREE.MeshBasicMaterial({ map: moonTexture });
  moon = new THREE.Mesh(moonGeom, moonMat);
  moon.position.set(20, 2500, -5000);
  scene.add(moon);

  //el plano
  const planeGeometry = new THREE.PlaneGeometry(10000, 10000);
  const planeMaterial = new THREE.MeshLambertMaterial({
    map: planeTexture,
    side: THREE.DoubleSide, // Renderizar ambos lados del plano
    receiveShadow: true, // Habilitar la recepción de sombras
  });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // T
  plane = new THREE.Mesh(planeGeometry, planeMaterial);
  //plane.position.y = - 33;
  plane.position.set(0, -500, 0);
  plane.rotation.x = -Math.PI / 2;
  plane.receiveShadow = true;
  scene.add(plane);

  //GLTF loader
  const loader = new GLTFLoader();
  loader.load("models/mountains.glb", function (gltfScene) {
    gltfScene.scene.rotation.y = -Math.PI / 2;
    gltfScene.scene.scale.set(100, 300, 100);
    gltfScene.scene.position.set(-500, -500, -5000);
    scene.add(gltfScene.scene);
  });

  loader.load("models/mountains.glb", function (gltfScene) {
    gltfScene.scene.rotation.y = -Math.PI / 2;
    gltfScene.scene.scale.set(100, 200, 100);
    gltfScene.scene.position.set(-3000, -500, -5000);
    scene.add(gltfScene.scene);
  });

  loader.load("models/mountains.glb", function (gltfScene) {
    gltfScene.scene.rotation.y = -Math.PI / 2;
    gltfScene.scene.scale.set(100, 200, 100);
    gltfScene.scene.position.set(3000, -500, -5000);
    scene.add(gltfScene.scene);
  });

  loader.load("models/old_rusty_car.glb", function (gltfScene) {
    gltfScene.scene.rotation.y = -25;
    gltfScene.scene.scale.set(0.5, 0.5, 0.5);
    gltfScene.scene.position.set(0, -500, 500);
    scene.add(gltfScene.scene);
  });

  loader.load("models/electricity_pole.glb", function (gltfScene) {
    gltfScene.scene.rotation.y = -Math.PI / 2;
    gltfScene.scene.scale.set(250, 250, 250);
    gltfScene.scene.position.set(1000, -500, 1000);
    scene.add(gltfScene.scene);
  });
  //pointlight para carro
  const light = new THREE.PointLight("#E97451", 5, 700);
  light.position.set(0, -0.1, 500);
  light.castShadow = true; // Habilitar emisión de sombras
  light.shadow.camera.near = 0.1; // Ajustar cerca del plano de la cámara de sombras
  light.shadow.camera.far = 1000; // Ajustar lejos del plano de la
  scene.add(light);

  // const sphereSize = 500;
  // // const pointLightHelper = new THREE.PointLightHelper( light, sphereSize );
  // // scene.add( pointLightHelper );
  //   //spotlight para iluminar todo el plano

  const spotLight_plano = new THREE.SpotLight("#49345c");
  spotLight_plano.position.set(0, 100000, 0);
  spotLight_plano.intensity = 0.5;
  spotLight_plano.castShadow = true;
  spotLight_plano.shadow.mapSize.width = 1024;
  spotLight_plano.shadow.mapSize.height = 1024;

  scene.add(spotLight_plano);

  // const spotLightHelper_plano= new THREE.SpotLightHelper( spotLight_plano);
  // scene.add( spotLightHelper_plano);

  //spotlight para montañas

  const spotLight_mountains = new THREE.SpotLight("#7b6fd2");
  spotLight_mountains.position.set(-2000, -500, 5000);

  spotLight_mountains.intensity = 0.5;
  spotLight_mountains.castShadow = true;
  spotLight_mountains.shadow.mapSize.width = 10;
  spotLight_mountains.shadow.mapSize.height = 10;

  scene.add(spotLight_mountains);

  //  const spotLightHelper_mountains= new THREE.SpotLightHelper( spotLight_mountains );

  //  spotLightHelper_mountains.position.set(10,10,10)

  //  scene.add( spotLightHelper_mountains );
}

/*window.addEventListener(
  'resize',
  () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
      // composer.setSize( window.innerWidth, window.innerHeight )
      halfWidth = window.innerWidth / 2;
      halfHeight = window.innerHeight / 2;
      composerScene.setSize( halfWidth * 2, halfHeight * 2 );
      composer1.setSize( halfWidth, halfHeight );
      renderScene.uniforms[ 'tDiffuse' ].value = composerScene.renderTarget2.texture;
      render()
  },
  false
)*/

function animate() {
  requestAnimationFrame(animate);
  moon.rotation.y += 0.005;
  updateParticles(); // Actualizar las posiciones de las partículas en cada cuadro de animación
  render();
}

function render() {
  renderer.render(scene, camera);
}
