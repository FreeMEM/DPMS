import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const ThreeBackground = ({ variant = "admin" }) => {
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetMouseRef = useRef({ x: 0, y: 0 });

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

    // Create particle system
    const particlesCount = variant === "admin" ? 1000 : 500;
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    const sizes = new Float32Array(particlesCount);

    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;

      // Positions
      positions[i3] = (Math.random() - 0.5) * 10;
      positions[i3 + 1] = (Math.random() - 0.5) * 10;
      positions[i3 + 2] = (Math.random() - 0.5) * 10;

      // Colors - diferentes según variante
      const colorValue = Math.random();
      if (variant === "admin") {
        // Admin: gradient from blue to purple to pink (más intenso)
        if (colorValue < 0.33) {
          // Blue
          colors[i3] = 0.2;
          colors[i3 + 1] = 0.4;
          colors[i3 + 2] = 0.8;
        } else if (colorValue < 0.66) {
          // Purple
          colors[i3] = 0.6;
          colors[i3 + 1] = 0.2;
          colors[i3 + 2] = 0.8;
        } else {
          // Pink
          colors[i3] = 0.9;
          colors[i3 + 1] = 0.2;
          colors[i3 + 2] = 0.6;
        }
      } else {
        // User: gradient from cyan to green to yellow (más suave)
        if (colorValue < 0.33) {
          // Cyan
          colors[i3] = 0.2;
          colors[i3 + 1] = 0.8;
          colors[i3 + 2] = 0.8;
        } else if (colorValue < 0.66) {
          // Green
          colors[i3] = 0.2;
          colors[i3 + 1] = 0.9;
          colors[i3 + 2] = 0.4;
        } else {
          // Yellow
          colors[i3] = 0.9;
          colors[i3 + 1] = 0.9;
          colors[i3 + 2] = 0.2;
        }
      }

      // Sizes
      sizes[i] = Math.random() * 3;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(geometry, material);
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

    // Shader para el efecto plasma
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

          // Multiple sine wave layers for complex plasma - reduced frequency for larger patterns
          float wave1 = sin(uv.x * 2.0 + time * 0.3) * cos(uv.y * 1.5 - time * 0.2);
          float wave2 = sin(uv.y * 2.5 + time * 0.25) * cos(uv.x * 2.0 + time * 0.15);
          float wave3 = sin((uv.x + uv.y) * 1.5 + time * 0.35);

          // Circular waves emanating from center - slower and larger
          float dist = length(uv);
          float wave4 = sin(dist * 4.0 - time * 0.8) * 0.5;

          // Combine waves
          float plasma = (wave1 + wave2 + wave3 + wave4) * 0.25;

          // Increase contrast but keep it subtle
          plasma = smoothstep(-0.3, 0.3, plasma);

          // Mix colors based on plasma value
          vec3 color = mix(color1, color2, plasma);

          gl_FragColor = vec4(color, 0.4);
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

    // Store original positions for wave effect
    const originalPositions = new Float32Array(positions);

    // Animation loop
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Update plasma shader time
      plasmaMaterial.uniforms.time.value = elapsedTime;

      // Smooth mouse movement
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.05;

      // Update particle positions with wave effect
      const positions = particles.geometry.attributes.position.array;

      for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;

        // Get original position
        const originalX = originalPositions[i3];
        const originalY = originalPositions[i3 + 1];
        const originalZ = originalPositions[i3 + 2];

        // Wave effect - create flowing motion
        const waveX = Math.sin(elapsedTime * 0.3 + originalY * 0.5) * 0.3;
        const waveY = Math.cos(elapsedTime * 0.2 + originalX * 0.5) * 0.3;
        const waveZ = Math.sin(elapsedTime * 0.25 + originalX * 0.3 + originalY * 0.3) * 0.2;

        // Apply wave to position
        positions[i3] = originalX + waveX;
        positions[i3 + 1] = originalY + waveY;
        positions[i3 + 2] = originalZ + waveZ;

        // Mouse interaction - attraction/repulsion
        const dx = mouseRef.current.x * 5 - positions[i3];
        const dy = mouseRef.current.y * 5 - positions[i3 + 1];
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Apply smooth repulsion when mouse is near
        if (distance < 3) {
          const force = ((3 - distance) / 3) * 0.5;
          positions[i3] -= dx * force;
          positions[i3 + 1] -= dy * force;
        }
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

      // Very slow rotation for subtle movement
      particles.rotation.y = Math.sin(elapsedTime * 0.1) * 0.2;
      particles.rotation.x = Math.cos(elapsedTime * 0.15) * 0.1;
      lines.rotation.y = particles.rotation.y;
      lines.rotation.x = particles.rotation.x;

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

      geometry.dispose();
      material.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      plasmaGeometry.dispose();
      plasmaMaterial.dispose();
      renderer.dispose();
    };
  }, [variant]);

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
      }}
    />
  );
};

export default ThreeBackground;
