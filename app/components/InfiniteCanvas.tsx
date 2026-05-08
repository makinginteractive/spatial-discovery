import {useEffect, useRef, useState} from 'react';
import * as THREE from 'three';
import {products, type Product} from '~/lib/products';

type Props = {
  query: string;
  onSelect: (p: Product) => void;
  onHover: (p: Product | null) => void;
};

export function InfiniteCanvas({query, onSelect, onHover}: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const queryRef = useRef(query);
  queryRef.current = query;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mount = mountRef.current!;
    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.cursor = 'grab';
    renderer.domElement.style.touchAction = 'none';

    const CELL_W = 3.2;
    const CELL_H = 3.6;
    const COLS = 5;
    const ROWS = 5;

    const offset = new THREE.Vector2(0, 0);
    const target = new THREE.Vector2(0, 0);
    const velocity = new THREE.Vector2(0, 0);

    const loader = new THREE.TextureLoader();
    const textures = products.map((p) => {
      const t = loader.load(p.image);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
      return t;
    });

    type Tile = {
      mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
      i: number;
      j: number;
      productIndex: number;
    };
    const tiles: Tile[] = [];
    const geo = new THREE.PlaneGeometry(2, 2.4, 1, 1);

    for (let i = -COLS; i <= COLS; i++) {
      for (let j = -ROWS; j <= ROWS; j++) {
        const mat = new THREE.MeshBasicMaterial({
          transparent: true,
          map: textures[0],
          opacity: 1,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.userData.tile = true;
        scene.add(mesh);
        tiles.push({mesh, i, j, productIndex: 0});
      }
    }

    const hash = (a: number, b: number) => {
      const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
      return x - Math.floor(x);
    };

    function cellProductIndex(ci: number, cj: number) {
      const h = Math.floor(hash(ci, cj) * 1000);
      return h % products.length;
    }

    function resize() {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      const baseZ = w < 640 ? 11 : 8;
      camera.position.z = baseZ;
      camera.updateProjectionMatrix();
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let dragMoved = 0;

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      renderer.domElement.style.cursor = 'grabbing';
      (e.target as Element).setPointerCapture?.(e.pointerId);
      dragMoved = 0;
    };
    const onPointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (dragging) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        const k = 0.012;
        target.x -= dx * k;
        target.y += dy * k;
        dragMoved += Math.abs(dx) + Math.abs(dy);
      }
    };
    const onPointerUp = () => {
      dragging = false;
      renderer.domElement.style.cursor = 'grab';
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const k = 0.0035;
      target.x += e.deltaX * k;
      target.y += e.deltaY * k;
    };
    const onClick = (e: MouseEvent) => {
      if (dragMoved > 6) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(tiles.map((t) => t.mesh));
      if (hits.length) {
        const tile = tiles.find((t) => t.mesh === hits[0].object);
        if (tile) onSelect(products[tile.productIndex]);
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('wheel', onWheel, {passive: false});
    renderer.domElement.addEventListener('click', onClick);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(-2, -2);
    let hoveredTile: Tile | null = null;

    let raf = 0;
    const clock = new THREE.Clock();

    function frame() {
      const t = clock.getElapsedTime();

      const ease = 0.08;
      const px = offset.x;
      const py = offset.y;
      offset.x += (target.x - offset.x) * ease;
      offset.y += (target.y - offset.y) * ease;
      velocity.x = offset.x - px;
      velocity.y = offset.y - py;

      target.x += 0.0015;

      const totalW = (COLS * 2 + 1) * CELL_W;
      const totalH = (ROWS * 2 + 1) * CELL_H;

      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(tiles.map((tt) => tt.mesh));
      const newHover =
        hits.length
          ? tiles.find((tt) => tt.mesh === hits[0].object) ?? null
          : null;
      if (newHover !== hoveredTile) {
        hoveredTile = newHover;
        renderer.domElement.style.cursor = hoveredTile
          ? 'pointer'
          : dragging
            ? 'grabbing'
            : 'grab';
        onHover(hoveredTile ? products[hoveredTile.productIndex] : null);
      }

      const q = queryRef.current.trim().toLowerCase();

      for (const tile of tiles) {
        const baseX = tile.i * CELL_W;
        const baseY = tile.j * CELL_H;

        let x = baseX - offset.x;
        x = ((x + totalW / 2) % totalW + totalW) % totalW - totalW / 2;
        let y = baseY - offset.y;
        y = ((y + totalH / 2) % totalH + totalH) % totalH - totalH / 2;

        const worldCellI = Math.round((x + offset.x) / CELL_W);
        const worldCellJ = Math.round((y + offset.y) / CELL_H);
        const pIdx = cellProductIndex(worldCellI, worldCellJ);
        tile.productIndex = pIdx;

        if (tile.mesh.material.map !== textures[pIdx]) {
          tile.mesh.material.map = textures[pIdx];
          tile.mesh.material.needsUpdate = true;
        }

        const colShift = (worldCellI % 2) * (CELL_H * 0.4);
        const yy = y + colShift - (worldCellI % 2 ? CELL_H * 0.2 : 0);

        const seed = hash(worldCellI, worldCellJ);
        const z = Math.sin(t * 0.6 + seed * 6.28) * 0.25 - seed * 0.4;

        tile.mesh.position.set(x, yy, z);

        const isHover = tile === hoveredTile;
        const targetScale = isHover ? 1.12 : 1;
        tile.mesh.scale.x += (targetScale - tile.mesh.scale.x) * 0.15;
        tile.mesh.scale.y += (targetScale - tile.mesh.scale.y) * 0.15;

        const product = products[pIdx];
        const matches =
          q.length === 0 ||
          product.name.toLowerCase().includes(q) ||
          product.tag.toLowerCase().includes(q);
        const targetOp = matches ? 1 : 0.12;
        tile.mesh.material.opacity +=
          (targetOp - tile.mesh.material.opacity) * 0.1;

        tile.mesh.rotation.y +=
          (velocity.x * 0.4 - tile.mesh.rotation.y) * 0.1;
        tile.mesh.rotation.x +=
          (-velocity.y * 0.4 - tile.mesh.rotation.x) * 0.1;
      }

      camera.position.x += (pointer.x * 0.3 - camera.position.x) * 0.04;
      camera.position.y += (pointer.y * 0.2 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    }
    setReady(true);
    frame();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('wheel', onWheel);
      renderer.domElement.removeEventListener('click', onClick);
      tiles.forEach((t) => {
        t.mesh.geometry.dispose();
        t.mesh.material.dispose();
      });
      textures.forEach((t) => t.dispose());
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [onHover, onSelect]);

  return (
    <div ref={mountRef} className="absolute inset-0" aria-hidden={!ready} />
  );
}
