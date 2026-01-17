import * as THREE from 'three';
import { GAME_CONFIG } from '../config/constants';
import { WorldBender } from './WorldBender';

export class Environment {
    private scene: THREE.Scene;
    private skyMesh!: THREE.Mesh;
    private trees!: THREE.InstancedMesh;
    private treeLeaves!: THREE.InstancedMesh;
    private treeMaterial!: THREE.MeshStandardMaterial; // Added treeMaterial property
    private count = 1500; // Increased from 100 to 1500 for DENSITY over 1000m
    private dummy = new THREE.Object3D();

    constructor(scene: THREE.Scene) {
        this.scene = scene;

        // Tree Material
        // InstancedMesh supports onBeforeCompile on its material
        this.treeMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d5a27,
            roughness: 0.8,
            flatShading: true
        });
        this.treeMaterial.onBeforeCompile = WorldBender.inject; // Apply curve

        this.setupSky();
        this.setupTrees();
        this.setupClouds();
    }

    private setupClouds(): void {
        const cloudGeo = new THREE.DodecahedronGeometry(1, 0); // Low poly sphere
        const cloudMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.3,
            flatShading: true
        });
        // Important: Clouds must also curve!
        cloudMat.onBeforeCompile = WorldBender.inject;

        // Distant floating clouds
        const group = new THREE.Group();
        for (let i = 0; i < 20; i++) {
            const cloud = new THREE.Mesh(cloudGeo, cloudMat);
            // Random clusters
            const x = (Math.random() - 0.5) * 100;
            const y = 20 + Math.random() * 10;
            const z = -Math.random() * 1000;

            const scale = 2 + Math.random() * 4;
            cloud.position.set(x, y, z);
            cloud.scale.set(scale, scale * 0.6, scale);

            group.add(cloud);
        }
        this.scene.add(group);
        // We can animate this group in update()
        this.skyMesh = group as any; // Hack to use existing property or add new one
    }

    private setupSky(): void { // Renamed from createSky
        const vertexShader = `
            varying vec3 vWorldPosition;
            void main() {
                vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
                vWorldPosition = worldPosition.xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
        `;
        const fragmentShader = `
            uniform vec3 topColor;
            uniform vec3 bottomColor;
            uniform float offset;
            uniform float exponent;
            varying vec3 vWorldPosition;
            void main() {
                float h = normalize( vWorldPosition + offset ).y;
                gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h , 0.0), exponent ), 0.0 ) ), 1.0 );
            }
        `;

        const uniforms = {
            topColor: { value: new THREE.Color(GAME_CONFIG.WORLD.SKY_COLOR_TOP) },
            bottomColor: { value: new THREE.Color(GAME_CONFIG.WORLD.SKY_COLOR_BOTTOM) },
            offset: { value: 33 },
            exponent: { value: 0.6 }
        };

        const skyGeo = new THREE.SphereGeometry(300, 32, 15);
        const skyMat = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: uniforms,
            side: THREE.BackSide,
            fog: false
        });

        this.skyMesh = new THREE.Mesh(skyGeo, skyMat);
        this.scene.add(this.skyMesh);

        // GROUND PLANE (Brown Earth under trees)
        // Lowered to -2.0 to prevent Z-fighting with road
        // Extended to 1000m for long view distance
        const groundGeo = new THREE.PlaneGeometry(1000, 1000, 64, 64);
        // Important: Rotate -90 deg X to lie flat
        groundGeo.rotateX(-Math.PI / 2);

        const groundMat = new THREE.MeshStandardMaterial({
            color: 0x5d4037, // Brown Earth
            roughness: 1.0,
            flatShading: true
        });
        groundMat.onBeforeCompile = WorldBender.inject;

        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.position.y = -0.05; // Flush with road
        this.scene.add(ground);
    }

    private setupTrees(): void {
        // High Performance Instanced Trees
        // TRUNKS
        const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 3, 5);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.9 });
        this.trees = new THREE.InstancedMesh(trunkGeo, trunkMat, this.count);
        this.trees.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.trees.castShadow = true;
        this.trees.receiveShadow = true;

        // LEAVES (Cone layers)
        const leavesGeo = new THREE.ConeGeometry(1.5, 3, 6);
        const leavesMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.8 });
        this.treeLeaves = new THREE.InstancedMesh(leavesGeo, leavesMat, this.count);
        this.treeLeaves.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.treeLeaves.castShadow = true;
        this.treeLeaves.receiveShadow = true;

        this.scene.add(this.trees);
        this.scene.add(this.treeLeaves);

        // Initial Layout
        for (let i = 0; i < this.count; i++) {
            // Random Z for initial scatter
            const z = -Math.random() * 1000;
            this.placeTree(i, z);
        }
    }

    private placeTree(index: number, zPos: number): void {
        const side = index % 2 === 0 ? 1 : -1;
        // Distribute in depth
        // Spread trees wide (10-30m off center) to create a forest tunnel
        const xOffset = side * (GAME_CONFIG.WORLD.LANE_WIDTH * 3 + Math.random() * 20);

        // Start random Z if not initializing in sequence
        if (zPos === 0) {
            // If called with 0, randomize it
            zPos = -Math.random() * 1000;
        }

        // Trunk
        this.dummy.position.set(xOffset, 1.5, zPos);
        this.dummy.scale.setScalar(1 + Math.random() * 0.5);
        this.dummy.rotation.set(0, Math.random() * Math.PI, 0);
        this.dummy.updateMatrix();
        this.trees.setMatrixAt(index, this.dummy.matrix);

        // Leaves
        this.dummy.position.y = 3.5;
        this.dummy.scale.setScalar(1 + Math.random() * 0.5);
        this.dummy.updateMatrix();
        this.treeLeaves.setMatrixAt(index, this.dummy.matrix);
    }

    public update(dt: number, speed: number): void {
        const moveDist = speed * dt;
        let dirty = false;

        for (let i = 0; i < this.count; i++) {
            this.trees.getMatrixAt(i, this.dummy.matrix);
            this.dummy.position.setFromMatrixPosition(this.dummy.matrix);

            this.dummy.position.z += moveDist;

            // Recycle if behind camera
            if (this.dummy.position.z > 10) {
                // Respawn far ahead
                const fogFar = GAME_CONFIG.WORLD.FOG_FAR;
                // Add some buffer to avoid pop-in
                const newZ = -fogFar - (Math.random() * 20);

                // Keep X side consistent? Or re-randomize
                const side = i % 2 === 0 ? 1 : -1;
                const xOffset = side * (GAME_CONFIG.WORLD.LANE_WIDTH * 4 + Math.random() * 8);

                this.dummy.position.z = newZ;
                this.dummy.position.x = xOffset;
                this.dummy.rotation.y = Math.random() * Math.PI;

                dirty = true;
            }

            this.dummy.updateMatrix();
            this.trees.setMatrixAt(i, this.dummy.matrix);

            // Sync leaves (simple offset Y)
            this.dummy.position.y += 2; // Offset
            this.dummy.updateMatrix();
            this.treeLeaves.setMatrixAt(i, this.dummy.matrix);
        }

        if (dirty) {
            this.trees.instanceMatrix.needsUpdate = true;
            this.treeLeaves.instanceMatrix.needsUpdate = true;
        }
    }
}
