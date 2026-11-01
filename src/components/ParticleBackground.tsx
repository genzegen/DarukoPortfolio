import * as THREE from "three";
import { useEffect, useRef } from "react";
import { createPlanetSphere } from "./PlanetSphere";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { createLargeGlowTexture } from "./GlowTexture";
import { isUIHovered } from "../utils/SceneIntegration";
import {
  createSpaceAtmosphere,
  SUN_DIRECTION,
  SUN_POSITION,
} from "./SpaceAtmosphere";
import { createLensFlare } from "./LensFlare";
import { CAMERA_PRESETS, DETAIL_PRESETS } from "../utils/CameraPresets";
import type { SectionName, ViewMode } from "../utils/CameraPresets";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

type Props = {
  hoveredIndex: number | null;
  activeScreen: string;
  viewMode: "brief" | "detail";
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
    size / 2,
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

// Shortest-path angle interpolation (avoids spinning the long way round)
function lerpAngle(from: number, to: number, t: number): number {
  const diff = Math.atan2(Math.sin(to - from), Math.cos(to - from));
  return from + diff * t;
}

// Frame-rate independent lerp factor
function damp(rate: number, delta: number): number {
  return 1 - Math.exp(-rate * delta);
}

type AvatarState = "walk" | "scan" | "notice" | "stare";

function seededRand(seed: number): number {
  const x = Math.sin(seed + 1) * 43758.5453123;
  return x - Math.floor(x);
}

const ParticleBackground = ({
  hoveredIndex,
  activeScreen,
  viewMode,
}: Props) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const hoveredRef = useRef<number | null>(hoveredIndex);
  const currentPresetRef = useRef<SectionName>("home");
  const viewModeRef = useRef<ViewMode>("brief");
  const prevViewModeRef = useRef<ViewMode>("brief");
  const lookAtTarget = useRef(new THREE.Vector3(0, 0.1, 0));
  const currentRoll = useRef(0);

  useEffect(() => {
    hoveredRef.current = hoveredIndex;
  }, [hoveredIndex]);

  useEffect(() => {
    currentPresetRef.current = activeScreen as keyof typeof CAMERA_PRESETS;
  }, [activeScreen]);

  useEffect(() => {
    viewModeRef.current = viewMode;
  }, [viewMode]);

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

    // Key light coming from the distant energy source, so the planet and
    // avatar are lit from the same direction the glow is seen in.
    const sunLight = new THREE.DirectionalLight(0xff9ab8, 1.4);
    sunLight.position.copy(SUN_DIRECTION).multiplyScalar(10);
    scene.add(sunLight);
    scene.add(sunLight.target);

    const red = new THREE.PointLight(0xf48fb1, 12, 10);
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
      1000,
    );

    // Initial camera placement — snap straight to the home preset.
    // (No floatX/floatY here: those only exist per-frame inside animate().)
    const cameraTarget = {
      position: CAMERA_PRESETS.home.position.clone(),
      lookAt: CAMERA_PRESETS.home.lookAt.clone(),
    };

    // Camera lives in the scene so the screen-space lens flare can ride on it
    scene.add(camera);
    const lensFlare = createLensFlare();
    camera.add(lensFlare.group);

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
      0.45,
    );

    composer.addPass(bloomPass);

    mountRef.current.innerHTML = "";
    mountRef.current.appendChild(renderer.domElement);

    const planet = createPlanetSphere();
    scene.add(planet.group);

    const loader = new GLTFLoader();

    let avatarGroup: THREE.Group | null = null;
    let avatarMixer: THREE.AnimationMixer | null = null;
    const avatarClips: Record<string, THREE.AnimationAction> = {};
    const avatarMaterials: THREE.MeshStandardMaterial[] = [];
    let avatarBaseY = 0;
    let avatarHoverT = 0.5; // smoothed 0->1, eases toward 1 while any menu item is hovered

    // --- avatar behaviour: wander -> stop & look around -> spot the
    // viewer -> stare at them -> wander again ---
    const AVATAR_HOME = new THREE.Vector3(1.2, 0.3, 0.5);
    const PLANET_CENTER = new THREE.Vector3(0.22, -0.2, 0);
    const PLANET_RADIUS = 0.92; // matches PLANET_SCALE in PlanetSphere
    const WANDER_RADIUS = 0.32;
    const WALK_SPEED = 0.13; // world units / second

    let avatarState: AvatarState = "walk";
    let stateTime = 0;
    let stateDuration = 0;
    let avatarYaw = 0;
    let scanBaseYaw = 0;
    let walkWeight = 0;
    let walkAction: THREE.AnimationAction | null = null;
    const walkTarget = new THREE.Vector3();
    const avatarPos = AVATAR_HOME.clone(); // ground position, before float
    const toTarget = new THREE.Vector3();
    let lastCameraAngle = 0;

    const pickWalkTarget = () => {
      for (let i = 0; i < 12; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = WANDER_RADIUS * (0.35 + Math.random() * 0.65);
        walkTarget.set(
          AVATAR_HOME.x + Math.cos(a) * r,
          AVATAR_HOME.y,
          AVATAR_HOME.z + Math.sin(a) * r,
        );
        // keep clear of the planet surface and far enough to be a real walk
        if (
          walkTarget.distanceTo(PLANET_CENTER) > PLANET_RADIUS + 0.28 &&
          walkTarget.distanceTo(avatarPos) > 0.12
        ) {
          return;
        }
      }
      walkTarget.copy(AVATAR_HOME);
    };

    const setAvatarState = (next: AvatarState) => {
      avatarState = next;
      stateTime = 0;
      switch (next) {
        case "walk":
          pickWalkTarget();
          stateDuration = 7;
          break;
        case "scan":
          scanBaseYaw = avatarYaw;
          stateDuration = 2.4 + Math.random() * 1.4;
          break;
        case "notice":
          stateDuration = 0.45;
          break;
        case "stare":
          stateDuration = 2.8 + Math.random() * 2.2;
          break;
      }
    };
    setAvatarState("walk");

    loader.load("/models/amongus_model.glb", (gltf) => {
      avatarGroup = new THREE.Group();
      avatarGroup.name = "avatarGroup";
      avatarGroup.position.copy(AVATAR_HOME);
      // yaw first, then lean/tilt relative to where it's facing
      avatarGroup.rotation.order = "YXZ";
      avatarBaseY = avatarGroup.position.y;

      gltf.scene.scale.setScalar(0.00195);

      avatarGroup.add(gltf.scene);

      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const mats = Array.isArray(child.material)
            ? child.material
            : [child.material];

          mats.forEach((mat) => {
            if (mat instanceof THREE.MeshStandardMaterial) {
              // Soft red/cyan-ish emissive glow
              mat.emissive = new THREE.Color(0xff244f);
              mat.emissiveIntensity = 0.15;

              avatarMaterials.push(mat);
            }
          });
        }
      });

      if (gltf.animations.length > 0) {
        avatarMixer = new THREE.AnimationMixer(gltf.scene);
        gltf.animations.forEach((clip) => {
          avatarClips[clip.name] = avatarMixer!.clipAction(clip);
        });
        console.log(
          "[avatar] baked clips found:",
          gltf.animations.map((c) => c.name),
        );
        // The baked clip is a walk cycle — keep it running and blend its
        // weight so the avatar stands still when it stops to look around.
        const firstClipName = Object.keys(avatarClips)[0];
        if (firstClipName) {
          walkAction = avatarClips[firstClipName];
          walkAction.setLoop(THREE.LoopRepeat, Infinity);
          walkAction.setEffectiveWeight(0);
          walkAction.play();
        }
      } else {
        console.log("[avatar] no baked clips on this model — procedural only.");
      }

      scene.add(avatarGroup);
    });

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

    const LERP_TO_DETAIL = 0.017;
    const LERP_TO_BRIEF = 0.012;

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

    depthGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(depthPositions, 3),
    );

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
    const targetPosition = new THREE.Vector3();
    const correctedPosition = new THREE.Vector3();
    const forward = new THREE.Vector3();
    const rolledUp = new THREE.Vector3();
    const flareRayDir = new THREE.Vector3();
    const flareToPlanet = new THREE.Vector3();
    let animationId: number;
    let rotationSpeed = 0.001;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // getElapsedTime() would call getDelta() internally and throw the
      // delta away — split it so the avatar animation below can use both.
      const delta = clock.getDelta();
      const time = clock.elapsedTime;

      const pos = geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < COUNT; i++) {
        angles[i] += speeds[i];
        const r = radii[i];

        const bx = Math.cos(angles[i]) * r;
        const bz = Math.sin(angles[i]) * r;
        const by = Math.sin(angles[i] * 2 + time) * 0.03;

        const dx =
          Math.sin(time * noiseFreqX[i] + noiseOffX[i]) * noiseAmpXZ[i];
        const dy = Math.sin(time * noiseFreqY[i] + noiseOffY[i]) * noiseAmpY[i];
        const dz =
          Math.cos(time * noiseFreqZ[i] + noiseOffZ[i]) * noiseAmpXZ[i];

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
          Math.sin(depthAngles[i]) * r,
        );
      }
      dpos.needsUpdate = true;

      // --- avatar: procedural float + hover reaction ---
      if (avatarGroup) {
        // Update baked GLB animation
        avatarMixer?.update(delta);

        const hovering = hoveredRef.current !== null;

        // Smooth hover response
        avatarHoverT += ((hovering ? 1 : 0) - avatarHoverT) * 0.06;

        // Natural floating motion
        const floatY =
          Math.sin(time * 1.1) * 0.12 + Math.sin(time * 0.37 + 1.3) * 0.05;

        const hoverLift = avatarHoverT * 0.08;


        // Viewer moved to another angle -> it lost track of them and has to
        // look around again before finding them.
        const cameraAngle = Math.atan2(camera.position.x, camera.position.z);
        const cameraJump = Math.abs(
          Math.atan2(
            Math.sin(cameraAngle - lastCameraAngle),
            Math.cos(cameraAngle - lastCameraAngle),
          ),
        );
        lastCameraAngle = cameraAngle;
        if (cameraJump > 0.004 && avatarState === "stare") {
          setAvatarState("scan");
        }

        // Hovering a menu item always gets its attention
        if (hovering && (avatarState === "walk" || avatarState === "scan")) {
          setAvatarState("notice");
        }

        stateTime += delta;

        const yawToCamera = Math.atan2(
          camera.position.x - avatarGroup.position.x,
          camera.position.z - avatarGroup.position.z,
        );

        let targetWalkWeight = 0;
        let lean = 0;
        let tilt = Math.sin(time * 0.6 + 0.8) * 0.04;
        let hop = 0;

        switch (avatarState) {
          case "walk": {
            toTarget.subVectors(walkTarget, avatarPos);
            toTarget.y = 0;
            const dist = toTarget.length();
            const desiredYaw = Math.atan2(toTarget.x, toTarget.z);
            avatarYaw = lerpAngle(avatarYaw, desiredYaw, damp(5, delta));

            // only step forward once roughly facing the way it's going
            const facing = Math.cos(
              Math.atan2(
                Math.sin(desiredYaw - avatarYaw),
                Math.cos(desiredYaw - avatarYaw),
              ),
            );
            const step = Math.min(
              dist,
              WALK_SPEED * delta * Math.max(0, facing),
            );
            if (dist > 1e-4) avatarPos.addScaledVector(toTarget, step / dist);

            targetWalkWeight = 1;
            lean = 0.06; // slight forward lean while walking
            tilt += Math.sin(time * 7.5) * 0.03; // waddle

            if (dist < 0.02 || stateTime > stateDuration) {
              setAvatarState(Math.random() < 0.7 ? "scan" : "walk");
            }
            break;
          }
          case "scan": {
            // look left... right... left, easing between glances
            const p = stateTime / stateDuration;
            const sweep = Math.sin(p * Math.PI * 2.5) * 1.1;
            avatarYaw = lerpAngle(
              avatarYaw,
              scanBaseYaw + sweep,
              damp(4, delta),
            );
            tilt += Math.sin(p * Math.PI * 2.5) * 0.08; // head-tilt while searching
            if (stateTime > stateDuration) {
              setAvatarState(Math.random() < 0.65 ? "notice" : "walk");
            }
            break;
          }
          case "notice": {
            // snap round to the viewer with a little startled hop
            const p = Math.min(1, stateTime / stateDuration);
            avatarYaw = lerpAngle(avatarYaw, yawToCamera, damp(14, delta));
            hop = Math.sin(p * Math.PI) * 0.07;
            lean = -0.08 * Math.sin(p * Math.PI); // rears back in surprise
            if (stateTime > stateDuration) setAvatarState("stare");
            break;
          }
          case "stare": {
            // keep watching the viewer, leaning in curiously
            avatarYaw = lerpAngle(avatarYaw, yawToCamera, damp(6, delta));
            lean = 0.1 + Math.sin(time * 1.3) * 0.02;
            tilt = Math.sin(time * 0.9) * 0.14;
            if (!hovering && stateTime > stateDuration) setAvatarState("walk");
            break;
          }
        }

        walkWeight += (targetWalkWeight - walkWeight) * damp(6, delta);
        if (walkAction) {
          walkAction.setEffectiveWeight(walkWeight);
          walkAction.timeScale = 0.6 + walkWeight * 0.5;
        }

        avatarGroup.position.x = avatarPos.x;
        avatarGroup.position.z = avatarPos.z;
        avatarGroup.position.y = avatarBaseY + floatY + hoverLift + hop;
        avatarGroup.rotation.y = avatarYaw;
        avatarGroup.rotation.x = THREE.MathUtils.lerp(
          avatarGroup.rotation.x,
          lean,
          damp(6, delta),
        );
        avatarGroup.rotation.z = THREE.MathUtils.lerp(
          avatarGroup.rotation.z,
          tilt,
          damp(6, delta),
        );

        // Slightly grow when hovered
        const hoverScale = 1 + avatarHoverT * 0.06;

        avatarGroup.scale.setScalar(hoverScale);

        // -----------------------------------------
        // SOFT GLOW
        // -----------------------------------------

        // const glowIntensity =
        //   0.12 + avatarHoverT * 0.18;

        // avatarMaterials.forEach((mat) => {
        //   mat.emissiveIntensity = glowIntensity;
        // });
      }

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
      spaceAtmosphere.update(time);

      // --- Camera transition ---
      const preset =
        viewModeRef.current === "detail"
          ? DETAIL_PRESETS[currentPresetRef.current]
          : CAMERA_PRESETS[currentPresetRef.current];

      const returningToBrief =
        viewModeRef.current === "brief" && prevViewModeRef.current === "detail";

      const baseLerpSpeed = returningToBrief ? LERP_TO_BRIEF : LERP_TO_DETAIL;

      targetPosition.copy(preset.position);

      const bob = Math.sin(time * 0.3) * 0.02;
      targetPosition.y += bob;

      if (allowMouseMovement && isMoving) {
        targetPosition.x += 0.2;
        targetPosition.y += 0.1;
        targetPosition.z -= 0.5;
      }

      const cameraLerp = allowMouseMovement && isMoving ? 0.03 : baseLerpSpeed;
      camera.position.lerp(targetPosition, cameraLerp);

      const distFromOrigin = camera.position.length();
      if (distFromOrigin < MIN_ORBIT_DIST) {
        correctedPosition.copy(camera.position).setLength(MIN_ORBIT_DIST);
        camera.position.lerp(correctedPosition, 0.15);
      }

      // CHANGED: was hardcoded 0.03
      const nextFov = THREE.MathUtils.lerp(
        camera.fov,
        preset.fov,
        baseLerpSpeed,
      );

      if (Math.abs(camera.fov - nextFov) > 0.001) {
        camera.fov = nextFov;
        camera.updateProjectionMatrix();
      }

      lookAtTarget.current.lerp(preset.lookAt, baseLerpSpeed);

      currentRoll.current = THREE.MathUtils.lerp(
        currentRoll.current,
        preset.roll,
        baseLerpSpeed,
      );

      forward.copy(lookAtTarget.current).sub(camera.position).normalize();
      rolledUp.set(0, 1, 0).applyAxisAngle(forward, currentRoll.current);

      camera.up.copy(rolledUp);
      camera.lookAt(lookAtTarget.current);

      prevViewModeRef.current = viewModeRef.current;

      // --- lens flare: fades when the planet blocks the line of sight ---
      flareRayDir.copy(SUN_POSITION).sub(camera.position).normalize();
      flareToPlanet.subVectors(PLANET_CENTER, camera.position);
      const along = flareToPlanet.dot(flareRayDir);
      let sunVisibility = 1;
      if (along > 0) {
        const missDistance = flareToPlanet
          .addScaledVector(flareRayDir, -along)
          .length();
        sunVisibility = THREE.MathUtils.smoothstep(
          missDistance,
          PLANET_RADIUS * 0.94,
          PLANET_RADIUS * 1.12,
        );
      }
      lensFlare.update(camera, SUN_POSITION, sunVisibility, delta);

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
      renderer.dispose();
      spaceAtmosphere.dispose();
      lensFlare.dispose();

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
