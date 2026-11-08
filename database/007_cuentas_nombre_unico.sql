-- El nombre de una cuenta es único (sin distinguir mayúsculas).
CREATE UNIQUE INDEX IF NOT EXISTS ux_cuentas_nombre ON cuentas (lower(nombre));
