// ---------- panal 3D de fondo (Three.js) ----------
// Se ajusta solo a la potencia del equipo: si los cuadros van lentos, baja la resolución y no el diseño.
import * as THREE from "three";
const canvas = document.getElementById("panal3d");
const movil = innerWidth < 760;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: !movil, alpha: false, powerPreference: "high-performance" });
let calidad = Math.min(devicePixelRatio, movil ? 1.25 : 1.5);
renderer.setPixelRatio(calidad);
renderer.setClearColor(0x0A0805, 1);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x0A0805, 18, 42);
const camera = new THREE.PerspectiveCamera(45, 1, .1, 100);
camera.position.set(0, 0, 24);

// celdas hexagonales (prismas) en panal, punta arriba
const R = 1, COLS = movil ? 13 : 26, ROWS = movil ? 22 : 18;
const geo = new THREE.CylinderGeometry(R * .9, R * .9, .9, 6, 1);
geo.rotateX(Math.PI / 2);
const mat = movil ? new THREE.MeshPhongMaterial({ shininess: 70, specular: 0x665533 }) : new THREE.MeshStandardMaterial({ metalness: .65, roughness: .32 });
const N = COLS * ROWS;
const mesh = new THREE.InstancedMesh(geo, mat, N);
mesh.frustumCulled = false;
scene.add(mesh);
const baseX = new Float32Array(N), baseY = new Float32Array(N), azA = new Float32Array(N), azB = new Float32Array(N), azC = new Float32Array(N), distC = new Float32Array(N);
const dx = Math.sqrt(3) * R, dy = 1.5 * R;
const c = new THREE.Color(), oscuro = new THREE.Color(0x2A2010);
let k = 0;
for (let r = 0; r < ROWS; r++) for (let q = 0; q < COLS; q++) {
  const x = (q - COLS / 2) * dx + (r % 2) * dx / 2, y = (r - ROWS / 2) * dy, a = Math.random();
  baseX[k] = x; baseY[k] = y; azA[k] = a; azB[k] = Math.random(); azC[k] = Math.random(); distC[k] = Math.hypot(x, y);
  if (a > .9) c.set(0xFFC400); else if (a > .8) c.set(0xB8860B); else c.set(0x1C160C).lerp(oscuro, Math.random());
  mesh.setColorAt(k++, c);
}
mesh.instanceColor.needsUpdate = true;

// luces
scene.add(new THREE.AmbientLight(0xFFE7B0, movil ? .6 : .35));
const sol = new THREE.DirectionalLight(0xFFF1D0, 1.4); sol.position.set(-6, 10, 14); scene.add(sol);
const luzMouse = new THREE.PointLight(0xFFC400, 60, 18, 1.6); luzMouse.position.set(0, 0, 5); scene.add(luzMouse);
if (!movil) { const luzFondo = new THREE.PointLight(0xFF8A00, 25, 30, 1.5); luzFondo.position.set(8, -6, 6); scene.add(luzFondo); }

// mouse → punto sobre el plano del panal
const ray = new THREE.Raycaster(), plano = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), ndc = new THREE.Vector2(0, 0), objetivo = new THREE.Vector3(), punto = new THREE.Vector3(0, 0, 0);
let hayMouse = false;
addEventListener("pointermove", e => { ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); hayMouse = true; }, { passive: true });

let anchoPrev = 0;
const tam = () => {
  const w = innerWidth, h = innerHeight;
  // en celular la barra del navegador cambia el alto al deslizar: no redibujar por eso
  if (movil && w === anchoPrev) return;
  anchoPrev = w;
  renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
};
tam(); addEventListener("resize", tam);

const m4 = new THREE.Matrix4(), pos = new THREE.Vector3(), quat = new THREE.Quaternion(), esc = new THREE.Vector3(1, 1, 1), eu = new THREE.Euler();
const reloj = new THREE.Clock();

const pintar = () => {
  const t = reloj.getElapsedTime(), p = window.__scroll ? window.__scroll.p : 0;
  // sin mouse, una luz que pasea sola
  if (!hayMouse) ndc.set(Math.sin(t * .35) * .5, Math.cos(t * .27) * .35);
  ray.setFromCamera(ndc, camera); ray.ray.intersectPlane(plano, objetivo);
  punto.lerp(objetivo, .08);
  luzMouse.position.set(punto.x, punto.y, 4.5);
  for (let i = 0; i < N; i++) {
    const x = baseX[i], y = baseY[i], a = azA[i], b = azB[i], cc = azC[i];
    const d = Math.hypot(x - punto.x, y - punto.y);
    const ola = Math.sin(t * .9 - distC[i] * .32) * .35;
    const lev = Math.max(0, 1 - d / 4.2), levanta = lev * lev * 2.4;
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

// primer cuadro y aviso a la página de que el fondo ya está listo
pintar();
canvas.classList.add("listo");
window.__panalListo = true;
dispatchEvent(new Event("panal:listo"));

// Ciclo: máximo 60 cuadros en computador y 30 en celular. Debajo del inicio, donde casi no se ve, baja a 20.
let ultimo = 0, suma = 0, cuadros = 0;
const animar = ahora => {
  requestAnimationFrame(animar);
  if (document.hidden || window.__panalPausa) { ultimo = ahora; return; }
  const p = window.__scroll ? window.__scroll.p : 0;
  const intervalo = p > .98 ? 50 : (movil ? 33 : 0);
  const pasado = ahora - ultimo;
  if (pasado < intervalo - 2) return;
  ultimo = ahora;
  pintar();
  // calidad automática: si va lento, bajar resolución poco a poco
  if (p <= .98 && pasado < 300) {
    suma += pasado; cuadros++;
    if (cuadros >= 45) {
      const prom = suma / cuadros, meta = movil ? 42 : 24;
      suma = 0; cuadros = 0;
      if (prom > meta && calidad > .7) {
        calidad = Math.max(.7, calidad - .25);
        renderer.setPixelRatio(calidad);
      }
    }
  }
};
requestAnimationFrame(animar);
