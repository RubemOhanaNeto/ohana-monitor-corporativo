# Page Override: Painel do Presidente (Executive Dashboard)

**Parent Master:** `../MASTER.md`  
**Page View:** `painel-presidente` / `painel-hoje`  
**Primary Audience:** President Rubinho  
**Key Purpose:** High-level executive situational awareness, urgent decision queue ("Sua Decisão"), executive question bar ("Pergunte ao OHANA"), and company health cards.

## Specific UI/UX Overrides & Specifications

1. **Executive Metric Grid:**
   - 7 key metrics arranged in bento layout.
   - The 7th metric tile ("Sua Decisão") is rendered with high-priority red emphasis (`bg-red-950/40 border-red-500/50 ring-1 ring-red-500/30 text-red-300`) with an animated pulsing indicator (`animate-ping`) when decisions >= 1.
   - Metric numbers: High-contrast typography (`text-xl sm:text-2xl font-black`), tracking-tight.

2. **Executive AI Query Console ("Pergunte ao OHANA..."):**
   - High-contrast input field with minimum touch height of 44px (`py-2.5 px-3.5`).
   - Quick prompt suggestion chips styled with minimum 40px touch clearance and `whitespace-nowrap`.
   - Accessible keyboard trigger (`onKeyDown` Enter support) and loading states (`Consultando...` with spinner).
   - Response box: Structured hierarchy with distinct badges for "Recomendação Executiva", "Diretoria Acionada" and "Decisão Presidencial".

3. **Decisão de Rubinho Action Queue:**
   - Visual card with clear border separation and badge indicating impact, urgency, and affected enterprise.
   - Action buttons:
     - "Aprovar Diretriz": Green primary action (`bg-emerald-600 hover:bg-emerald-500 text-white`, min height 40px).
     - "Solicitar Revisão": Amber secondary action (`bg-amber-600 hover:bg-amber-500 text-white`).
     - "Veto / Arquivar": Ghost / destructive action (`text-slate-400 hover:text-red-400`).
   - Modal dialog for custom justification input with focus trap and clear accessible labels.
