import nodemailer from "nodemailer";

// Kumbra waiting list (www.axclimb.com/kumbra). There is no database for it yet: each sign-up is
// emailed to axclimb@gmail.com (with who invited them) and the person gets a confirmation email.
// Usernames are checked against the accounts that already exist in the app; clashes between
// waiting-list sign-ups are sorted out by hand until the list moves to Supabase.

const USERNAME_RE = /^[a-z0-9_.]{3,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUPABASE_URL = "https://raaokvljxioaxaoqcjxa.supabase.co";
const SUPABASE_KEY = "sb_publishable_TFiQYiyqkaHv9mEvGR2rgw_hG7sHMU9";

async function isUsernameFree(username) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/is_username_available`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      body: JSON.stringify({ p_username: username }),
    });
    // If the check itself fails, the sign-up still goes through and is reviewed by hand.
    return response.ok ? await response.json() : true;
  } catch {
    return true;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method" });
  }

  const body = req.body || {};
  const email = String(body.email || "").trim().toLowerCase();
  const username = String(body.username || "").trim().toLowerCase();
  const ref = String(body.ref || "").toLowerCase().replace(/[^a-z0-9_.]/g, "").slice(0, 20);

  // Hidden field only bots fill in: answer as if it worked and drop it.
  if (body.website) return res.status(200).json({ ok: true });
  if (!EMAIL_RE.test(email) || !USERNAME_RE.test(username)) {
    return res.status(400).json({ error: "invalid" });
  }
  if (!(await isUsernameFree(username))) {
    return res.status(409).json({ error: "taken" });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "axclimb@gmail.com",
      replyTo: email,
      subject: `Kumbra lista de espera: @${username}`,
      text: [
        `Email: ${email}`,
        `Usuario: @${username}`,
        `Invitado por: ${ref ? "@" + ref : "(nadie)"}`,
        `Fecha: ${new Date().toISOString()}`,
      ].join("\n"),
    });
  } catch (error) {
    return res.status(500).json({ error: "server" });
  }

  // The confirmation is a courtesy: if it fails, the sign-up is already recorded above.
  try {
    const link = `https://www.axclimb.com/kumbra?ref=${encodeURIComponent(username)}`;
    await transporter.sendMail({
      from: `Kumbra <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `@${username} es tuyo en Kumbra`,
      text: [
        `Hola,`,
        ``,
        `Ya estás en la lista de espera de Kumbra y hemos reservado @${username} para ti.`,
        `Cuando salga la app te avisaremos por email para que crees tu cuenta con ese nombre. Entrarás con tu Pack Fundador.`,
        ``,
        `Trae a 3 amigos con este enlace y desbloquearás algo que nadie más tendrá:`,
        link,
        ``,
        `Si no te has apuntado tú o quieres salir de la lista, responde a este email y te borramos.`,
        ``,
        `Kumbra · Hecho en Madrid`,
      ].join("\n"),
    });
  } catch {
    // Ignored on purpose.
  }

  return res.status(200).json({ ok: true });
}
