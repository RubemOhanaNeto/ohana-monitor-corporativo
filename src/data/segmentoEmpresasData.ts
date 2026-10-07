import { ContaBalancete, ItemDRE, TituloFinanceiro } from '../types';

export interface DocumentoFiscalSegmento {
  segmento: string;
  principaisDocumentos: string[];
  focoCruzamentoSped: string;
  legislacaoBase: string;
  checklistAuditoriaCfc: string[];
  obrigacoesDigitais: {
    nome: string;
    sigla: string;
    prazo: string;
    orgao: string;
    finalidade: string;
  }[];
}

export interface DetalhesSegmentoEmpresa {
  empresaId: string;
  segmentoNome: string;
  setorCodigo: 'CEMITERIAL_FUNERARIO' | 'SAUDE_CLINICAS' | 'EDUCACAO' | 'GERAL';
  sistemaErpPrincipal: string;
  sistemasIntegrados: string[];
  documentosFiscais: DocumentoFiscalSegmento;
  dreSegmentada: ItemDRE[];
  contasBalancete: ContaBalancete[];
  titulosFinanceiros: TituloFinanceiro[];
  kpisEspecificos: {
    titulo: string;
    valor: string;
    subtexto: string;
    tipo: 'positivo' | 'alerta' | 'neutro';
  }[];
  normasCfcAplicaveis: {
    codigo: string;
    titulo: string;
    impactoEmpresa: string;
    statusAuditoria: 'CONFORME' | 'EM_ANALISE' | 'REQUER_AJUSTE';
  }[];
}

export const DADOS_SEGMENTADOS_EMPRESAS: Record<string, DetalhesSegmentoEmpresa> = {
  'recanto-da-saudade': {
    empresaId: 'recanto-da-saudade',
    segmentoNome: 'Cemitério Parque, Cremação & Planos de Assistência Funeral',
    setorCodigo: 'CEMITERIAL_FUNERARIO',
    sistemaErpPrincipal: 'TOTVS Protheus 12.1.2410',
    sistemasIntegrados: ['TSS 3.0 (Totvs Sped Services)', 'SIGAFAT (Faturamento)', 'SIGAGCT (Gestão de Contratos de Planos)', 'SIGAFIN (Financeiro)', 'SIGACTB (Contabilidade Gerencial)'],
    documentosFiscais: {
      segmento: 'Prestação de Serviços Funerários e Cemiteriais',
      principaisDocumentos: [
        'NFS-e Modelo Nacional (Subitens 25.01, 25.02 e 25.03)',
        'EFD-Reinf (Série R-4000 - Retenções na Fonte e R-2000 - Cessão Mão de Obra)',
        'Contratos de Cessão de Uso Real de Jazigos Perpétuos (Súmula Vinculante 31)',
        'ECD (Escrituração Contábil Digital - Livros Diário e Razão)',
        'ECF (Escrituração Contábil Fiscal - LALUR/LACS)',
        'EFD-Contribuições (PIS/COFINS Cumulativo)',
      ],
      focoCruzamentoSped: 'Segregação rigorosa de Locação de Jazigo (não incidência de ISS/Súmula Vinculante 31) versus Manutenção Cemiterial e Serviços de Sepultamento (incidência de ISS). Cruzamento entre receitas diferidas de planos funerários e faturamento mensal.',
      legislacaoBase: 'LC 116/2003 (Item 25), Código Tributário de Ananindeua e Belém, NBC TG 22, Orientação Técnica CFC nº 1/2026.',
      checklistAuditoriaCfc: [
        'Validação da segregação de receitas de locação/cessão de jazigo (sem ISS) de serviços de sepultamento/manutenção (com ISS 5%)',
        'Contabilização do Fundo de Manutenção Perpétua conforme NBC TG 25 (Provisões, Passivos e Ativos Contingentes)',
        'Apropriação da receita de planos funerários pelo regime de competência (NBC TG 47 - Receita de Contrato com Cliente)',
        'Conferência do Livro Diário com termo de abertura e encerramento autenticado no CRC/Junta Comercial',
        'Retenção de ISS pelo tomador nas hipóteses de serviços prestados em cemitérios de outro município',
      ],
      obrigacoesDigitais: [
        { nome: 'EFD-Reinf', sigla: 'REINF', prazo: 'Dia 15 do mês subsequente', orgao: 'Receita Federal', finalidade: 'Retenções federais (IRRF, PIS, COFINS, CSLL) e pagamentos diversos.' },
        { nome: 'DCTFWeb', sigla: 'DCTFWEB', prazo: 'Dia 15 do mês subsequente', orgao: 'Receita Federal', finalidade: 'Confissão de dívida previdenciária e emissão do DARF Numerado.' },
        { nome: 'Declaração Mensal de ISS (DMS)', sigla: 'DMS Ananindeua', prazo: 'Dia 10 do mês subsequente', orgao: 'Prefeitura de Ananindeua', finalidade: 'Apuração e emissão do DAM para recolhimento de ISS 5%.' },
        { nome: 'Escrituração Contábil Digital', sigla: 'ECD', prazo: 'Último dia útil de junho', orgao: 'SPED / CFC', finalidade: 'Transmissão dos livros contábeis digitais assinados por contador habilitado no CRC.' },
      ],
    },
    dreSegmentada: [
      { descricao: 'RECEITA BRUTA - MENSALIDADES DE PLANOS FUNERÁRIOS', valor: 980000, percentualReceita: 63.57, tipo: 'RECEITA_BRUTA', destaque: false },
      { descricao: 'RECEITA BRUTA - SERVIÇOS FUNERÁRIOS, SEPULTAMENTOS E CREMAÇÃO', valor: 420000, percentualReceita: 27.24, tipo: 'RECEITA_BRUTA', destaque: false },
      { descricao: 'RECEITA BRUTA - CONCESSÃO DE JAZIGOS PERPÉTUOS E MANUTENÇÃO', valor: 141660, percentualReceita: 9.19, tipo: 'RECEITA_BRUTA', destaque: false },
      { descricao: '(=) TOTAL DA RECEITA OPERACIONAL BRUTA', valor: 1541660, percentualReceita: 100, tipo: 'RECEITA_BRUTA', destaque: true },
      { descricao: '(-) Deduções da Receita Bruta (ISS Ananindeua 5%, PIS 0,65%, COFINS 3%)', valor: -133353.59, percentualReceita: 8.65, tipo: 'DEDUCOES' },
      { descricao: '(=) RECEITA OPERACIONAL LÍQUIDA', valor: 1408306.41, percentualReceita: 91.35, tipo: 'RECEITA_LIQUIDA', destaque: true },
      { descricao: '(-) Custos Diretos Funerários (Urnas, Crematório, Jazigos, Cortejo, Insumos)', valor: -647497.20, percentualReceita: 42.0, tipo: 'CUSTOS' },
      { descricao: '(=) LUCRO BRUTO CEMITERIAL', valor: 760809.21, percentualReceita: 49.35, tipo: 'LUCRO_BRUTO', destaque: true },
      { descricao: '(-) Despesas Gerais e Administrativas do Cemitério Parque', valor: -230478.17, percentualReceita: 14.95, tipo: 'DESPESAS' },
      { descricao: '(-) Despesas Comerciais e Call Center de Planos de Assistência Funeral', valor: -124103.63, percentualReceita: 8.05, tipo: 'DESPESAS' },
      { descricao: '(=) EBITDA CEMITERIAL & PLANOS', valor: 406227.41, percentualReceita: 26.35, tipo: 'EBITDA', destaque: true },
      { descricao: '(-) Depreciação de Imobilizado (Fornos Crematórios, Jazigos, Veículos Especiais)', valor: -53958.10, percentualReceita: 3.5, tipo: 'DESPESAS' },
      { descricao: '(+) Rendimentos de Aplicações Financeiras (Fundo de Reserva Perpétua)', valor: 18500.0, percentualReceita: 1.2, tipo: 'RESULTADO_FINANCEIRO' },
      { descricao: '(-) Provisão IRPJ e CSLL (Lucro Presumido)', valor: -118400.0, percentualReceita: 7.68, tipo: 'IR_CSLL' },
      { descricao: '(=) LUCRO LÍQUIDO DO EXERCÍCIO (MÊS)', valor: 252369.31, percentualReceita: 16.37, tipo: 'LUCRO_LIQUIDO', destaque: true },
    ],
    contasBalancete: [
      { codigo: '1.1.01.01', descricao: 'Caixa Geral e Arrecadação Cemitério', tipo: 'ATIVO', natureza: 'DEVEDORA', saldoAnterior: 85000, debitos: 145000, creditos: 120000, saldoAtual: 110000, grau: 4 },
      { codigo: '1.1.01.02', descricao: 'Bancos Conta Movimento (Itaú / Bradesco)', tipo: 'ATIVO', natureza: 'DEVEDORA', saldoAnterior: 920000, debitos: 1850000, creditos: 1420000, saldoAtual: 1350000, grau: 4 },
      { codigo: '1.1.01.03', descricao: 'Aplicações Financeiras de Liquidez Imediata (CDI)', tipo: 'ATIVO', natureza: 'DEVEDORA', saldoAnterior: 2100000, debitos: 350000, creditos: 150000, saldoAtual: 2300000, grau: 4 },
      { codigo: '1.1.02.01', descricao: 'Mensalidades de Planos Funerários a Receber', tipo: 'ATIVO', natureza: 'DEVEDORA', saldoAnterior: 780000, debitos: 980000, creditos: 920000, saldoAtual: 840000, grau: 4 },
      { codigo: '1.1.02.02', descricao: 'Créditos de Jazigos Perpétuos a Receber', tipo: 'ATIVO', natureza: 'DEVEDORA', saldoAnterior: 310000, debitos: 140000, creditos: 125000, saldoAtual: 325000, grau: 4 },
      { codigo: '1.1.03.01', descricao: 'Estoques de Urnas e Artigos Funerários', tipo: 'ATIVO', natureza: 'DEVEDORA', saldoAnterior: 450000, debitos: 220000, creditos: 180000, saldoAtual: 490000, grau: 4 },
      { codigo: '1.2.03.01', descricao: 'Imobilizado - Terrenos e Cemitérios Parques (Ananindeua)', tipo: 'ATIVO', natureza: 'DEVEDORA', saldoAnterior: 8500000, debitos: 0, creditos: 0, saldoAtual: 8500000, grau: 4 },
      { codigo: '1.2.03.02', descricao: 'Imobilizado - Fornos Crematórios e Columbários', tipo: 'ATIVO', natureza: 'DEVEDORA', saldoAnterior: 2400000, debitos: 120000, creditos: 0, saldoAtual: 2520000, grau: 4 },
      { codigo: '1.2.03.03', descricao: 'Imobilizado - Veículos Especiais e Cortejos', tipo: 'ATIVO', natureza: 'DEVEDORA', saldoAnterior: 1200000, debitos: 180000, creditos: 35000, saldoAtual: 1345000, grau: 4 },
      { codigo: '2.1.01.01', descricao: 'Fornecedores Nacionais de Urnas e Insumos', tipo: 'PASSIVO', natureza: 'CREDORA', saldoAnterior: 320000, debitos: 410000, creditos: 440000, saldoAtual: 350000, grau: 4 },
      { codigo: '2.1.02.01', descricao: 'Salários e Encargos da Equipe Funerária e Sepultadores', tipo: 'PASSIVO', natureza: 'CREDORA', saldoAnterior: 240000, debitos: 240000, creditos: 255000, saldoAtual: 255000, grau: 4 },
      { codigo: '2.1.03.01', descricao: 'Tributos e Contribuições a Recolher (DARF/ISS Ananindeua)', tipo: 'PASSIVO', natureza: 'CREDORA', saldoAnterior: 185000, debitos: 185000, creditos: 198000, saldoAtual: 198000, grau: 4 },
      { codigo: '2.2.01.01', descricao: 'Provisão para Manutenção Perpétua de Jazigos (NBC TG 25)', tipo: 'PASSIVO', natureza: 'CREDORA', saldoAnterior: 3800000, debitos: 0, creditos: 120000, saldoAtual: 3920000, grau: 4 },
      { codigo: '2.2.02.01', descricao: 'Receita Diferida de Planos Funerários (NBC TG 47)', tipo: 'PASSIVO', natureza: 'CREDORA', saldoAnterior: 1650000, debitos: 180000, creditos: 240000, saldoAtual: 1710000, grau: 4 },
      { codigo: '2.3.01.01', descricao: 'Capital Social Subscrito e Integralizado', tipo: 'PATRIMONIO_LIQUIDO', natureza: 'CREDORA', saldoAnterior: 4500000, debitos: 0, creditos: 0, saldoAtual: 4500000, grau: 4 },
      { codigo: '2.3.02.01', descricao: 'Lucros Acumulados de Exercícios Anteriores', tipo: 'PATRIMONIO_LIQUIDO', natureza: 'CREDORA', saldoAnterior: 5210000, debitos: 300000, creditos: 450000, saldoAtual: 5360000, grau: 4 },
    ],
    titulosFinanceiros: [
      { id: 'rec-1', tipo: 'RECEBER', descricao: 'Lote Mensalidades Planos Funerários - Débito em Conta e Boletos', entidade: 'Associados Plano Funeral Recanto (1.240 contratos ativos)', documento: 'Remessa CNAB 240 / Itaú', valorOriginal: 485000, valorAtualizado: 485000, vencimento: '10/09/2026', status: 'LIQUIDADO', categoria: 'Planos Recorrentes' },
      { id: 'rec-2', tipo: 'RECEBER', descricao: 'Serviços Funerários e Cremações - Atendimento Particular (PIX / Cartão)', entidade: 'Atendimentos Particulares do Mês', documento: 'NFS-e 4920 a 4985', valorOriginal: 312000, valorAtualizado: 312000, vencimento: '15/09/2026', status: 'LIQUIDADO', categoria: 'Serviços Avulsos' },
      { id: 'rec-3', tipo: 'RECEBER', descricao: 'Concessão Perpétua de Jazigos - Quadra E Cemitério Parque', entidade: 'Famílias Adquirentes Cemitério Parque', documento: 'Contrato de Cessão 2026/088', valorOriginal: 180000, valorAtualizado: 180000, vencimento: '25/09/2026', status: 'EM_DIA', categoria: 'Jazigos' },
      { id: 'rec-4', tipo: 'RECEBER', descricao: 'Mensalidades de Planos em Cobrança Ativa (Inadimplentes > 30 dias)', entidade: 'Associados em Cobrança Extrajudicial', documento: 'Boletos Registrados', valorOriginal: 42000, valorAtualizado: 44520, vencimento: '05/09/2026', status: 'EM_ATRASO', categoria: 'Cobrança Ativa', diasAtraso: 12 },
      { id: 'rec-5', tipo: 'PAGAR', descricao: 'Fornecedor Urnas de Madeira Nobre e Semiluxo', entidade: 'Indústria Metalúrgica e Funerária Santa Cruz Ltda.', documento: 'NF-e 88412 (Mod 55)', valorOriginal: 145000, valorAtualizado: 145000, vencimento: '18/09/2026', status: 'VENCE_HOJE', categoria: 'Insumos e Urnas' },
      { id: 'rec-6', tipo: 'PAGAR', descricao: 'Guia Única DCTFWeb / Previdência e Retenções Federais', entidade: 'Receita Federal do Brasil', documento: 'DARF Numerado 092026', valorOriginal: 198000, valorAtualizado: 198000, vencimento: '20/09/2026', status: 'EM_DIA', categoria: 'Tributos Federais' },
      { id: 'rec-7', tipo: 'PAGAR', descricao: 'Combustível e Manutenção da Frota de Cortejos', entidade: 'Rede Postos Aliança & Mecânica Express', documento: 'Fatura Mensal de Frota', valorOriginal: 34000, valorAtualizado: 34000, vencimento: '22/09/2026', status: 'EM_DIA', categoria: 'Operacional Cemitério' },
      { id: 'rec-8', tipo: 'PAGAR', descricao: 'Folha de Pagamento - Equipes de Atendimento e Sepultadores', entidade: 'Colaboradores Recanto da Saudade (68 colaboradores)', documento: 'Folha Bancária Bradesco', valorOriginal: 255000, valorAtualizado: 255000, vencimento: '05/10/2026', status: 'EM_DIA', categoria: 'Folha Salarial' },
    ],
    kpisEspecificos: [
      { titulo: 'Idade Média da Carteira de Planos', valor: '4,8 Anos', subtexto: 'Alta retenção e baixa rotatividade (churn 0.8% a.m.)', tipo: 'positivo' },
      { titulo: 'Taxa de Adimplência Mensal', valor: '94,2%', subtexto: '1.240 contratos em débito em conta e boleto D+0', tipo: 'positivo' },
      { titulo: 'Reserva Manutenção Perpétua', valor: 'R$ 3.920.000', subtexto: '100% lastreado em CDI de liquidez imediata (NBC TG 25)', tipo: 'positivo' },
      { titulo: 'Ocupação de Jazigos Parque', valor: '68,4%', subtexto: 'Capacidade remanescente para 14 anos de sepultamentos', tipo: 'neutro' },
    ],
    normasCfcAplicaveis: [
      { codigo: 'NBC TG 22', titulo: 'Informações por Segmento Operacional', impactoEmpresa: 'Evidenciação separada de cemitério parque, cremação e planos de assistência funerária.', statusAuditoria: 'CONFORME' },
      { codigo: 'NBC TG 47', titulo: 'Receita de Contrato com Cliente', impactoEmpresa: 'Contabilização da receita diferida de mensalidades de planos funerários e transferência de controle.', statusAuditoria: 'CONFORME' },
      { codigo: 'NBC TG 25', titulo: 'Provisões, Passivos e Ativos Contingentes', impactoEmpresa: 'Constituição obrigatória de fundo de manutenção perpétua para conservação de jazigos por prazo indeterminado.', statusAuditoria: 'CONFORME' },
      { codigo: 'Orientação Técnica CFC nº 1/2026', titulo: 'Fundamentos Contábeis de IBS e CBS', impactoEmpresa: 'Contabilização do período de testes operacionais do IBS (0,1%) e CBS (0,9%) sobre serviços cemiteriais.', statusAuditoria: 'EM_ANALISE' },
    ],
  },
  'instituto-go': {
    empresaId: 'instituto-go',
    segmentoNome: 'Saúde, Medicina Personalizada & Atendimento Hospitalar/Ambulatorial',
    setorCodigo: 'SAUDE_CLINICAS',
    sistemaErpPrincipal: 'TOTVS Saúde / Alterdata Gestão Médica',
    sistemasIntegrados: ['Prontuário Eletrônico Cloud CFM', 'TISS/TUSS XML (Padrão ANS)', 'Portal NFS-e Belém Saúde', 'Exportador DMED Receita Federal', 'Módulo de Split de Honorários Médicos'],
    documentosFiscais: {
      segmento: 'Prestação de Serviços Médicos, Diagnósticos e Clínicas (Saúde)',
      principaisDocumentos: [
        'NFS-e Belém (Subitens 4.01 a 4.23 da LC 116/2003 - Medicina e Diagnóstico)',
        'DMED (Declaração de Serviços Médicos e de Saúde exigida anualmente pela Receita Federal)',
        'EFD-Reinf (Série R-4000: Retenção de 4,65% CSRF e IRRF 1,5% em serviços hospitalares PJ para PJ)',
        'Lotes TISS XML (Padrão ANS para faturamento eletrônico de convênios médicos)',
        'ECD (Escrituração Contábil Digital - Livros Diário e Razão do Contador CRC)',
        'ECF (Escrituração Contábil Fiscal com LALUR/LACS e cruzamento de IRPJ/CSLL)',
      ],
      focoCruzamentoSped: 'Cruzamento estrito entre a DMED (valores pagos por pacientes pessoa física), as NFS-e emitidas em Belém/PA e o faturamento TISS/TUSS das operadoras de planos de saúde. Retenções de 4,65% (PIS/COFINS/CSLL) e IRRF sobre repasses a médicos e clínicas parceiras.',
      legislacaoBase: 'LC 116/2003 (Item 4), Lei nº 9.249/1995 (art. 15, § 1º, III, "a" - equiparação hospitalar), Resoluções ANS/CFM, NBC TG 22, Orientação Técnica CFC nº 1/2026.',
      checklistAuditoriaCfc: [
        'Confronto dos valores declarados na DMED com o faturamento contábil das contas de receitas de consultas particulares',
        'Validação da retenção na fonte de 4,65% (CSRF) e 1,5% (IRRF) nas notas tomadas de médicos PJ e terceirizados',
        'Comprovação das condições legais para fins de equiparação hospitalar (redução de presunção de IRPJ para 8% e CSLL 12%)',
        'Contabilização de glosas médicas de operadoras de saúde (perdas estimadas e recursos de glosas a faturar)',
        'Segregação contábil entre receita própria da clínica e repasses de honorários médicos pertencentes aos especialistas',
      ],
      obrigacoesDigitais: [
        { nome: 'DMED (Declaração Médica)', sigla: 'DMED', prazo: 'Último dia útil de fevereiro', orgao: 'Receita Federal', finalidade: 'Cruzamento das despesas médicas declaradas por pessoas físicas no IRPF.' },
        { nome: 'EFD-Reinf', sigla: 'REINF', prazo: 'Dia 15 do mês subsequente', orgao: 'Receita Federal', finalidade: 'Escrituração de retenções federais (4,65% e IRRF) sobre serviços de saúde.' },
        { nome: 'Lotes TISS ANS', sigla: 'TISS XML', prazo: 'Conforme cronograma de cada operadora', orgao: 'ANS / Operadoras', finalidade: 'Transmissão eletrônica de guias de consulta, exames e procedimentos médicos.' },
        { nome: 'NFS-e Belém Saúde', sigla: 'NFS-e Belém', prazo: 'No ato do atendimento / fechamento mensal', orgao: 'SEFIN Belém', finalidade: 'Emissão eletrônica com retenção de ISS 2% a 5% conforme enquadramento.' },
      ],
    },
    dreSegmentada: [
      { descricao: 'RECEITA BRUTA - CONSULTAS MÉDICAS ESPECIALIZADAS E CHECK-UPS', valor: 420000, percentualReceita: 52.5, tipo: 'RECEITA_BRUTA', destaque: false },
      { descricao: 'RECEITA BRUTA - PROCEDIMENTOS AMBULATORIAIS E INFUSÕES', valor: 260000, percentualReceita: 32.5, tipo: 'RECEITA_BRUTA', destaque: false },
      { descricao: 'RECEITA BRUTA - EXAMES DIAGNÓSTICOS E LAUDOS INTEGRADOS', valor: 120000, percentualReceita: 15.0, tipo: 'RECEITA_BRUTA', destaque: false },
      { descricao: '(=) TOTAL DA RECEITA BRUTA DE SERVIÇOS CLÍNICOS', valor: 800000, percentualReceita: 100, tipo: 'RECEITA_BRUTA', destaque: true },
      { descricao: '(-) Glosas Médicas de Operadoras de Saúde (Glosas Iniciais ~3,8%)', valor: -30400, percentualReceita: 3.8, tipo: 'DEDUCOES' },
      { descricao: '(-) Deduções Fiscais (ISS Belém 3,5%, PIS 0,65%, COFINS 3%)', valor: -57200, percentualReceita: 7.15, tipo: 'DEDUCOES' },
      { descricao: '(=) RECEITA OPERACIONAL LÍQUIDA CLÍNICA', valor: 712400, percentualReceita: 89.05, tipo: 'RECEITA_LIQUIDA', destaque: true },
      { descricao: '(-) Repasses de Honorários ao Corpo Clínico / Médicos Parceiros', valor: -288000, percentualReceita: 36.0, tipo: 'CUSTOS' },
      { descricao: '(-) Custos com Medicamentos, Reagentes e Insumos Hospitalares', valor: -96000, percentualReceita: 12.0, tipo: 'CUSTOS' },
      { descricao: '(=) LUCRO BRUTO CLÍNICO', valor: 328400, percentualReceita: 41.05, tipo: 'LUCRO_BRUTO', destaque: true },
      { descricao: '(-) Despesas com Instalações Clínicas (Edifício Cristal Corporate / Aluguel e Condomínio)', valor: -72000, percentualReceita: 9.0, tipo: 'DESPESAS' },
      { descricao: '(-) Despesas Administrativas, Recepção, Enfermagem e Prontuário CFM Cloud', valor: -64000, percentualReceita: 8.0, tipo: 'DESPESAS' },
      { descricao: '(=) EBITDA CLÍNICO', valor: 192400, percentualReceita: 24.05, tipo: 'EBITDA', destaque: true },
      { descricao: '(-) Depreciação de Equipamentos Médicos e Ultrassom', valor: -18000, percentualReceita: 2.25, tipo: 'DESPESAS' },
      { descricao: '(+) Resultado Financeiro Líquido', valor: 6200, percentualReceita: 0.78, tipo: 'RESULTADO_FINANCEIRO' },
      { descricao: '(-) Provisão IRPJ e CSLL (Lucro Presumido Saúde)', valor: -46400, percentualReceita: 5.8, tipo: 'IR_CSLL' },
      { descricao: '(=) LUCRO LÍQUIDO CLÍNICO DO MÊS', valor: 134200, percentualReceita: 16.78, tipo: 'LUCRO_LIQUIDO', destaque: true },
    ],
    contasBalancete: [
      { codigo: '1.1.01.01', descricao: 'Caixa Geral da Clínica e Fundo de Troco', tipo: 'ATIVO', natureza: 'DEVEDORA', saldoAnterior: 35000, debitos: 95000, creditos: 82000, saldoAtual: 48000, grau: 4 },
      { codigo: '1.1.01.02', descricao: 'Bancos Conta Movimento (Santander / Bradesco Empresas)', tipo: 'ATIVO', natureza: 'DEVEDORA', saldoAnterior: 540000, debitos: 920000, creditos: 810000, saldoAtual: 650000, grau: 4 },
      { codigo: '1.1.01.03', descricao: 'Aplicações Financeiras de Curto Prazo (Reserva Operacional)', tipo: 'ATIVO', natureza: 'DEVEDORA', saldoAnterior: 820000, debitos: 150000, creditos: 60000, saldoAtual: 910000, grau: 4 },
      { codigo: '1.1.02.01', descricao: 'Contas a Receber de Operadoras e Convênios (Faturamento TISS)', tipo: 'ATIVO', natureza: 'DEVEDORA', saldoAnterior: 410000, debitos: 520000, creditos: 460000, saldoAtual: 470000, grau: 4 },
      { codigo: '1.1.02.02', descricao: 'Glosas Médicas de Convênios em Fase de Recurso', tipo: 'ATIVO', natureza: 'DEVEDORA', saldoAnterior: 38000, debitos: 30400, creditos: 24500, saldoAtual: 43900, grau: 4 },
      { codigo: '1.1.02.03', descricao: 'Cartões de Crédito e Débito de Consultas a Compensar', tipo: 'ATIVO', natureza: 'DEVEDORA', saldoAnterior: 95000, debitos: 280000, creditos: 260000, saldoAtual: 115000, grau: 4 },
      { codigo: '1.1.03.01', descricao: 'Estoques de Medicamentos Especiais, Implantes e Reagentes', tipo: 'ATIVO', natureza: 'DEVEDORA', saldoAnterior: 120000, debitos: 96000, creditos: 88000, saldoAtual: 128000, grau: 4 },
      { codigo: '1.2.03.01', descricao: 'Imobilizado - Equipamentos Médicos, Diagnóstico e Ultrassom', tipo: 'ATIVO', natureza: 'DEVEDORA', saldoAnterior: 980000, debitos: 65000, creditos: 0, saldoAtual: 1045000, grau: 4 },
      { codigo: '1.2.03.02', descricao: 'Imobilizado - Benfeitorias e Instalações Edifício Cristal Corporate', tipo: 'ATIVO', natureza: 'DEVEDORA', saldoAnterior: 450000, debitos: 0, creditos: 0, saldoAtual: 450000, grau: 4 },
      { codigo: '1.2.04.01', descricao: 'Intangível - Licenças de Prontuário CFM Cloud e Softwares', tipo: 'ATIVO', natureza: 'DEVEDORA', saldoAnterior: 85000, debitos: 15000, creditos: 0, saldoAtual: 100000, grau: 4 },
      { codigo: '2.1.01.01', descricao: 'Fornecedores de Medicamentos e Insumos Hospitalares', tipo: 'PASSIVO', natureza: 'CREDORA', saldoAnterior: 140000, debitos: 165000, creditos: 180000, saldoAtual: 155000, grau: 4 },
      { codigo: '2.1.01.02', descricao: 'Repasses de Honorários a Pagar ao Corpo Clínico / Médicos', tipo: 'PASSIVO', natureza: 'CREDORA', saldoAnterior: 220000, debitos: 275000, creditos: 288000, saldoAtual: 233000, grau: 4 },
      { codigo: '2.1.02.01', descricao: 'Salários e Encargos da Equipe de Enfermagem e Recepção', tipo: 'PASSIVO', natureza: 'CREDORA', saldoAnterior: 85000, debitos: 85000, creditos: 89000, saldoAtual: 89000, grau: 4 },
      { codigo: '2.1.03.01', descricao: 'Tributos Federais e ISS Belém a Recolher (DAM/DARF)', tipo: 'PASSIVO', natureza: 'CREDORA', saldoAnterior: 78000, debitos: 78000, creditos: 84000, saldoAtual: 84000, grau: 4 },
      { codigo: '2.1.03.02', descricao: 'Retenções na Fonte de Terceiros (CSRF 4,65% e IRRF 1,5%)', tipo: 'PASSIVO', natureza: 'CREDORA', saldoAnterior: 28000, debitos: 28000, creditos: 31000, saldoAtual: 31000, grau: 4 },
      { codigo: '2.3.01.01', descricao: 'Capital Social Subscrito e Integralizado (Instituto GO)', tipo: 'PATRIMONIO_LIQUIDO', natureza: 'CREDORA', saldoAnterior: 1500000, debitos: 0, creditos: 0, saldoAtual: 1500000, grau: 4 },
      { codigo: '2.3.02.01', descricao: 'Lucros Acumulados da Clínica Médica', tipo: 'PATRIMONIO_LIQUIDO', natureza: 'CREDORA', saldoAnterior: 1820000, debitos: 120000, creditos: 134200, saldoAtual: 1834200, grau: 4 },
    ],
    titulosFinanceiros: [
      { id: 'go-1', tipo: 'RECEBER', descricao: 'Lote Faturamento TISS XML - Bradesco Saúde & SulAmérica', entidade: 'Bradesco Saúde S/A (Lote 2026/09)', documento: 'Guia TISS XML 88201', valorOriginal: 185000, valorAtualizado: 185000, vencimento: '28/09/2026', status: 'EM_DIA', categoria: 'Convênios Médicos' },
      { id: 'go-2', tipo: 'RECEBER', descricao: 'Lote Faturamento TISS XML - Unimed Belém & Cassi', entidade: 'Unimed Belém Cooperativa Médica', documento: 'Fatura Eletrônica 40192', valorOriginal: 142000, valorAtualizado: 142000, vencimento: '15/09/2026', status: 'LIQUIDADO', categoria: 'Convênios Médicos' },
      { id: 'go-3', tipo: 'RECEBER', descricao: 'Consultas Particulares & Protocolos de Longevidade (Cartão/PIX)', entidade: 'Pacientes Particulares Cristal Corporate', documento: 'NFS-e Belém 1120 a 1184', valorOriginal: 248000, valorAtualizado: 248000, vencimento: '10/09/2026', status: 'LIQUIDADO', categoria: 'Particular / Split' },
      { id: 'go-4', tipo: 'RECEBER', descricao: 'Lote de Glosas Médicas Recursadas com Evidência Clínica (PMR 60d)', entidade: 'Operadoras em Fase de Recurso de Glosa', documento: 'Protocolo ANS 99182', valorOriginal: 28500, valorAtualizado: 28500, vencimento: '30/09/2026', status: 'EM_DIA', categoria: 'Recurso de Glosas' },
      { id: 'go-5', tipo: 'PAGAR', descricao: 'Repasse Mensal de Honorários ao Corpo Clínico de Médicos Parceiros', entidade: 'Médicos Credenciados Instituto GO (14 especialistas PJ)', documento: 'Relatório de Repasse Médico 09/2026', valorOriginal: 288000, valorAtualizado: 288000, vencimento: '20/09/2026', status: 'EM_DIA', categoria: 'Honorários Médicos' },
      { id: 'go-6', tipo: 'PAGAR', descricao: 'Fornecedor de Medicamentos de Alta Complexidade e Implantes', entidade: 'Distribuidora Farmacêutica Amazônia Ltda.', documento: 'NF-e 34102', valorOriginal: 82000, valorAtualizado: 82000, vencimento: '18/09/2026', status: 'VENCE_HOJE', categoria: 'Medicamentos e Reagentes' },
      { id: 'go-7', tipo: 'PAGAR', descricao: 'Locação e Condomínio Clínico - Edifício Cristal Corporate', entidade: 'Administradora Cristal Corporate Belém', documento: 'Boleto Cobrança Conjunto 1500', valorOriginal: 42000, valorAtualizado: 42000, vencimento: '25/09/2026', status: 'EM_DIA', categoria: 'Instalações Clínicas' },
      { id: 'go-8', tipo: 'PAGAR', descricao: 'Guia DCTFWeb - Previdência e Retenções 4,65% s/ Repasses PJ', entidade: 'Receita Federal do Brasil', documento: 'DARF Numerado 092026-GO', valorOriginal: 58000, valorAtualizado: 58000, vencimento: '20/09/2026', status: 'EM_DIA', categoria: 'Tributos e Retenções' },
    ],
    kpisEspecificos: [
      { titulo: 'Taxa de Glosa Médica Líquida', valor: '1,4%', subtexto: 'Após recursos administrativos TISS acatados (meta < 2.0%)', tipo: 'positivo' },
      { titulo: 'Prazo Médio de Recebimento (PMR)', valor: '42 Dias', subtexto: 'Ciclo financeiro de repasse das operadoras de saúde', tipo: 'neutro' },
      { titulo: 'Margem de Contribuição Clínica', valor: '41,1%', subtexto: 'Equilíbrio sólido entre repasses médicos e faturamento bruto', tipo: 'positivo' },
      { titulo: 'Conformidade DMED / NFS-e', valor: '100%', subtexto: 'Conciliação automática sem divergência com IRPF dos pacientes', tipo: 'positivo' },
    ],
    normasCfcAplicaveis: [
      { codigo: 'NBC TG 22', titulo: 'Informações por Segmento Operacional', impactoEmpresa: 'Segregação de resultados de consultas ambulatoriais, procedimentos e exames diagnósticos.', statusAuditoria: 'CONFORME' },
      { codigo: 'NBC TG 20', titulo: 'Custos de Empréstimos e Ativos Qualificáveis', impactoEmpresa: 'Contabilização da modernização do parque tecnológico de diagnósticos e ultrassom.', statusAuditoria: 'CONFORME' },
      { codigo: 'Orientação Técnica CFC nº 1/2026', titulo: 'Fundamentos Contábeis de IBS e CBS', impactoEmpresa: 'Análise da alíquota reduzida de 60% para serviços de saúde e dispositivos médicos na Reforma Tributária.', statusAuditoria: 'EM_ANALISE' },
      { codigo: 'Resolução CFC nº 1.445/2013', titulo: 'Prevenção à Lavagem de Dinheiro no Setor de Saúde', impactoEmpresa: 'Controle de pagamentos em espécie e rastreabilidade de transações de pessoas físicas.', statusAuditoria: 'CONFORME' },
    ],
  },
};

export function obterDadosSegmentoEmpresa(empresaId: string | null | undefined): DetalhesSegmentoEmpresa {
  if (empresaId && DADOS_SEGMENTADOS_EMPRESAS[empresaId]) {
    return DADOS_SEGMENTADOS_EMPRESAS[empresaId];
  }
  // Default to recanto-da-saudade
  return DADOS_SEGMENTADOS_EMPRESAS['recanto-da-saudade'];
}
