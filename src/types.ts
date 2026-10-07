export type StatusJuridico =
  | 'VIGENTE'
  | 'VIGENCIA_FUTURA'
  | 'EM_TRAMITACAO'
  | 'EM_DISCUSSAO'
  | 'NOTA_TECNICA'
  | 'ORIENTACAO_OPERACIONAL'
  | 'BASE_LEGAL';

export type StatusAtualidade =
  | 'NOVO_HOJE'
  | 'ULTIMOS_7_DIAS'
  | 'ATUALIZADO_HOJE'
  | 'ANTERIOR';

export type NivelUrgencia = 'CRITICO' | 'ALTO' | 'MEDIO' | 'PLANEJAMENTO';

export type NivelRisco = 'BAIXO' | 'MEDIO' | 'ALTO' | 'CRITICO';

export type StatusAcao =
  | 'ABERTA'
  | 'EM_ANDAMENTO'
  | 'EM_HOMOLOGACAO'
  | 'CONCLUIDA'
  | 'IMPEDIDA';

export type AplicabilidadeEmpresaStatus =
  | 'CONFIRMADA'
  | 'POSSIVEL_IMPACTO'
  | 'AGUARDANDO_VALIDACAO'
  | 'A_CLASSIFICAR'
  | 'NAO_APLICAVEL';

export interface AplicabilidadeEmpresa {
  empresaId: string; // 'recanto-da-saudade' | 'instituto-go' | string
  empresaNome: string;
  segmento: string;
  status: AplicabilidadeEmpresaStatus;
  motivo: string;
  impactoEspecifico: string;
  acaoSugerida: string;
  responsavel?: string;
  prazo?: string;
  validadoPor?: string;
  dataAnalise?: string;
}

export interface SocioQSA {
  nome: string;
  qualificacao: string;
  paisOrigem?: string;
  faixaEtaria?: string;
}

export interface CnaeItem {
  codigo: string;
  descricao: string;
}

export interface EnderecoEmpresa {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cep: string;
  municipio: string;
  uf: string;
}

export interface EmpresaPerfil {
  id: string;
  nome: string;
  razaoSocial: string;
  segmento: string;
  cnpj: string;
  cnaes: string[];
  regimeTributario: 'SIMPLES_NACIONAL' | 'LUCRO_PRESUMIDO' | 'LUCRO_REAL' | 'MEI';
  localidades: { uf: string; municipios: string[] };
  palavrasChaveMonitoradas: string[];
  sistemasUtilizados: string[];
  atividadesPrincipais: string[];
  totalAcoesPendentes?: number;
  totalNormasAplicaveis?: number;
  descricaoAtividade?: string;
  // Campos detalhados provenientes de consulta ao CNPJ (Receita Federal / BrasilAPI)
  situacaoCadastral?: string;
  dataSituacaoCadastral?: string;
  motivoSituacaoCadastral?: string;
  dataAbertura?: string;
  naturezaJuridica?: string;
  porte?: string;
  capitalSocial?: number;
  faturamentoAnualEstimado?: number;
  faturamentoMensalEstimado?: number;
  faixaFaturamento?: string;
  opcaoSimples?: boolean;
  dataOpcaoSimples?: string;
  opcaoMei?: boolean;
  endereco?: EnderecoEmpresa;
  contato?: {
    telefone?: string;
    email?: string;
  };
  qsa?: SocioQSA[];
  cnaePrincipalDetalhado?: CnaeItem;
  cnaesSecundariosDetalhados?: CnaeItem[];
}

// Modelos para a segmentação Fiscal, Contábil e Finanças
export interface ApuracaoTributoItem {
  tributo: 'IRPJ' | 'CSLL' | 'PIS' | 'COFINS' | 'ISS' | 'ICMS' | 'IBS' | 'CBS' | 'INSS_PATRONAL';
  esfera: 'FEDERAL' | 'ESTADUAL' | 'MUNICIPAL';
  baseCalculo: number;
  aliquota: number;
  valorApurado: number;
  creditosAproveitados: number;
  valorAPagar: number;
  vencimento: string;
  status: 'EM_ABERTO' | 'PAGO' | 'SIMULADO_REFORMA';
  codigoReceita?: string;
  observacao?: string;
}

export interface ContaBalancete {
  codigo: string;
  descricao: string;
  tipo: 'ATIVO' | 'PASSIVO' | 'PATRIMONIO_LIQUIDO' | 'RECEITA' | 'DESPESA' | 'CUSTO';
  natureza: 'DEVEDORA' | 'CREDORA';
  saldoAnterior: number;
  debitos: number;
  creditos: number;
  saldoAtual: number;
  grau: number;
}

export interface ItemDRE {
  descricao: string;
  valor: number;
  percentualReceita: number;
  tipo: 'RECEITA_BRUTA' | 'DEDUCOES' | 'RECEITA_LIQUIDA' | 'CUSTOS' | 'LUCRO_BRUTO' | 'DESPESAS' | 'EBITDA' | 'RESULTADO_FINANCEIRO' | 'IR_CSLL' | 'LUCRO_LIQUIDO';
  destaque?: boolean;
}

export interface LancamentoFluxoCaixa {
  id: string;
  data: string;
  descricao: string;
  categoria: string;
  tipo: 'ENTRADA' | 'SAIDA';
  valor: number;
  status: 'REALIZADO' | 'PREVISTO';
  origem: 'RECEITA_SERVICOS' | 'PLANOS_REINCORRENTES' | 'FOLHA_PAGAMENTO' | 'FORNECEDORES' | 'TRIBUTOS' | 'FINANCIAMENTOS' | 'OUTROS';
}

export interface TituloFinanceiro {
  id: string;
  tipo: 'PAGAR' | 'RECEBER';
  descricao: string;
  entidade: string; // fornecedor ou cliente
  documento: string; // NF-e, NFS-e, Boleto
  valorOriginal: number;
  valorAtualizado: number;
  vencimento: string;
  status: 'EM_DIA' | 'VENCE_HOJE' | 'EM_ATRASO' | 'LIQUIDADO';
  categoria: string;
  diasAtraso?: number;
}

export interface IndicadorEconomico {
  nome: string;
  sigla: string;
  valor: number;
  unidade: string;
  periodicidade: string;
  dataAtualizacao: string;
  impactoNegocio: string;
}

export type AreaResponsavel =
  | 'FISCAL'
  | 'CONTABIL'
  | 'FINANCEIRO'
  | 'TI_PROTHEUS'
  | 'GESTAO_FUNERARIA'
  | 'JURIDICO'
  | 'DIRETORIA';

export type OrgaoOficial =
  | 'DOU'
  | 'RECEITA_FEDERAL'
  | 'MINISTERIO_FAZENDA'
  | 'COMITE_GESTOR_IBS'
  | 'PORTAL_NACIONAL_NFSE'
  | 'PLANALTO'
  | 'CONFAZ'
  | 'SEFAZ'
  | 'PREFEITURAS'
  | 'CAMARA_DEPUTADOS'
  | 'SENADO_FEDERAL';

export type TramitacaoEtapa =
  | 'EM_DISCUSSAO'
  | 'APROVADO_CAMARA'
  | 'AGUARDANDO_SENADO'
  | 'AGUARDANDO_SANCAO'
  | 'PUBLICADO'
  | 'VIGENTE';

export interface FonteOficial {
  tipo: 'ATO_OFICIAL' | 'PAGINA_EXPLICATIVA' | 'FONTE_TECNICA' | 'DIARIO_OFICIAL' | 'PORTAL_INSTITUCIONAL';
  nome: string;
  url: string;
  orgao?: string;
  descricao?: string;
  verificada?: boolean;
  statusLink?: 'DISPONIVEL' | 'INDISPONIVEL' | 'PENDENTE' | 'ERRO_404';
  ultimaVerificacao?: string;
}

export interface LinkAccessLog {
  id: string;
  url: string;
  tituloContexto?: string;
  orgao?: string;
  noticiaId?: string;
  timestamp: string;
  status: 'SUCESSO' | 'ERRO' | 'REDIRECIONAMENTO' | 'TIMEOUT';
  httpStatus: number;
  mensagemErro?: string;
  origemModulo: string;
  tempoRespostaMs: number;
  usuario?: string;
  reportadoPorUsuario?: boolean;
  resolvido: boolean;
  resolvidoEm?: string;
  resolvidoPor?: string;
  sugestaoIa?: string;
  urlCorrigida?: string;
}

export interface ValidacaoLinkResult {
  url: string;
  disponivel: boolean;
  statusHttp: number;
  latenciaMs: number;
  mensagem: string;
  verificadoEm: string;
  orgao?: string;
  titulo?: string;
  erroDetectado?: boolean;
}

export interface SugestaoCorrecaoLinkIa {
  urlOriginal: string;
  urlSugerida: string;
  urlCorrigidaSugerida?: string;
  nomePortalOficial: string;
  termoBuscaOficial: string;
  tituloBuscado?: string;
  dataPublicacaoBuscada?: string;
  motivoQuebra: string;
  justificativa?: string;
  urlPortalBusca?: string;
  passosRecuperacao: string[];
  confianca: 'ALTA' | 'MEDIA' | 'BAIXA';
  acaoRecomendada: string;
  modo?: string;
}

export interface AuditoriaLog {
  id?: string;
  data?: string;
  dataHora?: string;
  usuario?: string;
  autor?: string;
  perfil?: string;
  acaoRealizada?: string;
  acao?: string;
  detalhes?: string;
}

export interface AnexoEvidencia {
  id: string;
  nome: string;
  url?: string;
  tamanho?: string;
  dataEnvio: string;
  tipo: string;
  hashSha256?: string;
}

export interface FiscalAcao {
  id: string;
  noticiaId?: string;
  tituloNoticia?: string;
  empresaId?: string; // 'recanto-da-saudade' | 'instituto-go' | 'GERAL'
  empresaNome?: string;
  acao?: string;
  titulo?: string;
  tipo?: string;
  prioridade?: string;
  descricao?: string;
  prazoLegal?: string; // ISO YYYY-MM-DD
  prazoInterno?: string; // ISO YYYY-MM-DD
  prazoLimite?: string;
  dataHomologacao?: string; // ISO YYYY-MM-DD
  dataVigencia?: string;
  responsavel: string;
  area?: AreaResponsavel;
  status: StatusAcao;
  evidencia?: string;
  risco?: NivelRisco;
  consequencia?: string;
  dataConclusao?: string;
  diasRestantes?: number;
  detalhesTecnicos?: string;
  rotinasProtheus?: string[];
  tabelasAfetadas?: string[];
  anexosEvidencias?: AnexoEvidencia[];
  historicoAuditoria?: AuditoriaLog[];
}

export interface FiscalNoticia {
  id: string;
  titulo: string;
  resumo?: string;
  tema?: string;
  orgao?: OrgaoOficial;
  orgaoEmissor?: string;
  ato?: string; // ex: Lei Complementar, Portaria, Resolução, Nota Técnica
  numeroAto?: string; // ex: 214/2025, 432/2026
  numeroNorma?: string;
  tipoNorma?: string;
  esfera?: string;
  dataPublicacao: string; // YYYY-MM-DD
  dataAtualizacao: string; // YYYY-MM-DD
  dataRadar: string; // YYYY-MM-DD
  dataVigencia?: string; // YYYY-MM-DD
  dataLimite?: string;
  statusJuridico: StatusJuridico;
  statusAtualidade: StatusAtualidade;
  nivelUrgencia: NivelUrgencia;
  nivelRisco: NivelRisco;
  scoreRelevancia?: number; // 0-100 calculado pelo Motor de Relevância
  nivelConteudo?: 'GERAL' | 'SEGMENTO' | 'EMPRESA';
  palavrasChave?: string[];

  // Aplicabilidade por Empresa (O assunto é único, as conclusões e impactos variam por empresa)
  aplicabilidadesEmpresas?: AplicabilidadeEmpresa[];
  
  // Fontes (Até 3)
  fontePrincipal: FonteOficial;
  fonteSecundaria?: FonteOficial;
  fonteTecnica?: FonteOficial;

  // Análises de Impacto
  impactoGeral: string;
  impactoFunerario: string;
  subsegmentosFunerariosAfetados: string[]; // Funerárias, Cemitérios, Planos, Cremação, Jazigos, etc.
  
  impactoProtheus: string;
  protheusModulosAfetados: string[]; // TES, Configurador de Tributos, TSS, NFS-e, SPED, etc.
  protheusParametrizacaoNecessaria: boolean;
  protheusStatusHomologacao?: 'PENDENTE' | 'EM_TESTE' | 'HOMOLOGADO' | 'NAO_APLICAVEL';

  // Tramitação
  tramitacaoEtapa?: TramitacaoEtapa;
  tramitacaoNumero?: string;
  origemLegislativa?: string;

  // Ações
  acoesVinculadas: FiscalAcao[];

  // Auditoria
  historicoAuditoria: AuditoriaLog[];

  // OHANA Monitor Corporativo Integrations
  diretoriasResponsaveis?: DiretoriaCodigo[];
  diretoriaPrincipal?: DiretoriaCodigo;
  urlFonteOriginal?: string;
  fonteId?: string;
  protheusModulos?: string[];
  protheusNecessario?: boolean;
  oQueMudou?: string;
  porQueImporta?: string;
  impactoEmpresas?: string;
  oQuePrecisaSerFeito?: string;
  oportunidade?: string;
  risco?: string;
  evidenciaRastreabilidade?: EvidenciaRastreabilidade;
  triadeAgentes?: TriadeAgentes;
  decisaoRubinhoExigida?: boolean;
  decisaoRubinho?: DecisaoRubinho;
  deteccaoMudanca?: DeteccaoMudanca;
}

// --- OHANA MONITOR CORPORATIVO MODELOS ---

export type DiretoriaCodigo =
  | 'CEO'
  | 'CFO'
  | 'COO'
  | 'CRO'
  | 'CMO'
  | 'CHRO'
  | 'CLO'
  | 'CCO'
  | 'CDO'
  | 'CTO'
  | 'CISO'
  | 'NAYA';

export interface DiretoriaConfig {
  codigo: DiretoriaCodigo;
  nome: string;
  cargo: string;
  descricao: string;
  cor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  fontesPrioritarias: string[];
  focoMonitoramento: string[];
  focoPrincipal?: string;
}

export interface DecisaoRubinho {
  status: 'PENDENTE' | 'APROVADO' | 'REJEITADO' | 'DELEGADO' | 'PARECER_SOLICITADO';
  dataDecisao?: string;
  justificativa?: string;
  delegadoPara?: DiretoriaCodigo;
  autor: string;
}

export interface TriadeAgentes {
  executor: {
    nome: string;
    parecer: string;
    timestamp: string;
  };
  revisor: {
    nome: string;
    parecer: string;
    timestamp: string;
  };
  critico: {
    nome: string;
    contraPontos?: string;
    parecer?: string;
    timestamp: string;
  };
}

export interface EvidenciaRastreabilidade {
  id: string;
  hashSha256: string;
  fonteUrl: string;
  orgao: string;
  dataOriginal: string;
  dataColeta: string;
  metodoColeta: 'API Oficial' | 'RSS Primário' | 'Dados Abertos' | 'Portal Governamental' | 'Sistema Interno' | 'Documentação Técnica';
  versaoConteudo: number;
  snippetOriginal: string;
  agenteExecutor?: string;
  iaUtilizada?: string;
}

export interface DeteccaoMudanca {
  houveMudanca: boolean;
  versaoAnterior?: string;
  versaoAtual?: string;
  campoAlterado?: string;
  impactoMudanca?: string;
  dataDeteccao?: string;
}

export interface FonteDataHub {
  id: string;
  nome: string;
  sigla: string;
  tipo: 'API Oficial' | 'Base Pública' | 'Portal Oficial' | 'Sistema Interno' | 'Tribunal / Judiciário' | 'Regulador Técnico';
  status: 'OPERACIONAL' | 'INSTAVEL' | 'INDISPONIVEL';
  diretorias: DiretoriaCodigo[];
  diretoriaPrincipal?: DiretoriaCodigo;
  orgaoResponsavel: string;
  orgao?: string;
  url: string;
  frequencia: string;
  ultimaColeta: string;
  proximaColeta: string;
  registrosHoje: number;
  registrosColetadosHoje?: number;
  taxaErros: number;
  latenciaMs: number;
  descricao: string;
}

export interface EventoTimeline {
  id: string;
  hora?: string;
  horario?: string;
  data: string;
  fonteNome?: string;
  fonte?: string;
  titulo: string;
  diretoria: DiretoriaCodigo;
  empresaNome?: string;
  empresa?: string;
  criticidade?: 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAIXO';
  nivelUrgencia?: string;
  resumo?: string;
  noticiaId?: string;
  icone?: string;
}

export interface MetricasPresidente {
  empresasMonitoradas: number;
  fontesAtivas: number;
  coletasHoje: number;
  novidadesHoje: number;
  relevantes: number;
  criticas: number;
  aguardandoDecisao: number;
  funil: {
    coletaBruta: number;
    filtrados: number;
    unicos: number;
    relacionadosEmpresas: number;
    importantes: number;
    exigemAtencao: number;
    exigemDecisao: number;
  };
}

export interface FiscalServico {
  codigo: string; // ex: 25.01
  descricao: string;
  tipoServico: string;
  codigoIss: string;
  documento: string; // ex: NFS-e Nacional / Municipal
  regraAtual: string; // ISS 2% a 5%
  regraFutura: string; // IBS / CBS - Transição 2026/2027
  protheusRegra: string; // TES sugerida, Código de Serviço, Natureza Financeira
  statusValidacao: 'VALIDADO' | 'EM_REVISAO' | 'AGUARDANDO_REGULAMENTACAO';
}

export interface IndicadoresRadar {
  novidadesHoje: number;
  atualizadosHoje: number;
  acoesCriticas: number; // <= 7 dias
  vencimentos7Dias: number;
  vencimentos30Dias: number;
  vencimentos90Dias: number;
  acoesVencidas: number;
  acoesAbertas: number;
  alertasFunerarios: number;
  alertasProtheus: number;
  totalNormasMonitoradas: number;
  emTramitacao?: number;
}
