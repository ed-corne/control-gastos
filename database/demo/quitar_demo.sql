-- Borra únicamente lo que insertó seed_demo.sql (fecha_creacion = 2000-01-01).
DELETE FROM meta_operaciones WHERE fecha_creacion = '2000-01-01 00:00:00+00'
    OR meta_id IN (SELECT id FROM metas WHERE fecha_creacion = '2000-01-01 00:00:00+00');
DELETE FROM metas         WHERE fecha_creacion = '2000-01-01 00:00:00+00';
DELETE FROM movimientos   WHERE fecha_creacion = '2000-01-01 00:00:00+00';
DELETE FROM presupuestos  WHERE fecha_creacion = '2000-01-01 00:00:00+00';
