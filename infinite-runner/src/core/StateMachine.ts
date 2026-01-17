export const GameState = {
    INIT: 'INIT',
    RUNNING: 'RUNNING',
    PAUSED: 'PAUSED',
    DEAD: 'DEAD'
} as const;

export type GameState = typeof GameState[keyof typeof GameState];

type StateChangeListener = (newState: GameState, oldState: GameState) => void;

export class StateMachine {
    private currentState: GameState = GameState.INIT;
    private listeners: StateChangeListener[] = [];

    constructor() {
        console.log('[StateMachine] Initialized in state:', this.currentState);
    }

    public get state(): GameState {
        return this.currentState;
    }

    public setState(newState: GameState): void {
        if (this.currentState === newState) return;

        const oldState = this.currentState;
        this.currentState = newState;

        console.log(`[StateMachine] Transition: ${oldState} -> ${newState}`);
        this.notifyListeners(newState, oldState);
    }

    public onStateChange(listener: StateChangeListener): void {
        this.listeners.push(listener);
    }

    private notifyListeners(newState: GameState, oldState: GameState): void {
        this.listeners.forEach(listener => listener(newState, oldState));
    }

    public is(state: GameState): boolean {
        return this.currentState === state;
    }
}
