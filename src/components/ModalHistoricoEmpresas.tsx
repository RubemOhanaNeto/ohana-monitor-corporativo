import { FC, useState } from 'react';
import {
  X,
  History,
  PlusCircle,
  Trash2,
  Edit3,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Building2,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';

export interface EmpresaHistoricoLog {
  id: string;
  dataHora: string;
  tipo: 'INCLUSAO' | 'EXCLUSAO' | 'ATUALIZACAO';
  empresaId: string;
  nome: string;
  cnpj: string;
  razaoSocial: string;
  usuario: string;
  detalhes: string;
  regimeTributario?: string;
  segmento?: string;
}

interface ModalHistoricoEmpresasProps {
  isOpen: boolean;
  onClose: () => void;
  logs: EmpresaHistoricoLog[];
}

export const ModalHistoricoEmpresas: FC<ModalHistoricoEmpresasProps> = ({
  isOpen,
  onClose,
  logs,
}) => {
  const [filtroTipo, setFiltroTipo] = useState<'TODOS' | 'INCLUSAO' | 'EXCLUSAO' | 'ATUALIZACAO'>('TODOS');
  const [termoBusca, setTermoBusca] = useState('');

  if (!isOpen) return null;

  const logsFiltrados = logs.filter((log) => {
    if (filtroTipo !== 'TODOS' && log.tipo !== filtroTipo) {
      return false;
    }
    if (termoBusca.trim()) {
      const q = termoBusca.toLowerCase();
      const matchNome = log.nome.toLowerCase().includes(q);
      const matchRazao = log.razaoSocial.toLowerCase().includes(q);
      const matchCnpj = log.cnpj.includes(q);
      const matchDetalhes = log.detalhes.toLowerCase().includes(q);
      const matchUsuario = log.usuario.toLowerCase().includes(q);
      if (!matchNome && !matchRazao && !matchCnpj && !matchDetalhes && !matchUsuario) {
        return false;
      }
    }
    return true;
  });

  const handleExportarLogsCsv = () => {
    const cabecalhos = ['Data e Hora', 'Operação', 'Empresa', 'CNPJ', 'Razão Social', 'Usuário Responsável', 'Detalhes da Alteração'];
    const linhas = logsFiltrados.map((l) => [
      `"${l.dataHora}"`,
      `"${l.tipo}"`,
      `"${l.nome.replace(/"/g, '""')}"`,
      `"${l.cnpj}"`,
      `"${l.razaoSocial.replace(/"/g, '""')}"`,
      `"${l.usuario.replace(/"/g, '""')}"`,
      `"${l.detalhes.replace(/"/g, '""')}"`,
    ]);

    const csvConteudo = '\uFEFF' + [cabecalhos.join(';'), ...linhas.map((r) => r.join(';'))].join('\r\n');
    const blob = new Blob([csvConteudo], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `auditoria-historico-empresas-ohana-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal-historico"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="titulo-modal-historico" className="text-lg font-bold text-white tracking-tight">
                  Histórico de Alterações & Auditoria de Empresas
                </h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Rastreabilidade 100%
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Registro imutável de cadastros, exclusões e atualizações cadastrais do grupo OHANA
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar de Filtros e Busca */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              placeholder="Buscar por empresa, CNPJ ou usuário..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
            {/* Filtros de Tipo */}
            <div className="inline-flex bg-white p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFiltroTipo('TODOS')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  filtroTipo === 'TODOS' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos ({logs.length})
              </button>
              <button
                type="button"
                onClick={() => setFiltroTipo('INCLUSAO')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  filtroTipo === 'INCLUSAO' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Inclusões
              </button>
              <button
                type="button"
                onClick={() => setFiltroTipo('EXCLUSAO')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  filtroTipo === 'EXCLUSAO' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Exclusões
              </button>
            </div>

            {/* Exportar Log CSV */}
            <button
              type="button"
              onClick={handleExportarLogsCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-xs transition-colors"
              title="Exportar trilha de auditoria em CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Exportar Log</span>
            </button>
          </div>
        </div>

        {/* Lista de Registros Cronológicos */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {logsFiltrados.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <History className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">Nenhum evento localizado no histórico.</p>
              <p className="text-xs text-slate-400">Tente ajustar o termo de pesquisa ou os filtros de tipo de operação.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-5">
              {logsFiltrados.map((log) => {
                const isInclusao = log.tipo === 'INCLUSAO';
                const isExclusao = log.tipo === 'EXCLUSAO';

                return (
                  <div key={log.id} className="relative group">
                    {/* Marcador na linha do tempo */}
                    <div
                      className={`absolute -left-[35px] top-1.5 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-xs ${
                        isInclusao
                          ? 'bg-emerald-500 text-white'
                          : isExclusao
                          ? 'bg-rose-500 text-white'
                          : 'bg-sky-500 text-white'
                      }`}
                    >
                      {isInclusao ? (
                        <PlusCircle className="w-3.5 h-3.5" />
                      ) : isExclusao ? (
                        <Trash2 className="w-3.5 h-3.5" />
                      ) : (
                        <Edit3 className="w-3.5 h-3.5" />
                      )}
                    </div>

                    {/* Card de Informação do Evento */}
                    <div className="bg-slate-50 hover:bg-white rounded-xl border border-slate-200 p-4 transition-all duration-150 shadow-xs hover:shadow-md">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                              isInclusao
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : isExclusao
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-sky-100 text-sky-800 border border-sky-200'
                            }`}
                          >
                            {log.tipo}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-500" />
                            {log.nome}
                          </h4>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{log.dataHora}</span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 space-y-1">
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
                          <span>
                            <strong>Razão Social:</strong> {log.razaoSocial}
                          </span>
                          <span>
                            <strong>CNPJ:</strong> <span className="font-mono">{log.cnpj}</span>
                          </span>
                          {log.regimeTributario && (
                            <span>
                              <strong>Regime:</strong> {log.regimeTributario.replace('_', ' ')}
                            </span>
                          )}
                        </div>

                        <p className="text-slate-700 pt-1 leading-relaxed bg-white/80 p-2.5 rounded-lg border border-slate-200/80">
                          {log.detalhes}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 font-medium">
                          <User className="w-3 h-3 text-slate-400" />
                          Operado por: <strong className="text-slate-700">{log.usuario}</strong>
                        </span>
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Auditado & Registrado
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>
            Total de eventos registrados: <strong>{logs.length}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors text-xs"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
};
