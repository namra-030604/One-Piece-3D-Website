import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    THREE: any;
    gsap: any;
  }
}

const ARC_NAMES = [
  "Grand Line",
  "East Blue",
  "Alabasta",
  "Skypiea",
  "Water 7",
  "Marineford",
  "Dressrosa",
  "Wano",
];

export default function OnePiece() {
  const mountRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const [currentArc, setCurrentArc] = useState(0);

  useEffect(() => {
    if (initializedRef.current) return;

    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
          if ((existing as HTMLScriptElement).dataset.loaded === "true") {
            resolve();
            return;
          }
          existing.addEventListener("load", () => resolve(), { once: true });
          return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.dataset.loaded = "false";
        script.onload = () => {
          script.dataset.loaded = "true";
          resolve();
        };
        script.onerror = () => reject(new Error(`Failed to load: ${src}`));
        document.head.appendChild(script);
      });
    };

    const init = async () => {
      try {
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js");
        await loadScript("https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/shaders/CopyShader.js");
        await loadScript("https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/shaders/LuminosityHighPassShader.js");
        await loadScript("https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/shaders/FilmShader.js");
        await loadScript("https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/EffectComposer.js");
        await loadScript("https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/RenderPass.js");
        await loadScript("https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/ShaderPass.js");
        await loadScript("https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/UnrealBloomPass.js");
        await loadScript("https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/FilmPass.js");
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js");
        setupScene();
      } catch (err) {
        console.error("[OnePiece] Failed to load CDN scripts:", err);
      }
    };

    const setupScene = () => {
      if (!mountRef.current) return;

      const THREE = window.THREE;
      if (!THREE) return;

      initializedRef.current = true;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x050a1a);
      scene.fog = new THREE.FogExp2(0x050a1a, 0.008);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.toneMapping = THREE.ReinhardToneMapping;
      renderer.toneMappingExposure = 1.2;
      mountRef.current.appendChild(renderer.domElement);

      const camera = new THREE.PerspectiveCamera(
        75, window.innerWidth / window.innerHeight, 0.1, 1000
      );
      camera.position.set(0, 4, 20);

      let composer: any = null;
      try {
        composer = new THREE.EffectComposer(renderer);
        composer.addPass(new THREE.RenderPass(scene, camera));
        const bloomPass = new THREE.UnrealBloomPass(
          new THREE.Vector2(window.innerWidth, window.innerHeight),
          1.4, 0.8, 0.2
        );
        composer.addPass(bloomPass);
        const filmPass = new THREE.FilmPass(0.25, 0.0, 648, false);
        filmPass.renderToScreen = true;
        composer.addPass(filmPass);
      } catch (e) {
        console.warn("[OnePiece] Post-processing unavailable:", e);
        composer = null;
      }

      // ── GRAND LINE INTRO SCENE ────────────────────────────────────────────

      const oceanGeo = new THREE.PlaneGeometry(200, 200, 80, 80);
      const oceanMat = new THREE.MeshPhongMaterial({
        color: 0x1a4a8a,
        shininess: 60,
        specular: 0x4488cc,
        side: THREE.DoubleSide,
        flatShading: true,
        transparent: true,
        opacity: 0.9,
      });
      const ocean = new THREE.Mesh(oceanGeo, oceanMat);
      ocean.rotation.x = -Math.PI / 2;
      ocean.position.y = -8;
      scene.add(ocean);

      const oceanPositionAttr = ocean.geometry.attributes.position;
      const oceanOriginalY: number[] = [];
      for (let i = 0; i < oceanPositionAttr.count; i++) {
        oceanOriginalY.push(oceanPositionAttr.getZ(i));
      }

      const starCount = 2000;
      const starGeo = new THREE.BufferGeometry();
      const starPositions = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount; i++) {
        starPositions[i * 3] = (Math.random() - 0.5) * 400;
        starPositions[i * 3 + 1] = (Math.random() - 0.5) * 400;
        starPositions[i * 3 + 2] = (Math.random() - 0.5) * 400;
      }
      starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
      const starMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.4,
        transparent: true,
        opacity: 0.85,
        sizeAttenuation: true,
      });
      const stars = new THREE.Points(starGeo, starMat);
      scene.add(stars);

      const torusGeo = new THREE.TorusGeometry(3, 0.3, 16, 100);
      const torusMat = new THREE.MeshStandardMaterial({
        color: 0xffcd00,
        emissive: 0xd70000,
        emissiveIntensity: 0.4,
        metalness: 0.7,
        roughness: 0.25,
      });
      const torus = new THREE.Mesh(torusGeo, torusMat);
      torus.position.set(0, 2, 0);
      scene.add(torus);

      const ambientLight = new THREE.AmbientLight(0x1a2a5a, 1.5);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xffcd00, 1);
      dirLight.position.set(5, 10, 5);
      scene.add(dirLight);

      const pointLight = new THREE.PointLight(0xd70000, 2, 30);
      pointLight.position.set(-5, 3, 0);
      scene.add(pointLight);

      const clock = new THREE.Clock();
      let targetX = 0;
      let targetY = 0;
      const baseCamX = 0;
      const baseCamY = 4;
      const baseCamZ = 20;
      const parallaxStrength = 3;

      const onMouseMove = (e: MouseEvent) => {
        targetX = (e.clientX / window.innerWidth - 0.5) * 2;
        targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
      };
      window.addEventListener("mousemove", onMouseMove);

      const onResize = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        if (composer) composer.setSize(w, h);
      };
      window.addEventListener("resize", onResize);

      let animFrameId: number;
      const animate = () => {
        animFrameId = requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        for (let i = 0; i < oceanPositionAttr.count; i++) {
          const x = oceanPositionAttr.getX(i);
          const y = oceanPositionAttr.getY(i);
          const waveZ =
            Math.sin(x * 0.3 + t) * 1.2 +
            Math.cos(y * 0.3 + t * 0.8) * 0.8;
          oceanPositionAttr.setZ(i, oceanOriginalY[i] + waveZ);
        }
        oceanPositionAttr.needsUpdate = true;
        ocean.geometry.computeVertexNormals();

        torus.rotation.y += 0.003;
        torus.rotation.x += 0.001;
        torus.position.y = 2 + Math.sin(t * 0.8) * 0.4;

        stars.rotation.y += 0.0001;
        stars.rotation.x += 0.00005;

        camera.position.x += (baseCamX + targetX * parallaxStrength - camera.position.x) * 0.05;
        camera.position.y += (baseCamY + targetY * parallaxStrength - camera.position.y) * 0.05;
        camera.position.z = baseCamZ;
        camera.lookAt(0, 0, 0);

        if (composer) {
          composer.render();
        } else {
          renderer.render(scene, camera);
        }
      };
      animate();

      (mountRef.current as any).__cleanup = () => {
        cancelAnimationFrame(animFrameId);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("resize", onResize);
        scene.traverse((obj: any) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m: any) => m.dispose());
            } else {
              obj.material.dispose();
            }
          }
        });
        if (composer) {
          composer.renderTarget1?.dispose();
          composer.renderTarget2?.dispose();
        }
        renderer.dispose();
        if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
          mountRef.current.removeChild(renderer.domElement);
        }
      };

      (window as any).__threejsState = {
        scene, camera, renderer, composer, clock, THREE,
        gsap: window.gsap,
        ocean, torus, stars,
        targetX: () => targetX,
        targetY: () => targetY,
      };

      console.log("[OnePiece] Grand Line intro scene loaded.");
    };

    init();

    return () => {
      if (mountRef.current && (mountRef.current as any).__cleanup) {
        (mountRef.current as any).__cleanup();
        initializedRef.current = false;
      }
    };
  }, []);

  return (
    <>
      {/* ── Three.js Canvas Mount ─────────────────────────────────────────── */}
      <div
        ref={mountRef}
        data-testid="threejs-canvas-mount"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 0,
          background: "#050a1a",
          overflow: "hidden",
        }}
      />

      {/* ── Vignette Overlay ──────────────────────────────────────────────── */}
      <div
        data-testid="vignette-overlay"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 2,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(5,10,26,0.5) 70%, rgba(5,10,26,0.9) 100%)",
        }}
      />

      {/* ── Arc Title + Tagline ───────────────────────────────────────────── */}
      <div
        data-testid="arc-title-container"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 10,
          textAlign: "center",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <h1
          data-testid="arc-title"
          style={{
            fontFamily: "'Pirata One', cursive",
            fontSize: "clamp(3rem, 8vw, 6rem)",
            color: "#FFCD00",
            margin: 0,
            lineHeight: 1.1,
            textShadow:
              "0 0 20px rgba(255,205,0,0.6), 0 0 40px rgba(255,205,0,0.3), 0 0 80px rgba(255,205,0,0.15)",
            letterSpacing: "0.04em",
          }}
        >
          SET SAIL
        </h1>
        <p
          data-testid="arc-tagline"
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: "clamp(0.85rem, 1.8vw, 1.1rem)",
            color: "#acd6f5",
            margin: "1rem 0 0 0",
            letterSpacing: "0.08em",
            textShadow: "0 0 12px rgba(172,214,245,0.3)",
            lineHeight: 1.6,
          }}
        >
          The Grand Line awaits — click to begin
        </p>
      </div>

      {/* ── Progress Dots ─────────────────────────────────────────────────── */}
      <div
        data-testid="progress-dots"
        style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          alignItems: "center",
          pointerEvents: "none",
        }}
      >
        {ARC_NAMES.map((name, i) => {
          const isActive = i === currentArc;
          return (
            <div
              key={name}
              data-testid={`progress-dot-${i}`}
              title={name}
              style={{
                width: isActive ? "12px" : "10px",
                height: isActive ? "12px" : "10px",
                borderRadius: "50%",
                border: "1.5px solid #FFCD00",
                backgroundColor: isActive ? "#FFCD00" : "transparent",
                boxShadow: isActive
                  ? "0 0 8px rgba(255,205,0,0.7), 0 0 16px rgba(255,205,0,0.35)"
                  : "none",
                transition: "all 0.4s ease",
              }}
            />
          );
        })}
      </div>

      {/* ── Click Prompt ──────────────────────────────────────────────────── */}
      <div
        data-testid="click-prompt"
        style={{
          position: "fixed",
          bottom: "2.5rem",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 100,
          textAlign: "center",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <span
          style={{
            fontFamily: "'Pirata One', cursive",
            fontSize: "1rem",
            color: "rgba(255,255,255,0.6)",
            letterSpacing: "0.1em",
            animation: "pulse-prompt 1.5s ease-in-out infinite",
            display: "inline-block",
          }}
        >
          Click anywhere to set sail
        </span>
      </div>

      {/* ── Pulse animation keyframes ─────────────────────────────────────── */}
      <style>{`
        @keyframes pulse-prompt {
          0%, 100% { opacity: 1.0; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </>
  );
}
