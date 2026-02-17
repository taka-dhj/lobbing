-- 予約テーブル
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  customer_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('一般', '学生')),
  unit_price INTEGER NOT NULL,
  number_of_people INTEGER NOT NULL,
  tennis_court INTEGER DEFAULT 0,
  banquet_hall INTEGER DEFAULT 0,
  other INTEGER DEFAULT 0,
  total_amount INTEGER NOT NULL,
  rooms JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- インデックス作成
CREATE INDEX idx_reservations_date ON reservations(date);
CREATE INDEX idx_reservations_user_id ON reservations(user_id);

-- 更新日時を自動更新する関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガー設定
CREATE TRIGGER update_reservations_updated_at
BEFORE UPDATE ON reservations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) を有効化
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- RLSポリシー：認証済みユーザーは全レコードを閲覧可能
CREATE POLICY "認証済みユーザーは全予約を閲覧可能" 
ON reservations FOR SELECT 
TO authenticated 
USING (true);

-- RLSポリシー：認証済みユーザーは予約を追加可能
CREATE POLICY "認証済みユーザーは予約を追加可能" 
ON reservations FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- RLSポリシー：認証済みユーザーは予約を更新可能
CREATE POLICY "認証済みユーザーは予約を更新可能" 
ON reservations FOR UPDATE 
TO authenticated 
USING (true);

-- RLSポリシー：認証済みユーザーは予約を削除可能
CREATE POLICY "認証済みユーザーは予約を削除可能" 
ON reservations FOR DELETE 
TO authenticated 
USING (true);
