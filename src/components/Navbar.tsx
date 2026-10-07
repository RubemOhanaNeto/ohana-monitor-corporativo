import { FC, useState, useEffect } from 'react';
import {
  Radar,
  Calendar,
  RefreshCw,
  PlusCircle,
  Building2,
  Cpu,
  Clock,
  GitBranch,
  BookOpen,
  LayoutDashboard,
  ShieldCheck,
  Search,
  DollarSign,
  Briefcase,
  Database,
  Activity,
  FileText,
  Sparkles,
  FileDown,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { EmpresaPerfil, DiretoriaCodigo } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

export type TabId =
  | 'painel-presidente'
  | 'painel-hoje'
  | 'diretorias'
  | 'empresas-segmentos'
  | 'data-hub'
  | 'timeline'
  | 'resumo-diario'
  | 'financas'
  | 'contabil'
  | 'fiscal'
  | 'totvs-protheus'
  | 'prazos-acoes'
  | 'visao-geral'
  | 'funeraria-cemiterio'
  | 'em-tramitacao'
  | 'fontes-oficiais';

export type TabType = TabId;

export type CategoriaId = 'estrategia' | 'governanca' | 'fiscal_erp' | 'fontes';

interface TabItem {
  id: TabId;
  label: string;
  icon: any;
  badge?: number;
  badgeCor?: string;
}

interface CategoriaGrupo {
  id: CategoriaId;
  label: string;
  icon: any;
  tabs: TabItem[];
}

interface NavbarProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  onOpenNovaMateria: () => void;
  onSync: () => void;
  isSyncing: boolean;
  totalAcoesCriticas?: number;
  termoBuscaGlobal?: string;
  onBuscaChange?: (v: string) => void;
  selectedEmpresaId?: string | null;
  onSelectEmpresa?: (empresaId: string | null) => void;
  empresas?: EmpresaPerfil[];
  selectedDiretoria?: string | null;
  onSelectDiretoria?: (dir: string | null) => void;
  onAbrirRelatorioPdf?: () => void;
  onAbrirStatusApis?: () => void;
  onOpenCadastroEmpresa?: () => void;
}

export const Navbar: FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNovaMateria,
  onSync,
  isSyncing,
  totalAcoesCriticas = 0,
  termoBuscaGlobal = '',
  onBuscaChange = () => {},
  selectedEmpresaId = null,
  onSelectEmpresa = () => {},
  empresas = [],
  selectedDiretoria = null,
  onSelectDiretoria = () => {},
  onAbrirRelatorioPdf,
  onAbrirStatusApis,
  onOpenCadastroEmpresa,
}) => {
  // Identificar perfil da empresa ativa para contextualização dinâmica dos módulos
  const empresaAtiva = empresas.find((e) => e.id === selectedEmpresaId) || (selectedEmpresaId === null ? empresas[0] : null);
  const isClinica = empresaAtiva?.id === 'instituto-go' || empresaAtiva?.segmento?.toLowerCase().includes('saúde') || empresaAtiva?.segmento?.toLowerCase().includes('médic');

  // Nome do ERP principal da empresa
  const nomeErpEmpresa = isClinica ? 'ERP Saúde (Alterdata / CFM)' : 'TOTVS Protheus & ERP';
  const nomeSetorEmpresa = isClinica ? 'Setor Clínicas & Saúde' : 'Setor Cemiterial & Funerário';

  // Estrutura agrupada por CATEGORIA & PRIORIDADE
  const categorias: CategoriaGrupo[] = [
    {
      id: 'estrategia',
      label: 'Presidência & Estratégia',
      icon: LayoutDashboard,
      tabs: [
        { id: 'painel-presidente', label: 'Painel do Presidente', icon: LayoutDashboard, badge: 2, badgeCor: 'bg-red-600' },
        { id: 'resumo-diario', label: 'Resumo Executivo', icon: FileText },
        { id: 'timeline', label: 'Linha do Tempo 24/7', icon: Activity },
      ],
    },
    {
      id: 'governanca',
      label: 'Governança & Diretorias',
      icon: Briefcase,
      tabs: [
        { id: 'diretorias', label: 'Diretorias Executivas', icon: Briefcase },
        { id: 'empresas-segmentos', label: 'Empresas & Cadastro CNPJ', icon: Building2 },
        { id: 'prazos-acoes', label: 'Prazos & Ações', icon: Clock, badge: totalAcoesCriticas, badgeCor: 'bg-amber-600' },
      ],
    },
    {
      id: 'fiscal_erp',
      label: 'Fiscal, Contábil, Finanças & ERP',
      icon: ShieldCheck,
      tabs: [
        { id: 'fiscal', label: isClinica ? 'Fiscal (Saúde & DMED)' : 'Fiscal & Tributário', icon: ShieldCheck },
        { id: 'contabil', label: isClinica ? 'Contábil (DRE Clínicas)' : 'Contábil & NBC TG 22', icon: BookOpen },
        { id: 'financas', label: isClinica ? 'Finanças (Convênios & Glosas)' : 'Finanças & Caixa', icon: DollarSign },
        { id: 'totvs-protheus', label: nomeErpEmpresa, icon: Cpu },
        { id: 'funeraria-cemiterio', label: nomeSetorEmpresa, icon: Building2 },
      ],
    },
    {
      id: 'fontes',
      label: 'Fontes & Monitoramento',
      icon: Database,
      tabs: [
        { id: 'data-hub', label: 'Data Hub (84 Fontes)', icon: Database },
        { id: 'fontes-oficiais', label: 'Validador de Fontes', icon: Activity },
        { id: 'em-tramitacao', label: 'Em Tramitação', icon: GitBranch },
      ],
    },
  ];

  // Identificar categoria da aba ativa atual
  const getCategoriaDaAba = (tabId: TabId): CategoriaId => {
    for (const cat of categorias) {
      if (cat.tabs.some((t) => t.id === tabId)) {
        return cat.id;
      }
    }
    return 'estrategia';
  };

  const [categoriaAtiva, setCategoriaAtiva] = useState<CategoriaId>(getCategoriaDaAba(activeTab));

  // Sincronizar categoria ativa se a aba mudar externamente
  useEffect(() => {
    const cat = getCategoriaDaAba(activeTab);
    setCategoriaAtiva(cat);
  }, [activeTab]);

  const grupoAtual = categorias.find((c) => c.id === categoriaAtiva) || categorias[0];

  return (
    <header className="bg-slate-900 text-slate-100 border-b border-slate-800 sticky top-0 z-40 shadow-sm print:hidden" id="radar-header">
      {/* Linha Superior: Identidade, Busca e Ações de Contexto */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo e Sistema */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 font-black shrink-0 shadow-sm">
              <span className="text-base tracking-tighter">OH</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg text-white tracking-tight">OHANA MONITOR</span>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  DATA HUB
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate hidden md:block">
                Centro de Inteligência Corporativa • Vigilância 24/7
              </p>
            </div>
          </div>

          {/* Quick Search */}
          <div className="flex-1 max-w-sm hidden lg:block">
            <div className="relative">
              <label htmlFor="global-search-input" className="sr-only">
                Pesquisar atos normativos, normas tributárias e termos do Protheus
              </label>
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
              <input
                type="text"
                value={termoBuscaGlobal}
                onChange={(e) => onBuscaChange(e.target.value)}
                placeholder="Pesquisar norma, ato, LC 116, Protheus..."
                className="w-full pl-9 pr-4 py-1.5 bg-slate-800/90 border border-slate-700 text-xs text-slate-100 placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/80 focus:border-emerald-500 transition-colors"
                id="global-search-input"
              />
            </div>
          </div>

          {/* Ações, Seletores de Contexto e Exportação */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Seletor de Empresa */}
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 gap-1.5" title="Filtrar visão por empresa">
              <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
              <select
                value={selectedEmpresaId || 'todas'}
                onChange={(e) => {
                  const val = e.target.value === 'todas' ? null : e.target.value;
                  onSelectEmpresa(val);
                }}
                className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer pr-1 max-w-[130px] sm:max-w-[170px] truncate"
                id="select-empresa-navbar"
                aria-label="Filtrar visão por empresa"
              >
                <option value="todas" className="bg-slate-900 text-slate-200">Todas as Empresas</option>
                {empresas.length > 0 ? (
                  empresas.map((emp) => (
                    <option key={emp.id} value={emp.id} className="bg-slate-900 text-slate-200">
                      {emp.nome} ({emp.segmento})
                    </option>
                  ))
                ) : (
                  <>
                    <option value="recanto-da-saudade" className="bg-slate-900 text-emerald-400">Recanto (04.709.150/0001-20)</option>
                    <option value="instituto-go" className="bg-slate-900 text-sky-400">INSTITUTO GO (46.969.307/0001-04)</option>
                  </>
                )}
              </select>
            </div>

            {/* Atalho Direto: Cadastrar / Gerenciar Empresas */}
            {onOpenCadastroEmpresa && (
              <button
                type="button"
                onClick={onOpenCadastroEmpresa}
                title="Cadastrar nova empresa ou gerenciar CNPJs e exclusões"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-emerald-300 bg-emerald-950/70 hover:bg-emerald-900/90 border border-emerald-700/60 rounded-lg transition-colors shadow-xs"
                id="btn-nav-gerenciar-empresas"
              >
                <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
                <span className="hidden md:inline">+ Cadastrar Empresa</span>
                <span className="md:hidden">+ Empresa</span>
              </button>
            )}

            {/* Seletor de Diretoria */}
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 gap-1.5" title="Filtrar por diretoria executiva">
              <Briefcase className="w-3.5 h-3.5 text-sky-400 shrink-0" aria-hidden="true" />
              <select
                value={selectedDiretoria || 'todas'}
                onChange={(e) => {
                  const val = e.target.value === 'todas' ? null : e.target.value;
                  onSelectDiretoria(val);
                }}
                className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer pr-1 max-w-[120px] sm:max-w-[150px] truncate"
                id="select-diretoria-navbar"
                aria-label="Filtrar visão por diretoria"
              >
                <option value="todas" className="bg-slate-900 text-slate-200">Todas Diretorias</option>
                <option value="PRESIDENCIA" className="bg-slate-900 text-slate-200">Presidência</option>
                <option value="JURIDICO" className="bg-slate-900 text-slate-200">Jurídica</option>
                <option value="TRIBUTARIO" className="bg-slate-900 text-slate-200">Tributária / Fiscal</option>
                <option value="CONTABIL" className="bg-slate-900 text-slate-200">Contábil</option>
                <option value="FINANCEIRO" className="bg-slate-900 text-slate-200">Financeira</option>
                <option value="TI_SISTEMAS" className="bg-slate-900 text-slate-200">TI (Protheus)</option>
                <option value="RH_DP" className="bg-slate-900 text-slate-200">RH / DP</option>
                <option value="OPERACOES" className="bg-slate-900 text-slate-200">Operações</option>
                <option value="COMPLIANCE" className="bg-slate-900 text-slate-200">Compliance</option>
              </select>
            </div>

            {/* Relatório PDF Executivo */}
            {onAbrirRelatorioPdf && (
              <button
                type="button"
                onClick={onAbrirRelatorioPdf}
                title="Exportar Resumo Executivo em PDF formatado"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-amber-200 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-800/80 rounded-lg transition-colors"
                id="btn-export-pdf-navbar"
              >
                <FileDown className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">Exportar PDF</span>
              </button>
            )}

            {/* Status APIs */}
            {onAbrirStatusApis && (
              <button
                type="button"
                onClick={onAbrirStatusApis}
                title="Acompanhar conectividade das 84 fontes oficiais"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800/80 rounded-lg transition-colors"
                id="btn-status-apis-navbar"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <Activity className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
                <span className="hidden lg:inline">APIs</span>
              </button>
            )}

            {/* Instalação PWA */}
            <PWAInstallButton />

            {/* Sincronizar */}
            <button
              type="button"
              onClick={onSync}
              disabled={isSyncing}
              title="Sincronizar dados oficiais"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors disabled:opacity-50"
              id="btn-sync-sources"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-sky-400 shrink-0 ${isSyncing ? 'animate-spin' : ''}`} aria-hidden="true" />
              <span className="hidden md:inline">{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
            </button>

            {/* Nova Matéria */}
            <button
              type="button"
              onClick={onOpenNovaMateria}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-colors"
              id="btn-nova-materia"
            >
              <PlusCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span className="whitespace-nowrap">Nova Matéria</span>
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================================
          NOVA BARRA ESTRUTURAL: CATEGORIAS E SUB-MÓDULOS SEM OVERFLOW QUEBRADO
          ===================================================================== */}
      <div className="bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Linha 1: Seletor de Categorias Macro */}
          <div className="flex items-center justify-between border-b border-slate-800/80 py-2 gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
                Categorias:
              </span>
              {categorias.map((cat) => {
                const isCatAtiva = categoriaAtiva === cat.id;
                const IconeCat = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategoriaAtiva(cat.id);
                      // Se a aba ativa não estiver nesta categoria, seleciona a primeira da categoria
                      if (!cat.tabs.some((t) => t.id === activeTab)) {
                        setActiveTab(cat.tabs[0].id);
                      }
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      isCatAtiva
                        ? 'bg-slate-800 text-white border border-slate-700 shadow-xs ring-1 ring-emerald-500/40'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <IconeCat className={`w-3.5 h-3.5 ${isCatAtiva ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Atalho fixo prioritário para o Painel do Presidente (Rubinho) */}
            <button
              type="button"
              onClick={() => {
                setCategoriaAtiva('estrategia');
                setActiveTab('painel-presidente');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all border ${
                activeTab === 'painel-presidente'
                  ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/50 shadow-xs'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>Painel do Presidente</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-red-600 text-white">
                2
              </span>
            </button>
          </div>

          {/* Linha 2: Sub-módulos da Categoria Ativa (Espaçados, limpos e sem corte lateral) */}
          <nav className="flex items-center gap-2 py-2.5 overflow-x-auto scrollbar-none" aria-label="Sub-módulos da Categoria">
            {grupoAtual.tabs.map((tab) => {
              const IconeTab = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs rounded-lg transition-all relative shrink-0 ${
                    isActive
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 font-medium'
                  }`}
                  id={`tab-${tab.id}`}
                >
                  <IconeTab className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="whitespace-nowrap">{tab.label}</span>
                  {tab.badge && tab.badge > 0 ? (
                    <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold text-white whitespace-nowrap ${tab.badgeCor || 'bg-red-600'}`}>
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
