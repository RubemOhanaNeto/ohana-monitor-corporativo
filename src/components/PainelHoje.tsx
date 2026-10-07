import { FC } from 'react';
import {
  AlertTriangle,
  Flame,
  CheckCircle2,
  Building2,
  Cpu,
  ArrowRight,
  ExternalLink,
  Sparkles,
  FileText,
} from 'lucide-react';
import { FiscalNoticia, FiscalAcao, IndicadoresRadar } from '../types';
import {
  formatarData,
  getStatusAtualidadeBadge,
} from '../utils/formatters';

// Helper inline if formatters differs slightly
function getStatusJuridicoBadgeStyle(status: string) {
  switch (status) {
    case 'VIGENTE':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    case 'VIGENCIA_FUTURA':
      return 'bg-blue-50 text-blue-800 border-blue-200';
    case 'EM_TRAMITACAO':
      return 'bg-purple-50 text-purple-800 border-purple-200';
    case 'BASE_LEGAL':
      return 'bg-indigo-50 text-indigo-800 border-indigo-200';
    case 'NOTA_TECNICA':
      return 'bg-cyan-50 text-cyan-800 border-cyan-200';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200';
  }
}

interface PainelHojeProps {
  noticias: FiscalNoticia[];
  acoes?: FiscalAcao[];
  indicadores?: IndicadoresRadar;
  onSelectNoticia: (noticia: FiscalNoticia) => void;
  onAtalhoBusca?: (termo: string, filtroExtra?: { tab?: string; tema?: string; urgencia?: string }) => void;
  onNavigateTab: (tab: any, options?: { filtroUrgencia?: string; filtroStatusAtualidade?: string; termoBusca?: string }) => void;
}

export const PainelHoje: FC<PainelHojeProps> = ({
  noticias,
  acoes,
  indicadores,
  onSelectNoticia,
  onAtalhoBusca,
  onNavigateTab,
}) => {
  // Matérias novas hoje ou atualizadas hoje
  const materiasHoje = noticias.filter(
    (n) => n.statusAtualidade === 'NOVO_HOJE' || n.statusAtualidade === 'ATUALIZADO_HOJE'
  );

  // Ações críticas (<= 7 dias)
  const acoesCriticas = (acoes || noticias.flatMap((n) => n.acoesVinculadas))
    .map((a) => {
      const noticiaPai = noticias.find((n) => n.id === a.noticiaId) || noticias[0];
      return { ...a, noticiaPai };
    })
    .filter((a) => a.status !== 'CONCLUIDA' && (a.diasRestantes ?? 999) <= 7 && (a.diasRestantes ?? 999) >= 0)
    .sort((a, b) => (a.diasRestantes ?? 0) - (b.diasRestantes ?? 0));

  // Alertas prioritários funerárias
  const alertasFuneraria = noticias.filter(
    (n) => n.subsegmentosFunerariosAfetados.length > 0 && (n.nivelRisco === 'CRITICO' || n.nivelRisco === 'ALTO')
  );

  // Alertas prioritários Protheus
  const alertasProtheus = noticias.filter(
    (n) => n.protheusParametrizacaoNecessaria && n.protheusStatusHomologacao !== 'HOMOLOGADO'
  );

  const fallbackIndicadores: IndicadoresRadar = {
    novidadesHoje: noticias.filter((n) => n.statusAtualidade === 'NOVO_HOJE').length,
    atualizadosHoje: noticias.filter((n) => n.statusAtualidade === 'ATUALIZADO_HOJE').length,
    acoesCriticas: acoesCriticas.length,
    vencimentos7Dias: acoesCriticas.length,
    vencimentos30Dias: (acoes || noticias.flatMap((n) => n.acoesVinculadas)).filter(
      (a) => a.status !== 'CONCLUIDA' && (a.diasRestantes ?? 999) <= 30 && (a.diasRestantes ?? 999) >= 0
    ).length,
    alertasFunerarios: alertasFuneraria.length,
    alertasProtheus: alertasProtheus.length,
    vencimentos90Dias: (acoes || noticias.flatMap((n) => n.acoesVinculadas)).filter(
      (a) => a.status !== 'CONCLUIDA' && (a.diasRestantes ?? 999) <= 90 && (a.diasRestantes ?? 999) > 30
    ).length,
    acoesVencidas: (acoes || noticias.flatMap((n) => n.acoesVinculadas)).filter(
      (a) => a.status !== 'CONCLUIDA' && (a.diasRestantes ?? 999) < 0
    ).length,
    acoesAbertas: (acoes || noticias.flatMap((n) => n.acoesVinculadas)).filter((a) => a.status === 'ABERTA').length,
    totalNormasMonitoradas: noticias.length,
    emTramitacao: noticias.filter((n) => n.statusJuridico === 'EM_TRAMITACAO' || n.statusJuridico === 'EM_DISCUSSAO').length,
  };

  const stats = indicadores || fallbackIndicadores;

  const executarAtalho = (termo: string, extra?: { tab?: string; tema?: string; urgencia?: string }) => {
    if (onAtalhoBusca) {
      onAtalhoBusca(termo, extra);
    } else {
      onNavigateTab(extra?.tab || 'visao-geral', {
        termoBusca: termo !== 'NOVO_HOJE' && termo !== 'ATUALIZADO_HOJE' ? termo : '',
        filtroStatusAtualidade: termo === 'NOVO_HOJE' || termo === 'ATUALIZADO_HOJE' ? termo : 'TODOS',
        filtroUrgencia: extra?.urgencia || 'TODOS',
      });
    }
  };

  return (
    <div className="space-y-6" id="painel-hoje-container">
      {/* Top Banner - Guided Search / Busca Guiada (Section 18 of PRD) */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-semibold tracking-tight text-white">
                Busca Guiada & Atalhos Rápidos
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Consultas prioritárias configuradas para o dia a dia do setor fiscal, funerário e ERP Protheus.
            </p>
          </div>
          <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded border border-slate-700 font-mono">
            Edição: 17 de Setembro de 2026
          </span>
        </div>

        {/* Guided query pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {[
            { label: 'O que saiu hoje?', action: () => executarAtalho('NOVO_HOJE', { tab: 'visao-geral' }) },
            { label: 'Últimos 7 dias', action: () => executarAtalho('ULTIMOS_7_DIAS', { tab: 'visao-geral' }) },
            { label: 'Atualizados hoje', action: () => executarAtalho('ATUALIZADO_HOJE', { tab: 'visao-geral' }) },
            { label: 'O que vence primeiro?', action: () => executarAtalho('', { tab: 'prazos-acoes', urgencia: 'CRITICO' }) },
            { label: 'O que afeta funerária/cemitério?', action: () => executarAtalho('funerária', { tab: 'funeraria-cemiterio' }) },
            { label: 'O que revisar no Protheus?', action: () => executarAtalho('Protheus', { tab: 'totvs-protheus' }) },
            { label: 'Tudo sobre NFS-e', action: () => executarAtalho('NFS-e', { tab: 'visao-geral' }) },
            { label: 'Tudo sobre Simples Nacional', action: () => executarAtalho('Simples Nacional', { tab: 'visao-geral' }) },
            { label: 'Tudo sobre IBS/CBS', action: () => executarAtalho('IBS/CBS', { tab: 'visao-geral' }) },
            { label: 'O que preparar para 2027?', action: () => executarAtalho('2027', { tab: 'visao-geral' }) },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={item.action}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-200 border border-slate-700 transition-colors font-medium whitespace-nowrap"
              id={`shortcut-${idx}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stats Grid (Section 17 of PRD) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div
          onClick={() => executarAtalho('NOVO_HOJE', { tab: 'visao-geral' })}
          className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 cursor-pointer shadow-xs transition-all"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Novidades Hoje</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-1.5">{stats.novidadesHoje}</p>
          <span className="text-[11px] text-rose-600 font-medium">Publicadas hoje</span>
        </div>

        <div
          onClick={() => executarAtalho('ATUALIZADO_HOJE', { tab: 'visao-geral' })}
          className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-amber-500 cursor-pointer shadow-xs transition-all"
        >
          <div className="text-xs text-slate-500">Atualizados Hoje</div>
          <p className="text-2xl font-bold text-slate-900 mt-1.5">{stats.atualizadosHoje}</p>
          <span className="text-[11px] text-amber-600 font-medium">Revisão cadastral</span>
        </div>

        <div
          onClick={() => onNavigateTab('prazos-acoes')}
          className="bg-white p-3.5 rounded-xl border border-rose-200 bg-rose-50/20 hover:border-rose-500 cursor-pointer shadow-xs transition-all"
        >
          <div className="flex items-center justify-between text-xs text-rose-700 font-medium">
            <span>Ações Críticas</span>
            <Flame className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <p className="text-2xl font-bold text-rose-700 mt-1.5">{stats.acoesCriticas}</p>
          <span className="text-[11px] text-rose-700 font-medium">Vencem em até 7 dias</span>
        </div>

        <div
          onClick={() => onNavigateTab('prazos-acoes')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-sky-500 cursor-pointer shadow-xs transition-all"
        >
          <div className="text-xs text-slate-500">Vencem em 30d</div>
          <p className="text-2xl font-bold text-slate-900 mt-1.5">{stats.vencimentos30Dias}</p>
          <span className="text-[11px] text-sky-600 font-medium">{stats.vencimentos7Dias} em 7 dias</span>
        </div>

        <div
          onClick={() => onNavigateTab('funeraria-cemiterio')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-indigo-500 cursor-pointer shadow-xs transition-all"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Alertas Funerários</span>
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-indigo-900 mt-1.5">{stats.alertasFunerarios}</p>
          <span className="text-[11px] text-indigo-600 font-medium">LC 116 Item 25</span>
        </div>

        <div
          onClick={() => onNavigateTab('totvs-protheus')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 cursor-pointer shadow-xs transition-all"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Alertas Protheus</span>
            <Cpu className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-900 mt-1.5">{stats.alertasProtheus}</p>
          <span className="text-[11px] text-emerald-600 font-medium">TES / TSS / Tributos</span>
        </div>
      </div>

      {/* Two Column Section: Ações Críticas Imediatas + Alertas de Alto Impacto */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Column: Ações Críticas & Prazos Próximos */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-rose-100 text-rose-700">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Ações Críticas (Prazo &lt;= 7 Dias)</h3>
                <p className="text-xs text-slate-500">Exigem execução ou homologação imediata para evitar autuações</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('prazos-acoes')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              Ver todas <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-3">
            {acoesCriticas.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                Nenhuma ação crítica com vencimento nos próximos 7 dias.
              </div>
            ) : (
              acoesCriticas.map((acao) => (
                <div key={acao.id} className="py-3.5 first:pt-1 last:pb-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          {acao.diasRestantes === 0
                            ? 'VENCE HOJE'
                            : acao.diasRestantes === 1
                            ? 'VENCE AMANHÃ'
                            : `${acao.diasRestantes} DIAS RESTANTES`}
                        </span>
                        <span className="text-xs font-semibold text-slate-600 uppercase">
                          {acao.area}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-900 leading-snug">{acao.acao}</h4>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                        <span>Prazo Legal: <strong>{formatarData(acao.prazoLegal)}</strong></span>
                        <span>•</span>
                        <span>Prazo Interno: <strong className="text-rose-700">{formatarData(acao.prazoInterno)}</strong></span>
                        <span>•</span>
                        <span>Resp: {acao.responsavel}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onSelectNoticia(acao.noticiaPai)}
                      className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium shrink-0 flex items-center gap-1"
                    >
                      <span>Norma</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Destaques & Alertas Setoriais (Funerário + Protheus) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-indigo-100 text-indigo-700">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Alertas do Segmento & TOTVS Protheus</h3>
                  <p className="text-xs text-slate-500">Impactos prioritários em Funerárias/Cemitérios e parametrizações ERP</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 mt-3">
              {/* Funerário Card */}
              <div className="p-3.5 rounded-lg border border-indigo-100 bg-indigo-50/40">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-700" />
                    Segmento Funerário & Cemiterial
                  </span>
                  <span className="text-[11px] font-semibold text-indigo-700">
                    {alertasFuneraria.length} matérias ativas
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Atenção imediata para a IN RFB nº 2215/2026 (NFS-e Padrão Nacional para os subitens 25.01 a 25.05) e a desoneração de ISS sobre Cessão de Jazigos (STJ Tema 1184).
                </p>
                <div className="mt-2.5 flex items-center justify-end">
                  <button
                    onClick={() => onNavigateTab('funeraria-cemiterio')}
                    className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1"
                  >
                    Abrir Painel Funerário & LC 116 <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Protheus Card */}
              <div className="p-3.5 rounded-lg border border-emerald-100 bg-emerald-50/40">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-emerald-700" />
                    TOTVS Protheus & TSS
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700">
                    {alertasProtheus.length} configurações pendentes
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Homologação pendente do novo WebService do TSS para NFS-e Nacional e revisão de TES com incidência diferenciada de cessão de jazigos e manutenção cemiterial.
                </p>
                <div className="mt-2.5 flex items-center justify-end">
                  <button
                    onClick={() => onNavigateTab('totvs-protheus')}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                  >
                    Abrir Módulo TOTVS Protheus <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Fontes Oficiais: Diário Oficial da União, Receita Federal, CGIBS</span>
            <span className="text-emerald-700 font-medium">100% Rastreável</span>
          </div>
        </div>
      </div>

      {/* Jornal do Dia - Novidades Publicadas Hoje (Section 8 of PRD) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              Novidades e Atualizações do Dia (17/09/2026)
            </h3>
            <p className="text-xs text-slate-500">Publicações oficiais rastreadas e categorizadas no Radar Fiscal</p>
          </div>
          <button
            onClick={() => onNavigateTab('visao-geral')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            Ver Jornal Completo <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {materiasHoje.map((noticia) => {
            const badgeAtualidade = getStatusAtualidadeBadge(noticia.statusAtualidade);
            return (
              <div
                key={noticia.id}
                onClick={() => onSelectNoticia(noticia)}
                className="p-4 rounded-lg border border-slate-200 hover:border-emerald-500/80 hover:shadow-sm cursor-pointer transition-all bg-slate-50/40"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${badgeAtualidade.bg} ${badgeAtualidade.text}`}>
                    {badgeAtualidade.label}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusJuridicoBadgeStyle(noticia.statusJuridico)}`}>
                    {noticia.statusJuridico.replace('_', ' ')}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 leading-snug hover:text-emerald-700">
                  {noticia.titulo}
                </h4>
                <p className="text-xs text-slate-600 line-clamp-2 mt-1.5 leading-relaxed">
                  {noticia.resumo}
                </p>

                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-200/60 text-[11px] text-slate-500">
                  <span>Ato: <strong>{noticia.ato} {noticia.numeroAto}</strong></span>
                  <span>Vigência: <strong>{formatarData(noticia.dataVigencia)}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
