import * as THREE from 'three';
import { OrbitControls } from './jsm/controls/OrbitControls.js'
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js'
import { EffectComposer } from './jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './jsm/postprocessing/RenderPass.js';
import { GlitchPass } from './jsm/postprocessing/GlitchPass.js';

/* Benjamin Rodriguez
Daniela Mocoso
Nallely Sanchez*/

let scene, camera, renderer, moon, controls, mixer, mosasa, composer, seaturtle, jellyfish;



init();
animate();

function init(){
  window.THREE = THREE;

  scene = new THREE.Scene();

  //camara
  camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight,0.1,10000);
  camera.position.set(0, 50, 2500);
  camera.lookAt(scene.position);
  /*const helper = new THREE.CameraHelper(camera);
  scene.add(helper);*/
  scene.add(camera);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.noPan = true
  controls.noZoom = true

  /*let controls = new OrbitControls(camera, renderer.domElement);
  controls.addEventListener("change", render);*/

  var smokeTexture = new THREE.TextureLoader().load('img/smoke.png');
  var smokeGeometry = new THREE.PlaneGeometry(300,1500);
  var smokeMaterial = new THREE.MeshLambertMaterial({ map: smokeTexture, opacity: 0.3, transparent: true});

  var smokeParticles;
  smokeParticles = [];

  for (var i = 0; i < 5; i++)
{    
    var smoke_element = new THREE.Mesh(smokeGeometry,smokeMaterial);
    smoke_element.scale.set(2, 2, 2);
    smoke_element.position.set( Math.random()* 100, Math.random()*500, Math.random()*100);
    smoke_element.rotation.z = Math.random() * 360
            
    scene.add(smoke_element);
    smokeParticles.push(smoke_element);
}

  
  
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
  const directionaLight = new THREE.DirectionalLight("#C9AAF1", 3);
  directionaLight.position.set(0, 1, 0);
  directionaLight.castShadow = true;
  scene.add(directionaLight);

  

  //la luna
  const moonGeom = new THREE.SphereGeometry(500, 1000, 1000);
  const moonMat = new THREE.MeshBasicMaterial({map: moonTexture});
  moon = new THREE.Mesh(moonGeom, moonMat);
  moon.position.set(20, 2500, -5000);
  scene.add(moon);

  //el plano
  const planeGeometry = new THREE.PlaneGeometry(10000, 10000);
  const planeMaterial = new THREE.MeshLambertMaterial({map: planeTexture});
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  //plane.position.y = - 33;
  plane.position.set(0, -500, 0);
  plane.rotation.x = - Math.PI / 2;
  scene.add(plane);

  //GLTF loader
  const loader = new GLTFLoader();
  loader.load("models/mountains.glb", function(gltfScene){
    gltfScene.scene.rotation.y = - Math.PI / 2;
    gltfScene.scene.scale.set(100, 300, 100);
    gltfScene.scene.position.set(-500, -500, -5000);
    scene.add(gltfScene.scene);
  });

  loader.load("models/mountains.glb", function(gltfScene){
    gltfScene.scene.rotation.y = - Math.PI / 2;
    gltfScene.scene.scale.set(100, 200, 100);
    gltfScene.scene.position.set(-3000, -500, -5000);
    scene.add(gltfScene.scene);
  });

  loader.load("models/mountains.glb", function(gltfScene){
    gltfScene.scene.rotation.y = - Math.PI / 2;
    gltfScene.scene.scale.set(100, 200, 100);
    gltfScene.scene.position.set(3000, -500, -5000);
    scene.add(gltfScene.scene);
  });

  loader.load("models/old_rusty_car.glb", function(gltfScene){
    gltfScene.scene.rotation.y = -25;
    gltfScene.scene.scale.set(0.5, 0.5, 0.5);
    gltfScene.scene.position.set(0, -500, 500);
    scene.add(gltfScene.scene);
  });

  loader.load("models/electricity_pole.glb", function(gltfScene){
    gltfScene.scene.rotation.y = - Math.PI / 2;
    gltfScene.scene.scale.set(250, 250, 250);
    gltfScene.scene.position.set(1000, -500, 1000);
    scene.add(gltfScene.scene);
  });

  loader.load("models/mosasa.glb", function(gltfScene){
    mosasa = gltfScene.scene;
    gltfScene.scene.scale.set(100, 100, 100);
    gltfScene.scene.position.set(100, 400, 500);
    const animations = gltfScene.animations;
    mixer = new THREE.AnimationMixer(gltfScene.scene);
    const action = mixer.clipAction(animations[0]);
    action.play();
    scene.add(gltfScene.scene);
  });

  loader.load("models/seaturtle.glb", function(gltfScene){
     seaturtle = gltfScene.scene;
     gltfScene.scene.scale.set(1000, 1000, 1000);
     gltfScene.scene.position.set(-1000, 10, 500);
     const animations = gltfScene.animations;
     mixer = new THREE.AnimationMixer(gltfScene.scene);
     const action = mixer.clipAction(animations[0]);
     action.play();
     scene.add(gltfScene.scene);
   });

  loader.load("models/jellyfish.glb", function(gltfScene){
    jellyfish = gltfScene.scene;
    //gltfScene.translateX(0.01);
    gltfScene.scene.rotation.x = - Math.PI / 2;
    gltfScene.scene.scale.set(50, 50, 50);
    gltfScene.scene.position.set(400, 100, 500);
    const animations = gltfScene.animations;
    mixer = new THREE.AnimationMixer(gltfScene.scene);
    const action = mixer.clipAction(animations[0]);
    action.play();
    scene.add(gltfScene.scene);
  });

  //pointlight para carro
  const light = new THREE.PointLight("#E97451", 20, 700)
  light.position.set(0,-0.10, 500)
  light.castShadow = true
  light.shadow.camera.near = 500 // default
  light.shadow.camera.far = 500 // default
  scene.add( light );

 
    //spotlight para iluminar todo el plano
  
    const spotLight_plano = new THREE.SpotLight( "#49345c" );
    spotLight_plano.position.set( 0,10000,0);
    spotLight_plano.intensity = 0.8;
    spotLight_plano.castShadow = true;
    spotLight_plano.shadow.mapSize.width = 1024;
    spotLight_plano.shadow.mapSize.height = 1024;
  
    scene.add( spotLight_plano );
  
    const spotLightHelper_plano= new THREE.SpotLightHelper( spotLight_plano);
    scene.add( spotLightHelper_plano);

    //niebla


    //pointlight para poste
  const poste_light = new THREE.PointLight("#047F71", 25, 700)
  poste_light.position.set(950,-25, -1500)
  poste_light.intensity = 55
  poste_light.rotateY = -Math.PI / 2
  poste_light.castShadow = true
  poste_light.shadow.camera.near = 500 // default
  poste_light.shadow.camera.far = 500 // default
  scene.add( poste_light );



      //pointlight para poste 2
  const poste_light2 = new THREE.PointLight("#047F71", 25, 700)
  poste_light2.position.set(950,-25, 950)
  poste_light2.intensity = 55
  poste_light2.rotateY = -Math.PI / 2
  poste_light2.castShadow = true
  poste_light2.shadow.camera.near = 500 // default
  poste_light2.shadow.camera.far = 500 // default
  scene.add( poste_light2 );
  
    
  

   //spotlight para montañas
   const spotLight_mountains = new THREE.SpotLight( "#7b6fd2" );
   spotLight_mountains.position.set( -2000,-500,5000);
  
   spotLight_mountains.intensity = 8;
   spotLight_mountains.castShadow = true;
   spotLight_mountains.shadow.mapSize.width = 10;
   spotLight_mountains.shadow.mapSize.height = 10;
 
   scene.add( spotLight_mountains );
   composer = new EffectComposer( renderer );
   const renderPass = new RenderPass( scene, camera );
  composer.addPass( renderPass );

  const glitchPass = new GlitchPass();
  composer.addPass( glitchPass );
  
}



window.addEventListener(
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
)

function animate() {
  requestAnimationFrame(animate);


  moon.rotation.y += 0.005;

  if (mosasa && mixer) {
    // Se realiza la traslacion del mosasauro
    const translationSpeed = 2; 
    const translationDistance = 200; 

    // Mover a la izquierda
    mosasa.translateX(-translationSpeed);

    if (mosasa.position.x < -translationDistance) {
      // Rotar y mover a la derecha
      const rotationSpeed = 0.01; 
      const rotationAmount = Math.PI * 2; 

      mosasa.rotation.y += rotationSpeed;

      if (mosasa.rotation.y >= rotationAmount) {
        // Se mueve a la derecha
        mosasa.translateX(translationSpeed);

        if (mosasa.position.x > translationDistance) {
          // Se reinicia la posicion del mosasauro
          mosasa.position.set(100, 400, 500);
          mosasa.rotation.set(0, 0, 0);
        }
      }
    }
    mixer.update(0.02);
  }

  render();
}

function render(){
  composer.render(scene,camera); 
}