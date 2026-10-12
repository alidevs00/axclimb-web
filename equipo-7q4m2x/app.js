// Kumbra Studio · editor
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 9);
const clone = o => JSON.parse(JSON.stringify(o));
const MARGIN = 88;

// ---------------- state ----------------
let doc = null;          // the design being edited
let slideIx = 0, selId = null;
let designs = [];        // list for "Mis diseños"
let uploads = [];        // [{id,url,name}]
let db = null, user = null, assets = null, downloads = null, me = null;
let dirty = false, saving = false, saveTimer = null, lastSavedJson = '';
const canon = v => Array.isArray(v) ? '[' + v.map(canon).join(',') + ']' : v && typeof v === 'object' ? '{' + Object.keys(v).sort().filter(k => v[k] !== undefined).map(k => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}' : JSON.stringify(v ?? null);
const sig = d => canon(d.slides) + d.name + d.format + (d.caption || '') + (d.date || '') + (d.status || 'Borrador');
const history = []; let future = [];

function newDesign(baseId = 'texto', format = 'post') {
  const d = { id: uid() + uid(), name: 'Diseño sin título', format, caption: '', date: '', status: 'Borrador', slides: [], updatedAt: Date.now() };
  d.slides.push(slideFromBase(baseId, format));
  return d;
}
function slideFromBase(baseId, format) {
  const b = BASES.find(x => x.id === baseId) || BASES[0];
  const dy = format === 'story' ? 285 : 0;
  const layers = b.layers().map(l => ({ id: uid(), ...l, y: l.y + dy }));
  return { id: uid(), bg: b.bg, ink: null, wm: defWM(), num: { on: true, pos: 'Arriba derecha' }, layers };
}
const fmt = () => FORMATS[doc.format] || FORMATS.post;
const CORNERS = ['Arriba izquierda', 'Arriba derecha', 'Abajo izquierda', 'Abajo derecha'];
const LOGO_VERSIONS = ['Montaña + Kumbra al lado', 'Montaña', 'Montaña + Kumbra debajo', 'Icono de la app', 'Clásico de los posts'];
const LOGO_COLORS = ['Automático según el fondo', 'A color · texto blanco', 'A color · texto negro', 'Todo blanco', 'Todo negro'];
const defWM = () => ({ on: true, version: 'Montaña + Kumbra al lado', color: 'Automático según el fondo', pos: 'Arriba izquierda', alto: 56, op: 100 });
// Diseños antiguos: «header» encendía logo y número a la vez.
const wmOf = s => s.wm || (s.header === false ? { ...defWM(), on: false } : { ...defWM(), version: 'Clásico de los posts' });
const numOf = s => s.num || { on: s.header !== false, pos: 'Arriba derecha' };
function cornerCss(pos) {
  const story = doc.format === 'story', top = story ? 290 : 76, bot = story ? 380 : 76;
  return `${/izquierda/.test(pos) ? 'left:88px' : 'right:88px'};${/Arriba/.test(pos) ? `top:${top}px` : `bottom:${bot}px`};`;
}
function marksHTML(s, i, total, ink) {
  const w = wmOf(s), n = numOf(s), col = ink === 'dark' ? '#161416' : '#F4EFE7'; let h = '';
  if (w.on) {
    const inner = w.version === 'Clásico de los posts' ? `<div class="brand" style="color:${col}">${ink === 'dark' ? `<div class="ico">${LOGO(30)}</div>` : LOGO(44)}kumbra</div>`
      : `<img src="${logoSrc(w.version, w.color, ink)}" style="display:block;height:${w.alto}px;width:auto;max-width:none" alt="Kumbra">`;
    h += `<div class="wm" style="position:absolute;${cornerCss(w.pos)}z-index:30;opacity:${(w.op ?? 100) / 100}">${inner}</div>`;
  }
  if (n.on && total > 1) h += `<div style="position:absolute;${cornerCss(n.pos)}z-index:30;font:600 30px/56px I,sans-serif;color:${col};opacity:.55">${i + 1}/${total}</div>`;
  return h;
}
const slide = () => doc.slides[slideIx];
const layer = () => slide()?.layers.find(l => l.id === selId);
const inkOf = s => s.ink || bgById(s.bg).ink;

const defsOf = (e, p) => (e?.dynProps ? e.dynProps(p) : e?.props) || {};
// ---------------- rendering ----------------
// Colores para la palabra destacada (*palabra*). «Automático» = degradado según el fondo, como hasta ahora.
const HL = {
  'Automático': null,
  'Degradado cresta': 'linear-gradient(95deg,#F7CE89,#EE888B 45%,#DF7DB8 72%,#B495F9)',
  'Degradado atardecer': 'linear-gradient(95deg,#F2B44A,#F08A3C 22%,#E5484D 42%,#A7377B 62%,#533794 82%)',
  'Degradado naranja': 'linear-gradient(95deg,#F2B44A,#E8622D 50%,#B8391C)',
  'Naranja Kumbra': '#E8622D', 'Coral': '#EE888B', 'Rosa': '#E0336F', 'Amarillo': '#F2B44A', 'Lima': '#C8FF00',
  'Verde Pro': '#14A085', 'Violeta': '#8C72FF', 'Azul': '#4A82F5', 'Blanco': '#FFFFFF', 'Negro': '#161416',
};
// Colores para el texto entero (titular, subtítulo…). «Automático» = el de siempre según el fondo.
const TC = {
  'Automático': null, 'Negro': '#161416', 'Gris oscuro': '#3D3833', 'Gris': '#6B655F', 'Blanco': '#FFFFFF', 'Crema': '#F4EFE7',
  'Naranja Kumbra': '#E8622D', 'Coral': '#EE888B', 'Violeta': '#8C72FF',
};
// El degradado se recorta a la caja de la palabra: un poco de aire a la derecha y abajo para que no corte la última letra ni la q/g/p.
const GRAD_PAD = 'padding:0 .12em .14em 0;margin-right:-.12em;-webkit-box-decoration-break:clone;box-decoration-break:clone';
function tcOf(l) { return l.tc === 'Personalizado' ? l.tcc || '#161416' : TC[l.tc] || ''; }
function hlStyle(l) { const v = l.hl === 'Personalizado' ? l.hlc || '#E8622D' : HL[l.hl]; if (!v) return '';
  return v.startsWith('linear') ? `background:${v};-webkit-background-clip:text;background-clip:text;color:transparent;${GRAD_PAD}` : `background:none;-webkit-background-clip:border-box;background-clip:border-box;color:${v}`; }
function textHTML(l, ink) {
  const st = TEXT_STYLES[l.style] || TEXT_STYLES.sub;
  let t = esc(l.text || '').replace(/\*([^*]+)\*/g, '<em>$1</em>').replace(/\n/g, '<br>');
  if (l.style === 'num') t = t.replace(/<em>/g, '<em class="grad">');
  if (l.style === 'lista') t = String(l.text || '').split('\n').filter(Boolean).map(r => `<div class="li2"><span class="ck2"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span><span>${esc(r).replace(/\*([^*]+)\*/g, '<em>$1</em>')}</span></div>`).join('');
  const size = l.style === 'h' && st.sizes ? `font-size:${st.sizes[l.size || 'L']}px;` : (l.fs ? `font-size:${l.fs}px;` : '');
  const w = l.w ? `width:${l.w}px;` : '';
  const al = l.align ? `text-align:${l.align};` : '';
  const hs = hlStyle(l); if (hs) t = t.replace(/<em( class="grad")?>/g, `<em style="${hs}">`);
  const tc = tcOf(l), col = tc ? `color:${tc};` : '';
  return `<div class="${st.cls} t-${l.style}" style="position:relative;left:0;right:auto;top:0;${w}${size}${al}${col}">${t}</div>`;
}
function layerInner(l, ink) {
  if (l.t === 'text') return textHTML(l, ink);
  if (l.t === 'img') return `<img src="${esc(l.src)}" style="display:block;width:${l.w || 600}px;height:auto;border-radius:${l.round || 0}px" alt="">`;
  const e = elById(l.el); if (!e) return '';
  const p = {}; for (const [k, d] of Object.entries(defsOf(e, l.p || {}))) if (!d.heading) p[k] = l.p?.[k] ?? d.def;
  try { return e.render(p, ink); } catch (err) { return `<div style="color:red;font:30px I">${esc(err.message)}</div>`; }
}
function bgHTML(s) {
  const b = bgById(s.bg);
  if (b.upload) { const u = uploads.find(x => x.id === b.upload); return u ? `<img class="bgimg" src="${esc(u.url)}" alt="">` : ''; }
  if (b.img) return `<img class="bgimg" src="bg/${b.img}.jpg" alt="">`;
  return '';
}
// One slide as HTML at full size (1080 x H)
function slideHTML(s, i, total, { editing = false } = {}) {
  const ink = inkOf(s), b = bgById(s.bg);
  const cls = ink === 'dark' ? 'cream' : 'dark';
  const bgCss = b.css ? `background:${b.css};` : 'background:#000;';
  const glow = b.glow ? '' : ' noglow';
  const hdr = marksHTML(s, i, total, ink);
  const layers = s.layers.map((l, z) => {
    const tr = `rotate(${l.r || 0}deg) scale(${l.s || 1})`;
    return `<div class="lay${editing && l.id === selId ? ' sel' : ''}" data-id="${l.id}" style="left:${l.x}px;top:${l.y}px;z-index:${10 + z};transform:${tr}">${layerInner(l, ink)}</div>`;
  }).join('');
  return `<div class="p ${cls}${glow}${doc.format === "story" ? " story" : ""}" style="${bgCss}">${bgHTML(s)}${hdr}${layers}</div>`;
}

// ---------------- editor canvas ----------------
const stage = $('#stage'), art = $('#art'), frame = $('#frame');
let scale = 0.5;
function fit() {
  const f = fmt(), box = stage.getBoundingClientRect();
  const pad = 28;
  scale = Math.min((box.width - pad * 2) / f.w, (box.height - pad * 2) / f.h);
  scale = Math.max(.12, Math.min(scale, 1));
  frame.style.width = f.w * scale + 'px'; frame.style.height = f.h * scale + 'px';
  art.style.width = f.w + 'px'; art.style.height = f.h + 'px';
  art.style.transform = `scale(${scale})`;
}
function renderCanvas() {
  const f = fmt();
  art.innerHTML = slideHTML(slide(), slideIx, doc.slides.length, { editing: true }) + guidesHTML(f);
  art.dataset.format = doc.format;
  measureSel();
}
function guidesHTML(f) {
  const g = [];
  if (showGuides) {
    g.push(`<div class="gd gv" style="left:${MARGIN}px"></div><div class="gd gv" style="left:${f.w - MARGIN}px"></div><div class="gd gv c" style="left:${f.w / 2}px"></div>`);
    if (doc.format === 'story') g.push(`<div class="safe" style="top:0;height:250px"><span>Zona tapada por Instagram</span></div><div class="safe" style="bottom:0;height:340px"><span>Zona tapada por Instagram</span></div>`);
    else g.push(`<div class="crop" style="left:${(1080 - 1012) / 2}px;width:1012px"><span>Lo que se ve en la cuadrícula del perfil</span></div>`);
  }
  return `<div class="guides">${g.join('')}<div class="snapline" id="snapx"></div><div class="snapline h" id="snapy"></div></div>`;
}
function measureSel() {
  const box = $('#selbox');
  const el = selId && art.querySelector(`.lay[data-id="${selId}"]`);
  if (!el) { box.hidden = true; return; }
  const r = layerRect(el), fr = frame.getBoundingClientRect();
  box.hidden = false;
  Object.assign(box.style, { left: r.left - fr.left + 'px', top: r.top - fr.top + 'px', width: r.width + 'px', height: r.height + 'px' });
}
// bounding box of a layer including absolutely positioned children
function layerRect(el) {
  let L = Infinity, T = Infinity, R = -Infinity, B = -Infinity;
  const take = n => { const r = n.getBoundingClientRect(); if (r.width + r.height === 0) return; L = Math.min(L, r.left); T = Math.min(T, r.top); R = Math.max(R, r.right); B = Math.max(B, r.bottom); };
  take(el); for (const c of el.children) take(c);
  if (L === Infinity) { const r = el.getBoundingClientRect(); return r; }
  return { left: L, top: T, width: R - L, height: B - T, right: R, bottom: B };
}

// drag / select
let drag = null;
art.addEventListener('pointerdown', e => {
  const lay = e.target.closest('.lay');
  if (!lay) { select(null); return; }
  const l = slide().layers.find(x => x.id === lay.dataset.id); if (!l) return;
  select(l.id);
  if (l.locked) return;
  e.preventDefault();
  const r = layerRect(lay);
  drag = { id: l.id, sx: e.clientX, sy: e.clientY, x0: l.x, y0: l.y, w: r.width / scale, h: r.height / scale, offx: (r.left - lay.getBoundingClientRect().left) / scale, offy: (r.top - lay.getBoundingClientRect().top) / scale, moved: false };
  art.setPointerCapture(e.pointerId);
});
art.addEventListener('pointermove', e => {
  if (!drag) return;
  const l = slide().layers.find(x => x.id === drag.id); if (!l) return;
  let nx = drag.x0 + (e.clientX - drag.sx) / scale, ny = drag.y0 + (e.clientY - drag.sy) / scale;
  if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 3) return;
  if (!drag.moved) { snapshot(); drag.moved = true; }
  const f = fmt(), th = 14 / scale;
  const left = nx + drag.offx, right = left + drag.w, cx = left + drag.w / 2;
  let sx = null;
  if (!e.altKey) {
    if (Math.abs(left - MARGIN) < th) { nx += MARGIN - left; sx = MARGIN; }
    else if (Math.abs(right - (f.w - MARGIN)) < th) { nx += f.w - MARGIN - right; sx = f.w - MARGIN; }
    else if (Math.abs(cx - f.w / 2) < th) { nx += f.w / 2 - cx; sx = f.w / 2; }
  }
  let sy = null;
  const top = ny + drag.offy, cy = top + drag.h / 2;
  if (!e.altKey && Math.abs(cy - f.h / 2) < th) { ny += f.h / 2 - cy; sy = f.h / 2; }
  l.x = Math.round(nx); l.y = Math.round(ny);
  const el = art.querySelector(`.lay[data-id="${l.id}"]`); el.style.left = l.x + 'px'; el.style.top = l.y + 'px';
  const gx = $('#snapx'), gy = $('#snapy');
  gx.style.display = sx === null ? 'none' : 'block'; if (sx !== null) gx.style.left = sx + 'px';
  gy.style.display = sy === null ? 'none' : 'block'; if (sy !== null) gy.style.top = sy + 'px';
  measureSel();
});
const endDrag = () => { if (drag?.moved) { changed(); renderProps(); } drag = null; $('#snapx') && ($('#snapx').style.display = 'none'); $('#snapy') && ($('#snapy').style.display = 'none'); };
art.addEventListener('pointerup', endDrag); art.addEventListener('pointercancel', endDrag);

// resize handle: scales elements, widens text
let rs = null;
$('#selbox .h-br').addEventListener('pointerdown', e => {
  const l = layer(); if (!l) return; e.preventDefault(); e.stopPropagation(); snapshot();
  const el = art.querySelector(`.lay[data-id="${l.id}"]`), r = layerRect(el);
  rs = { sx: e.clientX, w0: r.width / scale, s0: l.s || 1, tw0: l.w || r.width / scale, fs0: l.fs };
  e.target.setPointerCapture(e.pointerId);
});
$('#selbox .h-br').addEventListener('pointermove', e => {
  if (!rs) return; const l = layer(); if (!l) return;
  const dx = (e.clientX - rs.sx) / scale;
  if (l.t === 'text') l.w = Math.max(120, Math.round(rs.tw0 + dx));
  else if (l.t === 'img') l.w = Math.max(80, Math.round((l.w || 600) + 0) && Math.round(rs.tw0 + dx));
  else l.s = Math.max(.15, +(rs.s0 * (rs.w0 + dx) / rs.w0).toFixed(3));
  renderCanvas();
});
$('#selbox .h-br').addEventListener('pointerup', () => { if (rs) { rs = null; changed(); renderProps(); } });

// keyboard
document.addEventListener('keydown', e => {
  const tag = (e.target.tagName || '').toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) return;
  const l = layer();
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd' && l) { e.preventDefault(); dupLayer(); return; }
  if (!l) return;
  if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); delLayer(); return; }
  const step = e.shiftKey ? 10 : 1, m = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
  if (m) { e.preventDefault(); snapshot(); l.x += m[0]; l.y += m[1]; renderCanvas(); changed(); }
});

// ---------------- history ----------------
function snapshot() { history.push(JSON.stringify(doc)); if (history.length > 80) history.shift(); future = []; }
function undo() { if (!history.length) return; future.push(JSON.stringify(doc)); doc = JSON.parse(history.pop()); slideIx = Math.min(slideIx, doc.slides.length - 1); renderAll(); changed(); }
function redo() { if (!future.length) return; history.push(JSON.stringify(doc)); doc = JSON.parse(future.pop()); renderAll(); changed(); }

// ---------------- actions ----------------
function select(id) { selId = id; $$('.lay', art).forEach(n => n.classList.toggle('sel', n.dataset.id === id)); measureSel(); renderProps(); }
function addLayer(l) { snapshot(); l.id = uid(); slide().layers.push(l); selId = l.id; renderCanvas(); renderProps(); changed(); }
function delLayer() { const s = slide(); snapshot(); s.layers = s.layers.filter(x => x.id !== selId); selId = null; renderCanvas(); renderProps(); changed(); }
function dupLayer() { const l = layer(); if (!l) return; snapshot(); const c = clone(l); c.id = uid(); c.x += 30; c.y += 30; slide().layers.push(c); selId = c.id; renderCanvas(); renderProps(); changed(); }
function moveZ(d) { const s = slide(), i = s.layers.findIndex(x => x.id === selId), j = i + d; if (i < 0 || j < 0 || j >= s.layers.length) return; snapshot(); [s.layers[i], s.layers[j]] = [s.layers[j], s.layers[i]]; renderCanvas(); changed(); }
function setSlide(i) { slideIx = Math.max(0, Math.min(i, doc.slides.length - 1)); selId = null; renderAll(); }

// ---------------- ahorro de espacio ----------------
// Antes de subir, cada foto se reduce (lado largo máx.) y se pasa a JPEG: una foto de móvil de 4–8 MB queda en ~250–400 KB.
async function shrink(file, maxSide = 1600, q = 0.82) {
  try {
    if (!/^image\/(jpeg|png|webp|heic|heif)/i.test(file.type) && !/\.(jpe?g|png|webp|heic)$/i.test(file.name)) return file;
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, maxSide / Math.max(bmp.width, bmp.height)), w = Math.round(bmp.width * k), h = Math.round(bmp.height * k);
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.drawImage(bmp, 0, 0, w, h);
    const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', q));
    return blob && blob.size < file.size ? new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' }) : file;
  } catch (e) { return file; }
}
const slideUsesBg = bg => allDesignsSafe().some(d => d.slides?.some(s => s.bg === bg));
async function dropAsset(id) { if (!assets || !id) return; try { await assets.delete(id); } catch (e) {} }
const usedIn = url => allDesignsSafe().some(d => JSON.stringify(d.slides).includes(url));
const allDesignsSafe = () => { try { return allDesigns(); } catch (e) { return designs; } };

// ---------------- left panel ----------------
function renderLeft(tab = currentTab) {
  currentTab = tab;
  $$('#ltabs button').forEach(b => b.setAttribute('aria-pressed', b.dataset.tab === tab));
  const box = $('#lbody');
  if (tab === 'bases') {
    box.innerHTML = `<p class="hint">Cambia la lámina actual por una base. Puedes deshacer con ⌘Z.</p><div class="bases">${BASES.map((b, i) => (i === 0 || BASES[i - 1].group !== b.group ? `<h4>${esc(b.group || '')}</h4>` : '') + `<button class="basebtn" data-base="${b.id}"><div class="mini" data-mini="${b.id}"></div><b>${esc(b.name)}</b><span>${esc(b.desc)}</span></button>`).join('')}</div>`;
    $$('.mini', box).forEach(m => { const s = slideFromBase(m.dataset.mini, doc.format); miniInto(m, s, 0, 1, 150); });
  } else if (tab === 'fondos') {
    const groups = [...new Set(BGS.map(b => b.group))];
    box.innerHTML = `<div class="row"><button class="ghost sm" id="bgAll">Poner este fondo en todas las láminas</button></div>` +
      groups.map(g => `<h4>${g}</h4><div class="bgs">${BGS.filter(b => b.group === g).map(b => `<button class="bgbtn${slide().bg === b.id ? ' on' : ''}" data-bg="${b.id}" title="${esc(b.name)}" style="${b.img ? `background-image:url(bg/t/${b.img}.jpg)` : `background:${b.css}`}"><span>${esc(b.name)}</span></button>`).join('')}</div>`).join('') +
      (uploads.length ? `<h4>Vuestras fotos</h4><div class="bgs">${uploads.map(u => `<button class="bgbtn${slide().bg === 'up:' + u.id ? ' on' : ''}" data-bg="up:${u.id}" style="background-image:url('${esc(u.url)}')"><span>${esc(u.name || 'Foto')}</span></button>`).join('')}</div>` : '');
  } else if (tab === 'texto') {
    box.innerHTML = `<p class="hint">Escribe la palabra destacada entre asteriscos: <code>Cada pegue *cuenta.*</code></p><div class="tstyles">${Object.entries(TEXT_STYLES).map(([k, s]) => `<button class="tsbtn" data-ts="${k}"><span class="tsprev ts-${k}">${esc(s.sample.replace(/\*/g, ''))}</span><small>${s.name}</small></button>`).join('')}</div>`;
  } else if (tab === 'elementos') {
    const groups = [...new Set(ELEMENTS.map(e => e.group))];
    box.innerHTML = groups.map(g => `<h4>${g}</h4><div class="els">${ELEMENTS.filter(e => e.group === g).map(e => `<button class="elbtn" data-el="${e.id}"><div class="elprev" data-prev="${e.id}"></div><span>${esc(e.name)}</span></button>`).join('')}</div>`).join('');
    requestAnimationFrame(() => $$('.elprev', box).forEach(drawElPrev));
  } else if (tab === 'fotos') {
    box.innerHTML = `<p class="hint">Sube fotos del roco o capturas. Las podéis usar como fondo o como imagen suelta.</p>
      <label class="upl" id="uplLabel"><input type="file" id="uplInput" accept="image/*" multiple hidden>Subir fotos</label>
      <p class="hint" id="uplMsg">${assets ? '' : 'Para subir fotos, abre Kumbra Studio con permiso de edición.'}</p>
      <div class="ups">${uploads.map(u => `<div class="up"><img src="${esc(u.url)}" alt=""><div class="upacts"><button class="ghost sm" data-upbg="${u.id}">Fondo</button><button class="ghost sm" data-upimg="${u.id}">Imagen</button><button class="ghost sm danger" data-updel="${u.id}" title="Borrar la foto para liberar espacio">Borrar</button></div></div>`).join('') || '<p class="empty">Todavía no hay fotos.</p>'}</div>`;
    $('#uplLabel').hidden = !assets;
  } else if (tab === 'disenos') {
    renderDesignList(box);
  }
}
let currentTab = 'bases';
function drawElPrev(box) {
  const e = elById(box.dataset.prev), w = box.clientWidth || 120;
  const holder = document.createElement('div'); holder.className = 'p dark noglow prevp'; holder.style.cssText = 'position:absolute;left:0;top:0;width:1080px;height:1080px;background:transparent';
  holder.innerHTML = `<div class="lay" style="left:0;top:0">${layerInner({ t: 'el', el: e.id, p: {} }, 'light')}</div>`;
  box.appendChild(holder);
  const r = layerRect(holder.firstChild), br = holder.getBoundingClientRect();
  const bw = r.width || 400, bh = r.height || 300, k = Math.min(w / bw, 90 / bh) * .92;
  holder.style.transform = `translate(${(w - bw * k) / 2 - (r.left - br.left) * k}px,${(96 - bh * k) / 2 - (r.top - br.top) * k}px) scale(${k})`;
}
function miniInto(el, s, i, total, wpx) {
  const f = fmt(), k = wpx / f.w;
  el.style.width = wpx + 'px'; el.style.height = f.h * k + 'px';
  el.innerHTML = `<div class="minii" style="width:${f.w}px;height:${f.h}px;transform:scale(${k})">${slideHTML(s, i, total)}</div>`;
}

$('#lbody').addEventListener('click', async e => {
  const t = e.target.closest('button'); if (!t) return;
  if (t.dataset.base) { snapshot(); const s = slideFromBase(t.dataset.base, doc.format); s.id = slide().id; doc.slides[slideIx] = s; selId = null; renderAll(); changed(); }
  else if (t.dataset.bg) { snapshot(); slide().bg = t.dataset.bg; slide().ink = null; renderAll(); changed(); }
  else if (t.id === 'bgAll') { snapshot(); const b = slide().bg, ink = slide().ink; doc.slides.forEach(s => { s.bg = b; s.ink = ink; }); renderAll(); changed(); toast('Fondo aplicado a todas las láminas'); }
  else if (t.dataset.ts) { const st = TEXT_STYLES[t.dataset.ts]; addLayer({ t: 'text', style: t.dataset.ts, text: st.sample, x: MARGIN, y: Math.round(fmt().h * .4), w: st.w || undefined, size: 'L' }); }
  else if (t.dataset.elp) { const [eid, json] = t.dataset.elp.split('|'); const el = elById(eid); const pp = JSON.parse(json || '{}'); const w = eid === 'captura' ? (pp.ancho || 560) : (el.w || 300); addLayer({ t: 'el', el: eid, x: Math.max(0, Math.round((1080 - w) / 2)), y: Math.round(fmt().h * .3), s: 1, r: 0, p: pp }); }
  else if (t.dataset.el) { const el = elById(t.dataset.el); const w = el.w || 300; addLayer({ t: 'el', el: el.id, x: Math.max(0, Math.round((1080 - w) / 2)), y: Math.round(fmt().h * .45), s: 1, r: 0, p: {} }); }
  else if (t.dataset.upbg) { snapshot(); slide().bg = 'up:' + t.dataset.upbg; slide().ink = 'light'; renderAll(); changed(); }
  else if (t.dataset.updel) {
    const u = uploads.find(x => x.id === t.dataset.updel); if (!u) return;
    if (usedIn(u.url) || slideUsesBg('up:' + u.id)) { toast('Esta foto se usa en algún diseño: quítala de ahí antes de borrarla'); return; }
    uploads = uploads.filter(x => x.id !== u.id); if (db) await db.doc('library/uploads').set({ items: uploads.slice(0, 200) }); await dropAsset(u.id); renderLeft('fotos'); toast('Foto borrada');
  }
  else if (t.dataset.upimg) { const u = uploads.find(x => x.id === t.dataset.upimg); addLayer({ t: 'img', src: u.url, x: 140, y: 400, w: 800, round: 40 }); }
  else if (t.dataset.open) { await openDesign(t.dataset.open); }
  else if (t.dataset.dupd) { const d = designs.find(x => x.id === t.dataset.dupd); if (d) { const c = clone(d); c.id = uid() + uid(); c.name = d.name + ' (copia)'; doc = c; slideIx = 0; selId = null; renderAll(); changed(true); toast('Copia creada'); } }
  else if (t.dataset.deld) { await deleteDesign(t.dataset.deld); }
  else if (t.dataset.confirmdel) { t.closest('.dsrow').classList.add('confirm'); }
  else if (t.dataset.canceldel) { t.closest('.dsrow').classList.remove('confirm'); }
});
$('#lbody').addEventListener('change', async e => {
  if (e.target.id !== 'uplInput' || !assets) return;
  const msg = $('#uplMsg');
  for (const f of e.target.files) {
    msg.textContent = `Subiendo ${f.name}…`;
    try {
      const a = await assets.upload(await shrink(f, 1600, 0.82));
      const item = { id: a.id, url: a.url, name: f.name.replace(/\.[^.]+$/, ''), at: Date.now() };
      uploads.unshift(item);
      if (db) await db.doc('library/uploads').set({ items: uploads.slice(0, 200) });
    } catch (err) { msg.textContent = `No se pudo subir ${f.name}: ${err?.message || err?.code || 'error'}`; return; }
  }
  msg.textContent = 'Listo.'; renderLeft('fotos');
});
$('#ltabs').addEventListener('click', e => { const b = e.target.closest('button'); if (b) renderLeft(b.dataset.tab); });

// ---------------- buscador ----------------
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
function renderSearch(q) {
  const box = $('#lbody'), words = norm(q).split(/\s+/).filter(Boolean);
  const hit = (...txt) => { const h = norm(txt.join(' ')); return words.every(w => h.includes(w)); };
  const rows = [];
  BGS.filter(b => hit(b.name, b.group, 'fondo')).forEach(b => rows.push(['Fondos', `<button class="srow" data-bg="${b.id}"><span class="sth" style="${b.img ? `background-image:url(bg/t/${b.img}.jpg)` : `background:${b.css}`}"></span><div><b>${esc(b.name)}</b><span>Fondo · ${esc(b.group)}</span></div></button>`]));
  uploads.filter(u => hit(u.name, 'foto subida fondo')).forEach(u => rows.push(['Vuestras fotos', `<button class="srow" data-upbg="${u.id}"><span class="sth" style="background-image:url('${esc(u.url)}')"></span><div><b>${esc(u.name || 'Foto')}</b><span>Foto · usar de fondo</span></div></button>`]));
  BASES.filter(b => hit(b.name, b.desc, 'base plantilla')).forEach(b => rows.push(['Bases', `<button class="srow" data-base="${b.id}"><span class="sth"></span><div><b>${esc(b.name)}</b><span>${esc(b.desc)}</span></div></button>`]));
  Object.keys(SCR).filter(n => hit(n, 'captura pantalla movil')).forEach(n => rows.push(['Pantallas de la app', `<button class="srow" data-elp="captura|${esc(JSON.stringify({ pantalla: n }))}"><span class="sth" style="background-image:url(scr/claro/${SCR[n]}.jpg);background-position:top"></span><div><b>${esc(n)}</b><span>Captura de pantalla</span></div></button>`]));
  Object.keys(REC).filter(n => hit(n, 'recorte real pieza')).forEach(n => rows.push(['Recortes reales', `<button class="srow" data-elp="recorte|${esc(JSON.stringify({ pieza: n }))}"><span class="sth" style="background:#F8EFF1 url(rec/${REC[n][0]}.png) center/contain no-repeat"></span><div><b>${esc(n)}</b><span>Recorte real</span></div></button>`]));
  ELEMENTS.filter(e => hit(e.name, e.group, Object.values(e.props || {}).map(d => d.label).join(' '))).forEach(e => rows.push(['Elementos', `<button class="srow" data-el="${e.id}"><span class="sth" style="background:#1B1719"></span><div><b>${esc(e.name)}</b><span>${esc(e.group)}</span></div></button>`]));
  Object.entries(TEXT_STYLES).filter(([k, t]) => hit(t.name, t.sample, 'texto estilo')).forEach(([k, t]) => rows.push(['Textos', `<button class="srow" data-ts="${k}"><span class="sth" style="display:grid;place-items:center;font:800 15px ID;color:#fff;background:#1B1719">Aa</span><div><b>${esc(t.name)}</b><span>${esc(t.sample.replace(/\*/g, ''))}</span></div></button>`]));
  if (!rows.length) { box.innerHTML = `<p class="empty">Nada con «${esc(q)}». Prueba con otra palabra: perfil, grano, ranking, rosa…</p>`; return; }
  let h = '', last = '';
  rows.forEach(([g, r]) => { if (g !== last) { h += `<h4>${g}</h4>`; last = g; } h += r; });
  box.innerHTML = h;
}
$('#searchIn').addEventListener('input', e => { const q = e.target.value.trim(); if (q) { $$('#ltabs button').forEach(b => b.setAttribute('aria-pressed', 'false')); renderSearch(q); } else renderLeft(currentTab); });
$('#searchIn').addEventListener('keydown', e => { if (e.key === 'Escape') { e.target.value = ''; renderLeft(currentTab); } });
$('#ltabs').addEventListener('click', () => { $('#searchIn').value = ''; }, true);

// ---------------- right panel (properties) ----------------
function renderProps() {
  const box = $('#props'), l = layer(), s = slide();
  if (!l) {
    box.innerHTML = `<h3>Lámina ${slideIx + 1} de ${doc.slides.length}</h3>
    <label class="fld">Fondo<span class="val">${esc(bgById(s.bg).name)}</span></label>
    <div class="seg" role="group" aria-label="Color de los textos"><button data-ink="light" aria-pressed="${inkOf(s) === 'light'}">Textos claros</button><button data-ink="dark" aria-pressed="${inkOf(s) === 'dark'}">Textos oscuros</button></div>
    ${(() => { const w = wmOf(s), n = numOf(s); return `
    <h3>Logo (marca de agua)</h3>
    <label class="chk"><input type="checkbox" id="wmOn" ${w.on ? 'checked' : ''}> Mostrar el logo</label>
    <label class="fld" for="wmVer">Versión</label><select id="wmVer">${LOGO_VERSIONS.map(v => `<option ${v === w.version ? 'selected' : ''}>${v}</option>`).join('')}</select>
    <label class="fld" for="wmCol">Color</label><select id="wmCol" ${w.version === 'Clásico de los posts' ? 'disabled' : ''}>${LOGO_COLORS.map(v => `<option ${v === w.color ? 'selected' : ''}>${v}</option>`).join('')}</select>
    <label class="fld">Esquina</label><div class="seg corners">${CORNERS.map(c => `<button data-wmpos="${c}" aria-pressed="${w.pos === c}" title="${c}">${{ 'Arriba izquierda': '↖', 'Arriba derecha': '↗', 'Abajo izquierda': '↙', 'Abajo derecha': '↘' }[c]}</button>`).join('')}</div>
    <label class="fld" for="wmAlto">Tamaño <span class="val">${w.alto}</span></label><input type="range" id="wmAlto" min="28" max="220" value="${w.alto}">
    <label class="fld" for="wmOp">Opacidad <span class="val">${w.op ?? 100}%</span></label><input type="range" id="wmOp" min="15" max="100" value="${w.op ?? 100}">
    <label class="chk"><input type="checkbox" id="numOn" ${n.on ? 'checked' : ''}> Número de lámina (en carruseles)</label>
    <div class="seg corners">${CORNERS.map(c => `<button data-numpos="${c}" aria-pressed="${n.pos === c}" title="${c}">${{ 'Arriba izquierda': '↖', 'Arriba derecha': '↗', 'Abajo izquierda': '↙', 'Abajo derecha': '↘' }[c]}</button>`).join('')}</div>
    <div class="row"><button class="ghost sm" id="wmAll">Poner este logo y número en todas las láminas</button></div>`; })()}
    <div class="row"><button class="ghost" id="slDup">Duplicar lámina</button><button class="ghost danger" id="slDel" ${doc.slides.length < 2 ? 'disabled' : ''}>Borrar lámina</button></div>
    <p class="hint">Toca un texto o un elemento para editarlo. Arrastra para moverlo; se pega a los márgenes y al centro (mantén Alt para moverlo libre).</p>
    <h3>Publicación</h3>
    <label class="fld" for="capIn">Texto del post</label><textarea id="capIn" rows="4" placeholder="El texto que acompaña al post en Instagram">${esc(doc.caption || '')}</textarea>
    <label class="fld" for="dateIn">Fecha prevista</label><input type="date" id="dateIn" value="${esc(doc.date || '')}">
    <label class="fld" for="statusIn">Estado</label><select id="statusIn">${STATUSES.map(x => `<option ${x === (doc.status || 'Borrador') ? 'selected' : ''}>${x}</option>`).join('')}</select>
    <div class="row"><button class="ghost" id="planBtn2">Abrir el planificador</button></div>`;
    return;
  }
  let h = '';
  if (l.t === 'text') {
    const st = TEXT_STYLES[l.style];
    h += `<h3>${esc(st.name)}</h3><label class="fld" for="txtIn">Texto <small>*palabra* = destacada</small></label><textarea id="txtIn" rows="${l.style === 'h' ? 4 : 3}">${esc(l.text)}</textarea>
      <label class="fld" for="hlIn">Color de la palabra destacada</label><div class="colrow"><select id="hlIn" style="flex:1">${[...Object.keys(HL), 'Personalizado'].map(k => `<option ${k === (l.hl || 'Automático') ? 'selected' : ''}>${k}</option>`).join('')}</select>${l.hl === 'Personalizado' ? `<input type="color" id="hlcIn" value="${esc(l.hlc || '#E8622D')}">` : ''}</div>
      <label class="fld" for="tcIn">Color del texto</label><div class="colrow"><select id="tcIn" style="flex:1">${[...Object.keys(TC), 'Personalizado'].map(k => `<option ${k === (l.tc || 'Automático') ? 'selected' : ''}>${k}</option>`).join('')}</select>${l.tc === 'Personalizado' ? `<input type="color" id="tccIn" value="${esc(l.tcc || '#161416')}">` : ''}</div>
      <label class="fld">Estilo</label><select id="styleIn">${Object.entries(TEXT_STYLES).map(([k, v]) => `<option value="${k}" ${k === l.style ? 'selected' : ''}>${v.name}</option>`).join('')}</select>`;
    if (l.style === 'h') h += `<label class="fld">Tamaño</label><div class="seg" id="sizeSeg">${Object.keys(st.sizes).map(k => `<button data-size="${k}" aria-pressed="${(l.size || 'L') === k}">${k}</button>`).join('')}</div>`;
    h += `<label class="fld">Alineación</label><div class="seg" id="alignSeg">${[['left', 'Izquierda'], ['center', 'Centro'], ['right', 'Derecha']].map(([v, n]) => `<button data-align="${v}" aria-pressed="${(l.align || 'left') === v}">${n}</button>`).join('')}</div>
      <label class="fld" for="wIn">Ancho de la caja <span class="val">${l.w || 'auto'}</span></label><input type="range" id="wIn" min="200" max="1080" step="4" value="${l.w || 904}">`;
  } else if (l.t === 'el') {
    const e = elById(l.el);
    h += `<h3>${esc(e?.name || 'Elemento')}</h3>`;
    let open = false;
    for (const [k, d] of Object.entries(defsOf(e, l.p || {}))) {
      const v = l.p?.[k] ?? d.def;
      if (d.heading) { if (open) h += '</details>'; h += `<details class="pz"><summary>${esc(d.heading)}</summary>`; open = true; continue; }
      if (d.hint) h += `<p class="hint">${esc(d.hint)}</p>`;
      if (d.options) h += `<label class="fld" for="p_${k}">${d.label}</label><select id="p_${k}" data-prop="${k}">${d.options.map(o => { const [val, lab, off] = Array.isArray(o) ? o : [o, o, false]; return `<option value="${esc(val)}" ${val === v ? 'selected' : ''} ${off ? 'disabled' : ''}>${esc(lab)}</option>`; }).join('')}</select>`;
      else if (d.color) h += `<label class="fld" for="p_${k}">${d.label}</label><div class="colrow"><input type="color" id="p_${k}" data-prop="${k}" value="${esc(v)}"><button class="ghost sm" data-reset="${k}">Original</button></div>`;
      else if (d.area) h += `<label class="fld" for="p_${k}">${d.label}</label><textarea id="p_${k}" data-prop="${k}" rows="4">${esc(v)}</textarea>`;
      else if (d.bool) h += `<label class="chk"><input type="checkbox" id="p_${k}" data-prop="${k}" ${v ? 'checked' : ''}> ${d.label}</label>`;
      else if (d.range) h += `<label class="fld" for="p_${k}">${d.label} <span class="val">${v}</span></label><input type="range" id="p_${k}" data-prop="${k}" min="${d.range[0]}" max="${d.range[1]}" value="${v}">`;
      else if (d.text) h += `<label class="fld" for="p_${k}">${d.label}</label><input type="text" id="p_${k}" data-prop="${k}" value="${esc(v)}">`;
    }
    if (open) h += '</details>';
    h += `<label class="fld" for="scIn">Tamaño <span class="val">${Math.round((l.s || 1) * 100)}%</span></label><input type="range" id="scIn" min="15" max="250" value="${Math.round((l.s || 1) * 100)}">`;
  } else if (l.t === 'img') {
    h += `<h3>Imagen</h3><label class="fld" for="iwIn">Ancho <span class="val">${l.w}</span></label><input type="range" id="iwIn" min="80" max="1400" value="${l.w || 600}">
      <label class="fld" for="rdIn">Esquinas redondeadas <span class="val">${l.round || 0}</span></label><input type="range" id="rdIn" min="0" max="120" value="${l.round || 0}">`;
  }
  h += `<label class="fld" for="rotIn">Giro <span class="val">${l.r || 0}°</span></label><input type="range" id="rotIn" min="-30" max="30" value="${l.r || 0}">
    <div class="pos"><label>X <input type="number" id="xIn" value="${l.x}"></label><label>Y <input type="number" id="yIn" value="${l.y}"></label></div>
    <div class="row"><button class="ghost sm" id="alL">Al margen</button><button class="ghost sm" id="alC">Centrar</button></div>
    <div class="row"><button class="ghost sm" id="zUp">Delante</button><button class="ghost sm" id="zDn">Detrás</button><button class="ghost sm" id="dupL">Duplicar</button></div>
    <div class="row"><button class="ghost danger" id="delL">Borrar</button></div>`;
  box.innerHTML = h;
}
const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
let typingSnap = false;
$('#props').addEventListener('input', e => {
  const l = layer(), id = e.target.id;
  if (!l) {
    if (id === 'wmAlto' || id === 'wmOp') { const s = slide(); s.wm = { ...wmOf(s), [id === 'wmAlto' ? 'alto' : 'op']: +e.target.value }; const lab = e.target.previousElementSibling?.querySelector('.val'); if (lab) lab.textContent = e.target.value + (id === 'wmOp' ? '%' : ''); renderCanvas(); renderStripSoon(); changed(); return; }
    if (id === 'capIn') { doc.caption = e.target.value; changed(); }
    if (id === 'dateIn') { doc.date = e.target.value; changed(); }
    if (id === 'statusIn') { doc.status = e.target.value; changed(); logAct('pasó a «' + doc.status + '»', doc); }
    return;
  }
  if (!typingSnap) { snapshot(); typingSnap = true; setTimeout(() => typingSnap = false, 900); }
  const v = e.target.value;
  if (id === 'txtIn') l.text = v;
  else if (id === 'hlcIn') l.hlc = v;
  else if (id === 'hlIn' || id === 'tcIn') return;
  else if (id === 'tccIn') l.tcc = v;
  else if (id === 'wIn') l.w = +v;
  else if (id === 'scIn') l.s = +v / 100;
  else if (id === 'iwIn') l.w = +v;
  else if (id === 'rdIn') l.round = +v;
  else if (id === 'rotIn') l.r = +v;
  else if (id === 'xIn') l.x = +v;
  else if (id === 'yIn') l.y = +v;
  else if (e.target.dataset.prop) { l.p = l.p || {}; l.p[e.target.dataset.prop] = e.target.type === 'checkbox' ? e.target.checked : (e.target.type === 'range' ? +v : v); }
  const lab = e.target.previousElementSibling?.querySelector?.('.val'); if (lab) lab.textContent = id === 'scIn' ? v + '%' : id === 'rotIn' ? v + '°' : v;
  renderCanvas(); changed();
});
$('#props').addEventListener('change', e => {
  const l = layer(), id = e.target.id;
  if (!l) {
    const s = slide(), w = s.wm = { ...wmOf(s) }, n = s.num = { ...numOf(s) };
    if (id === 'wmOn') { snapshot(); w.on = e.target.checked; }
    else if (id === 'wmVer') { snapshot(); w.version = e.target.value; }
    else if (id === 'wmCol') { snapshot(); w.color = e.target.value; }
    else if (id === 'numOn') { snapshot(); n.on = e.target.checked; }
    else return;
    renderAll(); changed(); return;
  }
  if (id === 'hlIn') { snapshot(); l.hl = e.target.value; renderCanvas(); renderProps(); changed(); return; }
  if (id === 'tcIn') { snapshot(); l.tc = e.target.value; renderCanvas(); renderProps(); changed(); return; }
  if (id === 'styleIn') { snapshot(); l.style = e.target.value; const st = TEXT_STYLES[l.style]; l.w = st.w || undefined; renderCanvas(); renderProps(); changed(); }
  else if (e.target.dataset.prop && e.target.type === 'checkbox') { snapshot(); l.p = l.p || {}; l.p[e.target.dataset.prop] = e.target.checked; renderCanvas(); changed(); }
  else if (e.target.tagName === 'SELECT' && e.target.dataset.prop) {
    snapshot(); l.p = l.p || {}; const k = e.target.dataset.prop; l.p[k] = e.target.value;
    const d = defsOf(elById(l.el), l.p)[k];
    if (d?.resets) { const keep = { [k]: l.p[k] }; d.resets.forEach(x => { if (x in l.p) keep[x] = l.p[x]; }); l.p = keep; }
    renderCanvas(); renderProps(); changed();
  }
});
$('#props').addEventListener('focusout', e => { if (e.target.id === 'p_piezas') renderProps(); });
$('#props').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return; const l = layer();
  if (b.dataset.ink) { snapshot(); slide().ink = b.dataset.ink; renderAll(); changed(); return; }
  if (b.dataset.wmpos) { snapshot(); slide().wm = { ...wmOf(slide()), pos: b.dataset.wmpos }; renderAll(); changed(); return; }
  if (b.dataset.numpos) { snapshot(); slide().num = { ...numOf(slide()), pos: b.dataset.numpos }; renderAll(); changed(); return; }
  if (b.id === 'wmAll') { snapshot(); const w = wmOf(slide()), n = numOf(slide()); doc.slides.forEach(x => { x.wm = { ...w }; x.num = { ...n }; }); renderAll(); changed(); toast('Logo y número iguales en todas las láminas'); return; }
  if (b.id === 'planBtn2') { openPlanner(); return; }
  if (b.id === 'slDup') { dupSlide(); return; }
  if (b.id === 'slDel') { delSlide(); return; }
  if (!l) return;
  if (b.dataset.reset) { snapshot(); if (l.p) delete l.p[b.dataset.reset]; renderCanvas(); renderProps(); changed(); return; }
  if (b.dataset.size) { snapshot(); l.size = b.dataset.size; renderCanvas(); renderProps(); changed(); }
  else if (b.dataset.align) { snapshot(); l.align = b.dataset.align; renderCanvas(); renderProps(); changed(); }
  else if (b.id === 'alL') { snapshot(); const el = art.querySelector(`.lay[data-id="${l.id}"]`), r = layerRect(el), off = (r.left - el.getBoundingClientRect().left) / scale; l.x = Math.round(MARGIN - off); renderCanvas(); renderProps(); changed(); }
  else if (b.id === 'alC') { snapshot(); const el = art.querySelector(`.lay[data-id="${l.id}"]`), r = layerRect(el), off = (r.left - el.getBoundingClientRect().left) / scale; l.x = Math.round(540 - r.width / scale / 2 - off); renderCanvas(); renderProps(); changed(); }
  else if (b.id === 'zUp') moveZ(1); else if (b.id === 'zDn') moveZ(-1);
  else if (b.id === 'dupL') dupLayer(); else if (b.id === 'delL') delLayer();
});

// ---------------- slides strip ----------------
function renderStrip() {
  const box = $('#strip');
  box.innerHTML = doc.slides.map((s, i) => `<button class="thumb${i === slideIx ? ' on' : ''}" data-slide="${i}" aria-label="Lámina ${i + 1}"><div class="mini"></div><span>${i + 1}</span></button>`).join('') +
    `<button class="thumb add" id="addSlide" aria-label="Añadir lámina">+<span>Lámina</span></button>`;
  $$('.thumb[data-slide]', box).forEach(b => miniInto($('.mini', b), doc.slides[+b.dataset.slide], +b.dataset.slide, doc.slides.length, 64));
}
$('#strip').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.id === 'addSlide') { snapshot(); const s = slideFromBase('vacia', doc.format); s.bg = slide().bg; s.ink = slide().ink; doc.slides.splice(slideIx + 1, 0, s); setSlide(slideIx + 1); changed(); return; }
  setSlide(+b.dataset.slide);
});
function dupSlide() { snapshot(); const c = clone(slide()); c.id = uid(); c.layers.forEach(l => l.id = uid()); doc.slides.splice(slideIx + 1, 0, c); setSlide(slideIx + 1); changed(); }
function delSlide() { if (doc.slides.length < 2) return; snapshot(); doc.slides.splice(slideIx, 1); setSlide(Math.min(slideIx, doc.slides.length - 1)); changed(); }
$('#slPrev').onclick = () => { if (slideIx > 0) { snapshot(); const s = doc.slides; [s[slideIx - 1], s[slideIx]] = [s[slideIx], s[slideIx - 1]]; setSlide(slideIx - 1); changed(); } };
$('#slNext').onclick = () => { if (slideIx < doc.slides.length - 1) { snapshot(); const s = doc.slides; [s[slideIx + 1], s[slideIx]] = [s[slideIx], s[slideIx + 1]]; setSlide(slideIx + 1); changed(); } };

// ---------------- top bar ----------------
$('#nameIn').addEventListener('input', e => { doc.name = e.target.value || 'Diseño sin título'; changed(); trackPresence(); });
$('#fmtSeg').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b || b.dataset.fmt === doc.format) return; snapshot();
  const dy = b.dataset.fmt === 'story' ? 285 : -285;
  doc.format = b.dataset.fmt; doc.slides.forEach(s => s.layers.forEach(l => l.y = Math.max(0, l.y + dy)));
  renderAll(); changed();
});
$('#newBtn').onclick = () => { doc = newDesign('texto', doc?.format || 'post'); slideIx = 0; selId = null; history.length = 0; renderAll(); changed(true); toast('Diseño nuevo'); };
$('#undoBtn').onclick = undo; $('#redoBtn').onclick = redo;
let showGuides = true;
$('#guideBtn').onclick = e => { showGuides = !showGuides; e.currentTarget.setAttribute('aria-pressed', showGuides); renderCanvas(); };

// ---------------- modo claro / oscuro del editor ----------------
function setUI(m) { document.documentElement.dataset.ui = m; try { localStorage.setItem('kstudio-ui', m); } catch (e) {} const b = $('#uiBtn'); if (b) { b.textContent = m === 'dark' ? '☀' : '☾'; b.title = m === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'; } }
let uiPref = 'light'; try { uiPref = localStorage.getItem('kstudio-ui') || 'light'; } catch (e) {}
setUI(uiPref);
$('#uiBtn').onclick = () => setUI(document.documentElement.dataset.ui === 'dark' ? 'light' : 'dark');

// ---------------- render all ----------------
function renderAll() {
  setTimeout(() => { renderComments(); renderOnline(); trackPresence(); }, 0);
  $('#nameIn').value = doc.name;
  $$('#fmtSeg button').forEach(b => b.setAttribute('aria-pressed', b.dataset.fmt === doc.format));
  fit(); renderCanvas(); renderStrip(); renderProps(); renderLeft();
}
window.addEventListener('resize', () => { fit(); measureSel(); });

// ---------------- export ----------------
async function renderPNG(s, i, total) {
  const f = fmt(), host = $('#exphost');
  host.style.width = f.w + 'px'; host.style.height = f.h + 'px';
  host.innerHTML = slideHTML(s, i, total);
  await document.fonts.ready;
  await Promise.all($$('img', host).map(im => im.complete ? 0 : new Promise(r => { im.onload = im.onerror = r; })));
  const blob = await htmlToImage.toBlob(host, { width: f.w, height: f.h, pixelRatio: 1, cacheBust: false, skipAutoScale: true });
  host.innerHTML = '';
  return blob;
}
const fileBase = () => (doc.name || 'kumbra').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'kumbra';
async function saveFile(name, data) {
  if (!downloads) { toast('Descargar no está disponible aquí'); return; }
  try { await downloads.save({ filename: name, data }); logAct('descargó', doc); }
  catch (e) { if (e?.code !== 'declined') toast(e?.code === 'unavailable' ? 'Descargar no está disponible aquí' : 'No se pudo descargar'); }
}
$('#expOne').onclick = async () => { busy(true, 'Preparando la imagen…'); try { const b = await renderPNG(slide(), slideIx, doc.slides.length); busy(false); await saveFile(`${fileBase()}-${String(slideIx + 1).padStart(2, '0')}.png`, b); } catch (e) { busy(false); toast('No se pudo exportar: ' + (e.message || e)); } };
$('#expAll').onclick = async () => {
  busy(true, 'Preparando las láminas…');
  try {
    if (doc.slides.length === 1) { const b = await renderPNG(doc.slides[0], 0, 1); busy(false); return saveFile(`${fileBase()}.png`, b); }
    const zip = new JSZip();
    for (let i = 0; i < doc.slides.length; i++) { busy(true, `Lámina ${i + 1} de ${doc.slides.length}…`); zip.file(`${fileBase()}-${String(i + 1).padStart(2, '0')}.png`, await renderPNG(doc.slides[i], i, doc.slides.length)); }
    const z = await zip.generateAsync({ type: 'blob' }); busy(false); await saveFile(`${fileBase()}.zip`, z);
  } catch (e) { busy(false); toast('No se pudo exportar: ' + (e.message || e)); }
};
function busy(on, msg = '') { $('#busy').hidden = !on; $('#busyMsg').textContent = msg; }

// ---------------- saving (shared) ----------------
function changed(force) {
  dirty = true; doc.updatedAt = Date.now();
  $('#saveState').textContent = db ? 'Sin guardar…' : 'Cambios en este navegador';
  clearTimeout(saveTimer); saveTimer = setTimeout(save, force ? 50 : 1400);
  if (!force) { renderStripSoon(); }
}
const renderStripSoon = debounce(() => renderStrip(), 500);
async function save() {
  if (!dirty) return;
  if (!doc.createdBy && me) doc.createdBy = me;
  const body = { name: doc.name, format: doc.format, caption: doc.caption || '', date: doc.date || '', status: doc.status || 'Borrador', slides: doc.slides, updatedAt: Date.now(), by: me || '', createdBy: doc.createdBy || me || '' };
  const json = sig(body);
  if (!db) { try { localStorage.setItem('kstudio-' + doc.id, JSON.stringify({ ...body, id: doc.id })); } catch (e) {} dirty = false; $('#saveState').textContent = 'Guardado en este navegador'; return; }
  if (saving) { clearTimeout(saveTimer); saveTimer = setTimeout(save, 600); return; }
  if (json === lastSavedJson) { dirty = false; $('#saveState').textContent = 'Guardado'; return; }
  saving = true; dirty = false;
  try { const isNew = !designs.some(x => x.id === doc.id) && !created.has(doc.id); if (isNew) created.add(doc.id); await db.collection('designs').doc(doc.id).set(body); lastSavedJson = json; $('#saveState').textContent = 'Guardado'; isNew ? (savedSnap[doc.id] = clone(doc), logAct('creó', doc)) : logEdit(doc); }
  catch (e) { dirty = true; $('#saveState').textContent = e?.code === 'invalid_argument' ? 'Solo lectura' : 'No se pudo guardar'; $('#saveState').title = e?.message || ''; console.error('Guardar', e); if (!window.__saveErrShown) { window.__saveErrShown = 1; toast('No se pudo guardar: ' + (e?.message || e)); } }
  saving = false;
}
async function openDesign(id) {
  await save();
  const d = designs.find(x => x.id === id); if (!d) return;
  doc = clone(d); slideIx = 0; selId = null; history.length = 0; future = [];
  lastSavedJson = sig(doc); savedSnap[doc.id] = clone(doc);
  renderAll(); renderLeft('disenos'); toast('Abierto: ' + doc.name);
}
async function deleteDesign(id) {
  const dd = designs.find(x => x.id === id);
  if (db) { try { await db.collection('designs').doc(id).delete(); logAct('borró', dd || { id }); } catch (e) { toast('No se pudo borrar'); return; } }
  else { try { localStorage.removeItem('kstudio-' + id); } catch (e) {} }
  designs = designs.filter(d => d.id !== id);
  if (doc.id === id) { doc = newDesign(); slideIx = 0; selId = null; lastSavedJson = ''; dirty = false; renderAll(); }
  if (currentTab === 'disenos') renderLeft('disenos');
}
let profiles = {}, activity = [];
// Historial: quién hizo qué. Las ediciones seguidas de la misma persona en el mismo diseño cuentan como una (10 min).
// Historial concreto: una línea por persona y diseño cada 15 min, con lo que ha cambiado.
const lastEdit = {}, created = new Set(), savedSnap = {};
async function logAct(text, design) {
  if (!db || !me) return null;
  const id = Date.now().toString(36) + uid();
  try { await db.collection('activity').doc(id).set({ by: me, at: Date.now(), text, design: design?.id || '', name: design?.name || '' }); } catch (e) {}
  return id;
}
function describeChanges(a, b) {
  if (!a) return [];
  const out = new Set(), N = x => JSON.stringify(x ?? null);
  if (a.name !== b.name) out.add('nombre');
  if ((a.caption || '') !== (b.caption || '')) out.add('texto del post');
  if ((a.date || '') !== (b.date || '')) out.add('fecha');
  if (a.format !== b.format) out.add('formato');
  if (a.slides.length !== b.slides.length) out.add(b.slides.length > a.slides.length ? 'láminas añadidas' : 'láminas quitadas');
  b.slides.forEach((s, i) => { const o = a.slides.find(x => x.id === s.id); if (!o) return;
    if (o.bg !== s.bg || o.ink !== s.ink) out.add('fondo');
    if (N(o.wm) !== N(s.wm) || N(o.num) !== N(s.num)) out.add('logo');
    const ol = Object.fromEntries(o.layers.map(l => [l.id, l])), nl = Object.fromEntries(s.layers.map(l => [l.id, l]));
    for (const id in nl) { const l = nl[id], p = ol[id], kind = l.t === 'text' ? 'textos' : l.t === 'img' ? 'fotos' : (elById(l.el)?.name || 'elementos');
      if (!p) out.add('añadió ' + kind.toLowerCase());
      else if (l.t === 'text' && p.text !== l.text) out.add('textos');
      else if (N(p.p) !== N(l.p) || p.style !== l.style || p.hl !== l.hl || p.hlc !== l.hlc || p.tc !== l.tc || p.tcc !== l.tcc || p.size !== l.size) out.add(l.t === 'text' ? 'estilo de textos' : kind.toLowerCase());
      else if (p.x !== l.x || p.y !== l.y || p.s !== l.s || p.r !== l.r || p.w !== l.w) out.add('posiciones'); }
    for (const id in ol) if (!nl[id]) out.add('quitó elementos'); });
  return [...out];
}
async function logEdit(d) {
  const k = d.id, now = Date.now(), ch = describeChanges(savedSnap[k], d); savedSnap[k] = clone(d);
  if (!ch.length) return;
  const L = lastEdit[k];
  if (L && now - L.at < 900000 && L.id) {
    L.changes = [...new Set([...L.changes, ...ch])]; L.at = now;
    try { await db.collection('activity').doc(L.id).update({ text: 'cambió ' + L.changes.join(', ') + ' en', at: now, name: d.name }); } catch (e) {}
  } else { lastEdit[k] = { at: now, changes: ch, id: null }; lastEdit[k].id = await logAct('cambió ' + ch.join(', ') + ' en', d); }
}
const nameOf = id => id ? (id === me ? 'Tú' : (profiles[id]?.name || 'Alguien del equipo')) : '';
async function loadProfiles(ids) { if (!user) return; const need = [...new Set(ids.filter(Boolean))].filter(i => !(i in profiles)); if (!need.length) return; try { Object.assign(profiles, await user.profiles(need)); } catch (e) {} }
function renderDesignList(box) {
  const rows = designs.slice().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  box.innerHTML = `<p class="hint">${db ? 'Se guardan solos y los veis todos los que tenéis acceso.' : 'Solo se guardan en este navegador.'}</p>` +
    (rows.length ? rows.map(d => `<div class="dsrow${d.id === doc.id ? ' on' : ''}"><button class="dsopen" data-open="${d.id}"><div class="mini" data-dmini="${d.id}"></div><div><b>${esc(d.name)}</b><span>${d.slides?.length || 0} lám. · ${d.format === 'story' ? 'Story' : 'Post'}${d.date ? ' · ' + fmtDate(d.date) : ''}</span><span class="who">${whoLine(d)}</span></div></button>
      <div class="dsacts"><button class="ghost sm" data-dupd="${d.id}">Duplicar</button><button class="ghost sm danger" data-confirmdel="1">Borrar</button></div>
      <div class="dsconfirm">¿Borrar «${esc(d.name)}»? <button class="ghost sm danger" data-deld="${d.id}">Sí, borrar</button><button class="ghost sm" data-canceldel="1">No</button></div></div>`).join('') : '<p class="empty">Aún no hay diseños guardados. Este se guarda solo en cuanto lo cambies.</p>');
  $$('[data-dmini]', box).forEach(m => { const d = designs.find(x => x.id === m.dataset.dmini); if (d?.slides?.[0]) { const keep = doc; doc = d; miniInto(m, d.slides[0], 0, d.slides.length, 54); doc = keep; } });
}
const fmtDate = s => { const d = new Date(s + 'T12:00'); return isNaN(d) ? s : d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }); };
function whoLine(d) {
  const t = d.updatedAt ? new Date(d.updatedAt).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
  const n = d.by ? nameOf(d.by) : '', c = d.createdBy && d.createdBy !== d.by ? nameOf(d.createdBy) : '';
  return esc([c && 'Creado por ' + c, n && 'último cambio: ' + n, t].filter(Boolean).join(' · '));
}

// ---------------- Comentarios (revisión) y quién está conectado ----------------
let comments = [], online = {}, cmOpen = false;
const cmFor = id => comments.filter(c => c.design === id).sort((a, b) => a.at - b.at);
const cmOpenCount = id => comments.filter(c => c.design === id && !c.done).length;
const initials = n => (n || '?').split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
const PCOL = ['#7B5CFA', '#E0336F', '#14A085', '#E8622D', '#1E6FBF', '#A67C00'];
const colOf = id => PCOL[[...String(id)].reduce((a, c) => a + c.charCodeAt(0), 0) % PCOL.length];
function renderComments() {
  const btn = $('#cmBtn'); if (btn) { const n = cmOpenCount(doc.id); btn.innerHTML = `Comentarios${n ? ` <b class="cmn">${n}</b>` : ''}`; }
  const box = $('#cmPanel'); if (!box) return; box.hidden = !cmOpen; if (!cmOpen) return;
  const list = cmFor(doc.id);
  box.innerHTML = `<div class="cmhead"><b>Comentarios de «${esc(doc.name)}»</b><button class="ghost sm" id="cmClose">Cerrar</button></div>
    <div class="cmlist">${list.map(c => `<div class="cm${c.done ? ' done' : ''}"><div class="cmtop"><span class="av0" style="background:${colOf(c.by)}">${esc(initials(nameOf(c.by)))}</span><b>${esc(nameOf(c.by))}</b>${c.slide ? `<button class="lnk" data-cmslide="${c.slide}">lámina ${c.slide}</button>` : ''}<span class="cmt">${new Date(c.at).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span></div>
      <p>${esc(c.text).replace(/\n/g, '<br>')}</p><div class="cmacts"><label class="chk"><input type="checkbox" data-cmdone="${c.id}" ${c.done ? 'checked' : ''}> Resuelto</label>${c.by === me ? `<button class="ghost sm danger" data-cmdel="${c.id}">Borrar</button>` : ''}</div></div>`).join('') || '<p class="empty">Sin comentarios. Escribe aquí lo que hay que cambiar: se quedará pegado a esta lámina.</p>'}</div>
    <form id="cmForm"><textarea id="cmText" rows="3" placeholder="Ej.: el titular no se lee bien sobre este fondo" required></textarea>
    <div class="row"><select id="cmSlide"><option value="${slideIx + 1}">En la lámina ${slideIx + 1}</option><option value="0">En todo el diseño</option></select><button class="pri" type="submit">Comentar</button></div></form>`;
}
async function addComment(text, slideN) {
  if (!db) { toast('Los comentarios necesitan el guardado compartido'); return; }
  await save();
  const id = Date.now().toString(36) + uid();
  const c = { id, design: doc.id, slide: slideN, text, by: me, at: Date.now(), done: false };
  comments.push(c); renderComments();
  try { await db.collection('comments').doc(id).set(c); logAct('comentó en', doc); } catch (e) { toast('No se pudo guardar el comentario'); }
}
document.addEventListener('submit', e => { if (e.target.id !== 'cmForm') return; e.preventDefault(); const t = $('#cmText').value.trim(); if (t) addComment(t, +$('#cmSlide').value); });
document.addEventListener('click', async e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.id === 'cmBtn') { cmOpen = !cmOpen; renderComments(); }
  else if (b.id === 'cmClose') { cmOpen = false; renderComments(); }
  else if (b.dataset.cmslide) { setSlide(+b.dataset.cmslide - 1); }
  else if (b.dataset.cmdel) { const id = b.dataset.cmdel; comments = comments.filter(c => c.id !== id); renderComments(); try { await db.collection('comments').doc(id).delete(); } catch (x) {} }
});
document.addEventListener('change', async e => { const id = e.target.dataset?.cmdone; if (!id) return; const c = comments.find(x => x.id === id); if (!c) return; c.done = e.target.checked; renderComments(); try { await db.collection('comments').doc(id).update({ done: c.done, doneBy: me }); if (c.done) logAct('resolvió un comentario de', doc); } catch (x) {} });

function renderOnline() {
  const box = $('#online'); if (!box) return;
  const others = Object.entries(online).filter(([id]) => id !== me);
  box.innerHTML = others.map(([id, st]) => { const s0 = st[0] || {}; const where = s0.design === doc.id ? 'en este diseño' : s0.dname ? `en «${s0.dname}»` : 'en el Studio';
    return `<span class="av0 on${s0.design === doc.id ? ' here' : ''}" style="background:${colOf(id)}" title="${esc(nameOf(id))} · ${esc(where)}">${esc(initials(nameOf(id)))}</span>`; }).join('');
  box.hidden = !others.length;
}
let presT;
function trackPresence() { clearTimeout(presT); presT = setTimeout(() => window.studioPresence?.track({ design: doc.id, dname: doc.name, slide: slideIx + 1, at: Date.now() }), 400); }
const whoHere = id => Object.entries(online).filter(([u, st]) => u !== me && st[0]?.design === id).map(([u]) => nameOf(u));

// ---------------- Bienvenida al entrar ----------------
function showWelcome() {
  const w = $('#welcome'); if (!w) return;
  const first = (profiles[me]?.name || '').split(' ')[0];
  const h = new Date().getHours(), saludo = h < 6 ? 'Buenas noches' : h < 14 ? 'Buenos días' : h < 21 ? 'Buenas tardes' : 'Buenas noches';
  const byRecent = (a, b) => (b.updatedAt || 0) - (a.updatedAt || 0);
  const mine = designs.filter(d => d.by === me || d.createdBy === me).sort(byRecent);
  const team = designs.filter(d => !mine.includes(d)).sort(byRecent).slice(0, 3);
  const pending = designs.filter(d => cmOpenCount(d.id)).length, review = designs.filter(d => d.status === 'En revisión').length;
  const card = d => { const keep = doc; doc = d; const f = fmt(), k = 64 / 1080; const th = `<div class="mini" style="width:64px;height:${f.h * k}px"><div class="minii" style="width:1080px;height:${f.h}px;transform:scale(${k})">${slideHTML(d.slides[0], 0, d.slides.length)}</div></div>`; doc = keep;
    return `<button class="wcard" data-wopen="${d.id}">${th}<span><b>${esc(d.name)}</b><small>${esc(d.status || 'Borrador')} · ${whoLine(d)}</small></span></button>`; };
  w.innerHTML = `<div class="wbox">
    <img class="wlogo" src="logo/kumbra-logo.svg" alt="" width="72" height="58">
    <div class="wk">Kumbra Studio</div>
    <h1 class="wh">Hola${first ? `, <em>${esc(first)}</em>` : ''}.</h1>
    <p class="wsub">${saludo}. ${mine.length ? '¿Quieres seguir trabajando en lo tuyo?' : '¿Por dónde empezamos hoy?'}${review || pending ? ` <span class="wnote">${[review && `${review} en revisión`, pending && `${pending} con comentarios pendientes`].filter(Boolean).join(' · ')}</span>` : ''}</p>
    ${mine[0] ? `<button class="wmain" data-wopen="${mine[0].id}"><span>Seguir trabajando en</span><b>«${esc(mine[0].name)}»</b></button>` : ''}
    ${mine.length > 1 ? `<h4>Lo tuyo</h4><div class="wlist">${mine.slice(1, 4).map(card).join('')}</div>` : ''}
    ${team.length ? `<h4>Lo último del equipo</h4><div class="wlist">${team.map(card).join('')}</div>` : ''}
    <div class="wacts"><button class="pri" id="wNew">Diseño nuevo</button><button class="ghost" id="wPlan">Ver el planificador</button></div>
  </div>`;
  w.hidden = false; requestAnimationFrame(() => w.classList.add('in'));
}
function closeWelcome() { const w = $('#welcome'); w.classList.remove('in'); setTimeout(() => { w.hidden = true; }, 350); }
document.addEventListener('click', async e => {
  const b = e.target.closest('#welcome button'); if (!b) return;
  if (b.dataset.wopen) { await openDesign(b.dataset.wopen); closeWelcome(); }
  else if (b.id === 'wNew') { closeWelcome(); }
  else if (b.id === 'wPlan') { closeWelcome(); openPlanner(); }
});

// ---------------- Planificador + vista de Instagram ----------------
const STATUSES = ['Idea', 'Borrador', 'En revisión', 'Listo', 'Programado', 'Publicado'];
let published = [];   // posts reales ya subidos a Instagram: {id, url, date, caption, multi}
let planSel = null, igSlide = 0, igOnlyReal = false;
function openPlanner() { save(); $('#plan').hidden = false; renderPlanner(); }
$('#igBtn').onclick = openPlanner;
$('#planClose').onclick = () => { $('#plan').hidden = true; };
const allDesigns = () => { const list = designs.slice(); const i = list.findIndex(d => d.id === doc.id); if (i >= 0) list[i] = clone(doc); else if (dirty || lastSavedJson) list.unshift(clone(doc)); return list; };
const fmtDay = s => s ? new Date(s + 'T12:00').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }) : 'Sin fecha';
function thumbHTML(d, w) { const keep = doc; doc = d; const f = fmt(), k = w / 1080; const h = `<div class="minii" style="width:1080px;height:${f.h}px;transform:scale(${k})">${slideHTML(d.slides[0], 0, d.slides.length)}</div>`; doc = keep; return h; }
function feedItems() {
  // Lo que se verá en el perfil: lo publicado de verdad + lo planificado (posts, no stories), de más nuevo a más viejo.
  const planned = igOnlyReal ? [] : allDesigns().filter(d => d.format !== 'story' && d.slides?.length && d.status !== 'Idea' && d.status !== 'Publicado').map(d => ({ kind: 'd', d, date: d.date || '9999-12-31', key: d.id }));
  const done = allDesigns().filter(d => d.format !== 'story' && d.status === 'Publicado').map(d => ({ kind: 'd', d, date: d.date || '0000', key: d.id }));
  const real = published.map(p => ({ kind: 'r', p, date: p.date || '0000', key: 'r' + p.id }));
  return [...planned, ...done, ...real].sort((a, b) => b.date.localeCompare(a.date));
}
function renderPlanner() {
  // perfil
  const items = feedItems(), grid = $('#pGrid');
  $('#pCount').textContent = items.length;
  grid.innerHTML = items.map(it => {
    const plan = it.kind === 'd' && it.d.status !== 'Publicado';
    return `<button class="igcell${planSel === it.key ? ' cur' : ''}${plan ? ' plan' : ''}" data-pk="${it.key}" title="${esc(it.kind === 'd' ? it.d.name : (it.p.caption || 'Publicado'))}"><div class="mini"></div>${(it.kind === 'd' ? it.d.slides.length > 1 : it.p.multi) ? '<i class="multi">❐</i>' : ''}${plan ? `<span class="pday">${esc(it.d.date ? fmtDay(it.d.date) : 'Sin fecha')}</span>` : ''}</button>`;
  }).join('') || '<p class="empty" style="grid-column:1/-1;padding:20px">Aún no hay nada. Marca tus diseños como «Listo» o «Programado», o añade los posts que ya estén publicados.</p>';
  $$('.igcell', grid).forEach((c, i) => { const it = items[i], m = $('.mini', c), w = c.clientWidth || 120;
    if (it.kind === 'd') m.innerHTML = thumbHTML(it.d, w); else m.innerHTML = `<img src="${esc(it.p.url)}" alt="" style="width:100%;height:100%;object-fit:cover;display:block">`; });
  // tablero
  const ds = allDesigns().slice().sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999'));
  $('#pBoard').innerHTML = STATUSES.map(st => { const col = ds.filter(d => (d.status || 'Borrador') === st);
    return `<section class="pcol" data-col="${st}"><h4>${st} <span>${col.length}</span></h4>${col.map(d => `<div class="pcard${planSel === d.id ? ' cur' : ''}" data-pid="${d.id}" draggable="true"><button class="pth" data-popen="${d.id}" title="Abrir en el editor"><div class="mini" style="width:64px;height:${d.format === 'story' ? 114 : 80}px">${thumbHTML(d, 64)}</div></button>
      <div class="pinfo"><b>${esc(d.name)}${cmOpenCount(d.id) ? ` <span class="cmn" title="Comentarios sin resolver">💬 ${cmOpenCount(d.id)}</span>` : ''}${whoHere(d.id).length ? ` <span class="here" title="Ahora mismo dentro">● ${esc(whoHere(d.id).join(', '))}</span>` : ''}</b><span>${d.format === 'story' ? 'Story' : d.slides.length > 1 ? `Carrusel · ${d.slides.length}` : 'Post'} · ${whoLine(d)}</span>
      <div class="prow"><input type="date" data-pdate="${d.id}" value="${esc(d.date || '')}" aria-label="Fecha"><select data-pstat="${d.id}" aria-label="Estado">${STATUSES.map(x => `<option ${x === (d.status || 'Borrador') ? 'selected' : ''}>${x}</option>`).join('')}</select><button class="ghost sm danger pdel" data-pdelask="${d.id}" title="Eliminar este diseño">Eliminar</button></div>
      <div class="pconfirm">¿Eliminar «${esc(d.name)}»? No se puede deshacer. <button class="ghost sm danger" data-pdel="${d.id}">Sí, eliminar</button><button class="ghost sm" data-pdelno="1">No</button></div></div></div>`).join('') || '<p class="empty">Arrastra aquí</p>'}</section>`; }).join('');
  // publicados de verdad
  $('#pReal').innerHTML = published.slice().sort((a, b) => (b.date || '').localeCompare(a.date || '')).map(p => `<div class="preal"><img src="${esc(p.url)}" alt=""><div><input type="date" data-rdate="${p.id}" value="${esc(p.date || '')}" aria-label="Fecha de publicación"><label class="chk"><input type="checkbox" data-rmulti="${p.id}" ${p.multi ? 'checked' : ''}> Carrusel</label><button class="ghost sm danger" data-rdel="${p.id}">Quitar</button></div></div>`).join('') || '<p class="empty">Todavía no hay posts publicados añadidos.</p>';
  $('#pUpl').hidden = !assets; $('#pUplMsg').textContent = assets ? '' : 'Para añadir posts publicados, abre el Studio con permiso de edición.';
  $('#pOnlyReal').checked = igOnlyReal;
  renderFeedPreview(); renderActivity();
}
function renderActivity() {
  const box = $('#pAct'); if (!box) return;
  if (!db) { box.innerHTML = '<p class="empty">El historial solo funciona con el guardado compartido.</p>'; return; }
  const ago = t => { const m = Math.round((Date.now() - t) / 60000); return m < 1 ? 'ahora' : m < 60 ? `hace ${m} min` : m < 1440 ? `hace ${Math.round(m / 60)} h` : new Date(t).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }); };
  box.innerHTML = activity.length ? activity.map(a => `<div class="act"><b>${esc(nameOf(a.by))}</b> ${esc(a.text)}${a.name ? ` <button class="lnk" data-popen="${esc(a.design)}">${esc(allDesigns().find(d => d.id === a.design)?.name || a.name)}</button>` : ''}<span>${ago(a.at)}</span></div>`).join('') : '<p class="empty">Todavía no hay movimientos.</p>';
}
function selected() { const it = feedItems().find(x => x.key === planSel); if (it) return it; const d = allDesigns().find(x => x.id === planSel); return d ? { kind: 'd', d, key: d.id } : (feedItems()[0] || null); }
function renderFeedPreview() {
  const it = selected(), f = $('#feedPost'), w = f.clientWidth || 360;
  if (!it) { f.innerHTML = ''; $('#feedCap').textContent = ''; $('#feedDots').innerHTML = ''; return; }
  if (it.kind === 'r') { f.style.height = w * 1.25 + 'px'; f.innerHTML = `<img src="${esc(it.p.url)}" alt="" style="width:100%;height:100%;object-fit:cover">`; $('#feedDots').innerHTML = ''; $('#feedCap').innerHTML = `<b>kumbra.app</b> ${esc(it.p.caption || '')}`; $('#feedPrev').disabled = $('#feedNext').disabled = true; return; }
  const d = it.d, n = d.slides.length; igSlide = Math.min(igSlide, n - 1);
  const keep = doc; doc = d; const h = fmt().h, k = w / 1080;
  f.style.height = h * k + 'px';
  f.innerHTML = `<div class="minii" style="width:1080px;height:${h}px;transform:scale(${k})">${slideHTML(d.slides[igSlide], igSlide, n)}</div>${n > 1 ? `<span class="count">${igSlide + 1}/${n}</span>` : ''}`;
  doc = keep;
  $('#feedDots').innerHTML = n > 1 ? d.slides.map((_, i) => `<i class="${i === igSlide ? 'on' : ''}"></i>`).join('') : '';
  $('#feedCap').innerHTML = `<b>kumbra.app</b> ${esc(d.caption || 'Aquí va el texto del post (se escribe en el panel de la derecha del editor).').replace(/\n/g, '<br>')}`;
  $('#feedPrev').disabled = igSlide === 0; $('#feedNext').disabled = igSlide >= n - 1;
}
$('#feedPrev').onclick = () => { igSlide = Math.max(0, igSlide - 1); renderFeedPreview(); };
$('#feedNext').onclick = () => { igSlide++; renderFeedPreview(); };
$('#pGrid').addEventListener('click', e => { const b = e.target.closest('[data-pk]'); if (!b) return; planSel = b.dataset.pk; igSlide = 0; renderPlanner(); });
$('#pOnlyReal').addEventListener('change', e => { igOnlyReal = e.target.checked; renderPlanner(); });
async function patchDesign(id, patch) {
  if (id === doc.id) { Object.assign(doc, patch); changed(true); return; }
  const d = designs.find(x => x.id === id); if (!d) return; Object.assign(d, patch, { updatedAt: Date.now(), by: me || d.by || '' });
  if (db) { try { await db.collection('designs').doc(id).update({ ...patch, updatedAt: d.updatedAt, by: d.by }); } catch (e) { toast('No se pudo guardar'); } }
  else { try { localStorage.setItem('kstudio-' + id, JSON.stringify(d)); } catch (e) {} }
}
$('#plan').addEventListener('change', async e => {
  const t = e.target;
  if (t.dataset.pdate) { await patchDesign(t.dataset.pdate, { date: t.value }); logAct('puso fecha ' + (t.value ? fmtDate(t.value) : '(sin fecha)') + ' a', allDesigns().find(x => x.id === t.dataset.pdate)); renderPlanner(); }
  else if (t.dataset.pstat) { await patchDesign(t.dataset.pstat, { status: t.value }); logAct('pasó a «' + t.value + '»', allDesigns().find(x => x.id === t.dataset.pstat)); renderPlanner(); }
  else if (t.dataset.rdate || t.dataset.rmulti) { const id = t.dataset.rdate || t.dataset.rmulti, p = published.find(x => x.id === id); if (!p) return; if (t.dataset.rdate) p.date = t.value; else p.multi = t.checked; await savePublished(); renderPlanner(); }
  else if (t.id === 'pUplIn' && assets) {
    const msg = $('#pUplMsg');
    for (const f of t.files) { msg.textContent = `Subiendo ${f.name}…`; try { const a = await assets.upload(await shrink(f, 720, 0.8)); published.push({ id: a.id, url: a.url, date: new Date().toISOString().slice(0, 10), caption: '', multi: false }); } catch (err) { msg.textContent = `No se pudo subir ${f.name}`; return; } }
    logAct('añadió ' + t.files.length + ' post(s) ya publicados', null);
    msg.textContent = 'Añadidos. Pon a cada uno la fecha en que se publicó.'; t.value = ''; await savePublished(); renderPlanner();
  }
});
$('#plan').addEventListener('click', async e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.popen) { await openDesign(b.dataset.popen); $('#plan').hidden = true; }
  else if (b.dataset.pdelask) { b.closest('.pcard').classList.add('confirm'); }
  else if (b.dataset.pdelno) { b.closest('.pcard').classList.remove('confirm'); }
  else if (b.dataset.pdel) { await deleteDesign(b.dataset.pdel); if (planSel === b.dataset.pdel) planSel = null; renderPlanner(); toast('Diseño eliminado'); }
  else if (b.dataset.rdel) { const id = b.dataset.rdel; published = published.filter(x => x.id !== id); await savePublished(); await dropAsset(id); renderPlanner(); }
  else if (b.closest('.pcard') && !b.dataset.popen) {}
});
// arrastrar tarjetas entre columnas
let dragId = null;
$('#pBoard').addEventListener('dragstart', e => { const c = e.target.closest('.pcard'); if (!c) return; dragId = c.dataset.pid; c.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', dragId); } catch (x) {} });
$('#pBoard').addEventListener('dragend', e => { dragId = null; $$('.pcard.dragging,.pcol.over').forEach(x => x.classList.remove('dragging', 'over')); });
$('#pBoard').addEventListener('dragover', e => { const col = e.target.closest('.pcol[data-col]'); if (!col || !dragId) return; e.preventDefault(); $$('.pcol.over').forEach(x => x !== col && x.classList.remove('over')); col.classList.add('over'); });
$('#pBoard').addEventListener('drop', async e => { const col = e.target.closest('.pcol[data-col]'); if (!col || !dragId) return; e.preventDefault(); const id = dragId, st = col.dataset.col; dragId = null;
  const d = allDesigns().find(x => x.id === id); if (!d || (d.status || 'Borrador') === st) { renderPlanner(); return; }
  await patchDesign(id, { status: st }); logAct('pasó a «' + st + '»', d); planSel = id; renderPlanner(); });
$('#pBoard').addEventListener('click', e => { const c = e.target.closest('.pcard'); if (!c || e.target.closest('input,select,button')) return; planSel = c.dataset.pid; igSlide = 0; renderPlanner(); });
async function savePublished() { if (db) { try { await db.doc('library/published').set({ items: published.slice(0, 300) }); } catch (e) { toast('No se pudo guardar'); } } }

// ---------------- toast ----------------
let tt; function toast(m) { const t = $('#toast'); t.textContent = m; t.hidden = false; clearTimeout(tt); tt = setTimeout(() => t.hidden = true, 2600); }

// ---------------- boot ----------------
function loadLocal() {
  try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith('kstudio-') && k !== 'kstudio-ui') { try { const d = JSON.parse(localStorage.getItem(k)); if (d && d.slides) designs.push(d); } catch (e) {} } } } catch (e) {}
}
doc = newDesign('texto', 'post');
renderAll();
document.fonts.ready.then(() => renderAll());

(async () => {
  if (!window.claude?.use) { loadLocal(); $('#saveState').textContent = 'Guardado en este navegador'; renderLeft(); return; }
  const [d, u, a, dl] = await Promise.all(['db', 'user', 'assets', 'downloads'].map(n => window.claude.use(n).catch(() => null)));
  db = d; user = u; assets = a; downloads = dl;
  if (!downloads) { $('#expOne').disabled = $('#expAll').disabled = true; $('#expOne').title = $('#expAll').title = 'Descargar no está disponible aquí'; }
  if (user) { try { me = await user.id(); } catch (e) {} }
  if (!db) { loadLocal(); $('#saveState').textContent = 'Guardado en este navegador'; renderLeft(); return; }
  $('#saveState').textContent = 'Conectado';
  let first = true;
  db.collection('designs').onSnapshot(async snap => {
    designs = snap.docs.map(x => ({ id: x.id, ...x.data() }));
    if (first) {
      first = false;
      if (!dirty && history.length === 0) { await loadProfiles([me, ...designs.map(d => d.by)]); showWelcome(); }
    } else {
      // someone else changed the design we have open and we have nothing pending: take theirs
      const mine = designs.find(x => x.id === doc.id);
      if (mine && !dirty && !saving && !drag && sig(mine) !== lastSavedJson && mine.by && me && mine.by !== me && (mine.updatedAt || 0) > (doc.updatedAt || 0)) {
        doc = clone(mine); lastSavedJson = sig(doc); savedSnap[doc.id] = clone(doc); slideIx = Math.min(slideIx, doc.slides.length - 1); renderAll(); toast('Actualizado con los cambios de otra persona');
      }
    }
    await loadProfiles(designs.flatMap(x => [x.by, x.createdBy]));
    if (currentTab === 'disenos') renderLeft('disenos');
    if (!$('#plan').hidden) renderPlanner();
  }, err => { $('#saveState').textContent = 'Sin conexión con el guardado'; });
  db.collection('comments').onSnapshot(async snap => { comments = snap.docs.map(x => x.data()); await loadProfiles(comments.map(c => c.by)); renderComments(); if (!$('#plan').hidden) renderPlanner(); }, () => {});
  window.studioPresence?.onChange(async st => { online = st || {}; await loadProfiles(Object.keys(online)); renderOnline(); if (!$('#plan').hidden) renderPlanner(); });
  trackPresence();
  db.collection('activity').orderBy('at', 'desc').limit(80).onSnapshot(async snap => { activity = snap.docs.map(x => x.data()); await loadProfiles(activity.map(a => a.by)); if (!$('#plan').hidden) renderActivity(); }, () => {});
  db.doc('library/published').onSnapshot(s => { published = s.exists ? (s.data().items || []) : []; if (!$('#plan').hidden) renderPlanner(); });
  db.doc('library/uploads').onSnapshot(s => { uploads = s.exists ? (s.data().items || []) : []; if (currentTab === 'fotos' || currentTab === 'fondos') renderLeft(); });
})();
})();
