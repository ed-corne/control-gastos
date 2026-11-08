# Base de datos (Database First)

El esquema vive en los scripts SQL de esta carpeta. La API **no** crea ni migra la base:
primero se cambia el SQL y después se regeneran los modelos de EF Core.

## Preparar la base

1. Crear la base `control_gastos` en PostgreSQL.
2. Ejecutar los scripts en orden:

```
psql -h localhost -p 5433 -U postgres -d control_gastos -f database/001_cuentas.sql
```

## Regenerar los modelos tras cambiar el esquema

Desde `backend/src`:

```
dotnet ef dbcontext scaffold "<cadena de conexión>" Npgsql.EntityFrameworkCore.PostgreSQL ^
  -p ControlGastos.Infrastructure -s ControlGastos.Api ^
  --context AppDbContext --context-dir Persistence ^
  --output-dir Persistence/Entities --no-onconfiguring --force
```

Los modelos generados (`Persistence/Entities`) no se editan a mano. Los repositorios los
convierten a las entidades de `ControlGastos.Domain`.

## Convenciones

- Tablas y columnas en `snake_case`, tablas en plural.
- Los scripts se numeran (`001_`, `002_`, …) y no se modifican una vez aplicados: se agrega uno nuevo.

## Cambios posteriores

- `007_cuentas_nombre_unico.sql`: el nombre de cuenta es único (sin distinguir mayúsculas).
- `008_categorias_comentario.sql`: columna `comentario` en categorías.
