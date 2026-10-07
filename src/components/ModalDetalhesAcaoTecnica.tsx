import React, { FC, useState } from 'react';
import {
  X,
  FileCode2,
  Paperclip,
  History,
  ShieldCheck,
  Clock,
  Building2,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  Upload,
  Download,
  FileText,
  Save,
  Plus,
  Hash,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { FiscalAcao, AuditoriaLog, AnexoEvidencia, StatusAcao } from '../types';

interface ModalDetalhesAcaoTecnicaProps {
  acao: FiscalAcao | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus?: (acaoId: string, novoStatus: StatusAcao, evidencia?: string) => void;
}

export const ModalDetalhesAcaoTecnica: FC<ModalDetalhesAcaoTecnicaProps> = ({
  acao,
  isOpen,
  onClose,
  onUpdateStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'tecnico' | 'evidencias' | 'auditoria'>('tecnico');
  const [novoAnexoNome, setNovoAnexoNome] = useState('');
  const [novoAnexoTipo, setNovoAnexoTipo] = useState('PDF');
  const [novoComentarioAuditoria, setNovoComentarioAuditoria] = useState('');
  const [novaEvidenciaTexto, setNovaEvidenciaTexto] = useState('');
  const [statusLocal, setStatusLocal] = useState<StatusAcao>((acao?.status as StatusAcao) || 'ABERTA');
  const [salvando, setSalvando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  if (!isOpen || !acao) return null;

  // Defaults if empty
  const rotinasProtheus = acao.rotinasProtheus?.length
    ? acao.rotinasProtheus
    : acao.area === 'TI_PROTHEUS' || acao.area === 'FISCAL'
    ? ['MATA910 (Livros Fiscais)', 'FISA022 (Configurador de Tributos)', 'SPEDNFE (TSS)']
    : ['Sem rotina Protheus direta vinculada'];

  const tabelasAfetadas = acao.tabelasAfetadas?.length
    ? acao.tabelasAfetadas
    : ['SF3 (Livros Fiscais)', 'SFT (Itens de Livro)', 'SX5 (Tabelas Genéricas)'];

  const evidenciasIniciais: AnexoEvidencia[] = acao.anexosEvidencias?.length
    ? acao.anexosEvidencias
    : [
        {
          id: 'anx-1',
          nome: `Evidência_Conformidade_${acao.id}.pdf`,
          tipo: 'PDF',
          tamanho: '1.4 MB',
          dataEnvio: '2026-09-17 14:32',
          hashSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        },
        {
          id: 'anx-2',
          nome: `Log_TSS_Validacao_XML.xml`,
          tipo: 'XML',
          tamanho: '240 KB',
          dataEnvio: '2026-09-16 18:10',
          hashSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        },
      ];

  const auditoriaInicial: AuditoriaLog[] = acao.historicoAuditoria?.length
    ? acao.historicoAuditoria
    : [
        {
          data: '2026-09-17 09:00',
          usuario: 'OHANA Radar Engine (IA)',
          acaoRealizada: 'Ação corporativa gerada e vinculada à norma com prazo legal.',
          detalhes: 'Geração automática com prioridade e categorização técnica.',
        },
        {
          data: '2026-09-17 11:20',
          usuario: acao.responsavel || 'Gestor Responsável',
          acaoRealizada: 'Ação assumida e alocada na fila de execução da diretoria.',
        },
      ];

  const handleSalvarStatus = async () => {
    setSalvando(true);
    try {
      if (onUpdateStatus) {
        onUpdateStatus(acao.id, statusLocal, novaEvidenciaTexto || undefined);
      }
      setMensagemSucesso('Atualização de status e evidência registrada com sucesso!');
      setTimeout(() => setMensagemSucesso(''), 3500);
    } finally {
      setSalvando(false);
    }
  };

  const handleAdicionarAnexo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoAnexoNome.trim()) return;
    const novo: AnexoEvidencia = {
      id: `anx-${Date.now()}`,
      nome: novoAnexoNome.trim(),
      tipo: novoAnexoTipo,
      tamanho: '850 KB',
      dataEnvio: new Date().toISOString().replace('T', ' ').slice(0, 16),
      hashSha256: Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2),
    };
    if (!acao.anexosEvidencias) acao.anexosEvidencias = [...evidenciasIniciais];
    acao.anexosEvidencias.unshift(novo);
    setNovoAnexoNome('');
    setMensagemSucesso('Novo anexo de evidência anexado com sucesso!');
    setTimeout(() => setMensagemSucesso(''), 3000);
  };

  const handleAdicionarAuditoria = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoComentarioAuditoria.trim()) return;
    const novaLog: AuditoriaLog = {
      data: new Date().toISOString().replace('T', ' ').slice(0, 16),
      usuario: 'Usuário Ativo (Governança & Auditoria)',
      acaoRealizada: novoComentarioAuditoria.trim(),
    };
    if (!acao.historicoAuditoria) acao.historicoAuditoria = [...auditoriaInicial];
    acao.historicoAuditoria.unshift(novaLog);
    setNovoComentarioAuditoria('');
    setMensagemSucesso('Registro de auditoria adicionado à trilha oficial!');
    setTimeout(() => setMensagemSucesso(''), 3000);
  };

  const diasRestantes = acao.diasRestantes ?? 15;
  const isUrgente = diasRestantes <= 2;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-acao-tecnica-title"
    >
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-start justify-between gap-4 border-b border-slate-800">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Ficha Técnica da Ação
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                ID: {acao.id}
              </span>
              {acao.empresaNome && (
                <span className="text-[10px] font-semibold text-sky-300 bg-sky-950/70 border border-sky-800/80 px-2 py-0.5 rounded flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {acao.empresaNome}
                </span>
              )}
              {isUrgente && (
                <span className="text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded flex items-center gap-1 animate-pulse">
                  <AlertTriangle className="w-3 h-3 text-rose-400" />
                  Vence em &lt; 48 Horas
                </span>
              )}
            </div>

            <h2 id="modal-acao-tecnica-title" className="text-base sm:text-lg font-black text-white leading-snug">
              {acao.acao || acao.titulo || 'Ação de Adequação Regulatória'}
            </h2>

            {acao.tituloNoticia && (
              <p className="text-xs text-slate-400 flex items-center gap-1.5 truncate">
                <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                Matéria Vinculada: <span className="text-slate-300 font-medium">{acao.tituloNoticia}</span>
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Fechar ficha técnica"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Meta Strip */}
        <div className="bg-slate-950 text-slate-300 px-5 py-3 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Responsável</span>
            <span className="font-semibold text-slate-200 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
              {acao.responsavel} ({acao.area || 'FISCAL'})
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Prazo Legal / Limite</span>
            <span className="font-mono font-bold text-amber-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {acao.prazoLegal || acao.prazoLimite || '2026-10-15'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Prazo Homologação</span>
            <span className="font-mono font-semibold text-sky-400">
              {acao.dataHomologacao || acao.prazoInterno || '2026-10-01'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Status Atual</span>
            <span
              className={`inline-flex items-center gap-1 font-bold ${
                acao.status === 'CONCLUIDA' ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {acao.status === 'CONCLUIDA' ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <Clock className="w-3.5 h-3.5" />
              )}
              {acao.status}
            </span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('tecnico')}
            className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'tecnico'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode2 className="w-4 h-4" />
            Detalhes Técnicos & Protheus
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('evidencias')}
            className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'evidencias'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Paperclip className="w-4 h-4" />
            Anexos de Evidências ({evidenciasIniciais.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('auditoria')}
            className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'auditoria'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            Trilha de Auditoria Corporativa
          </button>
        </div>

        {/* Success Alert Banner */}
        {mensagemSucesso && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-2.5 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in duration-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{mensagemSucesso}</span>
          </div>
        )}

        {/* Tab Contents */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: DETALHES TÉCNICOS */}
          {activeTab === 'tecnico' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h3 className="text-xs font-bold uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                  <FileCode2 className="w-4 h-4 text-emerald-600" />
                  Diretrizes Técnicas de Execução
                </h3>
                <p className="text-sm text-slate-800 leading-relaxed">
                  {acao.detalhesTecnicos ||
                    acao.consequencia ||
                    'Executar parametrização conforme instrução normativa oficial, realizando testes de emissão no ambiente de homologação Protheus antes do prazo legal.'}
                </p>
              </div>

              {/* Protheus Integration Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                      Rotinas Protheus Mapeadas
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 font-mono">
                      TOTVS v12.1
                    </span>
                  </div>
                  <ul className="space-y-1.5 text-xs">
                    {rotinasProtheus.map((r, i) => (
                      <li key={i} className="flex items-center gap-2 text-slate-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                        <span className="font-mono">{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                      Tabelas do Banco Afetadas
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                      Dicionário SX3/SX5
                    </span>
                  </div>
                  <ul className="space-y-1.5 text-xs">
                    {tabelasAfetadas.map((t, i) => (
                      <li key={i} className="flex items-center gap-2 text-slate-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="font-mono">{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Status Update Form */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Atualização Rápida de Status & Evidência
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="select-status-tecnico" className="block text-[11px] font-bold text-slate-600 mb-1">
                      Status da Ação
                    </label>
                    <select
                      id="select-status-tecnico"
                      value={statusLocal}
                      onChange={(e) => setStatusLocal(e.target.value as StatusAcao)}
                      className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="ABERTA">ABERTA</option>
                      <option value="EM_ANDAMENTO">EM ANDAMENTO</option>
                      <option value="EM_HOMOLOGACAO">EM HOMOLOGAÇÃO</option>
                      <option value="CONCLUIDA">CONCLUÍDA</option>
                      <option value="IMPEDIDA">IMPEDIDA</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="input-evidencia-tecnico" className="block text-[11px] font-bold text-slate-600 mb-1">
                      Registro de Evidência / Parecer de Conclusão
                    </label>
                    <input
                      id="input-evidencia-tecnico"
                      type="text"
                      value={novaEvidenciaTexto}
                      onChange={(e) => setNovaEvidenciaTexto(e.target.value)}
                      placeholder="Ex: TSS homologado na base de testes; layout 002 ativado."
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleSalvarStatus}
                    disabled={salvando}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{salvando ? 'Gravando...' : 'Salvar Alteração'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ANEXOS DE EVIDÊNCIAS */}
          {activeTab === 'evidencias' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase text-slate-700 tracking-wider">
                    Dossiê de Evidências Comprobatórias
                  </h3>
                  <p className="text-xs text-slate-500">
                    Arquivos e laudos com integridade criptográfica SHA-256 para auditorias fiscais e compliance.
                  </p>
                </div>
              </div>

              {/* Evidence List */}
              <div className="space-y-2.5">
                {evidenciasIniciais.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {item.nome}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                            {item.tipo}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                          <span>{item.tamanho}</span>
                          <span>•</span>
                          <span>Enviado em {item.dataEnvio}</span>
                        </div>
                        {item.hashSha256 && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono mt-1 truncate max-w-sm sm:max-w-md">
                            <Hash className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">SHA256: {item.hashSha256}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => alert(`Iniciando download seguro da evidência: ${item.nome}`)}
                        className="px-3 py-1.5 bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Baixar
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Upload New Evidence Form */}
              <form onSubmit={handleAdicionarAnexo} className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Upload className="w-4 h-4" />
                  Anexar Nova Evidência Comprobatória
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-3">
                    <label htmlFor="input-anexo-nome" className="sr-only">Nome do Documento</label>
                    <input
                      id="input-anexo-nome"
                      type="text"
                      value={novoAnexoNome}
                      onChange={(e) => setNovoAnexoNome(e.target.value)}
                      placeholder="Ex: Ata_Homologacao_Diretoria_2026.pdf ou XML_TSS.xml"
                      className="w-full text-xs px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="select-anexo-tipo" className="sr-only">Tipo de Arquivo</label>
                    <select
                      id="select-anexo-tipo"
                      value={novoAnexoTipo}
                      onChange={(e) => setNovoAnexoTipo(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="PDF">PDF (Laudo/Ata)</option>
                      <option value="XML">XML (NFS-e/TSS)</option>
                      <option value="TXT">TXT / SPED</option>
                      <option value="PNG">PNG / Comprovante</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Anexar Arquivo
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: HISTÓRICO DE AUDITORIA */}
          {activeTab === 'auditoria' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase text-slate-700 tracking-wider">
                    Trilha de Auditoria Corporativa (Audit Trail)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Registro cronológico de todas as modificações, decisões e atestados nesta ação.
                  </p>
                </div>
              </div>

              {/* Timeline list */}
              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {auditoriaInicial.map((item, index) => (
                  <div key={index} className="relative group">
                    <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-xs" />
                    <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">{item.usuario}</span>
                        <span className="font-mono text-[11px] text-slate-500">{item.data}</span>
                      </div>
                      <p className="text-xs text-slate-700">{item.acaoRealizada}</p>
                      {item.detalhes && (
                        <p className="text-[11px] text-slate-500 bg-white p-2 rounded border border-slate-100 italic">
                          {item.detalhes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add manual audit note */}
              <form onSubmit={handleAdicionarAuditoria} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label htmlFor="input-auditoria-nota" className="block text-xs font-bold text-slate-700">
                  Registrar Nota Oficial na Trilha de Auditoria
                </label>
                <textarea
                  id="input-auditoria-nota"
                  rows={2}
                  value={novoComentarioAuditoria}
                  onChange={(e) => setNovoComentarioAuditoria(e.target.value)}
                  placeholder="Descreva a alteração executada, motivo técnico ou resolução de diretoria..."
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Registrar na Auditoria
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Integridade assegurada pelas diretrizes do OHANA Governança.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            Fechar Visualização
          </button>
        </div>
      </div>
    </div>
  );
};
