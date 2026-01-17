import * as THREE from 'three';
import { createTextTexture } from '../utils/TextureGen';

export const ObstacleType = {
    TALL: 'TALL', // Overhead Sign
    LOW: 'LOW',  // Barrier
    BOX: 'BOX'   // Bus
} as const;

export type ObstacleType = typeof ObstacleType[keyof typeof ObstacleType];

export class Obstacle {
    public mesh: THREE.Group;
    public type: ObstacleType;
    public active: boolean = true;
    public aabb: THREE.Box3;

    constructor(type: ObstacleType, lane: number, zPos: number) {
        this.type = type;
        this.mesh = new THREE.Group();
        this.aabb = new THREE.Box3();

        this.createMesh();
        this.setPosition(lane, zPos);
    }

    private createMesh(): void {
        switch (this.type) {
            case ObstacleType.TALL:
                this.createOverheadSign();
                break;
            case ObstacleType.LOW:
                this.createBarrier();
                break;
            case ObstacleType.BOX:
                this.createBus();
                break;
        }
    }

    private createBus(): void {
        // Main Body (Orange/Blue NUS Bus)
        const geometry = new THREE.BoxGeometry(2.2, 2.5, 6);
        const material = new THREE.MeshStandardMaterial({ color: 0xffaa00 }); // Orange
        const bus = new THREE.Mesh(geometry, material);
        bus.position.y = 1.25;
        bus.castShadow = true;

        // Windows (Black)
        const windowGeo = new THREE.BoxGeometry(2.3, 1, 4);
        const windowMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2 });
        const windows = new THREE.Mesh(windowGeo, windowMat);
        windows.position.y = 1.8;

        // Wheels
        const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 2.4, 16);
        wheelGeo.rotateZ(Math.PI / 2);
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x333333 });

        const wheelF = new THREE.Mesh(wheelGeo, wheelMat);
        wheelF.position.set(0, 0.4, 1.5);
        const wheelB = new THREE.Mesh(wheelGeo, wheelMat);
        wheelB.position.set(0, 0.4, -1.5);

        this.mesh.add(bus);
        this.mesh.add(windows);
        this.mesh.add(wheelF);
        this.mesh.add(wheelB);
    }

    private createOverheadSign(): void {
        // Pillars
        const poleGeo = new THREE.CylinderGeometry(0.1, 0.1, 4);
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x888888 });

        const poleL = new THREE.Mesh(poleGeo, poleMat);
        poleL.position.set(-1.2, 2, 0);

        const poleR = new THREE.Mesh(poleGeo, poleMat);
        poleR.position.set(1.2, 2, 0);

        // Board
        const boardGeo = new THREE.BoxGeometry(3, 1, 0.2);
        // Random NUS Destination
        const dests = ['UTown', 'COM1', 'FASS', 'Science', 'Biz School', 'PGP'];
        const dest = dests[Math.floor(Math.random() * dests.length)];

        const texture = createTextTexture(dest, '#003D7C', '#EF7C00'); // NUS Colors
        const boardMat = new THREE.MeshStandardMaterial({ map: texture });

        const board = new THREE.Mesh(boardGeo, boardMat);
        board.position.set(0, 3.5, 0);

        this.mesh.add(poleL);
        this.mesh.add(poleR);
        this.mesh.add(board);
    }

    private createBarrier(): void {
        const geometry = new THREE.BoxGeometry(2, 0.8, 0.5);
        // Striped texture? Simple color for now.
        const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        const barrier = new THREE.Mesh(geometry, material);
        barrier.position.y = 0.4;
        barrier.castShadow = true;

        // Supports
        const legGeo = new THREE.CylinderGeometry(0.05, 0.05, 1);
        const legMat = new THREE.MeshStandardMaterial({ color: 0xffee00 });

        const legL = new THREE.Mesh(legGeo, legMat);
        legL.position.set(-0.9, 0.5, 0);
        legL.rotation.z = 0.2;

        const legR = new THREE.Mesh(legGeo, legMat);
        legR.position.set(0.9, 0.5, 0);
        legR.rotation.z = -0.2;

        this.mesh.add(barrier);
        this.mesh.add(legL);
        this.mesh.add(legR);
    }

    private setPosition(lane: number, zPos: number): void {
        // Lane width reference from config usually, but hardcoded here for simplicity or import if needed
        const LANE_WIDTH = 2.5;
        this.mesh.position.x = lane * LANE_WIDTH;
        this.mesh.position.z = zPos;
    }

    public update(dt: number, speed: number): void {
        this.mesh.position.z += speed * dt;

        // Update AABB
        const pos = this.mesh.position;
        // Simple manual box approximation 
        const halfWidth = 0.8;
        const halfDepth = 0.8; // Bigger depth for bus

        let minHeight = 0;
        let maxHeight = 2;

        if (this.type === ObstacleType.TALL) {
            minHeight = 2.5; // Only hit if jumping high / standing. Safe to slide? 
            // Sign board is at y=3.5, height 1 -> 3.0 to 4.0.
            // Player height standing = 1.8. Jump = +2.5.
            // Wait, TALL means "Duck Under".
            // So danger zone is Y > 2.0? 
            // Strictly: Board is 3.0-4.0. Player head is 1.8. 
            // If player jumps, head -> 4.3. Crash.
            // If player runs, head -> 1.8. Clear? 
            // Ah, actually "TALL" usually means "Low enough to hit head, high enough to slide".
            // Let's lower the board.
            // Board at 2.5. (Range 2.0 - 3.0).
            // Player Stand: 1.8. Safe? Close.
            // Let's make it hit STANDING player.
            // Board bottom: 1.5. Top: 2.5.
            // Player Slide: 0.8. Safe.
            minHeight = 1.3;
            maxHeight = 3.0; // The board itself
        } else if (this.type === ObstacleType.LOW) {
            maxHeight = 0.9;
        } else {
            // Bus
            maxHeight = 2.5;
        }

        this.aabb.min.set(pos.x - halfWidth, minHeight, pos.z - halfDepth);
        this.aabb.max.set(pos.x + halfWidth, maxHeight, pos.z + halfDepth);
    }
}
