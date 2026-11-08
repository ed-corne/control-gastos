-- Módulo de categorías (RF-CAT-*)

CREATE TABLE IF NOT EXISTS categorias (
    id             uuid         NOT NULL DEFAULT gen_random_uuid(),
    nombre         varchar(100) NOT NULL,
    tipo           varchar(10)  NOT NULL,
    color          varchar(7)   NOT NULL DEFAULT '#6b7280',
    icono          varchar(50)  NOT NULL DEFAULT 'other',
    archivada      boolean      NOT NULL DEFAULT false,
    fecha_creacion timestamptz  NOT NULL DEFAULT now(),

    CONSTRAINT pk_categorias PRIMARY KEY (id),
    CONSTRAINT ck_categorias_tipo CHECK (tipo IN ('Ingreso', 'Gasto')),
    CONSTRAINT ck_categorias_nombre CHECK (length(trim(nombre)) > 0),
    CONSTRAINT ck_categorias_color CHECK (color ~ '^#[0-9a-fA-F]{6}$')
);

-- No puede haber dos categorías con el mismo nombre dentro del mismo tipo.
CREATE UNIQUE INDEX IF NOT EXISTS ux_categorias_tipo_nombre ON categorias (tipo, lower(nombre));
CREATE INDEX IF NOT EXISTS ix_categorias_archivada ON categorias (archivada);

-- RF-CAT-01: categorías predeterminadas
INSERT INTO categorias (nombre, tipo, color, icono) VALUES
    ('Comida',          'Gasto',   '#f97316', 'food'),
    ('Transporte',      'Gasto',   '#0ea5e9', 'transport'),
    ('Vivienda',        'Gasto',   '#8b5cf6', 'home'),
    ('Servicios',       'Gasto',   '#eab308', 'services'),
    ('Salud',           'Gasto',   '#ef4444', 'health'),
    ('Entretenimiento', 'Gasto',   '#ec4899', 'entertainment'),
    ('Ropa',            'Gasto',   '#14b8a6', 'clothes'),
    ('Educación',       'Gasto',   '#3b82f6', 'education'),
    ('Otros',           'Gasto',   '#6b7280', 'other'),
    ('Sueldo',          'Ingreso', '#22c55e', 'salary'),
    ('Freelance',       'Ingreso', '#10b981', 'freelance'),
    ('Otros',           'Ingreso', '#6b7280', 'other')
ON CONFLICT DO NOTHING;
