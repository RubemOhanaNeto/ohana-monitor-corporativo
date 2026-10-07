import { FC, useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Briefcase,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  ShieldCheck,
  Building,
  Tag,
  Cpu,
  Layers,
  FileText,
  Filter,
  ArrowRight,
  Sparkles,
  HelpCircle,
  XCircle,
  Trash2,
  Plus,
  PlusCircle,
  Save,
  AlertOctagon,
  AlertCircle,
  X,
  Check,
  CreditCard,
  Download,
  RefreshCw,
  Globe,
  DollarSign,
  FileSpreadsheet,
  History,
  BarChart3,
  ShieldAlert,
  TrendingUp,
  Calculator,
  Server,
} from 'lucide-react';
import { FiscalNoticia, EmpresaPerfil, AplicabilidadeEmpresaStatus } from '../types';
import { formatarData } from '../utils/formatters';
import { CartaoCnpjOficial } from './CartaoCnpjOficial';
import { GraficoAcoesPorEmpresa } from './GraficoAcoesPorEmpresa';
import { ModalHistoricoEmpresas, EmpresaHistoricoLog } from './ModalHistoricoEmpresas';
import { ResumoExecutivoEmpresas } from './ResumoExecutivoEmpresas';
import { FormTooltip } from './FormTooltip';
import { CalculadoraPilotoCbs } from './CalculadoraPilotoCbs';
import { motion, AnimatePresence } from 'motion/react';

interface ModuloEmpresasProps {
  noticias: FiscalNoticia[];
  onSelectNoticia: (noticia: FiscalNoticia) => void;
  selectedEmpresaId: string | null;
  onSelectEmpresa: (empresaId: string | null) => void;
  empresas: EmpresaPerfil[];
  onCadastrarEmpresa: (empresa: EmpresaPerfil) => void;
  onExcluirEmpresa: (empresaId: string) => void;
  initialSubTab?: 'dossie' | 'cartao-cnpj' | 'matriz-normas' | 'acoes' | 'comparador' | 'cadastro' | 'grafico-acoes' | 'calculadora-cbs';
}

export const ModuloEmpresas: FC<ModuloEmpresasProps> = ({
  noticias,
  onSelectNoticia,
  selectedEmpresaId,
  onSelectEmpresa,
  empresas,
  onCadastrarEmpresa,
  onExcluirEmpresa,
  initialSubTab,
}) => {
  const activeEmpresaId = selectedEmpresaId || (empresas.length > 0 ? empresas[0].id : '');
  const activeEmpresa = empresas.find((e) => e.id === activeEmpresaId) || empresas[0] || null;

  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  const [buscaTermo, setBuscaTermo] = useState<string>('');
  const [buscaEmpresaCards, setBuscaEmpresaCards] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<
    'dossie' | 'cartao-cnpj' | 'matriz-normas' | 'acoes' | 'comparador' | 'cadastro' | 'grafico-acoes' | 'calculadora-cbs'
  >(initialSubTab || 'dossie');

  // Filtragem em tempo real dos cards de empresas por nome ou setor
  const empresasFiltradas = useMemo(() => {
    if (!buscaEmpresaCards.trim()) return empresas;
    const termo = buscaEmpresaCards.toLowerCase();
    return empresas.filter(
      (emp) =>
        emp.nome.toLowerCase().includes(termo) ||
        emp.razaoSocial.toLowerCase().includes(termo) ||
        emp.cnpj.toLowerCase().includes(termo) ||
        emp.segmento.toLowerCase().includes(termo) ||
        emp.atividadesPrincipais?.some((a) => a.toLowerCase().includes(termo)) ||
        emp.cnaes?.some((c) => c.toLowerCase().includes(termo))
    );
  }, [empresas, buscaEmpresaCards]);

  // Modal de Histórico de Alterações
  const [modalHistoricoAberto, setModalHistoricoAberto] = useState(false);
  const [historicoLogs, setHistoricoLogs] = useState<EmpresaHistoricoLog[]>(() => {
    try {
      const salvo = localStorage.getItem('ohana_empresas_historico_audit');
      if (salvo) return JSON.parse(salvo);
    } catch (e) {
      console.warn('Erro ao carregar histórico de empresas do localStorage', e);
    }
    return [
      {
        id: 'log-1',
        dataHora: '17/09/2026 09:30:15',
        tipo: 'INCLUSAO',
        empresaId: 'recanto-da-saudade',
        nome: 'Recanto',
        cnpj: '04.709.150/0001-20',
        razaoSocial: 'Recanto da Saudade Cemitério Parque Ltda.',
        usuario: 'Rubinho (rubinhohana@gmail.com)',
        detalhes: 'Cadastro inicial no Radar Fiscal com CNAE 9603-3/01 e integração TOTVS Protheus 12.',
        regimeTributario: 'LUCRO_PRESUMIDO',
        segmento: 'Cemitério Parque, Cremação & Planos Funerários',
      },
      {
        id: 'log-2',
        dataHora: '17/09/2026 14:22:40',
        tipo: 'INCLUSAO',
        empresaId: 'instituto-go',
        nome: 'INSTITUTO GO',
        cnpj: '46.969.307/0001-04',
        razaoSocial: 'INSTITUTO GO EDUCACAO E DESENVOLVIMENTO HUMANO LTDA',
        usuario: 'Rubinho (rubinhohana@gmail.com)',
        detalhes: 'Inclusão da entidade educacional e de desenvolvimento humano para monitoramento de ISS e LC 116.',
        regimeTributario: 'SIMPLES_NACIONAL',
        segmento: 'Treinamento, Desenvolvimento Profissional & Educação Continuada',
      },
    ];
  });

  const registrarLogHistorico = (
    tipo: 'INCLUSAO' | 'EXCLUSAO' | 'ATUALIZACAO',
    emp: Partial<EmpresaPerfil>,
    detalhes: string
  ) => {
    const novoLog: EmpresaHistoricoLog = {
      id: `log-${Date.now()}`,
      dataHora: new Date().toLocaleString('pt-BR'),
      tipo,
      empresaId: emp.id || `emp-${Date.now()}`,
      nome: emp.nome || 'Nova Empresa',
      cnpj: emp.cnpj || '00.000.000/0000-00',
      razaoSocial: emp.razaoSocial || emp.nome || '',
      usuario: 'Rubinho (rubinhohana@gmail.com)',
      detalhes,
      regimeTributario: emp.regimeTributario,
      segmento: emp.segmento,
    };
    setHistoricoLogs((prev) => {
      const atualizado = [novoLog, ...prev];
      try {
        localStorage.setItem('ohana_empresas_historico_audit', JSON.stringify(atualizado));
      } catch (e) {
        console.warn('Erro ao salvar auditoria no localStorage', e);
      }
      return atualizado;
    });
  };

  // Cálculo detalhado de Ações Pendentes e Críticas por Empresa
  const metricasPorEmpresa = useMemo(() => {
    const mapa: Record<string, { total: number; criticas: number; pendentes: number; concluidas: number; normas: number }> = {};
    empresas.forEach((emp) => {
      const acoes = noticias.flatMap((n) =>
        n.acoesVinculadas.filter(
          (a) =>
            a.empresaId === emp.id ||
            (!a.empresaId && (emp.id === 'recanto-da-saudade' || emp.id === 'recanto'))
        )
      );
      const criticas = acoes.filter(
        (a) =>
          a.status !== 'CONCLUIDA' &&
          (a.risco === 'CRITICO' || a.risco === 'ALTO' || (a.diasRestantes != null && a.diasRestantes <= 2))
      ).length;
      const pendentes = acoes.filter((a) => a.status === 'ABERTA' || a.status === 'EM_ANDAMENTO').length;
      const concluidas = acoes.filter((a) => a.status === 'CONCLUIDA').length;
      const normas = noticias.filter((n) =>
        n.aplicabilidadesEmpresas?.some((ap) => ap.empresaId === emp.id && ap.status !== 'NAO_APLICAVEL')
      ).length;

      mapa[emp.id] = { total: acoes.length, criticas, pendentes, concluidas, normas };
    });
    return mapa;
  }, [empresas, noticias]);

  // Exportar lista de empresas em CSV para auditoria externa
  const handleExportarEmpresasCsv = () => {
    const cabecalhos = [
      'ID',
      'Nome Fantasia',
      'Razão Social',
      'CNPJ',
      'Situação Cadastral',
      'Regime Tributário',
      'Segmento',
      'UF',
      'Municípios',
      'CNAE Principal',
      'Sistema ERP',
      'Total Normas Aplicáveis',
      'Total Ações',
      'Ações Críticas / Urgentes',
      'Ações Pendentes',
      'Ações Concluídas',
      'Status de Conformidade',
    ];

    const linhas = empresas.map((emp) => {
      const stats = metricasPorEmpresa[emp.id] || { total: 0, criticas: 0, pendentes: 0, concluidas: 0, normas: 0 };
      const statusRisco = stats.criticas > 0 ? 'CRÍTICO - PENDÊNCIAS URGENTES' : stats.pendentes > 0 ? 'ATENÇÃO - EM ANDAMENTO' : 'REGULAR - CONFORME';

      return [
        `"${emp.id}"`,
        `"${emp.nome.replace(/"/g, '""')}"`,
        `"${emp.razaoSocial.replace(/"/g, '""')}"`,
        `"${emp.cnpj}"`,
        `"${emp.situacaoCadastral || 'ATIVA'}"`,
        `"${emp.regimeTributario}"`,
        `"${emp.segmento.replace(/"/g, '""')}"`,
        `"${emp.localidades.uf}"`,
        `"${emp.localidades.municipios.join(', ').replace(/"/g, '""')}"`,
        `"${(emp.cnaes[0] || '').replace(/"/g, '""')}"`,
        `"${emp.sistemasUtilizados.join(', ').replace(/"/g, '""')}"`,
        stats.normas,
        stats.total,
        stats.criticas,
        stats.pendentes,
        stats.concluidas,
        `"${statusRisco}"`,
      ];
    });

    const conteudoCsv = '\uFEFF' + [cabecalhos.join(';'), ...linhas.map((l) => l.join(';'))].join('\r\n');
    const blob = new Blob([conteudoCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `auditoria-empresas-ohana-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setFormFeedback('✅ Arquivo CSV exportado com sucesso para auditoria externa!');
    setTimeout(() => setFormFeedback(null), 4000);
  };

  // Sincronizar sub-aba caso recebida externamente
  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Registration form state
  const [novoNome, setNovoNome] = useState('');
  const [novaRazaoSocial, setNovaRazaoSocial] = useState('');
  const [novoCnpj, setNovoCnpj] = useState('');
  const [novoSegmento, setNovoSegmento] = useState('Serviços Funerários e Cemiteriais');
  const [novoRegime, setNovoRegime] = useState<'SIMPLES_NACIONAL' | 'LUCRO_PRESUMIDO' | 'LUCRO_REAL' | 'MEI'>('LUCRO_PRESUMIDO');
  const [novaUf, setNovaUf] = useState('DF');
  const [novoMunicipio, setNovoMunicipio] = useState('Brasília');
  const [novoSistema, setNovoSistema] = useState('TOTVS Protheus 12');
  const [novoCnaePrincipal, setNovoCnaePrincipal] = useState('9603-3/04 - Serviços de sepultamento e somatoconservação');
  const [novosCnaesSecundarios, setNovosCnaesSecundarios] = useState<string[]>([
    '9603-3/01 - Gestão e manutenção de cemitérios',
  ]);
  const [inputCnaeSecundario, setInputCnaeSecundario] = useState('');
  const [novasPalavrasChave, setNovasPalavrasChave] = useState<string[]>(['IBS', 'CBS', 'ISS', 'sepultamento', 'jazigo']);
  const [inputPalavraChave, setInputPalavraChave] = useState('');
  const [novaDescricao, setNovaDescricao] = useState('');
  const [formFeedback, setFormFeedback] = useState<string | null>(null);

  // CNPJ Automated Lookup State
  const [isConsultandoCnpj, setIsConsultandoCnpj] = useState(false);
  const [consultaCnpjErro, setConsultaCnpjErro] = useState<string | null>(null);
  const [novoCapitalSocial, setNovoCapitalSocial] = useState<number>(4500000);
  const [novoFaturamentoAnual, setNovoFaturamentoAnual] = useState<number>(18500000);
  const [novoFaturamentoMensal, setNovoFaturamentoMensal] = useState<number>(1541660);
  const [novoPorte, setNovoPorte] = useState<string>('DEMAIS (MÉDIO / GRANDE)');
  const [novoNaturezaJuridica, setNovoNaturezaJuridica] = useState<string>('206-2 - Sociedade Empresária Limitada');
  const [novoLogradouro, setNovoLogradouro] = useState<string>('');
  const [novoNumero, setNovoNumero] = useState<string>('');
  const [novoBairro, setNovoBairro] = useState<string>('');
  const [novoCep, setNovoCep] = useState<string>('');
  const [novoTelefone, setNovoTelefone] = useState<string>('');
  const [novoEmail, setNovoEmail] = useState<string>('');
  const [novoQsa, setNovoQsa] = useState<any[]>([]);

  // Deletion state
  const [empresaParaExcluir, setEmpresaParaExcluir] = useState<EmpresaPerfil | null>(null);

  // Consulta automática de dados via CNPJ (BrasilAPI / Receita Federal)
  const handleConsultarCnpj = async (cnpjParaConsultar?: string) => {
    const cnpjLimpo = (cnpjParaConsultar || novoCnpj).replace(/\D/g, '');
    if (!cnpjLimpo || cnpjLimpo.length < 8) {
      setConsultaCnpjErro('Por favor, digite um CNPJ válido com até 14 dígitos numéricos.');
      setTimeout(() => setConsultaCnpjErro(null), 4000);
      return;
    }

    setIsConsultandoCnpj(true);
    setConsultaCnpjErro(null);

    try {
      const res = await fetch(`/api/consulta-cnpj/${cnpjLimpo}`);
      if (!res.ok) {
        throw new Error('Falha ao consultar CNPJ');
      }
      const data = await res.json();

      if (data.nome_fantasia || data.razao_social) {
        setNovoNome(data.nome_fantasia || data.razao_social);
      }
      if (data.razao_social) {
        setNovaRazaoSocial(data.razao_social);
      }
      if (data.cnpj_formatado || data.cnpj) {
        setNovoCnpj(data.cnpj_formatado || data.cnpj);
      }
      if (data.uf) setNovaUf(data.uf);
      if (data.municipio) setNovoMunicipio(data.municipio);
      if (data.logradouro) setNovoLogradouro(data.logradouro);
      if (data.numero) setNovoNumero(data.numero);
      if (data.bairro) setNovoBairro(data.bairro);
      if (data.cep) setNovoCep(data.cep);
      if (data.ddd_telefone_1) setNovoTelefone(data.ddd_telefone_1);
      if (data.email) setNovoEmail(data.email);
      if (data.porte) setNovoPorte(data.porte);
      if (data.natureza_juridica) setNovoNaturezaJuridica(data.natureza_juridica);
      if (data.capital_social) setNovoCapitalSocial(Number(data.capital_social));
      if (data.faturamentoAnualEstimado) setNovoFaturamentoAnual(Number(data.faturamentoAnualEstimado));
      if (data.faturamentoMensalEstimado) setNovoFaturamentoMensal(Number(data.faturamentoMensalEstimado));

      if (data.qsa && Array.isArray(data.qsa)) {
        setNovoQsa(data.qsa);
      }

      if (data.cnae_fiscal) {
        const cnaePrincipalStr = `${data.cnae_fiscal} - ${data.cnae_fiscal_descricao || 'Atividade principal'}`;
        setNovoCnaePrincipal(cnaePrincipalStr);
      }

      if (data.cnaes_secundarios && Array.isArray(data.cnaes_secundarios)) {
        const secunds = data.cnaes_secundarios.map(
          (c: any) => `${c.codigo} - ${c.descricao}`
        );
        setNovosCnaesSecundarios(secunds);
      }

      if (data.opcao_pelo_simples) {
        setNovoRegime('SIMPLES_NACIONAL');
      } else if (data.capital_social && Number(data.capital_social) > 5000000) {
        setNovoRegime('LUCRO_REAL');
      } else {
        setNovoRegime('LUCRO_PRESUMIDO');
      }

      if (data.cnae_fiscal_descricao) {
        setNovoSegmento(data.cnae_fiscal_descricao);
        setNovaDescricao(
          `Empresa com atuação em ${data.cnae_fiscal_descricao}, fundada em ${data.data_inicio_atividade || '2015'}. Localizada em ${data.municipio}/${data.uf}.`
        );
      }

      const keywords: string[] = ['Tributação', 'ISS', 'PIS/COFINS'];
      if (data.cnae_fiscal_descricao?.toLowerCase().includes('funer')) {
        keywords.push('sepultamento', 'cremação', 'jazigo', 'reforma tributária', 'LC 116 item 25');
      } else {
        keywords.push('serviços', 'lucro presumido', 'IBS', 'CBS');
      }
      setNovasPalavrasChave(keywords);

      setFormFeedback(`✅ Dados do CNPJ "${data.razao_social}" carregados automaticamente com sucesso!`);
      setTimeout(() => setFormFeedback(null), 5000);
    } catch (err) {
      setConsultaCnpjErro('Não foi possível obter dados para o CNPJ informado. Verifique os dígitos e tente novamente.');
      setTimeout(() => setConsultaCnpjErro(null), 4000);
    } finally {
      setIsConsultandoCnpj(false);
    }
  };

  // Filter news that have applicability defined for the active company
  const normasComAplicabilidade = noticias.map((n) => {
    const aplic = activeEmpresa ? n.aplicabilidadesEmpresas?.find((a) => a.empresaId === activeEmpresa.id) : undefined;
    return {
      noticia: n,
      aplicabilidade: aplic,
    };
  });

  const normasFiltradas = normasComAplicabilidade.filter(({ noticia, aplicabilidade }) => {
    // If filter status is set
    if (filtroStatus !== 'TODOS') {
      if (filtroStatus === 'SEM_CLASSIFICACAO') {
        if (aplicabilidade) return false;
      } else {
        if (!aplicabilidade || aplicabilidade.status !== filtroStatus) return false;
      }
    }

    if (buscaTermo) {
      const q = buscaTermo.toLowerCase();
      const matchTitulo = noticia.titulo.toLowerCase().includes(q);
      const matchResumo = (noticia.resumo || noticia.oQueMudou || '').toLowerCase().includes(q);
      const matchMotivo = aplicabilidade?.motivo.toLowerCase().includes(q);
      const matchImpacto = aplicabilidade?.impactoEspecifico.toLowerCase().includes(q);
      const matchPalavras = noticia.palavrasChave?.some((p) => p.toLowerCase().includes(q));
      if (!matchTitulo && !matchResumo && !matchMotivo && !matchImpacto && !matchPalavras) {
        return false;
      }
    }

    return true;
  });

  // Actions linked to this company
  const acoesDaEmpresa = noticias
    .flatMap((n) =>
      n.acoesVinculadas
        .filter((a) => (activeEmpresa ? a.empresaId === activeEmpresa.id || (!a.empresaId && (activeEmpresa.id === 'recanto-da-saudade' || activeEmpresa.id === 'recanto')) : false))
        .map((a) => ({ ...a, noticiaRef: n }))
    );

  const handleAdicionarCnaeSecundario = () => {
    if (!inputCnaeSecundario.trim()) return;
    if (!novosCnaesSecundarios.includes(inputCnaeSecundario.trim())) {
      setNovosCnaesSecundarios([...novosCnaesSecundarios, inputCnaeSecundario.trim()]);
    }
    setInputCnaeSecundario('');
  };

  const handleRemoverCnaeSecundario = (cnae: string) => {
    setNovosCnaesSecundarios(novosCnaesSecundarios.filter((c) => c !== cnae));
  };

  const handleAdicionarPalavraChave = () => {
    if (!inputPalavraChave.trim()) return;
    if (!novasPalavrasChave.includes(inputPalavraChave.trim())) {
      setNovasPalavrasChave([...novasPalavrasChave, inputPalavraChave.trim()]);
    }
    setInputPalavraChave('');
  };

  const handleRemoverPalavraChave = (palavra: string) => {
    setNovasPalavrasChave(novasPalavrasChave.filter((p) => p !== palavra));
  };

  const handleSubmitNovoCadastro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim() || !novoCnpj.trim()) {
      setFormFeedback('Por favor, preencha o Nome Fantasia e o CNPJ da empresa.');
      setTimeout(() => setFormFeedback(null), 4000);
      return;
    }

    const novaEmpresaId = novoNome
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 30) + '-' + Date.now().toString().slice(-4);

    const novaEmpresa: EmpresaPerfil = {
      id: novaEmpresaId,
      nome: novoNome.trim(),
      razaoSocial: novaRazaoSocial.trim() || novoNome.trim(),
      segmento: novoSegmento.trim(),
      cnpj: novoCnpj.trim(),
      regimeTributario: novoRegime,
      capitalSocial: novoCapitalSocial,
      faturamentoAnualEstimado: novoFaturamentoAnual,
      faturamentoMensalEstimado: novoFaturamentoMensal,
      porte: novoPorte,
      naturezaJuridica: novoNaturezaJuridica,
      situacaoCadastral: 'ATIVA',
      dataAbertura: '10/05/2014',
      endereco: novoLogradouro ? {
        logradouro: novoLogradouro,
        numero: novoNumero || 'S/N',
        bairro: novoBairro || 'Centro',
        cep: novoCep || '70000-000',
        municipio: novoMunicipio.trim(),
        uf: novaUf.trim().toUpperCase(),
      } : undefined,
      contato: (novoTelefone || novoEmail) ? {
        telefone: novoTelefone || undefined,
        email: novoEmail || undefined,
      } : undefined,
      qsa: novoQsa.length > 0 ? novoQsa : undefined,
      localidades: {
        uf: novaUf.trim().toUpperCase(),
        municipios: [novoMunicipio.trim()],
      },
      sistemasUtilizados: [novoSistema.trim()],
      cnaes: [novoCnaePrincipal.trim(), ...novosCnaesSecundarios].filter(Boolean),
      palavrasChaveMonitoradas: novasPalavrasChave,
      atividadesPrincipais: [novoSegmento.trim()],
      descricaoAtividade: novaDescricao.trim(),
    };

    onCadastrarEmpresa(novaEmpresa);
    onSelectEmpresa(novaEmpresa.id);

    // Registro na trilha de auditoria
    registrarLogHistorico(
      'INCLUSAO',
      novaEmpresa,
      `Inclusão da empresa com regime ${novaEmpresa.regimeTributario.replace('_', ' ')}, CNPJ ${novaEmpresa.cnpj} e ERP ${novaEmpresa.sistemasUtilizados.join(', ')}.`
    );

    // Reset Form
    setNovoNome('');
    setNovaRazaoSocial('');
    setNovoCnpj('');
    setNovaDescricao('');
    setFormFeedback(`Empresa "${novaEmpresa.nome}" cadastrada e ativada no Radar com sucesso!`);
    setTimeout(() => setFormFeedback(null), 4000);
  };

  const handleConfirmarExclusao = () => {
    if (!empresaParaExcluir) return;
    registrarLogHistorico(
      'EXCLUSAO',
      empresaParaExcluir,
      `Exclusão do cadastro da empresa ${empresaParaExcluir.nome} (CNPJ ${empresaParaExcluir.cnpj}) da base e desativação das monitorações fiscais vinculadas.`
    );
    onExcluirEmpresa(empresaParaExcluir.id);
    setEmpresaParaExcluir(null);
  };

  const getStatusBadge = (status?: AplicabilidadeEmpresaStatus) => {
    switch (status) {
      case 'CONFIRMADA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Impacto Confirmado / Aplicável
          </span>
        );
      case 'POSSIVEL_IMPACTO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Possível Impacto
          </span>
        );
      case 'AGUARDANDO_VALIDACAO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Clock className="w-3.5 h-3.5 text-purple-600" />
            Aguardando Validação
          </span>
        );
      case 'A_CLASSIFICAR':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
            A Classificar
          </span>
        );
      case 'NAO_APLICAVEL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
            <XCircle className="w-3.5 h-3.5 text-slate-400" />
            Não Aplicável
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200">
            Não Avaliado para esta Empresa
          </span>
        );
    }
  };

  return (
    <div className="space-y-6" id="modulo-empresas">
      {/* Resumo Executivo no topo com KPIs e Semicircular Gauge de Conformidade */}
      <ResumoExecutivoEmpresas
        empresas={empresas}
        noticias={noticias}
        selectedEmpresaId={selectedEmpresaId}
      />

      {/* Widget Conexão Oficial: Piloto CBS/IBS (Receita Federal) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-xl p-4 border border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Server className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Integração Piloto Reforma Tributária — CBS & IBS
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                API Oficial RFB Conectada
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                piloto-cbs.tributos.gov.br
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulador em tempo real de alíquotas da LC 214/2025, Split Payment bancário D+0 e console Swagger da Receita Federal.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
          <a
            href="https://piloto-cbs.tributos.gov.br/servico/calculadora-consumo/api/swagger-ui/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 transition-colors"
          >
            <span>Swagger UI</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
          <button
            onClick={() => setActiveSubTab('calculadora-cbs')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
              activeSubTab === 'calculadora-cbs'
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/40'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Abrir Calculadora Piloto CBS</span>
          </button>
        </div>
      </div>

      {/* Header with Company Selector Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">
              <Building2 className="w-4 h-4" />
              Gestão Tributária Multi-Empresa & Segmentação
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              Perfil Empresarial e Matriz de Aplicabilidade
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              O assunto existe uma única vez no sistema. A aplicabilidade, impactos, ações e prazos variam conforme o perfil de cada empresa.
            </p>
          </div>

          {/* Action Toolbar: Cadastro, Export CSV, Histórico, Gráfico */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveSubTab('calculadora-cbs')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-xs ${
                activeSubTab === 'calculadora-cbs'
                  ? 'bg-purple-800 text-white ring-2 ring-purple-500/30'
                  : 'bg-purple-700 hover:bg-purple-600 text-white'
              }`}
              title="Simular na Calculadora Oficial Piloto CBS/IBS da Receita Federal"
              id="btn-calculadora-cbs-header"
            >
              <Calculator className="w-3.5 h-3.5 text-purple-200" />
              <span>Piloto CBS/IBS</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
            </button>

            <button
              onClick={() => setActiveSubTab('cadastro')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-xs ${
                activeSubTab === 'cadastro'
                  ? 'bg-emerald-700 text-white ring-2 ring-emerald-500/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
              title="Cadastrar ou excluir empresas no Radar Fiscal"
              id="btn-cadastrar-empresa-header"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Cadastrar Empresa</span>
            </button>

            <button
              onClick={handleExportarEmpresasCsv}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-xs transition-colors"
              title="Exportar dados cadastrais e conformidade em CSV para auditoria externa"
              id="btn-exportar-csv-header"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Exportar CSV</span>
            </button>

            <button
              onClick={() => setModalHistoricoAberto(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-xs transition-colors"
              title="Exibir histórico de alterações e log cronológico de inclusões/exclusões"
              id="btn-historico-alteracoes-header"
            >
              <History className="w-3.5 h-3.5 text-slate-600" />
              <span>Histórico ({historicoLogs.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('grafico-acoes')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors border shadow-xs ${
                activeSubTab === 'grafico-acoes'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
              }`}
              title="Comparativo gráfico do volume de ações e criticidades"
              id="btn-grafico-acoes-header"
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Gráfico de Ações</span>
            </button>
          </div>
        </div>

        {/* Responsive Cards for Company Selector with Hover Animations and Critical Status States */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                Empresas sob Monitoramento ({empresasFiltradas.length} de {empresas.length})
              </span>
              <span className="text-[11px] text-slate-400">
                Selecione um card para focar a análise de aplicabilidade e obrigações
              </span>
            </div>

            {/* Barra de Busca em Tempo Real por Nome ou Setor */}
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={buscaEmpresaCards}
                onChange={(e) => setBuscaEmpresaCards(e.target.value)}
                placeholder="Filtrar por nome, setor ou CNPJ..."
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all placeholder:text-slate-400 font-medium"
                id="input-busca-empresas-cards"
              />
              {buscaEmpresaCards && (
                <button
                  type="button"
                  onClick={() => setBuscaEmpresaCards('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  title="Limpar filtro"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {/* Card "Todas as Empresas" */}
            <div
              onClick={() => {
                onSelectEmpresa(null);
                if (activeSubTab === 'cadastro') setActiveSubTab('matriz-normas');
              }}
              role="button"
              tabIndex={0}
              className={`p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between hover:-translate-y-1 hover:shadow-md ${
                selectedEmpresaId === null
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-emerald-500/20'
                  : 'bg-slate-50/70 hover:bg-white text-slate-700 border-slate-200'
              }`}
              id="card-selector-todas"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${selectedEmpresaId === null ? 'text-emerald-400' : 'text-slate-500'}`}>
                    Visão Consolidada
                  </span>
                  <h4 className="text-sm font-black truncate">Todas as Empresas</h4>
                </div>
                <div className={`p-1.5 rounded-lg ${selectedEmpresaId === null ? 'bg-slate-800 text-emerald-400' : 'bg-white text-slate-600 border border-slate-200'}`}>
                  <Layers className="w-4 h-4" />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/50 flex items-center justify-between text-xs">
                <span className={selectedEmpresaId === null ? 'text-slate-300' : 'text-slate-500'}>
                  {empresas.length} cadastros
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  selectedEmpresaId === null ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-200 text-slate-700'
                }`}>
                  Visão Geral
                </span>
              </div>
            </div>

            {/* Individual Company Cards (Filtrados em tempo real) */}
            {empresasFiltradas.length === 0 ? (
              <div className="col-span-full py-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                <Building className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">
                  Nenhuma empresa encontrada para "{buscaEmpresaCards}".
                </p>
                <button
                  type="button"
                  onClick={() => setBuscaEmpresaCards('')}
                  className="mt-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 underline"
                >
                  Limpar filtro de busca
                </button>
              </div>
            ) : (
              empresasFiltradas.map((emp) => {
              const isSelected = activeEmpresa?.id === emp.id && selectedEmpresaId !== null;
              const stats = metricasPorEmpresa[emp.id] || { total: 0, criticas: 0, pendentes: 0, concluidas: 0, normas: 0 };
              const temCriticas = stats.criticas > 0;

              return (
                <div
                  key={emp.id}
                  onClick={() => {
                    onSelectEmpresa(emp.id);
                    if (activeSubTab === 'cadastro') setActiveSubTab('matriz-normas');
                  }}
                  role="button"
                  tabIndex={0}
                  className={`p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between hover:-translate-y-1 hover:shadow-md relative overflow-hidden ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-emerald-500/20'
                      : temCriticas
                      ? 'bg-rose-50/40 hover:bg-rose-50/70 border-rose-300 text-slate-900 shadow-xs'
                      : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-xs'
                  }`}
                  id={`card-selector-empresa-${emp.id}`}
                >
                  {/* Critical Status Top Bar for companies with critical issues */}
                  {temCriticas && !isSelected && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-red-600 animate-pulse" />
                  )}

                  <div>
                    {/* Top Row: Name and Status Badge */}
                    <div className="flex items-start justify-between gap-1 mb-1.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              emp.id === 'recanto-da-saudade' || emp.id === 'recanto'
                                ? 'bg-emerald-500'
                                : emp.id === 'instituto-go'
                                ? 'bg-sky-500'
                                : 'bg-indigo-500'
                            }`}
                          />
                          <h4 className="text-sm font-bold truncate leading-snug">
                            {emp.nome}
                          </h4>
                        </div>
                        <span className={`text-[11px] block truncate ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                          {emp.razaoSocial}
                        </span>
                      </div>

                      {/* Visual indicator for critical issues or regular state */}
                      {temCriticas ? (
                        <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300 animate-pulse shadow-xs">
                          <ShieldAlert className="w-3 h-3 text-rose-600" />
                          {stats.criticas} CRÍTICA(S)
                        </span>
                      ) : stats.pendentes > 0 ? (
                        <span className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-slate-800 text-amber-300 border border-slate-700' : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          <Clock className="w-3 h-3 text-amber-600" />
                          {stats.pendentes} pendente(s)
                        </span>
                      ) : (
                        <span className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-slate-800 text-emerald-300 border border-slate-700' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Em dia
                        </span>
                      )}
                    </div>

                    {/* Segment and CNPJ */}
                    <div className="flex items-center justify-between text-[10px] py-1 border-t border-slate-200/50 mt-1">
                      <span className={`font-mono ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                        {emp.cnpj}
                      </span>
                      <span className={`font-semibold px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {emp.regimeTributario.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Bottom metrics */}
                  <div className="pt-2 border-t border-slate-200/50 flex items-center justify-between text-[11px] mt-2">
                    <span className={isSelected ? 'text-slate-300' : 'text-slate-600'}>
                      <strong>{stats.normas}</strong> normas aplicáveis
                    </span>
                    <span className={`font-bold ${
                      temCriticas ? (isSelected ? 'text-rose-400' : 'text-rose-700') : (isSelected ? 'text-emerald-400' : 'text-slate-700')
                    }`}>
                      {stats.total} ação(ões)
                    </span>
                  </div>
                </div>
              );
            }))}
          </div>
        </div>

        {/* Selected Company Summary Bar */}
        {activeEmpresa ? (
          <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50/70 p-3.5 rounded-lg">
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">Razão Social & CNPJ</span>
              <span className="text-xs font-bold text-slate-900 block truncate">{activeEmpresa.razaoSocial}</span>
              <span className="text-[11px] text-slate-500 font-mono">{activeEmpresa.cnpj}</span>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 font-medium block">Regime Tributário</span>
              <span className="text-xs font-bold text-slate-900 inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {activeEmpresa.regimeTributario.replace('_', ' ')}
              </span>
              <span className="text-[11px] text-slate-500 block">
                UF: {activeEmpresa.localidades.uf} ({activeEmpresa.localidades.municipios.join(', ')})
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 font-medium block">Sistemas em Uso</span>
              <span className="text-xs font-semibold text-slate-800 block truncate">
                {activeEmpresa.sistemasUtilizados.join(' • ')}
              </span>
              <span className="text-[11px] text-slate-500">
                {activeEmpresa.sistemasUtilizados.includes('TOTVS Protheus') ? 'Módulos Fiscais e TSS' : 'Emissor Padrão'}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 font-medium block">Ações em Aberto</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {acoesDaEmpresa.filter((a) => a.status !== 'CONCLUIDA').length} pendentes
                </span>
                <span className="text-xs text-slate-500">
                  de {acoesDaEmpresa.length} cadastradas
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-5 pt-4 border-t border-slate-100 p-3 bg-amber-50 rounded-lg text-xs text-amber-800 flex items-center justify-between">
            <span>Nenhuma empresa selecionada ou cadastrada. Cadastre uma empresa para monitorar a aplicabilidade.</span>
            <button
              onClick={() => setActiveSubTab('cadastro')}
              className="font-bold underline text-amber-900"
            >
              Cadastrar Agora
            </button>
          </div>
        )}

        {/* Sub-navigation tabs */}
        <div className="flex border-b border-slate-200 mt-5 space-x-4 sm:space-x-6 text-xs sm:text-sm font-medium overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('matriz-normas')}
            className={`pb-2.5 transition-colors border-b-2 whitespace-nowrap ${
              activeSubTab === 'matriz-normas'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Matriz de Normas ({normasComAplicabilidade.filter((n) => n.aplicabilidade?.status === 'CONFIRMADA' || n.aplicabilidade?.status === 'POSSIVEL_IMPACTO').length})
          </button>
          <button
            onClick={() => setActiveSubTab('acoes')}
            className={`pb-2.5 transition-colors border-b-2 whitespace-nowrap ${
              activeSubTab === 'acoes'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Plano de Ações ({acoesDaEmpresa.length})
          </button>
          <button
            onClick={() => setActiveSubTab('dossie')}
            className={`pb-2.5 transition-colors border-b-2 whitespace-nowrap ${
              activeSubTab === 'dossie'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Dossiê & CNAEs
          </button>
          <button
            onClick={() => setActiveSubTab('cartao-cnpj')}
            className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'cartao-cnpj'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
            id="subtab-cartao-cnpj"
          >
            <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cartão CNPJ Oficial</span>
          </button>
          <button
            onClick={() => setActiveSubTab('comparador')}
            className={`pb-2.5 transition-colors border-b-2 whitespace-nowrap ${
              activeSubTab === 'comparador'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Comparador Lado a Lado
          </button>
          <button
            onClick={() => setActiveSubTab('calculadora-cbs')}
            className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'calculadora-cbs'
                ? 'border-purple-600 text-purple-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
            id="subtab-calculadora-cbs"
          >
            <Calculator className="w-3.5 h-3.5 text-purple-600" />
            <span>Piloto CBS/IBS (Receita Federal)</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-800 font-bold">
              Simulador RFB
            </span>
          </button>
          <button
            onClick={() => setActiveSubTab('grafico-acoes')}
            className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'grafico-acoes'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
            id="subtab-grafico-acoes"
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Volume de Ações (Gráfico)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('cadastro')}
            className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'cadastro'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
            id="subtab-cadastro-empresas"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cadastro & Exclusão de Empresas</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700 font-bold">
              {empresas.length}
            </span>
          </button>
        </div>
      </div>

      {/* Sub-tabs Animated Content with Framer Motion */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          {/* SUBTAB 1: MATRIZ DE NORMAS */}
          {activeSubTab === 'matriz-normas' && (
        <div className="space-y-4">
          {/* Filters and search */}
          <div className="bg-white rounded-lg border border-slate-200 p-3.5 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={buscaTermo}
                onChange={(e) => setBuscaTermo(e.target.value)}
                placeholder={`Buscar normas aplicáveis a ${activeEmpresa.nome}...`}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-xs text-slate-500 shrink-0">Filtrar status:</span>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none"
              >
                <option value="TODOS">Todos os status</option>
                <option value="CONFIRMADA">Impacto Confirmado</option>
                <option value="POSSIVEL_IMPACTO">Possível Impacto</option>
                <option value="AGUARDANDO_VALIDACAO">Aguardando Validação</option>
                <option value="NAO_APLICAVEL">Não Aplicável</option>
              </select>
            </div>
          </div>

          {/* List of items */}
          <div className="grid grid-cols-1 gap-4">
            {normasFiltradas.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <p className="text-sm text-slate-500">Nenhuma publicação encontrada para os filtros selecionados.</p>
              </div>
            ) : (
              normasFiltradas.map(({ noticia, aplicabilidade }) => {
                return (
                  <div
                    key={noticia.id}
                    className="bg-white rounded-xl border border-slate-200 p-5 hover:border-emerald-300 transition-shadow shadow-xs flex flex-col md:flex-row md:items-start justify-between gap-5"
                  >
                    <div className="flex-1 space-y-3">
                      {/* Top badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        {getStatusBadge(aplicabilidade?.status)}
                        <span className="text-xs text-slate-500 font-medium">
                          {noticia.orgao} • {noticia.numeroAto}
                        </span>
                        <span className="text-xs text-slate-400">
                          Publicado em {formatarData(noticia.dataPublicacao)}
                        </span>
                      </div>

                      {/* Title */}
                      <h3
                        onClick={() => onSelectNoticia(noticia)}
                        className="text-base font-bold text-slate-900 hover:text-emerald-600 cursor-pointer transition-colors"
                      >
                        {noticia.titulo}
                      </h3>

                      {/* Specific applicability block for this company */}
                      {aplicabilidade ? (
                        <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3.5 space-y-2 text-xs">
                          <div>
                            <span className="font-bold text-slate-700">Motivo da Classificação para {activeEmpresa.nome}: </span>
                            <span className="text-slate-600">{aplicabilidade.motivo}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-700">Impacto Operacional Específico: </span>
                            <span className="text-slate-600">{aplicabilidade.impactoEspecifico}</span>
                          </div>
                          <div>
                            <span className="font-bold text-emerald-700">Providência / Ação Recomendada: </span>
                            <span className="text-emerald-900 font-medium">{aplicabilidade.acaoSugerida}</span>
                          </div>
                          {aplicabilidade.prazo && (
                            <div className="pt-1 flex items-center gap-3 text-[11px] text-slate-500">
                              <span>Prazo sugerido: <strong>{formatarData(aplicabilidade.prazo)}</strong></span>
                              {aplicabilidade.responsavel && (
                                <span>Responsável: <strong>{aplicabilidade.responsavel}</strong></span>
                              )}
                              {aplicabilidade.validadoPor && (
                                <span className="text-emerald-600 font-medium">✓ Validado por {aplicabilidade.validadoPor}</span>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs text-slate-500 italic">
                          Esta norma ainda não possui classificação de aplicabilidade vinculada a {activeEmpresa.nome}.
                        </div>
                      )}

                      {/* Keywords */}
                      {noticia.palavrasChave && noticia.palavrasChave.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <Tag className="w-3 h-3 text-slate-400" />
                          {noticia.palavrasChave.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action button */}
                    <div className="shrink-0 flex md:flex-col items-center gap-2">
                      <button
                        onClick={() => onSelectNoticia(noticia)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors"
                      >
                        Ver Dossiê da Norma
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2: ACOES DA EMPRESA */}
      {activeSubTab === 'acoes' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Ações Vinculadas a {activeEmpresa.nome}
              </h2>
              <p className="text-xs text-slate-500">
                Tarefas operacionais e homologações necessárias para garantir a conformidade tributária desta empresa.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              {acoesDaEmpresa.length} Ações Registradas
            </span>
          </div>

          <div className="space-y-3">
            {acoesDaEmpresa.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                Nenhuma ação cadastrada diretamente para esta empresa.
              </div>
            ) : (
              acoesDaEmpresa.map((acao) => {
                const isCritico = (acao.diasRestantes ?? 999) <= 7;
                return (
                  <div
                    key={acao.id}
                    className={`p-4 rounded-lg border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isCritico ? 'bg-rose-50/40 border-rose-200' : 'bg-slate-50/70 border-slate-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-500 font-mono">{acao.id}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          acao.status === 'CONCLUIDA'
                            ? 'bg-emerald-100 text-emerald-800'
                            : acao.status === 'EM_ANDAMENTO'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {acao.status.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-slate-600 font-medium">
                          {acao.tituloNoticia}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">{acao.acao}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <span>Responsável: <strong>{acao.responsavel}</strong></span>
                        <span>Área: <strong>{acao.area}</strong></span>
                        <span>Prazo Legal: <strong>{formatarData(acao.prazoLegal)}</strong></span>
                        <span>Prazo Interno: <strong>{formatarData(acao.prazoInterno)}</strong></span>
                        {acao.diasRestantes !== undefined && (
                          <span className={`font-bold ${isCritico ? 'text-rose-600' : 'text-slate-700'}`}>
                            {acao.diasRestantes} dias restantes
                          </span>
                        )}
                      </div>
                      {acao.evidencia && (
                        <div className="text-xs text-emerald-800 bg-emerald-50/80 p-2 rounded mt-1 border border-emerald-200">
                          <strong>Evidência:</strong> {acao.evidencia}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => onSelectNoticia(acao.noticiaRef)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 self-start md:self-center shrink-0"
                    >
                      Ver Norma
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 3: DOSSIE DA EMPRESA */}
      {activeSubTab === 'dossie' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Dossiê Regulatório e Cadastral: {activeEmpresa.razaoSocial}
            </h2>
            <p className="text-xs text-slate-500">
              Dados fundamentais utilizados pelo motor de inteligência fiscal para sugerir a aplicabilidade das normas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Atividades Principais & Objeto Social
              </h3>
              <ul className="space-y-2 text-xs text-slate-700">
                {activeEmpresa.atividadesPrincipais.map((ativ, i) => (
                  <li key={i} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{ativ}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                CNAEs Tributáveis Cadastrados
              </h3>
              <ul className="space-y-2 text-xs text-slate-700">
                {activeEmpresa.cnaes.map((cnae, i) => (
                  <li key={i} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded border border-slate-100 font-mono text-xs">
                    <Tag className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{cnae}</span>
                  </li>
                ))}
              </ul>

              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pt-2">
                Palavras-Chave de Vigilância Automática
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {activeEmpresa.palavrasChaveMonitoradas.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="pt-3">
                <button
                  onClick={() => setActiveSubTab('cartao-cnpj')}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors"
                >
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  Abrir Cartão CNPJ Oficial (Receita Federal)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB: CARTAO CNPJ OFICIAL */}
      {activeSubTab === 'cartao-cnpj' && activeEmpresa && (
        <div className="space-y-4">
          <CartaoCnpjOficial empresa={activeEmpresa} />
        </div>
      )}

      {/* SUBTAB 4: COMPARADOR LADO A LADO */}
      {activeSubTab === 'comparador' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Arquitetura de Isolamento Regulatório
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Demonstração Prática: O Mesmo Assunto, Impactos Diferentes
            </h2>
            <p className="text-xs text-slate-500">
              Veja abaixo como a mesma publicação oficial gera interpretações, tarefas e conclusões completamente segregadas para o Recanto (Cemitério Parque) e INSTITUTO GO (Saúde & Medicina).
            </p>
          </div>

          {/* Case 1: Opção do Simples IBS/CBS */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-900 text-white p-4">
              <span className="text-[11px] font-mono text-emerald-400 block uppercase">Caso de Estudo 1 • 01/09/2026</span>
              <h3 className="text-sm font-bold text-white">
                Receita Federal e Serpro disponibilizam opção pelo regime regular de IBS/CBS para empresas em transição tributária
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 bg-white">
              {/* Recanto */}
              <div className="p-5 space-y-3 bg-emerald-50/20">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">Recanto (04.709.150/0001-20)</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                    Aguardando Validação
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  <strong>Motivo: </strong>Matriz opera no Lucro Presumido, mas contrata serviços de terceiros e fornecedores de urnas/insumos que podem estar no Simples.
                </p>
                <p className="text-xs text-slate-600">
                  <strong>Impacto: </strong>Conferir se os fornecedores credenciados migrarão para o regime regular para transferência de créditos de IBS/CBS ao Recanto.
                </p>
                <div className="text-xs font-semibold text-emerald-800 bg-emerald-50 p-2.5 rounded border border-emerald-200">
                  Ação: Auditoria de fornecedores do Recanto antes de 25/09/2026.
                </div>
              </div>

              {/* INSTITUTO GO */}
              <div className="p-5 space-y-3 bg-sky-50/20">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">INSTITUTO GO (46.969.307/0001-04)</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Impacto Confirmado
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  <strong>Motivo: </strong>Atende pacientes e convênios corporativos de medicina preventiva e check-ups executivos.
                </p>
                <p className="text-xs text-slate-600">
                  <strong>Impacto: </strong>Análise do creditamento sobre insumos médicos e exames laboratoriais na transição da CBS/IBS da saúde.
                </p>
                <div className="text-xs font-semibold text-sky-800 bg-sky-50 p-2.5 rounded border border-sky-200">
                  Ação: Rodar simulador comparativo de procedimentos médicos com o contador até 30/09.
                </div>
              </div>
            </div>
          </div>

          {/* Case 2: Receitas Recorrentes */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-900 text-white p-4">
              <span className="text-[11px] font-mono text-emerald-400 block uppercase">Caso de Estudo 2 • Parecer Normativo</span>
              <h3 className="text-sm font-bold text-white">
                Tributação e Contratos de Receitas Recorrentes e Mensalidades em Serviços Continuados
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 bg-white">
              {/* Recanto */}
              <div className="p-5 space-y-3 bg-emerald-50/20">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">Recanto (Cemitério Parque)</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Impacto Confirmado
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  <strong>Aplicação: </strong>Planos de assistência funeral e manutenção perpétua de jazigos faturados mensalmente de forma antecipada.
                </p>
                <p className="text-xs text-slate-600">
                  <strong>Exigência: </strong>Segregar na emissão a cessão de direito de uso perpétuo (sem ISS/IBS) das taxas de manutenção e cortejo (com ISS/IBS).
                </p>
              </div>

              {/* INSTITUTO GO */}
              <div className="p-5 space-y-3 bg-sky-50/20">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">INSTITUTO GO (Medicina Personalizada)</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Impacto Confirmado
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  <strong>Aplicação: </strong>Planos de cuidado continuado e acompanhamento de longevidade com mensalidades periódicas.
                </p>
                <p className="text-xs text-slate-600">
                  <strong>Exigência: </strong>Emissão pontual da NFS-e na competência exata da disponibilização das consultas e exames especializados.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 5: CADASTRO & EXCLUSÃO DE EMPRESAS */}
      {activeSubTab === 'cadastro' && (
        <div className="space-y-8" id="secao-cadastro-empresas">
          {/* Feedback alert */}
          {formFeedback && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl flex items-center gap-3 font-medium shadow-xs animate-in fade-in">
              <Check className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{formFeedback}</span>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" id="form-cadastro-empresa-card">
            <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">
                  <PlusCircle className="w-4 h-4" />
                  Cadastro de Entidades & Grupos Econômicos
                </div>
                <h2 className="text-lg font-bold text-white">
                  Cadastrar Nova Empresa no Radar Fiscal
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Defina os dados societários, regime tributário, CNAEs e sistemas para gerar análises e matrizes de impacto customizadas.
                </p>
              </div>
              <span className="text-xs bg-slate-800/80 border border-slate-700 px-3 py-1 rounded text-slate-300 self-start sm:self-auto">
                Total de Empresas Cadastradas: <strong>{empresas.length}</strong>
              </span>
            </div>

            <form onSubmit={handleSubmitNovoCadastro} className="p-6 space-y-6">
              {/* Automated CNPJ Ingestion Banner / Tool */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 sm:p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                      <Search className="w-4 h-4 text-emerald-700" />
                      Consulta Automática de CNPJ (Receita Federal / BrasilAPI)
                    </h3>
                    <p className="text-xs text-emerald-800">
                      Digite ou cole o CNPJ abaixo para puxar automaticamente Razão Social, CNAEs, Porte, Quadro Societário (QSA), Capital Social e Faturamento.
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 self-start sm:self-auto">
                    Dados Oficiais RFB
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={novoCnpj}
                      onChange={(e) => setNovoCnpj(e.target.value)}
                      placeholder="Digite o CNPJ (ex: 45.123.789/0001-22 ou apenas números)"
                      className="w-full pl-3 pr-8 py-2.5 text-sm font-mono bg-white border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                      id="input-consulta-cnpj-rapida"
                    />
                    {novoCnpj && (
                      <button
                        type="button"
                        onClick={() => setNovoCnpj('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleConsultarCnpj()}
                    disabled={isConsultandoCnpj || !novoCnpj.trim()}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-lg shadow transition-colors"
                    id="btn-consultar-cnpj-api"
                  >
                    {isConsultandoCnpj ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Buscando na Receita...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        <span>Puxar Dados via CNPJ</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Quick Examples */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-900 pt-1">
                  <span className="font-semibold text-[11px] text-emerald-800">Testar exemplos rápidos:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setNovoCnpj('04.709.150/0001-20');
                      handleConsultarCnpj('04709150000120');
                    }}
                    className="px-2 py-0.5 rounded bg-white border border-emerald-200 hover:bg-emerald-100 text-[11px] font-mono font-medium transition-colors"
                  >
                    04.709.150/0001-20 (Recanto)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNovoCnpj('46.969.307/0001-04');
                      handleConsultarCnpj('46969307000104');
                    }}
                    className="px-2 py-0.5 rounded bg-white border border-emerald-200 hover:bg-emerald-100 text-[11px] font-mono font-medium transition-colors"
                  >
                    46.969.307/0001-04 (INSTITUTO GO)
                  </button>
                </div>

                {consultaCnpjErro && (
                  <div className="p-2.5 rounded-md bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{consultaCnpjErro}</span>
                  </div>
                )}
              </div>

              {/* Row 1: Basic Corporate Info */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-emerald-600" />
                  1. Dados Societários e Identificação
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="flex items-center text-xs font-semibold text-slate-700 mb-1">
                      Nome Fantasia / Apelido <span className="text-red-500 ml-0.5">*</span>
                      <FormTooltip
                        title="Nome Fantasia"
                        required
                        content="Identificação amigável e operacional da empresa para os cards, gráficos comparativos e relatórios de inteligência fiscal."
                        example="Recanto da Saudade, Instituto GO"
                      />
                    </label>
                    <input
                      type="text"
                      value={novoNome}
                      onChange={(e) => setNovoNome(e.target.value)}
                      placeholder="Ex: Recanto Filial, INSTITUTO GO Unidade"
                      required
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      id="input-novo-nome"
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-xs font-semibold text-slate-700 mb-1">
                      Razão Social Completa
                      <FormTooltip
                        title="Razão Social"
                        content="Nome empresarial oficial constante no Contrato Social, Junta Comercial e no Cadastro Nacional da Pessoa Jurídica (CNPJ)."
                        example="Recanto da Saudade Cemitério Parque Ltda."
                      />
                    </label>
                    <input
                      type="text"
                      value={novaRazaoSocial}
                      onChange={(e) => setNovaRazaoSocial(e.target.value)}
                      placeholder="Ex: DF Serviços Funerários e Cemiteriais S/A"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      id="input-nova-razao-social"
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-xs font-semibold text-slate-700 mb-1">
                      CNPJ Oficial <span className="text-red-500 ml-0.5">*</span>
                      <FormTooltip
                        title="CNPJ Oficial"
                        required
                        content="Número cadastral no formato 00.000.000/0001-00. Essencial para validação no cartão CNPJ da Receita Federal e verificação em certidões fazendárias."
                        example="04.709.150/0001-20"
                      />
                    </label>
                    <input
                      type="text"
                      value={novoCnpj}
                      onChange={(e) => setNovoCnpj(e.target.value)}
                      placeholder="Ex: 00.000.000/0001-00"
                      required
                      className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      id="input-novo-cnpj"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Financial & Corporate Scale */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  2. Porte, Capital Social & Faturamento
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="flex items-center text-xs font-semibold text-slate-700 mb-1">
                      Porte da Empresa
                      <FormTooltip
                        title="Porte da Empresa"
                        content="Classificação por receita bruta anual conforme Lei Complementar nº 123/2006. Relevante para limites do Simples e obrigações acessórias."
                        example="DEMAIS, EPP, ME"
                      />
                    </label>
                    <input
                      type="text"
                      value={novoPorte}
                      onChange={(e) => setNovoPorte(e.target.value)}
                      placeholder="DEMAIS, ME, EPP"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-xs font-semibold text-slate-700 mb-1">
                      Capital Social (R$)
                      <FormTooltip
                        title="Capital Social"
                        content="Montante de recursos integralizados pelos sócios para a constituição da empresa, registrado no contrato social."
                        example="R$ 4.500.000,00"
                      />
                    </label>
                    <input
                      type="number"
                      value={novoCapitalSocial}
                      onChange={(e) => setNovoCapitalSocial(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-xs font-semibold text-slate-700 mb-1">
                      Faturamento Anual (R$)
                      <FormTooltip
                        title="Faturamento Anual Estimado"
                        content="Receita bruta total projetada ou realizada nos últimos 12 meses. Base para enquadramento de regime e retenções."
                        example="R$ 18.500.000,00"
                      />
                    </label>
                    <input
                      type="number"
                      value={novoFaturamentoAnual}
                      onChange={(e) => setNovoFaturamentoAnual(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-xs font-semibold text-slate-700 mb-1">
                      Faturamento Mensal (R$)
                      <FormTooltip
                        title="Faturamento Mensal Estimado"
                        content="Média mensal de faturamento para cálculo proporcional de apuração e fluxo de caixa de tributos."
                        example="R$ 1.541.660,00"
                      />
                    </label>
                    <input
                      type="number"
                      value={novoFaturamentoMensal}
                      onChange={(e) => setNovoFaturamentoMensal(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Fiscal Regime and Segment */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  3. Regime Tributário, Segmento & Localização
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="flex items-center text-xs font-semibold text-slate-700 mb-1">
                      Regime Tributário <span className="text-red-500 ml-0.5">*</span>
                      <FormTooltip
                        title="Regime Tributário"
                        required
                        content="Determina o modelo de tributação federal/municipal e a incidência das regras de transição da Reforma Tributária (IBS e CBS)."
                        example="Lucro Presumido, Simples Nacional, Lucro Real"
                      />
                    </label>
                    <select
                      value={novoRegime}
                      onChange={(e: any) => setNovoRegime(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
                      id="select-novo-regime"
                    >
                      <option value="LUCRO_PRESUMIDO">Lucro Presumido</option>
                      <option value="SIMPLES_NACIONAL">Simples Nacional</option>
                      <option value="LUCRO_REAL">Lucro Real</option>
                      <option value="MEI">Microempreendedor Individual (MEI)</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center text-xs font-semibold text-slate-700 mb-1">
                      Segmento Principal de Atuação <span className="text-red-500 ml-0.5">*</span>
                      <FormTooltip
                        title="Segmento Principal"
                        required
                        content="Ramo de atividade econômica primária. Utilizado pelos algoritmos de triagem para cruzar novas leis e portarias aplicáveis."
                        example="Serviços Funerários e Cemiteriais, Educação Continuada"
                      />
                    </label>
                    <input
                      type="text"
                      value={novoSegmento}
                      onChange={(e) => setNovoSegmento(e.target.value)}
                      placeholder="Ex: Serviços Funerários e Cemiteriais"
                      required
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      id="input-novo-segmento"
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-xs font-semibold text-slate-700 mb-1">
                      UF (Estado)
                      <FormTooltip
                        title="Unidade Federativa"
                        content="Estado onde se localiza o estabelecimento principal para apuração de ICMS e regras regionais de transição do IBS."
                        example="PA, DF, SP"
                      />
                    </label>
                    <input
                      type="text"
                      value={novaUf}
                      onChange={(e) => setNovaUf(e.target.value)}
                      maxLength={2}
                      placeholder="DF, SP, RJ, etc."
                      className="w-full px-3 py-2 text-sm uppercase bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      id="input-nova-uf"
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-xs font-semibold text-slate-700 mb-1">
                      Município(s) de Operação
                      <FormTooltip
                        title="Município Prestador"
                        content="Município competente para recolhimento do ISSQN atual e futuro comitê gestor do IBS subnacional."
                        example="Belém, Ananindeua, Brasília"
                      />
                    </label>
                    <input
                      type="text"
                      value={novoMunicipio}
                      onChange={(e) => setNovoMunicipio(e.target.value)}
                      placeholder="Brasília, Taguatinga, etc."
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      id="input-novo-municipio"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: ERP and CNAEs */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-emerald-600" />
                  3. Sistemas ERP e Enquadramento CNAE
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center text-xs font-semibold text-slate-700 mb-1">
                      Software de Gestão / ERP Principal
                      <FormTooltip
                        title="Software ERP"
                        content="Sistema corporativo onde as rotinas fiscais, regras de alíquotas e parametrizações de notas fiscais são configuradas."
                        example="TOTVS Protheus 12, Sankhya, SAP Business One"
                      />
                    </label>
                    <input
                      type="text"
                      value={novoSistema}
                      onChange={(e) => setNovoSistema(e.target.value)}
                      placeholder="Ex: TOTVS Protheus 12, Sankhya, SAP, Omie"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      id="input-novo-sistema"
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-xs font-semibold text-slate-700 mb-1">
                      CNAE Principal (Código e Descrição)
                      <FormTooltip
                        title="CNAE Principal"
                        content="Classificação Nacional de Atividades Econômicas. Define enquadramento em listas de serviços tributáveis (LC 116/2003) e obrigações tributárias."
                        example="9603-3/01, 8599-6/04"
                      />
                    </label>
                    <input
                      type="text"
                      value={novoCnaePrincipal}
                      onChange={(e) => setNovoCnaePrincipal(e.target.value)}
                      placeholder="Ex: 9603-3/04 - Serviços funerários e somatoconservação"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      id="input-novo-cnae-principal"
                    />
                  </div>
                </div>

                {/* CNAEs Secundarios */}
                <div className="mt-3">
                  <label className="flex items-center text-xs font-semibold text-slate-700 mb-1">
                    CNAEs Secundários
                    <FormTooltip
                      title="CNAEs Secundários"
                      content="Atividades complementares desenvolvidas pela empresa. Permite rastrear impactos tributários setoriais que atingem operações secundárias."
                      example="4789-0/99 (Comércio varejista), 8211-3/00 (Serviços de apoio)"
                    />
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={inputCnaeSecundario}
                      onChange={(e) => setInputCnaeSecundario(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAdicionarCnaeSecundario();
                        }
                      }}
                      placeholder="Adicionar código e descrição de CNAE secundário..."
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      id="input-cnae-secundario"
                    />
                    <button
                      type="button"
                      onClick={handleAdicionarCnaeSecundario}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-lg transition-colors inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Adicionar
                    </button>
                  </div>

                  {novosCnaesSecundarios.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {novosCnaesSecundarios.map((cnae, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono"
                        >
                          <span>{cnae}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoverCnaeSecundario(cnae)}
                            className="text-slate-400 hover:text-red-500 ml-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 4: Vigilance Keywords */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-emerald-600" />
                  4. Palavras-Chave de Vigilância Automática
                  <FormTooltip
                    title="Tags de Monitoramento"
                    content="Termos e expressões rastreados nos Diários Oficiais e atos fazendários para disparar notificações automáticas de aplicabilidade imediata."
                    example="cemitério, jazigo, issqn, retenção na fonte"
                  />
                </h3>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={inputPalavraChave}
                    onChange={(e) => setInputPalavraChave(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAdicionarPalavraChave();
                      }
                    }}
                    placeholder="Ex: ISS, LC 116, cremação, jazigo, antecipação..."
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    id="input-palavra-chave"
                  />
                  <button
                    type="button"
                    onClick={handleAdicionarPalavraChave}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-lg transition-colors inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Tag
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {novasPalavrasChave.map((palavra, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold"
                    >
                      #{palavra}
                      <button
                        type="button"
                        onClick={() => handleRemoverPalavraChave(palavra)}
                        className="text-emerald-500 hover:text-red-500 ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Row 5: Notes & Submit */}
              <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Observações Operacionais ou Tributárias
                  </label>
                  <input
                    type="text"
                    value={novaDescricao}
                    onChange={(e) => setNovaDescricao(e.target.value)}
                    placeholder="Ex: Empresa responsável pela operação do cemitério municipal e contratos de manutenção."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg shadow-sm transition-all flex items-center gap-2"
                    id="btn-submeter-cadastro-empresa"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar e Ativar Empresa</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Existing Companies Management & Exclusion List */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4" id="lista-empresas-cadastradas">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-slate-700" />
                  Empresas Cadastradas no Sistema ({empresas.length})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Gerencie as entidades ativas, troque o foco operacional ou efetue a exclusão de cadastros não mais monitorados.
                </p>
              </div>

              {/* Botões de Auditoria e Exportação na listagem */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportarEmpresasCsv}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-colors"
                  id="btn-exportar-csv-lista"
                  title="Exportar dados cadastrais e pendências para planilha de auditoria externa"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Exportar CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalHistoricoAberto(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-colors"
                  id="btn-historico-lista"
                  title="Consultar log cronológico de inclusões e exclusões"
                >
                  <History className="w-3.5 h-3.5 text-slate-600" />
                  <span>Histórico ({historicoLogs.length})</span>
                </button>
              </div>
            </div>

            {empresas.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300 p-6">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700">Nenhuma empresa cadastrada no momento</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Utilize o formulário acima para cadastrar a primeira empresa e iniciar o monitoramento fiscal segmentado.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {empresas.map((emp) => {
                  const isAtiva = activeEmpresa?.id === emp.id;
                  const stats = metricasPorEmpresa[emp.id] || { total: 0, criticas: 0, pendentes: 0, concluidas: 0, normas: 0 };
                  const temCriticas = stats.criticas > 0;

                  return (
                    <div
                      key={emp.id}
                      className={`rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between relative overflow-hidden ${
                        isAtiva
                          ? 'border-emerald-500 bg-emerald-50/15 ring-2 ring-emerald-500/10 shadow-sm'
                          : temCriticas
                          ? 'border-rose-300 bg-rose-50/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                      }`}
                      id={`card-empresa-${emp.id}`}
                    >
                      <div>
                        {/* Critical Pending Alert Banner */}
                        {temCriticas && (
                          <div className="mb-3 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 flex items-center justify-between text-xs animate-pulse">
                            <span className="font-bold flex items-center gap-1.5">
                              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                              <span>{stats.criticas} pendência(s) crítica(s) exigindo ação imediata</span>
                            </span>
                            <span className="text-[10px] font-black uppercase bg-rose-200 text-rose-900 px-1.5 py-0.5 rounded">
                              Urgente
                            </span>
                          </div>
                        )}

                        {/* Top card bar */}
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-base font-bold text-slate-900">{emp.nome}</span>
                              {isAtiva && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  <Check className="w-3 h-3" /> Ativa no Radar
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-500 block truncate font-medium">{emp.razaoSocial}</span>
                          </div>

                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
                            {emp.regimeTributario.replace('_', ' ')}
                          </span>
                        </div>

                        {/* Metadata details */}
                        <div className="grid grid-cols-2 gap-2 text-xs py-2.5 border-y border-slate-100 my-2 bg-slate-50/50 p-2.5 rounded-xl">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-medium">CNPJ</span>
                            <span className="font-mono text-slate-700 text-[11px] font-semibold">{emp.cnpj}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-medium">Localidade</span>
                            <span className="text-slate-700 text-[11px] truncate">
                              {emp.localidades.uf} ({emp.localidades.municipios.join(', ')})
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-medium">Segmento</span>
                            <span className="text-slate-700 text-[11px] truncate">{emp.segmento}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-medium">Sistema ERP</span>
                            <span className="text-slate-700 text-[11px] truncate">{emp.sistemasUtilizados.join(', ')}</span>
                          </div>
                        </div>

                        {/* Metrics Badges */}
                        <div className="grid grid-cols-3 gap-2 my-2.5 text-center">
                          <div className="p-2 rounded-lg bg-slate-100 border border-slate-200">
                            <span className="text-[10px] text-slate-500 block">Normas</span>
                            <span className="text-xs font-bold text-slate-800">{stats.normas} aplicáveis</span>
                          </div>
                          <div className={`p-2 rounded-lg border ${temCriticas ? 'bg-rose-100/70 border-rose-200 text-rose-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                            <span className="text-[10px] block opacity-80">Pendências</span>
                            <span className="text-xs font-bold">
                              {stats.pendentes} {temCriticas ? `(${stats.criticas} críticas)` : ''}
                            </span>
                          </div>
                          <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
                            <span className="text-[10px] text-emerald-700 block">Concluídas</span>
                            <span className="text-xs font-bold text-emerald-800">{stats.concluidas} ações</span>
                          </div>
                        </div>

                        {/* CNAEs and tags summary */}
                        <div className="space-y-1.5 my-2">
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 truncate">
                            <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate font-mono">{emp.cnaes[0] || 'Sem CNAE principal'}</span>
                            {emp.cnaes.length > 1 && (
                              <span className="text-[10px] text-slate-400 font-semibold">
                                +{emp.cnaes.length - 1}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {emp.palavrasChaveMonitoradas.slice(0, 4).map((p, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium"
                              >
                                #{p}
                              </span>
                            ))}
                            {emp.palavrasChaveMonitoradas.length > 4 && (
                              <span className="text-[10px] text-slate-400">
                                +{emp.palavrasChaveMonitoradas.length - 4} tags
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Bottom Actions */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                        <div className="text-[11px] text-slate-500">
                          <span>Total: <strong>{stats.total}</strong> ações mapeadas</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectEmpresa(emp.id);
                              setActiveSubTab('acoes');
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                          >
                            Ver Ações
                          </button>

                          {!isAtiva && (
                            <button
                              type="button"
                              onClick={() => {
                                onSelectEmpresa(emp.id);
                                setActiveSubTab('matriz-normas');
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
                            >
                              Tornar Ativa
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setEmpresaParaExcluir(emp)}
                            className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-lg border border-rose-200 transition-colors inline-flex items-center gap-1"
                            title={`Excluir cadastro da empresa ${emp.nome}`}
                            id={`btn-excluir-empresa-${emp.id}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Excluir</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Modal / Dialog de Confirmação de Exclusão */}
          {empresaParaExcluir && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
              <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-3 text-red-600">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    <AlertOctagon className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Confirmar Exclusão de Empresa</h3>
                    <p className="text-xs text-slate-500">Esta operação é definitiva no sistema.</p>
                  </div>
                </div>

                <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-xs text-red-900 space-y-1">
                  <p>
                    Você está prestes a excluir a empresa:
                  </p>
                  <p className="font-bold text-sm">
                    {empresaParaExcluir.nome} ({empresaParaExcluir.razaoSocial})
                  </p>
                  <p className="font-mono text-[11px] text-red-700">
                    CNPJ: {empresaParaExcluir.cnpj} • {empresaParaExcluir.segmento}
                  </p>
                </div>

                <p className="text-xs text-slate-600">
                  Ao confirmar, esta empresa será desvinculada das matérias tributárias e removida do menu global do Radar Fiscal.
                </p>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setEmpresaParaExcluir(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmarExclusao}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                    id="btn-confirmar-exclusao-definitiva"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Sim, Excluir Empresa</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 7: GRÁFICO DE AÇÕES COMPARATIVO (RECHARTS) */}
      {activeSubTab === 'grafico-acoes' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <GraficoAcoesPorEmpresa
            empresas={empresas}
            noticias={noticias}
            selectedEmpresaId={selectedEmpresaId}
            onSelectEmpresa={onSelectEmpresa}
          />
        </div>
      )}

      {/* SUBTAB 8: CALCULADORA PILOTO CBS/IBS (RECEITA FEDERAL LC 214/2025) */}
      {activeSubTab === 'calculadora-cbs' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <CalculadoraPilotoCbs
            empresas={empresas}
            empresaAtivaId={activeEmpresa?.id}
            onSelecionarEmpresa={(empId) => onSelectEmpresa(empId)}
          />
        </div>
      )}
        </motion.div>
      </AnimatePresence>

      {/* MODAL DE HISTÓRICO DE ALTERAÇÕES & LOG AUDITORIA */}
      <ModalHistoricoEmpresas
        isOpen={modalHistoricoAberto}
        onClose={() => setModalHistoricoAberto(false)}
        logs={historicoLogs}
      />
    </div>
  );
};
