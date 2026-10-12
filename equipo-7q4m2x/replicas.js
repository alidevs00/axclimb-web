// Kumbra Studio · réplicas editables de piezas reales de la app (medidas y colores sacados de las capturas de iPhone).
// Todo se dibuja a la escala de la captura (tarjeta = 828 px de ancho) y luego se escala en el lienzo.
const K = {};
// Paletas de la app (AstroClimbKit/Features/Shared/AXColorManager.swift). Coral es la original de marca.
const THEMES = {
  'Coral (original)': { l: { bg: '#F3EEE6', acc: '#E8622D', hi: '#8BA800', card: '#FFFFFF', stat: '#EDE7DC', div: '#D8D1C3' }, d: { bg: '#18181A', acc: '#E8622D', hi: '#C8FF00', card: '#272729', stat: '#2E2E30', div: '#3A3A3C' } },
  'Bosque': { l: { acc: '#2E9E6B', hi: '#B7791F', bg: '#F0F2EC', card: '#FFFFFF', stat: '#E4E9DF', div: '#CDD5C6' }, d: { acc: '#34B37A', hi: '#F2C94C', bg: '#131815', card: '#1F2622', stat: '#263029', div: '#34403A' } },
  'Océano': { l: { acc: '#2F6FED', hi: '#0E9F8A', bg: '#EEF2F7', card: '#FFFFFF', stat: '#E2E8F0', div: '#CBD5E1' }, d: { acc: '#4A82F5', hi: '#5EEAD4', bg: '#0F141B', card: '#1A212B', stat: '#212A36', div: '#2E3947' } },
  'Violeta': { l: { acc: '#7B5CFA', hi: '#C27C0E', bg: '#F3F0FA', card: '#FFFFFF', stat: '#E9E4F5', div: '#D6CEEA' }, d: { acc: '#8C72FF', hi: '#FFB547', bg: '#15131C', card: '#221F2B', stat: '#2A2635', div: '#3A3548' } },
  'Frambuesa': { l: { acc: '#E0336F', hi: '#0E9F8A', bg: '#F8EFF1', card: '#FFFFFF', stat: '#F0E3E7', div: '#E2CDD3' }, d: { acc: '#F04A84', hi: '#7CF0D2', bg: '#1A1316', card: '#271E22', stat: '#30252A', div: '#42343A' } },
  'Atardecer (fundadores)': { l: { acc: '#E5484D', hi: '#D98A12', bg: '#D6E2F2', card: '#FFFFFF', stat: '#F3E3DC', div: '#E8D2C8' }, d: { acc: '#F2734A', hi: '#F2B44A', bg: '#0D0918', card: '#22172F', stat: '#2B1D3A', div: '#3B2A4C' } },
};
function setTheme(name, mode) {
  const dark = mode === 'Oscuro', t = (THEMES[name] || THEMES['Coral (original)'])[dark ? 'd' : 'l'];
  Object.assign(K, {
    dark, bg: t.bg, card: t.card, stat: t.stat, line: t.div, grid: dark ? t.div : kmix(t.div, '#fff', .3), pink: t.acc, accSoft: dark ? kmix(t.acc, t.card, .78) : kmix(t.acc, '#fff', .87), hi: t.hi,
    ink: dark ? '#FFFFFF' : '#1A1A1A', sub: dark ? '#A0A0A3' : '#7B7B80', sub2: dark ? '#B4B4B8' : '#55555A', lab: dark ? '#A0A0A3' : '#6E6E73',
    gold: dark ? '#E8C53A' : '#A67C00', goldXp: '#E8B53A', xpBg: dark ? '#3A3220' : '#FCEFD2', ok: dark ? '#5DD68C' : '#34C759', okBg: dark ? '#1F3A2A' : '#DAF5E1',
    green: '#4CAF50', greenSoft: dark ? '#24402A' : '#DBEFDC', greenTxt: dark ? '#5DD68C' : '#3FA046', greenBg: dark ? '#1F3326' : '#E4F3E4', blue: dark ? '#378ADD' : '#1E6FBF', pro: '#14A085', fund: '#F2CA73',
    pinkSoft: dark ? kmix(t.acc, t.card, .78) : kmix(t.acc, '#fff', .87),
  });
}

const GRADES = ['4', '4+', '5', '5+', '6A', '6A+', '6B', '6B+', '6C', '6C+', '7A', '7A+', '7B', '7B+', '7C', '7C+', '8A', '8A+', '8B', '8B+', '8C'];
const gIx = g => Math.max(0, GRADES.indexOf(String(g).toUpperCase().replace(/\s/g, '')));
const gCol = g => { const i = gIx(g); return i < 4 ? '#3FAE6A' : i < 6 ? '#E8C23A' : i < 8 ? '#F08A3C' : i < 10 ? '#E5484D' : i < 12 ? '#D1459A' : i < 14 ? '#8B5CF6' : '#5B6CFF'; };
const hexRgb = h => { h = h.replace('#', ''); if (h.length === 3) h = h.replace(/./g, c => c + c); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const kmix = (a, b, t) => { const A = hexRgb(a), B = hexRgb(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
setTheme('Coral (original)', 'Claro');
const ex = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let RID = 0;
// Avatares de la app (AstroClimbKit/Features/Avatar/AXAvatar.swift), con su nombre del selector.
// ini = dónde van las iniciales en los que las llevan: [centroY, tamaño, color, contorno] en la caja de 72 pt.
const AVATARS = {
  'Canto': { f: 'canto' }, 'Regleta': { f: 'regleta' }, 'Montés': { f: 'montes' }, 'Geko': { f: 'geko' }, 'Tizo': { f: 'tizo' }, 'Gato': { f: 'gato' }, 'Kumbri': { f: 'kumbri' }, 'Chapas': { f: 'chapas' },
  'Pedriza': { f: 'pedriza' }, 'Albarracín': { f: 'albarracin' }, 'Siurana': { f: 'siurana' }, 'Montserrat': { f: 'montserrat' },
  'Cordillera naranja': { f: 'cord_naranja', ini: [-18, 17, '#232323'] }, 'Cordillera azul': { f: 'cord_azul', ini: [-18, 17, '#232323'] }, 'Cordillera verde': { f: 'cord_verde', ini: [-18, 17, '#232323'] }, 'Cordillera tinta': { f: 'cord_tinta', ini: [-18, 17, '#232323'] },
  'Iniciales naranja': { f: 'ini_naranja', ini: [0, 24, '#F4EFE4'] }, 'Iniciales azul': { f: 'ini_azul', ini: [0, 24, '#F4EFE4'] }, 'Iniciales verde': { f: 'ini_verde', ini: [0, 24, '#F4EFE4'] },
  'Madera': { f: 'contrachapado', ini: [0, 22, '#F4EFE4', '#232323'] }, 'Magnesio': { f: 'magnesio', ini: [0, 22, '#F4EFE4', '#232323'] }, 'Cuerda': { f: 'cuerda', ini: [0, 22, '#F4EFE4', '#232323'] }, 'Resina': { f: 'resina', ini: [0, 22, '#F4EFE4', '#232323'] },
  'Atardecer': { f: 'atardecer', ini: [0, 24, '#F4EFE4'] }, 'Noche': { f: 'noche', ini: [-8, 22, '#F4EFE4'] }, 'Cumbre': { f: 'cumbre', ini: [-18, 17, '#FFC20E'] }, 'Aro dorado': { f: 'aro_dorado', ini: [0, 22, '#F4EFE4'] },
};
const AV_OLD = { 'Alicia (montaña)': 'Kumbri', 'Lucía (cuenco)': 'Regleta', 'Silvia (cima)': 'Canto', 'Carmen (pie de gato)': 'Gato' };
const avOf = a => AVATARS[a] || AVATARS[AV_OLD[a]] || AVATARS['Kumbri'];
const avSrc = a => `av/${avOf(a).f}.jpg`;
const avInitials = (a, txt, size) => { const st = avOf(a).ini; if (!st || !txt) return ''; const k = size / 72, sh = st[3] ? `text-shadow:${[0, 45, 90, 135, 180, 225, 270, 315].map(g => `${(Math.cos(g * Math.PI / 180) * 1.1 * k).toFixed(2)}px ${(Math.sin(g * Math.PI / 180) * 1.1 * k).toFixed(2)}px 0 ${st[3]}`).join(',')};` : '';
  return `<span style="position:absolute;inset:0;display:grid;place-items:center;transform:translateY(${st[0] * k}px);font:900 ${st[1] * k}px/1 ID,sans-serif;color:${st[2]};${sh}">${ex(String(txt).slice(0, 2).toUpperCase())}</span>`; };

// --- piezas pequeñas
const F = (w, s, c, extra = '') => `font:${w} ${s}px/1.15 ${w >= 800 ? 'ID' : 'I'},sans-serif;color:${c};${extra}`;
function ringAv(a, size, pct = .62, ring = true, ini = '') {
  const r = size / 2, sw = Math.max(3, size * .055), R = r - sw / 2, c = 2 * Math.PI * R, inner = size * .78;
  return `<div style="position:relative;width:${size}px;height:${size}px;flex:none">${ring ? `<svg width="${size}" height="${size}" style="position:absolute;inset:0;transform:rotate(-90deg)"><circle cx="${r}" cy="${r}" r="${R}" fill="none" stroke="${K.greenSoft}" stroke-width="${sw}"/><circle cx="${r}" cy="${r}" r="${R}" fill="none" stroke="${K.green}" stroke-width="${sw}" stroke-linecap="round" stroke-dasharray="${c * pct} ${c}"/></svg>` : ''}<div style="position:absolute;left:${(size - inner) / 2}px;top:${(size - inner) / 2}px;width:${inner}px;height:${inner}px;border-radius:50%;overflow:hidden"><img src="${avSrc(a)}" style="display:block;width:100%;height:100%;max-width:none" alt="">${avInitials(a, ini, inner)}</div></div>`;
}
const nvBadge = (n, s = 1) => `<span style="display:inline-flex;align-items:center;height:${40 * s}px;padding:0 ${16 * s}px;border-radius:${20 * s}px;background:${K.greenBg};${F(800, 22 * s, K.greenTxt)}">Nv ${ex(n)}</span>`;
const tri = (s, c = '#2A1E08') => `<svg width="${s}" height="${s * .86}" viewBox="0 0 20 17"><path d="M10 1 L19 16 H1 Z" fill="${c}" stroke="${c}" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
const fundBadge = (s = 1) => `<span style="display:inline-flex;align-items:center;justify-content:center;height:${36 * s}px;width:${52 * s}px;border-radius:${18 * s}px;background:${K.fund}">${tri(20 * s)}</span>`;
const fundPill = (s = 1) => `<span style="display:inline-flex;align-items:center;gap:${10 * s}px;height:${44 * s}px;padding:0 ${20 * s}px;border-radius:${22 * s}px;background:${K.fund};${F(800, 20 * s, '#2A1E08', 'letter-spacing:.12em')}">${tri(18 * s)}FUNDADOR</span>`;
const kproBadge = (s = 1) => `<span style="display:inline-flex;align-items:center;height:${40 * s}px;padding:0 ${16 * s}px;border-radius:${20 * s}px;background:${K.pro};${F(800, 21 * s, '#fff', 'letter-spacing:.14em')}">PRO</span>`;
const gradeBox = (g, s = 1, ring = false) => `<span style="display:inline-grid;place-items:center;min-width:${104 * s}px;height:${76 * s}px;padding:0 ${12 * s}px;border-radius:${18 * s}px;background:${gCol(g)};${ring ? `box-shadow:0 0 0 ${5 * s}px #E8642C;` : ''}${F(800, 38 * s, '#fff')}">${ex(g)}</span>`;
const dot = (c, s = 22) => `<span style="display:inline-block;width:${s}px;height:${s}px;border-radius:50%;background:${c};flex:none${c === '#FFFFFF' ? ';box-shadow:inset 0 0 0 2px #DADADA' : ''}"></span>`;
const HOLD = { negro: '#1B1B1F', blanco: '#FFFFFF', amarillo: '#F2C230', azul: '#2F7FE0', rojo: '#E03A3A', verde: '#3FAE6A', naranja: '#F08A3C', morado: '#8F4FD9', rosa: '#E0336F' };
const holdCol = n => HOLD[String(n).toLowerCase()] || '#999';
const ICON = {
  gym: (s, c) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.7"><rect x="4" y="3" width="11" height="18" rx="1.5"/><path d="M15 9h4.5v12H15M7 7h2M11 7h1M7 11h2M11 11h1M7 15h2M11 15h1M9 21v-3h2v3"/></svg>`,
  clock: (s, c) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 1.5M10 2h4"/></svg>`,
  gauge: (s, c) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 12l-3.5-3" stroke-linecap="round"/><circle cx="12" cy="7" r=".6" fill="${c}"/><circle cx="7" cy="12" r=".6" fill="${c}"/><circle cx="17" cy="12" r=".6" fill="${c}"/><circle cx="8.5" cy="8.5" r=".6" fill="${c}"/><circle cx="15.5" cy="8.5" r=".6" fill="${c}"/></svg>`,
  fire: (s, c) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3-1-4 1-7 1-9z" fill="${c}"/><path d="M12 14c1 1.5 2 2.2 2 3.6a2 2 0 0 1-4 0c0-1 .8-1.8 2-3.6z" fill="#fff" opacity=".85"/></svg>`,
  chat: (s, c) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2"><path d="M4 5h16v11H9l-5 4z" stroke-linejoin="round"/></svg>`,
  proj: (s, c) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2.4" stroke-dasharray="3.2 2.6"><circle cx="12" cy="12" r="8.5"/></svg>`,
  dots: (s, c) => `<svg width="${s}" height="${s / 4}" viewBox="0 0 24 6"><circle cx="3" cy="3" r="2.6" fill="${c}"/><circle cx="12" cy="3" r="2.6" fill="${c}"/><circle cx="21" cy="3" r="2.6" fill="${c}"/></svg>`,
  trophy: (s, c) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="${c}"><path d="M7 3h10v2h3v3a4 4 0 0 1-4 4h-.3A5 5 0 0 1 13 15v3h3v3H8v-3h3v-3a5 5 0 0 1-2.7-3H8a4 4 0 0 1-4-4V5h3zM5 7v1a2 2 0 0 0 2 2V7zm14 0h-2v3a2 2 0 0 0 2-2z"/></svg>`,
  cal: (s, c) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="17" rx="3" fill="${c}"/><path d="M3 9h18" stroke="#fff" stroke-width="1.6"/><g fill="#fff"><rect x="6" y="11.5" width="2.4" height="2" rx=".5"/><rect x="10.8" y="11.5" width="2.4" height="2" rx=".5"/><rect x="15.6" y="11.5" width="2.4" height="2" rx=".5"/><rect x="6" y="15.5" width="2.4" height="2" rx=".5"/><rect x="10.8" y="15.5" width="2.4" height="2" rx=".5"/></g></svg>`,
  check: (s, c) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`,
  x: (s, c) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>`,
  bolt: (s, c) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="${c}"><path d="M13.5 2L5 13.5h6L9.5 22 19 9.5h-6z"/></svg>`,
  hourglass: (s, c) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="${c}"><path d="M6 2h12v2h-1v3l-4 5 4 5v3h1v2H6v-2h1v-3l4-5-4-5V4H6zm3 2v2.3L12 10l3-3.7V4z"/></svg>`,
  pin: (s, c) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2"><circle cx="12" cy="5" r="2.5" fill="${c}"/><path d="M12 7.5V17M6 15c-2 .6-3 1.4-3 2.3C3 19.4 7 21 12 21s9-1.6 9-3.7c0-.9-1-1.7-3-2.3"/></svg>`,
  crown: (s, c) => `<svg width="${s}" height="${s * .7}" viewBox="0 0 30 21" fill="${c}"><path d="M2 6l7 6 6-10 6 10 7-6-3 13H5z"/><rect x="5" y="18" width="20" height="3" rx="1"/></svg>`,
  flag: (s, c) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="${c}"><path d="M5 3h2v18H5zM8 4h11l-3 4.5L19 13H8z"/></svg>`,
};

// --- cordillera (cada bloque es un pico, color por grado; «?» al final = proyecto, sale como pico fantasma)
function parseBlocks(s) { return String(s || '').trim().split(/[\s,]+/).filter(Boolean).map(t => ({ g: t.replace(/[?*]/g, '').toUpperCase(), ghost: /\?/.test(t), star: /\*/.test(t) })); }
// Nieve: casquete blanco que sigue los dos lados del pico y acaba en dientes. side(t,left) da el punto del lado (t=0 base, t=1 cima).
function snowCap(side, depth) {
  const top = side(1, true), L = [], R = [];
  for (let t = 1; t >= 0; t -= .02) { const a = side(t, true), b = side(t, false); if (a[1] - top[1] > depth) break; L.push(a); R.push(b); }
  if (L.length < 2) return '';
  const l = L[L.length - 1], r = R[R.length - 1], w = r[0] - l[0], j = depth * .24, yb = l[1];
  const teeth = [[l[0] + w * .2, yb - j * .6], [l[0] + w * .36, yb + j * .35], [l[0] + w * .55, yb - j * .8], [l[0] + w * .74, yb + j * .2], [l[0] + w * .88, yb - j * .5]];
  const d = `M${L.map(p => p.join(',')).join(' L')} L${teeth.map(p => p.join(',')).join(' L')} L${R.reverse().map(p => p.join(',')).join(' L')} Z`;
  return `<path d="${d}" fill="rgba(0,0,0,.18)" transform="translate(0 ${Math.max(1.5, depth * .06)})"/><path d="${d}" fill="#fff"/>`;
}
const cub = (p0, p1, p2, p3, t) => { const u = 1 - t; return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3; };
function ridgeSVG(blocks, w, h, { labels = true, pill = true, grid = true, bottom = true, snow = 'Ninguna' } = {}) {
  // Copia de AXSessionRidge.swift (la cordillera de la app):
  // · picos repartidos a partes iguales (como mucho 0,16 del ancho), base = un paso a cada lado, lados en curva cuadrática;
  // · altura = 0,16 + 0,84 × posición del grado en la escala 4…8C (con las guías de grados); sin guías, el más alto llega arriba;
  // · relleno del color del grado que oscurece hacia el suelo (35 % negro a ¾, 55 % abajo), los más altos detrás;
  // · flash = nieve blanca en la cima (como mucho 15 pt o el 30 % del pico) con el borde dentado;
  // · línea de cresta por encima de todo, en el color de cada pico aclarado un 35 %;
  // · proyectos detrás, del color del grado, 10 % más anchos.
  const id = 'rg' + (RID++); if (!blocks.length) blocks = [{ g: '5' }];
  const s = w / 323, gw = labels ? w - 22 * s : w;                      // s: puntos de la app → píxeles de aquí (756 px = 323 pt, como las capturas)
  const top0 = pill ? Math.min(26 * s, h * .3) : 2 * s, y0 = h - 1, ah = y0 - top0;
  const n = blocks.length, step = Math.min(1 / n, .16), start = (1 - step * n) / 2;
  const norm = g => .16 + .84 * gIx(g) / (GRADES.length - 1);
  const sends = blocks.filter(b => !b.ghost);
  const fit = grid ? 1 : Math.max(...blocks.map(b => norm(b.g)), .01);
  const P = blocks.map((b, i) => { const x = (start + step * (i + .5)) * gw, hw = step * gw, ht = Math.max(.12, norm(b.g) / fit) * ah; return { ...b, x, hw, ht, top: y0 - ht, c: gCol(b.g) }; });
  const realMax = sends.length ? Math.max(...sends.map(b => gIx(b.g))) : -1;
  const flank = (p, t, left, f = 1) => { const hw = p.hw * f, sx = p.x + (left ? -hw : hw), cx = p.x + (left ? -hw : hw) * .42, cy = y0 - p.ht * .32, u = 1 - t;
    return [u * u * sx + 2 * u * t * cx + t * t * p.x, u * u * y0 + 2 * u * t * cy + t * t * p.top]; };
  const mtn = (p, f = 1) => { const hw = p.hw * f; return `M${p.x - hw},${y0} Q${p.x - hw * .42},${y0 - p.ht * .32} ${p.x},${p.top} Q${p.x + hw * .42},${y0 - p.ht * .32} ${p.x + hw},${y0} Z`; };
  let defs = '', gl = '', ghosts = '', body = '', crest = '', pl = '';
  // guías: el comienzo de 6A, 6C y 7B, como en la app
  if (grid) ['6A', '6C', '7B'].forEach(g => { const yy = y0 - norm(g) * ah; if (yy < top0 - 4) return;
    gl += `<line x1="0" x2="${gw}" y1="${yy}" y2="${yy}" stroke="${K.grid}" stroke-width="${Math.max(1, s)}" stroke-dasharray="${2 * s} ${4 * s}"/>${labels ? `<text x="${w - 1}" y="${yy + 3.6 * s}" text-anchor="end" style="font:500 ${10 * s}px I,sans-serif;fill:${K.lab}">${g}</text>` : ''}`; });
  // 1. proyectos
  P.filter(p => p.ghost).forEach(p => { ghosts += `<path d="${mtn(p, 1.1)}" fill="${p.c}" fill-opacity=".2"/>`; });
  // 2. encadenados, los más altos primero
  P.filter(p => !p.ghost).sort((a, b) => b.ht - a.ht).forEach(p => {
    // el degradado va de la cima al suelo de cada pico
    const gid = `${id}m${P.indexOf(p)}`; defs += `<linearGradient id="${gid}" gradientUnits="userSpaceOnUse" x1="0" y1="${p.top}" x2="0" y2="${y0}"><stop offset="0" stop-color="${p.c}"/><stop offset=".75" stop-color="${kmix(p.c, '#000', .35)}"/><stop offset="1" stop-color="${kmix(p.c, '#000', .55)}"/></linearGradient>`;
    body += `<path d="${mtn(p)}" fill="url(#${gid})"/>`;
    const wantSnow = p.star || snow === 'En todos los picos' || (snow === 'En el más alto' && gIx(p.g) === realMax);
    if (wantSnow && p.ht > 4 * s) {
      const depth = Math.min(15 * s, p.ht * .3), t = 1 - depth / p.ht, A = flank(p, t, true), B = flank(p, t, false), wd = B[0] - A[0], j = Math.min(3.5 * s, depth * .25);
      body += `<path d="M${A} L${p.x},${p.top} L${B} L${A[0] + wd * .72},${A[1] - j} L${A[0] + wd * .52},${A[1] + j * .4} L${A[0] + wd * .3},${A[1] - j * .85} Z" fill="#fff"/>`;
    }
  });
  // 3. cresta: el borde de arriba de todos los encadenados juntos
  const S = P.filter(p => !p.ghost);
  if (S.length) {
    const x0 = Math.floor(Math.min(0, ...S.map(p => p.x - p.hw))), x1 = Math.ceil(Math.max(gw, ...S.map(p => p.x + p.hw))), env = new Array(x1 - x0 + 1).fill(y0);
    S.forEach(p => [true, false].forEach(left => { const pts = []; for (let k = 0; k <= 48; k++) pts.push(flank(p, k / 48, left)); pts.sort((a, b) => a[0] - b[0]);
      for (let k = 1; k < pts.length; k++) { const [ax, ay] = pts[k - 1], [bx, by] = pts[k];
        for (let c = Math.max(0, Math.floor(ax - x0)); c <= Math.min(env.length - 1, Math.ceil(bx - x0)); c++) { const X = x0 + c, tt = bx - ax > .001 ? Math.min(Math.max((X - ax) / (bx - ax), 0), 1) : 0, Y = ay + (by - ay) * tt; if (Y < env[c]) env[c] = Y; } } }));
    let d = '', on = false;
    env.forEach((Y, c) => { if (Y < y0 - .5) { d += `${on ? 'L' : 'M'}${x0 + c},${Y.toFixed(1)} `; on = true; } else on = false; });
    const stops = S.map(p => `<stop offset="${(p.x / gw).toFixed(4)}" stop-color="${kmix(p.c, '#fff', .35)}"/>`).join('');
    defs += `<linearGradient id="${id}cr" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${gw}" y2="0">${stops}</linearGradient>`;
    crest = `<path d="${d}" fill="none" stroke="url(#${id}cr)" stroke-width="${2 * s}" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  // 4. etiqueta del más difícil encadenado (el primero si hay empate)
  const hard = S.reduce((a, p) => !a || p.ht > a.ht ? p : a, null);
  if (pill && hard) { const fs = 11 * s, pw = hard.g.length * fs * .72 + 14 * s, ph = fs + 6 * s, cx = Math.min(Math.max(hard.x, pw / 2), gw - pw / 2), cy = hard.top - 15 * s;
    pl = `<g transform="translate(${cx - pw / 2},${cy - ph / 2})"><rect width="${pw}" height="${ph}" rx="${ph / 2}" fill="${hard.c}"/><text x="${pw / 2}" y="${ph / 2 + fs * .36}" text-anchor="middle" style="font:800 ${fs}px ID,sans-serif;fill:#fff">${ex(hard.g)}</text></g>`; }
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block;overflow:visible"><defs>${defs}<clipPath id="${id}k"><rect x="0" y="-80" width="${gw}" height="${h + 80}"/></clipPath></defs>${gl}<g clip-path="url(#${id}k)">${ghosts}${body}${crest}</g>${bottom ? `<line x1="0" x2="${gw}" y1="${y0}" y2="${y0}" stroke="${K.line}" stroke-width="${Math.max(1, s * .5)}"/>` : ''}${pl}</svg>`;
}
const statCol = (lab, val, col, lead = false) => `<div style="display:flex;flex-direction:column;gap:6px;flex:1;min-width:0">${lead ? `<div style="${F(800, 52, col, 'letter-spacing:-.02em')}">${ex(val)}</div><div style="${F(700, 20, K.lab, 'letter-spacing:.14em')}">${lab}</div>` : `<div style="${F(700, 20, K.lab, 'letter-spacing:.14em')}">${lab}</div><div style="${F(800, 52, col, 'letter-spacing:-.02em')}">${ex(val)}</div>`}</div>`;
const card828 = (inner, { w = 828, pad = 36, bg = K.card, extra = '' } = {}) => `<div style="width:${w}px;box-sizing:border-box;background:${bg};border-radius:44px;padding:${pad}px;box-shadow:0 24px 60px -34px rgba(90,40,60,.35);${extra}">${inner}</div>`;
const maxOf = blocks => { const r = blocks.filter(b => !b.ghost); return r.length ? r.reduce((a, b) => gIx(b.g) > gIx(a.g) ? b : a).g : '—'; };

// --- réplicas
const REPLICAS = [
  { id: 'rp-feed', name: 'Sesión en el feed', w: 828,
    props: {
      avatar: { label: 'Avatar', options: Object.keys(AVATARS), def: 'Regleta' }, nombre: { label: 'Nombre', text: true, def: 'Lucía S.' },
      nivel: { label: 'Nivel', text: true, def: '3' }, fundador: { label: 'Insignia de fundador', bool: true, def: true },
      hace: { label: 'Cuándo', text: true, def: 'hace 1 d' }, sensacion: { label: 'Sensación', options: ['Fácil', 'Bien', 'Dura'], def: 'Fácil' },
      roco: { label: 'Rocódromo', text: true, def: 'The Climb' },
      bloques: { label: 'Bloques en orden (6B? = proyecto, 6B* = ese pico con nieve)', area: true, def: '4 4+ 5 4+ 5 5+ 5+ 6A 5+ 6A 6A+ 6B 6A+ 6B 6C+? 6C+ 6B 6B+ 6C 6B+ 6B 6C 6B+ 6B 6A+ 6B 6B+ 6B' },
      nieve: { label: 'Nieve (además de los picos con *)', options: ['Ninguna', 'En el más alto', 'En todos los picos'], def: 'Ninguna' },
      tops: { label: 'Tops', text: true, def: '20' }, flash: { label: 'Flash', text: true, def: '17' }, max: { label: 'Máx (vacío = el más alto)', text: true, def: '' },
      titulo: { label: 'Logro conseguido en la sesión (vacío = ninguno). Ej.: Maratón, Sin prisa, Madrugador, Nocturno, Primer flash, Primer 7A', text: true, def: 'Maratón' }, nota: { label: 'Nota de la sesión (lo que escribe quien la sube)', text: true, def: '' },
      tiempo: { label: 'Duración', text: true, def: '1 h 8 min' }, proyectos: { label: 'Proyectos', text: true, def: '1 proyecto' },
      xp: { label: 'XP', text: true, def: '+238 XP' }, comentarios: { label: 'Comentarios', text: true, def: '1' }, kudos: { label: 'Kudos', text: true, def: '2' },
      pie: { label: 'Mostrar la parte de abajo', bool: true, def: true },
    },
    render: p => {
      const b = parseBlocks(p.bloques), mx = p.max || maxOf(b);
      const sens = { 'Fácil': [K.greenBg, K.greenTxt], 'Bien': ['#FBEBD3', '#D9901F'], 'Dura': ['#FBE3E8', '#E0336F'] }[p.sensacion] || [K.greenBg, K.greenTxt];
      return card828(`
        <div style="display:flex;align-items:center;gap:20px">${ringAv(p.avatar, 104)}
          <div style="flex:1;min-width:0"><div style="display:flex;align-items:center;gap:14px;${F(700, 34, K.ink)}">${ex(p.nombre)} ${nvBadge(p.nivel)} ${p.fundador ? fundBadge() : ''}</div><div style="${F(500, 26, K.sub, 'margin-top:6px')}">${ex(p.hace)}</div></div>
          <span style="display:inline-flex;align-items:center;gap:10px;height:58px;padding:0 22px;border-radius:29px;background:${sens[0]};${F(700, 26, sens[1])}">${ICON.gauge(28, sens[1])}${ex(p.sensacion)}</span>
          <span style="margin-left:18px">${ICON.dots(34, K.lab)}</span></div>
        <div style="display:flex;align-items:center;gap:16px;margin-top:22px;${F(500, 28, K.sub2)}">${ICON.gym(34, K.lab)}${ex(p.roco)}</div>
        <div style="margin-top:4px">${ridgeSVG(b, 756, 225, { snow: p.nieve })}</div>
        <div style="display:flex;margin-top:30px">${statCol('TOPS', p.tops, K.ink)}<div style="width:2px;background:${K.line};margin:0 26px"></div>${statCol('FLASH', p.flash, K.gold)}<div style="width:2px;background:${K.line};margin:0 26px"></div>${statCol('MÁX', mx, K.pink)}</div>
        ${p.pie ? `${p.titulo ? `<div style="display:flex;align-items:center;gap:22px;margin-top:40px;${F(600, 30, K.ink)}"><span style="width:66px;height:66px;border-radius:50%;background:linear-gradient(135deg,#9B6BF2,#6A3FD6);box-shadow:0 0 0 6px #EFE8FB;display:grid;place-items:center"><svg width="30" height="30" viewBox="0 0 24 24" fill="#fff"><path d="M12 3l9 5-9 5-9-5zM3 12l9 5 9-5v2.5l-9 5-9-5z"/></svg></span>${ex(p.titulo)}</div>` : ''}
        ${p.nota ? `<div style="${F(500, 31, K.ink, 'margin-top:28px')}">${ex(p.nota)}</div>` : ''}
        <div style="display:flex;align-items:center;gap:16px;margin-top:28px;${F(500, 28, K.sub2)}">${ICON.clock(32, K.sub2)} ${ex(p.tiempo)}<span style="width:26px"></span>${ICON.proj(32, K.blue)}<span style="color:${K.blue}">${ex(p.proyectos)}</span></div>
        <div style="display:flex;align-items:center;margin-top:28px"><span style="display:inline-flex;align-items:center;height:64px;padding:0 22px;border-radius:32px;background:${K.xpBg};${F(800, 28, K.goldXp)}">${ex(p.xp)}</span><span style="flex:1"></span>
          <span style="display:inline-flex;align-items:center;gap:14px;height:72px;padding:0 30px;border-radius:36px;background:${K.stat};${F(600, 30, K.lab)}">${ICON.chat(36, K.lab)}${ex(p.comentarios)}</span>
          <span style="display:inline-flex;align-items:center;gap:14px;height:72px;padding:0 30px;border-radius:36px;background:${K.pinkSoft};margin-left:18px;${F(600, 30, K.pink)}">${ICON.fire(36, K.pink)}${ex(p.kudos)}</span></div>` : ''}`);
    } },

  { id: 'rp-buena', name: '¡Buena sesión! (resumen)', w: 828,
    props: {
      roco: { label: 'Rocódromo', text: true, def: 'Sputnik Climbing Legazpi' }, tiempo: { label: 'Duración', text: true, def: '1 h 32 min' },
      bloques: { label: 'Bloques en orden (6B? = proyecto, 6B* = ese pico con nieve)', area: true, def: '4 4 4+ 4+ 5 5+ 6A 6A+ 6B 6B+?' },
      nieve: { label: 'Nieve (además de los picos con *)', options: ['Ninguna', 'En el más alto', 'En todos los picos'], def: 'Ninguna' },
      tops: { label: 'Tops', text: true, def: '9' }, flash: { label: 'Flash', text: true, def: '6' }, max: { label: 'Máx (vacío = el más alto)', text: true, def: '' }, xp: { label: 'XP', text: true, def: '+83 XP' },
    },
    render: p => { const b = parseBlocks(p.bloques), mx = p.max || maxOf(b);
      return card828(`<div style="display:flex;align-items:center;gap:16px;${F(500, 28, K.sub2)}">${ICON.gym(34, K.lab)}<span style="flex:1">${ex(p.roco)}</span>${ICON.clock(34, K.sub2)}<span style="color:${K.ink}">${ex(p.tiempo)}</span></div>
        <div style="margin-top:0">${ridgeSVG(b, 756, 300, { snow: p.nieve })}</div>
        <div style="display:flex;margin-top:30px">${statCol('TOPS', p.tops, K.ink, true)}${statCol('FLASH', p.flash, K.gold, true)}${statCol('MÁX', mx, K.pink, true)}<div style="display:flex;flex-direction:column;gap:6px;flex:1.3"><div style="${F(800, 52, K.goldXp, 'letter-spacing:-.02em;white-space:nowrap')}">${ex(p.xp)}</div><div style="${F(700, 20, K.lab, 'letter-spacing:.14em')}">XP</div></div></div>`); } },

  { id: 'rp-perfil', name: 'Cabecera del perfil', w: 828,
    props: {
      avatar: { label: 'Avatar', options: Object.keys(AVATARS), def: 'Kumbri' }, nombre: { label: 'Nombre', text: true, def: 'Alicia R.' },
      pro: { label: 'Insignia PRO', bool: true, def: true }, fundador: { label: 'Insignia de fundador', bool: true, def: true },
      usuario: { label: '@usuario', text: true, def: '@tu_nombre' }, dias: { label: 'Línea de días', text: true, def: '2/7 días esta semana' },
      nivel: { label: 'Nivel', text: true, def: 'Nv 4 · Novato' }, medio: { label: 'Grado medio', text: true, def: 'Medio 6A+' }, max: { label: 'Grado máximo', text: true, def: 'Máx 6C+ · 6b' },
      tops: { label: 'Tops', text: true, def: '62' }, kudos: { label: 'Kudos', text: true, def: '10' }, amigos: { label: 'Amigos', text: true, def: '2' },
      c1: { label: 'Color de arriba', color: true, def: '#2C3567' }, c2: { label: 'Color de abajo', color: true, def: '#3A2E62' },
    },
    render: p => card828(`
      <svg width="828" height="556" viewBox="0 0 828 556" style="position:absolute;left:0;top:0"><defs><linearGradient id="phm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF7EA"/><stop offset=".3" stop-color="#F5B860"/><stop offset=".62" stop-color="#E25C6A"/><stop offset="1" stop-color="${p.c2}" stop-opacity="0"/></linearGradient></defs>
        ${[[60, 40], [180, 120], [320, 70], [520, 30], [700, 140], [770, 60], [420, 200], [90, 260], [630, 260]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#fff" opacity=".35"/>`).join('')}
        <path d="M200 556 L720 84 L828 230 L828 556 Z" fill="url(#phm)" opacity=".95"/><path d="M0 556 L0 500 L104 380 L260 556 Z" fill="#5C5C8E" opacity=".45"/></svg>
      <div style="position:relative;display:flex;align-items:center;gap:32px">${ringAv(p.avatar, 206, .78)}<div style="min-width:0"><div style="display:flex;align-items:center;gap:16px;${F(800, 50, '#fff', 'letter-spacing:-.02em')}">${ex(p.nombre)} ${p.pro ? kproBadge() : ''} ${p.fundador ? fundBadge() : ''}</div><div style="${F(600, 29, 'rgba(255,255,255,.85)', 'margin-top:12px')}">${ex(p.usuario)}</div><div style="${F(500, 29, 'rgba(255,255,255,.85)', 'margin-top:8px')}">${ex(p.dias)}</div></div></div>
      <div style="position:relative;display:flex;align-items:center;gap:14px;margin-top:24px">${[p.nivel, p.medio, p.max].map((t, i) => `${i === 1 ? `<span style="${F(600, 30, '#fff')}">›</span>` : ''}<span style="display:inline-flex;align-items:center;height:56px;padding:0 22px;border-radius:28px;background:rgba(255,255,255,.18);${F(700, 27, '#fff')}">${ex(t)}</span>`).join('')}</div>
      <div style="position:relative;display:flex;margin-top:30px;padding:26px 0;border-radius:32px;background:rgba(255,255,255,.14)">${[[p.tops, 'Tops'], [p.kudos, 'Kudos'], [p.amigos, 'Amigos']].map(([v, l]) => `<div style="flex:1;text-align:center"><div style="${F(800, 46, '#fff')}">${ex(v)}</div><div style="${F(500, 25, 'rgba(255,255,255,.85)', 'margin-top:6px')}">${l}</div></div>`).join('')}</div>`,
      { pad: 44, bg: `linear-gradient(180deg,${p.c1},${kmix(p.c1, '#6E4E80', .5)} 55%,${p.c2})`, extra: 'position:relative;overflow:hidden;border-radius:48px' }) },

  { id: 'rp-semana', name: 'Tu semana (Inicio)', w: 828,
    props: {
      fechas: { label: 'Fechas', text: true, def: '5 oct – 11 oct' }, dias: { label: 'Días', text: true, def: '2' }, ddias: { label: 'Diferencia días', text: true, def: '-2' },
      enc: { label: 'Encadenes', text: true, def: '19' }, denc: { label: 'Diferencia encadenes', text: true, def: '-24' }, grado: { label: 'Grado máx.', text: true, def: '6C+' },
      ranking: { label: 'Línea del ranking', text: true, def: '1º de 2 en Sputnik Climbing Legazpi esta semana' },
      mensaje: { label: 'Mensaje', text: true, def: 'Menos días que la semana pasada. ¿Cuándo es la próxima?' },
      c1: { label: 'Color izquierda', color: true, def: '#DE5F3E' }, c2: { label: 'Color derecha', color: true, def: '#853686' },
    },
    render: p => card828(`
      <div style="display:flex;justify-content:space-between;align-items:center"><span style="${F(800, 25, 'rgba(255,255,255,.92)', 'letter-spacing:.16em')}">TU SEMANA</span><span style="${F(600, 26, 'rgba(255,255,255,.9)')}">${ex(p.fechas)}</span></div>
      <div style="display:flex;margin-top:40px">${[[p.dias, p.ddias, 'DÍAS'], [p.enc, p.denc, 'ENCADENES'], [p.grado, '', 'GRADO MÁX.']].map(([v, d, l]) => `<div style="flex:1"><div style="display:flex;align-items:baseline;gap:12px"><span style="${F(800, 76, '#fff', 'letter-spacing:-.02em;line-height:1')}">${ex(v)}</span>${d ? `<span style="${F(800, 30, 'rgba(255,255,255,.85)')}">${ex(d)}</span>` : ''}</div><div style="${F(700, 22, 'rgba(255,255,255,.85)', 'letter-spacing:.16em;margin-top:14px')}">${l}</div></div>`).join('')}</div>
      ${p.ranking ? `<div style="display:flex;gap:16px;margin-top:36px;${F(700, 31, '#fff', 'line-height:1.25')}">${ICON.trophy(36, '#fff')}<span>${ex(p.ranking)}</span></div>` : ''}
      <div style="display:flex;align-items:flex-end;gap:20px;margin-top:40px"><span style="flex:1;${F(500, 33, '#fff', 'line-height:1.3')}">${ex(p.mensaje)}</span><span style="width:82px;height:82px;border-radius:50%;background:rgba(255,255,255,.22);display:grid;place-items:center;flex:none"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M12 3v12M7.5 7.5L12 3l4.5 4.5M5 11v9h14v-9"/></svg></span></div>`,
      { pad: 42, bg: `linear-gradient(120deg,${p.c1},${kmix(p.c1, p.c2, .5)} 55%,${p.c2})` }) },

  { id: 'rp-nivel', name: 'Tu semana y nivel', w: 828,
    props: {
      tops: { label: 'Tops', text: true, def: '24' }, nivel: { label: 'Nivel', text: true, def: '4' }, progreso: { label: 'Progreso del nivel (%)', range: [0, 100], def: 70 },
      sesiones: { label: 'Sesiones', text: true, def: '3' }, flash: { label: 'Flash', text: true, def: '11' }, max: { label: 'Máx', text: true, def: '6C+' },
      pie: { label: 'Línea de abajo', text: true, def: 'Novato · 369 XP para el nivel 5' },
      c1: { label: 'Color arriba', color: true, def: '#DC3468' }, c2: { label: 'Color abajo', color: true, def: '#A9313E' },
    },
    render: p => { const R = 98, c = 2 * Math.PI * R;
      return card828(`<svg width="320" height="320" style="position:absolute;right:-36px;top:-36px"><circle cx="160" cy="160" r="160" fill="rgba(255,255,255,.08)"/></svg>
        <div style="position:relative;display:flex;justify-content:space-between"><div><div style="${F(800, 25, 'rgba(255,255,255,.92)', 'letter-spacing:.16em')}">TU SEMANA</div><div style="display:flex;align-items:baseline;gap:16px;margin-top:20px"><span style="${F(800, 128, '#fff', 'line-height:.9;letter-spacing:-.03em')}">${ex(p.tops)}</span><span style="${F(600, 38, '#fff')}">tops</span></div></div>
        <div style="position:relative;width:220px;height:220px;margin-top:-6px"><svg width="220" height="220" style="transform:rotate(-90deg)"><circle cx="110" cy="110" r="${R}" fill="none" stroke="rgba(255,255,255,.2)" stroke-width="12"/><circle cx="110" cy="110" r="${R}" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" stroke-dasharray="${c * p.progreso / 100} ${c}"/></svg><div style="position:absolute;inset:0;display:grid;place-content:center;text-align:center"><div style="${F(700, 22, 'rgba(255,255,255,.85)', 'letter-spacing:.12em')}">NIVEL</div><div style="${F(800, 64, '#fff', 'line-height:1')}">${ex(p.nivel)}</div></div></div></div>
        <div style="position:relative;display:flex;margin-top:30px;padding:26px 0;border-radius:32px;background:rgba(255,255,255,.14)">${[[p.sesiones, 'Sesiones'], [p.flash, 'Flash'], [p.max, 'Máx']].map(([v, l]) => `<div style="flex:1;text-align:center"><div style="${F(800, 46, '#fff')}">${ex(v)}</div><div style="${F(500, 25, 'rgba(255,255,255,.85)', 'margin-top:6px')}">${l}</div></div>`).join('')}</div>
        <div style="position:relative;${F(600, 28, '#fff', 'margin-top:34px')}">${ex(p.pie)}</div>`,
        { pad: 46, bg: `linear-gradient(160deg,${p.c1},${kmix(p.c1, p.c2, .6)} 60%,${kmix(p.c2, '#5a1a2a', .35)})`, extra: 'position:relative;overflow:hidden;border-radius:48px' }); } },

  { id: 'rp-racha', name: 'Racha', w: 828,
    props: {
      n: { label: 'Semanas', text: true, def: '6' },
      semanas: { label: 'Semanas (✓ = sí, x = no, · = esta)', text: true, def: 'x ✓ ✓ ✓ ✓ ✓ ✓' },
      fechas: { label: 'Fechas', text: true, def: '31/8 7/9 14/9 21/9 28/9 5/10 12/10' },
    },
    render: p => { const w = p.semanas.trim().split(/\s+/), d = p.fechas.trim().split(/\s+/);
      return card828(`<div style="display:flex;align-items:center;gap:18px"><span style="width:60px;height:60px;border-radius:16px;background:${K.pinkSoft};display:grid;place-items:center">${ICON.cal(34, K.pink)}</span><span style="${F(600, 26, K.sub2, 'letter-spacing:.06em')}">RACHA</span></div>
        <div style="display:flex;align-items:baseline;gap:22px;margin-top:40px"><span style="${F(800, 96, K.pink, 'line-height:1')}">${ex(p.n)}</span><span style="${F(500, 30, K.sub2)}">semanas</span></div>
        <div style="display:flex;justify-content:space-between;margin-top:46px">${w.map((s, i) => `<div style="display:flex;flex-direction:column;align-items:center;gap:22px"><span style="${F(500, 25, i === w.length - 1 ? K.pink : K.lab)}">${ex(d[i] || '')}</span><span style="width:64px;height:64px;border-radius:50%;display:grid;place-items:center;background:${s === '✓' || s === 'v' ? K.okBg : s === 'x' ? K.stat : K.stat}">${s === '✓' || s === 'v' ? ICON.check(36, K.ok).replace('2.6','2') : s === 'x' ? ICON.x(34, K.lab).replace('2.2','1.8') : ''}</span></div>`).join('')}</div>`, { pad: 36 }); } },

  { id: 'rp-podio', name: 'Ranking mensual (podio)', w: 828,
    props: {
      n1: { label: '1º nombre', text: true, def: 'Tú' }, a1: { label: '1º avatar', options: Object.keys(AVATARS), def: 'Kumbri' }, x1: { label: '1º XP', text: true, def: '1141 XP' },
      n2: { label: '2º nombre', text: true, def: 'Lucía S.' }, a2: { label: '2º avatar', options: Object.keys(AVATARS), def: 'Regleta' }, x2: { label: '2º XP', text: true, def: '982 XP' },
      n3: { label: '3º nombre', text: true, def: 'Silvia d.' }, a3: { label: '3º avatar', options: Object.keys(AVATARS), def: 'Canto' }, x3: { label: '3º XP', text: true, def: '649 XP' },
      fund: { label: 'Insignias de fundador', bool: true, def: true },
    },
    render: p => { const col = (n, a, x, place, h, c1, c2, nc, size) => `<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end">${place === 1 ? `<div style="margin-bottom:10px">${ICON.crown(58, '#E8B53A')}</div>` : ''}${ringAv(a, size, .7)}<div style="${F(600, 32, nc, 'margin-top:14px')}">${ex(n)}</div>${p.fund ? `<div style="margin-top:12px">${fundBadge(.95)}</div>` : ''}<div style="${F(500, 27, K.lab, 'margin-top:12px')}">${ex(x)}</div><div style="align-self:stretch;margin:24px 12px 0;height:${h}px;border-radius:28px 28px 0 0;background:linear-gradient(180deg,${c1},${c2});display:grid;place-items:center;${F(800, 52, place === 1 ? '#E8B53A' : place === 2 ? '#9AA1AC' : '#C9762E')}">${place}</div></div>`;
      return card828(`<div style="display:flex;align-items:flex-end;height:560px">${col(p.n2, p.a2, p.x2, 2, 122, '#D0D4DA', '#EEEFF1', K.ink, 132)}${col(p.n1, p.a1, p.x1, 1, 172, '#F5DEA9', '#FBF2DD', K.pink, 162)}${col(p.n3, p.a3, p.x3, 3, 90, '#E6BF98', '#F5E6D7', K.ink, 132)}</div>`, { pad: 36 }); } },

  { id: 'rp-reto', name: 'Reto entre amigos', w: 828,
    props: {
      titulo: { label: 'Título', text: true, def: 'Más encadenes en 1 mes' }, meta: { label: 'Meta', text: true, def: 'Meta: 60 encadenes' }, quedan: { label: 'Quedan', text: true, def: 'Quedan 22 días' },
      n1: { label: '1º nombre', text: true, def: 'Lucía' }, a1: { label: '1º avatar', options: Object.keys(AVATARS), def: 'Regleta' }, v1: { label: '1º lleva', text: true, def: '49' },
      n2: { label: '2º nombre', text: true, def: 'Tú' }, a2: { label: '2º avatar', options: Object.keys(AVATARS), def: 'Kumbri' }, v2: { label: '2º lleva', text: true, def: '32' },
      total: { label: 'Objetivo', text: true, def: '60' },
    },
    render: p => { const row = (i, n, a, v) => `<div style="display:flex;align-items:center;gap:24px;margin-top:${i === 1 ? 34 : 26}px"><span style="width:20px;${F(700, 30, K.sub2)}">${i}</span>${ringAv(a, 74, .7)}<div style="flex:1"><div style="display:flex;justify-content:space-between;${F(700, 30, K.ink)}"><span>${ex(n)}</span><span style="${F(600, 28, K.sub2)}">${ex(v)}/${ex(p.total)}</span></div><div style="height:12px;border-radius:6px;background:${K.accSoft};margin-top:14px"><div style="height:100%;width:${Math.min(100, (+v || 0) / (+p.total || 1) * 100)}%;border-radius:6px;background:${K.pink}"></div></div></div></div>`;
      return card828(`<div style="display:flex;justify-content:space-between;align-items:flex-start"><div><div style="${F(800, 36, K.ink)}">${ex(p.titulo)}</div><div style="${F(500, 28, K.lab, 'margin-top:8px')}">${ex(p.meta)}</div></div><span style="display:inline-flex;align-items:center;height:58px;padding:0 24px;border-radius:29px;background:${K.pinkSoft};${F(700, 27, K.pink)};white-space:nowrap">${ex(p.quedan)}</span></div>${row(1, p.n1, p.a1, p.v1)}${row(2, p.n2, p.a2, p.v2)}`, { pad: 34 }); } },

  { id: 'rp-grados', name: 'Rejilla de grados', w: 828,
    props: {
      grados: { label: 'Grados (×n = veces)', area: true, def: '4×2 4+×2 5×1 5+×1 6A×1 6A+×1 6B×1 6B+×1 6C 6C+ 7A 7A+ 7B 7B+ 7C 7C+ 8A 8A+ 8B 8B+ 8C' },
      apunta: { label: 'Se apunta como', options: ['Flash', 'Top', 'Proyecto', 'Probando', 'Ninguno'], def: 'Proyecto' },
      columnas: { label: 'Columnas', range: [4, 6], def: 6 },
    },
    render: p => { const items = p.grados.trim().split(/\s+/).map(t => { const m = t.split(/[×x]/); return { g: m[0], n: m[1] }; }); const cols = +p.columnas, gw = (828 - (cols - 1) * 16) / cols;
      const tile = it => `<div style="position:relative;height:${cols === 4 ? 136 : 100}px;border-radius:24px;background:${K.card};box-shadow:0 8px 20px -14px rgba(90,40,60,.3);display:grid;place-items:center;overflow:hidden"><span style="${F(800, cols === 4 ? 48 : 38, K.ink)}">${ex(it.g)}</span><span style="position:absolute;left:8px;right:8px;bottom:0;height:9px;border-radius:5px 5px 0 0;background:${gCol(it.g)}"></span></div>${it.n ? `<span style="position:absolute;right:-6px;top:-18px;height:38px;padding:0 12px;border-radius:19px;background:${gCol(it.g)};display:grid;place-items:center;${F(800, 22, '#fff')}">×${ex(it.n)}</span>` : ''}`;
      const btn = (k, l, ic, on, onBg, offBg, col) => `<div style="flex:${k === 'Probando' ? .66 : 1};height:114px;border-radius:30px;background:${on ? onBg : offBg};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;${F(700, k === 'Probando' ? 23 : 31, on ? '#fff' : col)}">${ic(on ? '#fff' : col)}${l}</div>`;
      return `<div style="width:828px"><div style="display:grid;grid-template-columns:repeat(${cols},${gw}px);gap:18px 16px">${items.map(it => `<div style="position:relative">${tile(it)}</div>`).join('')}</div>
        ${p.apunta !== 'Ninguno' ? `<div style="${F(500, 29, K.lab, 'margin:36px 0 18px')}">Se apunta como</div><div style="display:flex;gap:16px">${btn('Flash', 'Flash', c => ICON.bolt(42, c), p.apunta === 'Flash', '#A67C00', '#EFE2D2', '#A67C00')}${btn('Top', 'Top', c => ICON.check(44, c === '#fff' ? '#fff' : K.ok), p.apunta === 'Top', K.ok, '#E0EADF', K.ok)}${btn('Proyecto', 'Proyecto', c => ICON.proj(42, c), p.apunta === 'Proyecto', '#1F6FD1', '#DEDFEB', '#1F6FD1')}${btn('Probando', 'Probando', c => ICON.hourglass(34, c), p.apunta === 'Probando', K.lab, '#E7DFE2', K.lab)}</div>` : ''}</div>`; } },

  { id: 'rp-ano', name: 'Tu año en Kumbra', w: 828,
    props: {
      titulo: { label: 'Título', text: true, def: 'Tu 2026 en Kumbra' }, sesiones: { label: 'Sesiones', text: true, def: '48' }, bloques: { label: 'Bloques y vías', text: true, def: '612' },
      grado: { label: 'Grado máximo', text: true, def: '6C+ · 6b' }, horas: { label: 'Horas', text: true, def: '71 h' },
      roco: { label: 'Tu rocódromo', text: true, def: 'Tu rocódromo: Sputnik Climbing Legazpi' }, mes: { label: 'Mejor mes', text: true, def: 'Tu mejor mes: octubre' },
      acento: { label: 'Color de los números', color: true, def: '#C8F31D' },
    },
    render: p => card828(`<svg width="360" height="110" viewBox="0 0 360 110" style="position:absolute;right:30px;bottom:26px"><path d="M0 110 L80 52 L130 82 L200 0 L260 60 L300 40 L360 110Z" fill="#5A2333" opacity=".9"/></svg>
      <div style="position:relative;${F(800, 46, '#fff')}">${ex(p.titulo)}</div>
      <div style="position:relative;display:grid;grid-template-columns:1fr 1fr;gap:34px 20px;margin-top:40px">${[[p.sesiones, 'Sesiones'], [p.bloques, 'Bloques y vías'], [p.grado, 'Grado máximo'], [p.horas, 'Escalando']].map(([v, l]) => `<div><div style="${F(800, 62, p.acento, 'line-height:1')}">${ex(v)}</div><div style="${F(500, 27, 'rgba(255,255,255,.75)', 'margin-top:12px')}">${l}</div></div>`).join('')}</div>
      <div style="position:relative;display:flex;align-items:center;gap:20px;margin-top:40px;${F(600, 30, '#fff')}">${ICON.pin(34, '#fff')}${ex(p.roco)}</div><div style="position:relative;display:flex;align-items:center;gap:20px;margin-top:26px;${F(600, 30, '#fff')}"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8"><rect x="3" y="4" width="18" height="17" rx="2.5"/><path d="M3 9h18M7 13h2M11 13h2M15 13h2M7 17h2M11 17h2"/></svg>${ex(p.mes)}</div>`,
      { pad: 42, bg: '#18181A', extra: 'position:relative;overflow:hidden' }) },

  { id: 'rp-roco', name: 'Cabecera de rocódromo', w: 828,
    props: {
      nombre: { label: 'Nombre', text: true, def: 'Sputnik Climbing Legazpi' }, lugar: { label: 'Tipo y ciudad', text: true, def: 'Rocódromo · Madrid, Madrid' },
      sesiones: { label: 'Sesiones', text: true, def: '128' }, escaladores: { label: 'Escaladores', text: true, def: '43' }, tops: { label: 'Tops', text: true, def: '1.904' },
      c1: { label: 'Color claro', color: true, def: '#3685D8' }, c2: { label: 'Color oscuro', color: true, def: '#1F3E94' },
    },
    render: p => card828(`<svg width="828" height="466" style="position:absolute;left:0;top:0"><circle cx="760" cy="80" r="280" fill="rgba(255,255,255,.07)"/><circle cx="60" cy="470" r="160" fill="rgba(255,255,255,.06)"/></svg>
      <div style="position:relative;display:flex;gap:36px;align-items:flex-start"><span style="width:146px;height:146px;border-radius:36px;background:rgba(255,255,255,.18);display:grid;place-items:center;flex:none">${ICON.gym(74, '#fff').replace('fill="none"', 'fill="none"')}</span><div style="min-width:0;padding-top:4px"><div style="${F(800, 54, '#fff', 'line-height:1.08;letter-spacing:-.01em')}">${ex(p.nombre)}</div><div style="${F(600, 29, 'rgba(255,255,255,.9)', 'margin-top:14px')}">${ex(p.lugar)}</div></div></div>
      <div style="position:relative;display:flex;margin-top:40px;padding:28px 0;border-radius:30px;background:rgba(255,255,255,.14)">${[[p.sesiones, 'Sesiones'], [p.escaladores, 'Escaladores'], [p.tops, 'Tops']].map(([v, l]) => `<div style="flex:1;text-align:center"><div style="${F(800, 48, '#fff')}">${ex(v)}</div><div style="${F(500, 26, 'rgba(255,255,255,.9)', 'margin-top:6px')}">${l}</div></div>`).join('')}</div>`,
      { pad: 44, bg: `linear-gradient(135deg,${p.c1},${p.c2})`, extra: 'position:relative;overflow:hidden;border-radius:48px' }) },

  { id: 'rp-proyectos', name: 'Tus proyectos', w: 828,
    props: {
      marcha: { label: 'En marcha', text: true, def: '4' }, enc: { label: 'Encadenados', text: true, def: '1' },
      lista: { label: 'Proyectos (grado | presa | nota | detalle), uno por línea', area: true, def: '6B | negro | Negro · me quedo bloqueada en el desplome | Sputnik Climbing Legazpi · 3 intentos\n6C | amarillo | Amarillo · no sé cómo pasar del primer paso | Sputnik Climbing Legazpi · 5 intentos\n7A | blanco | Blanco · en la rotonda según entras | Sputnik Climbing Legazpi · 1 intento' },
      hecho: { label: 'Encadenado (grado | presa | nota | detalle)', text: true, def: '6B+ | blanco | Blanco | Sputnik Climbing Legazpi · 2 intentos' },
    },
    render: p => { const row = (l, done) => { const [g, h, t, d] = l.split('|').map(s => s.trim()); return `<div style="display:flex;align-items:center;gap:28px;margin-top:22px">${gradeBox(g || '6A')}<div style="flex:1;min-width:0"><div style="display:flex;align-items:center;gap:14px;${F(500, 32, K.ink, 'white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}">${dot(holdCol(h))}<span style="overflow:hidden;text-overflow:ellipsis">${ex(t)}</span></div><div style="${F(500, 27, K.lab, 'margin-top:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}">${ex(d)}</div></div>${done ? ICON.check(44, K.ok) : ''}</div>`; };
      return card828(`<div style="display:flex;align-items:center;gap:20px">${ICON.flag(36, K.pink)}<span style="${F(700, 25, K.sub2, 'letter-spacing:.14em')}">TUS PROYECTOS</span></div>
        <div style="display:flex;gap:44px;margin-top:30px"><div><div style="${F(800, 56, K.ink)}">${ex(p.marcha)}</div><div style="${F(500, 26, K.sub2, 'margin-top:8px')}">En marcha</div></div><div><div style="${F(800, 56, K.ink)}">${ex(p.enc)}</div><div style="${F(500, 26, K.sub2, 'margin-top:8px')}">Encadenados</div></div></div>
        <div style="${F(700, 22, K.lab, 'letter-spacing:.14em;margin-top:40px')}">EN MARCHA</div>${p.lista.split('\n').filter(Boolean).map(l => row(l)).join('')}
        ${p.hecho ? `<div style="${F(700, 22, K.lab, 'letter-spacing:.14em;margin-top:34px')}">ENCADENADOS</div>${row(p.hecho, true)}` : ''}`, { pad: 36 }); } },

  { id: 'rp-chat', name: 'Burbuja de chat', w: 0,
    props: { texto: { label: 'Texto', text: true, def: '¿Vamos el jueves al roco?' }, mia: { label: 'Mía (rosa)', bool: true, def: true }, fecha: { label: 'Fecha', text: true, def: '4 oct' } },
    render: p => `<div style="display:inline-flex;flex-direction:column;align-items:${p.mia ? 'flex-end' : 'flex-start'};gap:10px"><span style="display:inline-block;max-width:640px;padding:20px 34px;border-radius:40px;background:${p.mia ? K.pink : K.card};${F(500, 34, p.mia ? '#fff' : K.ink, 'line-height:1.25')}">${ex(p.texto)}</span>${p.fecha ? `<span style="${F(500, 24, K.lab)}">${ex(p.fecha)}</span>` : ''}</div>` },

  { id: 'rp-insignia', name: 'Insignia o píldora', w: 0,
    props: {
      tipo: { label: 'Tipo', options: ['Grado', 'Nivel', 'PRO', 'Fundador', 'Fundador con texto', '+XP', 'Kudos', 'Sensación'], def: 'Grado' },
      texto: { label: 'Texto (grado, nivel, XP…)', text: true, def: '6C+' }, tam: { label: 'Tamaño', range: [50, 300], def: 140 },
    },
    render: p => { const s = p.tam / 100, t = p.texto;
      const m = { 'Grado': () => gradeBox(t, s), 'Nivel': () => nvBadge(t.replace(/^nv\s*/i, ''), s), 'PRO': () => kproBadge(s), 'Fundador': () => fundBadge(s), 'Fundador con texto': () => fundPill(s),
        '+XP': () => `<span style="display:inline-flex;align-items:center;height:${64 * s}px;padding:0 ${22 * s}px;border-radius:${32 * s}px;background:${K.xpBg};${F(800, 28 * s, K.goldXp)}">${ex(t.startsWith('+') ? t : '+' + t + ' XP')}</span>`,
        'Kudos': () => `<span style="display:inline-flex;align-items:center;gap:${14 * s}px;height:${72 * s}px;padding:0 ${30 * s}px;border-radius:${36 * s}px;background:${K.pinkSoft};${F(600, 30 * s, K.pink)}">${ICON.fire(36 * s, K.pink)}${ex(t)}</span>`,
        'Sensación': () => `<span style="display:inline-flex;align-items:center;gap:${10 * s}px;height:${58 * s}px;padding:0 ${22 * s}px;border-radius:${29 * s}px;background:${K.greenBg};${F(700, 26 * s, '#3FA046')}">${ICON.gauge(28 * s, '#3FA046')}${ex(t)}</span>` };
      return `<div style="display:inline-block">${(m[p.tipo] || m['Grado'])()}</div>`; } },

  { id: 'rp-colores', name: 'Montañas de colores', w: 1000,
    props: {
      colores: { label: 'Colores (de izquierda a derecha)', text: true, def: 'verde amarillo naranja rojo magenta morado azul' },
      orden: { label: 'Alturas', options: ['Subiendo', 'Bajando', 'Iguales', 'Montaña en el centro'], def: 'Subiendo' },
      nieve: { label: 'Nieve', options: ['Ninguna', 'En la más alta', 'En todas'], def: 'En la más alta' },
      ancho: { label: 'Ancho', range: [300, 1400], def: 1000 }, alto: { label: 'Alto', range: [120, 900], def: 500 },
      solape: { label: 'Separación', range: [60, 140], def: 95 },
    },
    render: p => {
      const NAMED = { verde: '#3DB36B', amarillo: '#E8C23A', naranja: '#F08A3C', rojo: '#E5484D', magenta: '#D0479A', morado: '#8B5CF6', azul: '#5B6CF0' };
      const C = String(p.colores).trim().split(/[\s,]+/).map(c => NAMED[c.toLowerCase()] || (/^#[0-9a-f]{3,6}$/i.test(c) ? c : null)).filter(Boolean);
      const n = Math.max(C.length, 1), w = +p.ancho, h = +p.alto, sp = w / (n + .2), hw = sp * (+p.solape / 100), id = 'mc' + (RID++);
      const fr = i => n === 1 ? 1 : p.orden === 'Bajando' ? 1 - i / (n - 1) : p.orden === 'Iguales' ? 1 : p.orden === 'Montaña en el centro' ? 1 - Math.abs(i - (n - 1) / 2) / ((n - 1) / 2) : i / (n - 1);
      const H = C.map((c, i) => h * (.3 + .7 * fr(i))), maxH = Math.max(...H);
      let defs = '', b = '';
      C.forEach((c, i) => { const x = sp * (i + .6), ph = H[i], y = h - ph;
        defs += `<linearGradient id="${id}${i}" x1="0" y1="${y}" x2="0" y2="${h}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${c}"/><stop offset="1" stop-color="${c}" stop-opacity=".55"/></linearGradient>`;
        b += `<path d="M${x - hw},${h} Q${x - hw * .3},${h - ph * .35} ${x},${y} Q${x + hw * .3},${h - ph * .35} ${x + hw},${h}Z" fill="url(#${id}${i})" opacity=".95"/>`;
        if (p.nieve === 'En todas' || (p.nieve === 'En la más alta' && ph === maxH)) {
          const side = (t, left) => { const sg = left ? -1 : 1, u = 1 - t; return [u * u * (x + sg * hw) + 2 * u * t * (x + sg * hw * .3) + t * t * x, u * u * h + 2 * u * t * (h - ph * .35) + t * t * y]; };
          b += snowCap(side, ph * .24);
        } });
      return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block;overflow:visible"><defs>${defs}</defs>${b}</svg>`;
    } },

  { id: 'rp-cordillera', name: 'Cordillera de sesión (suelta)', w: 828,
    props: {
      bloques: { label: 'Bloques en orden (6B? = proyecto, 6B* = ese pico con nieve)', area: true, def: '4 4+ 5 5+ 5+ 6A 6A 6A+ 6B 6A+ 6B 6B+ 6C 6B+ 6C+ 7A?' },
      ancho: { label: 'Ancho', range: [300, 1080], def: 828 }, alto: { label: 'Alto', range: [80, 600], def: 300 },
      nieve: { label: 'Nieve (además de los picos con *)', options: ['Ninguna', 'En el más alto', 'En todos los picos'], def: 'Ninguna' },
      grados: { label: 'Grados a la derecha', bool: true, def: true }, etiqueta: { label: 'Etiqueta del máximo', bool: true, def: true },
    },
    render: p => `<div style="display:inline-block">${ridgeSVG(parseBlocks(p.bloques), +p.ancho, +p.alto, { labels: p.grados, pill: p.etiqueta, grid: p.grados, snow: p.nieve })}</div>` },
];

// Todas las réplicas llevan tema y modo (por defecto, el original de la app en claro).
REPLICAS.forEach(r => {
  if (['rp-insignia', 'rp-colores'].includes(r.id)) return;
  // Las tarjetas de color propio (perfil, tu semana, nivel, tu año, rocódromo) no cambian con el tema ni con el modo.
  const fixed = ['rp-perfil', 'rp-semana', 'rp-nivel', 'rp-ano', 'rp-roco'].includes(r.id), noTheme = fixed || r.id === 'rp-grados';
  r.props = { ...(noTheme ? {} : { tema: { label: 'Tema de la app', options: Object.keys(THEMES), def: 'Coral (original)' } }), ...(fixed ? {} : { modo: { label: 'Modo', options: ['Claro', 'Oscuro'], def: 'Claro' } }), ...r.props };
  const draw = r.render; r.render = (p, ink) => { setTheme(p.tema, p.modo); const out = draw(p, ink); setTheme('Coral (original)', 'Claro'); return out; };
});

// ---------------- Móvil editable ----------------
// Un iPhone cuya pantalla se monta con las réplicas de arriba. La pantalla mide 920 × 2000 (como las capturas) y se escala.
const PIECES = Object.fromEntries(REPLICAS.filter(r => !['rp-insignia', 'rp-colores', 'rp-chat'].includes(r.id)).map(r => [r.name, r.id]));
const TAB_ICON = {
  Inicio: c => `<svg width="46" height="46" viewBox="0 0 24 24" fill="${c}"><path d="M12 3.2 2.8 11h2.7v9.5h5v-6h3v6h5V11h2.7z"/></svg>`,
  Explorar: c => `<svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M15.8 8.2 13.6 13.6 8.2 15.8l2.2-5.4z" fill="${c}"/></svg>`,
  Añadir: c => `<svg width="46" height="46" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="${c}"/><path d="M12 7v10M7 12h10" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></svg>`,
  Compite: c => ICON.trophy(46, c),
  Perfil: c => `<svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3.4" fill="${c}"/><path d="M5.8 18.6c1.4-2.2 3.6-3.4 6.2-3.4s4.8 1.2 6.2 3.4" fill="${c}"/></svg>`,
};
const TOPBTN = {
  Notificaciones: c => `<svg width="40" height="40" viewBox="0 0 24 24" fill="${c}"><path d="M12 2.5a6 6 0 0 0-6 6v4.2L4 16.5h16l-2-3.8V8.5a6 6 0 0 0-6-6zM9.6 18.5a2.4 2.4 0 0 0 4.8 0z"/></svg>`,
  Ajustes: c => `<svg width="40" height="40" viewBox="0 0 24 24" fill="${c}"><path d="M10.3 2h3.4l.5 2.6 1.9.8 2.2-1.5 2.4 2.4-1.5 2.2.8 1.9 2.6.5v3.4l-2.6.5-.8 1.9 1.5 2.2-2.4 2.4-2.2-1.5-1.9.8-.5 2.6h-3.4l-.5-2.6-1.9-.8-2.2 1.5-2.4-2.4 1.5-2.2-.8-1.9L2 13.7v-3.4l2.6-.5.8-1.9-1.5-2.2 2.4-2.4 2.2 1.5 1.9-.8zM12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8z"/></svg>`,
  Mensajes: c => `<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.9" stroke-linejoin="round"><path d="M3 5h12v8H8l-4 3v-3H3z"/><path d="M15 9h6v8h-1v3l-4-3h-4v-4"/></svg>`,
};
const PHONE_SCREENS = {
  'Inicio': { tab: 'Inicio', fecha: 'LUNES, 12 DE OCTUBRE', titulo: 'Hola, Laura', botones: 'Mensajes + avatar', piezas: 'Tu semana (Inicio)\n# Actividad\nSesión en el feed' },
  'Perfil': { tab: 'Perfil', fecha: '', titulo: 'Perfil', botones: 'Notificaciones + ajustes', piezas: 'Cabecera del perfil\nTu semana y nivel\nRacha' },
  'Perfil · progreso': { tab: 'Perfil', fecha: '', titulo: 'Perfil', botones: 'Notificaciones + ajustes', piezas: 'Tus proyectos\nTu año en Kumbra' },
  'Apuntar bloques': { tab: 'Añadir', fecha: '', titulo: 'Sputnik Climbing', botones: 'Ninguno', piezas: 'Rejilla de grados\n¡Buena sesión! (resumen)' },
  '¡Buena sesión!': { tab: 'Añadir', fecha: '', titulo: '¡Buena sesión!', botones: 'Ninguno', piezas: '¡Buena sesión! (resumen)' },
  'Compite': { tab: 'Compite', fecha: '', titulo: 'Compite', botones: 'Ninguno', piezas: '# Ranking mensual\nRanking mensual (podio)\n# Retos\nReto entre amigos' },
  'Amigos': { tab: 'Inicio', fecha: '', titulo: 'Actividad', botones: 'Mensajes + avatar', piezas: 'Sesión en el feed\nSesión en el feed' },
  'Rocódromo': { tab: 'Explorar', fecha: '', titulo: '', botones: 'Ninguno', piezas: 'Cabecera de rocódromo\n# Tus proyectos aquí\nTus proyectos' },
  'En blanco': { tab: 'Inicio', fecha: '', titulo: 'Kumbra', botones: 'Ninguno', piezas: '' },
};
const pieceLines = p => String(p.piezas ?? phoneScreen(p).piezas ?? '').split('\n').map(s => s.trim()).filter(Boolean);
const phoneScreen = p => PHONE_SCREENS[p.pantalla] || PHONE_SCREENS['Perfil'];
REPLICAS.push({ id: 'rp-movil', name: 'Móvil editable', w: 560,
  dynProps: p => {
    const sc = phoneScreen(p), d = {
      pantalla: { label: 'Pantalla de partida', options: Object.keys(PHONE_SCREENS), def: 'Perfil', resets: ['tema', 'modo', 'marco', 'ancho'] },
      tema: { label: 'Tema de la app', options: Object.keys(THEMES), def: 'Coral (original)' }, modo: { label: 'Modo', options: ['Claro', 'Oscuro'], def: 'Claro' },
      marco: { label: 'Con marco de móvil', bool: true, def: true }, ancho: { label: 'Ancho', range: [240, 1000], def: 560 },
      desplazar: { label: 'Bajar el contenido (como hacer scroll)', range: [0, 2400], def: 0 },
      fecha: { label: 'Línea pequeña sobre el título', text: true, def: sc.fecha }, titulo: { label: 'Título de la pantalla', text: true, def: sc.titulo },
      botones: { label: 'Botones de arriba', options: ['Notificaciones + ajustes', 'Mensajes + avatar', 'Ninguno'], def: sc.botones },
      avatar: { label: 'Tu avatar (arriba, en tu perfil y donde salgas «Tú»)', options: Object.keys(AVATARS), def: 'Kumbri' },
      tab: { label: 'Pestaña activa', options: [...Object.keys(TAB_ICON), 'Sin barra'], def: sc.tab },
      piezas: { label: 'Piezas, una por línea y en orden (# Texto = título de sección)', area: true, def: sc.piezas, hint: 'Piezas disponibles: ' + Object.keys(PIECES).join(' · ') },
    };
    pieceLines(p).forEach((line, i) => {
      if (line.startsWith('#')) return;
      const r = REPLICAS.find(x => x.id === PIECES[line]); if (!r) return;
      d[`k${i}__h`] = { heading: `${i + 1}. ${line}` };
      for (const [k, v] of Object.entries(r.props || {})) if (!['tema', 'modo'].includes(k)) d[`k${i}__${k}`] = v.def === 'Kumbri' && p.avatar ? { ...v, def: p.avatar } : { ...v };
    });
    return d;
  },
  render: (p) => {
    const sc = phoneScreen(p); setTheme(p.tema, p.modo); const T = { ...K };
    const val = k => p[k] ?? ({ fecha: sc.fecha, titulo: sc.titulo, botones: sc.botones, tab: sc.tab })[k];
    const parts = pieceLines(p).map((line, i) => {
      if (line.startsWith('#')) return `<div style="${F(800, 44, T.ink, 'letter-spacing:-.01em;margin:22px 0 4px')}">${ex(line.replace(/^#\s*/, ''))}</div>`;
      const r = REPLICAS.find(x => x.id === PIECES[line]); if (!r) return `<div style="${F(500, 26, T.lab)}">«${ex(line)}» no es una pieza</div>`;
      const pp = {}; for (const [k, v] of Object.entries(r.props || {})) pp[k] = p[`k${i}__${k}`] ?? (v.def === 'Kumbri' && p.avatar ? p.avatar : v.def);
      pp.tema = p.tema; pp.modo = p.modo;
      return r.render(pp);
    });
    setTheme(p.tema, p.modo);
    const bt = val('botones'), circ = inner => `<span style="width:92px;height:92px;border-radius:50%;background:${T.card};display:grid;place-items:center;box-shadow:0 10px 24px -14px rgba(0,0,0,.35)">${inner}</span>`;
    const btns = bt === 'Notificaciones + ajustes' ? circ(TOPBTN.Notificaciones(T.ink)) + circ(TOPBTN.Ajustes(T.ink)) : bt === 'Mensajes + avatar' ? circ(TOPBTN.Mensajes(T.ink)) + ringAv(p.avatar || 'Alicia (montaña)', 124, .7) : '';
    const tab = val('tab'), tabs = tab === 'Sin barra' ? '' : `<div style="position:absolute;left:37px;right:37px;bottom:105px;height:128px;border-radius:64px;background:${T.card};box-shadow:0 18px 40px -18px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:space-around;padding:0 14px;z-index:5">${Object.keys(TAB_ICON).map(n => { const on = n === tab, c = on ? T.pink : (n === 'Añadir' ? T.lab : T.lab); return `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 18px;border-radius:44px;${on ? `background:${T.accSoft}` : ''}">${TAB_ICON[n](n === 'Añadir' && !on ? T.lab : c)}<span style="${F(500, 25, c)}">${n}</span></div>`; }).join('')}</div>`;
    const head = (val('titulo') || val('fecha') || btns) ? `<div style="display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:36px"><div style="min-width:0">${val('fecha') ? `<div style="${F(600, 26, T.lab, 'letter-spacing:.12em;margin-bottom:10px')}">${ex(val('fecha'))}</div>` : ''}<div style="${F(800, 74, T.ink, 'letter-spacing:-.02em;line-height:1.05')}">${ex(val('titulo'))}</div></div><div style="display:flex;gap:18px;align-items:center;flex:none">${btns}</div></div>` : '';
    const screen = `<div style="position:relative;width:920px;height:2000px;overflow:hidden;background:${T.bg}">
      <div style="position:absolute;left:46px;right:46px;top:${160 - (+p.desplazar || 0)}px;display:flex;flex-direction:column;gap:32px">${head}${parts.join('')}</div>
      <div style="position:absolute;left:0;right:0;top:0;height:140px;background:linear-gradient(${T.bg} 70%,${T.bg}00);z-index:4"></div>${STATUS_920(T.dark)}${tabs}</div>`;
    setTheme('Coral (original)', 'Claro');
    const W = +p.ancho || 560, k = W / 920, H = 2000 * k;
    const inner = `<div style="position:relative;width:${W}px;height:${H}px;overflow:hidden;border-radius:${p.marco ? W * .13 : W * .06}px"><div style="transform:scale(${k});transform-origin:0 0;width:920px;height:2000px">${screen}</div>${p.marco ? `<div style="position:absolute;left:50%;top:${W * .03}px;width:${W * .3}px;height:${W * .09}px;margin-left:${-W * .15}px;border-radius:${W * .05}px;background:#000;z-index:6"></div>` : ''}</div>`;
    if (!p.marco) return `<div style="display:inline-block;box-shadow:0 40px 90px -40px rgba(40,10,30,.55);border-radius:${W * .06}px">${inner}</div>`;
    const b = W * .038;
    return `<div style="display:inline-block;padding:${b}px;border-radius:${W * .13 + b}px;background:linear-gradient(145deg,#3a3a3e,#0d0d0f 40%,#1e1e21);box-shadow:inset 0 0 0 ${W * .006}px #57575c,0 50px 110px -40px rgba(30,5,25,.65)">${inner}</div>`;
  } });
// barra de estado limpia a la escala de la pantalla (920 px)
const STATUS_920 = dark => { const c = dark ? '#fff' : '#111'; return `<div style="position:absolute;left:0;right:0;top:0;height:118px;display:flex;align-items:center;justify-content:space-between;padding:8px 92px 0 98px;box-sizing:border-box;font:600 33px/1 I,sans-serif;color:${c};z-index:5">9:41<svg width="180" height="30" viewBox="0 0 180 30"><g fill="${c}"><rect x="0" y="19" width="7" height="9" rx="2"/><rect x="11" y="14" width="7" height="14" rx="2"/><rect x="22" y="8" width="7" height="20" rx="2"/><rect x="33" y="2" width="7" height="26" rx="2"/><path d="M68 9a20 20 0 0 1 28 0l-3.4 3.6a15 15 0 0 0-21.2 0zM73.5 15a12 12 0 0 1 17 0L87 18.6a7 7 0 0 0-10 0zM82 27l-4.3-4.6a6 6 0 0 1 8.6 0z"/><rect x="118" y="3" width="52" height="24" rx="7" fill="none" stroke="${c}" stroke-width="2.4" opacity=".45"/><rect x="122" y="7" width="44" height="16" rx="4"/><rect x="173" y="11" width="4" height="8" rx="2" opacity=".45"/></g></svg></div>`; };
