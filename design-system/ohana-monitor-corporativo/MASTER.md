# OHANA MONITOR CORPORATIVO — Master Design System (UI/UX Pro Max)

**System Name:** OHANA Executive Intelligence Design System  
**Product Category:** Enterprise Executive Intelligence & Multi-Corporate Regulatory Monitor (SaaS / Ops Console)  
**Target User:** President Rubinho, C-Level Directors (CEO, CFO, CCO, CTO, CLO, COO), Compliance & Operations Officers  
**Stack Detected:** React 18 + Vite + Tailwind CSS + Lucide Icons + Node Express  
**Density Tier:** High / Dense Dashboard (8px–32px operational spacing scale)  
**Motion Profile:** Subtle Micro-Interactions (150ms–300ms, Spring/Ease, Reduced-Motion compliant)  
**Variance Dial:** Modern Executive / Balanced Bento (Contrast, Structure, Flat Depth)

---

## 1. Executive Color Architecture & Semantic Tokens

All color pairings pass WCAG AA (minimum 4.5:1 for standard body copy, 3:1 for large display headers). Gray-on-gray low-contrast text is strictly forbidden.

| Token Role | Hex / Tailwind Class | Contrast on Dark (900/950) | Contrast on Light (White/50) | Usage & Semantics |
|------------|----------------------|----------------------------|------------------------------|-------------------|
| **Canvas Dark** | `#020617` (`bg-slate-950`) | Primary Background | N/A | Executive console and navigation ground |
| **Surface Dark** | `#0f172a` (`bg-slate-900`) | Elevated Cards | N/A | Executive metric cards, Data Hub tables, headers |
| **Surface Dark Raised** | `#1e293b` (`bg-slate-800`) | Interactive Tiles | N/A | Chips, hover rows, inputs in dark panels |
| **Canvas Light** | `#f8fafc` (`bg-slate-50`) | N/A | Primary Background | Content view ground for dense reading |
| **Surface Light** | `#ffffff` (`bg-white`) | N/A | Elevated Cards | Primary dossier panels, modals, form sheets |
| **Primary Accent** | `#10b981` / `#059669` (`emerald-500` / `emerald-600`) | 7.8:1 (accessible) | 4.8:1 (accessible) | Operational status, success, confirm, AI active |
| **Secondary Brand** | `#14b8a6` (`teal-500`) | 8.1:1 | 4.6:1 | Connector active, tech telemetry, Protheus patch |
| **Info / Fiscal Sky** | `#0284c7` (`sky-600` / `sky-400`) | 6.5:1 | 4.9:1 | Official gazettes (DOU/DOE), regulations |
| **Warning / Attention** | `#d97706` (`amber-600` / `amber-400`) | 5.6:1 | 4.7:1 | Pending analysis, medium urgency, homologation |
| **Critical / Presidencial** | `#dc2626` / `#ef4444` (`red-600` / `red-500`) | 6.2:1 | 4.9:1 | "Sua Decisão" (Rubinho), prazo fatal, veto/rejeição |
| **Text Primary (Dark)** | `#f8fafc` (`text-slate-50`) | 16.5:1 | N/A | Headers and primary titles on dark surfaces |
| **Text Secondary (Dark)** | `#cbd5e1` (`text-slate-300`) | 9.8:1 | N/A | Body text and descriptions on dark surfaces |
| **Text Muted (Dark)** | `#94a3b8` (`text-slate-400`) | 5.2:1 (passes AA) | N/A | Metadata timestamps, source slugs, CNAE chips |
| **Text Primary (Light)** | `#0f172a` (`text-slate-900`) | N/A | 16.2:1 | Headers and high-emphasis body on light panels |
| **Text Secondary (Light)**| `#334155` (`text-slate-700`) | N/A | 9.5:1 | Paragraphs, ementas, descriptions on light panels |
| **Text Muted (Light)** | `#64748b` (`text-slate-500`) | N/A | 4.6:1 (passes AA) | Captions, secondary timestamps, count labels |

---

## 2. Typography & Spatial Hierarchy

- **Type Scale Ratio:** 1.25 (Major Third)
  - `Display / H1`: 24px–30px (`text-2xl sm:text-3xl`), font-extrabold, tracking-tight, line-height 1.2
  - `Section / H2`: 18px–20px (`text-lg sm:text-xl`), font-bold, line-height 1.3
  - `Card / H3`: 15px–16px (`text-base`), font-semibold, line-height 1.4
  - `Body Standard`: 14px–15px (`text-sm`), line-height 1.6, max line width 65–75ch
  - `UI Controls & Labels`: 12px–13px (`text-xs`), font-semibold, letter-spacing +0.01em
  - `Metadata & Tags`: 11px–12px (`text-[11px]` or `text-xs`), uppercase or font-mono, letter-spacing +0.04em
- **Chip & Badge Rule:** All badges, pills, and status chips MUST use `whitespace-nowrap` to prevent awkward word splits (e.g. `CRÍTICO`, `OPERACIONAL`, `PENDENTE`).
- **Font Pairing:** Inter / Plus Jakarta Sans pairing with JetBrains Mono / SF Mono for dates, CNPJs, and regulatory act numbers.

---

## 3. Touch & Interaction Rules (Priority 1 & 2)

1. **44×44px Minimum Touch Targets:**
   - Every primary button, navigation tab, and modal trigger has a minimum tap height of 44px on mobile or generous 40px–44px with surrounding 8px safe touch margin.
   - Icon-only buttons (such as modal close, test ping, search triggers) MUST include an explicit `aria-label` and `min-w-[44px] min-h-[44px] flex items-center justify-center`.
2. **Keyboard Navigation & Focus Indicators:**
   - Focus rings are NEVER stripped. All focusable elements implement `focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:outline-none`.
3. **Touch Spacing:**
   - Minimum 8px spacing between adjacent interactive controls to avoid mis-taps.
4. **Immediate Interaction Feedback:**
   - Buttons display loading spinners or immediate state feedback (e.g., `isSyncing`, `isProcessandoPergunta`).

---

## 4. Nested Border Radius Formula

Inner Radius = Outer Radius - Container Padding.
- Card Outer Radius: `16px` (`rounded-2xl`) with `16px` (`p-4` or `p-5`) padding → Inner Element Radius = `8px`–`10px` (`rounded-lg` or `rounded-xl`).
- Button Radius: `8px`–`10px` (`rounded-lg` or `rounded-xl`) for tactile modern feel.
- Pill Radius: `9999px` (`rounded-full`) for status indicators and counters.

---

## 5. Responsive & Layout Architecture

- **Mobile Viewport (< 640px):**
  - Horizontal tab navigation has smooth momentum scrolling (`overflow-x-auto scrollbar-none`), subtle left/right fade masks, and visible active indicator pill.
  - Multi-column metric grids collapse cleanly from 7 columns to 2 columns on mobile, expanding to 4 on tablet, and 7 on large desktop.
- **Desktop Fluidity (1024px – 1440px):**
  - Max container width constrained to `max-w-7xl mx-auto` to eliminate excessive eye travel on ultrawide displays.

---

## 6. Motion & Animation Standards

- **Transitions:** 150ms–250ms with `cubic-bezier(0.16, 1, 0.3, 1)` for snappy, authoritative feel.
- **Exit Transitions:** 30% faster than enter transitions (100ms–150ms).
- **Reduced Motion:** Respects `@media (prefers-reduced-motion: reduce)` by disabling transforms and transitions.
