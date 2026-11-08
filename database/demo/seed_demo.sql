-- Datos de ejemplo (no forman parte del esquema). Todo lo insertado lleva fecha_creacion = 2000-01-01
-- para poder borrarlo con quitar_demo.sql sin tocar tus datos reales.
-- Usa tus cuentas Nu, MercadoPago, Nu Credito y Efectivo, y las categorías predeterminadas.
-- Uso: psql -h localhost -p 5433 -U postgres -d control_gastos -f database/demo/seed_demo.sql

DO $$
DECLARE
    marca  constant timestamptz := '2000-01-01 00:00:00+00';
    hoy    date := current_date;
    nu     uuid := (SELECT id FROM cuentas WHERE nombre = 'Nu');
    mp     uuid := (SELECT id FROM cuentas WHERE nombre = 'MercadoPago');
    tc     uuid := (SELECT id FROM cuentas WHERE nombre = 'Nu Credito');
    efe    uuid := (SELECT id FROM cuentas WHERE nombre = 'Efectivo');
    c_com  uuid := (SELECT id FROM categorias WHERE nombre = 'Comida' AND tipo = 'Gasto');
    c_tra  uuid := (SELECT id FROM categorias WHERE nombre = 'Transporte' AND tipo = 'Gasto');
    c_viv  uuid := (SELECT id FROM categorias WHERE nombre = 'Vivienda' AND tipo = 'Gasto');
    c_ser  uuid := (SELECT id FROM categorias WHERE nombre = 'Servicios' AND tipo = 'Gasto');
    c_sal  uuid := (SELECT id FROM categorias WHERE nombre = 'Salud' AND tipo = 'Gasto');
    c_ent  uuid := (SELECT id FROM categorias WHERE nombre = 'Entretenimiento' AND tipo = 'Gasto');
    c_rop  uuid := (SELECT id FROM categorias WHERE nombre = 'Ropa' AND tipo = 'Gasto');
    c_edu  uuid := (SELECT id FROM categorias WHERE nombre = 'Educación' AND tipo = 'Gasto');
    i_sue  uuid := (SELECT id FROM categorias WHERE nombre = 'Sueldo' AND tipo = 'Ingreso');
    i_fre  uuid := (SELECT id FROM categorias WHERE nombre = 'Freelance' AND tipo = 'Ingreso');
    comidas text[] := ARRAY['Tacos', 'Súper', 'Comida corrida', 'Café y pan', 'Pizza', 'Desayuno', 'Cena', 'Fruta y verdura'];
    gustos  text[] := ARRAY['Cine', 'Netflix', 'Spotify', 'Videojuego', 'Salida con amigos'];
    inicio  date;
    fin     date;
    d       date;
    n       int;
BEGIN
    IF nu IS NULL OR mp IS NULL OR tc IS NULL OR efe IS NULL THEN
        RAISE EXCEPTION 'Faltan cuentas: se esperan Nu, MercadoPago, Nu Credito y Efectivo';
    END IF;

    PERFORM setseed(0.42);

    FOR n IN 0..5 LOOP
        inicio := (date_trunc('month', hoy) - make_interval(months => 5 - n))::date;
        fin    := LEAST((inicio + interval '1 month - 1 day')::date, hoy);

        -- Ingresos
        IF inicio <= fin THEN
            INSERT INTO movimientos (tipo, monto, fecha, descripcion, cuenta_id, categoria_id, fecha_creacion)
            VALUES ('Ingreso', 9000, inicio, 'Quincena', nu, i_sue, marca);
        END IF;
        IF inicio + 14 <= fin THEN
            INSERT INTO movimientos (tipo, monto, fecha, descripcion, cuenta_id, categoria_id, fecha_creacion)
            VALUES ('Ingreso', 9000, inicio + 14, 'Quincena', nu, i_sue, marca);
        END IF;
        IF n % 2 = 0 AND inicio + 19 <= fin THEN
            INSERT INTO movimientos (tipo, monto, fecha, descripcion, cuenta_id, categoria_id, fecha_creacion)
            VALUES ('Ingreso', round((2000 + random() * 3000)::numeric, 2), inicio + 19, 'Proyecto freelance', mp, i_fre, marca);
        END IF;

        -- Gastos fijos
        IF inicio + 2 <= fin THEN
            INSERT INTO movimientos (tipo, monto, fecha, descripcion, cuenta_id, categoria_id, fecha_creacion)
            VALUES ('Gasto', 5500, inicio + 2, 'Renta', nu, c_viv, marca);
        END IF;
        IF inicio + 6 <= fin THEN
            INSERT INTO movimientos (tipo, monto, fecha, descripcion, cuenta_id, categoria_id, fecha_creacion)
            VALUES ('Gasto', round((450 + random() * 350)::numeric, 2), inicio + 6, 'Luz', nu, c_ser, marca);
        END IF;
        IF inicio + 9 <= fin THEN
            INSERT INTO movimientos (tipo, monto, fecha, descripcion, cuenta_id, categoria_id, fecha_creacion)
            VALUES ('Gasto', 499, inicio + 9, 'Internet', tc, c_ser, marca);
        END IF;
        IF inicio + 11 <= fin THEN
            INSERT INTO movimientos (tipo, monto, fecha, descripcion, cuenta_id, categoria_id, fecha_creacion)
            VALUES ('Gasto', 600, inicio + 11, 'Curso en línea', nu, c_edu, marca);
        END IF;

        -- Gastos variables, día por día
        FOR d IN SELECT generate_series(inicio, fin, interval '1 day')::date LOOP
            IF random() < 0.7 THEN
                INSERT INTO movimientos (tipo, monto, fecha, descripcion, cuenta_id, categoria_id, fecha_creacion)
                VALUES ('Gasto', round((60 + random() * 290)::numeric, 2), d,
                        comidas[1 + floor(random() * array_length(comidas, 1))::int],
                        (ARRAY[nu, tc, efe])[1 + floor(random() * 3)::int], c_com, marca);
            END IF;
            IF random() < 0.35 THEN
                INSERT INTO movimientos (tipo, monto, fecha, descripcion, cuenta_id, categoria_id, fecha_creacion)
                VALUES ('Gasto', round((30 + random() * 190)::numeric, 2), d,
                        (ARRAY['Uber', 'Gasolina', 'Camión', 'Metro'])[1 + floor(random() * 4)::int],
                        (ARRAY[efe, nu])[1 + floor(random() * 2)::int], c_tra, marca);
            END IF;
            IF random() < 0.1 THEN
                INSERT INTO movimientos (tipo, monto, fecha, descripcion, cuenta_id, categoria_id, fecha_creacion)
                VALUES ('Gasto', round((150 + random() * 450)::numeric, 2), d,
                        gustos[1 + floor(random() * array_length(gustos, 1))::int], tc, c_ent, marca);
            END IF;
            IF random() < 0.03 THEN
                INSERT INTO movimientos (tipo, monto, fecha, descripcion, cuenta_id, categoria_id, fecha_creacion)
                VALUES ('Gasto', round((400 + random() * 1100)::numeric, 2), d, 'Ropa', tc, c_rop, marca);
            END IF;
            IF random() < 0.04 THEN
                INSERT INTO movimientos (tipo, monto, fecha, descripcion, cuenta_id, categoria_id, fecha_creacion)
                VALUES ('Gasto', round((250 + random() * 650)::numeric, 2), d,
                        (ARRAY['Farmacia', 'Consulta médica', 'Dentista'])[1 + floor(random() * 3)::int], nu, c_sal, marca);
            END IF;
        END LOOP;

        -- Pago de la tarjeta de crédito
        IF inicio + 24 <= fin THEN
            INSERT INTO movimientos (tipo, monto, fecha, descripcion, cuenta_id, cuenta_destino_id, fecha_creacion)
            VALUES ('Transferencia', 1500, inicio + 24, 'Pago de tarjeta', nu, tc, marca);
        END IF;

        -- Presupuestos de cada mes (si ya existe uno de tus datos reales no se toca)
        INSERT INTO presupuestos (categoria_id, anio, mes, monto, fecha_creacion) VALUES
            (c_com, extract(year FROM inicio)::int, extract(month FROM inicio)::int, 4000, marca),
            (c_tra, extract(year FROM inicio)::int, extract(month FROM inicio)::int, 1500, marca),
            (c_ent, extract(year FROM inicio)::int, extract(month FROM inicio)::int, 1200, marca)
        ON CONFLICT DO NOTHING;
    END LOOP;

    -- Metas de ahorro con aportes
    WITH m1 AS (
        INSERT INTO metas (nombre, monto_objetivo, fecha_limite, icono, color, fecha_creacion)
        VALUES ('Vacaciones', 20000, (hoy + interval '8 months')::date, 'travel', '#0ea5e9', marca)
        RETURNING id
    ), m2 AS (
        INSERT INTO metas (nombre, monto_objetivo, fecha_limite, icono, color, fecha_creacion)
        VALUES ('Laptop nueva', 25000, (hoy + interval '5 months')::date, 'freelance', '#8b5cf6', marca)
        RETURNING id
    )
    INSERT INTO meta_operaciones (meta_id, tipo, monto, fecha, nota, fecha_creacion)
    SELECT id, 'Aportacion', 2500, hoy - 60, 'Primer aporte', marca FROM m1
    UNION ALL SELECT id, 'Aportacion', 1500, hoy - 30, NULL, marca FROM m1
    UNION ALL SELECT id, 'Aportacion', 1000, hoy - 7, 'Ahorro de la quincena', marca FROM m1
    UNION ALL SELECT id, 'Aportacion', 3000, hoy - 45, NULL, marca FROM m2
    UNION ALL SELECT id, 'Aportacion', 2000, hoy - 15, 'Bono', marca FROM m2;
END $$;
