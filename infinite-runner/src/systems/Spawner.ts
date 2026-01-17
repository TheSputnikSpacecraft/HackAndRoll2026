import { Obstacle, OBSTACLE_TYPES } from '../entities/Obstacle';
import * as THREE from 'three';

export class Spawner {
    private scene: THREE.Scene;
    public obstacles: Obstacle[] = [];
    private spawnTimer: number = 0;
    private spawnInterval: number = 2.0; // Seconds (scales with speed)

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    public update(dt: number, speed: number): void {
        // Move & Remove
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            obs.update(dt, speed);

            if (obs.mesh.position.z > 20) { // Behind camera
                this.scene.remove(obs.mesh);
                this.obstacles.splice(i, 1);
            }
        }

        // Spawn
        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
            this.spawnObstacle();
            // Adjust interval based on speed to keep density consistent?
            // Distance = Speed * Time. 
            // If we want Fixed Distance between obstacles: Time = Distance / Speed.
            const minDistance = 15; // Closer together
            this.spawnInterval = minDistance / speed;
            this.spawnTimer = this.spawnInterval;
        }
    }

    private spawnObstacle(): void {
        const lane = Math.floor(Math.random() * 3) - 1; // -1, 0, 1

        // Random Type
        const types = [OBSTACLE_TYPES.BOX, OBSTACLE_TYPES.LOW, OBSTACLE_TYPES.TALL];
        const type = types[Math.floor(Math.random() * types.length)];

        // Spawn far ahead
        // Spawn visible
        const zPos = -40;

        const obstacle = new Obstacle(type, lane, zPos);
        this.scene.add(obstacle.mesh);
        this.obstacles.push(obstacle);
    }

    public reset(): void {
        this.obstacles.forEach(obs => this.scene.remove(obs.mesh));
        this.obstacles = [];
        this.spawnTimer = 0;
    }
}
