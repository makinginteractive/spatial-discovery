import {useEffect, useRef, useState} from 'react';
import * as THREE from 'three';

export type CanvasProduct = {
  id: string;
  title: string;
  handle: string;
  description: string;
  productType: string;
  priceRange: {
    minVariantPrice: {amount: string; currencyCode: string};
  };
  featuredImage: {url: string; altText: string | null} | null;
  images: {nodes: Array<{url: string; altText: string | null}>};
  variants: {nodes: Array<{id: string; availableForSale: boolean}>};
};

type Tile = {
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  i: number;
  j: number;
  productIndex: number;
  vx: number;
  vy: number;
};

type Props = {
  products: CanvasProduct[];
  query?: string;
  onSelect?: (p: CanvasProduct) => void;
  onHover?: (p: CanvasProduct | null) => void;
};

const CELL_W = 3.2;
const CELL_H = 3.6;
const COLS = 5;
const ROWS = 5;

const hash = (a: number, b: number) => {
  const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export function InfiniteCanvas({
  products,
  query = '',
  onSelect,
  onHover,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const queryRef = useRef(query);
  queryRef.current = query;

  // Mutable scene state — lives outside React lifecycle
  const stateRef = useRef<{
    products: CanvasProduct[];
    textures: THREE.Texture[];
    tiles: Tile[];
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    offset: THREE.Vector2;
    target: THREE.Vector2;
    velocity: THREE.Vector2;
    pointer: THREE.Vector2;
    raycaster: THREE.Raycaster;
    hoveredTile: Tile | null;
    dragging: boolean;
    dragMoved: number;
    raf: number;
    clock: THREE.Clock;
    // transition state
    transition: 'idle' | 'scatter' | 'settle';
    transitionTimer: number;
    pendingProducts: CanvasProduct[] | null;
  } | null>(null);

  const [ready, setReady] = useState(false);

  // Initial scene setup — runs once
  useEffect(() => {
    if (!products.length || !mountRef.current) return;
    const mount = mountRef.current;

    const scene = new THREE.Scene();
    scene.background = null;
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 8;
    const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.cursor = 'grab';
    renderer.domElement.style.touchAction = 'none';

    const loader = new THREE.TextureLoader();
    const loadTextures = (prods: CanvasProduct[]) =>
      prods.map((p) => {
        const t = loader.load(p.featuredImage?.url ?? '');
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 4;
        return t;
      });

    const textures = loadTextures(products);
    const tiles: Tile[] = [];
    const geo = new THREE.PlaneGeometry(2, 2.4, 1, 1);

    for (let i = -COLS; i <= COLS; i++) {
      for (let j = -ROWS; j <= ROWS; j++) {
        const mat = new THREE.MeshBasicMaterial({
          transparent: true,
          map: textures[0],
          opacity: 0,
        });
        const mesh = new THREE.Mesh(geo, mat);
        scene.add(mesh);
        tiles.push({mesh, i, j, productIndex: 0, vx: 0, vy: 0});
      }
    }

    const s = {
      products,
      textures,
      tiles,
      renderer,
      scene,
      camera,
      offset: new THREE.Vector2(0, 0),
      target: new THREE.Vector2(0, 0),
      velocity: new THREE.Vector2(0, 0),
      pointer: new THREE.Vector2(-2, -2),
      raycaster: new THREE.Raycaster(),
      hoveredTile: null as Tile | null,
      dragging: false,
      dragMoved: 0,
      raf: 0,
      clock: new THREE.Clock(),
      transition: 'idle' as 'idle' | 'scatter' | 'settle',
      transitionTimer: 0,
      pendingProducts: null as CanvasProduct[] | null,
    };
    stateRef.current = s;

    // Input
    let lastX = 0, lastY = 0;
    const onPointerDown = (e: PointerEvent) => {
      s.dragging = true;
      lastX = e.clientX; lastY = e.clientY;
      renderer.domElement.style.cursor = 'grabbing';
      (e.target as Element).setPointerCapture?.(e.pointerId);
      s.dragMoved = 0;
    };
    const onPointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      s.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      s.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      if (s.dragging) {
        const dx = e.clientX - lastX, dy = e.clientY - lastY;
        lastX = e.clientX; lastY = e.clientY;
        s.target.x -= dx * 0.012;
        s.target.y += dy * 0.012;
        s.dragMoved += Math.abs(dx) + Math.abs(dy);
      }
    };
    const onPointerUp = () => {
      s.dragging = false;
      renderer.domElement.style.cursor = 'grab';
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      s.target.x += e.deltaX * 0.0035;
      s.target.y += e.deltaY * 0.0035;
    };
    const onClick = (e: MouseEvent) => {
      if (s.dragMoved > 6 || s.transition !== 'idle') return;
      const rect = renderer.domElement.getBoundingClientRect();
      s.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      s.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      s.raycaster.setFromCamera(s.pointer, camera);
      const hits = s.raycaster.intersectObjects(tiles.map((t) => t.mesh));
      if (hits.length) {
        const tile = tiles.find((t) => t.mesh === hits[0].object);
        if (tile) onSelect?.(s.products[tile.productIndex]);
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('wheel', onWheel, {passive: false});
    renderer.domElement.addEventListener('click', onClick);

    const resize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.position.z = w < 640 ? 11 : 8;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    function cellProductIndex(ci: number, cj: number) {
      const h = Math.floor(hash(ci, cj) * 1000);
      return h % s.products.length;
    }

    function frame() {
      const t = s.clock.getElapsedTime();

      // Ease camera offset
      const ease = 0.08;
      const px = s.offset.x, py = s.offset.y;
      s.offset.x += (s.target.x - s.offset.x) * ease;
      s.offset.y += (s.target.y - s.offset.y) * ease;
      s.velocity.x = s.offset.x - px;
      s.velocity.y = s.offset.y - py;
      s.target.x += 0.0015;

      // Handle transition phases
      if (s.transition === 'scatter') {
        s.transitionTimer += 1;
        // After 35 frames of scatter, swap products and settle
        if (s.transitionTimer >= 35) {
          s.products = s.pendingProducts!;
          // Load new textures
          const loader2 = new THREE.TextureLoader();
          const newTextures = s.products.map((p) => {
            const tx = loader2.load(p.featuredImage?.url ?? '');
            tx.colorSpace = THREE.SRGBColorSpace;
            tx.anisotropy = 4;
            return tx;
          });
          // Dispose old textures
          s.textures.forEach((tx) => tx.dispose());
          s.textures = newTextures;
          s.pendingProducts = null;
          s.transition = 'settle';
          s.transitionTimer = 0;
          // Give each tile a random inward velocity to re-converge
          for (const tile of s.tiles) {
            tile.vx = (Math.random() - 0.5) * 0.3;
            tile.vy = (Math.random() - 0.5) * 0.3;
          }
        }
      } else if (s.transition === 'settle') {
        s.transitionTimer += 1;
        if (s.transitionTimer >= 40) {
          s.transition = 'idle';
          s.transitionTimer = 0;
          for (const tile of s.tiles) {tile.vx = 0; tile.vy = 0;}
        }
      }

      const totalW = (COLS * 2 + 1) * CELL_W;
      const totalH = (ROWS * 2 + 1) * CELL_H;

      // Hover raycast (idle only)
      if (s.transition === 'idle') {
        s.raycaster.setFromCamera(s.pointer, camera);
        const hits = s.raycaster.intersectObjects(s.tiles.map((tt) => tt.mesh));
        const newHover = hits.length
          ? (s.tiles.find((tt) => tt.mesh === hits[0].object) ?? null)
          : null;
        if (newHover !== s.hoveredTile) {
          s.hoveredTile = newHover;
          renderer.domElement.style.cursor = s.hoveredTile
            ? 'pointer' : s.dragging ? 'grabbing' : 'grab';
          onHover?.(s.hoveredTile ? s.products[s.hoveredTile.productIndex] : null);
        }
      }

      const q = queryRef.current.trim().toLowerCase();

      for (const tile of s.tiles) {
        const baseX = tile.i * CELL_W;
        const baseY = tile.j * CELL_H;
        let x = baseX - s.offset.x;
        x = ((x + totalW / 2) % totalW + totalW) % totalW - totalW / 2;
        let y = baseY - s.offset.y;
        y = ((y + totalH / 2) % totalH + totalH) % totalH - totalH / 2;

        const worldCellI = Math.round((x + s.offset.x) / CELL_W);
        const worldCellJ = Math.round((y + s.offset.y) / CELL_H);
        const pIdx = cellProductIndex(worldCellI, worldCellJ);
        tile.productIndex = pIdx;

        if (tile.mesh.material.map !== s.textures[pIdx]) {
          tile.mesh.material.map = s.textures[pIdx];
          tile.mesh.material.needsUpdate = true;
        }

        const colShift = (worldCellI % 2) * (CELL_H * 0.4);
        const yy = y + colShift - (worldCellI % 2 ? CELL_H * 0.2 : 0);
        const seed = hash(worldCellI, worldCellJ);
        const z = Math.sin(t * 0.6 + seed * 6.28) * 0.25 - seed * 0.4;

        if (s.transition === 'scatter') {
          // Tiles scatter outward with random velocity
          const scatterX = (Math.random() - 0.5) * 0.08;
          const scatterY = (Math.random() - 0.5) * 0.08;
          tile.mesh.position.x += scatterX;
          tile.mesh.position.y += scatterY;
          tile.mesh.position.z = z;
        } else if (s.transition === 'settle') {
          // Tiles drift back to grid position
          tile.mesh.position.x += (x - tile.mesh.position.x) * 0.12;
          tile.mesh.position.y += (yy - tile.mesh.position.y) * 0.12;
          tile.mesh.position.z = z;
        } else {
          tile.mesh.position.set(x, yy, z);
        }

        // Target opacity
        let targetOp: number;
        if (s.transition === 'scatter') {
          targetOp = 0;
        } else if (s.transition === 'settle') {
          targetOp = s.transitionTimer > 10 ? 1 : 0;
        } else {
          const product = s.products[pIdx];
          const matches =
            q.length === 0 ||
            product.title.toLowerCase().includes(q) ||
            product.productType.toLowerCase().includes(q);
          targetOp = matches ? 1 : 0.12;
        }
        tile.mesh.material.opacity +=
          (targetOp - tile.mesh.material.opacity) * (s.transition === 'scatter' ? 0.15 : 0.08);

        // Scale + tilt (idle only)
        if (s.transition === 'idle') {
          const isHover = tile === s.hoveredTile;
          const targetScale = isHover ? 1.12 : 1;
          tile.mesh.scale.x += (targetScale - tile.mesh.scale.x) * 0.15;
          tile.mesh.scale.y += (targetScale - tile.mesh.scale.y) * 0.15;
          tile.mesh.rotation.y += (s.velocity.x * 0.4 - tile.mesh.rotation.y) * 0.1;
          tile.mesh.rotation.x += (-s.velocity.y * 0.4 - tile.mesh.rotation.x) * 0.1;
        } else {
          tile.mesh.scale.x += (1 - tile.mesh.scale.x) * 0.1;
          tile.mesh.scale.y += (1 - tile.mesh.scale.y) * 0.1;
          tile.mesh.rotation.y *= 0.9;
          tile.mesh.rotation.x *= 0.9;
        }
      }

      camera.position.x += (s.pointer.x * 0.3 - camera.position.x) * 0.04;
      camera.position.y += (s.pointer.y * 0.2 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      s.raf = requestAnimationFrame(frame);
    }

    setReady(true);
    frame();

    return () => {
      cancelAnimationFrame(s.raf);
      ro.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('wheel', onWheel);
      renderer.domElement.removeEventListener('click', onClick);
      s.tiles.forEach((tile) => {
        tile.mesh.geometry.dispose();
        tile.mesh.material.dispose();
      });
      s.textures.forEach((tx) => tx.dispose());
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      stateRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Product changes trigger spatial transition
  useEffect(() => {
    const s = stateRef.current;
    if (!s || !products.length) return;
    if (s.products === products) return;
    if (s.transition !== 'idle') {
      s.pendingProducts = products;
      return;
    }
    s.pendingProducts = products;
    s.transition = 'scatter';
    s.transitionTimer = 0;
  }, [products]);

  return (
    <div ref={mountRef} className="absolute inset-0" aria-hidden={!ready} />
  );
}
