import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from "three/examples/jsm/libs/dat.gui.module";

let renderer, camera, scene, stats;
let light;
let cubeContainer;

let canGenerate = true;
const showAxes = true;

const MENGER_SPONGE_SETTINGS = {
  range: 1,
  parts: 3,
  condition: (cond) => cond > 0,
};

const JERUZALEM_CUBE_SETTINGS = {
  range: 2,
  parts: 5,
  condition: (cond) => cond > 20 || cond === 8,
};

const params = {
  regenerate: generate,
  changeToMenger: changeToMenger,
  changeToJeruzalem: changeToJeruzalem,
  level: 1,
  currendSettings: MENGER_SPONGE_SETTINGS,

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

  generate();

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

function box(x, y, z, xd, yd, zd) {
  const geometry = new THREE.BoxGeometry(xd, yd, zd);
  const cube = new THREE.Mesh(geometry);

  cube.position.set(x, y, z);
  return cube;
}

function generateCube(geom, n, x, y, z, xd, yd, zd) {
  if (n === 0) {
    // Merge boxes to improve performence
    geom.mergeMesh(box(x, y, z, xd, yd, zd));
  } else {
    const { range, parts, condition } = params.currendSettings;

    for (let i = -range; i <= range; i++) {
      for (let j = -range; j <= range; j++) {
        for (let k = -range; k <= range; k++) {
          const cond = (i * i + j * j) * (i * i + k * k) * (j * j + k * k);
          if (condition(cond)) {
            const newxd = xd / parts;
            const newyd = yd / parts;
            const newzd = zd / parts;
            const newX = x + i * newxd;
            const newY = y + j * newyd;
            const newZ = z + k * newzd;

            if (Math.random() > 0.5) {
              generateCube(geom, n - 1, newX, newY, newZ, newxd, newyd, newzd);
            } else {
              geom.mergeMesh(box(newX, newY, newZ, newxd, newyd, newzd));
            }
          }
        }
      }
    }
  }
}

function generate() {
  if (canGenerate) {
    canGenerate = false;
    const geom = new THREE.Geometry();
    const material = new THREE.MeshPhongMaterial({ color: 0xaaaaaa });

    generateCube(geom, params.level, 0, 0, 0, 80, 80, 80);

    const mesh = new THREE.Mesh(geom, material);

    cubeContainer.remove(...cubeContainer.children);
    cubeContainer.add(mesh);
    canGenerate = true;
  }
}

function changeToMenger() {
  params.currendSettings = MENGER_SPONGE_SETTINGS;
}

function changeToJeruzalem() {
  params.currendSettings = JERUZALEM_CUBE_SETTINGS;
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
  const additionalPanel = panel.addFolder("");
  const typePanel = panel.addFolder("Types");
  const bgPanel = panel.addFolder("Background color");
  const lightTopPanel = panel.addFolder("Light top");
  const lightBottomPanel = panel.addFolder("Light bottom");

  additionalPanel.add(params, "regenerate").name("Regenerate");
  additionalPanel
    .add(params, "level", 0, 3, 1)
    .name("Level")
    .onChange(generate);

  typePanel
    .add(params, "changeToMenger")
    .name("Menger sponge")
    .onChange(() => {
      setTimeout(() => {
        generate();
      }, 300);
    });
  typePanel
    .add(params, "changeToJeruzalem")
    .name("Jeruzalem cube")
    .onChange(() => {
      setTimeout(() => {
        generate();
      }, 300);
    });

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

  additionalPanel.open();
  typePanel.open();
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
