import React, { FC, useState } from 'react';
import {
  Clock,
  Calendar,
  Building2,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { EventoTimeline, FiscalNoticia, DiretoriaCodigo, EmpresaPerfil } from '../types';
import { OHANA_TIMELINE_EXEMPLOS } from '../data/ohanaData';

interface ModuloTimelineProps {
  noticias: FiscalNoticia[];
  empresas?: EmpresaPerfil[];
  onVerDetalhesNoticia?: (noticia: FiscalNoticia) => void;
  onSelectNoticia?: (noticia: FiscalNoticia) => void;
}

export const ModuloTimeline: FC<ModuloTimelineProps> = ({
  noticias,
  empresas = [],
  onVerDetalhesNoticia,
  onSelectNoticia,
}) => {
  const [timelineEvents, setTimelineEvents] = useState<EventoTimeline[]>(OHANA_TIMELINE_EXEMPLOS);
  const [filtroDiretoria, setFiltroDiretoria] = useState<string>('TODAS');
  const abrirDetalhes = onSelectNoticia || onVerDetalhesNoticia || (() => {});

  const eventosFiltrados = timelineEvents.filter((ev) => {
    if (filtroDiretoria !== 'TODAS' && ev.diretoria !== filtroDiretoria) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12" id="modulo-timeline-ohana">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
            FLUXO CRONOLÓGICO DE VIGILÂNCIA
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Linha do Tempo de Detecções & Eventos
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro cronológico instantâneo de cada varredura, detecção de alteração normativa e publicação oficial.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filtroDiretoria}
            onChange={(e) => setFiltroDiretoria(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="TODAS">Todas as Diretorias</option>
            <option value="CEO">CEO</option>
            <option value="CFO">CFO</option>
            <option value="COO">COO</option>
            <option value="CRO">CRO</option>
            <option value="CLO">CLO</option>
            <option value="CTO">CTO</option>
            <option value="NAYA">NAYÁ</option>
          </select>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-6">
          {eventosFiltrados.map((item) => {
            const noticiaRelacionada = noticias.find((n) => n.id === item.noticiaId);
            const urgencia = item.nivelUrgencia || item.criticidade || 'MEDIO';
            const horarioExibicao = item.horario || item.hora || 'Agora';
            const fonteExibicao = item.fonte || item.fonteNome || 'Fonte Oficial';
            const empresaExibicao = item.empresa || item.empresaNome;

            return (
              <div key={item.id} className="relative group">
                {/* Timeline Dot */}
                <div
                  className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-white shadow ${
                    urgencia === 'CRITICO'
                      ? 'bg-red-600 ring-4 ring-red-100'
                      : urgencia === 'ALTO'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                />

                <div className="bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 rounded-xl p-4 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {horarioExibicao}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                        {item.diretoria}
                      </span>
                      <span className="text-xs font-medium text-slate-500">{fonteExibicao}</span>
                    </div>

                    {empresaExibicao && (
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        {empresaExibicao}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{item.titulo}</h3>
                  {item.resumo && (
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.resumo}</p>
                  )}

                  <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">
                      Data da Coleta: {item.data}
                    </span>

                    {noticiaRelacionada && (
                      <button
                        type="button"
                        onClick={() => abrirDetalhes(noticiaRelacionada)}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1"
                      >
                        <span>Abrir Ficha</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
