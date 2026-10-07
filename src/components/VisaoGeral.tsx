import { FC, useState } from 'react';
import {
  Search,
  Filter,
  ExternalLink,
  ShieldCheck,
  Building2,
  Cpu,
  Clock,
  ChevronRight,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import {
  FiscalNoticia,
  OrgaoOficial,
  StatusJuridico,
  StatusAtualidade,
  NivelUrgencia,
} from '../types';
import {
  formatarData,
  getStatusAtualidadeBadge,
  getNivelUrgenciaBadge,
  getOrgaoNome,
} from '../utils/formatters';

interface VisaoGeralProps {
  noticias: FiscalNoticia[];
  onSelectNoticia: (noticia: FiscalNoticia) => void;
  filtroTema: string;
  setFiltroTema: (v: string) => void;
  filtroOrgao: string;
  setFiltroOrgao: (v: string) => void;
  filtroStatusJuridico: string;
  setFiltroStatusJuridico: (v: string) => void;
  filtroStatusAtualidade: string;
  setFiltroStatusAtualidade: (v: string) => void;
  filtroUrgencia: string;
  setFiltroUrgencia: (v: string) => void;
  termoBusca: string;
  setTermoBusca: (v: string) => void;
  onResetFiltros: () => void;
}

export const VisaoGeral: FC<VisaoGeralProps> = ({
  noticias,
  onSelectNoticia,
  filtroTema,
  setFiltroTema,
  filtroOrgao,
  setFiltroOrgao,
  filtroStatusJuridico,
  setFiltroStatusJuridico,
  filtroStatusAtualidade,
  setFiltroStatusAtualidade,
  filtroUrgencia,
  setFiltroUrgencia,
  termoBusca,
  setTermoBusca,
  onResetFiltros,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filtered dataset
  const noticiasFiltradas = noticias.filter((n) => {
    if (filtroTema !== 'TODOS' && n.tema !== filtroTema) return false;
    if (filtroOrgao !== 'TODOS' && n.orgao !== filtroOrgao) return false;
    if (filtroStatusJuridico !== 'TODOS' && n.statusJuridico !== filtroStatusJuridico) return false;
    if (filtroStatusAtualidade !== 'TODOS' && n.statusAtualidade !== filtroStatusAtualidade) return false;
    if (filtroUrgencia !== 'TODOS' && n.nivelUrgencia !== filtroUrgencia) return false;
    if (termoBusca.trim() !== '') {
      const q = termoBusca.toLowerCase();
      const match =
        n.titulo.toLowerCase().includes(q) ||
        (n.resumo || n.oQueMudou || '').toLowerCase().includes(q) ||
        (n.numeroAto || '').toLowerCase().includes(q) ||
        (n.impactoFunerario || '').toLowerCase().includes(q) ||
        (n.impactoProtheus || '').toLowerCase().includes(q) ||
        (n.tema || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Extract distinct topics for select
  const temasDisponiveis = Array.from(new Set(noticias.map((n) => n.tema).filter(Boolean)));

  return (
    <div className="space-y-6" id="visao-geral-container">
      {/* Header & Filter Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-600" />
              Visão Geral — Jornal Fiscal Digital
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Acervo de publicações oficiais auditadas, classificações jurídicas e impactos operacionais.
            </p>
          </div>

          {/* Search and Layout Toggle */}
          <div className="flex items-center gap-2.5">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                placeholder="Filtrar matérias..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 text-xs text-slate-900 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200 text-xs">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2.5 py-1 rounded font-medium ${
                  viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded font-medium ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Tabela
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tema</label>
            <select
              value={filtroTema}
              onChange={(e) => setFiltroTema(e.target.value)}
              className="w-full text-xs p-1.5 bg-slate-50 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
            >
              <option value="TODOS">Todos os Temas</option>
              {temasDisponiveis.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Status Jurídico</label>
            <select
              value={filtroStatusJuridico}
              onChange={(e) => setFiltroStatusJuridico(e.target.value)}
              className="w-full text-xs p-1.5 bg-slate-50 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="VIGENTE">Vigente</option>
              <option value="VIGENCIA_FUTURA">Vigência Futura</option>
              <option value="EM_TRAMITACAO">Em Tramitação</option>
              <option value="EM_DISCUSSAO">Em Discussão</option>
              <option value="NOTA_TECNICA">Nota Técnica</option>
              <option value="ORIENTACAO_OPERACIONAL">Orientação Operacional</option>
              <option value="BASE_LEGAL">Base Legal</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Atualidade</label>
            <select
              value={filtroStatusAtualidade}
              onChange={(e) => setFiltroStatusAtualidade(e.target.value)}
              className="w-full text-xs p-1.5 bg-slate-50 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
            >
              <option value="TODOS">Todas</option>
              <option value="NOVO_HOJE">Novo Hoje</option>
              <option value="ATUALIZADO_HOJE">Atualizado Hoje</option>
              <option value="ULTIMOS_7_DIAS">Últimos 7 Dias</option>
              <option value="ANTERIOR">Anterior</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nível de Urgência</label>
            <select
              value={filtroUrgencia}
              onChange={(e) => setFiltroUrgencia(e.target.value)}
              className="w-full text-xs p-1.5 bg-slate-50 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
            >
              <option value="TODOS">Todas as Urgências</option>
              <option value="CRITICO">Crítico (&lt;= 7 dias)</option>
              <option value="ALTO">Alto (8 a 30 dias)</option>
              <option value="MEDIO">Médio (31 a 90 dias)</option>
              <option value="PLANEJAMENTO">Planejamento (&gt; 90 dias)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={onResetFiltros}
              className="w-full text-xs py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded border border-slate-200 transition-colors"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Results summary */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Exibindo <strong>{noticiasFiltradas.length}</strong> de <strong>{noticias.length}</strong> matérias fiscais
        </span>
        <span className="text-[11px]">
          Classificações rigorosas: nenhuma discussão ou projeto é apresentado como norma vigente.
        </span>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {noticiasFiltradas.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-white rounded-xl border border-slate-200 p-8">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800">Nenhuma matéria encontrada com os filtros atuais.</p>
              <p className="text-xs text-slate-500 mt-1">Tente remover filtros ou ajustar o termo de pesquisa.</p>
              <button
                onClick={onResetFiltros}
                className="mt-3 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Restaurar todos os filtros
              </button>
            </div>
          ) : (
            noticiasFiltradas.map((noticia) => {
              const badgeAtualidade = getStatusAtualidadeBadge(noticia.statusAtualidade);
              const badgeUrgencia = getNivelUrgenciaBadge(noticia.nivelUrgencia);

              return (
                <div
                  key={noticia.id}
                  onClick={() => onSelectNoticia(noticia)}
                  className="bg-white rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer p-4 flex flex-col justify-between group"
                >
                  <div>
                    {/* Badges Row */}
                    <div className="flex items-center justify-between gap-1.5 mb-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${badgeAtualidade.bg} ${badgeAtualidade.text}`}>
                        {badgeAtualidade.label}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${badgeUrgencia.bg}`}>
                        {badgeUrgencia.label}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 leading-snug line-clamp-2">
                      {noticia.titulo}
                    </h3>

                    {/* Meta information */}
                    <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700">{noticia.ato || 'Ato'} {noticia.numeroAto || ''}</span>
                      <span>•</span>
                      <span>{noticia.orgao ? getOrgaoNome(noticia.orgao) : (noticia.orgaoEmissor || 'Órgão Oficial')}</span>
                    </div>

                    {/* Summary */}
                    <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                      {noticia.resumo || noticia.oQueMudou || 'Sem resumo disponível.'}
                    </p>

                    {/* Impact Indicators */}
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[11px] text-indigo-900 font-medium bg-indigo-50/70 px-2 py-1 rounded">
                        <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="truncate">Funerário: {noticia.subsegmentosFunerariosAfetados.slice(0, 3).join(', ') || 'Geral'}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-900 font-medium bg-emerald-50/70 px-2 py-1 rounded">
                        <Cpu className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">
                          Protheus:{' '}
                          {noticia.protheusParametrizacaoNecessaria
                            ? noticia.protheusModulosAfetados.slice(0, 2).join(', ')
                            : 'Sem impacto técnico'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer details */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Vigência: <strong>{formatarData(noticia.dataVigencia)}</strong></span>
                    </div>
                    <span className="font-semibold text-emerald-700 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      Detalhes <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase">
                <tr>
                  <th className="py-3 px-4">Atualidade</th>
                  <th className="py-3 px-4">Ato / Órgão</th>
                  <th className="py-3 px-4">Título & Tema</th>
                  <th className="py-3 px-4">Status Jurídico</th>
                  <th className="py-3 px-4">Vigência</th>
                  <th className="py-3 px-4">Funerárias</th>
                  <th className="py-3 px-4">Protheus</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {noticiasFiltradas.map((noticia) => (
                  <tr
                    key={noticia.id}
                    onClick={() => onSelectNoticia(noticia)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          getStatusAtualidadeBadge(noticia.statusAtualidade).bg
                        } ${getStatusAtualidadeBadge(noticia.statusAtualidade).text}`}
                      >
                        {getStatusAtualidadeBadge(noticia.statusAtualidade).label}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{noticia.ato} {noticia.numeroAto}</div>
                      <div className="text-[10px] text-slate-400">{noticia.orgao}</div>
                    </td>
                    <td className="py-3 px-4 max-w-sm">
                      <div className="font-semibold text-slate-900 line-clamp-1">{noticia.titulo}</div>
                      <div className="text-[10px] text-emerald-700 font-medium">{noticia.tema}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 border border-slate-200">
                        {noticia.statusJuridico.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-900">
                      {formatarData(noticia.dataVigencia)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-[11px] text-indigo-700 font-medium">
                        {noticia.subsegmentosFunerariosAfetados.length > 0 ? 'Afetado' : 'Regra Geral'}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`text-[11px] font-medium ${
                          noticia.protheusParametrizacaoNecessaria ? 'text-amber-700' : 'text-slate-400'
                        }`}
                      >
                        {noticia.protheusParametrizacaoNecessaria ? 'Requer Ajuste' : 'Sem Impacto'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">
                        Abrir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
