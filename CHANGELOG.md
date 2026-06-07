# Changelog — PerJaus

## [Próximo] — 2026-06-06

### 🚀 Alto impacto

- **Búsqueda y filtros** — búsqueda por concepto, filtro por monto mínimo/máximo en listas de gastos e ingresos
- **Exportación CSV** — botón para descargar gastos/ingresos filtrados en formato CSV
- **Transacciones recurrentes** — checkbox "Repetir mensualmente" al crear gasto/ingreso, auto-duplicado al cargar el Dashboard, indicador visual 🔄 en items recurrentes
- **Alertas de presupuesto** — icono ⚠️ amarillo al 80% y rojo al 100% en BudgetProgress, notificación automática por Telegram al superar estos umbrales

### 🎨 UI/UX

- **Footer moderno** — footer completo para Landing y Dashboard con stats en vivo, enlaces y branding
- **Marquee en vivo** — barra con scroll infinito mostrando el último gasto registrado
- **Avatar con fallback** — imagen de Google + inicial como placeholder si no carga
- **Header responsivo** — avatar y nombre en fila propia en móviles, sin superposición con botones
- **Brillo hover amarillo** — todas las cards del Dashboard brillan con sombra amarilla al pasar el mouse
- **Animaciones GSAP** — entrada escalonada con stagger en las cards del Dashboard
- **WeekChart** — minigráfica semanal en la card de Transacciones
- **Google avatar y nombre** — foto de perfil y nombre completo desde Google en el header

### 🤖 Telegram

- **Categorías dinámicas** — el webhook ya no usa categorías hardcodeadas, busca las del usuario en DB
- **Prompt Gemini mejorado** — incluye categorías disponibles, soporta múltiples items en un mensaje

### 🔧 Técnico

- **Tema claro/oscuro** — ThemeProvider con `useTheme()` hook, toggle en SettingsPopup con 3 modos: claro/oscuro/sistema, persiste en localStorage, detecta `prefers-color-scheme`
- **Refactor semántico de clases** — todos los componentes migrados de colores hardcodeados (`bg-zinc-950`, `text-zinc-100`, `border-zinc-800`) a variables CSS semánticas (`bg-background`, `text-foreground`, `border-border`)
- `useCategorias().getColor()` reemplaza `CATEGORIA_COLORS` directo en DonutChart y BudgetProgress
- Canales Realtime con `useId()` para evitar colisiones de nombre
- Iconos Netlify y Supabase en el footer

---

## [Anterior] — 2026-06-04

- CRUD gastos/ingresos/presupuestos con Realtime
- Categorías custom (24 iconos Phosphor, 12 colores)
- Protección 3 niveles al borrar categoría
- Dashboard con DonutChart, BudgetProgress, BarChart mensual
- SettingsPopup con Presupuesto, Categorías, Gasto, Ingreso + Cerrar sesión
- Google OAuth login
- PWA instalable
- Telegram bot con IA (Gemini) para registrar gastos
- Editar categoría de gasto inline desde ExpenseList
- Gráfica donut en landing con datos reales
