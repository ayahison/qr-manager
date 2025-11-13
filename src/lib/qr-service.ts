import QRCode from "qrcode";
import { nanoid } from "nanoid";
import { supabase, QRLink } from "./supabase";

const APP_BASE_URL = window.location.origin;

export const generateQRCode = async (url: string, label: string) => {
  const formattedUrl =
    url.startsWith("http://") || url.startsWith("https://")
      ? url
      : `https://${url}`;

  const code = nanoid(8);
  // const shortUrl = `${APP_BASE_URL}/q/${code}`;
  const shortUrl = `${APP_BASE_URL}/?qr=${code}`;

  // 🔍 TAMBAHKAN INI - Logging untuk debug
  console.log("=== QR CODE DEBUG ===");
  console.log("Short URL yang akan di-encode:", shortUrl);
  console.log("Length:", shortUrl.length);
  console.log("Type:", typeof shortUrl);
  console.log("Has whitespace?", /\s/.test(shortUrl));
  console.log("Raw bytes:", new TextEncoder().encode(shortUrl));

  // Simpan ke database...
  const { data, error } = await supabase
    .from("qr_links")
    .insert([
      {
        label,
        target_url: formattedUrl,
        code,
        short_url: shortUrl,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  // Generate QR dengan logging tambahan
  const qrDataUrl = await QRCode.toDataURL(shortUrl, {
    width: 300,
    margin: 2,
    errorCorrectionLevel: "M",
    type: "image/png",
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });

  console.log("QR Code generated successfully");
  console.log("===================");

  return { qrLink: { ...data, qrDataUrl } };
};
export const getAllQRLinks = async (): Promise<QRLink[]> => {
  const { data, error } = await supabase
    .from("qr_links")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

export const getQRLinkByCode = async (code: string): Promise<QRLink | null> => {
  const { data, error } = await supabase
    .from("qr_links")
    .select("*")
    .eq("code", code)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const updateQRLink = async (
  id: string,
  targetUrl: string,
  label: string
): Promise<QRLink> => {
  const { data, error } = await supabase
    .from("qr_links")
    .update({
      target_url: targetUrl,
      label,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteQRLink = async (id: string): Promise<void> => {
  const { error } = await supabase.from("qr_links").delete().eq("id", id);

  if (error) throw error;
};

export const incrementScanCount = async (qrLinkId: string): Promise<void> => {
  const { data: currentData } = await supabase
    .from("qr_links")
    .select("scan_count")
    .eq("id", qrLinkId)
    .single();

  if (currentData) {
    await supabase
      .from("qr_links")
      .update({ scan_count: currentData.scan_count + 1 })
      .eq("id", qrLinkId);
  }
};

export const recordScan = async (
  qrLinkId: string,
  userAgent?: string,
  ipAddress?: string,
  referrer?: string
): Promise<void> => {
  await supabase.from("qr_scans").insert({
    qr_link_id: qrLinkId,
    user_agent: userAgent,
    ip_address: ipAddress,
    referrer: referrer,
  });
};

export const getQRAnalytics = async (qrLinkId: string) => {
  const { data, error } = await supabase
    .from("qr_scans")
    .select("*")
    .eq("qr_link_id", qrLinkId)
    .order("scanned_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

export const regenerateQRImage = async (shortUrl: string): Promise<string> => {
  return await QRCode.toDataURL(shortUrl, {
    width: 300,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });
};
