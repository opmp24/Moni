-- PerJaus: Global predefined categories stored in DB (no hardcoded)
-- 1. Allow NULL user_id for global categories
ALTER TABLE categorias ALTER COLUMN user_id DROP NOT NULL;

-- 2. Drop the old UNIQUE(user_id, nombre) constraint and create a more flexible one
ALTER TABLE categorias DROP CONSTRAINT IF EXISTS categorias_user_id_nombre_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_categorias_global_nombre ON categorias (nombre) WHERE user_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_categorias_user_nombre ON categorias (user_id, nombre) WHERE user_id IS NOT NULL;

-- 3. Insert predefined global categories
INSERT INTO categorias (user_id, nombre, color, icono) VALUES
  (NULL, 'Alimentación',   '#FFD600', 'ForkKnife'),
  (NULL, 'Transporte',     '#FF6B35', 'Bus'),
  (NULL, 'Vivienda',       '#004E98', 'House'),
  (NULL, 'Salud',          '#3EB489', 'Heart'),
  (NULL, 'Entretenimiento','#9B59B6', 'GameController'),
  (NULL, 'Ingresos',       '#22C55E', 'PiggyBank'),
  (NULL, 'Otros',          '#6B7280', 'Tag')
ON CONFLICT DO NOTHING;

-- 4. Update RLS policies for global categories
DROP POLICY IF EXISTS "Users can view own categorias" ON categorias;
DROP POLICY IF EXISTS "Users can insert own categorias" ON categorias;
DROP POLICY IF EXISTS "Users can update own categorias" ON categorias;
DROP POLICY IF EXISTS "Users can delete own categorias" ON categorias;

DROP POLICY IF EXISTS "Anyone can view global categorias" ON categorias;
DROP POLICY IF EXISTS "Anyone can view global categorias" ON categorias;
CREATE POLICY "Anyone can view global categorias"
  ON categorias FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own categorias" ON categorias;
CREATE POLICY "Users can insert own categorias"
  ON categorias FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own categorias" ON categorias;
CREATE POLICY "Users can update own categorias"
  ON categorias FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own categorias" ON categorias;
CREATE POLICY "Users can delete own categorias"
  ON categorias FOR DELETE
  USING (auth.uid() = user_id);
