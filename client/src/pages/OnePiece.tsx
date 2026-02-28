import { useEffect, useRef } from "react";

declare global {
  interface Window {
    THREE: any;
    gsap: any;
    anime: any;
    barba: any;
  }
}

interface ArcData {
  title: string;
  tagline: string;
  color: string;
  bloom: [number, number, number];
  prompt: string;
}

const ARCS: ArcData[] = [
  {
    title: "SET SAIL",
    tagline: "The Grand Line awaits — click to begin",
    color: "#FFCD00",
    bloom: [0.8, 0.4, 0.5],
    prompt: "Click anywhere to set sail",
  },
  {
    title: "EAST BLUE",
    tagline: "Where it all began. A boy, a dream, a straw hat.",
    color: "#20B2AA",
    bloom: [0.3, 0.3, 0.7],
    prompt: "Click to continue the voyage",
  },
  {
    title: "ALABASTA",
    tagline: "A kingdom on the brink. Loyalty tested in the sands.",
    color: "#DAA520",
    bloom: [0.5, 0.3, 0.6],
    prompt: "Click to cross the desert",
  },
  {
    title: "SKYPIEA",
    tagline: "Above the clouds lies a golden city — and a god.",
    color: "#228B22",
    bloom: [0.6, 0.4, 0.55],
    prompt: "Click to ascend",
  },
  {
    title: "WATER 7",
    tagline: "A crew torn apart. A reckoning at Enies Lobby.",
    color: "#4169E1",
    bloom: [0.5, 0.3, 0.6],
    prompt: "Click to face the storm",
  },
  {
    title: "MARINEFORD",
    tagline: "The war that changed the world. Nothing was ever the same.",
    color: "#8B0000",
    bloom: [1.0, 0.5, 0.3],
    prompt: "Click to enter the war",
  },
  {
    title: "DRESSROSA",
    tagline: "Beneath the petals, a dictator's chains.",
    color: "#EE82EE",
    bloom: [0.6, 0.35, 0.55],
    prompt: "Click to shatter the cage",
  },
  {
    title: "WANO",
    tagline: "An isolated nation under the shogun's shadow.",
    color: "#DC143C",
    bloom: [0.7, 0.4, 0.4],
    prompt: "Click to ignite the dawn",
  },
];

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function OnePiece() {
  const mountRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const promptRef = useRef<HTMLSpanElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const creditsRef = useRef<HTMLDivElement>(null);
  const titleContainerRef = useRef<HTMLDivElement>(null);

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
        await loadScript("https://cdn.jsdelivr.net/npm/animejs@4/lib/anime.iife.min.js");
        await loadScript("https://cdn.jsdelivr.net/npm/@barba/core/dist/barba.umd.js");
        setupScene();
      } catch (err) {
        console.error("[OnePiece] Failed to load CDN scripts:", err);
      }
    };

    const setupScene = () => {
      if (!mountRef.current) return;

      const THREE = window.THREE;
      const gsap = window.gsap;
      const anime = window.anime;
      if (!THREE || !gsap) return;

      const splitTextToLetters = (el: HTMLElement, text: string) => {
        el.innerHTML = '';
        for (let i = 0; i < text.length; i++) {
          const span = document.createElement('span');
          span.className = 'letter';
          span.textContent = text[i] === ' ' ? '\u00A0' : text[i];
          el.appendChild(span);
        }
      };

      initializedRef.current = true;

      const isMobile = window.innerWidth < 768;
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const pc = (count: number) => isMobile ? Math.ceil(count * 0.25) : count;
      const oceanSeg = isMobile ? 40 : 60;
      const oceanSegHigh = isMobile ? 40 : 80;

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
      let bloomPass: any = null;
      try {
        composer = new THREE.EffectComposer(renderer);
        composer.addPass(new THREE.RenderPass(scene, camera));
        bloomPass = new THREE.UnrealBloomPass(
          new THREE.Vector2(window.innerWidth, window.innerHeight),
          ARCS[0].bloom[0], ARCS[0].bloom[1], ARCS[0].bloom[2]
        );
        composer.addPass(bloomPass);
        const filmPass = new THREE.FilmPass(0.25, 0.0, 648, false);
        filmPass.renderToScreen = true;
        composer.addPass(filmPass);
      } catch (e) {
        console.warn("[OnePiece] Post-processing unavailable:", e);
        composer = null;
      }

      const clock = new THREE.Clock();

      let currentArcIndex = 0;
      let isTransitioning = false;
      let showingCredits = false;
      let arcObjects: any[] = [];
      let arcAnimateFn: ((t: number) => void) | null = null;

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
        color: 0xffffff, size: 0.4, transparent: true, opacity: 0.85, sizeAttenuation: true,
      });
      const stars = new THREE.Points(starGeo, starMat);
      scene.add(stars);

      const clearScene = () => {
        for (const obj of arcObjects) {
          scene.remove(obj);
          obj.traverse?.((child: any) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) child.material.forEach((m: any) => m.dispose());
              else child.material.dispose();
            }
          });
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach((m: any) => m.dispose());
            else obj.material.dispose();
          }
        }
        arcObjects = [];
        arcAnimateFn = null;
        scene.fog = new THREE.FogExp2(0x050a1a, 0.008);
      };

      const addArcObject = (obj: any) => {
        arcObjects.push(obj);
        scene.add(obj);
      };

      // ══════════════════════════════════════════════════════════════════════
      // ── ARC 0: GRAND LINE ─────────────────────────────────────────────────
      // ══════════════════════════════════════════════════════════════════════

      const buildGrandLine = () => {
        scene.background = new THREE.Color(0x050a1a);
        scene.fog = null;

        const oceanGeo = new THREE.PlaneGeometry(200, 200, oceanSegHigh, oceanSegHigh);
        const oceanMat = new THREE.MeshPhongMaterial({
          color: 0x1a4a8a, shininess: 60, specular: 0x4488cc,
          side: THREE.DoubleSide, flatShading: true, transparent: true, opacity: 0.9,
        });
        const ocean = new THREE.Mesh(oceanGeo, oceanMat);
        ocean.rotation.x = -Math.PI / 2;
        ocean.position.y = -8;
        addArcObject(ocean);

        const posAttr = ocean.geometry.attributes.position;
        const origZ: number[] = [];
        for (let i = 0; i < posAttr.count; i++) origZ.push(posAttr.getZ(i));

        const torusGeo = new THREE.TorusGeometry(3, 0.3, 16, 100);
        const torusMat = new THREE.MeshStandardMaterial({
          color: 0xffcd00, emissive: 0xd70000, emissiveIntensity: 0.3,
          metalness: 0.7, roughness: 0.25,
        });
        const torus = new THREE.Mesh(torusGeo, torusMat);
        torus.position.set(0, 2, 0);
        addArcObject(torus);

        addArcObject(new THREE.AmbientLight(0x1a2a5a, 0.4));
        const dir = new THREE.DirectionalLight(0xffcd00, 0.8);
        dir.position.set(5, 10, 5);
        addArcObject(dir);
        const pt = new THREE.PointLight(0xd70000, 2, 30);
        pt.position.set(-5, 3, 0);
        addArcObject(pt);

        arcAnimateFn = (t: number) => {
          for (let i = 0; i < posAttr.count; i++) {
            const x = posAttr.getX(i);
            const y = posAttr.getY(i);
            posAttr.setZ(i, origZ[i] + Math.sin(x * 0.3 + t) * 1.2 + Math.cos(y * 0.3 + t * 0.8) * 0.8);
          }
          posAttr.needsUpdate = true;
          ocean.geometry.computeVertexNormals();
          torus.rotation.y += 0.003;
          torus.rotation.x += 0.001;
          torus.position.y = 2 + Math.sin(t * 0.8) * 0.4;
        };
      };

      // ══════════════════════════════════════════════════════════════════════
      // ── ARC 1: EAST BLUE ──────────────────────────────────────────────────
      // ══════════════════════════════════════════════════════════════════════

      const buildEastBlue = () => {
        scene.background = new THREE.Color(0x001a2e);
        scene.fog = new THREE.FogExp2(0x001a2e, 0.008);

        addArcObject(new THREE.AmbientLight(0x87ceeb, 0.4));
        const dir = new THREE.DirectionalLight(0xffffff, 0.8);
        dir.position.set(5, 10, 5);
        addArcObject(dir);
        const warmPt = new THREE.PointLight(0x20b2aa, 0.8, 40);
        warmPt.position.set(0, 5, 5);
        addArcObject(warmPt);

        const oceanGeo = new THREE.PlaneGeometry(200, 200, oceanSeg, oceanSeg);
        const oceanMat = new THREE.MeshPhongMaterial({
          color: 0x20b2aa, shininess: 80, specular: 0x87ceeb,
          side: THREE.DoubleSide, flatShading: true, transparent: true, opacity: 0.85,
        });
        const ocean = new THREE.Mesh(oceanGeo, oceanMat);
        ocean.rotation.x = -Math.PI / 2;
        ocean.position.y = -8;
        addArcObject(ocean);
        const posAttr = ocean.geometry.attributes.position;
        const origZ: number[] = [];
        for (let i = 0; i < posAttr.count; i++) origZ.push(posAttr.getZ(i));

        const islandGeo = new THREE.CylinderGeometry(3, 4, 2, 16);
        const islandMat = new THREE.MeshStandardMaterial({ color: 0x2e8b57, roughness: 0.8 });
        const island = new THREE.Mesh(islandGeo, islandMat);
        island.position.set(0, -7, 0);
        addArcObject(island);

        const trunkGeo = new THREE.CylinderGeometry(0.2, 0.25, 2.5, 8);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        const trunk1 = new THREE.Mesh(trunkGeo, trunkMat);
        trunk1.position.set(0, -5.5, 0);
        addArcObject(trunk1);
        const trunk2 = new THREE.Mesh(trunkGeo.clone(), trunkMat.clone());
        trunk2.position.set(1.5, -5.5, 1);
        addArcObject(trunk2);

        const treeGeo = new THREE.ConeGeometry(1.2, 3.5, 8);
        const treeMat = new THREE.MeshStandardMaterial({ color: 0x228b22 });
        const tree1 = new THREE.Mesh(treeGeo, treeMat);
        tree1.position.set(0, -3.5, 0);
        addArcObject(tree1);
        const tree2 = new THREE.Mesh(treeGeo.clone(), treeMat.clone());
        tree2.position.set(1.5, -3.5, 1);
        tree2.scale.set(0.8, 0.9, 0.8);
        addArcObject(tree2);

        const foamCount = pc(500);
        const foamGeo = new THREE.BufferGeometry();
        const foamPos = new Float32Array(foamCount * 3);
        for (let i = 0; i < foamCount; i++) {
          foamPos[i * 3] = (Math.random() - 0.5) * 80;
          foamPos[i * 3 + 1] = -7.5 + Math.random() * 1.0;
          foamPos[i * 3 + 2] = (Math.random() - 0.5) * 80;
        }
        foamGeo.setAttribute("position", new THREE.BufferAttribute(foamPos, 3));
        const foamMat = new THREE.PointsMaterial({
          color: 0xffffff, size: 0.2, transparent: true, opacity: 0.6,
        });
        const foam = new THREE.Points(foamGeo, foamMat);
        addArcObject(foam);

        arcAnimateFn = (t: number) => {
          for (let i = 0; i < posAttr.count; i++) {
            const x = posAttr.getX(i);
            const y = posAttr.getY(i);
            posAttr.setZ(i, origZ[i] + Math.sin(x * 0.2 + t * 0.7) * 0.3 + Math.cos(y * 0.25 + t * 0.5) * 0.2);
          }
          posAttr.needsUpdate = true;
          ocean.geometry.computeVertexNormals();
          tree1.rotation.z = Math.sin(t * 1.5) * 0.03;
          tree2.rotation.z = Math.sin(t * 1.3 + 1) * 0.025;
          const fp = foam.geometry.attributes.position;
          for (let i = 0; i < fp.count; i++) {
            fp.setX(i, fp.getX(i) - 0.03);
            if (fp.getX(i) < -40) fp.setX(i, 40);
          }
          fp.needsUpdate = true;
        };
      };

      // ══════════════════════════════════════════════════════════════════════
      // ── ARC 2: ALABASTA ───────────────────────────────────────────────────
      // ══════════════════════════════════════════════════════════════════════

      const buildAlabasta = () => {
        scene.background = new THREE.Color(0x1a0d00);
        scene.fog = new THREE.FogExp2(0x1a0d00, 0.012);

        addArcObject(new THREE.AmbientLight(0xc2956c, 0.4));
        const dir = new THREE.DirectionalLight(0xff8c00, 0.8);
        dir.position.set(0, 15, 5);
        addArcObject(dir);
        const hotPt = new THREE.PointLight(0xff8c00, 1.0, 30);
        hotPt.position.set(5, 8, 0);
        addArcObject(hotPt);

        const desertGeo = new THREE.PlaneGeometry(200, 200, oceanSeg, oceanSeg);
        const desertMat = new THREE.MeshStandardMaterial({
          color: 0xc2956c, roughness: 0.9, flatShading: true,
        });
        const desert = new THREE.Mesh(desertGeo, desertMat);
        desert.rotation.x = -Math.PI / 2;
        desert.position.y = -8;
        addArcObject(desert);
        const posAttr = desert.geometry.attributes.position;
        for (let i = 0; i < posAttr.count; i++) {
          posAttr.setZ(i, Math.random() * 1.5);
        }
        posAttr.needsUpdate = true;
        desert.geometry.computeVertexNormals();

        const pyrMat = new THREE.MeshStandardMaterial({ color: 0xdaa520, roughness: 0.6, metalness: 0.15 });
        const pyr1 = new THREE.Mesh(new THREE.ConeGeometry(5, 8, 4), pyrMat);
        pyr1.position.set(0, -2, -5);
        addArcObject(pyr1);
        const pyr2 = new THREE.Mesh(new THREE.ConeGeometry(3, 5, 4), pyrMat.clone());
        pyr2.position.set(8, -4, -8);
        addArcObject(pyr2);
        const pyr3 = new THREE.Mesh(new THREE.ConeGeometry(2.5, 4, 4), pyrMat.clone());
        pyr3.position.set(-7, -5, -10);
        addArcObject(pyr3);

        const sandCount = pc(1500);
        const sandGeo = new THREE.BufferGeometry();
        const sandPos = new Float32Array(sandCount * 3);
        for (let i = 0; i < sandCount; i++) {
          sandPos[i * 3] = (Math.random() - 0.5) * 80;
          sandPos[i * 3 + 1] = Math.random() * 20 - 5;
          sandPos[i * 3 + 2] = (Math.random() - 0.5) * 80;
        }
        sandGeo.setAttribute("position", new THREE.BufferAttribute(sandPos, 3));
        const sandMat = new THREE.PointsMaterial({
          color: 0xd2691e, size: 0.12, transparent: true, opacity: 0.5,
        });
        const sandStorm = new THREE.Points(sandGeo, sandMat);
        addArcObject(sandStorm);

        arcAnimateFn = (t: number) => {
          const sp = sandStorm.geometry.attributes.position;
          for (let i = 0; i < sp.count; i++) {
            sp.setX(i, sp.getX(i) + 0.06 + Math.sin(t * 2 + i * 0.3) * 0.02);
            sp.setY(i, sp.getY(i) + Math.sin(t + i) * 0.005);
            if (sp.getX(i) > 40) sp.setX(i, -40);
          }
          sp.needsUpdate = true;
        };
      };

      // ══════════════════════════════════════════════════════════════════════
      // ── ARC 3: SKYPIEA ────────────────────────────────────────────────────
      // ══════════════════════════════════════════════════════════════════════

      const buildSkypiea = () => {
        scene.background = new THREE.Color(0x0a1a0a);
        scene.fog = new THREE.FogExp2(0x0a1a0a, 0.006);

        addArcObject(new THREE.AmbientLight(0x228b22, 0.4));
        const sun = new THREE.SpotLight(0xffcd00, 2.5, 100, Math.PI / 4);
        sun.position.set(0, 30, 10);
        addArcObject(sun);
        const dir = new THREE.DirectionalLight(0xfffff0, 0.8);
        dir.position.set(-5, 15, 5);
        addArcObject(dir);

        const cloudPositions: any[] = [];
        for (let i = 0; i < 6; i++) {
          const cloudGroup = new THREE.Group();
          const cx = (Math.random() - 0.5) * 40;
          const cy = -6 + Math.random() * 12;
          const cz = (Math.random() - 0.5) * 30 - 5;
          for (let j = 0; j < 3; j++) {
            const r = 2 + Math.random() * 3;
            const cloudGeo = new THREE.SphereGeometry(r, 12, 12);
            const cloudMat = new THREE.MeshStandardMaterial({
              color: 0xfffacd, roughness: 1, transparent: true, opacity: 0.75,
            });
            const cloud = new THREE.Mesh(cloudGeo, cloudMat);
            cloud.position.set(j * 2 - 2 + Math.random(), Math.random() * 0.5, Math.random());
            cloud.scale.y = 0.4;
            cloudGroup.add(cloud);
          }
          cloudGroup.position.set(cx, cy, cz);
          addArcObject(cloudGroup);
          cloudPositions.push({ obj: cloudGroup, baseY: cy });
        }

        const ruinGroup = new THREE.Group();
        for (let i = 0; i < 7; i++) {
          const h = 2 + Math.random() * 4;
          const boxGeo = new THREE.BoxGeometry(1.2, h, 1.2);
          const boxMat = new THREE.MeshStandardMaterial({
            color: 0xdaa520, emissive: 0xffcd00, emissiveIntensity: 0.2, metalness: 0.5,
          });
          const box = new THREE.Mesh(boxGeo, boxMat);
          box.position.set((Math.random() - 0.5) * 10, -5 + h / 2, (Math.random() - 0.5) * 10);
          ruinGroup.add(box);
        }
        addArcObject(ruinGroup);

        const moteCount = pc(800);
        const moteGeo = new THREE.BufferGeometry();
        const motePos = new Float32Array(moteCount * 3);
        for (let i = 0; i < moteCount; i++) {
          motePos[i * 3] = (Math.random() - 0.5) * 50;
          motePos[i * 3 + 1] = Math.random() * 30 - 10;
          motePos[i * 3 + 2] = (Math.random() - 0.5) * 50;
        }
        moteGeo.setAttribute("position", new THREE.BufferAttribute(motePos, 3));
        const moteMat = new THREE.PointsMaterial({
          color: 0xf0e68c, size: 0.15, transparent: true, opacity: 0.7,
        });
        const motes = new THREE.Points(moteGeo, moteMat);
        addArcObject(motes);

        arcAnimateFn = (t: number) => {
          for (const cp of cloudPositions) {
            cp.obj.position.y = cp.baseY + Math.sin(t * 0.3 + cp.baseY) * 0.5;
          }
          ruinGroup.rotation.y = Math.sin(t * 0.15) * 0.08;
          const mp = motes.geometry.attributes.position;
          for (let i = 0; i < mp.count; i++) {
            mp.setY(i, mp.getY(i) + 0.02);
            mp.setX(i, mp.getX(i) + Math.sin(t * 0.4 + i * 0.1) * 0.005);
            if (mp.getY(i) > 20) mp.setY(i, -10);
          }
          mp.needsUpdate = true;
        };
      };

      // ══════════════════════════════════════════════════════════════════════
      // ── ARC 4: WATER 7 ────────────────────────────────────────────────────
      // ══════════════════════════════════════════════════════════════════════

      const buildWater7 = () => {
        scene.background = new THREE.Color(0x00050f);
        scene.fog = new THREE.FogExp2(0x00050f, 0.015);

        addArcObject(new THREE.AmbientLight(0x708090, 0.4));
        const dir = new THREE.DirectionalLight(0xb0c4de, 0.8);
        dir.position.set(0, 15, 5);
        addArcObject(dir);
        const stormPt = new THREE.PointLight(0x4169e1, 0.6, 30);
        stormPt.position.set(0, 10, 0);
        addArcObject(stormPt);

        const waterGeo = new THREE.PlaneGeometry(200, 200, oceanSeg, oceanSeg);
        const waterMat = new THREE.MeshPhongMaterial({
          color: 0x4169e1, shininess: 100, specular: 0xb0c4de,
          side: THREE.DoubleSide, flatShading: true, transparent: true, opacity: 0.85,
        });
        const water = new THREE.Mesh(waterGeo, waterMat);
        water.rotation.x = -Math.PI / 2;
        water.position.y = -8;
        addArcObject(water);
        const posAttr = water.geometry.attributes.position;
        const origZ: number[] = [];
        for (let i = 0; i < posAttr.count; i++) origZ.push(posAttr.getZ(i));

        const archMat = new THREE.MeshStandardMaterial({ color: 0x708090, roughness: 0.6 });
        for (let i = 0; i < 3; i++) {
          const archGeo = new THREE.TorusGeometry(3 + i * 0.5, 0.35, 8, 20, Math.PI);
          const arch = new THREE.Mesh(archGeo, archMat.clone());
          arch.position.set(-8 + i * 8, -2, -5 - i * 3);
          addArcObject(arch);
        }

        for (let i = 0; i < 5; i++) {
          const h = 6 + Math.random() * 5;
          const towerGeo = new THREE.CylinderGeometry(0.7, 1, h, 8);
          const towerMat = new THREE.MeshStandardMaterial({ color: 0x708090, roughness: 0.7 });
          const tower = new THREE.Mesh(towerGeo, towerMat);
          tower.position.set(-10 + i * 5, -8 + h / 2, -8 - Math.random() * 5);
          addArcObject(tower);
        }

        const rainCount = pc(300);
        const rainGeo = new THREE.BufferGeometry();
        const rainPos = new Float32Array(rainCount * 3);
        for (let i = 0; i < rainCount; i++) {
          rainPos[i * 3] = (Math.random() - 0.5) * 60;
          rainPos[i * 3 + 1] = Math.random() * 40 - 5;
          rainPos[i * 3 + 2] = (Math.random() - 0.5) * 60;
        }
        rainGeo.setAttribute("position", new THREE.BufferAttribute(rainPos, 3));
        const rainMat = new THREE.PointsMaterial({
          color: 0xb0c4de, size: 0.08, transparent: true, opacity: 0.7,
        });
        const rain = new THREE.Points(rainGeo, rainMat);
        addArcObject(rain);

        arcAnimateFn = (t: number) => {
          for (let i = 0; i < posAttr.count; i++) {
            const x = posAttr.getX(i);
            const y = posAttr.getY(i);
            posAttr.setZ(i, origZ[i] + Math.sin(x * 0.4 + t * 1.2) * 1.0 + Math.cos(y * 0.35 + t) * 0.7);
          }
          posAttr.needsUpdate = true;
          water.geometry.computeVertexNormals();
          const rp = rain.geometry.attributes.position;
          for (let i = 0; i < rp.count; i++) {
            rp.setY(i, rp.getY(i) - 0.4);
            if (rp.getY(i) < -8) rp.setY(i, 35);
          }
          rp.needsUpdate = true;
        };
      };

      // ══════════════════════════════════════════════════════════════════════
      // ── ARC 5: MARINEFORD ─────────────────────────────────────────────────
      // ══════════════════════════════════════════════════════════════════════

      const buildMarineford = () => {
        scene.background = new THREE.Color(0x0d0000);
        scene.fog = new THREE.FogExp2(0x0d0000, 0.02);

        addArcObject(new THREE.AmbientLight(0x1c1c1c, 0.6));
        const fire = new THREE.SpotLight(0xff4500, 2.0, 50, Math.PI / 3);
        fire.position.set(0, 15, 5);
        addArcObject(fire);
        for (let i = 0; i < 4; i++) {
          const rPt = new THREE.PointLight(0xd70000, 1.5, 20);
          rPt.position.set(
            (Math.random() - 0.5) * 25,
            Math.random() * 5 - 2,
            (Math.random() - 0.5) * 25
          );
          addArcObject(rPt);
        }

        const groundGeo = new THREE.PlaneGeometry(200, 200, 40, 40);
        const groundMat = new THREE.MeshStandardMaterial({
          color: 0x1c1c1c, roughness: 1, flatShading: true,
        });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -8;
        addArcObject(ground);
        const gPos = ground.geometry.attributes.position;
        for (let i = 0; i < gPos.count; i++) {
          gPos.setZ(i, (Math.random() - 0.5) * 3);
        }
        gPos.needsUpdate = true;
        ground.geometry.computeVertexNormals();

        for (let i = 0; i < 10; i++) {
          const s = 0.5 + Math.random() * 2;
          const debrisGeo = new THREE.BoxGeometry(s, s, s);
          const debrisMat = new THREE.MeshStandardMaterial({
            color: 0x2f2f2f, emissive: 0x8b0000, emissiveIntensity: 0.3,
          });
          const debris = new THREE.Mesh(debrisGeo, debrisMat);
          debris.position.set(
            (Math.random() - 0.5) * 30,
            -7 + Math.random() * 4,
            (Math.random() - 0.5) * 30
          );
          debris.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random());
          addArcObject(debris);
        }

        const emberCount = pc(2000);
        const emberGeo = new THREE.BufferGeometry();
        const emberPos = new Float32Array(emberCount * 3);
        for (let i = 0; i < emberCount; i++) {
          emberPos[i * 3] = (Math.random() - 0.5) * 60;
          emberPos[i * 3 + 1] = Math.random() * 20 - 8;
          emberPos[i * 3 + 2] = (Math.random() - 0.5) * 60;
        }
        emberGeo.setAttribute("position", new THREE.BufferAttribute(emberPos, 3));
        const emberMat = new THREE.PointsMaterial({
          color: 0xff4500, size: 0.15, transparent: true, opacity: 0.8,
        });
        const embers = new THREE.Points(emberGeo, emberMat);
        addArcObject(embers);

        const smokeCount = pc(500);
        const smokeGeo = new THREE.BufferGeometry();
        const smokePos = new Float32Array(smokeCount * 3);
        for (let i = 0; i < smokeCount; i++) {
          smokePos[i * 3] = (Math.random() - 0.5) * 50;
          smokePos[i * 3 + 1] = Math.random() * 15 - 5;
          smokePos[i * 3 + 2] = (Math.random() - 0.5) * 50;
        }
        smokeGeo.setAttribute("position", new THREE.BufferAttribute(smokePos, 3));
        const smokeMat = new THREE.PointsMaterial({
          color: 0x555555, size: 0.4, transparent: true, opacity: 0.3,
        });
        const smoke = new THREE.Points(smokeGeo, smokeMat);
        addArcObject(smoke);

        arcAnimateFn = (t: number) => {
          const ep = embers.geometry.attributes.position;
          for (let i = 0; i < ep.count; i++) {
            ep.setY(i, ep.getY(i) + 0.04 + Math.random() * 0.02);
            ep.setX(i, ep.getX(i) + Math.sin(t + i * 0.5) * 0.01);
            if (ep.getY(i) > 15) ep.setY(i, -8);
          }
          ep.needsUpdate = true;
          const sp = smoke.geometry.attributes.position;
          for (let i = 0; i < sp.count; i++) {
            sp.setY(i, sp.getY(i) + 0.02);
            sp.setX(i, sp.getX(i) + Math.sin(t * 0.3 + i) * 0.008);
            sp.setZ(i, sp.getZ(i) + Math.cos(t * 0.3 + i) * 0.008);
            if (sp.getY(i) > 15) {
              sp.setY(i, -5);
              sp.setX(i, (Math.random() - 0.5) * 50);
              sp.setZ(i, (Math.random() - 0.5) * 50);
            }
          }
          sp.needsUpdate = true;
        };
      };

      // ══════════════════════════════════════════════════════════════════════
      // ── ARC 6: DRESSROSA ──────────────────────────────────────────────────
      // ══════════════════════════════════════════════════════════════════════

      const buildDressrosa = () => {
        scene.background = new THREE.Color(0x0f0015);
        scene.fog = new THREE.FogExp2(0x0f0015, 0.01);

        addArcObject(new THREE.AmbientLight(0xee82ee, 0.4));
        const dir = new THREE.DirectionalLight(0xffcd00, 0.8);
        dir.position.set(5, 12, 5);
        addArcObject(dir);
        const pinkPt = new THREE.PointLight(0xff69b4, 1.5, 35);
        pinkPt.position.set(0, 5, 0);
        addArcObject(pinkPt);
        const purplePt = new THREE.PointLight(0x9370db, 0.8, 25);
        purplePt.position.set(-5, 3, 5);
        addArcObject(purplePt);

        const coloGeo = new THREE.TorusGeometry(6, 1, 12, 40);
        const coloMat = new THREE.MeshStandardMaterial({
          color: 0xee82ee, roughness: 0.5, metalness: 0.3,
          emissive: 0xee82ee, emissiveIntensity: 0.1,
        });
        const colosseum = new THREE.Mesh(coloGeo, coloMat);
        colosseum.position.set(0, -4, -5);
        colosseum.rotation.x = Math.PI / 2;
        addArcObject(colosseum);

        const cageGeo = new THREE.IcosahedronGeometry(14, 1);
        const cageMat = new THREE.MeshStandardMaterial({
          color: 0x9370db, wireframe: true, transparent: true, opacity: 0.2,
          emissive: 0x9370db, emissiveIntensity: 0.1,
        });
        const cage = new THREE.Mesh(cageGeo, cageMat);
        cage.position.set(0, 2, -5);
        addArcObject(cage);

        const petalCount = pc(2500);
        const petalGeo = new THREE.BufferGeometry();
        const petalPos = new Float32Array(petalCount * 3);
        for (let i = 0; i < petalCount; i++) {
          petalPos[i * 3] = (Math.random() - 0.5) * 70;
          petalPos[i * 3 + 1] = Math.random() * 35 - 10;
          petalPos[i * 3 + 2] = (Math.random() - 0.5) * 70;
        }
        petalGeo.setAttribute("position", new THREE.BufferAttribute(petalPos, 3));
        const petalMat = new THREE.PointsMaterial({
          color: 0xff69b4, size: 0.18, transparent: true, opacity: 0.7,
        });
        const petals = new THREE.Points(petalGeo, petalMat);
        addArcObject(petals);

        arcAnimateFn = (t: number) => {
          cage.rotation.y += 0.002;
          cage.rotation.x += 0.001;
          colosseum.rotation.z = Math.sin(t * 0.2) * 0.05;
          const pp = petals.geometry.attributes.position;
          for (let i = 0; i < pp.count; i++) {
            pp.setY(i, pp.getY(i) - 0.025);
            pp.setX(i, pp.getX(i) + Math.sin(t * 0.7 + i * 0.08) * 0.015);
            pp.setZ(i, pp.getZ(i) + Math.cos(t * 0.5 + i * 0.06) * 0.01);
            if (pp.getY(i) < -10) pp.setY(i, 25);
          }
          pp.needsUpdate = true;
          petals.rotation.y += 0.0003;
        };
      };

      // ══════════════════════════════════════════════════════════════════════
      // ── ARC 7: WANO ───────────────────────────────────────────────────────
      // ══════════════════════════════════════════════════════════════════════

      const buildWano = () => {
        scene.background = new THREE.Color(0x000000);
        scene.fog = new THREE.FogExp2(0x000000, 0.018);

        addArcObject(new THREE.AmbientLight(0x2f4f4f, 0.6));
        const bloodDir = new THREE.DirectionalLight(0xdc143c, 1.2);
        bloodDir.position.set(5, 10, 5);
        addArcObject(bloodDir);
        const moonPt = new THREE.PointLight(0xffffff, 1.0, 40);
        moonPt.position.set(-10, 15, 5);
        addArcObject(moonPt);
        const firePt = new THREE.PointLight(0xdc143c, 0.6, 20);
        firePt.position.set(3, 0, 5);
        addArcObject(firePt);

        const pagodaGroup = new THREE.Group();
        for (let i = 0; i < 5; i++) {
          const tierW = 3.5 - i * 0.55;
          const tierGeo = new THREE.BoxGeometry(tierW, 1.3, tierW);
          const tierMat = new THREE.MeshStandardMaterial({
            color: i % 2 === 0 ? 0xdc143c : 0xf5f5dc, roughness: 0.6,
            emissive: i % 2 === 0 ? 0xdc143c : 0x000000,
            emissiveIntensity: i % 2 === 0 ? 0.1 : 0,
          });
          const tier = new THREE.Mesh(tierGeo, tierMat);
          tier.position.y = i * 1.6;
          pagodaGroup.add(tier);
        }
        const roofGeo = new THREE.ConeGeometry(1.5, 2, 4);
        const roofMat = new THREE.MeshStandardMaterial({ color: 0xdc143c });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = 5 * 1.6 + 0.5;
        pagodaGroup.add(roof);
        pagodaGroup.position.set(0, -5, -5);
        addArcObject(pagodaGroup);

        const toriiGroup = new THREE.Group();
        const toriiMat = new THREE.MeshStandardMaterial({
          color: 0xf5f5dc, roughness: 0.5,
          emissive: 0xdc143c, emissiveIntensity: 0.05,
        });
        const pillarGeo = new THREE.CylinderGeometry(0.2, 0.2, 7, 8);
        const lP = new THREE.Mesh(pillarGeo, toriiMat);
        lP.position.set(-3, -2.5, 3);
        toriiGroup.add(lP);
        const rP = new THREE.Mesh(pillarGeo.clone(), toriiMat.clone());
        rP.position.set(3, -2.5, 3);
        toriiGroup.add(rP);
        const archGeo = new THREE.TorusGeometry(3.2, 0.2, 8, 20, Math.PI);
        const archTop = new THREE.Mesh(archGeo, toriiMat.clone());
        archTop.position.set(0, 1, 3);
        toriiGroup.add(archTop);
        const beamGeo = new THREE.BoxGeometry(8, 0.25, 0.25);
        const beam = new THREE.Mesh(beamGeo, toriiMat.clone());
        beam.position.set(0, -0.3, 3);
        toriiGroup.add(beam);
        addArcObject(toriiGroup);

        for (let i = 0; i < 4; i++) {
          const h = 8 + Math.random() * 8;
          const w = 5 + Math.random() * 4;
          const mtGeo = new THREE.BoxGeometry(w, h, w * 0.7);
          const mtMat = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e, roughness: 0.95, flatShading: true,
          });
          const mt = new THREE.Mesh(mtGeo, mtMat);
          mt.position.set(-18 + i * 12, -8 + h / 2 - 2, -20 - Math.random() * 10);
          addArcObject(mt);
        }

        const blossomCount = pc(3000);
        const blossomGeo = new THREE.BufferGeometry();
        const blossomPos = new Float32Array(blossomCount * 3);
        for (let i = 0; i < blossomCount; i++) {
          blossomPos[i * 3] = (Math.random() - 0.5) * 60;
          blossomPos[i * 3 + 1] = Math.random() * 30 - 5;
          blossomPos[i * 3 + 2] = (Math.random() - 0.5) * 60;
        }
        blossomGeo.setAttribute("position", new THREE.BufferAttribute(blossomPos, 3));
        const blossomMat = new THREE.PointsMaterial({
          color: 0xffb7c5, size: 0.15, transparent: true, opacity: 0.8,
        });
        const blossoms = new THREE.Points(blossomGeo, blossomMat);
        addArcObject(blossoms);

        arcAnimateFn = (t: number) => {
          pagodaGroup.rotation.y = Math.sin(t * 0.15) * 0.04;
          const bp = blossoms.geometry.attributes.position;
          for (let i = 0; i < bp.count; i++) {
            bp.setX(i, bp.getX(i) + 0.04 + Math.sin(t * 0.5 + i * 0.04) * 0.012);
            bp.setY(i, bp.getY(i) - 0.01);
            if (bp.getX(i) > 30) bp.setX(i, -30);
            if (bp.getY(i) < -5) bp.setY(i, 25);
          }
          bp.needsUpdate = true;
        };
      };

      // ══════════════════════════════════════════════════════════════════════
      // ── CREDITS SCENE ─────────────────────────────────────────────────────
      // ══════════════════════════════════════════════════════════════════════

      const buildCreditsScene = () => {
        scene.background = new THREE.Color(0x000000);
        scene.fog = new THREE.FogExp2(0x000000, 0.003);

        addArcObject(new THREE.AmbientLight(0x222244, 0.5));

        const creditStarCount = pc(500);
        const csGeo = new THREE.BufferGeometry();
        const csPos = new Float32Array(creditStarCount * 3);
        for (let i = 0; i < creditStarCount; i++) {
          csPos[i * 3] = (Math.random() - 0.5) * 100;
          csPos[i * 3 + 1] = (Math.random() - 0.5) * 60;
          csPos[i * 3 + 2] = (Math.random() - 0.5) * 100;
        }
        csGeo.setAttribute("position", new THREE.BufferAttribute(csPos, 3));
        const csMat = new THREE.PointsMaterial({
          color: 0xffffff, size: 0.3, transparent: true, opacity: 0.9,
        });
        const creditStars = new THREE.Points(csGeo, csMat);
        addArcObject(creditStars);

        arcAnimateFn = (t: number) => {
          const cp = creditStars.geometry.attributes.position;
          for (let i = 0; i < cp.count; i++) {
            cp.setX(i, cp.getX(i) + Math.sin(t * 0.1 + i * 0.2) * 0.003);
            cp.setY(i, cp.getY(i) + Math.cos(t * 0.08 + i * 0.15) * 0.002);
          }
          cp.needsUpdate = true;
        };
      };

      // ══════════════════════════════════════════════════════════════════════
      // ── LOAD ARC SCENE ────────────────────────────────────────────────────
      // ══════════════════════════════════════════════════════════════════════

      const loadArcScene = (index: number) => {
        clearScene();
        switch (index) {
          case 0: buildGrandLine(); break;
          case 1: buildEastBlue(); break;
          case 2: buildAlabasta(); break;
          case 3: buildSkypiea(); break;
          case 4: buildWater7(); break;
          case 5: buildMarineford(); break;
          case 6: buildDressrosa(); break;
          case 7: buildWano(); break;
          default: buildGrandLine(); break;
        }
        console.log(`[OnePiece] Loaded arc ${index}: ${ARCS[index].title}`);
      };

      // ══════════════════════════════════════════════════════════════════════
      // ── UI UPDATE ─────────────────────────────────────────────────────────
      // ══════════════════════════════════════════════════════════════════════

      const fadeOutUI = () => {
        const titleContainer = titleContainerRef.current;
        gsap.to(titleContainer, { y: -30, opacity: 0, duration: 0.4, ease: "power2.in" });
      };

      const updateUI = (index: number) => {
        const arc = ARCS[index];
        const titleEl = titleRef.current;
        const tagEl = taglineRef.current;
        const promptEl = promptRef.current;
        const dotsEl = dotsRef.current;
        const titleContainer = titleContainerRef.current;
        const scanLine = document.getElementById("scan-line-react");

        if (bloomPass) {
          gsap.to(bloomPass, {
            strength: arc.bloom[0],
            radius: arc.bloom[1],
            threshold: arc.bloom[2],
            duration: 1.0,
            ease: "power2.out",
          });
        }

        if (dotsEl) {
          const dots = dotsEl.querySelectorAll("[data-dot]");
          dots.forEach((dot: any, i: number) => {
            const isActive = i === index;
            dot.classList.remove("ripple");
            dot.style.backgroundColor = isActive ? arc.color : "transparent";
            dot.style.borderColor = arc.color;
            dot.style.boxShadow = isActive
              ? `0 0 8px ${hexToRgba(arc.color, 0.7)}, 0 0 16px ${hexToRgba(arc.color, 0.35)}`
              : "none";
            dot.style.width = isActive ? "12px" : "10px";
            dot.style.height = isActive ? "12px" : "10px";
          });
          void (dots[index] as HTMLElement).offsetWidth;
          (dots[index] as HTMLElement).classList.add("ripple");
          gsap.fromTo(dots[index], { scale: 1 }, { scale: 1.6, duration: 0.3, ease: "elastic.out(1, 0.4)", yoyo: true, repeat: 1 });
        }

        if (titleEl) {
          titleEl.textContent = arc.title;
          titleEl.style.color = arc.color;
          titleEl.style.textShadow = `0 0 20px ${hexToRgba(arc.color, 0.6)}, 0 0 40px ${hexToRgba(arc.color, 0.3)}, 0 0 80px ${hexToRgba(arc.color, 0.15)}`;
        }
        if (tagEl) tagEl.textContent = arc.tagline;
        if (promptEl) promptEl.textContent = arc.prompt;

        gsap.set(titleContainer, { opacity: 1, y: 0 });
        gsap.fromTo(titleEl,
          { opacity: 0, scale: 1.4, y: 30 },
          { opacity: 1, scale: 1, y: 0, duration: 0.9, ease: "back.out(1.7)" }
        );
        gsap.fromTo(tagEl,
          { opacity: 0, letterSpacing: "0.4em" },
          { opacity: 1, letterSpacing: "0.1em", duration: 1.1, ease: "power2.out", delay: 0.2 }
        );
        if (scanLine) {
          gsap.fromTo(scanLine,
            { x: "-100%", opacity: 1 },
            { x: "100%", opacity: 0, duration: 0.8, ease: "power2.inOut" }
          );
        }
      };

      // ══════════════════════════════════════════════════════════════════════
      // ── CREDITS UI ────────────────────────────────────────────────────────
      // ══════════════════════════════════════════════════════════════════════

      const showCreditsUI = () => {
        const titleContainer = titleContainerRef.current;
        const dotsEl = dotsRef.current;
        const creditsEl = creditsRef.current;
        const promptEl = promptRef.current;

        if (bloomPass) {
          gsap.to(bloomPass, {
            strength: 0.8, radius: 0.5, threshold: 0.3,
            duration: 1.0, ease: "power2.out",
          });
        }

        gsap.to(titleContainer, {
          y: -30, opacity: 0, duration: 0.5, ease: "power2.in",
          onComplete: () => {
            if (titleContainer) titleContainer.style.display = "none";
          }
        });

        if (dotsEl) {
          gsap.to(dotsEl, { opacity: 0, duration: 0.5 });
        }

        if (promptEl?.parentElement) {
          gsap.to(promptEl.parentElement, { opacity: 0, duration: 0.5 });
        }

        if (creditsEl) {
          creditsEl.style.display = "flex";
          const lines = creditsEl.querySelectorAll("[data-credit-line]");
          lines.forEach((line: any) => {
            gsap.set(line, { opacity: 0, y: 20 });
          });
          lines.forEach((line: any, i: number) => {
            gsap.to(line, {
              opacity: 1, y: 0,
              duration: 0.8,
              delay: i * 0.6,
              ease: "power2.out",
            });
          });
        }
      };

      const hideCreditsUI = () => {
        const titleContainer = titleContainerRef.current;
        const dotsEl = dotsRef.current;
        const creditsEl = creditsRef.current;
        const promptEl = promptRef.current;

        if (creditsEl) {
          gsap.to(creditsEl, {
            opacity: 0, duration: 0.5,
            onComplete: () => {
              creditsEl.style.display = "none";
              gsap.set(creditsEl, { opacity: 1 });
            }
          });
        }

        if (titleContainer) {
          titleContainer.style.display = "block";
          gsap.set(titleContainer, { y: 0, opacity: 1 });
        }

        if (dotsEl) {
          gsap.to(dotsEl, { opacity: 1, duration: 0.5 });
        }

        if (promptEl?.parentElement) {
          gsap.to(promptEl.parentElement, { opacity: 1, duration: 0.5 });
        }
      };

      // ══════════════════════════════════════════════════════════════════════
      // ── NAVIGATION LOGIC ──────────────────────────────────────────────────
      // ══════════════════════════════════════════════════════════════════════

      const startZoomEffects = () => {
        fadeOutUI();
        renderer.domElement.style.transition = "filter 0.3s ease";
        renderer.domElement.style.filter = "blur(4px)";
        gsap.to(camTilt, { value: 0.12, duration: 0.7, ease: "power2.inOut" });
        gsap.to(camTilt, { value: 0, duration: 0.7, delay: 0.7, ease: "power2.inOut" });
        const flashEl = document.getElementById("flash-overlay-react");
        if (flashEl) {
          gsap.to(flashEl, { opacity: 0.5, duration: 0.2, delay: 0.5 });
          gsap.to(flashEl, { opacity: 0, duration: 0.2, delay: 0.7 });
        }
      };

      const endZoomEffects = () => {
        renderer.domElement.style.filter = "blur(0px)";
        camTilt.value = 0;
      };

      const navigateForward = () => {
        if (isTransitioning) return;
        isTransitioning = true;

        if (showingCredits) {
          if (prefersReducedMotion) {
            clearScene();
            loadArcScene(0);
            camera.position.z = 20;
            currentArcIndex = 0;
            showingCredits = false;
            hideCreditsUI();
            updateUI(0);
            isTransitioning = false;
          } else {
            startZoomEffects();
            gsap.to(camera.position, {
              z: camera.position.z + 30,
              duration: 1.4,
              ease: "power3.inOut",
              onComplete: () => {
                endZoomEffects();
                clearScene();
                loadArcScene(0);
                camera.position.z = 20;
                currentArcIndex = 0;
                showingCredits = false;
                hideCreditsUI();
                updateUI(0);
                isTransitioning = false;
              },
            });
          }
          return;
        }

        if (currentArcIndex === 7) {
          if (prefersReducedMotion) {
            clearScene();
            buildCreditsScene();
            showingCredits = true;
            showCreditsUI();
            isTransitioning = false;
          } else {
            startZoomEffects();
            gsap.to(camera.position, {
              z: camera.position.z - 30,
              duration: 1.4,
              ease: "power3.inOut",
              onComplete: () => {
                endZoomEffects();
                clearScene();
                buildCreditsScene();
                camera.position.z = 20;
                showingCredits = true;
                showCreditsUI();
                isTransitioning = false;
              },
            });
          }
          return;
        }

        const nextIndex = currentArcIndex + 1;
        if (prefersReducedMotion) {
          loadArcScene(nextIndex);
          camera.position.z = 20;
          currentArcIndex = nextIndex;
          updateUI(nextIndex);
          isTransitioning = false;
        } else {
          startZoomEffects();
          gsap.to(camera.position, {
            z: camera.position.z - 30,
            duration: 1.4,
            ease: "power3.inOut",
            onComplete: () => {
              endZoomEffects();
              loadArcScene(nextIndex);
              camera.position.z = 20;
              currentArcIndex = nextIndex;
              updateUI(nextIndex);
              isTransitioning = false;
            },
          });
        }
      };

      const navigateBack = () => {
        if (isTransitioning) return;
        if (showingCredits) {
          isTransitioning = true;
          if (prefersReducedMotion) {
            clearScene();
            loadArcScene(7);
            camera.position.z = 20;
            showingCredits = false;
            hideCreditsUI();
            updateUI(7);
            currentArcIndex = 7;
            isTransitioning = false;
          } else {
            startZoomEffects();
            gsap.to(camera.position, {
              z: camera.position.z + 30,
              duration: 1.4,
              ease: "power3.inOut",
              onComplete: () => {
                endZoomEffects();
                clearScene();
                loadArcScene(7);
                camera.position.z = 20;
                showingCredits = false;
                hideCreditsUI();
                updateUI(7);
                currentArcIndex = 7;
                isTransitioning = false;
              },
            });
          }
          return;
        }
        if (currentArcIndex <= 0) return;
        isTransitioning = true;
        const prevIndex = currentArcIndex - 1;
        if (prefersReducedMotion) {
          loadArcScene(prevIndex);
          camera.position.z = 20;
          currentArcIndex = prevIndex;
          updateUI(prevIndex);
          isTransitioning = false;
        } else {
          startZoomEffects();
          gsap.to(camera.position, {
            z: camera.position.z + 30,
            duration: 1.4,
            ease: "power3.inOut",
            onComplete: () => {
              endZoomEffects();
              loadArcScene(prevIndex);
              camera.position.z = 20;
              currentArcIndex = prevIndex;
              updateUI(prevIndex);
              isTransitioning = false;
            },
          });
        }
      };

      // ══════════════════════════════════════════════════════════════════════
      // ── INPUT HANDLERS ────────────────────────────────────────────────────
      // ══════════════════════════════════════════════════════════════════════

      const onInteract = (e: Event) => {
        const target = e.target as HTMLElement;
        if (target.closest("[data-credits-link]")) return;
        navigateForward();
      };

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === " " || e.key === "ArrowRight") {
          e.preventDefault();
          navigateForward();
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          navigateBack();
        }
      };

      if (isMobile) {
        window.addEventListener("touchstart", onInteract, { passive: true });
      } else {
        window.addEventListener("click", onInteract);
      }
      window.addEventListener("keydown", onKeyDown);

      // ══════════════════════════════════════════════════════════════════════
      // ── MOUSE PARALLAX ────────────────────────────────────────────────────
      // ══════════════════════════════════════════════════════════════════════

      let targetX = 0;
      let targetY = 0;
      const baseCamY = 5;
      const parallaxStrength = 3;

      const onMouseMove = (e: MouseEvent) => {
        targetX = (e.clientX / window.innerWidth - 0.5) * 2;
        targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
        const vignetteEl = document.querySelector("[data-testid='vignette-overlay']") as HTMLElement;
        if (vignetteEl) {
          const vx = 50 + targetX * 10;
          const vy = 50 - targetY * 10;
          vignetteEl.style.background = `radial-gradient(ellipse at ${vx}% ${vy}%, transparent 40%, rgba(5,10,26,0.5) 70%, rgba(5,10,26,0.9) 100%)`;
        }
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

      // ══════════════════════════════════════════════════════════════════════
      // ── ANIMATE LOOP ──────────────────────────────────────────────────────
      // ══════════════════════════════════════════════════════════════════════

      const camTilt = { value: 0 };

      let animFrameId: number;
      const animate = () => {
        animFrameId = requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        stars.rotation.y += 0.0001;
        stars.rotation.x += 0.00005;

        if (arcAnimateFn) arcAnimateFn(t);

        for (let ao = 0; ao < arcObjects.length; ao++) {
          const aobj = arcObjects[ao];
          if (aobj.isMesh || aobj.isGroup) {
            aobj.scale.setScalar(1 + Math.sin(t * 1.2) * 0.025);
          }
          if (aobj.isPoints) {
            const wp = aobj.geometry.attributes.position;
            for (let wi = 0; wi < wp.count; wi++) {
              wp.array[wi * 3] += Math.sin(t + wi * 0.1) * 0.003;
            }
            wp.needsUpdate = true;
          }
        }

        if (!isTransitioning) {
          const idleX = Math.sin(t * 0.08) * 3;
          const idleY = baseCamY + Math.sin(t * 0.15) * 0.8;
          camera.position.x += (idleX + targetX * parallaxStrength - camera.position.x) * 0.05;
          camera.position.y += (idleY + targetY * parallaxStrength - camera.position.y) * 0.05;
        }
        camera.lookAt(0, 0, 0);
        camera.rotation.x += camTilt.value;

        if (composer) {
          composer.render();
        } else {
          renderer.render(scene, camera);
        }
      };

      loadArcScene(0);
      animate();

      (mountRef.current as any).__cleanup = () => {
        cancelAnimationFrame(animFrameId);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("resize", onResize);
        window.removeEventListener("keydown", onKeyDown);
        if (isMobile) {
          window.removeEventListener("touchstart", onInteract);
        } else {
          window.removeEventListener("click", onInteract);
        }
        clearScene();
        scene.traverse((obj: any) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach((m: any) => m.dispose());
            else obj.material.dispose();
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
        scene, camera, renderer, composer, clock, THREE, gsap,
        stars, bloomPass,
        getCurrentArc: () => currentArcIndex,
        isCredits: () => showingCredits,
        loadArcScene, updateUI, clearScene,
        navigateForward, navigateBack,
      };

      console.log("[OnePiece] Arc navigation system ready.");
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
      <div
        ref={mountRef}
        data-testid="threejs-canvas-mount"
        style={{
          position: "fixed",
          top: 0, left: 0,
          width: "100vw", height: "100vh",
          zIndex: 0,
          background: "#050a1a",
          overflow: "hidden",
        }}
      />

      <div
        data-testid="vignette-overlay"
        style={{
          position: "fixed",
          top: 0, left: 0,
          width: "100vw", height: "100vh",
          zIndex: 2,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(5,10,26,0.5) 70%, rgba(5,10,26,0.9) 100%)",
        }}
      />

      <div
        id="flash-overlay-react"
        data-testid="flash-overlay"
        style={{
          position: "fixed",
          top: 0, left: 0,
          width: "100vw", height: "100vh",
          background: "white",
          opacity: 0,
          zIndex: 999,
          pointerEvents: "none",
        }}
      />

      <div
        ref={titleContainerRef}
        data-testid="arc-title-container"
        style={{
          position: "fixed",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 10,
          textAlign: "center",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <h1
          ref={titleRef}
          data-testid="arc-title"
          style={{
            fontFamily: "'Pirata One', cursive",
            fontSize: "clamp(3rem, 8vw, 6rem)",
            color: ARCS[0].color,
            margin: 0,
            lineHeight: 1.1,
            textShadow: `0 0 20px ${hexToRgba(ARCS[0].color, 0.6)}, 0 0 40px ${hexToRgba(ARCS[0].color, 0.3)}, 0 0 80px ${hexToRgba(ARCS[0].color, 0.15)}`,
            letterSpacing: "0.04em",
          }}
        >
          {ARCS[0].title}
        </h1>
        <p
          ref={taglineRef}
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
          {ARCS[0].tagline}
        </p>
        <div
          id="scan-line-react"
          data-testid="scan-line"
          style={{
            position: "absolute",
            left: 0, top: "50%",
            width: "100%", height: "2px",
            background: "#FFCD00",
            opacity: 0,
            pointerEvents: "none",
          }}
        />
      </div>

      <div
        ref={creditsRef}
        data-testid="credits-container"
        style={{
          position: "fixed",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 10,
          textAlign: "center",
          display: "none",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.2rem",
          userSelect: "none",
        }}
      >
        <div data-credit-line data-testid="credits-title" style={{
          fontFamily: "'Pirata One', cursive",
          fontSize: "2rem",
          color: "#FFCD00",
          textShadow: "0 0 20px rgba(255,205,0,0.5), 0 0 40px rgba(255,205,0,0.25)",
        }}>
          The Adventure Continues...
        </div>
        <div data-credit-line data-testid="credits-author" style={{
          fontFamily: "'Cinzel', serif",
          fontSize: "1.2rem",
          color: "#62C3F8",
          textShadow: "0 0 12px rgba(98,195,248,0.3)",
        }}>
          Built by [Your Name]
        </div>
        <div data-credit-line data-testid="credits-tech" style={{
          fontFamily: "'Cinzel', serif",
          fontSize: "0.9rem",
          color: "#888",
          letterSpacing: "0.1em",
        }}>
          Three.js · GSAP · WebGL · Replit
        </div>
        <a
          data-credit-line
          data-credits-link
          data-testid="credits-portfolio-link"
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: "'Pirata One', cursive",
            fontSize: "1rem",
            color: "#D70000",
            textDecoration: "none",
            pointerEvents: "auto",
            textShadow: "0 0 10px rgba(215,0,0,0.3)",
            transition: "text-shadow 0.3s ease, color 0.3s ease",
            marginTop: "0.5rem",
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.textShadow = "0 0 15px rgba(215,0,0,0.7), 0 0 30px rgba(215,0,0,0.4), 0 0 50px rgba(215,0,0,0.2)";
            (e.target as HTMLElement).style.color = "#FF2020";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.textShadow = "0 0 10px rgba(215,0,0,0.3)";
            (e.target as HTMLElement).style.color = "#D70000";
          }}
        >
          View My Portfolio →
        </a>
      </div>

      <div
        ref={dotsRef}
        data-testid="progress-dots"
        style={{
          position: "fixed",
          bottom: "2rem", right: "2rem",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          alignItems: "center",
          pointerEvents: "none",
        }}
      >
        {ARCS.map((arc, i) => (
          <div
            key={arc.title}
            data-dot
            data-testid={`progress-dot-${i}`}
            title={arc.title}
            style={{
              width: i === 0 ? "12px" : "10px",
              height: i === 0 ? "12px" : "10px",
              borderRadius: "50%",
              border: `1.5px solid ${ARCS[0].color}`,
              backgroundColor: i === 0 ? ARCS[0].color : "transparent",
              boxShadow: i === 0
                ? `0 0 8px ${hexToRgba(ARCS[0].color, 0.7)}, 0 0 16px ${hexToRgba(ARCS[0].color, 0.35)}`
                : "none",
              transition: "all 0.4s ease",
            }}
          />
        ))}
      </div>

      <div
        data-testid="click-prompt"
        style={{
          position: "fixed",
          bottom: "2.5rem", left: "50%",
          transform: "translateX(-50%)",
          zIndex: 100,
          textAlign: "center",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <span
          ref={promptRef}
          style={{
            fontFamily: "'Pirata One', cursive",
            fontSize: "1rem",
            color: "rgba(255,255,255,0.6)",
            letterSpacing: "0.1em",
            animation: "pulse-prompt 1.5s ease-in-out infinite",
            display: "inline-block",
          }}
        >
          {ARCS[0].prompt}
        </span>
      </div>

      <style>{`
        @keyframes pulse-prompt {
          0%, 100% { opacity: 1.0; }
          50% { opacity: 0.4; }
        }
        [data-dot] { position: relative; }
        [data-dot].ripple::after {
          content: '';
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 10px; height: 10px;
          border-radius: 50%;
          border: 1.5px solid;
          border-color: inherit;
          animation: dot-ripple 0.8s ease-out forwards;
          pointer-events: none;
        }
        @keyframes dot-ripple {
          0% { width: 10px; height: 10px; opacity: 1; }
          100% { width: 30px; height: 30px; opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </>
  );
}
