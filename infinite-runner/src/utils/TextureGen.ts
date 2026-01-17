import * as THREE from 'three';

export function createTextTexture(text: string, bgColor: string = '#ffffff', textColor: string = '#000000'): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 20;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Text
    ctx.fillStyle = textColor;
    ctx.font = 'bold 80px "Outfit", Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

export function createAsphaltTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Base dark grey
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, 0, 512, 512);

    // Noise
    for (let i = 0; i < 50000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const shade = Math.random() * 50;
        ctx.fillStyle = `rgba(${shade + 40}, ${shade + 40}, ${shade + 40}, 0.2)`;
        ctx.fillRect(x, y, 2, 2);
    }

    // Lane Markings (White Dashed Lines)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 10;
    ctx.setLineDash([40, 40]);

    // Lane 1 divider (approx 1/3)
    ctx.beginPath();
    ctx.moveTo(170, 0);
    ctx.lineTo(170, 512);
    ctx.stroke();

    // Lane 2 divider (approx 2/3)
    ctx.beginPath();
    ctx.moveTo(342, 0);
    ctx.lineTo(342, 512);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    // Anisotropy helps with oblique viewing angles
    texture.anisotropy = 16;

    return texture;
}

export function createShirtTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Blue Base (Fully Blue Shirt)
    ctx.fillStyle = '#003D7C';
    ctx.fillRect(0, 0, 256, 256);

    // No patches needed - whole shirt is blue

    // Draw NUS on ALL 4 Sides (0, 64, 128, 192) to match Cylinder rotation
    // This brute-forces visibility regardless of how the mesh is rotated.
    const positions = [0, 64, 128, 192]; // 4 Quadrants

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 50px "Impact", "Arial Black", sans-serif'; // Slightly smaller to fit curvature
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    positions.forEach(x => {
        // Draw centered at this X
        ctx.fillText('67', x, 115);

        // Handle Edge Wrapping for 0 (Draw corresponding half at 256)
        if (x === 0) {
            ctx.fillText('67', 256, 115);
        }
    });

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}
