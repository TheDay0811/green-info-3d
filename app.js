import * as THREE from "three";

// =============================================================================
// 1. GREENHOUSE GEOMETRIC CONSTANTS (Exact 1:1 match to build_greenhouse.py)
// =============================================================================
const W = 6.0;
const L = 12.0;
const HALF_L = L / 2.0;
const H_SIDE = 2.0;
const H_PEAK = 3.6;
const H_ARCH = H_PEAK - H_SIDE; // 1.6m
const R_ARCH = H_ARCH / 2.0 + (W * W) / (8.0 * H_ARCH); // 3.6125m
const Z_CENTER = H_PEAK - R_ARCH; // -0.0125m
const PHI_MAX = Math.asin((W / 2.0) / R_ARCH);

// Helper: Blender (X, Y, Z) -> Three.js (X, Z, Y - HALF_L)
const toThree = (bx, by, bz) => new THREE.Vector3(bx, bz, by - HALF_L);

// Exact convex outward guide track equation from build_greenhouse.py
function getTrackPoint(u, offset, sideSign) {
  const rRoof = R_ARCH + offset;
  const xWall = W / 2.0 + offset;
  const zFStart = 1.82;
  const phiFEnd = THREE.MathUtils.degToRad(51.0);

  const p0x = xWall, p0z = zFStart;
  const p1x = xWall + 0.025, p1z = 2.06;
  const p2x = rRoof * Math.sin(phiFEnd);
  const p2z = Z_CENTER + rRoof * Math.cos(phiFEnd);

  const L1 = zFStart - 0.25;
  const L2 = Math.hypot(p2x - p0x, p2z - p0z) * 1.15;
  const L3 = rRoof * phiFEnd;

  if (u <= L1) {
    return [sideSign * xWall, 0.25 + u];
  } else if (u <= L1 + L2) {
    const t = (u - L1) / L2;
    const bx = (1 - t) ** 2 * p0x + 2 * (1 - t) * t * p1x + t ** 2 * p2x;
    const bz = (1 - t) ** 2 * p0z + 2 * (1 - t) * t * p1z + t ** 2 * p2z;
    return [sideSign * bx, bz];
  } else {
    const d = Math.min(u - (L1 + L2), L3);
    const phi = phiFEnd * (1.0 - d / L3);
    return [sideSign * rRoof * Math.sin(phi), Z_CENTER + rRoof * Math.cos(phi)];
  }
}

// =============================================================================
// 2. PROCEDURAL TEXTURES (Instant loading, zero external assets)
// =============================================================================
function makeSolarTexture(baseHex, lineHex) {
  const c = document.createElement("canvas");
  c.width = 256; c.height = 256;
  const ctx = c.getContext("2d");
  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 256, 256);

  // Subtle cell gradient shimmer
  const g = ctx.createLinearGradient(0, 0, 256, 256);
  g.addColorStop(0, "rgba(255,255,255,0.12)");
  g.addColorStop(0.5, "rgba(255,255,255,0.0)");
  g.addColorStop(1, "rgba(255,255,255,0.08)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = lineHex;
  ctx.lineWidth = 2;
  for (let i = 0; i <= 4; i++) {
    const p = i * 64;
    ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, 256); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(256, p); ctx.stroke();
  }
  ctx.lineWidth = 0.7;
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  for (let i = 0; i < 16; i++) {
    ctx.beginPath(); ctx.moveTo(i * 16, 0); ctx.lineTo(i * 16, 256); ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeMeshTexture() {
  const c = document.createElement("canvas");
  c.width = 128; c.height = 128;
  const ctx = c.getContext("2d");
  ctx.clearRect(0, 0, 128, 128);
  ctx.fillStyle = "rgba(241, 248, 245, 0.20)";
  ctx.fillRect(0, 0, 128, 128);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.42)";
  ctx.lineWidth = 1.5;
  for (let i = 0; i <= 128; i += 16) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 128); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(128, i); ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(28, 14);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeMelonTexture() {
  const c = document.createElement("canvas");
  c.width = 128; c.height = 128;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#6c8c42";
  ctx.fillRect(0, 0, 128, 128);
  ctx.strokeStyle = "#e2dbc5";
  ctx.lineWidth = 2;
  for (let i = 0; i < 42; i++) {
    const x = (i * 37) % 128;
    const y = (i * 53) % 128;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo((x + 28) % 128, (y + 19) % 128);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeSkyTexture() {
  const c = document.createElement("canvas");
  c.width = 32; c.height = 256;
  const ctx = c.getContext("2d");
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0.0, "#1d4ed8");
  g.addColorStop(0.35, "#38bdf8");
  g.addColorStop(0.68, "#bae6fd");
  g.addColorStop(0.84, "#fef3c7");
  g.addColorStop(1.0, "#ecfccb");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 32, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// =============================================================================
// 3. SCENE, RENDERER & LIGHTING
// =============================================================================
const wrap = document.getElementById("canvas-wrap");
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xdbeafe, 0.0085);

const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 220);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
wrap.appendChild(renderer.domElement);

// Sky Dome
const skyMat = new THREE.MeshBasicMaterial({ map: makeSkyTexture(), side: THREE.BackSide, fog: false });
const skyDome = new THREE.Mesh(new THREE.SphereGeometry(120, 24, 16), skyMat);
scene.add(skyDome);

// Lights
const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x3f6212, 0.88);
scene.add(hemiLight);

const sunLight = new THREE.DirectionalLight(0xfffbeb, 2.3);
sunLight.position.set(11, 15, -9);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(2048, 2048);
sunLight.shadow.camera.near = 2;
sunLight.shadow.camera.far = 45;
const d = 11;
sunLight.shadow.camera.left = -d;
sunLight.shadow.camera.right = d;
sunLight.shadow.camera.top = d;
sunLight.shadow.camera.bottom = -d;
sunLight.shadow.bias = -0.0008;
scene.add(sunLight);

// =============================================================================
// 4. ENVIRONMENT (Farm Ground, Pathway, Distant Trees & Hills)
// =============================================================================
const groundMesh = new THREE.Mesh(
  new THREE.CircleGeometry(110, 48),
  new THREE.MeshStandardMaterial({ color: 0x65a30d, roughness: 0.95 })
);
groundMesh.rotation.x = -Math.PI / 2;
groundMesh.receiveShadow = true;
scene.add(groundMesh);

// Farm concrete/earth pad under dome + approach path
const padMesh = new THREE.Mesh(
  new THREE.BoxGeometry(7.2, 0.04, 13.4),
  new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.9 })
);
padMesh.position.set(0, 0.015, 0);
padMesh.receiveShadow = true;
scene.add(padMesh);

const pathMesh = new THREE.Mesh(
  new THREE.BoxGeometry(1.4, 0.03, 12.0),
  new THREE.MeshStandardMaterial({ color: 0xa8a29e, roughness: 0.92 })
);
pathMesh.position.set(0, 0.012, -12.5);
pathMesh.receiveShadow = true;
scene.add(pathMesh);

// Decorative stylized countryside trees around the perimeter
const treeGroup = new THREE.Group();
const trunkGeo = new THREE.CylinderGeometry(0.14, 0.2, 1.8, 8);
const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
const crownGeo = new THREE.DodecahedronGeometry(1.3, 1);
const crownMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.85 });
const treeCoords = [
  [-10, -8], [-12, 0], [-11, 9], [10, -7], [12, 3], [11, 10], [-5, 13], [5, 13], [-16, -15], [16, -13]
];
const treeCrowns = [];
for (const [tx, tz] of treeCoords) {
  const tg = new THREE.Group();
  const tr = new THREE.Mesh(trunkGeo, trunkMat);
  tr.position.y = 0.9;
  const cr = new THREE.Mesh(crownGeo, crownMat);
  cr.position.y = 2.4;
  cr.scale.set(1.1, 1.25, 1.1);
  tg.add(tr, cr);
  tg.position.set(tx, 0, tz);
  tg.scale.setScalar(0.9 + ((Math.abs(tx * tz) % 7) * 0.08));
  treeGroup.add(tg);
  treeCrowns.push(cr);
}
scene.add(treeGroup);

// =============================================================================
// 5. GREEN INFO 3D DOME STRUCTURE
// =============================================================================
const domeGroup = new THREE.Group();
scene.add(domeGroup);

const steelMat = new THREE.MeshStandardMaterial({ color: 0xdbe4ee, metalness: 0.72, roughness: 0.32 });
const concMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.9 });
const meshMat = new THREE.MeshStandardMaterial({
  map: makeMeshTexture(),
  color: 0xf8fafc,
  transparent: true,
  opacity: 0.42,
  side: THREE.DoubleSide,
  depthWrite: false,
});

function addTubeBetween(p1, p2, r, mat, parent) {
  const dir = new THREE.Vector3().subVectors(p2, p1);
  const len = dir.length();
  if (len < 1e-4) return;
  const geo = new THREE.CylinderGeometry(r, r, len, 10);
  const m = new THREE.Mesh(geo, mat);
  m.position.copy(p1).add(p2).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  m.castShadow = true;
  parent.add(m);
}

// 9 Arch Frames (8 bays of 1.5m)
const bays = 8;
const archCurvePts = [];
for (let s = 0; s <= 24; s++) {
  const phi = -PHI_MAX + (2 * PHI_MAX * s) / 24;
  archCurvePts.push([R_ARCH * Math.sin(phi), Z_CENTER + R_ARCH * Math.cos(phi)]);
}

for (let i = 0; i <= bays; i++) {
  const by = (i * L) / bays;
  for (const sx of [-1, 1]) {
    const xCol = sx * (W / 2.0);
    // Concrete footing
    const ft = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.28, 12), concMat);
    ft.position.copy(toThree(xCol, by, 0.12));
    domeGroup.add(ft);

    // Side vertical column
    addTubeBetween(toThree(xCol, by, 0.0), toThree(xCol, by, H_SIDE), 0.022, steelMat, domeGroup);
  }
  // Curved arch segments
  for (let s = 0; s < archCurvePts.length - 1; s++) {
    const [x1, z1] = archCurvePts[s];
    const [x2, z2] = archCurvePts[s + 1];
    addTubeBetween(toThree(x1, by, z1), toThree(x2, by, z2), 0.022, steelMat, domeGroup);
  }
}

// Longitudinal purlins & side rails
for (const phi of [0, -PHI_MAX * 0.5, PHI_MAX * 0.5, -PHI_MAX, PHI_MAX]) {
  const px = R_ARCH * Math.sin(phi);
  const pz = Z_CENTER + R_ARCH * Math.cos(phi);
  addTubeBetween(toThree(px, 0, pz), toThree(px, L, pz), 0.016, steelMat, domeGroup);
}
addTubeBetween(toThree(-W / 2, 0, 0.2), toThree(-W / 2, L, 0.2), 0.016, steelMat, domeGroup);
addTubeBetween(toThree(W / 2, 0, 0.2), toThree(W / 2, L, 0.2), 0.016, steelMat, domeGroup);

// Front Sliding Door (1.2m x 2.0m — slid open to the left so user can walk inside!)
const doorW = 1.2, doorH = 2.0;
addTubeBetween(toThree(-doorW / 2, 0, 0), toThree(-doorW / 2, 0, doorH), 0.022, steelMat, domeGroup);
addTubeBetween(toThree(doorW / 2, 0, 0), toThree(doorW / 2, 0, doorH), 0.022, steelMat, domeGroup);
addTubeBetween(toThree(-W / 2, -0.05, doorH), toThree(W / 2, -0.05, doorH), 0.025, steelMat, domeGroup);

const doorLeaf = new THREE.Mesh(
  new THREE.BoxGeometry(doorW, doorH, 0.03),
  new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.4, roughness: 0.4, transparent: true, opacity: 0.72 })
);
doorLeaf.position.copy(toThree(-doorW * 1.05, -0.08, doorH / 2)); // Slid open!
domeGroup.add(doorLeaf);

// Semi-transparent 32-Mesh Cover Shell
{
  const ySteps = 16, phiSteps = 24;
  const verts = [], uvs = [], indices = [];
  for (let j = 0; j <= ySteps; j++) {
    const by = (j * L) / ySteps;
    const vCoord = j / ySteps;
    const rowPts = [[-W / 2, 0.2]];
    for (let i = 0; i <= phiSteps; i++) {
      const phi = -PHI_MAX + (2 * PHI_MAX * i) / phiSteps;
      rowPts.push([R_ARCH * Math.sin(phi), Z_CENTER + R_ARCH * Math.cos(phi)]);
    }
    rowPts.push([W / 2, 0.2]);
    for (let k = 0; k < rowPts.length; k++) {
      const pt = toThree(rowPts[k][0], by, rowPts[k][1]);
      verts.push(pt.x, pt.y, pt.z);
      uvs.push(k / (rowPts.length - 1), vCoord);
    }
  }
  const stride = phiSteps + 3;
  for (let j = 0; j < ySteps; j++) {
    for (let i = 0; i < stride - 1; i++) {
      const a = j * stride + i, b = a + 1, c = (j + 1) * stride + i + 1, d2 = (j + 1) * stride + i;
      indices.push(a, b, c, a, c, d2);
    }
  }
  const coverGeo = new THREE.BufferGeometry();
  coverGeo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  coverGeo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  coverGeo.setIndex(indices);
  coverGeo.computeVertexNormals();
  domeGroup.add(new THREE.Mesh(coverGeo, meshMat));
}

// Front & Rear End Mesh Panels (leaving doorway open at front!)
function addEndWall(x0, x1, by, z0, z1) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), meshMat);
  m.position.copy(toThree((x0 + x1) / 2, by, (z0 + z1) / 2));
  domeGroup.add(m);
}
addEndWall(-W / 2, -doorW / 2, 0, 0.2, H_SIDE);
addEndWall(doorW / 2, W / 2, 0, 0.2, H_SIDE);
addEndWall(-W / 2, W / 2, L, 0.2, H_SIDE);

// Visible Convex Guide Rails along bay ends (so user sees the rail track!)
const railMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.65, roughness: 0.3 });
for (const by of [0.5, 5.5, 6.5, 11.5]) {
  for (const sx of [-1, 1]) {
    const pts = [];
    for (let k = 0; k <= 36; k++) {
      const u = (5.15 * k) / 36;
      const [rx, rz] = getTrackPoint(u, 0.06, sx);
      pts.push(toThree(rx, by, rz));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const rMesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 32, 0.015, 6, false), railMat);
    domeGroup.add(rMesh);
  }
}

// =============================================================================
// 6. REAL-TIME TELESCOPIC CURVED SOLAR PANELS (8 sliding meshes)
// =============================================================================
const matSolarInner = new THREE.MeshStandardMaterial({
  map: makeSolarTexture("#0891b2", "#e0f2fe"),
  metalness: 0.72,
  roughness: 0.22,
  side: THREE.DoubleSide,
});
const matSolarOuter = new THREE.MeshStandardMaterial({
  map: makeSolarTexture("#1e3a8a", "#cbd5e1"),
  metalness: 0.78,
  roughness: 0.2,
  side: THREE.DoubleSide,
});

const slidingPanels = [];
const N_S = 18;
const PANEL_LEN = 1.50;

function createDynamicPanel(offset, uRest, uDeploy, sideSign, yS, yE, mat) {
  const geo = new THREE.BufferGeometry();
  const nVerts = 2 * (N_S + 1);
  const positions = new Float32Array(nVerts * 3);
  const uvs = new Float32Array(nVerts * 2);
  const indices = [];

  for (let i = 0; i <= N_S; i++) {
    uvs[i * 2] = 0; uvs[i * 2 + 1] = i / N_S;
    uvs[(N_S + 1 + i) * 2] = 1; uvs[(N_S + 1 + i) * 2 + 1] = i / N_S;
  }
  for (let i = 0; i < N_S; i++) {
    const a = i, b = i + 1, c = N_S + 1 + i + 1, d2 = N_S + 1 + i;
    indices.push(a, b, c, a, c, d2);
  }
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geo.setIndex(indices);

  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  domeGroup.add(mesh);

  const updateFn = (progress) => {
    const u0 = uRest + (uDeploy - uRest) * progress;
    const posArr = geo.attributes.position.array;
    for (let i = 0; i <= N_S; i++) {
      const u = u0 + (PANEL_LEN * i) / N_S;
      const [px, pz] = getTrackPoint(u, offset, sideSign);
      const v0 = toThree(px, yS, pz);
      const v1 = toThree(px, yE, pz);
      posArr[i * 3] = v0.x;
      posArr[i * 3 + 1] = v0.y;
      posArr[i * 3 + 2] = v0.z;
      const idx2 = (N_S + 1 + i) * 3;
      posArr[idx2] = v1.x;
      posArr[idx2 + 1] = v1.y;
      posArr[idx2 + 2] = v1.z;
    }
    geo.attributes.position.needsUpdate = true;
    geo.computeVertexNormals();
  };
  updateFn(1.0);
  slidingPanels.push(updateFn);
}

for (const [yS, yE] of [[0.5, 5.5], [6.5, 11.5]]) {
  for (const sSign of [1, -1]) {
    createDynamicPanel(0.08, 0.05, 2.05, sSign, yS, yE, matSolarInner);
    createDynamicPanel(0.135, 0.05, 3.65, sSign, yS, yE, matSolarOuter);
  }
}

// =============================================================================
// 7. INTERIOR CANTALOUPE CULTIVATION (4 rows x 21 plants = 84 via InstancedMesh!)
// =============================================================================
// Black weed-barrier beds
const bedMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
for (const [xs, xe] of [[-2.45, -0.75], [0.75, 2.45]]) {
  const bed = new THREE.Mesh(new THREE.BoxGeometry(xe - xs, 0.02, 10.4), bedMat);
  bed.position.copy(toThree((xs + xe) / 2, 6.0, 0.01));
  bed.receiveShadow = true;
  domeGroup.add(bed);
}

const rowXCoords = [-2.1, -1.1, 1.1, 2.1];
const pipeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
for (const rx of rowXCoords) {
  addTubeBetween(toThree(rx + 0.14, 0.9, 0.02), toThree(rx + 0.14, 11.1, 0.02), 0.012, pipeMat, domeGroup);
  addTubeBetween(toThree(rx, 0.0, 2.05), toThree(rx, 12.0, 2.05), 0.005, steelMat, domeGroup);
}

// Instanced 84 plants: Grow Bags, Stems, Leaves, Netted Cantaloupes!
const totalPlants = 4 * 21;
const bagInst = new THREE.InstancedMesh(
  new THREE.CylinderGeometry(0.11, 0.11, 0.25, 10),
  new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.45 }),
  totalPlants
);
bagInst.castShadow = true;
bagInst.receiveShadow = true;

const stemInst = new THREE.InstancedMesh(
  new THREE.CylinderGeometry(0.012, 0.016, 1.75, 6),
  new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.5 }),
  totalPlants
);

const melonInst = new THREE.InstancedMesh(
  new THREE.SphereGeometry(0.088, 12, 10),
  new THREE.MeshStandardMaterial({ map: makeMelonTexture(), roughness: 0.6 }),
  totalPlants
);
melonInst.castShadow = true;

// 6 leaves per plant = 504 instances!
const leafGeo = new THREE.ConeGeometry(0.11, 0.24, 3);
leafGeo.rotateX(Math.PI / 2);
const leafInst = new THREE.InstancedMesh(
  leafGeo,
  new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.45, side: THREE.DoubleSide }),
  totalPlants * 6
);

const dummy = new THREE.Object3D();
let pCounter = 0;
let lCounter = 0;
for (let r = 0; r < rowXCoords.length; r++) {
  const rx = rowXCoords[r];
  const inwardDir = r < 2 ? 1 : -1;
  for (let p = 0; p < 21; p++) {
    const by = 1.2 + p * ((10.8 - 1.2) / 20);
    const base = toThree(rx, by, 0);

    dummy.position.set(base.x, 0.125, base.z);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    bagInst.setMatrixAt(pCounter, dummy.matrix);

    dummy.position.set(base.x, 1.12, base.z);
    dummy.updateMatrix();
    stemInst.setMatrixAt(pCounter, dummy.matrix);

    // Fruit hanging nicely inward toward walkway
    dummy.position.set(base.x + inwardDir * 0.14, 0.88 + ((p % 3) - 1) * 0.04, base.z);
    dummy.scale.set(1, 1.1, 1);
    dummy.updateMatrix();
    melonInst.setMatrixAt(pCounter, dummy.matrix);

    for (let lf = 0; lf < 6; lf++) {
      const ang = lf * 2.399 + p * 0.7;
      dummy.position.set(base.x + Math.cos(ang) * 0.08, 0.45 + lf * 0.26, base.z + Math.sin(ang) * 0.08);
      dummy.rotation.set(0.35, ang, 0);
      dummy.scale.set(1.0, 0.25, 1.15);
      dummy.updateMatrix();
      leafInst.setMatrixAt(lCounter++, dummy.matrix);
    }
    pCounter++;
  }
}
domeGroup.add(bagInst, stemInst, melonInst, leafInst);

// =============================================================================
// 8. INTERACTIVE IOT HARDWARE PROPS INSIDE & OUTSIDE
// =============================================================================
// ESP32 Edge Controller Cabinet (front left inside)
const iotBox = new THREE.Mesh(
  new THREE.BoxGeometry(0.42, 0.56, 0.22),
  new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.3, roughness: 0.4 })
);
iotBox.position.copy(toThree(-2.55, 1.2, 1.25));
domeGroup.add(iotBox);
const iotLed = new THREE.Mesh(
  new THREE.SphereGeometry(0.035, 8, 8),
  new THREE.MeshBasicMaterial({ color: 0x22c55e })
);
iotLed.position.copy(toThree(-2.55, 1.32, 1.42));
domeGroup.add(iotLed);

// MPPT + Battery Box below cabinet
const battBox = new THREE.Mesh(
  new THREE.BoxGeometry(0.45, 0.32, 0.3),
  new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 })
);
battBox.position.copy(toThree(-2.55, 1.2, 0.45));
domeGroup.add(battBox);

// Anemometer Weather Mast (outside right corner)
addTubeBetween(toThree(3.5, 1.5, 0), toThree(3.5, 1.5, 2.7), 0.025, steelMat, domeGroup);
const anemoRotor = new THREE.Group();
anemoRotor.position.copy(toThree(3.5, 1.5, 2.75));
for (let k = 0; k < 3; k++) {
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, 0.02), steelMat);
  arm.rotation.y = (k * 2 * Math.PI) / 3;
  const cup = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
  cup.position.x = 0.16;
  arm.add(cup);
  anemoRotor.add(arm);
}
domeGroup.add(anemoRotor);

// Soil Sensor Probe in bed
const soilProbe = new THREE.Mesh(
  new THREE.CylinderGeometry(0.03, 0.02, 0.38, 8),
  new THREE.MeshStandardMaterial({ color: 0x0284c7 })
);
soilProbe.position.copy(toThree(-1.1, 3.2, 0.25));
domeGroup.add(soilProbe);

// 3D Rain Particles (Active only during Rainstorm / Typhoon weather presets)
const RAIN_COUNT = 900;
const rainGeo = new THREE.BufferGeometry();
const rainPos = new Float32Array(RAIN_COUNT * 6);
const rainSeeds = [];
for (let i = 0; i < RAIN_COUNT; i++) {
  const rx = (Math.random() - 0.5) * 28;
  const ry = Math.random() * 14;
  const rz = (Math.random() - 0.5) * 32;
  rainSeeds.push([rx, ry, rz, 0.45 + Math.random() * 0.4]);
}
rainGeo.setAttribute("position", new THREE.BufferAttribute(rainPos, 3));
const rainLines = new THREE.LineSegments(
  rainGeo,
  new THREE.LineBasicMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.65 })
);
rainLines.visible = false;
scene.add(rainLines);

// =============================================================================
// 9. VIEWPOINTS, HOTSPOTS & MODALS DATA
// =============================================================================
const VIEWPOINTS = [
  {
    id: "overview",
    name: "Toàn cảnh ngoài vòm",
    pos: new THREE.Vector3(8.8, 4.4, -10.8),
    lookAt: new THREE.Vector3(0.0, 1.4, -0.5),
    walk: false,
    narration: "Toàn cảnh nhà vòm nông điện Green Info kích thước 6 mét nhân 12 mét, gồm khung thép mạ kẽm và hệ thống pin mặt trời trượt lồng hai tầng.",
  },
  {
    id: "walk_entry",
    name: "Nhập vai đi bộ vào vườn",
    pos: new THREE.Vector3(0.0, 1.62, -7.1),
    lookAt: new THREE.Vector3(0.0, 1.52, 2.0),
    walk: true,
    narration: "Bạn đang đứng ngay trước cửa lùa nhà vòm. Hãy dùng bàn phím hoặc cần điều khiển trên màn hình để bước thẳng vào tham quan vườn dưa lưới.",
  },
  {
    id: "interior_melon",
    name: "Vườn dưa lưới bên trong",
    pos: new THREE.Vector3(0.0, 1.60, 0.2),
    lookAt: new THREE.Vector3(0.0, 1.35, 5.2),
    walk: true,
    narration: "Không gian bên trong với 4 luống dưa lưới 84 gốc trên giá thể xơ dừa, tưới nhỏ giọt theo hàng và lưới chắn côn trùng 32 mắt.",
  },
  {
    id: "solar_rail",
    name: "Cơ chế pin trượt lồng",
    pos: new THREE.Vector3(5.6, 3.0, -3.2),
    lookAt: new THREE.Vector3(2.2, 2.4, -2.5),
    walk: false,
    narration: "Cơ chế ray dẫn hướng lồi giúp hai tầng tấm pin cong trượt nhẹ từ vách đứng lên đỉnh mái vòm để che nắng đỉnh trưa và phát điện tự chủ.",
  },
  {
    id: "iot_hub",
    name: "Tủ điều khiển IoT & AI",
    pos: new THREE.Vector3(-0.6, 1.55, -2.6),
    lookAt: new THREE.Vector3(-2.5, 1.15, -4.8),
    walk: false,
    narration: "Tủ điều khiển biên sử dụng ESP32 tiêu thụ điện thấp, kết hợp ắc quy lưu trữ MPPT và các cảm biến vi khí hậu, tốc độ gió và dinh dưỡng đất.",
  },
];

const HOTSPOTS = [
  {
    id: "hs_solar",
    pos3d: toThree(1.4, 4.2, 3.55),
    label: "Tấm pin trượt lồng 2 tầng",
    badge: "ĐỔI MỚI CƠ KHÍ & NĂNG LƯỢNG",
    body: "Tấm pin cong chia 2 lớp lồng nhau (cách khung 8 cm và 13 cm), trượt từ vách hông lên đỉnh vòm khi nắng gắt >33°C hoặc mưa lớn, và thu gọn về vách khi nắng dịu hay gió bão.",
    specs: ["2 Khu điều khiển độc lập", "Động cơ DC 24V", "Mục tiêu hạ nhiệt 2–6°C"],
  },
  {
    id: "hs_mesh",
    pos3d: toThree(3.0, 2.6, 1.35),
    label: "Lưới chắn côn trùng 32 Mesh",
    badge: "BẢO VỆ DỊCH HẠI CƠ HỌC",
    body: "Bao quanh 100% vách nhà vòm bằng lưới 32 lỗ/inch vuông, giúp ngăn chặn hiệu quả bọ trĩ, rệp phấn và ruồi vàng xâm nhập mà vẫn thông gió tự nhiên.",
    specs: ["Ngăn sâu bọ cơ học", "Giảm thuốc BVTV", "Cửa lùa 1,2m × 2,0m"],
  },
  {
    id: "hs_melon",
    pos3d: toThree(1.1, 5.4, 1.15),
    label: "Canh tác dưa lưới nhỏ giọt",
    badge: "MÔ HÌNH PILOT NGẮN NGÀY",
    body: "84 gốc dưa lưới trồng trong túi giá thể xơ dừa sạch, tưới nhỏ giọt theo hàng. Chu kỳ 65–75 ngày giúp thu số liệu đối chứng sản lượng nhanh chóng.",
    specs: ["Ngưỡng tối ưu 25–33°C", "Tránh sốc nhiệt >38°C", "4 Luống × 21 gốc"],
  },
  {
    id: "hs_iot",
    pos3d: toThree(-2.55, 1.2, 1.55),
    label: "Tủ điều khiển biên AI & Fail-Safe",
    badge: "ĐIỀU KHIỂN THÔNG MINH",
    body: "Điều khiển lai 2 pha: Rule-Based theo ngưỡng sinh lý cây trồng ngay từ ngày đầu, kết hợp AI dự báo xu hướng nhiệt và lớp Fail-Safe ưu tiên ngắt khẩn cấp khi bão gió.",
    specs: ["ESP32 Low-Power IoT", "Cổng API mở (Enfarm/RYNAN/Nextfarm)", "1 Dashboard tiếng Việt"],
  },
  {
    id: "hs_wind",
    pos3d: toThree(3.5, 1.5, 2.85),
    label: "Trạm đo gió & Anemometer",
    badge: "AN TOÀN KHÍ ĐỘNG HỌC",
    body: "Liên tục đo tốc độ gió ngoài trời. Khi gió giật vượt ngưỡng an toàn, hệ thống lập tức bỏ qua lệnh che nắng và kéo toàn bộ pin thu gọn về vách đứng hạ tâm gió.",
    specs: ["Ưu tiên ngắt cứng Fail-Safe", "Giảm lực nâng mái", "Hoạt động 24/7"],
  },
  {
    id: "hs_soil",
    pos3d: toThree(-1.1, 3.2, 0.55),
    label: "Cảm biến dinh dưỡng đất & EC",
    badge: "KHẮC PHỤC THẤT THOÁT PHÂN BÓN",
    body: "Định hướng kết nối chuẩn API mở/RS485 đo N-P-K, pH, EC và độ ẩm giá thể theo thời gian thực nhằm khắc phục tình trạng thất thoát 50–60% phân bón truyền thống.",
    specs: ["7 chỉ số đất thời gian thực", "Chuẩn Modbus/REST API", "Tưới châm phân đúng liều"],
  },
];

// =============================================================================
// 10. CAMERA CONTROLLER (360° Drag Look + Fly-To + First-Person Walk + Joystick)
// =============================================================================
let currentViewIdx = 0;
let isWalkMode = false;
let isAutoRotate = true;
let isAutoWalk = false;

let camPos = new THREE.Vector3().copy(VIEWPOINTS[0].pos);
let camYaw = 0;
let camPitch = 0;
let orbitTarget = new THREE.Vector3().copy(VIEWPOINTS[0].lookAt);
let orbitRadius = camPos.distanceTo(orbitTarget);

function syncYawPitchFromLookAt(pos, target) {
  const dir = new THREE.Vector3().subVectors(target, pos).normalize();
  camYaw = Math.atan2(-dir.x, -dir.z);
  camPitch = Math.asin(THREE.MathUtils.clamp(dir.y, -0.95, 0.95));
}
syncYawPitchFromLookAt(camPos, orbitTarget);

// Tween state
let tweenActive = false;
let tweenStart = 0;
let tweenDur = 900;
let twFromPos = new THREE.Vector3();
let twToPos = new THREE.Vector3();
let twFromTarget = new THREE.Vector3();
let twToTarget = new THREE.Vector3();
let twTargetWalk = false;

function flyToView(viewId) {
  const idx = VIEWPOINTS.findIndex((v) => v.id === viewId);
  if (idx === -1) return;
  currentViewIdx = idx;
  const vp = VIEWPOINTS[idx];

  twFromPos.copy(camera.position);
  twToPos.copy(vp.pos);
  // Compute current forward target for smooth interpolation
  const forward = new THREE.Vector3(
    -Math.sin(camYaw) * Math.cos(camPitch),
    Math.sin(camPitch),
    -Math.cos(camYaw) * Math.cos(camPitch)
  );
  twFromTarget.copy(camera.position).add(forward.multiplyScalar(4.0));
  twToTarget.copy(vp.lookAt);

  twTargetWalk = vp.walk;
  isWalkMode = vp.walk;
  tweenStart = performance.now();
  tweenActive = true;
  isAutoWalk = false;
  if (vp.walk) {
    isAutoRotate = false;
    document.getElementById("dock-autorotate").classList.remove("active");
    if (window.innerWidth <= 860) {
      document.getElementById("weather-panel").classList.add("hidden");
    }
  }
  updateWalkUI();

  // Highlight active nav item
  document.querySelectorAll(".nav-item[data-view]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === viewId);
  });
}

// Drag Look-around (Mouse + Touch)
let isDragging = false;
let lastX = 0, lastY = 0;

renderer.domElement.addEventListener("pointerdown", (e) => {
  isDragging = true;
  lastX = e.clientX;
  lastY = e.clientY;
  isAutoRotate = false;
  document.getElementById("dock-autorotate").classList.remove("active");
});

window.addEventListener("pointermove", (e) => {
  if (!isDragging || tweenActive) return;
  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;
  lastX = e.clientX;
  lastY = e.clientY;

  const sens = isWalkMode ? 0.0038 : 0.0052;
  camYaw += dx * sens * (isWalkMode ? 1 : -1);
  camPitch = THREE.MathUtils.clamp(camPitch + dy * sens * (isWalkMode ? 1 : -1), -1.15, 1.15);
  if (!isWalkMode) {
    // Recompute camera position orbiting around orbitTarget
    const dist = camPos.distanceTo(orbitTarget);
    const dir = new THREE.Vector3(
      -Math.sin(camYaw) * Math.cos(camPitch),
      Math.sin(camPitch),
      -Math.cos(camYaw) * Math.cos(camPitch)
    );
    camPos.copy(orbitTarget).sub(dir.multiplyScalar(dist));
    camPos.y = Math.max(0.4, camPos.y);
  }
});

window.addEventListener("pointerup", () => { isDragging = false; });

renderer.domElement.addEventListener("wheel", (e) => {
  if (isWalkMode || tweenActive) return;
  e.preventDefault();
  const dir = new THREE.Vector3().subVectors(camPos, orbitTarget);
  const dist = THREE.MathUtils.clamp(dir.length() + e.deltaY * 0.01, 2.5, 24.0);
  camPos.copy(orbitTarget).add(dir.normalize().multiplyScalar(dist));
}, { passive: false });

// Keyboard WASD / Arrow keys
const keys = {};
window.addEventListener("keydown", (e) => { keys[e.code] = true; });
window.addEventListener("keyup", (e) => { keys[e.code] = false; });

// Mobile Touch Virtual Joystick
let joyX = 0, joyY = 0;
const joyBase = document.getElementById("joystick-base");
const joyKnob = document.getElementById("joystick-knob");
let joyActive = false;

function handleJoy(clientX, clientY) {
  const rect = joyBase.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  let dx = clientX - cx;
  let dy = clientY - cy;
  const maxR = 34;
  const dist = Math.hypot(dx, dy);
  if (dist > maxR) {
    dx = (dx / dist) * maxR;
    dy = (dy / dist) * maxR;
  }
  joyKnob.style.left = `${28 + dx}px`;
  joyKnob.style.top = `${28 + dy}px`;
  joyX = dx / maxR;
  joyY = -dy / maxR;
}

joyBase.addEventListener("pointerdown", (e) => {
  e.stopPropagation();
  joyActive = true;
  joyBase.setPointerCapture(e.pointerId);
  handleJoy(e.clientX, e.clientY);
});
joyBase.addEventListener("pointermove", (e) => {
  if (!joyActive) return;
  e.stopPropagation();
  handleJoy(e.clientX, e.clientY);
});
joyBase.addEventListener("pointerup", (e) => {
  e.stopPropagation();
  joyActive = false;
  joyX = 0; joyY = 0;
  joyKnob.style.left = "28px";
  joyKnob.style.top = "28px";
});

// =============================================================================
// 11. SOLAR PANEL ANIMATION & WEATHER SIMULATION
// =============================================================================
let currentDeploy = 1.0;
let targetDeploy = 1.0;
let currentWeather = "morning";

function setWeather(mode) {
  currentWeather = mode;
  document.querySelectorAll(".wp-chip").forEach((c) => {
    c.classList.toggle("active", c.dataset.weather === mode);
  });

  if (mode === "morning") {
    targetDeploy = 0.0;
    rainLines.visible = false;
    sunLight.intensity = 2.0;
    sunLight.color.setHex(0xfffbeb);
    hemiLight.intensity = 0.92;
    scene.fog.color.setHex(0xdbeafe);
    updateTelemetry(28.5, 100, 8, 0.8, "Thu gọn vách (100% PAR)", "tele-ok");
  } else if (mode === "heatwave") {
    targetDeploy = 1.0;
    rainLines.visible = false;
    sunLight.intensity = 3.1;
    sunLight.color.setHex(0xffedd5);
    hemiLight.intensity = 0.88;
    scene.fog.color.setHex(0xfef3c7);
    updateTelemetry(34.2, 62, 6, 2.9, "Trượt phủ nóc (Hạ ~5°C)", "tele-warn");
  } else if (mode === "rainstorm") {
    targetDeploy = 1.0;
    rainLines.visible = true;
    sunLight.intensity = 1.05;
    sunLight.color.setHex(0xe2e8f0);
    hemiLight.intensity = 0.72;
    scene.fog.color.setHex(0xcbd5e1);
    updateTelemetry(26.0, 45, 22, 0.6, "Phủ mái che mưa dông", "tele-ok");
  } else if (mode === "typhoon") {
    targetDeploy = 0.0;
    rainLines.visible = true;
    sunLight.intensity = 0.9;
    sunLight.color.setHex(0xcbd5e1);
    hemiLight.intensity = 0.65;
    scene.fog.color.setHex(0x94a3b8);
    updateTelemetry(25.2, 40, 58, 0.3, "FAIL-SAFE: Thu gọn bão!", "tele-danger");
  }
  document.getElementById("solar-slider").value = Math.round(targetDeploy * 100);
  document.getElementById("solar-pct").textContent = `${Math.round(targetDeploy * 100)}%`;
}

function updateTelemetry(temp, par, wind, pv, modeTxt, modeCls) {
  document.getElementById("tele-temp").textContent = `${temp.toFixed(1)}°C`;
  document.getElementById("tele-par").textContent = `${par}%`;
  document.getElementById("tele-wind").textContent = `${wind} km/h`;
  document.getElementById("tele-pv").textContent = `${pv.toFixed(1)} kW`;
  const mEl = document.getElementById("tele-mode");
  mEl.textContent = modeTxt;
  mEl.className = `tele-val ${modeCls}`;
}

document.getElementById("solar-slider").addEventListener("input", (e) => {
  const val = Number(e.target.value);
  targetDeploy = val / 100.0;
  document.getElementById("solar-pct").textContent = `${val}%`;
  // Dynamically reflect shading trade-off
  const par = Math.round(100 - 38 * targetDeploy);
  const pv = 0.7 + 2.2 * targetDeploy;
  const temp = currentWeather === "heatwave" ? 39.6 - 5.4 * targetDeploy : 30.0 - 2.2 * targetDeploy;
  updateTelemetry(temp, par, currentWeather === "typhoon" ? 58 : 9, pv, val > 50 ? "Che phủ mái vòm" : "Thu gọn vách hông", val > 50 ? "tele-warn" : "tele-ok");
});

document.querySelectorAll(".wp-chip").forEach((btn) => {
  btn.addEventListener("click", () => setWeather(btn.dataset.weather));
});

// =============================================================================
// 12. HOTSPOT PROJECTION & INFO CARDS
// =============================================================================
const hotspotsLayer = document.getElementById("hotspots-layer");
const hsElements = HOTSPOTS.map((hs) => {
  const btn = document.createElement("button");
  btn.className = "hotspot-btn";
  btn.innerHTML = `<span class="hotspot-ring"></span><span class="hotspot-label">${hs.label}</span>`;
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    showInfoCard(hs.badge, hs.label, hs.body, hs.specs);
  });
  hotspotsLayer.appendChild(btn);
  return { hs, btn };
});

function showInfoCard(badge, title, body, specs = []) {
  document.getElementById("info-badge").textContent = badge;
  document.getElementById("info-title").textContent = title;
  document.getElementById("info-body").textContent = body;
  const spWrap = document.getElementById("info-specs");
  spWrap.innerHTML = specs.map((s) => `<span class="spec-tag">${s}</span>`).join("");
  document.getElementById("info-card").classList.remove("hidden");
}
document.getElementById("btn-close-info").addEventListener("click", () => {
  document.getElementById("info-card").classList.add("hidden");
});

function updateHotspotsProjection() {
  const w = window.innerWidth, h = window.innerHeight;
  const projVec = new THREE.Vector3();
  for (const { hs, btn } of hsElements) {
    projVec.copy(hs.pos3d).project(camera);
    if (projVec.z > 1.0 || projVec.z < -1.0) {
      btn.style.display = "none";
      continue;
    }
    const sx = (projVec.x * 0.5 + 0.5) * w;
    const sy = (-projVec.y * 0.5 + 0.5) * h;
    if (sx < 40 || sx > w - 40 || sy < 70 || sy > h - 85) {
      btn.style.display = "none";
    } else {
      btn.style.display = "flex";
      btn.style.left = `${sx}px`;
      btn.style.top = `${sy}px`;
    }
  }
}

// =============================================================================
// 13. UI CONTROLS, SIDEBAR, FLOORPLAN, VIDEO STORY & NARRATION
// =============================================================================
const sidebar = document.getElementById("sidebar");
const btnToggleSidebar = document.getElementById("btn-toggle-sidebar");
const btnMobileMenu = document.getElementById("btn-mobile-menu");

if (window.innerWidth <= 860) {
  sidebar.classList.add("collapsed");
}

btnToggleSidebar.addEventListener("click", () => {
  const collapsed = sidebar.classList.toggle("collapsed");
  btnToggleSidebar.textContent = collapsed ? "»" : "«";
});
btnMobileMenu.addEventListener("click", () => {
  sidebar.classList.toggle("collapsed");
});

function updateWalkUI() {
  document.getElementById("walk-hud").classList.toggle("hidden", !isWalkMode);
  document.getElementById("dock-walk").classList.toggle("active", isWalkMode);
  const autoBtn = document.getElementById("btn-auto-walk");
  autoBtn.classList.toggle("active", isAutoWalk);
  autoBtn.textContent = isAutoWalk ? "⏹ Dừng bước" : "▶ Tự bước vào vườn";
}

// Navigation items & quick buttons
document.querySelectorAll("[data-view]").forEach((el) => {
  el.addEventListener("click", () => {
    flyToView(el.dataset.view);
    document.getElementById("map-drawer").classList.add("hidden");
    if (window.innerWidth <= 860) sidebar.classList.add("collapsed");
  });
});

document.querySelectorAll("[data-action='toggle-map']").forEach((el) => {
  el.addEventListener("click", () => {
    document.getElementById("map-drawer").classList.toggle("hidden");
    if (window.innerWidth <= 860) sidebar.classList.add("collapsed");
  });
});
document.getElementById("btn-close-map").addEventListener("click", () => {
  document.getElementById("map-drawer").classList.add("hidden");
});

// Video Story Modal
const videoModal = document.getElementById("video-modal");
const storyVideo = document.getElementById("story-video");
function openVideoModal() {
  videoModal.classList.remove("hidden");
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  storyVideo.play().catch(() => {});
  if (window.innerWidth <= 860) sidebar.classList.add("collapsed");
}
document.querySelectorAll("[data-action='open-video'], #btn-open-video-top").forEach((el) => {
  el.addEventListener("click", openVideoModal);
});
document.getElementById("btn-close-video").addEventListener("click", () => {
  storyVideo.pause();
  videoModal.classList.add("hidden");
});

// Weather Panel Toggle
const weatherPanel = document.getElementById("weather-panel");
document.querySelectorAll("[data-action='toggle-weather-bar'], #btn-toggle-weather-top").forEach((el) => {
  el.addEventListener("click", () => {
    weatherPanel.classList.toggle("hidden");
    if (window.innerWidth <= 860) sidebar.classList.add("collapsed");
  });
});
document.getElementById("btn-close-wp").addEventListener("click", () => {
  weatherPanel.classList.add("hidden");
});

// Text Modals (Intro & Team)
const textModal = document.getElementById("text-modal");
document.querySelectorAll("[data-action='modal-intro']").forEach((el) => {
  el.addEventListener("click", () => {
    document.getElementById("tm-title").textContent = "GIỚI THIỆU DỰ ÁN GREEN INFO (VÒNG 2)";
    document.getElementById("tm-body").innerHTML = `
      <p><b>Green Info</b> là hệ thống nhà vòm nông điện thông minh (Agri-PV) tích hợp pin quang điện trượt lồng hai tầng và trí tuệ nhân tạo cho cây trồng giá trị cao (thử nghiệm với dưa lưới 65–75 ngày).</p>
      <h4>3 Đổi mới cốt lõi:</h4>
      <ul>
        <li><b>Cơ chế trượt lồng 2 tầng trên ray lồi:</b> Thu gọn sát vách hông khi nắng dịu để cây đón 100% ánh sáng quang hợp PAR (hoặc hạ tâm gió khi bão), trượt lên đỉnh mái khi nắng gắt 38–40°C hoặc mưa dông.</li>
        <li><b>Điều khiển lai (Rule-Based + Predictive AI) & Fail-Safe:</b> Chạy ổn định ngay từ ngày đầu mà không cần chờ dữ liệu lớn, ưu tiên ngắt an toàn khi có gió bão.</li>
        <li><b>Kiến trúc API mở (Open Agri-Hub):</b> Hợp nhất dữ liệu vi khí hậu, dinh dưỡng đất (NPK/EC) và sâu bệnh trên 1 Dashboard tiếng Việt duy nhất.</li>
      </ul>
      <p><i>Lưu ý: Các thông số nhiệt độ/PV hiển thị trên trang web là mô phỏng nguyên lý vận hành phục vụ trực quan hóa.</i></p>
    `;
    textModal.classList.remove("hidden");
  });
});

document.querySelectorAll("[data-action='modal-team']").forEach((el) => {
  el.addEventListener("click", () => {
    document.getElementById("tm-title").textContent = "ĐỘI THI HỆ SINH THÁI SỐ – HUFLIT 2026";
    document.getElementById("tm-body").innerHTML = `
      <p><b>Cuộc thi:</b> HUFLIT Innovation & Startup 2026 (Vòng 2 – Bảng Đổi Mới Sáng Tạo)</p>
      <h4>Thành viên đội thi:</h4>
      <ul>
        <li><b>Nguyễn Quốc Huy (Trưởng nhóm)</b> – 24DH113268 – Khoa Công Nghệ Thông Tin</li>
        <li><b>Trần Anh Như</b> – 26DH740846 – Khoa Ngoại Ngữ (Ngôn Ngữ Trung)</li>
        <li><b>Lâm Kim Yến</b> – 25DH140299 – Khoa Công Nghệ Thông Tin (Thương Mại Điện Tử)</li>
        <li><b>Nguyễn Ngọc Kỳ</b> – 24DH112710 – Khoa Công Nghệ Thông Tin</li>
        <li><b>Nguyễn Thành Đạt</b> – 24DH481577 – Khoa Quản Trị Kinh Doanh</li>
      </ul>
      <p><b>Liên hệ:</b> nqhuy08112006@gmail.com  •  0902637150</p>
    `;
    textModal.classList.remove("hidden");
  });
});
document.getElementById("btn-close-tm").addEventListener("click", () => textModal.classList.add("hidden"));

// Bottom 7-button dock wiring
document.getElementById("dock-prev").addEventListener("click", () => {
  const prev = (currentViewIdx - 1 + VIEWPOINTS.length) % VIEWPOINTS.length;
  flyToView(VIEWPOINTS[prev].id);
});
document.getElementById("dock-next").addEventListener("click", () => {
  const nxt = (currentViewIdx + 1) % VIEWPOINTS.length;
  flyToView(VIEWPOINTS[nxt].id);
});
document.getElementById("dock-walk").addEventListener("click", () => {
  isWalkMode = !isWalkMode;
  if (isWalkMode) {
    isAutoRotate = false;
    document.getElementById("dock-autorotate").classList.remove("active");
    if (camPos.y > 2.2) {
      flyToView("walk_entry");
      return;
    }
  } else {
    isAutoWalk = false;
    orbitTarget.copy(camPos).add(
      new THREE.Vector3(-Math.sin(camYaw), -0.1, -Math.cos(camYaw)).multiplyScalar(5.0)
    );
  }
  updateWalkUI();
});
document.getElementById("dock-autorotate").addEventListener("click", (e) => {
  isAutoRotate = !isAutoRotate;
  e.currentTarget.classList.toggle("active", isAutoRotate);
});
document.getElementById("dock-solar").addEventListener("click", () => {
  setWeather(targetDeploy > 0.5 ? "morning" : "heatwave");
});
document.getElementById("dock-fullscreen").addEventListener("click", () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
});
document.getElementById("dock-audio").addEventListener("click", (e) => {
  if (!("speechSynthesis" in window)) return;
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    e.currentTarget.classList.remove("active");
    return;
  }
  const vp = VIEWPOINTS[currentViewIdx];
  const u = new SpeechSynthesisUtterance(vp.narration);
  u.lang = "vi-VN";
  u.rate = 1.02;
  u.onend = () => document.getElementById("dock-audio").classList.remove("active");
  e.currentTarget.classList.add("active");
  window.speechSynthesis.speak(u);
});

document.getElementById("btn-auto-walk").addEventListener("click", () => {
  isAutoWalk = !isAutoWalk;
  updateWalkUI();
});

// =============================================================================
// 14. MAIN RENDER LOOP
// =============================================================================
// Initial preset: Bright morning -> smooth demo transition to overview
setWeather("morning");
setTimeout(() => setWeather("heatwave"), 1100);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  if (window.innerWidth <= 860) {
    sidebar.classList.add("collapsed");
    btnToggleSidebar.textContent = "»";
  }
});

let lastTime = performance.now();
function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;

  // 1. Smoothly animate telescopic solar panels toward targetDeploy
  if (Math.abs(currentDeploy - targetDeploy) > 0.001) {
    currentDeploy += (targetDeploy - currentDeploy) * Math.min(1, dt * 3.8);
    for (const fn of slidingPanels) fn(currentDeploy);
  }

  // 2. Anemometer spin & tree wind sway
  const windSpeed = currentWeather === "typhoon" ? 18.0 : currentWeather === "rainstorm" ? 8.0 : 2.2;
  anemoRotor.rotation.y += windSpeed * dt;
  const swayAmp = currentWeather === "typhoon" ? 0.09 : currentWeather === "rainstorm" ? 0.04 : 0.012;
  treeCrowns.forEach((cr, idx) => {
    cr.rotation.z = Math.sin(now * 0.0025 + idx) * swayAmp;
  });

  // 3. Rain particle animation
  if (rainLines.visible) {
    const pos = rainGeo.attributes.position.array;
    const windTilt = currentWeather === "typhoon" ? -0.45 : -0.15;
    const fallSpd = currentWeather === "typhoon" ? 24.0 : 16.0;
    for (let i = 0; i < RAIN_COUNT; i++) {
      const s = rainSeeds[i];
      s[1] -= fallSpd * s[3] * dt;
      s[0] += windTilt * fallSpd * dt;
      if (s[1] < 0.05) {
        s[1] = 13.5;
        s[0] = (Math.random() - 0.5) * 28;
      }
      const p = i * 6;
      pos[p] = s[0]; pos[p + 1] = s[1]; pos[p + 2] = s[2];
      pos[p + 3] = s[0] - windTilt * 0.45; pos[p + 4] = s[1] + 0.55; pos[p + 5] = s[2];
    }
    rainGeo.attributes.position.needsUpdate = true;
  }

  // 4. Camera Tween / Walk / Orbit Update
  camera.up.set(0, 1, 0);
  if (tweenActive) {
    const t = Math.min(1.0, (now - tweenStart) / tweenDur);
    const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    camPos.lerpVectors(twFromPos, twToPos, e);
    const curTarget = new THREE.Vector3().lerpVectors(twFromTarget, twToTarget, e);
    camera.position.copy(camPos);
    camera.lookAt(curTarget);
    syncYawPitchFromLookAt(camPos, curTarget);
    if (t >= 1.0) {
      tweenActive = false;
      isWalkMode = twTargetWalk;
      if (!isWalkMode) orbitTarget.copy(twToTarget);
      updateWalkUI();
    }
  } else if (isWalkMode) {
    // First-person walking movement
    let moveFwd = (keys["KeyW"] || keys["ArrowUp"] ? 1 : 0) - (keys["KeyS"] || keys["ArrowDown"] ? 1 : 0);
    let moveRight = (keys["KeyD"] || keys["ArrowRight"] ? 1 : 0) - (keys["KeyA"] || keys["ArrowLeft"] ? 1 : 0);
    if (Math.abs(joyY) > 0.1 || Math.abs(joyX) > 0.1) {
      moveFwd = joyY;
      moveRight = joyX;
    }
    if (isAutoWalk) moveFwd = 0.72;

    if (Math.abs(moveFwd) > 0.01 || Math.abs(moveRight) > 0.01) {
      const spd = 2.6 * dt;
      const fwdX = -Math.sin(camYaw);
      const fwdZ = -Math.cos(camYaw);
      const rightX = Math.cos(camYaw);
      const rightZ = -Math.sin(camYaw);
      camPos.x += (fwdX * moveFwd + rightX * moveRight) * spd;
      camPos.z += (fwdZ * moveFwd + rightZ * moveRight) * spd;
      // Keep cleanly in aisle when inside dome, or free outdoors
      camPos.z = THREE.MathUtils.clamp(camPos.z, -11.0, 5.2);
      if (camPos.z > -6.1) {
        camPos.x = THREE.MathUtils.clamp(camPos.x, -0.58, 0.58);
      } else {
        camPos.x = THREE.MathUtils.clamp(camPos.x, -8.0, 8.0);
      }
      camPos.y = 1.62;
      if (isAutoWalk && camPos.z >= 4.8) {
        isAutoWalk = false;
        updateWalkUI();
      }
    }
    camera.position.copy(camPos);
    const lookFwd = new THREE.Vector3(
      -Math.sin(camYaw) * Math.cos(camPitch),
      Math.sin(camPitch),
      -Math.cos(camYaw) * Math.cos(camPitch)
    );
    camera.lookAt(camPos.x + lookFwd.x, camPos.y + lookFwd.y, camPos.z + lookFwd.z);
  } else {
    if (isAutoRotate) {
      camYaw += 0.14 * dt;
      const dist = camPos.distanceTo(orbitTarget);
      const dir = new THREE.Vector3(
        -Math.sin(camYaw) * Math.cos(camPitch),
        Math.sin(camPitch),
        -Math.cos(camYaw) * Math.cos(camPitch)
      );
      camPos.copy(orbitTarget).sub(dir.multiplyScalar(dist));
    }
    camera.position.copy(camPos);
    camera.lookAt(orbitTarget);
  }

  updateHotspotsProjection();
  renderer.render(scene, camera);
}

// Hide loader cleanly once first frame renders
requestAnimationFrame((t) => {
  animate(t);
  const veil = document.getElementById("loader-veil");
  veil.classList.add("fade-out");
  setTimeout(() => veil.remove(), 500);
});
