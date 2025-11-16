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

            // Brillo pulsante
            float brightness = mix(0.3, 1.0, pulse);

            gl_FragColor = vec4(color * brightness, opacity * (0.5 + pulse * 0.5));
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

      // Apply rotation if effect returns it
      if (rotation) {
        particles.rotation.y = rotation.rotationY;
        particles.rotation.x = rotation.rotationX;
        lines.rotation.y = rotation.rotationY;
        lines.rotation.x = rotation.rotationX;
      }

      particles.geometry.attributes.position.needsUpdate = true;

      // Update connections between nearby particles - using effect settings
      const linePositions = lines.geometry.attributes.position.array;
      let connectionIndex = 0;
      const maxDistance = currentEffect.maxConnectionDistance;

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
