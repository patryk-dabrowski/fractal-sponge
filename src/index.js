import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from "three/examples/jsm/libs/dat.gui.module";

let renderer, camera, scene, stats;
const lights = [];
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
  level: 0,
  currentSettings: MENGER_SPONGE_SETTINGS,
  invert: false,
  randomly: false,
  rotateCube: true,
  rotateLights: true,
  showBulb: true,
  bgColor: 0x000000,
  lights: [0xff0040, 0x0040ff, 0x80ff80, 0xffaa00],
};

init();
animate();

function init() {
  createCamera();
  createScene();
  createLights();
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
  render();
  stats.update();
}

function render() {
  const time = Date.now() * 0.0005;
  if (params.rotateCube) {
    cubeContainer.rotation.x += 0.005;
    cubeContainer.rotation.y += 0.001;
    cubeContainer.rotation.z += 0.001;
  }

  if (params.rotateLights) {
    const { sin, cos } = Math;
    const positions = [
      [sin(time * 0.7) * 30, cos(time * 0.5) * 40, cos(time * 0.3) * 30],
      [cos(time * 0.3) * 30, sin(time * 0.5) * 40, sin(time * 0.7) * 30],
      [sin(time * 0.7) * 30, cos(time * 0.3) * 40, sin(time * 0.5) * 30],
      [sin(time * 0.3) * 30, cos(time * 0.7) * 40, sin(time * 0.5) * 30],
    ];

    lights.forEach((light, index) => {
      light.position.set(...positions[index]);
    });
  }
  renderer.render(scene, camera);
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
    const { range, parts, condition } = params.currentSettings;

    for (let i = -range; i <= range; i++) {
      for (let j = -range; j <= range; j++) {
        for (let k = -range; k <= range; k++) {
          const cond = (i * i + j * j) * (i * i + k * k) * (j * j + k * k);
          if (
            (!params.invert && condition(cond)) ||
            (params.invert && !condition(cond))
          ) {
            const newxd = xd / parts;
            const newyd = yd / parts;
            const newzd = zd / parts;
            const newX = x + i * newxd;
            const newY = y + j * newyd;
            const newZ = z + k * newzd;

            if (Math.random() > 0.5 || !params.randomly) {
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
    const mesh = new THREE.Mesh(geom, material);

    generateCube(geom, params.level, 0, 0, 0, 40, 40, 40);

    cubeContainer.remove(...cubeContainer.children);
    cubeContainer.add(mesh);
    canGenerate = true;
  }
}

function changeToMenger() {
  params.currentSettings = MENGER_SPONGE_SETTINGS;
}

function changeToJeruzalem() {
  params.currentSettings = JERUZALEM_CUBE_SETTINGS;
}

function createCamera() {
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.set(0, 0, 100);
  camera.lookAt(0, 0, 0);
}

function createScene() {
  scene = new THREE.Scene();
}

function createLight(color) {
  const sphere = new THREE.SphereBufferGeometry(0.5, 16, 8);
  const material = new THREE.MeshBasicMaterial({ color });
  const mesh = new THREE.Mesh(sphere, material);
  const light = new THREE.PointLight(color, 5, 100);

  light.add(mesh);
  light.position.set(120, 120, 120);
  scene.add(light);
  return light;
}

function createLights() {
  params.lights.forEach((value) => lights.push(createLight(value)));
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
  const colorPanel = panel.addFolder("Background color");

  additionalPanel.add(params, "regenerate").name("Regenerate");
  additionalPanel.add(params, "invert").name("Invert").onChange(generate);
  additionalPanel.add(params, "randomly").name("Randomly").onChange(generate);
  additionalPanel.add(params, "rotateCube").name("Rotate cube");
  additionalPanel.add(params, "rotateLights").name("Rotate lights");
  additionalPanel
    .add(params, "showBulb")
    .name("Show light bulb")
    .onChange(showLightBulb);
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

  colorPanel
    .addColor(params, "bgColor")
    .name("Background")
    .onChange(setBgColor);

  params.lights.forEach((_, index) =>
    colorPanel
      .addColor(params.lights, index)
      .name(`Light ${index + 1}`)
      .onChange(() => setLightColor(lights[index], params.lights[index]))
  );

  additionalPanel.open();
  typePanel.open();
  colorPanel.open();
}

function setBgColor() {
  renderer.setClearColor(params.bgColor);
}

function setLightColor(light, color) {
  light.color.setHex(color);
  light.children[0].material.color.setHex(color);
}

function showLightBulb() {
  lights.forEach((light) => (light.children[0].visible = params.showBulb));
}
