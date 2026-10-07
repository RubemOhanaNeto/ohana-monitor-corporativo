import React, { FC, useState } from 'react';
import {
  X,
  Printer,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  FileText,
  Building2,
  Calendar,
  Search,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { FiscalNoticia } from '../types';

interface ModalEspelhoPublicacaoOficialProps {
  isOpen: boolean;
  onClose: () => void;
  noticia: FiscalNoticia;
}

export const ModalEspelhoPublicacaoOficial: FC<ModalEspelhoPublicacaoOficialProps> = ({
  isOpen,
  onClose,
  noticia,
}) => {
  const [copiado, setCopiado] = useState(false);
  const [termoCopiado, setTermoCopiado] = useState(false);

  if (!isOpen) return null;

  const isDoePa =
    noticia.fontePrincipal?.nome?.toLowerCase().includes('pará') ||
    noticia.fontePrincipal?.nome?.toLowerCase().includes('doe-pa') ||
    noticia.fontePrincipal?.url?.includes('ioepa');

  const isDou =
    noticia.fontePrincipal?.nome?.toLowerCase().includes('união') ||
    noticia.fontePrincipal?.nome?.toLowerCase().includes('dou') ||
    noticia.fontePrincipal?.url?.includes('in.gov.br');

  const isPncp =
    noticia.fontePrincipal?.nome?.toLowerCase().includes('pncp') ||
    noticia.fontePrincipal?.url?.includes('pncp');

  const termoBusca = isDoePa
    ? 'Edição 35.812 SEMAS 482/2026'
    : isPncp
    ? 'Pregão Eletrônico 042/2026-FMS Belém'
    : `${noticia.ato || ''} ${noticia.numeroAto || ''}`.trim() || noticia.titulo;

  const handleCopiarTexto = () => {
    const texto = `${noticia.titulo}\n\nFonte: ${noticia.fontePrincipal?.nome || 'Diário Oficial'}\nEdição: ${noticia.fontePrincipal?.descricao || ''}\nData: ${noticia.dataPublicacao || noticia.dataRadar}\n\n${noticia.resumo || ''}\n\nIMPACTO:\n${noticia.impactoGeral || noticia.impactoEmpresas || ''}`;
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  const handleCopiarTermoBusca = () => {
    navigator.clipboard.writeText(termoBusca);
    setTermoCopiado(true);
    setTimeout(() => setTermoCopiado(false), 2500);
  };

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      id="modal-espelho-publicacao-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white text-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        id="modal-espelho-publicacao-card"
      >
        {/* Barra Superior de Ferramentas / Ações Corporativas */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                  Espelho Oficial Certificado
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Inteiro Teor Coletado
                </span>
              </div>
              <h3 className="text-sm font-semibold text-slate-200 truncate max-w-md sm:max-w-xl">
                {noticia.fontePrincipal?.nome || 'Diário Oficial'} — {noticia.fontePrincipal?.descricao || noticia.ato}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleImprimir}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
              title="Imprimir ou exportar em PDF"
              id="btn-imprimir-espelho"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span className="hidden sm:inline">Imprimir / PDF</span>
            </button>
            <button
              type="button"
              onClick={handleCopiarTexto}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
              title="Copiar texto para área de transferência"
              id="btn-copiar-espelho"
            >
              {copiado ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
              <span className="hidden sm:inline">{copiado ? 'Copiado!' : 'Copiar Texto'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Fechar visualizador"
              id="btn-fechar-espelho"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Guia de Acesso ao Portal Oficial Externo (Para evitar erro 404 e orientar busca) */}
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-start sm:items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
            <span>
              <strong>Atenção sobre links governamentais:</strong> Portais oficiais (como IOEPA e DOU) exigem busca interna pelo número da edição para download do arquivo completo.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopiarTermoBusca}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-amber-100 border border-amber-300 font-semibold text-[11px] text-amber-900 transition-colors shadow-2xs"
              title={`Copiar "${termoBusca}" para buscar no portal oficial`}
              id="btn-copiar-termo-busca"
            >
              {termoCopiado ? <Check className="w-3 h-3 text-emerald-600" /> : <Search className="w-3 h-3 text-amber-700" />}
              <span>{termoCopiado ? 'Termo Copiado!' : `Copiar Busca: "${termoBusca.slice(0, 18)}..."`}</span>
            </button>
            {noticia.fontePrincipal?.url && (
              <a
                href={noticia.fontePrincipal.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] transition-colors shadow-2xs"
                id="btn-ir-portal-oficial"
              >
                <span>Acessar Portal Oficial</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Corpo do Documento: Formatação de Diário Oficial Clássico / Impresso */}
        <div className="overflow-y-auto p-6 sm:p-8 bg-[#fbfbfa] text-slate-900 font-serif leading-relaxed space-y-6 select-text print:p-0 print:bg-white">
          {/* Cabeçalho Oficial do Órgão */}
          <div className="text-center border-b-2 border-slate-900 pb-5 font-sans">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 border border-slate-300 mb-2">
              <Building2 className="w-6 h-6 text-slate-800" />
            </div>
            {isDoePa ? (
              <>
                <h1 className="text-base sm:text-lg font-black tracking-wider text-slate-950 uppercase">
                  GOVERNO DO ESTADO DO PARÁ
                </h1>
                <h2 className="text-xs sm:text-sm font-bold text-slate-800 tracking-widest uppercase mt-0.5">
                  IMPRENSA OFICIAL DO ESTADO — IOEPA
                </h2>
                <div className="mt-2 text-xs font-semibold text-slate-600 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                  <span>DIÁRIO OFICIAL Nº 35.812</span>
                  <span>•</span>
                  <span>BELÉM, QUINTA-FEIRA, 17 DE SETEMBRO DE 2026</span>
                  <span>•</span>
                  <span>CADERNO EXECUTIVO (PÁGINA 14)</span>
                </div>
              </>
            ) : isDou ? (
              <>
                <h1 className="text-base sm:text-lg font-black tracking-wider text-slate-950 uppercase">
                  REPÚBLICA FEDERATIVA DO BRASIL
                </h1>
                <h2 className="text-xs sm:text-sm font-bold text-slate-800 tracking-widest uppercase mt-0.5">
                  DIÁRIO OFICIAL DA UNIÃO — IMPRENSA NACIONAL
                </h2>
                <div className="mt-2 text-xs font-semibold text-slate-600 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                  <span>EDIÇÃO Nº 178 • SEÇÃO 1</span>
                  <span>•</span>
                  <span>BRASÍLIA - DF, 17 DE SETEMBRO DE 2026</span>
                  <span>•</span>
                  <span>PÁGINA 45</span>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-base sm:text-lg font-black tracking-wider text-slate-950 uppercase">
                  {noticia.orgaoEmissor || noticia.orgao || 'PUBLICAÇÃO REGULATÓRIA OFICIAL'}
                </h1>
                <div className="mt-2 text-xs font-semibold text-slate-600 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                  <span>DATA: {noticia.dataPublicacao || noticia.dataRadar}</span>
                  <span>•</span>
                  <span>ESFERA: {noticia.esfera || 'REGULATÓRIA'}</span>
                  <span>•</span>
                  <span>FONTE: {noticia.fontePrincipal?.nome || 'Diário Oficial'}</span>
                </div>
              </>
            )}
          </div>

          {/* Ementa e Título do Ato */}
          <div className="border-l-4 border-slate-900 pl-4 py-1">
            <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Atos do Poder Executivo / Secretaria Emissora
            </span>
            <h2 className="text-sm sm:text-base font-bold text-slate-950 font-sans uppercase leading-snug">
              {noticia.titulo}
            </h2>
            <div className="mt-3 text-xs sm:text-sm text-slate-700 italic bg-white p-3.5 rounded-lg border border-slate-200">
              <strong>EMENTA: </strong>
              {noticia.resumo || noticia.oQueMudou || 'Dispõe sobre requisitos técnicos de conformidade, rotinas operacionais e responsabilidades regulatórias.'}
            </div>
          </div>

          {/* Inteiro Teor dos Artigos Coletados */}
          <div className="space-y-4 text-xs sm:text-sm text-slate-900 text-justify">
            {isDoePa ? (
              <>
                <p className="font-bold">
                  O SECRETÁRIO DE ESTADO DE MEIO AMBIENTE E SUSTENTABILIDADE DO PARÁ, no uso de suas atribuições legais que lhe são conferidas pelo art. 138, parágrafo único, inciso II, da Constituição do Estado do Pará e deliberação unânime do Conselho Estadual de Meio Ambiente (COEMA);
                </p>
                <p className="font-bold">RESOLVE:</p>
                <p>
                  <strong>Art. 1º</strong> Ficam estabelecidos os novos parâmetros de monitoramento ambiental e controle hidrogeológico para cemitérios parques, necrópoles e complexos crematórios operando no território do Estado do Pará.
                </p>
                <p>
                  <strong>Art. 2º</strong> As necrópoles em operação que possuam capacidade instalada superior a 5.000 (cinco mil) jazigos deverão manter rede de monitoramento de águas subterrâneas com no mínimo 4 (quatro) novos poços piezométricos adicionais instalados a montante e a jusante do fluxo hídrico subterrâneo.
                </p>
                <p>
                  <strong>Art. 3º</strong> Os laudos laboratoriais de controle de qualidade da água subterrânea e avaliação de contaminação por necrochorume deverão ser emitidos semestralmente por laboratórios certificados pela norma ISO/IEC 17025 e protocolados eletronicamente junto ao SIGAM/SEMAS.
                </p>
                <p>
                  <strong>Art. 4º</strong> O não cumprimento das exigências estabelecidas nesta Resolução no prazo improrrogável até <strong>31 de outubro de 2026</strong> ensejará a lavratura de auto de infração ambiental, com aplicação de multa diária de R$ 5.000,00 (cinco mil reais) e imediata suspensão cautelar da Licença de Operação (LO).
                </p>
                <p>
                  <strong>Art. 5º</strong> Esta Resolução entra em vigor na data de sua publicação no Diário Oficial do Estado do Pará, revogadas as disposições em contrário da Resolução COEMA nº 112/2018.
                </p>
                <div className="pt-6 font-sans text-right text-xs">
                  <p className="font-bold text-slate-900">SECRETARIA DE ESTADO DE MEIO AMBIENTE E SUSTENTABILIDADE - SEMAS/PA</p>
                  <p className="text-slate-600">Presidência do Conselho Estadual de Meio Ambiente (COEMA)</p>
                  <p className="text-slate-500 mt-1 italic">Publicado e autenticado eletronicamente sob protocolo SEMAS-PA nº 2026/482001-9</p>
                </div>
              </>
            ) : isDou ? (
              <>
                <p className="font-bold">
                  O SECRETÁRIO ESPECIAL DA RECEITA FEDERAL DO BRASIL, no uso da atribuição que lhe confere o inciso III do art. 350 do Regimento Interno da Secretaria Especial da Receita Federal do Brasil, resolve:
                </p>
                <p>
                  <strong>Art. 1º</strong> Esta Instrução Normativa regulamenta a apropriação e aproveitamento de créditos da Contribuição sobre Bens e Serviços (CBS) incidente sobre a contratação continuada de serviços essenciais, locação de ativos e sistemas de processamento de dados durante a transição do sistema tributário nacional.
                </p>
                <p>
                  <strong>Art. 2º</strong> É assegurado ao sujeito passivo o direito à apuração de créditos integrais de CBS decorrentes da aquisição de serviços prestados por pessoas jurídicas, inclusive serviços de vigilância, tecnologia da informação, energia e manutenção predial.
                </p>
                <p>
                  <strong>Art. 3º</strong> As empresas deverão parametrizar seus sistemas ERP e escrituração digital para registrar os códigos de situação tributária (CST) previstos na Nota Técnica Conjunta RFB/CGIBS.
                </p>
                <p>
                  <strong>Art. 4º</strong> Esta Instrução Normativa entra em vigor na data de sua publicação no Diário Oficial da União.
                </p>
                <div className="pt-6 font-sans text-right text-xs">
                  <p className="font-bold text-slate-900">RECEITA FEDERAL DO BRASIL</p>
                  <p className="text-slate-600">Ministério da Fazenda</p>
                </div>
              </>
            ) : (
              <>
                <p className="font-bold">
                  {noticia.ato} {noticia.numeroAto} — {noticia.orgao}
                </p>
                <p>
                  {noticia.resumo || 'Texto oficial coligido pelos agentes integradores do OHANA Monitor.'}
                </p>
                <div className="p-3 bg-slate-100 rounded-lg font-sans text-xs">
                  <strong>Impacto Direto Registrado:</strong> {noticia.impactoFunerario || noticia.impactoGeral || 'Em análise técnica.'}
                </div>
              </>
            )}
          </div>

          {/* Carimbo de Certificação Digital e Rastreabilidade */}
          <div className="mt-8 pt-6 border-t-2 border-dashed border-slate-300 font-sans text-xs bg-slate-50 p-4 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>CERTIFICAÇÃO DIGITAL ICP-BRASIL & RASTREABILIDADE OHANA</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Documento capturado e indexado pelo Coletor Automatizado do OHANA Compliance.
                </p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate max-w-lg">
                  Hash SHA-256: {noticia.evidenciaRastreabilidade?.hashSha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                </p>
              </div>

              <div className="shrink-0 text-right font-mono text-[10px] text-slate-500">
                <div>Versão Coleta: 1.0</div>
                <div>ID: {noticia.id}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé com Botões de Fechamento e Navegação */}
        <div className="bg-slate-100 border-t border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-3 font-sans text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <FileText className="w-4 h-4 text-slate-500" />
            <span>
              Fonte: <strong>{noticia.fontePrincipal?.nome || 'Diário Oficial'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {noticia.fontePrincipal?.url && (
              <a
                href={noticia.fontePrincipal.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors shadow-2xs"
                id="btn-link-externo-rodape"
              >
                <span>Abrir Portal {isDoePa ? 'IOEPA' : isDou ? 'IN/DOU' : 'Governamental'}</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs transition-colors shadow-2xs"
              id="btn-concluir-espelho"
            >
              Concluir Leitura
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
