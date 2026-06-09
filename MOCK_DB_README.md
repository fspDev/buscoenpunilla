# Mock Database — Instrucciones de uso

## ¿Qué es?

Una capa de abstracción (`lib/db/`) que permite cambiar entre **Mock Data** (datos fake en memoria) y **Supabase** (BD real) sin tocar el código de la app.

## Estructura

```
lib/db/
├─ types.ts              → Tipos compartidos (Usuario, Prestador, Resena, etc.)
├─ repository.ts         → Interfaz que define qué métodos debe tener cualquier BD
├─ mock-repository.ts    → Implementación fake (datos en memoria)
├─ supabase-repository.ts → (próximamente) Implementación real con Supabase
└─ index.ts              → Factory que elige cuál usar (toggle con variable)
```

## Cómo usar el Mock DB (ahora)

**Está activado por defecto.** Solo ejecutá:

```bash
npm run dev
```

Y accedé a `localhost:3001` (o el puerto libre).

### Credenciales de prueba

**Cliente:**
- Email: `franco@gmail.com`
- Contraseña: `password123`

**Admin:**
- Email: `admin@busco.com`
- Contraseña: `admin123`

### Datos de prueba

- **5 prestadores** con fotos, reseñas y ratings
- **3 reseñas** con respuestas
- **2 usuarios** (cliente + admin)

Todos están hardcodeados en `lib/db/mock-repository.ts`.

## Cómo cambiar a Supabase (después)

### Paso 1 — Crear `lib/db/supabase-repository.ts`

Copia esta estructura (la implantación real depende de tu código Supabase):

```typescript
import { createClient } from '@/lib/supabase/server'
import type { IDatabase } from './repository'
import type { Usuario, Prestador, Resena, FotoTrabajo, BusquedaPrestadores } from './types'

export class SupabaseDatabase implements IDatabase {
  private supabase = createClient()

  async loginUsuario(email: string, password: string): Promise<{ usuario: Usuario; token: string } | null> {
    // Implementar con supabase.auth.signInWithPassword()
  }

  async registroCliente(...): Promise<Usuario | null> {
    // Implementar con supabase.auth.signUp()
  }

  // ... resto de métodos ...
}
```

### Paso 2 — Cambiar el toggle en `lib/db/index.ts`

```typescript
const USE_MOCK = false  // ← Cambiar de true a false
```

### Paso 3 — Descomentear el import en `lib/db/index.ts`

```typescript
import { SupabaseDatabase } from './supabase-repository'

let db: IDatabase | null = null

export function getDatabase(): IDatabase {
  if (!db) {
    if (USE_MOCK) {
      db = new MockDatabase()
    } else {
      db = new SupabaseDatabase()  // ← Esto se activa
    }
  }
  return db
}
```

### Paso 4 — Listo

**Toda la app usa Supabase sin cambiar nada más.** El login, registro, búsqueda, creación de reseñas — todo va a Supabase automáticamente.

## Ventajas

1. **Desarrollo sin Supabase** — Pruebas rápidas sin rate limits, sin problemas de config
2. **Fácil de switchear** — Una línea de código (el toggle en index.ts)
3. **Código desacoplado** — El login no sabe si usa mock o Supabase
4. **Migracion limpia** — Cuando implementes SupabaseDatabase, el resto de la app no cambia

## Checklists

### Para usar Mock DB:
- ✅ Correr `npm run dev`
- ✅ Usar credenciales: `franco@gmail.com` / `password123` (cliente) o `admin@busco.com` / `admin123` (admin)
- ✅ Probar todos los flujos (login, registro, búsqueda, reseñas, etc.)

### Para migrar a Supabase:
- ⬜ Crear `lib/db/supabase-repository.ts` con todos los métodos de IDatabase
- ⬜ Cambiar `USE_MOCK = false` en `lib/db/index.ts`
- ⬜ Descomentear import de SupabaseDatabase
- ⬜ Ejecutar `npm run build` y verificar que compila
- ⬜ Probar en desarrollo contra Supabase real

## Notas

- **Datos no persistentes**: Todo está en memoria. Recargá la página = datos limpios.
- **Mock data**: Editalo en `lib/db/mock-repository.ts` si querés cambiar prestadores, reseñas, etc.
- **Sin validaciones de email**: En mock no hay confirmación de email, registros instantáneos.
- **Tokens fake**: Los tokens de sesión son strings mock (`mock-token-XXXXX`). En Supabase serán reales.
