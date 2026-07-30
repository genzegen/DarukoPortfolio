import * as THREE from "three";

export const CAMERA_PRESETS = {
  home: {
    // Main menu: balanced, centered composition
    position: new THREE.Vector3(0.3, 0.25, 2.8),
    lookAt: new THREE.Vector3(0, 0.1, 0),
    fov: 72,
    roll: 0,
  },

  projects: {
    // Right side of the ring, near-level height.
    // Planet held left, content space opens on the right.
    position: new THREE.Vector3(2.1, 0.4, 2.0),
    lookAt: new THREE.Vector3(-1.1, 0.15, -1.0),
    fov: 68,
    roll: -0.03,
  },

  skills: {
    // Left side of the ring, mirrored but not identical to projects
    // (slightly higher) so it reads as a distinct shot.
    // Planet held right, content space opens on the left.
    position: new THREE.Vector3(-2.1, 0.65, 2.0),
    lookAt: new THREE.Vector3(1.1, 0.2, -1.0),
    fov: 68,
    roll: 0.03,
  },

  about: {
    // Slightly elevated, pulled back a touch along the ring plane.
    // Planet drifts lower-left, leaving the upper frame open for copy.
    position: new THREE.Vector3(1.4, 1.15, 2.35),
    lookAt: new THREE.Vector3(-1.0, 0.15, -1.1),
    fov: 65,
    roll: -0.02,
  },

  contact: {
    // Low angle, opposite side from about.
    // Planet drifts upper-right, leaving the lower frame open.
    position: new THREE.Vector3(-1.6, 0.13, 3.3),
    lookAt: new THREE.Vector3(0.6, -1.65, -1.1),
    fov: 66,
    roll: -0.025,
  },
} as const;