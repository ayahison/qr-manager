/*
  # Dynamic QR Manager Database Schema

  1. New Tables
    - `qr_links`
      - `id` (uuid, primary key) - Unique identifier
      - `code` (text, unique) - Short code for QR redirect (e.g., "abc123")
      - `label` (text) - User-friendly name for the QR code
      - `target_url` (text) - The destination URL
      - `short_url` (text) - Full short URL (e.g., "app.com/q/abc123")
      - `scan_count` (integer) - Number of times scanned
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
      - `user_id` (uuid, optional) - For future multi-user support

    - `qr_scans`
      - `id` (uuid, primary key) - Unique identifier
      - `qr_link_id` (uuid, foreign key) - Reference to qr_links
      - `scanned_at` (timestamptz) - When the scan occurred
      - `user_agent` (text) - Device/browser information
      - `ip_address` (text) - User IP address
      - `referrer` (text) - Where the scan came from

  2. Security
    - Enable RLS on all tables
    - Public can read and scan QR codes (for redirect functionality)
    - Public can create QR codes (no auth required for MVP)
    - Public can update and delete their own QR codes
*/

CREATE TABLE IF NOT EXISTS qr_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  label text NOT NULL,
  target_url text NOT NULL,
  short_url text NOT NULL,
  scan_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid
);

CREATE TABLE IF NOT EXISTS qr_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_link_id uuid NOT NULL REFERENCES qr_links(id) ON DELETE CASCADE,
  scanned_at timestamptz DEFAULT now(),
  user_agent text,
  ip_address text,
  referrer text
);

CREATE INDEX IF NOT EXISTS idx_qr_links_code ON qr_links(code);
CREATE INDEX IF NOT EXISTS idx_qr_scans_qr_link_id ON qr_scans(qr_link_id);
CREATE INDEX IF NOT EXISTS idx_qr_scans_scanned_at ON qr_scans(scanned_at);

ALTER TABLE qr_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view QR links"
  ON qr_links FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create QR links"
  ON qr_links FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update QR links"
  ON qr_links FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete QR links"
  ON qr_links FOR DELETE
  USING (true);

CREATE POLICY "Anyone can view scans"
  ON qr_scans FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create scan records"
  ON qr_scans FOR INSERT
  WITH CHECK (true);