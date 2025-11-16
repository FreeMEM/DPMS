import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const ThreeBackground = ({ variant = "admin" }) => {
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetMouseRef = useRef({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(() => {
    // Leer preferencia de localStorage, por defecto true
    const saved = localStorage.getItem('backgroundEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    const container = containerRef.current;
    console.log("ThreeBackground: Container ref:", container);
    console.log("ThreeBackground: Variant:", variant);

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

    // Create particle system for hyperspace effect
    const particlesCount = variant === "admin" ? 500 : 350;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    const sizes = new Float32Array(particlesCount);

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
    const particleData = [];

    for (let i = 0; i < particlesCount; i++) {
      // Random position in cylindrical space (tunnel effect)
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 8 + 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = Math.random() * -50 - 10; // Start far back

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Random color from the palette
      const color = particleColors[Math.floor(Math.random() * particleColors.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      // Random size
      sizes[i] = Math.random() * 3 + 1;

      // Store data for hyperspace tunnel animation
      particleData.push({
        angle: angle,
        radius: radius,
        speed: Math.random() * 0.5 + 0.3, // Speed towards camera
      });
    }

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

    // Create lines to connect nearby particles
    const maxConnections = variant === "admin" ? 100 : 50;
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array(maxConnections * 2 * 3); // 2 points per line, 3 coords per point
    lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      color: variant === "admin" ? 0x6020c0 : 0x20c0a0,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
    });

    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    // Create plasma background plane - make it much larger to cover the screen
    const aspect = window.innerWidth / window.innerHeight;
    const plasmaGeometry = new THREE.PlaneGeometry(20 * aspect, 20);

    // Shader para el efecto plasma con túnel de velocidad de luz
    const plasmaMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: {
          value:
            variant === "admin"
              ? new THREE.Color(0.15, 0.0, 0.25) // Dark purple para admin
              : new THREE.Color(0.0, 0.15, 0.25),
        }, // Dark cyan para user
        color2: {
          value:
            variant === "admin"
              ? new THREE.Color(0.35, 0.1, 0.45) // Medium purple para admin
              : new THREE.Color(0.1, 0.35, 0.45),
        }, // Medium cyan para user
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color1;
        uniform vec3 color2;
        varying vec2 vUv;

        void main() {
          vec2 uv = vUv * 2.0 - 1.0; // Center UV

          // Distance from center
          float dist = length(uv);

          // Angle from center for radial effect
          float angle = atan(uv.y, uv.x);

          // Create star streaks effect - lines emanating from center
          // Multiple layers of radial lines moving outward
          float streaks1 = sin(angle * 20.0 - dist * 8.0 + time * 3.0);
          float streaks2 = sin(angle * 15.0 - dist * 10.0 + time * 2.5);
          float streaks3 = sin(angle * 25.0 - dist * 6.0 + time * 3.5);

          // Combine streaks
          float streaks = (streaks1 + streaks2 + streaks3) * 0.333;

          // Make streaks more visible near edges (faster stretching effect)
          float stretchFactor = smoothstep(0.0, 1.5, dist);
          streaks *= stretchFactor;

          // Radial waves flowing outward (tunnel effect)
          float tunnel = sin(dist * 5.0 - time * 2.0);

          // Pulsing from center
          float pulse = sin(dist * 3.0 - time * 1.5) * 0.5;

          // Combine all effects
          float plasma = (streaks * 0.6 + tunnel * 0.3 + pulse * 0.1);

          // Normalize and add contrast
          plasma = smoothstep(-0.4, 0.4, plasma);

          // Add radial gradient for depth (darker at center, brighter at edges)
          float radialGradient = smoothstep(0.0, 1.2, dist);
          plasma = mix(plasma * 0.5, plasma, radialGradient);

          // Mix colors based on plasma value
          vec3 color = mix(color1, color2, plasma);

          // Fade out at edges
          float edgeFade = 1.0 - smoothstep(0.8, 1.5, dist);

          gl_FragColor = vec4(color, 0.4 * edgeFade);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const plasma = new THREE.Mesh(plasmaGeometry, plasmaMaterial);
    plasma.position.z = -8; // Mucho más lejos, como telón de fondo
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

    // Animation loop
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Update plasma shader time
      plasmaMaterial.uniforms.time.value = elapsedTime;

      // Smooth mouse movement
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.05;

      // Update particle positions with hyperspace tunnel effect
      const positions = particles.geometry.attributes.position.array;

      for (let i = 0; i < particlesCount; i++) {
        const data = particleData[i];
        const i3 = i * 3;

        // Move particle towards camera (hyperspace effect)
        positions[i3 + 2] += data.speed;

        // Reset particle to back when it passes camera
        if (positions[i3 + 2] > 5) {
          positions[i3 + 2] = Math.random() * -50 - 10;
          // Randomize angle and radius on reset for variety
          data.angle = Math.random() * Math.PI * 2;
          data.radius = Math.random() * 8 + 2;
        }

        // Mouse interaction - particles fly towards mouse position
        const targetAngle = Math.atan2(mouseRef.current.y * 5, mouseRef.current.x * 5);
        let angleDiff = targetAngle - data.angle;

        // Normalize angle difference to avoid sudden jumps (-PI to PI)
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        // Smooth angle transition towards mouse (very gentle)
        data.angle += angleDiff * 0.005;

        // Update X and Y based on current angle and radius
        positions[i3] = Math.cos(data.angle) * data.radius;
        positions[i3 + 1] = Math.sin(data.angle) * data.radius;
      }

      particles.geometry.attributes.position.needsUpdate = true;

      // Update connections between nearby particles
      const linePositions = lines.geometry.attributes.position.array;
      let connectionIndex = 0;
      const maxDistance = 2.5;

      for (let i = 0; i < particlesCount && connectionIndex < maxConnections * 2; i++) {
        const i3 = i * 3;
        const x1 = positions[i3];
        const y1 = positions[i3 + 1];
        const z1 = positions[i3 + 2];

        // Check a subset of other particles to avoid O(n²) complexity
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
            // Add line between these two particles
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

      // Fill remaining lines with zeros (invisible)
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

      // Dispose particles
      particlesGeometry.dispose();
      particlesMaterial.dispose();

      lineGeometry.dispose();
      lineMaterial.dispose();
      plasmaGeometry.dispose();
      plasmaMaterial.dispose();
      renderer.dispose();
    };
  }, [variant]);

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
      }}
    />
  );
};

export default ThreeBackground;
