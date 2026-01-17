import * as THREE from 'three';
import { GAME_CONFIG } from '../config/constants';

export class GameScene {
    public instance: THREE.Scene;

    constructor() {
        this.instance = new THREE.Scene();
        this.setupFog();
        this.setupLights();
    }

    private setupFog(): void {
        const { FOG_COLOR, FOG_NEAR, FOG_FAR } = GAME_CONFIG.WORLD;
        this.instance.fog = new THREE.Fog(FOG_COLOR, FOG_NEAR, FOG_FAR);
        this.instance.background = new THREE.Color(FOG_COLOR);
    }

    private setupLights(): void {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.instance.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(10, 20, 10);
        dirLight.castShadow = true;
        this.instance.add(dirLight);
    }
}
