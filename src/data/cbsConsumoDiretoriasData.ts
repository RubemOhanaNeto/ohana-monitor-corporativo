// src/data/cbsConsumoDiretoriasData.ts
// Dados históricos de consumo de chamadas das APIs tributárias (Piloto CBS/IBS e InfoSimples)
// Segregação por Diretoria Executiva e Trilha de Auditoria

export interface ConsumoDiretoriaDiario {
  data: string;
  diaSemana: string;
  tributariaFiscal: number;
  controladoriaFinancas: number;
  juridico: number;
  tiProtheus: number;
  operacoes: number;
  totalDia: number;
  limiteQuota: number;
  custoDiaReais: number;
}

export interface DiretoriaMetrica {
  id: string;
  nome: string;
  sigla: string;
  cor: string;
  corHex: string;
  totalChamadasMes: number;
  percentual: number;
  picoMaximoDia: number;
  dataPico: string;
  custoTotalReais: number;
  responsavel: string;
}

export interface ApiAuditLogItem {
  id: string;
  protocolo: string;
  apiNome: 'Piloto CBS/IBS (Receita Federal)' | 'InfoSimples - CND Federal / PGFN' | 'InfoSimples - Cartão CNPJ' | 'InfoSimples - Simples Nacional' | 'SEFAZ-PA / Sintegra';
  endpoint: string;
  cnpjConsultado: string;
  empresaNome: string;
  diretoriaSolicitante: string;
  usuario: string;
  dataHora: string;
  statusHttp: number;
  latenciaMs: number;
  sucesso: boolean;
  resumoResultado: string;
  payloadEnvio: Record<string, unknown>;
  payloadResposta: Record<string, unknown>;
}

export const DIRETORIAS_METRICAS: DiretoriaMetrica[] = [
  {
    id: 'tributaria',
    nome: 'Diretoria Tributária & Fiscal',
    sigla: 'DIR-TRIB',
    cor: 'text-indigo-600',
    corHex: '#4f46e5',
    totalChamadasMes: 4820,
    percentual: 41.5,
    picoMaximoDia: 420,
    dataPico: '15/09/2026',
    custoTotalReais: 241.0,
    responsavel: 'Dra. Vanessa Mendes (Gerente Tributária)',
  },
  {
    id: 'ti-protheus',
    nome: 'Diretoria de TI & Integração Protheus ERP',
    sigla: 'DIR-TI',
    cor: 'text-purple-600',
    corHex: '#9333ea',
    totalChamadasMes: 2940,
    percentual: 25.3,
    picoMaximoDia: 310,
    dataPico: '10/09/2026',
    custoTotalReais: 147.0,
    responsavel: 'Carlos Eduardo (Coordenador TSS / SPED)',
  },
  {
    id: 'controladoria',
    nome: 'Controladoria & Planejamento Financeiro',
    sigla: 'DIR-FIN',
    cor: 'text-emerald-600',
    corHex: '#059669',
    totalChamadasMes: 1890,
    percentual: 16.3,
    picoMaximoDia: 180,
    dataPico: '05/09/2026',
    custoTotalReais: 94.5,
    responsavel: 'Marcos Vinicius (Controller)',
  },
  {
    id: 'juridico',
    nome: 'Diretoria Jurídica & Compliance',
    sigla: 'DIR-JUR',
    cor: 'text-amber-600',
    corHex: '#d97706',
    totalChamadasMes: 1120,
    percentual: 9.7,
    picoMaximoDia: 115,
    dataPico: '12/09/2026',
    custoTotalReais: 56.0,
    responsavel: 'Dra. Beatriz Albuquerque (Head Jurídico)',
  },
  {
    id: 'operacoes',
    nome: 'Diretoria de Operações & Atendimento',
    sigla: 'DIR-OPS',
    cor: 'text-slate-600',
    corHex: '#475569',
    totalChamadasMes: 830,
    percentual: 7.2,
    picoMaximoDia: 92,
    dataPico: '08/09/2026',
    custoTotalReais: 41.5,
    responsavel: 'Roberto Sampaio (Diretor Operacional)',
  },
];

export const HISTORICO_CONSUMO_DIARIO: ConsumoDiarioItem[] = [
  { data: '01/09', diaSemana: 'Seg', tributariaFiscal: 120, controladoriaFinancas: 45, juridico: 22, tiProtheus: 80, operacoes: 25, totalDia: 292, limiteQuota: 400, custoDiaReais: 14.6 },
  { data: '02/09', diaSemana: 'Ter', tributariaFiscal: 140, controladoriaFinancas: 50, juridico: 30, tiProtheus: 95, operacoes: 28, totalDia: 343, limiteQuota: 400, custoDiaReais: 17.15 },
  { data: '03/09', diaSemana: 'Qua', tributariaFiscal: 165, controladoriaFinancas: 55, juridico: 35, tiProtheus: 110, operacoes: 30, totalDia: 395, limiteQuota: 400, custoDiaReais: 19.75 },
  { data: '04/09', diaSemana: 'Qui', tributariaFiscal: 190, controladoriaFinancas: 70, juridico: 40, tiProtheus: 130, operacoes: 35, totalDia: 465, limiteQuota: 400, custoDiaReais: 23.25 },
  { data: '05/09', diaSemana: 'Sex', tributariaFiscal: 210, controladoriaFinancas: 180, juridico: 55, tiProtheus: 140, operacoes: 40, totalDia: 625, limiteQuota: 400, custoDiaReais: 31.25 }, // PICO Fechamento
  { data: '06/09', diaSemana: 'Sáb', tributariaFiscal: 40, controladoriaFinancas: 15, juridico: 5, tiProtheus: 30, operacoes: 12, totalDia: 102, limiteQuota: 400, custoDiaReais: 5.1 },
  { data: '07/09', diaSemana: 'Dom', tributariaFiscal: 15, controladoriaFinancas: 5, juridico: 2, tiProtheus: 10, operacoes: 8, totalDia: 40, limiteQuota: 400, custoDiaReais: 2.0 },
  { data: '08/09', diaSemana: 'Seg', tributariaFiscal: 150, controladoriaFinancas: 60, juridico: 32, tiProtheus: 90, operacoes: 92, totalDia: 424, limiteQuota: 400, custoDiaReais: 21.2 },
  { data: '09/09', diaSemana: 'Ter', tributariaFiscal: 175, controladoriaFinancas: 65, juridico: 38, tiProtheus: 115, operacoes: 32, totalDia: 425, limiteQuota: 400, custoDiaReais: 21.25 },
  { data: '10/09', diaSemana: 'Qua', tributariaFiscal: 240, controladoriaFinancas: 90, juridico: 50, tiProtheus: 310, operacoes: 45, totalDia: 735, limiteQuota: 400, custoDiaReais: 36.75 }, // PICO Sincronização TSS Protheus
  { data: '11/09', diaSemana: 'Qui', tributariaFiscal: 220, controladoriaFinancas: 85, juridico: 48, tiProtheus: 180, operacoes: 38, totalDia: 571, limiteQuota: 400, custoDiaReais: 28.55 },
  { data: '12/09', diaSemana: 'Sex', tributariaFiscal: 230, controladoriaFinancas: 78, juridico: 115, tiProtheus: 145, operacoes: 42, totalDia: 610, limiteQuota: 400, custoDiaReais: 30.5 },
  { data: '13/09', diaSemana: 'Sáb', tributariaFiscal: 50, controladoriaFinancas: 18, juridico: 8, tiProtheus: 25, operacoes: 15, totalDia: 116, limiteQuota: 400, custoDiaReais: 5.8 },
  { data: '14/09', diaSemana: 'Dom', tributariaFiscal: 20, controladoriaFinancas: 8, juridico: 4, tiProtheus: 12, operacoes: 10, totalDia: 54, limiteQuota: 400, custoDiaReais: 2.7 },
  { data: '15/09', diaSemana: 'Seg', tributariaFiscal: 420, controladoriaFinancas: 120, juridico: 65, tiProtheus: 210, operacoes: 50, totalDia: 865, limiteQuota: 400, custoDiaReais: 43.25 }, // PICO MÁXIMO (Dia de DCTFWeb / Fechamento Fiscal)
  { data: '16/09', diaSemana: 'Ter', tributariaFiscal: 280, controladoriaFinancas: 95, juridico: 45, tiProtheus: 160, operacoes: 36, totalDia: 616, limiteQuota: 400, custoDiaReais: 30.8 },
  { data: '17/09', diaSemana: 'Qua', tributariaFiscal: 210, controladoriaFinancas: 80, juridico: 42, tiProtheus: 130, operacoes: 32, totalDia: 494, limiteQuota: 400, custoDiaReais: 24.7 },
  { data: '18/09', diaSemana: 'Qui', tributariaFiscal: 195, controladoriaFinancas: 75, juridico: 36, tiProtheus: 125, operacoes: 30, totalDia: 461, limiteQuota: 400, custoDiaReais: 23.05 },
  { data: '19/09', diaSemana: 'Sex', tributariaFiscal: 180, controladoriaFinancas: 68, juridico: 34, tiProtheus: 118, operacoes: 28, totalDia: 428, limiteQuota: 400, custoDiaReais: 21.4 },
];

export type ConsumoDiarioItem = ConsumoDiretoriaDiario;

export const INITIAL_AUDIT_LOGS: ApiAuditLogItem[] = [
  {
    id: 'log-cbs-001',
    protocolo: 'CBS-2026-0919-01',
    apiNome: 'Piloto CBS/IBS (Receita Federal)',
    endpoint: '/servico/calculadora-consumo/api/v1/calcular-operacao',
    cnpjConsultado: '04.709.150/0001-20',
    empresaNome: 'Recanto da Saudade Cemitério Parque Ltda.',
    diretoriaSolicitante: 'Diretoria Tributária & Fiscal',
    usuario: 'Dra. Vanessa Mendes',
    dataHora: '2026-09-19T11:42:15Z',
    statusHttp: 200,
    latenciaMs: 164,
    sucesso: true,
    resumoResultado: 'Cálculo de alíquota efetiva (26.5%) e retenção de Split Payment D+0 gerada com sucesso para ano 2026.',
    payloadEnvio: {
      cnpj: '04709150000120',
      ano: 2026,
      cnae: '9603-3/01',
      valorOperacao: 2366000,
      ufOrigem: 'PA',
      ufDestino: 'PA',
    },
    payloadResposta: {
      cbsDevida: 208208,
      ibsDevido: 418782,
      splitPaymentD0: 626990,
      caixaLiquidoD0: 1739010,
      aliquotaEfetiva: '26.50%',
      codigoRetorno: 'RFB_OK_2026',
    },
  },
  {
    id: 'log-info-002',
    protocolo: 'INF-2026-0919-88',
    apiNome: 'InfoSimples - CND Federal / PGFN',
    endpoint: '/api/v2/consultas/receita-federal/cnd',
    cnpjConsultado: '04.709.150/0001-20',
    empresaNome: 'Recanto da Saudade Cemitério Parque Ltda.',
    diretoriaSolicitante: 'Diretoria Jurídica & Compliance',
    usuario: 'Dra. Beatriz Albuquerque',
    dataHora: '2026-09-19T10:15:30Z',
    statusHttp: 200,
    latenciaMs: 820,
    sucesso: true,
    resumoResultado: 'Certidão Negativa emitida com sucesso. Código de controle: 8492.AB10.9922.0121. Válida até 20/12/2026.',
    payloadEnvio: {
      cnpj: '04709150000120',
      tipoCertidao: 'FEDERAL_PGFN',
      prioridade: 'NORMAL',
    },
    payloadResposta: {
      numeroCertidao: '8492.AB10.9922.0121',
      situacao: 'NEGATIVA',
      dataEmissao: '2026-06-20',
      dataValidade: '2026-12-20',
      orgao: 'Secretaria Especial da Receita Federal do Brasil / PGFN',
      pdfDownloadUrl: 'https://api.infosimples.com/storage/cnd-04709150000120.pdf',
    },
  },
  {
    id: 'log-info-003',
    protocolo: 'INF-2026-0919-45',
    apiNome: 'InfoSimples - Cartão CNPJ',
    endpoint: '/api/v2/consultas/receita-federal/cnpj',
    cnpjConsultado: '18.324.912/0001-44',
    empresaNome: 'Instituto GO Cursos e Treinamentos Ltda.',
    diretoriaSolicitante: 'Diretoria de TI & Integração Protheus ERP',
    usuario: 'Carlos Eduardo (TSS)',
    dataHora: '2026-09-19T09:30:10Z',
    statusHttp: 200,
    latenciaMs: 310,
    sucesso: true,
    resumoResultado: 'Situação cadastral ATIVA confirmada. CNAE 8599-6/04 sincronizado com tabela SX5 do Protheus.',
    payloadEnvio: {
      cnpj: '18324912000144',
      atualizarSocios: true,
    },
    payloadResposta: {
      razaoSocial: 'Instituto GO Cursos e Treinamentos Ltda.',
      situacao: 'ATIVA',
      cnaePrincipal: '8599-6/04',
      opcaoSimples: true,
      sociosQsa: 2,
    },
  },
  {
    id: 'log-cbs-004',
    protocolo: 'CBS-2026-0919-02',
    apiNome: 'Piloto CBS/IBS (Receita Federal)',
    endpoint: '/servico/calculadora-consumo/api/v1/calcular-operacao',
    cnpjConsultado: '18.324.912/0001-44',
    empresaNome: 'Instituto GO Cursos e Treinamentos Ltda.',
    diretoriaSolicitante: 'Controladoria & Planejamento Financeiro',
    usuario: 'Marcos Vinicius',
    dataHora: '2026-09-19T08:55:00Z',
    statusHttp: 200,
    latenciaMs: 182,
    sucesso: true,
    resumoResultado: 'Benefício fiscal da LC 214/2025 aplicado: Redução de 60% para serviços de educação profissional.',
    payloadEnvio: {
      cnpj: '18324912000144',
      ano: 2026,
      cnae: '8599-6/04',
      valorOperacao: 380000,
      tipoOperacao: 'CURSO_EDUCACIONAL',
    },
    payloadResposta: {
      reducaoAplicada: '60%',
      aliquotaEfetivaReduzida: '10.60%',
      cbsLiquida: 13376,
      ibsLiquido: 26904,
      totalTributos: 40280,
    },
  },
  {
    id: 'log-info-005',
    protocolo: 'INF-2026-0918-91',
    apiNome: 'SEFAZ-PA / Sintegra',
    endpoint: '/api/v2/consultas/sintegra/pa',
    cnpjConsultado: '04.709.150/0001-20',
    empresaNome: 'Recanto da Saudade Cemitério Parque Ltda.',
    diretoriaSolicitante: 'Diretoria de Operações & Atendimento',
    usuario: 'Roberto Sampaio',
    dataHora: '2026-09-18T16:20:45Z',
    statusHttp: 200,
    latenciaMs: 540,
    sucesso: true,
    resumoResultado: 'Inscrição Estadual 15.334.891-0 HABILITADA. Regime Normal / Sem restrições de trânsito de mercadorias.',
    payloadEnvio: {
      cnpj: '04709150000120',
      uf: 'PA',
    },
    payloadResposta: {
      inscricaoEstadual: '15.334.891-0',
      situacaoIe: 'HABILITADO',
      regimeIcms: 'NORMAL',
    },
  },
  {
    id: 'log-info-006',
    protocolo: 'INF-2026-0918-12',
    apiNome: 'InfoSimples - Simples Nacional',
    endpoint: '/api/v2/consultas/simples-nacional/situacao',
    cnpjConsultado: '32.109.845/0001-99',
    empresaNome: 'Fornecedor de Flores e Jardinagem Pará Ltda.',
    diretoriaSolicitante: 'Diretoria Tributária & Fiscal',
    usuario: 'Dra. Vanessa Mendes',
    dataHora: '2026-09-18T14:10:12Z',
    statusHttp: 400,
    latenciaMs: 910,
    sucesso: false,
    resumoResultado: 'Divergência de Enquadramento: Fornecedor desenquadrado do Simples em 31/08/2026. Necessário exigir NF com destaque de ICMS.',
    payloadEnvio: {
      cnpj: '32109845000199',
    },
    payloadResposta: {
      erro: 'FORNECEDOR_EXCLUIDO_SIMPLES',
      dataExclusao: '2026-08-31',
      motivo: 'Excesso de sublimite estadual no Pará',
    },
  },
];
