import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

gsap.registerPlugin(ScrollTrigger);

function createRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  return renderer;
}

export function createHeroScene({ prefersReducedMotion }) {
  const canvas = document.querySelector("#hero-canvas");
  const wrap = canvas?.parentElement;
  if (!canvas || !wrap) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0.2, 7.5);

  const renderer = createRenderer(canvas);
  const group = new THREE.Group();
  scene.add(group);

  const core = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1.18, 0.34, 180, 18),
    new THREE.MeshPhysicalMaterial({
      color: 0xffbf69,
      roughness: 0.26,
      metalness: 0.58,
      transmission: 0.2,
      thickness: 0.5,
      emissive: 0x241205,
      emissiveIntensity: 0.18,
    }),
  );
  group.add(core);

  const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x57b8ff, transparent: true, opacity: 0.38 });
  for (let index = 0; index < 4; index += 1) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.95 + index * 0.42, 0.008, 16, 180), ringMaterial.clone());
    ring.rotation.x = Math.PI / 2 + index * 0.18;
    ring.rotation.y = index * 0.46;
    ring.material.opacity = 0.38 - index * 0.055;
    group.add(ring);
  }

  const particleCount = 520;
  const positions = new Float32Array(particleCount * 3);
  for (let index = 0; index < particleCount; index += 1) {
    const radius = 2.4 + Math.random() * 2.2;
    const angle = Math.random() * Math.PI * 2;
    const height = (Math.random() - 0.5) * 2.8;
    positions[index * 3] = Math.cos(angle) * radius;
    positions[index * 3 + 1] = height;
    positions[index * 3 + 2] = Math.sin(angle) * radius;
  }

  const particlesGeometry = new THREE.BufferGeometry();
  particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const particles = new THREE.Points(
    particlesGeometry,
    new THREE.PointsMaterial({
      color: 0xf7f3e8,
      size: 0.022,
      transparent: true,
      opacity: 0.52,
    }),
  );
  group.add(particles);

  scene.add(new THREE.AmbientLight(0xbfdcff, 1.7));
  const keyLight = new THREE.PointLight(0xffbf69, 12, 16);
  keyLight.position.set(3, 3, 5);
  scene.add(keyLight);
  const rimLight = new THREE.PointLight(0x57b8ff, 10, 14);
  rimLight.position.set(-4, -1, 4);
  scene.add(rimLight);

  const pointer = new THREE.Vector2();
  const target = new THREE.Vector2();
  const scrollState = { progress: 0 };

  window.addEventListener(
    "pointermove",
    (event) => {
      target.x = (event.clientX / window.innerWidth - 0.5) * 2;
      target.y = (event.clientY / window.innerHeight - 0.5) * 2;
    },
    { passive: true },
  );

  if (!prefersReducedMotion) {
    ScrollTrigger.create({
      trigger: "#inicio",
      start: "top top",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        scrollState.progress = self.progress;
      },
    });
  }

  const resize = () => {
    const width = wrap.clientWidth;
    const height = wrap.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    group.position.x = width > 900 ? 1.65 : 0.35;
    group.scale.setScalar(width > 900 ? 1.18 : 0.82);
  };

  const startTime = performance.now();
  const render = () => {
    const elapsed = (performance.now() - startTime) / 1000;

    pointer.lerp(target, 0.055);
    group.rotation.y = elapsed * 0.16 + pointer.x * 0.32 + scrollState.progress * 1.4;
    group.rotation.x = Math.sin(elapsed * 0.33) * 0.08 - pointer.y * 0.18;
    particles.rotation.y = -elapsed * 0.045;
    core.rotation.z = elapsed * 0.12;
    camera.position.z = 7.5 - scrollState.progress * 1.25;

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  };

  window.addEventListener("resize", resize);
  resize();
  render();
}

export function createLabScene() {
  const canvas = document.querySelector("#lab-canvas");
  const shell = canvas?.parentElement;
  if (!canvas || !shell) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0, 6.2);

  const renderer = createRenderer(canvas);
  const group = new THREE.Group();
  scene.add(group);

  const material = new THREE.MeshPhysicalMaterial({
    color: 0x57b8ff,
    roughness: 0.18,
    metalness: 0.74,
    clearcoat: 0.8,
    clearcoatRoughness: 0.2,
  });

  const solid = new THREE.Mesh(new THREE.IcosahedronGeometry(1.55, 2), material);
  group.add(solid);

  const wire = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.05, 1),
    new THREE.MeshBasicMaterial({ color: 0xf7f3e8, wireframe: true, transparent: true, opacity: 0.16 }),
  );
  group.add(wire);

  const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0xffbf69, transparent: true, opacity: 0.56 });
  const orbit = new THREE.Mesh(new THREE.TorusGeometry(2.34, 0.01, 12, 220), orbitMaterial);
  orbit.rotation.x = Math.PI / 2.4;
  group.add(orbit);

  const nodeGeometry = new THREE.SphereGeometry(0.055, 16, 16);
  const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0x8ee6a7 });
  for (let index = 0; index < 18; index += 1) {
    const node = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());
    const angle = (index / 18) * Math.PI * 2;
    node.position.set(Math.cos(angle) * 2.35, Math.sin(angle * 2) * 0.22, Math.sin(angle) * 2.35);
    group.add(node);
  }

  scene.add(new THREE.AmbientLight(0xffffff, 1.9));
  const lightA = new THREE.PointLight(0x57b8ff, 9, 12);
  lightA.position.set(3, 3, 4);
  scene.add(lightA);
  const lightB = new THREE.PointLight(0xffbf69, 8, 12);
  lightB.position.set(-3, -2, 5);
  scene.add(lightB);

  const palettes = {
    interface: { color: 0x57b8ff, orbit: 0xffbf69, nodes: 0x8ee6a7, geometry: "ico" },
    api: { color: 0x8ee6a7, orbit: 0x57b8ff, nodes: 0xffbf69, geometry: "box" },
    fullstack: { color: 0xffbf69, orbit: 0xff6f91, nodes: 0x57b8ff, geometry: "sphere" },
  };

  const geometries = {
    ico: new THREE.IcosahedronGeometry(1.55, 2),
    box: new THREE.BoxGeometry(2.15, 2.15, 2.15, 8, 8, 8),
    sphere: new THREE.SphereGeometry(1.58, 48, 48),
  };

  const layout = { scale: 1 };

  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      const mode = button.getAttribute("data-mode");
      const palette = palettes[mode] ?? palettes.interface;

      document.querySelectorAll("[data-mode]").forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");

      solid.geometry.dispose();
      solid.geometry = geometries[palette.geometry].clone();
      gsap.to(material.color, {
        r: ((palette.color >> 16) & 255) / 255,
        g: ((palette.color >> 8) & 255) / 255,
        b: (palette.color & 255) / 255,
        duration: 0.45,
      });
      orbit.material.color.setHex(palette.orbit);
      group.children.forEach((child) => {
        if (child.geometry?.type === "SphereGeometry") {
          child.material.color.setHex(palette.nodes);
        }
      });

      const targetScale = layout.scale;
      gsap.fromTo(
        group.scale,
        { x: targetScale * 0.88, y: targetScale * 0.88, z: targetScale * 0.88 },
        { x: targetScale, y: targetScale, z: targetScale, duration: 0.55, ease: "back.out(1.8)" },
      );
    });
  });

  const pointer = new THREE.Vector2();
  const target = new THREE.Vector2();
  shell.addEventListener(
    "pointermove",
    (event) => {
      const rect = shell.getBoundingClientRect();
      target.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      target.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    },
    { passive: true },
  );

  const resize = () => {
    const width = Math.max(shell.clientWidth, 1);
    const height = Math.max(shell.clientHeight, 1);
    const compact = width < 640;
    const tablet = width >= 640 && width < 900;

    layout.scale = compact ? 0.68 : tablet ? 0.84 : 1;

    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z = compact ? 8.1 : tablet ? 7 : 6.2;
    group.position.y = compact ? -0.04 : 0;
    group.scale.setScalar(layout.scale);
    camera.updateProjectionMatrix();
  };

  const startTime = performance.now();
  const render = () => {
    const elapsed = (performance.now() - startTime) / 1000;

    pointer.lerp(target, 0.07);
    group.rotation.x = elapsed * 0.17 + pointer.y * 0.28;
    group.rotation.y = elapsed * 0.28 + pointer.x * 0.44;
    orbit.rotation.z = elapsed * 0.35;
    wire.rotation.y = -elapsed * 0.18;

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  };

  window.addEventListener("resize", resize);
  resize();
  render();
}
