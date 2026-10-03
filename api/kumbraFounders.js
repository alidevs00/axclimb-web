// The @ of everyone on the Kumbra waiting list, for the lights on the teaser's mountain
// (www.axclimb.com/kumbra). Only the usernames: never emails, who invited whom or anything else.
// Read with the service-role key (set in Vercel as SUPABASE_SERVICE_ROLE_KEY), cached for a minute.

const SUPABASE_URL = "https://raaokvljxioaxaoqcjxa.supabase.co";
const USERNAME_RE = /^[a-z0-9_.]{3,20}$/;
const LIMIT = 500;

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "method" });
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return res.status(200).json({ names: [] });
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/waitlist?select=username&order=created_at.asc&limit=${LIMIT}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!response.ok) {
      console.error("kumbraFounders", response.status, await response.text().catch(() => ""));
      return res.status(200).json({ names: [] });
    }
    const rows = await response.json();
    const names = [...new Set(rows.map((r) => String(r.username || "").toLowerCase()).filter((n) => USERNAME_RE.test(n)))];
    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return res.status(200).json({ names });
  } catch (error) {
    console.error("kumbraFounders", error);
    return res.status(200).json({ names: [] });
  }
}
