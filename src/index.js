import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from "three/examples/jsm/libs/dat.gui.module";


let renderer, camera, scene, stats, cubeContainer;
let canGenerate = true;
const lights = [];
const showAxes = false;

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

/**
 * Initial function, which set up project
 * @returns {void}
 */
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

/**
 * Used to update animation, called on every frame
 * @returns {void}
 */
function animate() {
  requestAnimationFrame(animate);
  render();
  stats.update();
}

/**
 * Make elements more interactive
 * @returns {void}
 */
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

/**
 * Called on windows resize
 * @returns {void}
 */
function onWindowsResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * Box constructor
 * @param {THREE.Vector3} position
 * @param {THREE.Vector3} size
 * @returns {void}
 */
function box(position, size) {
  const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
  const cube = new THREE.Mesh(geometry);

  cube.position.copy(position);
  return cube;
}

/**
 * Generate cube recursively
 * @param {THREE.Geometry} geom
 * @param {Number} n
 * @param {THREE.Vector3} position
 * @param {THREE.Vector3} size
 * @returns {void}
 */
function generateCube(geom, n, position, size) {
  if (n === 0) {
    // Merge boxes to improve performence
    geom.mergeMesh(box(position, size));
  } else {
    const { range, parts, condition } = params.currentSettings;
    const { invert } = params;

    for (let i = -range; i <= range; i++) {
      for (let j = -range; j <= range; j++) {
        for (let k = -range; k <= range; k++) {
          const cond = (i * i + j * j) * (i * i + k * k) * (j * j + k * k);

          if ((!invert && condition(cond)) || (invert && !condition(cond))) {
            const newSize = new THREE.Vector3(
              size.x / parts,
              size.y / parts,
              size.z / parts
            );
            const newPosition = new THREE.Vector3(
              position.x + i * newSize.x,
              position.y + j * newSize.y,
              position.z + k * newSize.z
            );

            if (Math.random() > 0.5 || !params.randomly) {
              generateCube(geom, n - 1, newPosition, newSize);
            } else {
              geom.mergeMesh(box(newPosition, newSize));
            }
          }
        }
      }
    }
  }
}

/**
 * Generate cube
 * @returns {void}
 */
function generate() {
  if (canGenerate) {
    canGenerate = false;
    const geom = new THREE.Geometry();
    const material = new THREE.MeshPhongMaterial({ color: 0xaaaaaa });
    const mesh = new THREE.Mesh(geom, material);

    const position = new THREE.Vector3(0, 0, 0);
    const size = new THREE.Vector3(40, 40, 40);

    generateCube(geom, params.level, position, size);

    cubeContainer.remove(...cubeContainer.children);
    cubeContainer.add(mesh);
    canGenerate = true;
  }
}

/**
 * Change cube to menger sponge
 * @returns {void}
 */
function changeToMenger() {
  params.currentSettings = MENGER_SPONGE_SETTINGS;
}

/**
 * Change cube to jeruzalem
 * @returns {void}
 */
function changeToJeruzalem() {
  params.currentSettings = JERUZALEM_CUBE_SETTINGS;
}

/**
 * Create camera instance
 * @returns {void}
 */
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

/**
 * Create scene instance
 * @returns {void}
 */
function createScene() {
  scene = new THREE.Scene();
}

/**
 * Create light bulb
 * @param {*} color light color
 * @returns {THREE.PointLight}
 */
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

/**
 * Generate all lights
 * @returns {void}
 */
function createLights() {
  params.lights.forEach((value) => lights.push(createLight(value)));
}

/**
 * Create axes depends on the flag
 * @returns {void}
 */
function createAxes() {
  if (showAxes) {
    const axesHelper = new THREE.AxesHelper(1000);
    scene.add(axesHelper);
  }
}

/**
 * Create group container
 * @returns {void}
 */
function createContainer() {
  cubeContainer = new THREE.Group();
  scene.add(cubeContainer);
}

/**
 * Create renderer
 * @returns {void}
 */
function createRenderer() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setClearColor(
    `rgb(${params.bgColorRed}, ${params.bgColorGreen}, ${params.bgColorBlue})`
  );
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
}

/**
 * Create control instance which allow as to change camera position
 * @returns {void}
 */
function createOrbitControls() {
  new OrbitControls(camera, renderer.domElement);
}

/**
 * Create stats
 * @returns {void}
 */
function createStats() {
  stats = new Stats();
  document.body.appendChild(stats.dom);
}

/**
 * Create gui panel
 * @returns {void}
 */
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

/**
 * Change background color
 * @returns {void}
 */
function setBgColor() {
  renderer.setClearColor(params.bgColor);
}

/**
 * Change light color
 * @param {THREE.PointLight} light
 * @param {Number} color
 * @returns {void}
 */
function setLightColor(light, color) {
  light.color.setHex(color);
  light.children[0].material.color.setHex(color);
}

/**
 * Show or hide lights bulb
 * @returns {void}
 */
function showLightBulb() {
  lights.forEach((light) => (light.children[0].visible = params.showBulb));
}
