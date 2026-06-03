# CONTEXTO Y ROL
Actúa como un Arquitecto de Software Principal y Desarrollador Full-Stack experto en arquitecturas Serverless. Diseña un sistema de gestión de finanzas personales tipo PWA (Progressive Web App) optimizado para rendimiento y legibilidad de código.

El sistema consta de:
1. Una UI moderna (PWA con React, Vite, Tailwind CSS, TypeScript y lucide-react para iconos).
2. Un bot de Telegram que actúa como interfaz de captura rápida mediante lenguaje natural.
3. Una capa lógica y de datos unificada en Supabase (Edge Functions en TypeScript + Base de Datos PostgreSQL) que integra IA para procesar los mensajes.

Genera el código estructurado, elegante, modular y siguiendo las mejores prácticas de la industria.

---

# ESPECIFICACIONES TÉCNICAS

## 1. CAPA DE DATOS (Supabase / PostgreSQL)
Genera el script SQL para la base de datos incluyendo:
- Tabla `gastos` con los campos: `id` (uuid), `monto` (numeric), `concepto` (text), `categoria` (text), `fecha` (timestamptz), `telegram_chat_id` (text), y `created_at`.
- Habilitación de Row Level Security (RLS) básico.
- Índices óptimos para consultas por `fecha` y `categoria`.

## 2. CAPA DE LÓGICA E IA (Supabase Edge Function)
Genera una Edge Function en TypeScript (`telegram-webhook`) que actúe como el endpoint POST para el bot de Telegram. Debe realizar lo siguiente:
- Parsear el JSON entrante de Telegram para obtener el `chat.id` y el `text` del mensaje.
- Hacer una llamada HTTP POST a la API de Google AI Studio (Gemini 1.5 Flash) usando "Structured Outputs" (`response_mime_type: "application/json"`).
- El prompt del sistema para Gemini debe obligarlo a extraer: `monto` (int), `concepto` (string, capitalizado), y `categoria` (string, mapeado estrictamente a un set cerrado: 'Alimentación', 'Transporte', 'Vivienda', 'Salud', 'Entretenimiento', 'Otros').
- Insertar el JSON resultante de forma directa en la tabla `gastos` usando el cliente nativo de Supabase.
- Hacer un fetch a la API de Telegram (`sendMessage`) para responder al usuario con un mensaje elegante confirmando el registro (ej: "✅ *Gasto registrado:* Helados por $3.000 en la categoría *Entretenimiento*."). Manejar errores con un mensaje de fallback si la IA no logra parsear el texto.

## 3. INTERFAZ WEB (React + Vite + Tailwind + TypeScript)
Genera los siguientes componentes clave con un diseño limpio, asimétrico, minimalista refinado y estrictamente estructurado:

### A. Dashboard General (Vista Principal)
- Un componente de Dashboard que muestre kpis rápidos: Total del mes, categoría con mayor gasto, y número de transacciones.
- Un gráfico visual básico utilizando componentes HTML/Tailwind puros (o SVG dinámicos) que represente la distribución por categorías (evita dependencias masivas si es posible, prioriza código limpio).

### B. Listado de Gastos
- Una tabla o lista de diseño avanzado con paginación, ordenada cronológicamente por `fecha`.
- Badges estilizados con Tailwind para diferenciar visualmente las categorías.
- Filtros rápidos por rango de fechas y categorías.

### C. Configuración PWA
- Configuración básica del archivo `manifest.json` y del Service Worker (`vite-plugin-pwa`) para que la aplicación sea instalable en dispositivos móviles con soporte offline para la lectura del historial.

---

# REQUISITOS DE RESPUESTA
- Entrega el código modular bien separado por archivos (`supabase/functions/...`, `src/components/...`, `database.sql`).
- No te adelantes con explicaciones extensas sobre qué es una PWA o cómo funciona Telegram; enfócate en entregar el código estructurado, limpio, con tipado fuerte en TypeScript y listo para producción.