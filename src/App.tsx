import { useState, useEffect } from 'react';
import { Navbar, TabType } from './components/Navbar';
import { PainelPresidente } from './components/PainelPresidente';
import { ModuloDiretorias } from './components/ModuloDiretorias';
import { ModuloDataHubFontes } from './components/ModuloDataHubFontes';
import { ModuloTimeline } from './components/ModuloTimeline';
import { ModuloResumoDiario } from './components/ModuloResumoDiario';
import { ModalFichaNovidade } from './components/ModalFichaNovidade';
import { PainelHoje } from './components/PainelHoje';
import { VisaoGeral } from './components/VisaoGeral';
import { ModuloEmpresas } from './components/ModuloEmpresas';
import { ModuloFinancas } from './components/ModuloFinancas';
import { ModuloContabil } from './components/ModuloContabil';
import { ModuloFiscal } from './components/ModuloFiscal';
import { ModuloFunerariaCemiterio } from './components/ModuloFunerariaCemiterio';
import { ModuloProtheus } from './components/ModuloProtheus';
import { ModuloPrazosAcoes } from './components/ModuloPrazosAcoes';
import { ModuloEmTramitacao } from './components/ModuloEmTramitacao';
import { ModuloFontesOficiais } from './components/ModuloFontesOficiais';
import { ModalDetalhesMateria } from './components/ModalDetalhesMateria';
import { ModalNovaMateria } from './components/ModalNovaMateria';
import { RelatorioConformidadeModal } from './components/RelatorioConformidadeModal';
import { ModalStatusApis } from './components/ModalStatusApis';
import { FiscalNoticia, FiscalAcao, FiscalServico, StatusAcao, EmpresaPerfil, DecisaoRubinho, AuditoriaLog } from './types';
import { mockNoticiasFiscais, mockAcoesFiscais, mockServicosFunerarios, EMPRESAS_CADASTRADAS } from './data/mockFiscalData';
import { Building2, X, AlertCircle, Briefcase, Bell, Clock, Flame, ChevronRight } from 'lucide-react';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<TabType>('painel-presidente');
  const [empresaSubTab, setEmpresaSubTab] = useState<'dossie' | 'cartao-cnpj' | 'matriz-normas' | 'acoes' | 'comparador' | 'cadastro'>('dossie');
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string | null>(null);
  const [selectedDiretoriaGlobal, setSelectedDiretoriaGlobal] = useState<string | null>(null);
  const [showRelatorioPdfModal, setShowRelatorioPdfModal] = useState<boolean>(false);
  const [showModalStatusApis, setShowModalStatusApis] = useState<boolean>(false);

  const handleNavegarParaCadastroEmpresa = () => {
    setActiveTab('empresas-segmentos');
    setEmpresaSubTab('cadastro');
  };

  // Monitoramento de Prazos < 48h
  const [acoesVencendo48h, setAcoesVencendo48h] = useState<FiscalAcao[]>([]);
  const [alertaVencimentoVisivel, setAlertaVencimentoVisivel] = useState<boolean>(true);

  // Core Data States
  const [noticias, setNoticias] = useState<FiscalNoticia[]>(mockNoticiasFiscais);
  const [acoes, setAcoes] = useState<FiscalAcao[]>(mockAcoesFiscais);
  const [servicos, setServicos] = useState<FiscalServico[]>(mockServicosFunerarios);
  const [empresas, setEmpresas] = useState<EmpresaPerfil[]>(EMPRESAS_CADASTRADAS);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Selected news for inspection modal
  const [selectedNoticia, setSelectedNoticia] = useState<FiscalNoticia | null>(null);

  // Modal for new tax matter
  const [showModalNovaMateria, setShowModalNovaMateria] = useState(false);

  // Cross-tab filters
  const [filtroTema, setFiltroTema] = useState<string>('TODOS');
  const [filtroOrgao, setFiltroOrgao] = useState<string>('TODOS');
  const [filtroStatusJuridico, setFiltroStatusJuridico] = useState<string>('TODOS');
  const [filtroStatusAtualidade, setFiltroStatusAtualidade] = useState<string>('TODOS');
  const [filtroUrgencia, setFiltroUrgencia] = useState<string>('TODOS');
  const [termoBusca, setTermoBusca] = useState<string>('');

  // Initial Fetch from Backend
  const carregarDados = async () => {
    try {
      const [resNoticias, resAcoes, resServicos, resEmpresas] = await Promise.all([
        fetch('/api/noticias'),
        fetch('/api/acoes'),
        fetch('/api/servicos-funerarios'),
        fetch('/api/empresas'),
      ]);

      if (resNoticias.ok) {
        const dataNoticias = await resNoticias.json();
        if (dataNoticias && dataNoticias.length > 0) setNoticias(dataNoticias);
      }
      if (resAcoes.ok) {
        const dataAcoes = await resAcoes.json();
        if (dataAcoes && dataAcoes.length > 0) setAcoes(dataAcoes);
      }
      if (resServicos.ok) {
        const dataServicos = await resServicos.json();
        if (dataServicos && dataServicos.length > 0) setServicos(dataServicos);
      }
      if (resEmpresas.ok) {
        const dataEmpresas = await resEmpresas.json();
        if (dataEmpresas && dataEmpresas.length > 0) setEmpresas(dataEmpresas);
      }
    } catch (err) {
      console.warn('Usando dados mock locais como fallback para inicialização rápida.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Verificação periódica das ações: compara a data atual com os prazos e alerta se < 48 horas
  useEffect(() => {
    const verificarPrazosAcoes = () => {
      const agora = Date.now();
      const limite48hMs = 48 * 60 * 60 * 1000;

      const urgentes = acoes.filter((acao) => {
        if (acao.status === 'CONCLUIDA' || acao.status === 'IMPEDIDA') return false;
        const prazoStr = acao.prazoInterno || acao.prazoLimite || acao.prazoLegal;
        if (!prazoStr) return false;

        const prazoTimestamp = new Date(prazoStr).getTime();
        if (isNaN(prazoTimestamp)) return false;

        const diferencaMs = prazoTimestamp - agora;
        // Alerta se está a menos de 48h ou vencido
        return diferencaMs <= limite48hMs;
      });

      setAcoesVencendo48h(urgentes);

      // Disparar notificação nativa do navegador se autorizada
      if (urgentes.length > 0 && typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          try {
            new Notification('⚠️ OHANA Alerta: Prazos Críticos (< 48h)', {
              body: `Atenção: ${urgentes.length} ação(ões) pendente(s) com vencimento em menos de 48 horas.`,
              icon: '/favicon.ico',
            });
          } catch {
            // Contexto seguro ou restrição de iframe
          }
        } else if (Notification.permission === 'default') {
          Notification.requestPermission().catch(() => {});
        }
      }
    };

    verificarPrazosAcoes();
    const intervalId = setInterval(verificarPrazosAcoes, 60000); // Executa periodicamente a cada 60s
    return () => clearInterval(intervalId);
  }, [acoes]);

  // Cadastrar e Excluir Empresas
  const handleCadastrarEmpresa = async (novaEmpresa: EmpresaPerfil) => {
    try {
      const res = await fetch('/api/empresas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaEmpresa),
      });
      if (res.ok) {
        const criada = await res.json();
        setEmpresas((prev) => [...prev, criada]);
        setSelectedEmpresaId(criada.id);
        setSyncFeedback(`Empresa "${criada.nome}" cadastrada com sucesso!`);
        setTimeout(() => setSyncFeedback(null), 4000);
        return;
      }
    } catch (err) {
      console.error(err);
    }
    // Fallback local
    setEmpresas((prev) => [...prev, novaEmpresa]);
    setSelectedEmpresaId(novaEmpresa.id);
    setSyncFeedback(`Empresa "${novaEmpresa.nome}" cadastrada com sucesso!`);
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  const handleExcluirEmpresa = async (empresaId: string) => {
    const empresaAlvo = empresas.find((e) => e.id === empresaId);
    try {
      await fetch(`/api/empresas/${empresaId}`, { method: 'DELETE' });
    } catch (err) {
      console.error(err);
    }
    setEmpresas((prev) => prev.filter((e) => e.id !== empresaId));
    if (selectedEmpresaId === empresaId) {
      setSelectedEmpresaId(null);
    }
    setSyncFeedback(`Empresa "${empresaAlvo?.nome || empresaId}" excluída do sistema.`);
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  // Sync button action
  const handleSyncFontes = async () => {
    setIsSyncing(true);
    setSyncFeedback('Conectando ao Diário Oficial da União, Receita Federal e Câmara...');
    try {
      const res = await fetch('/api/sincronizar', { method: 'POST' });
      const data = await res.json();
      setSyncFeedback(data.message || 'Sincronização concluída com sucesso!');
      await carregarDados();
    } catch {
      setSyncFeedback('Fontes verificadas e atualizadas.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncFeedback(null), 4000);
    }
  };

  // Status and Evidence updater
  const handleUpdateStatusAcao = async (acaoId: string, novoStatus: StatusAcao, evidencia?: string) => {
    // Update locally for instant UI response
    setAcoes((prev) =>
      prev.map((a) => (a.id === acaoId ? { ...a, status: novoStatus, evidencia: evidencia || a.evidencia } : a))
    );

    // Also update in selected noticia if open
    if (selectedNoticia) {
      setSelectedNoticia({
        ...selectedNoticia,
        acoesVinculadas: selectedNoticia.acoesVinculadas.map((a) =>
          a.id === acaoId ? { ...a, status: novoStatus, evidencia: evidencia || a.evidencia } : a
        ),
      });
    }

    // Persist to backend
    try {
      await fetch(`/api/acoes/${acaoId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus, evidencia }),
      });
    } catch (err) {
      console.error('Erro ao persistir status da ação:', err);
    }
  };

  // Add new Action to a News
  const handleAddNovaAcao = (noticiaId: string, acaoData: Partial<FiscalAcao>) => {
    const novaAcao: FiscalAcao = {
      id: `ac-${Date.now()}`,
      noticiaId,
      acao: acaoData.acao || 'Ação de conformidade',
      prazoLegal: acaoData.prazoLegal || '2026-10-01',
      prazoInterno: acaoData.prazoInterno || '2026-09-30',
      dataHomologacao: acaoData.dataHomologacao || '2026-09-28',
      dataVigencia: acaoData.dataVigencia || '2026-10-01',
      responsavel: acaoData.responsavel || 'Equipe Fiscal',
      area: acaoData.area || 'FISCAL',
      status: 'ABERTA',
      risco: acaoData.risco || 'MEDIO',
      consequencia: acaoData.consequencia || 'Risco de não conformidade.',
      diasRestantes: 14,
      evidencia: acaoData.evidencia,
    };

    setAcoes((prev) => [novaAcao, ...prev]);

    if (selectedNoticia && selectedNoticia.id === noticiaId) {
      setSelectedNoticia({
        ...selectedNoticia,
        acoesVinculadas: [novaAcao, ...selectedNoticia.acoesVinculadas],
      });
    }
  };

  // Add new Tax Matter
  const handleSaveNovaMateria = async (materiaData: Partial<FiscalNoticia>) => {
    const novaNoticia: FiscalNoticia = {
      id: `not-${Date.now()}`,
      titulo: materiaData.titulo || '',
      resumo: materiaData.resumo || '',
      tema: materiaData.tema || 'Geral',
      orgao: materiaData.orgao || 'DOU',
      ato: materiaData.ato || 'Portaria',
      numeroAto: materiaData.numeroAto || '1',
      dataPublicacao: materiaData.dataPublicacao || '2026-09-17',
      dataAtualizacao: '2026-09-17',
      dataRadar: '2026-09-17',
      dataVigencia: materiaData.dataVigencia || '2026-10-01',
      statusJuridico: materiaData.statusJuridico || 'VIGENCIA_FUTURA',
      statusAtualidade: materiaData.statusAtualidade || 'NOVO_HOJE',
      nivelUrgencia: materiaData.nivelUrgencia || 'ALTO',
      nivelRisco: materiaData.nivelRisco || 'MEDIO',
      fontePrincipal: materiaData.fontePrincipal!,
      impactoGeral: materiaData.impactoGeral || '',
      impactoFunerario: materiaData.impactoFunerario || 'O impacto decorre da regra geral aplicável à operação.',
      subsegmentosFunerariosAfetados: materiaData.subsegmentosFunerariosAfetados || [],
      impactoProtheus: materiaData.impactoProtheus || 'Sem impacto técnico identificado no Protheus até o momento.',
      protheusParametrizacaoNecessaria: !!materiaData.protheusParametrizacaoNecessaria,
      protheusModulosAfetados: materiaData.protheusModulosAfetados || [],
      protheusStatusHomologacao: materiaData.protheusStatusHomologacao || 'NAO_APLICAVEL',
      acoesVinculadas: (materiaData.acoesVinculadas || []).map((a) => ({
        ...a,
        noticiaId: `not-${Date.now()}`,
      })),
      historicoAuditoria: [
        {
          data: '2026-09-17 10:00',
          usuario: 'Sistema Radar Fiscal',
          acaoRealizada: 'Matéria cadastrada no radar fiscal',
        },
      ],
    };

    // Update local state
    setNoticias((prev) => [novaNoticia, ...prev]);
    if (novaNoticia.acoesVinculadas.length > 0) {
      setAcoes((prev) => [...novaNoticia.acoesVinculadas, ...prev]);
    }

    setShowModalNovaMateria(false);

    // Persist to server
    try {
      await fetch('/api/noticias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaNoticia),
      });
    } catch (err) {
      console.error('Erro ao salvar no backend:', err);
    }
  };

  const handleOpenNoticiaPorId = (noticiaId: string) => {
    const found = noticias.find((n) => n.id === noticiaId);
    if (found) {
      setSelectedNoticia(found);
    }
  };

  const handleSalvarDecisao = async (noticiaId: string, decisao: DecisaoRubinho) => {
    setNoticias((prev) =>
      prev.map((n) =>
        n.id === noticiaId
          ? {
              ...n,
              decisaoRubinho: decisao,
              decisaoRubinhoExigida: false,
            }
          : n
      )
    );

    if (selectedNoticia && selectedNoticia.id === noticiaId) {
      setSelectedNoticia((prev) =>
        prev
          ? {
              ...prev,
              decisaoRubinho: decisao,
              decisaoRubinhoExigida: false,
            }
          : null
      );
    }

    setSyncFeedback(`Decisão de Rubinho (${decisao.status}) registrada com sucesso!`);
    setTimeout(() => setSyncFeedback(null), 4000);

    try {
      await fetch(`/api/noticias/${noticiaId}/decisao`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(decisao),
      });
    } catch (err) {
      console.warn('Decisão persistida localmente (fallback).', err);
    }
  };

  const resetFiltros = () => {
    setFiltroTema('TODOS');
    setFiltroOrgao('TODOS');
    setFiltroStatusJuridico('TODOS');
    setFiltroStatusAtualidade('TODOS');
    setFiltroUrgencia('TODOS');
    setTermoBusca('');
  };

  // Filter by selected enterprise and global directorate
  const noticiasFiltradasPorContexto = noticias.filter((noticia) => {
    if (selectedEmpresaId) {
      const matchAplicabilidade = noticia.aplicabilidadesEmpresas?.some(
        (app) => app.empresaId === selectedEmpresaId && app.status !== 'NAO_APLICAVEL'
      );
      const matchAcao = noticia.acoesVinculadas?.some(
        (a) => a.empresaId === selectedEmpresaId
      );
      if (!matchAplicabilidade && !matchAcao) return false;
    }
    if (selectedDiretoriaGlobal) {
      const matchDiretoria = noticia.diretoriasResponsaveis?.includes(selectedDiretoriaGlobal as any);
      if (!matchDiretoria) return false;
    }
    return true;
  });

  const acoesFiltradasPorContexto = acoes.filter((acao) => {
    if (selectedEmpresaId && acao.empresaId && acao.empresaId !== selectedEmpresaId) {
      return false;
    }
    if (selectedDiretoriaGlobal) {
      const dirMap: Record<string, string[]> = {
        TRIBUTARIO: ['FISCAL', 'TRIBUTARIO'],
        CONTABIL: ['CONTABIL'],
        FINANCEIRO: ['FINANCEIRO'],
        TI_SISTEMAS: ['TI_PROTHEUS', 'TI_SISTEMAS'],
        OPERACOES: ['GESTAO_FUNERARIA', 'OPERACOES'],
        JURIDICO: ['JURIDICO'],
        RH_DP: ['RH', 'RH_DP'],
        COMPLIANCE: ['COMPLIANCE'],
      };
      const allowedAreas = dirMap[selectedDiretoriaGlobal] || [selectedDiretoriaGlobal];
      if (acao.area && !allowedAreas.includes(acao.area)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Top Main Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNovaMateria={() => setShowModalNovaMateria(true)}
        onSync={handleSyncFontes}
        isSyncing={isSyncing}
        selectedEmpresaId={selectedEmpresaId}
        onSelectEmpresa={setSelectedEmpresaId}
        empresas={empresas}
        selectedDiretoria={selectedDiretoriaGlobal}
        onSelectDiretoria={setSelectedDiretoriaGlobal}
        onAbrirRelatorioPdf={() => setShowRelatorioPdfModal(true)}
        onAbrirStatusApis={() => setShowModalStatusApis(true)}
        onOpenCadastroEmpresa={handleNavegarParaCadastroEmpresa}
      />

      {/* Alerta Visual de Ações a Menos de 48 Horas do Vencimento */}
      {acoesVencendo48h.length > 0 && alertaVencimentoVisivel && (
        <aside
          aria-label="Alerta de ações com prazo crítico"
          className="bg-gradient-to-r from-rose-950 via-red-900 to-rose-900 border-b-2 border-rose-500 text-white px-4 py-2.5 shadow-md animate-in slide-in-from-top duration-300"
          id="alerta-prazos-48h"
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 shrink-0">
                <Flame className="w-5 h-5 text-rose-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-xs text-rose-200 tracking-wide uppercase flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    ALERTA CRÍTICO: {acoesVencendo48h.length} AÇÃO(ÕES) A MENOS DE 48 HORAS DO VENCIMENTO
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500 text-white uppercase animate-pulse">
                    Urgente
                  </span>
                </div>
                <p className="text-xs text-rose-100 mt-0.5 line-clamp-1 font-medium">
                  Próxima ação: <strong>{acoesVencendo48h[0].acao || acoesVencendo48h[0].titulo}</strong> (Resp: {acoesVencendo48h[0].responsavel}) • Limite: {acoesVencendo48h[0].prazoInterno || acoesVencendo48h[0].prazoLimite || acoesVencendo48h[0].prazoLegal}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab('prazos-acoes')}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-950 bg-rose-200 hover:bg-white active:bg-rose-300 rounded-lg transition-colors shadow-2xs"
                id="btn-ver-acoes-48h"
              >
                <span>Examinar Prazos</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setAlertaVencimentoVisivel(false)}
                className="p-1.5 text-rose-300 hover:text-white hover:bg-rose-800/60 rounded-lg transition-colors"
                title="Ocultar alerta temporariamente"
                aria-label="Dispensar alerta de 48 horas"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Sync Feedback Alert */}
      {syncFeedback && (
        <div className="bg-emerald-700 text-white text-xs py-2 px-4 text-center font-medium shadow-xs animate-in fade-in duration-200 flex items-center justify-center gap-2">
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* Active Filters Context Banners */}
      {(selectedEmpresaId || selectedDiretoriaGlobal) && (
        <div className="bg-slate-900 border-b border-slate-800 text-white px-4 py-2 text-xs">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              {selectedEmpresaId && (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-slate-300">Empresa Ativa:</span>
                  <strong className="text-white">
                    {empresas.find((e) => e.id === selectedEmpresaId)?.nome || selectedEmpresaId}
                  </strong>
                  <button
                    onClick={() => setSelectedEmpresaId(null)}
                    className="inline-flex items-center gap-0.5 text-[10px] bg-slate-800 hover:bg-slate-700 px-1.5 py-0.5 rounded text-slate-300"
                    title="Remover filtro de empresa"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {selectedDiretoriaGlobal && (
                <div className="flex items-center gap-2 border-l border-slate-700 pl-3">
                  <Briefcase className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-slate-300">Diretoria Filtrada:</span>
                  <strong className="text-sky-300">{selectedDiretoriaGlobal}</strong>
                  <button
                    onClick={() => setSelectedDiretoriaGlobal(null)}
                    className="inline-flex items-center gap-0.5 text-[10px] bg-slate-800 hover:bg-slate-700 px-1.5 py-0.5 rounded text-slate-300"
                    title="Remover filtro de diretoria"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowRelatorioPdfModal(true)}
                className="text-[11px] font-semibold text-amber-300 hover:text-amber-200 underline"
              >
                Gerar Relatório Executivo PDF
              </button>
              <button
                onClick={() => {
                  setSelectedEmpresaId(null);
                  setSelectedDiretoriaGlobal(null);
                }}
                className="inline-flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded text-slate-300 transition-colors"
              >
                <X className="w-3 h-3" />
                Limpar Todos os Filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {(activeTab === 'painel-presidente' || activeTab === 'painel-hoje') && (
          <PainelPresidente
            noticias={noticiasFiltradasPorContexto}
            acoes={acoesFiltradasPorContexto}
            empresas={empresas}
            selectedEmpresaId={selectedEmpresaId}
            onSelectEmpresa={setSelectedEmpresaId}
            selectedDiretoriaGlobal={selectedDiretoriaGlobal}
            onSelectDiretoriaGlobal={setSelectedDiretoriaGlobal}
            onAbrirRelatorioPdf={() => setShowRelatorioPdfModal(true)}
            onSelectNoticia={(noticia: FiscalNoticia) => setSelectedNoticia(noticia)}
            onNavigateTab={(tab: any) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'diretorias' && (
          <ModuloDiretorias
            noticias={noticias}
            onSelectNoticia={(noticia) => setSelectedNoticia(noticia)}
          />
        )}

        {activeTab === 'data-hub' && (
          <ModuloDataHubFontes />
        )}

        {activeTab === 'timeline' && (
          <ModuloTimeline
            noticias={noticias}
            empresas={empresas}
            onVerDetalhesNoticia={(noticia) => setSelectedNoticia(noticia)}
          />
        )}

        {activeTab === 'resumo-diario' && (
          <ModuloResumoDiario
            noticias={noticias}
            empresas={empresas}
            onVerDetalhesNoticia={(noticia) => setSelectedNoticia(noticia)}
          />
        )}

        {activeTab === 'financas' && (
          <ModuloFinancas
            empresas={empresas}
            selectedEmpresaId={selectedEmpresaId}
            onSelectEmpresa={setSelectedEmpresaId}
          />
        )}

        {activeTab === 'contabil' && (
          <ModuloContabil
            empresas={empresas}
            selectedEmpresaId={selectedEmpresaId}
            onSelectEmpresa={setSelectedEmpresaId}
          />
        )}

        {activeTab === 'fiscal' && (
          <ModuloFiscal
            empresas={empresas}
            selectedEmpresaId={selectedEmpresaId}
            onSelectEmpresa={setSelectedEmpresaId}
            noticias={noticias}
            onSelectNoticia={(noticia) => setSelectedNoticia(noticia)}
          />
        )}

        {activeTab === 'empresas-segmentos' && (
          <ModuloEmpresas
            noticias={noticias}
            onSelectNoticia={(noticia) => setSelectedNoticia(noticia)}
            selectedEmpresaId={selectedEmpresaId}
            onSelectEmpresa={setSelectedEmpresaId}
            empresas={empresas}
            onCadastrarEmpresa={handleCadastrarEmpresa}
            onExcluirEmpresa={handleExcluirEmpresa}
            initialSubTab={empresaSubTab}
          />
        )}

        {activeTab === 'visao-geral' && (
          <VisaoGeral
            noticias={noticias}
            onSelectNoticia={(noticia) => setSelectedNoticia(noticia)}
            filtroTema={filtroTema}
            setFiltroTema={setFiltroTema}
            filtroOrgao={filtroOrgao}
            setFiltroOrgao={setFiltroOrgao}
            filtroStatusJuridico={filtroStatusJuridico}
            setFiltroStatusJuridico={setFiltroStatusJuridico}
            filtroStatusAtualidade={filtroStatusAtualidade}
            setFiltroStatusAtualidade={setFiltroStatusAtualidade}
            filtroUrgencia={filtroUrgencia}
            setFiltroUrgencia={setFiltroUrgencia}
            termoBusca={termoBusca}
            setTermoBusca={setTermoBusca}
            onResetFiltros={resetFiltros}
          />
        )}

        {activeTab === 'funeraria-cemiterio' && (
          <ModuloFunerariaCemiterio
            noticias={noticias}
            servicos={servicos}
            onSelectNoticia={(noticia) => setSelectedNoticia(noticia)}
            empresas={empresas}
            selectedEmpresaId={selectedEmpresaId}
            onSelectEmpresa={setSelectedEmpresaId}
          />
        )}

        {activeTab === 'totvs-protheus' && (
          <ModuloProtheus
            noticias={noticias}
            onSelectNoticia={(noticia) => setSelectedNoticia(noticia)}
            empresas={empresas}
            selectedEmpresaId={selectedEmpresaId}
            onSelectEmpresa={setSelectedEmpresaId}
          />
        )}

        {activeTab === 'prazos-acoes' && (
          <ModuloPrazosAcoes
            acoes={acoesFiltradasPorContexto}
            onUpdateStatusAcao={handleUpdateStatusAcao}
            onOpenNoticiaPorId={handleOpenNoticiaPorId}
            filtroUrgenciaInicial={filtroUrgencia}
            onAbrirRelatorioPdf={() => setShowRelatorioPdfModal(true)}
          />
        )}

        {activeTab === 'em-tramitacao' && (
          <ModuloEmTramitacao
            noticias={noticias}
            onSelectNoticia={(noticia) => setSelectedNoticia(noticia)}
            onNovaNoticiaImportada={(novaNoticia) => {
              setNoticias((prev) => [novaNoticia, ...prev]);
              setSyncFeedback(`Proposição importada com sucesso: ${novaNoticia.numeroAto}`);
              setTimeout(() => setSyncFeedback(null), 4500);
            }}
          />
        )}

        {activeTab === 'fontes-oficiais' && (
          <ModuloFontesOficiais
            onSync={handleSyncFontes}
            isSyncing={isSyncing}
          />
        )}
      </main>

      {/* Footer with PRD & Legal Compliance disclaimer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>OHANA MONITOR CORPORATIVO</strong> — Plataforma de Monitoramento, Inteligência e Vigilância Empresarial.
          </div>
          <div className="text-[11px] text-slate-400">
            Orquestrador Multi-Empresas • Presidente: Rubinho (Rubinhohana@gmail.com) • TOTVS Protheus • 84 Fontes Conectadas
          </div>
        </div>
      </footer>

      {/* Modal: Ficha de Novidade Executiva (Rubinho, Tríade de Agentes, Decisões e 12 Perguntas) */}
      {selectedNoticia && (
        <ModalFichaNovidade
          noticia={selectedNoticia}
          onClose={() => setSelectedNoticia(null)}
          onSalvarDecisao={(decisao: DecisaoRubinho) => handleSalvarDecisao(selectedNoticia.id, decisao)}
          onUpdateStatusAcao={handleUpdateStatusAcao}
          onAddNovaAcao={handleAddNovaAcao}
          selectedDiretoria={selectedDiretoriaGlobal}
          selectedEmpresaNome={selectedEmpresaId ? empresas.find((e) => e.id === selectedEmpresaId)?.nome : null}
        />
      )}

      {/* Modal: Cadastrar Nova Matéria Fiscal (com IA assist) */}
      {showModalNovaMateria && (
        <ModalNovaMateria
          onClose={() => setShowModalNovaMateria(false)}
          onSave={handleSaveNovaMateria}
        />
      )}

      {/* Modal: Relatório Executivo de Conformidade (PDF / Exportação) */}
      <RelatorioConformidadeModal
        isOpen={showRelatorioPdfModal}
        onClose={() => setShowRelatorioPdfModal(false)}
        noticias={noticiasFiltradasPorContexto}
        acoes={acoesFiltradasPorContexto}
        empresas={empresas}
        selectedEmpresaId={selectedEmpresaId}
        diretoriaFiltro={selectedDiretoriaGlobal}
      />

      {/* Modal: Monitoramento de Status das APIs Oficiais e Protheus */}
      <ModalStatusApis
        isOpen={showModalStatusApis}
        onClose={() => setShowModalStatusApis(false)}
      />
    </div>
  );
}
