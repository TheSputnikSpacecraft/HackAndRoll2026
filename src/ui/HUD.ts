export class HUD {
    private scoreElement!: HTMLElement;
    private score: number = 0;

    constructor() {
        this.createDOM();
    }

    private createDOM(): void {
        const container = document.createElement('div');
        container.id = 'game-ui';

        // Score Container with CSS classes
        const scoreBox = document.createElement('div');
        scoreBox.className = 'hud-score-container';

        const label = document.createElement('span');
        label.className = 'hud-label';
        label.innerText = 'SCORE';
        scoreBox.appendChild(label);

        this.scoreElement = document.createElement('h1');
        this.scoreElement.className = 'hud-score';
        this.scoreElement.innerText = '0';
        scoreBox.appendChild(this.scoreElement);

        container.appendChild(scoreBox);

        // Controls Hint
        const hint = document.createElement('div');
        hint.className = 'controls-hint';
        hint.innerHTML = '← LANE → &nbsp;&nbsp; ↑ JUMP &nbsp;&nbsp; ↓ SLIDE';
        container.appendChild(hint);

        document.body.appendChild(container);
    }

    public updateScore(score: number): void {
        const intScore = Math.floor(score);
        if (intScore > this.score) {
            this.scoreElement.innerText = intScore.toString();

            // Pop animation on milestone
            if (intScore % 100 === 0 && intScore > 0) {
                // Simple scale punch
                this.scoreElement.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    this.scoreElement.style.transform = 'scale(1.0)';
                }, 100);
            }
            this.score = intScore;
        }
    }
}
