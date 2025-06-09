import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

// 1) Сцена, камера, рендер и свет
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  40,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(1, 2, 10);
camera.rotation.x = 6;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Освещение
scene.add(new THREE.AmbientLight("#fff", 1.4));
const dirLight = new THREE.DirectionalLight("#fff", 1);
dirLight.position.set(5, 5, 5);
dirLight.castShadow = true;
scene.add(dirLight);

// HDRI-фоновая карта
new RGBELoader().load("/texture/golden_gate_hills_4k.hdr", (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture;
  scene.environment = texture;
});

// 2) Дорога с асфальтовой текстурой
const texLoader = new THREE.TextureLoader();
const asphaltColor = texLoader.load("/texture/Asphalt023S_1K-PNG_Color.png");
const asphaltNormal = texLoader.load(
  "/texture/Asphalt023S_1K-PNG_NormalGL.png"
);
const asphaltRoughness = texLoader.load(
  "/texture/Asphalt023S_1K-PNG_Roughness.png"
);

[asphaltColor, asphaltNormal, asphaltRoughness].forEach((tex) => {
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  // повторяем текстуру по X и Z
  tex.repeat.set(10, 10);
});

const roadMaterial = new THREE.MeshStandardMaterial({
  map: asphaltColor,
  normalMap: asphaltNormal,
  roughnessMap: asphaltRoughness,
  metalness: 0.1,
  roughness: 1.0,
  envMap: scene.environment, // отражения HDRI
  envMapIntensity: 0.5,
});

const road = new THREE.Mesh(new THREE.PlaneGeometry(25, 45), roadMaterial);
road.rotation.x = -Math.PI / 2;
scene.add(road);

// 3) Загрузка машины
let car = null;
new GLTFLoader().load(
  "/porsche/scene.gltf",
  (gltf) => {
    car = gltf.scene;
    car.scale.set(0.5, 0.5, 0.5);
    car.position.set(0, 1, 0);
    scene.add(car);
  },
  (xhr) =>
    console.log(((xhr.loaded / xhr.total) * 100).toFixed(1) + "% loaded"),
  (err) => console.error(err)
);

// 4) Управление (стрелки)
const controlsState = {
  moveF: false,
  moveB: false,
  turnL: false,
  turnR: false,
};
window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") controlsState.moveF = true;
  if (e.key === "ArrowDown") controlsState.moveB = true;
  if (e.key === "ArrowLeft") controlsState.turnL = true;
  if (e.key === "ArrowRight") controlsState.turnR = true;
});
window.addEventListener("keyup", (e) => {
  if (e.key === "ArrowUp") controlsState.moveF = false;
  if (e.key === "ArrowDown") controlsState.moveB = false;
  if (e.key === "ArrowLeft") controlsState.turnL = false;
  if (e.key === "ArrowRight") controlsState.turnR = false;
});

// 5) Точки интереса
const infoPoints = [
  {
    position: new THREE.Vector3(5, 0, 0),
    message: "Первая точка",
    sphere: null,
  },
  {
    position: new THREE.Vector3(-5, 0, 0),
    message: "Вторая точка",
    sphere: null,
  },
  {
    position: new THREE.Vector3(0, 0, 0),
    message: "Третья точка",
    sphere: null,
  },
];
infoPoints.forEach((pt) => {
  const sph = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 32, 32),
    new THREE.MeshStandardMaterial({ color: "blue" })
  );
  sph.position.copy(pt.position).setY(0.5);
  scene.add(sph);
  pt.sphere = sph;
});

// 6) Обновление машины
function updateCar(delta) {
  if (!car) return;
  const turnSpeed = 1.5,
    moveSpeed = 5;
  if (controlsState.turnL) car.rotation.y += turnSpeed * delta;
  if (controlsState.turnR) car.rotation.y -= turnSpeed * delta;

  const forward = new THREE.Vector3(0, 0, -1)
    .applyQuaternion(car.quaternion)
    .normalize();

  if (controlsState.moveF)
    car.position.add(forward.multiplyScalar(moveSpeed * delta));
  if (controlsState.moveB)
    car.position.add(forward.multiplyScalar(-moveSpeed * delta));
}

// 7) Анимация точек
function updateInfoSpheres() {
  if (!car) return;
  const threshold = 1.5,
    alpha = 0.1;
  infoPoints.forEach((pt) => {
    const dist = car.position.distanceTo(pt.position);
    const target = dist < threshold ? 1.8 : 1.0;
    pt.sphere.scale.lerp(new THREE.Vector3(target, target, target), alpha);
    if (dist < threshold) {
      const box = document.getElementById("app");
      box.innerText = pt.message;
      box.style.display = "block";
    }
  });
}

// 8) Цикл рендера
let prevTime = performance.now();
function animate() {
  requestAnimationFrame(animate);
  const now = performance.now();
  const delta = (now - prevTime) / 1000;
  prevTime = now;

  updateCar(delta);
  updateInfoSpheres();

  renderer.render(scene, camera);
}
animate();
