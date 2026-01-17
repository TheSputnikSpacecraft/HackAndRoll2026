import * as THREE from 'three';
import { WorldBender } from '../rendering/WorldBender';

// Material Library for consistency
const MAT_ORANGE = new THREE.MeshStandardMaterial({ color: 0xffaa00, roughness: 0.2 });
const MAT_GREY = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5 });
const MAT_WHITE = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
const MAT_NET = new THREE.MeshStandardMaterial({ color: 0x222222, flatShading: true });
const MAT_EMISSIVE_RED = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 0.5 }); // Dimmer
const MAT_EMISSIVE_WHITE = new THREE.MeshStandardMaterial({ color: 0xffffee, emissive: 0xffffee, emissiveIntensity: 0.5 }); // Dimmer
const MAT_GLASS = new THREE.MeshStandardMaterial({ color: 0x88ccff, roughness: 0.0, metalness: 0.9, opacity: 0.7, transparent: true });

// Apply Curve
[MAT_ORANGE, MAT_GREY, MAT_WHITE, MAT_NET, MAT_EMISSIVE_RED, MAT_EMISSIVE_WHITE, MAT_GLASS].forEach(m => {
    m.onBeforeCompile = WorldBender.inject;
});

const MAT_BUS_YELLOW = new THREE.MeshStandardMaterial({ color: 0xFFC107, roughness: 0.4 }); // Amber/Yellow
const MAT_BUS_BLACK = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });

export function createHighDetailBus(): THREE.Group {
    const bus = new THREE.Group();

    // Classic School Bus Shape (Boxy)
    // Main Body
    const bodyGeo = new THREE.BoxGeometry(2.4, 2.2, 7);
    const body = new THREE.Mesh(bodyGeo, MAT_BUS_YELLOW);
    body.position.y = 1.6; // Higher clearance
    body.castShadow = true;
    bus.add(body);

    // Roof (Rounded slightly? No, old school is boxy)
    // Black Stripes along side
    const stripeGeo = new THREE.BoxGeometry(2.45, 0.2, 7.1);
    const stripe = new THREE.Mesh(stripeGeo, MAT_BUS_BLACK);
    stripe.position.y = 1.5;
    bus.add(stripe);

    // Windows (Row of black squares)
    const winGeo = new THREE.BoxGeometry(2.5, 0.8, 6.0);
    const win = new THREE.Mesh(winGeo, MAT_GLASS);
    win.position.y = 2.2;
    bus.add(win);

    // Front Engine Box (The "Nose")
    const noseGeo = new THREE.BoxGeometry(2.0, 1.2, 1.5);
    const nose = new THREE.Mesh(noseGeo, MAT_BUS_YELLOW);
    nose.position.set(0, 1.1, 4.0); // Extending front
    bus.add(nose);

    // FRONT GLASS (Windshield)
    const frontGlassGeo = new THREE.PlaneGeometry(2.2, 0.8);
    const frontGlass = new THREE.Mesh(frontGlassGeo, MAT_GLASS);
    frontGlass.position.set(0, 2.2, 3.51); // 3.5 is body front, +0.01
    // frontGlass.rotation.x = -0.1; // sloped? Old school is flat.
    bus.add(frontGlass);

    // Wheels (Big and clunky)
    const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelMat = MAT_BUS_BLACK;

    const w1 = new THREE.Mesh(wheelGeo, wheelMat); w1.position.set(1, 0.5, 2.5);
    const w2 = new THREE.Mesh(wheelGeo, wheelMat); w2.position.set(-1, 0.5, 2.5);
    const w3 = new THREE.Mesh(wheelGeo, wheelMat); w3.position.set(1, 0.5, -2.5);
    const w4 = new THREE.Mesh(wheelGeo, wheelMat); w4.position.set(-1, 0.5, -2.5);
    bus.add(w1); bus.add(w2); bus.add(w3); bus.add(w4);

    // Headlights
    const hlGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.2);
    hlGeo.rotateX(Math.PI / 2);
    const hl1 = new THREE.Mesh(hlGeo, MAT_EMISSIVE_WHITE); hl1.position.set(-0.6, 1.2, 4.76);
    const hl2 = new THREE.Mesh(hlGeo, MAT_EMISSIVE_WHITE); hl2.position.set(0.6, 1.2, 4.76);
    bus.add(hl1); bus.add(hl2);

    return bus;
}

export function createConstructionBarrier(): THREE.Group {
    const group = new THREE.Group();
    // Simple Barrier
    const board = new THREE.Mesh(new THREE.BoxGeometry(2, 0.8, 0.1), MAT_ORANGE);
    board.position.y = 0.6;
    group.add(board);

    // Stripes
    const stripe1 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.82, 0.12), MAT_WHITE);
    stripe1.position.set(-0.5, 0.6, 0);
    group.add(stripe1);
    const stripe2 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.82, 0.12), MAT_WHITE);
    stripe2.position.set(0.5, 0.6, 0);
    group.add(stripe2);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
    const l1 = new THREE.Mesh(legGeo, MAT_GREY); l1.position.set(-0.9, 0.5, 0);
    const l2 = new THREE.Mesh(legGeo, MAT_GREY); l2.position.set(0.9, 0.5, 0);
    group.add(l1); group.add(l2);

    return group;
}

export function createDetailedSign(): THREE.Group {
    const group = new THREE.Group();

    // Poles - SHORTER & THICKER
    const poleGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.5); // Height 2.5 max
    const p1 = new THREE.Mesh(poleGeo, MAT_GREY); p1.position.set(-1.2, 1.25, 0); // Center Y at 1.25
    const p2 = new THREE.Mesh(poleGeo, MAT_GREY); p2.position.set(1.2, 1.25, 0);
    group.add(p1); group.add(p2);

    // Pole Caps (Fancy)
    const capGeo = new THREE.SphereGeometry(0.15);
    const c1 = new THREE.Mesh(capGeo, MAT_GREY); c1.position.set(-1.2, 2.5, 0);
    const c2 = new THREE.Mesh(capGeo, MAT_GREY); c2.position.set(1.2, 2.5, 0);
    group.add(c1); group.add(c2);

    // Board - Frame Style (Double Box)
    // Outer Frame (Grey)
    const frame = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.0, 0.15), MAT_GREY);
    frame.position.y = 1.6; // Lowered to 1.6 (Chin height)
    group.add(frame);

    // Face (Yellow/Orange)
    const face = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.8, 0.2), MAT_ORANGE);
    face.position.y = 1.6;
    group.add(face);

    // No Text requested

    return group;
}
