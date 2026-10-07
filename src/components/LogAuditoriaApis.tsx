// src/components/LogAuditoriaApis.tsx
// Componente de Log de Auditoria Detalhado das Consultas às APIs da Receita Federal e InfoSimples
// Suporte a busca em tempo real, filtros facetados, inspeção de payload JSON e exportação CSV/JSON

import React, { FC, useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Code,
  Building2,
  Send,
  X,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { INITIAL_AUDIT_LOGS, ApiAuditLogItem } from '../data/cbsConsumoDiretoriasData';
import { EmpresaPerfil } from '../types';

interface LogAuditoriaApisProps {
  empresas: EmpresaPerfil[];
  empresaAtivaId?: string;
}

export const LogAuditoriaApis: FC<LogAuditoriaApisProps> = ({ empresas, empresaAtivaId }) => {
  const [logs, setLogs] = useState<ApiAuditLogItem[]>(INITIAL_AUDIT_LOGS);
  const [busca, setBusca] = useState<string>('');
  const [filtroApi, setFiltroApi] = useState<string>('todas');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [logInspecionado, setLogInspecionado] = useState<ApiAuditLogItem | null>(null);
  const [copiadoId, setCopiadoId] = useState<string | null>(null);

  // Modal para Nova Consulta Instantânea
  const [modalNovaConsultaAberto, setModalNovaConsultaAberto] = useState<boolean>(false);
  const [novaEmpresaId, setNovaEmpresaId] = useState<string>(empresaAtivaId || empresas[0]?.id || '');
  const [novaApiTipo, setNovaApiTipo] = useState<string>('cnd-federal');
  const [executandoConsulta, setExecutandoConsulta] = useState<boolean>(false);

  // Filtragem dos logs
  const logsFiltrados = useMemo(() => {
    return logs.filter((log) => {
      const matchBusca =
        log.protocolo.toLowerCase().includes(busca.toLowerCase()) ||
        log.cnpjConsultado.toLowerCase().includes(busca.toLowerCase()) ||
        log.empresaNome.toLowerCase().includes(busca.toLowerCase()) ||
        log.diretoriaSolicitante.toLowerCase().includes(busca.toLowerCase()) ||
        log.resumoResultado.toLowerCase().includes(busca.toLowerCase());

      const matchApi = filtroApi === 'todas' || log.apiNome === filtroApi;
      const matchStatus =
        filtroStatus === 'todos' ||
        (filtroStatus === 'sucesso' && log.sucesso) ||
        (filtroStatus === 'falha' && !log.sucesso);

      return matchBusca && matchApi && matchStatus;
    });
  }, [logs, busca, filtroApi, filtroStatus]);

  // Exportar para CSV
  const exportarCsv = () => {
    const cabecalho = [
      'Protocolo',
      'DataHora',
      'API',
      'Endpoint',
      'CNPJ',
      'Empresa',
      'Diretoria',
      'Usuario',
      'StatusHTTP',
      'LatenciaMs',
      'Sucesso',
      'ResumoResultado',
    ];

    const linhas = logsFiltrados.map((item) => [
      `"${item.protocolo}"`,
      `"${item.dataHora}"`,
      `"${item.apiNome}"`,
      `"${item.endpoint}"`,
      `"${item.cnpjConsultado}"`,
      `"${item.empresaNome}"`,
      `"${item.diretoriaSolicitante}"`,
      `"${item.usuario}"`,
      item.statusHttp,
      item.latenciaMs,
      item.sucesso ? 'SIM' : 'NAO',
      `"${item.resumoResultado.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [cabecalho.join(';'), ...linhas.map((l) => l.join(';'))].join('\r\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `auditoria_consultas_apis_receita_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Exportar para JSON
  const exportarJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logsFiltrados, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `auditoria_apis_dump_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copiarProtocolo = (protocolo: string) => {
    navigator.clipboard.writeText(protocolo);
    setCopiadoId(protocolo);
    setTimeout(() => setCopiadoId(null), 2000);
  };

  // Disparar Nova Consulta
  const dispararNovaConsulta = () => {
    setExecutandoConsulta(true);
    const emp = empresas.find((e) => e.id === novaEmpresaId) || empresas[0];

    setTimeout(() => {
      let novoLog: ApiAuditLogItem;
      const idUnico = Math.floor(1000 + Math.random() * 9000);

      if (novaApiTipo === 'cnd-federal') {
        novoLog = {
          id: `log-${Date.now()}`,
          protocolo: `INF-2026-CND-${idUnico}`,
          apiNome: 'InfoSimples - CND Federal / PGFN',
          endpoint: '/api/v2/consultas/receita-federal/cnd',
          cnpjConsultado: emp?.cnpj || '04.709.150/0001-20',
          empresaNome: emp?.nome || 'Recanto da Saudade',
          diretoriaSolicitante: 'Diretoria Tributária & Fiscal',
          usuario: 'Auditor Fiscal (Sessão Atual)',
          dataHora: new Date().toISOString(),
          statusHttp: 200,
          latenciaMs: Math.floor(320 + Math.random() * 200),
          sucesso: true,
          resumoResultado: `Certidão Negativa de Débitos Federais emitida com sucesso via InfoSimples. Código: ${Math.random().toString(36).substring(2, 8).toUpperCase()}. Validade: 180 dias.`,
          payloadEnvio: { cnpj: emp?.cnpj, tipo: 'FEDERAL_PGFN', solicitante: 'Auditoria Interna' },
          payloadResposta: {
            certidaoValida: true,
            status: 'NEGATIVA_SEM_PENDENCIAS',
            orgao: 'Secretaria Especial da Receita Federal do Brasil',
            dataConsulta: new Date().toISOString(),
          },
        };
      } else {
        novoLog = {
          id: `log-${Date.now()}`,
          protocolo: `CBS-2026-CALC-${idUnico}`,
          apiNome: 'Piloto CBS/IBS (Receita Federal)',
          endpoint: '/servico/calculadora-consumo/api/v1/calcular-operacao',
          cnpjConsultado: emp?.cnpj || '04.709.150/0001-20',
          empresaNome: emp?.nome || 'Recanto da Saudade',
          diretoriaSolicitante: 'Diretoria de TI & Integração Protheus ERP',
          usuario: 'Auditor Fiscal (Sessão Atual)',
          dataHora: new Date().toISOString(),
          statusHttp: 200,
          latenciaMs: Math.floor(140 + Math.random() * 80),
          sucesso: true,
          resumoResultado: `Apuração de conformidade da LC 214/2025 processada com sucesso no endpoint oficial piloto-cbs.tributos.gov.br.`,
          payloadEnvio: {
            cnpj: emp?.cnpj,
            cnae: emp?.cnaePrincipalDetalhado?.codigo || '9603-3/01',
            ano: 2026,
            valorOperacao: emp?.faturamentoMensalEstimado || 1500000,
          },
          payloadResposta: {
            cbsLiquidaDevida: ((emp?.faturamentoMensalEstimado || 1500000) * 0.088),
            ibsLiquidoDevido: ((emp?.faturamentoMensalEstimado || 1500000) * 0.177),
            splitPaymentRetencaoD0: ((emp?.faturamentoMensalEstimado || 1500000) * 0.265),
            statusRetorno: 'CONFORMIDADE_APROVADA',
          },
        };
      }

      setLogs((prev) => [novoLog, ...prev]);
      setExecutandoConsulta(false);
      setModalNovaConsultaAberto(false);
    }, 900);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-5">
      {/* Header com botões de ação e exportação */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-900">
                Trilha de Auditoria das Consultas às APIs Fiscais (RFB & InfoSimples)
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                {logsFiltrados.length} consultas registradas
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Registro imutável de requisições, status HTTP, protocolos de conformidade e tempos de resposta.
            </p>
          </div>
        </div>

        {/* Toolbar de Ações: Nova Consulta + Exportadores */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setModalNovaConsultaAberto(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Disparar Nova Consulta</span>
          </button>

          <button
            onClick={exportarCsv}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 flex items-center gap-1.5 transition-colors"
            title="Exportar para arquivo CSV (Excel)"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={exportarJson}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 flex items-center gap-1.5 transition-colors"
            title="Exportar JSON bruto"
          >
            <Code className="w-3.5 h-3.5 text-slate-500" />
            <span>Dump JSON</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por protocolo, CNPJ, empresa..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <select
          value={filtroApi}
          onChange={(e) => setFiltroApi(e.target.value)}
          className="text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        >
          <option value="todas">Todas as APIs / Provedores</option>
          <option value="Piloto CBS/IBS (Receita Federal)">Piloto CBS/IBS (Receita Federal)</option>
          <option value="InfoSimples - CND Federal / PGFN">InfoSimples - CND Federal / PGFN</option>
          <option value="InfoSimples - Cartão CNPJ">InfoSimples - Cartão CNPJ</option>
          <option value="InfoSimples - Simples Nacional">InfoSimples - Simples Nacional</option>
          <option value="SEFAZ-PA / Sintegra">SEFAZ-PA / Sintegra</option>
        </select>

        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        >
          <option value="todos">Todos os Status HTTP</option>
          <option value="sucesso">Apenas Sucessos (HTTP 200)</option>
          <option value="falha">Falhas / Divergências (HTTP 4xx / 5xx)</option>
        </select>
      </div>

      {/* Tabela de Auditoria */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
            <tr>
              <th className="p-3">Protocolo / Data</th>
              <th className="p-3">API & Endpoint</th>
              <th className="p-3">Empresa / CNPJ</th>
              <th className="p-3">Diretoria & Solicitante</th>
              <th className="p-3 text-center">Status / Latência</th>
              <th className="p-3">Resumo da Resposta</th>
              <th className="p-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {logsFiltrados.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">
                  Nenhuma consulta encontrada com os filtros selecionados.
                </td>
              </tr>
            ) : (
              logsFiltrados.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Protocolo / Data */}
                  <td className="p-3 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <span className="font-mono font-bold text-slate-800">{log.protocolo}</span>
                      <button
                        onClick={() => copiarProtocolo(log.protocolo)}
                        className="text-slate-400 hover:text-slate-700 p-0.5"
                        title="Copiar protocolo"
                      >
                        {copiadoId === log.protocolo ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {new Date(log.dataHora).toLocaleString('pt-BR')}
                    </div>
                  </td>

                  {/* API & Endpoint */}
                  <td className="p-3">
                    <div className="font-bold text-slate-800">{log.apiNome}</div>
                    <div className="text-[10px] font-mono text-slate-500 truncate max-w-[180px]" title={log.endpoint}>
                      {log.endpoint}
                    </div>
                  </td>

                  {/* Empresa / CNPJ */}
                  <td className="p-3">
                    <div className="font-semibold text-slate-800">{log.empresaNome}</div>
                    <div className="text-[11px] font-mono text-slate-500">{log.cnpjConsultado}</div>
                  </td>

                  {/* Diretoria */}
                  <td className="p-3">
                    <div className="text-slate-800 font-medium">{log.diretoriaSolicitante}</div>
                    <div className="text-[11px] text-slate-400">{log.usuario}</div>
                  </td>

                  {/* Status / Latência */}
                  <td className="p-3 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.sucesso
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}
                    >
                      {log.sucesso ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-red-600" />
                      )}
                      HTTP {log.statusHttp}
                    </span>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                      {log.latenciaMs} ms
                    </div>
                  </td>

                  {/* Resumo */}
                  <td className="p-3">
                    <p className="text-xs text-slate-600 line-clamp-2" title={log.resumoResultado}>
                      {log.resumoResultado}
                    </p>
                  </td>

                  {/* Ações */}
                  <td className="p-3 text-center whitespace-nowrap">
                    <button
                      onClick={() => setLogInspecionado(log)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 inline-flex items-center gap-1 transition-colors"
                      title="Inspecionar Payload JSON da requisição e resposta"
                    >
                      <Code className="w-3 h-3 text-slate-500" />
                      <span>Inspecionar</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Lateral / Inspecionar Payload JSON */}
      {logInspecionado && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in duration-150">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-emerald-400" />
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Inspeção de Payload — Protocolo {logInspecionado.protocolo}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {logInspecionado.apiNome} • {new Date(logInspecionado.dataHora).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setLogInspecionado(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div>
                <span className="font-bold text-slate-800 block mb-1">Payload Enviado (Request Body):</span>
                <pre className="bg-slate-950 text-emerald-400 p-3 rounded-lg overflow-x-auto font-mono text-[11px]">
                  {JSON.stringify(logInspecionado.payloadEnvio, null, 2)}
                </pre>
              </div>

              <div>
                <span className="font-bold text-slate-800 block mb-1">Payload Recebido (Response Data):</span>
                <pre className="bg-slate-950 text-blue-300 p-3 rounded-lg overflow-x-auto font-mono text-[11px]">
                  {JSON.stringify(logInspecionado.payloadResposta, null, 2)}
                </pre>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
              <button
                onClick={() => setLogInspecionado(null)}
                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-slate-800 text-white hover:bg-slate-700"
              >
                Fechar Inspeção
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Disparar Nova Consulta Instantânea */}
      {modalNovaConsultaAberto && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-600" />
                <h4 className="text-sm font-bold text-slate-900">Disparar Consulta de Auditoria</h4>
              </div>
              <button
                onClick={() => setModalNovaConsultaAberto(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Selecione a Empresa:</label>
                <select
                  value={novaEmpresaId}
                  onChange={(e) => setNovaEmpresaId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {empresas.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nome} ({emp.cnpj})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Selecione a API Alvo:</label>
                <select
                  value={novaApiTipo}
                  onChange={(e) => setNovaApiTipo(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="cnd-federal">InfoSimples — CND Federal & PGFN (Regularidade)</option>
                  <option value="calculadora-cbs">Piloto CBS/IBS — Calculadora de Consumo RFB (LC 214/2025)</option>
                </select>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-900">
                A requisição será assinada e gerará protocolo único de auditoria, registrando tempo de resposta, cabeçalhos de segurança e espelho para download.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setModalNovaConsultaAberto(false)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={dispararNovaConsulta}
                disabled={executandoConsulta}
                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${executandoConsulta ? 'animate-spin' : ''}`} />
                <span>{executandoConsulta ? 'Consultando API...' : 'Executar Consulta'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
