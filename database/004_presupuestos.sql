-- Módulo de presupuestos (RF-PRE-*)
-- categoria_id NULL = presupuesto global de todo el mes.

CREATE TABLE IF NOT EXISTS presupuestos (
    id             uuid          NOT NULL DEFAULT gen_random_uuid(),
    categoria_id   uuid,
    anio           integer       NOT NULL,
    mes            integer       NOT NULL,
    monto          numeric(18,2) NOT NULL,
    fecha_creacion timestamptz   NOT NULL DEFAULT now(),

    CONSTRAINT pk_presupuestos PRIMARY KEY (id),
    CONSTRAINT fk_presupuestos_categoria FOREIGN KEY (categoria_id) REFERENCES categorias (id),
    CONSTRAINT ck_presupuestos_mes CHECK (mes BETWEEN 1 AND 12),
    CONSTRAINT ck_presupuestos_anio CHECK (anio BETWEEN 2000 AND 2100),
    CONSTRAINT ck_presupuestos_monto CHECK (monto > 0)
);

-- Un solo presupuesto por categoría (o uno global) en cada mes.
CREATE UNIQUE INDEX IF NOT EXISTS ux_presupuestos_periodo_categoria
    ON presupuestos (anio, mes, COALESCE(categoria_id, '00000000-0000-0000-0000-000000000000'::uuid));
