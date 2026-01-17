import * as THREE from 'three';
import { GAME_CONFIG } from '../config/constants';
import { createTextTexture, createAsphaltTexture } from '../utils/TextureGen';
import { WorldBender } from '../rendering/WorldBender';

export class Track {
    public mesh: THREE.Group;
    private segments: THREE.Mesh[] = [];
    private sharedMaterial: THREE.MeshStandardMaterial;

    constructor() {
        this.mesh = new THREE.Group();
        // Shared material for performance
        const asphaltTex = createAsphaltTexture();
        // Rotate texture to align with road direction?
        // Plane is Rotated -90 X. 
        // UVs: U=X, V=Y (which maps to World -Z).
        // Texture lines are vertical (Y).
        // So lines will run along Z. Correct.
        asphaltTex.repeat.set(1, 4); // Repeat along length

        this.sharedMaterial = new THREE.MeshStandardMaterial({
            map: asphaltTex,
            roughness: 0.8,
            metalness: 0.2,
            color: 0x444444 // Darker Grey
        });
        this.sharedMaterial.onBeforeCompile = WorldBender.inject;

        this.initializeTrack();
    }

    private initializeTrack(): void {
        const segmentCount = 10;
        for (let i = 0; i < segmentCount; i++) {
            this.spawnSegment(-i * GAME_CONFIG.WORLD.PLATFORM_LENGTH);
        }
    }

    private spawnSegment(zPos: number): void {
        // ROAD (Thick 3D Mesh)
        // Width: Lanes * Width + Side margins
        const roadWidth = GAME_CONFIG.WORLD.LANE_WIDTH * 3 + 2;
        const roadLength = GAME_CONFIG.WORLD.PLATFORM_LENGTH;
        const roadThickness = 4.0; // Thick base

        const geometry = new THREE.BoxGeometry(
            roadWidth,
            roadThickness,
            roadLength
        );

        const segment = new THREE.Mesh(geometry, this.sharedMaterial);
        // Position Y so the top surface is at 0
        // Box origin is center. So Y = -thickness/2
        segment.position.set(0, -roadThickness / 2, zPos);
        segment.receiveShadow = true;

        this.mesh.add(segment);
        this.segments.push(segment);

        // Add Curbs (White strips on edges)
        const curbGeo = new THREE.BoxGeometry(0.5, 0.2, roadLength);
        const curbMat = new THREE.MeshStandardMaterial({ color: 0xcccccc });

        const curbL = new THREE.Mesh(curbGeo, curbMat);
        curbL.position.set(-roadWidth / 2 + 0.25, roadThickness / 2 + 0.1, 0); // Local to segment
        segment.add(curbL);

        const curbR = new THREE.Mesh(curbGeo, curbMat);
        curbR.position.set(roadWidth / 2 - 0.25, roadThickness / 2 + 0.1, 0);
        segment.add(curbR);

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
