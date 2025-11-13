import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const code = (req.query.qr || req.query.code) as string;

  if (!code) {
    return res.status(400).send("Missing code parameter");
  }

  try {
    const supabaseUrl = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
      : process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).send("Server configuration error");
    }

    const response = await fetch(
      `${supabaseUrl}/rest/v1/qr_links?code=eq.${code}&select=*`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!data || data.length === 0) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
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

    // Record analytics (optional, jangan sampai blocking redirect)
    try {
      await fetch(`${supabaseUrl}/rest/v1/rpc/increment_scan_count`, {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ qr_link_id: qrLink.id }),
      });
    } catch (e) {
      console.error("Analytics error:", e);
    }

    // SOLUSI: Return HTML dengan meta refresh + JavaScript redirect
    return res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="refresh" content="0;url=${qrLink.target_url}">
          <title>Redirecting...</title>
          <link rel="canonical" href="${qrLink.target_url}">
          
          <!-- Open Graph for social media -->
          <meta property="og:type" content="website">
          <meta property="og:url" content="${qrLink.target_url}">
          
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              text-align: center;
              color: white;
            }
            .spinner {
              width: 50px;
              height: 50px;
              border: 4px solid rgba(255,255,255,0.3);
              border-top: 4px solid white;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin: 0 auto 20px;
            }
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
            a {
              color: white;
              text-decoration: underline;
              font-size: 14px;
            }
          </style>
          
          <script>
            // Immediate JavaScript redirect (fastest)
            window.location.replace("${qrLink.target_url}");
            
            // Fallback after 1 second
            setTimeout(function() {
              window.location.href = "${qrLink.target_url}";
            }, 1000);
          </script>
        </head>
        <body>
          <div class="container">
            <div class="spinner"></div>
            <h2>Redirecting...</h2>
            <p>If you are not redirected automatically,<br>
            <a href="${qrLink.target_url}">click here</a></p>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Redirect error:", error);
    return res.status(500).send("Internal Server Error");
  }
}
