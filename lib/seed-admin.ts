/**
 * Seed: crear usuario admin
 *
 * NO ejecutar este archivo directamente — solo sirve como referencia.
 *
 * OPCIÓN RECOMENDADA (más simple):
 * ─────────────────────────────────
 * 1. Registrarse normalmente en /auth/registro/cliente con el email del admin
 * 2. Ir al dashboard de Supabase → Authentication → Users
 * 3. Copiar el UUID del usuario recién creado
 * 4. Ir a SQL Editor y ejecutar:
 *
 *    UPDATE public.profiles SET role = 'admin' WHERE id = 'PEGAR-UUID-AQUÍ';
 *
 * ─────────────────────────────────
 * Listo. Cerrar sesión y volver a loguearse para que el rol se aplique.
 * El middleware redirigirá automáticamente al panel /admin.
 */

export {}
