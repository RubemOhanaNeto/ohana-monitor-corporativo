import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  X,
  Loader2,
  RefreshCw,
  HelpCircle,
  Link as LinkIcon,
} from 'lucide-react';
import { SugestaoCorrecaoLinkIa } from '../types';

interface AutoReparoLinkTooltipProps {
  urlOriginal: string;
  tituloMateria: string;
  dataPublicacao?: string;
  orgao?: string;
  noticiaId?: string;
  isErro404?: boolean;
  onLinkAtualizado?: (novaUrl: string) => void;
  children?: React.ReactNode;
  mostrarBadgeErro?: boolean;
  posicao?: 'top' | 'bottom' | 'right' | 'left';
  className?: string;
}

export const AutoReparoLinkTooltip: React.FC<AutoReparoLinkTooltipProps> = ({
  urlOriginal,
  tituloMateria,
  dataPublicacao = '17/09/2026',
  orgao = 'Diário Oficial',
  noticiaId,
  isErro404 = false,
  onLinkAtualizado,
  children,
  mostrarBadgeErro = true,
  posicao = 'bottom',
  className = '',
}) => {
  // Detecta se a URL é sabidamente 404 (como a do Pará/IOEPA ou informada por prop)
  const is404Detectado = isErro404 || urlOriginal.includes('/semas-482-2026') || urlOriginal.includes('404');

  const [tooltipAberto, setTooltipAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [sugestao, setSugestao] = useState<SugestaoCorrecaoLinkIa | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [aplicadoComSucesso, setAplicadoComSucesso] = useState(false);
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Executa a busca da publicação com o Gemini baseando-se no título e data
  const dispararAutoReparo = async (forceRefresh = false) => {
    if (sugestao && !forceRefresh) {
      setTooltipAberto(true);
      return;
    }

    setTooltipAberto(true);
    setCarregando(true);
    setAplicadoComSucesso(false);

    try {
      const response = await fetch('/api/ia/corrigir-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          urlInvalida: urlOriginal,
          urlOriginal,
          tituloMateria,
          dataPublicacao,
          orgao,
          noticiaId,
          erroDetectado: 'HTTP 404 Not Found no portal oficial',
        }),
      });

      if (response.ok) {
        const data: SugestaoCorrecaoLinkIa = await response.json();
        setSugestao(data);
      }
    } catch (err) {
      console.error('Erro ao acionar Auto-reparo Gemini:', err);
    } finally {
      setCarregando(false);
    }
  };

  // Fecha o tooltip ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setTooltipAberto(false);
      }
    };

    if (tooltipAberto) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [tooltipAberto]);

  // Copiar link atualizado para a área de transferência
  const handleCopiarLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  // Aplicar link atualizado sugerido pelo Gemini
  const handleAplicarLink = (novaUrl: string) => {
    if (onLinkAtualizado) {
      onLinkAtualizado(novaUrl);
    }
    setAplicadoComSucesso(true);
    setTimeout(() => {
      setTooltipAberto(false);
    }, 2200);
  };

  const urlFinalSugerida = sugestao?.urlCorrigidaSugerida || sugestao?.urlSugerida;

  return (
    <div className={`relative inline-flex items-center gap-1.5 ${className}`} ref={containerRef}>
      {/* Componente filho / Gatilho principal */}
      {children}

      {/* Badge acionador de Auto-reparo quando há erro 404 */}
      {is404Detectado && mostrarBadgeErro && (
        <button
          type="button"
          onClick={() => {
            if (!tooltipAberto) {
              dispararAutoReparo();
            } else {
              setTooltipAberto(false);
            }
          }}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border transition-all cursor-pointer shadow-2xs ${
            tooltipAberto
              ? 'bg-indigo-600 text-white border-indigo-700 ring-2 ring-indigo-200'
              : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200 hover:border-rose-300'
          }`}
          title="Erro 404 detectado no diário oficial. Clique para auto-reparo com IA Gemini."
          id={`btn-auto-reparo-gatilho-${noticiaId || 'link'}`}
        >
          <AlertTriangle className="w-3 h-3 text-rose-600" />
          <span>404</span>
          <span className="w-1 h-1 rounded-full bg-indigo-500 animate-ping" />
          <Sparkles className="w-3 h-3 text-indigo-500" />
          <span className="hidden sm:inline text-[10px] font-medium text-slate-600">Auto-reparo</span>
        </button>
      )}

      {/* TOOLTIP DE AÇÃO (Popover flutuante com sombra profunda e setinha) */}
      {tooltipAberto && (
        <div
          className={`absolute z-50 w-80 sm:w-96 p-4 rounded-xl bg-white border border-indigo-200 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-left ${
            posicao === 'top'
              ? 'bottom-full mb-2.5 left-1/2 -translate-x-1/2'
              : posicao === 'right'
              ? 'left-full ml-2.5 top-0'
              : posicao === 'left'
              ? 'right-full mr-2.5 top-0'
              : 'top-full mt-2.5 right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2'
          }`}
          style={{ minWidth: '320px' }}
          id="tooltip-auto-reparo-link"
          role="dialog"
          aria-label="Auto-reparo de links com Gemini IA"
        >
          {/* Header do Tooltip */}
          <div className="flex items-center justify-between border-b border-indigo-100 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-indigo-100 text-indigo-700">
                <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-slate-900 tracking-tight">Auto-reparo de Links</span>
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 bg-gradient-to-r from-indigo-500 to-sky-500 text-white rounded">
                    Gemini IA
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium block">
                  Busca inteligente por título e data
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setTooltipAberto(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Fechar tooltip"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Estado de Carregamento da IA */}
          {carregando ? (
            <div className="py-6 px-2 text-center space-y-3">
              <Loader2 className="w-7 h-7 animate-spin text-indigo-600 mx-auto" />
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Localizando publicação oficial no acervo...
                </p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                  Consultando portal de <strong>{orgao}</strong> para a matéria <span className="text-indigo-600 font-semibold">"{tituloMateria.slice(0, 45)}..."</span> na data <strong>{dataPublicacao}</strong>.
                </p>
              </div>
            </div>
          ) : sugestao ? (
            <div className="space-y-3 text-xs">
              {/* Contexto dos Parâmetros Usados pelo Gemini */}
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] space-y-1">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-semibold text-slate-700">Título Buscado:</span>
                  <span className="text-slate-500 font-mono text-[10px]">{dataPublicacao}</span>
                </div>
                <p className="font-medium text-slate-800 line-clamp-2 italic">
                  "{tituloMateria}"
                </p>
              </div>

              {/* Comparativo de Links: 404 x Atualizado */}
              <div className="space-y-2">
                <div>
                  <span className="text-[10px] font-bold text-rose-600 uppercase flex items-center gap-1">
                    <X className="w-3 h-3" />
                    Link com Erro 404 Detectado
                  </span>
                  <div className="font-mono text-[10px] text-rose-700 bg-rose-50/70 p-1.5 rounded border border-rose-200 line-through break-all select-all mt-0.5">
                    {urlOriginal}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Link Atualizado Sugerido
                    </span>
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Confiança: {sugestao.confianca}
                    </span>
                  </div>

                  <div className="font-mono text-xs text-emerald-950 bg-emerald-50/80 p-2 rounded-lg border border-emerald-300 break-all select-all mt-0.5 flex items-center justify-between gap-2 shadow-2xs">
                    <span className="font-semibold">{urlFinalSugerida}</span>
                    <button
                      type="button"
                      onClick={() => handleCopiarLink(urlFinalSugerida || '')}
                      className="p-1 rounded bg-white hover:bg-emerald-100 text-emerald-700 border border-emerald-200 shrink-0 transition-colors"
                      title="Copiar URL atualizada"
                    >
                      {copiado ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Justificativa da IA */}
              <div className="text-[11px] text-slate-600 leading-snug bg-indigo-50/60 p-2 rounded-lg border border-indigo-100">
                <span className="font-bold text-indigo-900 block mb-0.5">Diagnóstico Gemini IA:</span>
                {sugestao.justificativa || sugestao.motivoQuebra}
              </div>

              {/* Detalhes extras expansíveis */}
              {mostrarDetalhes && (
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1.5 text-[11px] text-slate-600 animate-in fade-in">
                  <div className="font-bold text-slate-800">Passos de Localização:</div>
                  <ul className="list-disc pl-4 space-y-0.5 text-[10px]">
                    {sugestao.passosRecuperacao.map((passo, idx) => (
                      <li key={idx}>{passo}</li>
                    ))}
                  </ul>
                  {sugestao.termoBuscaOficial && (
                    <div className="mt-1 pt-1 border-t border-slate-100 text-[10px]">
                      <strong>Termo de Consulta:</strong>{' '}
                      <span className="font-mono text-slate-700">{sugestao.termoBuscaOficial}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Feedback de Aplicação com Sucesso */}
              {aplicadoComSucesso ? (
                <div className="p-2.5 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Link da matéria atualizado com sucesso no sistema!</span>
                </div>
              ) : (
                /* BOTÕES DE AÇÃO DO TOOLTIP */
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setMostrarDetalhes(!mostrarDetalhes)}
                    className="text-[10px] text-slate-500 hover:text-slate-800 underline flex items-center gap-0.5"
                  >
                    <HelpCircle className="w-3 h-3" />
                    <span>{mostrarDetalhes ? 'Ocultar detalhes' : 'Ver passos'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <a
                      href={urlFinalSugerida}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      title="Abrir novo link em outra aba para conferir"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Testar</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleAplicarLink(urlFinalSugerida || '')}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm transition-all cursor-pointer"
                      id="btn-tooltip-aplicar-link-atualizado"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Aplicar link atualizado</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-4 text-center space-y-2">
              <p className="text-xs text-slate-600">
                Clique para acionar a busca do Gemini IA para esta publicação.
              </p>
              <button
                type="button"
                onClick={() => dispararAutoReparo(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Iniciar Auto-reparo</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
