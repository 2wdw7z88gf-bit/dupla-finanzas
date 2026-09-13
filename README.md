# Dupla — finanzas en pareja

App web para llevar las finanzas de a dos (Gonzalo y Luciana): gastos e
ingresos, presupuestos, gastos compartidos y saldos, reportes, cuentas de
ahorro con interés diario estimado, pagos fijos, una meta de ahorro con
calculadora de crédito, y una bandeja de gastos detectados desde el correo
del banco.

**En línea:** https://dupla-finanzas-jh4x.vercel.app (se actualiza solo con cada push a `main`).

## Estructura

- **`mockup/`** — el diseño visual (Claude Design canvas) usado para acordar cada pantalla antes de programar.
- **`app/`** — la aplicación real: React + Vite + TypeScript + Tailwind CSS.
- **`supabase/`** — el esquema de base de datos (Postgres) para Supabase y sus migraciones, con seguridad por fila (RLS) para que solo ustedes dos vean sus datos.

## Cómo correr la app localmente

```bash
cd app
npm install
npm run dev
```

Se abre en `http://localhost:5173`.

## Base de datos (Supabase)

Ya está conectada. Los archivos en `supabase/` se corren **en orden**, uno
por uno, en el **SQL Editor** de Supabase (New query → pegar → Run):

1. `schema.sql` — todas las tablas.
2. `002_bootstrap_household.sql` — función que crea el hogar la primera vez que alguien se registra, y une a la segunda persona al mismo hogar.
3. `003_harden_functions.sql` — cierra permisos de esas funciones (recomendación del Security Advisor de Supabase).
4. `004_recurring_instances_household.sql` — ajuste a la tabla de pagos fijos.
5. `005_enable_realtime.sql` — **importante**: sin esto, los cambios de uno no se ven en vivo en la pantalla del otro (hay que recargar la página).
6. `006_seed_categories.sql` — categorías de partida (Comida, Transporte, etc.). Se corre una sola vez.

Sin credenciales en `app/.env.local` (ver `.env.example`), la app corre en
**modo demo** con datos de ejemplo en memoria, útil para probar el diseño
sin backend.

## Estado actual / lo que falta

- ✅ Login y registro reales, cada hogar ve solo lo suyo.
- ✅ Movimientos, categorías, saldos, pagos fijos y "por confirmar" ya leen y escriben en Supabase, en vivo (Realtime) entre los dos.
- ⏳ **Presupuestos, cuentas de ahorro y metas todavía no tienen una pantalla para crearlos/editarlos** — hoy se ven vacíos hasta que carguemos algo manualmente en la tabla o construyamos esas pantallas (próximo paso).
- ⏳ La conexión con el correo del banco ("Por confirmar") es solo la interfaz; falta el parser de correos real.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 (tokens de diseño en `src/index.css`)
- React Router
- Recharts (gráficos de Reportes)
- Supabase (Postgres + Auth + Realtime)
- Vercel (hosting)
