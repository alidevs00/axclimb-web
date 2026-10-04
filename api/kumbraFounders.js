// The @ of everyone on the Kumbra waiting list, plus the app's founders (the beta accounts), for
// the lights on the teaser's mountain (www.axclimb.com/kumbra). Only the usernames: never emails,
// who invited whom or anything else.
// Read with the service-role key (set in Vercel as SUPABASE_SERVICE_ROLE_KEY), cached for a minute.

const SUPABASE_URL = "https://raaokvljxioaxaoqcjxa.supabase.co";
const USERNAME_RE = /^[a-z0-9_.]{3,20}$/;
const LIMIT = 500;

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "method" });
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return res.status(200).json({ names: [] });
  try {
    const headers = { apikey: key, Authorization: `Bearer ${key}` };
    const [waitlist, founders] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/waitlist?select=username&order=created_at.asc&limit=${LIMIT}`, { headers }),
      fetch(`${SUPABASE_URL}/rest/v1/profiles?select=handle&is_founder=eq.true&order=created_at.asc&limit=${LIMIT}`, { headers }),
    ]);
    if (!waitlist.ok) {
      console.error("kumbraFounders", waitlist.status, await waitlist.text().catch(() => ""));
      return res.status(200).json({ names: [] });
    }
    const listed = (await waitlist.json()).map((r) => r.username);
    const beta = founders.ok ? (await founders.json()).map((r) => r.handle) : [];
    const names = [...new Set([...listed, ...beta].map((n) => String(n || "").toLowerCase()).filter((n) => USERNAME_RE.test(n)))];
    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return res.status(200).json({ names });
  } catch (error) {
    console.error("kumbraFounders", error);
    return res.status(200).json({ names: [] });
  }
}
