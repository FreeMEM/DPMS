import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { getEffect, getEffectCount } from "./backgroundEffects";

const ThreeBackground = ({ variant = "admin" }) => {
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetMouseRef = useRef({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(() => {
    // Leer preferencia de localStorage, por defecto true
    const saved = localStorage.getItem('backgroundEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Estado para alternar entre efectos
  const [effectIndex, setEffectIndex] = useState(() => {
    const saved = localStorage.getItem('selectedEffect');
    if (saved && saved !== 'auto') {
      return parseInt(saved, 10);
    }
    return 0;
  });
  const [isFading, setIsFading] = useState(false);
  const [autoRotate, setAutoRotate] = useState(() => {
    const saved = localStorage.getItem('selectedEffect');
    return !saved || saved === 'auto';
  });

  // Escuchar cambios de efecto desde el selector
  useEffect(() => {
    const handleEffectChange = (event) => {
      const selectedEffect = event.detail.effect;

      if (selectedEffect === 'auto') {
        setAutoRotate(true);
      } else {
        setAutoRotate(false);
        const effectIdx = parseInt(selectedEffect, 10);

        // Hacer fade al cambiar manualmente
        setIsFading(true);
        setTimeout(() => {
          setEffectIndex(effectIdx);
          setTimeout(() => {
            setIsFading(false);
          }, 50);
        }, 1000);
      }
    };

    window.addEventListener('effectChange', handleEffectChange);
    return () => window.removeEventListener('effectChange', handleEffectChange);
  }, []);

  // Alternar efecto cada 30 segundos con fade (solo en modo auto)
  useEffect(() => {
    if (!autoRotate) return;

    const interval = setInterval(() => {
      // Iniciar fade out
      setIsFading(true);

      // Después de 1 segundo (fade out completo), cambiar efecto
      setTimeout(() => {
        setEffectIndex(prev => (prev + 1) % getEffectCount());

        // Después de cambiar, hacer fade in
        setTimeout(() => {
          setIsFading(false);
        }, 50);
      }, 1000);
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [autoRotate]);

  useEffect(() => {
    const container = containerRef.current;
    const currentEffect = getEffect(effectIndex);

    console.log("ThreeBackground: Container ref:", container);
    console.log("ThreeBackground: Variant:", variant);
    console.log("ThreeBackground: Effect:", currentEffect.name);

    if (!container) {
      console.log("ThreeBackground: No container found!");
      return;
    }

    console.log("ThreeBackground: Initializing Three.js...");

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    console.log("ThreeBackground: Renderer created:", renderer);
    console.log("ThreeBackground: Canvas element:", renderer.domElement);

    container.appendChild(renderer.domElement);
    console.log("ThreeBackground: Canvas appended to container");

    // Get particle colors based on variant
    const getParticleColors = () => {
      if (variant === "admin") {
        return [
          new THREE.Color(0.2, 0.4, 0.8),   // Blue
          new THREE.Color(0.6, 0.2, 0.8),   // Purple
          new THREE.Color(0.9, 0.2, 0.6),   // Pink
        ];
      } else {
        return [
          new THREE.Color(0.2, 0.8, 0.8),   // Cyan
          new THREE.Color(0.2, 0.9, 0.4),   // Green
          new THREE.Color(0.9, 0.9, 0.2),   // Yellow
        ];
      }
    };

    const particleColors = getParticleColors();

    // Initialize particles using current effect
    const particlesCount = currentEffect.particleCount(variant);
    const { positions, colors, sizes, particleData } = currentEffect.initializeParticles(
      particlesCount,
      variant,
      particleColors
    );

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    console.log("ThreeBackground: Particles created with", particlesCount, "particles");

    // Create lines to connect nearby particles - using effect settings
    const maxConnections = currentEffect.maxConnections(variant);
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array(maxConnections * 2 * 3);
    lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));

    // Create material based on whether lines should be animated
    let lineMaterial;
    if (currentEffect.animateLines) {
      // Shader material para energía fluyendo
      lineMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color: { value: new THREE.Color(variant === "admin" ? 0x6020c0 : 0x20c0a0) },
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
            // Crear efecto de energía fluyendo por la línea
            float flow = fract(vPosition.x * 0.5 + vPosition.y * 0.5 + vPosition.z * 0.5 - time * 0.5);
            float pulse = sin(flow * 3.14159 * 4.0) * 0.5 + 0.5;

            // Brillo pulsante más intenso
            float brightness = mix(0.6, 1.8, pulse);

            gl_FragColor = vec4(color * brightness, opacity * (0.7 + pulse * 0.3));
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
      });
    } else {
      // Material básico para líneas estáticas
      lineMaterial = new THREE.LineBasicMaterial({
        color: variant === "admin" ? 0x6020c0 : 0x20c0a0,
        transparent: true,
        opacity: currentEffect.lineOpacity,
        blending: THREE.AdditiveBlending,
      });
    }

    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    // Create plasma background plane
    const aspect = window.innerWidth / window.innerHeight;
    const plasmaGeometry = new THREE.PlaneGeometry(20 * aspect, 20);

    // Use plasma shader from current effect
    const plasmaFragmentShader = currentEffect.plasmaShader;

    // Array para guardar eventos de pérdida de conexión (máximo 10 pulsos simultáneos)
    const maxPulses = 10;
    const pulsePositions = new Float32Array(maxPulses * 2); // x, y en coordenadas de pantalla
    const pulseTimes = new Float32Array(maxPulses); // tiempo de inicio de cada pulso

    const plasmaMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: {
          value:
            variant === "admin"
              ? new THREE.Color(0.15, 0.0, 0.25)
              : new THREE.Color(0.0, 0.15, 0.25),
        },
        color2: {
          value:
            variant === "admin"
              ? new THREE.Color(0.35, 0.1, 0.45)
              : new THREE.Color(0.1, 0.35, 0.45),
        },
        pulsePositions: { value: pulsePositions },
        pulseTimes: { value: pulseTimes },
        maxPulses: { value: maxPulses },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: plasmaFragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const plasma = new THREE.Mesh(plasmaGeometry, plasmaMaterial);
    plasma.position.z = -8;
    scene.add(plasma);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    console.log("ThreeBackground: Scene setup complete, starting animation...");

    // Mouse/Touch handlers
    const handleMouseMove = (event) => {
      targetMouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      targetMouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const handleTouchMove = (event) => {
      if (event.touches.length > 0) {
        targetMouseRef.current.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
        targetMouseRef.current.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // Store original positions for wave effect (only used in wave mode)
    const originalPositions = new Float32Array(positions);

    // Random connections state (for energy-grid effect)
    // Inicializar partículas activas con tiempos de cambio aleatorios y opacidad
    const particleActiveTimes = new Array(particlesCount);
    for (let i = 0; i < particlesCount; i++) {
      const isActive = Math.random() < (currentEffect.connectionProbability || 0.25);
      particleActiveTimes[i] = {
        isActive: isActive,
        opacity: isActive ? 1.0 : 0.0, // Opacidad inicial
        targetOpacity: isActive ? 1.0 : 0.0,
        nextChange: Math.random() * 20.0 + 15.0 // Tiempo aleatorio hasta el próximo cambio (15-35 segundos)
      };
    }

    // Estado para conexiones estables (no se redefinen cada frame)
    let connectionPairs = [];
    let nextConnectionUpdate = 0;
    const connectionUpdateInterval = 0.1; // Actualizar UNA conexión cada 0.1 segundos (10 por segundo)

    // Índice rotativo para guardar pulsos (sistema circular de buffer)
    let nextPulseIndex = 0;

    // Función helper para proyectar coordenadas 3D a coordenadas UV del shader
    const projectToScreenUV = (x, y, z) => {
      const vector = new THREE.Vector3(x, y, z);
      vector.project(camera);
      return {
        x: vector.x,
        y: vector.y
      };
    };

    // Animation loop
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Update plasma shader time
      plasmaMaterial.uniforms.time.value = elapsedTime;

      // Update line shader time if animated
      if (currentEffect.animateLines && lineMaterial.uniforms) {
        lineMaterial.uniforms.time.value = elapsedTime;
      }

      // Smooth mouse movement
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.05;

      // Update particle positions using current effect
      const positions = particles.geometry.attributes.position.array;
      const rotation = currentEffect.animateParticles(
        particlesCount,
        positions,
        particleData || originalPositions,
        mouseRef,
        elapsedTime
      );

      // Apply rotation if effect returns it, with mouse interaction
      if (rotation) {
        // Base rotation from effect
        const baseRotationY = rotation.rotationY;
        const baseRotationX = rotation.rotationX;

        // Add mouse-driven rotation (suave y sutil)
        const mouseRotationY = mouseRef.current.x * 0.3; // Horizontal mouse -> Y rotation
        const mouseRotationX = -mouseRef.current.y * 0.2; // Vertical mouse -> X rotation

        particles.rotation.y = baseRotationY + mouseRotationY;
        particles.rotation.x = baseRotationX + mouseRotationX;
        lines.rotation.y = baseRotationY + mouseRotationY;
        lines.rotation.x = baseRotationX + mouseRotationX;
      } else {
        // Si el efecto no devuelve rotación, aplicar solo rotación del mouse
        particles.rotation.y = mouseRef.current.x * 0.3;
        particles.rotation.x = -mouseRef.current.y * 0.2;
        lines.rotation.y = mouseRef.current.x * 0.3;
        lines.rotation.x = -mouseRef.current.y * 0.2;
      }

      particles.geometry.attributes.position.needsUpdate = true;

      // Update connections between nearby particles - using effect settings
      const linePositions = lines.geometry.attributes.position.array;
      let connectionIndex = 0;
      const maxDistance = currentEffect.maxConnectionDistance;

      // Random connections mode (for energy-grid)
      if (currentEffect.randomConnections) {
        // Actualizar estado de partículas de forma gradual con transiciones suaves
        for (let i = 0; i < particlesCount; i++) {
          const particle = particleActiveTimes[i];

          // Cambiar estado cuando llegue el momento
          if (elapsedTime >= particle.nextChange) {
            particle.isActive = !particle.isActive;
            particle.targetOpacity = particle.isActive ? 1.0 : 0.0;
            // Siguiente cambio en 15-35 segundos aleatorios (muy lento)
            particle.nextChange = elapsedTime + 15.0 + Math.random() * 20.0;
          }

          // Interpolar opacidad suavemente hacia el objetivo (transición muy lenta)
          const fadeSpeed = 0.005; // Velocidad de transición muy lenta
          if (Math.abs(particle.opacity - particle.targetOpacity) > 0.01) {
            particle.opacity += (particle.targetOpacity - particle.opacity) * fadeSpeed;
          } else {
            particle.opacity = particle.targetOpacity;
          }
        }

        // Cambiar solo UNA conexión cada vez (no todas de golpe)
        if (elapsedTime >= nextConnectionUpdate) {
          nextConnectionUpdate = elapsedTime + connectionUpdateInterval;

          // Si no hay conexiones todavía, crear la lista inicial
          if (connectionPairs.length === 0) {
            // Conectar partículas con opacidad > 0 (visibles o en transición)
            const visibleParticles = [];
            for (let i = 0; i < particlesCount; i++) {
              if (particleActiveTimes[i].opacity > 0.01) {
                visibleParticles.push({ index: i, opacity: particleActiveTimes[i].opacity });
              }
            }

            // Crear conexiones dispersas iniciales
            const maxConnectionsPerParticle = currentEffect.maxConnectionsPerParticle || 2;
            const particleConnections = new Map();
            const shuffledParticles = [...visibleParticles].sort(() => Math.random() - 0.5);

            for (let i = 0; i < shuffledParticles.length && connectionPairs.length < maxConnections; i++) {
              const particleI = shuffledParticles[i].index;
              const connectionsI = particleConnections.get(particleI) || 0;
              if (connectionsI >= maxConnectionsPerParticle) continue;

              const i3 = particleI * 3;
              const x1 = positions[i3];
              const y1 = positions[i3 + 1];
              const z1 = positions[i3 + 2];

              const remainingParticles = shuffledParticles.slice(i + 1);
              const numConnectionsToMake = Math.min(
                maxConnectionsPerParticle - connectionsI,
                Math.floor(Math.random() * 2) + 1
              );

              let madeConnections = 0;
              for (let j = 0; j < remainingParticles.length && madeConnections < numConnectionsToMake && connectionPairs.length < maxConnections; j++) {
                const particleJ = remainingParticles[j].index;
                const connectionsJ = particleConnections.get(particleJ) || 0;
                if (connectionsJ >= maxConnectionsPerParticle) continue;

                const j3 = particleJ * 3;
                const x2 = positions[j3];
                const y2 = positions[j3 + 1];
                const z2 = positions[j3 + 2];

                const dx = x2 - x1;
                const dy = y2 - y1;
                const dz = z2 - z1;
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (distance < maxDistance) {
                  connectionPairs.push({
                    i: particleI,
                    j: particleJ,
                    opacity: Math.min(particleActiveTimes[particleI].opacity, particleActiveTimes[particleJ].opacity)
                  });

                  particleConnections.set(particleI, connectionsI + 1);
                  particleConnections.set(particleJ, connectionsJ + 1);
                  madeConnections++;
                }
              }
            }
          } else {
            // Reemplazar solo UNA conexión - la energía fluye de una partícula anterior a la siguiente cercana
            if (connectionPairs.length > 0) {
              // Elegir índice aleatorio para reemplazar
              const indexToReplace = Math.floor(Math.random() * connectionPairs.length);
              const oldConnection = connectionPairs[indexToReplace];

              // Elegir una de las dos partículas de la conexión anterior como punto de partida
              // Esto simula que la energía continúa desde donde estaba
              const useFirstParticle = Math.random() > 0.5;
              const particleI = useFirstParticle ? oldConnection.i : oldConnection.j;

              // Encontrar partículas visibles
              const visibleParticles = [];
              for (let i = 0; i < particlesCount; i++) {
                if (particleActiveTimes[i].opacity > 0.01) {
                  visibleParticles.push({ index: i, opacity: particleActiveTimes[i].opacity });
                }
              }

              if (visibleParticles.length >= 2) {
                const i3 = particleI * 3;
                const x1 = positions[i3];
                const y1 = positions[i3 + 1];
                const z1 = positions[i3 + 2];

                // Buscar partículas cercanas a esta (no cualquier partícula)
                // Excluir la otra partícula de la conexión anterior para que la energía fluya hacia adelante
                const otherOldParticle = useFirstParticle ? oldConnection.j : oldConnection.i;
                const nearbyParticles = [];

                for (let k = 0; k < visibleParticles.length; k++) {
                  const particleJ = visibleParticles[k].index;

                  // No conectar consigo misma ni volver a la partícula anterior (flujo hacia adelante)
                  if (particleJ === particleI || particleJ === otherOldParticle) continue;

                  const j3 = particleJ * 3;
                  const x2 = positions[j3];
                  const y2 = positions[j3 + 1];
                  const z2 = positions[j3 + 2];

                  const dx = x2 - x1;
                  const dy = y2 - y1;
                  const dz = z2 - z1;
                  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

                  // Solo considerar partículas cercanas (dentro del rango)
                  if (distance < maxDistance) {
                    nearbyParticles.push({ index: particleJ, distance: distance });
                  }
                }

                // Si hay partículas cercanas, elegir la MÁS CERCANA (flujo natural de energía)
                if (nearbyParticles.length > 0) {
                  // Ordenar por distancia y elegir la más cercana
                  nearbyParticles.sort((a, b) => a.distance - b.distance);
                  const closestParticle = nearbyParticles[0];
                  const particleJ = closestParticle.index;

                  // Registrar pulso en la partícula que perdió su conexión
                  // (la otra partícula del par anterior que NO se reutiliza)
                  const lostParticleIndex = otherOldParticle;
                  const lostI3 = lostParticleIndex * 3;
                  const lostPos = projectToScreenUV(
                    positions[lostI3],
                    positions[lostI3 + 1],
                    positions[lostI3 + 2]
                  );

                  // Guardar en buffer circular
                  pulsePositions[nextPulseIndex * 2] = lostPos.x;
                  pulsePositions[nextPulseIndex * 2 + 1] = lostPos.y;
                  pulseTimes[nextPulseIndex] = elapsedTime;

                  // Avanzar índice circular
                  nextPulseIndex = (nextPulseIndex + 1) % maxPulses;

                  // Actualizar uniforms del shader
                  plasmaMaterial.uniforms.pulsePositions.value = pulsePositions;
                  plasmaMaterial.uniforms.pulseTimes.value = pulseTimes;

                  connectionPairs[indexToReplace] = {
                    i: particleI,
                    j: particleJ,
                    opacity: Math.min(particleActiveTimes[particleI].opacity, particleActiveTimes[particleJ].opacity)
                  };
                }
              }
            }
          }
        }

        // Dibujar las conexiones actuales usando los pares guardados
        for (const pair of connectionPairs) {
          if (connectionIndex >= maxConnections * 2) break;

          const i3 = pair.i * 3;
          const j3 = pair.j * 3;

          const lineIndex = connectionIndex * 3;
          linePositions[lineIndex] = positions[i3];
          linePositions[lineIndex + 1] = positions[i3 + 1];
          linePositions[lineIndex + 2] = positions[i3 + 2];
          linePositions[lineIndex + 3] = positions[j3];
          linePositions[lineIndex + 4] = positions[j3 + 1];
          linePositions[lineIndex + 5] = positions[j3 + 2];
          connectionIndex += 2;
        }
      } else {
        // Modo normal de conexiones (partículas cercanas)
        for (let i = 0; i < particlesCount && connectionIndex < maxConnections * 2; i++) {
          const i3 = i * 3;
          const x1 = positions[i3];
          const y1 = positions[i3 + 1];
          const z1 = positions[i3 + 2];

          for (let j = i + 1; j < Math.min(i + 15, particlesCount) && connectionIndex < maxConnections * 2; j++) {
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

      for (let i = connectionIndex * 3; i < linePositions.length; i++) {
        linePositions[i] = 0;
      }

      lines.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("resize", handleResize);

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      particlesGeometry.dispose();
      particlesMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      plasmaGeometry.dispose();
      plasmaMaterial.dispose();
      renderer.dispose();
    };
  }, [variant, effectIndex]);

  // Escuchar eventos de cambio de visibilidad
  useEffect(() => {
    const handleToggle = (event) => {
      setIsVisible(event.detail.enabled);
    };

    window.addEventListener('backgroundToggle', handleToggle);
    return () => window.removeEventListener('backgroundToggle', handleToggle);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        pointerEvents: "none",
        display: isVisible ? "block" : "none",
        opacity: isFading ? 0 : 1,
        transition: "opacity 1s ease-in-out",
      }}
    />
  );
};

export default ThreeBackground;
