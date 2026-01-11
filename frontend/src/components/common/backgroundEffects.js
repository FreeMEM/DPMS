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

  particleCount: (variant) => variant === "admin" ? 350 : 250,

  // Line connection settings
  maxConnections: (variant) => variant === "admin" ? 60 : 40,
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

  particleCount: (variant) => variant === "admin" ? 500 : 350,

  // Line connection settings - más brillantes y abundantes
  maxConnections: (variant) => variant === "admin" ? 150 : 100,
  lineOpacity: 0.8,  // Aumentado para ver mejor la energía
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

  particleCount: (variant) => variant === "admin" ? 300 : 200,

  // Line connection settings - energía visible fluyendo
  maxConnections: (variant) => variant === "admin" ? 180 : 120,
  lineOpacity: 0.6,  // Muy brillante para ver la energía
  maxConnectionDistance: 3.0,  // Distancia corta para conexiones solo entre partículas cercanas
  animateLines: true,  // ¡CON animación de energía!
  randomConnections: true,  // Conexiones aleatorias dispersas
  connectionProbability: 0.35,  // 35% de las partículas conectadas
  maxConnectionsPerParticle: 4,  // Máximo 4 conexiones por partícula

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
    uniform float pulsePositions[20]; // maxPulses * 2
    uniform float pulseTimes[10]; // maxPulses
    uniform int maxPulses;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv * 2.0 - 1.0;

      // Grid pattern con energía fluyendo (más sutil ahora)
      float gridX = sin(uv.x * 8.0 + time * 0.5) * 0.5;
      float gridY = sin(uv.y * 8.0 + time * 0.5) * 0.5;
      float grid = (gridX + gridY) * 0.5;

      // Pulsos desde partículas que perdieron conexión (muy sutiles)
      float particlePulses = 0.0;
      for (int i = 0; i < 10; i++) {
        if (i >= maxPulses) break;

        float pulseAge = time - pulseTimes[i];

        // Pulsos más largos y sutiles (primeros 5 segundos)
        if (pulseAge > 0.0 && pulseAge < 5.0) {
          vec2 pulsePos = vec2(pulsePositions[i * 2], pulsePositions[i * 2 + 1]);
          float distToPulse = length(uv - pulsePos);

          // Radio del pulso crece más lentamente
          float pulseRadius = pulseAge * 0.4;

          // Intensidad disminuye muy suavemente
          float intensity = exp(-pulseAge * 0.8); // Decae más lentamente

          // Onda más difusa y ancha
          float wave = smoothstep(pulseRadius + 0.6, pulseRadius, distToPulse) *
                       smoothstep(pulseRadius - 0.2, pulseRadius, distToPulse);

          particlePulses += wave * intensity * 0.3; // Mucho más sutil (30% de intensidad)
        }
      }

      // Pulsos de energía base (mucho más sutiles)
      float dist = length(uv);
      float pulse1 = sin(dist * 6.0 - time * 1.2) * 0.15;
      float pulse2 = sin(dist * 4.0 - time * 0.8 + 1.5) * 0.15;

      // Combinar todos los elementos con mucho menos peso en los pulsos
      float plasma = (grid * 0.4 + pulse1 * 0.15 + pulse2 * 0.15 + particlePulses * 0.3);
      plasma = smoothstep(-0.4, 0.4, plasma);

      vec3 color = mix(color1, color2, plasma);

      gl_FragColor = vec4(color, 0.3);
    }
  `
};

/**
 * TRON GRID EFFECT
 * Grid in perspective with light cycles traveling on it
 */
export const tronGridEffect = {
  name: 'tron-grid',

  particleCount: (variant) => variant === "admin" ? 25 : 15, // Solo light cycles

  // Usar líneas para las estelas (trails) de las motos
  maxConnections: (variant) => (variant === "admin" ? 25 : 15) * 20, // 20 segmentos de trail por moto
  lineOpacity: 0.8,
  maxConnectionDistance: 100, // Distancia muy grande para no limitar los trails
  animateLines: true, // Con animación de energía fluyendo
  useLightTrails: true, // Flag especial para el modo de estelas
  use3DGrid: true, // Flag para indicar que necesita grid 3D real

  initializeParticles: (particlesCount, variant, particleColors) => {
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    const sizes = new Float32Array(particlesCount);
    const particleData = [];

    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;

      // Todas son light cycles que viajan sobre el grid
      const lane = Math.floor(Math.random() * 10) - 5; // Carriles del grid
      positions[i3] = lane * 2.5; // Posición X en carril
      positions[i3 + 1] = 0.1; // Ligeramente sobre el grid
      positions[i3 + 2] = Math.random() * -50 - 5; // Posición Z aleatoria

      // Color TRON brillante
      const colorChoice = Math.random();
      let particleColor;
      if (variant === "admin") {
        // Admin: cyan/magenta brillante
        if (colorChoice < 0.5) {
          colors[i3] = 0.3; colors[i3 + 1] = 0.9; colors[i3 + 2] = 1.0; // Cyan
          particleColor = { r: 0.3, g: 0.9, b: 1.0 };
        } else {
          colors[i3] = 1.0; colors[i3 + 1] = 0.3; colors[i3 + 2] = 1.0; // Magenta
          particleColor = { r: 1.0, g: 0.3, b: 1.0 };
        }
      } else {
        // User: cyan/naranja brillante
        if (colorChoice < 0.5) {
          colors[i3] = 0.2; colors[i3 + 1] = 0.95; colors[i3 + 2] = 1.0; // Cyan brillante
          particleColor = { r: 0.2, g: 0.95, b: 1.0 };
        } else {
          colors[i3] = 1.0; colors[i3 + 1] = 0.65; colors[i3 + 2] = 0.0; // Naranja TRON
          particleColor = { r: 1.0, g: 0.65, b: 0.0 };
        }
      }

      sizes[i] = 8; // Un poco más grandes

      particleData.push({
        speed: Math.random() * 0.4 + 0.3, // Velocidad variable
        lane: lane, // Carril en el que circula
        changeTimer: Math.random() * 10 + 5, // Tiempo hasta cambiar de carril
        trail: [], // Array para guardar las posiciones anteriores (estela)
        color: particleColor, // Color de la estela
      });
    }

    return { positions, colors, sizes, particleData };
  },

  animateParticles: (particlesCount, positions, particleData, mouseRef, elapsedTime) => {
    const trails = []; // Array para devolver las estelas

    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;
      const data = particleData[i];

      // Guardar posición actual antes de mover
      const currentPos = {
        x: positions[i3],
        y: positions[i3 + 1],
        z: positions[i3 + 2]
      };

      // Light cycle: avanza hacia la cámara
      positions[i3 + 2] += data.speed;

      // Reset cuando pasa la cámara
      if (positions[i3 + 2] > 10) {
        positions[i3 + 2] = -60;
        // Limpiar trail al reiniciar
        data.trail = [];
        // Ocasionalmente cambia de carril al reiniciar
        if (Math.random() > 0.5) {
          data.lane = Math.floor(Math.random() * 10) - 5;
        }
      } else {
        // Añadir posición actual al trail
        data.trail.push(currentPos);
        // Limitar longitud del trail (20 posiciones = estela visible)
        if (data.trail.length > 20) {
          data.trail.shift(); // Quitar la posición más antigua
        }
      }

      // Suave transición entre carriles
      const targetX = data.lane * 2.5;
      positions[i3] += (targetX - positions[i3]) * 0.02;

      // Cambio de carril ocasional
      if (elapsedTime > data.changeTimer && Math.random() > 0.95) {
        const newLane = data.lane + (Math.random() > 0.5 ? 1 : -1);
        if (newLane >= -5 && newLane <= 5) {
          data.lane = newLane;
        }
        data.changeTimer = elapsedTime + Math.random() * 10 + 5;
      }

      positions[i3 + 1] = 0.1; // Siempre a nivel del grid

      // Guardar el trail de esta partícula para dibujarlo
      trails.push({
        trail: data.trail,
        color: data.color
      });
    }

    // Sin rotación para mantener vista frontal del grid
    return {
      rotationY: 0,
      rotationX: -0.15, // Ligeramente inclinado para perspectiva
      trails: trails // Devolver los trails para que ThreeBackground los dibuje
    };
  },

  plasmaShader: `
    uniform float time;
    uniform vec3 color1;
    uniform vec3 color2;
    varying vec2 vUv;

    // Bitmap font 5x5 para letras (simplificado pero legible)
    float getChar(int ch, vec2 p) {
      int x = int(p.x);
      int y = 4 - int(p.y); // Invertir Y para que las letras no salgan al revés

      // Cada letra es una matriz 5x5 codificada como bits
      // Letras A-Z: 65-90
      // Números 0-9: 48-57
      // Especiales: 32(espacio), 33(!), 36($), 40((), 41()), 45(-), 47(/), 58(:), 59(;), 61(=), 63(?), 92(\), 161(¿), 164(€), 209(Ñ)

      if (ch == 65) { // A
        if (y==0 && x>=1 && x<=3) return 1.0;
        if ((y==1||y==2||y==3||y==4) && (x==0||x==4)) return 1.0;
        if (y==2 && x>=1 && x<=3) return 1.0;
      }
      else if (ch == 66) { // B
        if ((y==0||y==2||y==4) && x>=0 && x<=3) return 1.0;
        if ((y==1||y==3) && (x==0||x==4)) return 1.0;
      }
      else if (ch == 67) { // C
        if (y==0 && x>=1 && x<=3) return 1.0;
        if (y==4 && x>=1 && x<=3) return 1.0;
        if ((y==1||y==2||y==3) && x==0) return 1.0;
      }
      else if (ch == 68) { // D
        if ((y==0||y==4) && x>=0 && x<=3) return 1.0;
        if ((y==1||y==2||y==3) && (x==0||x==4)) return 1.0;
      }
      else if (ch == 69) { // E
        if ((y==0||y==2||y==4) && x>=0 && x<=4) return 1.0;
        if ((y==1||y==3) && x==0) return 1.0;
      }
      else if (ch == 70) { // F
        if ((y==0||y==2) && x>=0 && x<=4) return 1.0;
        if ((y==1||y==3||y==4) && x==0) return 1.0;
      }
      else if (ch == 71) { // G
        if (y==0 && x>=1 && x<=3) return 1.0;
        if (y==4 && x>=1 && x<=3) return 1.0;
        if ((y==1||y==2||y==3) && x==0) return 1.0;
        if ((y==2||y==3||y==4) && x==4) return 1.0;
      }
      else if (ch == 72) { // H
        if ((y==0||y==1||y==2||y==3||y==4) && (x==0||x==4)) return 1.0;
        if (y==2 && x>=1 && x<=3) return 1.0;
      }
      else if (ch == 73) { // I
        if ((y==0||y==4) && x>=0 && x<=4) return 1.0;
        if ((y==1||y==2||y==3) && x==2) return 1.0;
      }
      else if (ch == 74) { // J
        if (y==0 && x>=0 && x<=4) return 1.0;
        if ((y==1||y==2||y==3) && x==2) return 1.0;
        if (y==4 && x>=0 && x<=2) return 1.0;
      }
      else if (ch == 77) { // M
        if ((y==0||y==1||y==2||y==3||y==4) && (x==0||x==4)) return 1.0;
        if (y==1 && (x==1||x==3)) return 1.0;
      }
      else if (ch == 78) { // N
        if ((y==0||y==1||y==2||y==3||y==4) && (x==0||x==4)) return 1.0;
        if (y==1 && x==1) return 1.0;
        if (y==2 && x==2) return 1.0;
        if (y==3 && x==3) return 1.0;
      }
      else if (ch == 79) { // O
        if ((y==0||y==4) && x>=1 && x<=3) return 1.0;
        if ((y==1||y==2||y==3) && (x==0||x==4)) return 1.0;
      }
      else if (ch == 82) { // R
        if ((y==0||y==2) && x>=0 && x<=3) return 1.0;
        if ((y==1||y==3||y==4) && x==0) return 1.0;
        if (y==1 && x==4) return 1.0;
        if (y==3 && x==3) return 1.0;
        if (y==4 && x==4) return 1.0;
      }
      else if (ch == 83) { // S
        if ((y==0||y==2||y==4) && x>=1 && x<=3) return 1.0;
        if (y==1 && x==0) return 1.0;
        if (y==3 && x==4) return 1.0;
      }
      else if (ch == 84) { // T
        if (y==0 && x>=0 && x<=4) return 1.0;
        if ((y==1||y==2||y==3||y==4) && x==2) return 1.0;
      }
      else if (ch == 85) { // U
        if ((y==0||y==1||y==2||y==3) && (x==0||x==4)) return 1.0;
        if (y==4 && x>=1 && x<=3) return 1.0;
      }
      else if (ch == 86) { // V
        if ((y==0||y==1) && (x==0||x==4)) return 1.0;
        if (y==2 && (x==1||x==3)) return 1.0;
        if (y==3 && x==2) return 1.0;
        if (y==4 && x==2) return 1.0;
      }
      else if (ch == 87) { // W
        if ((y==0||y==1||y==2||y==3||y==4) && (x==0||x==4)) return 1.0;
        if (y==3 && (x==1||x==3)) return 1.0;
        if (y==4 && x==2) return 1.0;
      }
      else if (ch == 88) { // X
        if ((y==0||y==4) && (x==0||x==4)) return 1.0;
        if (y==1 && (x==1||x==3)) return 1.0;
        if (y==2 && x==2) return 1.0;
        if (y==3 && (x==1||x==3)) return 1.0;
      }
      else if (ch == 89) { // Y
        if ((y==0||y==1) && (x==0||x==4)) return 1.0;
        if ((y==2||y==3||y==4) && x==2) return 1.0;
      }
      else if (ch == 90) { // Z
        if ((y==0||y==4) && x>=0 && x<=4) return 1.0;
        if (y==1 && x==3) return 1.0;
        if (y==2 && x==2) return 1.0;
        if (y==3 && x==1) return 1.0;
      }
      else if (ch == 75) { // K
        if ((y==0||y==1||y==2||y==3||y==4) && x==0) return 1.0;
        if (y==0 && x==4) return 1.0;
        if (y==1 && x==3) return 1.0;
        if (y==2 && x==2) return 1.0;
        if (y==3 && x==3) return 1.0;
        if (y==4 && x==4) return 1.0;
      }
      else if (ch == 76) { // L
        if ((y==0||y==1||y==2||y==3||y==4) && x==0) return 1.0;
        if (y==4 && x>=1 && x<=4) return 1.0;
      }
      else if (ch == 80) { // P
        if ((y==0||y==2) && x>=0 && x<=3) return 1.0;
        if ((y==1||y==3||y==4) && x==0) return 1.0;
        if (y==1 && x==4) return 1.0;
      }
      else if (ch == 81) { // Q
        if ((y==0||y==4) && x>=1 && x<=3) return 1.0;
        if ((y==1||y==2) && (x==0||x==4)) return 1.0;
        if (y==3 && (x==0||x==3)) return 1.0;
        if (y==4 && x==4) return 1.0;
      }
      else if (ch == 209) { // Ñ (UTF-8: Ñ en código ASCII extendido)
        if ((y==0||y==1||y==2||y==3||y==4) && (x==0||x==4)) return 1.0;
        if (y==1 && x==1) return 1.0;
        if (y==2 && x==2) return 1.0;
        if (y==3 && x==3) return 1.0;
      }
      // Números 0-9
      else if (ch == 48) { // 0
        if ((y==0||y==4) && x>=1 && x<=3) return 1.0;
        if ((y==1||y==2||y==3) && (x==0||x==4)) return 1.0;
      }
      else if (ch == 49) { // 1
        if ((y==0||y==1||y==2||y==3||y==4) && x==2) return 1.0;
        if (y==0 && x==1) return 1.0;
        if (y==4 && x>=1 && x<=3) return 1.0;
      }
      else if (ch == 50) { // 2
        if ((y==0||y==2||y==4) && x>=0 && x<=4) return 1.0;
        if (y==1 && x==4) return 1.0;
        if (y==3 && x==0) return 1.0;
      }
      else if (ch == 51) { // 3
        if ((y==0||y==2||y==4) && x>=0 && x<=4) return 1.0;
        if ((y==1||y==3) && x==4) return 1.0;
      }
      else if (ch == 52) { // 4
        if ((y==0||y==1||y==2) && x==0) return 1.0;
        if (y==2 && x>=1 && x<=4) return 1.0;
        if ((y==3||y==4) && x==3) return 1.0;
      }
      else if (ch == 53) { // 5
        if ((y==0||y==2||y==4) && x>=0 && x<=4) return 1.0;
        if (y==1 && x==0) return 1.0;
        if (y==3 && x==4) return 1.0;
      }
      else if (ch == 54) { // 6
        if ((y==0||y==2||y==4) && x>=1 && x<=3) return 1.0;
        if ((y==1||y==2||y==3) && x==0) return 1.0;
        if (y==3 && x==4) return 1.0;
      }
      else if (ch == 55) { // 7
        if (y==0 && x>=0 && x<=4) return 1.0;
        if (y==1 && x==4) return 1.0;
        if (y==2 && x==3) return 1.0;
        if ((y==3||y==4) && x==2) return 1.0;
      }
      else if (ch == 56) { // 8
        if ((y==0||y==2||y==4) && x>=1 && x<=3) return 1.0;
        if ((y==1||y==3) && (x==0||x==4)) return 1.0;
      }
      else if (ch == 57) { // 9
        if ((y==0||y==2) && x>=1 && x<=3) return 1.0;
        if (y==1 && (x==0||x==4)) return 1.0;
        if ((y==3||y==4) && x==4) return 1.0;
        if (y==4 && x>=1 && x<=3) return 1.0;
      }
      // Caracteres especiales
      else if (ch == 33) { // !
        if ((y==0||y==1||y==2) && x==2) return 1.0;
        if (y==4 && x==2) return 1.0;
      }
      else if (ch == 161) { // ¿
        if ((y==2||y==3||y==4) && x==2) return 1.0;
        if (y==0 && x==2) return 1.0;
      }
      else if (ch == 63) { // ?
        if ((y==0||y==1) && x>=1 && x<=3) return 1.0;
        if (y==1 && x==4) return 1.0;
        if (y==2 && x==3) return 1.0;
        if (y==4 && x==2) return 1.0;
      }
      else if (ch == 45) { // -
        if (y==2 && x>=1 && x<=3) return 1.0;
      }
      else if (ch == 58) { // :
        if (y==1 && x==2) return 1.0;
        if (y==3 && x==2) return 1.0;
      }
      else if (ch == 59) { // ;
        if (y==1 && x==2) return 1.0;
        if (y==3 && x==2) return 1.0;
        if (y==4 && x==1) return 1.0;
      }
      else if (ch == 40) { // (
        if ((y==0||y==4) && x==2) return 1.0;
        if ((y==1||y==2||y==3) && x==1) return 1.0;
      }
      else if (ch == 41) { // )
        if ((y==0||y==4) && x==1) return 1.0;
        if ((y==1||y==2||y==3) && x==2) return 1.0;
      }
      else if (ch == 61) { // =
        if ((y==2||y==3) && x>=1 && x<=3) return 1.0;
      }
      else if (ch == 47) { // /
        if (y==0 && x==4) return 1.0;
        if (y==1 && x==3) return 1.0;
        if (y==2 && x==2) return 1.0;
        if (y==3 && x==1) return 1.0;
        if (y==4 && x==0) return 1.0;
      }
      else if (ch == 92) { // backslash
        if (y==0 && x==0) return 1.0;
        if (y==1 && x==1) return 1.0;
        if (y==2 && x==2) return 1.0;
        if (y==3 && x==3) return 1.0;
        if (y==4 && x==4) return 1.0;
      }
      else if (ch == 36) { // $
        if ((y==0||y==2||y==4) && x>=1 && x<=3) return 1.0;
        if (y==1 && x==0) return 1.0;
        if (y==3 && x==4) return 1.0;
        if (x==2) return 1.0; // línea vertical
      }
      else if (ch == 164) { // € (aproximación)
        if ((y==0||y==2||y==4) && x>=1 && x<=4) return 1.0;
        if ((y==1||y==3) && x==0) return 1.0;
      }

      return 0.0;
    }

    void main() {
      vec2 uv = vUv * 2.0 - 1.0;

      // Grid TRON alineado con el plano de las partículas
      // Las partículas viajan en carriles horizontales (X) y avanzan en profundidad (Z)
      // El grid debe estar en el mismo plano XZ, visto desde arriba con ligera inclinación

      // Grid plano sin distorsión de perspectiva artificial
      vec2 gridUV = uv * 8.0;

      // Líneas verticales (carriles donde viajan las motos) - fijas en X
      float gridX = abs(fract(gridUV.x) - 0.5);
      // Líneas horizontales (profundidad) - se mueven hacia adelante con el tiempo
      float gridY = abs(fract(gridUV.y - time * 0.3) - 0.5);

      float grid = 1.0 - min(gridX, gridY) * 30.0;
      grid = smoothstep(0.0, 0.3, grid);

      // Pulsos de energía que viajan por el grid en profundidad
      float pulse = sin(gridUV.y * 2.0 - time * 2.0) * 0.5 + 0.5;
      float energyPulse = pulse * 0.3;

      // Fade vertical para dar sensación de profundidad
      float depthFade = smoothstep(-1.0, 0.5, uv.y);

      // Texto scrolling: "GREETINGS TO JUANDA HECTOR JAIME VICENTE FRAN"
      // Codificado como array de ASCII
      int text[47];
      text[0]=71; text[1]=82; text[2]=69; text[3]=69; text[4]=84; text[5]=73; text[6]=78; text[7]=71; text[8]=83; text[9]=32; // GREETINGS
      text[10]=84; text[11]=79; text[12]=32; // TO
      text[13]=74; text[14]=85; text[15]=65; text[16]=78; text[17]=68; text[18]=65; text[19]=32; // JUANDA
      text[20]=72; text[21]=69; text[22]=67; text[23]=84; text[24]=79; text[25]=82; text[26]=32; // HECTOR
      text[27]=74; text[28]=65; text[29]=73; text[30]=77; text[31]=69; text[32]=32; // JAIME
      text[33]=86; text[34]=73; text[35]=67; text[36]=69; text[37]=78; text[38]=84; text[39]=69; text[40]=32; // VICENTE
      text[41]=70; text[42]=82; text[43]=65; text[44]=78; // FRAN
      text[45]=32; text[46]=32; // Espacios finales

      float scrollSpeed = 0.3; // Velocidad de scroll (más rápido)
      float charWidth = 0.15;  // Ancho de cada carácter
      float charHeight = 0.2;  // Alto de cada carácter
      float charSpacing = 0.02; // Espacio entre letras

      // Calcular el ancho total del texto
      float totalTextWidth = float(47) * (charWidth + charSpacing);

      // El texto debe empezar desde el borde derecho (fuera de pantalla)
      // y moverse hacia la izquierda hasta salir por el borde izquierdo
      // uv.x va de -1 (izquierda) a +1 (derecha) en coordenadas normalizadas
      // Necesitamos que el texto empiece en +1 y termine en -1 - totalTextWidth
      float scrollRange = 2.0 + totalTextWidth; // Ancho total de pantalla + ancho del texto
      float scrollProgress = mod(time * scrollSpeed, scrollRange);
      float scrollX = 1.0 - scrollProgress; // Empieza en +1 (derecha) y va hacia la izquierda

      vec2 textPos = vec2(uv.x - scrollX, uv.y + 0.7); // Parte superior

      float textBrightness = 0.0;

      // Dibujar cada carácter
      for (int i = 0; i < 47; i++) {
        float charX = float(i) * (charWidth + charSpacing);
        vec2 charPos = textPos - vec2(charX, 0.0);

        // Mostrar el carácter si está visible en pantalla
        if (charPos.x > -charWidth && charPos.x < charWidth &&
            charPos.y > -charHeight && charPos.y < charHeight) {

          vec2 pixelPos = (charPos + vec2(charWidth * 0.5, charHeight * 0.5)) / vec2(charWidth, charHeight);
          vec2 p = floor(pixelPos * 5.0);

          if (text[i] != 32) { // No es espacio
            float charPixel = getChar(text[i], p);

            // Suavizar los bordes para mejor legibilidad
            vec2 pixelFrac = fract(pixelPos * 5.0);
            float smoothFactor = smoothstep(0.1, 0.3, pixelFrac.x) * smoothstep(0.9, 0.7, pixelFrac.x) *
                                 smoothstep(0.1, 0.3, pixelFrac.y) * smoothstep(0.9, 0.7, pixelFrac.y);

            textBrightness = max(textBrightness, charPixel * smoothFactor);
          }
        }
      }

      // Color del texto: naranja brillante tipo TRON con glow
      vec3 textColor = vec3(1.0, 0.7, 0.0) * textBrightness * 2.5;

      // Añadir glow alrededor del texto
      float glowRadius = 0.02;
      float glow = 0.0;
      for (int i = 0; i < 47; i++) {
        float charX = float(i) * (charWidth + charSpacing);
        vec2 charPos = textPos - vec2(charX, 0.0);
        float dist = length(charPos) / charWidth;
        if (dist < 1.5) {
          glow += (1.0 - dist / 1.5) * 0.1;
        }
      }
      textColor += vec3(1.0, 0.5, 0.0) * glow;

      // Color de fondo muy oscuro (casi invisible porque tenemos grid 3D)
      vec3 backgroundColor = vec3(0.0, 0.1, 0.15) * 0.1;

      // El texto scrolling sigue visible
      vec3 finalColor = backgroundColor + textColor;

      // Alpha muy bajo para el fondo, solo el texto debe ser visible
      float alpha = textBrightness * 0.8;

      gl_FragColor = vec4(finalColor, alpha);
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
  tronGridEffect,
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
