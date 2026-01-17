import * as THREE from 'three';

export class Renderer {
    public instance: THREE.WebGLRenderer;

    constructor() {
        this.instance = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        this.instance.setSize(window.innerWidth, window.innerHeight);
        this.instance.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap pixel ratio for perf
        this.instance.outputColorSpace = THREE.SRGBColorSpace;

        document.body.appendChild(this.instance.domElement);

        window.addEventListener('resize', this.onResize);
    }

    private onResize = (): void => {
        this.instance.setSize(window.innerWidth, window.innerHeight);
        this.instance.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
}
