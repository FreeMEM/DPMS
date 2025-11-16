/**
 * Background effects configuration
 * Each effect defines initialization and animation logic for the ThreeBackground component
 */

/**
 * HYPERSPACE EFFECT
 * Tunnel effect with particles moving towards the camera (Star Wars style)
 */
export const hyperspaceEffect = {
  name: 'hyperspace',

  particleCount: (variant) => variant === "admin" ? 500 : 350,

  // Line connection settings
  maxConnections: (variant) => variant === "admin" ? 100 : 50,
  lineOpacity: 0.15,
  maxConnectionDistance: 2.5,
  animateLines: false,  // Sin animación de energía

  initializeParticles: (particlesCount, variant, particleColors) => {
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    const sizes = new Float32Array(particlesCount);
    const particleData = [];

    for (let i = 0; i < particlesCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 8 + 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = Math.random() * -50 - 10;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const color = particleColors[Math.floor(Math.random() * particleColors.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = Math.random() * 3 + 1;

      particleData.push({
        angle: angle,
        radius: radius,
        speed: Math.random() * 0.5 + 0.3,
      });
    }

    return { positions, colors, sizes, particleData };
  },

  animateParticles: (particlesCount, positions, particleData, mouseRef, elapsedTime) => {
    for (let i = 0; i < particlesCount; i++) {
      const data = particleData[i];
      const i3 = i * 3;

      // Move particle towards camera
      positions[i3 + 2] += data.speed;

      // Reset particle to back when it passes camera
      if (positions[i3 + 2] > 5) {
        positions[i3 + 2] = Math.random() * -50 - 10;
        data.angle = Math.random() * Math.PI * 2;
        data.radius = Math.random() * 8 + 2;
      }

      // Mouse interaction - particles fly towards mouse position
      const targetAngle = Math.atan2(mouseRef.current.y * 5, mouseRef.current.x * 5);
      let angleDiff = targetAngle - data.angle;

      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      data.angle += angleDiff * 0.005;

      // Update X and Y based on current angle and radius
      positions[i3] = Math.cos(data.angle) * data.radius;
      positions[i3 + 1] = Math.sin(data.angle) * data.radius;
    }

    return null; // No rotation for hyperspace mode
  },

  plasmaShader: `
    uniform float time;
    uniform vec3 color1;
    uniform vec3 color2;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv * 2.0 - 1.0;
      float dist = length(uv);
      float angle = atan(uv.y, uv.x);

      // Star streaks effect
      float streaks1 = sin(angle * 20.0 - dist * 8.0 + time * 3.0);
      float streaks2 = sin(angle * 15.0 - dist * 10.0 + time * 2.5);
      float streaks3 = sin(angle * 25.0 - dist * 6.0 + time * 3.5);
      float streaks = (streaks1 + streaks2 + streaks3) * 0.333;

      float stretchFactor = smoothstep(0.0, 1.5, dist);
      streaks *= stretchFactor;

      float tunnel = sin(dist * 5.0 - time * 2.0);
      float pulse = sin(dist * 3.0 - time * 1.5) * 0.5;

      float plasma = (streaks * 0.6 + tunnel * 0.3 + pulse * 0.1);
      plasma = smoothstep(-0.4, 0.4, plasma);

      float radialGradient = smoothstep(0.0, 1.2, dist);
      plasma = mix(plasma * 0.5, plasma, radialGradient);

      vec3 color = mix(color1, color2, plasma);
      float edgeFade = 1.0 - smoothstep(0.8, 1.5, dist);

      gl_FragColor = vec4(color, 0.4 * edgeFade);
    }
  `
};

/**
 * WAVE EFFECT
 * Flowing wave motion with particle rotation and mouse repulsion
 */
export const waveEffect = {
  name: 'wave',

  particleCount: (variant) => variant === "admin" ? 1000 : 500,

  // Line connection settings - más brillantes y abundantes
  maxConnections: (variant) => variant === "admin" ? 250 : 150,
  lineOpacity: 0.5,  // Aumentado para ver mejor la energía
  maxConnectionDistance: 3.5,  // Distancia mayor para más conexiones
  animateLines: true,  // ¡CON animación de energía!

  initializeParticles: (particlesCount, variant, particleColors) => {
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    const sizes = new Float32Array(particlesCount);

    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;

      positions[i3] = (Math.random() - 0.5) * 10;
      positions[i3 + 1] = (Math.random() - 0.5) * 10;
      positions[i3 + 2] = (Math.random() - 0.5) * 10;

      const colorValue = Math.random();
      if (variant === "admin") {
        if (colorValue < 0.33) {
          colors[i3] = 0.2; colors[i3 + 1] = 0.4; colors[i3 + 2] = 0.8;
        } else if (colorValue < 0.66) {
          colors[i3] = 0.6; colors[i3 + 1] = 0.2; colors[i3 + 2] = 0.8;
        } else {
          colors[i3] = 0.9; colors[i3 + 1] = 0.2; colors[i3 + 2] = 0.6;
        }
      } else {
        if (colorValue < 0.33) {
          colors[i3] = 0.2; colors[i3 + 1] = 0.8; colors[i3 + 2] = 0.8;
        } else if (colorValue < 0.66) {
          colors[i3] = 0.2; colors[i3 + 1] = 0.9; colors[i3 + 2] = 0.4;
        } else {
          colors[i3] = 0.9; colors[i3 + 1] = 0.9; colors[i3 + 2] = 0.2;
        }
      }

      sizes[i] = Math.random() * 3;
    }

    return { positions, colors, sizes, particleData: null };
  },

  animateParticles: (particlesCount, positions, originalPositions, mouseRef, elapsedTime) => {
    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;

      const originalX = originalPositions[i3];
      const originalY = originalPositions[i3 + 1];
      const originalZ = originalPositions[i3 + 2];

      // Wave effect
      const waveX = Math.sin(elapsedTime * 0.3 + originalY * 0.5) * 0.3;
      const waveY = Math.cos(elapsedTime * 0.2 + originalX * 0.5) * 0.3;
      const waveZ = Math.sin(elapsedTime * 0.25 + originalX * 0.3 + originalY * 0.3) * 0.2;

      positions[i3] = originalX + waveX;
      positions[i3 + 1] = originalY + waveY;
      positions[i3 + 2] = originalZ + waveZ;

      // Mouse interaction - repulsion
      const dx = mouseRef.current.x * 5 - positions[i3];
      const dy = mouseRef.current.y * 5 - positions[i3 + 1];
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 3) {
        const force = ((3 - distance) / 3) * 0.5;
        positions[i3] -= dx * force;
        positions[i3 + 1] -= dy * force;
      }
    }

    // Return rotation values for this effect
    return {
      rotationY: Math.sin(elapsedTime * 0.1) * 0.2,
      rotationX: Math.cos(elapsedTime * 0.15) * 0.1
    };
  },

  plasmaShader: `
    uniform float time;
    uniform vec3 color1;
    uniform vec3 color2;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv * 2.0 - 1.0;

      // Flowing plasma waves
      float wave1 = sin(uv.x * 2.0 + time * 0.3) * cos(uv.y * 1.5 - time * 0.2);
      float wave2 = sin(uv.y * 2.5 + time * 0.25) * cos(uv.x * 2.0 + time * 0.15);
      float wave3 = sin((uv.x + uv.y) * 1.5 + time * 0.35);

      float dist = length(uv);
      float wave4 = sin(dist * 4.0 - time * 0.8) * 0.5;

      float plasma = (wave1 + wave2 + wave3 + wave4) * 0.25;
      plasma = smoothstep(-0.3, 0.3, plasma);

      vec3 color = mix(color1, color2, plasma);

      gl_FragColor = vec4(color, 0.4);
    }
  `
};

/**
 * ENERGY GRID EFFECT
 * Network of particles with energy flowing through connections
 */
export const energyGridEffect = {
  name: 'energy-grid',

  particleCount: (variant) => variant === "admin" ? 400 : 250,

  // Line connection settings - energía visible fluyendo
  maxConnections: (variant) => variant === "admin" ? 200 : 120,
  lineOpacity: 0.6,  // Muy brillante para ver la energía
  maxConnectionDistance: 5.0,  // Partículas más espaciadas
  animateLines: true,  // ¡CON animación de energía!

  initializeParticles: (particlesCount, variant, particleColors) => {
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    const sizes = new Float32Array(particlesCount);

    // Distribuir partículas en una grid 3D más espaciada
    const gridSize = Math.ceil(Math.pow(particlesCount, 1/3));
    const spacing = 15 / gridSize;

    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;

      // Grid con algo de variación aleatoria
      const x = (i % gridSize) * spacing - 7.5 + (Math.random() - 0.5) * spacing * 0.5;
      const y = (Math.floor(i / gridSize) % gridSize) * spacing - 7.5 + (Math.random() - 0.5) * spacing * 0.5;
      const z = Math.floor(i / (gridSize * gridSize)) * spacing - 7.5 + (Math.random() - 0.5) * spacing * 0.5;

      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      const colorValue = Math.random();
      if (variant === "admin") {
        if (colorValue < 0.33) {
          colors[i3] = 0.3; colors[i3 + 1] = 0.5; colors[i3 + 2] = 1.0;
        } else if (colorValue < 0.66) {
          colors[i3] = 0.7; colors[i3 + 1] = 0.3; colors[i3 + 2] = 1.0;
        } else {
          colors[i3] = 1.0; colors[i3 + 1] = 0.3; colors[i3 + 2] = 0.7;
        }
      } else {
        if (colorValue < 0.33) {
          colors[i3] = 0.3; colors[i3 + 1] = 1.0; colors[i3 + 2] = 1.0;
        } else if (colorValue < 0.66) {
          colors[i3] = 0.3; colors[i3 + 1] = 1.0; colors[i3 + 2] = 0.5;
        } else {
          colors[i3] = 1.0; colors[i3 + 1] = 1.0; colors[i3 + 2] = 0.3;
        }
      }

      sizes[i] = Math.random() * 2 + 2; // Partículas ligeramente más grandes
    }

    return { positions, colors, sizes, particleData: null };
  },

  animateParticles: (particlesCount, positions, originalPositions, mouseRef, elapsedTime) => {
    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;

      const originalX = originalPositions[i3];
      const originalY = originalPositions[i3 + 1];
      const originalZ = originalPositions[i3 + 2];

      // Suave movimiento de respiración/pulsación
      const breathX = Math.sin(elapsedTime * 0.2 + originalX * 0.2) * 0.15;
      const breathY = Math.sin(elapsedTime * 0.2 + originalY * 0.2) * 0.15;
      const breathZ = Math.sin(elapsedTime * 0.2 + originalZ * 0.2) * 0.15;

      positions[i3] = originalX + breathX;
      positions[i3 + 1] = originalY + breathY;
      positions[i3 + 2] = originalZ + breathZ;

      // Atracción muy sutil hacia el mouse
      const dx = mouseRef.current.x * 3 - positions[i3];
      const dy = mouseRef.current.y * 3 - positions[i3 + 1];
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 5) {
        const force = ((5 - distance) / 5) * 0.02;
        positions[i3] += dx * force;
        positions[i3 + 1] += dy * force;
      }
    }

    // Rotación muy lenta
    return {
      rotationY: Math.sin(elapsedTime * 0.05) * 0.1,
      rotationX: Math.cos(elapsedTime * 0.07) * 0.05
    };
  },

  plasmaShader: `
    uniform float time;
    uniform vec3 color1;
    uniform vec3 color2;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv * 2.0 - 1.0;

      // Grid pattern con energía fluyendo
      float gridX = sin(uv.x * 8.0 + time * 0.5) * 0.5;
      float gridY = sin(uv.y * 8.0 + time * 0.5) * 0.5;
      float grid = (gridX + gridY) * 0.5;

      // Pulsos de energía
      float dist = length(uv);
      float pulse1 = sin(dist * 6.0 - time * 1.2);
      float pulse2 = sin(dist * 4.0 - time * 0.8 + 1.5);

      float plasma = (grid * 0.4 + pulse1 * 0.3 + pulse2 * 0.3);
      plasma = smoothstep(-0.2, 0.2, plasma);

      vec3 color = mix(color1, color2, plasma);

      gl_FragColor = vec4(color, 0.3);
    }
  `
};

/**
 * Array of all available effects
 * Add new effects here to make them selectable
 */
export const availableEffects = [
  hyperspaceEffect,
  waveEffect,
  energyGridEffect,
];

/**
 * Get effect by index
 */
export const getEffect = (index) => {
  return availableEffects[index % availableEffects.length];
};

/**
 * Get total number of effects
 */
export const getEffectCount = () => availableEffects.length;
