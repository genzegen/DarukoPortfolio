import * as THREE from "three";
import { useEffect, useRef } from "react";
import { createPlanetSphere } from "./PlanetSphere";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { createLargeGlowTexture } from "./GlowTexture";
import { isUIHovered } from "../utils/SceneIntegration";
import { createSpaceAtmosphere } from "./SpaceAtmosphere";
import { CAMERA_PRESETS } from "../utils/CameraPresets";

type Props = {
  hoveredIndex: number | null;
  activeScreen: string;
};

function createGlowTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create canvas context");

  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );

  gradient.addColorStop(0.0, "rgba(255, 255, 255, 1.0)");
  gradient.addColorStop(0.15, "rgba(255, 80, 100, 0.9)");
  gradient.addColorStop(0.4, "rgba(200, 0, 40, 0.4)");
  gradient.addColorStop(0.7, "rgba(120, 0, 20, 0.1)");
  gradient.addColorStop(1.0, "rgba(0, 0, 0, 0.0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  return new THREE.CanvasTexture(canvas);
}

function seededRand(seed: number): number {
  const x = Math.sin(seed + 1) * 43758.5453123;
  return x - Math.floor(x);
}

const ParticleBackground = ({
  hoveredIndex,
  activeScreen
}: Props) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const hoveredRef = useRef<number | null>(hoveredIndex);
  const currentPresetRef = useRef<keyof typeof CAMERA_PRESETS>("home");
  const lookAtTarget = useRef(new THREE.Vector3(0, 0.1, 0));

  useEffect(() => {
    hoveredRef.current = hoveredIndex;
  }, [hoveredIndex]);

  useEffect(() => {
    currentPresetRef.current =
      activeScreen as keyof typeof CAMERA_PRESETS;
  }, [activeScreen]);

  useEffect(() => {
    if (!mountRef.current) return;

    let lastMoveTime = performance.now();

    const handleMouseMove = () => {
      lastMoveTime = performance.now();
    };
    window.addEventListener("mousemove", handleMouseMove);

    const scene = new THREE.Scene();

    const spaceAtmosphere = createSpaceAtmosphere();
    scene.add(spaceAtmosphere.group);

    scene.add(new THREE.AmbientLight(0x2a0010, 0.35));

    const red = new THREE.PointLight(0xfff48fb1, 22, 10);
    red.position.set(-2, 1, 2);
    scene.add(red);

    const purple = new THREE.PointLight(0x7b3cff, 16, 10);
    purple.position.set(4, -1, 1);
    scene.add(purple);

    const fill = new THREE.PointLight(0xc850ff, 4, 14);
    fill.position.set(0, 0, -5);
    scene.add(fill);

    const camera = new THREE.PerspectiveCamera(
      72,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    // Initial camera placement — snap straight to the home preset.
    // (No floatX/floatY here: those only exist per-frame inside animate().)
    const cameraTarget = {
      position: CAMERA_PRESETS.home.position.clone(),
      lookAt: CAMERA_PRESETS.home.lookAt.clone(),
    };

    camera.position.copy(cameraTarget.position);
    camera.lookAt(cameraTarget.lookAt);
    lookAtTarget.current.copy(cameraTarget.lookAt);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    renderer.domElement.style.position = "fixed";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.zIndex = "0";
    renderer.domElement.style.pointerEvents = "none";

    const composer = new EffectComposer(renderer);

    composer.setSize(window.innerWidth, window.innerHeight);
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.98,
      0.6,
      0.45
    );

    composer.addPass(bloomPass);

    mountRef.current.innerHTML = "";
    mountRef.current.appendChild(renderer.domElement);

    const planet = createPlanetSphere();
    scene.add(planet.group);

    const COUNT = 4500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(COUNT * 3);

    const angles = new Float32Array(COUNT);
    const speeds = new Float32Array(COUNT);
    const radii = new Float32Array(COUNT);
    const noiseOffX = new Float32Array(COUNT);
    const noiseOffY = new Float32Array(COUNT);
    const noiseOffZ = new Float32Array(COUNT);
    const noiseFreqX = new Float32Array(COUNT);
    const noiseFreqY = new Float32Array(COUNT);
    const noiseFreqZ = new Float32Array(COUNT);
    const noiseAmpXZ = new Float32Array(COUNT);
    const noiseAmpY = new Float32Array(COUNT);

    const RING_RADIUS = 2.5;
    const MIN_ORBIT_DIST = RING_RADIUS + 0.5;

    for (let i = 0; i < COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = RING_RADIUS + (Math.random() - 0.5) * 0.5;

      angles[i] = angle;
      speeds[i] = 0.0003 + Math.random() * 0.0004;
      radii[i] = r;

      positions[i * 3] = Math.cos(angle) * r;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.12;
      positions[i * 3 + 2] = Math.sin(angle) * r;

      noiseOffX[i] = seededRand(i * 3 + 0) * Math.PI * 2;
      noiseOffY[i] = seededRand(i * 3 + 1) * Math.PI * 2;
      noiseOffZ[i] = seededRand(i * 3 + 2) * Math.PI * 2;
      noiseFreqX[i] = 0.15 + seededRand(i * 7 + 0) * 0.45;
      noiseFreqY[i] = 0.15 + seededRand(i * 7 + 1) * 0.45;
      noiseFreqZ[i] = 0.15 + seededRand(i * 7 + 2) * 0.45;
      noiseAmpXZ[i] = 0.015 + seededRand(i * 11) * 0.045;
      noiseAmpY[i] = 0.006 + seededRand(i * 13) * 0.028;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const glowTexture = createGlowTexture();
    const material = new THREE.PointsMaterial({
      size: 0.055,
      map: glowTexture,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const DEPTH_COUNT = 600;
    const depthGeometry = new THREE.BufferGeometry();
    const depthPositions = new Float32Array(DEPTH_COUNT * 3);
    const depthAngles = new Float32Array(DEPTH_COUNT);
    const depthSpeeds = new Float32Array(DEPTH_COUNT);
    const depthRadii = new Float32Array(DEPTH_COUNT);

    for (let i = 0; i < DEPTH_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = RING_RADIUS + (Math.random() - 0.5) * 1.2;

      depthAngles[i] = angle;
      depthSpeeds[i] = 0.0001 + Math.random() * 0.0002;
      depthRadii[i] = r;

      depthPositions[i * 3] = Math.cos(angle) * r;
      depthPositions[i * 3 + 1] = (Math.random() - 0.5) * 0.4;
      depthPositions[i * 3 + 2] = Math.sin(angle) * r;
    }

    depthGeometry.setAttribute("position", new THREE.BufferAttribute(depthPositions, 3));

    const largeGlowTexture = createLargeGlowTexture();
    const depthMaterial = new THREE.PointsMaterial({
      size: 0.18,
      map: largeGlowTexture,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const depthPoints = new THREE.Points(depthGeometry, depthMaterial);
    scene.add(depthPoints);

    const clock = new THREE.Clock();
    let animationId: number;
    let rotationSpeed = 0.001;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      const pos = geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < COUNT; i++) {
        angles[i] += speeds[i];
        const r = radii[i];

        const bx = Math.cos(angles[i]) * r;
        const bz = Math.sin(angles[i]) * r;
        const by = Math.sin(angles[i] * 2 + time) * 0.03;

        const dx = Math.sin(time * noiseFreqX[i] + noiseOffX[i]) * noiseAmpXZ[i];
        const dy = Math.sin(time * noiseFreqY[i] + noiseOffY[i]) * noiseAmpY[i];
        const dz = Math.cos(time * noiseFreqZ[i] + noiseOffZ[i]) * noiseAmpXZ[i];

        pos.setXYZ(i, bx + dx, by + dy, bz + dz);
      }
      pos.needsUpdate = true;

      const dpos = depthGeometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < DEPTH_COUNT; i++) {
        depthAngles[i] += depthSpeeds[i];
        const r = depthRadii[i];

        dpos.setXYZ(
          i,
          Math.cos(depthAngles[i]) * r,
          Math.sin(depthAngles[i] * 1.5 + time * 0.4) * 0.06,
          Math.sin(depthAngles[i]) * r
        );
      }
      dpos.needsUpdate = true;

      const breath = (Math.sin(time * 0.08) + 1) / 2;
      const breathe = 0.9 + Math.pow(breath, 2) * 0.25;
      const isMoving = performance.now() - lastMoveTime < 1000;
      const allowMouseMovement = currentPresetRef.current === "home";

      const interacting = isMoving || isUIHovered;

      const targetRotationSpeed = interacting ? 0.008 : 0.0008;

      rotationSpeed += (targetRotationSpeed * breathe - rotationSpeed) * 0.02;
      points.rotation.y += rotationSpeed;
      depthPoints.rotation.y += rotationSpeed * 0.6;

      planet.update(hoveredRef.current, time);
      spaceAtmosphere.update(clock.getElapsedTime());

      // --- Camera transition ---
      const preset = CAMERA_PRESETS[currentPresetRef.current];

      const targetPosition = preset.position.clone();

      const bob = Math.sin(time * 0.3) * 0.02;
      targetPosition.y += bob;

      if (allowMouseMovement && isMoving) {
        targetPosition.x += 0.2;
        targetPosition.y += 0.1;
        targetPosition.z -= 0.5;
      }

      const cameraLerp = allowMouseMovement && isMoving ? 0.03 : 0.01;
      camera.position.lerp(targetPosition, cameraLerp);

      const distFromOrigin = camera.position.length();
      if (distFromOrigin < MIN_ORBIT_DIST) {
        const corrected = camera.position.clone().setLength(MIN_ORBIT_DIST);
        camera.position.lerp(corrected, 0.15); // gentle push-out, not instant
      }

      const nextFov = THREE.MathUtils.lerp(
        camera.fov,
        preset.fov,
        0.03
      );

      if (Math.abs(camera.fov - nextFov) > 0.001) {
        camera.fov = nextFov;
        camera.updateProjectionMatrix();
      }

      lookAtTarget.current.lerp(
        preset.lookAt,
        0.03
      );

      camera.lookAt(
        lookAtTarget.current
      );

      camera.rotation.z = THREE.MathUtils.lerp(
        camera.rotation.z,
        preset.roll,
        0.03
      );

      composer.render();
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    if (!mountRef.current) return;
    const mount = mountRef.current;

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);

      planet.dispose();
      geometry.dispose();
      depthGeometry.dispose();
      material.dispose();
      depthMaterial.dispose();
      glowTexture.dispose();
      largeGlowTexture.dispose();
      composer.dispose();
      spaceAtmosphere.dispose();

      if (mount && renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 w-full h-full overflow-hidden"
    />
  );
};

export default ParticleBackground;