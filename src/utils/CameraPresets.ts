import * as THREE from "three";

export const CAMERA_PRESETS = {
home: {
// Front view — starting point
position: new THREE.Vector3(0.3, 0.25, 2.8),
lookAt: new THREE.Vector3(0, 0.1, 0),
fov: 72,
roll: 0,
},

projects: {
// First clockwise step — front-right
position: new THREE.Vector3(2.75, 0.55, 0.95),
lookAt: new THREE.Vector3(-0.55, 0.1, 0.25),
fov: 65,
roll: -0.04,
},

skills: {
// Second clockwise step — back-right
position: new THREE.Vector3(1.65, 0.35, -2.25),
lookAt: new THREE.Vector3(-0.65, 0.1, -0.2),
fov: 63,
roll: -0.055,
},

about: {
// Third clockwise step — back-left
position: new THREE.Vector3(-1.65, 1.35, -2.25),
lookAt: new THREE.Vector3(0.3, 0.2, -0.35),
fov: 59,
roll: -0.02,
},

contact: {
// Fourth clockwise step — front-left
// Returning to Home completes the final equal step.
position: new THREE.Vector3(-2.75, -0.25, 0.95),
lookAt: new THREE.Vector3(0.55, 0.05, 0.2),
fov: 64,
roll: 0.025,
},
} as const;
