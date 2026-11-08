-- Configuración de la app (RF-CFG-03). Es una app de un solo usuario: la tabla tiene una única fila (id = 1).

CREATE TABLE IF NOT EXISTS configuracion (
    id                  integer      NOT NULL DEFAULT 1,
    nombre              varchar(100) NOT NULL DEFAULT '',
    moneda              varchar(3)   NOT NULL DEFAULT 'MXN',
    zona_horaria        varchar(60)  NOT NULL DEFAULT 'America/Mexico_City',
    -- Día en que empieza el mes financiero (por ejemplo, el día de pago). Máximo 28 para existir en todos los meses.
    dia_inicio_mes      integer      NOT NULL DEFAULT 1,
    -- RF-NOT-03: recordatorio diario para registrar gastos.
    recordatorio_activo boolean      NOT NULL DEFAULT false,
    recordatorio_hora   time         NOT NULL DEFAULT '20:00',

    CONSTRAINT pk_configuracion PRIMARY KEY (id),
    CONSTRAINT ck_configuracion_unica CHECK (id = 1),
    CONSTRAINT ck_configuracion_moneda CHECK (moneda ~ '^[A-Z]{3}$'),
    CONSTRAINT ck_configuracion_dia CHECK (dia_inicio_mes BETWEEN 1 AND 28)
);

INSERT INTO configuracion (id) VALUES (1) ON CONFLICT DO NOTHING;
