-- PerJaus: Tags en gastos e ingresos
ALTER TABLE gastos ADD COLUMN tags TEXT[] DEFAULT '{}';
ALTER TABLE ingresos ADD COLUMN tags TEXT[] DEFAULT '{}';
