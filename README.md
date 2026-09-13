# Dupla — finanzas en pareja

App web para llevar las finanzas de a dos (Gonzalo y Luciana): gastos e
ingresos, presupuestos, gastos compartidos y saldos, reportes, cuentas de
ahorro con interés diario estimado, pagos fijos, una meta de ahorro con
calculadora de crédito, y una bandeja de gastos detectados desde el correo
del banco.

## Estructura

- **`mockup/`** — el diseño visual (Claude Design canvas) usado para acordar cada pantalla antes de programar.
- **`app/`** — la aplicación real: React + Vite + TypeScript + Tailwind CSS.
- **`supabase/schema.sql`** — el esquema de base de datos (Postgres) para Supabase, con seguridad por fila (RLS) para que cada hogar solo vea sus propios datos.

## Cómo correr la app

```bash
cd app
npm install
npm run dev
```

Se abre en `http://localhost:5173`. **Por ahora corre en modo demo**, con
datos de ejemplo en memoria (ver `src/data/mock.ts` y `src/state/DataContext.tsx`)
— no hay backend conectado todavía, así que los cambios no se guardan al
recargar la página.

## Conectar la base de datos real (Supabase)

1. Crea una cuenta gratis en [supabase.com](https://supabase.com) y un proyecto nuevo.
2. En el proyecto, ve a **SQL Editor** → **New query**, pega el contenido de `supabase/schema.sql` y ejecútalo.
3. En **Project Settings → API**, copia la **Project URL** y la **anon public key**.
4. Dentro de `app/`, copia `.env.example` a `.env.local` y pega esos dos valores.
5. Reinicia `npm run dev` — la app dejará de estar en modo demo.

(Este paso todavía no está hecho — el código ya está preparado para usarlo,
pero las páginas siguen leyendo los datos de ejemplo mientras terminamos de
conectar cada pantalla a Supabase.)

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 (tokens de diseño en `src/index.css`)
- React Router
- Recharts (gráficos de Reportes)
- Supabase (Postgres + Auth), pendiente de conectar
