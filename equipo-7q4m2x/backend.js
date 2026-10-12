// Kumbra Studio en la web: sustituye el guardado del artefacto por Supabase (proyecto propio del Studio).
// Ofrece lo mismo que usa app.js: window.claude.use('db' | 'user' | 'assets' | 'downloads').
(() => {
  'use strict';
  const C = window.STUDIO_CONFIG || {};
  const sb = window.supabase.createClient(C.url, C.key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  window.__sb = sb;

  // ---------- inicio de sesión ----------
  const gate = document.getElementById('gate');
  const ready = new Promise(resolve => {
    const show = (html) => { gate.innerHTML = html; gate.hidden = false; };
    const head = `<img src="logo/kumbra-logo.svg" alt="" width="64" height="52"><div class="gk">Kumbra · Equipo</div>`;
    const form = (msg = '') => {
      show(`<div class="gbox">${head}<h1>Kumbra Studio</h1><p>Zona solo para el equipo de Kumbra. Escribe tu email y te mandamos un código para entrar.</p>
        <form id="gform"><label for="gmail">Email</label><input id="gmail" type="email" required placeholder="tu@email.com" autocomplete="email"><button class="pri" type="submit">Enviarme el código</button></form><p class="gmsg" role="status">${msg}</p></div>`);
      document.getElementById('gform').onsubmit = async e => {
        e.preventDefault();
        const email = document.getElementById('gmail').value.trim().toLowerCase(), msgEl = document.querySelector('#gate .gmsg');
        const btn = e.target.querySelector('button'); btn.disabled = true; msgEl.textContent = 'Comprobando…';
        const { data: ok } = await sb.rpc('studio_email_allowed', { email });
        if (!ok) { btn.disabled = false; msgEl.textContent = 'Ese email no está en la lista del equipo.'; return; }
        const { error } = await sb.auth.signInWithOtp({ email, options: { shouldCreateUser: true, emailRedirectTo: location.origin + location.pathname } });
        btn.disabled = false;
        if (error) { msgEl.textContent = /rate|seconds|security purposes/i.test(error.message) ? 'Se han pedido demasiados códigos. Espera un minuto y vuelve a probar.' : 'No se pudo enviar el código: ' + error.message; return; }
        codeForm(email);
      };
    };
    const codeForm = (email, msg = '') => {
      show(`<div class="gbox">${head}<h1>Mira tu correo</h1><p>Te hemos mandado un email a <b>${email.replace(/[<>&]/g, '')}</b>. Si trae un código, escríbelo aquí; si trae un enlace, ábrelo en este mismo navegador. Puede tardar un minuto; mira también en spam.</p>
        <form id="gcode"><label for="gtok">Código</label><input id="gtok" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6,10}" maxlength="10" required placeholder="123456"><button class="pri" type="submit">Entrar</button></form>
        <p class="gmsg" role="status">${msg}</p><button class="ghost sm" id="gback">Usar otro email</button></div>`);
      document.getElementById('gtok').focus();
      document.getElementById('gback').onclick = () => form();
      document.getElementById('gcode').onsubmit = async e => {
        e.preventDefault();
        const token = document.getElementById('gtok').value.trim(), btn = e.target.querySelector('button'); btn.disabled = true;
        const { data, error } = await sb.auth.verifyOtp({ email, token, type: 'email' });
        btn.disabled = false;
        if (error) { document.querySelector('#gate .gmsg').textContent = 'El código no es correcto o ha caducado. Revísalo o pide otro.'; return; }
        check(data.session);
      };
    };
    const check = async (session) => {
      if (!session) { form(); return; }
      const { data, error } = await sb.rpc('studio_is_member');
      if (error || !data) {
        show(`<div class="gbox"><img src="logo/kumbra-logo.svg" alt="" width="64" height="52"><div class="gk">Kumbra · Equipo</div><h1>Sin acceso</h1><p>${(session.user.email || '').replace(/[<>&]/g, '')} no está en la lista del equipo. Pide a Alicia que te añada.</p><button class="ghost" id="gout">Usar otro email</button></div>`);
        document.getElementById('gout').onclick = async () => { await sb.auth.signOut(); form(); };
        return;
      }
      gate.hidden = true; resolve(session);
    };
    sb.auth.getSession().then(({ data }) => check(data.session));
    sb.auth.onAuthStateChange((ev, s2) => { if (ev === 'SIGNED_OUT') location.reload(); if (ev === 'SIGNED_IN' && s2) check(s2); });
  });
  window.studioSignOut = () => sb.auth.signOut();

  // ---------- db: documentos en la tabla studio_docs ----------
  const collOf = path => path.split('/').slice(0, -1).join('/');
  const snapDoc = (path, row) => ({ id: path.split('/').pop(), exists: !!row, data: () => (row ? JSON.parse(JSON.stringify(row.data)) : undefined) });
  const err = e => Object.assign(new Error([e?.message, e?.details, e?.hint, e?.code].filter(Boolean).join(' · ') || 'error'), { code: e?.code === '42501' ? 'permission_denied' : 'unavailable' });

  // Un único canal en directo; cada suscripción filtra lo suyo.
  const listeners = new Set();
  let channel = null;
  function live() {
    if (channel) return;
    channel = sb.channel('studio-docs').on('postgres_changes', { event: '*', schema: 'public', table: 'studio_docs' }, p => listeners.forEach(fn => fn(p))).subscribe();
  }

  function docRef(path) {
    return {
      id: path.split('/').pop(), path,
      async get() { const { data, error } = await sb.from('studio_docs').select('path,data').eq('path', path).maybeSingle(); if (error) throw err(error); return snapDoc(path, data); },
      async set(value) { const { error } = await sb.from('studio_docs').upsert({ path, coll: collOf(path), data: value, updated_at: new Date().toISOString() }); if (error) throw err(error); },
      async update(patch) {
        const { data: cur, error: e1 } = await sb.from('studio_docs').select('data').eq('path', path).maybeSingle(); if (e1) throw err(e1);
        const { error } = await sb.from('studio_docs').upsert({ path, coll: collOf(path), data: { ...(cur?.data || {}), ...patch }, updated_at: new Date().toISOString() }); if (error) throw err(error);
      },
      async delete() { const { error } = await sb.from('studio_docs').delete().eq('path', path); if (error) throw err(error); },
      onSnapshot(next, onErr) {
        let alive = true;
        const fn = p => { const row = p.new && p.new.path === path ? p.new : null; if ((p.old && p.old.path === path) || row) next(snapDoc(path, p.eventType === 'DELETE' ? null : row)); };
        this.get().then(s => alive && next(s)).catch(e => onErr && onErr(e));
        listeners.add(fn); live();
        return () => { alive = false; listeners.delete(fn); };
      },
    };
  }

  function query(coll, opts = {}) {
    const q = {
      orderBy(field, dir = 'asc') { return query(coll, { ...opts, order: [field, dir] }); },
      limit(n) { return query(coll, { ...opts, limit: n }); },
      doc(id) { return docRef(coll + '/' + id); },
      async get() { return { docs: await load() } },
      onSnapshot(next, onErr) {
        let alive = true, rows = new Map();
        const emit = () => {
          let list = [...rows.values()];
          if (opts.order) { const [f, d] = opts.order; list.sort((a, b) => ((a.data?.[f] ?? 0) > (b.data?.[f] ?? 0) ? 1 : -1) * (d === 'desc' ? -1 : 1)); }
          if (opts.limit) list = list.slice(0, opts.limit);
          next({ docs: list.map(r => snapDoc(r.path, r)) });
        };
        load(true).then(list => { if (!alive) return; list.forEach(r => rows.set(r.path, r)); emit(); }).catch(e => onErr && onErr(e));
        const fn = p => {
          const row = p.new && p.new.coll === coll ? p.new : null, old = p.old && (p.old.coll === coll || rows.has(p.old.path)) ? p.old : null;
          if (p.eventType === 'DELETE' && old) { rows.delete(old.path); emit(); }
          else if (row) { rows.set(row.path, row); emit(); }
        };
        listeners.add(fn); live();
        return () => { alive = false; listeners.delete(fn); };
      },
    };
    async function load(raw) {
      let r = sb.from('studio_docs').select('path,coll,data').eq('coll', coll);
      if (opts.order) r = r.order('data->>' + opts.order[0], { ascending: opts.order[1] !== 'desc' });
      if (opts.limit) r = r.limit(opts.limit);
      const { data, error } = await r; if (error) throw err(error);
      return raw ? data : data.map(x => snapDoc(x.path, x));
    }
    return q;
  }

  const db = { collection: c => query(c), doc: p => docRef(p) };

  // ---------- user ----------
  let session = null;
  const user = {
    async id() { return session?.user?.id || null; },
    async me() { return { id: session?.user?.id || null, email: session?.user?.email || null, name: '' }; },
    async profiles(ids) {
      const clean = [...new Set(ids.filter(x => /^[0-9a-f-]{36}$/i.test(x)))];
      if (!clean.length) return {};
      const { data } = await sb.rpc('studio_profiles', { ids: clean });
      return Object.fromEntries((data || []).map(p => [p.id, { id: p.id, name: p.name || '', guest: false }]));
    },
    isOwner: () => false, canEdit: () => true, can: () => true,
  };

  // ---------- assets: carpeta «studio» de Storage ----------
  const assets = {
    async upload(blob) {
      const ext = (blob.type || '').includes('png') ? 'png' : (blob.type || '').includes('webp') ? 'webp' : 'jpg';
      const name = `${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID()}.${ext}`;
      const { error } = await sb.storage.from('studio').upload(name, blob, { contentType: blob.type || 'image/jpeg', cacheControl: '31536000', upsert: false });
      if (error) throw err(error);
      const { data } = sb.storage.from('studio').getPublicUrl(name);
      return { id: name, url: data.publicUrl, sizeBytes: blob.size, contentType: blob.type };
    },
    async delete(id) { const { error } = await sb.storage.from('studio').remove([id]); if (error) throw err(error); },
    async list() { return { assets: [], usage: null }; },
  };

  // ---------- downloads: descarga normal del navegador ----------
  const downloads = {
    async save({ filename, data }) {
      const url = URL.createObjectURL(data instanceof Blob ? data : new Blob([data]));
      const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    },
  };

  window.claude = {
    use: async name => {
      session = await ready;
      return { db, user, assets, downloads }[name] || null;
    },
  };
})();
