import { Obstacle, OBSTACLE_TYPES } from '../entities/Obstacle';
import { Bomb } from '../entities/Bomb';
import * as THREE from 'three';

export class Spawner {
    private scene: THREE.Scene;
    public obstacles: Obstacle[] = [];
    public bombs: Bomb[] = [];
    private spawnTimer: number = 0;
    private spawnInterval: number = 2.0;
    private bombSpawnTimer: number = 0;
    private bombSpawnInterval: number = 5.0;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    public update(dt: number, speed: number): void {
        // Move & Remove Obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            obs.update(dt, speed);

            if (obs.mesh.position.z > 20) {
                this.scene.remove(obs.mesh);
                this.obstacles.splice(i, 1);
            }
        }

        // Move & Remove Bombs
        for (let i = this.bombs.length - 1; i >= 0; i--) {
            const bomb = this.bombs[i];
            bomb.update(dt, speed);

            if (bomb.mesh.position.z > 20) {
                this.scene.remove(bomb.mesh);
                this.bombs.splice(i, 1);
            }
        }

        // Spawn Obstacles
        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
            this.spawnObstacle();
            const minDistance = 15;
            this.spawnInterval = minDistance / speed;
            this.spawnTimer = this.spawnInterval;
        }

        // Spawn Bombs (less frequently)
        this.bombSpawnTimer -= dt;
        if (this.bombSpawnTimer <= 0) {
            this.spawnBomb();
            const bombDistance = 25 + Math.random() * 20;
            this.bombSpawnInterval = bombDistance / speed;
            this.bombSpawnTimer = this.bombSpawnInterval;
        }
    }

    private spawnObstacle(): void {
        const lane = Math.floor(Math.random() * 3) - 1;
        const types = [OBSTACLE_TYPES.BOX, OBSTACLE_TYPES.LOW, OBSTACLE_TYPES.TALL];
        const type = types[Math.floor(Math.random() * types.length)];
        const zPos = -40;

        const obstacle = new Obstacle(type, lane, zPos);
        this.scene.add(obstacle.mesh);
        this.obstacles.push(obstacle);
    }

    private spawnBomb(): void {
        const lane = Math.floor(Math.random() * 3) - 1;
        const zPos = -45;

        const bomb = new Bomb(lane, zPos);
        this.scene.add(bomb.mesh);
        this.bombs.push(bomb);
    }

    public removeBomb(bomb: Bomb): void {
        const index = this.bombs.indexOf(bomb);
        if (index > -1) {
            this.scene.remove(bomb.mesh);
            this.bombs.splice(index, 1);
        }
    }

    public reset(): void {
        this.obstacles.forEach(obs => this.scene.remove(obs.mesh));
        this.obstacles = [];
        this.bombs.forEach(bomb => this.scene.remove(bomb.mesh));
        this.bombs = [];
        this.spawnTimer = 0;
        this.bombSpawnTimer = 3;
    }
}
