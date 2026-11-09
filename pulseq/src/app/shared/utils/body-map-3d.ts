export interface Body3DController {
  sync: (areaKey: string) => void;
  destroy: () => void;
}

export function init3DBody(
  st: HTMLElement,
  getSelectedKey: () => string,
  onSelectKey: (k: string) => void,
  getAreaLabel: (k: string) => string
): Body3DController | null {
  const win = window as any;
  const T = win.THREE;
  if (!T || !st) return null;

  let renderer: any;
  try {
    renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch (e) {
    return null;
  }

  const host = document.createElement('div');
  host.className = 'bm-gl';
  st.appendChild(host);

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const cv = renderer.domElement;
  host.appendChild(cv);
  cv.setAttribute('role', 'img');
  cv.setAttribute('aria-label', 'Interactive 3D human body. Drag to rotate, tap a part, or use the buttons to choose an area.');

  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(34, 0.557, 0.1, 100);
  camera.position.set(0, 0, 17.5);

  scene.add(new T.AmbientLight(0xffffff, 0.8));
  const kl = new T.DirectionalLight(0xffffff, 0.9);
  kl.position.set(4, 6, 8);
  scene.add(kl);

  const rl = new T.PointLight(0x5fa3ff, 1.3, 40);
  rl.position.set(-6, 2, -6);
  scene.add(rl);

  const body = new T.Group();
  scene.add(body);

  const gSkin = new T.Group();
  const gOrg = new T.Group();
  const gBone = new T.Group();
  body.add(gSkin);
  body.add(gOrg);
  body.add(gBone);

  const parts: any[] = [];
  const V = (x: number, y: number, z: number) => new T.Vector3(x, y, z);
  const SH = 0x9cc8ff;
  const BONE = 0xf1ebdd;

  function M(c: number, o?: number) {
    return new T.MeshStandardMaterial({
      color: c,
      roughness: 0.55,
      metalness: 0.05,
      transparent: true,
      opacity: o == null ? 1 : o,
      emissive: 0x000000
    });
  }

  function reg(m: any, spec: string, shell: boolean, g: any) {
    m.userData.spec = spec;
    m.userData.shell = !!shell;
    m.userData.op = m.material.opacity;
    if (shell) {
      m.add(
        new T.Mesh(
          m.geometry,
          new T.MeshBasicMaterial({ color: 0xc9e3ff, wireframe: true, transparent: true, opacity: 0.14 })
        )
      );
    }
    g.add(m);
    parts.push(m);
    return m;
  }

  function ell(g: any, spec: string, shell: boolean, c: number, o: number, x: number, y: number, z: number, rx: number, ry: number, rz: number) {
    const m = new T.Mesh(new T.SphereGeometry(1, 26, 18), M(c, o));
    m.position.set(x, y, z);
    m.scale.set(rx, ry, rz);
    return reg(m, spec, shell, g);
  }

  function seg(g: any, spec: string, shell: boolean, c: number, o: number, a: any, b: any, r1: number, r2: number) {
    const d = new T.Vector3().subVectors(b, a);
    const len = d.length();
    const m = new T.Mesh(new T.CylinderGeometry(r2, r1, len, 16, 1), M(c, o));
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize());
    return reg(m, spec, shell, g);
  }

  /* skin shell */
  ell(gSkin, 'neuro', true, SH, 0.3, 0, 3.7, 0, 0.62, 0.72, 0.66);
  seg(gSkin, 'neuro', true, SH, 0.3, V(0, 3.15, 0), V(0, 2.85, 0), 0.2, 0.23);
  ell(gSkin, 'heart', true, SH, 0.3, 0, 1.95, 0, 1.08, 1.0, 0.62);
  ell(gSkin, 'general', true, SH, 0.3, 0, 0.6, 0, 0.92, 0.85, 0.55);
  ell(gSkin, 'general', true, SH, 0.3, 0, -0.4, 0, 0.98, 0.6, 0.58);

  [-1, 1].forEach(s => {
    ell(gSkin, 'skin', true, SH, 0.3, s * 1.25, 2.6, 0, 0.34, 0.34, 0.34);
    seg(gSkin, 'skin', true, SH, 0.3, V(s * 1.3, 2.55, 0), V(s * 1.6, 1.15, 0), 0.3, 0.24);
    ell(gSkin, 'skin', true, SH, 0.3, s * 1.6, 1.15, 0, 0.25, 0.25, 0.25);
    seg(gSkin, 'skin', true, SH, 0.3, V(s * 1.6, 1.15, 0), V(s * 1.75, -0.15, 0), 0.24, 0.17);
    ell(gSkin, 'skin', true, SH, 0.3, s * 1.78, -0.55, 0, 0.2, 0.36, 0.14);
    seg(gSkin, 'bones', true, SH, 0.3, V(s * 0.48, -0.8, 0), V(s * 0.58, -2.65, 0), 0.46, 0.34);
    ell(gSkin, 'bones', true, SH, 0.3, s * 0.58, -2.65, 0, 0.34, 0.34, 0.34);
    seg(gSkin, 'bones', true, SH, 0.3, V(s * 0.58, -2.65, 0), V(s * 0.6, -4.25, 0), 0.32, 0.2);
    ell(gSkin, 'bones', true, SH, 0.3, s * 0.6, -4.5, 0.35, 0.24, 0.14, 0.5);
  });

  /* organs */
  ell(gOrg, 'neuro', false, 0xf4a6b8, 1, 0, 3.88, 0, 0.46, 0.36, 0.48);
  [-1, 1].forEach(s => {
    ell(gOrg, 'eye', false, 0xffffff, 1, s * 0.22, 3.72, 0.5, 0.11, 0.11, 0.11);
    const eyePupil = new T.Mesh(new T.SphereGeometry(1, 12, 10), M(0x2f7bff, 1));
    eyePupil.position.set(s * 0.22, 3.72, 0.6);
    eyePupil.scale.set(0.055, 0.055, 0.04);
    eyePupil.userData.spec = 'eye';
    eyePupil.userData.shell = false;
    eyePupil.userData.op = 1;
    gOrg.add(eyePupil);
    parts.push(eyePupil);

    ell(gOrg, 'general', false, 0xf7b2bd, 1, s * 0.55, 2.15, 0, 0.38, 0.7, 0.38);
    ell(gOrg, 'general', false, 0x8b2e3a, 1, s * 0.45, 0.9, -0.3, 0.15, 0.24, 0.12);
  });

  for (let i = -3; i <= 3; i++) {
    const tz = 0.5 - Math.abs(i) * 0.045;
    const tm = new T.Mesh(new T.BoxGeometry(0.075, 0.1, 0.05), M(0xffffff, 1));
    tm.position.set(i * 0.07, 3.3, tz);
    tm.rotation.y = i * 0.12;
    tm.userData.spec = 'dental';
    tm.userData.shell = false;
    tm.userData.op = 1;
    gOrg.add(tm);
    parts.push(tm);
  }

  const heart = ell(gOrg, 'heart', false, 0xe5484d, 1, 0.28, 2.0, 0.25, 0.3, 0.34, 0.27);
  const hs = heart.scale.clone();
  seg(gOrg, 'heart', false, 0xe5484d, 1, V(0.15, 2.3, 0.2), V(0.05, 2.65, 0.15), 0.1, 0.08);
  ell(gOrg, 'general', false, 0x9c4a32, 1, -0.45, 1.1, 0.2, 0.6, 0.28, 0.35);
  const stm = ell(gOrg, 'general', false, 0xe8836b, 1, 0.3, 1.0, 0.25, 0.33, 0.24, 0.25);
  stm.rotation.z = 0.5;

  [0.62, 0.32, 0.02].forEach((y, k) => {
    const m = new T.Mesh(new T.TorusGeometry(0.46 - k * 0.03, 0.13, 10, 26), M(0xf0a878, 1));
    m.rotation.x = Math.PI / 2;
    m.position.set(0, y, 0.1);
    m.userData.spec = 'general';
    m.userData.shell = false;
    m.userData.op = 1;
    gOrg.add(m);
    parts.push(m);
  });
  ell(gOrg, 'general', false, 0xd98c9a, 1, 0, -0.55, 0.2, 0.2, 0.2, 0.2);

  /* skeleton */
  for (let v = 0; v < 24; v++) {
    const vm = new T.Mesh(new T.CylinderGeometry(0.11, 0.11, 0.1, 10), M(BONE, 1));
    vm.position.set(0, 3.0 - v * 0.155, -0.42 - 0.08 * Math.sin((v / 24) * Math.PI));
    vm.userData.spec = 'bones';
    vm.userData.shell = false;
    vm.userData.op = 1;
    gBone.add(vm);
    parts.push(vm);
  }

  for (let r = 0; r < 8; r++) {
    const y = 2.85 - r * 0.22;
    const f = Math.sqrt(Math.max(0.05, 1 - Math.pow((y - 1.95) / 1.05, 2))) * 0.93;
    const geom = new T.TorusGeometry(1, 0.035, 6, 30, Math.PI * 1.5);
    geom.rotateZ(Math.PI * 0.75);
    const rb = new T.Mesh(geom, M(BONE, 1));
    rb.rotation.x = Math.PI / 2;
    rb.scale.set(1.04 * f, 0.58 * f, 1);
    rb.position.set(0, y, 0);
    rb.userData.spec = 'bones';
    rb.userData.shell = false;
    rb.userData.op = 1;
    gBone.add(rb);
    parts.push(rb);
  }

  const stn = new T.Mesh(new T.BoxGeometry(0.13, 1.1, 0.05), M(BONE, 1));
  stn.position.set(0, 2.15, 0.57);
  stn.userData.spec = 'bones';
  stn.userData.shell = false;
  stn.userData.op = 1;
  gBone.add(stn);
  parts.push(stn);

  const pel = new T.Mesh(new T.TorusGeometry(0.62, 0.12, 8, 24), M(BONE, 1));
  pel.rotation.x = Math.PI / 2;
  pel.scale.set(1, 0.8, 1);
  pel.position.set(0, -0.35, 0);
  pel.userData.spec = 'bones';
  pel.userData.shell = false;
  pel.userData.op = 1;
  gBone.add(pel);
  parts.push(pel);

  [-1, 1].forEach(s => {
    seg(gBone, 'bones', false, BONE, 1, V(0, 2.85, 0.3), V(s * 1.15, 2.7, 0.1), 0.05, 0.05);
    ell(gBone, 'bones', false, BONE, 1, s * 1.25, 2.6, 0, 0.17, 0.17, 0.17);
    seg(gBone, 'bones', false, BONE, 1, V(s * 1.3, 2.55, 0), V(s * 1.6, 1.15, 0), 0.09, 0.08);
    ell(gBone, 'bones', false, BONE, 1, s * 1.6, 1.15, 0, 0.13, 0.13, 0.13);
    seg(gBone, 'bones', false, BONE, 1, V(s * 1.6, 1.15, 0), V(s * 1.75, -0.15, 0), 0.07, 0.05);
    ell(gBone, 'bones', false, BONE, 1, s * 0.48, -0.8, 0, 0.2, 0.2, 0.2);
    seg(gBone, 'bones', false, BONE, 1, V(s * 0.48, -0.8, 0), V(s * 0.58, -2.65, 0), 0.14, 0.12);
    ell(gBone, 'bones', false, BONE, 1, s * 0.58, -2.65, 0, 0.18, 0.18, 0.18);
    seg(gBone, 'bones', false, BONE, 1, V(s * 0.58, -2.65, 0), V(s * 0.6, -4.25, 0), 0.1, 0.07);
  });

  const L: Record<string, boolean> = { skin: true, organs: true, bones: false };
  let hover: string | null = null;
  let lastK: string | null = null;
  const ANCH: Record<string, any> = {
    neuro: V(0, 4.1, 0),
    eye: V(0.22, 3.72, 0.6),
    dental: V(0, 3.3, 0.55),
    heart: V(0.28, 2.0, 0.3),
    general: V(0, 0.9, 0.4),
    skin: V(-1.78, -0.1, 0),
    bones: V(0.58, -2.65, 0.2)
  };

  function paint() {
    const curK = getSelectedKey();
    const shellOp = (L['organs'] || L['bones']) ? 0.24 : 0.82;
    parts.forEach(m => {
      const s = m.userData.spec;
      const sel = s === curK;
      const mat = m.material;
      mat.emissive.setHex(sel || s === hover ? 0x2f7bff : 0);
      mat.emissiveIntensity = sel ? 0.9 : (s === hover ? 0.5 : 0);
      if (m.userData.shell) {
        m.userData.op = shellOp;
        mat.opacity = shellOp + (sel ? 0.22 : (s === hover ? 0.1 : 0));
      }
    });
    gSkin.visible = L['skin'];
    gOrg.visible = L['organs'];
    gBone.visible = L['bones'];
  }

  const ray = new T.Raycaster();
  const mv = new T.Vector2();

  function pick(e: PointerEvent): string | null {
    const r = cv.getBoundingClientRect();
    mv.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
    ray.setFromCamera(mv, camera);
    const hits = ray.intersectObjects(parts.filter(m => m.parent.visible), false);
    const inner = hits.filter((h: any) => !h.object.userData.shell);
    const h = inner[0] || hits[0];
    return h ? h.object.userData.spec : null;
  }

  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let yaw = 0.55;
  let pitch = 0;
  let tgt: number | null = null;
  let pause = 0;
  let drag: any = null;
  let running = false;
  let last = 0;
  let vis = true;
  const v3 = new T.Vector3();

  cv.addEventListener('pointerdown', (e: PointerEvent) => {
    drag = { x: e.clientX, y: e.clientY, yaw, pitch, moved: false };
    tgt = null;
    try { cv.setPointerCapture(e.pointerId); } catch (x) {}
  });

  cv.addEventListener('pointermove', (e: PointerEvent) => {
    if (drag) {
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 6) drag.moved = true;
      if (drag.moved) {
        yaw = drag.yaw + dx * 0.012;
        pitch = Math.max(-0.35, Math.min(0.35, drag.pitch + dy * 0.006));
      }
    } else {
      const s = pick(e);
      if (s !== hover) {
        hover = s;
        cv.style.cursor = s ? 'pointer' : 'grab';
        paint();
      }
    }
  });

  cv.addEventListener('pointerup', (e: PointerEvent) => {
    const d = drag;
    drag = null;
    pause = performance.now() + 4000;
    if (d && !d.moved) {
      const s = pick(e);
      if (s) {
        onSelectKey(s);
        paint();
      }
    }
  });

  cv.addEventListener('pointercancel', () => { drag = null; });
  cv.addEventListener('pointerleave', () => { if (hover) { hover = null; paint(); } });

  function size() {
    const w = st.clientWidth;
    const h = st.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  const ro = (window as any).ResizeObserver ? new ResizeObserver(() => size()) : null;
  if (ro) ro.observe(st);
  size();

  function frame(t: number) {
    if (!running) return;
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (t - last) / 1000 || 0);
    last = t;

    if (tgt != null) {
      yaw += (tgt - yaw) * Math.min(1, dt * 6);
      if (Math.abs(tgt - yaw) < 0.01) {
        yaw = tgt;
        tgt = null;
      }
    } else if (!drag && !reduced && t > pause) {
      yaw += dt * 0.35;
    }

    body.rotation.y = yaw;
    body.rotation.x = pitch;

    const k = reduced ? 1 : 1 + 0.07 * Math.max(0, Math.sin(t / 190));
    heart.scale.set(hs.x * k, hs.y * k, hs.z * k);

    const curK = getSelectedKey();
    const lb = st.querySelector('#bmLbl') as HTMLElement;
    const a = ANCH[curK];
    if (lb) {
      if (a) {
        v3.copy(a);
        body.localToWorld(v3);
        v3.project(camera);
        lb.hidden = false;
        lb.textContent = getAreaLabel(curK);
        lb.style.left = `${(v3.x * 0.5 + 0.5) * st.clientWidth}px`;
        lb.style.top = `${(-v3.y * 0.5 + 0.5) * st.clientHeight}px`;
      } else {
        lb.hidden = true;
      }
    }

    renderer.render(scene, camera);
  }

  function run() {
    const want = vis && !document.hidden;
    if (want && !running) {
      running = true;
      last = performance.now();
      requestAnimationFrame(frame);
    } else if (!want) {
      running = false;
    }
  }

  let io: IntersectionObserver | null = null;
  if ((window as any).IntersectionObserver) {
    io = new IntersectionObserver(es => {
      vis = es[0].isIntersecting;
      run();
    });
    io.observe(st);
  }

  const onVisChange = () => run();
  document.addEventListener('visibilitychange', onVisChange);

  /* Layer Buttons (Skin, Organs, Skeleton) */
  const ui = document.createElement('div');
  ui.className = 'bm-layers';
  ui.setAttribute('role', 'group');
  ui.setAttribute('aria-label', 'Body layers');

  const layerDefs = [
    ['skin', 'Skin'],
    ['organs', 'Organs'],
    ['bones', 'Skeleton']
  ];

  layerDefs.forEach(l => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = l[1];
    b.setAttribute('aria-pressed', String(L[l[0]]));
    b.addEventListener('click', () => {
      const n = !L[l[0]];
      if (!n && Object.keys(L).filter(x => L[x]).length === 1) return;
      L[l[0]] = n;
      b.setAttribute('aria-pressed', String(n));
      paint();
    });
    ui.appendChild(b);
  });

  const hint = document.createElement('p');
  hint.className = 'bm-hint';
  hint.textContent = 'Drag to rotate · tap a part to choose it';

  st.parentNode?.appendChild(ui);
  st.parentNode?.appendChild(hint);
  st.classList.add('bm-3d');
  size();

  paint();
  run();

  return {
    sync: (k: string) => {
      if (lastK !== k) {
        lastK = k;
        tgt = Math.round(yaw / (Math.PI * 2)) * Math.PI * 2;
        pause = performance.now() + 7000;
      }
      paint();
    },
    destroy: () => {
      running = false;
      if (ro) ro.disconnect();
      if (io) io.disconnect();
      document.removeEventListener('visibilitychange', onVisChange);
      ui.remove();
      hint.remove();
      host.remove();
      st.classList.remove('bm-3d');
    }
  };
}
