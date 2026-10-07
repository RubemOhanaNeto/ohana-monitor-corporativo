import {
  FiscalNoticia,
  EmpresaPerfil,
  DiretoriaCodigo,
  NivelUrgencia,
  NivelRisco,
  TriadeAgentes,
  AplicabilidadeEmpresa,
  FiscalAcao,
  StatusAcao,
  StatusAtualidade,
} from '../types';

export interface RawInputMateria {
  titulo: string;
  texto: string;
  orgao?: string;
  ato?: string;
  numeroAto?: string;
  dataPublicacao?: string;
  urlFonte?: string;
  fonteOrigem?: string;
}

export interface ResultadoClassificacaoRelevancia {
  noticia: FiscalNoticia;
  scoreRelevancia: number; // 0 - 100
  passouFiltro: boolean; // Relevante o suficiente para o Presidente ou Diretorias
  empresasAfetadas: { empresaId: string; razaoSocial: string; motivo: string; impacto: string }[];
  diretoriasDestino: DiretoriaCodigo[];
  exigeDecisaoRubinho: boolean;
  acoesSugeridas: Partial<FiscalAcao>[];
}

// Dicionário de CNAEs e palavras-chave setoriais
const DICIONARIO_SETORES = {
  FUNERARIO_CEMITERIAL: {
    cnaes: ['9603-3/04', '9603-3/01', '9603-3/02', '9603-3/03', '9603-3/05', '9603-3/99'],
    keywords: [
      'funer', 'cemitério', 'cemiterial', 'jazigo', 'cremat', 'sepultamento',
      'óbito', 'urna', 'caixão', 'translado', 'necrópole', 'concessão funerária',
      'licenciamento ambiental de cemitério', 'semas', 'sesma', 'cremação',
      'item 25', 'serviços funerários'
    ],
    pesos: 35,
  },
  TRIBUTARIO_FISCAL: {
    cnaes: [],
    keywords: [
      'iss', 'issqn', 'reforma tributária', 'ibs', 'cbs', 'imposto seletivo',
      'nfs-e', 'nota fiscal', 'sped', 'reinf', 'simples nacional', 'tes',
      'retenção na fonte', 'alíquota', 'base de cálculo', 'crédito tributário',
      'receita federal', 'sefa', 'sefaz', 'dívida ativa', 'cnd'
    ],
    pesos: 25,
  },
  SISTEMAS_PROTHEUS: {
    cnaes: [],
    keywords: [
      'protheus', 'totvs', 'tss', 'nfse', 'schema xml', 'layout sped',
      'virada de versão', 'webservice rps', 'patch', 'rotina mata', 'sigafis'
    ],
    pesos: 20,
  },
  TRABALHISTA_RH: {
    cnaes: [],
    keywords: [
      'esocial', 'fgts digital', 'mte', 'insalubridade', 'periculosidade',
      'nr-1', 'nr-32', 'dissídio', 'convenção coletiva', 'piso salarial', 'cft'
    ],
    pesos: 15,
  },
  REGULATORIO_AMBIENTAL: {
    cnaes: [],
    keywords: [
      'semas', 'ibama', 'licença de operação', 'licença prévia', 'outorga',
      'lençol freático', 'resíduos biológicos', 'anvisa', 'resolução conama', 'poluição'
    ],
    pesos: 30,
  },
};

/**
 * Motor de Relevância OHANA (Vigilância e Classificação Multi-Empresa)
 * Aplica as 12 perguntas de inteligência corporativa:
 * 1. O que mudou?
 * 2. Qual empresa pode ser afetada?
 * 3. Qual diretoria precisa analisar?
 * 4. Qual é a fonte original?
 * 5. Qual pode ser o impacto?
 * 6. Existe prazo?
 * 7. Existe risco?
 * 8. Existe oportunidade?
 * 9. Isso exige decisão humana do Presidente (Rubinho)?
 */
export function executarMotorRelevancia(
  raw: RawInputMateria,
  empresasCadastradas: EmpresaPerfil[]
): ResultadoClassificacaoRelevancia {
  const fullText = `${raw.titulo} ${raw.texto} ${raw.orgao || ''} ${raw.ato || ''}`.toLowerCase();
  const hasFuneralKeywords = DICIONARIO_SETORES.FUNERARIO_CEMITERIAL.keywords.some((k) => fullText.includes(k));
  const hasEnvironmentalKeywords = DICIONARIO_SETORES.REGULATORIO_AMBIENTAL.keywords.some((k) => fullText.includes(k));

  // 1. Identificar match com empresas cadastradas
  const empresasAfetadas: { empresaId: string; razaoSocial: string; motivo: string; impacto: string }[] = [];
  const aplicabilidades: AplicabilidadeEmpresa[] = [];
  let scoreRelevancia = 10; // base score

  empresasCadastradas.forEach((emp) => {
    let matchEmpresa = false;
    let motivo = '';
    let impacto = '';

    // Match por CNAE primário e secundários
    const cnaesEmpresa = [
      emp.cnaePrincipalDetalhado?.codigo,
      ...(emp.cnaesSecundariosDetalhados?.map((c) => c.codigo) || []),
      ...(emp.cnaes || []),
    ]
      .filter(Boolean)
      .map((c) => (c as string).replace(/[^\d]/g, ''));

    const hasCnaeMatch = DICIONARIO_SETORES.FUNERARIO_CEMITERIAL.cnaes.some((c) => {
      const clean = c.replace(/[^\d]/g, '');
      return cnaesEmpresa.some((ce) => ce.includes(clean) || clean.includes(ce));
    });

    // Check city / state match
    const mun = emp.endereco?.municipio || emp.localidades?.municipios?.[0];
    const uf = emp.endereco?.uf || emp.localidades?.uf;

    const matchLocal =
      (mun && fullText.includes(mun.toLowerCase())) ||
      (uf && fullText.includes(`/${uf.toLowerCase()}`)) ||
      (uf === 'PA' && (fullText.includes('pará') || fullText.includes('belém') || fullText.includes('ananindeua')));

    // Check keyword match for funeral/cemetery
    const hasFuneralKeywords = DICIONARIO_SETORES.FUNERARIO_CEMITERIAL.keywords.some((k) => fullText.includes(k));
    const hasEnvironmental = DICIONARIO_SETORES.REGULATORIO_AMBIENTAL.keywords.some((k) => fullText.includes(k));

    if (hasCnaeMatch && (hasFuneralKeywords || matchLocal)) {
      matchEmpresa = true;
      scoreRelevancia += 40;
      motivo = `Enquadramento de CNAE (${emp.cnaePrincipalDetalhado?.descricao || emp.segmento || 'Serviços Funerários/Cemiteriais'}) e palavras-chave regulatórias.`;
      impacto = `Ato afeta diretamente as operações de ${emp.nome || emp.razaoSocial} na jurisdição ${mun || 'PA'}.`;
    } else if (matchLocal && (hasFuneralKeywords || hasEnvironmental)) {
      matchEmpresa = true;
      scoreRelevancia += 30;
      motivo = `Jurisdição aplicável (${mun || 'PA'}) com impacto sobre licenciamento e diretrizes municipais.`;
      impacto = `Possível impacto em licenças e rotinas fiscais municipais.`;
    } else if (fullText.includes('reforma tributária') || fullText.includes('ibs') || fullText.includes('cbs')) {
      matchEmpresa = true;
      scoreRelevancia += 20;
      motivo = 'Norma tributária estrutural de abrangência nacional aplicável ao faturamento corporativo.';
      impacto = 'Necessidade de adaptação das regras fiscais no TOTVS Protheus e alíquotas futuras.';
    }

    if (matchEmpresa) {
      empresasAfetadas.push({
        empresaId: emp.id,
        razaoSocial: emp.razaoSocial || emp.nome,
        motivo,
        impacto,
      });

      aplicabilidades.push({
        empresaId: emp.id,
        empresaNome: emp.razaoSocial || emp.nome,
        segmento: emp.segmento || 'Serviços',
        status: scoreRelevancia > 60 ? 'CONFIRMADA' : 'POSSIVEL_IMPACTO',
        impactoEspecifico: impacto,
        motivo,
        acaoSugerida: 'Adequar rotinas e homologar conformidade operacional.',
        dataAnalise: new Date().toISOString().slice(0, 10),
      });
    }
  });

  // Se nenhuma empresa deu match direto, mas o texto contém termos funerários ou tributários, vincula ao Recanto da Saudade como default monitorado
  if (empresasAfetadas.length === 0 && empresasCadastradas.length > 0) {
    const recanto = empresasCadastradas.find((e) => e.id === 'recanto-da-saudade') || empresasCadastradas[0];
    const hasAnySectorMatch = Object.values(DICIONARIO_SETORES).some((s) => s.keywords.some((k) => fullText.includes(k)));
    if (hasAnySectorMatch) {
      scoreRelevancia += 25;
      empresasAfetadas.push({
        empresaId: recanto.id,
        razaoSocial: recanto.razaoSocial || recanto.nome,
        motivo: 'Monitoramento preventivo por correlação setorial e tributária com o grupo OHANA.',
        impacto: 'Avaliação de risco preventivo na operação do grupo.',
      });
      aplicabilidades.push({
        empresaId: recanto.id,
        empresaNome: recanto.razaoSocial || recanto.nome,
        segmento: recanto.segmento || 'Serviços',
        status: 'POSSIVEL_IMPACTO',
        impactoEspecifico: 'Impacto indireto ou monitoramento preventivo de mercado.',
        motivo: 'Regra setorial geral.',
        acaoSugerida: 'Acompanhar desdobramentos e jurisprudência.',
        dataAnalise: new Date().toISOString().slice(0, 10),
      });
    }
  }

  // 2. Mapear Diretorias Responsáveis
  const diretoriasSet = new Set<DiretoriaCodigo>();

  if (fullText.includes('tribut') || fullText.includes('iss') || fullText.includes('ibs') || fullText.includes('cbs') || fullText.includes('caixa') || fullText.includes('selic')) {
    diretoriasSet.add('CFO');
  }
  if (fullText.includes('protheus') || fullText.includes('totvs') || fullText.includes('tss') || fullText.includes('api') || fullText.includes('sistema')) {
    diretoriasSet.add('CTO');
  }
  if (fullText.includes('lei') || fullText.includes('decreto') || fullText.includes('liminar') || fullText.includes('processo') || fullText.includes('stf') || fullText.includes('tj')) {
    diretoriasSet.add('CLO');
  }
  if (fullText.includes('esocial') || fullText.includes('fgts') || fullText.includes('trabalh') || fullText.includes('mte') || fullText.includes('salário')) {
    diretoriasSet.add('CHRO');
  }
  if (fullText.includes('licit') || fullText.includes('pncp') || fullText.includes('concorrente') || fullText.includes('preço') || fullText.includes('expansão')) {
    diretoriasSet.add('CRO');
    diretoriasSet.add('COO');
  }
  if (fullText.includes('compliance') || fullText.includes('sanção') || fullText.includes('tcu') || fullText.includes('cgu') || fullText.includes('antissuborno')) {
    diretoriasSet.add('CCO');
  }
  if (fullText.includes('ambiental') || fullText.includes('semas') || fullText.includes('conama') || fullText.includes('cemitério') || fullText.includes('crematório')) {
    diretoriasSet.add('COO');
    diretoriasSet.add('CLO');
  }
  if (fullText.includes('segurança') || fullText.includes('lgpd') || fullText.includes('vazamento') || fullText.includes('cve')) {
    diretoriasSet.add('CISO');
  }
  if (fullText.includes('inteligência artificial') || fullText.includes('llm') || fullText.includes('gemini') || fullText.includes('chatgpt') || fullText.includes('deepmind')) {
    diretoriasSet.add('NAYA');
  }

  // Se score alto ou impacta estratégia geral, inclui CEO
  if (scoreRelevancia >= 60 || diretoriasSet.size >= 3) {
    diretoriasSet.add('CEO');
  }
  if (diretoriasSet.size === 0) {
    diretoriasSet.add('CFO');
    diretoriasSet.add('CLO');
  }

  const diretoriasDestino = Array.from(diretoriasSet);

  // 3. Avaliar Urgência e Severidade
  let nivelUrgencia: NivelUrgencia = 'MEDIO';
  let nivelRisco: NivelRisco = 'MEDIO';

  const isCriticalWord = /multa|interdição|prazo fatal|imediato|revogação|urgente|bloqueio|penalidade|inconstitucional|paralisação/i.test(fullText);
  const isHighWord = /obrigatório|vigência|decreto|notificação|auditoria|fiscalização|alteração|prazo/i.test(fullText);

  if (isCriticalWord || scoreRelevancia >= 75) {
    nivelUrgencia = 'CRITICO';
    nivelRisco = 'CRITICO';
    scoreRelevancia = Math.min(100, scoreRelevancia + 20);
  } else if (isHighWord || scoreRelevancia >= 50) {
    nivelUrgencia = 'ALTO';
    nivelRisco = 'ALTO';
    scoreRelevancia = Math.min(95, scoreRelevancia + 10);
  } else {
    nivelUrgencia = 'MEDIO';
    nivelRisco = 'MEDIO';
  }

  // 4. Determinar se Exige Decisão do Rubinho (Presidente)
  // Regra: se atinge o Recanto da Saudade ou empresas do grupo com urgência CRÍTICA ou impacto financeiro/operacional ou prazo fatal
  const exigeDecisaoRubinho =
    nivelUrgencia === 'CRITICO' ||
    (nivelUrgencia === 'ALTO' && (fullText.includes('semas') || fullText.includes('multa') || fullText.includes('investimento') || fullText.includes('bloqueio')));

  // 5. Gerar pareceres da Tríade de Agentes
  const hojeStr = new Date().toLocaleDateString('pt-BR');
  const triade: TriadeAgentes = {
    executor: {
      nome: 'Agente Operacional (Executor)',
      parecer: `Recomenda-se acionar imediatamente as diretorias ${diretoriasDestino.join(', ')} para mapeamento de rotinas operacionais impactadas, verificação de compatibilidade documental e teste de regras no ERP TOTVS Protheus.`,
      timestamp: hojeStr,
    },
    revisor: {
      nome: 'Agente Regulatório (Revisor)',
      parecer: `Conformidade técnica verificada na fonte oficial (${raw.orgao || raw.fonteOrigem || 'DOU'}). Prazo legal e requisitos de integridade jurídica auditados de acordo com os padrões OHANA.`,
      timestamp: hojeStr,
    },
    critico: {
      nome: 'Advogado do Diabo (Crítico)',
      contraPontos: `Atenção: Ações precipitadas de customização no Protheus sem prévia publicação de guia oficial da SEFA/Prefeitura podem gerar retrabalho ou contingência fiscal desnecessária. Avaliar se o custo de adaptação supera a tolerância do grupo.`,
      parecer: `Exige atenção executiva para evitar custos inflados de consultoria externa.`,
      timestamp: hojeStr,
    },
  };

  // 6. Gerar Ações Sugeridas
  const statusAcaoInicial: StatusAcao = 'ABERTA';
  const acoesSugeridas: Partial<FiscalAcao>[] = [];
  if (nivelUrgencia === 'CRITICO' || nivelUrgencia === 'ALTO') {
    acoesSugeridas.push({
      id: `acao-${Date.now()}-1`,
      titulo: `Plano de Conformidade: ${raw.titulo.slice(0, 80)}...`,
      acao: `Elaborar parecer conclusivo e adequar processos internos para atender ao ato normativo ${raw.numeroAto || ''}.`,
      status: statusAcaoInicial,
      area: diretoriasDestino[0] === 'CFO' ? 'FISCAL' : 'JURIDICO',
      responsavel: `${diretoriasDestino[0]} Executivo`,
      prazoLegal: '2026-10-31',
      prazoInterno: '2026-10-15',
      prazoLimite: '15/10/2026',
      diasRestantes: 28,
      risco: nivelRisco,
    });
  }

  // 7. Montar o objeto completo FiscalNoticia
  const statusAtualidadeInicial: StatusAtualidade = 'NOVO_HOJE';
  const novaNoticia: FiscalNoticia = {
    id: `ohana-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    titulo: raw.ato && raw.numeroAto ? `[${raw.ato} ${raw.numeroAto}] ${raw.titulo}` : raw.titulo,
    resumo: raw.texto.length > 300 ? `${raw.texto.slice(0, 300)}...` : raw.texto,
    oQueMudou: raw.texto.slice(0, 450),
    orgaoEmissor: raw.orgao || raw.fonteOrigem || 'Órgão Oficial',
    ato: raw.ato || 'Ato Normativo',
    numeroAto: raw.numeroAto || 'S/N',
    dataPublicacao: raw.dataPublicacao || hojeStr,
    dataRadar: new Date().toISOString().slice(0, 10),
    dataAtualizacao: hojeStr,
    statusJuridico: 'VIGENTE',
    statusAtualidade: statusAtualidadeInicial,
    nivelUrgencia,
    nivelRisco,
    scoreRelevancia: Math.min(100, Math.max(15, scoreRelevancia)),
    diretoriasResponsaveis: diretoriasDestino,
    diretoriaPrincipal: diretoriasDestino[0] || 'CEO',
    decisaoRubinhoExigida: exigeDecisaoRubinho,
    decisaoRubinho: exigeDecisaoRubinho
      ? {
          status: 'PENDENTE',
          autor: 'Rubinho (Presidente)',
        }
      : undefined,
    aplicabilidadesEmpresas: aplicabilidades,
    fontePrincipal: {
      tipo: 'ATO_OFICIAL',
      nome: raw.orgao || raw.fonteOrigem || 'Diário Oficial da União',
      url: raw.urlFonte || 'https://www.in.gov.br',
      orgao: raw.orgao || 'Imprensa Nacional',
      verificada: true,
    },
    impactoGeral: raw.texto.length > 200 ? `${raw.texto.slice(0, 200)}...` : raw.texto,
    impactoFunerario: empresasAfetadas.length > 0 ? empresasAfetadas[0].impacto : 'Avaliação contínua.',
    subsegmentosFunerariosAfetados: hasFuneralKeywords ? ['Funerárias', 'Cemitérios'] : [],
    impactoProtheus: fullText.includes('protheus') ? 'Impacto direto em regras do ERP TOTVS Protheus.' : 'Sem impacto direto identificado no Protheus.',
    protheusModulosAfetados: fullText.includes('protheus') ? ['Configurador de Tributos', 'TES', 'NFS-e'] : [],
    protheusParametrizacaoNecessaria: fullText.includes('protheus'),
    triadeAgentes: triade,
    urlFonteOriginal: raw.urlFonte,
    fonteId: raw.fonteOrigem || 'fonte-dou-imprensa',
    palavrasChave: Array.from(new Set([...diretoriasDestino, raw.orgao || '', 'OHANA Monitor'])),
    acoesVinculadas: acoesSugeridas as FiscalAcao[],
    protheusModulos: fullText.includes('protheus') ? ['Configurador de Tributos', 'TES', 'NFS-e'] : [],
    protheusNecessario: fullText.includes('protheus'),
    historicoAuditoria: [
      {
        data: new Date().toISOString().replace('T', ' ').slice(0, 16),
        usuario: 'Motor de Relevância OHANA (Automático)',
        acaoRealizada: `Ingestão e classificação com Score de Relevância ${scoreRelevancia}/100. Diretorias: ${diretoriasDestino.join(', ')}.`,
      },
    ],
  };

  return {
    noticia: novaNoticia,
    scoreRelevancia,
    passouFiltro: scoreRelevancia >= 25,
    empresasAfetadas,
    diretoriasDestino,
    exigeDecisaoRubinho,
    acoesSugeridas,
  };
}
