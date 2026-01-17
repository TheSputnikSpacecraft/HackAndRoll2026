import * as THREE from 'three';
import { GAME_CONFIG } from '../config/constants';
import { createHighDetailBus, createConstructionBarrier, createDetailedSign } from '../utils/AssetGen';

export const OBSTACLE_TYPES = {
    LOW: 'LOW',   // Jump over (Barrier)
    TALL: 'TALL', // Slide under (Sign)
    BOX: 'BOX',   // Dodge (Bus)
} as const;

export type ObstacleType = keyof typeof OBSTACLE_TYPES;

export class Obstacle {
    public mesh: THREE.Group;
    public type: ObstacleType;
    public active: boolean = true;
    private colliderBox: THREE.Box3;

    constructor(type: ObstacleType, laneIndex: number, zPos: number) {
        this.type = type;
        this.mesh = new THREE.Group();
        this.colliderBox = new THREE.Box3();

        this.createMesh(type);
        this.setPosition(zPos, laneIndex);
    }

    private createMesh(type: ObstacleType): void {
        if (type === OBSTACLE_TYPES.LOW) {
            this.mesh.add(createConstructionBarrier());
        } else if (type === OBSTACLE_TYPES.TALL) {
            this.mesh.add(createDetailedSign());
        } else if (type === OBSTACLE_TYPES.BOX) {
            this.mesh.add(createHighDetailBus());
        }
    }

    private setPosition(zPos: number, laneIndex: number): void {
        const xPos = laneIndex * GAME_CONFIG.WORLD.LANE_WIDTH;
        this.mesh.position.set(xPos, 0, zPos);
    }

    public update(dt: number, speed: number): void {
        const moveDist = speed * dt;
        this.mesh.position.z += moveDist;
    }

    public getAABB(): THREE.Box3 {
        // Custom AABB based on Type logic, essentially static sizing relative to mesh root
        const box = new THREE.Box3();
        const pos = this.mesh.position;

        // Define size relative to center
        let w = 1, h = 1, d = 1;
        let yOff = 0;

        if (this.type === OBSTACLE_TYPES.LOW) {
            w = 2; h = 1; d = 0.5; yOff = 0.5;
        } else if (this.type === OBSTACLE_TYPES.TALL) {
            // Sign: Hitbox is the TOP part? 
            // We want the player to slide UNDER.
            // If player is standing (h=1.8), they hit.
            // If sliding (h=0.8), they pass under (y>2).
            // So hitbox should be from Y=2 to Y=4.
            w = 3; h = 1.5; d = 0.5; yOff = 3;
        } else if (this.type === OBSTACLE_TYPES.BOX) {
            w = 2.2; h = 3; d = 6; yOff = 1.5;
        }

        box.min.set(pos.x - w / 2, pos.y + yOff - h / 2, pos.z - d / 2);
        box.max.set(pos.x + w / 2, pos.y + yOff + h / 2, pos.z + d / 2);

        this.colliderBox.copy(box);
        return this.colliderBox;
    }
}
