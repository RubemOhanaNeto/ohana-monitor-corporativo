import { FC, useState } from 'react';
import {
  X,
  PlusCircle,
  Sparkles,
  ShieldCheck,
  Building2,
  Cpu,
  Clock,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import {
  FiscalNoticia,
  OrgaoOficial,
  StatusJuridico,
  StatusAtualidade,
  NivelUrgencia,
  NivelRisco,
  AreaResponsavel,
} from '../types';

interface ModalNovaMateriaProps {
  onClose: () => void;
  onSave: (noticia: Partial<FiscalNoticia>) => void;
}

export const ModalNovaMateria: FC<ModalNovaMateriaProps> = ({ onClose, onSave }) => {
  // Form States
  const [titulo, setTitulo] = useState('');
  const [resumo, setResumo] = useState('');
  const [tema, setTema] = useState('Reforma Tributária (IBS/CBS)');
  const [orgao, setOrgao] = useState<OrgaoOficial>('DOU');
  const [ato, setAto] = useState('Portaria');
  const [numeroAto, setNumeroAto] = useState('');
  const [dataPublicacao, setDataPublicacao] = useState('2026-09-17');
  const [dataVigencia, setDataVigencia] = useState('2026-10-01');
  const [statusJuridico, setStatusJuridico] = useState<StatusJuridico>('VIGENCIA_FUTURA');
  const [statusAtualidade, setStatusAtualidade] = useState<StatusAtualidade>('NOVO_HOJE');
  const [nivelUrgencia, setNivelUrgencia] = useState<NivelUrgencia>('ALTO');
  const [nivelRisco, setNivelRisco] = useState<NivelRisco>('MEDIO');

  // Official Source
  const [fonteNome, setFonteNome] = useState('');
  const [fonteUrl, setFonteUrl] = useState('');

  // Impacts
  const [impactoGeral, setImpactoGeral] = useState('');
  const [impactoFunerario, setImpactoFunerario] = useState('O impacto decorre da regra geral aplicável à operação.');
  const [subsegmentos, setSubsegmentos] = useState<string[]>(['Funerárias', 'Cemitérios']);
  const [impactoProtheus, setImpactoProtheus] = useState('Sem impacto técnico identificado no Protheus até o momento.');
  const [protheusParametrizacao, setProtheusParametrizacao] = useState(false);
  const [protheusModulos, setProtheusModulos] = useState<string[]>(['TES', 'Configurador de Tributos']);

  // Initial Action
  const [acaoInicial, setAcaoInicial] = useState('');
  const [responsavelAcao, setResponsavelAcao] = useState('Mariana Silva');
  const [areaAcao, setAreaAcao] = useState<AreaResponsavel>('FISCAL');
  const [prazoInterno, setPrazoInterno] = useState('2026-09-28');
  const [homologacao, setHomologacao] = useState('2026-09-25');
  const [consequencia, setConsequencia] = useState('Risco de autuação por atraso de adequação.');

  // AI Assistant for quick fill
  const [textoColado, setTextoColado] = useState('');
  const [isAnalyzingIA, setIsAnalyzingIA] = useState(false);

  const subsegmentosDisponiveis = [
    'Funerárias',
    'Cemitérios',
    'Planos funerários',
    'Sepultamento',
    'Cremação',
    'Translado',
    'Jazigos',
    'Manutenção de cemitérios',
    'Cessão de espaços',
    'Receitas recorrentes',
    'Contratos',
  ];

  const modulosProtheusDisponiveis = [
    'TES (Tipos de Entrada e Saída)',
    'Configurador de Tributos',
    'TSS (TOTVS Sped Services)',
    'NFS-e (FISA022)',
    'Cadastro de Serviços (SB1)',
    'Natureza Financeira (SED)',
    'Contratos (GCT)',
    'EFD-Reinf',
    'SPED Fiscal',
  ];

  const handleAnaliseIA = async () => {
    if (!textoColado.trim()) return;
    setIsAnalyzingIA(true);
    try {
      const res = await fetch('/api/ia/analisar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo,
          ato: `${ato} ${numeroAto}`,
          orgao,
          texto: textoColado,
        }),
      });
      const data = await res.json();
      if (data) {
        if (data.resumo) setResumo(data.resumo);
        if (data.impactoGeral) setImpactoGeral(data.impactoGeral);
        if (data.impactoFunerario) setImpactoFunerario(data.impactoFunerario);
        if (data.subsegmentos && Array.isArray(data.subsegmentos)) {
          setSubsegmentos(data.subsegmentos.filter((s: string) => subsegmentosDisponiveis.includes(s)));
        }
        if (data.impactoProtheus) setImpactoProtheus(data.impactoProtheus);
        if (data.protheusNecessario !== undefined) setProtheusParametrizacao(data.protheusNecessario);
        if (data.statusJuridicoSugerido) setStatusJuridico(data.statusJuridicoSugerido);
        if (data.nivelUrgenciaSugerido) setNivelUrgencia(data.nivelUrgenciaSugerido);
        if (data.nivelRiscoSugerido) setNivelRisco(data.nivelRiscoSugerido);
        if (data.acaoSugerida) setAcaoInicial(data.acaoSugerida);
        if (data.prazoInternoSugerido) setPrazoInterno(data.prazoInternoSugerido);
        if (data.homologacaoSugerida) setHomologacao(data.homologacaoSugerida);
        if (data.areaSugerida) setAreaAcao(data.areaSugerida);
      }
    } catch {
      // Ignored
    } finally {
      setIsAnalyzingIA(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const acaoId = `ac-${Date.now()}`;
    const novaMateria: Partial<FiscalNoticia> = {
      titulo,
      resumo,
      tema,
      orgao,
      ato,
      numeroAto,
      dataPublicacao,
      dataAtualizacao: '2026-09-17',
      dataRadar: '2026-09-17',
      dataVigencia,
      statusJuridico,
      statusAtualidade,
      nivelUrgencia,
      nivelRisco,
      fontePrincipal: {
        tipo: 'ATO_OFICIAL',
        nome: fonteNome || `Publicação Oficial ${ato} ${numeroAto}`,
        url: fonteUrl || 'https://www.in.gov.br',
        orgao,
        verificada: true,
      },
      impactoGeral: impactoGeral || 'Adequação de procedimentos tributários internos.',
      impactoFunerario: impactoFunerario || 'O impacto decorre da regra geral aplicável à operação.',
      subsegmentosFunerariosAfetados: subsegmentos,
      impactoProtheus: impactoProtheus || 'Sem impacto técnico identificado no Protheus até o momento.',
      protheusParametrizacaoNecessaria: protheusParametrizacao,
      protheusModulosAfetados: protheusParametrizacao ? protheusModulos : [],
      protheusStatusHomologacao: protheusParametrizacao ? 'PENDENTE' : 'NAO_APLICAVEL',
      acoesVinculadas: acaoInicial
        ? [
            {
              id: acaoId,
              noticiaId: '',
              acao: acaoInicial,
              prazoLegal: dataVigencia,
              prazoInterno,
              dataHomologacao: homologacao,
              dataVigencia,
              responsavel: responsavelAcao,
              area: areaAcao,
              status: 'ABERTA',
              risco: nivelRisco,
              consequencia,
              diasRestantes: 14,
            },
          ]
        : [],
    };

    onSave(novaMateria);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:hidden" id="modal-nova-materia">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold text-white">Cadastrar Nova Matéria Fiscal</h2>
              <p className="text-xs text-slate-400">Validação oficial, classificação jurídica e impactos</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-700">
          {/* AI Fast Analysis Box */}
          <div className="p-4 rounded-xl bg-purple-50/80 border border-purple-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-purple-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Assistente de Entrada Rápida com IA
              </span>
              <span className="text-[11px] text-purple-700">Cole a ementa ou texto do ato oficial</span>
            </div>
            <textarea
              rows={2}
              value={textoColado}
              onChange={(e) => setTextoColado(e.target.value)}
              placeholder="Cole aqui o trecho do Diário Oficial, Portaria ou Resolução..."
              className="w-full text-xs p-2.5 bg-white border border-purple-200 rounded-md focus:ring-1 focus:ring-purple-500"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAnaliseIA}
                disabled={isAnalyzingIA || !textoColado.trim()}
                className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-semibold rounded text-xs flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAnalyzingIA ? 'Interpretando Norma...' : 'Preencher Campos com IA'}</span>
              </button>
            </div>
          </div>

          {/* Identification Fields */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 border-b pb-1 text-xs uppercase tracking-wider">
              1. Identificação do Ato Oficial
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Título da Matéria</label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Instrução Normativa RFB nº 2215/2026 regulamenta padrão nacional da NFS-e"
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tema Principal</label>
                <input
                  type="text"
                  required
                  value={tema}
                  onChange={(e) => setTema(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Órgão Emissor</label>
                <select
                  value={orgao}
                  onChange={(e) => setOrgao(e.target.value as OrgaoOficial)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded"
                >
                  <option value="DOU">Diário Oficial da União</option>
                  <option value="RECEITA_FEDERAL">Receita Federal</option>
                  <option value="MINISTERIO_FAZENDA">Ministério da Fazenda</option>
                  <option value="COMITE_GESTOR_IBS">Comitê Gestor do IBS</option>
                  <option value="PORTAL_NACIONAL_NFSE">Portal Nacional da NFS-e</option>
                  <option value="PLANALTO">Planalto</option>
                  <option value="CONFAZ">CONFAZ</option>
                  <option value="SEFAZ">SEFAZ</option>
                  <option value="PREFEITURAS">Prefeituras</option>
                  <option value="CAMARA_DEPUTADOS">Câmara dos Deputados</option>
                  <option value="SENADO_FEDERAL">Senado Federal</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tipo de Ato</label>
                <input
                  type="text"
                  required
                  value={ato}
                  onChange={(e) => setAto(e.target.value)}
                  placeholder="Ex: Resolução, IN, Portaria"
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Número do Ato</label>
                <input
                  type="text"
                  required
                  value={numeroAto}
                  onChange={(e) => setNumeroAto(e.target.value)}
                  placeholder="Ex: 08/2026, 2215/2026"
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Status Jurídico</label>
                <select
                  value={statusJuridico}
                  onChange={(e) => setStatusJuridico(e.target.value as StatusJuridico)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded"
                >
                  <option value="VIGENTE">Vigente</option>
                  <option value="VIGENCIA_FUTURA">Vigência Futura</option>
                  <option value="EM_TRAMITACAO">Em Tramitação</option>
                  <option value="EM_DISCUSSAO">Em Discussão</option>
                  <option value="NOTA_TECNICA">Nota Técnica</option>
                  <option value="ORIENTACAO_OPERACIONAL">Orientação Operacional</option>
                  <option value="BASE_LEGAL">Base Legal</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Data Publicação</label>
                <input
                  type="date"
                  required
                  value={dataPublicacao}
                  onChange={(e) => setDataPublicacao(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Data Vigência</label>
                <input
                  type="date"
                  required
                  value={dataVigencia}
                  onChange={(e) => setDataVigencia(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Urgência</label>
                <select
                  value={nivelUrgencia}
                  onChange={(e) => setNivelUrgencia(e.target.value as NivelUrgencia)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded"
                >
                  <option value="CRITICO">Crítico (&lt;= 7 dias)</option>
                  <option value="ALTO">Alto (8 a 30 dias)</option>
                  <option value="MEDIO">Médio (31 a 90 dias)</option>
                  <option value="PLANEJAMENTO">Planejamento (&gt; 90 dias)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Risco</label>
                <select
                  value={nivelRisco}
                  onChange={(e) => setNivelRisco(e.target.value as NivelRisco)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded"
                >
                  <option value="BAIXO">Baixo</option>
                  <option value="MEDIO">Médio</option>
                  <option value="ALTO">Alto</option>
                  <option value="CRITICO">Crítico</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Resumo Prático</label>
              <textarea
                rows={2}
                required
                value={resumo}
                onChange={(e) => setResumo(e.target.value)}
                placeholder="Explique resumidamente o que a norma altera na prática..."
                className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded"
              />
            </div>
          </div>

          {/* Official Source */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 border-b pb-1 text-xs uppercase tracking-wider">
              2. Fonte Oficial Comprobatória (Obrigatória)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nome do Documento Oficial</label>
                <input
                  type="text"
                  required
                  value={fonteNome}
                  onChange={(e) => setFonteNome(e.target.value)}
                  placeholder="Ex: Diário Oficial da União - Seção 1 - Edição 180"
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">URL da Fonte Oficial</label>
                <input
                  type="url"
                  required
                  value={fonteUrl}
                  onChange={(e) => setFonteUrl(e.target.value)}
                  placeholder="https://www.in.gov.br/dou/..."
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Segment Impact (Funerário) */}
          <div className="space-y-3">
            <h3 className="font-bold text-indigo-900 border-b pb-1 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-indigo-700" />
              3. Impacto no Segmento Funerário & Cemiterial
            </h3>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Análise de Impacto no Segmento</label>
              <textarea
                rows={2}
                value={impactoFunerario}
                onChange={(e) => setImpactoFunerario(e.target.value)}
                className="w-full text-xs p-2 bg-indigo-50/30 border border-indigo-200 rounded"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">Subsegmentos Afetados</label>
              <div className="flex flex-wrap gap-1.5">
                {subsegmentosDisponiveis.map((sub) => {
                  const isSelected = subsegmentos.includes(sub);
                  return (
                    <button
                      type="button"
                      key={sub}
                      onClick={() => {
                        if (isSelected) {
                          setSubsegmentos(subsegmentos.filter((s) => s !== sub));
                        } else {
                          setSubsegmentos([...subsegmentos, sub]);
                        }
                      }}
                      className={`text-[11px] px-2.5 py-1 rounded border transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-700 font-semibold'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      {sub}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Protheus Impact */}
          <div className="space-y-3">
            <h3 className="font-bold text-emerald-900 border-b pb-1 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-emerald-700" />
              4. Possível Impacto no TOTVS Protheus
            </h3>

            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id="check-protheus"
                checked={protheusParametrizacao}
                onChange={(e) => setProtheusParametrizacao(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="check-protheus" className="text-xs font-semibold text-slate-900">
                Esta norma exige parametrização ou ajuste técnico no Protheus / TSS
              </label>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Parecer Técnico Protheus</label>
              <textarea
                rows={2}
                value={impactoProtheus}
                onChange={(e) => setImpactoProtheus(e.target.value)}
                className="w-full text-xs p-2 bg-emerald-50/30 border border-emerald-200 rounded"
              />
            </div>
          </div>

          {/* Action to be generated */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 border-b pb-1 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-700" />
              5. Ação e Prazo Imediato
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Ação a ser executada</label>
                <input
                  type="text"
                  value={acaoInicial}
                  onChange={(e) => setAcaoInicial(e.target.value)}
                  placeholder="Ex: Homologar nova TES para emissão de notas fiscais de jazigo"
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Área Responsável</label>
                <select
                  value={areaAcao}
                  onChange={(e) => setAreaAcao(e.target.value as AreaResponsavel)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded"
                >
                  <option value="FISCAL">Fiscal</option>
                  <option value="TI_PROTHEUS">TI / Protheus</option>
                  <option value="CONTABIL">Contábil</option>
                  <option value="FINANCEIRO">Financeiro</option>
                  <option value="GESTAO_FUNERARIA">Gestão Funerária</option>
                  <option value="JURIDICO">Jurídico</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Responsável</label>
                <input
                  type="text"
                  value={responsavelAcao}
                  onChange={(e) => setResponsavelAcao(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Prazo Interno (Meta)</label>
                <input
                  type="date"
                  value={prazoInterno}
                  onChange={(e) => setPrazoInterno(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Homologação Técnica</label>
                <input
                  type="date"
                  value={homologacao}
                  onChange={(e) => setHomologacao(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-colors"
            >
              Salvar Matéria no Radar Fiscal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
