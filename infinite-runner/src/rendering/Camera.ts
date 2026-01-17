import * as THREE from 'three';
import { GAME_CONFIG } from '../config/constants';

export class Camera {
    public instance: THREE.PerspectiveCamera;

    constructor() {
        this.instance = new THREE.PerspectiveCamera(
            60, // FOV
            window.innerWidth / window.innerHeight,
            0.1, // Near
            GAME_CONFIG.WORLD.FOG_FAR + 20 // Far
        );
        this.instance.position.set(0, 5, 8);
        this.instance.lookAt(0, 0, 0);

        window.addEventListener('resize', this.onResize);
    }

    private onResize = (): void => {
        this.instance.aspect = window.innerWidth / window.innerHeight;
        this.instance.updateProjectionMatrix();
    };
}
