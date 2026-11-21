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
// 2. REALISTIC PBR & PHOTOREALISTIC TEXTURE SUITE (Local assets/textures)
// =============================================================================
const texLoader = new THREE.TextureLoader();

function loadTex(filename, repX = 1, repY = 1, isSRGB = true) {
  const tex = texLoader.load(`./assets/textures/${filename}`);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repX, repY);
  tex.anisotropy = 4;
  tex.colorSpace = isSRGB ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  return tex;
}

const texSolarInner = loadTex("solar_inner.jpg", 3, 2, true);
const texSolarOuter = loadTex("solar_outer.jpg", 3, 2, true);
const texMesh32 = loadTex("mesh_32.png", 64, 10, true);
const texMeshDoor = loadTex("mesh_32.png", 9, 14, true);
const texMeshGable = loadTex("mesh_32.png", 26, 8, true);
const texMelonSkin = loadTex("melon_skin.jpg", 1, 1, true);
const texMelonBump = loadTex("melon_bump.jpg", 1, 1, false);
const texMelonLeaf = loadTex("melon_leaf.png", 1, 1, true);
texMelonLeaf.wrapS = THREE.ClampToEdgeWrapping;
texMelonLeaf.wrapT = THREE.ClampToEdgeWrapping;
const texCocopeat = loadTex("cocopeat.jpg", 1, 1, true);
const texCocopeatBump = loadTex("cocopeat_bump.jpg", 1, 1, false);
const texGrowBag = loadTex("growbag.jpg", 1, 1, true);
const texGrowBagBump = loadTex("growbag_bump.jpg", 1, 1, false);
const texWeedMat = loadTex("weed_mat.jpg", 4, 24, true);
const texWeedMatBump = loadTex("weed_mat_bump.jpg", 4, 24, false);
const texConcrete = loadTex("concrete.jpg", 4, 7, true);
const texConcreteBump = loadTex("concrete_bump.jpg", 4, 7, false);
const texConcretePath = loadTex("concrete.jpg", 1, 6, true);
const texBasalt = loadTex("basalt_soil.jpg", 5, 8, true);
const texGrass = loadTex("grass_dalat.jpg", 36, 36, true);
const texGalvSteel = loadTex("galv_steel.jpg", 1, 3, true);
const texTankHdpe = loadTex("tank_hdpe.jpg", 2, 1, true);
const texIotPanel = loadTex("iot_panel.png", 1, 1, true);
texIotPanel.wrapS = THREE.ClampToEdgeWrapping;
texIotPanel.wrapT = THREE.ClampToEdgeWrapping;
const texPineBark = loadTex("pine_bark.jpg", 2, 2, true);
const texPineNeedles = loadTex("pine_needles.jpg", 3, 2, true);

function makeSkyTexture() {
  const c = document.createElement("canvas");
  c.width = 32; c.height = 256;
  const ctx = c.getContext("2d");
  // Crisp Da Lat highland blue-mint sky with soft morning valley haze
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0.0, "#1e40af");
  g.addColorStop(0.32, "#38bdf8");
  g.addColorStop(0.65, "#bae6fd");
  g.addColorStop(0.84, "#e0f2fe");
  g.addColorStop(1.0, "#fef3c7");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 32, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeSignTexture() {
  const c = document.createElement("canvas");
  c.width = 512; c.height = 192;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#14532d";
  ctx.fillRect(0, 0, 512, 192);
  ctx.strokeStyle = "#4ade80";
  ctx.lineWidth = 8;
  ctx.strokeRect(8, 8, 496, 176);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 46px Segoe UI, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("GREEN INFO", 256, 74);
  ctx.fillStyle = "#bae6fd";
  ctx.font = "bold 28px Segoe UI, Arial, sans-serif";
  ctx.fillText("PILOT ĐÀ LẠT (1.500 m)", 256, 122);
  ctx.fillStyle = "#dcfce7";
  ctx.font = "20px Segoe UI, Arial, sans-serif";
  ctx.fillText("NHÀ VÒM NÔNG ĐIỆN TRƯỢT LỒNG", 256, 158);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// =============================================================================
// 3. SCENE, RENDERER, PMREM ENVIRONMENT & LIGHTING
// =============================================================================
const wrap = document.getElementById("canvas-wrap");
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xe0f2fe, 0.010);

const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 240);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.06;
wrap.appendChild(renderer.domElement);

// Bake lightweight Da Lat sky-ground PMREM environment so steel, PE film, & solar glass reflect physically
{
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  envScene.add(new THREE.Mesh(new THREE.SphereGeometry(20, 16, 12), new THREE.MeshBasicMaterial({ map: makeSkyTexture(), side: THREE.BackSide })));
  const envGround = new THREE.Mesh(new THREE.CircleGeometry(18, 24), new THREE.MeshBasicMaterial({ color: 0x3f6212 }));
  envGround.rotation.x = -Math.PI / 2;
  envGround.position.y = -4;
  envScene.add(envGround);
  const envSun = new THREE.Mesh(new THREE.SphereGeometry(2.2, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfff7ed }));
  envSun.position.set(10, 14, -8);
  envScene.add(envSun);
  scene.environment = pmrem.fromScene(envScene, 0.04).texture;
  pmrem.dispose();
}

const skyMat = new THREE.MeshBasicMaterial({ map: makeSkyTexture(), side: THREE.BackSide, fog: false });
scene.add(new THREE.Mesh(new THREE.SphereGeometry(135, 24, 16), skyMat));

const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x3f6212, 0.85);
scene.add(hemiLight);

const sunLight = new THREE.DirectionalLight(0xfffbeb, 2.35);
sunLight.position.set(11, 16, -9);
sunLight.castShadow = true;
const shadowRes = window.innerWidth <= 860 ? 1024 : 2048;
sunLight.shadow.mapSize.set(shadowRes, shadowRes);
sunLight.shadow.camera.near = 2;
sunLight.shadow.camera.far = 48;
const sd = 11.5;
sunLight.shadow.camera.left = -sd;
sunLight.shadow.camera.right = sd;
sunLight.shadow.camera.top = sd;
sunLight.shadow.camera.bottom = -sd;
sunLight.shadow.bias = -0.0006;
scene.add(sunLight);

// =============================================================================
// 4. DA LAT HIGHLAND ENVIRONMENT (Basalt Terraces, Pine Trees, Mountain Ridges)
// =============================================================================
// Highland grassy meadow base with real foliage texture
const groundMesh = new THREE.Mesh(
  new THREE.CircleGeometry(125, 48),
  new THREE.MeshStandardMaterial({ map: texGrass, color: 0xd9f99d, roughness: 0.94, metalness: 0.0 })
);
groundMesh.rotation.x = -Math.PI / 2;
groundMesh.receiveShadow = true;
scene.add(groundMesh);

// Red volcanic basalt highland soil terrace surrounding the greenhouse pad
const basaltTerrace = new THREE.Mesh(
  new THREE.BoxGeometry(10.8, 0.03, 17.5),
  new THREE.MeshStandardMaterial({ map: texBasalt, bumpMap: texBasalt, bumpScale: 0.018, roughness: 0.95 })
);
basaltTerrace.position.set(0, 0.012, 0);
basaltTerrace.receiveShadow = true;
scene.add(basaltTerrace);

// Poured industrial concrete dome foundation pad & entry walkway
const padMesh = new THREE.Mesh(
  new THREE.BoxGeometry(7.0, 0.045, 13.2),
  new THREE.MeshStandardMaterial({ map: texConcrete, bumpMap: texConcreteBump, bumpScale: 0.008, roughness: 0.88 })
);
padMesh.position.set(0, 0.025, 0);
padMesh.receiveShadow = true;
scene.add(padMesh);

const pathMesh = new THREE.Mesh(
  new THREE.BoxGeometry(1.5, 0.035, 12.0),
  new THREE.MeshStandardMaterial({ map: texConcretePath, bumpMap: texConcreteBump, bumpScale: 0.007, roughness: 0.90 })
);
pathMesh.position.set(0, 0.02, -12.5);
pathMesh.receiveShadow = true;
scene.add(pathMesh);

// Rolling Da Lat Mountain Ridges around 360° horizon
const mtnGroup = new THREE.Group();
const mtnMatNear = new THREE.MeshStandardMaterial({ map: texGrass, color: 0x166534, roughness: 0.95 });
const mtnMatFar = new THREE.MeshStandardMaterial({ color: 0x1e3a5f, roughness: 0.95 });
for (let i = 0; i < 18; i++) {
  const ang = (i / 18) * Math.PI * 2;
  const rDist = 52 + (i % 3) * 14;
  const h = 11 + ((i * 7) % 10);
  const w = 20 + ((i * 5) % 12);
  const hill = new THREE.Mesh(new THREE.ConeGeometry(w, h, 8), i % 2 === 0 ? mtnMatNear : mtnMatFar);
  hill.position.set(Math.cos(ang) * rDist, h * 0.42, Math.sin(ang) * rDist);
  hill.scale.set(1.4, 1.0, 1.0);
  mtnGroup.add(hill);
}
scene.add(mtnGroup);

// Da Lat Three-Needle Pine Trees (Bark & Needle textures)
const pineGroup = new THREE.Group();
const trunkMat = new THREE.MeshStandardMaterial({ map: texPineBark, bumpMap: texPineBark, bumpScale: 0.02, roughness: 0.94 });
const pineLeafMat1 = new THREE.MeshStandardMaterial({ map: texPineNeedles, color: 0x15803d, roughness: 0.88 });
const pineLeafMat2 = new THREE.MeshStandardMaterial({ map: texPineNeedles, color: 0x166534, roughness: 0.90 });
const pineCoords = [
  [-9.5, -8.5], [-13.0, -2.0], [-11.0, 7.5], [-16.0, 12.0],
  [9.5, -7.5], [12.5, 2.0], [11.0, 9.5], [16.5, -13.0],
  [-6.5, 14.5], [6.5, 14.5], [-18.0, -14.0], [18.0, 13.0],
];
const pineCrowns = [];
for (let idx = 0; idx < pineCoords.length; idx++) {
  const [tx, tz] = pineCoords[idx];
  const pg = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.23, 2.3, 9), trunkMat);
  trunk.position.y = 1.15;
  trunk.castShadow = true;
  pg.add(trunk);

  const crownWrap = new THREE.Group();
  for (let tier = 0; tier < 4; tier++) {
    const r = 1.65 - tier * 0.30;
    const h = 1.85 - tier * 0.18;
    const cone = new THREE.Mesh(new THREE.ConeGeometry(r, h, 10), tier % 2 === 0 ? pineLeafMat1 : pineLeafMat2);
    cone.position.y = 2.05 + tier * 0.92;
    cone.rotation.y = tier * 0.6;
    cone.castShadow = true;
    crownWrap.add(cone);
  }
  pg.add(crownWrap);
  pg.position.set(tx, 0, tz);
  pg.scale.setScalar(0.85 + (idx % 4) * 0.14);
  pineGroup.add(pg);
  pineCrowns.push(crownWrap);
}
scene.add(pineGroup);

// =============================================================================
// 5. GREEN INFO 3D DOME STRUCTURE, FULL 32-MESH ENCLOSURE & RAINWATER TANK
// =============================================================================
const domeGroup = new THREE.Group();
scene.add(domeGroup);

const steelMat = new THREE.MeshStandardMaterial({
  map: texGalvSteel,
  color: 0xe2e8f0,
  metalness: 0.86,
  roughness: 0.28,
});
const clampMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.82, roughness: 0.35 });
const concMat = new THREE.MeshStandardMaterial({
  map: texConcrete,
  bumpMap: texConcreteBump,
  bumpScale: 0.01,
  roughness: 0.92,
});
const skirtMat = new THREE.MeshStandardMaterial({
  color: 0xe2e8f0,
  roughness: 0.42,
  metalness: 0.08,
  side: THREE.DoubleSide,
});
const meshMat = new THREE.MeshStandardMaterial({
  map: texMesh32,
  color: 0xffffff,
  transparent: true,
  opacity: 0.86,
  alphaTest: 0.04,
  roughness: 0.55,
  side: THREE.DoubleSide,
  depthWrite: false,
});
const meshDoorMat = new THREE.MeshStandardMaterial({
  map: texMeshDoor,
  color: 0xffffff,
  transparent: true,
  opacity: 0.92,
  alphaTest: 0.04,
  roughness: 0.55,
  side: THREE.DoubleSide,
  depthWrite: false,
});
const meshGableMat = new THREE.MeshStandardMaterial({
  map: texMeshGable,
  color: 0xffffff,
  transparent: true,
  opacity: 0.88,
  alphaTest: 0.04,
  roughness: 0.55,
  side: THREE.DoubleSide,
  depthWrite: false,
});
// Clear UV Polyethylene (PE) Greenhouse Glazing Film over arched roof (waterproof rain-shedding roof)
const peRoofFilmMat = new THREE.MeshPhysicalMaterial({
  color: 0xe8f6ff,
  transparent: true,
  opacity: 0.24,
  roughness: 0.11,
  metalness: 0.0,
  clearcoat: 1.0,
  clearcoatRoughness: 0.06,
  reflectivity: 0.92,
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
    const ft = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.125, 0.26, 14), concMat);
    ft.position.copy(toThree(xCol, by, 0.12));
    ft.castShadow = true;
    ft.receiveShadow = true;
    domeGroup.add(ft);
    addTubeBetween(toThree(xCol, by, 0.0), toThree(xCol, by, H_SIDE), 0.023, steelMat, domeGroup);
    // Steel base collar + eave gusset clamp
    const clamp = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.06, 10), clampMat);
    clamp.position.copy(toThree(xCol, by, H_SIDE));
    domeGroup.add(clamp);
  }
  for (let s = 0; s < archCurvePts.length - 1; s++) {
    const [x1, z1] = archCurvePts[s];
    const [x2, z2] = archCurvePts[s + 1];
    addTubeBetween(toThree(x1, by, z1), toThree(x2, by, z2), 0.022, steelMat, domeGroup);
  }
}

for (const phi of [0, -PHI_MAX * 0.5, PHI_MAX * 0.5, -PHI_MAX, PHI_MAX]) {
  const px = R_ARCH * Math.sin(phi);
  const pz = Z_CENTER + R_ARCH * Math.cos(phi);
  addTubeBetween(toThree(px, 0, pz), toThree(px, L, pz), 0.016, steelMat, domeGroup);
}
addTubeBetween(toThree(-W / 2, 0, 0.2), toThree(-W / 2, L, 0.2), 0.016, steelMat, domeGroup);
addTubeBetween(toThree(W / 2, 0, 0.2), toThree(W / 2, L, 0.2), 0.016, steelMat, domeGroup);
// Front & Rear Horizontal Lintel Beams (Y=0 & Y=L at Z=H_SIDE) + Vertical Gable Mullions
addTubeBetween(toThree(-W / 2, 0, H_SIDE), toThree(W / 2, 0, H_SIDE), 0.022, steelMat, domeGroup);
addTubeBetween(toThree(-W / 2, L, H_SIDE), toThree(W / 2, L, H_SIDE), 0.022, steelMat, domeGroup);
for (const byEnd of [0, L]) {
  for (const mx of [-1.8, -0.6, 0.6, 1.8]) {
    const mzTop = Z_CENTER + Math.sqrt(Math.max(0.01, R_ARCH * R_ARCH - mx * mx));
    addTubeBetween(toThree(mx, byEnd, H_SIDE), toThree(mx, byEnd, mzTop), 0.014, steelMat, domeGroup);
  }
}

// Sky-Open Eave Rainwater Gutters (spanning x = ±2.84..3.00m, PE roof stops at ±2.84m -> rain falls straight into open trough; panels slide outside at x ≥ ±3.06m!)
const gutterMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.45, roughness: 0.28, side: THREE.DoubleSide });
function addOpenTopEaveGutter(sx) {
  const xIn = sx * 2.84;
  const xOut = sx * 2.995;
  const gx = (xIn + xOut) / 2.0;
  const wG = Math.abs(xOut - xIn); // 0.155 m wide open top trough
  const zBot = 1.94;
  const hIn = 0.275; // Inner wall seals flush up to PE arch at z = 2.215 m
  const hOut = 0.11; // Outer wall sits at z = 2.05 m (inside ±3.06m rail)
  const gLen = L - 0.10;
  const basePlate = new THREE.Mesh(new THREE.BoxGeometry(wG, 0.012, gLen), gutterMat);
  basePlate.position.copy(toThree(gx, gLen / 2, zBot));
  const innerLip = new THREE.Mesh(new THREE.BoxGeometry(0.012, hIn, gLen), gutterMat);
  innerLip.position.copy(toThree(xIn, gLen / 2, zBot + hIn / 2));
  const outerLock = new THREE.Mesh(new THREE.BoxGeometry(0.012, hOut, gLen), steelMat);
  outerLock.position.copy(toThree(xOut, gLen / 2, zBot + hOut / 2));
  domeGroup.add(basePlate, innerLip, outerLock);
}
addOpenTopEaveGutter(-1);
addOpenTopEaveGutter(1);

// Rear cross-collector & downspout at Y = 11.88m (safely BEHIND Khu 2 solar panels stopping at Y = 11.5m!)
addTubeBetween(toThree(2.92, 11.88, 1.93), toThree(-2.92, 11.88, 1.93), 0.028, gutterMat, domeGroup);

const tankMat = new THREE.MeshStandardMaterial({
  map: texTankHdpe,
  bumpMap: texTankHdpe,
  bumpScale: 0.015,
  roughness: 0.38,
  metalness: 0.08,
});
const rainTank = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.56, 1.38, 22), tankMat);
rainTank.position.copy(toThree(-3.9, 11.65, 0.72));
rainTank.castShadow = true;
rainTank.receiveShadow = true;
domeGroup.add(rainTank);
const tankLid = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.07, 16), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 }));
tankLid.position.copy(toThree(-3.9, 11.65, 1.43));
domeGroup.add(tankLid);
addTubeBetween(toThree(-2.92, 11.88, 1.93), toThree(-3.9, 11.65, 1.38), 0.032, gutterMat, domeGroup);
addTubeBetween(toThree(-3.9, 11.65, 0.14), toThree(-2.5, 11.2, 0.14), 0.022, new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 }), domeGroup);

// Entrance Signboard ("GREEN INFO - PILOT ĐÀ LẠT 1.500 m")
addTubeBetween(toThree(-2.1, -1.0, 0), toThree(-2.1, -1.0, 1.45), 0.025, steelMat, domeGroup);
const signBoard = new THREE.Mesh(
  new THREE.BoxGeometry(1.15, 0.44, 0.04),
  new THREE.MeshStandardMaterial({ map: makeSignTexture(), roughness: 0.38, metalness: 0.15 })
);
signBoard.position.copy(toThree(-2.1, -1.0, 1.32));
signBoard.rotation.y = 0.25;
domeGroup.add(signBoard);

// Front Framed 32-Mesh Sliding Door (auto-seals exterior & opens when user walks near doorway)
const doorW = 1.2, doorH = 2.0;
addTubeBetween(toThree(-doorW / 2, 0, 0), toThree(-doorW / 2, 0, doorH), 0.022, steelMat, domeGroup);
addTubeBetween(toThree(doorW / 2, 0, 0), toThree(doorW / 2, 0, doorH), 0.022, steelMat, domeGroup);
addTubeBetween(toThree(-W / 2, -0.055, doorH + 0.02), toThree(W / 2, -0.055, doorH + 0.02), 0.026, steelMat, domeGroup);

const doorGroup = new THREE.Group();
const doorCenterClosed = toThree(0, -0.06, doorH / 2);
doorGroup.position.copy(doorCenterClosed);
// Framed perimeter of sliding screen door + middle crossbar + handle
addTubeBetween(new THREE.Vector3(-doorW / 2 + 0.02, -doorH / 2 + 0.02, 0), new THREE.Vector3(doorW / 2 - 0.02, -doorH / 2 + 0.02, 0), 0.022, steelMat, doorGroup);
addTubeBetween(new THREE.Vector3(-doorW / 2 + 0.02, doorH / 2 - 0.02, 0), new THREE.Vector3(doorW / 2 - 0.02, doorH / 2 - 0.02, 0), 0.022, steelMat, doorGroup);
addTubeBetween(new THREE.Vector3(-doorW / 2 + 0.02, 0.0, 0), new THREE.Vector3(doorW / 2 - 0.02, 0.0, 0), 0.016, steelMat, doorGroup);
addTubeBetween(new THREE.Vector3(-doorW / 2 + 0.02, -doorH / 2, 0), new THREE.Vector3(-doorW / 2 + 0.02, doorH / 2, 0), 0.022, steelMat, doorGroup);
addTubeBetween(new THREE.Vector3(doorW / 2 - 0.02, -doorH / 2, 0), new THREE.Vector3(doorW / 2 - 0.02, doorH / 2, 0), 0.022, steelMat, doorGroup);
const doorScreenPanel = new THREE.Mesh(new THREE.PlaneGeometry(doorW - 0.06, doorH - 0.06), meshDoorMat);
doorGroup.add(doorScreenPanel);
const doorKick = new THREE.Mesh(new THREE.BoxGeometry(doorW - 0.06, 0.22, 0.015), skirtMat);
doorKick.position.y = -doorH / 2 + 0.12;
doorGroup.add(doorKick);
const doorHandle = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.18, 0.05), clampMat);
doorHandle.position.set(doorW / 2 - 0.10, -0.05, -0.02);
doorGroup.add(doorHandle);
domeGroup.add(doorGroup);

// Physically accurate Dalat Hybrid Cladding:
// 1) Vertical sidewalls (Z = 0.22..2.0m): 32-Mesh Insect Netting at x = ±3.00m
// 2) Curved vault roof PE film stops at x = ±2.84m (phiPeMax) with a vertical drip flange INTO the open gutter trough!
const PHI_PE_MAX = Math.asin(2.84 / R_ARCH);
for (const sx of [-1, 1]) {
  const swGeo = new THREE.PlaneGeometry(L, H_SIDE - 0.2);
  const swMesh = new THREE.Mesh(swGeo, meshMat);
  swMesh.position.copy(toThree(sx * (W / 2.0), L / 2.0, (0.2 + H_SIDE) / 2.0));
  swMesh.rotation.y = sx > 0 ? -Math.PI / 2 : Math.PI / 2;
  domeGroup.add(swMesh);
}
{
  const ySteps = 16, phiSteps = 28;
  const roofVerts = [], roofUvs = [], roofIndices = [];
  for (let j = 0; j <= ySteps; j++) {
    const by = (j * L) / ySteps;
    const vCoord = j / ySteps;
    // PE edge drops neatly into the open gutter trough (x = ±2.85m, z = 2.06m) -> NEVER covers top of gutter!
    const rowPts = [[-2.85, 2.06]];
    for (let i = 0; i <= phiSteps; i++) {
      const phi = -PHI_PE_MAX + (2 * PHI_PE_MAX * i) / phiSteps;
      rowPts.push([R_ARCH * Math.sin(phi), Z_CENTER + R_ARCH * Math.cos(phi) + 0.008]);
    }
    rowPts.push([2.85, 2.06]);
    for (let k = 0; k < rowPts.length; k++) {
      const pt = toThree(rowPts[k][0], by, rowPts[k][1]);
      roofVerts.push(pt.x, pt.y, pt.z);
      roofUvs.push(k / (rowPts.length - 1), vCoord);
    }
  }
  const rStride = phiSteps + 3;
  for (let j = 0; j < ySteps; j++) {
    for (let i = 0; i < rStride - 1; i++) {
      const a = j * rStride + i, b = a + 1, c = (j + 1) * rStride + i + 1, d2 = (j + 1) * rStride + i;
      roofIndices.push(a, b, c, a, c, d2);
    }
  }
  const roofFilmGeo = new THREE.BufferGeometry();
  roofFilmGeo.setAttribute("position", new THREE.Float32BufferAttribute(roofVerts, 3));
  roofFilmGeo.setAttribute("uv", new THREE.Float32BufferAttribute(roofUvs, 2));
  roofFilmGeo.setIndex(roofIndices);
  roofFilmGeo.computeVertexNormals();
  domeGroup.add(new THREE.Mesh(roofFilmGeo, peRoofFilmMat));
}

// Seal bottom ground perimeter skirt (Z = 0.02..0.22m) so zero insect gap under frame
function addGroundSkirt(pA, pB) {
  const len = pA.distanceTo(pB);
  const sk = new THREE.Mesh(new THREE.PlaneGeometry(len, 0.21), skirtMat);
  sk.position.copy(pA).add(pB).multiplyScalar(0.5);
  sk.position.y = 0.125;
  const ang = Math.atan2(pB.x - pA.x, pB.z - pA.z);
  sk.rotation.y = ang + Math.PI / 2;
  domeGroup.add(sk);
}
addGroundSkirt(toThree(-W / 2, 0, 0), toThree(-W / 2, L, 0));
addGroundSkirt(toThree(W / 2, 0, 0), toThree(W / 2, L, 0));
addGroundSkirt(toThree(-W / 2, L, 0), toThree(W / 2, L, 0));
addGroundSkirt(toThree(-W / 2, 0, 0), toThree(-doorW / 2, 0, 0));
addGroundSkirt(toThree(doorW / 2, 0, 0), toThree(W / 2, 0, 0));

// Front & Rear Vertical Walls + FULL CURVED ARCH GABLES (Z = H_SIDE .. H_PEAK, fixing open gables!)
function addEndWall(x0, x1, by, z0, z1) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), meshGableMat);
  m.position.copy(toThree((x0 + x1) / 2, by, (z0 + z1) / 2));
  domeGroup.add(m);
}
addEndWall(-W / 2, -doorW / 2, 0, 0.2, H_SIDE);
addEndWall(doorW / 2, W / 2, 0, 0.2, H_SIDE);
addEndWall(-W / 2, W / 2, L, 0.2, H_SIDE);

function addArchGableMesh(by) {
  const segs = 28;
  const gVerts = [], gUvs = [], gIdx = [];
  for (let i = 0; i <= segs; i++) {
    const phi = -PHI_MAX + (2 * PHI_MAX * i) / segs;
    const x = R_ARCH * Math.sin(phi);
    const zTop = Z_CENTER + R_ARCH * Math.cos(phi);
    const ptBot = toThree(x, by, H_SIDE);
    const ptTop = toThree(x, by, zTop);
    const u = (x + W / 2) / W;
    const vTop = (zTop - H_SIDE) / H_ARCH;
    gVerts.push(ptBot.x, ptBot.y, ptBot.z, ptTop.x, ptTop.y, ptTop.z);
    gUvs.push(u, 0, u, vTop);
  }
  for (let i = 0; i < segs; i++) {
    const a = i * 2, b = a + 1, c = a + 2, d2 = a + 3;
    gIdx.push(a, c, d2, a, d2, b);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(gVerts, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(gUvs, 2));
  geo.setIndex(gIdx);
  geo.computeVertexNormals();
  domeGroup.add(new THREE.Mesh(geo, meshGableMat));
  // Subtle PE clear roof sheen across gable edge
  domeGroup.add(new THREE.Mesh(geo, peRoofFilmMat));
}
addArchGableMesh(0.0);
addArchGableMesh(L);

// Visible Convex Anodized Guide Rails
const railMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85, roughness: 0.24 });
for (const by of [0.5, 5.5, 6.5, 11.5]) {
  for (const sx of [-1, 1]) {
    const pts = [];
    for (let k = 0; k <= 36; k++) {
      const u = (5.15 * k) / 36;
      const [rx, rz] = getTrackPoint(u, 0.06, sx);
      pts.push(toThree(rx, by, rz));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    domeGroup.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 32, 0.016, 8, false), railMat));
  }
}

// =============================================================================
// 6. REAL-TIME MONOCRYSTALLINE TELESCOPIC CURVED SOLAR PANELS
// =============================================================================
const matSolarInner = new THREE.MeshPhysicalMaterial({
  map: texSolarInner,
  metalness: 0.42,
  roughness: 0.16,
  clearcoat: 0.92,
  clearcoatRoughness: 0.08,
  reflectivity: 0.9,
  side: THREE.DoubleSide,
});
const matSolarOuter = new THREE.MeshPhysicalMaterial({
  map: texSolarOuter,
  metalness: 0.45,
  roughness: 0.14,
  clearcoat: 0.95,
  clearcoatRoughness: 0.07,
  reflectivity: 0.92,
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
  updateFn(0.0);
  slidingPanels.push(updateFn);
}

for (const [yS, yE] of [[0.5, 5.5], [6.5, 11.5]]) {
  for (const sSign of [1, -1]) {
    createDynamicPanel(0.08, 0.05, 2.05, sSign, yS, yE, matSolarInner);
    createDynamicPanel(0.135, 0.05, 3.65, sSign, yS, yE, matSolarOuter);
  }
}

// =============================================================================
// 7. INTERIOR CANTALOUPE CULTIVATION (Photorealistic Plants, Pots & Drip System)
// =============================================================================
const bedMat = new THREE.MeshStandardMaterial({
  map: texWeedMat,
  bumpMap: texWeedMatBump,
  bumpScale: 0.006,
  roughness: 0.80,
  metalness: 0.04,
});
for (const [xs, xe] of [[-2.45, -0.75], [0.75, 2.45]]) {
  const bed = new THREE.Mesh(new THREE.BoxGeometry(xe - xs, 0.02, 10.4), bedMat);
  bed.position.copy(toThree((xs + xe) / 2, 6.0, 0.012));
  bed.receiveShadow = true;
  domeGroup.add(bed);
}

const rowXCoords = [-2.1, -1.1, 1.1, 2.1];
const pipeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.35, metalness: 0.05 });
for (const rx of rowXCoords) {
  addTubeBetween(toThree(rx + 0.14, 0.9, 0.02), toThree(rx + 0.14, 11.1, 0.02), 0.012, pipeMat, domeGroup);
  addTubeBetween(toThree(rx, 0.0, 2.05), toThree(rx, 12.0, 2.05), 0.005, steelMat, domeGroup);
}
addTubeBetween(toThree(-2.2, 11.1, 0.02), toThree(2.2, 11.1, 0.02), 0.015, pipeMat, domeGroup);

// Contoured Lathe Grow Bag Geometry (tapered white/eco-stripe PE bag with rolled top cuff!)
const potProfile = [
  new THREE.Vector2(0.0, 0.0),
  new THREE.Vector2(0.105, 0.0),
  new THREE.Vector2(0.118, 0.22),
  new THREE.Vector2(0.125, 0.245),
  new THREE.Vector2(0.114, 0.252),
  new THREE.Vector2(0.110, 0.225),
];
const bagGeo = new THREE.LatheGeometry(potProfile, 18);

// Coco-peat coir substrate disk inside top of each grow bag
const soilDiskGeo = new THREE.CylinderGeometry(0.111, 0.111, 0.03, 14);

// Helical climbing melon vine stem geometry around central trellis cord
const vinePts = [];
for (let s = 0; s <= 24; s++) {
  const t = s / 24;
  const ang = t * 6.5 * Math.PI;
  vinePts.push(new THREE.Vector3(0.013 * Math.cos(ang), 0.24 + t * 1.74, 0.013 * Math.sin(ang)));
}
const vineGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(vinePts), 24, 0.0085, 6, false);

// Sculpted curved 3D Leaf Blade Quad for transparent 5-lobed cantaloupe cutout (melon_leaf.png)
function createCurvedLeafGeometry() {
  const g = new THREE.PlaneGeometry(0.28, 0.28, 4, 4);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const lx = pos.getX(i); // left-right across blade
    const ly = pos.getY(i) + 0.14; // 0 at petiole base -> 0.28 at leaf tip
    const uFrac = ly / 0.28;
    // Natural arched botanical droop + subtle midrib V-cup
    const zDrop = -0.095 * (uFrac * uFrac) + 0.022 * Math.sin(uFrac * Math.PI);
    const vCup = Math.abs(lx) * 0.14;
    pos.setY(i, ly);
    pos.setZ(i, zDrop + vCup);
  }
  g.computeVertexNormals();
  return g;
}

const totalPlants = 4 * 21;
const bagInst = new THREE.InstancedMesh(
  bagGeo,
  new THREE.MeshStandardMaterial({ map: texGrowBag, bumpMap: texGrowBagBump, bumpScale: 0.006, roughness: 0.42, metalness: 0.02 }),
  totalPlants
);
bagInst.castShadow = true;
bagInst.receiveShadow = true;

const soilInst = new THREE.InstancedMesh(
  soilDiskGeo,
  new THREE.MeshStandardMaterial({ map: texCocopeat, bumpMap: texCocopeatBump, bumpScale: 0.012, roughness: 0.94 }),
  totalPlants
);
soilInst.receiveShadow = true;

const dripGeo = new THREE.CylinderGeometry(0.004, 0.003, 0.12, 6);
const dripInst = new THREE.InstancedMesh(dripGeo, pipeMat, totalPlants);

const cordInst = new THREE.InstancedMesh(
  new THREE.CylinderGeometry(0.0022, 0.0022, 1.82, 5),
  new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.65 }),
  totalPlants
);

const stemInst = new THREE.InstancedMesh(
  vineGeo,
  new THREE.MeshStandardMaterial({ color: 0x2f853b, roughness: 0.62 }),
  totalPlants
);

const melonInst = new THREE.InstancedMesh(
  new THREE.SphereGeometry(0.092, 20, 16),
  new THREE.MeshStandardMaterial({
    map: texMelonSkin,
    bumpMap: texMelonBump,
    bumpScale: 0.010,
    roughness: 0.66,
    metalness: 0.02,
  }),
  totalPlants
);
melonInst.castShadow = true;
melonInst.receiveShadow = true;

const calyxInst = new THREE.InstancedMesh(
  new THREE.CylinderGeometry(0.006, 0.009, 0.07, 6),
  new THREE.MeshStandardMaterial({ color: 0x3f6212, roughness: 0.7 }),
  totalPlants
);

const leafInst = new THREE.InstancedMesh(
  createCurvedLeafGeometry(),
  new THREE.MeshStandardMaterial({
    map: texMelonLeaf,
    alphaTest: 0.35,
    roughness: 0.45,
    metalness: 0.02,
    side: THREE.DoubleSide,
  }),
  totalPlants * 9
);
leafInst.castShadow = true;

const dummy = new THREE.Object3D();
let pCounter = 0;
let lCounter = 0;
for (let r = 0; r < rowXCoords.length; r++) {
  const rx = rowXCoords[r];
  const inwardDir = r < 2 ? 1 : -1;
  for (let p = 0; p < 21; p++) {
    const by = 1.2 + p * ((10.8 - 1.2) / 20);
    const base = toThree(rx, by, 0);
    const varSpin = ((r * 7 + p * 13) % 11) * 0.55;

    dummy.position.set(base.x, 0.02, base.z);
    dummy.rotation.set(0, varSpin, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    bagInst.setMatrixAt(pCounter, dummy.matrix);

    dummy.position.set(base.x, 0.24, base.z);
    dummy.rotation.set(0, varSpin, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    soilInst.setMatrixAt(pCounter, dummy.matrix);

    dummy.position.set(base.x + inwardDir * 0.055, 0.27, base.z + 0.02);
    dummy.rotation.set(0.22, varSpin, -inwardDir * 0.18);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    dripInst.setMatrixAt(pCounter, dummy.matrix);

    dummy.position.set(base.x, 1.14, base.z);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    cordInst.setMatrixAt(pCounter, dummy.matrix);

    dummy.position.set(base.x, 0.0, base.z);
    dummy.rotation.set(0, varSpin, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    stemInst.setMatrixAt(pCounter, dummy.matrix);

    const fY = 0.88 + ((p % 3) - 1) * 0.045;
    const fx = base.x + inwardDir * 0.125;
    dummy.position.set(fx, fY, base.z);
    dummy.rotation.set(0.06, varSpin, 0);
    dummy.scale.set(1.0, 1.14, 1.0);
    dummy.updateMatrix();
    melonInst.setMatrixAt(pCounter, dummy.matrix);

    dummy.position.set(fx, fY + 0.105, base.z);
    dummy.rotation.set(0, varSpin, -inwardDir * 0.35);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    calyxInst.setMatrixAt(pCounter, dummy.matrix);

    for (let lf = 0; lf < 9; lf++) {
      const ang = lf * 2.39996 + p * 0.85 + r * 0.6;
      const fracH = lf / 8.0;
      const sc = (0.78 + 0.32 * Math.sin(fracH * Math.PI)) * (1.0 - 0.15 * fracH);
      dummy.position.set(base.x + Math.cos(ang) * 0.015, 0.38 + lf * 0.185, base.z + Math.sin(ang) * 0.015);
      // Orient plane outward from stem along phyllotaxis spiral angle and pitch outward (~55 deg)
      dummy.rotation.set(0, -ang + Math.PI / 2, 0);
      dummy.rotateX(0.92 + (lf % 2) * 0.18);
      dummy.scale.set(sc, sc, sc);
      dummy.updateMatrix();
      leafInst.setMatrixAt(lCounter++, dummy.matrix);
    }
    pCounter++;
  }
}
domeGroup.add(bagInst, soilInst, dripInst, cordInst, stemInst, melonInst, calyxInst, leafInst);

// =============================================================================
// 8. INTERACTIVE IOT HARDWARE PROPS (Industrial Enclosure, LiFePO4, Anemometer)
// =============================================================================
const iotBodyMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.35, roughness: 0.38 });
const iotFaceMat = new THREE.MeshStandardMaterial({ map: texIotPanel, roughness: 0.32, metalness: 0.12 });
const iotBox = new THREE.Mesh(
  new THREE.BoxGeometry(0.42, 0.56, 0.22),
  [iotBodyMat, iotBodyMat, iotBodyMat, iotBodyMat, iotFaceMat, iotFaceMat]
);
iotBox.position.copy(toThree(-2.55, 1.2, 1.25));
iotBox.rotation.y = Math.PI / 2;
iotBox.castShadow = true;
domeGroup.add(iotBox);

const iotLed = new THREE.Mesh(
  new THREE.SphereGeometry(0.025, 8, 8),
  new THREE.MeshBasicMaterial({ color: 0x22c55e })
);
iotLed.position.copy(toThree(-2.55, 1.2, 1.56));
domeGroup.add(iotLed);

const battBox = new THREE.Mesh(
  new THREE.BoxGeometry(0.46, 0.32, 0.30),
  new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.48, metalness: 0.25 })
);
battBox.position.copy(toThree(-2.55, 1.2, 0.45));
battBox.castShadow = true;
domeGroup.add(battBox);
addTubeBetween(toThree(-2.55, 1.2, 0.61), toThree(-2.55, 1.2, 0.97), 0.012, pipeMat, domeGroup);

addTubeBetween(toThree(3.5, 1.5, 0), toThree(3.5, 1.5, 2.7), 0.025, steelMat, domeGroup);
const anemoRotor = new THREE.Group();
anemoRotor.position.copy(toThree(3.5, 1.5, 2.75));
for (let k = 0; k < 3; k++) {
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, 0.02), steelMat);
  arm.rotation.y = (k * 2 * Math.PI) / 3;
  const cup = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.35 }));
  cup.position.x = 0.16;
  arm.add(cup);
  anemoRotor.add(arm);
}
domeGroup.add(anemoRotor);

const soilProbe = new THREE.Mesh(
  new THREE.CylinderGeometry(0.03, 0.022, 0.36, 10),
  new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.32, metalness: 0.2 })
);
soilProbe.position.copy(toThree(-1.1, 3.2, 0.29));
domeGroup.add(soilProbe);

// 3D Rain Particles
const RAIN_COUNT = 900;
const rainGeo = new THREE.BufferGeometry();
const rainPos = new Float32Array(RAIN_COUNT * 6);
const rainSeeds = [];
for (let i = 0; i < RAIN_COUNT; i++) {
  rainSeeds.push([(Math.random() - 0.5) * 28, Math.random() * 14, (Math.random() - 0.5) * 32, 0.45 + Math.random() * 0.4]);
}
rainGeo.setAttribute("position", new THREE.BufferAttribute(rainPos, 3));
const rainLines = new THREE.LineSegments(
  rainGeo,
  new THREE.LineBasicMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.65 })
);
rainLines.visible = false;
scene.add(rainLines);

// =============================================================================
// 9. VIEWPOINTS & HOTSPOTS (DA LAT HIGHLAND EDITION)
// =============================================================================
const VIEWPOINTS = [
  {
    id: "overview",
    name: "Toàn cảnh đồi Đà Lạt",
    pos: new THREE.Vector3(8.8, 4.4, -10.8),
    lookAt: new THREE.Vector3(0.0, 1.4, -0.5),
    walk: false,
    narration: "Toàn cảnh mô hình thí điểm Green Info tại cao nguyên Đà Lạt, kích thước 6 mét nhân 12 mét giữa thung lũng đồi thông, kết hợp máng thu nước mưa chống xói mòn.",
  },
  {
    id: "walk_entry",
    name: "Nhập vai đi bộ vào vườn",
    pos: new THREE.Vector3(0.0, 1.62, -7.1),
    lookAt: new THREE.Vector3(0.0, 1.52, 2.0),
    walk: true,
    narration: "Bạn đang đứng ngay trước cửa lùa mở sẵn. Dùng bàn phím hoặc cần điều khiển trên điện thoại để bước thẳng vào bên trong vườn dưa lưới.",
  },
  {
    id: "interior_melon",
    name: "Vườn dưa lưới bên trong",
    pos: new THREE.Vector3(0.0, 1.60, 0.2),
    lookAt: new THREE.Vector3(0.0, 1.35, 5.2),
    walk: true,
    narration: "Bên trong nhà vòm là 4 luống dưa lưới 84 gốc trồng trên giá thể xơ dừa sạch, tưới nhỏ giọt từ bồn nước mưa thu hồi.",
  },
  {
    id: "solar_rail",
    name: "Cơ chế pin trượt lồng",
    pos: new THREE.Vector3(5.6, 3.0, -3.2),
    lookAt: new THREE.Vector3(2.2, 2.4, -2.5),
    walk: false,
    narration: "Cơ chế ray dẫn hướng lồi giúp tấm pin cong trượt từ vách đứng lên đỉnh mái để hấp thụ bức xạ trưa nắng gắt ở Đà Lạt thành điện sạch và giảm tích nhiệt nhà kính.",
  },
  {
    id: "iot_hub",
    name: "Tủ điều khiển IoT & AI",
    pos: new THREE.Vector3(-0.6, 1.55, -2.6),
    lookAt: new THREE.Vector3(-2.5, 1.15, -4.8),
    walk: false,
    narration: "Tủ điều khiển biên IoT tiêu thụ điện thấp tích hợp ắc quy MPPT; định hướng thương mại hóa sẽ nâng cấp firmware bằng Rust để đạt độ an toàn Fail-Safe 24/7.",
  },
];

const HOTSPOTS = [
  {
    id: "hs_solar",
    num: 1,
    pos3d: toThree(1.4, 4.2, 3.55),
    label: "Tấm pin trượt lồng 2 tầng",
    badge: "ĐỔI MỚI CƠ KHÍ & HẠ BỨC XẠ ĐÀ LẠT",
    body: "Tấm pin cong 2 lớp trượt từ vách hông lên đỉnh vòm vào trưa bức xạ cao ở Đà Lạt, hấp thụ năng lượng mặt trời phát điện thay vì để nhà kính tích nhiệt gây hiệu ứng đảo nhiệt.",
    specs: ["Sáng sương 0% (100% PAR)", "Trưa nắng 100% (Giảm tích nhiệt)", "Động cơ DC 24V"],
  },
  {
    id: "hs_mesh",
    num: 2,
    pos3d: toThree(3.0, 2.6, 1.35),
    label: "Mái PE kín nước & Lưới 32 Mesh",
    badge: "VỎ LAI ĐÀ LẠT (PE + LƯỚI 32 MESH)",
    body: "Vòm mái trên lợp màng PE UV kín nước để ngăn mưa lạnh & dẫn nước về máng âm; toàn bộ vách hông, đầu hồi vòm và cửa lùa bọc lưới 32 mesh ngăn côn trùng và thông gió tự nhiên.",
    specs: ["Mái PE chống mưa & UV", "Vách & đầu hồi lưới 32 Mesh", "Chân vách PE kín nền"],
  },
  {
    id: "hs_melon",
    num: 3,
    pos3d: toThree(1.1, 5.4, 1.15),
    label: "Canh tác dưa lưới nhỏ giọt",
    badge: "MÔ HÌNH PILOT 65–75 NGÀY",
    body: "84 gốc dưa lưới trong túi giá thể xơ dừa sạch, tưới nhỏ giọt theo hàng. Tấm pin trượt che mưa đá/gió lạnh và điều tiết nhiệt độ ổn định quanh vùng tối ưu 25–33°C.",
    specs: ["4 Luống × 21 gốc", "Giá thể xơ dừa", "Chống mưa đá/sương muối"],
  },
  {
    id: "hs_iot",
    num: 4,
    pos3d: toThree(-2.55, 1.2, 1.55),
    label: "Tủ điều khiển biên AI & Fail-Safe",
    badge: "ĐIỀU KHIỂN LAI & LỘ TRÌNH RUST",
    body: "Giai đoạn đầu thử nghiệm dùng ESP32 Rule-Based + AI dự báo; giai đoạn thương mại hóa sẽ nâng cấp firmware bằng Rust (esp-rs/embassy) để đảm bảo an toàn bộ nhớ 24/7.",
    specs: ["ESP32 Low-Power IoT", "Nâng cấp Rust (GĐ sau)", "Open API Dashboard"],
  },
  {
    id: "hs_wind",
    num: 5,
    pos3d: toThree(3.5, 1.5, 2.85),
    label: "Trạm đo gió & Anemometer",
    badge: "AN TOÀN GIÓ LỐC CAO NGUYÊN",
    body: "Theo dõi liên tục tốc độ gió vùng đèo/thung lũng Đà Lạt. Khi gió giật vượt ngưỡng, lệnh Fail-Safe ưu tiên kéo toàn bộ pin thu gọn về vách đứng hạ tâm gió.",
    specs: ["Ưu tiên ngắt cứng Fail-Safe", "Giảm lực nâng mái", "Hoạt động 24/7"],
  },
  {
    id: "hs_soil",
    num: 6,
    pos3d: toThree(-1.1, 3.2, 0.55),
    label: "Cảm biến dinh dưỡng đất & EC",
    badge: "CHỐNG THẤT THOÁT PHÂN BÓN",
    body: "Định hướng kết nối chuẩn API mở/RS485 đo N-P-K, pH, EC và độ ẩm giá thể thời gian thực, khắc phục tình trạng thất thoát 50–60% phân bón truyền thống.",
    specs: ["7 chỉ số đất thời gian thực", "Chuẩn Modbus/REST API", "Tưới châm phân đúng liều"],
  },
  {
    id: "hs_rain",
    num: 7,
    pos3d: toThree(-3.9, 11.65, 1.45),
    label: "Máng xối hở trên chống va chạm pin",
    badge: "THU NƯỚC MƯA CHUẨN TRỌNG LỰC",
    body: "Màng PE mái vòm dừng tại x = ±2,84 m và rủ mép trực tiếp vào lòng máng xối hở trên (x = ±2,84–3,00 m), hứng trọn nước mưa từ mái PE và tấm pin mà vẫn nằm hoàn toàn bên trong ray trượt (6–13,5 cm).",
    specs: ["Mái PE dừng ở ±2,84 m", "Máng hở trên ±2,84–3,00 m", "0% va chạm ray trượt pin"],
  },
];

// =============================================================================
// 10. CAMERA CONTROLLER (360° Drag + Pinch-Zoom + Walk + Mobile Gyroscope!)
// =============================================================================
let currentViewIdx = 0;
let isWalkMode = false;
let isAutoRotate = true;
let isAutoWalk = false;
let isGyroEnabled = false;

let camPos = new THREE.Vector3().copy(VIEWPOINTS[0].pos);
let camYaw = 0;
let camPitch = 0;
let orbitTarget = new THREE.Vector3().copy(VIEWPOINTS[0].lookAt);

function syncYawPitchFromLookAt(pos, target) {
  const dir = new THREE.Vector3().subVectors(target, pos).normalize();
  camYaw = Math.atan2(-dir.x, -dir.z);
  camPitch = Math.asin(THREE.MathUtils.clamp(dir.y, -0.95, 0.95));
}
syncYawPitchFromLookAt(camPos, orbitTarget);
camera.position.copy(camPos);
camera.lookAt(orbitTarget);

let tweenActive = false;
let tweenStart = 0;
const tweenDur = 850;
const twFromPos = new THREE.Vector3();
const twToPos = new THREE.Vector3();
const twFromTarget = new THREE.Vector3();
const twToTarget = new THREE.Vector3();
let twTargetWalk = false;

function flyToView(viewId) {
  const idx = VIEWPOINTS.findIndex((v) => v.id === viewId);
  if (idx === -1) return;
  currentViewIdx = idx;
  const vp = VIEWPOINTS[idx];

  twFromPos.copy(camera.position);
  twToPos.copy(vp.pos);
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
  document.querySelectorAll(".nav-item[data-view]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === viewId);
  });
}

// Single-finger drag + Multi-touch Pinch-to-Zoom!
const activePointers = new Map();
let lastPinchDist = 0;
let lastX = 0, lastY = 0;

renderer.domElement.addEventListener("pointerdown", (e) => {
  activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (activePointers.size === 1) {
    lastX = e.clientX;
    lastY = e.clientY;
    isAutoRotate = false;
    document.getElementById("dock-autorotate").classList.remove("active");
  } else if (activePointers.size === 2) {
    const pts = Array.from(activePointers.values());
    lastPinchDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
  }
});

window.addEventListener("pointermove", (e) => {
  if (!activePointers.has(e.pointerId) || tweenActive) return;
  activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

  if (activePointers.size === 2 && !isWalkMode) {
    const pts = Array.from(activePointers.values());
    const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    const delta = lastPinchDist - dist;
    lastPinchDist = dist;
    const dir = new THREE.Vector3().subVectors(camPos, orbitTarget);
    const newLen = THREE.MathUtils.clamp(dir.length() + delta * 0.035, 2.5, 24.0);
    camPos.copy(orbitTarget).add(dir.normalize().multiplyScalar(newLen));
    return;
  }

  if (activePointers.size === 1) {
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    const sens = isWalkMode ? 0.0042 : 0.0052;
    camYaw += dx * sens * (isWalkMode ? 1 : -1);
    camPitch = THREE.MathUtils.clamp(camPitch + dy * sens * (isWalkMode ? 1 : -1), -1.15, 1.15);
    if (!isWalkMode) {
      const dist = camPos.distanceTo(orbitTarget);
      const dir = new THREE.Vector3(
        -Math.sin(camYaw) * Math.cos(camPitch),
        Math.sin(camPitch),
        -Math.cos(camYaw) * Math.cos(camPitch)
      );
      camPos.copy(orbitTarget).sub(dir.multiplyScalar(dist));
      camPos.y = Math.max(0.4, camPos.y);
    }
  }
});

function clearPointer(e) {
  activePointers.delete(e.pointerId);
  if (activePointers.size === 1) {
    const rem = Array.from(activePointers.values())[0];
    lastX = rem.x;
    lastY = rem.y;
  }
}
window.addEventListener("pointerup", clearPointer);
window.addEventListener("pointercancel", clearPointer);

renderer.domElement.addEventListener("wheel", (e) => {
  if (isWalkMode || tweenActive) return;
  e.preventDefault();
  const dir = new THREE.Vector3().subVectors(camPos, orbitTarget);
  const dist = THREE.MathUtils.clamp(dir.length() + e.deltaY * 0.01, 2.5, 24.0);
  camPos.copy(orbitTarget).add(dir.normalize().multiplyScalar(dist));
}, { passive: false });

const keys = {};
window.addEventListener("keydown", (e) => { keys[e.code] = true; });
window.addEventListener("keyup", (e) => { keys[e.code] = false; });

// Mobile Virtual Joystick
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

// Mobile Gyroscope Tilt-to-Look
let gyroBaseAlpha = null;
function onDeviceOrientation(e) {
  if (!isGyroEnabled || !isWalkMode || e.alpha == null || e.beta == null) return;
  if (gyroBaseAlpha === null) gyroBaseAlpha = e.alpha;
  const dAlpha = THREE.MathUtils.degToRad(e.alpha - gyroBaseAlpha);
  const pitchDeg = THREE.MathUtils.clamp(e.beta - 75, -45, 45);
  camYaw = dAlpha + Math.PI; // Facing into dome
  camPitch = THREE.MathUtils.degToRad(pitchDeg);
}
window.addEventListener("deviceorientation", onDeviceOrientation);

document.getElementById("btn-gyro").addEventListener("click", async (e) => {
  if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
    try {
      const perm = await DeviceOrientationEvent.requestPermission();
      if (perm !== "granted") return;
    } catch (_) {
      return;
    }
  }
  isGyroEnabled = !isGyroEnabled;
  gyroBaseAlpha = null;
  e.currentTarget.classList.toggle("active", isGyroEnabled);
});

// =============================================================================
// 11. SOLAR PANEL ANIMATION & DA LAT WEATHER SIMULATION
// =============================================================================
let currentDeploy = 0.0;
let targetDeploy = 0.0;
let currentWeather = "morning";

function setWeather(mode) {
  currentWeather = mode;
  document.querySelectorAll(".wp-chip").forEach((c) => {
    c.classList.toggle("active", c.dataset.weather === mode);
  });

  if (mode === "morning") {
    targetDeploy = 0.0;
    rainLines.visible = false;
    sunLight.intensity = 1.95;
    sunLight.color.setHex(0xfffbeb);
    hemiLight.intensity = 0.95;
    scene.fog.color.setHex(0xe0f2fe);
    scene.fog.density = 0.013; // Soft Da Lat morning mist
    updateTelemetry(19.5, 100, 9, 0.8, "Thu gọn (Đón nắng sớm)", "tele-ok");
  } else if (mode === "heatwave") {
    targetDeploy = 1.0;
    rainLines.visible = false;
    sunLight.intensity = 3.05;
    sunLight.color.setHex(0xffedd5);
    hemiLight.intensity = 0.90;
    scene.fog.color.setHex(0xfef3c7);
    scene.fog.density = 0.006;
    updateTelemetry(31.2, 62, 7, 3.0, "Phủ nóc (Giảm bức xạ 37°C)", "tele-warn");
  } else if (mode === "rainstorm") {
    targetDeploy = 1.0;
    rainLines.visible = true;
    sunLight.intensity = 1.05;
    sunLight.color.setHex(0xe2e8f0);
    hemiLight.intensity = 0.72;
    scene.fog.color.setHex(0xcbd5e1);
    scene.fog.density = 0.016;
    updateTelemetry(18.2, 42, 24, 0.6, "Che mưa đá & thu nước", "tele-ok");
  } else if (mode === "typhoon") {
    targetDeploy = 0.0;
    rainLines.visible = true;
    sunLight.intensity = 0.9;
    sunLight.color.setHex(0xcbd5e1);
    hemiLight.intensity = 0.65;
    scene.fog.color.setHex(0x94a3b8);
    scene.fog.density = 0.020;
    updateTelemetry(17.0, 38, 56, 0.3, "FAIL-SAFE: Thu gọn bão!", "tele-danger");
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
  const par = Math.round(100 - 38 * targetDeploy);
  const pv = 0.7 + 2.3 * targetDeploy;
  const temp = currentWeather === "heatwave" ? 37.2 - 6.0 * targetDeploy : 24.5 - 2.5 * targetDeploy;
  updateTelemetry(temp, par, currentWeather === "typhoon" ? 56 : 9, pv, val > 50 ? "Che phủ mái vòm" : "Thu gọn vách hông", val > 50 ? "tele-warn" : "tele-ok");
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
  btn.innerHTML = `<span class="hotspot-ring"><span class="hotspot-num">${hs.num}</span></span><span class="hotspot-label">${hs.label}</span>`;
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

document.getElementById("btn-toggle-labels").addEventListener("click", (e) => {
  const shown = document.body.classList.toggle("show-mobile-labels");
  e.currentTarget.style.background = shown ? "#16a34a" : "rgba(3, 105, 161, 0.88)";
});

function updateHotspotsProjection() {
  const w = window.innerWidth, h = window.innerHeight;
  const projVec = new THREE.Vector3();
  const yMax = w <= 860 ? h - 195 : h - 85;
  for (const { hs, btn } of hsElements) {
    projVec.copy(hs.pos3d).project(camera);
    if (projVec.z > 1.0 || projVec.z < -1.0) {
      btn.style.display = "none";
      continue;
    }
    const sx = (projVec.x * 0.5 + 0.5) * w;
    const sy = (-projVec.y * 0.5 + 0.5) * h;
    if (sx < 34 || sx > w - 34 || sy < 95 || sy > yMax) {
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

const textModal = document.getElementById("text-modal");
document.querySelectorAll("[data-action='modal-intro']").forEach((el) => {
  el.addEventListener("click", () => {
    document.getElementById("tm-title").textContent = "GIỚI THIỆU PILOT ĐÀ LẠT & LỘ TRÌNH PHẦN CỨNG RUST";
    document.getElementById("tm-body").innerHTML = `
      <p><b>Green Info – Pilot Đà Lạt (Lâm Đồng, 1.500 m):</b> Giải quyết bài toán tích nhiệt nhà kính ("hiệu ứng đảo nhiệt"), mưa đá/gió lốc cao nguyên và thoát nước tràn mái nhà kính tại Đà Lạt.</p>
      <h4>3 Đổi mới cốt lõi:</h4>
      <ul>
        <li><b>Mái vòm trượt lồng 2 tầng:</b> Sáng sương thu gọn vách (100% PAR); trưa nắng bức xạ cao trượt phủ mái hấp thụ nhiệt phát điện; gặp gió lốc đèo tự thu gọn an toàn (Fail-Safe).</li>
        <li><b>Mái PE kín nước &amp; Máng xối hở trên:</b> Màng PE vòm trên dừng tại <code>x = ±2,84 m</code> đổ thẳng vào lòng máng xối hở trên (<code>x = ±2,84–3,00 m</code>), tách biệt hoàn toàn hành lang trượt pin ngoài cột (<code>6–13,5 cm</code>) và xả cuối nhà về bồn chứa.</li>
        <li><b>Lộ trình tích hợp phần cứng (Rust):</b> Giai đoạn demo hiện tại tập trung hoàn thiện mô phỏng Web 3D & tối ưu thuật toán. Giai đoạn chế tạo phần cứng thực tế sẽ lập trình vi điều khiển nhúng & cổng Agri-Hub Gateway bằng ngôn ngữ <b>Rust (esp-rs / embassy &amp; Axum)</b> để đạt an toàn bộ nhớ tuyệt đối, tiết kiệm pin và vận hành bền bỉ 24/7.</li>
      </ul>
      <p><i>Lưu ý: Các thông số trên Web 3D là mô phỏng nguyên lý phục vụ trực quan hóa.</i></p>
    `;
    textModal.classList.remove("hidden");
    if (window.innerWidth <= 860) sidebar.classList.add("collapsed");
  });
});

document.querySelectorAll("[data-action='modal-team']").forEach((el) => {
  el.addEventListener("click", () => {
    document.getElementById("tm-title").textContent = "ĐỘI THI HỆ SINH THÁI SỐ – HUFLIT 2026";
    document.getElementById("tm-body").innerHTML = `
      <p><b>Cuộc thi:</b> HUFLIT Innovation &amp; Startup 2026 (Vòng 2 – Bảng Đổi Mới Sáng Tạo)</p>
      <h4>Thành viên đội thi:</h4>
      <ul>
        <li><b>Nguyễn Quốc Huy (Trưởng nhóm)</b> – 24DH113268 – Khoa Công Nghệ Thông Tin</li>
        <li><b>Trần Anh Như</b> – 26DH740846 – Khoa Ngoại Ngữ (Ngôn Ngữ Trung)</li>
        <li><b>Lâm Kim Yến</b> – 25DH140299 – Khoa Công Nghệ Thông Tin (Thương Mại Điện Tử)</li>
        <li><b>Nguyễn Thành Đạt</b> – 24DH481577 – Khoa Quản Trị Kinh Doanh</li>
      </ul>
      <p><b>Liên hệ:</b> nqhuy08112006@gmail.com  •  0902637150</p>
    `;
    textModal.classList.remove("hidden");
    if (window.innerWidth <= 860) sidebar.classList.add("collapsed");
  });
});
document.getElementById("btn-close-tm").addEventListener("click", () => textModal.classList.add("hidden"));

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
    if (window.innerWidth <= 860) weatherPanel.classList.add("hidden");
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
let currentDoorOpen = 0.0;
function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;

  if (Math.abs(currentDeploy - targetDeploy) > 0.001) {
    currentDeploy += (targetDeploy - currentDeploy) * Math.min(1, dt * 3.8);
    for (const fn of slidingPanels) fn(currentDeploy);
  }

  // Keep insect-screen door sealed during exterior inspection; slide open smoothly when entering door
  const nearEntry = isWalkMode && camPos.z > -8.8 && camPos.z < -3.8 && Math.abs(camPos.x) < 2.2;
  const targetDoorOpen = nearEntry ? 1.0 : 0.0;
  currentDoorOpen += (targetDoorOpen - currentDoorOpen) * Math.min(1, dt * 4.5);
  doorGroup.position.x = doorCenterClosed.x - currentDoorOpen * (doorW * 0.96);

  const windSpeed = currentWeather === "typhoon" ? 18.0 : currentWeather === "rainstorm" ? 8.0 : 2.5;
  anemoRotor.rotation.y += windSpeed * dt;
  const swayAmp = currentWeather === "typhoon" ? 0.08 : currentWeather === "rainstorm" ? 0.035 : 0.012;
  pineCrowns.forEach((cr, idx) => {
    cr.rotation.z = Math.sin(now * 0.0025 + idx) * swayAmp;
  });

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

requestAnimationFrame((t) => {
  animate(t);
  const veil = document.getElementById("loader-veil");
  veil.classList.add("fade-out");
  setTimeout(() => veil.remove(), 500);
});
