// Kumbra Studio · catálogo: fondos, estilos de texto, elementos y bases.
// Todo se mide en píxeles del post real (1080 de ancho).

const FORMATS = {
  post:  { label: 'Post 4:5',  w: 1080, h: 1350 },
  story: { label: 'Story 9:16', w: 1080, h: 1920 },
};

// ---------- Fondos ----------
// ink: 'light' = textos claros, 'dark' = textos oscuros
const BGS = [
  { id: 'negro',  name: 'Negro',   group: 'Básicos', css: '#1B1719', ink: 'light', glow: true },
  { id: 'blanco', name: 'Blanco',  group: 'Básicos', css: '#FFFFFF', ink: 'dark' },
  { id: 'crema',  name: 'Crema',   group: 'Básicos', img: 'crema', ink: 'dark' },
  { id: 'rosa',   name: 'Degradado rosa', group: 'Básicos', img: 'rosa', ink: 'dark' },
  { id: 'noche',  name: 'Noche',   group: 'Básicos', img: 'noche', ink: 'light' },
  { id: 'noche-violeta', name: 'Noche violeta', group: 'Básicos', img: 'noche-violeta', ink: 'light' },
  { id: 'atardecer', name: 'Atardecer', group: 'Básicos', img: 'atardecer', ink: 'light' },
  { id: 'cresta', name: 'Cresta', group: 'Básicos', img: 'cresta', ink: 'light' },
  { id: 'naranja', name: 'Naranja', group: 'Básicos', img: 'naranja', ink: 'light' },
  { id: 'web-montana', name: 'Montaña de la web', group: 'Lista de espera y fundadores', img: 'web-montana', ink: 'light' },
  { id: 'web-montana-sombra', name: 'Montaña en sombra', group: 'Lista de espera y fundadores', img: 'web-montana-sombra', ink: 'light' },
  { id: 'web-cielo', name: 'Cielo de la web', group: 'Lista de espera y fundadores', img: 'web-cielo', ink: 'light' },
  { id: 'fundador-noche', name: 'Noche dorada', group: 'Lista de espera y fundadores', img: 'fundador-noche', ink: 'light' },
  { id: 'fundador-oro', name: 'Oro fundador', group: 'Lista de espera y fundadores', img: 'fundador-oro', ink: 'dark' },
  { id: 'pro', name: 'Verde Pro', group: 'Kumbra Pro', img: 'pro', ink: 'light' },
  { id: 'app-coral', name: 'App · Coral', group: 'Fondo de la app', css: '#F3EEE6', ink: 'dark' },
  { id: 'app-frambuesa', name: 'App · Frambuesa', group: 'Fondo de la app', css: '#F8EFF1', ink: 'dark' },
  { id: 'app-bosque', name: 'App · Bosque', group: 'Fondo de la app', css: '#F0F2EC', ink: 'dark' },
  { id: 'app-oceano', name: 'App · Océano', group: 'Fondo de la app', css: '#EEF2F7', ink: 'dark' },
  { id: 'app-violeta', name: 'App · Violeta', group: 'Fondo de la app', css: '#F3F0FA', ink: 'dark' },
  { id: 'app-oscuro', name: 'App · Oscuro', group: 'Fondo de la app', css: '#18181A', ink: 'light' },
  { id: 'app-naranja', name: 'Naranja de cabeceras', group: 'Fondo de la app', css: 'linear-gradient(135deg,#E8622D,#B8391C 50%,#6B1F3A)', ink: 'light' },
  ...['1-sunset', '2-rosa', '3-mar', '4-musgo', '5-arena', '6-lila', '7-pizarra'].map(v => ({ id: 'grano-' + v, name: 'Grano ' + v.slice(2), group: 'Grano', img: 'grano-' + v, ink: 'light' })),
  ...['1-sunset', '2-rosa', '3-mar', '4-musgo', '5-arena', '6-lila', '7-pizarra'].map(v => ({ id: 'cordillera-' + v, name: 'Cordillera ' + v.slice(2), group: 'Cordillera', img: 'cordillera-' + v, ink: 'light' })),
  ...['1-papel', '2-menta', '3-cielo', '4-rubor', '5-noche'].map(v => ({ id: 'topo-' + v, name: 'Topo ' + v.slice(2), group: 'Topo', img: 'topo-' + v, ink: v === '5-noche' ? 'light' : 'dark' })),
];
{ const GO = ['Básicos', 'Fondo de la app', 'Grano', 'Cordillera', 'Topo', 'Lista de espera y fundadores', 'Kumbra Pro'];
  const o = GO.flatMap(g => BGS.filter(b => b.group === g)).concat(BGS.filter(b => !GO.includes(b.group))); BGS.length = 0; o.forEach(b => BGS.push(b)); }
const bgById = id => BGS.find(b => b.id === id) || (id && id.startsWith('up:') ? { id, name: 'Foto', img: null, upload: id.slice(3), ink: 'light' } : BGS[0]);

// ---------- Estilos de texto ----------
// Cada estilo es una clase de los posts. *palabra* = destacada con el degradado.
const TEXT_STYLES = {
  kicker:  { name: 'Etiqueta',  cls: 'k',   w: 904, sample: 'Antes del lanzamiento' },
  h:       { name: 'Titular',   cls: 'h',   w: 904, sample: 'Cada pegue *cuenta.*', sizes: { S: 76, M: 92, L: 112, XL: 132 } },
  sub:     { name: 'Texto',     cls: 'sub', w: 872, sample: 'Tu diario de escalada, con tus amigos dentro.' },
  btn:     { name: 'Botón',     cls: 'btn', w: 0,   sample: 'Reserva tu @ ›' },
  tag:     { name: 'Píldora',   cls: 'tag g', w: 0, sample: 'Kumbra Pro' },
  num:     { name: 'Número',    cls: 'num', w: 904, sample: '*247*' },
  small:   { name: 'Nota',      cls: 'small', w: 904, sample: 'axclimb.com/kumbra · enlace en la bio' },
  swipe:   { name: 'Desliza',   cls: 'swipe', w: 0, sample: 'Desliza ›' },
  lista:   { name: 'Lista con checks', cls: 'lista', w: 904, sample: 'Apunta cada bloque en dos toques\nMira tu sesión hecha cordillera\n*Reta a tus amigos cada mes*' },
  cita:    { name: 'Cita',      cls: 'cita', w: 904, sample: '«Por fin sé qué escalé el martes»' },
  fecha:   { name: 'Fecha de lanzamiento', cls: 'fecha', w: 0, sample: '16 · 11 · 2026' },
};

// ---------- Elementos ----------
// render(p, ink) devuelve HTML anclado arriba a la izquierda. w = ancho natural.
// ---------- Elementos ----------
// Solo cosas reales de la app: capturas de iPhone, recortes sacados de ellas y réplicas editables hechas a partir de ellas.
// render(p, ink) devuelve HTML anclado arriba a la izquierda. w = ancho con el que entra.
const SCR = {"Inicio": "inicio", "Inicio · rocódromos": "inicio-rocos", "Actividad de amigos": "feed", "Explorar": "explorar", "Chat": "chat", "Mensajes": "mensajes", "Rocódromo": "rocodromo", "Nueva sesión": "nueva", "Explorar · destacadas": "destacadas", "Apuntar bloques": "grados", "Todos los grados": "grados-todos", "Sesión en curso": "en-curso", "¡Buena sesión!": "buena", "¿Cómo te has sentido?": "sentido", "Sesión guardada": "guardada", "Perfil · actividad": "perfil-actividad", "Perfil · racha y sesiones": "perfil-racha", "Perfil": "perfil", "Logros y objetivos": "logros", "Proyectos y tu año": "proyectos", "Estadísticas Pro": "stats", "Compite": "compite", "Volumen Pro": "volumen", "Propuesta de cambio": "propuesta"};
const SCR_DARK = {}; // se llenará cuando haya capturas en modo oscuro
const REC = {"Tu semana (Inicio)": ["semana-inicio", 1085, 655], "Primeros pasos": ["primeros-pasos", 1085, 722], "Tarjeta de rocódromo": ["roco-card", 1085, 430], "Sesión en el feed": ["feed-card", 1085, 1896], "Sesión enviada por chat": ["chat-card", 783, 969], "Cabecera de rocódromo": ["roco-header", 1085, 611], "Botón «Registrar sesión aquí»": ["registrar", 1085, 164], "Botón «Empezar sesión»": ["empezar", 1085, 434], "Opciones de nueva sesión": ["opciones-sesion", 1085, 662], "Sesión destacada": ["destacada", 689, 275], "Rejilla de grados": ["grados", 1085, 583], "Flash · Top · Proyecto": ["se-apunta", 1085, 151], "Cordillera en directo": ["sesion-curso", 1085, 874], "Botón «Terminar sesión»": ["terminar", 1085, 162], "¡Buena sesión! (resumen)": ["buena-card", 1085, 725], "¿Cómo te has sentido?": ["sentido", 1085, 257], "Tarjeta para compartir": ["compartir", 503, 895], "Calendario de actividad": ["calendario", 1085, 848], "Bloques por mes": ["barras", 1085, 478], "Racha": ["racha", 1085, 544], "Mis sesiones": ["mis-sesiones", 1085, 852], "Cabecera del perfil": ["perfil-header", 1085, 730], "Tu semana y nivel": ["semana-nivel", 1085, 724], "Logros": ["logros", 1085, 255], "Ratio flash": ["ratio-flash", 1127, 302], "Tus objetivos": ["objetivos", 1085, 537], "Tus proyectos": ["proyectos", 1085, 1136], "Tu 2026 en Kumbra": ["tu-ano", 1085, 712], "Este mes (Pro)": ["este-mes", 1085, 349], "Ranking mensual": ["podio", 1085, 799], "Reto entre amigos": ["reto", 1085, 435], "Volumen 6 meses (Pro)": ["volumen", 1085, 800], "Propuesta de cambio": ["propuesta", 1085, 897], "Barra de pestañas": ["tabbar", 1109, 168]};
const STATUS = (W, dark) => { const k = W / 920, c = dark ? '#fff' : '#111';
  return `<div style="position:absolute;left:0;right:0;top:0;height:${118 * k}px;display:flex;align-items:center;justify-content:space-between;padding:${8 * k}px ${92 * k}px 0 ${98 * k}px;box-sizing:border-box;font:600 ${33 * k}px/1 I,sans-serif;color:${c};letter-spacing:-.01em">9:41<svg width="${180 * k}" height="${30 * k}" viewBox="0 0 180 30"><g fill="${c}"><rect x="0" y="19" width="7" height="9" rx="2"/><rect x="11" y="14" width="7" height="14" rx="2"/><rect x="22" y="8" width="7" height="20" rx="2"/><rect x="33" y="2" width="7" height="26" rx="2"/><path d="M68 9a20 20 0 0 1 28 0l-3.4 3.6a15 15 0 0 0-21.2 0zM73.5 15a12 12 0 0 1 17 0L87 18.6a7 7 0 0 0-10 0zM82 27l-4.3-4.6a6 6 0 0 1 8.6 0z"/><rect x="118" y="3" width="52" height="24" rx="7" fill="none" stroke="${c}" stroke-width="2.4" opacity=".45"/><rect x="122" y="7" width="44" height="16" rx="4"/><rect x="173" y="11" width="4" height="8" rx="2" opacity=".45"/></g></svg></div>`; };
function captura(p) {
  const W = +p.ancho || 560, H = W * 2622 / 1206, id = SCR[p.pantalla] || 'inicio', dark = p.modo === 'Oscuro' && SCR_DARK[id];
  const src = `scr/${dark ? 'oscuro' : 'claro'}/${id}.jpg`;
  const screen = `<div style="position:relative;width:${W}px;height:${H}px;overflow:hidden;border-radius:${p.marco ? W * .13 : W * .06}px;background:#F8EFF1"><img src="${src}" style="display:block;width:${W}px;height:${H}px;max-width:none" alt="">${STATUS(W, dark)}${p.marco ? `<div style="position:absolute;left:50%;top:${W * .03}px;width:${W * .3}px;height:${W * .09}px;margin-left:${-W * .15}px;border-radius:${W * .05}px;background:#000"></div>` : ''}</div>`;
  if (!p.marco) return `<div style="display:inline-block;box-shadow:0 40px 90px -40px rgba(40,10,30,.55);border-radius:${W * .06}px">${screen}</div>`;
  const b = W * .038;
  return `<div style="display:inline-block;padding:${b}px;border-radius:${W * .13 + b}px;background:linear-gradient(145deg,#3a3a3e,#0d0d0f 40%,#1e1e21);box-shadow:inset 0 0 0 ${W * .006}px #57575c,0 50px 110px -40px rgba(30,5,25,.65)">${screen}</div>`;
}
const logoSrc = (version, color, ink) => {
  const auto = color === 'Automático según el fondo', white = auto ? ink !== 'dark' : /blanco/.test(color), mono = /^Todo/.test(color);
  if (version === 'Icono de la app') return 'logo/kumbra-icono-app.svg';
  if (version === 'Foto de perfil de Instagram') return 'logo/kumbra-foto-perfil-instagram.png';
  if (version === 'Montaña') return mono ? `logo/kumbra-logo-monocolor-${white ? 'blanco' : 'negro'}.svg` : 'logo/kumbra-logo.svg';
  if (version === 'Montaña + Kumbra debajo') return `logo/kumbra-logo-nombre-${white ? 'blanco' : 'negro'}.svg`;
  return `logo/kumbra-logo-horizontal-${mono ? 'monocolor-' : ''}${white ? 'blanco' : 'negro'}.svg`;
};
const ELEMENTS = [
  { id: 'captura', group: 'Capturas de la app', name: 'Captura de pantalla', w: 560,
    props: {
      pantalla: { label: 'Pantalla', options: Object.keys(SCR), def: 'Perfil' },
      modo: { label: 'Modo', options: [['Claro', 'Claro'], ['Oscuro', 'Oscuro (faltan las capturas)', true]], def: 'Claro' },
      marco: { label: 'Con marco de móvil', bool: true, def: true },
      ancho: { label: 'Ancho', range: [240, 1000], def: 560 },
    },
    render: p => captura(p) },
  { id: 'recorte', group: 'Capturas de la app', name: 'Recorte real', w: 828,
    props: { pieza: { label: 'Pieza', options: Object.keys(REC), def: 'Sesión en el feed' }, sombra: { label: 'Sombra suave', bool: true, def: true } },
    render: p => { const [id, w, h] = REC[p.pieza] || Object.values(REC)[0]; const W = 828 * w / 1086; return `<img src="rec/${id}.png" style="display:block;width:${Math.round(W)}px;height:auto;max-width:none;${p.sombra ? 'filter:drop-shadow(0 24px 34px rgba(90,40,60,.22))' : ''}" alt="">`; } },
  ...REPLICAS.map(r => ({ ...r, group: 'Editables (réplicas de la app)' })),
  { id: 'logoOf', group: 'Marca', name: 'Logo', w: 0,
    props: {
      version: { label: 'Versión', options: ['Montaña', 'Montaña + Kumbra al lado', 'Montaña + Kumbra debajo', 'Icono de la app', 'Foto de perfil de Instagram'], def: 'Montaña + Kumbra al lado' },
      color: { label: 'Color', options: ['Automático según el fondo', 'A color · texto blanco', 'A color · texto negro', 'Todo blanco', 'Todo negro'], def: 'Automático según el fondo' },
      alto: { label: 'Tamaño', range: [30, 700], def: 120 },
    },
    render: (p, ink) => `<img src="${logoSrc(p.version, p.color, ink)}" style="display:block;height:${+p.alto}px;width:auto;max-width:none" alt="Kumbra">` },
  { id: 'disponible', group: 'Marca', name: 'Disponible en iOS y Android', w: 0,
    props: { texto: { label: 'Texto', text: true, def: 'Disponible en iOS y Android' }, estilo: { label: 'Estilo', options: ['Degradado', 'Blanco', 'Oscuro', 'Contorno'], def: 'Degradado' } },
    render: (p, ink) => { const st = { 'Degradado': 'background:linear-gradient(95deg,#F2B44A,#E5484D 50%,#A7377B);color:#fff', 'Blanco': 'background:#fff;color:#1A1A1A', 'Oscuro': 'background:#1A1A1A;color:#fff', 'Contorno': `background:transparent;color:${ink === 'dark' ? '#1A1A1A' : '#fff'};box-shadow:inset 0 0 0 4px currentColor` }[p.estilo];
      return `<span style="display:inline-flex;align-items:center;gap:18px;padding:22px 38px;border-radius:999px;font:800 38px ID,sans-serif;letter-spacing:-.01em;white-space:nowrap;${st}"><svg width="30" height="40" viewBox="0 0 30 40" fill="currentColor"><rect x="3" y="1" width="24" height="38" rx="6" fill="none" stroke="currentColor" stroke-width="3.4"/><rect x="11" y="32" width="8" height="3" rx="1.5"/></svg>${ex(p.texto)}</span>`; } },
  { id: 'cuenta', group: 'Marca', name: 'Cuenta atrás', w: 0,
    props: { numero: { label: 'Número', text: true, def: '7' }, arriba: { label: 'Texto de arriba', text: true, def: 'Faltan' }, abajo: { label: 'Texto de abajo', text: true, def: 'días' }, fecha: { label: 'Fecha', text: true, def: '16 · 11 · 2026' }, tam: { label: 'Tamaño del número', range: [120, 700], def: 380 } },
    render: (p, ink) => { const c = ink === 'dark' ? '#1A1A1A' : '#F5EFE6', g = ink === 'dark' ? 'linear-gradient(95deg,#F08A3C,#E5484D 40%,#A7377B 72%,#533794)' : 'linear-gradient(95deg,#F7CE89,#EE888B 45%,#DF7DB8 72%,#B495F9)';
      return `<div style="display:inline-flex;flex-direction:column;align-items:center;gap:10px;color:${c};text-align:center"><div style="font:800 34px ID,sans-serif;letter-spacing:.24em;text-transform:uppercase;color:${ink === 'dark' ? '#A7377B' : '#F2B44A'}">${ex(p.arriba)}</div><div style="font:900 ${+p.tam}px/.86 ID,sans-serif;letter-spacing:-.06em;background:${g};-webkit-background-clip:text;background-clip:text;color:transparent;padding:0 .04em">${ex(p.numero)}</div><div style="font:800 40px ID,sans-serif;letter-spacing:.2em;text-transform:uppercase;opacity:.8">${ex(p.abajo)}</div>${p.fecha ? `<div style="margin-top:18px;font:700 34px I,sans-serif;letter-spacing:.14em;opacity:.7">${ex(p.fecha)}</div>` : ''}</div>`; } },
  { id: 'comparativa', group: 'Marca', name: 'Gratis vs Pro', w: 904,
    props: { filas: { label: 'Filas (texto | gratis | pro), con ✓ o ✗', area: true, def: 'Apuntar sesiones y bloques | ✓ | ✓\nTu cordillera y tu perfil | ✓ | ✓\nRanking y retos con amigos | ✓ | ✓\nEstadísticas avanzadas | ✗ | ✓\nVolumen y progresión de nivel | ✗ | ✓' }, gratis: { label: 'Columna 1', text: true, def: 'Gratis' }, pro: { label: 'Columna 2', text: true, def: 'Pro' } },
    render: (p, ink) => { const dark = ink !== 'dark', c = dark ? '#F5EFE6' : '#1A1A1A', line = dark ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.1)';
      const mark = v => /✓|si|sí|x?yes/i.test(v) ? `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#34C759" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>` : /✗|x|no/i.test(v) ? `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="${dark ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.3)'}" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>` : `<span style="font:700 30px I">${ex(v)}</span>`;
      const rows = String(p.filas).split('\n').filter(Boolean).map(r => r.split('|').map(x => x.trim()));
      return `<div style="width:904px;color:${c};font-family:I,sans-serif"><div style="display:grid;grid-template-columns:1fr 150px 150px;align-items:center;padding:0 0 22px;border-bottom:2px solid ${line}"><span></span><span style="text-align:center;font:800 32px ID;opacity:.7">${ex(p.gratis)}</span><span style="text-align:center"><span style="display:inline-block;padding:8px 22px;border-radius:999px;background:#14A085;color:#fff;font:800 28px ID;letter-spacing:.1em;text-transform:uppercase">${ex(p.pro)}</span></span></div>${rows.map(r => `<div style="display:grid;grid-template-columns:1fr 150px 150px;align-items:center;padding:26px 0;border-bottom:2px solid ${line}"><span style="font:600 36px/1.25 I">${ex(r[0])}</span><span style="display:grid;place-items:center">${mark(r[1] || '')}</span><span style="display:grid;place-items:center">${mark(r[2] || '')}</span></div>`).join('')}</div>`; } },
  { id: 'avatar', group: 'Marca', name: 'Avatar con anillo', w: 0,
    props: { avatar: { label: 'Avatar', options: Object.keys(AVATARS), def: 'Kumbri' }, iniciales: { label: 'Iniciales (en los avatares que las llevan)', text: true, def: 'AR' }, nombre: { label: 'Nombre debajo', text: true, def: '' }, anillo: { label: 'Anillo verde', bool: true, def: true }, tam: { label: 'Tamaño', range: [80, 600], def: 220 } },
    render: (p, ink) => `<div style="display:inline-flex;flex-direction:column;align-items:center;gap:14px">${ringAv(p.avatar, +p.tam, .7, p.anillo, p.iniciales)}${p.nombre ? `<span style="font:700 ${Math.max(26, p.tam * .15)}px I,sans-serif;color:${ink === 'dark' ? '#1A1A1A' : '#F5EFE6'}">${ex(p.nombre)}</span>` : ''}</div>` },
  { id: 'forma', group: 'Marca', name: 'Forma o línea', w: 0,
    props: { tipo: { label: 'Tipo', options: ['Rectángulo redondeado', 'Círculo', 'Línea', 'Flecha', 'Desenfoque de color'], def: 'Rectángulo redondeado' }, color: { label: 'Color', color: true, def: '#E8622D' }, ancho: { label: 'Ancho', range: [10, 1300], def: 500 }, alto: { label: 'Alto', range: [4, 1300], def: 300 }, opacidad: { label: 'Opacidad (%)', range: [5, 100], def: 100 } },
    render: p => { const w = +p.ancho, h = +p.alto, o = p.opacidad / 100, c = p.color;
      if (p.tipo === 'Círculo') return `<div style="width:${w}px;height:${w}px;border-radius:50%;background:${c};opacity:${o}"></div>`;
      if (p.tipo === 'Línea') return `<div style="width:${w}px;height:${Math.max(2, Math.min(h, 16))}px;border-radius:9px;background:${c};opacity:${o}"></div>`;
      if (p.tipo === 'Flecha') return `<svg width="${w}" height="${Math.max(h, 40)}" viewBox="0 0 ${w} ${Math.max(h, 40)}" style="opacity:${o};overflow:visible"><path d="M6 ${Math.max(h, 40) / 2} H${w - 10} M${w - 46} ${Math.max(h, 40) / 2 - 34} L${w - 8} ${Math.max(h, 40) / 2} L${w - 46} ${Math.max(h, 40) / 2 + 34}" fill="none" stroke="${c}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      if (p.tipo === 'Desenfoque de color') return `<div style="width:${w}px;height:${h}px;border-radius:50%;background:${c};opacity:${o};filter:blur(${Math.min(w, h) * .18}px)"></div>`;
      return `<div style="width:${w}px;height:${h}px;border-radius:${Math.min(w, h) * .14}px;background:${c};opacity:${o}"></div>`; } },
];
// Orden y grupos del panel de Elementos (lo que más se usa, arriba).
const EL_GROUPS = [
  ['Móvil y capturas', ['rp-movil', 'captura', 'recorte']],
  ['Sesiones y cordilleras', ['rp-feed', 'rp-buena', 'rp-cordillera', 'rp-colores', 'rp-grados', 'rp-proyectos']],
  ['Perfil y progreso', ['rp-perfil', 'rp-semana', 'rp-nivel', 'rp-racha', 'rp-ano']],
  ['Amigos, ranking y rocódromos', ['rp-podio', 'rp-reto', 'rp-chat', 'avatar', 'rp-roco']],
  ['Insignias y lanzamiento', ['rp-insignia', 'disponible', 'cuenta', 'comparativa']],
  ['Marca y formas', ['logoOf', 'forma']],
];
{ const order = [];
  EL_GROUPS.forEach(([g, ids]) => ids.forEach(id => { const e = ELEMENTS.find(x => x.id === id); if (e) { e.group = g; order.push(e); } }));
  ELEMENTS.forEach(e => { if (!order.includes(e)) order.push(e); });
  ELEMENTS.length = 0; order.forEach(e => ELEMENTS.push(e)); }
const elById = id => ELEMENTS.find(e => e.id === id);

// ---------- Bases ----------
// Cada base crea las capas de una lámina. y en post; en story se baja 285 px (zona segura).
const T = (style, text, x, y, extra = {}) => ({ t: 'text', style, text, x, y, w: TEXT_STYLES[style].w || undefined, ...extra });
const E = (el, x, y, extra = {}) => ({ t: 'el', el, x, y, s: 1, r: 0, p: {}, ...extra });
const BASES_RAW = [
  { id: 'texto', group: 'Básicas', name: 'Sin móvil', desc: 'Etiqueta, titular grande y texto. Montañas de colores abajo.', bg: 'negro',
    layers: () => [T('kicker', 'Qué es Kumbra', 88, 230), T('h', 'Tu diario de escalada, *con tus amigos dentro.*', 88, 290, { size: 'L' }), T('sub', 'Apunta cada bloque en dos toques y mira tu sesión convertida en cordillera.', 88, 780), E('rp-colores', -20, 900, { p: { ancho: 1120, alto: 450 } })] },
  { id: 'movil', group: 'Con la app', name: 'Con móvil', desc: 'Titular arriba y una captura real dentro de un móvil.', bg: 'negro',
    layers: () => [T('kicker', 'Así se usa', 88, 230), T('h', 'Dos toques *por bloque.*', 88, 290, { size: 'M' }), E('captura', 270, 540, { r: -4, p: { pantalla: 'Apuntar bloques', ancho: 540 } })] },
  { id: 'movil-editable', group: 'Con la app', name: 'Móvil editable', desc: 'Un móvil con una pantalla de la app que puedes cambiar entera.', bg: 'noche-violeta',
    layers: () => [T('kicker', 'Tu perfil', 88, 230), T('h', 'Tu escalada, *en un vistazo.*', 88, 290, { size: 'M' }), E('rp-movil', 270, 540, { r: -4, p: { ancho: 540 } })] },
  { id: 'captura', group: 'Con la app', name: 'Con captura sin marco', desc: 'Titular y una captura real suelta.', bg: 'rosa',
    layers: () => [T('kicker', 'Tu perfil', 88, 230), T('h', 'Todo lo que *escalas*, en un sitio.', 88, 290, { size: 'M' }), E('captura', 250, 600, { p: { pantalla: 'Perfil', marco: false, ancho: 580 } })] },
  { id: 'sesion', group: 'Con la app', name: 'Sesión de un amigo', desc: 'Titular y la tarjeta del feed, editable.', bg: 'crema',
    layers: () => [T('kicker', 'Tus amigos', 88, 200), T('h', 'Mira qué ha *escalado hoy.*', 88, 260, { size: 'M' }), E('rp-feed', 126, 520, { s: .85, p: { pie: false } })] },
  { id: 'ranking', group: 'Con la app', name: 'Ranking', desc: 'Titular y el podio mensual, editable.', bg: 'noche-violeta',
    layers: () => [T('kicker', 'Compite', 88, 220), T('h', 'Pica a tu gente *cada mes.*', 88, 280, { size: 'M' }), E('rp-podio', 126, 560)] },
  { id: 'espera', group: 'Lanzamiento', name: 'Lista de espera', desc: 'Para pedir que reserven su @.', bg: 'web-montana-sombra',
    layers: () => [E('rp-insignia', 88, 220, { p: { tipo: 'Fundador con texto', tam: 140 } }), T('h', 'Reserva tu *@* antes que nadie.', 88, 330, { size: 'L' }), T('sub', 'Los primeros se quedan con su nombre y entran con el Pack Fundador.', 88, 730), T('btn', 'Reserva tu @ ›', 88, 1000), T('small', 'axclimb.com/kumbra · enlace en la bio', 92, 1170)] },
  { id: 'fundador', group: 'Lanzamiento', name: 'Pack Fundador', desc: 'Insignia, titular y la cabecera de perfil con la insignia.', bg: 'fundador-noche',
    layers: () => [E('rp-insignia', 88, 200, { p: { tipo: 'Fundador con texto', tam: 140 } }), T('h', 'Los primeros *no se olvidan.*', 88, 310, { size: 'M' }), E('rp-perfil', 126, 640, { p: { pro: false } })] },
  { id: 'pro', group: 'Kumbra Pro', name: 'Kumbra Pro', desc: 'Píldora Pro, titular y una gráfica real de Pro.', bg: 'pro',
    layers: () => [T('tag', 'Kumbra Pro', 88, 220), T('h', 'Gratis llevas tu diario. *Con Pro lo entiendes.*', 88, 310, { size: 'M' }), E('recorte', 126, 640, { p: { pieza: 'Volumen 6 meses (Pro)' } })] },
  { id: 'portada', group: 'Carrusel', name: 'Portada de carrusel', desc: 'Un titular enorme y «Desliza».', bg: 'grano-1-sunset',
    layers: () => [T('kicker', 'Carrusel', 88, 330), T('h', 'Cosas que pasan *en todos los rocos.*', 88, 390, { size: 'XL' }), T('swipe', 'Desliza ›', 760, 1220)] },
  { id: 'cierre', group: 'Carrusel', name: 'Cierre', desc: 'Logo, frase y botón para la última lámina.', bg: 'noche-violeta',
    layers: () => [E('logoOf', 420, 300, { p: { version: 'Montaña', alto: 200 } }), T('h', 'Cada pegue *cuenta.*', 88, 560, { size: 'L', align: 'center' }), T('btn', 'Reserva tu @ ›', 300, 900), T('small', 'axclimb.com/kumbra · enlace en la bio', 88, 1050, { align: 'center' })] },
  { id: 'cuenta', group: 'Lanzamiento', name: 'Cuenta atrás', desc: 'Faltan X días, con la montaña de la web.', bg: 'web-cielo',
    layers: () => [E('cuenta', 250, 260, { p: { tam: 420 } }), E('logoOf', 340, 1150, { p: { alto: 90 } })] },
  { id: 'gratispro', group: 'Kumbra Pro', name: 'Gratis vs Pro', desc: 'Tabla de lo que trae cada plan.', bg: 'negro',
    layers: () => [T('tag', 'Kumbra Pro', 88, 200), T('h', '¿Qué cambia *con Pro?*', 88, 290, { size: 'M' }), E('comparativa', 88, 560)] },
  { id: 'lanzamiento', group: 'Lanzamiento', name: 'Ya está aquí', desc: 'Logo grande, fecha y disponible en iOS y Android.', bg: 'web-montana',
    layers: () => [E('logoOf', 250, 230, { p: { version: 'Montaña + Kumbra debajo', alto: 480 } }), T('fecha', '16 · 11 · 2026', 360, 790), E('disponible', 210, 1000)] },
  { id: 'vacia', group: 'Básicas', name: 'En blanco', desc: 'Solo el fondo y el logo.', bg: 'negro', layers: () => [] },
];
const BASE_GROUPS = ['Básicas', 'Con la app', 'Carrusel', 'Lanzamiento', 'Kumbra Pro'];
const BASES = BASE_GROUPS.flatMap(g => BASES_RAW.filter(b => b.group === g)).concat(BASES_RAW.filter(b => !BASE_GROUPS.includes(b.group)));

