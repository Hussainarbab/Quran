CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  preferred_date_method TEXT,
  marja_preference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'system',
  language_preference TEXT NOT NULL DEFAULT 'ur',
  audio_enabled BOOLEAN NOT NULL DEFAULT false,
  notifications_enabled BOOLEAN NOT NULL DEFAULT false,
  offline_downloads_enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS religious_sources (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  edition TEXT,
  source_location TEXT,
  license TEXT,
  import_date TIMESTAMPTZ DEFAULT NOW(),
  checksum TEXT,
  verification_status TEXT NOT NULL DEFAULT 'draft'
);

CREATE TABLE IF NOT EXISTS content_versions (
  id UUID PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  version_number INTEGER NOT NULL,
  source_id UUID REFERENCES religious_sources(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (entity_type, entity_id, version_number)
);

CREATE TABLE IF NOT EXISTS content_verification_records (
  id UUID PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft','imported','awaiting_verification','scholar_reviewed','approved_for_publication','published','requires_correction')),
  reviewer_name TEXT,
  review_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quran_surahs (
  id INTEGER PRIMARY KEY,
  arabic_name TEXT NOT NULL,
  transliteration TEXT,
  english_name TEXT,
  revelation_order INTEGER,
  verse_count INTEGER NOT NULL,
  source_id UUID REFERENCES religious_sources(id),
  status TEXT NOT NULL DEFAULT 'awaiting_verification'
);

CREATE TABLE IF NOT EXISTS quran_verses (
  id UUID PRIMARY KEY,
  surah_id INTEGER NOT NULL REFERENCES quran_surahs(id),
  verse_number INTEGER NOT NULL,
  arabic_text TEXT NOT NULL,
  source_id UUID REFERENCES religious_sources(id),
  checksum TEXT,
  UNIQUE (surah_id, verse_number)
);

CREATE TABLE IF NOT EXISTS quran_translations (
  id UUID PRIMARY KEY,
  verse_id UUID NOT NULL REFERENCES quran_verses(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  translation_text TEXT NOT NULL,
  source_id UUID REFERENCES religious_sources(id),
  verification_status TEXT NOT NULL DEFAULT 'awaiting_verification'
);

CREATE TABLE IF NOT EXISTS duas (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT,
  arabic_text TEXT,
  source_id UUID REFERENCES religious_sources(id),
  status TEXT NOT NULL DEFAULT 'draft'
);

CREATE TABLE IF NOT EXISTS dua_translations (
  id UUID PRIMARY KEY,
  dua_id UUID NOT NULL REFERENCES duas(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  translation_text TEXT NOT NULL,
  source_id UUID REFERENCES religious_sources(id)
);

CREATE TABLE IF NOT EXISTS ziyarat (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  arabic_text TEXT,
  source_id UUID REFERENCES religious_sources(id),
  status TEXT NOT NULL DEFAULT 'draft'
);

CREATE TABLE IF NOT EXISTS ziyarat_translations (
  id UUID PRIMARY KEY,
  ziyarat_id UUID NOT NULL REFERENCES ziyarat(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  translation_text TEXT NOT NULL,
  source_id UUID REFERENCES religious_sources(id)
);

CREATE TABLE IF NOT EXISTS sahifa_sajjadiya_entries (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  arabic_text TEXT,
  category TEXT,
  source_id UUID REFERENCES religious_sources(id),
  status TEXT NOT NULL DEFAULT 'draft'
);

CREATE TABLE IF NOT EXISTS prayer_guides (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  source_id UUID REFERENCES religious_sources(id),
  status TEXT NOT NULL DEFAULT 'draft'
);

CREATE TABLE IF NOT EXISTS wudu_guides (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  source_id UUID REFERENCES religious_sources(id),
  status TEXT NOT NULL DEFAULT 'draft'
);

CREATE TABLE IF NOT EXISTS islamic_events (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  is_estimated BOOLEAN DEFAULT true,
  source_id UUID REFERENCES religious_sources(id),
  status TEXT NOT NULL DEFAULT 'draft'
);

CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reading_history (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  last_position TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS offline_download_metadata (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  downloaded_at TIMESTAMPTZ DEFAULT NOW(),
  local_path TEXT,
  checksum TEXT
);

CREATE TABLE IF NOT EXISTS tasbeeh_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  count INTEGER NOT NULL DEFAULT 0,
  target_count INTEGER,
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  is_super_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quran_verses_surah_id ON quran_verses(surah_id);
CREATE INDEX IF NOT EXISTS idx_quran_translations_verse_id ON quran_translations(verse_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_history_user_id ON reading_history(user_id);
CREATE INDEX IF NOT EXISTS idx_content_verification_entity ON content_verification_records(entity_type, entity_id);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE quran_surahs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quran_verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE duas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ziyarat ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasbeeh_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for approved content" ON quran_surahs FOR SELECT USING (status IN ('approved_for_publication', 'published'));
CREATE POLICY "Public read access for approved duas" ON duas FOR SELECT USING (status IN ('approved_for_publication', 'published'));
CREATE POLICY "Public read access for approved ziyarat" ON ziyarat FOR SELECT USING (status IN ('approved_for_publication', 'published'));
CREATE POLICY "Users can manage their own bookmarks" ON bookmarks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage their own history" ON reading_history FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage their own sessions" ON tasbeeh_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin-only content mutations" ON quran_surahs FOR UPDATE USING (auth.uid() IN (SELECT id FROM admin_users));
CREATE POLICY "Admin-only content mutations for duas" ON duas FOR UPDATE USING (auth.uid() IN (SELECT id FROM admin_users));
CREATE POLICY "Admin-only content mutations for ziyarat" ON ziyarat FOR UPDATE USING (auth.uid() IN (SELECT id FROM admin_users));

CREATE OR REPLACE FUNCTION public.is_content_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE id = (SELECT auth.uid())
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_content_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_content_admin() TO authenticated;

CREATE TABLE IF NOT EXISTS content_change_audit (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  actor_id UUID,
  old_record JSONB,
  new_record JSONB,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_change_audit_changed_at
  ON content_change_audit(changed_at DESC);

CREATE OR REPLACE FUNCTION public.audit_content_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  old_data JSONB;
  new_data JSONB;
  affected_id TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    new_data := to_jsonb(NEW);
    affected_id := new_data ->> 'id';
  ELSIF TG_OP = 'UPDATE' THEN
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);
    affected_id := new_data ->> 'id';
  ELSE
    old_data := to_jsonb(OLD);
    affected_id := old_data ->> 'id';
  END IF;

  INSERT INTO public.content_change_audit
    (table_name, record_id, operation, actor_id, old_record, new_record)
  VALUES
    (TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME, affected_id, TG_OP, (SELECT auth.uid()), old_data, new_data);

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE religious_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_verification_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE quran_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dua_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ziyarat_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sahifa_sajjadiya_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE wudu_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE islamic_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_download_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_change_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for approved content" ON quran_surahs;
DROP POLICY IF EXISTS "Public read access for approved duas" ON duas;
DROP POLICY IF EXISTS "Public read access for approved ziyarat" ON ziyarat;
DROP POLICY IF EXISTS "Users can manage their own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can manage their own history" ON reading_history;
DROP POLICY IF EXISTS "Users can manage their own sessions" ON tasbeeh_sessions;
DROP POLICY IF EXISTS "Admin-only content mutations" ON quran_surahs;
DROP POLICY IF EXISTS "Admin-only content mutations for duas" ON duas;
DROP POLICY IF EXISTS "Admin-only content mutations for ziyarat" ON ziyarat;

CREATE POLICY "Published Quran surahs are readable"
  ON quran_surahs FOR SELECT
  USING (status IN ('approved_for_publication', 'published'));
CREATE POLICY "Published Quran verses are readable"
  ON quran_verses FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM quran_surahs
    WHERE quran_surahs.id = quran_verses.surah_id
      AND quran_surahs.status IN ('approved_for_publication', 'published')
  ));
CREATE POLICY "Published Quran translations are readable"
  ON quran_translations FOR SELECT
  USING (verification_status IN ('approved_for_publication', 'published')
    AND EXISTS (
      SELECT 1 FROM quran_verses
      JOIN quran_surahs ON quran_surahs.id = quran_verses.surah_id
      WHERE quran_verses.id = quran_translations.verse_id
        AND quran_surahs.status IN ('approved_for_publication', 'published')
    ));
CREATE POLICY "Published duas are readable"
  ON duas FOR SELECT
  USING (status IN ('approved_for_publication', 'published'));
CREATE POLICY "Published dua translations are readable"
  ON dua_translations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM duas
    WHERE duas.id = dua_translations.dua_id
      AND duas.status IN ('approved_for_publication', 'published')
  ));
CREATE POLICY "Published ziyarat are readable"
  ON ziyarat FOR SELECT
  USING (status IN ('approved_for_publication', 'published'));
CREATE POLICY "Published ziyarat translations are readable"
  ON ziyarat_translations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM ziyarat
    WHERE ziyarat.id = ziyarat_translations.ziyarat_id
      AND ziyarat.status IN ('approved_for_publication', 'published')
  ));
CREATE POLICY "Published Sahifa entries are readable"
  ON sahifa_sajjadiya_entries FOR SELECT
  USING (status IN ('approved_for_publication', 'published'));
CREATE POLICY "Published prayer guides are readable"
  ON prayer_guides FOR SELECT
  USING (status IN ('approved_for_publication', 'published'));
CREATE POLICY "Published wudu guides are readable"
  ON wudu_guides FOR SELECT
  USING (status IN ('approved_for_publication', 'published'));
CREATE POLICY "Published Islamic events are readable"
  ON islamic_events FOR SELECT
  USING (status IN ('approved_for_publication', 'published'));
CREATE POLICY "Published sources are readable"
  ON religious_sources FOR SELECT
  USING (verification_status IN ('approved_for_publication', 'published'));

CREATE POLICY "Users manage own profile"
  ON users FOR ALL TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));
CREATE POLICY "Users manage own preferences"
  ON user_preferences FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "Users manage own bookmarks"
  ON bookmarks FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "Users manage own reading history"
  ON reading_history FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "Users manage own downloads"
  ON offline_download_metadata FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "Users manage own Tasbeeh sessions"
  ON tasbeeh_sessions FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "Admins read their membership"
  ON admin_users FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()));
CREATE POLICY "Admins read content audit log"
  ON content_change_audit FOR SELECT TO authenticated
  USING (public.is_content_admin());

DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'quran_surahs',
    'quran_verses',
    'quran_translations',
    'duas',
    'dua_translations',
    'ziyarat',
    'ziyarat_translations',
    'sahifa_sajjadiya_entries',
    'prayer_guides',
    'wudu_guides',
    'islamic_events',
    'religious_sources',
    'content_versions',
    'content_verification_records'
  ]
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON public.%I',
      'Admins manage ' || table_name,
      table_name
    );
    EXECUTE format(
      'CREATE POLICY "Admins manage %1$s" ON public.%1$I FOR ALL TO authenticated USING (public.is_content_admin()) WITH CHECK (public.is_content_admin())',
      table_name
    );
    EXECUTE format('DROP TRIGGER IF EXISTS content_change_audit ON public.%I', table_name);
    EXECUTE format(
      'CREATE TRIGGER content_change_audit AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.audit_content_change()',
      table_name
    );
  END LOOP;
END;
$$;
