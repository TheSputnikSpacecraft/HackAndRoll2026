export class HUD {
    private scoreElement: HTMLElement;
    private score: number = 0;

    constructor() {
        this.loadFonts();
        this.createDOM();
    }

    private loadFonts(): void {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }

    private createDOM(): void {
        // Container
        const container = document.createElement('div');
        Object.assign(container.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            fontFamily: '"Outfit", sans-serif',
            overflow: 'hidden'
        });

        // Logo (NUS RUNNER)
        const logo = document.createElement('div');
        logo.innerText = 'NUS RUNNER';
        Object.assign(logo.style, {
            position: 'absolute',
            top: '30px',
            left: '40px',
            fontWeight: '900',
            fontSize: '24px',
            letterSpacing: '2px',
            color: '#fff',
            textShadow: '0 2px 10px rgba(0,0,0,0.3)',
            opacity: '0.8'
        });

        // Score Pill
        this.scoreElement = document.createElement('div');
        this.scoreElement.innerText = '000000';
        Object.assign(this.scoreElement.style, {
            position: 'absolute',
            top: '30px',
            right: '40px',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            webkitBackdropFilter: 'blur(10px)',
            padding: '10px 30px',
            borderRadius: '30px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            color: '#fff',
            fontSize: '28px',
            fontWeight: '700',
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '2px'
        });

        // Controls Hint
        const controls = document.createElement('div');
        controls.innerHTML = `
            <div style="display:flex; gap:10px; align-items:center;">
                <span style="opacity:0.6; font-size:12px;">NAVIGATE</span>
                <span style="background:rgba(255,255,255,0.2); padding:4px 8px; border-radius:4px; font-size:12px;">←</span>
                <span style="background:rgba(255,255,255,0.2); padding:4px 8px; border-radius:4px; font-size:12px;">↑</span>
                <span style="background:rgba(255,255,255,0.2); padding:4px 8px; border-radius:4px; font-size:12px;">↓</span>
                <span style="background:rgba(255,255,255,0.2); padding:4px 8px; border-radius:4px; font-size:12px;">→</span>
            </div>
        `;
        Object.assign(controls.style, {
            position: 'absolute',
            bottom: '30px',
            left: '40px',
            color: '#fff',
            fontWeight: '500'
        });

        container.appendChild(logo);
        container.appendChild(this.scoreElement);
        container.appendChild(controls);
        document.body.appendChild(container);
    }

    public updateScore(score: number): void {
        this.score = Math.floor(score);
        this.scoreElement.innerText = this.score.toString().padStart(6, '0');
    }
}
