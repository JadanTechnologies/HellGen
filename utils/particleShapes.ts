import * as THREE from 'three';

const PARTICLE_COUNT = 6000;

function createPoints(generator: (p: THREE.Vector3) => void): Float32Array {
    const points = new Float32Array(PARTICLE_COUNT * 3);
    const p = new THREE.Vector3();
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        generator(p);
        points[i * 3] = p.x;
        points[i * 3 + 1] = p.y;
        points[i * 3 + 2] = p.z;
    }
    return points;
}

export const createHeart = (): Float32Array => {
    return createPoints(p => {
        const t = Math.random() * 2 * Math.PI;
        const r = 1;
        // Heart formula
        p.x = r * 16 * Math.pow(Math.sin(t), 3);
        p.y = r * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        p.z = (Math.random() - 0.5) * 6;
    });
};

export const createFlower = (): Float32Array => {
    return createPoints(p => {
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);
        const petals = 5;
        // Rose/Flower parametric equation variation
        const r = 10 * (1 + 0.5 * Math.sin(petals * theta));
        p.x = r * Math.sin(phi) * Math.cos(theta);
        p.y = r * Math.sin(phi) * Math.sin(theta);
        p.z = r * Math.cos(phi) * 0.5; // Flatten slightly
    });
};

export const createSaturn = (): Float32Array => {
    const points = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        if (i < PARTICLE_COUNT * 0.6) { // Planet body
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 8;
            points[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            points[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            points[i * 3 + 2] = r * Math.cos(phi);
        } else { // Rings
            const r = 13 + Math.random() * 8;
            const theta = Math.random() * 2 * Math.PI;
            const tilt = 0.3; // Ring tilt
            // Apply rotation manually
            const x = r * Math.cos(theta);
            const z = r * Math.sin(theta);
            
            points[i * 3] = x;
            points[i * 3 + 1] = z * Math.sin(tilt);
            points[i * 3 + 2] = z * Math.cos(tilt);
        }
    }
    return points;
};

export const createBuddha = (): Float32Array => {
    const points = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = new THREE.Vector3();
        const part = Math.random();

        if (part < 0.2) { // Head
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 3;
            p.set(r * Math.sin(phi) * Math.cos(theta), 10 + r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
        } else if (part < 0.25) { // Bun/Ushnisha
             const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 1;
            p.set(r * Math.sin(phi) * Math.cos(theta), 13 + r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
        } else if (part < 0.7) { // Torso (Capsule-ish)
            const y = (Math.random() - 0.5) * 12;
            const r = 5 * Math.cos(y / 14 * Math.PI / 2);
            const theta = Math.random() * 2 * Math.PI;
            p.set(r * Math.cos(theta), y + 3, r * Math.sin(theta));
        } else { // Lotus Base
            const r = 9 * Math.sqrt(Math.random()); // Even distribution on disc
            const theta = Math.random() * 2 * Math.PI;
            p.set(r * Math.cos(theta), -3 - Math.random(), r * Math.sin(theta));
        }
        points[i * 3] = p.x;
        points[i * 3 + 1] = p.y;
        points[i * 3 + 2] = p.z;
    }
    return points;
};


export interface FireworkParticle {
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    alpha: number;
    color: THREE.Color;
}

export const createFireworks = (): FireworkParticle[] => {
    const fireworks: FireworkParticle[] = [];
    const baseColor = new THREE.Color().setHSL(Math.random(), 1.0, 0.6);
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const position = new THREE.Vector3(0, 0, 0);
        // Explosion velocity
        const velocity = new THREE.Vector3(
            (Math.random() - 0.5),
            (Math.random() - 0.5),
            (Math.random() - 0.5)
        ).normalize().multiplyScalar(Math.random() * 25 + 5);
        
        fireworks.push({ 
            position, 
            velocity, 
            alpha: 1.0, 
            color: baseColor 
        });
    }
    return fireworks;
};