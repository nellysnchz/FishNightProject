import * as THREE from 'three';
import { OrbitControls } from './jsm/controls/OrbitControls.js'

let scene, camera, renderer, moon;

init();
animate();

function init(){

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight,45,30000);
  camera.position.set(-900, -200, -900);


  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  let controls = new OrbitControls(camera, renderer.domElement);
  controls.addEventListener("change", render);
  controls.minDistance = 500;
  controls.maxDistance = 1500;

  //Texture loaders
  const textureLoader = new THREE.TextureLoader();
  const moonTexture = textureLoader.load("img/moontexture.jpg");

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


  //la luna
  const moonGeom = new THREE.SphereGeometry(90, 1000, 1000);
  const moonMat = new THREE.MeshBasicMaterial({map: moonTexture});
  moon = new THREE.Mesh(moonGeom, moonMat);
  moon.position.set(20, 600, 20);
  scene.add(moon);
}

function animate(){
  requestAnimationFrame(animate);
  moon.rotation.y += 0.005;

  render();
}

function render(){
  renderer.render(scene, camera);

}
