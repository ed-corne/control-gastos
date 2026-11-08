-- Comentario descriptivo: qué cosas entran en la categoría (se muestra también en presupuestos).
ALTER TABLE categorias ADD COLUMN IF NOT EXISTS comentario varchar(300) NULL;
