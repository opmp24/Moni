# Design System Strategy: High-End Home Management

## 1. Overview & Creative North Star
**Creative North Star: "The Ethereal Ledger"**

This design system moves away from the clinical, spreadsheet-like nature of traditional finance apps. Instead, it adopts a "High-End Editorial" aesthetic—combining the depth of a premium dark-mode interface with the intentionality of a luxury digital magazine. 

We break the "template" look by utilizing extreme corner radii (`rounded-xl: 24px+`), aggressive typographic scaling, and a depth model based on **Tonal Layering** rather than structural borders. The interface should feel like stacked sheets of obsidian and smoked glass, where importance is signaled through luminance and color "soul" rather than heavy lines.

---

## 2. Colors: Depth through Luminance

The palette is rooted in a deep, nocturnal foundation (`#131315`), energized by high-chroma accents.

### Core Palette
- **Primary (Violet Aura):** `#7C4DFF` (Accent) / `#cdbdff` (Text/Icon). Use for primary actions and brand presence.
- **Secondary (Emerald Success):** `#00C853`. Used exclusively for positive cash flow, paid status, and budget safety.
- **Tertiary (Coral Alert):** `#ffb3ae`. Used for expenses, over-budget warnings, and critical debt.
- **Surface Foundation:** `#131315`. The absolute floor of the application.

### The "No-Line" Rule
**Prohibit 1px solid borders for sectioning.** Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` card sitting on a `surface` background creates a natural edge. High-contrast lines are replaced by:
- **Tonal Transitions:** Shifting from `surface-container` to `surface-bright`.
- **Soft Glows:** Using the `surface_tint` to create a 2px inner-shadow effect on cards.

### Glass & Gradient Rule
To achieve a "bespoke" feel, floating elements (like the Bottom Navigation or FAB) must use **Glassmorphism**:
- **Background:** `surface-container` at 70% opacity.
- **Effect:** `backdrop-blur: 20px`.
- **CTA Gradients:** Main buttons should transition from `primary` (`#cdbdff`) to `primary-container` (`#7C4DFF`) at a 135° angle to provide tactile volume.

---

## 3. Typography: Editorial Authority

We use two distinct typefaces to separate "Content" from "Data."

- **Display & Headlines (Plus Jakarta Sans):** A high-personality sans-serif with a modern geometric touch. Use `display-lg` (3.5rem) for main account balances to create a bold, "statement" feel.
- **Body & Labels (Manrope):** Chosen for its exceptional readability at small sizes. Manrope’s semi-condensed nature allows for dense financial data to feel airy.

**Hierarchy Strategy:**
- **The Power Balance:** Always pair a `display-sm` balance with a `label-sm` (uppercase, letter-spaced) descriptor. This contrast conveys authority and professional polish.

---

## 4. Elevation & Depth: The Layering Principle

Instead of traditional Material shadows, we use **Tonal Stacking** to create a physical sense of hierarchy.

1.  **Level 0 (The Floor):** `surface` (`#131315`).
2.  **Level 1 (Sectioning):** `surface-container-low`. Used for grouping large content areas.
3.  **Level 2 (The Card):** `surface-container`. This is where most interaction happens.
4.  **Level 3 (The Floating Detail):** `surface-container-highest`. Reserved for active states or modals.

### Ambient Shadows
When a "Floating" effect is required (e.g., the primary expense card):
- **Blur:** 40px - 60px.
- **Opacity:** 6% - 10%.
- **Tint:** Use a shadow color derived from the `primary` token rather than black. This mimics how light behaves on dark surfaces, creating a "glow" rather than a "stain."

### The "Ghost Border" Fallback
If accessibility demands a container edge, use a **Ghost Border**:
- **Token:** `outline-variant` (`#494455`).
- **Opacity:** 15% Max.
- **Weight:** 1.5px (aligned to the inside).

---

## 5. Components

### Cards (The Foundation)
- **Rules:** No dividers. Use `spacing-6` (1.5rem) to separate content sections within a card.
- **Visual Depth:** Apply a subtle linear gradient (Top-Left to Bottom-Right) from `surface-container` to `surface-container-low`.
- **Corner Radius:** Always `rounded-xl` (2rem / 32px) for main containers to match the PWA’s modern mobile-first identity.

### Buttons & CTAs
- **Primary:** Gradient-fill (`primary` to `primary-container`) with `on-primary` text.
- **Secondary/Ghost:** `surface-bright` background with 10% `outline` border.
- **Success State:** Specifically for "Pagado" (Paid) actions, use a solid `secondary-container` (`#02c953`) with a soft emerald outer glow.

### Input Fields
- **Design:** Forgo the "boxed" look. Use a `surface-container-lowest` background with a `rounded-md` (1.5rem) shape.
- **Active State:** On focus, the background remains static, but a 2px "aura" of `primary` (`#7C4DFF`) appears as an inner shadow.

### Signature Component: The "Progress Aura"
For budget tracking (as seen in the reference images), use thick, rounded progress bars.
- **Background:** `surface-container-highest`.
- **Fill:** `primary` or `secondary` based on status.
- **Detail:** Add a `primary_fixed` glow at the leading edge of the progress bar to simulate "energy" moving through the budget.

---

## 6. Do's and Don'ts

### Do:
- **Do** use `rounded-full` for small chips and action buttons to contrast against the `rounded-xl` cards.
- **Do** use generous whitespace. Financial data needs "room to breathe" to prevent user anxiety.
- **Do** use `surface_bright` to highlight the most important interactive element on a screen.

### Don't:
- **Don't** use pure `#000000` or pure `#FFFFFF`. Stick to the `surface` and `on-surface` scales for a premium, non-vibrating dark mode.
- **Don't** use 1px dividers. If you must separate items in a list, use a 5% opacity `outline-variant` line that fades out at the edges.
- **Don't** mix corner radii. Keep the "pronounced" look consistent—if a card is 32px, the internal buttons should be at least 16px.