# Page Override: Data Hub & Motor de Relevância

**Parent Master:** `../MASTER.md`  
**Page View:** `data-hub`  
**Primary Audience:** Operations, Compliance, and Technical Oversight  
**Key Purpose:** Real-time visibility into 84 official sources (DOU, SEFA/PA, SEMAS, DataJud, TOTVS Protheus), latency monitoring, connector health check ping, and interactive Relevance Engine Simulator.

## Specific UI/UX Overrides & Specifications

1. **Source Status Telemetry Cards:**
   - 3 high-contrast operational status filters: Operacional (Green), Instável (Amber), Indisponível (Red).
   - Latency indicator: Under 200ms displayed with Green dot; > 200ms displayed with Amber dot.
   - Test ping button: Explicit `aria-label="Testar conexão da fonte"` with loading feedback and HTTP latency badge.

2. **Relevance Engine Simulator Panel:**
   - Bento-style layout in dark contrast (`bg-slate-900 border-emerald-500/40 text-white`).
   - One-click testing presets (SEMAS/PA, SEFA/PA, TOTVS Protheus, MTE NR-32).
   - Real-time score meter (0-100) with color thresholding:
     - 75-100: Critical / Immediate Attention (Red)
     - 50-74: High / Directorates Notified (Amber)
     - < 50: Operational / Routine (Green)
   - Multi-enterprise impact breakdown and Triad of Agents (Executor, Revisor, Crítico) analysis visualizer.
