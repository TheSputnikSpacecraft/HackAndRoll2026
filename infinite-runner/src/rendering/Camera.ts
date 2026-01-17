import * as THREE from 'three';
import { GAME_CONFIG } from '../config/constants';

export class Camera {
    public instance: THREE.PerspectiveCamera;

    private shakeTimer: number = 0;
    private shakeIntensity: number = 0;

    constructor() {
        this.instance = new THREE.PerspectiveCamera(
            GAME_CONFIG.WORLD.CAMERA.FOV,
            window.innerWidth / window.innerHeight,
            0.1, // Near
            GAME_CONFIG.WORLD.FOG_FAR + 10 // Far
        );
        // Initial set
        this.instance.position.set(0, GAME_CONFIG.WORLD.CAMERA.HEIGHT, GAME_CONFIG.WORLD.CAMERA.DISTANCE);
        this.instance.lookAt(0, GAME_CONFIG.WORLD.CAMERA.LOOK_AT_HEIGHT, -10);

        window.addEventListener('resize', this.onResize);
    }

    private onResize = (): void => {
        this.instance.aspect = window.innerWidth / window.innerHeight;
        this.instance.updateProjectionMatrix();
    };

    public addShake(amount: number): void {
        this.shakeTimer = 0.5; // duration
        this.shakeIntensity = amount;
    }

    public update(dt: number): void {
        if (this.shakeTimer > 0) {
            this.shakeTimer -= dt;
            const s = this.shakeIntensity * (this.shakeTimer / 0.5); // Decay
            const rx = (Math.random() - 0.5) * s;
            const ry = (Math.random() - 0.5) * s;
            const rz = (Math.random() - 0.5) * s;
            this.instance.position.add(new THREE.Vector3(rx, ry, rz));
        }
    }
}
