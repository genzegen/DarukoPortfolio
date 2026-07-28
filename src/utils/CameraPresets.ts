import * as THREE from "three";

export const CAMERA_PRESETS = {
    home: {
        position: new THREE.Vector3(0.3, 0.25, 2.8),
        lookAt: new THREE.Vector3(0, 0.1, 0),
    },

    projects: {
        position: new THREE.Vector3(1.2, 0.55, 2.2),
        lookAt: new THREE.Vector3(0.2, 0, 0),
    },

    skills: {
        position: new THREE.Vector3(-1.2, 0.4, 2.3),
        lookAt: new THREE.Vector3(-0.2, 0.05, 0),
    },

    about: {
        position: new THREE.Vector3(0.1, 2.2, 0.35),
        lookAt: new THREE.Vector3(0, 0, 0),
    },

    contact: {
        position: new THREE.Vector3(-0.8, -0.6, 2.0),
        lookAt: new THREE.Vector3(0, -0.15, 0),
    },
};