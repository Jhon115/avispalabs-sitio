// ---------- panal 3D de fondo (Three.js) ----------
import * as THREE from "three";
const canvas = document.getElementById("panal3d");
const movil = innerWidth < 760;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: !movil, alpha: false, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, movil ? 1.5 : 2));
renderer.setClearColor(0x0A0805, 1);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x0A0805, 18, 42);
const camera = new THREE.PerspectiveCamera(45, 1, .1, 100);
camera.position.set(0, 0, 24);

// celdas hexagonales (prismas) en panal, punta arriba
const R = 1, COLS = movil ? 18 : 30, ROWS = movil ? 30 : 20;
const geo = new THREE.CylinderGeometry(R * .9, R * .9, .9, 6, 1);
geo.rotateX(Math.PI / 2);
const mat = new THREE.MeshStandardMaterial({ metalness: .65, roughness: .32 });
const N = COLS * ROWS;
const mesh = new THREE.InstancedMesh(geo, mat, N);
scene.add(mesh);
const base = [], azar = [];
const dx = Math.sqrt(3) * R, dy = 1.5 * R;
const c = new THREE.Color();
let k = 0;
for (let r = 0; r < ROWS; r++) for (let q = 0; q < COLS; q++) {
  const x = (q - COLS / 2) * dx + (r % 2) * dx / 2, y = (r - ROWS / 2) * dy;
  base.push([x, y]); const a = Math.random(); azar.push([a, Math.random(), Math.random()]);
  if (a > .9) c.set(0xFFC400); else if (a > .8) c.set(0xB8860B); else c.set(0x1C160C).lerp(new THREE.Color(0x2A2010), Math.random());
  mesh.setColorAt(k++, c);
}
mesh.instanceColor.needsUpdate = true;

// luces
scene.add(new THREE.AmbientLight(0xFFE7B0, .35));
const sol = new THREE.DirectionalLight(0xFFF1D0, 1.4); sol.position.set(-6, 10, 14); scene.add(sol);
const luzMouse = new THREE.PointLight(0xFFC400, 60, 18, 1.6); luzMouse.position.set(0, 0, 5); scene.add(luzMouse);
const luzFondo = new THREE.PointLight(0xFF8A00, 25, 30, 1.5); luzFondo.position.set(8, -6, 6); scene.add(luzFondo);

// mouse → punto sobre el plano del panal
const ray = new THREE.Raycaster(), plano = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), ndc = new THREE.Vector2(0, 0), objetivo = new THREE.Vector3(), punto = new THREE.Vector3(0, 0, 0);
let hayMouse = false;
addEventListener("pointermove", e => { ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); hayMouse = true; });

const tam = () => {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
};
tam(); addEventListener("resize", tam);

const m4 = new THREE.Matrix4(), pos = new THREE.Vector3(), quat = new THREE.Quaternion(), esc = new THREE.Vector3(1, 1, 1), eu = new THREE.Euler();
const reloj = new THREE.Clock();
let visible = true;
document.addEventListener("visibilitychange", () => visible = !document.hidden);
const animar = () => {
  requestAnimationFrame(animar);
  if (!visible) return;
  const t = reloj.getElapsedTime(), p = window.__scroll ? window.__scroll.p : 0;
  // sin mouse, una luz que pasea sola
  if (!hayMouse) ndc.set(Math.sin(t * .35) * .5, Math.cos(t * .27) * .35);
  ray.setFromCamera(ndc, camera); ray.ray.intersectPlane(plano, objetivo);
  punto.lerp(objetivo, .08);
  luzMouse.position.set(punto.x, punto.y, 4.5);
  for (let i = 0; i < N; i++) {
    const [x, y] = base[i], [a, b, cc] = azar[i];
    const d = Math.hypot(x - punto.x, y - punto.y);
    const ola = Math.sin(t * .9 - Math.hypot(x, y) * .32) * .35;
    const lev = Math.max(0, 1 - d / 4.2); const levanta = lev * lev * 2.4;
    // al bajar, el panal se desarma hacia la cámara
    const vuela = p * p * (4 + a * 14);
    pos.set(x + (b - .5) * p * 10, y + (cc - .5) * p * 10, ola + levanta + vuela);
    eu.set(lev * .5 * (y - punto.y) * -.25 + p * (b - .5) * 3, lev * .5 * (x - punto.x) * .25 + p * (cc - .5) * 3, p * (a - .5) * 2);
    quat.setFromEuler(eu);
    m4.compose(pos, quat, esc); mesh.setMatrixAt(i, m4);
  }
  mesh.instanceMatrix.needsUpdate = true;
  camera.position.x = Math.sin(t * .1) * 1.2 + ndc.x * 1.2;
  camera.position.y = Math.cos(t * .12) * .8 + ndc.y * .8 - p * 4;
  camera.position.z = 24 - p * 6;
  camera.lookAt(0, -p * 2, 0);
  scene.rotation.x = -.35 + p * .5;
  renderer.render(scene, camera);
};
animar();
