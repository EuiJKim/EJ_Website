// Selected Work — 3D 무대
// 목록(.work-item)에서 화면 가운데에 온 프로젝트의 화면 판을 무대(#stage-cv)에 띄운다.
// 원칙: 글이 먼저(이 파일은 페이지가 다 뜬 뒤에 불린다) · 만지지 않아도 다 보인다(스크롤만) ·
//       움직임 줄이기 설정을 따른다 · 3D가 안 되면 그림 한 장.
const items = [...document.querySelectorAll('.work-item')];
const stage = document.getElementById('stage');
const cv = document.getElementById('stage-cv');
const fb = document.getElementById('stage-fb');
const count = document.getElementById('stage-count');

// 프로젝트마다 판 구성 — [그림, 가로/세로 비, x, y, z, 기울기(y축), 크기]. 마지막이 맨 앞 판.
const SETS = {
  allaw: [['allaw-3', 16 / 9, -0.62, 0.50, -0.9, 0.20, 1.5], ['allaw-2', 16 / 9, 0.66, -0.52, -0.45, -0.16, 1.5], ['allaw-1', 16 / 9, 0, 0, 0, 0, 2.2]],
  clog: [['clog-2', 9 / 16, -0.98, 0.06, -0.5, 0.24, 1.5], ['clog-3', 9 / 16, 0.98, -0.06, -0.5, -0.24, 1.5], ['clog-1', 9 / 16, 0, 0, 0, 0, 1.75]],
  eel: [['eel-1', 4 / 5, 0, 0, 0, 0, 1.75]],
  ax: [['ax-1', 16 / 10, 0, 0, 0, 0, 2.3]],
  copy: [['copy-1', 16 / 10, 0, 0, 0, 0, 2.3]],
  ease: [['ease-2', 16 / 10, -0.6, 0.48, -0.9, 0.2, 1.5], ['ease-3', 16 / 10, 0.64, -0.5, -0.45, -0.16, 1.5], ['ease-1', 16 / 10, 0, 0, 0, 0, 2.2]],
};
const keys = items.map((el) => el.dataset.k);
const TEX = 'assets/stage/';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const narrow = () => innerWidth <= 768;

// 스크롤 → 0..n-1 사이의 연속 값(기준선이 어느 두 항목 사이에 있나)
function progress() {
  const mid = innerHeight * (narrow() ? 0.66 : 0.5);
  const cs = items.map((el) => { const r = el.getBoundingClientRect(); return r.top + Math.min(r.height, 220) * 0.5; });
  if (mid <= cs[0]) return 0;
  for (let i = 0; i < cs.length - 1; i++) if (mid < cs[i + 1]) return i + (mid - cs[i]) / (cs[i + 1] - cs[i]);
  return cs.length - 1;
}
let lastOn = -1;
function mark(p) {
  const a = Math.round(p);
  if (a === lastOn) return a;
  lastOn = a;
  items.forEach((el, i) => el.classList.toggle('on', i === a));
  if (count) count.textContent = `${String(a + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
  return a;
}
function flat() {   // 3D 없이 — 맨 앞 판 그림 한 장
  stage.classList.add('nogl');
  const upd = () => { const a = Math.round(progress()); lastOn = -1; mark(a); const src = `${TEX}${SETS[keys[a]].at(-1)[0]}.jpg`; if (!fb.src.endsWith(src)) fb.src = src; };
  addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
}

async function start() {
  if (!items.length || !stage || !cv) return;
  mark(progress());
  let THREE;
  try { THREE = await import('./vendor/three.module.min.js'); } catch { return flat(); }
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true, powerPreference: 'high-performance' }); } catch { renderer = null; }
  if (!renderer) return flat();

  let dpr = Math.min(devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 50);

  // 둥근 모서리 판(그림이 꼭 맞게 UV를 다시 잡는다)
  function roundedPlane(w, h, r) {
    const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    const g = new THREE.ShapeGeometry(s, 10), pos = g.attributes.position, uv = g.attributes.uv;
    for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) + w / 2) / w, (pos.getY(i) + h / 2) / h);
    return g;
  }
  // 부드러운 그림자 · 스치는 빛(작은 그림 두 장을 코드로 만든다)
  function gradTex(draw) { const c = document.createElement('canvas'); c.width = c.height = 256; draw(c.getContext('2d')); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
  const shadowTex = gradTex((x) => { const g = x.createRadialGradient(128, 128, 8, 128, 128, 128); g.addColorStop(0, 'rgba(0,0,0,.55)'); g.addColorStop(0.55, 'rgba(0,0,0,.16)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 256, 256); });
  const glowTex = gradTex((x) => { const g = x.createRadialGradient(128, 128, 8, 128, 128, 128); g.addColorStop(0, 'rgba(255,255,255,.5)'); g.addColorStop(0.5, 'rgba(255,255,255,.14)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 256, 256); });
  const sheenTex = gradTex((x) => { const g = x.createLinearGradient(0, 0, 256, 256); g.addColorStop(0.30, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,.55)'); g.addColorStop(0.70, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 256, 256); });

  const loader = new THREE.TextureLoader();
  const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const edges = [], shadows = [];
  const groups = keys.map((k) => {
    const G = new THREE.Group(); G.userData = { panels: [], loaded: false, k };
    for (const [name, ar, x, y, z, ry, size] of SETS[k] || []) {
      const w = ar >= 1 ? size : size * ar, h = ar >= 1 ? size / ar : size, rad = Math.min(w, h) * 0.035;
      const P = new THREE.Group(); P.position.set(x, y, z);
      const face = new THREE.Mesh(roundedPlane(w, h, rad), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 }));
      const edge = new THREE.Mesh(roundedPlane(w + 0.014, h + 0.014, rad * 1.05), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })); edge.position.z = -0.004;
      const sheen = new THREE.Mesh(roundedPlane(w, h, rad), new THREE.MeshBasicMaterial({ map: sheenTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); sheen.position.z = 0.003;
      const sh = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.5, h * 0.5), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })); sh.position.set(0, -h * 0.56, -0.25);
      P.add(sh, edge, face, sheen);
      P.userData = { x, y, z, ry, ph: Math.random() * 6.28, name, face: face.material, edge: edge.material, sh: sh.material, sheen: sheen.material, ready: 0 };
      edges.push(edge.material); shadows.push(sh.material);
      G.add(P); G.userData.panels.push(P);
    }
    G.visible = false; scene.add(G); return G;
  });
  // 그림은 가까워진 프로젝트 것부터 받는다
  function ensure(i) {
    const G = groups[i]; if (!G || G.userData.loaded) return;
    G.userData.loaded = true;
    for (const P of G.userData.panels) loader.load(`${TEX}${P.userData.name}.jpg`, (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = maxAniso; P.userData.face.map = t; P.userData.face.needsUpdate = true; P.userData.ready = 1; });
  }

  // 다크 모드 — 판 테두리와 바닥 그림자(어둠 속에서는 은은한 빛)
  let dark = false;
  function theme() {
    dark = document.documentElement.classList.contains('dark');
    for (const m of edges) m.color.set(dark ? 0x2e2e2e : 0xd9d9d4);
    for (const m of shadows) { m.map = dark ? glowTex : shadowTex; m.blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending; m.needsUpdate = true; }
  }
  theme();
  new MutationObserver(theme).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  function fit() {
    const r = cv.parentElement.getBoundingClientRect();
    if (!r.width || !r.height) return;
    renderer.setSize(r.width, r.height, false);
    cam.aspect = r.width / r.height;
    cam.position.set(0, 0, cam.aspect < 1.05 ? 6.8 / Math.max(0.62, cam.aspect) : 7.4);
    cam.updateProjectionMatrix();
  }
  addEventListener('resize', fit); fit();

  let target = progress(), p = target, mx = 0, my = 0, tx = 0, ty = 0, t0 = performance.now(), visible = true, slow = 0, frames = 0;
  addEventListener('scroll', () => { target = progress(); }, { passive: true });
  if (matchMedia('(hover: hover)').matches) addEventListener('pointermove', (e) => { tx = e.clientX / innerWidth - 0.5; ty = e.clientY / innerHeight - 0.5; }, { passive: true });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; t0 = performance.now(); }, { rootMargin: '200px' }).observe(stage);
  document.addEventListener('visibilitychange', () => { t0 = performance.now(); });
  const ease = (v) => v * v * (3 - 2 * v);
  stage.classList.add('gl');

  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible || document.hidden) return;
    const raw = (now - t0) / 1000; t0 = now;
    const dt = Math.min(0.05, raw);
    // 느린 기기 — 화질을 한 번 낮추고, 그래도 느리면 그림 한 장으로
    if (++frames > 30 && raw > 0.045 && raw < 0.5) { if (++slow === 40 && dpr > 1) { dpr = 1; renderer.setPixelRatio(1); fit(); } } else if (slow > 0 && raw < 0.03) slow--;
    const k = reduce ? 1 : 1 - Math.exp(-dt * 7);
    p += (target - p) * k; mx += (tx - mx) * k * 0.6; my += (ty - my) * k * 0.6;
    const a = mark(p);
    ensure(a); ensure(a + 1); ensure(a - 1);
    const t = now / 1000;
    for (let i = 0; i < groups.length; i++) {
      const G = groups[i], d = i - p;                    // 0이면 무대 한가운데
      const al = Math.max(0, Math.min(1, 1 - (Math.abs(d) - 0.22) / 0.5));   // 가운데 가까이에선 온전히, 바뀌는 구간은 짧게
      G.visible = al > 0.002;
      if (!G.visible) continue;
      const e = ease(al);
      G.position.y = -d * 2.2;                            // 위로 지나간다
      G.position.z = -Math.abs(d) * 1.2;
      G.rotation.x = d * 0.5 + my * -0.06;
      G.rotation.y = -0.22 + d * 0.16 + mx * 0.1;
      G.userData.panels.forEach((P, j) => {
        const u = P.userData, spread = 1 + (1 - e) * 0.22;
        if (u.ready && u.ready < 2) u.ready = Math.min(2, u.ready + dt * 3);   // 그림이 오면 스르르
        const on = e * (u.ready ? u.ready - 1 : 0);
        P.position.set(u.x * spread, u.y * spread + (reduce ? 0 : Math.sin(t * 0.6 + u.ph) * 0.018), u.z - (1 - e) * 0.3 * (j + 1));
        P.rotation.y = u.ry * (1 + (1 - e) * 0.8);
        u.face.opacity = on; u.edge.opacity = on; u.sh.opacity = on * (dark ? 0.35 : 0.5);
        u.sheen.opacity = Math.max(0, 1 - Math.abs(d + 0.12) * 5) * (dark ? 0.12 : 0.22) * on;   // 지나가는 순간 빛이 한 번 스친다
      });
    }
    renderer.render(scene, cam);
  }
  requestAnimationFrame(frame);
}

// 글과 목록이 먼저 — 한가해지면 시작한다
if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 1200 }); else setTimeout(start, 200);
