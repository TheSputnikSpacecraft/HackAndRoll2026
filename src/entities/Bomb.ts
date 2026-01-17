import * as THREE from 'three';
import { GAME_CONFIG } from '../config/constants';
import { WorldBender } from '../rendering/WorldBender';

export class Bomb {
    public mesh: THREE.Group;
    public active: boolean = true;
    private colliderBox: THREE.Box3;
    private rotationSpeed: number = 1.5;

    constructor(laneIndex: number, zPos: number) {
        this.mesh = new THREE.Group();
        this.colliderBox = new THREE.Box3();
        this.createMesh();
        this.setPosition(zPos, laneIndex);
    }

    private createMesh(): void {
        // Create a bomb - spherical body with fuse
        const bombMat = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.3,
            metalness: 0.8
        });
        bombMat.onBeforeCompile = WorldBender.inject;

        // Main bomb body (sphere)
        const bodyGeo = new THREE.SphereGeometry(0.4, 16, 16);
        const body = new THREE.Mesh(bodyGeo, bombMat);
        body.castShadow = true;
        this.mesh.add(body);

        // Top cap where fuse attaches
        const capGeo = new THREE.CylinderGeometry(0.15, 0.2, 0.15, 12);
        const capMat = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.5
        });
        capMat.onBeforeCompile = WorldBender.inject;
        const cap = new THREE.Mesh(capGeo, capMat);
        cap.position.y = 0.4;
        this.mesh.add(cap);

        // Fuse (curved tube)
        const fuseMat = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.8
        });
        fuseMat.onBeforeCompile = WorldBender.inject;

        const fuseGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8);
        const fuse = new THREE.Mesh(fuseGeo, fuseMat);
        fuse.position.set(0.05, 0.55, 0);
        fuse.rotation.z = 0.3;
        this.mesh.add(fuse);

        // Sparkling fuse tip (emissive)
        const sparkMat = new THREE.MeshStandardMaterial({
            color: 0xFF4500,
            emissive: 0xFF4500,
            emissiveIntensity: 1.0
        });
        sparkMat.onBeforeCompile = WorldBender.inject;

        const sparkGeo = new THREE.SphereGeometry(0.06, 8, 8);
        const spark = new THREE.Mesh(sparkGeo, sparkMat);
        spark.position.set(0.1, 0.7, 0);
        this.mesh.add(spark);

        // Warning glow ring
        const ringGeo = new THREE.TorusGeometry(0.55, 0.04, 8, 32);
        const ringMat = new THREE.MeshStandardMaterial({
            color: 0xFF0000,
            emissive: 0xFF0000,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.6
        });
        ringMat.onBeforeCompile = WorldBender.inject;

        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        this.mesh.add(ring);
    }

    private setPosition(zPos: number, laneIndex: number): void {
        const xPos = laneIndex * GAME_CONFIG.WORLD.LANE_WIDTH;
        this.mesh.position.set(xPos, 1.0, zPos); // Floating at player height
    }

    public update(dt: number, speed: number): void {
        // Move towards player
        const moveDist = speed * dt;
        this.mesh.position.z += moveDist;

        // Rotate for visual effect
        this.mesh.rotation.y += this.rotationSpeed * dt;
    }

    public getAABB(): THREE.Box3 {
        const box = new THREE.Box3();
        const pos = this.mesh.position;

        // Generous hitbox for collection
        const size = 1.0;
        box.min.set(pos.x - size / 2, pos.y - size / 2, pos.z - size / 2);
        box.max.set(pos.x + size / 2, pos.y + size / 2, pos.z + size / 2);

        this.colliderBox.copy(box);
        return this.colliderBox;
    }
}
