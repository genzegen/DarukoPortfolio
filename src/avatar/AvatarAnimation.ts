import * as THREE from 'three';

export const AvatarLoop = {
    Idle: 'Idle',
    Curious: 'Curious',
    Hiding: 'Hiding',
    ComingOut: 'ComingOut',
    Moving: 'Moving',
    Scanning: 'Scanning'
} as const;

export function animateIdle (
    avatar: THREE.Group,
    time: number
){
    
}

export function animateCurious (
    avatar: THREE.Group,
    time: number
){

}


export function animateHiding (
    avatar: THREE.Group,
    time: number
){

}

export function animateComingOut (
    avatar: THREE.Group,
    time: number
){

}

export function animateMoving (
    avatar: THREE.Group,
    time: number
){

}

export function animateScanning (
    avatar: THREE.Group,
    time: number
){

}