import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from "three/examples/jsm/libs/dat.gui.module";

let renderer, camera, scene, stats;

// Create the menger sponge and center it (kind of) on the page
let parent;

let level = 0;
const MAX_LEVEL = 3;
const MIN_LEVEL = 0;

const params = {
  increaseLevel: increaseLevel,
  decreaseLevel: decreaseLevel,
};

function box(x, y, z, d) {
  var geometry = new THREE.BoxGeometry(d, d, d);
  var material = new THREE.MeshPhongMaterial({ color: 0xaaaaaa });
  var cube = new THREE.Mesh(geometry, material);

  cube.position.set(x, y, z);
  return cube;
}

function menger(n, x, y, z, d) {
  if (n === 0) {
    parent.add(box(x, y, z, d));
  } else {
    for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
        for (let k = -1; k < 2; k++) {
          if ((i * i + j * j) * (i * i + k * k) * (j * j + k * k) > 0) {
            const newD = d / 3;
            menger(n - 1, x + i * newD, y + j * newD, z + k * newD, newD);
          }
        }
      }
    }
  }
}

function regenerateMenger() {
  parent.remove(...parent.children);
  menger(level, 0, 0, 0, 80);
}

function increaseLevel() {
  if (level < MAX_LEVEL) {
    level++;
    regenerateMenger();
  }
}
function decreaseLevel() {
  if (level > MIN_LEVEL) {
    level--;
    regenerateMenger();
  }
}

function init() {
  // Setup
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.z = 200;
  camera.lookAt(0, 0, 0);

  scene = new THREE.Scene();
  let light = new THREE.HemisphereLight(0xffffff, 0x000088);
  light.position.set(-1, 1.5, 1);
  scene.add(light);

  light = new THREE.HemisphereLight(0xffffff, 0x880000, 0.5);
  light.position.set(-1, -1.5, -1);
  scene.add(light);

  parent = new THREE.Group();
  scene.add(parent);

  menger(level, 0, 0, 0, 80);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setClearColor(0xe6e6ee);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  new OrbitControls(camera, renderer.domElement);

  stats = new Stats();
  document.body.appendChild(stats.dom);

  const gui = new GUI();
  gui.add(params, "increaseLevel").name("Zwiększ poziom");
  gui.add(params, "decreaseLevel").name("Zmniejsz poziom");

  window.addEventListener("resize", onWindowsResize, false);
}

function animate() {
  requestAnimationFrame(animate);

  parent.rotation.x += 0.005;
  parent.rotation.y += 0.001;
  parent.rotation.z += 0.001;
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
