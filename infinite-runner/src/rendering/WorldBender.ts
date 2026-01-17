

// The curvature amount. 
const CURVE_Y = 0.0; // Flat World (Raises horizon to screen center)

export const WorldBender = {
    inject: (shader: any) => {
        shader.uniforms.curveY = { value: CURVE_Y };

        shader.vertexShader = `
            uniform float curveY;
            ${shader.vertexShader}
        `;

        shader.vertexShader = shader.vertexShader.replace(
            '#include <project_vertex>',
            `
            vec4 worldPosition = modelMatrix * vec4( transformed, 1.0 );
            vec4 mvPosition = viewMatrix * worldPosition;
            
            // Bend Y based on View Z (negative in front of camera)
            float zDist = mvPosition.z; 
            float curve = curveY * zDist * zDist;
            
            mvPosition.y -= curve;
            
            gl_Position = projectionMatrix * mvPosition;
            `
        );
    }
};
