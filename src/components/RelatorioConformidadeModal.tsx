import { FC, useMemo } from 'react';
import {
  X,
  Printer,
  Share2,
  Mail,
  ShieldAlert,
  Calendar,
  Building2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  User,
  ArrowRight,
} from 'lucide-react';
import { FiscalNoticia, FiscalAcao, EmpresaPerfil } from '../types';
import { formatarData } from '../utils/formatters';

interface RelatorioConformidadeModalProps {
  isOpen: boolean;
  onClose: () => void;
  noticias: FiscalNoticia[];
  acoes: FiscalAcao[];
  empresas: EmpresaPerfil[];
  selectedEmpresaId?: string | null;
  diretoriaFiltro?: string | null;
}

export const RelatorioConformidadeModal: FC<RelatorioConformidadeModalProps> = ({
  isOpen,
  onClose,
  noticias,
  acoes,
  empresas,
  selectedEmpresaId,
  diretoriaFiltro,
}) => {
  if (!isOpen) return null;

  const empresaAlvo = useMemo(() => {
    if (!selectedEmpresaId || selectedEmpresaId === 'todas') return null;
    return empresas.find((e) => e.id === selectedEmpresaId) || null;
  }, [selectedEmpresaId, empresas]);

  // Itens com urgência 'ALTO' ou 'CRITICO' E status de homologação pendente (ou ação não concluída)
  const itensCriticosPendentes = useMemo(() => {
    return noticias
      .filter((n) => {
        // Filtrar por empresa se aplicável
        if (selectedEmpresaId && selectedEmpresaId !== 'todas') {
          const matchEmpresa =
            n.aplicabilidadesEmpresas?.some((a) => a.empresaId === selectedEmpresaId) ||
            (selectedEmpresaId === 'recanto-da-saudade' &&
              (n.titulo.includes('SEMAS') || n.titulo.includes('Belém') || n.palavrasChave?.includes('Recanto da Saudade')));
          if (!matchEmpresa) return false;
        }

        // Filtrar por diretoria se aplicável
        if (diretoriaFiltro && diretoriaFiltro !== 'TODAS') {
          if (!n.diretoriasResponsaveis?.includes(diretoriaFiltro as any)) return false;
        }

        // Urgência ALTO ou CRITICO
        const isAltaUrgencia = n.nivelUrgencia === 'ALTO' || n.nivelUrgencia === 'CRITICO';
        if (!isAltaUrgencia) return false;

        // Status de homologação Protheus ou ação aberta
        const homologacaoPendente =
          n.protheusStatusHomologacao === 'PENDENTE' ||
          n.protheusStatusHomologacao === 'EM_TESTE' ||
          n.protheusStatusHomologacao === 'NAO_APLICAVEL' ||
          !n.protheusStatusHomologacao;

        const acoesPendentes = (n.acoesVinculadas || []).some(
          (a) => a.status !== 'CONCLUIDA'
        );

        return homologacaoPendente || acoesPendentes;
      })
      .map((n) => {
        // Ações associadas pendentes
        const acoesDaMateria = acoes.filter(
          (a) => a.noticiaId === n.id && a.status !== 'CONCLUIDA'
        );
        return {
          noticia: n,
          acoesPendentes: acoesDaMateria.length > 0 ? acoesDaMateria : n.acoesVinculadas.filter((a) => a.status !== 'CONCLUIDA'),
        };
      });
  }, [noticias, acoes, selectedEmpresaId, diretoriaFiltro]);

  const dataEmissao = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const texto = encodeURIComponent(
      `*OHANA MONITOR CORPORATIVO - RELATÓRIO DE NÃO CONFORMIDADES*\n` +
      `🏢 *Empresa:* ${empresaAlvo?.nome || 'Todas as Empresas'}\n` +
      `📅 *Emissão:* ${dataEmissao}\n` +
      `⚠️ *Total de Matérias Críticas Pendentes:* ${itensCriticosPendentes.length}\n\n` +
      `*Destaques Urgentes:*\n` +
      itensCriticosPendentes
        .slice(0, 4)
        .map((item, idx) => `${idx + 1}. ${item.noticia.titulo} (Prazo: ${item.noticia.dataVigencia || 'Imediato'})`)
        .join('\n') +
      `\n\nFavor priorizar a homologação no Protheus e cumprimento dos prazos legais.`
    );
    window.open(`https://api.whatsapp.com/send?text=${texto}`, '_blank');
  };

  const handleEmail = () => {
    const assunto = encodeURIComponent(
      `[RELATÓRIO DE CONFORMIDADE URGENTE] ${empresaAlvo?.nome || 'Grupo OHANA'} - ${dataEmissao}`
    );
    const corpo = encodeURIComponent(
      `Prezada Diretoria e Presidência,\n\n` +
      `Segue o extrato executivo de Não Conformidades e Prazos Críticos pendentes de homologação para ${empresaAlvo?.nome || 'o Grupo OHANA'}:\n\n` +
      `Total de Itens de Alta Criticidade Pendentes: ${itensCriticosPendentes.length}\n\n` +
      itensCriticosPendentes
        .map(
          (item, idx) =>
            `${idx + 1}. ${item.noticia.titulo}\n` +
            `   - Órgão: ${item.noticia.orgao} | Urgência: ${item.noticia.nivelUrgencia}\n` +
            `   - Vigência Legal: ${formatarData(item.noticia.dataVigencia || '')}\n` +
            `   - Consequência: ${item.noticia.impactoGeral || 'Risco fiscal/operacional'}\n`
        )
        .join('\n\n') +
      `\n\nRelatório gerado automaticamente pelo Sistema de Inteligência Regulatória OHANA.`
    );
    window.open(`mailto:?subject=${assunto}&body=${corpo}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Barra Superior - Ações de Impressão e Envio */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between gap-4 border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold">Relatório Executivo de Conformidade & Prazos Críticos</h3>
              <p className="text-[11px] text-slate-400">
                Resumo de auditoria com pendências de urgência ALTO / CRÍTICO
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Salvar PDF</span>
            </button>

            <button
              type="button"
              onClick={handleWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleEmail}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700"
            >
              <Mail className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">E-mail</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conteúdo do Relatório Imprimível (A4 Executivo) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 print:p-0 print:overflow-visible text-slate-900 bg-white">
          {/* Cabeçalho do Documento Oficial */}
          <div className="border-b-2 border-slate-900 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-800 font-bold block mb-1">
                  GRUPO OHANA • GOVERNANÇA, RISCO & CONFORMIDADE
                </span>
                <h1 className="text-xl font-black tracking-tight text-slate-900">
                  Dossiê Executivo de Conformidade & Ações Pendentes
                </h1>
                <p className="text-xs text-slate-600 mt-1">
                  Filtro Específico: Matérias com Urgência <strong>ALTA / CRÍTICA</strong> e Homologação Técnica Pendente
                </p>
              </div>

              <div className="text-right text-xs space-y-1 sm:border-l sm:border-slate-200 sm:pl-4">
                <div><strong>Data de Emissão:</strong> {dataEmissao}</div>
                <div>
                  <strong>Escopo:</strong>{' '}
                  <span className="text-emerald-800 font-bold">
                    {empresaAlvo ? `${empresaAlvo.nome} (${empresaAlvo.cnpj})` : 'Consolidado Todas as Empresas'}
                  </span>
                </div>
                {diretoriaFiltro && diretoriaFiltro !== 'TODAS' && (
                  <div><strong>Diretoria Foco:</strong> {diretoriaFiltro}</div>
                )}
              </div>
            </div>
          </div>

          {/* Resumo Numérico de Vulnerabilidade */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="p-2">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Matérias Críticas</span>
              <span className="text-2xl font-black text-red-600">{itensCriticosPendentes.length}</span>
            </div>
            <div className="p-2">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Ações em Aberto</span>
              <span className="text-2xl font-black text-amber-600">
                {itensCriticosPendentes.reduce((acc, item) => acc + item.acoesPendentes.length, 0)}
              </span>
            </div>
            <div className="p-2">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Prazos &lt; 30 dias</span>
              <span className="text-2xl font-black text-rose-600">
                {itensCriticosPendentes.filter((i) => i.acoesPendentes.some((a) => (a.diasRestantes ?? 30) <= 30)).length}
              </span>
            </div>
            <div className="p-2">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Status Geral</span>
              <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded inline-block mt-1">
                Atenção Imediata
              </span>
            </div>
          </div>

          {/* Lista de Matérias e Ações com Detalhamento */}
          <div className="space-y-5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span>Obrigações e Riscos Normativos Mapeados</span>
            </h3>

            {itensCriticosPendentes.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs bg-emerald-50 rounded-xl border border-emerald-200 p-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <strong className="block text-emerald-900 text-sm">Nenhuma não-conformidade crítica pendente!</strong>
                Todas as normas de alta urgência para esta seleção já foram homologadas ou não possuem ações em aberto.
              </div>
            ) : (
              <div className="space-y-4">
                {itensCriticosPendentes.map(({ noticia, acoesPendentes }, idx) => (
                  <div
                    key={noticia.id}
                    className="p-4 rounded-xl border border-slate-300 bg-white space-y-3 print:border-slate-400 print:break-inside-avoid"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                            ITEM #{idx + 1}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            noticia.nivelUrgencia === 'CRITICO' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            URGÊNCIA {noticia.nivelUrgencia}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                            {noticia.orgao} • {noticia.ato} {noticia.numeroAto}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            Publicação: {formatarData(noticia.dataPublicacao)} | Vigência: {formatarData(noticia.dataVigencia || '')}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          {noticia.titulo}
                        </h4>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-500 font-semibold block uppercase">Diretoria</span>
                        <span className="text-xs font-extrabold text-slate-800">
                          {noticia.diretoriasResponsaveis?.join(', ') || 'CFO'}
                        </span>
                      </div>
                    </div>

                    {/* Resumo do Impacto e Consequência */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div>
                        <strong className="text-slate-800 block text-[11px]">Impacto Operacional & Tributário:</strong>
                        <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                          {noticia.impactoFunerario || noticia.impactoGeral}
                        </p>
                      </div>
                      <div>
                        <strong className="text-red-800 block text-[11px]">Consequência da Inação:</strong>
                        <p className="text-red-900 text-[11px] mt-0.5 font-medium leading-relaxed">
                          {noticia.acoesVinculadas[0]?.consequencia || 'Autuação fiscal, glosa de créditos ou impedimento operacional.'}
                        </p>
                      </div>
                    </div>

                    {/* Impacto Protheus */}
                    {noticia.protheusParametrizacaoNecessaria && (
                      <div className="text-xs bg-sky-50 border border-sky-200 p-2.5 rounded-lg flex items-start gap-2">
                        <span className="text-[10px] font-bold uppercase bg-sky-200 text-sky-900 px-1.5 py-0.5 rounded shrink-0">
                          TOTVS Protheus
                        </span>
                        <div className="text-[11px] text-sky-900">
                          <strong>Módulos:</strong> {noticia.protheusModulosAfetados?.join(', ') || 'SIGAFIS'} •{' '}
                          <strong>Status:</strong> {noticia.protheusStatusHomologacao} • {noticia.impactoProtheus}
                        </div>
                      </div>
                    )}

                    {/* Ações Vinculadas Pendentes */}
                    {acoesPendentes.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Ações Corretivas & Prazos Definidos:
                        </span>
                        <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                          {acoesPendentes.map((acao) => (
                            <div key={acao.id} className="p-2.5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                              <div className="space-y-0.5">
                                <span className="font-bold text-slate-800 block">{acao.acao}</span>
                                <span className="text-[10px] text-slate-500">
                                  Resp: <strong>{acao.responsavel}</strong> • Área: <strong>{acao.area || 'Fiscal'}</strong>
                                </span>
                              </div>

                              <div className="flex items-center gap-3 text-right shrink-0">
                                <div>
                                  <span className="text-[9px] text-slate-400 block uppercase">Prazo Legal</span>
                                  <span className="font-bold text-red-600">{formatarData(acao.prazoLegal || '')}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-400 block uppercase">Meta Interna</span>
                                  <span className="font-bold text-slate-800">{formatarData(acao.prazoInterno || '')}</span>
                                </div>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                  {acao.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bloco de Assinaturas e Despacho */}
          <div className="border-t-2 border-slate-900 pt-6 mt-8 space-y-6 print:break-inside-avoid">
            <div className="text-xs text-slate-500">
              Certifico que as matérias e prazos listados neste dossiê foram revisados pela equipe de inteligência tributária e regulatória do Grupo OHANA, constando as obrigações imediatas a serem despachadas com as diretorias executivas.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 text-center">
              <div className="border-t border-slate-400 pt-2">
                <span className="text-xs font-bold text-slate-900 block">Rubens Ohana</span>
                <span className="text-[10px] text-slate-500">Presidente / CEO</span>
              </div>
              <div className="border-t border-slate-400 pt-2">
                <span className="text-xs font-bold text-slate-900 block">Diretoria Financeira & Fiscal</span>
                <span className="text-[10px] text-slate-500">CFO</span>
              </div>
              <div className="border-t border-slate-400 pt-2">
                <span className="text-xs font-bold text-slate-900 block">Diretoria Jurídica & Compliance</span>
                <span className="text-[10px] text-slate-500">CLO</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
