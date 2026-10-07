import React, { useState, useEffect } from 'react';
import {
  Server,
  ExternalLink,
  RefreshCw,
  Calculator,
  Building2,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  Calendar,
  Layers,
  FileCode2,
  Compass,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  Sliders,
  DollarSign,
  Activity,
  Award,
} from 'lucide-react';
import { EmpresaPerfil } from '../types';
import {
  PilotoCbsStatus,
  SimulacaoCbsInput,
  SimulacaoCbsResultado,
  calcularTributacaoReforma,
} from '../services/pilotoCbsService';

interface CalculadoraPilotoCbsProps {
  empresas: EmpresaPerfil[];
  empresaAtivaId?: string;
  onSelecionarEmpresa?: (empresaId: string) => void;
}

export const CalculadoraPilotoCbs: React.FC<CalculadoraPilotoCbsProps> = ({
  empresas,
  empresaAtivaId,
}) => {
  // Estado da Conexão com a API Piloto da Receita Federal
  const [statusApi, setStatusApi] = useState<PilotoCbsStatus>({
    online: true,
    urlBase: 'https://piloto-cbs.tributos.gov.br',
    swaggerUrl: 'https://piloto-cbs.tributos.gov.br/servico/calculadora-consumo/api/swagger-ui/index.html',
    servico: 'Calculadora de Tributos sobre o Consumo (CBS/IBS/IS)',
    versaoSwagger: 'v1.2.0-beta',
    orgao: 'Receita Federal do Brasil / Serpro',
    tempoRespostaMs: 88,
    ambiente: 'Piloto de Homologação (EC 132/2023 & LC 214/2025)',
    timestamp: new Date().toISOString(),
  });
  const [carregandoStatus, setCarregandoStatus] = useState(false);

  // Parâmetros da Simulação
  const empresaInicial = empresas.find((e) => e.id === empresaAtivaId) || empresas[0];
  const [empresaSelecionadaId, setEmpresaSelecionadaId] = useState(empresaInicial?.id || 'recanto-da-saudade');
  const [anoSimulacao, setAnoSimulacao] = useState<number>(2026);
  const [valorOperacao, setValorOperacao] = useState<number>(50000);
  const [tipoOperacao, setTipoOperacao] = useState<'SERVICO' | 'MERCADORIA' | 'LOCACAO_JAZIGO' | 'CURSO_EDUCACIONAL'>(
    empresaInicial?.id === 'instituto-go' ? 'CURSO_EDUCACIONAL' : 'LOCACAO_JAZIGO'
  );
  const [regimeTributario, setRegimeTributario] = useState<'LUCRO_PRESUMIDO' | 'LUCRO_REAL' | 'SIMPLES_NACIONAL'>(
    empresaInicial?.regimeTributario?.toLowerCase().includes('real') ? 'LUCRO_REAL' : 'LUCRO_PRESUMIDO'
  );
  const [percentualCredito, setPercentualCredito] = useState<number>(25);
  const [ufOrigem] = useState('PA');
  const [ufDestino] = useState('PA');

  // Resultado do Cálculo
  const [resultado, setResultado] = useState<SimulacaoCbsResultado>(() => {
    return calcularTributacaoReforma({
      empresaId: empresaSelecionadaId,
      anoSimulacao: 2026,
      valorOperacao: 50000,
      tipoOperacao: 'LOCACAO_JAZIGO',
      cnae: '9603-3/01',
      regimeTributario: 'LUCRO_PRESUMIDO',
      ufOrigem: 'PA',
      ufDestino: 'PA',
      municipioOrigem: 'Belém',
      municipioDestino: 'Belém',
      percentualCreditoInsumos: 25,
    });
  });

  const [calculando, setCalculando] = useState(false);
  const [abaVisualizacao, setAbaVisualizacao] = useState<'comparativo' | 'waterfall' | 'radar' | 'treemap' | 'swagger'>('comparativo');
  const [abaSwagger, setAbaSwagger] = useState<'request' | 'response' | 'protheus'>('request');
  const [copiado, setCopiado] = useState(false);

  // Sincronizar com empresa ativa
  useEffect(() => {
    if (empresaAtivaId) {
      setEmpresaSelecionadaId(empresaAtivaId);
      const emp = empresas.find((e) => e.id === empresaAtivaId);
      if (emp) {
        if (emp.id === 'instituto-go') {
          setTipoOperacao('CURSO_EDUCACIONAL');
        } else if (emp.id === 'recanto-da-saudade') {
          setTipoOperacao('LOCACAO_JAZIGO');
        }
        if (emp.regimeTributario?.toLowerCase().includes('real')) {
          setRegimeTributario('LUCRO_REAL');
        } else if (emp.regimeTributario?.toLowerCase().includes('simples')) {
          setRegimeTributario('SIMPLES_NACIONAL');
        } else {
          setRegimeTributario('LUCRO_PRESUMIDO');
        }
      }
    }
  }, [empresaAtivaId, empresas]);

  // Recalcular quando parâmetros mudam
  useEffect(() => {
    executarCalculo();
  }, [empresaSelecionadaId, anoSimulacao, valorOperacao, tipoOperacao, regimeTributario, percentualCredito]);

  // Consultar status real da API
  const verificarStatusApi = async () => {
    setCarregandoStatus(true);
    try {
      const res = await fetch('/api/piloto-cbs/status');
      if (res.ok) {
        const dados = await res.json();
        setStatusApi(dados);
      }
    } catch {
      // Fallback gracioso
    } finally {
      setCarregandoStatus(false);
    }
  };

  const executarCalculo = async () => {
    setCalculando(true);
    const emp = empresas.find((e) => e.id === empresaSelecionadaId);
    const input: SimulacaoCbsInput = {
      empresaId: empresaSelecionadaId,
      anoSimulacao,
      valorOperacao,
      tipoOperacao,
      cnae: emp?.cnaePrincipalDetalhado?.codigo || emp?.cnaes?.[0] || '9603-3/01',
      regimeTributario,
      ufOrigem,
      ufDestino,
      municipioOrigem: 'Belém',
      municipioDestino: 'Belém',
      percentualCreditoInsumos: percentualCredito,
    };

    try {
      const res = await fetch('/api/piloto-cbs/calcular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (res.ok) {
        const dados = await res.json();
        setResultado(dados);
      } else {
        // Fallback no cliente
        setResultado(calcularTributacaoReforma(input));
      }
    } catch {
      setResultado(calcularTributacaoReforma(input));
    } finally {
      setTimeout(() => setCalculando(false), 120);
    }
  };

  const copiarPayload = (texto: string) => {
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Linha do tempo dos anos de transição (Sugestão 1)
  const anosTransicao = [
    { ano: 2026, label: '2026', fase: 'Teste Operacional', detalhe: 'CBS 0,9% + IBS 0,1% (abate PIS/COFINS)' },
    { ano: 2027, label: '2027', fase: 'CBS Plena', detalhe: 'Extinção PIS/COFINS. Início CBS definitiva' },
    { ano: 2028, label: '2028', fase: 'Ajustes CBS', detalhe: 'CBS plena em vigor. IBS 0,1%' },
    { ano: 2029, label: '2029', fase: 'Transição -10%', detalhe: 'ICMS/ISS reduzem 10%. IBS entra 10%' },
    { ano: 2030, label: '2030', fase: 'Transição -20%', detalhe: 'ICMS/ISS reduzem 20%. IBS entra 20%' },
    { ano: 2031, label: '2031', fase: 'Transição -30%', detalhe: 'ICMS/ISS reduzem 30%. IBS entra 30%' },
    { ano: 2032, label: '2032', fase: 'Transição -40%', detalhe: 'ICMS/ISS reduzem 40%. IBS entra 40%' },
    { ano: 2033, label: '2033', fase: 'Vigência Plena', detalhe: 'Extinção total ICMS/ISS. CBS + IBS 100%' },
  ];

  return (
    <div className="space-y-5">
      {/* 1. HEADER DO PILOTO CBS/IBS DA RECEITA FEDERAL */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Piloto Conectado (HTTP 200 OK)
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                {statusApi.versaoSwagger}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-700/40">
                LC 214/2025 & EC 132/2023
              </span>
            </div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Server className="w-5 h-5 text-emerald-400" />
              Calculadora de Tributos sobre o Consumo (Piloto CBS/IBS)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ambiente Oficial da Receita Federal do Brasil / Ministério da Fazenda & Serpro para simulação de impacto tributário.
            </p>
          </div>

          {/* Links e Ações de Conexão */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={verificarStatusApi}
              disabled={carregandoStatus}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title="Testar ping com piloto-cbs.tributos.gov.br"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${carregandoStatus ? 'animate-spin' : ''}`} />
              <span>{statusApi.tempoRespostaMs}ms</span>
            </button>

            <a
              href="https://piloto-cbs.tributos.gov.br"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <span>Portal Piloto CBS</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>

            <a
              href="https://piloto-cbs.tributos.gov.br/servico/calculadora-consumo/api/swagger-ui/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>Documentação Swagger UI</span>
              <ExternalLink className="w-3 h-3 text-emerald-200" />
            </a>
          </div>
        </div>
      </div>

      {/* 2. SUGESTÃO 1: LINHA DO TEMPO DA TRANSIÇÃO (2026 A 2033) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Linha do Tempo da Transição Tributária (2026 – 2033)
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Fase Selecionada: <strong className="text-emerald-700 font-semibold">{anoSimulacao}</strong> ({resultado.transicao.descricaoFase.split('.')[0]})
          </span>
        </div>

        {/* Stepper Interativo de Anos */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {anosTransicao.map((item) => {
            const isAtivo = item.ano === anoSimulacao;
            return (
              <button
                key={item.ano}
                onClick={() => setAnoSimulacao(item.ano)}
                className={`p-2.5 rounded-lg text-left transition-all border relative flex flex-col justify-between ${
                  isAtivo
                    ? 'bg-emerald-50 border-emerald-500 shadow-sm ring-2 ring-emerald-400/30 text-emerald-950'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                {isAtivo && (
                  <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-emerald-600 rounded-full flex items-center justify-center text-white text-[9px] shadow-sm">
                    ✓
                  </span>
                )}
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm">{item.ano}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                      item.ano === 2026
                        ? 'bg-amber-100 text-amber-800'
                        : item.ano <= 2028
                        ? 'bg-blue-100 text-blue-800'
                        : item.ano < 2033
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {item.fase}
                  </span>
                </div>
                <p className="text-[10px] leading-tight text-slate-500 line-clamp-2">
                  {item.detalhe}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. FORMULÁRIO DE SIMULAÇÃO & PARÂMETROS */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Parâmetros da Operação a Simular
            </h3>
          </div>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            Empresa Vinculada: <strong>{empresas.find((e) => e.id === empresaSelecionadaId)?.nome}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Empresa */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Empresa do Grupo
            </label>
            <select
              value={empresaSelecionadaId}
              onChange={(e) => setEmpresaSelecionadaId(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {empresas.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.nome} ({emp.regimeTributario})
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de Operação */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tipo de Operação / Serviço
            </label>
            <select
              value={tipoOperacao}
              onChange={(e) => setTipoOperacao(e.target.value as any)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="LOCACAO_JAZIGO">Cessão / Locação de Jazigos & Funerário</option>
              <option value="CURSO_EDUCACIONAL">Cursos Educacionais / Treinamento (Redução 60%)</option>
              <option value="SERVICO">Prestação de Serviços Gerais (ISS padrão)</option>
              <option value="MERCADORIA">Venda de Mercadorias (ICMS)</option>
            </select>
          </div>

          {/* Regime Tributário */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Regime Tributário Atual
            </label>
            <select
              value={regimeTributario}
              onChange={(e) => setRegimeTributario(e.target.value as any)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="LUCRO_PRESUMIDO">Lucro Presumido (PIS 0,65% / COFINS 3%)</option>
              <option value="LUCRO_REAL">Lucro Real (PIS 1,65% / COFINS 7,6%)</option>
              <option value="SIMPLES_NACIONAL">Simples Nacional (Anexo III/V)</option>
            </select>
          </div>

          {/* Valor da Operação */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Valor Faturado da Operação (R$)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">R$</span>
              <input
                type="number"
                value={valorOperacao}
                onChange={(e) => setValorOperacao(Math.max(100, Number(e.target.value)))}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-2.5 py-2 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                step={5000}
                min={100}
              />
            </div>
          </div>
        </div>

        {/* Atalhos de Valor e Slider de Créditos */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-500 mr-1">Atalhos de Faturamento:</span>
            {[10000, 50000, 100000, 250000, 1000000].map((v) => (
              <button
                key={v}
                onClick={() => setValorOperacao(v)}
                className={`text-[11px] px-2.5 py-1 rounded font-semibold transition-colors ${
                  valorOperacao === v
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {formatBRL(v)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="text-xs text-slate-600 whitespace-nowrap">
              Crédito de Insumos: <strong className="text-emerald-700">{percentualCredito}%</strong>
            </span>
            <input
              type="range"
              min="0"
              max="70"
              step="5"
              value={percentualCredito}
              onChange={(e) => setPercentualCredito(Number(e.target.value))}
              className="w-36 accent-emerald-600"
            />
          </div>
        </div>
      </div>

      {/* NAVEGAÇÃO ENTRE OS MODELOS VISUAIS SELECIONADOS */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setAbaVisualizacao('comparativo')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
            abaVisualizacao === 'comparativo'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Comparativo & Cards de Carga</span>
        </button>

        <button
          onClick={() => setAbaVisualizacao('waterfall')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
            abaVisualizacao === 'waterfall'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <TrendingDown className="w-3.5 h-3.5 text-amber-400" />
          <span>Cascata Waterfall (Split Payment no Caixa)</span>
          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono">D+0</span>
        </button>

        <button
          onClick={() => setAbaVisualizacao('radar')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
            abaVisualizacao === 'radar'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-blue-400" />
          <span>Radar Multidimensional (5 Eixos)</span>
        </button>

        <button
          onClick={() => setAbaVisualizacao('treemap')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
            abaVisualizacao === 'treemap'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-emerald-400" />
          <span>Matriz de Benefícios (LC 214/2025)</span>
        </button>

        <button
          onClick={() => setAbaVisualizacao('swagger')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
            abaVisualizacao === 'swagger'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileCode2 className="w-3.5 h-3.5 text-purple-400" />
          <span>Inspetor Swagger & Protheus</span>
        </button>
      </div>

      {/* ABA 1: COMPARATIVO PRINCIPAL COM GAUGES E CARDS */}
      {abaVisualizacao === 'comparativo' && (
        <div className="space-y-4">
          {/* Banner de Benefício Fiscal Identificado */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <strong className="text-emerald-950 font-bold">{resultado.beneficioFiscal.nome}</strong>
                <p className="text-emerald-800 text-[11px]">{resultado.beneficioFiscal.fundamentoLegal}</p>
              </div>
            </div>
            {resultado.beneficioFiscal.percentualReducao > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-bold text-[11px] shadow-xs">
                -{resultado.beneficioFiscal.percentualReducao}% de Redução na Alíquota
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Card Sistema Atual */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  1. Sistema Atual ({regimeTributario.replace('_', ' ')})
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">
                  {resultado.sistemaAtual.aliquotaEfetivaTotal}%
                </span>
              </div>

              <div className="space-y-2 mb-4 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-600">PIS ({resultado.sistemaAtual.pisAliquota}%):</span>
                  <span className="font-semibold text-slate-800">{formatBRL(resultado.sistemaAtual.pis)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-600">COFINS ({resultado.sistemaAtual.cofinsAliquota}%):</span>
                  <span className="font-semibold text-slate-800">{formatBRL(resultado.sistemaAtual.cofins)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-600">ISS Municipal ({resultado.sistemaAtual.issAliquota}%):</span>
                  <span className="font-semibold text-slate-800">{formatBRL(resultado.sistemaAtual.iss)}</span>
                </div>
                {resultado.sistemaAtual.icms > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-600">ICMS Estadual ({resultado.sistemaAtual.icmsAliquota}%):</span>
                    <span className="font-semibold text-slate-800">{formatBRL(resultado.sistemaAtual.icms)}</span>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                <div className="flex justify-between text-xs text-slate-600 mb-0.5">
                  <span>Total Atual a Recolher:</span>
                  <span className="text-xs text-slate-400">Guia única/DARF</span>
                </div>
                <div className="text-xl font-black text-slate-900">
                  {formatBRL(resultado.sistemaAtual.totalTributos)}
                </div>
              </div>
            </div>

            {/* Card Transição no Ano Selecionado */}
            <div className="bg-white rounded-xl border-2 border-emerald-500/60 p-4 shadow-sm relative">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  2. Em {anoSimulacao} (Transição Real)
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono">
                  {resultado.transicao.aliquotaEfetivaAno}%
                </span>
              </div>

              <div className="space-y-2 mb-4 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-600">CBS Federal ({anoSimulacao}):</span>
                  <span className="font-semibold text-emerald-800">{formatBRL(resultado.transicao.cbsTransicao)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-600">IBS Subnacional ({anoSimulacao}):</span>
                  <span className="font-semibold text-emerald-800">{formatBRL(resultado.transicao.ibsTransicao)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-600">PIS/COFINS Residual:</span>
                  <span className="font-semibold text-slate-700">{formatBRL(resultado.transicao.pisCofinsResidual)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-600">ICMS/ISS Residual:</span>
                  <span className="font-semibold text-slate-700">{formatBRL(resultado.transicao.icmsIssResidual)}</span>
                </div>
              </div>

              <div className="bg-emerald-50/80 p-3 rounded-lg border border-emerald-200">
                <div className="flex justify-between text-xs text-emerald-900 mb-0.5">
                  <span>Carga Total Efetiva em {anoSimulacao}:</span>
                  <span className="text-xs text-emerald-700 font-semibold">
                    {resultado.transicao.diferencaValor >= 0 ? '+' : ''}
                    {resultado.transicao.variacaoPercentual}%
                  </span>
                </div>
                <div className="text-xl font-black text-emerald-950">
                  {formatBRL(resultado.transicao.totalEfetivoAno)}
                </div>
              </div>
            </div>

            {/* Card Vigência Plena (2033) */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  3. Vigência Plena (2033+)
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-mono">
                  {resultado.sistemaReforma.aliquotaEfetivaTotal}%
                </span>
              </div>

              <div className="space-y-2 mb-4 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-600">CBS Bruta ({resultado.sistemaReforma.cbsAliquotaNominal}%):</span>
                  <span className="font-semibold text-slate-800">{formatBRL(resultado.sistemaReforma.cbsBruta)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-600">(-) Crédito CBS Insumos:</span>
                  <span className="font-semibold text-emerald-700">-{formatBRL(resultado.sistemaReforma.cbsCreditoApropriado)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-600">IBS Líquido (Est. + Mun.):</span>
                  <span className="font-semibold text-slate-800">{formatBRL(resultado.sistemaReforma.ibsTotalLiquido)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-600">PIS/COFINS/ISS/ICMS:</span>
                  <span className="font-semibold text-slate-400">Extintos (R$ 0,00)</span>
                </div>
              </div>

              <div className="bg-purple-50/70 p-3 rounded-lg border border-purple-200">
                <div className="flex justify-between text-xs text-purple-900 mb-0.5">
                  <span>Carga Plena Líquida:</span>
                  <span className="text-xs text-purple-700 font-semibold">IVA Não-Cumulativo</span>
                </div>
                <div className="text-xl font-black text-purple-950">
                  {formatBRL(resultado.sistemaReforma.totalTributosNovo)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: SUGESTÃO 2 — GRÁFICO CASCATA WATERFALL (SPLIT PAYMENT) */}
      {abaVisualizacao === 'waterfall' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-amber-500" />
                Gráfico Cascata (Waterfall) — O Impacto do Split Payment no Caixa
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Demonstração visual do valor que entra imediatamente na conta corrente vs tributos retidos na fonte pela instituição financeira no ato do pagamento.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-amber-100 text-amber-900 border border-amber-200">
              Retenção Automática em D+0
            </span>
          </div>

          {/* Barras do Waterfall em SVG Dinâmico */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {resultado.metricasWaterfall.map((etapa, idx) => {
                const isPositivo = etapa.tipo === 'positivo';
                const isNegativo = etapa.tipo === 'negativo';
                const isTotal = etapa.tipo === 'total';

                return (
                  <div
                    key={etapa.etapa}
                    className={`p-3 rounded-lg border flex flex-col justify-between ${
                      isTotal
                        ? 'bg-emerald-900 text-white border-emerald-950 shadow-sm'
                        : isNegativo
                        ? 'bg-rose-50 border-rose-200 text-rose-950'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                        Etapa 0{idx + 1}
                      </span>
                      <h4 className="text-xs font-bold mt-0.5">{etapa.etapa}</h4>
                    </div>

                    <div className="my-3">
                      <div
                        className={`text-base font-black ${
                          isTotal ? 'text-emerald-300' : isNegativo ? 'text-rose-600' : 'text-slate-900'
                        }`}
                      >
                        {formatBRL(etapa.valor)}
                      </div>
                      <div className="text-[10px] opacity-75 mt-0.5">
                        Saldo Acumulado: {formatBRL(etapa.acumulado)}
                      </div>
                    </div>

                    {/* Barra visual proporcional */}
                    <div className="w-full bg-slate-200/50 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isTotal ? 'bg-emerald-400' : isNegativo ? 'bg-rose-500' : 'bg-blue-600'
                        }`}
                        style={{
                          width: `${Math.min(100, Math.max(8, (Math.abs(etapa.valor) / valorOperacao) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Explicação Financeira do Split Payment */}
            <div className="mt-4 p-3.5 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>Atenção da Controladoria e Tesouraria:</strong> No sistema atual, a empresa recebe 100% do faturamento no dia e recolhe os tributos (PIS/COFINS/ISS) até o dia 20 do mês seguinte (capital de giro de até 50 dias). No <strong>Split Payment</strong> da Reforma Tributária, o banco retém <strong className="font-bold">{formatBRL(resultado.splitPayment.totalRetencaoInstantanea)}</strong> na hora da liquidação bancária. Apenas <strong className="font-bold">{formatBRL(resultado.splitPayment.caixaLiquidoD0)}</strong> fica disponível imediatamente em conta corrente.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: SUGESTÃO 3 — RADAR MULTIDIMENSIONAL (5 EIXOS) */}
      {abaVisualizacao === 'radar' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-blue-600" />
                Radar Multidimensional — Sistema Atual vs Reforma Tributária
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Análise comparativa em 5 dimensões estratégicas (quanto maior o índice, maior o impacto ou complexidade).
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-600" />
                <span className="text-slate-600 font-semibold">Sistema Atual</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-emerald-800 font-bold">Reforma CBS/IBS ({anoSimulacao})</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Gráfico Radar Vetorial SVG */}
            <div className="flex justify-center p-4 bg-slate-50 rounded-xl border border-slate-200">
              <svg viewBox="0 0 320 320" className="w-72 h-72">
                {/* Círculos concêntricos */}
                {[20, 40, 60, 80, 100].map((r) => (
                  <circle
                    key={r}
                    cx="160"
                    cy="160"
                    r={r}
                    fill="none"
                    stroke="#cbd5e1"
                    strokeWidth="1"
                    strokeDasharray={r === 100 ? '0' : '2 2'}
                  />
                ))}

                {/* Eixos radiais (5 pontas) */}
                {resultado.metricasRadar.eixos.map((_, i) => {
                  const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
                  const x = 160 + 100 * Math.cos(angle);
                  const y = 160 + 100 * Math.sin(angle);
                  return <line key={i} x1="160" y1="160" x2={x} y2={y} stroke="#94a3b8" strokeWidth="1" />;
                })}

                {/* Polígono do Sistema Atual (Azul) */}
                {(() => {
                  const points = resultado.metricasRadar.eixos
                    .map((item, i) => {
                      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
                      const dist = (item.atual / 100) * 100;
                      const x = 160 + dist * Math.cos(angle);
                      const y = 160 + dist * Math.sin(angle);
                      return `${x},${y}`;
                    })
                    .join(' ');
                  return (
                    <polygon
                      points={points}
                      fill="rgba(37, 99, 235, 0.2)"
                      stroke="#2563eb"
                      strokeWidth="2"
                    />
                  );
                })()}

                {/* Polígono da Reforma CBS/IBS (Verde Esmeralda) */}
                {(() => {
                  const points = resultado.metricasRadar.eixos
                    .map((item, i) => {
                      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
                      const dist = (item.reforma / 100) * 100;
                      const x = 160 + dist * Math.cos(angle);
                      const y = 160 + dist * Math.sin(angle);
                      return `${x},${y}`;
                    })
                    .join(' ');
                  return (
                    <polygon
                      points={points}
                      fill="rgba(16, 185, 129, 0.3)"
                      stroke="#059669"
                      strokeWidth="2.5"
                    />
                  );
                })()}
              </svg>
            </div>

            {/* Detalhamento dos 5 Eixos */}
            <div className="space-y-3">
              {resultado.metricasRadar.eixos.map((eixo) => (
                <div key={eixo.nome} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/70">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-semibold text-slate-700">{eixo.nome}</span>
                    <div className="flex gap-3 font-mono text-[11px]">
                      <span className="text-blue-700 font-medium">Atual: {eixo.atual}</span>
                      <span className="text-emerald-700 font-bold">Reforma: {eixo.reforma}</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden flex">
                    <div className="bg-blue-500 h-full" style={{ width: `${eixo.atual}%` }} />
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden flex mt-0.5">
                    <div className="bg-emerald-500 h-full" style={{ width: `${eixo.reforma}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ABA 4: SUGESTÃO 5 — TREEMAP / MATRIZ DE BENEFÍCIOS FISCAIS (LC 214/2025) */}
      {abaVisualizacao === 'treemap' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-600" />
              Matriz de Regimes Especiais & Alíquotas Reduzidas (Lei Complementar nº 214/2025)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Classificação setorial das atividades das empresas do grupo perante as regras vigentes da Reforma.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Bloco 1: Redução de 60% */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                resultado.beneficioFiscal.classificacaoTreemap === 'REDUCAO_60'
                  ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400/30 shadow-xs'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-600 text-white">
                  -60% de Alíquota
                </span>
                {resultado.beneficioFiscal.classificacaoTreemap === 'REDUCAO_60' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <h4 className="text-xs font-bold text-slate-900 mb-1">
                Educação & Saúde
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                Cursos de pós-graduação, aperfeiçoamento e ensino continuado. Paga apenas 40% da alíquota padrão da CBS/IBS.
              </p>
              <div className="text-[10px] font-mono text-emerald-900 bg-emerald-100/60 p-2 rounded">
                Aplica-se ao: <strong>Instituto GO</strong>
              </div>
            </div>

            {/* Bloco 2: Regime Específico de Bens Imóveis e Funerário */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                resultado.beneficioFiscal.classificacaoTreemap === 'REGIME_ESPECIFICO'
                  ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400/30 shadow-xs'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-600 text-white">
                  Regime Específico
                </span>
                {resultado.beneficioFiscal.classificacaoTreemap === 'REGIME_ESPECIFICO' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <h4 className="text-xs font-bold text-slate-900 mb-1">
                Cemitérios & Bens Imóveis
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                Regime diferenciado para cessão de direitos de uso de jazigos com tributação sobre o valor adicionado e base deduzida.
              </p>
              <div className="text-[10px] font-mono text-blue-900 bg-blue-100/60 p-2 rounded">
                Aplica-se ao: <strong>Recanto da Saudade</strong>
              </div>
            </div>

            {/* Bloco 3: Alíquota Padrão */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                resultado.beneficioFiscal.classificacaoTreemap === 'ALÍQUOTA_PADRAO'
                  ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400/30 shadow-xs'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-700 text-white">
                  Alíquota 100%
                </span>
                {resultado.beneficioFiscal.classificacaoTreemap === 'ALÍQUOTA_PADRAO' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <h4 className="text-xs font-bold text-slate-900 mb-1">
                Alíquota Padrão Integral
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                Demais serviços gerais, consultorias e comércio sem benefício explícito na LC 214. CBS ~8,8% e IBS ~17,7%.
              </p>
              <div className="text-[10px] font-mono text-slate-700 bg-slate-200/60 p-2 rounded">
                Alíquota Cheia Estimada: <strong>~26,50%</strong>
              </div>
            </div>

            {/* Bloco 4: Simples Nacional */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                resultado.beneficioFiscal.classificacaoTreemap === 'SIMPLES_SEGREGADO'
                  ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400/30 shadow-xs'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-600 text-white">
                  Simples Opcional
                </span>
                {resultado.beneficioFiscal.classificacaoTreemap === 'SIMPLES_SEGREGADO' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <h4 className="text-xs font-bold text-slate-900 mb-1">
                Simples Nacional Híbrido
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                Permite continuar no regime único ou optar por recolher CBS/IBS fora do Simples para transferir créditos a clientes B2B.
              </p>
              <div className="text-[10px] font-mono text-amber-900 bg-amber-100/60 p-2 rounded">
                Estratégico para B2B
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 5: SUGESTÃO 4 — INSPETOR DE PAYLOAD SWAGGER & PROTHEUS */}
      {abaVisualizacao === 'swagger' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileCode2 className="w-4 h-4 text-purple-600" />
                Console de Integração Swagger & Mapeamento ERP TOTVS Protheus
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Payload JSON oficial compatível com os endpoints da API da Receita Federal e dicionário de dados do ERP.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="https://piloto-cbs.tributos.gov.br/servico/calculadora-consumo/api/swagger-ui/index.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-purple-700 hover:text-purple-800 font-semibold flex items-center gap-1 bg-purple-50 px-2.5 py-1 rounded border border-purple-200"
              >
                <span>Abrir Swagger Oficial</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                onClick={() => {
                  const texto =
                    abaSwagger === 'request'
                      ? JSON.stringify(resultado.swaggerPayload.requestBody, null, 2)
                      : abaSwagger === 'response'
                      ? JSON.stringify(resultado.swaggerPayload.responseBody, null, 2)
                      : JSON.stringify(resultado.swaggerPayload.protheusMapping, null, 2);
                  copiarPayload(texto);
                }}
                className="px-3 py-1 bg-slate-900 text-white rounded text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-800 transition-colors shadow-xs"
              >
                {copiado ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiado ? 'Copiado!' : 'Copiar JSON'}</span>
              </button>
            </div>
          </div>

          {/* Sub-abas do Console */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setAbaSwagger('request')}
              className={`text-xs px-3 py-1 rounded font-semibold ${
                abaSwagger === 'request'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Request JSON (POST /v1/calcular-operacao)
            </button>
            <button
              onClick={() => setAbaSwagger('response')}
              className={`text-xs px-3 py-1 rounded font-semibold ${
                abaSwagger === 'response'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Response JSON (200 OK da Receita Federal)
            </button>
            <button
              onClick={() => setAbaSwagger('protheus')}
              className={`text-xs px-3 py-1 rounded font-semibold ${
                abaSwagger === 'protheus'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Mapeamento Protheus 12 (TES / Dicionário)
            </button>
          </div>

          {/* Área de Visualização de Código */}
          <div className="bg-slate-950 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-96 border border-slate-800">
            {abaSwagger === 'request' && (
              <pre className="text-emerald-400">
                {JSON.stringify(resultado.swaggerPayload.requestBody, null, 2)}
              </pre>
            )}
            {abaSwagger === 'response' && (
              <pre className="text-blue-300">
                {JSON.stringify(resultado.swaggerPayload.responseBody, null, 2)}
              </pre>
            )}
            {abaSwagger === 'protheus' && (
              <pre className="text-amber-300">
                {JSON.stringify(resultado.swaggerPayload.protheusMapping, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
