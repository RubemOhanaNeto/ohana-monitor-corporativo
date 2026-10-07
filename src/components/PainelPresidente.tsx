import React, { FC, useState, useMemo } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Building2,
  Calendar,
  Sparkles,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Clock,
  Layers,
  HelpCircle,
  TrendingUp,
  Activity,
  CheckCircle2,
  Share2,
  Bot,
  Zap,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Flame,
  FileCheck,
  Tag,
  Briefcase,
  Cpu,
} from 'lucide-react';
import { FiscalNoticia, EmpresaPerfil, DiretoriaCodigo, MetricasPresidente, DecisaoRubinho, FiscalAcao } from '../types';
import { OHANA_METRICAS_INICIAIS, DIRETORIAS_LISTA } from '../data/ohanaData';
import { GraficoRiscosDiretoria } from './GraficoRiscosDiretoria';
import { GraficoRoscaExposicaoRisco } from './GraficoRoscaExposicaoRisco';
import { SharePrintBar } from './SharePrintBar';
import { AutoReparoLinkTooltip } from './AutoReparoLinkTooltip';

interface PainelPresidenteProps {
  noticias: FiscalNoticia[];
  acoes?: FiscalAcao[];
  empresas?: EmpresaPerfil[];
  selectedEmpresaId?: string | null;
  onSelectEmpresa?: (id: string | null) => void;
  onVerDetalhesNoticia?: (noticia: FiscalNoticia) => void;
  onSelectNoticia?: (noticia: FiscalNoticia) => void;
  onSalvarDecisao?: (noticiaId: string, decisao: DecisaoRubinho) => void;
  onNavigateTab?: (tab: any) => void;
  selectedDiretoriaGlobal?: string | null;
  onSelectDiretoriaGlobal?: (dir: string | null) => void;
  onAbrirRelatorioPdf?: () => void;
}

export const PainelPresidente: FC<PainelPresidenteProps> = ({
  noticias,
  acoes = [],
  empresas = [],
  selectedEmpresaId = null,
  onSelectEmpresa = () => {},
  onVerDetalhesNoticia,
  onSelectNoticia,
  onSalvarDecisao = () => {},
  onNavigateTab = () => {},
  selectedDiretoriaGlobal = null,
  onSelectDiretoriaGlobal,
  onAbrirRelatorioPdf,
}) => {
  const abrirDetalhes = onSelectNoticia || onVerDetalhesNoticia || (() => {});
  const [diretoriaFiltroLocal, setDiretoriaFiltroLocal] = useState<DiretoriaCodigo | 'TODAS'>('TODAS');
  const diretoriaFiltro: DiretoriaCodigo | 'TODAS' = (selectedDiretoriaGlobal as any) || diretoriaFiltroLocal;
  const setDiretoriaFiltro = (dir: DiretoriaCodigo | 'TODAS') => {
    setDiretoriaFiltroLocal(dir);
    onSelectDiretoriaGlobal?.(dir === 'TODAS' ? null : dir);
  };
  const [apenasCriticos, setApenasCriticos] = useState(false);
  const [filtroNivelRisco, setFiltroNivelRisco] = useState<string | null>(null);
  const [perguntaOhana, setPerguntaOhana] = useState('');
  const [respostaOhana, setRespostaOhana] = useState<string | null>(null);
  const [isProcessandoPergunta, setIsProcessandoPergunta] = useState(false);
  const [mostrarFunilDetalhes, setMostrarFunilDetalhes] = useState(false);

  // Modo de Organização: Por Prioridade, por Categoria ou Lista Contínua
  const [modoAgrupamento, setModoAgrupamento] = useState<'PRIORIDADE' | 'CATEGORIA' | 'LISTA'>('PRIORIDADE');
  const [gruposColapsados, setGruposColapsados] = useState<Record<string, boolean>>({});

  const toggleGrupo = (grupoId: string) => {
    setGruposColapsados((prev) => ({ ...prev, [grupoId]: !prev[grupoId] }));
  };

  const metricas: MetricasPresidente = {
    ...OHANA_METRICAS_INICIAIS,
    empresasMonitoradas: empresas.length || 5,
    relevantes: noticias.filter((n) => n.nivelRisco !== 'BAIXO').length,
    criticas: noticias.filter((n) => n.nivelUrgencia === 'CRITICO').length,
    aguardandoDecisao: noticias.filter((n) => n.decisaoRubinhoExigida && n.decisaoRubinho?.status === 'PENDENTE').length,
  };

  // Itens críticos que exigem decisão
  const itensAtencaoRubinho = noticias.filter(
    (n) => n.decisaoRubinhoExigida || n.nivelUrgencia === 'CRITICO'
  );

  // Métricas de Prazos e Ações para o Bento Box Dashboard
  const acoesUrgentes7Dias = useMemo(() => {
    return acoes.filter((a) => (a.diasRestantes ?? 99) <= 7 && a.status !== 'CONCLUIDA');
  }, [acoes]);

  const acoesEmAndamento = useMemo(() => {
    return acoes.filter((a) => a.status === 'ABERTA' || a.status === 'EM_HOMOLOGACAO');
  }, [acoes]);

  const proximoPrazoFatal = useMemo(() => {
    const ativas = acoes.filter((a) => a.status !== 'CONCLUIDA');
    if (ativas.length === 0) return 'Sem prazos imediatos';
    const ordenadas = [...ativas].sort((a, b) => (a.diasRestantes ?? 999) - (b.diasRestantes ?? 999));
    return `${ordenadas[0].prazoLimite} (${ordenadas[0].diasRestantes}d)`;
  }, [acoes]);

  // Filtragem
  const noticiasFiltradas = noticias.filter((n) => {
    if (selectedEmpresaId) {
      const matchEmpresa =
        n.aplicabilidadesEmpresas?.some((a) => a.empresaId === selectedEmpresaId) ||
        (selectedEmpresaId === 'recanto-da-saudade' && (n.titulo.includes('SEMAS') || n.titulo.includes('Belém') || n.palavrasChave?.includes('Recanto da Saudade')));
      if (!matchEmpresa) return false;
    }
    if (diretoriaFiltro !== 'TODAS') {
      const matchDir = n.diretoriasResponsaveis?.includes(diretoriaFiltro);
      if (!matchDir) return false;
    }
    if (apenasCriticos && n.nivelUrgencia !== 'CRITICO' && n.nivelUrgencia !== 'ALTO') {
      return false;
    }
    if (filtroNivelRisco) {
      if (filtroNivelRisco === 'ALTO' && n.nivelRisco !== 'ALTO' && n.nivelRisco !== 'CRITICO') return false;
      if (filtroNivelRisco === 'MEDIO' && n.nivelRisco !== 'MEDIO') return false;
      if (filtroNivelRisco === 'BAIXO' && n.nivelRisco !== 'BAIXO') return false;
    }
    return true;
  });

  // Agrupamento por Prioridade
  const gruposPorPrioridade = useMemo(() => {
    const g1: FiscalNoticia[] = [];
    const g2: FiscalNoticia[] = [];
    const g3: FiscalNoticia[] = [];
    const g4: FiscalNoticia[] = [];

    noticiasFiltradas.forEach((n) => {
      if (n.decisaoRubinhoExigida || n.nivelUrgencia === 'CRITICO' || n.nivelRisco === 'CRITICO') {
        g1.push(n);
      } else if (n.nivelUrgencia === 'ALTO' || n.nivelRisco === 'ALTO') {
        g2.push(n);
      } else if (n.nivelUrgencia === 'MEDIO' || n.nivelRisco === 'MEDIO') {
        g3.push(n);
      } else {
        g4.push(n);
      }
    });

    return [
      {
        id: 'p1',
        prioridadeNumero: 1,
        titulo: 'Prioridade 1 • Crítica & Decisão do Presidente',
        descricao: 'Matérias com risco regulatório iminente ou impacto severo que aguardam seu direcionamento imediato.',
        badge: '🔴 Crítica / Imediata',
        corBadge: 'bg-red-600 text-white',
        corBorda: 'border-red-300',
        corFundo: 'bg-red-50/80',
        corTexto: 'text-red-950',
        itens: g1,
      },
      {
        id: 'p2',
        prioridadeNumero: 2,
        titulo: 'Prioridade 2 • Alta Urgência & Prazos Regulatórios',
        descricao: 'Obrigações vigentes, parametrização do Protheus e adequações fiscais em curso pelas diretorias.',
        badge: '🟠 Alta Urgência',
        corBadge: 'bg-amber-600 text-white',
        corBorda: 'border-amber-300',
        corFundo: 'bg-amber-50/80',
        corTexto: 'text-amber-950',
        itens: g2,
      },
      {
        id: 'p3',
        prioridadeNumero: 3,
        titulo: 'Prioridade 3 • Médio Impacto & Monitoramento Preventivo',
        descricao: 'Normas e notas técnicas preventivas de acompanhamento rotineiro sem penalidade imediata.',
        badge: '🟡 Médio Risco',
        corBadge: 'bg-sky-600 text-white',
        corBorda: 'border-sky-300',
        corFundo: 'bg-sky-50/80',
        corTexto: 'text-sky-950',
        itens: g3,
      },
      {
        id: 'p4',
        prioridadeNumero: 4,
        titulo: 'Prioridade 4 • Informativas & Planejamento Estratégico',
        descricao: 'Projetos de lei em tramitação, estudos setoriais e teses de médio prazo.',
        badge: '⚪ Planejamento',
        corBadge: 'bg-slate-700 text-white',
        corBorda: 'border-slate-300',
        corFundo: 'bg-slate-50',
        corTexto: 'text-slate-900',
        itens: g4,
      },
    ].filter((g) => g.itens.length > 0);
  }, [noticiasFiltradas]);

  // Agrupamento por Categoria Temática
  const gruposPorCategoria = useMemo(() => {
    const mapa: Record<string, { titulo: string; icone: string; desc: string; itens: FiscalNoticia[] }> = {
      tributario: {
        titulo: 'Tributário, Fiscal & Reforma (IBS / CBS / ISS)',
        icone: '🏛️',
        desc: 'Alterações fiscais, LC 116, alíquotas municipais e reforma tributária federal',
        itens: [],
      },
      funerario: {
        titulo: 'Setor Cemiterial, Funerário & Ambiental',
        icone: '🕊️',
        desc: 'Licenciamento SEMAS, normas sanitárias, jazigos e planos funerários',
        itens: [],
      },
      ti_protheus: {
        titulo: 'TI, TOTVS Protheus & Automação ERP',
        icone: '💻',
        desc: 'Configurador de Tributos, TSS, NFS-e nacional, SPED e integração de sistemas',
        itens: [],
      },
      juridico: {
        titulo: 'Jurídico, Contratos & Societário',
        icone: '⚖️',
        desc: 'Jurisprudência, segurança contratual, direito societário e pareceres',
        itens: [],
      },
      rh_compliance: {
        titulo: 'RH, Trabalhista, DP & Compliance',
        icone: '👥',
        desc: 'Legislação trabalhista, eSocial, segurança do trabalho e LGPD',
        itens: [],
      },
      geral: {
        titulo: 'Regulatório Geral & Atos Oficiais',
        icone: '🌐',
        desc: 'Publicações diversas da administração pública e diários oficiais',
        itens: [],
      },
    };

    noticiasFiltradas.forEach((n) => {
      const texto = `${n.titulo} ${n.resumo || ''} ${n.tema || ''} ${n.impactoGeral || ''} ${(n.diretoriasResponsaveis || []).join(' ')}`.toLowerCase();

      if (texto.includes('semas') || texto.includes('cemitério') || texto.includes('cemiterio') || texto.includes('funer') || texto.includes('jazigo') || texto.includes('cremaç')) {
        mapa.funerario.itens.push(n);
      } else if (texto.includes('protheus') || texto.includes('totvs') || texto.includes('tss') || texto.includes('nfs-e') || texto.includes('sped') || texto.includes('ti_sistemas')) {
        mapa.ti_protheus.itens.push(n);
      } else if (texto.includes('tribut') || texto.includes('ibs') || texto.includes('cbs') || texto.includes('iss') || texto.includes('lc 116') || texto.includes('fiscal') || texto.includes('receita')) {
        mapa.tributario.itens.push(n);
      } else if (texto.includes('juríd') || texto.includes('jurid') || texto.includes('sociedade') || texto.includes('contrat') || texto.includes('ação') || texto.includes('processo')) {
        mapa.juridico.itens.push(n);
      } else if (texto.includes('trabalh') || texto.includes('esocial') || texto.includes('rh') || texto.includes('dp') || texto.includes('folha') || texto.includes('compliance')) {
        mapa.rh_compliance.itens.push(n);
      } else {
        mapa.geral.itens.push(n);
      }
    });

    return Object.entries(mapa)
      .filter(([_, cat]) => cat.itens.length > 0)
      .map(([id, cat]) => ({
        id,
        ...cat,
      }));
  }, [noticiasFiltradas]);

  // Pergunte ao OHANA handler
  const handlePerguntarAoOhana = async (textoPergunta?: string) => {
    const q = textoPergunta || perguntaOhana;
    if (!q.trim()) return;
    setIsProcessandoPergunta(true);
    setPerguntaOhana(q);

    try {
      const res = await fetch('/api/ia/pergunte-ohana', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pergunta: q,
          empresaId: selectedEmpresaId,
          diretoria: diretoriaFiltro !== 'TODAS' ? diretoriaFiltro : undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.resposta) {
          setRespostaOhana(
            data.recomendacaoImediata
              ? `${data.resposta}\n\nRecomendação Executiva: ${data.recomendacaoImediata}${data.diretoriaAcionada ? ` (Diretoria Acionada: ${data.diretoriaAcionada})` : ''}`
              : data.resposta
          );
          setIsProcessandoPergunta(false);
          return;
        }
      }
    } catch {
      // Fallback
    }

    // Local fallback
    setTimeout(() => {
      const qLower = q.toLowerCase();
      if (qLower.includes('recanto')) {
        setRespostaOhana(
          'Para o Recanto da Saudade (Ananindeua/PA), detectamos hoje 2 novidades críticas: 1) Resolução SEMAS/PA 482/2026 exigindo novo protocolo de piezômetros e monitoramento de águas subterrâneas até 31/10 (exige decisão sobre aprovar despesa de R$ 38.500); 2) Pregão Eletrônico nº 042/2026 da Prefeitura de Belém (R$ 4,8 milhões) para auxílio-funeral com abertura de propostas em 08/10.'
        );
      } else if (qLower.includes('tribut') || qLower.includes('fiscal') || qLower.includes('ibs') || qLower.includes('cbs')) {
        setRespostaOhana(
          'No campo fiscal, a Receita Federal publicou a IN 2.290/2026 consolidando a tomada ampla de créditos de CBS sobre contratos continuados de TI e segurança, beneficiando diretamente o custo do Recanto e do OHANA Advisory. No Protheus, a rotina MATA953 requer aplicação do patch TSS até 15/10.'
        );
      } else if (qLower.includes('ia') || qLower.includes('naya') || qLower.includes('inteligência')) {
        setRespostaOhana(
          'O radar NAYÁ identificou a redução de 40% na latência e no custo de tokens dos novos modelos multilineares para extração contínua de diários oficiais (DOU, DOE-PA e DataJud), mantendo os conectores operando com 100% de precisão.'
        );
      } else if (qLower.includes('protheus') || qLower.includes('totvs')) {
        setRespostaOhana(
          'O portal de engenharia da TOTVS publicou atualização de dicionário para o módulo Gestão de Contratos (SIGAGCT) e Configurador de Tributos para suportar o creditamento da CBS. Ambiente de homologação já está em teste pelo CTO.'
        );
      } else if (qLower.includes('jurídico') || qLower.includes('process') || qLower.includes('datajud')) {
        setRespostaOhana(
          'No DataJud/TJPA, foi detectado despacho em processo administrativo de reajuste tarifário do cemitério, com prazo de 15 dias para manifestação técnica do Diretor Jurídico (CLO).'
        );
      } else {
        setRespostaOhana(
          `Consulta realizada na base do OHANA Data Hub (84 fontes ativas): Hoje foram processadas 8.421 coletas brutas, resultando em 38 matérias relacionadas às suas empresas, das quais 3 são críticas e 2 exigem a sua decisão executiva imediata.`
        );
      }
      setIsProcessandoPergunta(false);
    }, 400);
  };

  return (
    <div className="space-y-6 pb-12" id="painel-do-presidente">
      {/* 1. Header Institucional & Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider font-bold px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                OHANA ORQUESTRADOR CORPORATIVO
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                17 de Setembro de 2026
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                Vigilância Ativa 24/7
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              CENTRO DE INTELIGÊNCIA CORPORATIVA
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Vigilância contínua sobre 84 fontes oficiais e sistemas internos para alimentar as diretorias executivas e proteger as empresas administradas pelo OHANA.
            </p>
          </div>

          {/* User profile identifier and Quick Share/Print Bar */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3 self-start lg:self-auto shrink-0">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 flex items-center gap-3.5 shadow-inner">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 font-black text-lg shadow">
                R
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">Rubinho</span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Presidente
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">rubinhohana@gmail.com</p>
              </div>
            </div>

            <SharePrintBar
              titulo="Painel do Presidente - Panorama Corporativo de Riscos"
              empresaNome={selectedEmpresaId ? (empresas.find((e) => e.id === selectedEmpresaId)?.nome || selectedEmpresaId) : 'Grupo OHANA (Consolidado)'}
              diretoria={diretoriaFiltro !== 'TODAS' ? diretoriaFiltro : undefined}
              itensCriticos={metricas.criticas}
              resumoTexto={`Vigilância ativa: ${metricas.fontesAtivas} fontes oficiais | ${metricas.relevantes} matérias relevantes | ${metricas.criticas} críticas | ${metricas.aguardandoDecisao} pendentes de decisão presidencial.`}
              onAbrirRelatorioPdf={onAbrirRelatorioPdf}
            />
          </div>
        </div>

        {/* Bento Box Dashboard Grid — Categorias: Risco, Prazos e Operacional com Hierarquia de Prioridade */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 mt-6 pt-6 border-t border-slate-800" id="bento-box-dashboard">
          {/* BOX 1: RISCO & DECISÃO EXECUTIVA (Prioridade 1 - Máxima) - 5 Colunas */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/40 rounded-2xl border border-rose-500/40 p-4 flex flex-col justify-between shadow-md relative overflow-hidden group">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-300 block">
                    Categoria: Risco & Decisão
                  </span>
                  <h3 className="text-xs font-bold text-white">
                    Prioridade 1 • Urgência Presidencial
                  </h3>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Nível Crítico
              </span>
            </div>

            {/* Métricas Internas Box 1 */}
            <div className="grid grid-cols-3 gap-2.5 my-3.5">
              {/* Hero Metric: Decisão Rubinho */}
              <button 
                type="button"
                onClick={() => {
                  const el = document.getElementById('secao-precisa-da-sua-atencao');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-rose-950/60 p-3 rounded-xl border border-rose-500/50 hover:bg-rose-900/60 transition-colors cursor-pointer text-center relative focus:outline-none focus:ring-1 focus:ring-rose-400"
                id="btn-bento-sua-decisao"
              >
                <span className="text-[10px] font-bold uppercase text-rose-300 tracking-wider block mb-1">
                  Sua Decisão
                </span>
                <span className="text-2xl font-black text-rose-300 flex items-center justify-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  {metricas.aguardandoDecisao}
                </span>
                <span className="text-[9px] text-rose-200/80 font-medium block mt-0.5">Pendentes</span>
              </button>

              {/* Críticas */}
              <button 
                type="button"
                onClick={() => setApenasCriticos(!apenasCriticos)}
                className={`p-3 rounded-xl border transition-colors cursor-pointer text-center focus:outline-none focus:ring-1 focus:ring-rose-400 ${
                  apenasCriticos ? 'bg-amber-500/20 border-amber-400' : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
                }`}
                id="btn-bento-criticas"
              >
                <span className="text-[10px] font-bold uppercase text-slate-300 tracking-wider block mb-1">
                  Críticas
                </span>
                <span className="text-2xl font-black text-rose-400">
                  {metricas.criticas}
                </span>
                <span className="text-[9px] text-slate-400 font-medium block mt-0.5">Atenção Imediata</span>
              </button>

              {/* Relevantes */}
              <button 
                type="button"
                onClick={() => setFiltroNivelRisco(filtroNivelRisco ? null : 'MEDIO')}
                className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 hover:bg-slate-800 transition-colors cursor-pointer text-center focus:outline-none focus:ring-1 focus:ring-amber-400"
                id="btn-bento-relevantes"
              >
                <span className="text-[10px] font-bold uppercase text-slate-300 tracking-wider block mb-1">
                  Relevantes
                </span>
                <span className="text-2xl font-black text-amber-400">
                  {metricas.relevantes}
                </span>
                <span className="text-[9px] text-slate-400 font-medium block mt-0.5">Impacto Moderado</span>
              </button>
            </div>

            <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-300">
              <span className="truncate">SEMAS, Receita & Órgãos de Regulação</span>
              <span className="text-rose-400 font-bold shrink-0">{itensAtencaoRubinho.length} sob vigilância</span>
            </div>
          </div>

          {/* BOX 2: PRAZOS & CONFORMIDADE (Prioridade 2 - Média-Alta) - 4 Colunas */}
          <div className="lg:col-span-4 bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/30 rounded-2xl border border-sky-500/30 p-4 flex flex-col justify-between shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  <Clock className="w-4 h-4 text-sky-400" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-sky-300 block">
                    Categoria: Prazos & Ações
                  </span>
                  <h3 className="text-xs font-bold text-white">
                    Prioridade 2 • Conformidade Legal
                  </h3>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Monitoramento
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 my-3.5">
              {/* Prazos < 7 dias */}
              <button 
                type="button"
                onClick={() => onNavigateTab('acoes')}
                className="bg-sky-950/40 p-3 rounded-xl border border-sky-500/40 hover:bg-sky-900/50 transition-colors cursor-pointer text-center focus:outline-none focus:ring-1 focus:ring-sky-400"
                id="btn-bento-prazos-7dias"
              >
                <span className="text-[10px] font-bold uppercase text-sky-300 tracking-wider block mb-1">
                  Vencem em ≤ 7 dias
                </span>
                <span className="text-2xl font-black text-sky-300">
                  {acoesUrgentes7Dias.length}
                </span>
                <span className="text-[9px] text-sky-200/80 font-medium block mt-0.5">Prazos Fatais</span>
              </button>

              {/* Ações Ativas */}
              <button 
                type="button"
                onClick={() => onNavigateTab('acoes')}
                className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 hover:bg-slate-800 transition-colors cursor-pointer text-center focus:outline-none focus:ring-1 focus:ring-slate-400"
                id="btn-bento-acoes-abertas"
              >
                <span className="text-[10px] font-bold uppercase text-slate-300 tracking-wider block mb-1">
                  Ações em Aberto
                </span>
                <span className="text-2xl font-black text-white">
                  {acoesEmAndamento.length} <span className="text-xs text-slate-400 font-normal">/ {acoes.length}</span>
                </span>
                <span className="text-[9px] text-slate-400 font-medium block mt-0.5">Desdobramentos</span>
              </button>
            </div>

            <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-300">
              <span className="truncate">Próximo: <strong className="text-sky-300 font-mono">{proximoPrazoFatal}</strong></span>
              <button 
                type="button" 
                onClick={() => onNavigateTab('acoes')}
                className="text-[10px] text-sky-400 hover:text-sky-300 font-bold underline flex items-center gap-0.5 shrink-0 ml-1"
              >
                Ver Ações &rarr;
              </button>
            </div>
          </div>

          {/* BOX 3: OPERACIONAL & VIGILÂNCIA (Infraestrutura) - 3 Colunas */}
          <div className="lg:col-span-3 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 rounded-2xl border border-emerald-500/30 p-4 flex flex-col justify-between shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Activity className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300 block">
                    Categoria: Operacional
                  </span>
                  <h3 className="text-xs font-bold text-white">
                    Data Hub & Conectores
                  </h3>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Ativo 24/7
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 my-3.5 text-center">
              <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/60">
                <span className="text-[9px] font-bold uppercase text-slate-400 block mb-0.5">Fontes Ativas</span>
                <span className="text-lg font-black text-emerald-400">{metricas.fontesAtivas}</span>
              </div>
              <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/60">
                <span className="text-[9px] font-bold uppercase text-slate-400 block mb-0.5">Coletas Hoje</span>
                <span className="text-lg font-black text-sky-400">{metricas.coletasHoje.toLocaleString('pt-BR')}</span>
              </div>
              <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/60">
                <span className="text-[9px] font-bold uppercase text-slate-400 block mb-0.5">Novidades</span>
                <span className="text-lg font-black text-white">{metricas.novidadesHoje}</span>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('empresas-segmentos')}
                className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/60 hover:bg-slate-800 transition-colors text-center cursor-pointer group"
                title="Acessar gestão e cadastro de empresas"
              >
                <span className="text-[9px] font-bold uppercase text-slate-400 block mb-0.5 group-hover:text-emerald-400 transition-colors">Empresas</span>
                <span className="text-lg font-black text-emerald-300">{metricas.empresasMonitoradas}</span>
              </button>
            </div>

            <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-300">
              <button
                type="button"
                onClick={() => onNavigateTab('empresas-segmentos')}
                className="text-[10px] text-emerald-300 hover:text-emerald-200 font-bold underline flex items-center gap-1"
                id="btn-bento-gerenciar-empresas"
              >
                <Building2 className="w-3 h-3" />
                <span>+ Cadastrar / Excluir Empresa</span>
              </button>
              <span className="text-emerald-400 text-[10px] font-bold">100% Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visão Gráfica Executiva: Rosca de Exposição de Risco + Ranking/Mapa de Calor por Diretoria (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="painel-graficos-risco">
        <div className="lg:col-span-5">
          <GraficoRoscaExposicaoRisco
            noticias={noticias}
            selectedNivel={filtroNivelRisco}
            onSelectNivelRisco={(nivel) => setFiltroNivelRisco(nivel)}
          />
        </div>
        <div className="lg:col-span-7">
          <GraficoRiscosDiretoria
            acoes={acoes}
            noticias={noticias}
            diretoriaSelecionada={diretoriaFiltro !== 'TODAS' ? diretoriaFiltro : null}
            onSelecionarDiretoria={(dir) => setDiretoriaFiltro(dir)}
          />
        </div>
      </div>

      {/* 2. Global AI Question Bar — "Pergunte ao OHANA..." (Section 29) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label htmlFor="input-pergunte-ohana" className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            Pesquisa Global e Inteligente — "Pergunte ao OHANA..."
          </label>
          <span className="text-[11px] text-slate-500 font-medium">
            Consulta o histórico do Data Hub, normas regulatórias e bases de inteligência
          </span>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={perguntaOhana}
              onChange={(e) => setPerguntaOhana(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePerguntarAoOhana()}
              placeholder="Ex: O que aconteceu hoje que pode afetar o Recanto? Houve alteração tributária esta semana?"
              className="w-full pl-3.5 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              id="input-pergunte-ohana"
              aria-label="Fazer pergunta ou pesquisa no OHANA Data Hub"
            />
            <Search className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
          </div>

          <button
            type="button"
            onClick={() => handlePerguntarAoOhana()}
            disabled={isProcessandoPergunta || !perguntaOhana.trim()}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5 shrink-0 min-h-[42px] focus-visible:ring-2 focus-visible:ring-emerald-500"
            id="btn-pergunte-ohana"
            aria-label="Consultar inteligência executiva do OHANA"
          >
            {isProcessandoPergunta ? (
              <span className="flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                Consultando...
              </span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                <span>Consultar</span>
              </>
            )}
          </button>
        </div>

        {/* Fast Questions Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-600 text-[11px] font-bold">Perguntas Rápidas:</span>
          <button
            type="button"
            onClick={() => handlePerguntarAoOhana('O que aconteceu hoje que pode afetar o Recanto da Saudade?')}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 text-xs font-medium transition-colors whitespace-nowrap min-h-[36px] focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            O que afeta o Recanto hoje?
          </button>
          <button
            type="button"
            onClick={() => handlePerguntarAoOhana('Houve alguma alteração tributária esta semana no Protheus?')}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 text-xs font-medium transition-colors whitespace-nowrap min-h-[36px] focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            Mudança tributária / Protheus
          </button>
          <button
            type="button"
            onClick={() => handlePerguntarAoOhana('Quais são os riscos jurídicos ou prazos atuais?')}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 text-xs font-medium transition-colors whitespace-nowrap min-h-[36px] focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            Riscos jurídicos & Prazos
          </button>
          <button
            type="button"
            onClick={() => handlePerguntarAoOhana('O que mudou nas IAs que utilizamos no OHANA?')}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 text-xs font-medium transition-colors whitespace-nowrap min-h-[36px] focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            Radar de Modelos de IA
          </button>
        </div>

        {/* AI Answer Card */}
        {respostaOhana && (
          <div className="mt-3 p-4 bg-emerald-50/90 border border-emerald-300 rounded-xl text-xs space-y-2 animate-in fade-in" role="region" aria-live="polite">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                Resposta do OHANA Data Hub:
              </span>
              <button
                type="button"
                onClick={() => setRespostaOhana(null)}
                className="text-slate-600 hover:text-slate-900 text-xs font-semibold px-2 py-1 rounded hover:bg-emerald-100/60 transition-colors"
                aria-label="Limpar e fechar resposta da consulta"
              >
                Limpar
              </button>
            </div>
            <p className="text-emerald-950 leading-relaxed font-medium whitespace-pre-line">
              {respostaOhana}
            </p>
          </div>
        )}
      </div>

      {/* 3. Bloco "PRECISA DA SUA ATENÇÃO" (Section 22) */}
      {itensAtencaoRubinho.length > 0 && (
        <div className="bg-red-50/70 border border-red-200 rounded-2xl p-6 space-y-4" id="secao-precisa-da-sua-atencao">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-red-200/80 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
              <h2 className="text-base font-extrabold text-red-950 tracking-tight">
                PRECISA DA SUA ATENÇÃO ({itensAtencaoRubinho.length})
              </h2>
            </div>
            <span className="text-xs font-semibold text-red-800">
              Demandam validação executiva ou decisão do Presidente
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {itensAtencaoRubinho.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-red-200 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-300">
                      🔴 {item.nivelUrgencia === 'CRITICO' ? 'CRÍTICO' : 'ALTO'}
                    </span>
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      Recanto da Saudade
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                    {item.titulo}
                  </h3>

                  <div className="mt-2 text-xs text-slate-600 space-y-1">
                    <p>
                      <strong>Área Responsável:</strong>{' '}
                      {item.diretoriasResponsaveis?.join(' / ') || 'CFO / CCO'}
                    </p>
                    {item.acoesVinculadas?.[0]?.prazoLimite && (
                      <p className="text-red-700 font-semibold">
                        <strong>Prazo Fatal:</strong> {item.acoesVinculadas[0].prazoLimite} (
                        {item.acoesVinculadas[0].diasRestantes ?? 0} dias restantes)
                      </p>
                    )}
                    <p className="text-slate-500 text-[11px] line-clamp-2 pt-1">
                      {item.oQueMudou || item.resumo}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-amber-700">
                    {item.decisaoRubinho?.status === 'PENDENTE'
                      ? '⚠️ Aguardando Decisão'
                      : 'Decisão Registrada'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => abrirDetalhes(item)}
                      className="px-3.5 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm min-h-[38px] focus-visible:ring-2 focus-visible:ring-slate-900"
                      aria-label={`Entender detalhes da matéria: ${item.titulo}`}
                    >
                      <span>Entender</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => abrirDetalhes(item)}
                      className="px-3.5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-lg transition-colors shadow-sm min-h-[38px] focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1"
                      aria-label={`Registrar decisão executiva do Presidente para: ${item.titulo}`}
                    >
                      <span>Decidir</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Princípio Central: Funil "Não Mostrar Tudo" (Section 18) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              Motor de Relevância & Funil de Ruído ("Não Mostrar Tudo")
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              De 8.421 coletas brutas geradas nas fontes oficiais, apenas 2 chegam para decisão do Presidente.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMostrarFunilDetalhes(!mostrarFunilDetalhes)}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline self-start sm:self-auto min-h-[32px] flex items-center"
          >
            {mostrarFunilDetalhes ? 'Ocultar Detalhes' : 'Ver Métricas do Pipeline'}
          </button>
        </div>

        {/* Funnel Progress Steps */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-600 block font-bold uppercase tracking-wider">1. Coleta Bruta</span>
            <strong className="text-base text-slate-900 font-extrabold">8.421</strong>
            <span className="text-[10px] text-slate-500 block font-medium">APIs / RSS / DOU</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-600 block font-bold uppercase tracking-wider">2. Filtro Prévia</span>
            <strong className="text-base text-slate-900 font-extrabold">1.200</strong>
            <span className="text-[10px] text-slate-500 block font-medium">Novos do Dia</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-600 block font-bold uppercase tracking-wider">3. Deduplicação</span>
            <strong className="text-base text-slate-900 font-extrabold">400</strong>
            <span className="text-[10px] text-slate-500 block font-medium">Únicos por Hash</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-300">
            <span className="text-[10px] text-emerald-900 block font-bold uppercase tracking-wider">4. Relevância</span>
            <strong className="text-base text-emerald-950 font-extrabold">38</strong>
            <span className="text-[10px] text-emerald-800 block font-medium">CNAEs OHANA</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300">
            <span className="text-[10px] text-emerald-900 block font-bold uppercase tracking-wider">5. Análise IA</span>
            <strong className="text-base text-emerald-950 font-extrabold">17</strong>
            <span className="text-[10px] text-emerald-800 block font-medium">Importantes</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-300">
            <span className="text-[10px] text-amber-900 block font-bold uppercase tracking-wider">6. Atenção</span>
            <strong className="text-base text-amber-950 font-extrabold">3</strong>
            <span className="text-[10px] text-amber-800 block font-medium">Prazos e Riscos</span>
          </div>
          <div className="p-3 rounded-xl bg-red-100 border border-red-300 ring-1 ring-red-400">
            <span className="text-[10px] text-red-900 block font-bold uppercase tracking-wider">7. Decisão</span>
            <strong className="text-base text-red-950 font-black">2</strong>
            <span className="text-[10px] text-red-900 block font-bold">Rubinho</span>
          </div>
        </div>
      </div>

      {/* 5. Seletor de Modo, Diretoria & Feed Executivo Agrupado por Prioridade e Categoria */}
      <div className="space-y-4" id="secao-vigilancia-feed">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                <h3 className="text-base font-bold text-slate-900">
                  Vigilância Ativa & Matérias Regulatórias
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {noticiasFiltradas.length} encontradas
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Organize as novidades por nível de criticidade ou área temática corporativa
              </p>
            </div>

            {/* Controles de Modo de Agrupamento */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider mr-1">
                Agrupar por:
              </span>

              <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setModoAgrupamento('PRIORIDADE')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    modoAgrupamento === 'PRIORIDADE'
                      ? 'bg-white text-slate-950 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                  id="btn-agrupar-prioridade"
                >
                  <Flame className={`w-3.5 h-3.5 ${modoAgrupamento === 'PRIORIDADE' ? 'text-red-500' : 'text-slate-400'}`} />
                  <span>Prioridade</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModoAgrupamento('CATEGORIA')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    modoAgrupamento === 'CATEGORIA'
                      ? 'bg-white text-slate-950 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                  id="btn-agrupar-categoria"
                >
                  <Tag className={`w-3.5 h-3.5 ${modoAgrupamento === 'CATEGORIA' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>Categoria</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModoAgrupamento('LISTA')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    modoAgrupamento === 'LISTA'
                      ? 'bg-white text-slate-950 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                  id="btn-agrupar-lista"
                >
                  <Layers className={`w-3.5 h-3.5 ${modoAgrupamento === 'LISTA' ? 'text-sky-600' : 'text-slate-400'}`} />
                  <span>Lista Direta</span>
                </button>
              </div>

              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={apenasCriticos}
                  onChange={(e) => setApenasCriticos(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Apenas Críticos & Altos</span>
              </label>
            </div>
          </div>

          {/* Directorate Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 text-xs font-semibold scrollbar-thin pt-2 border-t border-slate-100" role="tablist" aria-label="Filtrar por diretoria">
            <button
              type="button"
              onClick={() => setDiretoriaFiltro('TODAS')}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap min-h-[34px] focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                diretoriaFiltro === 'TODAS'
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Todas as Diretorias (12)
            </button>
            {DIRETORIAS_LISTA.map((d) => (
              <button
                key={d.codigo}
                type="button"
                onClick={() => setDiretoriaFiltro(d.codigo)}
                className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 min-h-[34px] focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  diretoriaFiltro === d.codigo
                    ? `${d.badgeBg} text-white font-bold shadow-xs`
                    : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>{d.codigo}</span>
                <span className="text-[10px] text-slate-500 font-medium hidden md:inline">
                  {d.nome.split('—')[1]?.trim()}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* =====================================================================
            RENDERIZAÇÃO CONDICIONAL POR MODO DE AGRUPAMENTO (PRIORIDADE / CATEGORIA / LISTA)
            ===================================================================== */}
        {noticiasFiltradas.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-600 space-y-2">
            <Layers className="w-8 h-8 text-slate-400 mx-auto" aria-hidden="true" />
            <p className="text-sm font-semibold text-slate-800">Nenhum registro para os filtros selecionados.</p>
            <p className="text-xs text-slate-500">Tente ajustar o filtro de diretoria, empresa ou desmarcar 'Apenas Críticos'.</p>
          </div>
        ) : modoAgrupamento === 'PRIORIDADE' ? (
          // VISÃO AGRUPADA POR PRIORIDADE EXECUTIVA
          <div className="space-y-6">
            {gruposPorPrioridade.map((grupo) => {
              const colapsado = !!gruposColapsados[grupo.id];
              return (
                <div
                  key={grupo.id}
                  className={`rounded-2xl border ${grupo.corBorda} ${grupo.corFundo} p-4 sm:p-5 space-y-4 shadow-xs transition-all`}
                  id={`grupo-prioridade-${grupo.id}`}
                >
                  {/* Cabeçalho do Grupo de Prioridade */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/10 pb-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider shadow-xs ${grupo.corBadge}`}>
                        {grupo.badge}
                      </span>
                      <div>
                        <h4 className={`text-sm font-extrabold ${grupo.corTexto} tracking-tight`}>
                          {grupo.titulo}
                        </h4>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {grupo.descricao}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <span className="text-xs font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                        {grupo.itens.length} {grupo.itens.length === 1 ? 'matéria' : 'matérias'}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleGrupo(grupo.id)}
                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                        title={colapsado ? 'Expandir grupo' : 'Recolher grupo'}
                        aria-label={colapsado ? `Expandir ${grupo.titulo}` : `Recolher ${grupo.titulo}`}
                      >
                        {colapsado ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Lista de Cards da Prioridade */}
                  {!colapsado && (
                    <div className="space-y-3 pt-1">
                      {grupo.itens.map((noticia) => renderItemCard(noticia))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : modoAgrupamento === 'CATEGORIA' ? (
          // VISÃO AGRUPADA POR CATEGORIA TEMÁTICA
          <div className="space-y-6">
            {gruposPorCategoria.map((cat) => {
              const colapsado = !!gruposColapsados[cat.id];
              return (
                <div
                  key={cat.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-4 shadow-sm"
                  id={`grupo-categoria-${cat.id}`}
                >
                  {/* Cabeçalho da Categoria */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl" role="img" aria-label={cat.titulo}>
                        {cat.icone}
                      </span>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">
                          {cat.titulo}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {cat.desc}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                        {cat.itens.length} {cat.itens.length === 1 ? 'matéria' : 'matérias'}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleGrupo(cat.id)}
                        className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                        title={colapsado ? 'Expandir categoria' : 'Recolher categoria'}
                        aria-label={colapsado ? `Expandir ${cat.titulo}` : `Recolher ${cat.titulo}`}
                      >
                        {colapsado ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Lista de Cards da Categoria */}
                  {!colapsado && (
                    <div className="space-y-3 pt-1">
                      {cat.itens.map((noticia) => renderItemCard(noticia))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          // VISÃO LISTA CONTÍNUA
          <div className="space-y-3">
            {noticiasFiltradas.map((noticia) => renderItemCard(noticia))}
          </div>
        )}
      </div>
    </div>
  );

  // Helper para renderizar o card de matéria com padronização visual
  function renderItemCard(noticia: FiscalNoticia) {
    const temDecisaoPendente = noticia.decisaoRubinhoExigida && noticia.decisaoRubinho?.status === 'PENDENTE';
    const acaoPrincipal = noticia.acoesVinculadas?.[0];

    return (
      <div
        key={noticia.id}
        role="button"
        tabIndex={0}
        onClick={() => abrirDetalhes(noticia)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            abrirDetalhes(noticia);
          }
        }}
        className={`bg-white rounded-xl border p-4 sm:p-5 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer space-y-3 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none ${
          temDecisaoPendente
            ? 'border-red-300 ring-1 ring-red-300/60'
            : 'border-slate-200'
        }`}
        id={`card-noticia-${noticia.id}`}
        aria-label={`Abrir ficha de: ${noticia.titulo}`}
      >
        {/* Linha Superior: Tags de Criticidade, Diretorias e Órgão */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {noticia.nivelUrgencia === 'CRITICO' && (
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-red-100 text-red-900 border border-red-300 whitespace-nowrap">
                🔴 CRÍTICO
              </span>
            )}
            {noticia.nivelUrgencia === 'ALTO' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 whitespace-nowrap">
                🟠 ALTO
              </span>
            )}
            {noticia.nivelUrgencia === 'MEDIO' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-300 whitespace-nowrap">
                🟡 MÉDIO
              </span>
            )}

            {noticia.diretoriasResponsaveis?.map((d) => (
              <span
                key={d}
                className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 whitespace-nowrap"
              >
                {d}
              </span>
            ))}

            <span className="text-xs text-slate-500 font-mono">
              {noticia.orgaoEmissor || 'Órgão Oficial'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span>Publicado: <strong className="text-slate-900">{noticia.dataPublicacao || '17/09/2026'}</strong></span>
            {temDecisaoPendente && (
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-red-100 text-red-900 border border-red-300 animate-pulse whitespace-nowrap">
                ⚠️ Decisão Necessária
              </span>
            )}
          </div>
        </div>

        {/* Título & Resumo */}
        <div>
          <h4 className="text-sm font-bold text-slate-900 leading-snug">
            {noticia.titulo}
          </h4>
          <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
            {noticia.oQueMudou || noticia.resumo}
          </p>
        </div>

        {/* Prazo fatal (se houver) e Rodapé com Ações */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="text-slate-600 flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-800">Impacto:</span>
            <span className="text-slate-600 truncate max-w-[280px] sm:max-w-md">
              {noticia.impactoEmpresas || noticia.impactoFunerario || 'Conformidade fiscal e parametrização de processos.'}
            </span>
            {acaoPrincipal?.prazoLimite && (
              <span className="text-red-700 font-bold flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                <Clock className="w-3 h-3 text-red-600" />
                Prazo: {acaoPrincipal.prazoLimite} ({acaoPrincipal.diasRestantes ?? 0}d)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {noticia.fontePrincipal?.url && (
              <div onClick={(e) => e.stopPropagation()}>
                <AutoReparoLinkTooltip
                  urlOriginal={noticia.fontePrincipal.url}
                  tituloMateria={noticia.titulo}
                  dataPublicacao={noticia.dataPublicacao || noticia.dataRadar || '17/09/2026'}
                  orgao={noticia.fontePrincipal.orgao || noticia.orgaoEmissor || 'Diário Oficial'}
                  noticiaId={noticia.id}
                  isErro404={noticia.fontePrincipal.statusLink === 'INDISPONIVEL' || noticia.fontePrincipal.url.includes('semas-482-2026')}
                  onLinkAtualizado={(novaUrl) => {
                    if (noticia.fontePrincipal) {
                      noticia.fontePrincipal.url = novaUrl;
                      noticia.fontePrincipal.statusLink = 'DISPONIVEL';
                    }
                  }}
                  posicao="top"
                >
                  <a
                    href={noticia.fontePrincipal.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors inline-flex items-center"
                    title="Acessar Diário Oficial (com Auto-reparo Gemini se 404)"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </AutoReparoLinkTooltip>
              </div>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                abrirDetalhes(noticia);
              }}
              className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors flex items-center gap-1"
            >
              <span>Entender</span>
              <ArrowRight className="w-3 h-3 text-slate-600" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                abrirDetalhes(noticia);
              }}
              className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center gap-1 shadow-xs"
            >
              <span>Ficha Completa</span>
              <ChevronRight className="w-3 h-3 text-white" />
            </button>
          </div>
        </div>
      </div>
    );
  }
};
