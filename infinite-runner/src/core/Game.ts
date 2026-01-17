import { Loop } from './Loop';
import { StateMachine, GameState } from './StateMachine';
import { InputManager } from '../input/InputManager';
import { Renderer } from '../rendering/Renderer';
import { Camera } from '../rendering/Camera';
import { GameScene } from '../rendering/Scene';
import { INPUT_ACTIONS, type InputAction } from '../config/constants';
import { Player } from '../entities/Player';
import { Track } from '../entities/Track';
import { Spawner } from '../systems/Spawner';
import { CollisionSystem } from '../systems/CollisionSystem';
import { HUD } from '../ui/HUD';
import { GameOver } from '../ui/GameOver';
import * as THREE from 'three';

export class Game {
    private loop: Loop;
    private stateMachine: StateMachine;
    private inputManager: InputManager;
    private renderer: Renderer;
    private camera: Camera;
    private scene: GameScene;

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

        // Initialize UI
        this.hud = new HUD();
        this.gameOver = new GameOver();

        // Initialize Entities
        this.player = new Player();
        this.track = new Track();

        // Initialize Systems
        this.spawner = new Spawner(this.scene.instance);
        this.collisionSystem = new CollisionSystem(this.player, this.spawner);

        this.scene.instance.add(this.player.mesh);
        this.scene.instance.add(this.track.mesh);

        // Bind Input
        this.inputManager.onAction(this.handleInput);
        this.stateMachine.onStateChange(this.handleStateChange);

        // Start
        this.stateMachine.setState(GameState.RUNNING);
        this.loop.start();
    }

    private handleStateChange = (newState: GameState, oldState: GameState): void => {
        if (newState === GameState.DEAD) {
            console.log('GAME OVER');
            this.gameOver.show(this.score);
        } else if (newState === GameState.RUNNING) {
            this.gameOver.hide();
        }
    };

    private handleInput = (action: InputAction): void => {
        if (this.stateMachine.state === GameState.RUNNING) {
            this.player.handleInput(action);
        } else if (this.stateMachine.state === GameState.DEAD) {
            if (action === INPUT_ACTIONS.JUMP || action === INPUT_ACTIONS.PAUSE) {
                // Simple Reload for robustness
                window.location.reload();
            }
        }
    };

    private update = (dt: number): void => {
        if (this.stateMachine.state !== GameState.RUNNING) return;

        // Speed Progression
        this.speed += dt * 0.5;
        this.score += this.speed * dt;

        this.hud.updateScore(this.score);

        this.player.update(dt);
        this.track.update(dt, this.speed);
        this.spawner.update(dt, this.speed);

        if (this.collisionSystem.check()) {
            this.stateMachine.setState(GameState.DEAD);
        }

        this.updateCamera(dt);
    };

    private updateCamera(dt: number): void {
        // Camera Follow Logic
        const targetPos = new THREE.Vector3(
            this.player.mesh.position.x * 0.3, // Subtle horizontal follow
            this.player.mesh.position.y + 3,
            this.player.mesh.position.z + 8
        );

        this.camera.instance.position.lerp(targetPos, dt * 5);
        this.camera.instance.lookAt(0, 1, 0);
    }

    private render = (): void => {
        this.renderer.instance.render(this.scene.instance, this.camera.instance);
    };
}
