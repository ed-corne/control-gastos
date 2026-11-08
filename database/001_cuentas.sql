-- Módulo de cuentas (RF-CTA-*)
-- Base de datos: control_gastos (PostgreSQL)

CREATE TABLE IF NOT EXISTS cuentas (
    id             uuid           NOT NULL DEFAULT gen_random_uuid(),
    nombre         varchar(100)   NOT NULL,
    tipo           varchar(20)    NOT NULL,
    saldo_inicial  numeric(18,2)  NOT NULL DEFAULT 0,
    color          varchar(7)     NOT NULL DEFAULT '#4f46e5',
    icono          varchar(50)    NOT NULL DEFAULT 'wallet',
    archivada      boolean        NOT NULL DEFAULT false,
    fecha_creacion timestamptz    NOT NULL DEFAULT now(),

    CONSTRAINT pk_cuentas PRIMARY KEY (id),
    CONSTRAINT ck_cuentas_tipo CHECK (tipo IN ('Efectivo', 'Debito', 'Credito', 'Ahorro', 'Inversion')),
    CONSTRAINT ck_cuentas_nombre CHECK (length(trim(nombre)) > 0),
    CONSTRAINT ck_cuentas_color CHECK (color ~ '^#[0-9a-fA-F]{6}$')
);

CREATE INDEX IF NOT EXISTS ix_cuentas_archivada ON cuentas (archivada);
