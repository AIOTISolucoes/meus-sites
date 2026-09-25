/* d20 em WebGL (Three.js). A rolagem termina com a face sorteada virada para a
   câmera. Sem WebGL, o módulo não registra window.D20Die e o site segue só
   com o número (ver main.js). */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.min.js';

const scene = document.querySelector('[data-die-scene]');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

function makeAtlas() {
  const cell = 256; const cols = 5; const rows = 4;
  const canvas = document.createElement('canvas');
  canvas.width = cell * cols; canvas.height = cell * rows;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#f1e9d6';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const tri = [[.5, .93], [.07, .18], [.93, .18]]; // em UV (v para cima)
  for (let i = 0; i < 20; i += 1) {
    const cx = (i % cols) * cell; const cy = Math.floor(i / cols) * cell;
    const pts = tri.map(([u, v]) => [cx + u * cell, cy + (1 - v) * cell]);
    const grad = ctx.createLinearGradient(cx, cy, cx + cell, cy + cell);
    grad.addColorStop(0, '#f7f0df'); grad.addColorStop(1, '#dccdab');
    ctx.fillStyle = grad;
    ctx.beginPath(); pts.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fill();
    ctx.lineWidth = 10; ctx.strokeStyle = '#c7b48b'; ctx.stroke();
    const n = i + 1;
    ctx.fillStyle = n === 20 ? '#b4431f' : '#1f1812';
    ctx.font = `800 ${n === 20 ? 84 : 74}px "Grenze Gotisch", Georgia, serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const tx = cx + .5 * cell; const ty = cy + (1 - .43) * cell;
    ctx.fillText(String(n), tx, ty);
    if (n === 6 || n === 9) { ctx.fillRect(tx - 18, ty + 36, 36, 6); }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function buildDie(texture) {
  const geometry = new THREE.IcosahedronGeometry(1, 0).toNonIndexed();
  const uv = geometry.attributes.uv;
  const pos = geometry.attributes.position;
  const tri = [[.5, .93], [.07, .18], [.93, .18]];
  const normals = [];
  for (let face = 0; face < 20; face += 1) {
    const col = face % 5; const row = Math.floor(face / 5);
    for (let k = 0; k < 3; k += 1) {
      const [u, v] = tri[k];
      uv.setXY(face * 3 + k, (col + u) / 5, 1 - (row + (1 - v)) / 4);
    }
    const a = new THREE.Vector3().fromBufferAttribute(pos, face * 3);
    const b = new THREE.Vector3().fromBufferAttribute(pos, face * 3 + 1);
    const c = new THREE.Vector3().fromBufferAttribute(pos, face * 3 + 2);
    normals.push(a.add(b).add(c).normalize());
  }
  uv.needsUpdate = true;
  geometry.computeVertexNormals();
  const material = new THREE.MeshStandardMaterial({ map: texture, roughness: .38, metalness: .04, flatShading: true });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  return { mesh, normals };
}

function init() {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.className = 'die-canvas';
  renderer.domElement.setAttribute('aria-hidden', 'true');
  scene.prepend(renderer.domElement);
  scene.classList.add('webgl');

  const world = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, .1, 50);
  camera.position.set(0, 1.2, 6.2);
  camera.lookAt(0, .15, 0);

  world.add(new THREE.HemisphereLight(0xfff1d6, 0x3a2614, 1.1));
  const key = new THREE.DirectionalLight(0xffc27a, 2.6);
  key.position.set(-3, 5, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.radius = 6;
  world.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, .8);
  rim.position.set(4, 2, -3);
  world.add(rim);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.ShadowMaterial({ opacity: .28 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -1.05; floor.receiveShadow = true;
  world.add(floor);

  const { mesh, normals } = buildDie(makeAtlas());
  world.add(mesh);
  // Vista com a face 20 à frente, levemente inclinada.
  const toCamera = new THREE.Vector3(0, .19, 1).normalize();
  const faceQuat = (n, spin) => {
    const q = new THREE.Quaternion().setFromUnitVectors(normals[n - 1], toCamera);
    return new THREE.Quaternion().setFromAxisAngle(toCamera, spin).multiply(q);
  };
  mesh.quaternion.copy(faceQuat(20, .2));

  const resize = () => {
    const { width, height } = scene.getBoundingClientRect();
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(scene);
  resize();

  let visible = true; let rolling = null; let last = performance.now();
  const idleAxis = new THREE.Vector3(.3, 1, .1).normalize();
  const loop = now => {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (rolling) {
      const t = Math.min(1, (now - rolling.start) / rolling.duration);
      const e = 1 - Math.pow(1 - t, 3);
      const extra = new THREE.Quaternion().setFromAxisAngle(rolling.axis, (1 - e) * rolling.turns);
      mesh.quaternion.copy(rolling.from).slerp(rolling.to, e).premultiply(extra);
      mesh.position.y = Math.abs(Math.sin(t * Math.PI * 3)) * (1 - t) * .9;
      mesh.position.x = (1 - e) * rolling.dx;
      if (t >= 1) { const done = rolling.done; rolling = null; done(); }
    } else if (!reduce) {
      mesh.rotateOnWorldAxis(idleAxis, dt * .08);
      mesh.position.y = Math.sin(now / 900) * .04;
    }
    renderer.render(world, camera);
    if (visible) requestAnimationFrame(loop);
  };
  new IntersectionObserver(([entry]) => {
    const was = visible; visible = entry.isIntersecting;
    if (visible && !was) { last = performance.now(); requestAnimationFrame(loop); }
  }).observe(scene);
  requestAnimationFrame(loop);

  window.D20Die = {
    ready: true,
    roll(n) {
      const to = faceQuat(n, (Math.random() - .5) * .8);
      if (reduce) { mesh.quaternion.copy(to); return Promise.resolve(); }
      scene.classList.add('rolling');
      return new Promise(resolve => {
        rolling = {
          from: mesh.quaternion.clone(), to, start: performance.now(), duration: 1400,
          axis: new THREE.Vector3(Math.random() - .5, Math.random() - .5, Math.random() - .5).normalize(),
          turns: Math.PI * (5 + Math.random() * 2), dx: (Math.random() - .5) * 1.6,
          done: () => { scene.classList.remove('rolling'); resolve(); }
        };
      });
    }
  };
}

try {
  const probe = document.createElement('canvas');
  if (probe.getContext('webgl2') || probe.getContext('webgl')) {
    (document.fonts?.ready ?? Promise.resolve()).then(init);
  }
} catch (error) {
  console.warn('d20 3D indisponível:', error);
}
