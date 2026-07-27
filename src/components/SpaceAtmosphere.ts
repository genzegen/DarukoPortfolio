import * as THREE from 'three';

export type SpaceAtmosphereHandle = {
    group: THREE.Group;
    update: (time: number) => void;
    dispose: () => void;
};

const NEBULA_COLORS = [
    '#3a1461', // deep violet
    '#5c1f78', // purple
    '#8a2f8f', // magenta-violet
    '#1c2a6e', // indigo
    '#14506e', // teal-blue accent
];

const NEBULA_LAYER_COUNT = 14;
const NEBULA_MIN_RADIUS = 260;
const NEBULA_MAX_RADIUS = 620;
const NEBULA_MIN_SCALE = 220;
const NEBULA_MAX_SCALE = 520;

const STAR_COUNT = 3000;
const STAR_MIN_RADIUS = 700;
const STAR_MAX_RADIUS = 1600;

function hexToRgb(hex: string): [number, number, number] {
    const n = parseInt(hex.replace('#', ''), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// soft radial-gradient sprite texture
function makeGlowTexture(hexColor: string, size = 256): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const [r, g, b] = hexToRgb(hexColor);
    const cx = size / 2;
    const cy = size / 2;

    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, size / 2);
    gradient.addColorStop(0.0, `rgba(${r}, ${g}, ${b}, 0.55)`);
    gradient.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, 0.28)`);
    gradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, 0.08)`);
    gradient.addColorStop(1.0, `rgba(${r}, ${g}, ${b}, 0.0)`);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

// Small soft dot texture used for stars (glowy point, not a hard square)
function makeStarTexture(size = 64): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const cx = size / 2;
    const cy = size / 2;
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, size / 2);
    gradient.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.9)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.25)');
    gradient.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

function randRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
}

function randomOnSphere(radius: number): THREE.Vector3 {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(randRange(-0.85, 0.85)); // avoid extreme poles
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    return new THREE.Vector3(x, y, z);
}


export function createSpaceAtmosphere(): SpaceAtmosphereHandle {
    const group = new THREE.Group();
    group.name = 'spaceAtmosphere';

    const disposables: { dispose: () => void }[] = [];

    // -------------------- nebula cloud layer --------------------
    const nebulaGroup = new THREE.Group();
    nebulaGroup.name = 'nebulaClouds';

    type NebulaSprite = {
        sprite: THREE.Sprite;
        baseOpacity: number;
        pulseSpeed: number;
        pulsePhase: number;
        spinSpeed: number;
        driftAxis: THREE.Vector3;
        driftSpeed: number;
        basePosition: THREE.Vector3;
    };

    const nebulaSprites: NebulaSprite[] = [];

    for (let i = 0; i < NEBULA_LAYER_COUNT; i++) {
        const color = NEBULA_COLORS[i % NEBULA_COLORS.length];
        const texture = makeGlowTexture(color);
        disposables.push(texture);

        const material = new THREE.SpriteMaterial({
        map: texture,
        color: 0xffffff,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: randRange(0.18, 0.4),
        });
        disposables.push(material);

        const sprite = new THREE.Sprite(material);
        const radius = randRange(NEBULA_MIN_RADIUS, NEBULA_MAX_RADIUS);
        const position = randomOnSphere(radius);
        sprite.position.copy(position);

        const scale = randRange(NEBULA_MIN_SCALE, NEBULA_MAX_SCALE);
        sprite.scale.set(scale, scale, 1);

        nebulaGroup.add(sprite);

        nebulaSprites.push({
        sprite,
        baseOpacity: material.opacity,
        pulseSpeed: randRange(0.05, 0.15),
        pulsePhase: Math.random() * Math.PI * 2,
        spinSpeed: randRange(-0.02, 0.02),
        driftAxis: new THREE.Vector3(
            randRange(-1, 1),
            randRange(-1, 1),
            randRange(-1, 1)
        ).normalize(),
        driftSpeed: randRange(0.0015, 0.004),
        basePosition: position.clone(),
        });
    }

    group.add(nebulaGroup);

    // -------------------- starfield layer --------------------
    const starTexture = makeStarTexture();
    disposables.push(starTexture);

    const starPositions = new Float32Array(STAR_COUNT * 3);
    const starColors = new Float32Array(STAR_COUNT * 3);
    const starSizes = new Float32Array(STAR_COUNT);

    // subtle palette: mostly white/blue-white, occasional warm pink accents
    const tintPalette: [number, number, number][] = [
        [1.0, 1.0, 1.0],
        [0.8, 0.85, 1.0],
        [0.9, 0.75, 1.0],
        [1.0, 0.8, 0.9], // faint pink, echoes the planet
    ];

    for (let i = 0; i < STAR_COUNT; i++) {
        const radius = randRange(STAR_MIN_RADIUS, STAR_MAX_RADIUS);
        const p = randomOnSphere(radius);
        starPositions[i * 3] = p.x;
        starPositions[i * 3 + 1] = p.y;
        starPositions[i * 3 + 2] = p.z;

        const tint = tintPalette[Math.floor(Math.random() * tintPalette.length)];
        const brightness = randRange(0.5, 1.0);
        starColors[i * 3] = tint[0] * brightness;
        starColors[i * 3 + 1] = tint[1] * brightness;
        starColors[i * 3 + 2] = tint[2] * brightness;

        starSizes[i] = randRange(1.0, 3.2);
    }

    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));
    disposables.push(starGeometry);

    const starMaterial = new THREE.PointsMaterial({
        size: 2,
        map: starTexture,
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
    });
    disposables.push(starMaterial);

    const starField = new THREE.Points(starGeometry, starMaterial);
    starField.name = 'starField';
    group.add(starField);


    function update(time: number) {
        // whole nebula drifts very slowly, like a distant cloud rotating
        nebulaGroup.rotation.y = time * 0.006;
        nebulaGroup.rotation.x = Math.sin(time * 0.0009) * 0.05;

        // starfield counter-rotates even more slowly for parallax depth
        starField.rotation.y = -time * 0.0015;

        for (const layer of nebulaSprites) {
        const material = layer.sprite.material as THREE.SpriteMaterial;

        // gentle opacity pulse, like breathing gas clouds
        const pulse =
            0.5 + 0.5 * Math.sin(time * layer.pulseSpeed + layer.pulsePhase);
        material.opacity = layer.baseOpacity * (0.7 + 0.3 * pulse);

        // slow sprite-plane spin for a bit of internal motion
        material.rotation += layer.spinSpeed * 0.01;

        // tiny orbital drift around its base position
        const driftAngle = time * layer.driftSpeed;
        const offset = layer.driftAxis
            .clone()
            .multiplyScalar(Math.sin(driftAngle) * 12);
        layer.sprite.position.copy(layer.basePosition).add(offset);
        }
    }

    function dispose() {
        for (const item of disposables) {
        item.dispose();
        }
        nebulaGroup.clear();
        group.clear();
    }

    return { group, update, dispose };
}