import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

// Основная сцена
const scene = new THREE.Scene();
// scene.background = new THREE.Color("#333"); // цвет сцены
// const loader = new THREE.TextureLoader();
// loader.load("/texture/back.jpg", (texture) => {
//   scene.background = texture;
// });

// Общий свет для любого объекта
const ambientLight = new THREE.AmbientLight("#fff", 0.2);
scene.add(ambientLight);

// Свет по типу солнца
const dirLight = new THREE.DirectionalLight("#fff", 1);
dirLight.position.set(5, 5, 5);
scene.add(dirLight);

// Свет по типу фонаря
const pointLight = new THREE.PointLight("#fff", 20, 100);
pointLight.position.set(-1, 2, 2);
scene.add(pointLight);

// Визуализация света
// const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.5);
// scene.add(pointLightHelper);

// Cвет по типу фонарика
// const spotLight = new THREE.SpotLight("white", 1);
// spotLight.position.set(1, 2, 3);
// scene.add(spotLight);

// Основная камера
const camera = new THREE.PerspectiveCamera(
  40,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.z = 4;
camera.position.x = 2;
camera.position.y = 3;

// Основной рендер
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

// Работа с камерой
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // замедления
controls.dampingFactor = 0.05; // значение замедления
controls.screenSpacePanning = false; // отключение панорамы по экрану
controls.minDistance = 2; // минимальная дистанция до центра
controls.maxDistance = 10; // максимальная дистанция от центра

// пост процессы
const renderPass = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,
  0.4,
  0.85
);

// эффект для пост процесса
const composer = new EffectComposer(renderer);
composer.addPass(renderPass);
composer.addPass(bloomPass);

// Текстуры
const texture = new THREE.TextureLoader().load("/texture/texture.jpg");
const textureMaterial = new THREE.MeshStandardMaterial({ map: texture });
const material = new THREE.MeshBasicMaterial({ color: "green" });

// Создание фигур
const geometry = new THREE.BoxGeometry();

// создание материалов
const originalMaterial = new THREE.MeshStandardMaterial({ color: "red" });
const hightLightMaterial = new THREE.MeshStandardMaterial({
  color: "yellow",
  emissive: "#fff",
  emissiveIntensity: 0.5,
});

// куб
const cube = new THREE.Mesh(geometry, originalMaterial);
cube.position.set(0, 0, 0);
// scene.add(cube);

// сфера
const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(),
  new THREE.MeshStandardMaterial({ color: "green" })
);
sphere.position.x = 2;
// scene.add(sphere);

// вершинный шейдер
const vertexShader = `
  varying vec3 vPosition;

  void main() {
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// фрагментированный шейдер
const fragmentShader = `
  precision mediump float;

  varying vec3 vPosition;

  void main() {
    gl_FragColor = vec4(abs(vPosition.x), abs(vPosition.y), abs(vPosition.z), 1.0);
  } 
`;

// материал для шейдера
const shaderMaterial = new THREE.ShaderMaterial({
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
});

// куб для шейдера
const newSphere = new THREE.Mesh(new THREE.SphereGeometry(), shaderMaterial);
scene.add(newSphere);

// загрузка 3D
const loader = new GLTFLoader();
loader.load(
  "/models/scene.gltf",
  (gltf) => {
    const model = gltf.scene; // загрузка объекта
    model.scale.set(1, 1, 1);
    model.position.set(1, 0.2, 1);
    model.rotation.x += 0.01;
    model.rotation.y += 0.01;
    scene.add(model);
  },
  (onProgress) => {
    console.log((onProgress.loaded / onProgress.total) * 100 + "% loaded"); // процент загрузки объекта
  },
  (onError) => {
    console.error("Error: " + onError);
  }
);

// анимация GSAP
// gsap.to(cube.position, {
//   y: 2,
//   x: 1,
//   duration: 1,
//   ease: "power1.inOut",
//   repeat: -1,
//   yoyo: true,
// });

// Взаимодействие с объектами
const raycaster = new THREE.Raycaster(); //
const mouse = new THREE.Vector2(); // информация про положение мышки

// функция для клика
function onMouseMove(e) {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1; // разделение положения
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1; // разделение положения
}

// const canvas = renderer.domElement;

// canvas.addEventListener("mouseenter", () => {
//   window.addEventListener("mousemove", onMouseClick);
//   console.log('Клик')
// });

// canvas.addEventListener("mouseleave", () => {
//   window.removeEventListener("mousemove", onMouseClick);
// });

// назначения слушателя мышки
window.addEventListener("mousemove", onMouseMove);

// информация мышки на объекте
let isHovered = false;

// Функция постоянного рендера анимации
function animate() {
  requestAnimationFrame(animate);

  // cube.rotation.x += 0.01;
  // cube.rotation.y += 0.01;

  raycaster.setFromCamera(mouse, camera); // направление луча камеры через точку клика

  const intersects = raycaster.intersectObject(cube); // записываем все объекты, с которым соприкоснулись

  if (intersects.length > 0 && !isHovered) {
    cube.material = hightLightMaterial; // при нажатии устанавливаем синий цвет
    isHovered = true;

    gsap.to(cube.scale, { x: 3, y: 1.5, duration: 1.5, ease: "power1.out" }); // анимация gsap
  } else if (intersects.length == 0 && isHovered) {
    cube.material = originalMaterial;
    isHovered = false;

    gsap.to(cube.scale, { x: 1, y: 1, duration: 1.5, ease: "power1.out" }); // анимация gsap
  }

  controls.update();
  renderer.setClearColor("lightblue");
  // renderer.render(scene, camera);
  composer.render();
}

animate();
