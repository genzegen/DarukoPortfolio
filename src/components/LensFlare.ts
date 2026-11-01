import * as THREE from "three";

export type LensFlareHandle = {
  group: THREE.Group;
  // visibility: 0 = fully occluded, 1 = unobstructed line of sight to the sun
  update: (
    camera: THREE.PerspectiveCamera,
    sunWorld: THREE.Vector3,
    visibility: number,
    delta: number,
  ) => void;
  dispose: () => void;
};

type FlareElement = {
  sprite: THREE.Sprite;
  material: THREE.SpriteMaterial;
  // position along the sun -> screen-center axis: 1 = on the sun, 0 = center,
  // negative = mirrored past the center (where real lens ghosts land)
  axis: number;
  // size as a fraction of the screen height (x / y separately for streaks)
  sizeX: number;
  sizeY: number;
  opacity: number;
  spin: number;
};

function makeCanvas(w: number, h = w) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create canvas context");
  return { canvas, ctx };
}

// Soft disc with a faint brighter rim — the classic aperture ghost
function makeGhostTexture(size = 128) {
  const { canvas, ctx } = makeCanvas(size);
  const c = size / 2;
  const g = ctx.createRadialGradient(c, c, 0, c, c, c);
  g.addColorStop(0.0, "rgba(255,255,255,0.35)");
  g.addColorStop(0.75, "rgba(255,255,255,0.45)");
  g.addColorStop(0.9, "rgba(255,255,255,0.7)");
  g.addColorStop(1.0, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

// Hexagonal ghost, matches a 6-blade camera aperture
function makeHexTexture(size = 128) {
  const { canvas, ctx } = makeCanvas(size);
  const c = size / 2;
  const r = size * 0.44;
  ctx.filter = "blur(2px)";
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i + Math.PI / 6;
    const x = c + Math.cos(a) * r;
    const y = c + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  const g = ctx.createRadialGradient(c, c, 0, c, c, r);
  g.addColorStop(0, "rgba(255,255,255,0.25)");
  g.addColorStop(0.85, "rgba(255,255,255,0.5)");
  g.addColorStop(1, "rgba(255,255,255,0.8)");
  ctx.fillStyle = g;
  ctx.fill();
  return new THREE.CanvasTexture(canvas);
}

// Thin halo ring
function makeRingTexture(size = 256) {
  const { canvas, ctx } = makeCanvas(size);
  const c = size / 2;
  const g = ctx.createRadialGradient(c, c, 0, c, c, c);
  g.addColorStop(0.0, "rgba(255,255,255,0)");
  g.addColorStop(0.82, "rgba(255,255,255,0)");
  g.addColorStop(0.9, "rgba(255,255,255,0.8)");
  g.addColorStop(0.97, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

// Starburst glare: thin radial rays of random length around a hot core
function makeStarburstTexture(size = 512) {
  const { canvas, ctx } = makeCanvas(size);
  const c = size / 2;
  ctx.globalCompositeOperation = "lighter";

  const RAYS = 48;
  for (let i = 0; i < RAYS; i++) {
    const a = (i / RAYS) * Math.PI * 2 + Math.random() * 0.05;
    const len = c * (0.35 + Math.random() * 0.65);
    const g = ctx.createLinearGradient(
      c,
      c,
      c + Math.cos(a) * len,
      c + Math.sin(a) * len,
    );
    g.addColorStop(0, "rgba(255,255,255,0.5)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.strokeStyle = g;
    ctx.lineWidth = 0.6 + Math.random() * 1.4;
    ctx.beginPath();
    ctx.moveTo(c, c);
    ctx.lineTo(c + Math.cos(a) * len, c + Math.sin(a) * len);
    ctx.stroke();
  }

  const core = ctx.createRadialGradient(c, c, 0, c, c, c * 0.5);
  core.addColorStop(0, "rgba(255,255,255,0.9)");
  core.addColorStop(0.15, "rgba(255,255,255,0.35)");
  core.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = core;
  ctx.fillRect(0, 0, size, size);

  return new THREE.CanvasTexture(canvas);
}

// Horizontal anamorphic streak
function makeStreakTexture() {
  const { canvas, ctx } = makeCanvas(512, 32);
  const gx = ctx.createLinearGradient(0, 0, 512, 0);
  gx.addColorStop(0, "rgba(255,255,255,0)");
  gx.addColorStop(0.5, "rgba(255,255,255,1)");
  gx.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gx;
  ctx.fillRect(0, 0, 512, 32);

  // fade vertically so the streak is a soft line, not a bar
  ctx.globalCompositeOperation = "destination-in";
  const gy = ctx.createLinearGradient(0, 0, 0, 32);
  gy.addColorStop(0, "rgba(0,0,0,0)");
  gy.addColorStop(0.5, "rgba(0,0,0,1)");
  gy.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gy;
  ctx.fillRect(0, 0, 512, 32);

  return new THREE.CanvasTexture(canvas);
}

/**
 * Screen-space lens flare. The group must be parented to the camera
 * (camera itself added to the scene) — elements are laid out on the
 * camera's z = -1 plane so they behave like light inside the lens.
 */
export function createLensFlare(): LensFlareHandle {
  const group = new THREE.Group();
  group.name = "lensFlare";
  group.renderOrder = 999;

  const textures = {
    ghost: makeGhostTexture(),
    hex: makeHexTexture(),
    ring: makeRingTexture(),
    burst: makeStarburstTexture(),
    streak: makeStreakTexture(),
  };

  const elements: FlareElement[] = [];

  const add = (
    tex: THREE.Texture,
    color: number,
    axis: number,
    sizeX: number,
    opacity: number,
    sizeY = sizeX,
    spin = 0,
  ) => {
    const material = new THREE.SpriteMaterial({
      map: tex,
      color,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
    });
    const sprite = new THREE.Sprite(material);
    sprite.renderOrder = 999;
    sprite.frustumCulled = false;
    group.add(sprite);
    elements.push({ sprite, material, axis, sizeX, sizeY, opacity, spin });
  };

  // On the source
  add(textures.burst, 0xffd6e2, 1, 0.42, 0.55, 0.42, 0.15);
  add(textures.streak, 0xff8fb4, 1, 1.9, 0.35, 0.035);
  add(textures.ring, 0xff9ec0, 1, 0.55, 0.06);

  // Ghosts marching through the screen center to the opposite side
  add(textures.hex, 0xff6f9c, 0.55, 0.05, 0.16);
  add(textures.ghost, 0xffb37a, 0.3, 0.025, 0.22);
  add(textures.hex, 0x8f6bff, -0.15, 0.08, 0.1);
  add(textures.ghost, 0xff3f7a, -0.4, 0.15, 0.06);
  add(textures.ring, 0x6fa8ff, -0.65, 0.24, 0.05);
  add(textures.hex, 0xc85cff, -0.95, 0.11, 0.08);
  add(textures.ghost, 0x7affd6, -1.25, 0.04, 0.12);

  const sunNdc = new THREE.Vector3();
  const camForward = new THREE.Vector3();
  const toSun = new THREE.Vector3();
  let smoothedIntensity = 0;

  const update = (
    camera: THREE.PerspectiveCamera,
    sunWorld: THREE.Vector3,
    visibility: number,
    delta: number,
  ) => {
    camera.updateMatrixWorld();
    camera.getWorldDirection(camForward);
    toSun.copy(sunWorld).sub(camera.position).normalize();
    const facing = camForward.dot(toSun);

    sunNdc.copy(sunWorld).project(camera);

    let target = 0;
    if (facing > 0) {
      // Fade out as the source leaves the frame (keep a little glare just
      // outside the edge, like real glass catching off-axis light).
      const edge = Math.max(Math.abs(sunNdc.x), Math.abs(sunNdc.y));
      const onScreen = 1 - THREE.MathUtils.smoothstep(edge, 0.85, 1.35);
      // Flares strengthen as the source nears the optical axis
      const axial = 0.65 + 0.35 * (1 - Math.min(1, Math.hypot(sunNdc.x, sunNdc.y)));
      target = onScreen * axial * visibility;
    }

    // Frame-rate independent smoothing so occlusion doesn't pop
    const k = 1 - Math.exp(-delta * 10);
    smoothedIntensity += (target - smoothedIntensity) * k;

    group.visible = smoothedIntensity > 0.002;
    if (!group.visible) return;

    const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    const halfW = halfH * camera.aspect;
    const screenH = halfH * 2;
    // Rays rotate as the source moves across the frame
    const burstAngle = Math.atan2(sunNdc.y, sunNdc.x);

    for (const el of elements) {
      el.sprite.position.set(
        sunNdc.x * el.axis * halfW,
        sunNdc.y * el.axis * halfH,
        -1,
      );
      el.sprite.scale.set(el.sizeX * screenH, el.sizeY * screenH, 1);
      el.material.opacity = el.opacity * smoothedIntensity;
      if (el.spin) el.material.rotation = burstAngle * el.spin;
    }
  };

  const dispose = () => {
    elements.forEach((el) => el.material.dispose());
    Object.values(textures).forEach((t) => t.dispose());
    group.clear();
  };

  return { group, update, dispose };
}
