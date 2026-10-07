import React, { FC, useState } from 'react';
import {
  Building2,
  Calendar,
  AlertTriangle,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Shield,
  Activity,
  DollarSign,
  Cpu,
  Bot,
  Users,
  Briefcase,
  FileCheck,
  Lock,
  Database,
  Search,
} from 'lucide-react';
import { FiscalNoticia, DiretoriaCodigo, EmpresaPerfil } from '../types';
import { DIRETORIAS_LISTA, OHANA_FONTES } from '../data/ohanaData';

interface ModuloDiretoriasProps {
  noticias: FiscalNoticia[];
  empresas?: EmpresaPerfil[];
  onVerDetalhesNoticia?: (noticia: FiscalNoticia) => void;
  onSelectNoticia?: (noticia: FiscalNoticia) => void;
}

export const ModuloDiretorias: FC<ModuloDiretoriasProps> = ({
  noticias,
  empresas = [],
  onVerDetalhesNoticia,
  onSelectNoticia,
}) => {
  const [diretoriaAtiva, setDiretoriaAtiva] = useState<DiretoriaCodigo>('CFO');
  const abrirDetalhes = onSelectNoticia || onVerDetalhesNoticia || (() => {});

  const infoDiretoria = DIRETORIAS_LISTA.find((d) => d.codigo === diretoriaAtiva) || DIRETORIAS_LISTA[0];

  // Fontes associadas a esta diretoria
  const fontesDaDiretoria = OHANA_FONTES.filter((f) =>
    f.diretorias?.includes(diretoriaAtiva) || f.diretoriaPrincipal === diretoriaAtiva
  );

  // Notícias associadas a esta diretoria
  const noticiasDaDiretoria = noticias.filter((n) =>
    n.diretoriasResponsaveis?.includes(diretoriaAtiva)
  );

  const totalCriticos = noticiasDaDiretoria.filter((n) => n.nivelUrgencia === 'CRITICO').length;
  const totalAltos = noticiasDaDiretoria.filter((n) => n.nivelUrgencia === 'ALTO').length;

  return (
    <div className="space-y-6 pb-12" id="modulo-diretorias-ohana">
      {/* 1. Header do Módulo */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              ESTRUTURA EXECUTIVA OHANA
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
              Diretorias Digitais & Foco de Vigilância
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Cada diretoria possui seu próprio funil de inteligência, fontes oficiais dedicadas e painel de impacto.
            </p>
          </div>
          <div className="text-xs font-medium text-slate-500">
            <strong>12</strong> Diretorias Ativas • <strong>84</strong> Fontes Integradas
          </div>
        </div>

        {/* Directorate Selector Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 mt-5">
          {DIRETORIAS_LISTA.map((dir) => {
            const isSelected = dir.codigo === diretoriaAtiva;
            const qtdNoticias = noticias.filter((n) => n.diretoriasResponsaveis?.includes(dir.codigo)).length;

            return (
              <button
                key={dir.codigo}
                type="button"
                onClick={() => setDiretoriaAtiva(dir.codigo)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? `${dir.badgeBg} text-white ring-2 ring-emerald-500 shadow-sm`
                    : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black tracking-wider">{dir.codigo}</span>
                  {qtdNoticias > 0 && (
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {qtdNoticias}
                    </span>
                  )}
                </div>
                <div className="mt-2">
                  <span className={`text-[11px] font-bold line-clamp-1 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {dir.nome.split('—')[1]?.trim() || dir.nome}
                  </span>
                  <p className={`text-[10px] line-clamp-1 ${isSelected ? 'text-slate-200' : 'text-slate-400'}`}>
                    {dir.descricao || dir.focoPrincipal}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Banner Específico da Diretoria Selecionada */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-black uppercase px-2 py-0.5 rounded ${infoDiretoria.badgeBg} text-white`}>
                DIRETORIA {infoDiretoria.codigo}
              </span>
              <span className="text-xs text-slate-400">{infoDiretoria.nome}</span>
            </div>
            <h2 className="text-xl font-extrabold text-white">{infoDiretoria.descricao || infoDiretoria.focoPrincipal}</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Vigilância corporativa permanente sobre: {infoDiretoria.fontesPrioritarias.join(', ')}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 bg-slate-800/80 rounded-xl border border-slate-700 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Matérias Hoje</span>
              <span className="text-lg font-extrabold text-white">{noticiasDaDiretoria.length}</span>
            </div>
            <div className="px-3.5 py-2 bg-red-950/50 rounded-xl border border-red-500/40 text-center">
              <span className="text-[10px] text-red-300 uppercase font-bold block">Críticas</span>
              <span className="text-lg font-extrabold text-red-400">{totalCriticos}</span>
            </div>
            <div className="px-3.5 py-2 bg-slate-800/80 rounded-xl border border-slate-700 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Fontes Ativas</span>
              <span className="text-lg font-extrabold text-emerald-400">{fontesDaDiretoria.length}</span>
            </div>
          </div>
        </div>

        {/* Sub-bloco especial se for CFO (Indicadores Econômicos + Fiscal) */}
        {diretoriaAtiva === 'CFO' && (
          <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block font-medium">Selic Meta (Banco Central)</span>
              <strong className="text-sm text-emerald-400 font-extrabold">10,50% a.a.</strong>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block font-medium">IPCA Acumulado 12M</span>
              <strong className="text-sm text-sky-400 font-extrabold">4,12%</strong>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block font-medium">Dólar Comercial (PTAX)</span>
              <strong className="text-sm text-white font-extrabold">R$ 5,38</strong>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block font-medium">Alíquota Teste IBS/CBS</span>
              <strong className="text-sm text-amber-400 font-extrabold">1,0% (Jan/2027)</strong>
            </div>
          </div>
        )}

        {/* Sub-bloco especial se for COO (Operações Recanto da Saudade) */}
        {diretoriaAtiva === 'COO' && (
          <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block font-medium">SEMAS / Licença de Operação</span>
              <strong className="text-sm text-amber-400 font-extrabold">Renovação em Curso (PA 482)</strong>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block font-medium">Ocupação de Jazigos Parque</span>
              <strong className="text-sm text-emerald-400 font-extrabold">74% Capacidade Total</strong>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block font-medium">Forno Crematório (Emissões)</span>
              <strong className="text-sm text-white font-extrabold">100% Conforme CONAMA 316</strong>
            </div>
          </div>
        )}

        {/* Sub-bloco especial se for NAYÁ (Radar de IA e Modelos) */}
        {diretoriaAtiva === 'NAYA' && (
          <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block font-medium">Conectores de IA Ativos</span>
              <strong className="text-sm text-emerald-400 font-extrabold">12 Agentes Operando</strong>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block font-medium">Latência Média Extração</span>
              <strong className="text-sm text-sky-400 font-extrabold">184 ms por diário</strong>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block font-medium">Precisão Deduplicação</span>
              <strong className="text-sm text-white font-extrabold">99,8% Hash SHA-256</strong>
            </div>
          </div>
        )}
      </div>

      {/* 3. Fontes Oficiais Monitoradas por esta Diretoria */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-600" />
          Fontes Primárias Conectadas à Diretoria {infoDiretoria.codigo} ({fontesDaDiretoria.length})
        </h3>
        <p className="text-xs text-slate-500">
          Sensores contínuos que coletam atos, resoluções, despachos e dados técnicos para esta diretoria.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
          {fontesDaDiretoria.map((fonte) => (
            <div
              key={fonte.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-all space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 line-clamp-1">{fonte.nome}</span>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    fonte.status === 'OPERACIONAL'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {fonte.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2">{fonte.descricao}</p>
              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Frequência: {fonte.frequencia}</span>
                <span>Latência: {fonte.latenciaMs}ms</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Lista de Matérias e Novidades para a Diretoria */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Feed de Novidades da Diretoria {infoDiretoria.codigo} ({noticiasDaDiretoria.length})
          </h3>
          <span className="text-xs text-slate-400">Classificadas e analisadas para esta área</span>
        </div>

        <div className="space-y-3">
          {noticiasDaDiretoria.length > 0 ? (
            noticiasDaDiretoria.map((noticia) => (
              <div
                key={noticia.id}
                onClick={() => abrirDetalhes(noticia)}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {noticia.nivelUrgencia === 'CRITICO' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200">
                        🔴 CRÍTICO
                      </span>
                    )}
                    {noticia.nivelUrgencia === 'ALTO' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                        🟠 ALTO
                      </span>
                    )}
                    {noticia.nivelUrgencia === 'MEDIO' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                        🟡 MÉDIO
                      </span>
                    )}
                    <span className="text-xs text-slate-400 font-mono">
                      {noticia.orgaoEmissor || (typeof noticia.orgao === 'string' ? noticia.orgao : 'Órgão Oficial')}
                    </span>
                  </div>

                  <span className="text-xs text-slate-500 font-medium">
                    Publicação: {noticia.dataPublicacao || '17/09/2026'}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {noticia.titulo}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                    {noticia.oQueMudou || noticia.resumo}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="text-slate-600">
                    <span className="font-semibold text-slate-800">Impacto Direto: </span>
                    {noticia.impactoEmpresas || noticia.impactoFunerario || 'Adequação operacional imediata.'}
                  </div>

                  <span className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-1 shrink-0 self-end sm:self-auto">
                    Ver Ficha Executiva
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
              Nenhuma novidade pendente para esta diretoria no momento.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
