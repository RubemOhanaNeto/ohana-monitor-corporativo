// src/components/PainelConformidadeCbs.tsx
// Painel Interativo de Conformidade da Reforma Tributária integrado ao Piloto CBS/IBS da Receita Federal
// Incorpora alertas automáticos de riscos e inconsistências cadastrais perante a LC 214/2025

import React, { FC, useState, useMemo } from 'react';
import {
  Calculator,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Server,
  ExternalLink,
  ShieldAlert,
  Coins,
  ArrowRight,
  Sparkles,
  Layers,
  FileCheck,
  Building2,
  RefreshCw,
  Info,
} from 'lucide-react';
import { EmpresaPerfil } from '../types';
import { calcularTributacaoReforma, SimulacaoCbsInput, SimulacaoCbsResultado } from '../services/pilotoCbsService';
import { analisarInconsistenciasEmpresa, InconsistenciaTributaria } from '../services/cbsInconsistenciaService';

interface PainelConformidadeCbsProps {
  empresas: EmpresaPerfil[];
  empresaAtivaId?: string;
  onSelectEmpresa: (id: string) => void;
}

export const PainelConformidadeCbs: FC<PainelConformidadeCbsProps> = ({
  empresas,
  empresaAtivaId,
  onSelectEmpresa,
}) => {
  const empresaSelecionada = empresas.find((e) => e.id === empresaAtivaId) || empresas[0];

  const [anoSimulacao, setAnoSimulacao] = useState<number>(2026);
  const [valorOperacao, setValorOperacao] = useState<number>(
    empresaSelecionada?.faturamentoMensalEstimado || 1500000
  );
  const [tipoOperacao, setTipoOperacao] = useState<
    'SERVICO' | 'MERCADORIA' | 'LOCACAO_JAZIGO' | 'CURSO_EDUCACIONAL'
  >(
    empresaSelecionada?.id === 'instituto-go'
      ? 'CURSO_EDUCACIONAL'
      : empresaSelecionada?.id === 'recanto-da-saudade'
      ? 'LOCACAO_JAZIGO'
      : 'SERVICO'
  );
  const [percentualCredito, setPercentualCredito] = useState<number>(35);
  const [abaInterna, setAbaInterna] = useState<'comparativo' | 'split' | 'protheus' | 'inconsistencias'>('comparativo');

  // Cálculo de simulação via Piloto CBS
  const resultadoSimulacao: SimulacaoCbsResultado = useMemo(() => {
    const input: SimulacaoCbsInput = {
      empresaId: empresaSelecionada.id,
      anoSimulacao,
      valorOperacao,
      tipoOperacao,
      cnae: empresaSelecionada.cnaePrincipalDetalhado?.codigo || '9603-3/01',
      regimeTributario:
        empresaSelecionada.regimeTributario === 'MEI'
          ? 'SIMPLES_NACIONAL'
          : empresaSelecionada.regimeTributario,
      ufOrigem: empresaSelecionada.endereco?.uf || 'PA',
      ufDestino: empresaSelecionada.endereco?.uf || 'PA',
      municipioOrigem: empresaSelecionada.endereco?.municipio || 'Belém',
      municipioDestino: empresaSelecionada.endereco?.municipio || 'Belém',
      percentualCreditoInsumos: percentualCredito,
    };
    return calcularTributacaoReforma(input);
  }, [empresaSelecionada, anoSimulacao, valorOperacao, tipoOperacao, percentualCredito]);

  // Análise de Inconsistências & Riscos Tributários
  const inconsistencias: InconsistenciaTributaria[] = useMemo(() => {
    return analisarInconsistenciasEmpresa(empresaSelecionada, resultadoSimulacao);
  }, [empresaSelecionada, resultadoSimulacao]);

  const totalCriticos = inconsistencias.filter((i) => i.gravidade === 'CRITICO').length;
  const totalAlertas = inconsistencias.filter((i) => i.gravidade === 'ALERTA').length;

  const formatarMoeda = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-6">
      {/* Top Banner de Conexão com API Oficial */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-xl p-4 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Server className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                API Oficial Calculadora de Consumo — Receita Federal do Brasil
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                piloto-cbs.tributos.gov.br
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulação de conformidade da LC 214/2025, Split Payment bancário D+0 e regras de transição vigentes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://piloto-cbs.tributos.gov.br/servico/calculadora-consumo/api/swagger-ui/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 transition-colors"
          >
            <span>Swagger UI Oficial</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </div>

      {/* Alerta Visual de Inconsistências e Riscos Tributários */}
      <div className="bg-amber-50/80 border border-amber-300 rounded-xl p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-amber-950">
                  Diagnóstico de Inconsistências e Riscos da Reforma — {empresaSelecionada.nome}
                </h4>
                {totalCriticos > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white">
                    {totalCriticos} Risco Crítico
                  </span>
                )}
                {totalAlertas > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-600 text-white">
                    {totalAlertas} Alertas
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-800 mt-0.5">
                Comparativo automático entre o cadastro atual da empresa e as regras da LC 214/2025 da Receita Federal.
              </p>
            </div>
          </div>
        </div>

        {/* Lista resumida das inconsistências detectadas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {inconsistencias.slice(0, 2).map((inc) => (
            <div
              key={inc.id}
              className={`p-3 rounded-lg border text-xs flex flex-col justify-between gap-2 ${
                inc.gravidade === 'CRITICO'
                  ? 'bg-white border-red-200'
                  : 'bg-white border-amber-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      inc.gravidade === 'CRITICO'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {inc.gravidade}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{inc.categoria}</span>
                </div>
                <h5 className="font-bold text-slate-900 mt-1.5">{inc.titulo}</h5>
                <p className="text-slate-600 mt-1 line-clamp-2">{inc.descricao}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-700 flex items-center justify-between">
                <span className="font-semibold text-emerald-800">Ação Protheus:</span>
                <span className="font-mono text-slate-600 truncate max-w-[190px]">
                  {inc.acaoCorretivaProtheus.tabela}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Parâmetros da Simulação (Formulário Interativo) */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Calculator className="w-4 h-4 text-emerald-600" />
            <span>Parâmetros da Operação para Cálculo</span>
          </h4>
          <span className="text-xs text-slate-500 font-medium">
            Empresa: <strong>{empresaSelecionada.nome}</strong> ({empresaSelecionada.regimeTributario.replace('_', ' ')})
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Seletor de Empresa */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Empresa Alvo:</label>
            <select
              value={empresaSelecionada.id}
              onChange={(e) => onSelectEmpresa(e.target.value)}
              className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {empresas.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.nome} ({emp.regimeTributario.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>

          {/* Valor da Operação */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Valor da Operação / Faturamento:</label>
            <input
              type="number"
              value={valorOperacao}
              onChange={(e) => setValorOperacao(Math.max(1000, Number(e.target.value) || 0))}
              step={50000}
              className="w-full text-xs font-bold bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Tipo de Operação */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Tipo de Serviço / Operação:</label>
            <select
              value={tipoOperacao}
              onChange={(e) => setTipoOperacao(e.target.value as any)}
              className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="SERVICO">Serviço Geral (Alíquota Padrão 26.5%)</option>
              <option value="LOCACAO_JAZIGO">Cessão de Jazigo Cemiterial (Regime Específico)</option>
              <option value="CURSO_EDUCACIONAL">Cursos e Treinamentos (Redução de 60%)</option>
              <option value="MERCADORIA">Venda de Urnas / Produtos (Mercadoria)</option>
            </select>
          </div>

          {/* Ano de Projeção */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Ano de Vigência da Reforma:</label>
            <select
              value={anoSimulacao}
              onChange={(e) => setAnoSimulacao(Number(e.target.value))}
              className="w-full text-xs font-bold bg-white border border-slate-300 rounded-lg p-2 text-purple-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value={2026}>2026 — Alíquota Teste (0.9% CBS + 0.1% IBS)</option>
              <option value={2027}>2027 — CBS Plena (8.8%) + Fim PIS/COFINS</option>
              <option value={2029}>2029 — Início da Transição IBS (10%)</option>
              <option value={2031}>2031 — Transição Intermediária IBS (30%)</option>
              <option value={2033}>2033 — Vigência Plena (CBS 8.8% + IBS 17.7%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4 Cards de Veredito Fiscal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sistema Atual */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
            <span>Sistema Atual (PIS/COFINS/ISS)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-bold">
              {resultadoSimulacao.sistemaAtual.aliquotaEfetivaTotal}%
            </span>
          </div>
          <div className="text-xl font-black text-slate-900 mt-2">
            {formatarMoeda(resultadoSimulacao.sistemaAtual.totalTributos)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            PIS/COFINS + ISS 5% Belém/Ananindeua
          </div>
        </div>

        {/* Reforma no Ano Selecionado */}
        <div className="bg-purple-50/60 border border-purple-200 rounded-xl p-4">
          <div className="text-xs font-semibold text-purple-700 flex items-center justify-between">
            <span>Reforma no Ano {anoSimulacao}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-200 text-purple-800 font-bold">
              {resultadoSimulacao.transicao.aliquotaEfetivaAno}% efetiva
            </span>
          </div>
          <div className="text-xl font-black text-purple-950 mt-2">
            {formatarMoeda(resultadoSimulacao.transicao.totalEfetivoAno)}
          </div>
          <div className="text-[11px] text-purple-700 mt-1 font-medium">
            {resultadoSimulacao.transicao.descricaoFase}
          </div>
        </div>

        {/* Split Payment Retenção D+0 */}
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4">
          <div className="text-xs font-semibold text-emerald-800 flex items-center justify-between">
            <span>Retenção Split Payment (D+0)</span>
            <Coins className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-950 mt-2">
            {formatarMoeda(resultadoSimulacao.splitPayment.totalRetencaoInstantanea)}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1">
            Crédito Líquido no Caixa: <strong>{formatarMoeda(resultadoSimulacao.splitPayment.caixaLiquidoD0)}</strong>
          </div>
        </div>

        {/* Variação Líquida */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
            <span>Variação Líquida de Carga</span>
            {resultadoSimulacao.transicao.diferencaValor >= 0 ? (
              <TrendingUp className="w-4 h-4 text-red-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-emerald-600" />
            )}
          </div>
          <div
            className={`text-xl font-black mt-2 ${
              resultadoSimulacao.transicao.diferencaValor >= 0 ? 'text-red-600' : 'text-emerald-700'
            }`}
          >
            {resultadoSimulacao.transicao.diferencaValor >= 0 ? '+' : ''}
            {formatarMoeda(resultadoSimulacao.transicao.diferencaValor)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {resultadoSimulacao.transicao.variacaoPercentual >= 0 ? '+' : ''}
            {resultadoSimulacao.transicao.variacaoPercentual}% em relação ao sistema atual
          </div>
        </div>
      </div>

      {/* Sub-abas de Detalhamento Analítico */}
      <div className="space-y-4">
        <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
          <button
            onClick={() => setAbaInterna('comparativo')}
            className={`pb-2 border-b-2 transition-colors ${
              abaInterna === 'comparativo' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Detalhamento Tributo a Tributo
          </button>
          <button
            onClick={() => setAbaInterna('split')}
            className={`pb-2 border-b-2 transition-colors ${
              abaInterna === 'split' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Mecanismo Split Payment D+0
          </button>
          <button
            onClick={() => setAbaInterna('protheus')}
            className={`pb-2 border-b-2 transition-colors ${
              abaInterna === 'protheus' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Mapeamento ERP Protheus TOTVS
          </button>
          <button
            onClick={() => setAbaInterna('inconsistencias')}
            className={`pb-2 border-b-2 transition-colors ${
              abaInterna === 'inconsistencias' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Auditoria de Inconsistências ({inconsistencias.length})
          </button>
        </div>

        {/* ABA: DETALHAMENTO */}
        {abaInterna === 'comparativo' && (
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Tributo</th>
                  <th className="p-3">Regra Atual</th>
                  <th className="p-3">Valor Atual</th>
                  <th className="p-3">Nova Regra (LC 214/2025)</th>
                  <th className="p-3">Valor Reforma (Ano {anoSimulacao})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-3 font-bold text-slate-800">PIS / PASEP</td>
                  <td className="p-3">{resultadoSimulacao.sistemaAtual.pisAliquota}% (Cumulativo)</td>
                  <td className="p-3 font-semibold">{formatarMoeda(resultadoSimulacao.sistemaAtual.pis)}</td>
                  <td className="p-3 text-slate-500">Substituído pela CBS</td>
                  <td className="p-3 font-semibold text-purple-900">
                    {formatarMoeda(resultadoSimulacao.transicao.pisCofinsResidual > 0 ? resultadoSimulacao.sistemaAtual.pis : 0)}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-slate-800">COFINS</td>
                  <td className="p-3">{resultadoSimulacao.sistemaAtual.cofinsAliquota}% (Cumulativo)</td>
                  <td className="p-3 font-semibold">{formatarMoeda(resultadoSimulacao.sistemaAtual.cofins)}</td>
                  <td className="p-3 text-slate-500">Substituído pela CBS</td>
                  <td className="p-3 font-semibold text-purple-900">
                    {formatarMoeda(resultadoSimulacao.transicao.pisCofinsResidual > 0 ? resultadoSimulacao.sistemaAtual.cofins : 0)}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-slate-800">ISS Municipal (Belém/Ananindeua)</td>
                  <td className="p-3">{resultadoSimulacao.sistemaAtual.issAliquota}% s/ faturamento</td>
                  <td className="p-3 font-semibold">{formatarMoeda(resultadoSimulacao.sistemaAtual.iss)}</td>
                  <td className="p-3 text-slate-500">Substituído pelo IBS Municipal</td>
                  <td className="p-3 font-semibold text-purple-900">
                    {formatarMoeda(resultadoSimulacao.transicao.icmsIssResidual > 0 ? resultadoSimulacao.sistemaAtual.iss : 0)}
                  </td>
                </tr>
                <tr className="bg-purple-50/40">
                  <td className="p-3 font-bold text-purple-900">CBS (Contribuição Federal)</td>
                  <td className="p-3 text-slate-400">Inexistente</td>
                  <td className="p-3 font-semibold text-slate-400">R$ 0,00</td>
                  <td className="p-3 font-semibold text-purple-800">
                    {resultadoSimulacao.sistemaReforma.cbsAliquotaNominal}% nominal (Com créditos)
                  </td>
                  <td className="p-3 font-extrabold text-purple-900">
                    {formatarMoeda(resultadoSimulacao.transicao.cbsTransicao)}
                  </td>
                </tr>
                <tr className="bg-purple-50/40">
                  <td className="p-3 font-bold text-purple-900">IBS Subnacional (Estadual + Municipal)</td>
                  <td className="p-3 text-slate-400">Inexistente</td>
                  <td className="p-3 font-semibold text-slate-400">R$ 0,00</td>
                  <td className="p-3 font-semibold text-purple-800">
                    IBS PA: {resultadoSimulacao.sistemaReforma.ibsEstadualAliquota}% | Mun: {resultadoSimulacao.sistemaReforma.ibsMunicipalAliquota}%
                  </td>
                  <td className="p-3 font-extrabold text-purple-900">
                    {formatarMoeda(resultadoSimulacao.transicao.ibsTransicao)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* ABA: SPLIT PAYMENT */}
        {abaInterna === 'split' && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-emerald-600" />
              <h5 className="font-bold text-slate-900">Fluxo de Liquidação Financeira Instantânea D+0</h5>
            </div>
            <p className="text-slate-600">
              Na emissão da NFS-e conectada à adquirente bancária (PIX, Boleto ou Cartão), o valor bruto de{' '}
              <strong>{formatarMoeda(valorOperacao)}</strong> é automaticamente dividido:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Retenção CBS Federal (RFB):</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {formatarMoeda(resultadoSimulacao.splitPayment.retencaoImediataCbs)}
                </span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Retenção IBS (Comitê Gestor):</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {formatarMoeda(resultadoSimulacao.splitPayment.retencaoImediataIbs)}
                </span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-300">
                <span className="text-[11px] text-emerald-800 block font-semibold">Creditado em Conta Corrente:</span>
                <span className="font-extrabold text-emerald-900 text-sm">
                  {formatarMoeda(resultadoSimulacao.splitPayment.caixaLiquidoD0)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ABA: PROTHEUS TOTVS */}
        {abaInterna === 'protheus' && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-indigo-600" />
              <h5 className="font-bold text-slate-900">Parâmetros de Integração Protheus TOTVS (FISA022)</h5>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 font-mono">Tabela SF4 (Tipos de Entrada/Saída)</span>
                <div className="font-bold text-slate-800 mt-1">F4_ALQCBS = {resultadoSimulacao.sistemaReforma.cbsAliquotaNominal}%</div>
                <div className="font-bold text-slate-800">F4_ALQIBS = {resultadoSimulacao.sistemaReforma.ibsEstadualAliquota + resultadoSimulacao.sistemaReforma.ibsMunicipalAliquota}%</div>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 font-mono">Tabela SB1 (Cadastro de Produtos/Serviços)</span>
                <div className="font-bold text-slate-800 mt-1">B1_CODISS = 9603-3/01</div>
                <div className="font-bold text-slate-800">B1_NBS = 1.0101 (Serviços Funerários/Cemiteriais)</div>
              </div>
            </div>
          </div>
        )}

        {/* ABA: INCONSISTÊNCIAS DETALHADAS */}
        {abaInterna === 'inconsistencias' && (
          <div className="space-y-3">
            {inconsistencias.map((inc) => (
              <div
                key={inc.id}
                className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        inc.gravidade === 'CRITICO'
                          ? 'bg-red-100 text-red-800'
                          : inc.gravidade === 'ALERTA'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {inc.gravidade}
                    </span>
                    <h5 className="font-bold text-slate-900">{inc.titulo}</h5>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{inc.categoria}</span>
                </div>

                <p className="text-slate-600">{inc.descricao}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 bg-slate-50 p-2.5 rounded-lg">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block">Parâmetro Atual no Cadastro:</span>
                    <span className="text-slate-800 font-medium">{inc.parametroAtualEmpresa}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-emerald-800 block">Exigência Oficial LC 214/2025:</span>
                    <span className="text-emerald-950 font-medium">{inc.parametroEsperadoOficial}</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] border-t border-slate-100">
                  <div className="text-slate-600">
                    <strong>Ação Recomendada:</strong> {inc.acaoCorretivaProtheus.procedimento} ({inc.acaoCorretivaProtheus.tabela})
                  </div>
                  <div className="text-slate-400 font-mono">{inc.fundamentoLegal}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
