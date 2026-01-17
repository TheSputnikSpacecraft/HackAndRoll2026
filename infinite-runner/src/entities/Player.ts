import * as THREE from 'three';
import { GAME_CONFIG, INPUT_ACTIONS, type InputAction } from '../config/constants';

export class Player {
    public mesh: THREE.Group;
    private bodyGroup: THREE.Group; // Contains visual parts, moves for slide
    private torso!: THREE.Mesh;
    private head!: THREE.Mesh;
    private armL!: THREE.Mesh;
    private armR!: THREE.Mesh;
    private legL!: THREE.Mesh;
    private legR!: THREE.Mesh;

    // State
    private currentLane: number = 0; // -1 (Left), 0 (Center), 1 (Right)
    private targetX: number = 0;

    private verticalVelocity: number = 0;
    private isJumping: boolean = false;
    private isSliding: boolean = false;
    private slideTimer: number = 0;

    private groundY: number = 0;
    private runTime: number = 0;

    constructor() {
        this.mesh = new THREE.Group();
        this.bodyGroup = new THREE.Group();
        this.mesh.add(this.bodyGroup);

        this.setupHumanoid();
    }

    private setupHumanoid(): void {
        const materialRaw = new THREE.MeshStandardMaterial({ color: 0xffaa00, roughness: 0.4 }); // Orange Shirt
        const materialSkin = new THREE.MeshStandardMaterial({ color: 0xffccaa, roughness: 0.6 });
        const materialPants = new THREE.MeshStandardMaterial({ color: 0x2244aa, roughness: 0.8 }); // Blue Jeans

        // Torso
        this.torso = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.9, 0.3), materialRaw);
        this.torso.position.y = 1.3; // Center approx
        this.torso.castShadow = true;
        this.bodyGroup.add(this.torso);

        // Head
        this.head = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), materialSkin);
        this.head.position.y = 1.95;
        this.head.castShadow = true;
        this.bodyGroup.add(this.head);

        // Arms (anchored at shoulder)
        const armGeo = new THREE.BoxGeometry(0.2, 0.7, 0.2);
        armGeo.translate(0, -0.3, 0); // Pivot at top

        this.armL = new THREE.Mesh(armGeo, materialSkin);
        this.armL.position.set(-0.45, 1.7, 0);
        this.armL.castShadow = true;
        this.bodyGroup.add(this.armL);

        this.armR = new THREE.Mesh(armGeo, materialSkin);
        this.armR.position.set(0.45, 1.7, 0);
        this.armR.castShadow = true;
        this.bodyGroup.add(this.armR);

        // Legs (anchored at hip)
        const legGeo = new THREE.BoxGeometry(0.25, 0.9, 0.25);
        legGeo.translate(0, -0.4, 0); // Pivot at top

        this.legL = new THREE.Mesh(legGeo, materialPants);
        this.legL.position.set(-0.2, 0.85, 0);
        this.legL.castShadow = true;
        this.bodyGroup.add(this.legL);

        this.legR = new THREE.Mesh(legGeo, materialPants);
        this.legR.position.set(0.2, 0.85, 0);
        this.legR.castShadow = true;
        this.bodyGroup.add(this.legR);
    }

    public handleInput(action: InputAction): void {
        switch (action) {
            case INPUT_ACTIONS.LEFT:
                if (this.currentLane > -1) {
                    this.currentLane--;
                    this.updateTargetLane();
                }
                break;
            case INPUT_ACTIONS.RIGHT:
                if (this.currentLane < 1) {
                    this.currentLane++;
                    this.updateTargetLane();
                }
                break;
            case INPUT_ACTIONS.JUMP:
                if (!this.isJumping && !this.isSliding) {
                    this.jump();
                }
                break;
            case INPUT_ACTIONS.SLIDE:
                if (!this.isSliding && !this.isJumping) {
                    this.slide();
                } else if (this.isJumping) {
                    // Fast fall
                    this.verticalVelocity = -20;
                }
                break;
        }
    }

    private updateTargetLane(): void {
        this.targetX = this.currentLane * GAME_CONFIG.WORLD.LANE_WIDTH;
    }

    private jump(): void {
        this.isJumping = true;
        this.verticalVelocity = GAME_CONFIG.PLAYER.JUMP_FORCE;
    }

    private slide(): void {
        this.isSliding = true;
        this.slideTimer = GAME_CONFIG.PLAYER.SLIDE_DURATION;

        // Slide Pose: Rotate body back
        this.bodyGroup.rotation.x = -Math.PI / 2;
        this.bodyGroup.position.y = 0.5;
    }

    public update(dt: number): void {
        this.updateHorizontalMovement(dt);
        this.updateVerticalMovement(dt);
        this.updateSlide(dt);
        this.updateAnimation(dt);
    }

    private updateHorizontalMovement(dt: number): void {
        const speed = GAME_CONFIG.PLAYER.LANE_SWITCH_SPEED;
        const currentX = this.mesh.position.x;

        if (Math.abs(currentX - this.targetX) > 0.01) {
            const dir = Math.sign(this.targetX - currentX);
            const move = dir * speed * dt;

            if (Math.abs(move) > Math.abs(this.targetX - currentX)) {
                this.mesh.position.x = this.targetX;
            } else {
                this.mesh.position.x += move;
            }
            // Tilt mesh
            this.mesh.rotation.z = -dir * 0.15 * (1 - Math.abs(this.targetX - currentX));
        } else {
            this.mesh.position.x = this.targetX;
            this.mesh.rotation.z = 0;
        }
    }

    private updateVerticalMovement(dt: number): void {
        this.mesh.position.y += this.verticalVelocity * dt;
        this.verticalVelocity -= GAME_CONFIG.PLAYER.GRAVITY * dt;

        if (this.mesh.position.y <= this.groundY) {
            this.mesh.position.y = this.groundY;
            this.verticalVelocity = 0;
            this.isJumping = false;
        }
    }

    private updateSlide(dt: number): void {
        if (!this.isSliding) return;

        this.slideTimer -= dt;
        if (this.slideTimer <= 0) {
            this.isSliding = false;
            // Reset Pose
            this.bodyGroup.rotation.x = 0;
            this.bodyGroup.position.y = 0;
        }
    }

    private updateAnimation(dt: number): void {
        if (this.isSliding) return; // Simple slide pose handled in state

        if (this.isJumping) {
            // Jump Pose
            this.legL.rotation.x = Math.PI / 4;
            this.legR.rotation.x = -Math.PI / 4;
            this.armL.rotation.x = -Math.PI / 1.5; // Arms up
            this.armR.rotation.x = -Math.PI / 1.5;
        } else {
            // Run Cycle
            this.runTime += dt * 10; // Speed multiplier
            const amp = 0.8;

            this.legL.rotation.x = Math.sin(this.runTime) * amp;
            this.legR.rotation.x = Math.sin(this.runTime + Math.PI) * amp;

            this.armL.rotation.x = Math.sin(this.runTime + Math.PI) * amp * 0.7;
            this.armR.rotation.x = Math.sin(this.runTime) * amp * 0.7;
        }
    }

    public getAABB(): THREE.Box3 {
        const box = new THREE.Box3();
        const pos = this.mesh.position;
        // Tighter bounds for human
        const height = this.isSliding ? 0.8 : 1.8;
        const width = 0.5;
        const depth = 0.5;

        // Note: Mesh Y is at 0 (feet). 
        box.min.set(pos.x - width / 2, pos.y, pos.z - depth / 2);
        box.max.set(pos.x + width / 2, pos.y + height, pos.z + depth / 2);

        return box;
    }
}
