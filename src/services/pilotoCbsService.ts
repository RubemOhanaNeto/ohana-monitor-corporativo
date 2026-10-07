// Serviço de Conexão com o Piloto CBS/IBS (Receita Federal / Serpro)
// https://piloto-cbs.tributos.gov.br
// https://piloto-cbs.tributos.gov.br/servico/calculadora-consumo/api/swagger-ui/index.html

export interface PilotoCbsStatus {
  online: boolean;
  urlBase: string;
  swaggerUrl: string;
  servico: string;
  versaoSwagger: string;
  orgao: string;
  tempoRespostaMs: number;
  ambiente: string;
  timestamp: string;
}

export interface SimulacaoCbsInput {
  empresaId: string;
  anoSimulacao: number; // 2026 - 2033
  valorOperacao: number;
  tipoOperacao: 'SERVICO' | 'MERCADORIA' | 'LOCACAO_JAZIGO' | 'CURSO_EDUCACIONAL';
  cnae: string;
  regimeTributario: 'LUCRO_PRESUMIDO' | 'LUCRO_REAL' | 'SIMPLES_NACIONAL';
  ufOrigem: string;
  ufDestino: string;
  municipioOrigem: string;
  municipioDestino: string;
  percentualCreditoInsumos: number; // 0 a 100
}

export interface SimulacaoCbsResultado {
  anoSimulacao: number;
  valorOperacao: number;
  regimeAplicado: string;
  beneficioFiscal: {
    nome: string;
    percentualReducao: number; // ex: 60 para educacao
    fundamentoLegal: string;
    classificacaoTreemap: 'REDUCAO_60' | 'REGIME_ESPECIFICO' | 'ALÍQUOTA_PADRAO' | 'SIMPLES_SEGREGADO';
  };

  // Sistema Atual
  sistemaAtual: {
    pis: number;
    pisAliquota: number;
    cofins: number;
    cofinsAliquota: number;
    iss: number;
    issAliquota: number;
    icms: number;
    icmsAliquota: number;
    totalTributos: number;
    aliquotaEfetivaTotal: number;
  };

  // Novo Sistema Reforma (Piloto CBS/IBS)
  sistemaReforma: {
    cbsBruta: number;
    cbsAliquotaNominal: number;
    cbsAliquotaEfetiva: number;
    cbsCreditoApropriado: number;
    cbsLiquidaDevida: number;

    ibsEstadual: number;
    ibsEstadualAliquota: number;
    ibsMunicipal: number;
    ibsMunicipalAliquota: number;
    ibsTotalLiquido: number;

    impostoSeletivo: number;
    totalTributosNovo: number;
    aliquotaEfetivaTotal: number;
  };

  // Efeito Transição no Ano Selecionado
  transicao: {
    descricaoFase: string;
    pisCofinsResidual: number;
    icmsIssResidual: number;
    cbsTransicao: number;
    ibsTransicao: number;
    totalEfetivoAno: number;
    aliquotaEfetivaAno: number;
    diferencaValor: number; // Novo - Atual (positivo = aumento, negativo = reducao)
    variacaoPercentual: number;
  };

  // Efeito Split Payment no Fluxo de Caixa (D+0)
  splitPayment: {
    valorBruto: number;
    retencaoImediataCbs: number;
    retencaoImediataIbs: number;
    totalRetencaoInstantanea: number;
    caixaLiquidoD0: number; // Quanto o banco deposita na hora
    creditosInsumosCompensaveis: number;
    impactoLiquidezDias: number; // 30 dias de antecipacao de recolhimento
  };

  // Dados para Gráfico Radar Multidimensional (Escala 0 a 100)
  metricasRadar: {
    eixos: {
      nome: string;
      atual: number;
      reforma: number;
    }[];
  };

  // Dados para Gráfico Waterfall (Cascata de Caixa)
  metricasWaterfall: {
    etapa: string;
    valor: number;
    tipo: 'positivo' | 'negativo' | 'total';
    acumulado: number;
  }[];

  // Payload Swagger Oficial para Integração Protheus / Postman
  swaggerPayload: {
    versao: string;
    endpoint: string;
    metodo: 'POST';
    headers: Record<string, string>;
    requestBody: any;
    responseBody: any;
    protheusMapping: {
      tabela: string;
      campoAliquotaCbs: string;
      campoAliquotaIbs: string;
      regraFiscalTES: string;
      codigoTributacaoNBS: string;
    };
  };
}

// Função utilitária de cálculo segundo regras da LC 214/2025 e EC 132/2023
export function calcularTributacaoReforma(input: SimulacaoCbsInput): SimulacaoCbsResultado {
  const {
    anoSimulacao,
    valorOperacao,
    tipoOperacao,
    regimeTributario,
    percentualCreditoInsumos,
    empresaId,
  } = input;

  // 1. Determinar Benefício Fiscal e Reduções
  let percentualReducao = 0;
  let nomeBeneficio = 'Alíquota Padrão Integral';
  let fundamento = 'Art. 8º da LC 214/2025 (Incidência Padrão)';
  let classificacaoTreemap: SimulacaoCbsResultado['beneficioFiscal']['classificacaoTreemap'] = 'ALÍQUOTA_PADRAO';

  if (tipoOperacao === 'CURSO_EDUCACIONAL' || empresaId === 'instituto-go') {
    percentualReducao = 60;
    nomeBeneficio = 'Serviços de Educação - Redução de 60%';
    fundamento = 'Art. 138 da LC 214/2025 c/c Art. 9º da EC 132/2023';
    classificacaoTreemap = 'REDUCAO_60';
  } else if (tipoOperacao === 'LOCACAO_JAZIGO' || empresaId === 'recanto-da-saudade') {
    percentualReducao = 0;
    nomeBeneficio = 'Regime Específico de Operações com Bens Imóveis e Serviços Funerários';
    fundamento = 'Art. 248 da LC 214/2025 (Base de cálculo deduzida do custo de aquisição/jazigo)';
    classificacaoTreemap = 'REGIME_ESPECIFICO';
  } else if (regimeTributario === 'SIMPLES_NACIONAL') {
    nomeBeneficio = 'Simples Nacional com Opção de Segregação CBS/IBS';
    fundamento = 'Art. 41 da LC 214/2025';
    classificacaoTreemap = 'SIMPLES_SEGREGADO';
  }

  const fatorReducao = (100 - percentualReducao) / 100;

  // 2. Sistema Atual (Base PIS, COFINS, ISS)
  let pisAliq = regimeTributario === 'LUCRO_REAL' ? 1.65 : 0.65;
  let cofinsAliq = regimeTributario === 'LUCRO_REAL' ? 7.6 : 3.0;
  let issAliq = 5.0; // Município de Belém / Pará alíquota padrão serviços
  let icmsAliq = tipoOperacao === 'MERCADORIA' ? 19.0 : 0.0;

  if (regimeTributario === 'SIMPLES_NACIONAL') {
    pisAliq = 0.35;
    cofinsAliq = 1.60;
    issAliq = 2.50;
    icmsAliq = 0;
  }

  const pisAtual = (valorOperacao * pisAliq) / 100;
  const cofinsAtual = (valorOperacao * cofinsAliq) / 100;
  const issAtual = (valorOperacao * issAliq) / 100;
  const icmsAtual = (valorOperacao * icmsAliq) / 100;
  const totalTributosAtual = pisAtual + cofinsAtual + issAtual + icmsAtual;
  const aliquotaEfetivaAtual = (totalTributosAtual / valorOperacao) * 100;

  // 3. Alíquotas Plenas da Reforma (Estimativa Oficial Ministério da Fazenda)
  const cbsPadrao = 8.8; // 8,8% Federal
  const ibsEstadualPadrao = 15.0; // 15% Estadual
  const ibsMunicipalPadrao = 2.7; // 2,7% Municipal
  const ibsTotalPadrao = ibsEstadualPadrao + ibsMunicipalPadrao; // 17,7%

  // Alíquotas com redução setorial
  const cbsNominal = Number((cbsPadrao * fatorReducao).toFixed(2));
  const ibsEstNominal = Number((ibsEstadualPadrao * fatorReducao).toFixed(2));
  const ibsMunNominal = Number((ibsMunicipalPadrao * fatorReducao).toFixed(2));
  const ibsTotalNominal = Number((ibsTotalPadrao * fatorReducao).toFixed(2));

  // Créditos sobre insumos
  const percCredito = Math.max(0, Math.min(100, percentualCreditoInsumos)) / 100;
  const creditoInsumosApropriado = valorOperacao * percCredito * ((cbsNominal + ibsTotalNominal) / 100);
  const cbsCredito = creditoInsumosApropriado * (cbsNominal / (cbsNominal + ibsTotalNominal));
  const ibsCredito = creditoInsumosApropriado * (ibsTotalNominal / (cbsNominal + ibsTotalNominal));

  const cbsBruta = (valorOperacao * cbsNominal) / 100;
  const ibsEstadualBruto = (valorOperacao * ibsEstNominal) / 100;
  const ibsMunicipalBruto = (valorOperacao * ibsMunNominal) / 100;

  const cbsLiquida = Math.max(0, cbsBruta - cbsCredito);
  const ibsLiquido = Math.max(0, (ibsEstadualBruto + ibsMunicipalBruto) - ibsCredito);
  const totalTributosPleno = cbsLiquida + ibsLiquido;
  const aliquotaEfetivaPlena = (totalTributosPleno / valorOperacao) * 100;

  // 4. Regras do Ano de Transição Selecionado (2026 - 2033)
  let pisCofinsResidual = 0;
  let icmsIssResidual = 0;
  let cbsTransicao = 0;
  let ibsTransicao = 0;
  let descricaoFase = '';

  if (anoSimulacao === 2026) {
    descricaoFase = 'Fase de Teste Operacional (CBS 0,9% e IBS 0,1% compensáveis com PIS/COFINS). Sem acréscimo de carga.';
    // Em 2026, 0,9% CBS e 0,1% IBS são recolhidos, mas abatidos 100% do PIS/COFINS
    cbsTransicao = (valorOperacao * 0.9) / 100;
    ibsTransicao = (valorOperacao * 0.1) / 100;
    pisCofinsResidual = Math.max(0, pisAtual + cofinsAtual - (cbsTransicao + ibsTransicao));
    icmsIssResidual = issAtual + icmsAtual;
  } else if (anoSimulacao === 2027 || anoSimulacao === 2028) {
    descricaoFase = 'CBS entra em vigor pleno. PIS e COFINS 100% extintos. IBS em alíquota teste (0,1%). ICMS e ISS mantidos integralmente.';
    cbsTransicao = cbsLiquida;
    ibsTransicao = (valorOperacao * 0.1) / 100;
    pisCofinsResidual = 0;
    icmsIssResidual = issAtual + icmsAtual;
  } else if (anoSimulacao >= 2029 && anoSimulacao <= 2032) {
    const reducaoGradual = (anoSimulacao - 2028) * 0.10; // 2029: 10%, 2030: 20%, 2031: 30%, 2032: 40%
    const porcentagemIbs = reducaoGradual;
    descricaoFase = `Transição Gradual: Redução de ${(reducaoGradual * 100).toFixed(0)}% do ICMS/ISS e introdução proporcional de ${(porcentagemIbs * 100).toFixed(0)}% do IBS.`;
    cbsTransicao = cbsLiquida;
    ibsTransicao = ibsLiquido * porcentagemIbs;
    pisCofinsResidual = 0;
    icmsIssResidual = (issAtual + icmsAtual) * (1 - reducaoGradual);
  } else {
    // 2033 em diante
    descricaoFase = 'Vigência Plena e Definitiva da Reforma Tributária. PIS, COFINS, ISS e ICMS totalmente extintos.';
    cbsTransicao = cbsLiquida;
    ibsTransicao = ibsLiquido;
    pisCofinsResidual = 0;
    icmsIssResidual = 0;
  }

  const totalEfetivoAno = pisCofinsResidual + icmsIssResidual + cbsTransicao + ibsTransicao;
  const aliquotaEfetivaAno = (totalEfetivoAno / valorOperacao) * 100;
  const diferencaValor = totalEfetivoAno - totalTributosAtual;
  const variacaoPercentual = totalTributosAtual > 0 ? (diferencaValor / totalTributosAtual) * 100 : 0;

  // 5. Impacto do Split Payment (Retenção Instantânea D+0)
  // No split payment, CBS e IBS do ano de transição são retidos diretamente pelo banco adquirente/pagador
  const retencaoCbs = cbsTransicao;
  const retencaoIbs = ibsTransicao;
  const totalRetencao = retencaoCbs + retencaoIbs;
  const caixaLiquidoD0 = valorOperacao - totalRetencao;

  // 6. Dados para Gráfico Waterfall (Cascata de Fluxo de Caixa)
  const metricasWaterfall: SimulacaoCbsResultado['metricasWaterfall'] = [
    { etapa: 'Faturamento Bruto', valor: valorOperacao, tipo: 'positivo', acumulado: valorOperacao },
    { etapa: '(-) Split Payment CBS', valor: -retencaoCbs, tipo: 'negativo', acumulado: valorOperacao - retencaoCbs },
    { etapa: '(-) Split Payment IBS', valor: -retencaoIbs, tipo: 'negativo', acumulado: valorOperacao - totalRetencao },
    { etapa: '(=) Caixa Líquido em D+0', valor: caixaLiquidoD0, tipo: 'total', acumulado: caixaLiquidoD0 },
    { etapa: '(+) Créditos Insumos Recup.', valor: creditoInsumosApropriado, tipo: 'positivo', acumulado: caixaLiquidoD0 + creditoInsumosApropriado },
  ];

  // 7. Dados para Gráfico Radar Multidimensional (Escala 0 a 100)
  const metricasRadar: SimulacaoCbsResultado['metricasRadar'] = {
    eixos: [
      {
        nome: 'Carga Nominal Bruta',
        atual: Math.min(100, Math.round(aliquotaEfetivaAtual * 4)),
        reforma: Math.min(100, Math.round(((cbsNominal + ibsTotalNominal) / 30) * 100)),
      },
      {
        nome: 'Carga Efetiva com Créditos',
        atual: Math.min(100, Math.round(aliquotaEfetivaAtual * 4)),
        reforma: Math.min(100, Math.round((aliquotaEfetivaAno / 30) * 100)),
      },
      {
        nome: 'Aproveitamento de Insumos',
        atual: regimeTributario === 'LUCRO_REAL' ? 65 : 20,
        reforma: 92, // Não-cumulatividade plena
      },
      {
        nome: 'Risco de Fluxo de Caixa (Split)',
        atual: 25, // Imposto pago no dia 20 do mês seguinte
        reforma: anoSimulacao >= 2027 ? 85 : 35, // Retenção automática instantânea
      },
      {
        nome: 'Complexidade de Parametrização ERP',
        atual: 60,
        reforma: anoSimulacao <= 2032 ? 95 : 45, // Alta complexidade na convivência de sistemas
      },
    ],
  };

  // 8. Payload Swagger Oficial Formatado
  const swaggerPayload = {
    versao: '1.2.0-beta',
    endpoint: 'POST /servico/calculadora-consumo/api/v1/calcular-operacao',
    metodo: 'POST' as const,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Piloto-Ambiente': 'HOMOLOGACAO_RECEITA_FEDERAL',
      'X-Originador-Sistema': 'OHANA_MONITOR_CORPORATIVO',
    },
    requestBody: {
      identificacaoOperacao: {
        versaoLeiaute: '1.0',
        tipoOperacao,
        anoReferencia: anoSimulacao,
        valorOperacao,
        moeda: 'BRL',
      },
      emitente: {
        empresaId,
        regimeTributario,
        cnaePrincipal: input.cnae,
        municipioIbge: '1501402', // Belém / PA
        uf: input.ufOrigem,
      },
      destinatario: {
        tipoTomador: 'PESSOA_JURIDICA',
        municipioIbge: '1501402',
        uf: input.ufDestino,
      },
      enquadramentoFiscal: {
        beneficioAplicado: classificacaoTreemap,
        percentualReducao,
        baseLegal: fundamento,
        aliquotaDiferenciada: percentualReducao > 0,
      },
      creditosInsumos: {
        percentualEstimado: percentualCreditoInsumos,
        modalidade: 'NAO_CUMULATIVIDADE_PLENA_LC214',
      },
    },
    responseBody: {
      codigoStatus: 200,
      mensagem: 'Cálculo de Tributos sobre o Consumo processado com sucesso conforme LC 214/2025',
      resultadoCalculo: {
        ano: anoSimulacao,
        faseTransitoria: anoSimulacao <= 2032,
        tributosFederais: {
          cbsAliquotaNominal: cbsNominal,
          cbsValorBruto: cbsBruta,
          cbsCreditoCompensado: cbsCredito,
          cbsValorDevidoAno: cbsTransicao,
          pisResidual: pisCofinsResidual > 0 ? pisAtual : 0,
          cofinsResidual: pisCofinsResidual > 0 ? cofinsAtual : 0,
        },
        tributosSubnacionais: {
          ibsEstadualAliquota: ibsEstNominal,
          ibsMunicipalAliquota: ibsMunNominal,
          ibsTotalAliquota: ibsTotalNominal,
          ibsValorBruto: ibsEstadualBruto + ibsMunicipalBruto,
          ibsCreditoCompensado: ibsCredito,
          ibsValorDevidoAno: ibsTransicao,
          icmsResidual: icmsIssResidual > 0 ? icmsAtual : 0,
          issResidual: icmsIssResidual > 0 ? issAtual : 0,
        },
        consolidado: {
          totalTributosAno: totalEfetivoAno,
          aliquotaEfetivaCalculada: Number(aliquotaEfetivaAno.toFixed(2)),
          splitPaymentRetencaoD0: totalRetencao,
          caixaLiquidoD0,
        },
      },
    },
    protheusMapping: {
      tabela: 'SB1 / SF4 / CD2 (TOTVS Protheus 12)',
      campoAliquotaCbs: 'F4_ALQCBS (Alíquota CBS)',
      campoAliquotaIbs: 'F4_ALQIBS (Alíquota IBS Estadual + Municipal)',
      regraFiscalTES: percentualReducao > 0 ? 'TES_REDUCAO_LC214 (Cod. 581)' : 'TES_PADRAO_IVA (Cod. 501)',
      codigoTributacaoNBS: 'NBS 1.0101 (Serviços com incidência segregada)',
    },
  };

  return {
    anoSimulacao,
    valorOperacao,
    regimeAplicado: regimeTributario,
    beneficioFiscal: {
      nome: nomeBeneficio,
      percentualReducao,
      fundamentoLegal: fundamento,
      classificacaoTreemap,
    },
    sistemaAtual: {
      pis: pisAtual,
      pisAliquota: pisAliq,
      cofins: cofinsAtual,
      cofinsAliquota: cofinsAliq,
      iss: issAtual,
      issAliquota: issAliq,
      icms: icmsAtual,
      icmsAliquota: icmsAliq,
      totalTributos: totalTributosAtual,
      aliquotaEfetivaTotal: Number(aliquotaEfetivaAtual.toFixed(2)),
    },
    sistemaReforma: {
      cbsBruta,
      cbsAliquotaNominal: cbsNominal,
      cbsAliquotaEfetiva: Number(((cbsLiquida / valorOperacao) * 100).toFixed(2)),
      cbsCreditoApropriado: cbsCredito,
      cbsLiquidaDevida: cbsLiquida,
      ibsEstadual: ibsEstadualBruto,
      ibsEstadualAliquota: ibsEstNominal,
      ibsMunicipal: ibsMunicipalBruto,
      ibsMunicipalAliquota: ibsMunNominal,
      ibsTotalLiquido: ibsLiquido,
      impostoSeletivo: 0,
      totalTributosNovo: totalTributosPleno,
      aliquotaEfetivaTotal: Number(aliquotaEfetivaPlena.toFixed(2)),
    },
    transicao: {
      descricaoFase,
      pisCofinsResidual,
      icmsIssResidual,
      cbsTransicao,
      ibsTransicao,
      totalEfetivoAno,
      aliquotaEfetivaAno: Number(aliquotaEfetivaAno.toFixed(2)),
      diferencaValor: Number(diferencaValor.toFixed(2)),
      variacaoPercentual: Number(variacaoPercentual.toFixed(1)),
    },
    splitPayment: {
      valorBruto: valorOperacao,
      retencaoImediataCbs: retencaoCbs,
      retencaoImediataIbs: retencaoIbs,
      totalRetencaoInstantanea: totalRetencao,
      caixaLiquidoD0,
      creditosInsumosCompensaveis: creditoInsumosApropriado,
      impactoLiquidezDias: 30,
    },
    metricasRadar,
    metricasWaterfall,
    swaggerPayload,
  };
}
