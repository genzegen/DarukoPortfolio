import * as THREE from "three";
import { createNoise3D } from "simplex-noise";
import { createLargeGlowTexture } from "./GlowTexture";
import { isUIHovered } from "../utils/SceneIntegration";

const noise3D = createNoise3D();

export type PlanetSphereHandle = {
  group: THREE.Group;
  update: (hoveredIndex: number | null, time: number) => void;
  dispose: () => void;
};

export function createPlanetSphere(): PlanetSphereHandle {
  // Group
  const PLANET_SCALE = 0.92;
  const group = new THREE.Group();
  group.position.set(0.22, -0.2, 0);
  group.scale.setScalar(PLANET_SCALE);

  // Core sphere
  const sphereGeo = new THREE.SphereGeometry(1, 128, 128);
  const position = sphereGeo.attributes.position;

  for (let i = 0; i < position.count; i++) {
    const vertex = new THREE.Vector3().fromBufferAttribute(position, i);

    const noise = noise3D(
      vertex.x * 2,
      vertex.y * 2,
      vertex.z * 2
    );

    vertex.normalize().multiplyScalar(
      1 + noise * 0.03
    );

    position.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }

  position.needsUpdate = true;
  sphereGeo.computeVertexNormals();

  const textureLoader = new THREE.TextureLoader();
  const planetTexture = textureLoader.load("/textures/liquid.jpg");
  planetTexture.minFilter = THREE.LinearMipMapLinearFilter;
  planetTexture.magFilter = THREE.LinearFilter;
  planetTexture.anisotropy = 4;
  planetTexture.generateMipmaps = true;

  const coreMat = new THREE.MeshStandardMaterial({
    map: planetTexture,
    color: 0xffffff,
    roughness: 0.3,
    metalness: 0.05,
    emissive: new THREE.Color(0x7a1048),
    emissiveIntensity: 0.7,
  });
  
  const coreMesh = new THREE.Mesh(sphereGeo, coreMat);
  coreMesh.scale.setScalar(0.985);
  group.add(coreMesh);

  const smokeMaterial = new THREE.SpriteMaterial({
    map: createLargeGlowTexture(),
    color: new THREE.Color(0xff3366),
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const smokeSprite = new THREE.Sprite(smokeMaterial);

  smokeSprite.scale.set(1.7, 1.7, 1);
  smokeSprite.position.z = -0.05;

  group.add(smokeSprite);

  let planetSpinSpeed = 0.0018;

  // Update
  const update = (hoveredIndex: number | null, time: number) => {
    const isHovered = hoveredIndex !== null;

    coreMesh.rotation.y += planetSpinSpeed;
    coreMesh.rotation.x = 0.18 + Math.sin(time * 0.07) * 0.25;

    const target = isHovered ? 0.4 : 0.3;
    const targetSpin = isUIHovered ? 0.038 : 0.0018;
    planetSpinSpeed = THREE.MathUtils.lerp(
      planetSpinSpeed,
      targetSpin,
      0.05
    );

    coreMat.emissiveIntensity = THREE.MathUtils.lerp(
      coreMat.emissiveIntensity,
      target + Math.sin(time * 1.4) * 0.03,
      0.08
    );

    const pulse = 1 + Math.sin(time * 0.8) * 0.05;

    smokeSprite.scale.set(
      2.8 * pulse,
      2.8 * pulse,
      1
    );  

    smokeSprite.material.opacity =
      0.25 + Math.sin(time * 0.5) * 0.05;

  };

  // Dispose
  const dispose = () => {
    sphereGeo.dispose();
    coreMat.dispose();
    planetTexture.dispose();
    smokeMaterial.map?.dispose();
    smokeMaterial.dispose();
  };

  return { group, update, dispose };
}
