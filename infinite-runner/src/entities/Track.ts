import * as THREE from 'three';
import { GAME_CONFIG } from '../config/constants';
import { createTextTexture } from '../utils/TextureGen';

export class Track {
    public mesh: THREE.Group;
    private segments: THREE.Mesh[] = [];
    private speed: number = GAME_CONFIG.PLAYER.SPEED_INITIAL;

    constructor() {
        this.mesh = new THREE.Group();
        this.initializeTrack();
    }

    private initializeTrack(): void {
        const segmentCount = 10;
        for (let i = 0; i < segmentCount; i++) {
            this.spawnSegment(-i * GAME_CONFIG.WORLD.PLATFORM_LENGTH);
        }
    }

    private spawnSegment(zPos: number): void {
        // ROAD
        const geometry = new THREE.PlaneGeometry(
            GAME_CONFIG.WORLD.LANE_WIDTH * 3 + 2, // Width
            GAME_CONFIG.WORLD.PLATFORM_LENGTH
        );
        const material = new THREE.MeshStandardMaterial({
            color: (Math.floor(zPos / 10) % 2 === 0) ? 0x222222 : 0x2a2a2a, // Asphalt dark
            roughness: 0.9
        });

        const segment = new THREE.Mesh(geometry, material);
        segment.rotation.x = -Math.PI / 2;
        segment.position.z = zPos;
        segment.receiveShadow = true;

        this.mesh.add(segment);
        this.segments.push(segment);

        // BILLBOARDS (Decor)
        if (Math.random() > 0.6) {
            this.addBillboard(segment);
        }
    }

    private addBillboard(segment: THREE.Mesh): void {
        const side = Math.random() > 0.5 ? 1 : -1;
        const xPos = side * (GAME_CONFIG.WORLD.LANE_WIDTH * 2.5); // Far side

        const geo = new THREE.BoxGeometry(4, 2, 0.2);

        const texts = ['HACK&ROLL', 'NUS', 'SOC', 'CS2103T', 'O(n)', 'DEADLOCK', 'REKT', 'UTOWN'];
        const text = texts[Math.floor(Math.random() * texts.length)];
        const tex = createTextTexture(text, '#ffffff', '#000000');
        const mat = new THREE.MeshStandardMaterial({ map: tex });

        const board = new THREE.Mesh(geo, mat);

        // Align to upright relative to the flat segment
        board.rotation.x = Math.PI / 2;
        board.rotation.y = side * -Math.PI / 4;
        board.position.set(xPos, 0, 2); // Local Z is Up

        // Pole
        const poleGeo = new THREE.CylinderGeometry(0.1, 0.1, 2);
        poleGeo.rotateX(Math.PI / 2);
        const pole = new THREE.Mesh(poleGeo, new THREE.MeshStandardMaterial({ color: 0x555555 }));
        pole.position.set(xPos, 0, 1);

        segment.add(pole);
        segment.add(board);
    }

    public update(dt: number, speed: number): void {
        const moveDist = speed * dt;

        // Move all segments
        for (const seg of this.segments) {
            seg.position.z += moveDist;
        }

        // Recycle Logic
        const frontSegment = this.segments[0];
        if (frontSegment.position.z > 10) { // Camera is at ~8? 10 is behind
            this.recycleSegment(frontSegment);
        }
    }

    private recycleSegment(segment: THREE.Mesh): void {
        // Move to back
        const lastSegment = this.segments[this.segments.length - 1];
        const newZ = lastSegment.position.z - GAME_CONFIG.WORLD.PLATFORM_LENGTH;

        segment.position.z = newZ;

        // Shift array
        this.segments.shift();
        this.segments.push(segment);
    }
}
