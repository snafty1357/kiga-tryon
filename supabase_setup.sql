-- KIGA 履歴管理用 Supabaseテーブル作成クエリ
-- Supabaseの「SQL Editor」タブを開き、以下のクエリを貼り付けて「Run」を実行してください。

CREATE TABLE IF NOT EXISTS generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  project_id TEXT,
  image_url TEXT,
  garment_types TEXT[],
  description TEXT,
  resolution TEXT,
  format TEXT,
  generation_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- RLS (Row Level Security) を無効化してAPI経由での読み書きを誰でも許可する場合
-- ※ 今回はログイン認証がなく不特定多数が使用可能なため、以下の設定を適用します
ALTER TABLE generations DISABLE ROW LEVEL SECURITY;
