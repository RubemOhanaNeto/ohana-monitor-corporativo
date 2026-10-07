import { FC, useState, useEffect } from 'react';
import {
  GitBranch,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Landmark,
  ArrowRight,
  PlusCircle,
  Check,
} from 'lucide-react';
import { FiscalNoticia, TramitacaoEtapa } from '../types';
import { formatarData, getTramitacaoLabel } from '../utils/formatters';

interface ModuloEmTramitacaoProps {
  noticias: FiscalNoticia[];
  onSelectNoticia: (noticia: FiscalNoticia) => void;
  onNovaNoticiaImportada?: (noticia: FiscalNoticia) => void;
}

export const ModuloEmTramitacao: FC<ModuloEmTramitacaoProps> = ({
  noticias,
  onSelectNoticia,
  onNovaNoticiaImportada,
}) => {
  const [proposicoesCamara, setProposicoesCamara] = useState<any[]>([]);
  const [loadingCamara, setLoadingCamara] = useState(false);
  const [filtroEtapa, setFiltroEtapa] = useState<string>('TODOS');
  const [importandoId, setImportandoId] = useState<number | null>(null);
  const [importados, setImportados] = useState<number[]>([]);
  const [mensagemStatus, setMensagemStatus] = useState<string | null>(null);

  const etapas: { id: TramitacaoEtapa; label: string; desc: string }[] = [
    { id: 'EM_DISCUSSAO', label: '1. Em Discussão', desc: 'Comissões temáticas / Audiências' },
    { id: 'APROVADO_CAMARA', label: '2. Aprovado na Câmara', desc: 'Concluído plenário da Câmara' },
    { id: 'AGUARDANDO_SENADO', label: '3. Aguardando Senado', desc: 'Em revisão no Senado Federal' },
    { id: 'AGUARDANDO_SANCAO', label: '4. Aguardando Sanção', desc: 'Enviado à Presidência' },
    { id: 'PUBLICADO', label: '5. Publicado', desc: 'DOU - Em vacatio legis' },
    { id: 'VIGENTE', label: '6. Vigente', desc: 'Eficácia plena' },
  ];

  // Fetch Chamber of Deputies proposals via backend API
  const carregarDadosCamara = async () => {
    setLoadingCamara(true);
    try {
      const res = await fetch('/api/integracoes/camara');
      const data = await res.json();
      if (data && data.proposicoes) {
        setProposicoesCamara(data.proposicoes);
      }
    } catch {
      // Fallback handles in server
    } finally {
      setLoadingCamara(false);
    }
  };

  const handleImportarProposicao = async (prop: any) => {
    setImportandoId(prop.id);
    setMensagemStatus(null);
    try {
      const res = await fetch('/api/integracoes/governo/importar-proposicao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: prop.id,
          siglaTipo: prop.siglaTipo,
          numero: prop.numero,
          ano: prop.ano,
          ementa: prop.ementa,
        }),
      });

      const data = await res.json();
      if (res.ok && data.noticia) {
        setImportados((prev) => [...prev, prop.id]);
        setMensagemStatus(`Proposição ${prop.siglaTipo} ${prop.numero}/${prop.ano} importada com sucesso para o Radar Fiscal!`);
        if (onNovaNoticiaImportada) {
          onNovaNoticiaImportada(data.noticia);
        }
        setTimeout(() => setMensagemStatus(null), 4000);
      } else {
        setMensagemStatus(data.error || 'Não foi possível importar a matéria.');
        setTimeout(() => setMensagemStatus(null), 4000);
      }
    } catch {
      setMensagemStatus('Erro na comunicação com a API ao importar.');
      setTimeout(() => setMensagemStatus(null), 4000);
    } finally {
      setImportandoId(null);
    }
  };

  useEffect(() => {
    carregarDadosCamara();
  }, []);

  const materiasTramitando = noticias.filter((n) => {
    if (filtroEtapa === 'TODOS') return !!n.tramitacaoEtapa;
    return n.tramitacaoEtapa === filtroEtapa;
  });

  return (
    <div className="space-y-6" id="modulo-tramitacao-container">
      {/* Top Banner - Legislative Pipeline */}
      <div className="bg-purple-950 text-white rounded-xl p-5 border border-purple-900 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <GitBranch className="w-6 h-6 text-purple-400" />
              <h2 className="text-lg font-bold tracking-tight text-white">
                Módulo — Em Tramitação & Pipeline Legislativo
              </h2>
            </div>
            <p className="text-xs text-purple-200 mt-1 max-w-3xl leading-relaxed">
              Acompanhamento antecipado de Projetos de Lei (PL) e Projetos de Lei Complementar (PLP) antes de se tornarem normas obrigatórias.
            </p>
          </div>

          <div className="bg-purple-900/60 border border-purple-800 rounded-lg p-3 text-xs text-purple-200">
            <span className="block text-[10px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Garantia de Classificação Jurídica
            </span>
            <span className="text-[11px] text-purple-100 mt-0.5 block">
              Projetos e minutas em discussão nunca são exibidos como normas vigentes.
            </span>
          </div>
        </div>

        {/* Visual Pipeline Bar */}
        <div className="mt-5 pt-4 border-t border-purple-900/80">
          <div className="text-[11px] font-bold text-purple-300 uppercase mb-3">
            Fluxo Oficial de Tramitação Legislativa:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {etapas.map((etapa, idx) => (
              <button
                key={etapa.id}
                onClick={() => setFiltroEtapa(filtroEtapa === etapa.id ? 'TODOS' : etapa.id)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  filtroEtapa === etapa.id
                    ? 'bg-purple-600 text-white border-purple-400 shadow-sm'
                    : 'bg-purple-900/40 border-purple-800/80 text-purple-200 hover:bg-purple-800/60'
                }`}
              >
                <div className="text-xs font-bold truncate">{etapa.label}</div>
                <div className="text-[10px] opacity-80 line-clamp-1 mt-0.5">{etapa.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Matérias cadastradas no Radar com Tramitação */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Proposições Monitoradas no Radar Fiscal
            </h3>
            <p className="text-xs text-slate-500">
              {materiasTramitando.length} proposições identificadas com impacto em tributos ou serviços funerários
            </p>
          </div>
          {filtroEtapa !== 'TODOS' && (
            <button
              onClick={() => setFiltroEtapa('TODOS')}
              className="text-xs font-semibold text-purple-700 hover:text-purple-900"
            >
              Ver todas as etapas
            </button>
          )}
        </div>

        <div className="space-y-4 mt-4">
          {materiasTramitando.map((noticia) => (
            <div
              key={noticia.id}
              onClick={() => onSelectNoticia(noticia)}
              className="p-4 rounded-xl border border-slate-200 hover:border-purple-400 cursor-pointer transition-all bg-white hover:shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                    {noticia.tramitacaoEtapa ? getTramitacaoLabel(noticia.tramitacaoEtapa) : 'Em Tramitação'}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{noticia.ato} {noticia.numeroAto}</span>
                </div>
                <span className="text-xs text-slate-500">{noticia.orgao}</span>
              </div>

              <h4 className="text-xs font-bold text-slate-900 leading-snug">{noticia.titulo}</h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{noticia.resumo}</p>

              {/* Pipeline Step Visualizer for this item */}
              <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                  <span>Origem: <strong>{noticia.origemLegislativa || 'Congresso Nacional'}</strong></span>
                  <span>Previsão de Vigência: <strong>{formatarData(noticia.dataVigencia)}</strong></span>
                </div>

                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full ${
                      noticia.tramitacaoEtapa === 'VIGENTE'
                        ? 'w-full bg-emerald-500'
                        : noticia.tramitacaoEtapa === 'PUBLICADO'
                        ? 'w-5/6 bg-blue-500'
                        : noticia.tramitacaoEtapa === 'AGUARDANDO_SANCAO'
                        ? 'w-4/6 bg-amber-500'
                        : noticia.tramitacaoEtapa === 'AGUARDANDO_SENADO'
                        ? 'w-3/6 bg-purple-500'
                        : noticia.tramitacaoEtapa === 'APROVADO_CAMARA'
                        ? 'w-2/6 bg-purple-400'
                        : 'w-1/6 bg-purple-300'
                    }`}
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                <span className="text-indigo-700 font-medium">
                  Impacto Funerário: {noticia.subsegmentosFunerariosAfetados.slice(0, 3).join(', ') || 'Geral'}
                </span>
                <span className="text-purple-700 font-semibold flex items-center gap-1">
                  Abrir Detalhes <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status Feedback */}
      {mensagemStatus && (
        <div className="p-3 bg-purple-100 border border-purple-300 text-purple-900 rounded-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-purple-700 shrink-0" />
          <span>{mensagemStatus}</span>
        </div>
      )}

      {/* Integration with Chamber of Deputies (API Oficial dos Dados Abertos - Public APIs) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-purple-700" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Integração Oficial — Câmara dos Deputados (API v2 Dados Abertos)
                </h3>
                <a
                  href="https://github.com/public-apis/public-apis#government"
                  target="_blank"
                  rel="noreferrer"
                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 inline-flex items-center gap-1"
                >
                  <span>Public APIs: Government</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Sincronização em tempo real de proposições em trâmite no Poder Legislativo com importador automático
              </p>
            </div>
          </div>

          <button
            onClick={carregarDadosCamara}
            disabled={loadingCamara}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 rounded font-medium transition-colors self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingCamara ? 'animate-spin' : ''}`} />
            <span>Atualizar API</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-4">
          {proposicoesCamara.map((prop: any, idx: number) => {
            const isImportado = importados.includes(prop.id);
            const isCarregando = importandoId === prop.id;

            return (
              <div
                key={prop.id || idx}
                className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold text-[10px] font-mono">
                      {prop.siglaTipo} {prop.numero}/{prop.ano}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">ID: {prop.id}</span>
                  </div>
                  <p className="text-xs text-slate-700 line-clamp-3 leading-relaxed">
                    {prop.ementa}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-emerald-700 font-medium">Fonte Primária</span>
                    <a
                      href={`https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=${prop.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-purple-700 hover:text-purple-900 font-semibold flex items-center gap-0.5"
                    >
                      Ficha Oficial <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <button
                    onClick={() => handleImportarProposicao(prop)}
                    disabled={isImportado || isCarregando}
                    className={`w-full py-1.5 px-2 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      isImportado
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-purple-700 hover:bg-purple-800 text-white shadow-2xs'
                    }`}
                  >
                    {isCarregando ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Importando...</span>
                      </>
                    ) : isImportado ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Importado para o Radar</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Importar para o Radar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
