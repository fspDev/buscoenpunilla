# SQL de BUSCO — guía de archivos

## Estado actual de producción

La base de producción (Supabase, proyecto `xcevffznzltkxymhzuiv`) tiene aplicado
hasta **`optimizacion-2026-06.sql`** inclusive (ejecutado el 10-jun-2026).

## Archivos en esta carpeta

| Archivo | Estado | Qué hace |
|---|---|---|
| `schema-completo.sql` | Base histórica | Tablas, vistas, RLS y trigger iniciales |
| `resenas-publicas.sql` | Aplicado | Reseñas sin cuenta (cliente_nombre/email + unique) |
| `migracion-periodo-prueba.sql` | Aplicado (incluido en schema-completo) | Default de 60 días gratis |
| `oficios-sistema.sql` | ⚠️ NO correr | Versión vieja: re-sembraría oficios con nombres viejos (Electricista vs Electricidad) |
| `migracion-propuestas.sql` | Superseded | Reemplazado por optimizacion-2026-06.sql |
| `optimizacion-2026-06.sql` | ✅ Aplicado 10-jun-2026 | Columnas de propuesta, notificaciones, limpieza total de RLS (23 políticas canónicas), 11 índices |

## Carpeta `supabase/` (raíz del proyecto)

Archivos históricos del desarrollo incremental (fase3–fase8, fixes).
**No correr ninguno**: todo lo vigente está consolidado acá.

## Reglas para futuras migraciones

1. Crear un archivo nuevo `migracion-<tema>-<fecha>.sql` en esta carpeta — nunca editar los aplicados.
2. Hacerlo idempotente (`IF NOT EXISTS`, `CREATE OR REPLACE`, `DROP POLICY IF EXISTS`).
3. Aplicarlo en Supabase Dashboard → SQL Editor (no hay CLI linkeado).
4. Actualizar la tabla de arriba con la fecha de aplicación.
5. Las políticas RLS usan `(SELECT auth.uid())` (no `auth.uid()` directo) para mejor plan de ejecución.
