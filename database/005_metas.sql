-- Módulo de metas de ahorro (RF-MET-*)

CREATE TABLE IF NOT EXISTS metas (
    id              uuid          NOT NULL DEFAULT gen_random_uuid(),
    nombre          varchar(100)  NOT NULL,
    monto_objetivo  numeric(18,2) NOT NULL,
    fecha_limite    date,
    icono           varchar(50)   NOT NULL DEFAULT 'target',
    color           varchar(7)    NOT NULL DEFAULT '#4f46e5',
    fecha_creacion  timestamptz   NOT NULL DEFAULT now(),
    -- RF-MET-06: se llena cuando el ahorro alcanza el objetivo; null mientras la meta sigue activa.
    fecha_cumplida  timestamptz,

    CONSTRAINT pk_metas PRIMARY KEY (id),
    CONSTRAINT ck_metas_nombre CHECK (length(trim(nombre)) > 0),
    CONSTRAINT ck_metas_monto CHECK (monto_objetivo > 0),
    CONSTRAINT ck_metas_color CHECK (color ~ '^#[0-9a-fA-F]{6}$')
);

CREATE INDEX IF NOT EXISTS ix_metas_cumplida ON metas (fecha_cumplida);

-- RF-MET-02: cada aportación o retiro queda registrado con fecha y monto.
CREATE TABLE IF NOT EXISTS meta_operaciones (
    id             uuid          NOT NULL DEFAULT gen_random_uuid(),
    meta_id        uuid          NOT NULL,
    tipo           varchar(15)   NOT NULL,
    monto          numeric(18,2) NOT NULL,
    fecha          date          NOT NULL,
    nota           varchar(200),
    fecha_creacion timestamptz   NOT NULL DEFAULT now(),

    CONSTRAINT pk_meta_operaciones PRIMARY KEY (id),
    CONSTRAINT fk_meta_operaciones_meta FOREIGN KEY (meta_id) REFERENCES metas (id),
    CONSTRAINT ck_meta_operaciones_tipo CHECK (tipo IN ('Aportacion', 'Retiro')),
    CONSTRAINT ck_meta_operaciones_monto CHECK (monto > 0)
);

CREATE INDEX IF NOT EXISTS ix_meta_operaciones_meta ON meta_operaciones (meta_id, fecha DESC);
