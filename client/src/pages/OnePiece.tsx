import { useEffect, useRef } from "react";

declare global {
  interface Window {
    THREE: any;
    gsap: any;
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
    bloom: [1.4, 0.8, 0.2],
    prompt: "Click anywhere to set sail",
  },
  {
    title: "EAST BLUE",
    tagline: "Where it all began. A boy, a dream, a straw hat.",
    color: "#20B2AA",
    bloom: [0.6, 0.5, 0.3],
    prompt: "Click to continue the voyage",
  },
  {
    title: "ALABASTA",
    tagline: "A kingdom on the brink. Loyalty tested in the sands.",
    color: "#DAA520",
    bloom: [1.0, 0.6, 0.25],
    prompt: "Click to cross the desert",
  },
  {
    title: "SKYPIEA",
    tagline: "Above the clouds lies a golden city — and a god.",
    color: "#228B22",
    bloom: [1.8, 1.0, 0.15],
    prompt: "Click to ascend",
  },
  {
    title: "WATER 7",
    tagline: "A crew torn apart. A reckoning at Enies Lobby.",
    color: "#4169E1",
    bloom: [1.2, 0.7, 0.2],
    prompt: "Click to face the storm",
  },
  {
    title: "MARINEFORD",
    tagline: "The war that changed the world. Nothing was ever the same.",
    color: "#8B0000",
    bloom: [2.0, 1.2, 0.1],
    prompt: "Click to enter the war",
  },
  {
    title: "DRESSROSA",
    tagline: "Beneath the petals, a dictator's chains.",
    color: "#EE82EE",
    bloom: [1.5, 0.9, 0.18],
    prompt: "Click to shatter the cage",
  },
  {
    title: "WANO",
    tagline: "An isolated nation under the shogun's shadow.",
    color: "#DC143C",
    bloom: [1.6, 0.7, 0.2],
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
      const gsap = window.gsap;
      if (!THREE || !gsap) return;

      initializedRef.current = true;

      // ══════════════════════════════════════════════════════════════════════
      // ── CORE ENGINE ───────────────────────────────────────────────────────
      // ══════════════════════════════════════════════════════════════════════

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

      // ══════════════════════════════════════════════════════════════════════
      // ── ARC STATE ─────────────────────────────────────────────────────────
      // ══════════════════════════════════════════════════════════════════════

      let currentArcIndex = 0;
      let isTransitioning = false;
      let arcObjects: any[] = [];
      let arcAnimateFn: ((t: number) => void) | null = null;

      // ══════════════════════════════════════════════════════════════════════
      // ── PERSISTENT STAR FIELD ─────────────────────────────────────────────
      // ══════════════════════════════════════════════════════════════════════

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

      // ══════════════════════════════════════════════════════════════════════
      // ── SCENE MANAGEMENT ──────────────────────────────────────────────────
      // ══════════════════════════════════════════════════════════════════════

      const clearScene = () => {
        for (const obj of arcObjects) {
          scene.remove(obj);
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m: any) => m.dispose());
            } else {
              obj.material.dispose();
            }
          }
          if (obj.children) {
            obj.traverse((child: any) => {
              if (child.geometry) child.geometry.dispose();
              if (child.material) {
                if (Array.isArray(child.material)) {
                  child.material.forEach((m: any) => m.dispose());
                } else {
                  child.material.dispose();
                }
              }
            });
          }
        }
        arcObjects = [];
        arcAnimateFn = null;
      };

      const addArcObject = (obj: any) => {
        arcObjects.push(obj);
        scene.add(obj);
      };

      // ══════════════════════════════════════════════════════════════════════
      // ── ARC SCENE BUILDERS ────────────────────────────────────────────────
      // ══════════════════════════════════════════════════════════════════════

      const buildGrandLine = () => {
        const oceanGeo = new THREE.PlaneGeometry(200, 200, 80, 80);
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
          color: 0xffcd00, emissive: 0xd70000, emissiveIntensity: 0.4,
          metalness: 0.7, roughness: 0.25,
        });
        const torus = new THREE.Mesh(torusGeo, torusMat);
        torus.position.set(0, 2, 0);
        addArcObject(torus);

        const amb = new THREE.AmbientLight(0x1a2a5a, 1.5);
        addArcObject(amb);
        const dir = new THREE.DirectionalLight(0xffcd00, 1);
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

      const buildEastBlue = () => {
        const amb = new THREE.AmbientLight(0x87ceeb, 1.2);
        addArcObject(amb);
        const dir = new THREE.DirectionalLight(0xffffff, 1.0);
        dir.position.set(5, 10, 5);
        addArcObject(dir);

        const oceanGeo = new THREE.PlaneGeometry(200, 200, 60, 60);
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

        const treeGeo = new THREE.ConeGeometry(1.2, 4, 8);
        const treeMat = new THREE.MeshStandardMaterial({ color: 0x228b22 });
        const tree = new THREE.Mesh(treeGeo, treeMat);
        tree.position.set(0, -4, 0);
        addArcObject(tree);

        const trunkGeo = new THREE.CylinderGeometry(0.2, 0.25, 2, 8);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.set(0, -6.5, 0);
        addArcObject(trunk);

        arcAnimateFn = (t: number) => {
          for (let i = 0; i < posAttr.count; i++) {
            const x = posAttr.getX(i);
            const y = posAttr.getY(i);
            posAttr.setZ(i, origZ[i] + Math.sin(x * 0.2 + t * 0.7) * 0.6 + Math.cos(y * 0.25 + t * 0.5) * 0.4);
          }
          posAttr.needsUpdate = true;
          ocean.geometry.computeVertexNormals();
          tree.rotation.z = Math.sin(t * 1.5) * 0.03;
        };
      };

      const buildAlabasta = () => {
        const amb = new THREE.AmbientLight(0xc2956c, 0.8);
        addArcObject(amb);
        const dir = new THREE.DirectionalLight(0xff8c00, 1.5);
        dir.position.set(0, 15, 5);
        addArcObject(dir);

        const desertGeo = new THREE.PlaneGeometry(200, 200, 60, 60);
        const desertMat = new THREE.MeshStandardMaterial({
          color: 0xdaa520, roughness: 0.9, flatShading: true,
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

        const pyrGeo = new THREE.ConeGeometry(5, 8, 4);
        const pyrMat = new THREE.MeshStandardMaterial({ color: 0xd2691e, roughness: 0.7 });
        const pyr = new THREE.Mesh(pyrGeo, pyrMat);
        pyr.position.set(0, -2, -5);
        addArcObject(pyr);

        const pyr2Geo = new THREE.ConeGeometry(3, 5, 4);
        const pyr2 = new THREE.Mesh(pyr2Geo, pyrMat.clone());
        pyr2.position.set(8, -4, -8);
        addArcObject(pyr2);

        const sandCount = 1500;
        const sandGeo = new THREE.BufferGeometry();
        const sandPos = new Float32Array(sandCount * 3);
        for (let i = 0; i < sandCount; i++) {
          sandPos[i * 3] = (Math.random() - 0.5) * 60;
          sandPos[i * 3 + 1] = Math.random() * 20 - 5;
          sandPos[i * 3 + 2] = (Math.random() - 0.5) * 60;
        }
        sandGeo.setAttribute("position", new THREE.BufferAttribute(sandPos, 3));
        const sandMat = new THREE.PointsMaterial({
          color: 0xdaa520, size: 0.15, transparent: true, opacity: 0.5,
        });
        const sandStorm = new THREE.Points(sandGeo, sandMat);
        addArcObject(sandStorm);

        arcAnimateFn = (t: number) => {
          sandStorm.rotation.y += 0.002;
          const sp = sandStorm.geometry.attributes.position;
          for (let i = 0; i < sp.count; i++) {
            sp.setX(i, sp.getX(i) + Math.sin(t + i) * 0.02);
            sp.setY(i, sp.getY(i) + 0.01);
            if (sp.getY(i) > 15) sp.setY(i, -5);
          }
          sp.needsUpdate = true;
        };
      };

      const buildSkypiea = () => {
        const amb = new THREE.AmbientLight(0x228b22, 0.6);
        addArcObject(amb);
        const sun = new THREE.SpotLight(0xffcd00, 2.0, 100, Math.PI / 4);
        sun.position.set(0, 30, 10);
        addArcObject(sun);
        const dir = new THREE.DirectionalLight(0xfffff0, 0.8);
        dir.position.set(-5, 15, 5);
        addArcObject(dir);

        for (let i = 0; i < 6; i++) {
          const r = 2 + Math.random() * 4;
          const cloudGeo = new THREE.SphereGeometry(r, 12, 12);
          const cloudMat = new THREE.MeshStandardMaterial({
            color: 0xfffff0, roughness: 1, transparent: true, opacity: 0.7,
          });
          const cloud = new THREE.Mesh(cloudGeo, cloudMat);
          cloud.position.set(
            (Math.random() - 0.5) * 40,
            -6 + Math.random() * 10,
            (Math.random() - 0.5) * 30 - 5
          );
          cloud.scale.y = 0.4;
          addArcObject(cloud);
        }

        const ruinGroup = new THREE.Group();
        for (let i = 0; i < 5; i++) {
          const boxGeo = new THREE.BoxGeometry(1.5, 2 + Math.random() * 3, 1.5);
          const boxMat = new THREE.MeshStandardMaterial({
            color: 0xdaa520, emissive: 0xffcd00, emissiveIntensity: 0.15, metalness: 0.5,
          });
          const box = new THREE.Mesh(boxGeo, boxMat);
          box.position.set(
            (Math.random() - 0.5) * 8,
            -5 + Math.random() * 2,
            (Math.random() - 0.5) * 8
          );
          ruinGroup.add(box);
        }
        addArcObject(ruinGroup);

        arcAnimateFn = (t: number) => {
          arcObjects.forEach((obj: any) => {
            if (obj.isMesh && obj.geometry?.type === "SphereGeometry") {
              obj.position.y += Math.sin(t * 0.3 + obj.position.x) * 0.003;
            }
          });
          ruinGroup.rotation.y += 0.001;
        };
      };

      const buildWater7 = () => {
        const amb = new THREE.AmbientLight(0x708090, 1.0);
        addArcObject(amb);
        const dir = new THREE.DirectionalLight(0xb0c4de, 1.2);
        dir.position.set(0, 15, 5);
        addArcObject(dir);

        const waterGeo = new THREE.PlaneGeometry(200, 200, 60, 60);
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

        const archGeo = new THREE.TorusGeometry(4, 0.4, 8, 20, Math.PI);
        const archMat = new THREE.MeshStandardMaterial({ color: 0x708090, roughness: 0.6 });
        const arch = new THREE.Mesh(archGeo, archMat);
        arch.position.set(0, -2, -5);
        addArcObject(arch);

        for (let i = 0; i < 3; i++) {
          const towerGeo = new THREE.CylinderGeometry(0.8, 1, 6 + Math.random() * 4, 8);
          const towerMat = new THREE.MeshStandardMaterial({ color: 0x2f4f4f });
          const tower = new THREE.Mesh(towerGeo, towerMat);
          tower.position.set(-6 + i * 6, -3, -8);
          addArcObject(tower);
        }

        arcAnimateFn = (t: number) => {
          for (let i = 0; i < posAttr.count; i++) {
            const x = posAttr.getX(i);
            const y = posAttr.getY(i);
            posAttr.setZ(i, origZ[i] + Math.sin(x * 0.4 + t * 1.2) * 1.0 + Math.cos(y * 0.35 + t) * 0.7);
          }
          posAttr.needsUpdate = true;
          water.geometry.computeVertexNormals();
        };
      };

      const buildMarineford = () => {
        const amb = new THREE.AmbientLight(0x1c1c1c, 0.4);
        addArcObject(amb);
        const fire = new THREE.SpotLight(0xff4500, 2.0, 50, Math.PI / 3);
        fire.position.set(0, 15, 5);
        addArcObject(fire);
        for (let i = 0; i < 4; i++) {
          const rPt = new THREE.PointLight(0xd70000, 1.5, 20);
          rPt.position.set((Math.random() - 0.5) * 20, Math.random() * 5, (Math.random() - 0.5) * 20);
          addArcObject(rPt);
        }

        const groundGeo = new THREE.PlaneGeometry(200, 200, 40, 40);
        const groundMat = new THREE.MeshStandardMaterial({
          color: 0x2f2f2f, roughness: 1, flatShading: true,
        });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -8;
        addArcObject(ground);
        const gPos = ground.geometry.attributes.position;
        for (let i = 0; i < gPos.count; i++) {
          gPos.setZ(i, (Math.random() - 0.5) * 2);
        }
        gPos.needsUpdate = true;
        ground.geometry.computeVertexNormals();

        for (let i = 0; i < 8; i++) {
          const debrisGeo = new THREE.BoxGeometry(
            0.5 + Math.random() * 2,
            0.5 + Math.random() * 2,
            0.5 + Math.random() * 2
          );
          const debrisMat = new THREE.MeshStandardMaterial({
            color: 0x2f2f2f, emissive: 0x8b0000, emissiveIntensity: 0.3,
          });
          const debris = new THREE.Mesh(debrisGeo, debrisMat);
          debris.position.set(
            (Math.random() - 0.5) * 30,
            -7 + Math.random() * 3,
            (Math.random() - 0.5) * 30
          );
          debris.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
          addArcObject(debris);
        }

        const smokeCount = 1000;
        const smokeGeo = new THREE.BufferGeometry();
        const smokePos = new Float32Array(smokeCount * 3);
        for (let i = 0; i < smokeCount; i++) {
          smokePos[i * 3] = (Math.random() - 0.5) * 50;
          smokePos[i * 3 + 1] = Math.random() * 15 - 5;
          smokePos[i * 3 + 2] = (Math.random() - 0.5) * 50;
        }
        smokeGeo.setAttribute("position", new THREE.BufferAttribute(smokePos, 3));
        const smokeMat = new THREE.PointsMaterial({
          color: 0x8b0000, size: 0.3, transparent: true, opacity: 0.4,
        });
        const smoke = new THREE.Points(smokeGeo, smokeMat);
        addArcObject(smoke);

        arcAnimateFn = (t: number) => {
          smoke.rotation.y += 0.001;
          const sp = smoke.geometry.attributes.position;
          for (let i = 0; i < sp.count; i++) {
            sp.setY(i, sp.getY(i) + 0.015);
            if (sp.getY(i) > 15) sp.setY(i, -5);
          }
          sp.needsUpdate = true;
        };
      };

      const buildDressrosa = () => {
        const amb = new THREE.AmbientLight(0xee82ee, 0.8);
        addArcObject(amb);
        const dir = new THREE.DirectionalLight(0xffcd00, 1.0);
        dir.position.set(5, 12, 5);
        addArcObject(dir);
        const pinkPt = new THREE.PointLight(0xff69b4, 1.5, 30);
        pinkPt.position.set(0, 5, 0);
        addArcObject(pinkPt);

        const coloGeo = new THREE.TorusGeometry(6, 1, 8, 30);
        const coloMat = new THREE.MeshStandardMaterial({
          color: 0x9370db, roughness: 0.5, metalness: 0.3,
        });
        const colosseum = new THREE.Mesh(coloGeo, coloMat);
        colosseum.position.set(0, -4, -5);
        colosseum.rotation.x = Math.PI / 2;
        addArcObject(colosseum);

        const cageGeo = new THREE.IcosahedronGeometry(12, 1);
        const cageMat = new THREE.MeshStandardMaterial({
          color: 0xff6347, wireframe: true, transparent: true, opacity: 0.25,
        });
        const cage = new THREE.Mesh(cageGeo, cageMat);
        cage.position.set(0, 2, -5);
        addArcObject(cage);

        const petalCount = 2000;
        const petalGeo = new THREE.BufferGeometry();
        const petalPos = new Float32Array(petalCount * 3);
        for (let i = 0; i < petalCount; i++) {
          petalPos[i * 3] = (Math.random() - 0.5) * 60;
          petalPos[i * 3 + 1] = Math.random() * 30 - 10;
          petalPos[i * 3 + 2] = (Math.random() - 0.5) * 60;
        }
        petalGeo.setAttribute("position", new THREE.BufferAttribute(petalPos, 3));
        const petalMat = new THREE.PointsMaterial({
          color: 0xff69b4, size: 0.2, transparent: true, opacity: 0.7,
        });
        const petals = new THREE.Points(petalGeo, petalMat);
        addArcObject(petals);

        arcAnimateFn = (t: number) => {
          cage.rotation.y += 0.002;
          cage.rotation.x += 0.001;
          const pp = petals.geometry.attributes.position;
          for (let i = 0; i < pp.count; i++) {
            pp.setY(i, pp.getY(i) - 0.02);
            pp.setX(i, pp.getX(i) + Math.sin(t + i * 0.1) * 0.01);
            if (pp.getY(i) < -10) pp.setY(i, 20);
          }
          pp.needsUpdate = true;
        };
      };

      const buildWano = () => {
        const amb = new THREE.AmbientLight(0x2f4f4f, 0.5);
        addArcObject(amb);
        const bloodDir = new THREE.DirectionalLight(0xdc143c, 1.2);
        bloodDir.position.set(5, 10, 5);
        addArcObject(bloodDir);
        const moonPt = new THREE.PointLight(0xffffff, 1.0, 40);
        moonPt.position.set(-10, 15, 5);
        addArcObject(moonPt);

        const pagodaGroup = new THREE.Group();
        for (let i = 0; i < 4; i++) {
          const tierW = 3 - i * 0.6;
          const tierGeo = new THREE.BoxGeometry(tierW, 1.5, tierW);
          const tierMat = new THREE.MeshStandardMaterial({
            color: i % 2 === 0 ? 0xdc143c : 0xf5f5dc, roughness: 0.6,
          });
          const tier = new THREE.Mesh(tierGeo, tierMat);
          tier.position.y = i * 1.8;
          pagodaGroup.add(tier);
        }
        pagodaGroup.position.set(0, -5, -5);
        addArcObject(pagodaGroup);

        const toriiGroup = new THREE.Group();
        const pillarGeo = new THREE.CylinderGeometry(0.2, 0.2, 6, 8);
        const toriiMat = new THREE.MeshStandardMaterial({ color: 0xdc143c });
        const lPillar = new THREE.Mesh(pillarGeo, toriiMat);
        lPillar.position.set(-2.5, -3, 3);
        toriiGroup.add(lPillar);
        const rPillar = new THREE.Mesh(pillarGeo, toriiMat.clone());
        rPillar.position.set(2.5, -3, 3);
        toriiGroup.add(rPillar);
        const beamGeo = new THREE.BoxGeometry(7, 0.3, 0.3);
        const beam = new THREE.Mesh(beamGeo, toriiMat.clone());
        beam.position.set(0, 0, 3);
        toriiGroup.add(beam);
        const beam2 = new THREE.Mesh(beamGeo.clone(), toriiMat.clone());
        beam2.position.set(0, -0.7, 3);
        beam2.scale.x = 0.85;
        toriiGroup.add(beam2);
        addArcObject(toriiGroup);

        const blossomCount = 1500;
        const blossomGeo = new THREE.BufferGeometry();
        const blossomPos = new Float32Array(blossomCount * 3);
        for (let i = 0; i < blossomCount; i++) {
          blossomPos[i * 3] = (Math.random() - 0.5) * 50;
          blossomPos[i * 3 + 1] = Math.random() * 25 - 5;
          blossomPos[i * 3 + 2] = (Math.random() - 0.5) * 50;
        }
        blossomGeo.setAttribute("position", new THREE.BufferAttribute(blossomPos, 3));
        const blossomMat = new THREE.PointsMaterial({
          color: 0xffb7c5, size: 0.18, transparent: true, opacity: 0.8,
        });
        const blossoms = new THREE.Points(blossomGeo, blossomMat);
        addArcObject(blossoms);

        for (let i = 0; i < 3; i++) {
          const mtGeo = new THREE.ConeGeometry(6 + Math.random() * 4, 10 + Math.random() * 6, 6);
          const mtMat = new THREE.MeshStandardMaterial({
            color: 0x2f4f4f, roughness: 0.9, flatShading: true,
          });
          const mt = new THREE.Mesh(mtGeo, mtMat);
          mt.position.set(-15 + i * 15, -6, -20 - Math.random() * 10);
          addArcObject(mt);
        }

        arcAnimateFn = (t: number) => {
          pagodaGroup.rotation.y = Math.sin(t * 0.2) * 0.05;
          const bp = blossoms.geometry.attributes.position;
          for (let i = 0; i < bp.count; i++) {
            bp.setY(i, bp.getY(i) - 0.015);
            bp.setX(i, bp.getX(i) + Math.sin(t * 0.5 + i * 0.05) * 0.008);
            if (bp.getY(i) < -5) bp.setY(i, 20);
          }
          bp.needsUpdate = true;
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

      const updateUI = (index: number) => {
        const arc = ARCS[index];
        const titleEl = titleRef.current;
        const tagEl = taglineRef.current;
        const promptEl = promptRef.current;
        const dotsEl = dotsRef.current;

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
            dot.style.backgroundColor = isActive ? arc.color : "transparent";
            dot.style.borderColor = arc.color;
            dot.style.boxShadow = isActive
              ? `0 0 8px ${hexToRgba(arc.color, 0.7)}, 0 0 16px ${hexToRgba(arc.color, 0.35)}`
              : "none";
            dot.style.width = isActive ? "12px" : "10px";
            dot.style.height = isActive ? "12px" : "10px";
          });
        }

        const titleContainer = titleEl?.parentElement;

        gsap.to(titleContainer, {
          y: -30,
          opacity: 0,
          duration: 0.5,
          ease: "power2.in",
          onComplete: () => {
            if (titleEl) {
              titleEl.textContent = arc.title;
              titleEl.style.color = arc.color;
              titleEl.style.textShadow = `0 0 20px ${hexToRgba(arc.color, 0.6)}, 0 0 40px ${hexToRgba(arc.color, 0.3)}, 0 0 80px ${hexToRgba(arc.color, 0.15)}`;
            }
            if (tagEl) {
              tagEl.textContent = arc.tagline;
            }
            if (promptEl) {
              promptEl.textContent = arc.prompt;
            }

            gsap.fromTo(
              titleContainer,
              { y: 40, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.9, ease: "power2.out" }
            );
          },
        });
      };

      // ══════════════════════════════════════════════════════════════════════
      // ── CLICK HANDLER (ARC NAVIGATION) ────────────────────────────────────
      // ══════════════════════════════════════════════════════════════════════

      const onWindowClick = () => {
        if (isTransitioning) return;
        if (currentArcIndex >= ARCS.length - 1) return;

        isTransitioning = true;
        const nextIndex = currentArcIndex + 1;

        gsap.to(camera.position, {
          z: camera.position.z - 30,
          duration: 1.4,
          ease: "power3.inOut",
          onComplete: () => {
            loadArcScene(nextIndex);
            camera.position.z = 20;
            currentArcIndex = nextIndex;
            updateUI(nextIndex);
            isTransitioning = false;
          },
        });
      };
      window.addEventListener("click", onWindowClick);

      // ══════════════════════════════════════════════════════════════════════
      // ── MOUSE PARALLAX ────────────────────────────────────────────────────
      // ══════════════════════════════════════════════════════════════════════

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

      // ══════════════════════════════════════════════════════════════════════
      // ── RESIZE ────────────────────────────────────────────────────────────
      // ══════════════════════════════════════════════════════════════════════

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

      let animFrameId: number;
      const animate = () => {
        animFrameId = requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        stars.rotation.y += 0.0001;
        stars.rotation.x += 0.00005;

        if (arcAnimateFn) arcAnimateFn(t);

        if (!isTransitioning) {
          camera.position.x += (baseCamX + targetX * parallaxStrength - camera.position.x) * 0.05;
          camera.position.y += (baseCamY + targetY * parallaxStrength - camera.position.y) * 0.05;
        }
        camera.lookAt(0, 0, 0);

        if (composer) {
          composer.render();
        } else {
          renderer.render(scene, camera);
        }
      };

      // ── Load initial scene & start loop ─────────────────────────────────
      loadArcScene(0);
      animate();

      // ══════════════════════════════════════════════════════════════════════
      // ── CLEANUP ───────────────────────────────────────────────────────────
      // ══════════════════════════════════════════════════════════════════════

      (mountRef.current as any).__cleanup = () => {
        cancelAnimationFrame(animFrameId);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("resize", onResize);
        window.removeEventListener("click", onWindowClick);
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
        loadArcScene, updateUI, clearScene,
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
      `}</style>
    </>
  );
}
