/**
 * Three.js Background Effects for DPMS Landing Page
 * Vanilla JavaScript port of the React ThreeBackground component
 */

// Effects configuration (without Energy Grid)
const effects = {
  hyperspace: {
    name: 'Hyperspace',
    particleCount: 250,
    maxConnections: 40,
    lineOpacity: 0.15,
    maxConnectionDistance: 2.5,
    animateLines: false,

    initializeParticles: function(particlesCount, particleColors) {
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

    animateParticles: function(particlesCount, positions, particleData, mouse, elapsedTime) {
      for (let i = 0; i < particlesCount; i++) {
        const data = particleData[i];
        const i3 = i * 3;

        positions[i3 + 2] += data.speed;

        if (positions[i3 + 2] > 5) {
          positions[i3 + 2] = Math.random() * -50 - 10;
          data.angle = Math.random() * Math.PI * 2;
          data.radius = Math.random() * 8 + 2;
        }

        const targetAngle = Math.atan2(mouse.y * 5, mouse.x * 5);
        let angleDiff = targetAngle - data.angle;

        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        data.angle += angleDiff * 0.005;

        positions[i3] = Math.cos(data.angle) * data.radius;
        positions[i3 + 1] = Math.sin(data.angle) * data.radius;
      }

      return null;
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
  },

  wave: {
    name: 'Wave',
    particleCount: 350,
    maxConnections: 100,
    lineOpacity: 0.8,
    maxConnectionDistance: 3.5,
    animateLines: true,

    initializeParticles: function(particlesCount, particleColors) {
      const positions = new Float32Array(particlesCount * 3);
      const colors = new Float32Array(particlesCount * 3);
      const sizes = new Float32Array(particlesCount);

      for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;

        positions[i3] = (Math.random() - 0.5) * 10;
        positions[i3 + 1] = (Math.random() - 0.5) * 10;
        positions[i3 + 2] = (Math.random() - 0.5) * 10;

        const colorValue = Math.random();
        if (colorValue < 0.33) {
          colors[i3] = 0.2; colors[i3 + 1] = 0.8; colors[i3 + 2] = 0.8;
        } else if (colorValue < 0.66) {
          colors[i3] = 0.2; colors[i3 + 1] = 0.9; colors[i3 + 2] = 0.4;
        } else {
          colors[i3] = 0.9; colors[i3 + 1] = 0.9; colors[i3 + 2] = 0.2;
        }

        sizes[i] = Math.random() * 3;
      }

      return { positions, colors, sizes, particleData: null };
    },

    animateParticles: function(particlesCount, positions, originalPositions, mouse, elapsedTime) {
      for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;

        const originalX = originalPositions[i3];
        const originalY = originalPositions[i3 + 1];
        const originalZ = originalPositions[i3 + 2];

        const waveX = Math.sin(elapsedTime * 0.3 + originalY * 0.5) * 0.3;
        const waveY = Math.cos(elapsedTime * 0.2 + originalX * 0.5) * 0.3;
        const waveZ = Math.sin(elapsedTime * 0.25 + originalX * 0.3 + originalY * 0.3) * 0.2;

        positions[i3] = originalX + waveX;
        positions[i3 + 1] = originalY + waveY;
        positions[i3 + 2] = originalZ + waveZ;

        const dx = mouse.x * 5 - positions[i3];
        const dy = mouse.y * 5 - positions[i3 + 1];
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 3) {
          const force = ((3 - distance) / 3) * 0.5;
          positions[i3] -= dx * force;
          positions[i3 + 1] -= dy * force;
        }
      }

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
  },

  tronGrid: {
    name: 'Tron-grid',
    particleCount: 15,
    maxConnections: 300,
    lineOpacity: 0.8,
    maxConnectionDistance: 100,
    animateLines: true,
    useLightTrails: true,
    use3DGrid: true,

    initializeParticles: function(particlesCount, particleColors) {
      const positions = new Float32Array(particlesCount * 3);
      const colors = new Float32Array(particlesCount * 3);
      const sizes = new Float32Array(particlesCount);
      const particleData = [];

      for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        const lane = Math.floor(Math.random() * 10) - 5;
        positions[i3] = lane * 2.5;
        positions[i3 + 1] = 0.1;
        positions[i3 + 2] = Math.random() * -50 - 5;

        const colorChoice = Math.random();
        let particleColor;
        if (colorChoice < 0.5) {
          colors[i3] = 0.2; colors[i3 + 1] = 0.95; colors[i3 + 2] = 1.0;
          particleColor = { r: 0.2, g: 0.95, b: 1.0 };
        } else {
          colors[i3] = 1.0; colors[i3 + 1] = 0.65; colors[i3 + 2] = 0.0;
          particleColor = { r: 1.0, g: 0.65, b: 0.0 };
        }

        sizes[i] = 8;

        particleData.push({
          speed: Math.random() * 0.4 + 0.3,
          lane: lane,
          changeTimer: Math.random() * 10 + 5,
          trail: [],
          color: particleColor,
        });
      }

      return { positions, colors, sizes, particleData };
    },

    animateParticles: function(particlesCount, positions, particleData, mouse, elapsedTime) {
      const trails = [];

      for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        const data = particleData[i];

        const currentPos = {
          x: positions[i3],
          y: positions[i3 + 1],
          z: positions[i3 + 2]
        };

        positions[i3 + 2] += data.speed;

        if (positions[i3 + 2] > 10) {
          positions[i3 + 2] = -60;
          data.trail = [];
          if (Math.random() > 0.5) {
            data.lane = Math.floor(Math.random() * 10) - 5;
          }
        } else {
          data.trail.push(currentPos);
          if (data.trail.length > 20) {
            data.trail.shift();
          }
        }

        const targetX = data.lane * 2.5;
        positions[i3] += (targetX - positions[i3]) * 0.02;

        if (elapsedTime > data.changeTimer && Math.random() > 0.95) {
          const newLane = data.lane + (Math.random() > 0.5 ? 1 : -1);
          if (newLane >= -5 && newLane <= 5) {
            data.lane = newLane;
          }
          data.changeTimer = elapsedTime + Math.random() * 10 + 5;
        }

        positions[i3 + 1] = 0.1;

        trails.push({
          trail: data.trail,
          color: data.color
        });
      }

      return {
        rotationY: 0,
        rotationX: -0.15,
        trails: trails
      };
    },

    plasmaShader: `
      uniform float time;
      uniform vec3 color1;
      uniform vec3 color2;
      varying vec2 vUv;

      void main() {
        vec2 uv = vUv * 2.0 - 1.0;

        vec2 gridUV = uv * 8.0;
        float gridX = abs(fract(gridUV.x) - 0.5);
        float gridY = abs(fract(gridUV.y - time * 0.3) - 0.5);

        float grid = 1.0 - min(gridX, gridY) * 30.0;
        grid = smoothstep(0.0, 0.3, grid);

        float pulse = sin(gridUV.y * 2.0 - time * 2.0) * 0.5 + 0.5;
        float energyPulse = pulse * 0.3;

        float depthFade = smoothstep(-1.0, 0.5, uv.y);

        vec3 finalColor = vec3(0.0, 0.1, 0.15) * 0.1;

        gl_FragColor = vec4(finalColor, 0.2);
      }
    `
  }
};

// Main ThreeBackground class
class ThreeBackground {
  constructor(container) {
    this.container = container;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.particles = null;
    this.lines = null;
    this.plasma = null;
    this.grid3D = null;
    this.clock = null;
    this.animationFrameId = null;
    this.isVisible = true;
    this.isFading = false;
    this.isTabVisible = true;
    this.lastFrameTime = 0;
    this.targetFPS = 30; // Limitar a 30 FPS para menor consumo
    this.frameInterval = 1000 / this.targetFPS;

    this.mouse = { x: 0, y: 0 };
    this.targetMouse = { x: 0, y: 0 };

    // Only 3 effects now (removed energyGrid)
    this.effectNames = ['hyperspace', 'wave', 'tronGrid'];
    this.currentEffectIndex = 0;
    this.autoRotate = true;
    this.autoRotateInterval = null;

    this.particleData = null;
    this.originalPositions = null;
    this.particlesCount = 0;

    // Load saved preferences
    this.loadPreferences();

    // Bind methods
    this.animate = this.animate.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
  }

  loadPreferences() {
    const savedEffect = localStorage.getItem('selectedEffect');
    const savedEnabled = localStorage.getItem('backgroundEnabled');

    if (savedEnabled !== null) {
      this.isVisible = JSON.parse(savedEnabled);
    }

    if (savedEffect && savedEffect !== 'auto') {
      const idx = parseInt(savedEffect, 10);
      // Make sure the index is valid for our reduced effect list
      this.currentEffectIndex = idx < this.effectNames.length ? idx : 0;
      this.autoRotate = false;
    }
  }

  init() {
    if (!window.THREE) {
      console.error('Three.js not loaded');
      return;
    }

    const THREE = window.THREE;
    const currentEffect = effects[this.effectNames[this.currentEffectIndex]];

    // Scene setup
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    if (currentEffect.use3DGrid) {
      this.camera.position.set(0, 8, 12);
      this.camera.lookAt(0, 0, -20);
    } else {
      this.camera.position.z = 5;
    }

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.container.appendChild(this.renderer.domElement);

    // Particle colors
    const particleColors = [
      { r: 0.2, g: 0.8, b: 0.8 },
      { r: 0.2, g: 0.9, b: 0.4 },
      { r: 0.9, g: 0.9, b: 0.2 }
    ];

    // Initialize particles
    this.particlesCount = currentEffect.particleCount;
    const initData = currentEffect.initializeParticles(this.particlesCount, particleColors);

    this.particleData = initData.particleData;
    this.originalPositions = new Float32Array(initData.positions);

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(initData.positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(initData.colors, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(initData.sizes, 1));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    this.particles = new THREE.Points(particlesGeometry, particlesMaterial);
    this.scene.add(this.particles);

    // Create lines
    const maxConnections = currentEffect.maxConnections;
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array(maxConnections * 2 * 3);
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

    let lineMaterial;
    if (currentEffect.animateLines) {
      lineMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color: { value: new THREE.Color(0x20c0a0) },
          opacity: { value: currentEffect.lineOpacity }
        },
        vertexShader: `
          varying vec3 vPosition;
          void main() {
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float time;
          uniform vec3 color;
          uniform float opacity;
          varying vec3 vPosition;

          void main() {
            float flow = fract(vPosition.x * 0.5 + vPosition.y * 0.5 + vPosition.z * 0.5 - time * 0.5);
            float pulse = sin(flow * 3.14159 * 4.0) * 0.5 + 0.5;
            float brightness = mix(0.6, 1.8, pulse);
            gl_FragColor = vec4(color * brightness, opacity * (0.7 + pulse * 0.3));
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
      });
    } else {
      lineMaterial = new THREE.LineBasicMaterial({
        color: 0x20c0a0,
        transparent: true,
        opacity: currentEffect.lineOpacity,
        blending: THREE.AdditiveBlending,
      });
    }

    this.lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    this.scene.add(this.lines);

    // Create 3D grid for TRON effect
    if (currentEffect.use3DGrid) {
      const gridHelper = new THREE.GridHelper(100, 40, 0x20c0a0, 0x105050);
      gridHelper.position.y = 0;
      gridHelper.position.z = -25;
      gridHelper.material.transparent = true;
      gridHelper.material.opacity = 0.4;
      gridHelper.material.blending = THREE.AdditiveBlending;
      this.scene.add(gridHelper);
      this.grid3D = gridHelper;
    }

    // Create plasma background
    const aspect = window.innerWidth / window.innerHeight;
    const plasmaGeometry = new THREE.PlaneGeometry(20 * aspect, 20);

    const plasmaMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color(0.0, 0.15, 0.25) },
        color2: { value: new THREE.Color(0.1, 0.35, 0.45) }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: currentEffect.plasmaShader,
      transparent: true,
      side: THREE.DoubleSide,
    });

    this.plasma = new THREE.Mesh(plasmaGeometry, plasmaMaterial);
    this.plasma.position.z = -8;
    this.scene.add(this.plasma);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    // Event listeners
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('touchmove', this.handleTouchMove, { passive: true });
    window.addEventListener('resize', this.handleResize);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    // Start animation
    this.clock = new THREE.Clock();
    this.lastFrameTime = performance.now();
    this.animate();

    // Auto rotate effects
    if (this.autoRotate) {
      this.startAutoRotate();
    }

    // Update visibility
    this.updateVisibility();
  }

  handleMouseMove(event) {
    this.targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  handleTouchMove(event) {
    if (event.touches.length > 0) {
      this.targetMouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
      this.targetMouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
    }
  }

  handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  handleVisibilityChange() {
    this.isTabVisible = !document.hidden;
    if (this.isTabVisible && this.isVisible && !this.animationFrameId) {
      // Reanudar animación cuando la pestaña vuelve a ser visible
      this.clock.start();
      this.animate();
    }
  }

  animate() {
    // Detener completamente si no es visible o la pestaña está oculta
    if (!this.isVisible || !this.isTabVisible) {
      this.animationFrameId = null;
      return;
    }

    // Limitar FPS para menor consumo de CPU
    const now = performance.now();
    const elapsed = now - this.lastFrameTime;

    if (elapsed < this.frameInterval) {
      this.animationFrameId = requestAnimationFrame(this.animate);
      return;
    }
    this.lastFrameTime = now - (elapsed % this.frameInterval);

    const currentEffect = effects[this.effectNames[this.currentEffectIndex]];
    const elapsedTime = this.clock.getElapsedTime();

    // Update plasma shader time
    if (this.plasma && this.plasma.material.uniforms) {
      this.plasma.material.uniforms.time.value = elapsedTime;
    }

    // Update line shader time
    if (currentEffect.animateLines && this.lines.material.uniforms) {
      this.lines.material.uniforms.time.value = elapsedTime;
    }

    // Smooth mouse movement
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;

    // Update particle positions
    const positions = this.particles.geometry.attributes.position.array;
    const rotation = currentEffect.animateParticles(
      this.particlesCount,
      positions,
      this.particleData || this.originalPositions,
      this.mouse,
      elapsedTime
    );

    // Apply rotation
    if (rotation) {
      const baseRotationY = rotation.rotationY || 0;
      const baseRotationX = rotation.rotationX || 0;
      const mouseRotationY = this.mouse.x * 0.3;
      let mouseRotationX = -this.mouse.y * 0.2;

      if (currentEffect.use3DGrid && mouseRotationX < -0.1) {
        mouseRotationX = Math.max(mouseRotationX, -0.1);
      }

      this.particles.rotation.y = baseRotationY + mouseRotationY;
      this.particles.rotation.x = baseRotationX + mouseRotationX;
      this.lines.rotation.y = baseRotationY + mouseRotationY;
      this.lines.rotation.x = baseRotationX + mouseRotationX;

      if (this.grid3D) {
        this.grid3D.rotation.y = baseRotationY + mouseRotationY;
        this.grid3D.rotation.x = baseRotationX + mouseRotationX;
      }
    }

    this.particles.geometry.attributes.position.needsUpdate = true;

    // Update line connections
    this.updateConnections(currentEffect, positions, rotation);

    this.renderer.render(this.scene, this.camera);
    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  updateConnections(currentEffect, positions, rotation) {
    const linePositions = this.lines.geometry.attributes.position.array;
    let connectionIndex = 0;
    const maxDistance = currentEffect.maxConnectionDistance;
    const maxConnections = currentEffect.maxConnections;

    if (currentEffect.useLightTrails && rotation && rotation.trails) {
      // Light trails for TRON effect
      for (let i = 0; i < rotation.trails.length && connectionIndex < maxConnections * 2; i++) {
        const trail = rotation.trails[i].trail;
        for (let j = 0; j < trail.length - 1 && connectionIndex < maxConnections * 2; j++) {
          const lineIndex = connectionIndex * 3;
          linePositions[lineIndex] = trail[j].x;
          linePositions[lineIndex + 1] = trail[j].y;
          linePositions[lineIndex + 2] = trail[j].z;
          linePositions[lineIndex + 3] = trail[j + 1].x;
          linePositions[lineIndex + 4] = trail[j + 1].y;
          linePositions[lineIndex + 5] = trail[j + 1].z;
          connectionIndex += 2;
        }
      }
    } else {
      // Normal particle connections
      for (let i = 0; i < this.particlesCount && connectionIndex < maxConnections * 2; i++) {
        const i3 = i * 3;
        const x1 = positions[i3];
        const y1 = positions[i3 + 1];
        const z1 = positions[i3 + 2];

        for (let j = i + 1; j < Math.min(i + 15, this.particlesCount) && connectionIndex < maxConnections * 2; j++) {
          const j3 = j * 3;
          const x2 = positions[j3];
          const y2 = positions[j3 + 1];
          const z2 = positions[j3 + 2];

          const dx = x2 - x1;
          const dy = y2 - y1;
          const dz = z2 - z1;
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (distance < maxDistance) {
            const lineIndex = connectionIndex * 3;
            linePositions[lineIndex] = x1;
            linePositions[lineIndex + 1] = y1;
            linePositions[lineIndex + 2] = z1;
            linePositions[lineIndex + 3] = x2;
            linePositions[lineIndex + 4] = y2;
            linePositions[lineIndex + 5] = z2;
            connectionIndex += 2;
          }
        }
      }
    }

    // Clear remaining positions
    for (let i = connectionIndex * 3; i < linePositions.length; i++) {
      linePositions[i] = 0;
    }

    this.lines.geometry.attributes.position.needsUpdate = true;
  }

  setEffect(index) {
    if (index === this.currentEffectIndex) return;

    this.isFading = true;
    this.container.style.opacity = '0';

    setTimeout(() => {
      this.destroy();
      this.currentEffectIndex = index % this.effectNames.length;
      this.init();

      setTimeout(() => {
        this.container.style.opacity = '1';
        this.isFading = false;
      }, 50);
    }, 1000);
  }

  nextEffect() {
    this.setEffect((this.currentEffectIndex + 1) % this.effectNames.length);
  }

  startAutoRotate() {
    if (this.autoRotateInterval) return;

    this.autoRotateInterval = setInterval(() => {
      this.nextEffect();
    }, 30000);
  }

  stopAutoRotate() {
    if (this.autoRotateInterval) {
      clearInterval(this.autoRotateInterval);
      this.autoRotateInterval = null;
    }
  }

  setAutoRotate(enabled) {
    this.autoRotate = enabled;
    if (enabled) {
      this.startAutoRotate();
    } else {
      this.stopAutoRotate();
    }
  }

  setVisibility(visible) {
    this.isVisible = visible;
    localStorage.setItem('backgroundEnabled', JSON.stringify(visible));
    this.updateVisibility();

    // Iniciar o detener animación según visibilidad
    if (visible && this.isTabVisible && !this.animationFrameId) {
      this.clock.start();
      this.animate();
    }
  }

  updateVisibility() {
    this.container.style.display = this.isVisible ? 'block' : 'none';
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.stopAutoRotate();

    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('touchmove', this.handleTouchMove);
    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);

    if (this.scene) {
      this.scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(m => m.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    }

    if (this.renderer) {
      if (this.container.contains(this.renderer.domElement)) {
        this.container.removeChild(this.renderer.domElement);
      }
      this.renderer.dispose();
      this.renderer.forceContextLoss();
    }

    this.scene = null;
    this.camera = null;
    this.particles = null;
    this.lines = null;
    this.plasma = null;
    this.grid3D = null;
  }
}

// Effect Selector Component - React-style horizontal bar
class EffectSelector {
  constructor(background) {
    this.background = background;
    this.element = null;
  }

  create() {
    // Get current state
    const backgroundEnabled = this.background.isVisible;
    const selectedEffect = this.background.autoRotate ? 'auto' : this.background.currentEffectIndex.toString();

    this.element = document.createElement('div');
    this.element.className = 'effect-selector-bar';
    this.element.innerHTML = `
      <div class="effect-selector-content">
        <span class="effect-label">Efectos</span>
        <label class="effect-switch">
          <input type="checkbox" ${backgroundEnabled ? 'checked' : ''}>
          <span class="effect-switch-slider"></span>
        </label>
        <select class="effect-dropdown" ${!backgroundEnabled ? 'disabled' : ''}>
          <option value="auto" ${selectedEffect === 'auto' ? 'selected' : ''}>Auto</option>
          <option value="0" ${selectedEffect === '0' ? 'selected' : ''}>Hyperspace</option>
          <option value="1" ${selectedEffect === '1' ? 'selected' : ''}>Wave</option>
          <option value="2" ${selectedEffect === '2' ? 'selected' : ''}>Tron-grid</option>
        </select>
      </div>
    `;

    document.body.appendChild(this.element);

    // Event listeners
    const checkbox = this.element.querySelector('input[type="checkbox"]');
    const dropdown = this.element.querySelector('.effect-dropdown');

    checkbox.addEventListener('change', (e) => {
      const enabled = e.target.checked;
      this.background.setVisibility(enabled);
      dropdown.disabled = !enabled;
    });

    dropdown.addEventListener('change', (e) => {
      const value = e.target.value;
      localStorage.setItem('selectedEffect', value);

      if (value === 'auto') {
        this.background.setAutoRotate(true);
      } else {
        this.background.setAutoRotate(false);
        this.background.setEffect(parseInt(value, 10));
      }
    });
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  const container = document.getElementById('three-background');
  if (container && window.THREE) {
    const background = new ThreeBackground(container);
    background.init();

    const selector = new EffectSelector(background);
    selector.create();

    // Expose for debugging
    window.threeBackground = background;
  }
});
