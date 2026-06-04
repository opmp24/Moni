-- PerJaus: Categorías personalizadas
-- Eliminar CHECK constraint de gastos para permitir categorías dinámicas
ALTER TABLE gastos DROP CONSTRAINT IF EXISTS gastos_categoria_check;

-- Tabla de categorías personalizadas por usuario
CREATE TABLE categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6B7280',
  icono TEXT NOT NULL DEFAULT 'CurrencyCircleDollar',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, nombre)
);

-- Índices
CREATE INDEX idx_categorias_user ON categorias (user_id);

-- Row Level Security
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own categorias"
  ON categorias FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categorias"
  ON categorias FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categorias"
  ON categorias FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categorias"
  ON categorias FOR DELETE
  USING (auth.uid() = user_id);
