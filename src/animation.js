import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// Основная сцена
const scene = new THREE.Scene();

// Основная камера
const camera = new THREE.PerspectiveCamera(
  40,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(1, 2, 10);
camera.rotation.x = 6;

// Основной рендер
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

// Общий свет для любого объекта
const ambientLight = new THREE.AmbientLight("#fff", 1.4);
scene.add(ambientLight);

// Свет по типу солнца
const dirLight = new THREE.DirectionalLight("#fff", 1);
dirLight.position.set(5, 5, 5);
dirLight.castShadow = true;
scene.add(dirLight);

// плоскость
const road = new THREE.Mesh(
  new THREE.PlaneGeometry(25, 45),
  new THREE.MeshStandardMaterial({ color: "#333" })
);
road.rotation.x = -Math.PI / 2;
scene.add(road);

// загрузка машины 3D
const loader = new GLTFLoader();
let car;

loader.load(
  "/porsche/scene.gltf",
  (gltf) => {
    car = gltf.scene; // загрузка объекта
    car.scale.set(0.5, 0.5, 0.5);
    car.position.set(0, 1, 0);
    scene.add(car);
  },
  (onProgress) => {
    console.log((onProgress.loaded / onProgress.total) * 100 + "% loaded"); // процент загрузки объекта
  },
  (onError) => {
    console.error("Error: " + onError);
  }
);

// функция для движения машинки
let angle = 0;
let isMoving = false;

// обработчики нажатий
window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") {
    isMoving = true;
  }
});

window.addEventListener("keyup", (e) => {
  if (e.key === "ArrowUp") {
    isMoving = false;
  }
});

// функция для машины
function moveCar() {
  if (!car || !isMoving) return;

  angle += 0.01;
  car.position.x = 5 * Math.cos(angle);
  car.position.z = 5 * Math.sin(angle);
  car.rotation.y = -angle;
}

// точки для плоскости
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
    message: "Тревья точка",
    sphere: null,
  },
];

// проверка нахождения машины на точках
function checkInfoPoints() {
  infoPoints.forEach((point) => {
    const distance = car.position.distanceTo(point.position);
    if (distance < 0.5) {
      showInfo(point.message);
    }
  });
}

// для показа точек
function showInfo(message) {
  const infoBox = document.getElementById("app");
  infoBox.innerText = message;
  infoBox.style.display = "block";
}

// показ точек на плоскости
// infoPoints.forEach((point) => {
//   createInfoSphere(point.position);
// });
infoPoints.forEach((point) => {
  const geo = new THREE.SphereGeometry(0.2, 32, 32);
  const mat = new THREE.MeshStandardMaterial({ color: "blue" });
  const sph = new THREE.Mesh(geo, mat);

  sph.position.copy(point.position);
  sph.position.y = 0.5;
  sph.scale.set(1, 1, 1); // стартовый масштаб
  scene.add(sph);

  point.sphere = sph;
});

// точки
// function createInfoSphere(position) {
//   const sphere = new THREE.Mesh(
//     new THREE.SphereGeometry(0.2, 32, 32),
//     new THREE.MeshStandardMaterial({ color: "blue" })
//   );
//   sphere.position.copy(position);
//   sphere.position.y = 0.5;
//   scene.add(sphere);
// }

// Функция проверки и анимации сфер
function updateInfoSpheres() {
  if (!car) return;

  infoPoints.forEach((point) => {
    const sph = point.sphere;
    const dist = car.position.distanceTo(point.position);

    // если машина ближе 1.5 ед., увеличиваем; иначе — уменьшаем
    const targetScale = dist < 1.5 ? 1.8 : 1.0;

    // плавная интерполяция: new = old + (target - old) * alpha
    const alpha = 0.1;
    sph.scale.x += (targetScale - sph.scale.x) * alpha;
    sph.scale.y += (targetScale - sph.scale.y) * alpha;
    sph.scale.z += (targetScale - sph.scale.z) * alpha;

    // показываем инфо-бокс, когда близко
    if (dist < 1.5) {
      document.getElementById("app").innerText = point.message;
      document.getElementById("app").style.display = "block";
    }
  });
}

// Функция постоянного рендера анимации
function animate() {
  requestAnimationFrame(animate);
  moveCar();
  // checkInfoPoints();
  updateInfoSpheres();

  renderer.setClearColor("lightblue");
  renderer.render(scene, camera);
}

animate();
