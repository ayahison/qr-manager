import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const code = req.query.code as string;

  console.log("=== DEBUG START ===");
  console.log("Code received:", code);

  if (!code) {
    return res.status(400).send("Missing code parameter");
  }

  try {
    const supabaseUrl =
      process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey =
      process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    console.log("Supabase URL:", supabaseUrl ? "Found" : "Missing");
    console.log("Supabase Key:", supabaseKey ? "Found" : "Missing");

    if (!supabaseUrl || !supabaseKey) {
      return res
        .status(500)
        .send("Server configuration error: Missing Supabase credentials");
    }

    const apiUrl = `${supabaseUrl}/rest/v1/qr_links?code=eq.${code}&select=*`;
    console.log("Fetching from:", apiUrl);

    const response = await fetch(apiUrl, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Response status:", response.status);

    const data = await response.json();
    console.log("Response data:", JSON.stringify(data));

    if (!data || data.length === 0) {
      console.log("No data found for code:", code);
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
            <p style="color: #666; font-size: 12px;">Code: ${code}</p>
            <a href="/" style="color: #0070f3; text-decoration: none;">Go to Dashboard</a>
          </body>
        </html>
      `);
    }

    const qrLink = data[0];
    console.log("Redirecting to:", qrLink.target_url);

    // Server-side redirect (302 Found)
    res.setHeader("Location", qrLink.target_url);
    res.status(302).end();
  } catch (error) {
    console.error("Redirect error:", error);
    return res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Error</title>
        </head>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1>Internal Server Error</h1>
          <p>Something went wrong. Please try again later.</p>
          <p style="color: #666; font-size: 12px;">${error}</p>
        </body>
      </html>
    `);
  }
}
