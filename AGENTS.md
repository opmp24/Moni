# Wally — Guía para el Agente

## Importante: Siempre responder en español neutro. El usuario habla español, todas las respuestas deben ser en español.
1. verificar si Supabase CLI esta instalado para hacer cambios en la BBDD
2. revisar la carpeta docs y el archivo credenciales.md  y advertir si cambian
3. respuesas cortas sin adulaciones.


## Stack
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **UI**: shadcn/ui (Radix primitives) + Phosphor Icons + Lucide React
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Edge Functions)
- **PWA**: vite-plugin-pwa
- **Despliegue**: Netlify (auto-deploy desde `main`)
- **Bots**: Telegram (@WallyBot) + Gemini AI


## Comandos
- `npm run dev` — servidor local
- `npm run build` — typecheck + build
- `npm run lint` — ESLint
- `npm run preview` — preview build local
- `npm test` — ejecutar tests unitarios (Vitest)
- `npm run test:watch` — tests en modo watch


## Testing (Vitest)
- Framework: **Vitest** + **React Testing Library** + **jsdom**
- Configuración en `vite.config.ts` (sección `test`)
- Setup global en `src/test/setup.ts`
- Convención: tests junto al componente con sufijo `.test.tsx`
- Después de cada implementación o cambio significativo, ejecutar:
  1. `npm run build` — verifica typecheck + build
  2. `npm test` — verifica que tests existentes no fallen
  3. Si se agregó lógica nueva, escribir tests que la cubran

## Proyecto: Personal Finance PWA

### Repos
- GitHub: `github.com/opmp24/Moni`
- Rama `main` → Netlify auto-deploy
- Rama `development` → trabajo activo
- URL: `wally.netlify.app`

### Supabase
- Proyecto: `yfdwtfricvquakrtarey`
- Tablas con Realtime: `gastos`, `presupuestos`, `categorias`, `ingresos`
- Auth: Google OAuth habilitado (Client ID: `351795914656-cepr4dv8rahikbkfpq9rmivad3ef63v2.apps.googleusercontent.com`)
- Auth config: `site_url = http://localhost:5173`, `uri_allow_list` incluye `localhost` y `wally.netlify.app`
- Edge Function: `telegram-webhook` (URL: `/functions/v1/telegram-webhook`)

### Telegram
- Bot: `@WallyBot`
- Token y GEMINI_API_KEY en secrets de Edge Function
- Función: el usuario envía mensajes tipo "gasté 500 en comida" → Gemini parsea → inserta en DB

### Estructura de tablas
- `gastos` — id, user_id, monto, categoria, descripcion, fecha, created_at
- `ingresos` — id, user_id, monto, categoria, descripcion, fecha, created_at
- `presupuestos` — id, user_id, categoria, monto, created_at
- `categorias` — id, user_id, nombre, icono, color, created_at

### Convenios de código
- `Categoria` es tipo `string` (no enum). Categorías predefinidas en `CATEGORIAS_PREDEFINIDAS`, categorías custom en tabla `categorias`
- Hook `useCategorias()` expone: `categorias`, `addCategoria`, `updateCategoria`, `deleteCategoria`, `getIcon`, `getColor`, `loading`
- Los hooks `useGastos`, `useIngresos`, `usePresupuestos` exponen `refetch()`
- Realtime channels usan `useId()` para nombres únicos (evita "cannot add postgres_changes callbacks")
- Diálogos con formularios usan prop `onSaved` para refetch post-guardado

### Features implementados
- CRUD gastos/ingresos/presupuestos con Realtime
- Categorías custom (24 iconos Phosphor, 12 colores)
- Protección 3 niveles al borrar categoría: check gastos → presupuesto > 0 bloquea → presupuesto = 0 auto-borra
- Dashboard con DonutChart, BudgetProgress, BarChart mensual
- SettingsPopup con: Presupuesto, Categorías, Gasto, Ingreso + Cerrar sesión
- Google OAuth login
- PWA instalable
- Telegram bot con IA (Gemini) para registrar gastos

