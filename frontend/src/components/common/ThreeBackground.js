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

    // Function to create 8-bit spaceship sprite texture with different ship types
    const createShipSprite = (color, shipType) => {
      const canvas = document.createElement("canvas");
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext("2d");

      // Clear canvas
      ctx.clearRect(0, 0, 16, 16);

      // Draw 8-bit spaceship pattern (inspired by Galaxian/Space Invaders)
      ctx.fillStyle = color;

      // Different ship patterns for variety
      const patterns = {
        // Type 1: Classic invader shape
        invader: [
          [0,0,0,0,0,1,1,0,0,1,1,0,0,0,0,0],
          [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
          [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
          [0,0,1,1,0,1,1,1,1,1,1,0,1,1,0,0],
          [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
          [0,1,0,1,1,1,1,1,1,1,1,1,1,0,1,0],
          [0,1,0,1,0,0,0,0,0,0,0,0,1,0,1,0],
          [0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0],
        ],
        // Type 2: Galaga-style fighter
        fighter: [
          [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
          [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
          [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
          [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
          [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
          [0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0],
          [0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0],
        ],
        // Type 3: Diamond/crystal shape
        diamond: [
          [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
          [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
          [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
          [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
          [0,0,1,1,1,1,0,1,1,0,1,1,1,1,0,0],
          [0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0],
          [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
        ],
        // Type 4: TIE Fighter style
        tie: [
          [0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0],
          [0,1,1,1,0,0,0,1,1,0,0,0,1,1,1,0],
          [0,1,1,1,1,0,1,1,1,1,0,1,1,1,1,0],
          [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
          [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
          [0,1,1,1,1,0,1,1,1,1,0,1,1,1,1,0],
          [0,1,1,1,0,0,0,1,1,0,0,0,1,1,1,0],
          [0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0],
        ],
      };

      const pattern = patterns[shipType];

      for (let y = 0; y < pattern.length; y++) {
        for (let x = 0; x < pattern[y].length; x++) {
          if (pattern[y][x] === 1) {
            ctx.fillRect(x, y + 4, 1, 1);
          }
        }
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      return texture;
    };

    // Create ship sprite system
    const shipsCount = variant === "admin" ? 300 : 200;
    const ships = [];
    const shipData = [];

    // Get ship colors based on variant
    const getShipColors = () => {
      if (variant === "admin") {
        return [
          "rgb(51, 102, 204)",   // Blue
          "rgb(153, 51, 204)",   // Purple
          "rgb(230, 51, 153)",   // Pink
        ];
      } else {
        return [
          "rgb(51, 204, 204)",   // Cyan
          "rgb(51, 230, 102)",   // Green
          "rgb(230, 230, 51)",   // Yellow
        ];
      }
    };

    const shipColors = getShipColors();
    const shipTypes = ["invader", "fighter", "diamond", "tie"];

    for (let i = 0; i < shipsCount; i++) {
      // Random position
      const x = (Math.random() - 0.5) * 10;
      const y = (Math.random() - 0.5) * 10;
      const z = (Math.random() - 0.5) * 10;

      // Random color and ship type from palettes
      const color = shipColors[Math.floor(Math.random() * shipColors.length)];
      const shipType = shipTypes[Math.floor(Math.random() * shipTypes.length)];
      const texture = createShipSprite(color, shipType);

      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
      });

      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.set(x, y, z);
      sprite.scale.set(0.3, 0.3, 0.3);

      scene.add(sprite);
      ships.push(sprite);

      // Store original position and rotation speed for animation
      shipData.push({
        originalX: x,
        originalY: y,
        originalZ: z,
        rotationSpeed: (Math.random() - 0.5) * 0.5, // Random rotation speed
      });
    }

    console.log("ThreeBackground: Ships created with", shipsCount, "spaceships");

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

    // Animation loop
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Update plasma shader time
      plasmaMaterial.uniforms.time.value = elapsedTime;

      // Smooth mouse movement
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.05;

      // Update ship positions with wave effect
      for (let i = 0; i < shipsCount; i++) {
        const ship = ships[i];
        const data = shipData[i];

        // Wave effect - create flowing motion
        const waveX = Math.sin(elapsedTime * 0.3 + data.originalY * 0.5) * 0.3;
        const waveY = Math.cos(elapsedTime * 0.2 + data.originalX * 0.5) * 0.3;
        const waveZ = Math.sin(elapsedTime * 0.25 + data.originalX * 0.3 + data.originalY * 0.3) * 0.2;

        // Apply wave to position
        ship.position.x = data.originalX + waveX;
        ship.position.y = data.originalY + waveY;
        ship.position.z = data.originalZ + waveZ;

        // Add subtle rotation for more dynamic feel
        ship.material.rotation = elapsedTime * data.rotationSpeed;

        // Mouse interaction - repulsion
        const dx = mouseRef.current.x * 5 - ship.position.x;
        const dy = mouseRef.current.y * 5 - ship.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Apply smooth repulsion when mouse is near
        if (distance < 3) {
          const force = ((3 - distance) / 3) * 0.5;
          ship.position.x -= dx * force;
          ship.position.y -= dy * force;
        }
      }

      // Update connections between nearby ships
      const linePositions = lines.geometry.attributes.position.array;
      let connectionIndex = 0;
      const maxDistance = 2.5;

      for (let i = 0; i < shipsCount && connectionIndex < maxConnections * 2; i++) {
        const ship1 = ships[i];
        const x1 = ship1.position.x;
        const y1 = ship1.position.y;
        const z1 = ship1.position.z;

        // Check a subset of other ships to avoid O(n²) complexity
        for (let j = i + 1; j < Math.min(i + 15, shipsCount) && connectionIndex < maxConnections * 2; j++) {
          const ship2 = ships[j];
          const x2 = ship2.position.x;
          const y2 = ship2.position.y;
          const z2 = ship2.position.z;

          const dx = x2 - x1;
          const dy = y2 - y1;
          const dz = z2 - z1;
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (distance < maxDistance) {
            // Add line between these two ships
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

      // Dispose ship sprites
      ships.forEach((ship) => {
        if (ship.material.map) {
          ship.material.map.dispose();
        }
        ship.material.dispose();
      });

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
