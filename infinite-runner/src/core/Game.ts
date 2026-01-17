import { Loop } from './Loop';
import { StateMachine, GameState } from './StateMachine';
import { InputManager } from '../input/InputManager';
import { Renderer } from '../rendering/Renderer';
import { Camera } from '../rendering/Camera';
import { GameScene } from '../rendering/Scene';
import { Environment } from '../rendering/Environment';
import { PostProcessing } from '../rendering/PostProcessing';
import { GAME_CONFIG, INPUT_ACTIONS, type InputAction } from '../config/constants';
import { Player } from '../entities/Player';
import { Track } from '../entities/Track';
import { Spawner } from '../systems/Spawner';
import { CollisionSystem } from '../systems/CollisionSystem';
import { HUD } from '../ui/HUD';
import { GameOver } from '../ui/GameOver';
import * as THREE from 'three';
import '../ui/style.css'; // Import Global Styles

export class Game {
    private loop: Loop;
    private stateMachine: StateMachine;
    private inputManager: InputManager;
    private renderer: Renderer;
    private postProcessing: PostProcessing;
    private camera: Camera;
    private scene: GameScene;
    private environment: Environment;

    private player: Player;
    private track: Track;
    private spawner: Spawner;
    private collisionSystem: CollisionSystem;

    // UI
    private hud: HUD;
    private gameOver: GameOver;

    // Game State
    private speed: number = 20; // Start faster
    private score: number = 0;

    constructor() {
        // Initialize Core Systems
        this.stateMachine = new StateMachine();
        this.inputManager = new InputManager();
        this.loop = new Loop(this.update, this.render);

        // Initialize Rendering
        this.renderer = new Renderer();
        this.camera = new Camera();
        this.scene = new GameScene();
        this.environment = new Environment(this.scene.instance);
        this.postProcessing = new PostProcessing(this.renderer.instance, this.scene.instance, this.camera.instance);

        // Initialize UI
        this.hud = new HUD();
        this.gameOver = new GameOver();

        // Initialize Entities
        this.player = new Player();
        this.track = new Track();
        this.scene.instance.add(this.player.mesh);
        this.scene.instance.add(this.track.mesh);

        // Initialize Systems
        this.spawner = new Spawner(this.scene.instance);
        this.collisionSystem = new CollisionSystem(this.player, this.spawner);

        // Bind Input
        this.inputManager.onAction(this.handleInput);
        this.stateMachine.onStateChange(this.handleStateChange);

        // Start
        this.stateMachine.setState(GameState.RUNNING);

        // Broadcast Start
        window.parent.postMessage({ type: 'GAME_START' }, '*');

        this.loop.start();
    }

    private handleStateChange = (newState: GameState): void => {
        if (newState === GameState.DEAD) {
            console.log('GAME OVER - Auto-restarting...');
            // Broadcast Death to Chrome Extension
            window.parent.postMessage({ type: 'GAME_OVER' }, '*');
            // Brief camera shake effect, then auto-restart
            setTimeout(() => {
                this.reset();
            }, 500); // 500ms delay before auto-restart
        } else if (newState === GameState.RUNNING) {
            this.gameOver.hide();
        }
    };

    private handleInput = (action: InputAction): void => {
        if (this.stateMachine.state === GameState.RUNNING) {
            this.player.handleInput(action);
        } else if (this.stateMachine.state === GameState.DEAD) {
            if (action === INPUT_ACTIONS.JUMP || action === INPUT_ACTIONS.PAUSE) {
                this.reset();
            }
        }
    };

    private reset(): void {
        // Broadcast Restart to Chrome Extension immediately
        window.parent.postMessage({ type: 'GAME_RESTART' }, '*');

        this.score = 0;
        this.speed = GAME_CONFIG.PLAYER.SPEED_INITIAL;

        // Reset Entities
        this.player.reset();
        this.spawner.reset();

        // Reset State
        this.stateMachine.setState(GameState.RUNNING);
    }

    private update = (dt: number): void => {
        if (this.stateMachine.state !== GameState.RUNNING) return;

        // Speed Progression
        this.speed += dt * 0.5;
        this.score += this.speed * dt;

        this.hud.updateScore(this.score);

        this.player.update(dt);
        this.track.update(dt, this.speed);
        this.spawner.update(dt, this.speed);
        if (this.environment) this.environment.update(dt, this.speed);

        // Check for bomb collection
        this.checkBombCollection();

        if (this.collisionSystem.check()) {
            this.stateMachine.setState(GameState.DEAD);
            this.camera.addShake(2.0); // Impact shake
        }

        this.updateCamera(dt);
    };

    private updateCamera(dt: number): void {
        // Camera Follow Logic (Subway Surfers Style: Low & Close)
        // Camera stays relative to player Z, but X is dampened

        const offsetZ = GAME_CONFIG.WORLD.CAMERA.DISTANCE;
        const targetZ = this.player.mesh.position.z + offsetZ;

        // Horizontal follow with lag
        const targetX = this.player.mesh.position.x * 0.6; // Follow player partially

        const targetPos = new THREE.Vector3(
            targetX,
            GAME_CONFIG.WORLD.CAMERA.HEIGHT, // Keep height mostly constant? maybe slight bounce
            targetZ
        );

        // Add easy-in/out lerp
        this.camera.instance.position.x += (targetPos.x - this.camera.instance.position.x) * dt * 5;
        this.camera.instance.position.z = targetPos.z; // Hard lock Z to player speed? Or Lerp?
        // Actually, player Z moves. We must match speed. 
        // Correct approach: Camera is at Player.Z + Offset.
        // But for "Feel", we allow Z to drift slightly on speed changes? 
        // For now, hard lock Z is smoothest frame rate wise.
        this.camera.instance.position.z = this.player.mesh.position.z + offsetZ;

        // Apply constant height
        this.camera.instance.position.y = GAME_CONFIG.WORLD.CAMERA.HEIGHT + (this.player.mesh.position.y * 0.1);

        // Look Ahead
        const lookTarget = new THREE.Vector3(
            this.player.mesh.position.x * 0.3, // Look slightly at player lane
            GAME_CONFIG.WORLD.CAMERA.LOOK_AT_HEIGHT,
            this.player.mesh.position.z - 20 // Look far ahead
        );

        this.camera.instance.lookAt(lookTarget);
        this.camera.update(dt); // Apply shake
    }

    private render = (): void => {
        // this.renderer.instance.render(this.scene.instance, this.camera.instance);
        if (this.postProcessing) {
            this.postProcessing.render();
        } else {
            // Fallback for first frame or if PP fails
            this.renderer.instance.render(this.scene.instance, this.camera.instance);
        }
    };

    private checkBombCollection(): void {
        const playerBox = this.player.getAABB();

        for (const bomb of this.spawner.bombs) {
            if (playerBox.intersectsBox(bomb.getAABB())) {
                // Collected a bomb!
                console.log('💣 Bomb Collected!');

                // Send message to skip video 5 seconds
                window.parent.postMessage({ type: 'BOMB_COLLECTED' }, '*');

                // Remove the bomb
                this.spawner.removeBomb(bomb);

                // Add bonus points
                this.score += 100;

                // Visual feedback (small camera shake)
                this.camera.addShake(0.3);

                break; // Only collect one bomb per frame
            }
        }
    }
}
