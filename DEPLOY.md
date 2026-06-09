# Deploy de BUSCO en Vercel

## Pre-requisitos
- Proyecto en GitHub (público o privado)
- Cuenta en [vercel.com](https://vercel.com)
- Proyecto de Supabase configurado con todos los schemas ejecutados

## Pasos

### 1. Subir el código a GitHub

```bash
git init
git add .
git commit -m "Initial commit — BUSCO v1"
git remote add origin https://github.com/TU-USUARIO/busco.git
git push -u origin main
```

### 2. Conectar a Vercel

1. Ir a [vercel.com/new](https://vercel.com/new)
2. "Import Git Repository" → seleccionar el repo de BUSCO
3. Framework: **Next.js** (detectado automáticamente)
4. Root directory: `busco` (si el repo tiene la carpeta raíz `busco/`)
5. No tocar Build Settings — Vercel detecta Next.js solo

### 3. Variables de entorno en Vercel

En **Settings → Environment Variables** del proyecto en Vercel, agregar:

| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_...` |

⚠️ Nunca pushear `.env.local` al repo. Está en `.gitignore`.

### 4. Primer deploy

Vercel hace el deploy automáticamente al conectar el repo.
Verificar que la URL `https://busco-xxx.vercel.app` carga correctamente.

### 5. Dominio personalizado

1. Comprar dominio en [Porkbun](https://porkbun.com), [Namecheap](https://namecheap.com) o [NIC.ar](https://nic.ar) (para `.com.ar`)
2. En Vercel → **Settings → Domains** → agregar el dominio
3. Vercel muestra los DNS records a configurar (generalmente un CNAME o A record)
4. Configurar esos records en el panel del registrar del dominio
5. Esperar propagación DNS (5-60 minutos)
6. Vercel activa HTTPS automáticamente vía Let's Encrypt

### 6. Supabase — URL permitidas

En el dashboard de Supabase → **Authentication → URL Configuration**:
- Site URL: `https://tu-dominio.com`
- Redirect URLs: agregar `https://tu-dominio.com/**`

### 7. Verificación final

- [ ] La landing carga en mobile (375px)
- [ ] Login y registro funcionan
- [ ] El botón WhatsApp abre la app en mobile
- [ ] Las rutas protegidas redirigen si no hay sesión
- [ ] HTTPS activo en el dominio personalizado

## Re-deploy

Cada push a `main` hace un deploy automático en Vercel.
Para hacer rollback: Vercel → **Deployments** → seleccionar deploy anterior → "Redeploy".

## Variables de entorno adicionales (futuras fases)

Para pagos con MercadoPago agregar:
- `MERCADOPAGO_ACCESS_TOKEN`
- `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`
