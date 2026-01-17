export class GameOver {
    private element: HTMLElement;
    private scoreElement: HTMLElement;
    private container: HTMLElement;

    constructor() {
        this.createDOM();
        this.hide();
    }

    private createDOM(): void {
        this.element = document.createElement('div');
        Object.assign(this.element.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.4)', // Dark overlay
            backdropFilter: 'blur(8px)',
            webkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: '100',
            opacity: '0',
            transition: 'opacity 0.4s ease',
            pointerEvents: 'none',
            fontFamily: '"Outfit", sans-serif'
        });

        // Glass Card
        this.container = document.createElement('div');
        Object.assign(this.container.style, {
            background: 'rgba(25, 25, 35, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '60px 80px',
            borderRadius: '20px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            textAlign: 'center',
            transform: 'scale(0.9)',
            transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        });

        const title = document.createElement('h1');
        title.innerText = 'CRASHED';
        Object.assign(title.style, {
            margin: '0 0 20px 0',
            fontSize: '64px',
            fontWeight: '900',
            color: '#FF4444',
            letterSpacing: '-2px',
            lineHeight: '1',
            textShadow: '0 10px 20px rgba(255, 68, 68, 0.3)'
        });

        const scoreLabel = document.createElement('p');
        scoreLabel.innerText = 'FINAL SCORE';
        Object.assign(scoreLabel.style, {
            margin: '0',
            fontSize: '14px',
            fontWeight: '600',
            color: '#888',
            letterSpacing: '2px',
            textTransform: 'uppercase'
        });

        this.scoreElement = document.createElement('div');
        this.scoreElement.innerText = '000000';
        Object.assign(this.scoreElement.style, {
            margin: '10px 0 40px 0',
            fontSize: '56px',
            fontWeight: '700',
            color: '#fff',
            lineHeight: '1',
            fontVariantNumeric: 'tabular-nums'
        });

        const button = document.createElement('div');
        button.innerText = 'RESTART SYSTEM';
        Object.assign(button.style, {
            background: '#fff',
            color: '#000',
            padding: '16px 32px',
            borderRadius: '50px',
            fontSize: '16px',
            fontWeight: '700',
            letterSpacing: '1px',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            display: 'inline-block'
        });

        // Add visual hint for Spacebar
        const sub = document.createElement('div');
        sub.innerText = 'PRESS SPACEBAR';
        Object.assign(sub.style, {
            marginTop: '15px',
            fontSize: '12px',
            color: '#666',
            fontWeight: '500'
        });

        this.container.appendChild(title);
        this.container.appendChild(scoreLabel);
        this.container.appendChild(this.scoreElement);
        this.container.appendChild(button);
        this.container.appendChild(sub);

        this.element.appendChild(this.container);
        document.body.appendChild(this.element);
    }

    public show(finalScore: number): void {
        this.scoreElement.innerText = Math.floor(finalScore).toString().padStart(6, '0');
        this.element.style.opacity = '1';
        this.element.style.pointerEvents = 'auto';
        this.container.style.transform = 'scale(1)';
    }

    public hide(): void {
        this.element.style.opacity = '0';
        this.element.style.pointerEvents = 'none';
        this.container.style.transform = 'scale(0.9)';
    }
}
