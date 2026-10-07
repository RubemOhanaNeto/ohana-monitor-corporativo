import { FC, useState } from 'react';
import {
  History,
  Bot,
  User,
  CheckCircle2,
  Clock,
  Sparkles,
  PlusCircle,
  FileCheck,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { FiscalNoticia, FiscalAcao, AuditoriaLog, StatusAcao } from '../types';
import { formatarData } from '../utils/formatters';

interface TimelineAuditoriaAcoesProps {
  noticia: FiscalNoticia;
  onAdicionarRegistroAuditoria?: (log: AuditoriaLog) => void;
  onUpdateStatusAcao?: (acaoId: string, status: StatusAcao, evidencia?: string) => void;
}

export const TimelineAuditoriaAcoes: FC<TimelineAuditoriaAcoesProps> = ({
  noticia,
  onAdicionarRegistroAuditoria,
}) => {
  const [novoDespacho, setNovoDespacho] = useState('');
  const [autorSelecionado, setAutorSelecionado] = useState('Rubens Ohana (Presidente)');
  const [isRegistrando, setIsRegistrando] = useState(false);

  // Lista unificada de eventos de auditoria da notícia + ações vinculadas
  const eventosOrdenados = [
    // Logs originais da matéria
    ...(noticia.historicoAuditoria || []).map((log, idx) => ({
      id: `orig-${idx}`,
      dataHora: log.data || '2026-09-17 10:00',
      autor: log.usuario || 'Sistema Radar Fiscal',
      tipo: (log.usuario?.toLowerCase().includes('ia') || log.usuario?.toLowerCase().includes('gemini'))
        ? 'IA'
        : log.usuario?.toLowerCase().includes('sistema')
        ? 'SISTEMA'
        : 'USUARIO',
      tituloAcao: log.acaoRealizada || 'Registro no Radar',
      detalhes: log.detalhes,
    })),
    // Eventos gerados das ações vinculadas
    ...(noticia.acoesVinculadas || []).map((acao, idx) => ({
      id: `acao-${acao.id}-${idx}`,
      dataHora: acao.dataConclusao || acao.prazoInterno || '2026-09-17 14:00',
      autor: acao.responsavel || 'Equipe Fiscal',
      tipo: 'USUARIO',
      tituloAcao: `Ação: ${acao.acao}`,
      detalhes: `Status atual: [${acao.status}]. Prazo Legal: ${formatarData(acao.prazoLegal || '')}. ${
        acao.evidencia ? `Evidência registrada: "${acao.evidencia}"` : 'Sem evidência técnica anexada.'
      }`,
    })),
  ].sort((a, b) => (b.dataHora > a.dataHora ? 1 : -1));

  const handleSalvarDespacho = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoDespacho.trim()) return;

    const dataAtual = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const novoLog: AuditoriaLog = {
      data: dataAtual,
      usuario: autorSelecionado,
      acaoRealizada: `Despacho de Governança: "${novoDespacho.trim()}"`,
      detalhes: `Registrado manualmente na trilha de auditoria corporativa.`,
    };

    onAdicionarRegistroAuditoria?.(novoLog);
    setNovoDespacho('');
    setIsRegistrando(false);
  };

  return (
    <div className="space-y-6" id="timeline-auditoria-acoes">
      {/* Banner Informativo */}
      <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h4 className="text-sm font-bold text-white">
              Trilha de Auditoria & Linha do Tempo Corporativa
            </h4>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Rastreabilidade imutável de análises da IA Gemini, publicações normativas e despachos de homologação da Presidência e Diretorias.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsRegistrando(!isRegistrando)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isRegistrando ? 'Cancelar' : 'Novo Despacho'}</span>
        </button>
      </div>

      {/* Formulário de Novo Despacho / Parecer */}
      {isRegistrando && (
        <form onSubmit={handleSalvarDespacho} className="bg-emerald-50/50 border border-emerald-200 p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-950">
              Registrar Despacho Oficial na Trilha de Auditoria
            </span>
            <select
              value={autorSelecionado}
              onChange={(e) => setAutorSelecionado(e.target.value)}
              className="text-xs bg-white border border-emerald-300 rounded px-2.5 py-1 font-semibold text-emerald-900 focus:outline-none"
            >
              <option value="Rubens Ohana (Presidente)">Rubens Ohana (Presidente)</option>
              <option value="Diretoria Financeira (CFO)">Diretoria Financeira (CFO)</option>
              <option value="Diretoria Jurídica (CLO)">Diretoria Jurídica (CLO)</option>
              <option value="Diretoria de Operações (COO)">Diretoria de Operações (COO)</option>
              <option value="Auditoria / Compliance">Auditoria / Compliance</option>
            </select>
          </div>

          <textarea
            value={novoDespacho}
            onChange={(e) => setNovoDespacho(e.target.value)}
            rows={2}
            placeholder="Descreva a determinação, parecer ou evidência de conformidade..."
            required
            className="w-full text-xs p-2.5 bg-white border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsRegistrando(false)}
              className="px-3 py-1 text-xs text-slate-600 hover:text-slate-900"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors"
            >
              Salvar na Linha do Tempo
            </button>
          </div>
        </form>
      )}

      {/* Linha do Tempo Visual */}
      <div className="relative pl-6 border-l-2 border-slate-200 space-y-6 my-2">
        {eventosOrdenados.map((evento) => {
          const isIA = evento.tipo === 'IA';
          const isSistema = evento.tipo === 'SISTEMA';

          return (
            <div key={evento.id} className="relative group">
              {/* Ponto / Ícone na Linha */}
              <div
                className={`absolute -left-[33px] top-0.5 h-6 w-6 rounded-full flex items-center justify-center border-2 border-white shadow-xs ${
                  isIA
                    ? 'bg-purple-600 text-white'
                    : isSistema
                    ? 'bg-slate-700 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {isIA ? (
                  <Bot className="w-3.5 h-3.5" />
                ) : isSistema ? (
                  <Clock className="w-3.5 h-3.5" />
                ) : (
                  <User className="w-3.5 h-3.5" />
                )}
              </div>

              {/* Conteúdo do Card de Auditoria */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-2xs space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{evento.autor}</span>
                    <span
                      className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                        isIA
                          ? 'bg-purple-100 text-purple-800'
                          : isSistema
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isIA ? 'IA Gemini' : isSistema ? 'Sistema / Radar' : 'Usuário / Gestão'}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400 font-medium">
                    {evento.dataHora}
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-800">
                  {evento.tituloAcao}
                </div>

                {evento.detalhes && (
                  <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                    {evento.detalhes}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
