import { FC, useState, useMemo } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Filter,
  Plus,
  FileCheck,
  Building2,
  Cpu,
  User,
  ExternalLink,
  ShieldAlert,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Layers,
  EyeOff,
  Eye,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { FiscalAcao, StatusAcao, AreaResponsavel, NivelUrgencia } from '../types';
import {
  formatarData,
  getStatusAcaoBadge,
  getNivelRiscoBadge,
  getAreaLabel,
} from '../utils/formatters';
import { CountdownPrazoLegal } from './CountdownPrazoLegal';
import { SharePrintBar } from './SharePrintBar';
import { ModalDetalhesAcaoTecnica } from './ModalDetalhesAcaoTecnica';

interface ModuloPrazosAcoesProps {
  acoes: FiscalAcao[];
  onUpdateStatusAcao: (acaoId: string, novoStatus: StatusAcao, evidencia?: string) => void;
  onOpenNoticiaPorId: (noticiaId: string) => void;
  filtroUrgenciaInicial?: string;
  onAbrirRelatorioPdf?: () => void;
}

export const ModuloPrazosAcoes: FC<ModuloPrazosAcoesProps> = ({
  acoes,
  onUpdateStatusAcao,
  onOpenNoticiaPorId,
  filtroUrgenciaInicial = 'TODOS',
  onAbrirRelatorioPdf,
}) => {
  const [filtroArea, setFiltroArea] = useState<string>('TODOS');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  const [filtroUrgencia, setFiltroUrgencia] = useState<string>(filtroUrgenciaInicial);
  const [modalEvidenciaAcaoId, setModalEvidenciaAcaoId] = useState<string | null>(null);
  const [textoEvidencia, setTextoEvidencia] = useState<string>('');
  const [acaoExpandida, setAcaoExpandida] = useState<FiscalAcao | null>(null);

  // Modo de exibição: agrupamento por criticidade ou lista
  const [modoExibicao, setModoExibicao] = useState<'CRITICIDADE' | 'LISTA'>('CRITICIDADE');
  // Inicia com o grupo de baixo risco colapsado para manter o foco no urgente
  const [gruposColapsados, setGruposColapsados] = useState<Record<string, boolean>>({
    baixo_risco: true,
  });

  const toggleGrupo = (grupoId: string) => {
    setGruposColapsados((prev) => ({ ...prev, [grupoId]: !prev[grupoId] }));
  };

  const focarNoUrgente = () => {
    setGruposColapsados({
      baixo_risco: true,
      medio_risco: true,
      critico: false,
      alto: false,
    });
  };

  const expandirTodos = () => {
    setGruposColapsados({});
  };

  // Filtering
  const acoesFiltradas = acoes.filter((acao) => {
    if (filtroArea !== 'TODOS' && acao.area !== filtroArea) return false;
    if (filtroStatus !== 'TODOS' && acao.status !== filtroStatus) return false;
    if (filtroUrgencia !== 'TODOS') {
      const dias = acao.diasRestantes ?? 999;
      if (filtroUrgencia === 'CRITICO' && (dias > 7 || dias < 0)) return false;
      if (filtroUrgencia === 'ALTO' && (dias < 8 || dias > 30)) return false;
      if (filtroUrgencia === 'MEDIO' && (dias < 31 || dias > 90)) return false;
      if (filtroUrgencia === 'PLANEJAMENTO' && dias <= 90) return false;
      if (filtroUrgencia === 'VENCIDAS' && dias >= 0) return false;
    }
    return true;
  });

  // Agrupamento por Criticidade
  const gruposCriticidade = useMemo(() => {
    const criticos: FiscalAcao[] = [];
    const altos: FiscalAcao[] = [];
    const medios: FiscalAcao[] = [];
    const baixos: FiscalAcao[] = [];

    acoesFiltradas.forEach((acao) => {
      const dias = acao.diasRestantes ?? 999;
      const isVencida = dias < 0 && acao.status !== 'CONCLUIDA';
      if (isVencida || dias <= 7 || acao.risco === 'CRITICO') {
        criticos.push(acao);
      } else if (dias <= 30 || acao.risco === 'ALTO') {
        altos.push(acao);
      } else if (dias <= 90 || acao.risco === 'MEDIO') {
        medios.push(acao);
      } else {
        baixos.push(acao);
      }
    });

    return [
      {
        id: 'critico',
        titulo: 'Crítico & Imediato (Prazo Fatal <= 7 dias ou Vencidas)',
        descricao: 'Ações que expõem as empresas a multas imediatas, autuações ou bloqueios operacionais.',
        badge: '🔴 Crítico / Imediato',
        badgeBg: 'bg-red-600 text-white font-black shadow-xs',
        borda: 'border-red-300 ring-1 ring-red-300/60',
        bg: 'bg-red-50/70',
        isAltaPrioridade: true,
        acoes: criticos,
      },
      {
        id: 'alto',
        titulo: 'Alta Prioridade (8 a 30 dias)',
        descricao: 'Parametrizações técnicas no ERP Protheus, adequações contratuais e obrigações vigentes.',
        badge: '🟠 Alta Urgência',
        badgeBg: 'bg-amber-600 text-white font-extrabold shadow-xs',
        borda: 'border-amber-300 ring-1 ring-amber-300/60',
        bg: 'bg-amber-50/60',
        isAltaPrioridade: true,
        acoes: altos,
      },
      {
        id: 'medio_risco',
        titulo: 'Média Prioridade (31 a 90 dias)',
        descricao: 'Acompanhamento preventivo, atualizações normativas e homologações em ambiente de testes.',
        badge: '🟡 Médio Impacto',
        badgeBg: 'bg-sky-600 text-white font-bold',
        borda: 'border-sky-200',
        bg: 'bg-sky-50/40',
        isAltaPrioridade: false,
        acoes: medios,
      },
      {
        id: 'baixo_risco',
        titulo: 'Baixo Risco & Planejamento (> 90 dias / Informativas)',
        descricao: 'Projetos em tramitação, estudos de impacto setorial e planejamento de médio/longo prazo.',
        badge: '⚪ Baixo Risco / Planejamento',
        badgeBg: 'bg-slate-700 text-white font-bold',
        borda: 'border-slate-200',
        bg: 'bg-slate-50',
        isAltaPrioridade: false,
        acoes: baixos,
      },
    ].filter((g) => g.acoes.length > 0);
  }, [acoesFiltradas]);

  const handleSalvarEvidencia = () => {
    if (!modalEvidenciaAcaoId) return;
    onUpdateStatusAcao(modalEvidenciaAcaoId, 'CONCLUIDA', textoEvidencia);
    setModalEvidenciaAcaoId(null);
    setTextoEvidencia('');
  };

  const renderCardAcao = (acao: FiscalAcao, isAltaPrioridade: boolean, isCriticoGroup: boolean) => {
    const statusBadge = getStatusAcaoBadge(acao.status);
    const riscoBadge = getNivelRiscoBadge(acao.risco || 'MEDIO');
    const isCritico = (acao.diasRestantes ?? 999) <= 7 && (acao.diasRestantes ?? 999) >= 0;
    const isVencida = (acao.diasRestantes ?? 999) < 0 && acao.status !== 'CONCLUIDA';

    return (
      <div
        key={acao.id}
        className={`p-4 transition-colors space-y-3 ${
          isCriticoGroup || isVencida
            ? 'bg-rose-50/30 hover:bg-rose-50/60 border-l-4 border-l-red-600'
            : isAltaPrioridade
            ? 'bg-amber-50/20 hover:bg-amber-50/50 border-l-4 border-l-amber-500'
            : 'hover:bg-slate-50/70'
        }`}
      >
        {/* Visual Countdown and Urgency Progress at Top of Card */}
        <CountdownPrazoLegal
          prazoLegal={acao.prazoLegal}
          prazoInterno={acao.prazoInterno}
          dataHomologacao={acao.dataHomologacao}
          diasRestantes={acao.diasRestantes}
          status={acao.status}
          acaoDescricao={acao.acao || acao.titulo || ''}
          responsavel={acao.responsavel}
          area={acao.area ? getAreaLabel(acao.area) : undefined}
        />

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pt-1">
          {/* Main content */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Distinct High Priority Badges */}
              {isVencida ? (
                <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-700 text-white flex items-center gap-1 shadow-xs animate-pulse ring-1 ring-red-500">
                  <Flame className="w-3 h-3 text-yellow-300" />
                  VENCIDA ({Math.abs(acao.diasRestantes || 0)}d ATRÁS)
                </span>
              ) : isCritico ? (
                <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-600 text-white flex items-center gap-1 shadow-xs animate-pulse ring-1 ring-red-400">
                  <Flame className="w-3 h-3 text-yellow-300" />
                  CRÍTICO • {acao.diasRestantes} DIAS RESTANTES
                </span>
              ) : isAltaPrioridade ? (
                <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-amber-600 text-white flex items-center gap-1 shadow-xs ring-1 ring-amber-400">
                  <Clock className="w-3 h-3 text-white" />
                  ALTA PRIORIDADE • {acao.diasRestantes}d
                </span>
              ) : (
                <span className="text-[11px] text-slate-500 font-medium">
                  {acao.diasRestantes} dias restantes
                </span>
              )}

              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusBadge.bg}`}>
                {statusBadge.label}
              </span>

              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${riscoBadge.bg}`}>
                {riscoBadge.label}
              </span>

              <span className="text-[11px] font-semibold text-slate-600 uppercase bg-slate-100 px-2 py-0.5 rounded">
                {acao.area ? getAreaLabel(acao.area) : 'GERAL'}
              </span>
            </div>

            {/* Action Title */}
            <h4 className="text-xs font-bold text-slate-900 leading-snug">
              {acao.acao}
            </h4>

            {/* Consequence of Inaction */}
            <div className="p-2 rounded bg-amber-50/60 border border-amber-200/60 text-[11px] text-amber-900 flex items-start gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>Risco se não executada:</strong> {acao.consequencia}
              </div>
            </div>

            {/* Three Deadlines comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1">
              <div className="p-2 rounded bg-slate-100 border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Prazo Legal (Norma)</span>
                <span className="font-bold text-slate-900">{formatarData(acao.prazoLegal)}</span>
              </div>

              <div className="p-2 rounded bg-rose-50 border border-rose-200">
                <span className="text-rose-700 block text-[10px] uppercase font-bold">Prazo Interno (Meta)</span>
                <span className="font-bold text-rose-900">{formatarData(acao.prazoInterno)}</span>
              </div>

              <div className="p-2 rounded bg-emerald-50 border border-emerald-200">
                <span className="text-emerald-700 block text-[10px] uppercase font-bold">Homologação Técnica</span>
                <span className="font-bold text-emerald-900">{formatarData(acao.dataHomologacao)}</span>
              </div>
            </div>

            {/* Evidence attached */}
            {acao.evidencia ? (
              <div className="p-2 rounded bg-emerald-50/40 border border-emerald-200 text-[11px] text-emerald-950 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span><strong>Evidência registrada:</strong> {acao.evidencia}</span>
              </div>
            ) : (
              <div className="text-[11px] text-slate-400 italic">
                Nenhuma evidência técnica anexada ainda.
              </div>
            )}
          </div>

          {/* Right side: Responsible person & Status Controls */}
          <div className="w-full lg:w-56 shrink-0 bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2.5">
            <div className="flex items-center gap-2 text-xs">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Responsável</div>
                <div className="font-bold text-slate-900">{acao.responsavel}</div>
              </div>
            </div>

            {/* Status toggle selector */}
            <div>
              <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">
                Alterar Status
              </label>
              <select
                value={acao.status}
                onChange={(e) => {
                  const newStatus = e.target.value as StatusAcao;
                  if (newStatus === 'CONCLUIDA' && !acao.evidencia) {
                    setModalEvidenciaAcaoId(acao.id);
                  } else {
                    onUpdateStatusAcao(acao.id, newStatus);
                  }
                }}
                className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded font-medium focus:ring-1 focus:ring-emerald-500"
              >
                <option value="ABERTA">Aberta</option>
                <option value="EM_ANDAMENTO">Em Andamento</option>
                <option value="EM_HOMOLOGACAO">Em Homologação</option>
                <option value="CONCLUIDA">Concluída</option>
                <option value="IMPEDIDA">Impedida</option>
              </select>
            </div>

            <div className="pt-2 border-t border-slate-200 flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => setAcaoExpandida(acao)}
                className="w-full text-[11px] py-1.5 px-2 text-sky-700 hover:text-sky-950 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                id={`btn-expandir-acao-${acao.id}`}
              >
                <Maximize2 className="w-3.5 h-3.5 text-sky-600" />
                <span>Expandir Visualização</span>
              </button>

              <button
                onClick={() => {
                  setModalEvidenciaAcaoId(acao.id);
                  setTextoEvidencia(acao.evidencia || '');
                }}
                className="w-full text-[11px] py-1 px-2 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded font-medium flex items-center justify-center gap-1"
              >
                <FileCheck className="w-3 h-3 text-emerald-600" />
                <span>{acao.evidencia ? 'Editar Evidência' : 'Anexar Evidência'}</span>
              </button>

              <button
                onClick={() => acao.noticiaId && onOpenNoticiaPorId(acao.noticiaId)}
                disabled={!acao.noticiaId}
                className="w-full text-[11px] py-1 px-2 text-emerald-700 hover:text-emerald-900 disabled:opacity-40 font-semibold flex items-center justify-center gap-1"
              >
                <span>Ver Norma de Origem</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6" id="modulo-prazos-container">
      {/* Top Banner - Dual Deadlines Concept (Section 15 of PRD) */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-6 h-6 text-emerald-400" />
              <h2 className="text-lg font-bold tracking-tight text-white">
                Módulo — Prazos & Agenda de Ações
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Gestão de prazos com separação estrita entre <strong>Prazo Legal</strong> (data limite da norma oficial), <strong>Prazo Interno</strong> (data meta da empresa) e <strong>Homologação</strong> (data limite de testes técnicos no Protheus/operação).
            </p>
          </div>

          {/* SLA Badges & Share/Print Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="px-3 py-1.5 rounded-lg bg-rose-950/60 border border-rose-800/80 text-[11px] text-rose-300">
                <strong>Crítico:</strong> até 7 dias
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-orange-950/60 border border-orange-800/80 text-[11px] text-orange-300">
                <strong>Alto:</strong> 8 a 30 dias
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-800/80 text-[11px] text-amber-300">
                <strong>Médio:</strong> 31 a 90 dias
              </div>
            </div>

            <SharePrintBar
              titulo="Agenda de Prazos e Obrigações Legais"
              itensCriticos={acoesFiltradas.filter((a) => (a.diasRestantes ?? 30) <= 7 && a.status !== 'CONCLUIDA').length}
              resumoTexto={acoesFiltradas
                .filter((a) => a.status !== 'CONCLUIDA')
                .slice(0, 5)
                .map((a) => `• ${a.acao} (Prazo Legal: ${formatarData(a.prazoLegal || '')} | Resp: ${a.responsavel})`)
                .join('\n')}
              onAbrirRelatorioPdf={onAbrirRelatorioPdf}
            />
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap gap-2">
          <select
            value={filtroArea}
            onChange={(e) => setFiltroArea(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-slate-200"
          >
            <option value="TODOS">Todas as Áreas</option>
            <option value="FISCAL">Fiscal</option>
            <option value="CONTABIL">Contábil</option>
            <option value="FINANCEIRO">Financeiro</option>
            <option value="TI_PROTHEUS">TI / Protheus</option>
            <option value="GESTAO_FUNERARIA">Gestão Funerária</option>
            <option value="JURIDICO">Jurídico</option>
          </select>

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-slate-200"
          >
            <option value="TODOS">Todos os Status</option>
            <option value="ABERTA">Aberta</option>
            <option value="EM_ANDAMENTO">Em Andamento</option>
            <option value="EM_HOMOLOGACAO">Em Homologação</option>
            <option value="CONCLUIDA">Concluída</option>
            <option value="IMPEDIDA">Impedida</option>
          </select>

          <select
            value={filtroUrgencia}
            onChange={(e) => setFiltroUrgencia(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-slate-200"
          >
            <option value="TODOS">Todas as Urgências</option>
            <option value="CRITICO">Crítico (&lt;= 7 dias)</option>
            <option value="ALTO">Alto (8 a 30 dias)</option>
            <option value="MEDIO">Médio (31 a 90 dias)</option>
            <option value="PLANEJAMENTO">Planejamento (&gt; 90 dias)</option>
            <option value="VENCIDAS">Vencidas</option>
          </select>
        </div>
      </div>

      {/* Actions Section Header with View Modes and Collapse Controls */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/60">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Plano de Ação e Matriz de Responsabilidades
              </h3>
              <span className="text-[11px] font-semibold text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded-full">
                {acoesFiltradas.length} {acoesFiltradas.length === 1 ? 'ação' : 'ações'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Acompanhamento de adequações fiscais, parametrizações Protheus e mitigação de autuações.
            </p>
          </div>

          {/* Controls: Mode Switcher & Focus Urgente */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-slate-200/70 p-1 rounded-lg border border-slate-300/60">
              <button
                type="button"
                onClick={() => setModoExibicao('CRITICIDADE')}
                className={`px-3 py-1 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all ${
                  modoExibicao === 'CRITICIDADE'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                id="btn-modo-criticidade"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Por Criticidade</span>
              </button>

              <button
                type="button"
                onClick={() => setModoExibicao('LISTA')}
                className={`px-3 py-1 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all ${
                  modoExibicao === 'LISTA'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                id="btn-modo-lista"
              >
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>Lista Direta</span>
              </button>
            </div>

            {modoExibicao === 'CRITICIDADE' && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={focarNoUrgente}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 flex items-center gap-1 transition-colors"
                  title="Colapsa grupos de médio e baixo risco para focar no que é crítico"
                  id="btn-focar-urgente"
                >
                  <EyeOff className="w-3.5 h-3.5 text-rose-600" />
                  <span>Focar no Urgente</span>
                </button>

                <button
                  type="button"
                  onClick={expandirTodos}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 flex items-center gap-1 transition-colors"
                  id="btn-expandir-grupos"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>Expandir Todos</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content: Grouped by Criticidade OR Flat List */}
        {acoesFiltradas.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Nenhuma ação encontrada com os filtros selecionados.
          </div>
        ) : modoExibicao === 'CRITICIDADE' ? (
          <div className="divide-y divide-slate-200">
            {gruposCriticidade.map((grupo) => {
              const isColapsado = !!gruposColapsados[grupo.id];

              return (
                <div key={grupo.id} className="transition-colors">
                  {/* Group Header */}
                  <div
                    onClick={() => toggleGrupo(grupo.id)}
                    className={`p-3.5 sm:px-5 flex items-center justify-between cursor-pointer select-none transition-colors ${
                      grupo.isAltaPrioridade
                        ? 'bg-slate-50/90 hover:bg-slate-100/90 border-l-4 ' + (grupo.id === 'critico' ? 'border-l-red-600' : 'border-l-amber-500')
                        : 'bg-slate-50/50 hover:bg-slate-100/70 border-l-4 border-l-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${grupo.badgeBg}`}>
                        {grupo.id === 'critico' && <Flame className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />}
                        {grupo.id === 'alto' && <Clock className="w-3.5 h-3.5 text-white" />}
                        {grupo.badge}
                      </span>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                            {grupo.titulo}
                          </h4>
                          <span className="text-[11px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                            {grupo.acoes.length} {grupo.acoes.length === 1 ? 'ação' : 'ações'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 hidden sm:block mt-0.5">
                          {grupo.descricao}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isColapsado ? (
                        <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-1 rounded border border-slate-200 flex items-center gap-1">
                          <span>Oculto ({grupo.acoes.length})</span>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1">
                          <span>Recolher</span>
                          <ChevronUp className="w-3.5 h-3.5 text-slate-600" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Group Items (if not collapsed) */}
                  {!isColapsado && (
                    <div className="divide-y divide-slate-100 bg-white">
                      {grupo.acoes.map((acao) => renderCardAcao(acao, grupo.isAltaPrioridade, grupo.id === 'critico'))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {acoesFiltradas.map((acao) => {
              const dias = acao.diasRestantes ?? 999;
              const isCritico = dias <= 7 || acao.risco === 'CRITICO' || (dias < 0 && acao.status !== 'CONCLUIDA');
              const isAlto = dias <= 30 || acao.risco === 'ALTO';
              return renderCardAcao(acao, isCritico || isAlto, isCritico);
            })}
          </div>
        )}
      </div>

      {/* Modal for Anexar Evidência */}
      {modalEvidenciaAcaoId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <FileCheck className="w-5 h-5 text-emerald-600" />
              <span>Registrar Evidência de Execução / Homologação</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Para auditoria e conformidade fiscal, informe o número do chamado, link de homologação, parecer jurídico ou patch do Protheus comprovando a conclusão desta ação.
            </p>

            <textarea
              rows={3}
              value={textoEvidencia}
              onChange={(e) => setTextoEvidencia(e.target.value)}
              placeholder="Ex: Chamado Protheus #94821 homologado em produção com patch do TSS e emissão de 10 notas fiscais de teste aprovadas."
              className="w-full p-2.5 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setModalEvidenciaAcaoId(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvarEvidencia}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded shadow-xs"
              >
                Salvar e Marcar Concluída
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Detalhes Técnicos, Evidências e Auditoria da Ação */}
      {acaoExpandida && (
        <ModalDetalhesAcaoTecnica
          acao={acaoExpandida}
          isOpen={!!acaoExpandida}
          onClose={() => setAcaoExpandida(null)}
          onUpdateStatus={(acaoId, novoStatus, evidencia) => {
            onUpdateStatusAcao(acaoId, novoStatus, evidencia);
            setAcaoExpandida((prev) =>
              prev && prev.id === acaoId
                ? { ...prev, status: novoStatus, evidencia: evidencia || prev.evidencia }
                : prev
            );
          }}
        />
      )}
    </div>
  );
};
