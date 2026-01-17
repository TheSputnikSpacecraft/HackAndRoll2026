import * as THREE from 'three';
import { GAME_CONFIG, INPUT_ACTIONS, type InputAction } from '../config/constants';
import { createShirtTexture } from '../utils/TextureGen';
import { WorldBender } from '../rendering/WorldBender';

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
        // Materials (Stylized)
        const shirtTex = createShirtTexture();
        const matShirt = new THREE.MeshStandardMaterial({ map: shirtTex, roughness: 0.5 });
        const matSkin = new THREE.MeshStandardMaterial({ color: 0xffccaa, roughness: 0.3 });
        const matPants = new THREE.MeshStandardMaterial({ color: 0x1a2b4c, roughness: 0.6 });
        const matShoes = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.4 });

        // Apply Curve
        [matShirt, matSkin, matPants, matShoes].forEach(m => {
            m.onBeforeCompile = WorldBender.inject;
        });

        // -- BODY (Capsule) --
        const bodyGeo = new THREE.CapsuleGeometry(0.25, 0.4, 4, 8); // Radius, Length
        this.torso = new THREE.Mesh(bodyGeo, matShirt);
        // Rotate text to face camera? 
        // Texture creates seam at back usually.
        // Camera is BEHIND player.
        // So we see the seam.
        // I drew the logo at Center (128). That is FRONT.
        // So I need to rotate the torso 180 deg so FRONT faces BACK (Camera).
        this.torso.rotation.y = Math.PI;
        this.torso.position.y = 1.4;
        this.torso.castShadow = true;
        this.bodyGroup.add(this.torso);

        // -- HEAD --
        // Sphere for organic head
        this.head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), matSkin);
        this.head.position.y = 0.55; // Relative to Torso center (0)
        this.head.castShadow = true;
        this.torso.add(this.head); // Parenting to torso

        // Hat (Backwards Cap)
        const cap = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.35), matPants);
        cap.position.set(0, 0.15, -0.1);
        cap.rotation.x = -0.2;
        this.head.add(cap);

        // -- ARMS (Capsules) --
        const armGeo = new THREE.CapsuleGeometry(0.08, 0.4, 4, 8);
        armGeo.translate(0, -0.2, 0); // Pivot at top

        // Left Arm
        const shoulderL = new THREE.Group();
        shoulderL.position.set(-0.3, 0.2, 0); // Shoulder socket
        this.torso.add(shoulderL);

        this.armL = new THREE.Mesh(armGeo, matSkin);
        shoulderL.add(this.armL);

        // Right Arm
        const shoulderR = new THREE.Group();
        shoulderR.position.set(0.3, 0.2, 0);
        this.torso.add(shoulderR);

        this.armR = new THREE.Mesh(armGeo, matSkin);
        shoulderR.add(this.armR);

        // -- LEGS (Capsules) --
        const legGeo = new THREE.CapsuleGeometry(0.1, 0.5, 4, 8);
        legGeo.translate(0, -0.25, 0); // Pivot at top

        // Left Leg
        const hipL = new THREE.Group();
        hipL.position.set(-0.15, -0.3, 0); // Hip socket
        this.torso.add(hipL);

        this.legL = new THREE.Mesh(legGeo, matPants);
        hipL.add(this.legL);

        // Shoe L
        const shoeGeo = new THREE.CapsuleGeometry(0.12, 0.2, 4, 8);
        shoeGeo.translate(0, 0, 0.05); // Offset forward
        const shoeL = new THREE.Mesh(shoeGeo, matShoes);
        shoeL.rotation.x = Math.PI / 2; // Flat on ground (mostly)
        shoeL.position.set(0, -0.55, 0.1);
        this.legL.add(shoeL);

        // Right Leg
        const hipR = new THREE.Group();
        hipR.position.set(0.15, -0.3, 0);
        this.torso.add(hipR);

        this.legR = new THREE.Mesh(legGeo, matPants);
        hipR.add(this.legR);

        // Shoe R
        const shoeR = new THREE.Mesh(shoeGeo, matShoes);
        shoeR.rotation.x = Math.PI / 2;
        shoeR.position.set(0, -0.55, 0.1);
        this.legR.add(shoeR);

        // Assign animation targets to the PIVOT GROUPS
        this.armL = shoulderL as any;
        this.armR = shoulderR as any;
        this.legL = hipL as any;
        this.legR = hipR as any;
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
        if (this.isSliding) return;

        if (this.isJumping) {
            // Jump Pose
            this.legL.rotation.x = Math.PI / 4;
            this.legR.rotation.x = -Math.PI / 4;
            this.armL.rotation.x = -Math.PI / 1.5;
            this.armR.rotation.x = -Math.PI / 1.5;
        } else {
            // Run Cycle
            this.runTime += dt * 10;
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

    public reset(): void {
        this.currentLane = 0;
        this.targetX = 0;
        this.mesh.position.set(0, 0, 0);
        this.mesh.rotation.set(0, 0, 0);
        this.verticalVelocity = 0;
        this.isJumping = false;
        this.isSliding = false;

        // Reset Visual Group
        this.bodyGroup.rotation.set(0, 0, 0);
        this.bodyGroup.position.set(0, 0, 0);
    }
}
