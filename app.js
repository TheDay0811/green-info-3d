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
const isMobileDevice = window.innerWidth <= 860;
const TEX_ANISO = isMobileDevice ? 2 : 4;

function loadTex(filename, repX = 1, repY = 1, isSRGB = true) {
  const tex = texLoader.load(`./assets/textures/${filename}`);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repX, repY);
  tex.anisotropy = TEX_ANISO;
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
const texBasalt = loadTex("basalt_soil.jpg", 5, 7, true);
const texBasaltBump = loadTex("basalt_soil_bump.jpg", 5, 7, false);
const texGrass = loadTex("grass_dalat.jpg", 72, 72, true);
const texGrassBump = loadTex("grass_dalat_bump.jpg", 72, 72, false);
const texPineBark = loadTex("pine_bark.jpg", 2, 4, true);
const texPineBranch = loadTex("pine_branch.png", 1, 1, true);
texPineBranch.wrapS = THREE.ClampToEdgeWrapping;
texPineBranch.wrapT = THREE.ClampToEdgeWrapping;
const texGrassTuft = loadTex("grass_tuft.png", 1, 1, true);
texGrassTuft.wrapS = THREE.ClampToEdgeWrapping;
texGrassTuft.wrapT = THREE.ClampToEdgeWrapping;

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
  tex.anisotropy = 4;
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
  tex.anisotropy = 4;
  return tex;
}

const texGalvSteel = loadTex("galv_steel.jpg", 1, 3, true);
const texTankHdpe = loadTex("tank_hdpe.jpg", 2, 1, true);
const texIotPanel = loadTex("iot_panel.png", 1, 1, true);
texIotPanel.wrapS = THREE.ClampToEdgeWrapping;
texIotPanel.wrapT = THREE.ClampToEdgeWrapping;

// =============================================================================
// 3. SCENE, RENDERER, PMREM ENVIRONMENT & LIGHTING
// =============================================================================
const wrap = document.getElementById("canvas-wrap");
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xe0f2fe, 0.0085);

const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 380);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobileDevice ? 1.25 : 1.5));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
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
scene.add(new THREE.Mesh(new THREE.SphereGeometry(265, 24, 16), skyMat));

const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x365314, 0.88);
scene.add(hemiLight);

const sunLight = new THREE.DirectionalLight(0xfffbeb, 2.35);
sunLight.position.set(11, 16, -9);
sunLight.castShadow = true;
const shadowRes = isMobileDevice ? 768 : 1536;
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
// 4. PHOTOREALISTIC DA LAT HIGHLAND VALLEY (Mobile-Optimized InstancedMesh + Sculpted Terrain)
// =============================================================================
const smoothstep = (e0, e1, x) => {
  const t = THREE.MathUtils.clamp((x - e0) / (e1 - e0), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
};

function ridgedHillFbm(x, z) {
  const n1 = Math.sin(x * 0.042 + 0.5) * Math.cos(z * 0.038 - 0.4);
  const n2 = Math.sin(x * 0.088 - z * 0.072 + 1.4) * 0.52;
  const n3 = Math.cos(x * 0.165 + z * 0.145 - 0.9) * 0.24;
  return 0.5 + 0.34 * (n1 + n2 + n3);
}

// Keep greenhouse pad, weather mast, tank & walkway strictly level at y = 0; roll organically into hills outside!
function terrainHeight(x, z) {
  const dx = Math.max(0, Math.abs(x) - 5.4);
  const dz = z < -19.2 ? -19.2 - z : z > 8.2 ? z - 8.2 : 0.0;
  const dPad = Math.hypot(dx, dz);
  if (dPad <= 0.001) return 0.0;
  const flatBlend = smoothstep(0.0, 9.5, dPad);
  const r = Math.hypot(x, z);
  const baseSlope = Math.pow(Math.min(1.0, Math.max(0.0, (r - 12.0) / 85.0)), 1.28) * 14.5;
  const undulation = (ridgedHillFbm(x, z) - 0.38) * (4.8 + r * 0.055);
  // Keep gentle sunny valley corridor open toward front approach (-Z)
  const frontValley = 1.0 - 0.52 * Math.exp(-Math.pow(x / 18.0, 2)) * smoothstep(-5.0, -45.0, z);
  return flatBlend * Math.max(-0.6, (baseSlope + undulation) * frontValley);
}

// 4A. Sculpted 72x72 Highland Meadow Terrain with vertex-color earth/clover/moss variation (~10.3k tris, 1 draw call!)
{
  const segs = 72;
  const span = 240;
  const tGeo = new THREE.PlaneGeometry(span, span, segs, segs);
  tGeo.rotateX(-Math.PI / 2);
  const pos = tGeo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const cTmp = new THREE.Color();

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const y = terrainHeight(x, z);
    pos.setY(i, y);

    const macro = ridgedHillFbm(x * 1.45 + 17.0, z * 1.45 - 11.0);
    const micro = 0.5 + 0.5 * Math.sin(x * 0.27 + z * 0.19) * Math.cos(z * 0.31 - x * 0.17);
    // Warm earthy humus near farm courtyard rim; vibrant sunny olive on swells; deep pine moss in hollows
    const dxB = Math.max(0, Math.abs(x) - 4.7);
    const dzB = Math.max(0, Math.abs(z + 0.2) - 8.2);
    const nearCourt = 1.0 - smoothstep(0.4, 3.6, Math.hypot(dxB, dzB));
    const hillAlt = smoothstep(1.5, 13.0, y);

    const rCol = 0.78 + macro * 0.20 + nearCourt * 0.16 - hillAlt * 0.10;
    const gCol = 0.86 + micro * 0.16 - nearCourt * 0.14 - hillAlt * 0.06;
    const bCol = 0.72 + micro * 0.10 - nearCourt * 0.16 + hillAlt * 0.14;
    cTmp.setRGB(rCol, gCol, bCol);
    colors[i * 3] = cTmp.r;
    colors[i * 3 + 1] = cTmp.g;
    colors[i * 3 + 2] = cTmp.b;
  }
  tGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  tGeo.computeVertexNormals();

  const groundMat = new THREE.MeshStandardMaterial({
    map: texGrass,
    bumpMap: texGrassBump,
    bumpScale: 0.032,
    vertexColors: true,
    roughness: 0.94,
    metalness: 0.0,
  });
  const groundMesh = new THREE.Mesh(tGeo, groundMat);
  groundMesh.receiveShadow = true;
  scene.add(groundMesh);
}

// 4B. Organic Contoured Red Basalt Courtyard Apron (frames concrete slab clearly & slopes softly into meadow grass!)
{
  const rings = 14, radSegs = 64;
  const rx = 6.35, rz = 9.75;
  const bVerts = [], bUvs = [], bIdx = [];
  for (let rI = 0; rI <= rings; rI++) {
    const f = rI / rings;
    for (let aI = 0; aI <= radSegs; aI++) {
      const th = (aI / radSegs) * Math.PI * 2;
      // Organic scalloped shoreline wobble only on outer 45% of terrace so inner pad stays cleanly covered
      const wobble = 1.0 + smoothstep(0.45, 1.0, f) * (0.09 * Math.sin(th * 5.0 + 0.6) + 0.06 * Math.cos(th * 9.0 - 1.1));
      const bx = Math.cos(th) * rx * f * wobble;
      const bz = Math.sin(th) * rz * f * wobble;
      // Superellipse squaring so courtyard hugs greenhouse nicely with rounded corners
      const sq = 1.0 / Math.pow(Math.pow(Math.abs(Math.cos(th)), 3.2) + Math.pow(Math.abs(Math.sin(th)), 3.2), 1.0 / 3.2);
      const px = Math.cos(th) * rx * f * wobble * (0.68 + 0.32 * sq);
      const pz = Math.sin(th) * rz * f * wobble * (0.68 + 0.32 * sq);
      // Level +0.015 inside courtyard, dipping smoothly below grass surface at rim for Z-feathered edge!
      const py = f < 0.72 ? 0.014 : THREE.MathUtils.lerp(0.014, -0.032, smoothstep(0.72, 1.0, f));
      bVerts.push(px, py, pz);
      bUvs.push((px + rx) / (2 * rx), (pz + rz) / (2 * rz));
    }
  }
  for (let rI = 0; rI < rings; rI++) {
    for (let aI = 0; aI < radSegs; aI++) {
      const a = rI * (radSegs + 1) + aI;
      const b = a + 1;
      const c = a + radSegs + 2;
      const d2 = a + radSegs + 1;
      bIdx.push(a, b, c, a, c, d2);
    }
  }
  const bGeo = new THREE.BufferGeometry();
  bGeo.setAttribute("position", new THREE.Float32BufferAttribute(bVerts, 3));
  bGeo.setAttribute("uv", new THREE.Float32BufferAttribute(bUvs, 2));
  bGeo.setIndex(bIdx);
  bGeo.computeVertexNormals();
  const basaltMat = new THREE.MeshStandardMaterial({
    map: texBasalt,
    bumpMap: texBasaltBump,
    bumpScale: 0.038,
    roughness: 0.96,
    metalness: 0.02,
  });
  const basaltTerrace = new THREE.Mesh(bGeo, basaltMat);
  basaltTerrace.receiveShadow = true;
  scene.add(basaltTerrace);
}

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

// 4C. 3 Continuous Sculpted 360° Da Lat Mountain Ridges + Valley Mist (replaces geometric cones; only 4 draw calls!)
function createMountainBelt(rIn, rPeak, rOut, maxH, seed, lowRgb, midRgb, crestRgb) {
  const segA = 112, segR = 6;
  const verts = [], cols = [], uvs = [], idx = [];
  const cLow = new THREE.Color(lowRgb), cMid = new THREE.Color(midRgb), cTop = new THREE.Color(crestRgb);
  const cTmp = new THREE.Color();

  for (let i = 0; i <= segA; i++) {
    const th = (i / segA) * Math.PI * 2;
    // Layered mountain ridge harmonic height profile around 360°
    const hHarm =
      0.52 +
      0.28 * Math.sin(th * 3.0 + seed) +
      0.18 * Math.cos(th * 7.0 - seed * 1.7) +
      0.12 * Math.sin(th * 13.0 + seed * 2.3) +
      0.06 * Math.cos(th * 23.0 - seed * 0.9);
    // Ridged crisp mountain silhouette (slightly sharper peaks, wide valley saddles)
    const ridgePeak = maxH * Math.pow(Math.max(0.18, hHarm), 1.25);
    const localWiggle = 1.0 + 0.08 * Math.sin(th * 11.0 + seed);

    for (let j = 0; j <= segR; j++) {
      const f = j / segR;
      const rad = THREE.MathUtils.lerp(rIn, rOut, f) * localWiggle;
      // Cross-ridge bell curve rooted well below y=0 (-3.2m skirt) so distant hills never show hard floating seams
      const spine = Math.sin(Math.pow(f, 0.85) * Math.PI);
      const subRib = 1.0 + 0.14 * Math.sin(th * 17.0 + f * 4.5 + seed);
      const elev = Math.max(-3.5, ridgePeak * spine * subRib - 3.2 * (1.0 - spine));
      verts.push(Math.cos(th) * rad, elev, Math.sin(th) * rad);
      uvs.push((i / segA) * 18.0, f * 3.0);

      const hNorm = THREE.MathUtils.clamp(elev / maxH, 0.0, 1.0);
      if (hNorm < 0.48) {
        cTmp.copy(cLow).lerp(cMid, hNorm / 0.48);
      } else {
        cTmp.copy(cMid).lerp(cTop, (hNorm - 0.48) / 0.52);
      }
      cols.push(cTmp.r, cTmp.g, cTmp.b);
    }
  }
  for (let i = 0; i < segA; i++) {
    for (let j = 0; j < segR; j++) {
      const a = i * (segR + 1) + j;
      const b = a + 1;
      const c = a + segR + 2;
      const d2 = a + segR + 1;
      idx.push(a, d2, c, a, c, b);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  const mat = new THREE.MeshStandardMaterial({
    map: texGrass,
    vertexColors: true,
    roughness: 0.96,
    metalness: 0.0,
  });
  return new THREE.Mesh(geo, mat);
}

scene.add(createMountainBelt(52, 68, 92, 19.5, 0.7, 0x1a3f26, 0x2f5e36, 0x4b7740));
scene.add(createMountainBelt(86, 114, 148, 34.0, 2.3, 0x1b4332, 0x2d5a52, 0x4e7a78));
scene.add(createMountainBelt(138, 174, 218, 56.0, 4.1, 0x294861, 0x456982, 0x7aa0bd));

// Translucent Da Lat morning valley mist floating in the pine saddle
const valleyMistTex = (() => {
  const c = document.createElement("canvas");
  c.width = 64; c.height = 64;
  const ctx = c.getContext("2d");
  const g = ctx.createLinearGradient(0, 0, 0, 64);
  g.addColorStop(0.0, "rgba(232,244,252,0)");
  g.addColorStop(0.45, "rgba(232,244,252,0.52)");
  g.addColorStop(0.85, "rgba(220,238,250,0.22)");
  g.addColorStop(1.0, "rgba(220,238,250,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
})();
const valleyMistMat = new THREE.MeshBasicMaterial({
  map: valleyMistTex,
  transparent: true,
  opacity: 0.30,
  depthWrite: false,
  side: THREE.DoubleSide,
});
const mistRing = new THREE.Mesh(new THREE.CylinderGeometry(86, 72, 13.0, 64, 1, true), valleyMistMat);
mistRing.position.y = 7.2;
scene.add(mistRing);

// 4D. Shared GPU Wind-Sway Hook for Mobile Foliage InstancedMeshes (0.01ms CPU cost!)
const foliageWindUniforms = {
  uTime: { value: 0.0 },
  uAmp: { value: 0.025 },
};
function attachFoliageWind(mat, ampScale = 1.0) {
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = foliageWindUniforms.uTime;
    shader.uniforms.uAmp = foliageWindUniforms.uAmp;
    shader.vertexShader =
      `uniform float uTime;\nuniform float uAmp;\n` +
      shader.vertexShader.replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        float wMask = clamp(uv.y, 0.0, 1.0);
        float ph = uTime * 2.15 + position.x * 1.7 + position.z * 1.9;
        #ifdef USE_INSTANCING
          ph += instanceMatrix[3][0] * 0.45 + instanceMatrix[3][2] * 0.37;
        #endif
        transformed.x += sin(ph) * uAmp * ${ampScale.toFixed(2)} * wMask;
        transformed.z += cos(ph * 0.83) * uAmp * ${(ampScale * 0.55).toFixed(2)} * wMask;`
      );
  };
}

// 4E. Da Lat 3-Needle Pine Forest (78 trees built with Pinus kesiya photo boughs via ONLY 2 InstancedMesh calls!)
{
  // Archetype 1: Tapered textured pine trunk
  const trunkGeo = new THREE.CylinderGeometry(0.11, 0.23, 5.4, 8, 2);
  trunkGeo.translate(0, 2.7, 0);
  const trunkMat = new THREE.MeshStandardMaterial({
    map: texPineBark,
    bumpMap: texPineBark,
    bumpScale: 0.025,
    roughness: 0.94,
  });

  // Archetype 2: Lush multi-tiered broad umbrella pine-bough crown (authentic mature Da Lat Pinus kesiya!)
  const bPos = [], bNorm = [], bUv = [], bIdx = [];
  const tierSpecs = [
    // [centerY, width, height, tiltX, yaw]
    [3.05, 3.6, 2.3, 0.42, 0.0],
    [3.15, 3.6, 2.3, 0.42, 1.05],
    [3.22, 3.5, 2.2, 0.40, 2.10],
    [3.95, 3.2, 2.15, 0.36, 0.52],
    [4.05, 3.2, 2.15, 0.36, 1.58],
    [4.12, 3.0, 2.05, 0.34, 2.65],
    [4.85, 2.4, 1.95, 0.24, 0.25],
    [4.92, 2.4, 1.95, 0.24, 1.82],
    [5.48, 1.75, 1.65, 0.12, 0.95],
  ];
  for (const [cy, bw, bh, tilt, yaw] of tierSpecs) {
    const baseIdx = bPos.length / 3;
    const corners = [
      [-bw * 0.5, 0.0, 0.0],
      [bw * 0.5, 0.0, 0.0],
      [bw * 0.5, bh, 0.0],
      [-bw * 0.5, bh, 0.0],
    ];
    const uvC = [[0, 0], [1, 0], [1, 1], [0, 1]];
    const cY = Math.cos(yaw), sY = Math.sin(yaw);
    const cT = Math.cos(tilt), sT = Math.sin(tilt);
    for (let k = 0; k < 4; k++) {
      let [lx, ly, lz] = corners[k];
      const ry = ly * cT - lz * sT;
      const rz = ly * sT + lz * cT;
      const wx = lx * cY + rz * sY;
      const wz = -lx * sY + rz * cY;
      bPos.push(wx, cy + ry - bh * 0.35, wz);
      bNorm.push(sY, 0.55, cY);
      bUv.push(uvC[k][0], uvC[k][1]);
    }
    bIdx.push(baseIdx, baseIdx + 1, baseIdx + 2, baseIdx, baseIdx + 2, baseIdx + 3);
  }
  const crownGeo = new THREE.BufferGeometry();
  crownGeo.setAttribute("position", new THREE.Float32BufferAttribute(bPos, 3));
  crownGeo.setAttribute("normal", new THREE.Float32BufferAttribute(bNorm, 3));
  crownGeo.setAttribute("uv", new THREE.Float32BufferAttribute(bUv, 2));
  crownGeo.setIndex(bIdx);
  crownGeo.computeVertexNormals();

  const crownMat = new THREE.MeshStandardMaterial({
    map: texPineBranch,
    alphaTest: 0.52,
    side: THREE.DoubleSide,
    roughness: 0.92,
    metalness: 0.0,
    envMapIntensity: 0.22,
  });
  attachFoliageWind(crownMat, 1.6);

  // Deterministic pseudo-random grove distribution avoiding greenhouse & entrance corridor
  const treeTransforms = [];
  let sRand = 1337;
  const nextRand = () => {
    sRand = (sRand * 1664525 + 1013904223) >>> 0;
    return sRand / 4294967296;
  };
  // Anchor hero pine framing trees cleanly near the courtyard first
  const heroCoords = [
    [-9.2, -8.2, 1.05], [-13.2, -1.8, 1.28], [-10.8, 7.6, 1.15],
    [9.4, -7.2, 1.08], [12.8, 2.2, 1.25], [11.2, 9.6, 1.18],
    [-6.8, 14.2, 1.12], [6.8, 14.5, 1.22],
  ];
  for (const [hx, hz, hs] of heroCoords) {
    treeTransforms.push([hx, hz, hs, nextRand() * Math.PI * 2, (nextRand() - 0.5) * 0.06]);
  }
  while (treeTransforms.length < 78) {
    const ang = nextRand() * Math.PI * 2;
    const rad = 14.0 + Math.pow(nextRand(), 0.72) * 72.0;
    const tx = Math.cos(ang) * rad;
    const tz = Math.sin(ang) * rad;
    if (Math.abs(tx) < 7.8 && tz < 2.0 && tz > -24.0) continue; // Keep front approach sightline clear!
    if (Math.hypot(tx, tz) < 12.2) continue;
    const sc = 0.82 + nextRand() * 0.72;
    treeTransforms.push([tx, tz, sc, nextRand() * Math.PI * 2, (nextRand() - 0.5) * 0.08]);
  }

  const pineTrunks = new THREE.InstancedMesh(trunkGeo, trunkMat, treeTransforms.length);
  const pineCrownsInst = new THREE.InstancedMesh(crownGeo, crownMat, treeTransforms.length);
  pineTrunks.castShadow = true;
  pineTrunks.receiveShadow = true;
  // Disable alpha-tested shadow depth shader on pine boughs for rapid mobile Early-Z shadow pass!
  pineCrownsInst.castShadow = false;

  const dummy = new THREE.Object3D();
  const pineTint = new THREE.Color();
  for (let i = 0; i < treeTransforms.length; i++) {
    const [tx, tz, sc, rotY, lean] = treeTransforms[i];
    const ty = terrainHeight(tx, tz) - 0.16;
    dummy.position.set(tx, ty, tz);
    dummy.rotation.set(lean, rotY, lean * 0.7);
    dummy.scale.set(sc * (0.94 + nextRand() * 0.14), sc, sc * (0.94 + nextRand() * 0.14));
    dummy.updateMatrix();
    pineTrunks.setMatrixAt(i, dummy.matrix);
    pineCrownsInst.setMatrixAt(i, dummy.matrix);
    pineTint.setHSL(0.32 + (nextRand() - 0.5) * 0.03, 0.24 + nextRand() * 0.12, 0.78 + nextRand() * 0.22);
    pineCrownsInst.setColorAt(i, pineTint);
  }
  pineTrunks.instanceMatrix.needsUpdate = true;
  pineCrownsInst.instanceMatrix.needsUpdate = true;
  if (pineCrownsInst.instanceColor) pineCrownsInst.instanceColor.needsUpdate = true;
  scene.add(pineTrunks, pineCrownsInst);

  // 4F. 480 Photorealistic Crossed-Blade Grass Tufts around courtyard edge, path & hills (1 draw call, castShadow = false!)
  const gPos = [], gNorm = [], gUv = [], gIdx = [];
  for (let pI = 0; pI < 3; pI++) {
    const yaw = (pI * Math.PI) / 3.0;
    const cY = Math.cos(yaw), sY = Math.sin(yaw);
    const bi = gPos.length / 3;
    const wHalf = 0.34;
    const pts = [
      [-wHalf, 0.0, 0.0], [wHalf, 0.0, 0.0],
      [wHalf * 1.12, 0.60, 0.04], [-wHalf * 1.12, 0.60, 0.04],
    ];
    const uvG = [[0, 0], [1, 0], [1, 1], [0, 1]];
    for (let k = 0; k < 4; k++) {
      const [lx, ly, lz] = pts[k];
      gPos.push(lx * cY + lz * sY, ly, -lx * sY + lz * cY);
      gNorm.push(0, 1, 0);
      gUv.push(uvG[k][0], uvG[k][1]);
    }
    gIdx.push(bi, bi + 1, bi + 2, bi, bi + 2, bi + 3);
  }
  const tuftGeo = new THREE.BufferGeometry();
  tuftGeo.setAttribute("position", new THREE.Float32BufferAttribute(gPos, 3));
  tuftGeo.setAttribute("normal", new THREE.Float32BufferAttribute(gNorm, 3));
  tuftGeo.setAttribute("uv", new THREE.Float32BufferAttribute(gUv, 2));
  tuftGeo.setIndex(gIdx);

  const tuftMat = new THREE.MeshStandardMaterial({
    map: texGrassTuft,
    alphaTest: 0.50,
    side: THREE.DoubleSide,
    roughness: 0.92,
    metalness: 0.0,
    envMapIntensity: 0.24,
  });
  attachFoliageWind(tuftMat, 0.85);

  const tuftCount = 480;
  const grassInst = new THREE.InstancedMesh(tuftGeo, tuftMat, tuftCount);
  grassInst.castShadow = false;
  grassInst.receiveShadow = true;

  let placed = 0;
  while (placed < tuftCount) {
    let gx, gz, sc = 0.60 + nextRand() * 0.72;
    if (placed < 240) {
      // Dense organic rim along wider red basalt courtyard & entrance concrete path edge
      const th = nextRand() * Math.PI * 2;
      const edgeF = 0.88 + nextRand() * 0.32;
      gx = Math.cos(th) * 6.35 * edgeF;
      gz = Math.sin(th) * 9.75 * edgeF;
    } else if (placed < 320) {
      // Clumps flanking entrance concrete walkway edges
      const sideS = nextRand() > 0.5 ? 1 : -1;
      gx = sideS * (0.78 + nextRand() * 0.95);
      gz = -6.7 - nextRand() * 11.8;
      sc = 0.45 + nextRand() * 0.45;
    } else {
      // Meadow clusters across surrounding Dalat slopes
      const ang = nextRand() * Math.PI * 2;
      const rad = 8.0 + nextRand() * 34.0;
      gx = Math.cos(ang) * rad;
      gz = Math.sin(ang) * rad;
      sc = 0.72 + nextRand() * 0.92;
    }
    // Keep strictly outside concrete pad & walkway interior
    if (Math.abs(gx) < 3.65 && Math.abs(gz) < 6.75) continue;
    if (Math.abs(gx) < 0.82 && gz < -6.3 && gz > -18.7) continue;
    if (Math.hypot(gx - 3.85, gz + 6.45) < 0.55) continue; // Keep wind pier clean!

    const gy = terrainHeight(gx, gz) - 0.03;
    dummy.position.set(gx, gy, gz);
    dummy.rotation.set((nextRand() - 0.5) * 0.14, nextRand() * Math.PI * 2, (nextRand() - 0.5) * 0.14);
    dummy.scale.set(sc, sc * (0.8 + nextRand() * 0.55), sc);
    dummy.updateMatrix();
    grassInst.setMatrixAt(placed, dummy.matrix);
    pineTint.setHSL(0.24 + (nextRand() - 0.5) * 0.06, 0.34 + nextRand() * 0.16, 0.72 + nextRand() * 0.28);
    grassInst.setColorAt(placed, pineTint);
    placed++;
  }
  grassInst.instanceMatrix.needsUpdate = true;
  if (grassInst.instanceColor) grassInst.instanceColor.needsUpdate = true;
  scene.add(grassInst);

  // 4G. 56 Weathered Highland Basalt Garden Stones bordering earth apron & hillside slopes (1 draw call!)
  const rockBaseGeo = new THREE.IcosahedronGeometry(0.26, 1);
  const rPos = rockBaseGeo.attributes.position;
  for (let i = 0; i < rPos.count; i++) {
    const vx = rPos.getX(i), vy = rPos.getY(i), vz = rPos.getZ(i);
    const warp = 0.78 + 0.26 * Math.sin(vx * 7.2 + vy * 5.1) * Math.cos(vz * 6.4);
    rPos.setXYZ(i, vx * warp * 1.18, vy * warp * 0.72, vz * warp);
  }
  rockBaseGeo.computeVertexNormals();
  const rockMat = new THREE.MeshStandardMaterial({
    map: texBasalt,
    color: 0x64748b,
    roughness: 0.92,
    metalness: 0.05,
  });
  const rocksInst = new THREE.InstancedMesh(rockBaseGeo, rockMat, 56);
  rocksInst.castShadow = true;
  rocksInst.receiveShadow = true;
  let rPlaced = 0;
  while (rPlaced < 56) {
    const th = nextRand() * Math.PI * 2;
    const rr = rPlaced < 34 ? 0.88 + nextRand() * 0.22 : 1.15 + nextRand() * 2.2;
    const rx = Math.cos(th) * 5.4 * rr;
    const rz = Math.sin(th) * 8.6 * rr;
    if (Math.abs(rx) < 3.85 && Math.abs(rz) < 6.9) continue;
    if (Math.abs(rx) < 1.1 && rz < -6.2 && rz > -19.0) continue;
    const ry = terrainHeight(rx, rz) - 0.04;
    const rSc = 0.65 + nextRand() * 1.35;
    dummy.position.set(rx, ry, rz);
    dummy.rotation.set(nextRand() * 0.5, nextRand() * Math.PI * 2, nextRand() * 0.5);
    dummy.scale.set(rSc, rSc * (0.65 + nextRand() * 0.45), rSc);
    dummy.updateMatrix();
    rocksInst.setMatrixAt(rPlaced, dummy.matrix);
    pineTint.setHSL(0.06, 0.14, 0.42 + nextRand() * 0.24);
    rocksInst.setColorAt(rPlaced, pineTint);
    rPlaced++;
  }
  rocksInst.instanceMatrix.needsUpdate = true;
  if (rocksInst.instanceColor) rocksInst.instanceColor.needsUpdate = true;
  scene.add(rocksInst);
}

// =============================================================================
// 5. GREEN INFO 3D DOME STRUCTURE, FULL 32-MESH ENCLOSURE & RAINWATER TANK
// =============================================================================
const domeGroup = new THREE.Group();
const windStation = new THREE.Group();
domeGroup.add(windStation);
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
// Clear UV Polyethylene (PE) Greenhouse Glazing Film (fast MeshStandardMaterial with IBL sky reflection)
const peRoofFilmMat = new THREE.MeshStandardMaterial({
  color: 0xe8f6ff,
  transparent: true,
  opacity: 0.22,
  roughness: 0.12,
  metalness: 0.05,
  envMapIntensity: 1.15,
  side: THREE.DoubleSide,
  depthWrite: false,
});

// Batch static pipes/columns/arches/conduits into 1 InstancedMesh per material (cuts ~260 draw calls!)
const staticTubeBatches = new Map();
const _tubeUp = new THREE.Vector3(0, 1, 0);
const _tubeDir = new THREE.Vector3();
const _tubeMid = new THREE.Vector3();
const _tubeQuat = new THREE.Quaternion();
const _tubeScale = new THREE.Vector3();

function addTubeBetween(p1, p2, r, mat, parent) {
  _tubeDir.subVectors(p2, p1);
  const len = _tubeDir.length();
  if (len < 1e-4) return;
  if (parent === domeGroup || parent === windStation) {
    _tubeMid.copy(p1).add(p2).multiplyScalar(0.5);
    _tubeQuat.setFromUnitVectors(_tubeUp, _tubeDir.normalize());
    _tubeScale.set(r, len, r);
    const m = new THREE.Matrix4().compose(_tubeMid, _tubeQuat, _tubeScale);
    let bucket = staticTubeBatches.get(mat);
    if (!bucket) {
      bucket = { mat, matrices: [] };
      staticTubeBatches.set(mat, bucket);
    }
    bucket.matrices.push(m);
    return;
  }
  const geo = new THREE.CylinderGeometry(r, r, len, 8);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(p1).add(p2).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(_tubeUp, _tubeDir.normalize());
  mesh.castShadow = !isMobileDevice;
  parent.add(mesh);
}

const bays = 8;
const archCurvePts = [];
for (let s = 0; s <= 24; s++) {
  const phi = -PHI_MAX + (2 * PHI_MAX * s) / 24;
  archCurvePts.push([R_ARCH * Math.sin(phi), Z_CENTER + R_ARCH * Math.cos(phi)]);
}

{
  const pierGeo = new THREE.CylinderGeometry(0.11, 0.125, 0.26, 12);
  const clampGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.06, 8);
  const pierInst = new THREE.InstancedMesh(pierGeo, concMat, (bays + 1) * 2);
  const clampInst = new THREE.InstancedMesh(clampGeo, clampMat, (bays + 1) * 2);
  pierInst.castShadow = true;
  pierInst.receiveShadow = true;
  const dMat = new THREE.Matrix4();
  let cIdx = 0;
  for (let i = 0; i <= bays; i++) {
    const by = (i * L) / bays;
    for (const sx of [-1, 1]) {
      const xCol = sx * (W / 2.0);
      dMat.makeTranslation(xCol, 0.12, by - HALF_L);
      pierInst.setMatrixAt(cIdx, dMat);
      dMat.makeTranslation(xCol, H_SIDE, by - HALF_L);
      clampInst.setMatrixAt(cIdx, dMat);
      cIdx++;
      addTubeBetween(toThree(xCol, by, 0.0), toThree(xCol, by, H_SIDE), 0.023, steelMat, domeGroup);
    }
    for (let s = 0; s < archCurvePts.length - 1; s++) {
      const [x1, z1] = archCurvePts[s];
      const [x2, z2] = archCurvePts[s + 1];
      addTubeBetween(toThree(x1, by, z1), toThree(x2, by, z2), 0.022, steelMat, domeGroup);
    }
  }
  pierInst.instanceMatrix.needsUpdate = true;
  clampInst.instanceMatrix.needsUpdate = true;
  domeGroup.add(pierInst, clampInst);
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

// Entrance Signboard ("GREEN INFO - PILOT ĐÀ LẠT 1.500 m") — twin outer H-frame stanchions so zero pole blocks text
{
  const sx = -2.1, sy = -1.0, sz = 1.32;
  const boardW = 1.15, boardH = 0.44, boardT = 0.04;
  const yaw = 0.25;
  const cosY = Math.cos(yaw), sinY = Math.sin(yaw);
  const postR = 0.022;
  const postOff = boardW * 0.5 + postR;
  const boardBot = sz - boardH * 0.5 - 0.015;
  const boardTop = sz + boardH * 0.5 + 0.015;

  // Flanking vertical stanchions at left & right outer edges + top/bottom horizontal rails (zero face obstruction)
  const pLeftBot = toThree(sx - postOff * cosY, sy + postOff * sinY, 0);
  const pLeftTop = toThree(sx - postOff * cosY, sy + postOff * sinY, boardTop + 0.014);
  const pRightBot = toThree(sx + postOff * cosY, sy - postOff * sinY, 0);
  const pRightTop = toThree(sx + postOff * cosY, sy - postOff * sinY, boardTop + 0.014);
  addTubeBetween(pLeftBot, pLeftTop, postR, steelMat, domeGroup);
  addTubeBetween(pRightBot, pRightTop, postR, steelMat, domeGroup);
  addTubeBetween(
    toThree(sx - postOff * cosY, sy + postOff * sinY, boardBot),
    toThree(sx + postOff * cosY, sy - postOff * sinY, boardBot),
    0.015, steelMat, domeGroup
  );
  addTubeBetween(
    toThree(sx - postOff * cosY, sy + postOff * sinY, boardTop),
    toThree(sx + postOff * cosY, sy - postOff * sinY, boardTop),
    0.014, steelMat, domeGroup
  );

  // Ground anchor collars under both side posts
  const collarGeo = new THREE.CylinderGeometry(0.052, 0.058, 0.055, 10);
  for (const bxSign of [-1, 1]) {
    const collar = new THREE.Mesh(collarGeo, clampMat);
    collar.position.copy(toThree(sx + bxSign * postOff * cosY, sy - bxSign * postOff * sinY, 0.0275));
    domeGroup.add(collar);
  }

  // Crisp powder-coated rim + clear dual-face display panels
  const signFaceMat = new THREE.MeshStandardMaterial({ map: makeSignTexture(), roughness: 0.36, metalness: 0.12 });
  const signRimMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.45, metalness: 0.35 });
  const signBoard = new THREE.Mesh(
    new THREE.BoxGeometry(boardW, boardH, boardT),
    [signRimMat, signRimMat, signRimMat, signRimMat, signFaceMat, signFaceMat]
  );
  signBoard.position.copy(toThree(sx, sy, sz));
  signBoard.rotation.y = yaw;
  signBoard.castShadow = !isMobileDevice;
  domeGroup.add(signBoard);
}

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
    for (let k = 0; k <= 24; k++) {
      const u = (5.15 * k) / 24;
      const [rx, rz] = getTrackPoint(u, 0.06, sx);
      pts.push(toThree(rx, by, rz));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    domeGroup.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.016, 6, false), railMat));
  }
}

// =============================================================================
// 6. REAL-TIME MONOCRYSTALLINE TELESCOPIC CURVED SOLAR PANELS
// =============================================================================
const matSolarInner = new THREE.MeshStandardMaterial({
  map: texSolarInner,
  metalness: 0.44,
  roughness: 0.16,
  envMapIntensity: 1.25,
  side: THREE.DoubleSide,
});
const matSolarOuter = new THREE.MeshStandardMaterial({
  map: texSolarOuter,
  metalness: 0.48,
  roughness: 0.14,
  envMapIntensity: 1.30,
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
// Keep opaque pots casting shadows, skip 756 alpha-cutout leaf discard checks in shadow depth pass!
leafInst.castShadow = false;

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
// 8. GROUNDED IOT CONTROL RACK, LiFePO4 BANK & REALISTIC METEOROLOGICAL STATION
// =============================================================================
const iotPlinth = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.14, 0.64), concMat);
iotPlinth.position.copy(toThree(-2.56, 1.2, 0.09));
iotPlinth.castShadow = true;
iotPlinth.receiveShadow = true;
domeGroup.add(iotPlinth);

// Galvanized H-Frame Stand bolted to concrete plinth + lateral brace to column
for (const pyPost of [0.98, 1.42]) {
  addTubeBetween(toThree(-2.58, pyPost, 0.15), toThree(-2.58, pyPost, 1.62), 0.02, steelMat, domeGroup);
  const basePlate = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.015, 0.11), clampMat);
  basePlate.position.copy(toThree(-2.58, pyPost, 0.165));
  domeGroup.add(basePlate);
}
addTubeBetween(toThree(-2.58, 0.96, 1.04), toThree(-2.58, 1.44, 1.04), 0.016, steelMat, domeGroup);
addTubeBetween(toThree(-2.58, 0.96, 1.44), toThree(-2.58, 1.44, 1.44), 0.016, steelMat, domeGroup);
// Tie-back strut anchoring rack rigidly to column at (x = -3.00, y = 1.50, z = 1.58)
addTubeBetween(toThree(-2.58, 1.42, 1.58), toThree(-3.00, 1.50, 1.58), 0.014, steelMat, domeGroup);

const iotBodyMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.35, roughness: 0.38 });
const iotFaceMat = new THREE.MeshStandardMaterial({ map: texIotPanel, roughness: 0.32, metalness: 0.12 });
const iotBox = new THREE.Mesh(
  new THREE.BoxGeometry(0.42, 0.56, 0.22),
  [iotBodyMat, iotBodyMat, iotBodyMat, iotBodyMat, iotFaceMat, iotFaceMat]
);
iotBox.position.copy(toThree(-2.52, 1.2, 1.25));
iotBox.rotation.y = Math.PI / 2;
iotBox.castShadow = true;
domeGroup.add(iotBox);

// Sloped waterproof rain/condensation canopy hood over IP65 cabinet
const iotHood = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.022, 0.48), clampMat);
iotHood.position.copy(toThree(-2.51, 1.2, 1.55));
iotHood.rotation.z = -0.10;
domeGroup.add(iotHood);

const iotLed = new THREE.Mesh(
  new THREE.SphereGeometry(0.022, 8, 8),
  new THREE.MeshBasicMaterial({ color: 0x22c55e })
);
iotLed.position.copy(toThree(-2.51, 1.2, 1.59));
domeGroup.add(iotLed);

// LiFePO4 Battery Enclosure sitting solidly ON TOP of the concrete plinth (z = 0.16..0.42 m -> zero floating!)
const battBox = new THREE.Mesh(
  new THREE.BoxGeometry(0.30, 0.26, 0.44),
  new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.46, metalness: 0.28 })
);
battBox.position.copy(toThree(-2.52, 1.2, 0.29));
battBox.castShadow = true;
battBox.receiveShadow = true;
domeGroup.add(battBox);
// Battery mounting straps + DC power conduit up into cabinet bottom glands
const battStrap = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.025, 0.46), clampMat);
battStrap.position.copy(toThree(-2.52, 1.2, 0.415));
domeGroup.add(battStrap);
addTubeBetween(toThree(-2.50, 1.14, 0.42), toThree(-2.50, 1.14, 0.97), 0.013, pipeMat, domeGroup);
addTubeBetween(toThree(-2.50, 1.26, 0.42), toThree(-2.50, 1.26, 0.97), 0.011, gutterMat, domeGroup);
addTubeBetween(toThree(-2.52, 1.2, 1.54), toThree(-2.98, 1.5, 1.92), 0.010, pipeMat, domeGroup);

// Freestanding Dalat Meteorological Wind & Solar Station (front-right corner x = 3.85, y = -0.45 -> 100% clear of solar panels/rails!)
const wPier = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.22, 0.46), concMat);
wPier.position.copy(toThree(3.85, -0.45, 0.11));
wPier.castShadow = true;
wPier.receiveShadow = true;
windStation.add(wPier);

const wFlange = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.024, 0.22), clampMat);
wFlange.position.copy(toThree(3.85, -0.45, 0.232));
windStation.add(wFlange);

// 4 radial triangular gusset stiffener ribs anchoring freestanding mast to base flange (zero wall cross-bars!)
for (const angG of [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]) {
  addTubeBetween(
    toThree(3.85 + Math.cos(angG) * 0.095, -0.45 + Math.sin(angG) * 0.095, 0.24),
    toThree(3.85 + Math.cos(angG) * 0.024, -0.45 + Math.sin(angG) * 0.024, 0.42),
    0.008, clampMat, windStation
  );
}
// Ground-level armored sensor conduit connecting pier base cleanly to front-right corner post (z = 0.055m)
addTubeBetween(toThree(3.85, -0.45, 0.055), toThree(3.00, 0.00, 0.055), 0.014, pipeMat, windStation);

addTubeBetween(toThree(3.85, -0.45, 0.23), toThree(3.85, -0.45, 3.26), 0.028, steelMat, windStation);

// Outdoor LoRa telemetry junction box + Louvered Stevenson Radiation Shield facing OUTWARD (+X, away from greenhouse)
const wBox = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 0.12), iotBodyMat);
wBox.position.copy(toThree(3.94, -0.45, 1.56));
wBox.castShadow = true;
windStation.add(wBox);

const shieldMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35, metalness: 0.05 });
addTubeBetween(toThree(3.85, -0.45, 2.08), toThree(4.04, -0.45, 2.08), 0.010, steelMat, windStation);
for (let ds = 0; ds < 6; ds++) {
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.075, 0.012, 16), shieldMat);
  plate.position.copy(toThree(4.04, -0.45, 2.01 + ds * 0.024));
  windStation.add(plate);
}

// Horizontal Anodized Instrument Cross-Arm at z = 3.15 m
addTubeBetween(toThree(3.85, -0.82, 3.15), toThree(3.85, -0.08, 3.15), 0.015, steelMat, windStation);
addTubeBetween(toThree(3.85, -0.82, 3.15), toThree(3.85, -0.82, 3.24), 0.014, clampMat, windStation);
addTubeBetween(toThree(3.85, -0.08, 3.15), toThree(3.85, -0.08, 3.24), 0.014, clampMat, windStation);

// True 3-Cup Hollow Hemisphere Anemometer (North side of cross-arm, y = -0.82 m)
const anemoRotor = new THREE.Group();
anemoRotor.position.copy(toThree(3.85, -0.82, 3.25));
const rotorHub = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.026, 0.05, 12), clampMat);
anemoRotor.add(rotorHub);
const cupOuterMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.32, metalness: 0.35, side: THREE.DoubleSide });
const cupRimMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.35, metalness: 0.2 });
const cupGeo = new THREE.SphereGeometry(0.042, 14, 10, 0, Math.PI);
const rimGeo = new THREE.TorusGeometry(0.042, 0.004, 8, 16);
for (let k = 0; k < 3; k++) {
  const armPivot = new THREE.Group();
  armPivot.rotation.y = (k * 2 * Math.PI) / 3;
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.16, 6), steelMat);
  arm.rotation.z = Math.PI / 2;
  arm.position.x = 0.08;
  const cup = new THREE.Mesh(cupGeo, cupOuterMat);
  cup.position.x = 0.165;
  const rim = new THREE.Mesh(rimGeo, cupRimMat);
  rim.position.x = 0.165;
  armPivot.add(arm, cup, rim);
  anemoRotor.add(armPivot);
}
windStation.add(anemoRotor);

// Aerodynamic Wind Direction Vane (South side of cross-arm, y = -0.08 m)
const windVane = new THREE.Group();
windVane.position.copy(toThree(3.85, -0.08, 3.26));
const vaneHub = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.020, 0.04, 10), clampMat);
windVane.add(vaneHub);
const vaneRod = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.28, 6), steelMat);
vaneRod.rotation.z = Math.PI / 2;
windVane.add(vaneRod);
const vaneNose = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.06, 8), clampMat);
vaneNose.rotation.z = -Math.PI / 2;
vaneNose.position.x = 0.15;
const vaneFin = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.085, 0.006), cupRimMat);
vaneFin.position.set(-0.13, 0.025, 0);
windVane.add(vaneNose, vaneFin);
windStation.add(windVane);

// Top-center Solar Pyranometer Dome + Lightning Finial
const pyraBase = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.06, 0.025, 14), shieldMat);
pyraBase.position.copy(toThree(3.85, -0.45, 3.27));
const pyraGlass = new THREE.Mesh(
  new THREE.SphereGeometry(0.028, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
  new THREE.MeshStandardMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.72, roughness: 0.08, envMapIntensity: 1.25 })
);
pyraGlass.position.copy(toThree(3.85, -0.45, 3.28));
windStation.add(pyraBase, pyraGlass);

// Enfarm-Inspired 7-in-1 Soil Nutrient & EC Station (White/Emerald Solar Telemetry Post + 3-Prong Probe)
function makeEnfarmFaceTex() {
  const c = document.createElement("canvas");
  c.width = 256; c.height = 192;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 0, 256, 192);
  // Signature Enfarm emerald green header band
  ctx.fillStyle = "#15803d";
  ctx.fillRect(0, 0, 256, 54);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 24px Segoe UI, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("7-IN-1 SOIL AI", 128, 36);
  // Crisp OLED readout card
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(22, 70, 212, 92);
  ctx.strokeStyle = "#16a34a";
  ctx.lineWidth = 3;
  ctx.strokeRect(22, 70, 212, 92);
  ctx.fillStyle = "#4ade80";
  ctx.font = "bold 20px Consolas, monospace";
  ctx.fillText("NPK | EC 2.1 | pH 6.2", 128, 108);
  ctx.fillStyle = "#bae6fd";
  ctx.font = "17px Consolas, monospace";
  ctx.fillText("MOIST 68% • 24.5C", 128, 140);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

{
  const enfarmWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.28, metalness: 0.06 });
  const enfarmGreenMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.34, metalness: 0.08 });
  const enfarmLedMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
  const enfarmFaceMat = new THREE.MeshStandardMaterial({ map: makeEnfarmFaceTex(), roughness: 0.30, metalness: 0.08 });
  const enfarmSolarMat = new THREE.MeshStandardMaterial({ map: texSolarOuter, roughness: 0.16, metalness: 0.45, envMapIntensity: 1.2 });

  const postFootGeo = new THREE.CylinderGeometry(0.052, 0.058, 0.020, 12);
  const bodyCylGeo = new THREE.CylinderGeometry(0.056, 0.050, 0.155, 14);
  const collarRingGeo = new THREE.CylinderGeometry(0.055, 0.052, 0.036, 14);
  const ledRingGeo = new THREE.TorusGeometry(0.051, 0.0045, 6, 16);
  const solarCapGeo = new THREE.BoxGeometry(0.115, 0.016, 0.115);
  const solarCellGeo = new THREE.PlaneGeometry(0.098, 0.098);
  const antGeo = new THREE.CylinderGeometry(0.003, 0.005, 0.15, 6);
  const badgeGeo = new THREE.PlaneGeometry(0.082, 0.064);
  const probeGripGeo = new THREE.CylinderGeometry(0.022, 0.026, 0.068, 12);
  const probeCapGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.016, 12);
  const prongGeo = new THREE.CylinderGeometry(0.0025, 0.0012, 0.065, 6);

  function addEnfarmSoilStation(sideSign, byBag) {
    // Post placed cleanly on weed-mat shoulder next to walkway (visible down central aisle!)
    const xPost = sideSign * 0.84;
    const xProbe = sideSign * 1.07; // Inserted cleanly inside coco-peat growbag beside melon stem

    const foot = new THREE.Mesh(postFootGeo, pipeMat);
    foot.position.copy(toThree(xPost, byBag, 0.032));
    domeGroup.add(foot);

    addTubeBetween(toThree(xPost, byBag, 0.035), toThree(xPost, byBag, 0.39), 0.015, steelMat, domeGroup);

    const collar = new THREE.Mesh(collarRingGeo, enfarmGreenMat);
    collar.position.copy(toThree(xPost, byBag, 0.398));
    domeGroup.add(collar);

    const body = new THREE.Mesh(bodyCylGeo, enfarmWhiteMat);
    body.position.copy(toThree(xPost, byBag, 0.485));
    body.castShadow = !isMobileDevice;
    domeGroup.add(body);

    const ledRing = new THREE.Mesh(ledRingGeo, enfarmLedMat);
    ledRing.rotation.x = Math.PI / 2;
    ledRing.position.copy(toThree(xPost, byBag, 0.558));
    domeGroup.add(ledRing);

    // Front readout sticker facing toward center concrete aisle (-sideSign * X)
    const badge = new THREE.Mesh(badgeGeo, enfarmFaceMat);
    badge.position.copy(toThree(xPost - sideSign * 0.056, byBag, 0.488));
    badge.rotation.y = sideSign < 0 ? Math.PI / 2 : -Math.PI / 2;
    domeGroup.add(badge);

    // Tilted self-charging solar cap + LoRa/4G whip antenna
    const cap = new THREE.Mesh(solarCapGeo, enfarmGreenMat);
    cap.position.copy(toThree(xPost, byBag, 0.575));
    cap.rotation.z = sideSign < 0 ? -0.24 : 0.24;
    const cell = new THREE.Mesh(solarCellGeo, enfarmSolarMat);
    cell.rotation.x = -Math.PI / 2;
    cell.position.y = 0.009;
    cap.add(cell);
    domeGroup.add(cap);

    const ant = new THREE.Mesh(antGeo, pipeMat);
    ant.position.copy(toThree(xPost + sideSign * 0.034, byBag + 0.034, 0.64));
    domeGroup.add(ant);

    // Emerald & Stainless Multi-Prong 7-in-1 Soil Probe plugged directly into coco-peat root zone
    const pGrip = new THREE.Mesh(probeGripGeo, enfarmGreenMat);
    pGrip.position.copy(toThree(xProbe, byBag, 0.295));
    const pCollar = new THREE.Mesh(probeCapGeo, enfarmWhiteMat);
    pCollar.position.copy(toThree(xProbe, byBag, 0.264));
    domeGroup.add(pGrip, pCollar);

    for (const pyOff of [-0.011, 0.0, 0.011]) {
      const prong = new THREE.Mesh(prongGeo, steelMat);
      prong.position.copy(toThree(xProbe, byBag + pyOff, 0.238));
      domeGroup.add(prong);
    }

    // Flexible waterproof RS485 cable arcing smoothly between probe top & telemetry post gland
    const cableCurve = new THREE.CatmullRomCurve3([
      toThree(xProbe, byBag, 0.326),
      toThree((xProbe + xPost) * 0.5 + sideSign * 0.04, byBag + 0.02, 0.30),
      toThree(xPost + sideSign * 0.042, byBag, 0.405),
    ]);
    domeGroup.add(new THREE.Mesh(new THREE.TubeGeometry(cableCurve, 12, 0.0045, 5, false), pipeMat));
  }

  // Place Zone 1 hero station (Hotspot #6) and Zone 2 station cleanly along walkway shoulders
  addEnfarmSoilStation(-1, 3.12);
  addEnfarmSoilStation(1, 7.92);
}

// Flush ALL queued static tubes (frame columns, arches, purlins, gable bars, IoT stand, wind mast) into <= 4 InstancedMesh calls!
{
  const unitCyl = new THREE.CylinderGeometry(1, 1, 1, 8, 1);
  for (const { mat, matrices } of staticTubeBatches.values()) {
    const inst = new THREE.InstancedMesh(unitCyl, mat, matrices.length);
    for (let i = 0; i < matrices.length; i++) inst.setMatrixAt(i, matrices[i]);
    inst.instanceMatrix.needsUpdate = true;
    inst.castShadow = mat === steelMat || mat === gutterMat;
    inst.receiveShadow = false;
    domeGroup.add(inst);
  }
  staticTubeBatches.clear();
}

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
    body: "Tấm pin cong 2 lớp chỉ trượt từ vách hông lên đỉnh vòm khi trưa nắng bức xạ cao (> 33°C) để cắt nhiệt và phát điện; sáng sớm, trời mưa (mái màng PE đã che mưa) hoặc gió lốc đều thu gọn bên vách.",
    specs: ["Sáng/Mưa 0% (Đón PAR)", "Trưa nắng 100% (Cắt nhiệt)", "Động cơ DC 24V"],
  },
  {
    id: "hs_mesh",
    num: 2,
    pos3d: toThree(3.0, 2.6, 1.35),
    label: "Mái PE kín nước & Lưới 32 Mesh",
    badge: "VỎ LAI ĐÀ LẠT (PE + LƯỚI 32 MESH)",
    body: "Vòm mái trên lợp màng nhựa PE UV kín nước chịu trách nhiệm che mưa 100% & dẫn nước về máng xối; toàn bộ vách hông, đầu hồi vòm và cửa lùa bọc lưới 32 mesh ngăn côn trùng và thông gió tự nhiên.",
    specs: ["Mái PE chống mưa & UV", "Vách & đầu hồi lưới 32 Mesh", "Chân vách PE kín nền"],
  },
  {
    id: "hs_melon",
    num: 3,
    pos3d: toThree(1.1, 5.4, 1.15),
    label: "Canh tác dưa lưới nhỏ giọt",
    badge: "MÔ HÌNH PILOT 65–75 NGÀY",
    body: "84 gốc dưa lưới trong túi giá thể xơ dừa sạch, tưới nhỏ giọt theo hàng. Mái màng PE kín bảo vệ cây khỏi mưa dông/sương muối suốt 24/7, còn tấm pin trượt chỉ kích hoạt khi trưa nắng gắt để giữ nhiệt độ quanh 25–33°C.",
    specs: ["4 Luống × 21 gốc", "Giá thể xơ dừa", "Mái PE che mưa & sương"],
  },
  {
    id: "hs_iot",
    num: 4,
    pos3d: toThree(-2.52, 1.2, 1.62),
    label: "Tủ điều khiển biên AI & Fail-Safe",
    badge: "ĐIỀU KHIỂN LAI & LỘ TRÌNH RUST",
    body: "Đặt trên bệ bê tông chống ẩm & giá thép H cố định xuống sàn; giai đoạn đầu dùng ESP32 Rule-Based + AI dự báo và định hướng thương mại hóa nâng cấp firmware Rust (esp-rs/embassy).",
    specs: ["Bệ bê tông + Khung thép H", "Ắc quy LiFePO4 nối ống kín", "Nâng cấp Rust (GĐ sau)"],
  },
  {
    id: "hs_wind",
    num: 5,
    pos3d: toThree(3.85, -0.45, 3.45),
    label: "Trạm đo gió & Khí tượng Đà Lạt",
    badge: "AN TOÀN GIÓ LỐC CAO NGUYÊN",
    body: "Cột đo khí tượng lắp độc lập trên móng bê tông & 4 bản mã tăng cứng phía trước góc phải (cách ly hoàn toàn khỏi hành lang trượt pin & ray dẫn hướng), gồm 3 chén rỗng đo gió, cánh hướng gió, tán bức xạ Stevenson & Pyranometer.",
    specs: ["Đặt độc lập ngoài ray pin", "3 chén gió + Cánh hướng gió", "Ưu tiên ngắt cứng Fail-Safe"],
  },
  {
    id: "hs_soil",
    num: 6,
    pos3d: toThree(-0.84, 3.12, 0.72),
    label: "Cảm biến dinh dưỡng đất & EC",
    badge: "ĐỊNH HƯỚNG CHUẨN ENFARM (7 CHỈ SỐ)",
    body: "Thiết kế theo cấu trúc trạm đo đất thông minh Enfarm F+: đầu dò 3 chấu thép không gỉ cắm trực tiếp vùng rễ xơ dừa đo 7 chỉ số thời gian thực (N-P-K, pH, EC, ẩm, nhiệt độ), nối cáp tới trụ phát đáp dùng pin mặt trời & ăng-ten LoRa/4G chống thất thoát 50–60% phân bón.",
    specs: ["Đầu dò 7 chỉ số N-P-K/EC/pH", "Trạm phát đáp pin mặt trời", "Chuẩn API mở / RS485"],
  },
  {
    id: "hs_rain",
    num: 7,
    pos3d: toThree(-3.9, 11.65, 1.45),
    label: "Máng xối hở trên chống va chạm pin",
    badge: "THU NƯỚC MƯA CHUẨN TRỌNG LỰC",
    body: "Màng nhựa PE mái vòm đảm nhiệm che mưa 100% (trời mưa pin thu gọn vách không cần đưa lên), dừng tại x = ±2,84 m rủ mép trực tiếp vào lòng máng xối hở trên (x = ±2,84–3,00 m) về bồn chứa mà vẫn tách biệt hoàn toàn khỏi ray trượt ngoài cột (6–13,5 cm).",
    specs: ["Mái PE che mưa 100%", "Máng hở trên ±2,84–3,00 m", "0% va chạm ray trượt pin"],
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
    scene.fog.density = 0.0085; // Soft Da Lat morning valley mist
    valleyMistMat.opacity = 0.38;
    updateTelemetry(19.5, 100, 9, 0.8, "Thu gọn (Đón nắng sớm)", "tele-ok");
  } else if (mode === "heatwave") {
    targetDeploy = 1.0;
    rainLines.visible = false;
    sunLight.intensity = 3.05;
    sunLight.color.setHex(0xffedd5);
    hemiLight.intensity = 0.90;
    scene.fog.color.setHex(0xfef3c7);
    scene.fog.density = 0.0042;
    valleyMistMat.opacity = 0.14;
    updateTelemetry(31.2, 62, 7, 3.0, "Phủ nóc (Giảm bức xạ 37°C)", "tele-warn");
  } else if (mode === "rainstorm") {
    targetDeploy = 0.0; // Mái nhựa PE đã che mưa kín -> Không cần đưa tấm pin lên!
    rainLines.visible = true;
    sunLight.intensity = 1.05;
    sunLight.color.setHex(0xe2e8f0);
    hemiLight.intensity = 0.72;
    scene.fog.color.setHex(0xcbd5e1);
    scene.fog.density = 0.0115;
    valleyMistMat.opacity = 0.44;
    updateTelemetry(18.2, 58, 24, 0.5, "Thu gọn (Mái PE che mưa)", "tele-ok");
  } else if (mode === "typhoon") {
    targetDeploy = 0.0;
    rainLines.visible = true;
    sunLight.intensity = 0.9;
    sunLight.color.setHex(0xcbd5e1);
    hemiLight.intensity = 0.65;
    scene.fog.color.setHex(0x94a3b8);
    scene.fog.density = 0.0145;
    valleyMistMat.opacity = 0.50;
    updateTelemetry(17.0, 46, 56, 0.3, "FAIL-SAFE: Thu gọn bão!", "tele-danger");
  }
  document.getElementById("solar-slider").value = Math.round(targetDeploy * 100);
  document.getElementById("solar-pct").textContent = `${Math.round(targetDeploy * 100)}%`;
  document.getElementById("dock-solar").classList.toggle("active", targetDeploy > 0.5);
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
  const basePar = currentWeather === "rainstorm" ? 58 : currentWeather === "typhoon" ? 46 : 100;
  const par = Math.round(basePar * (1.0 - 0.38 * targetDeploy));
  const pvScale = currentWeather === "rainstorm" || currentWeather === "typhoon" ? 0.35 : 1.0;
  const pv = Number(((0.7 + 2.3 * targetDeploy) * pvScale).toFixed(1));
  const temp = currentWeather === "heatwave" ? 37.2 - 6.0 * targetDeploy : (currentWeather === "rainstorm" ? 18.2 : 19.5) - 1.2 * targetDeploy;
  const windSpd = currentWeather === "typhoon" ? 56 : currentWeather === "rainstorm" ? 24 : 9;
  const modeTxt = val > 50
    ? "Phủ nóc (Che nắng & Phát điện)"
    : currentWeather === "rainstorm"
      ? "Thu gọn (Mái PE che mưa)"
      : "Thu gọn vách hông";
  updateTelemetry(temp, par, windSpd, pv, modeTxt, val > 50 ? "tele-warn" : "tele-ok");
  document.getElementById("dock-solar").classList.toggle("active", targetDeploy > 0.5);
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
  return { hs, btn, shown: true, lastX: -9999, lastY: -9999 };
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
  e.currentTarget.classList.toggle("active", shown);
});

let winW = window.innerWidth;
let winH = window.innerHeight;
const _projVec = new THREE.Vector3();

function updateHotspotsProjection() {
  const w = winW, h = winH;
  const yMax = w <= 860 ? h - 195 : h - 85;
  for (let i = 0; i < hsElements.length; i++) {
    const item = hsElements[i];
    _projVec.copy(item.hs.pos3d).project(camera);
    if (_projVec.z > 1.0 || _projVec.z < -1.0) {
      if (item.shown) {
        item.btn.style.display = "none";
        item.shown = false;
      }
      continue;
    }
    const sx = (_projVec.x * 0.5 + 0.5) * w;
    const sy = (-_projVec.y * 0.5 + 0.5) * h;
    if (sx < 34 || sx > w - 34 || sy < 95 || sy > yMax) {
      if (item.shown) {
        item.btn.style.display = "none";
        item.shown = false;
      }
    } else {
      if (!item.shown) {
        item.btn.style.display = "flex";
        item.shown = true;
      }
      if (Math.abs(sx - item.lastX) > 0.25 || Math.abs(sy - item.lastY) > 0.25) {
        item.btn.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0) translate(-50%, -50%)`;
        item.lastX = sx;
        item.lastY = sy;
      }
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
  sidebar.classList.toggle("collapsed");
});
btnMobileMenu.addEventListener("click", () => {
  sidebar.classList.toggle("collapsed");
});

function updateWalkUI() {
  document.getElementById("walk-hud").classList.toggle("hidden", !isWalkMode);
  document.getElementById("dock-walk").classList.toggle("active", isWalkMode);
  const autoBtn = document.getElementById("btn-auto-walk");
  autoBtn.classList.toggle("active", isAutoWalk);
  const lbl = autoBtn.querySelector(".btn-lbl");
  if (lbl) lbl.textContent = isAutoWalk ? "Dừng bước" : "Tự bước vào vườn";
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
document.querySelectorAll("[data-action='open-mobile-app']").forEach((el) => {
  el.addEventListener("click", () => {
    window.location.href = "./app/";
  });
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
      <p><b>Green Info – Pilot Đà Lạt (Lâm Đồng, 1.500 m):</b> Giải quyết bài toán tích nhiệt nhà kính ("hiệu ứng đảo nhiệt"), mưa gió cao nguyên và thoát nước tràn mái nhà kính tại Đà Lạt.</p>
      <h4>3 Đổi mới cốt lõi:</h4>
      <ul>
        <li><b>Mái vòm trượt lồng 2 tầng:</b> Sáng sương, trời mưa (đã có màng nhựa PE che mưa) hay gió lốc đều thu gọn pin về vách để đón tối đa ánh sáng tán xạ, tiết kiệm ắc quy và hạ tâm gió (Fail-Safe); chỉ trượt phủ mái khi trưa nắng bức xạ cao để hạ nhiệt &amp; phát điện.</li>
        <li><b>Mái PE kín nước &amp; Máng xối hở trên:</b> Màng nhựa PE vòm trên che mưa 100% và dừng tại <code>x = ±2,84 m</code> đổ thẳng vào lòng máng xối hở trên (<code>x = ±2,84–3,00 m</code>), tách biệt hoàn toàn hành lang trượt pin ngoài cột (<code>6–13,5 cm</code>) và xả cuối nhà về bồn chứa.</li>
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
  winW = window.innerWidth;
  winH = window.innerHeight;
  camera.aspect = winW / winH;
  camera.updateProjectionMatrix();
  renderer.setSize(winW, winH);
  if (winW <= 860) {
    sidebar.classList.add("collapsed");
  }
});

let lastTime = performance.now();
let currentDoorOpen = 0.0;
const _curTarget = new THREE.Vector3();
const _lookFwd = new THREE.Vector3();
const _orbitDir = new THREE.Vector3();
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
  windVane.rotation.y = -0.35 + Math.sin(now * 0.002) * (currentWeather === "typhoon" ? 0.38 : 0.12);
  const targetAmp = currentWeather === "typhoon" ? 0.14 : currentWeather === "rainstorm" ? 0.065 : 0.022;
  foliageWindUniforms.uTime.value = now * 0.001;
  foliageWindUniforms.uAmp.value += (targetAmp - foliageWindUniforms.uAmp.value) * Math.min(1, dt * 3.0);

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
    _curTarget.lerpVectors(twFromTarget, twToTarget, e);
    camera.position.copy(camPos);
    camera.lookAt(_curTarget);
    syncYawPitchFromLookAt(camPos, _curTarget);
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
    _lookFwd.set(
      -Math.sin(camYaw) * Math.cos(camPitch),
      Math.sin(camPitch),
      -Math.cos(camYaw) * Math.cos(camPitch)
    );
    camera.lookAt(camPos.x + _lookFwd.x, camPos.y + _lookFwd.y, camPos.z + _lookFwd.z);
  } else {
    if (isAutoRotate) {
      camYaw += 0.14 * dt;
      const dist = camPos.distanceTo(orbitTarget);
      _orbitDir.set(
        -Math.sin(camYaw) * Math.cos(camPitch),
        Math.sin(camPitch),
        -Math.cos(camYaw) * Math.cos(camPitch)
      );
      camPos.copy(orbitTarget).sub(_orbitDir.multiplyScalar(dist));
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
