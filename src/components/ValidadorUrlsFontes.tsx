import { FC, useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Search,
  Sparkles,
  Bot,
  Activity,
  Check,
  Clock,
  Send,
  HelpCircle,
  Copy,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { LinkAccessLog, ValidacaoLinkResult, SugestaoCorrecaoLinkIa } from '../types';
import { AutoReparoLinkTooltip } from './AutoReparoLinkTooltip';

interface FonteParaValidar {
  id: string;
  nome: string;
  orgao: string;
  url: string;
  tipo: string;
  status: 'DISPONIVEL' | 'INDISPONIVEL' | 'PENDENTE';
  statusHttp?: number;
  latenciaMs?: number;
  ultimaVerificacao?: string;
  mensagem?: string;
}

const FONTES_INICIAIS: FonteParaValidar[] = [
  {
    id: 'f-dou',
    nome: 'Diário Oficial da União (Imprensa Nacional)',
    orgao: 'Imprensa Nacional / DOU',
    url: 'https://www.in.gov.br',
    tipo: 'Diário Oficial Federal',
    status: 'DISPONIVEL',
    statusHttp: 200,
    latenciaMs: 142,
    ultimaVerificacao: 'Recente',
    mensagem: 'Portal oficial autenticado e respondendo normalmente.',
  },
  {
    id: 'f-ioepa-portal',
    nome: 'Diário Oficial do Estado do Pará (IOEPA)',
    orgao: 'IOEPA / Governo do Pará',
    url: 'https://www.ioepa.com.br/portal/',
    tipo: 'Diário Oficial Estadual',
    status: 'DISPONIVEL',
    statusHttp: 200,
    latenciaMs: 215,
    ultimaVerificacao: 'Recente',
    mensagem: 'Portal oficial institucional acessível.',
  },
  {
    id: 'f-ioepa-semas-482',
    nome: 'Publicação Original: Resolução SEMAS nº 482/2026 (IOEPA)',
    orgao: 'DOE-PA / SEMAS-PA',
    url: 'https://www.ioepa.com.br/diario-oficial/semas-482-2026',
    tipo: 'Ato Regulatório Estadual',
    status: 'INDISPONIVEL',
    statusHttp: 404,
    latenciaMs: 280,
    ultimaVerificacao: 'Detectado 404',
    mensagem: '404 - Arquivo ou diretório não encontrado no portal da IOEPA.',
  },
  {
    id: 'f-rfb',
    nome: 'Receita Federal do Brasil (Normas & INs)',
    orgao: 'Receita Federal do Brasil',
    url: 'https://www.gov.br/receitafederal',
    tipo: 'Portal Regulatório Tributário',
    status: 'DISPONIVEL',
    statusHttp: 200,
    latenciaMs: 110,
    ultimaVerificacao: 'Recente',
    mensagem: 'Serviço normativo operacional.',
  },
  {
    id: 'f-cgibs',
    nome: 'Comitê Gestor do IBS (CG-IBS)',
    orgao: 'Ministério da Fazenda',
    url: 'https://www.gov.br/fazenda/cgibs',
    tipo: 'Reforma Tributária',
    status: 'DISPONIVEL',
    statusHttp: 200,
    latenciaMs: 195,
    ultimaVerificacao: 'Recente',
    mensagem: 'Resoluções de harmonização acessíveis.',
  },
  {
    id: 'f-nfse',
    nome: 'Portal de Gestão da NFS-e Padrão Nacional',
    orgao: 'RFB / Prefeituras',
    url: 'https://www.gov.br/nfse',
    tipo: 'Documento Fiscal Eletrônico',
    status: 'DISPONIVEL',
    statusHttp: 200,
    latenciaMs: 165,
    ultimaVerificacao: 'Recente',
    mensagem: 'Especificações técnicas da LC 116 ativas.',
  },
  {
    id: 'f-pncp',
    nome: 'Portal Nacional de Contratações Públicas (PNCP)',
    orgao: 'PNCP / Ministério da Gestão',
    url: 'https://pncp.gov.br/app/editais/cemiterio-belem-2026',
    tipo: 'Editais e Concessões',
    status: 'INDISPONIVEL',
    statusHttp: 404,
    latenciaMs: 340,
    ultimaVerificacao: 'Detectado 404',
    mensagem: '404 - Rota direta de edital não localizada ou movida para consulta unificada.',
  },
  {
    id: 'f-confaz',
    nome: 'Conselho Nacional de Política Fazendária (CONFAZ)',
    orgao: 'CONFAZ / SEFAZ',
    url: 'https://www.confaz.fazenda.gov.br',
    tipo: 'Convênios e Protocolos',
    status: 'DISPONIVEL',
    statusHttp: 200,
    latenciaMs: 180,
    ultimaVerificacao: 'Recente',
    mensagem: 'Convênios estaduais operacionais.',
  },
];

interface ValidadorUrlsFontesProps {
  onLinkCorrigido?: (urlAntiga: string, urlNova: string) => void;
}

export const ValidadorUrlsFontes: FC<ValidadorUrlsFontesProps> = ({ onLinkCorrigido }) => {
  // Estado das fontes em verificação
  const [fontes, setFontes] = useState<FonteParaValidar[]>(FONTES_INICIAIS);
  const [validandoId, setValidandoId] = useState<string | null>(null);
  const [validandoTudo, setValidandoTudo] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState<'TODOS' | 'DISPONIVEL' | 'INDISPONIVEL'>('TODOS');
  const [termoBusca, setTermoBusca] = useState('');

  // Modal Reportar Erro de Link
  const [modalReportarAberto, setModalReportarAberto] = useState(false);
  const [fonteParaReportar, setFonteParaReportar] = useState<FonteParaValidar | null>(null);
  const [motivoReporte, setMotivoReporte] = useState('Link retornando erro 404 ao tentar abrir a publicação oficial.');
  const [usuarioReporte, setUsuarioReporte] = useState('Rubinho (Presidente)');
  const [enviandoReporte, setEnviandoReporte] = useState(false);
  const [sucessoReporte, setSucessoReporte] = useState<string | null>(null);

  // Modal / Drawer de Correção Gemini IA
  const [drawerIaAberto, setDrawerIaAberto] = useState(false);
  const [fonteParaIa, setFonteParaIa] = useState<FonteParaValidar | null>(null);
  const [analisandoIa, setAnalisandoIa] = useState(false);
  const [resultadoIa, setResultadoIa] = useState<SugestaoCorrecaoLinkIa | null>(null);
  const [copiadoTexto, setCopiadoTexto] = useState(false);
  const [sucessoAplicacao, setSucessoAplicacao] = useState(false);

  // Painel de Monitoramento Interno de Logs (Admin)
  const [abaInterna, setAbaInterna] = useState<'validador' | 'monitoramento'>('validador');
  const [logs, setLogs] = useState<LinkAccessLog[]>([]);
  const [metricasLogs, setMetricasLogs] = useState({
    totalAcessos: 0,
    sucessos: 0,
    erros: 0,
    errosPendentes: 0,
    taxaSucesso: 100,
    horarioUltimaAtualizacao: '',
  });
  const [carregandoLogs, setCarregandoLogs] = useState(false);
  const [filtroLogStatus, setFiltroLogStatus] = useState<string>('TODOS');
  const [filtroLogBusca, setFiltroLogBusca] = useState<string>('');
  const [apenasNaoResolvidos, setApenasNaoResolvidos] = useState(false);
  const [resolvendoLogId, setResolvendoLogId] = useState<string | null>(null);

  // Carregar logs do servidor
  const carregarLogs = async () => {
    setCarregandoLogs(true);
    try {
      const params = new URLSearchParams();
      if (filtroLogStatus !== 'TODOS') params.append('status', filtroLogStatus);
      if (filtroLogBusca) params.append('busca', filtroLogBusca);
      if (apenasNaoResolvidos) params.append('apenasNaoResolvidos', 'true');

      const res = await fetch(`/api/links/logs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        if (data.metricas) {
          setMetricasLogs(data.metricas);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar logs de acesso a links:', err);
    } finally {
      setCarregandoLogs(false);
    }
  };

  useEffect(() => {
    carregarLogs();
  }, [filtroLogStatus, filtroLogBusca, apenasNaoResolvidos]);

  // Validar URL individual no servidor
  const handleValidarUrl = async (fonte: FonteParaValidar) => {
    setValidandoId(fonte.id);
    try {
      const res = await fetch('/api/links/validar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: fonte.url,
          orgao: fonte.orgao,
          titulo: fonte.nome,
          moduloOrigem: 'Validador de URLs Fontes Oficiais',
          usuario: 'Auditor de Fontes',
        }),
      });

      if (res.ok) {
        const data: ValidacaoLinkResult = await res.json();
        setFontes((prev) =>
          prev.map((f) =>
            f.id === fonte.id
              ? {
                  ...f,
                  status: data.disponivel ? 'DISPONIVEL' : 'INDISPONIVEL',
                  statusHttp: data.statusHttp,
                  latenciaMs: data.latenciaMs,
                  ultimaVerificacao: 'Agora mesmo',
                  mensagem: data.mensagem,
                }
              : f
          )
        );
      }
      carregarLogs();
    } catch {
      setFontes((prev) =>
        prev.map((f) =>
          f.id === fonte.id
            ? {
                ...f,
                status: 'INDISPONIVEL',
                statusHttp: 504,
                ultimaVerificacao: 'Agora mesmo',
                mensagem: 'Erro ao validar conexão com o servidor.',
              }
            : f
        )
      );
    } finally {
      setValidandoId(null);
    }
  };

  // Validar todas as fontes em lote
  const handleValidarTodas = async () => {
    setValidandoTudo(true);
    for (const fonte of fontes) {
      await handleValidarUrl(fonte);
    }
    setValidandoTudo(false);
  };

  // Enviar reporte de erro
  const handleEnviarReporte = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fonteParaReportar) return;

    setEnviandoReporte(true);
    setSucessoReporte(null);

    try {
      const res = await fetch('/api/links/reportar-erro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: fonteParaReportar.url,
          orgao: fonteParaReportar.orgao,
          tituloContexto: fonteParaReportar.nome,
          motivo: motivoReporte,
          usuario: usuarioReporte,
        }),
      });

      if (res.ok) {
        setSucessoReporte('Alerta de erro registrado com sucesso no painel de monitoramento do administrador!');
        // Atualiza o estado da fonte para INDISPONIVEL
        setFontes((prev) =>
          prev.map((f) =>
            f.id === fonteParaReportar.id
              ? {
                  ...f,
                  status: 'INDISPONIVEL',
                  statusHttp: 404,
                  mensagem: `Reportado por ${usuarioReporte}: ${motivoReporte}`,
                }
              : f
          )
        );
        carregarLogs();
        setTimeout(() => {
          setModalReportarAberto(false);
          setSucessoReporte(null);
        }, 2000);
      }
    } catch (err) {
      console.error('Erro ao reportar link:', err);
    } finally {
      setEnviandoReporte(false);
    }
  };

  // Executar busca reversa e autocorreção com a API Gemini
  const handleIniciarCorrecaoIa = async (fonte: FonteParaValidar) => {
    setFonteParaIa(fonte);
    setDrawerIaAberto(true);
    setAnalisandoIa(true);
    setResultadoIa(null);
    setSucessoAplicacao(false);

    try {
      const res = await fetch('/api/ia/corrigir-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          urlInvalida: fonte.url,
          tituloMateria: fonte.nome,
          orgao: fonte.orgao,
          erroDetectado: fonte.mensagem || 'HTTP 404 Not Found',
          aplicarAutomaticamente: false,
        }),
      });

      if (res.ok) {
        const data: SugestaoCorrecaoLinkIa = await res.json();
        setResultadoIa(data);
      }
    } catch (err) {
      console.error('Erro ao executar autocorreção Gemini IA:', err);
    } finally {
      setAnalisandoIa(false);
    }
  };

  // Aplicar a correção da URL sugerida pela IA
  const handleAplicarCorrecao = async () => {
    if (!fonteParaIa || !resultadoIa) return;

    const urlAntiga = fonteParaIa.url;
    const urlNova = resultadoIa.urlSugerida;

    // Atualizar no estado local
    setFontes((prev) =>
      prev.map((f) =>
        f.id === fonteParaIa.id
          ? {
              ...f,
              url: urlNova,
              status: 'DISPONIVEL',
              statusHttp: 200,
              mensagem: `Corrigido via Gemini IA: ${resultadoIa.acaoRecomendada}`,
              ultimaVerificacao: 'Atualizado agora',
            }
          : f
      )
    );

    // Notificar componente pai se houver callback
    if (onLinkCorrigido) {
      onLinkCorrigido(urlAntiga, urlNova);
    }

    // Registrar no monitor como log de resolução
    try {
      await fetch('/api/links/registrar-acesso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: urlNova,
          tituloContexto: `${fonteParaIa.nome} (URL Corrigida via Gemini IA)`,
          orgao: fonteParaIa.orgao,
          status: 'SUCESSO',
          httpStatus: 200,
          origemModulo: 'Autocorreção Gemini IA',
          mensagemErro: `URL substituída com sucesso: de ${urlAntiga} para ${urlNova}.`,
          usuario: 'Gemini IA & Operador',
        }),
      });
      carregarLogs();
    } catch (err) {
      console.error('Erro ao registrar log de correção:', err);
    }

    setSucessoAplicacao(true);
    setTimeout(() => {
      setDrawerIaAberto(false);
      setSucessoAplicacao(false);
    }, 2500);
  };

  // Marcar log como resolvido
  const handleResolverLog = async (logId: string) => {
    setResolvendoLogId(logId);
    try {
      const res = await fetch(`/api/links/logs/${logId}/resolver`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario: 'Administrador Radar Fiscal',
          observacao: 'Incidente de link analisado e resolvido pela equipe técnica.',
        }),
      });
      if (res.ok) {
        carregarLogs();
      }
    } catch (err) {
      console.error('Erro ao resolver log:', err);
    } finally {
      setResolvendoLogId(null);
    }
  };

  // Copiar termo de busca oficial
  const handleCopiarTermo = (termo: string) => {
    navigator.clipboard.writeText(termo);
    setCopiadoTexto(true);
    setTimeout(() => setCopiadoTexto(false), 2000);
  };

  // Filtragem de fontes
  const fontesFiltradas = fontes.filter((f) => {
    const matchStatus = filtroStatus === 'TODOS' || f.status === filtroStatus;
    const matchBusca =
      !termoBusca ||
      f.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
      f.orgao.toLowerCase().includes(termoBusca.toLowerCase()) ||
      f.url.toLowerCase().includes(termoBusca.toLowerCase());
    return matchStatus && matchBusca;
  });

  const totalDisponiveis = fontes.filter((f) => f.status === 'DISPONIVEL').length;
  const totalIndisponiveis = fontes.filter((f) => f.status === 'INDISPONIVEL').length;

  return (
    <div className="space-y-6" id="validador-urls-componente">
      {/* Barra de Seleção de Abas do Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setAbaInterna('validador')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold transition-colors ${
              abaInterna === 'validador'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            id="tab-btn-validador-links"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Validador de Integridade de Links</span>
            {totalIndisponiveis > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 text-rose-800 font-extrabold">
                {totalIndisponiveis}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setAbaInterna('monitoramento');
              carregarLogs();
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold transition-colors ${
              abaInterna === 'monitoramento'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            id="tab-btn-painel-monitoramento"
          >
            <Activity className="w-3.5 h-3.5 text-sky-600" />
            <span>Painel de Monitoramento Interno (Logs Admin)</span>
            {metricasLogs.errosPendentes > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-900 font-extrabold">
                {metricasLogs.errosPendentes}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {abaInterna === 'validador' ? (
            <button
              type="button"
              onClick={handleValidarTodas}
              disabled={validandoTudo}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
              id="btn-validar-todos-links"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${validandoTudo ? 'animate-spin' : ''}`} />
              <span>{validandoTudo ? 'Verificando Todos...' : 'Verificar Todos os Links'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={carregarLogs}
              disabled={carregandoLogs}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              id="btn-recarregar-logs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${carregandoLogs ? 'animate-spin' : ''}`} />
              <span>Atualizar Logs</span>
            </button>
          )}
        </div>
      </div>

      {/* ABA 1: VALIDADOR DE URLs */}
      {abaInterna === 'validador' && (
        <div className="space-y-4">
          {/* Card de Resumo de Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  Links Disponíveis (OK)
                </span>
                <p className="text-xl font-extrabold text-emerald-950 mt-0.5">{totalDisponiveis}</p>
                <span className="text-[10px] text-emerald-700">Respostas HTTP 200 / Ativos</span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">
                  Links Indisponíveis (404 / Falhas)
                </span>
                <p className="text-xl font-extrabold text-rose-950 mt-0.5">{totalIndisponiveis}</p>
                <span className="text-[10px] text-rose-700">Requerem correção ou busca reversa</span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>

            <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800">
                  Autocorreção Inteligente
                </span>
                <p className="text-xs font-bold text-sky-950 mt-1">API Gemini Conectada</p>
                <span className="text-[10px] text-sky-700">Busca reversa heurística ativa</span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center text-sky-700">
                <Sparkles className="w-5 h-5 text-sky-600" />
              </div>
            </div>
          </div>

          {/* Filtros e Busca */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                placeholder="Filtrar por nome, órgão ou URL..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto text-xs">
              <span className="text-slate-500 text-[11px] font-medium mr-1">Filtrar:</span>
              <button
                type="button"
                onClick={() => setFiltroStatus('TODOS')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                  filtroStatus === 'TODOS'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todos ({fontes.length})
              </button>
              <button
                type="button"
                onClick={() => setFiltroStatus('DISPONIVEL')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                  filtroStatus === 'DISPONIVEL'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                Disponíveis ({totalDisponiveis})
              </button>
              <button
                type="button"
                onClick={() => setFiltroStatus('INDISPONIVEL')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                  filtroStatus === 'INDISPONIVEL'
                    ? 'bg-rose-700 text-white'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                }`}
              >
                Indisponíveis ({totalIndisponiveis})
              </button>
            </div>
          </div>

          {/* Lista de Links Auditados */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs divide-y divide-slate-100">
            {fontesFiltradas.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Nenhum link encontrado com os filtros selecionados.
              </div>
            ) : (
              fontesFiltradas.map((fonte) => {
                const isDisponivel = fonte.status === 'DISPONIVEL';
                const isVerificando = validandoId === fonte.id;

                return (
                  <div
                    key={fonte.id}
                    className={`p-4 transition-colors ${
                      isDisponivel ? 'hover:bg-slate-50/70' : 'bg-rose-50/30 hover:bg-rose-50/50'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      {/* Informações da Fonte */}
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">{fonte.nome}</h4>

                          {/* Status Badge */}
                          {isDisponivel ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Link Disponível</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              <span>Link Indisponível (Erro 404)</span>
                            </span>
                          )}

                          {fonte.statusHttp && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              HTTP {fonte.statusHttp}
                            </span>
                          )}

                          {fonte.latenciaMs !== undefined && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              {fonte.latenciaMs}ms
                            </span>
                          )}
                        </div>

                        {/* URL e Órgão */}
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                          <span className="font-semibold text-slate-700">{fonte.orgao}</span>
                          <span>•</span>
                          <span className="font-mono text-slate-600 break-all max-w-xl truncate">
                            {fonte.url}
                          </span>
                        </div>

                        {/* Mensagem de Diagnóstico */}
                        {fonte.mensagem && (
                          <p
                            className={`text-[11px] leading-relaxed ${
                              isDisponivel ? 'text-slate-600' : 'text-rose-800 font-medium'
                            }`}
                          >
                            {fonte.mensagem}
                          </p>
                        )}
                      </div>

                      {/* Ações */}
                      <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                        {/* Botão Testar Conexão */}
                        <button
                          type="button"
                          onClick={() => handleValidarUrl(fonte)}
                          disabled={isVerificando}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                          title="Verificar status atual da URL"
                        >
                          <RefreshCw className={`w-3 h-3 ${isVerificando ? 'animate-spin' : ''}`} />
                          <span>{isVerificando ? 'Testando...' : 'Verificar'}</span>
                        </button>

                        {/* Botão Acessar Link Externo com Auto-reparo via Tooltip de Ação */}
                        <AutoReparoLinkTooltip
                          urlOriginal={fonte.url}
                          tituloMateria={fonte.nome}
                          dataPublicacao="17/09/2026"
                          orgao={fonte.orgao}
                          isErro404={fonte.statusHttp === 404 || !isDisponivel}
                          onLinkAtualizado={(novaUrl) => {
                            const urlAntiga = fonte.url;
                            setFontes((prev) =>
                              prev.map((f) =>
                                f.id === fonte.id
                                  ? {
                                      ...f,
                                      url: novaUrl,
                                      status: 'DISPONIVEL',
                                      statusHttp: 200,
                                      mensagem: `Auto-reparado com sucesso via Gemini IA.`,
                                      ultimaVerificacao: 'Atualizado agora',
                                    }
                                  : f
                              )
                            );
                            if (onLinkCorrigido) {
                              onLinkCorrigido(urlAntiga, novaUrl);
                            }
                          }}
                          posicao="bottom"
                        >
                          <a
                            href={fonte.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg transition-colors"
                            title="Abrir URL em nova aba"
                          >
                            <span>Acessar</span>
                            <ExternalLink className="w-3 h-3 text-slate-500" />
                          </a>
                        </AutoReparoLinkTooltip>

                        {/* Botão Reportar Erro de Link */}
                        <button
                          type="button"
                          onClick={() => {
                            setFonteParaReportar(fonte);
                            setMotivoReporte(
                              fonte.statusHttp === 404
                                ? 'Link retornando erro 404 - Publicação não encontrada no portal.'
                                : 'Link indisponível ou inacessível no momento.'
                            );
                            setModalReportarAberto(true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                          title="Reportar erro de link para a equipe técnica"
                          id={`btn-reportar-link-${fonte.id}`}
                        >
                          <AlertTriangle className="w-3 h-3 text-amber-700" />
                          <span>Reportar erro</span>
                        </button>

                        {/* Se indisponível ou 404, Botão de Autocorreção Gemini IA */}
                        {!isDisponivel && (
                          <button
                            type="button"
                            onClick={() => handleIniciarCorrecaoIa(fonte)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-all cursor-pointer"
                            id={`btn-corrigir-ia-${fonte.id}`}
                            title="Recuperar link correto via busca reversa com Gemini IA"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Corrigir com IA</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ABA 2: PAINEL DE MONITORAMENTO INTERNO (LOGS DO ADMINISTRADOR) */}
      {abaInterna === 'monitoramento' && (
        <div className="space-y-4" id="painel-monitoramento-admin">
          {/* Métricas do Monitoramento */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Total de Acessos Auditados
              </span>
              <p className="text-xl font-extrabold text-slate-900 mt-1">{metricasLogs.totalAcessos}</p>
              <span className="text-[10px] text-slate-400">Registros em tempo real</span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Taxa de Sucesso (200 OK)
              </span>
              <p className="text-xl font-extrabold text-emerald-700 mt-1">{metricasLogs.taxaSucesso}%</p>
              <span className="text-[10px] text-emerald-600">{metricasLogs.sucessos} acessos íntegros</span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                Erros Detectados (404/Falhas)
              </span>
              <p className="text-xl font-extrabold text-rose-700 mt-1">{metricasLogs.erros}</p>
              <span className="text-[10px] text-rose-600">Incidentes registrados</span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                Pendentes de Resolução
              </span>
              <p className="text-xl font-extrabold text-amber-800 mt-1">{metricasLogs.errosPendentes}</p>
              <span className="text-[10px] text-amber-700">Aguardando ajuste técnico</span>
            </div>
          </div>

          {/* Barra de Filtros e Busca de Logs */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xs">
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={filtroLogBusca}
                  onChange={(e) => setFiltroLogBusca(e.target.value)}
                  placeholder="Pesquisar URL, órgão, mensagem..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <select
                value={filtroLogStatus}
                onChange={(e) => setFiltroLogStatus(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 px-2.5 py-1.5 rounded-lg focus:outline-none"
              >
                <option value="TODOS">Todos os Status</option>
                <option value="ERRO">Apenas Erros (404 / Falhas)</option>
                <option value="SUCESSO">Apenas Sucessos (200 OK)</option>
              </select>

              <label className="flex items-center gap-1.5 text-xs text-slate-700 font-medium cursor-pointer ml-2">
                <input
                  type="checkbox"
                  checked={apenasNaoResolvidos}
                  onChange={(e) => setApenasNaoResolvidos(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500 w-3.5 h-3.5"
                />
                <span>Apenas não resolvidos</span>
              </label>
            </div>

            <div className="text-[11px] text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Log administrativo para manutenção contínua das integrações</span>
            </div>
          </div>

          {/* Tabela Detalhada de Logs para o Administrador */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 text-slate-700 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Status / Código</th>
                    <th className="py-2.5 px-3">URL Acessada</th>
                    <th className="py-2.5 px-3">Órgão / Contexto</th>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Origem / Usuário</th>
                    <th className="py-2.5 px-3">Diagnóstico / Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                        Nenhum registro de acesso a link registrado com estes filtros.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => {
                      const isErro = log.status === 'ERRO' || log.httpStatus >= 400;
                      return (
                        <tr
                          key={log.id}
                          className={`hover:bg-slate-50 transition-colors ${
                            isErro && !log.resolvido ? 'bg-rose-50/20' : ''
                          }`}
                        >
                          {/* Status / Código */}
                          <td className="py-3 px-3 align-top whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              {isErro ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                  HTTP {log.httpStatus}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  <CheckCircle2 className="w-2.5 h-2.5" />
                                  HTTP {log.httpStatus}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400 font-mono">
                                {log.tempoRespostaMs}ms
                              </span>
                            </div>
                            {log.reportadoPorUsuario && (
                              <span className="inline-block mt-1 px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold text-[9px]">
                                Reportado por Usuário
                              </span>
                            )}
                          </td>

                          {/* URL */}
                          <td className="py-3 px-3 align-top max-w-xs">
                            <div className="font-mono text-[11px] text-slate-900 break-all">
                              {log.url}
                            </div>
                            {log.urlCorrigida && (
                              <div className="text-[10px] text-emerald-700 font-medium mt-0.5 flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                <span>Corrigido para: {log.urlCorrigida}</span>
                              </div>
                            )}
                          </td>

                          {/* Órgão / Contexto */}
                          <td className="py-3 px-3 align-top">
                            <div className="font-bold text-slate-900 text-xs">{log.orgao || 'Oficial'}</div>
                            <div className="text-[11px] text-slate-500 line-clamp-1">
                              {log.tituloContexto || 'Acesso a Link Externo'}
                            </div>
                          </td>

                          {/* Timestamp */}
                          <td className="py-3 px-3 align-top whitespace-nowrap text-[11px] text-slate-500 font-mono">
                            {log.timestamp.replace('T', ' ').slice(0, 19)}
                          </td>

                          {/* Origem / Usuário */}
                          <td className="py-3 px-3 align-top whitespace-nowrap text-[11px]">
                            <span className="font-semibold text-slate-800 block">{log.origemModulo}</span>
                            <span className="text-slate-500 text-[10px]">{log.usuario || 'Sistema'}</span>
                          </td>

                          {/* Diagnóstico / Ação */}
                          <td className="py-3 px-3 align-top">
                            {log.mensagemErro && (
                              <div className="text-[11px] text-rose-800 mb-1 leading-snug">
                                {log.mensagemErro}
                              </div>
                            )}

                            {log.sugestaoIa && (
                              <div className="p-1.5 rounded bg-sky-50 border border-sky-200 text-[10px] text-sky-900 mb-1.5">
                                <span className="font-bold block text-sky-950">Sugestão Gemini IA:</span>
                                {log.sugestaoIa}
                              </div>
                            )}

                            <div className="flex items-center gap-1.5 mt-1">
                              {isErro && !log.resolvido && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleIniciarCorrecaoIa({
                                        id: log.id,
                                        nome: log.tituloContexto || 'Publicação',
                                        orgao: log.orgao || 'Portal Oficial',
                                        url: log.url,
                                        tipo: 'Ato Oficial',
                                        status: 'INDISPONIVEL',
                                        statusHttp: log.httpStatus,
                                        mensagem: log.mensagemErro,
                                      })
                                    }
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded text-[10px] font-bold transition-colors cursor-pointer"
                                  >
                                    <Sparkles className="w-2.5 h-2.5" />
                                    <span>Corrigir com IA</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleResolverLog(log.id)}
                                    disabled={resolvendoLogId === log.id}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-[10px] font-bold transition-colors cursor-pointer"
                                  >
                                    <Check className="w-2.5 h-2.5" />
                                    <span>Resolver</span>
                                  </button>
                                </>
                              )}

                              {log.resolvido && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Resolvido</span>
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REPORTAR ERRO DE LINK */}
      {modalReportarAberto && fonteParaReportar && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Reportar Erro de Link à Equipe Técnica</h3>
                  <p className="text-[11px] text-slate-500">
                    O alerta será registrado no Painel de Monitoramento com URL, timestamp e status.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalReportarAberto(false)}
                className="text-slate-400 hover:text-slate-600 p-1 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEnviarReporte} className="space-y-3">
              {/* Informações da Publicação */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div>
                  <span className="text-slate-500 text-[10px] block">Publicação / Órgão:</span>
                  <span className="font-bold text-slate-900">{fonteParaReportar.nome}</span> ({fonteParaReportar.orgao})
                </div>
                <div className="pt-1">
                  <span className="text-slate-500 text-[10px] block">URL que apresentou erro:</span>
                  <span className="font-mono text-[11px] text-slate-700 break-all">{fonteParaReportar.url}</span>
                </div>
              </div>

              {/* Motivo do Reporte */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Descrição do Erro Encontrado:
                </label>
                <textarea
                  rows={3}
                  value={motivoReporte}
                  onChange={(e) => setMotivoReporte(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>

              {/* Identificação do Usuário */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Identificação do Usuário / Cargo:
                </label>
                <input
                  type="text"
                  value={usuarioReporte}
                  onChange={(e) => setUsuarioReporte(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>

              {sucessoReporte && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{sucessoReporte}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalReportarAberto(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={enviandoReporte}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-2xs"
                  id="btn-confirmar-reporte-erro"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{enviandoReporte ? 'Enviando...' : 'Registrar Alerta'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DRAWER / MODAL: BUSCA REVERSA E AUTOCORREÇÃO GEMINI IA */}
      {drawerIaAberto && fonteParaIa && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Autocorreção de Links com Gemini IA</span>
                    <span className="px-2 py-0.2 rounded-full text-[9px] bg-sky-100 text-sky-800 font-extrabold">
                      Busca Reversa 404
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Localização heurística de URL ativa e termos oficiais de busca no portal correspondente.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDrawerIaAberto(false)}
                className="text-slate-400 hover:text-slate-600 p-1 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* URL com Erro Original */}
            <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl text-xs space-y-1">
              <span className="text-rose-900 font-bold block flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                URL com Erro 404 Detectada:
              </span>
              <span className="font-mono text-rose-950 text-[11px] break-all block">
                {fonteParaIa.url}
              </span>
              <span className="text-[10px] text-rose-700 block mt-0.5">
                Publicação: {fonteParaIa.nome} ({fonteParaIa.orgao})
              </span>
            </div>

            {/* Carregando Análise da IA */}
            {analisandoIa && (
              <div className="p-8 text-center space-y-3 bg-slate-50 rounded-xl border border-slate-200">
                <RefreshCw className="w-6 h-6 text-sky-600 animate-spin mx-auto" />
                <div className="text-xs font-bold text-slate-800">
                  Gemini IA analisando a rota do Diário Oficial...
                </div>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  Consultando heurística de portais de imprensa oficial (IOEPA, DOU, SEMAS, RFB) para identificar a URL institucional ativa.
                </p>
              </div>
            )}

            {/* Resultado da Autocorreção */}
            {resultadoIa && !analisandoIa && (
              <div className="space-y-4 text-xs">
                {/* Diagnóstico do Motivo da Quebra */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Motivo da Inacessibilidade (Diagnóstico Técnico)
                  </span>
                  <p className="text-slate-800 text-[11px] leading-relaxed">
                    {resultadoIa.motivoQuebra}
                  </p>
                </div>

                {/* URL Sugerida Oficial */}
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      URL Institucional Correta Recomendada
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-extrabold text-[10px]">
                      Confiança: {resultadoIa.confianca}
                    </span>
                  </div>

                  <div className="p-2 bg-white rounded-lg border border-emerald-300 font-mono text-xs text-emerald-950 break-all flex items-center justify-between gap-2">
                    <span>{resultadoIa.urlSugerida}</span>
                    <a
                      href={resultadoIa.urlSugerida}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 rounded hover:bg-emerald-50 text-emerald-700 shrink-0"
                      title="Testar URL sugerida em nova aba"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <span className="text-[11px] text-emerald-800 font-medium block">
                    Portal: {resultadoIa.nomePortalOficial}
                  </span>
                </div>

                {/* Termo Exato de Busca no Diário Oficial */}
                <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-sky-800 tracking-wider">
                      Termo de Busca Oficial no Portal
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopiarTermo(resultadoIa.termoBuscaOficial)}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-700 hover:text-sky-900 cursor-pointer"
                    >
                      {copiadoTexto ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiadoTexto ? 'Copiado!' : 'Copiar Termo'}</span>
                    </button>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-sky-300 font-mono text-xs text-sky-950 font-bold">
                    "{resultadoIa.termoBuscaOficial}"
                  </div>
                </div>

                {/* Passos de Recuperação */}
                {resultadoIa.passosRecuperacao && resultadoIa.passosRecuperacao.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider block">
                      Passo a Passo de Recuperação do Ato Regulatório:
                    </span>
                    <div className="space-y-1">
                      {resultadoIa.passosRecuperacao.map((passo, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-700">
                          <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{passo}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {sucessoAplicacao && (
                  <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>URL corrigida com sucesso e sincronizada no Radar Fiscal!</span>
                  </div>
                )}

                {/* Ações Finais */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setDrawerIaAberto(false)}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                  >
                    Fechar
                  </button>

                  <button
                    type="button"
                    onClick={handleAplicarCorrecao}
                    disabled={sucessoAplicacao}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
                    id="btn-aplicar-correcao-ia"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{sucessoAplicacao ? 'Aplicado com Sucesso!' : 'Aplicar Correção Automática'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
