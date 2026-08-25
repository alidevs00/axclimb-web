import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, gym, email, color, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "axclimb@gmail.com",
      replyTo: email,
      subject: `Nuevo lead: ${gym}`,
      text: `
Nombre: ${name}
Rocódromo: ${gym}
Email: ${email}
Color de acento: ${color || "(no especificado)"}

Mensaje:
${message || "(sin mensaje)"}
      `,
    });

    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}