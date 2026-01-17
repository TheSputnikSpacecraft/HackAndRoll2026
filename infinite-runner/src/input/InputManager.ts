import { INPUT_ACTIONS, type InputAction, GAME_CONFIG } from '../config/constants';

type InputListener = (action: InputAction) => void;

export class InputManager {
    private listeners: InputListener[] = [];
    private touchStartX: number = 0;
    private touchStartY: number = 0;

    constructor() {
        this.setupKeyboard();
        this.setupTouch();
    }

    public onAction(listener: InputListener): void {
        this.listeners.push(listener);
    }

    private emit(action: InputAction): void {
        this.listeners.forEach(l => l(action));
    }

    private setupKeyboard(): void {
        window.addEventListener('keydown', (e) => {
            switch (e.code) {
                case 'ArrowLeft':
                case 'KeyA':
                    this.emit(INPUT_ACTIONS.LEFT);
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.emit(INPUT_ACTIONS.RIGHT);
                    break;
                case 'ArrowUp':
                case 'Space':
                case 'KeyW':
                    this.emit(INPUT_ACTIONS.JUMP);
                    break;
                case 'ArrowDown':
                case 'ShiftLeft':
                case 'KeyS':
                    this.emit(INPUT_ACTIONS.SLIDE);
                    break;
                case 'Escape':
                case 'KeyP':
                    this.emit(INPUT_ACTIONS.PAUSE);
                    break;
            }
        });
    }

    private setupTouch(): void {
        document.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        }, { passive: false });

        document.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            this.handleSwipe(touchEndX, touchEndY);
        }, { passive: false });
    }

    private handleSwipe(endX: number, endY: number): void {
        const diffX = endX - this.touchStartX;
        const diffY = endY - this.touchStartY;
        const absX = Math.abs(diffX);
        const absY = Math.abs(diffY);
        const threshold = GAME_CONFIG.INPUT.SWIPE_THRESHOLD;

        if (Math.max(absX, absY) < threshold) return; // Tap?

        if (absX > absY) {
            // Horizontal
            if (diffX > 0) this.emit(INPUT_ACTIONS.RIGHT);
            else this.emit(INPUT_ACTIONS.LEFT);
        } else {
            // Vertical
            if (diffY > 0) this.emit(INPUT_ACTIONS.SLIDE);
            else this.emit(INPUT_ACTIONS.JUMP);
        }
    }

    // Public method to simulate input (for external control)
    public simulateAction(action: InputAction): void {
        console.log('[Input] Simulated:', action);
        this.emit(action);
    }
}
