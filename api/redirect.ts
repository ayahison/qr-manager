import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const code = req.query.code as string;

  if (!code) {
    return res.status(400).send("Missing code parameter");
  }

  try {
    // Fetch dari Supabase
    const supabaseUrl =
      process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey =
      process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    const response = await fetch(
      `${supabaseUrl}/rest/v1/qr_links?code=eq.${code}&select=*`,
      {
        headers: {
          apikey: supabaseKey!,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    );

    const data = await response.json();

    if (!data || data.length === 0) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>QR Code Not Found</title>
          </head>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h1>QR Code Not Found</h1>
            <p>This QR code does not exist or has been deleted.</p>
            <a href="/">Go to Dashboard</a>
          </body>
        </html>
      `);
    }

    const qrLink = data[0];

    // Server-side redirect (302 Found)
    res.setHeader("Location", qrLink.target_url);
    res.status(302).end();
  } catch (error) {
    console.error("Redirect error:", error);
    return res.status(500).send("Internal Server Error");
  }
}
