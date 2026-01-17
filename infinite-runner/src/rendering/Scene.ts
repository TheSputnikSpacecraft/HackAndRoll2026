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
        const { FOG_COLOR } = GAME_CONFIG.WORLD;
        // Exponential Squared fog for smoother falloff
        this.instance.fog = new THREE.FogExp2(FOG_COLOR, 0.015);
        this.instance.background = new THREE.Color(FOG_COLOR);
    }

    private setupLights(): void {
        // Hemisphere Light (Sky + Ground bounce)
        // Brighter ambient for "Tropical Day"
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x553311, 0.8);
        this.instance.add(hemiLight);

        // Sun Light (Directional)
        const dirLight = new THREE.DirectionalLight(0xfffaed, 1.5); // Warm/Bright sunlight
        dirLight.position.set(20, 30, 10);
        dirLight.castShadow = true;

        // Shadow High Res
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        dirLight.shadow.camera.near = 0.5;
        dirLight.shadow.camera.far = 100;

        // Frustum
        const d = 50;
        dirLight.shadow.camera.left = -d;
        dirLight.shadow.camera.right = d;
        dirLight.shadow.camera.top = d;
        dirLight.shadow.camera.bottom = -d;
        // Bias to remove acne
        dirLight.shadow.bias = -0.0005;

        this.instance.add(dirLight);

        // RIM LIGHT (Backlight for pop)
        // Shines from behind/below to catch edges
        const rimLight = new THREE.DirectionalLight(0xaaccff, 1.0);
        rimLight.position.set(0, 10, -20); // Behind obstacles
        this.instance.add(rimLight);

        // AMBIENT LIGHT
        // Increased to 1.3 for "Bolder" colors without blinding white
        const ambient = new THREE.AmbientLight(0xffffff, 1.3);
        this.instance.add(ambient);
    }
}
