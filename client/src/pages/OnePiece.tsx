import { useEffect, useRef } from "react";

declare global {
  interface Window {
    THREE: any;
    gsap: any;
  }
}

export default function OnePiece() {
  const mountRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;

    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
          existing.addEventListener("load", () => resolve(), { once: true });
          // If already loaded the handler may never fire — resolve immediately
          if ((existing as HTMLScriptElement).dataset.loaded === "true") {
            resolve();
          }
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
        // Load in correct dependency order
        await loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
        );
        // Shaders must come before passes that use them
        await loadScript(
          "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/shaders/CopyShader.js"
        );
        await loadScript(
          "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/shaders/LuminosityHighPassShader.js"
        );
        await loadScript(
          "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/shaders/FilmShader.js"
        );
        // Core composer + passes
        await loadScript(
          "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/EffectComposer.js"
        );
        await loadScript(
          "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/RenderPass.js"
        );
        await loadScript(
          "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/ShaderPass.js"
        );
        await loadScript(
          "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/UnrealBloomPass.js"
        );
        await loadScript(
          "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/FilmPass.js"
        );
        // GSAP
        await loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"
        );

        setupScene();
      } catch (err) {
        console.error("[OnePiece] Failed to load CDN scripts:", err);
      }
    };

    const setupScene = () => {
      if (!mountRef.current) return;

      const THREE = window.THREE;
      if (!THREE) {
        console.error("[OnePiece] THREE not found on window after load");
        return;
      }

      initializedRef.current = true;

      // ── Scene ─────────────────────────────────────────────────────────────
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x050a1a);

      // ── Renderer ──────────────────────────────────────────────────────────
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.toneMapping = THREE.ReinhardToneMapping;
      renderer.toneMappingExposure = 1.2;
      mountRef.current.appendChild(renderer.domElement);

      // ── Camera ────────────────────────────────────────────────────────────
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.z = 20;

      // ── Post-processing (EffectComposer pipeline) ─────────────────────────
      // After CDN scripts load, Three.js examples extend THREE namespace:
      // THREE.EffectComposer, THREE.RenderPass, THREE.UnrealBloomPass, THREE.FilmPass
      let composer: any = null;

      try {
        composer = new THREE.EffectComposer(renderer);

        // Base render pass
        const renderPass = new THREE.RenderPass(scene, camera);
        composer.addPass(renderPass);

        // Bloom pass: strength 1.4, radius 0.8, threshold 0.2
        const bloomPass = new THREE.UnrealBloomPass(
          new THREE.Vector2(window.innerWidth, window.innerHeight),
          1.4,   // strength
          0.8,   // radius
          0.2    // threshold
        );
        composer.addPass(bloomPass);

        // Film grain pass: noise intensity 0.25, no scanlines
        const filmPass = new THREE.FilmPass(
          0.25,  // noise intensity
          0.0,   // scanline intensity (disabled)
          648,   // scanline count (ignored when intensity is 0)
          false  // grayscale
        );
        filmPass.renderToScreen = true;
        composer.addPass(filmPass);
      } catch (e) {
        console.warn("[OnePiece] Post-processing unavailable, using raw renderer:", e);
        composer = null;
      }

      // ── Clock ─────────────────────────────────────────────────────────────
      const clock = new THREE.Clock();

      // ── Mouse parallax state ──────────────────────────────────────────────
      let targetX = 0;
      let targetY = 0;

      const onMouseMove = (e: MouseEvent) => {
        targetX = (e.clientX / window.innerWidth - 0.5) * 2;
        targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
      };
      window.addEventListener("mousemove", onMouseMove);

      // ── Resize handler ────────────────────────────────────────────────────
      const onResize = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        if (composer) composer.setSize(w, h);
      };
      window.addEventListener("resize", onResize);

      // ── Animate loop ──────────────────────────────────────────────────────
      let animFrameId: number;
      const animate = () => {
        animFrameId = requestAnimationFrame(animate);

        // Future arc scenes will hook into clock.getElapsedTime() and
        // targetX/targetY for parallax here

        if (composer) {
          composer.render();
        } else {
          renderer.render(scene, camera);
        }
      };
      animate();

      // ── Cleanup ref ───────────────────────────────────────────────────────
      (mountRef.current as any).__cleanup = () => {
        cancelAnimationFrame(animFrameId);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("resize", onResize);
        renderer.dispose();
        if (
          mountRef.current &&
          renderer.domElement.parentNode === mountRef.current
        ) {
          mountRef.current.removeChild(renderer.domElement);
        }
      };

      // ── Expose state globally for subsequent arc scene prompts ─────────────
      (window as any).__threejsState = {
        scene,
        camera,
        renderer,
        composer,
        clock,
        THREE,
        gsap: window.gsap,
        targetX: () => targetX,
        targetY: () => targetY,
      };

      console.log("[OnePiece] Foundation ready — Three.js r128, EffectComposer, GSAP loaded.");
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
        cursor: "none",
      }}
    />
  );
}
