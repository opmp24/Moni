-- PerJaus: Metas de ahorro
CREATE TABLE metas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  monto_objetivo NUMERIC(12, 0) NOT NULL CHECK (monto_objetivo > 0),
  monto_actual NUMERIC(12, 0) NOT NULL DEFAULT 0,
  color TEXT DEFAULT '#FFD600',
  icono TEXT DEFAULT 'Coin',
  creada_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completada BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE metas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own metas"
  ON metas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own metas"
  ON metas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own metas"
  ON metas FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own metas"
  ON metas FOR DELETE
  USING (auth.uid() = user_id);
