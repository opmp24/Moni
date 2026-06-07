-- PerJaus: Habilitar Realtime para tablas que necesitan postgres_changes
-- Ejecutado via Management API el 2026-06-03
ALTER PUBLICATION supabase_realtime ADD TABLE presupuestos;
ALTER PUBLICATION supabase_realtime ADD TABLE categorias;
ALTER PUBLICATION supabase_realtime ADD TABLE ingresos;
ALTER PUBLICATION supabase_realtime ADD TABLE metas;
