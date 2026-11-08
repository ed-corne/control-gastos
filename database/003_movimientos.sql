-- Módulo de movimientos (RF-MOV-*)

CREATE TABLE IF NOT EXISTS movimientos (
    id                 uuid          NOT NULL DEFAULT gen_random_uuid(),
    tipo               varchar(15)   NOT NULL,
    monto              numeric(18,2) NOT NULL,
    fecha              date          NOT NULL,
    descripcion        varchar(500),
    cuenta_id          uuid          NOT NULL,
    cuenta_destino_id  uuid,
    categoria_id       uuid,
    fecha_creacion     timestamptz   NOT NULL DEFAULT now(),

    CONSTRAINT pk_movimientos PRIMARY KEY (id),
    CONSTRAINT fk_movimientos_cuenta FOREIGN KEY (cuenta_id) REFERENCES cuentas (id),
    CONSTRAINT fk_movimientos_cuenta_destino FOREIGN KEY (cuenta_destino_id) REFERENCES cuentas (id),
    CONSTRAINT fk_movimientos_categoria FOREIGN KEY (categoria_id) REFERENCES categorias (id),
    CONSTRAINT ck_movimientos_tipo CHECK (tipo IN ('Ingreso', 'Gasto', 'Transferencia')),
    CONSTRAINT ck_movimientos_monto CHECK (monto > 0),
    -- Una transferencia lleva cuenta destino distinta y no lleva categoría;
    -- un ingreso o gasto lleva categoría y no lleva cuenta destino.
    CONSTRAINT ck_movimientos_forma CHECK (
        (tipo = 'Transferencia' AND cuenta_destino_id IS NOT NULL AND cuenta_destino_id <> cuenta_id AND categoria_id IS NULL)
        OR
        (tipo <> 'Transferencia' AND cuenta_destino_id IS NULL AND categoria_id IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS ix_movimientos_fecha ON movimientos (fecha DESC);
CREATE INDEX IF NOT EXISTS ix_movimientos_cuenta ON movimientos (cuenta_id);
CREATE INDEX IF NOT EXISTS ix_movimientos_cuenta_destino ON movimientos (cuenta_destino_id);
CREATE INDEX IF NOT EXISTS ix_movimientos_categoria ON movimientos (categoria_id);
