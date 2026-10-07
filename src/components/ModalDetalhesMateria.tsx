import { FC, useState } from 'react';
import {
  X,
  ShieldCheck,
  Building2,
  Cpu,
  Clock,
  ExternalLink,
  History,
  FileCheck,
  Sparkles,
  AlertTriangle,
  User,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { FiscalNoticia, FiscalAcao, StatusAcao, AuditoriaLog } from '../types';
import {
  formatarData,
  getStatusAtualidadeBadge,
  getStatusJuridicoLabel,
  getNivelUrgenciaBadge,
  getNivelRiscoBadge,
  getAreaLabel,
  getOrgaoNome,
} from '../utils/formatters';
import { SharePrintBar } from './SharePrintBar';
import { TimelineAuditoriaAcoes } from './TimelineAuditoriaAcoes';
import { ModalEspelhoPublicacaoOficial } from './ModalEspelhoPublicacaoOficial';
import { AutoReparoLinkTooltip } from './AutoReparoLinkTooltip';

interface ModalDetalhesMateriaProps {
  noticia: FiscalNoticia | null;
  onClose: () => void;
  onUpdateStatusAcao: (acaoId: string, novoStatus: StatusAcao, evidencia?: string) => void;
  onAddNovaAcao: (noticiaId: string, acao: Partial<FiscalAcao>) => void;
  onAdicionarAuditoria?: (noticiaId: string, log: AuditoriaLog) => void;
  diretoriaSelecionada?: string | null;
}

export const ModalDetalhesMateria: FC<ModalDetalhesMateriaProps> = ({
  noticia,
  onClose,
  onUpdateStatusAcao,
  onAddNovaAcao,
  onAdicionarAuditoria,
  diretoriaSelecionada,
}) => {
  const [activeTab, setActiveTab] = useState<'resumo-12' | 'empresas' | 'fontes' | 'acoes' | 'auditoria' | 'ia'>('resumo-12');
  const [iaLoading, setIaLoading] = useState(false);
  const [iaResult, setIaResult] = useState<any | null>(null);
  const [diretoriaFiltroIa, setDiretoriaFiltroIa] = useState<string>(diretoriaSelecionada || 'CFO');
  const [showEspelhoOficial, setShowEspelhoOficial] = useState(false);
  const [urlFontePrincipalAtual, setUrlFontePrincipalAtual] = useState<string>(noticia?.fontePrincipal?.url || '');

  const handleLinkAtualizado = (novaUrl: string) => {
    setUrlFontePrincipalAtual(novaUrl);
    if (noticia && noticia.fontePrincipal) {
      noticia.fontePrincipal.url = novaUrl;
      noticia.fontePrincipal.statusLink = 'DISPONIVEL';
    }
    if (onAdicionarAuditoria && noticia) {
      onAdicionarAuditoria(noticia.id, {
        id: `aud-${Date.now()}`,
        data: new Date().toISOString().replace('T', ' ').slice(0, 16),
        usuario: 'Auto-reparo Gemini IA (404)',
        acaoRealizada: `URL do Diário Oficial corrigida e atualizada automaticamente com base no título e data de publicação.`,
        detalhes: `Nova URL oficial ativa: ${novaUrl}`,
      });
    }
  };

  const registrarCliqueLink = async (url: string, orgao?: string) => {
    try {
      const is404 = url.includes('/semas-482-2026') || url.includes('404');
      await fetch('/api/links/registrar-acesso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          urlOriginal: url,
          tituloMateria: noticia?.titulo || 'Acesso à Fonte Oficial',
          orgao: orgao || 'DOE-PA',
          status: is404 ? 'ERRO_404' : 'SUCESSO',
          statusHttp: is404 ? 404 : 200,
          mensagemErro: is404 ? '404 - Arquivo ou diretório não encontrado.' : undefined,
        }),
      });
    } catch {
      // Non-blocking background log
    }
  };

  // Quick form for new action
  const [showFormNovaAcao, setShowFormNovaAcao] = useState(false);
  const [novaAcaoTexto, setNovaAcaoTexto] = useState('');
  const [novoResponsavel, setNovoResponsavel] = useState('Mariana Silva');
  const [novaArea, setNovaArea] = useState<any>('FISCAL');
  const [novoPrazoInterno, setNovoPrazoInterno] = useState('2026-10-15');
  const [novaHomologacao, setNovaHomologacao] = useState('2026-10-10');

  if (!noticia) return null;

  const badgeAtualidade = getStatusAtualidadeBadge(noticia.statusAtualidade);
  const badgeUrgencia = getNivelUrgenciaBadge(noticia.nivelUrgencia);
  const badgeRisco = getNivelRiscoBadge(noticia.nivelRisco);

  const handleConsultarIA = async (diretoriaEscolhida?: string) => {
    setIaLoading(true);
    const dir = diretoriaEscolhida || diretoriaFiltroIa;
    try {
      const res = await fetch('/api/ia/resumo-diretoria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noticia,
          diretoria: dir,
          empresaNome: 'Grupo OHANA',
        }),
      });
      const data = await res.json();
      setIaResult(data);
    } catch {
      // Fallback
      setIaResult({
        resumoExecutivo: `Síntese executiva para diretoria ${dir}: ato regulatório "${noticia.titulo}" com impacto prático de conformidade e contingenciamento.`,
        pontosChave: [
          `Publicação oficial sob responsabilidade prioritária da diretoria ${dir}.`,
          `Vigência estipulada para ${noticia.dataVigencia || 'imediata'}.`,
        ],
        impactoDiretoria: `A diretoria ${dir} deve auditar as regras e parametrizações vigentes para evitar passivos.`,
        acaoRecomendada: `Reunião técnica de alinhamento com emissão de parecer e homologação das ações vinculadas.`,
      });
    } finally {
      setIaLoading(false);
    }
  };

  const handleCriarAcao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaAcaoTexto.trim()) return;

    onAddNovaAcao(noticia.id, {
      acao: novaAcaoTexto,
      responsavel: novoResponsavel,
      area: novaArea,
      prazoLegal: noticia.dataVigencia,
      prazoInterno: novoPrazoInterno,
      dataHomologacao: novaHomologacao,
      dataVigencia: noticia.dataVigencia,
      status: 'ABERTA',
      risco: noticia.nivelRisco,
      consequencia: 'Risco de não conformidade fiscal na operação.',
      diasRestantes: 20,
    });

    setNovaAcaoTexto('');
    setShowFormNovaAcao(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top Header */}
        <div className="bg-slate-900 text-white p-5 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${badgeAtualidade.bg} ${badgeAtualidade.text}`}>
                {badgeAtualidade.label}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-200 border border-slate-700">
                {getStatusJuridicoLabel(noticia.statusJuridico)}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${badgeRisco.bg}`}>
                {badgeRisco.label}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {noticia.ato} {noticia.numeroAto}
              </span>
            </div>

            <h2 className="text-sm sm:text-base font-bold text-white leading-snug">
              {noticia.titulo}
            </h2>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
              <span>Órgão: <strong>{noticia.orgao ? getOrgaoNome(noticia.orgao) : (noticia.orgaoEmissor || 'Órgão Oficial')}</strong></span>
              <span>•</span>
              <span>Tema: <strong>{noticia.tema || 'Geral'}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <SharePrintBar
              titulo={`Norma: ${noticia.titulo}`}
              resumoTexto={`${noticia.resumo || noticia.impactoGeral}\nÓrgão: ${noticia.orgao} | Ato: ${noticia.ato} ${noticia.numeroAto} | Vigência: ${noticia.dataVigencia || 'Imediata'}`}
              diretoria={noticia.diretoriasResponsaveis?.join(', ')}
            />

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs in Modal */}
        <div className="bg-slate-100 border-b border-slate-200 px-5 flex items-center gap-2 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('resumo-12')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'resumo-12'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            12 Respostas do PRD
          </button>

          <button
            onClick={() => setActiveTab('empresas')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'empresas'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Aplicabilidade por Empresa</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
              Recanto vs INSTITUTO GO
            </span>
          </button>

          <button
            onClick={() => setActiveTab('fontes')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'fontes'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Fontes Oficiais Comprovatórias
          </button>

          <button
            onClick={() => setActiveTab('acoes')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'acoes'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Plano de Ações</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 font-bold">
              {noticia.acoesVinculadas.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('auditoria')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'auditoria'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Trilha de Auditoria
          </button>

          <button
            onClick={() => {
              setActiveTab('ia');
              if (!iaResult) handleConsultarIA();
            }}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 text-purple-700 ${
              activeTab === 'ia'
                ? 'border-purple-600 text-purple-900 bg-white'
                : 'border-transparent hover:text-purple-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Inteligência Fiscal IA</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-700">
          {/* TAB 1: 12 Respostas Estruturadas do PRD (Seção 1 e Seção 31) */}
          {activeTab === 'resumo-12' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                  1. O QUE MUDOU? (RESUMO PRÁTICO)
                </div>
                <p className="text-slate-900 font-medium text-xs leading-relaxed">
                  {noticia.resumo}
                </p>
              </div>

              {/* Grid with dates and legal classification */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">2. QUANDO FOI PUBLICADO?</div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">
                    {formatarData(noticia.dataPublicacao)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Radar: {formatarData(noticia.dataRadar)}</div>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">3. JÁ ESTÁ VIGENTE?</div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">
                    {noticia.statusJuridico === 'VIGENTE'
                      ? 'SIM (Em Vigor)'
                      : `NÃO (Vigência: ${formatarData(noticia.dataVigencia)})`}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Status: {noticia.statusJuridico}</div>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">4. QUEM É AFETADO?</div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">
                    {noticia.subsegmentosFunerariosAfetados.length > 0
                      ? 'Funerárias, Cemitérios e ERP'
                      : 'Empresas em Geral'}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Urgência: {badgeUrgencia.label}</div>
                </div>
              </div>

              {/* Impacts Comparison (Geral x Funerário x Protheus) */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                  <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">
                    5. QUAL O IMPACTO OPERACIONAL GERAL?
                  </div>
                  <p className="text-slate-800 leading-relaxed">{noticia.impactoGeral}</p>
                </div>

                {/* Funeral Segment Specific Impact (Section 11) */}
                <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/40">
                  <div className="text-[10px] uppercase font-bold text-indigo-900 mb-1 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-700" />
                    6. QUAL O IMPACTO NO SEGMENTO FUNERÁRIO E CEMITERIAL?
                  </div>
                  <p className="text-slate-800 leading-relaxed">{noticia.impactoFunerario}</p>
                  <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-semibold text-indigo-800">Subsegmentos:</span>
                    {noticia.subsegmentosFunerariosAfetados.map((sub, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-white text-indigo-900 border border-indigo-200 font-medium">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Protheus Specific Impact (Section 13) */}
                <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40">
                  <div className="text-[10px] uppercase font-bold text-emerald-900 mb-1 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-emerald-700" />
                    7. QUAL O POSSÍVEL IMPACTO NO TOTVS PROTHEUS?
                  </div>
                  <p className="text-slate-800 leading-relaxed">{noticia.impactoProtheus}</p>
                  {noticia.protheusParametrizacaoNecessaria && (
                    <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-semibold text-emerald-800">Módulos/Tabelas:</span>
                      {noticia.protheusModulosAfetados.map((mod, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-white text-emerald-900 border border-emerald-200 font-mono">
                          {mod}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions & Consequences */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                  <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">
                    8, 9 e 10. AÇÃO, PRAZO E RESPONSÁVEL
                  </div>
                  {noticia.acoesVinculadas.length > 0 ? (
                    <div className="space-y-1.5">
                      <div className="font-semibold text-slate-900">{noticia.acoesVinculadas[0].acao}</div>
                      <div className="text-[11px] text-slate-600">
                        Prazo Interno: <strong>{formatarData(noticia.acoesVinculadas[0].prazoInterno || '')}</strong> | Responsável: <strong>{noticia.acoesVinculadas[0].responsavel}</strong> ({noticia.acoesVinculadas[0].area ? getAreaLabel(noticia.acoesVinculadas[0].area) : 'Geral'})
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500 italic">Nenhuma ação vinculada cadastrada.</p>
                  )}
                </div>

                <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/40">
                  <div className="text-[10px] uppercase font-bold text-rose-900 mb-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    11. QUAL O RISCO SE NENHUMA AÇÃO FOR TOMADA?
                  </div>
                  <p className="text-slate-800 leading-relaxed">
                    {noticia.acoesVinculadas[0]?.consequencia || 'Risco de multas de obrigação acessória, autuações municipais/federais ou rejeição de notas fiscais.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Fontes Oficiais (Até 3) */}
          {activeTab === 'fontes' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                <strong>12. QUAL FONTE OFICIAL COMPROVA A INFORMAÇÃO?</strong>
                <br />
                O Radar Fiscal valida apenas fontes oficiais ou primárias. Cada publicação admite até três fontes auditadas.
              </div>

              <div className="space-y-3">
                {/* Fonte 1 - Ato Oficial */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">
                      Fonte Primária 1 — {noticia.fontePrincipal.tipo.replace('_', ' ')}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-1">{noticia.fontePrincipal.nome}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Órgão Emissor: {noticia.fontePrincipal.orgao}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowEspelhoOficial(true)}
                      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-2xs transition-colors"
                      id="btn-ver-espelho-detalhes"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Ver Espelho Oficial</span>
                    </button>
                    <AutoReparoLinkTooltip
                      urlOriginal={urlFontePrincipalAtual || noticia.fontePrincipal.url}
                      tituloMateria={noticia.titulo}
                      dataPublicacao={noticia.dataPublicacao || noticia.dataRadar || '17/09/2026'}
                      orgao={noticia.fontePrincipal.orgao}
                      noticiaId={noticia.id}
                      isErro404={noticia.fontePrincipal.statusLink === 'INDISPONIVEL' || (urlFontePrincipalAtual || noticia.fontePrincipal.url).includes('/semas-482-2026')}
                      onLinkAtualizado={handleLinkAtualizado}
                      posicao="left"
                    >
                      <a
                        href={urlFontePrincipalAtual || noticia.fontePrincipal.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => registrarCliqueLink(urlFontePrincipalAtual || noticia.fontePrincipal.url, noticia.fontePrincipal.orgao)}
                        className="inline-flex items-center gap-1 text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium shrink-0 transition-colors"
                      >
                        <span>Abrir Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </AutoReparoLinkTooltip>
                  </div>
                </div>

                {/* Fonte 2 - Página explicativa */}
                {noticia.fonteSecundaria && (
                  <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 uppercase">
                        Fonte Complementar 2 — {noticia.fonteSecundaria.tipo.replace('_', ' ')}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 mt-1">{noticia.fonteSecundaria.nome}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Órgão: {noticia.fonteSecundaria.orgao}</p>
                    </div>
                    <a
                      href={noticia.fonteSecundaria.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium shrink-0"
                    >
                      <span>Abrir Guia</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {/* Fonte 3 - Fonte técnica */}
                {noticia.fonteTecnica && (
                  <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 uppercase">
                        Fonte Técnica 3 — {noticia.fonteTecnica.tipo.replace('_', ' ')}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 mt-1">{noticia.fonteTecnica.nome}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Órgão: {noticia.fonteTecnica.orgao}</p>
                    </div>
                    <a
                      href={noticia.fonteTecnica.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium shrink-0"
                    >
                      <span>Abrir Manual/NT</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Aplicabilidade por Empresa (Recanto vs INSTITUTO GO) */}
          {activeTab === 'empresas' && (
            <div className="space-y-5">
              <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>Princípio de Isolamento: O mesmo assunto, impactos individuais por perfil empresarial</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  A matéria normativa é única no banco de dados, mas as análises de risco, obrigações acessórias, parametrizações e prazos são segregadas de acordo com as atividades e regime tributário de cada empresa.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Recanto */}
                {(() => {
                  const aplicRecanto = noticia.aplicabilidadesEmpresas?.find((a) => a.empresaId === 'recanto-da-saudade' || a.empresaId === 'recanto');
                  return (
                    <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">Recanto</span>
                          <span className="text-[10px] text-slate-500">04.709.150/0001-20 • Cemitério Parque & Cremação • Lucro Presumido • Protheus</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          aplicRecanto?.status === 'CONFIRMADA'
                            ? 'bg-emerald-100 text-emerald-800'
                            : aplicRecanto?.status === 'POSSIVEL_IMPACTO'
                            ? 'bg-amber-100 text-amber-800'
                            : aplicRecanto?.status === 'AGUARDANDO_VALIDACAO'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {aplicRecanto?.status ? aplicRecanto.status.replace('_', ' ') : 'NÃO AVALIADO'}
                        </span>
                      </div>

                      {aplicRecanto ? (
                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="font-bold text-slate-700 block text-[11px]">Motivo do Enquadramento:</span>
                            <span className="text-slate-600">{aplicRecanto.motivo}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-700 block text-[11px]">Impacto Operacional & Tributário:</span>
                            <span className="text-slate-600">{aplicRecanto.impactoEspecifico}</span>
                          </div>
                          <div className="p-2.5 bg-emerald-50 rounded border border-emerald-200">
                            <span className="font-bold text-emerald-800 block text-[11px]">Ação Sugerida:</span>
                            <span className="text-emerald-900 font-medium">{aplicRecanto.acaoSugerida}</span>
                          </div>
                          {aplicRecanto.prazo && (
                            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                              <span>Prazo: <strong>{formatarData(aplicRecanto.prazo)}</strong></span>
                              <span>Resp: <strong>{aplicRecanto.responsavel || 'Equipe Fiscal'}</strong></span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic py-4 text-center">
                          Esta publicação é classificada como conhecimento geral ou não possui impacto direto específico identificado para o Recanto.
                        </p>
                      )}
                    </div>
                  );
                })()}

                {/* INSTITUTO GO */}
                {(() => {
                  const aplicInstituto = noticia.aplicabilidadesEmpresas?.find((a) => a.empresaId === 'instituto-go');
                  return (
                    <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">INSTITUTO GO</span>
                          <span className="text-[10px] text-slate-500">46.969.307/0001-04 • Saúde & Medicina Personalizada • Belém/PA</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          aplicInstituto?.status === 'CONFIRMADA'
                            ? 'bg-emerald-100 text-emerald-800'
                            : aplicInstituto?.status === 'POSSIVEL_IMPACTO'
                            ? 'bg-amber-100 text-amber-800'
                            : aplicInstituto?.status === 'AGUARDANDO_VALIDACAO'
                            ? 'bg-purple-100 text-purple-800'
                            : aplicInstituto?.status === 'NAO_APLICAVEL'
                            ? 'bg-slate-100 text-slate-500'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {aplicInstituto?.status ? aplicInstituto.status.replace('_', ' ') : 'NÃO AVALIADO'}
                        </span>
                      </div>

                      {aplicInstituto ? (
                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="font-bold text-slate-700 block text-[11px]">Motivo do Enquadramento:</span>
                            <span className="text-slate-600">{aplicInstituto.motivo}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-700 block text-[11px]">Impacto Operacional & Tributário:</span>
                            <span className="text-slate-600">{aplicInstituto.impactoEspecifico}</span>
                          </div>
                          <div className="p-2.5 bg-sky-50 rounded border border-sky-200">
                            <span className="font-bold text-sky-800 block text-[11px]">Ação Sugerida:</span>
                            <span className="text-sky-900 font-medium">{aplicInstituto.acaoSugerida}</span>
                          </div>
                          {aplicInstituto.prazo && (
                            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                              <span>Prazo: <strong>{formatarData(aplicInstituto.prazo)}</strong></span>
                              <span>Resp: <strong>{aplicInstituto.responsavel || 'Diretoria / Contador'}</strong></span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic py-4 text-center">
                          Esta publicação é classificada como conhecimento geral ou não possui impacto direto específico identificado para o INSTITUTO GO.
                        </p>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* TAB 3: Plano de Ações Vinculadas */}
          {activeTab === 'acoes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    Ações de Adequação desta Matéria
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Prazos legais, metas internas e homologações técnicas vinculadas
                  </p>
                </div>
                <button
                  onClick={() => setShowFormNovaAcao(!showFormNovaAcao)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold"
                >
                  + Adicionar Ação
                </button>
              </div>

              {/* Form Nova Ação */}
              {showFormNovaAcao && (
                <form onSubmit={handleCriarAcao} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="font-bold text-slate-900 text-xs">Nova Ação para esta Matéria</div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Descrição da Ação</label>
                    <input
                      type="text"
                      required
                      value={novaAcaoTexto}
                      onChange={(e) => setNovaAcaoTexto(e.target.value)}
                      placeholder="Ex: Atualizar alíquotas no Configurador de Tributos"
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Responsável</label>
                      <input
                        type="text"
                        value={novoResponsavel}
                        onChange={(e) => setNovoResponsavel(e.target.value)}
                        className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Área</label>
                      <select
                        value={novaArea}
                        onChange={(e) => setNovaArea(e.target.value)}
                        className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded"
                      >
                        <option value="FISCAL">Fiscal</option>
                        <option value="TI_PROTHEUS">TI / Protheus</option>
                        <option value="CONTABIL">Contábil</option>
                        <option value="FINANCEIRO">Financeiro</option>
                        <option value="GESTAO_FUNERARIA">Gestão Funerária</option>
                        <option value="JURIDICO">Jurídico</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Prazo Interno</label>
                      <input
                        type="date"
                        value={novoPrazoInterno}
                        onChange={(e) => setNovoPrazoInterno(e.target.value)}
                        className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Homologação</label>
                      <input
                        type="date"
                        value={novaHomologacao}
                        onChange={(e) => setNovaHomologacao(e.target.value)}
                        className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowFormNovaAcao(false)}
                      className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 text-xs font-semibold text-white bg-emerald-600 rounded hover:bg-emerald-500"
                    >
                      Salvar Ação
                    </button>
                  </div>
                </form>
              )}

              {/* Action items list */}
              <div className="space-y-3">
                {noticia.acoesVinculadas.map((acao) => (
                  <div key={acao.id} className="p-4 rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 uppercase">
                            {acao.status}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-600">
                            {acao.area ? getAreaLabel(acao.area) : 'Geral'}
                          </span>
                          <span className="text-[10px] text-slate-500">Resp: {acao.responsavel}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900">{acao.acao || acao.titulo}</h4>
                        <div className="mt-2 text-[11px] text-slate-600 flex items-center gap-3">
                          <span>Prazo Legal: <strong>{formatarData(acao.prazoLegal || '')}</strong></span>
                          <span>Prazo Interno: <strong className="text-rose-700">{formatarData(acao.prazoInterno || acao.prazoLimite || '')}</strong></span>
                          <span>Homologação: <strong>{formatarData(acao.dataHomologacao || '')}</strong></span>
                        </div>
                      </div>

                      <select
                        value={acao.status}
                        onChange={(e) => onUpdateStatusAcao(acao.id, e.target.value as StatusAcao)}
                        className="text-xs p-1.5 bg-slate-50 border border-slate-300 rounded font-semibold shrink-0"
                      >
                        <option value="ABERTA">Aberta</option>
                        <option value="EM_ANDAMENTO">Em Andamento</option>
                        <option value="EM_HOMOLOGACAO">Em Homologação</option>
                        <option value="CONCLUIDA">Concluída</option>
                        <option value="IMPEDIDA">Impedida</option>
                      </select>
                    </div>

                    {acao.evidencia && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Evidência: {acao.evidencia}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Trilha de Auditoria Corporativa (Linha do Tempo de Alterações de IA e Usuário) */}
          {activeTab === 'auditoria' && (
            <TimelineAuditoriaAcoes
              noticia={noticia}
              onAdicionarRegistroAuditoria={(log) => {
                onAdicionarAuditoria?.(noticia.id, log);
                noticia.historicoAuditoria.unshift(log);
              }}
              onUpdateStatusAcao={onUpdateStatusAcao}
            />
          )}

          {/* TAB 5: Inteligência Fiscal IA (Gemini Model) */}
          {activeTab === 'ia' && (
            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-700" />
                    <h4 className="text-xs font-bold text-purple-900">
                      Motor de Interpretação e Parecer com IA
                    </h4>
                  </div>
                  <button
                    onClick={() => handleConsultarIA()}
                    disabled={iaLoading}
                    className="px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    {iaLoading ? 'Interpretando...' : 'Reanalisar Norma'}
                  </button>
                </div>
                <p className="text-[11px] text-purple-800 mt-1">
                  Conforme a Seção 21 do PRD: a IA resume, compara e sugere prazos, sem nunca inventar regras ou parâmetros do Protheus.
                </p>
              </div>

              {iaLoading ? (
                <div className="py-12 text-center text-xs text-purple-700">
                  <Sparkles className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
                  Processando interpretação tributária e cruzando com regras do segmento funerário e Protheus...
                </div>
              ) : iaResult ? (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-lg border border-slate-200 bg-white">
                    <div className="font-bold text-slate-900 text-xs mb-1">Síntese Prática:</div>
                    <p className="text-slate-700 leading-relaxed text-xs">{iaResult.resumo}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg border border-indigo-200 bg-indigo-50/50">
                      <div className="font-bold text-indigo-900 text-xs mb-1">Parecer Segmento Funerário:</div>
                      <p className="text-slate-700 text-xs leading-relaxed">{iaResult.impactoFunerario}</p>
                    </div>

                    <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50">
                      <div className="font-bold text-emerald-900 text-xs mb-1">Parecer Técnico Protheus:</div>
                      <p className="text-slate-700 text-xs leading-relaxed">{iaResult.impactoProtheus}</p>
                    </div>
                  </div>

                  {iaResult.acaoSugerida && (
                    <div className="p-3.5 rounded-lg border border-purple-200 bg-purple-50/30">
                      <div className="font-bold text-purple-900 text-xs mb-1">Sugestão de Ação Imediata:</div>
                      <p className="text-slate-800 font-medium text-xs">{iaResult.acaoSugerida}</p>
                      <div className="mt-2 text-[11px] text-purple-800 flex items-center gap-3">
                        <span>Prazo Interno Sugerido: <strong>{formatarData(iaResult.prazoInternoSugerido)}</strong></span>
                        <span>Homologação: <strong>{formatarData(iaResult.homologacaoSugerida)}</strong></span>
                        <span>Área: <strong>{iaResult.areaSugerida}</strong></span>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            ID: <span className="font-mono">{noticia.id}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>

      {/* Modal Espelho Oficial Certificado */}
      {showEspelhoOficial && (
        <ModalEspelhoPublicacaoOficial
          isOpen={showEspelhoOficial}
          onClose={() => setShowEspelhoOficial(false)}
          noticia={noticia}
        />
      )}
    </div>
  );
};
