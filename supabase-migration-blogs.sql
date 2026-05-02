-- ============================================================
-- blogs table — stores blog posts written by firms
-- ============================================================

CREATE TABLE IF NOT EXISTS blogs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id     uuid NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  title       text NOT NULL,
  slug        text NOT NULL UNIQUE,
  category    text NOT NULL DEFAULT 'carriere'
              CHECK (category IN ('carriere', 'juridisch', 'kantoorleven')),
  content     text NOT NULL DEFAULT '',
  image_url   text,
  status      text NOT NULL DEFAULT 'draft'
              CHECK (status IN ('draft', 'published')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookups by firm
CREATE INDEX IF NOT EXISTS idx_blogs_firm_id ON blogs(firm_id);

-- Index for public listing (published blogs ordered by date)
CREATE INDEX IF NOT EXISTS idx_blogs_published ON blogs(status, created_at DESC)
  WHERE status = 'published';

-- Auto-update updated_at on every change
CREATE OR REPLACE FUNCTION update_blogs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_blogs_updated_at ON blogs;
CREATE TRIGGER trg_blogs_updated_at
  BEFORE UPDATE ON blogs
  FOR EACH ROW
  EXECUTE FUNCTION update_blogs_updated_at();

-- RLS
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Employers can manage their own blogs
CREATE POLICY blogs_owner_all ON blogs
  FOR ALL
  USING  (firm_id IN (SELECT id FROM firms WHERE user_id = auth.uid()))
  WITH CHECK (firm_id IN (SELECT id FROM firms WHERE user_id = auth.uid()));

-- Anyone can read published blogs
CREATE POLICY blogs_public_read ON blogs
  FOR SELECT
  USING (status = 'published');
