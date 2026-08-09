import * as THREE from 'three';

export const AvatarLoop = {
    Idle: 'Idle',
    Curious: 'Curious',
    Hiding: 'Hiding',
    ComingOut: 'ComingOut',
    Moving: 'Moving',
    Scanning: 'Scanning'
} as const;

export type AvatarLoopType = typeof AvatarLoop[keyof typeof AvatarLoop];

// Ensures avatar.userData has a cached "resting" transform to animate
// relative to, so switching states or calling repeatedly doesn't drift.
function ensureBaseTransform(avatar: THREE.Group) {
    if (!avatar.userData.basePosition) {
        avatar.userData.basePosition = avatar.position.clone();
        avatar.userData.baseRotation = avatar.rotation.clone();
        avatar.userData.baseScale = avatar.scale.clone();
    }
    return {
        basePos: avatar.userData.basePosition as THREE.Vector3,
        baseRot: avatar.userData.baseRotation as THREE.Euler,
        baseScale: avatar.userData.baseScale as THREE.Vector3,
    };
}

export function animateIdle(
    avatar: THREE.Group,
    time: number
) {
    const { basePos, baseRot, baseScale } = ensureBaseTransform(avatar);

    // Gentle vertical bob (like breathing / floating)
    avatar.position.y = basePos.y + Math.sin(time * 1.2) * 0.03;

    // Slow side-to-side sway
    avatar.rotation.z = baseRot.z + Math.sin(time * 0.6) * 0.05;

    // Subtle turn, mildly alive-looking
    avatar.rotation.y = baseRot.y + Math.sin(time * 0.4) * 0.08;

    // Light breathing scale pulse
    const s = 1 + Math.sin(time * 1.2) * 0.015;
    avatar.scale.set(baseScale.x * s, baseScale.y * s, baseScale.z * s);
}

export function animateCurious(
    avatar: THREE.Group,
    time: number
) {
    const { basePos, baseRot, baseScale } = ensureBaseTransform(avatar);

    // Slight forward lean / peek
    avatar.position.z = basePos.z + Math.sin(time * 1.5) * 0.02 + 0.02;

    // Head tilt, faster and wider than idle — "looking around" feel
    avatar.rotation.z = baseRot.z + Math.sin(time * 2.0) * 0.12;
    avatar.rotation.y = baseRot.y + Math.sin(time * 1.1) * 0.25;

    // Small bob, quicker than idle
    avatar.position.y = basePos.y + Math.sin(time * 2.5) * 0.025;

    const s = 1 + Math.sin(time * 3) * 0.01;
    avatar.scale.set(baseScale.x * s, baseScale.y * s, baseScale.z * s);
}

export function animateHiding(
    avatar: THREE.Group,
    time: number
) {
    const { basePos, baseRot, baseScale } = ensureBaseTransform(avatar);

    // Shrink and sink down, as if tucking away — mostly a one-way motion
    // rather than a loop, so ease toward a "hidden" pose and hold with
    // a tiny tremor.
    const hideProgress = 1; // fully hidden pose; swap for a tweened value if you animate the transition elsewhere
    const targetScale = 0.4;
    const targetY = basePos.y - 0.15;

    const tremor = Math.sin(time * 8) * 0.004;

    avatar.scale.setScalar(
        THREE.MathUtils.lerp(baseScale.x, targetScale, hideProgress) + tremor
    );
    avatar.position.y = THREE.MathUtils.lerp(basePos.y, targetY, hideProgress);
    avatar.rotation.z = baseRot.z + Math.sin(time * 6) * 0.02;
}

export function animateComingOut(
    avatar: THREE.Group,
    time: number,
    progress: number = 1 // 0 = fully hidden, 1 = fully out; pass an eased value from your state machine
) {
    const { basePos, baseRot, baseScale } = ensureBaseTransform(avatar);

    const hiddenScale = 0.4;
    const hiddenY = basePos.y - 0.15;

    // Slight overshoot on scale for a "pop" feel
    const eased = THREE.MathUtils.smoothstep(progress, 0, 1);
    const overshoot = Math.sin(progress * Math.PI) * 0.06;

    avatar.scale.setScalar(
        THREE.MathUtils.lerp(hiddenScale, baseScale.x, eased) + overshoot
    );
    avatar.position.y = THREE.MathUtils.lerp(hiddenY, basePos.y, eased);

    // Small wobble as it emerges
    avatar.rotation.z = baseRot.z + Math.sin(time * 10) * 0.05 * (1 - eased);
}

export function animateMoving(
    avatar: THREE.Group,
    time: number
) {
    const { basePos, baseRot, baseScale } = ensureBaseTransform(avatar);

    // Bobbing/scuttling motion while moving — faster bob, slight tilt
    // in the direction of travel. Position.x/z drift should be driven
    // by your actual movement logic elsewhere; this just adds the
    // procedural "alive" wiggle on top.
    avatar.position.y = basePos.y + Math.abs(Math.sin(time * 6)) * 0.04;

    avatar.rotation.z = baseRot.z + Math.sin(time * 6) * 0.1;
    avatar.rotation.x = baseRot.x + Math.sin(time * 3) * 0.05;

    const s = 1 + Math.sin(time * 6) * 0.02;
    avatar.scale.set(baseScale.x * s, baseScale.y, baseScale.z * s);
}

export function animateScanning(
    avatar: THREE.Group,
    time: number
) {
    const { basePos, baseRot, baseScale } = ensureBaseTransform(avatar);

    // Slow, wide sweeping turn, like scanning the surroundings
    avatar.rotation.y = baseRot.y + Math.sin(time * 0.5) * 0.6;

    // Minimal bob so it reads as "paused, looking" rather than moving
    avatar.position.y = basePos.y + Math.sin(time * 1.0) * 0.015;

    const s = 1 + Math.sin(time * 1.5) * 0.01;
    avatar.scale.set(baseScale.x * s, baseScale.y * s, baseScale.z * s);
}

/**
 * Central dispatcher — call this once per frame from your render loop,
 * alongside whatever else you're updating on other THREE objects.
 *
 * Example:
 *   updateAvatarAnimation(currentAvatarState, avatarGroup, clock.getElapsedTime());
 */
export function updateAvatarAnimation(
    state: AvatarLoopType,
    avatar: THREE.Group,
    time: number,
    transitionProgress?: number
) {
    switch (state) {
        case AvatarLoop.Idle:
            animateIdle(avatar, time);
            break;
        case AvatarLoop.Curious:
            animateCurious(avatar, time);
            break;
        case AvatarLoop.Hiding:
            animateHiding(avatar, time);
            break;
        case AvatarLoop.ComingOut:
            animateComingOut(avatar, time, transitionProgress ?? 1);
            break;
        case AvatarLoop.Moving:
            animateMoving(avatar, time);
            break;
        case AvatarLoop.Scanning:
            animateScanning(avatar, time);
            break;
        default:
            animateIdle(avatar, time);
    }
}