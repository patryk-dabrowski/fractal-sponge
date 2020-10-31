import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from "three/examples/jsm/libs/dat.gui.module";

let renderer, camera, scene, stats;

let cubeContainer;

const showAxes = false;
let isNormalCube = true;
let level = 0;
const MAX_LEVEL = 3;
const MIN_LEVEL = 0;

const params = {
  increaseLevel: increaseLevel,
  decreaseLevel: decreaseLevel,
  normal: normalMengerSponge,
};

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
  const geom = new THREE.Geometry();
  const material = new THREE.MeshPhongMaterial({ color: 0xaaaaaa });

  menger(geom, level, 0, 0, 0, 80, 80, 80);

  const mesh = new THREE.Mesh(geom, material);

  cubeContainer.remove(...cubeContainer.children);
  cubeContainer.add(mesh);
}

function increaseLevel() {
  if (level < MAX_LEVEL) {
    level++;
    generateMenger();
  }
}
function decreaseLevel() {
  if (level > MIN_LEVEL) {
    level--;
    generateMenger();
  }
}

function normalMengerSponge() {
  isNormalCube = !isNormalCube;
  generateMenger();
}

function init() {
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.set(0, 0, 200);
  camera.lookAt(0, 0, 0);

  scene = new THREE.Scene();
  let light = new THREE.HemisphereLight(0xffffff, 0x000088);
  light.position.set(-1, 1.5, 1);
  scene.add(light);

  light = new THREE.HemisphereLight(0xffffff, 0x880000, 0.5);
  light.position.set(-1, -1.5, -1);
  scene.add(light);

  if (showAxes) {
    const axesHelper = new THREE.AxesHelper(1000);
    scene.add(axesHelper);
  }

  cubeContainer = new THREE.Group();
  scene.add(cubeContainer);

  generateMenger();

  renderer = new THREE.WebGLRenderer({ antialias: true });
  // renderer.setClearColor(0xe6e6ee);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  new OrbitControls(camera, renderer.domElement);

  stats = new Stats();
  document.body.appendChild(stats.dom);

  const gui = new GUI();
  gui.add(params, "increaseLevel").name("Zwiększ poziom");
  gui.add(params, "decreaseLevel").name("Zmniejsz poziom");
  gui.add(params, "normal").name("Zmień rodzaj");

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

init();
animate();
