import * as THREE from "three";

const CAMERA_RADIUS = 2.8;     // distance from the planet's center
const CAMERA_HEIGHT = 0.35;    // constant camera altitude
const LOOKAT_RADIUS = 0.5;     // how far the look-at point drifts past center
const LOOKAT_HEIGHT = 0.12;    // look-at altitude

const ANGLE_STEP = -72; // degrees, negative = clockwise when viewed from above

interface CameraPreset {
    position: THREE.Vector3;
    lookAt: THREE.Vector3;
    fov: number;
    roll: number;
}

function presetAtAngle(angleDeg: number, fov: number, roll: number): CameraPreset {
    const rad = THREE.MathUtils.degToRad(angleDeg);

    const x = CAMERA_RADIUS * Math.sin(rad);
    const z = CAMERA_RADIUS * Math.cos(rad);

    const lookX = -LOOKAT_RADIUS * Math.sin(rad);
    const lookZ = -LOOKAT_RADIUS * Math.cos(rad);

    return {
        position: new THREE.Vector3(x, CAMERA_HEIGHT, z),
        lookAt: new THREE.Vector3(lookX, LOOKAT_HEIGHT, lookZ),
        fov,
        roll,
    };
}

function detailPresetFrom(
    base: CameraPreset,
    extraAngleDeg: number,
    fovDelta: number
): CameraPreset {
    const offsetRad = THREE.MathUtils.degToRad(extraAngleDeg);
    const rotatedPosition = base.position
        .clone()
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), offsetRad)
        .multiplyScalar(1.15);

    const outwardDirection = 
        rotatedPosition
            .clone()
            .setY(0)
            .normalize();

    const rightDirection = new THREE.Vector3(
        outwardDirection.z,
        0,
        -outwardDirection.x
    )

    const detailPosition = rotatedPosition
        .add(outwardDirection.multiplyScalar(1.2))
        .add(rightDirection.multiplyScalar(1.4));

    const detailLookAt = base.lookAt
        .clone()
        .add(rightDirection.multiplyScalar(1.5));

    return {
        position: detailPosition,
        lookAt: detailLookAt,
        fov: base.fov + fovDelta,
        roll: base.roll,
    };
}

// camera angles for normal (brief) view
export const CAMERA_PRESETS = {
    home: presetAtAngle(0 * ANGLE_STEP, 72, 0),
    projects: presetAtAngle(1 * ANGLE_STEP, 65, -0.04),
    skills: presetAtAngle(2 * ANGLE_STEP, 63, -0.055),
    about: presetAtAngle(3 * ANGLE_STEP, 59, -0.02),
    contact: presetAtAngle(4 * ANGLE_STEP, 64, -0.025),
} as const;

export type SectionName = keyof typeof CAMERA_PRESETS;
export type ViewMode = "brief" | "detail";

// camera angles for detailed view
export const DETAIL_PRESETS: Record<SectionName, CameraPreset> = {
    home: detailPresetFrom(CAMERA_PRESETS.home, 55, -8),
    projects: detailPresetFrom(CAMERA_PRESETS.projects, 55, -8),
    skills: detailPresetFrom(CAMERA_PRESETS.skills, 55, -8),
    about: detailPresetFrom(CAMERA_PRESETS.about, 55, -8),
    contact: detailPresetFrom(CAMERA_PRESETS.contact, 55, -8),
};