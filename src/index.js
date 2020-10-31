import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from "three/examples/jsm/libs/dat.gui.module";

let renderer, camera, scene, stats;
let light;
let cubeContainer;

const showAxes = false;
let isNormalCube = true;

let canGenerate = true;

const params = {
  level: 0,
  move: 1.0,

  // Background Color
  bgColorRed: 0,
  bgColorGreen: 0,
  bgColorBlue: 0,

  // Light Top Color
  lightTopColorRed: 255,
  lightTopColorGreen: 0,
  lightTopColorBlue: 0,

  // Light Bottom Color
  lightBottomColorRed: 0,
  lightBottomColorGreen: 0,
  lightBottomColorBlue: 255,
};

init();
animate();

function init() {
  createCamera();
  createScene();
  createLight();
  createAxes();
  createContainer();
  createRenderer();
  createOrbitControls();
  createStats();
  createPanel();

  generateMenger();

  window.addEventListener("resize", onWindowsResize, false);
}

function animate() {
  requestAnimationFrame(animate);

  cubeContainer.rotation.x += 0.005;
  cubeContainer.rotation.y += 0.001;
  cubeContainer.rotation.z += 0.001;
  renderer.render(scene, camera);

  stats.update();
}

function onWindowsResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function getSize(d, i) {
  if (isNormalCube) {
    return d / 3;
  }
  return d / (i <= 0 ? 2 : 4);
}

function box(x, y, z, xd, yd, zd) {
  const geometry = new THREE.BoxGeometry(xd, yd, zd);
  const cube = new THREE.Mesh(geometry);

  cube.position.set(x, y, z);
  return cube;
}

function menger(geom, n, x, y, z, xd, yd, zd) {
  if (n === 0) {
    // Merge boxes to improve performence
    geom.mergeMesh(box(x, y, z, xd, yd, zd));
  } else {
    for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
        for (let k = -1; k < 2; k++) {
          if ((i * i + j * j) * (i * i + k * k) * (j * j + k * k) > 0) {
            const newxd = getSize(xd, i);
            const newyd = getSize(yd, j);
            const newzd = getSize(zd, k);
            menger(
              geom,
              n - 1,
              x + i * newxd,
              y + j * newyd,
              z + k * newzd,
              newxd,
              newyd,
              newzd
            );
          }
        }
      }
    }
  }
}

function generateMenger() {
  if (canGenerate) {
    canGenerate = false;
    const geom = new THREE.Geometry();
    const material = new THREE.MeshPhongMaterial({ color: 0xaaaaaa });

    menger(geom, params.level, 0, 0, 0, 80, 80, 80);

    const mesh = new THREE.Mesh(geom, material);

    cubeContainer.remove(...cubeContainer.children);
    cubeContainer.add(mesh);
    canGenerate = true;
  }
}

function createCamera() {
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.set(0, 0, 200);
  camera.lookAt(0, 0, 0);
}

function createScene() {
  scene = new THREE.Scene();
}
function createLight() {
  light = new THREE.HemisphereLight();
  light.groundColor.setStyle(`rgb(0, 0, 255)`);
  light.color.setStyle(`rgb(255, 0, 0)`);
  light.position.set(-1, 1.5, 1);
  scene.add(light);
}

function createAxes() {
  if (showAxes) {
    const axesHelper = new THREE.AxesHelper(1000);
    scene.add(axesHelper);
  }
}

function createContainer() {
  cubeContainer = new THREE.Group();
  scene.add(cubeContainer);
}

function createRenderer() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setClearColor(
    `rgb(${params.bgColorRed}, ${params.bgColorGreen}, ${params.bgColorBlue})`
  );
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
}

function createOrbitControls() {
  new OrbitControls(camera, renderer.domElement);
}

function createStats() {
  stats = new Stats();
  document.body.appendChild(stats.dom);
}

function createPanel() {
  const panel = new GUI();
  const levelPanel = panel.addFolder("");
  const bgPanel = panel.addFolder("Background color");
  const lightTopPanel = panel.addFolder("Light top");
  const lightBottomPanel = panel.addFolder("Light bottom");

  levelPanel
    .add(params, "level", 0, 3, 1)
    .name("Menger level")
    .onChange(generateMenger);

  bgPanel.add(params, "bgColorRed", 0, 255, 1).name("Red").onChange(setBgColor);
  bgPanel
    .add(params, "bgColorGreen", 0, 255, 1)
    .name("Green")
    .onChange(setBgColor);
  bgPanel
    .add(params, "bgColorBlue", 0, 255, 1)
    .name("Blue")
    .onChange(setBgColor);

  lightTopPanel
    .add(params, "lightTopColorRed", 0, 255, 1)
    .name("Red")
    .onChange(setTopLightColor);
  lightTopPanel
    .add(params, "lightTopColorGreen", 0, 255, 1)
    .name("Green")
    .onChange(setTopLightColor);
  lightTopPanel
    .add(params, "lightTopColorBlue", 0, 255, 1)
    .name("Blue")
    .onChange(setTopLightColor);

  lightBottomPanel
    .add(params, "lightBottomColorRed", 0, 255, 1)
    .name("Red")
    .onChange(setBottomLightColor);
  lightBottomPanel
    .add(params, "lightBottomColorGreen", 0, 255, 1)
    .name("Green")
    .onChange(setBottomLightColor);
  lightBottomPanel
    .add(params, "lightBottomColorBlue", 0, 255, 1)
    .name("Blue")
    .onChange(setBottomLightColor);

  levelPanel.open();
  bgPanel.open();
  lightTopPanel.open();
  lightBottomPanel.open();
}

function setBgColor() {
  renderer.setClearColor(
    `rgb(${params.bgColorRed}, ${params.bgColorGreen}, ${params.bgColorBlue})`
  );
}

function setTopLightColor() {
  light.color.setStyle(
    `rgb(${params.lightTopColorRed}, ${params.lightTopColorGreen}, ${params.lightTopColorBlue})`
  );
}

function setBottomLightColor() {
  light.groundColor.setStyle(
    `rgb(${params.lightBottomColorRed}, ${params.lightBottomColorGreen}, ${params.lightBottomColorBlue})`
  );
}
