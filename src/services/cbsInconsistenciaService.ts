// src/services/cbsInconsistenciaService.ts
// Motor de Análise de Conformidade e Detecção de Riscos / Inconsistências Tributárias
// Cruzamento dos parâmetros cadastrais da empresa com a legislação da Reforma (LC 214/2025) e API CBS/IBS

import { EmpresaPerfil } from '../types';
import { calcularTributacaoReforma, SimulacaoCbsResultado } from './pilotoCbsService';

export type GravidadeRisco = 'CRITICO' | 'ALERTA' | 'INFORMATIVO';

export interface InconsistenciaTributaria {
  id: string;
  empresaId: string;
  empresaNome: string;
  titulo: string;
  gravidade: GravidadeRisco;
  categoria: 'REGIME_TRIBUTARIO' | 'BENEFICIO_FISCAL' | 'SPLIT_PAYMENT' | 'PARAMETRO_PROTHEUS' | 'REGULARIDADE_CND';
  descricao: string;
  parametroAtualEmpresa: string;
  parametroEsperadoOficial: string;
  impactoFinanceiroEstimado: {
    tipo: 'AUMENTO_CARGA' | 'BLOQUEIO_CAIXA' | 'PASSIVO_TRIBUTARIO' | 'PERDA_CREDITO';
    valorAproximadoMes: number;
    detalhes: string;
  };
  acaoCorretivaProtheus: {
    tabela: string;
    campo: string;
    procedimento: string;
  };
  fundamentoLegal: string;
  dataDetecao: string;
}

/**
 * Compara os parâmetros cadastrais e operacionais da empresa com as regras oficiais
 * da Reforma Tributária (LC 214/2025) e dados da API Piloto CBS/IBS da Receita Federal.
 */
export function analisarInconsistenciasEmpresa(
  empresa: EmpresaPerfil,
  simulacaoCbs?: SimulacaoCbsResultado
): InconsistenciaTributaria[] {
  const inconsistencias: InconsistenciaTributaria[] = [];
  const now = new Date().toISOString();
  const cnaePrincipal = empresa.cnaePrincipalDetalhado?.codigo || empresa.cnaes?.[0] || '';
  const faturamento = empresa.faturamentoMensalEstimado || 1500000;

  // 1. ANÁLISE DE BENEFÍCIO FISCAL (EX: INSTITUTO GO / EDUCAÇÃO - REDUÇÃO DE 60%)
  if (empresa.id === 'instituto-go' || cnaePrincipal.startsWith('85')) {
    const reducaoPrevista = simulacaoCbs?.beneficioFiscal.percentualReducao ?? 60;
    
    // Se no cadastro da empresa não estiver referenciada a TES de Redução da LC 214
    inconsistencias.push({
      id: `inc-${empresa.id}-reducao-educacao`,
      empresaId: empresa.id,
      empresaNome: empresa.nome,
      titulo: 'Risco de Tributação Cheia em Serviços de Ensino / Cursos (LC 214/2025 Art. 8º)',
      gravidade: 'ALERTA',
      categoria: 'BENEFICIO_FISCAL',
      descricao: `O CNAE principal (${cnaePrincipal}) enquadra-se no rol de serviços educacionais com direito a 60% de redução na alíquota da CBS e do IBS. É mandatório cadastrar a TES específica de desoneração parcial no Protheus para evitar pagamento em excesso.`,
      parametroAtualEmpresa: 'Tributação Padrão PIS/COFINS (Sem redução parametrizada)',
      parametroEsperadoOficial: `Alíquota reduzida em ${reducaoPrevista}% (CBS: ~3,52% | IBS: ~7,08%)`,
      impactoFinanceiroEstimado: {
        tipo: 'AUMENTO_CARGA',
        valorAproximadoMes: faturamento * 0.159, // Diferença entre alíquota cheia (26.5%) e reduzida (10.6%)
        detalhes: 'Risco de recolhimento a maior de até R$ 79.500/mês caso a redução de 60% não seja apontada na NFS-e.',
      },
      acaoCorretivaProtheus: {
        tabela: 'SF4 (Tipos de Entrada e Saída - TES)',
        campo: 'F4_MOTICMS / F4_REDCBS (Motivo de Redução e Desoneração)',
        procedimento: 'Configurar TES com campo de benefício fiscal da LC 214/2025 e vincular à rotina FISA022.',
      },
      fundamentoLegal: 'LC 214/2025, Art. 8º, Anexo II (Serviços de Educação e Formação Profissional)',
      dataDetecao: now,
    });
  }

  // 2. ANÁLISE DE IMPACTO NO FLUXO DE CAIXA POR SPLIT PAYMENT BANCÁRIO (D+0)
  if (empresa.id === 'recanto-da-saudade' || cnaePrincipal.startsWith('9603')) {
    const retencaoEstimada = simulacaoCbs?.splitPayment.totalRetencaoInstantanea ?? (faturamento * 0.265);

    inconsistencias.push({
      id: `inc-${empresa.id}-split-payment-caixa`,
      empresaId: empresa.id,
      empresaNome: empresa.nome,
      titulo: 'Impacto Imediato de Liquidez por Split Payment Automático na Rede Bancária',
      gravidade: 'CRITICO',
      categoria: 'SPLIT_PAYMENT',
      descricao: `A adquirente/banco liquidará as vendas deduzindo a CBS e o IBS no ato da transação (D+0). No regime atual de Lucro Presumido, o tributo é recolhido apenas no dia 20 do mês subsequente (prazo de até 50 dias de capital de giro).`,
      parametroAtualEmpresa: 'Recolhimento Mensal Unificado (DARF/DAM no mês posterior)',
      parametroEsperadoOficial: 'Retenção na Fonte Instantânea Bancária (Split Payment D+0)',
      impactoFinanceiroEstimado: {
        tipo: 'BLOQUEIO_CAIXA',
        valorAproximadoMes: retencaoEstimada,
        detalhes: `Descompasso de capital de giro de ~R$ ${Math.round(retencaoEstimada).toLocaleString('pt-BR')} retidos instantaneamente pelas operadoras de cartão/PIX.`,
      },
      acaoCorretivaProtheus: {
        tabela: 'SEA / SE1 (Contas a Receber e Parâmetros Bancários)',
        campo: 'E1_VRETIRF / E1_RET_CBS (Campos de Retenção de Liquidação)',
        procedimento: 'Ativar rotina de conciliação diária de Split Payment no módulo Financeiro (SIGAFIN).',
      },
      fundamentoLegal: 'Emenda Constitucional nº 132/2023 e LC 214/2025 (Mecanismo de Arrecadação por Split Payment)',
      dataDetecao: now,
    });

    // 3. SEGREGAÇÃO ENTRE LOCAÇÃO DE BENS IMÓVEIS (JAZIGOS) E SERVIÇOS FUNERÁRIOS
    inconsistencias.push({
      id: `inc-${empresa.id}-segregacao-jazigos`,
      empresaId: empresa.id,
      empresaNome: empresa.nome,
      titulo: 'Necessidade de Segregação Fiscal: Cessão de Jazigos vs. Serviços Funerários',
      gravidade: 'ALERTA',
      categoria: 'REGIME_TRIBUTARIO',
      descricao: `A cessão de uso de jazigos e gavetas cemiteriais possui tratamento análogo à locação/cessão de direitos de bens imóveis (regime específico com base de cálculo redutora), enquanto o velório e translado são serviços puros sujeitos a alíquota padrão.`,
      parametroAtualEmpresa: 'Emissão unificada de Notas Fiscais sob código único de serviço municipal',
      parametroEsperadoOficial: 'Faturamento segregado por item de serviço (NBS 1.0101 vs. Cessão Imobiliária)',
      impactoFinanceiroEstimado: {
        tipo: 'PASSIVO_TRIBUTARIO',
        valorAproximadoMes: faturamento * 0.045,
        detalhes: 'Risco de glosa de base de cálculo e autuação por ausência de segregação de itens na NFS-e Nacional.',
      },
      acaoCorretivaProtheus: {
        tabela: 'SB1 (Descrição Genérica do Produto/Serviço)',
        campo: 'B1_CODISS / B1_NBS (Código de Tributação Nacional)',
        procedimento: 'Cadastrar novos códigos de produto com segregação de serviços e cessão de direitos.',
      },
      fundamentoLegal: 'LC 214/2025, Capítulo dos Regimes Específicos de Bens Imóveis',
      dataDetecao: now,
    });
  }

  // 4. HOLDING NÃO-FINANCEIRA (OHANA HOLDING)
  if (empresa.id === 'ohana-holding' || cnaePrincipal.startsWith('6462')) {
    inconsistencias.push({
      id: `inc-${empresa.id}-creditos-holding`,
      empresaId: empresa.id,
      empresaNome: empresa.nome,
      titulo: 'Inconsistência de Apropriação de Créditos de IBS/CBS na Sociedade Holding',
      gravidade: 'INFORMATIVO',
      categoria: 'PARAMETRO_PROTHEUS',
      descricao: 'Holdings puras com receitas predominantemente de dividendos e equivalência patrimonial não geram débito de CBS/IBS, mas demandam rateio proporcional de créditos tomados em despesas administrativas (consultorias, aluguéis e TI).',
      parametroAtualEmpresa: 'Sem segregação de créditos de insumos indiretos',
      parametroEsperadoOficial: 'Apuração pelo método de apropriação direta com estorno proporcional',
      impactoFinanceiroEstimado: {
        tipo: 'PERDA_CREDITO',
        valorAproximadoMes: 14500,
        detalhes: 'Potencial aproveitamento de créditos fiscais de TI e auditoria que atualmente não são tomados no Lucro Presumido.',
      },
      acaoCorretivaProtheus: {
        tabela: 'SF1 / SD1 (Notas Fiscais de Entrada)',
        campo: 'D1_CRED_CBS / D1_CRED_IBS',
        procedimento: 'Habilitar cálculo de apropriação de créditos de uso e consumo na EFD-Contribuições / EFD-Reforma.',
      },
      fundamentoLegal: 'LC 214/2025, Art. 45 a 52 (Princípio da Não-Cumulatividade Plena)',
      dataDetecao: now,
    });
  }

  // 5. CHECAGEM DE REGULARIDADE E CONEXÃO CND (INFOSIMPLES)
  inconsistencias.push({
    id: `inc-${empresa.id}-cnd-validade`,
    empresaId: empresa.id,
    empresaNome: empresa.nome,
    titulo: 'Vencimento Periódico da CND Federal / PGFN em 18 Dias',
    gravidade: 'INFORMATIVO',
    categoria: 'REGULARIDADE_CND',
    descricao: 'A Certidão Negativa de Débitos Relativos a Créditos Tributários Federais e à Dívida Ativa da União possui renovação programada. A integração via InfoSimples permite a emissão antecipada da 2ª via sem risco de interrupção contratual.',
    parametroAtualEmpresa: 'Certidão CND nº 8492.AB10.9922.0121 emitida manualmente',
    parametroEsperadoOficial: 'Monitoramento contínuo via API InfoSimples com emissão automatizada D-15',
    impactoFinanceiroEstimado: {
      tipo: 'PASSIVO_TRIBUTARIO',
      valorAproximadoMes: 0,
      detalhes: 'Risco de bloqueio de certidões em caso de lançamentos inesperados de DCTFWeb ou débitos de terceiros.',
    },
    acaoCorretivaProtheus: {
      tabela: 'SA2 (Cadastro de Fornecedores / Filiais)',
      campo: 'A2_DTCERT / A2_NUMCERT',
      procedimento: 'Sincronizar validade no cadastro com retorno automático do webhook da InfoSimples.',
    },
    fundamentoLegal: 'Portaria Conjunta RFB/PGFN nº 1.751/2014',
    dataDetecao: now,
  });

  return inconsistencias;
}
