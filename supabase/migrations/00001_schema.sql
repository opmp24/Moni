-- PerJaus: Schema inicial
-- Habilitar UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de gastos
CREATE TABLE gastos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  monto NUMERIC(12, 0) NOT NULL CHECK (monto > 0),
  concepto TEXT NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN (
    'Alimentación', 'Transporte', 'Vivienda', 'Salud', 'Entretenimiento', 'Otros'
  )),
  fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  telegram_chat_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de vínculo Telegram ↔ Supabase Auth
CREATE TABLE user_telegram_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  telegram_chat_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Índices
CREATE INDEX idx_gastos_fecha ON gastos (fecha DESC);
CREATE INDEX idx_gastos_categoria ON gastos (categoria);
CREATE INDEX idx_gastos_user_id ON gastos (user_id);
CREATE INDEX idx_gastos_user_fecha ON gastos (user_id, fecha DESC);
CREATE INDEX idx_telegram_chat_id ON user_telegram_links (telegram_chat_id);

-- Row Level Security
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_telegram_links ENABLE ROW LEVEL SECURITY;

-- Policies: usuarios solo ven sus propios gastos
CREATE POLICY "Users can view own gastos"
  ON gastos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gastos"
  ON gastos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gastos"
  ON gastos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own gastos"
  ON gastos FOR DELETE
  USING (auth.uid() = user_id);

-- Política temporal: permitir lectura anónima (mientras no haya auth implementada)
CREATE POLICY "Allow anon read" ON gastos FOR SELECT USING (true);

-- Policies para telegram_links
CREATE POLICY "Users can view own telegram link"
  ON user_telegram_links FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own telegram link"
  ON user_telegram_links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Función auxiliar: obtener gastos del mes actual
CREATE OR REPLACE FUNCTION get_gastos_del_mes(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  monto NUMERIC,
  concepto TEXT,
  categoria TEXT,
  fecha TIMESTAMPTZ
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT g.id, g.monto, g.concepto, g.categoria, g.fecha
  FROM gastos g
  WHERE g.user_id = p_user_id
    AND DATE_TRUNC('month', g.fecha) = DATE_TRUNC('month', NOW())
  ORDER BY g.fecha DESC;
END;
$$;
