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

export const CAMERA_PRESETS = {
    home: presetAtAngle(0 * ANGLE_STEP, 72, 0),
    projects: presetAtAngle(1 * ANGLE_STEP, 65, -0.04),
    skills: presetAtAngle(2 * ANGLE_STEP, 63, -0.055),
    about: presetAtAngle(3 * ANGLE_STEP, 59, -0.02),
    contact: presetAtAngle(4 * ANGLE_STEP, 64, -0.025),
} as const;