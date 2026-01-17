import { gsap } from 'gsap';

export class GameOver {
    private element!: HTMLElement;
    private scoreElement!: HTMLElement;
    private container!: HTMLElement;

    constructor() {
        this.createDOM();
    }

    private createDOM(): void {
        this.element = document.createElement('div');
        this.element.className = 'game-over-overlay';

        this.container = document.createElement('div');
        this.container.className = 'game-over-card';

        const title = document.createElement('h1');
        title.className = 'game-over-title';
        title.innerText = 'BUSTED!';
        this.container.appendChild(title);

        const label = document.createElement('div');
        label.className = 'game-over-score-label';
        label.innerText = 'Final Score';
        this.container.appendChild(label);

        this.scoreElement = document.createElement('div');
        this.scoreElement.className = 'game-over-score-value';
        this.scoreElement.innerText = '0';
        this.container.appendChild(this.scoreElement);

        const btn = document.createElement('button');
        btn.className = 'restart-btn';
        btn.innerText = 'Play Again';
        btn.onclick = () => {
            // Simple reload for stability
            window.location.reload();
        };
        this.container.appendChild(btn);

        this.element.appendChild(this.container);
        document.body.appendChild(this.element);
    }

    public show(score: number): void {
        this.scoreElement.innerText = Math.floor(score).toString();
        this.element.style.opacity = '1';
        this.element.style.pointerEvents = 'auto'; // Block clicks

        // Animate
        const tl = gsap.timeline();
        tl.fromTo(this.container,
            { scale: 0.5, opacity: 0, rotation: -10 },
            { scale: 1, opacity: 1, rotation: 0, duration: 0.6, ease: "back.out(1.7)" }
        );

        // Count up score (Visual)
        const scoreObj = { val: 0 };
        tl.to(scoreObj, {
            val: score,
            duration: 1.5,
            ease: "power2.out",
            onUpdate: () => {
                this.scoreElement.innerText = Math.floor(scoreObj.val).toString();
            }
        }, "-=0.4");
    }

    public hide(): void {
        this.element.style.opacity = '0';
        this.element.style.pointerEvents = 'none';
    }
}
