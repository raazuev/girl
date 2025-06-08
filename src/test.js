import * as THREE from "three";

// Основная сцена
const scene = new THREE.Scene();

// Основная камера
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / innerHeight,
  0.1,
  100
);
camera.position.z = 5;

// Основной рендер
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

// Текстуры
const texture = new THREE.TextureLoader().load("/texture/texture.jpg");
const textureMaterial = new THREE.MeshBasicMaterial({ map: texture });

// Создание фигур
const geometry = new THREE.BoxGeometry();

// const material = new THREE.MeshBasicMaterial({ color: "green" });

const cube = new THREE.Mesh(geometry, textureMaterial);
cube.position.set(-3, 0, 0);
scene.add(cube);

const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const sphereMaterial = new THREE.MeshPhongMaterial({
  color: "blue",
  emissive: "#fff",
  shininess: 100,
});

const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.set(2, 0, 0);
scene.add(sphere);

const donut = new THREE.Mesh(
  new THREE.TorusGeometry(0.7, 0.2, 16, 100),
  new THREE.MeshBasicMaterial({ color: "orange" })
);
donut.position.set(2, 2, 1);
scene.add(donut);

const plane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), textureMaterial);
plane.position.set(-2, 2, 0);
scene.add(plane);

// Функция постоянного рендера анимации
function animate() {
  requestAnimationFrame(animate);

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  sphere.rotation.x += 0.01;
  sphere.rotation.y += 0.01;

  donut.rotation.x += 0.01;
  donut.rotation.y += 0.01;

  renderer.render(scene, camera);
}

animate();
