export class Loop {
    private lastTime: number = 0;
    private animationFrameId: number | null = null;
    private onUpdate: (dt: number) => void;
    private onRender: () => void;
    private isRunning: boolean = false;

    private hasLogged: boolean = false;

    constructor(onUpdate: (dt: number) => void, onRender: () => void) {
        this.onUpdate = onUpdate;
        this.onRender = onRender;
    }

    public start(): void {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        this.loop();
    }

    public stop(): void {
        this.isRunning = false;
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    private loop = (): void => {
        if (!this.isRunning) return;

        if (!this.hasLogged) {
            console.log('Game Loop Started');
            this.hasLogged = true;
        }

        const now = performance.now();
        const dt = Math.min((now - this.lastTime) / 1000, 0.1); // Cap dt to avoid huge jumps
        this.lastTime = now;

        this.onUpdate(dt);
        this.onRender();

        this.animationFrameId = requestAnimationFrame(this.loop);
    };
}
