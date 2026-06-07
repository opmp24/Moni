-- PerJaus: Transacciones recurrentes
ALTER TABLE gastos ADD COLUMN recurrente BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE gastos ADD COLUMN periodo TEXT DEFAULT 'mensual';

ALTER TABLE ingresos ADD COLUMN recurrente BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE ingresos ADD COLUMN periodo TEXT DEFAULT 'mensual';
