import React from 'react';
import { EmpresaPerfil, FiscalNoticia } from '../types';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  Building2,
  CheckCircle2,
  Activity,
  Layers
} from 'lucide-react';

interface ResumoExecutivoEmpresasProps {
  empresas: EmpresaPerfil[];
  noticias: FiscalNoticia[];
  selectedEmpresaId: string | null;
}

export const ResumoExecutivoEmpresas: React.FC<ResumoExecutivoEmpresasProps> = ({
  empresas,
  noticias,
  selectedEmpresaId,
}) => {
  // Filtrar ações conforme seleção global ou consolidada
  const acoesRelevantes = React.useMemo(() => {
    return noticias.flatMap((n) =>
      n.acoesVinculadas.filter((a) => {
        if (!selectedEmpresaId) return true;
        return (
          a.empresaId === selectedEmpresaId ||
          (!a.empresaId && (selectedEmpresaId === 'recanto-da-saudade' || selectedEmpresaId === 'recanto'))
        );
      })
    );
  }, [noticias, selectedEmpresaId]);

  // Cálculos de métricas
  const totalAcoes = acoesRelevantes.length;
  const concluidas = acoesRelevantes.filter((a) => a.status === 'CONCLUIDA').length;
  const criticas = acoesRelevantes.filter(
    (a) =>
      a.status !== 'CONCLUIDA' &&
      (a.risco === 'CRITICO' || a.risco === 'ALTO' || (a.diasRestantes != null && a.diasRestantes <= 2))
  ).length;
  const pendentesRegulares = acoesRelevantes.filter(
    (a) =>
      a.status !== 'CONCLUIDA' &&
      a.risco !== 'CRITICO' &&
      a.risco !== 'ALTO' &&
      !(a.diasRestantes != null && a.diasRestantes <= 2)
  ).length;

  const totalPendentes = criticas + pendentesRegulares;

  // Índice de conformidade (% de ações concluídas ou dentro do prazo regular)
  const percentualConformidade = totalAcoes > 0 ? Math.round((concluidas / totalAcoes) * 100) : 100;

  // Classificação do status
  const getStatusConformidade = (pct: number) => {
    if (pct >= 85) return { label: 'Conformidade Plena', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' };
    if (pct >= 65) return { label: 'Conformidade Operacional', color: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-200' };
    if (pct >= 40) return { label: 'Atenção Necessária', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' };
    return { label: 'Risco de Conformidade', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' };
  };

  const statusAtual = getStatusConformidade(percentualConformidade);

  // SVG Semi-Circular Gauge Math
  // Raio = 42, centro = (50, 48), arco semicircular de 180 graus (comprimento = PI * 42 = 131.95)
  const radius = 40;
  const circumference = Math.PI * radius; // 125.66
  const strokeDashoffset = circumference - (percentualConformidade / 100) * circumference;

  const empresaAtiva = empresas.find((e) => e.id === selectedEmpresaId);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-5 text-white shadow-md border border-slate-700/80 mb-6 relative overflow-hidden" id="resumo-executivo-empresas">
      {/* Decorative background glow */}
      <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-12 -top-12 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-700/60 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-inner">
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Painel Executivo de Conformidade & Riscos
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                {selectedEmpresaId ? `Foco: ${empresaAtiva?.nome || 'Empresa'}` : 'Visão Consolidada'}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-100 mt-0.5">
              {selectedEmpresaId ? empresaAtiva?.razaoSocial : 'Grupo Corporativo OHANA — Indicadores Consolidados'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span><strong>{empresas.length}</strong> entidades ativas</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span><strong>{noticias.length}</strong> matérias vigentes</span>
          </div>
        </div>
      </div>

      {/* Grid of KPIs with Semi-Circular Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 relative z-10">
        {/* KPI 1: Gauge de Conformidade Geral */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between backdrop-blur-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Conformidade Geral
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Taxa de Resolução
            </span>
          </div>

          {/* Semicircular SVG Gauge */}
          <div className="flex flex-col items-center justify-center my-1 relative">
            <svg viewBox="0 0 100 62" className="w-36 h-24 overflow-visible">
              <defs>
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="45%" stopColor="#f59e0b" />
                  <stop offset="80%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
              {/* Background Arc (Gray) */}
              <path
                d="M 10 52 A 40 40 0 0 1 90 52"
                fill="none"
                stroke="#334155"
                strokeWidth="9"
                strokeLinecap="round"
              />
              {/* Value Arc with Gradient */}
              <path
                d="M 10 52 A 40 40 0 0 1 90 52"
                fill="none"
                stroke="url(#gaugeGradient)"
                strokeWidth="9"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>

            {/* Value centered inside gauge */}
            <div className="absolute bottom-1 flex flex-col items-center">
              <span className="text-2xl font-black text-white tracking-tight leading-none">
                {percentualConformidade}%
              </span>
              <span className="text-[10px] font-bold text-slate-400 mt-1">
                {concluidas} de {totalAcoes} cumpridas
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-700/60 text-center">
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusAtual.bg} ${statusAtual.color} ${statusAtual.border}`}>
              {statusAtual.label}
            </span>
          </div>
        </div>

        {/* KPI 2: Volume de Pendências Críticas */}
        <div className={`rounded-xl p-4 flex flex-col justify-between border backdrop-blur-xs transition-all ${
          criticas > 0
            ? 'bg-rose-950/40 border-rose-600/50 shadow-xs'
            : 'bg-slate-800/60 border-slate-700/80'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldAlert className={`w-4 h-4 ${criticas > 0 ? 'text-rose-400' : 'text-slate-400'}`} />
              Pendências Críticas
            </span>
            {criticas > 0 && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-300 border border-rose-500/40 animate-pulse">
                Ação Imediata
              </span>
            )}
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-black tracking-tight ${criticas > 0 ? 'text-rose-400' : 'text-slate-200'}`}>
                {criticas}
              </span>
              <span className="text-xs text-slate-400 font-medium">ações de alto risco</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              {criticas > 0
                ? 'Exigem intervenção regulatória ou adequação de parâmetros no ERP.'
                : 'Nenhuma pendência crítica identificada com vencimento iminente.'}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
            <span>Risco Alto / Crítico</span>
            <span className={`font-bold ${criticas > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {criticas > 0 ? `${criticas} pendentes` : 'Controlado'}
            </span>
          </div>
        </div>

        {/* KPI 3: Volume Total de Ações Monitoradas */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between backdrop-blur-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              Volume Total de Ações
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
              Mapeamento Geral
            </span>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white tracking-tight">
                {totalAcoes}
              </span>
              <span className="text-xs text-slate-400 font-medium">ações vinculadas</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 bg-slate-700 h-2 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${totalAcoes > 0 ? (concluidas / totalAcoes) * 100 : 0}%` }}
                  className="bg-emerald-500 h-full"
                  title="Concluídas"
                />
                <div
                  style={{ width: `${totalAcoes > 0 ? (criticas / totalAcoes) * 100 : 0}%` }}
                  className="bg-rose-500 h-full"
                  title="Críticas"
                />
                <div
                  style={{ width: `${totalAcoes > 0 ? (pendentesRegulares / totalAcoes) * 100 : 0}%` }}
                  className="bg-amber-500 h-full"
                  title="Pendentes regulares"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
            <span>Pendentes: <strong className="text-amber-300">{totalPendentes}</strong></span>
            <span>Concluídas: <strong className="text-emerald-400">{concluidas}</strong></span>
          </div>
        </div>

        {/* KPI 4: Eficiência & Entidades Segmentadas */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between backdrop-blur-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-sky-400" />
              Segmentação & Entidades
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
              Multi-CNPJ
            </span>
          </div>

          <div className="my-2 space-y-1 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Regimes mapeados:</span>
              <span className="font-bold text-white">Lucro Real, Presumido, Simples</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Carga operacional média:</span>
              <span className="font-bold text-white">
                {empresas.length > 0 ? (totalAcoes / empresas.length).toFixed(1) : 0} ações / empresa
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Auditoria de alterações:</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Rastreabilidade Ativa
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
            <span>Fontes Oficiais:</span>
            <span className="text-slate-200 font-semibold">DOU • SEFAZ • RFB • DOM</span>
          </div>
        </div>
      </div>
    </div>
  );
};
