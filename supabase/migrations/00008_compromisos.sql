-- PerJaus: Compromisos (próximos pagos)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
DROP TABLE IF EXISTS compromisos;
CREATE TABLE compromisos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  concepto TEXT NOT NULL,
  monto NUMERIC(12, 0) NOT NULL CHECK (monto > 0),
  categoria TEXT NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  recurrente BOOLEAN NOT NULL DEFAULT false,
  pagado BOOLEAN NOT NULL DEFAULT false,
  gasto_id UUID REFERENCES gastos(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE compromisos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own compromisos"
  ON compromisos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own compromisos"
  ON compromisos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own compromisos"
  ON compromisos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own compromisos"
  ON compromisos FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_compromisos_user_id ON compromisos (user_id);
CREATE INDEX idx_compromisos_fecha ON compromisos (fecha_vencimiento);
CREATE INDEX idx_compromisos_pagado ON compromisos (pagado);
