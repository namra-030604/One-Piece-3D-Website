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

      // ── Scene & Renderer ──────────────────────────────────────────────────
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x050a1a);
      scene.fog = new THREE.FogExp2(0x050a1a, 0.008);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.toneMapping = THREE.ReinhardToneMapping;
      renderer.toneMappingExposure = 1.2;
      mountRef.current.appendChild(renderer.domElement);

      // ── Camera ────────────────────────────────────────────────────────────
      const camera = new THREE.PerspectiveCamera(
        75, window.innerWidth / window.innerHeight, 0.1, 1000
      );
      camera.position.set(0, 4, 20);

      // ── Post-processing ───────────────────────────────────────────────────
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

      // ══════════════════════════════════════════════════════════════════════
      // ── GRAND LINE INTRO SCENE ────────────────────────────────────────────
      // ══════════════════════════════════════════════════════════════════════

      // ── 1. Animated Ocean ─────────────────────────────────────────────────
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

      // ── 2. Star field (2000 points) ───────────────────────────────────────
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

      // ── 3. Spinning Gold Torus (Straw Hat ring) ───────────────────────────
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

      // ── 4. Lights ─────────────────────────────────────────────────────────
      const ambientLight = new THREE.AmbientLight(0x1a2a5a, 1.5);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xffcd00, 1);
      dirLight.position.set(5, 10, 5);
      scene.add(dirLight);

      const pointLight = new THREE.PointLight(0xd70000, 2, 30);
      pointLight.position.set(-5, 3, 0);
      scene.add(pointLight);

      // ── Clock & Parallax State ────────────────────────────────────────────
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

      // ── Resize ────────────────────────────────────────────────────────────
      const onResize = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        if (composer) composer.setSize(w, h);
      };
      window.addEventListener("resize", onResize);

      // ── Animate Loop ──────────────────────────────────────────────────────
      let animFrameId: number;
      const animate = () => {
        animFrameId = requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        // ─ Ocean wave displacement ──────────────────────────────
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

        // ─ Torus spin + float ───────────────────────────────────
        torus.rotation.y += 0.003;
        torus.rotation.x += 0.001;
        torus.position.y = 2 + Math.sin(t * 0.8) * 0.4;

        // ─ Slow star field rotation ─────────────────────────────
        stars.rotation.y += 0.0001;
        stars.rotation.x += 0.00005;

        // ─ Mouse parallax camera ────────────────────────────────
        camera.position.x += (baseCamX + targetX * parallaxStrength - camera.position.x) * 0.05;
        camera.position.y += (baseCamY + targetY * parallaxStrength - camera.position.y) * 0.05;
        camera.position.z = baseCamZ;
        camera.lookAt(0, 0, 0);

        // ─ Render ───────────────────────────────────────────────
        if (composer) {
          composer.render();
        } else {
          renderer.render(scene, camera);
        }
      };
      animate();

      // ── Cleanup ───────────────────────────────────────────────────────────
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
  );
}
