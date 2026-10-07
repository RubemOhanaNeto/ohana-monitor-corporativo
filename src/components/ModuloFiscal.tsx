import { FC, useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Building2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  TrendingDown,
  TrendingUp,
  Percent,
  Calculator,
  FileCheck,
  Scale,
  DollarSign,
  Layers,
  ArrowRight,
  BarChart3,
  ShieldAlert,
  Server,
  Activity,
  FileText,
  Send,
  Zap,
  BookOpen,
} from 'lucide-react';
import { EmpresaPerfil, FiscalNoticia } from '../types';
import { GraficoConsumoCbsDiretoria } from './GraficoConsumoCbsDiretoria';
import { LogAuditoriaApis } from './LogAuditoriaApis';
import { PainelConformidadeCbs } from './PainelConformidadeCbs';
import { analisarInconsistenciasEmpresa } from '../services/cbsInconsistenciaService';

interface ModuloFiscalProps {
  empresas: EmpresaPerfil[];
  selectedEmpresaId: string | null;
  onSelectEmpresa: (id: string | null) => void;
  noticias: FiscalNoticia[];
  onSelectNoticia: (n: FiscalNoticia) => void;
}

export const ModuloFiscal: FC<ModuloFiscalProps> = ({
  empresas,
  selectedEmpresaId,
  onSelectEmpresa,
  noticias,
  onSelectNoticia,
}) => {
  const [subAba, setSubAba] = useState<
    'apuracao' | 'documentos-cfc' | 'conformidade-cbs' | 'consumo-api' | 'auditoria-apis' | 'reforma' | 'obrigacoes' | 'retencoes'
  >('apuracao');

  const empresaAtiva = empresas.find((e) => e.id === selectedEmpresaId) || empresas[0];

  // Análise de Inconsistências e Riscos da Empresa Ativa
  const inconsistencias = useMemo(() => {
    return analisarInconsistenciasEmpresa(empresaAtiva);
  }, [empresaAtiva]);

  const riscosCriticos = inconsistencias.filter((i) => i.gravidade === 'CRITICO');
  const riscosAlertas = inconsistencias.filter((i) => i.gravidade === 'ALERTA');

  // Métricas calculadas para a empresa ativa
  const faturamento = empresaAtiva?.faturamentoMensalEstimado || 1500000;
  const ehPresumido = empresaAtiva?.regimeTributario === 'LUCRO_PRESUMIDO';
  const ehSimples = empresaAtiva?.regimeTributario === 'SIMPLES_NACIONAL';

  // Apurações simuladas baseadas no faturamento mensal
  const pis = ehPresumido ? faturamento * 0.0065 : ehSimples ? faturamento * 0.0035 : faturamento * 0.0165;
  const cofins = ehPresumido ? faturamento * 0.03 : ehSimples ? faturamento * 0.016 : faturamento * 0.076;
  const iss = faturamento * 0.05; // 5% serviços
  const irpj = ehPresumido ? (faturamento * 0.32) * 0.15 : faturamento * 0.048;
  const csll = ehPresumido ? (faturamento * 0.32) * 0.09 : faturamento * 0.032;
  const inssPatronal = faturamento * 0.045;

  const totalTributosMes = pis + cofins + iss + irpj + csll + inssPatronal;
  const cargaEfetiva = ((totalTributosMes / faturamento) * 100).toFixed(2);

  // Simulação Reforma Tributária (IBS + CBS estimada em 26.5% com eventual crédito ou regime específico)
  const cbsEstimada = faturamento * 0.088; // 8.8%
  const ibsEstimado = faturamento * 0.177; // 17.7%
  const creditosEstimados = faturamento * 0.095; // Créditos de insumos (energia, urnas, combustível, etc.)
  const totalIbsCbsLiquido = (cbsEstimada + ibsEstimado) - creditosEstimados;

  const formatarMoeda = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6" id="modulo-fiscal-root">
      {/* Header com seletor de empresa e KPIs */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Módulo Fiscal & Tributário</h2>
              <p className="text-xs text-slate-500">
                Apuração de tributos federais, estaduais, municipais e projeção da Reforma Tributária (IBS/CBS).
              </p>
            </div>
          </div>
        </div>

        {/* Seletor de Empresa */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={empresaAtiva?.id || ''}
            onChange={(e) => onSelectEmpresa(e.target.value)}
            className="w-full md:w-64 text-xs font-semibold bg-slate-50 border border-slate-300 text-slate-800 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            {empresas.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.nome} ({emp.regimeTributario.replace('_', ' ')})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4 Cards de Resumo Fiscal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Tributos Apurados (Mês)</span>
            <span className="p-1.5 bg-red-50 text-red-700 rounded-md">
              <Calculator className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-black text-slate-900 mt-2">{formatarMoeda(totalTributosMes)}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span>Carga Efetiva:</span>
            <span className="font-bold text-red-600">{cargaEfetiva}% da receita</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Regime Tributário</span>
            <span className="p-1.5 bg-blue-50 text-blue-700 rounded-md">
              <Scale className="w-4 h-4" />
            </span>
          </div>
          <div className="text-base font-extrabold text-slate-900 mt-2">
            {empresaAtiva?.regimeTributario.replace('_', ' ')}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            {empresaAtiva?.opcaoSimples ? 'Optante pelo Simples Nacional' : 'Regime Normal / Cumulativo'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Impacto Reforma (IBS/CBS)</span>
            <span className="p-1.5 bg-purple-50 text-purple-700 rounded-md">
              <Percent className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-black text-purple-900 mt-2">{formatarMoeda(totalIbsCbsLiquido)}</div>
          <div className="text-[11px] text-purple-700 font-medium mt-1">
            Diferencial estimado pós-créditos operacionais
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Obrigações do Mês</span>
            <span className="p-1.5 bg-amber-50 text-amber-700 rounded-md">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-black text-slate-900 mt-2">5 entregas</div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">
            Próxima: DCTFWeb / EFD-Reinf dia 15
          </div>
        </div>
      </div>

      {/* Banner de Alertas e Inconsistências Detectadas */}
      {(riscosCriticos.length > 0 || riscosAlertas.length > 0) && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0">
              <ShieldAlert className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                  Alerta de Conformidade e Riscos Tributários da LC 214/2025
                </h4>
                {riscosCriticos.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white">
                    {riscosCriticos.length} Risco Crítico
                  </span>
                )}
                {riscosAlertas.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-600 text-white">
                    {riscosAlertas.length} Alertas
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-900 mt-0.5">
                Foram identificadas inconsistências cadastrais para <strong>{empresaAtiva.nome}</strong> perante a nova legislação (Split Payment e benefícios fiscais).
              </p>
            </div>
          </div>

          <button
            onClick={() => setSubAba('conformidade-cbs')}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 shrink-0 transition-colors shadow-2xs"
          >
            <span>Ver Diagnóstico Completo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Sub-navegação interna do Módulo Fiscal */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 gap-1.5 overflow-x-auto">
        <button
          onClick={() => setSubAba('apuracao')}
          className={`px-3.5 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
            subAba === 'apuracao'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Apuração Mensal
        </button>

        <button
          onClick={() => setSubAba('documentos-cfc')}
          className={`px-3.5 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
            subAba === 'documentos-cfc'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Documentos Fiscais (CFC/CRCs & Segmentos)</span>
        </button>

        <button
          onClick={() => setSubAba('conformidade-cbs')}
          className={`px-3.5 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
            subAba === 'conformidade-cbs'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Calculadora Piloto CBS (LC 214)</span>
          {inconsistencias.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          )}
        </button>

        <button
          onClick={() => setSubAba('consumo-api')}
          className={`px-3.5 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
            subAba === 'consumo-api'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Consumo da API CBS (Recharts)</span>
        </button>

        <button
          onClick={() => setSubAba('auditoria-apis')}
          className={`px-3.5 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
            subAba === 'auditoria-apis'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Trilha de Auditoria APIs</span>
        </button>

        <button
          onClick={() => setSubAba('reforma')}
          className={`px-3.5 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
            subAba === 'reforma'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Simulador Reforma (IBS/CBS)
        </button>

        <button
          onClick={() => setSubAba('obrigacoes')}
          className={`px-3.5 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
            subAba === 'obrigacoes'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Obrigações Acessórias
        </button>

        <button
          onClick={() => setSubAba('retencoes')}
          className={`px-3.5 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
            subAba === 'retencoes'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Retenções na Fonte
        </button>
      </div>

      {/* CONTEÚDO DA SUB-ABA 1: APURAÇÃO MENSAL */}
      {subAba === 'apuracao' && (
        <div className="bg-white rounded-b-xl border-x border-b border-slate-200 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Demonstrativo de Apuração Tributária - {empresaAtiva.nome}
              </h3>
              <p className="text-xs text-slate-500">
                Base calculada sobre receita estimada de {formatarMoeda(faturamento)} / mês.
              </p>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-full border border-emerald-200">
              CNPJ: {empresaAtiva.cnpj}
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Tributo</th>
                  <th className="p-3">Esfera</th>
                  <th className="p-3">Base de Cálculo</th>
                  <th className="p-3">Alíquota</th>
                  <th className="p-3">Valor Apurado</th>
                  <th className="p-3">Vencimento</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                <tr className="hover:bg-slate-50/50">
                  <td className="p-3 font-bold text-slate-900">PIS/PASEP</td>
                  <td className="p-3 text-slate-500">Federal</td>
                  <td className="p-3">{formatarMoeda(faturamento)}</td>
                  <td className="p-3">{ehPresumido ? '0,65%' : '1,65%'}</td>
                  <td className="p-3 font-semibold text-slate-900">{formatarMoeda(pis)}</td>
                  <td className="p-3">Dia 25 do mês subsequente</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-semibold rounded text-[10px]">
                      Regular
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/50">
                  <td className="p-3 font-bold text-slate-900">COFINS</td>
                  <td className="p-3 text-slate-500">Federal</td>
                  <td className="p-3">{formatarMoeda(faturamento)}</td>
                  <td className="p-3">{ehPresumido ? '3,00%' : '7,60%'}</td>
                  <td className="p-3 font-semibold text-slate-900">{formatarMoeda(cofins)}</td>
                  <td className="p-3">Dia 25 do mês subsequente</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-semibold rounded text-[10px]">
                      Regular
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/50">
                  <td className="p-3 font-bold text-slate-900">ISSQN (Serviços)</td>
                  <td className="p-3 text-slate-500">Municipal</td>
                  <td className="p-3">{formatarMoeda(faturamento)}</td>
                  <td className="p-3">5,00%</td>
                  <td className="p-3 font-semibold text-slate-900">{formatarMoeda(iss)}</td>
                  <td className="p-3">Dia 10 do mês subsequente</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-semibold rounded text-[10px]">
                      Regular
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/50">
                  <td className="p-3 font-bold text-slate-900">IRPJ</td>
                  <td className="p-3 text-slate-500">Federal</td>
                  <td className="p-3">{formatarMoeda(faturamento * 0.32)} (Presunção 32%)</td>
                  <td className="p-3">15,00%</td>
                  <td className="p-3 font-semibold text-slate-900">{formatarMoeda(irpj)}</td>
                  <td className="p-3">Último dia útil do trimestre</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-semibold rounded text-[10px]">
                      Trimestral
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/50">
                  <td className="p-3 font-bold text-slate-900">CSLL</td>
                  <td className="p-3 text-slate-500">Federal</td>
                  <td className="p-3">{formatarMoeda(faturamento * 0.32)} (Presunção 32%)</td>
                  <td className="p-3">9,00%</td>
                  <td className="p-3 font-semibold text-slate-900">{formatarMoeda(csll)}</td>
                  <td className="p-3">Último dia útil do trimestre</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-semibold rounded text-[10px]">
                      Trimestral
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/50">
                  <td className="p-3 font-bold text-slate-900">INSS Patronal / Folha</td>
                  <td className="p-3 text-slate-500">Federal / Previdenciário</td>
                  <td className="p-3">{formatarMoeda(faturamento * 0.22)} (Folha Salarial)</td>
                  <td className="p-3">20,00% + RAT</td>
                  <td className="p-3 font-semibold text-slate-900">{formatarMoeda(inssPatronal)}</td>
                  <td className="p-3">Dia 20 (DCTFWeb)</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-semibold rounded text-[10px]">
                      Regular
                    </span>
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                <tr>
                  <td className="p-3 col-span-4" colSpan={4}>TOTAL DE TRIBUTOS APURADOS / ESTIMADOS</td>
                  <td className="p-3 text-sm font-black text-red-600" colSpan={3}>
                    {formatarMoeda(totalTributosMes)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA SUB-ABA 2: REFORMA TRIBUTÁRIA */}
      {subAba === 'reforma' && (
        <div className="bg-white rounded-b-xl border-x border-b border-slate-200 p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-purple-600" />
              Simulador da Reforma Tributária (PLP 68/2024 - IBS e CBS)
            </h3>
            <p className="text-xs text-slate-500">
              Análise comparativa da carga tributária atual versus o modelo IVA Dual para {empresaAtiva.nome}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cenário Atual */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Cenário 1: Regime Atual ({empresaAtiva.regimeTributario.replace('_', ' ')})
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600">PIS + COFINS cumulativo:</span>
                  <span className="font-semibold text-slate-900">{formatarMoeda(pis + cofins)} (3,65%)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600">ISSQN Municipal:</span>
                  <span className="font-semibold text-slate-900">{formatarMoeda(iss)} (5,00%)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600">Créditos de insumos aproveitáveis:</span>
                  <span className="font-semibold text-slate-400">R$ 0,00 (Regime Cumulativo)</span>
                </div>
                <div className="flex justify-between py-2 border-t-2 border-slate-300 font-bold text-sm">
                  <span>Carga Indireta Atual:</span>
                  <span className="text-slate-900">{formatarMoeda(pis + cofins + iss)} (8,65%)</span>
                </div>
              </div>
            </div>

            {/* Cenário Reforma */}
            <div className="bg-purple-50/50 p-5 rounded-xl border border-purple-200 space-y-3">
              <span className="text-xs font-bold text-purple-900 uppercase tracking-wider block">
                Cenário 2: IVA Dual (CBS Federal + IBS Estadual/Municipal)
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-purple-100">
                  <span className="text-purple-800">CBS Federal Bruta (8,8%):</span>
                  <span className="font-semibold text-purple-950">{formatarMoeda(cbsEstimada)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-purple-100">
                  <span className="text-purple-800">IBS Subnacional Bruto (17,7%):</span>
                  <span className="font-semibold text-purple-950">{formatarMoeda(ibsEstimado)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-purple-100">
                  <span className="text-emerald-700 font-semibold">(-) Crédito Pleno de Insumos:</span>
                  <span className="font-bold text-emerald-700">-{formatarMoeda(creditosEstimados)}</span>
                </div>
                <div className="flex justify-between py-2 border-t-2 border-purple-300 font-bold text-sm">
                  <span className="text-purple-950">IVA Dual Líquido a Pagar:</span>
                  <span className="text-purple-900">{formatarMoeda(totalIbsCbsLiquido)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Atenção Estratégica: Setor Funerário & Assistência Social</span>
              <span>
                Serviços funerários e cremações estão pleiteando alíquota reduzida de 60% na regulamentação da EC 132/2023 
                (PLP 68/2024), equiparando-se aos serviços de saúde e assistência funerária básica. Caso a redução seja aprovada, 
                a alíquota efetiva cairá para ~10,6%, com pleno aproveitamento de créditos de urnas e combustível.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA SUB-ABA 3: OBRIGAÇÕES ACESSÓRIAS */}
      {subAba === 'obrigacoes' && (
        <div className="bg-white rounded-b-xl border-x border-b border-slate-200 p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Calendário de Obrigações Fiscais e Acessórias
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                nome: 'EFD-Reinf (Escrituração Fiscal Digital de Retenções)',
                orgao: 'Receita Federal',
                dia: 'Dia 15 de cada mês',
                descricao: 'Informações sobre retenções de IR, CSRF e serviços tomados com cessão de mão de obra.',
                status: 'EM_DIA',
              },
              {
                nome: 'DCTFWeb (Declaração de Débitos e Créditos Tributários)',
                orgao: 'Receita Federal',
                dia: 'Dia 15 de cada mês',
                descricao: 'Gera a guia única DARF numerado para quitação previdenciária e retenções.',
                status: 'EM_DIA',
              },
              {
                nome: 'EFD-Contribuições (PIS/COFINS)',
                orgao: 'SPED / RFB',
                dia: '10º dia útil do segundo mês subsequente',
                descricao: 'Escrituração digital de todas as notas fiscais de serviços e receitas auferidas.',
                status: 'EM_DIA',
              },
              {
                nome: 'Declaração Mensal de ISS (DMS / WebISS)',
                orgao: 'Prefeitura Municipal',
                dia: 'Dia 10 do mês subsequente',
                descricao: 'Apuração e emissão do DAM/Documento de Arrecadação Municipal do ISSQN.',
                status: 'EM_DIA',
              },
            ].map((ob, idx) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-slate-900 text-xs">{ob.nome}</span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    {ob.status === 'EM_DIA' ? 'Em conformidade' : 'Pendente'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-800">Prazo legal: </span>
                  {ob.dia} ({ob.orgao})
                </div>
                <p className="text-[11px] text-slate-500">{ob.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONTEÚDO DA SUB-ABA 4: RETENÇÕES NA FONTE */}
      {subAba === 'retencoes' && (
        <div className="bg-white rounded-b-xl border-x border-b border-slate-200 p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Regras de Retenção na Fonte por Código de Serviço
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Código LC 116</th>
                  <th className="p-3">Descrição do Serviço</th>
                  <th className="p-3">IRRF (1,5%)</th>
                  <th className="p-3">CSRF (4,65%)</th>
                  <th className="p-3">ISS Retido Tomador</th>
                  <th className="p-3">Regra Geral</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="p-3 font-mono font-bold">4.01</td>
                  <td className="p-3">Medicina e biomedicina (Consultas médicas e especializadas)</td>
                  <td className="p-3 font-bold text-emerald-700">Retém 1,5% (PJ)</td>
                  <td className="p-3 font-bold text-emerald-700">Retém 4,65% (se PJ para PJ)</td>
                  <td className="p-3 text-slate-500">Local do estabelecimento prestador (Belém)</td>
                  <td className="p-3">Exige DMED da Receita Federal e conciliação com convênios TISS</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-bold">4.02 / 4.03</td>
                  <td className="p-3">Hospitais, clínicas médicas ambulatoriais, exames e diagnósticos</td>
                  <td className="p-3 font-bold text-emerald-700">Retém 1,5% (PJ)</td>
                  <td className="p-3 font-bold text-emerald-700">Retém 4,65% (se PJ para PJ)</td>
                  <td className="p-3 text-slate-500">Local do estabelecimento prestador</td>
                  <td className="p-3">Equiparação hospitalar (Lei 9.249/95) reduz base IRPJ para 8% e CSLL 12%</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-bold">25.01</td>
                  <td className="p-3">Funerais, inclusive fornecimento de caixão, urna ou esquifes</td>
                  <td className="p-3 text-slate-400">Não retém</td>
                  <td className="p-3 text-slate-400">Não retém</td>
                  <td className="p-3 font-semibold text-slate-900">Depende do Município (Local da prestação)</td>
                  <td className="p-3">Tributação normal na sede do prestador ou local do funeral</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-bold">25.02</td>
                  <td className="p-3">Cremação de corpos e partes de corpos cadavéricos</td>
                  <td className="p-3 text-slate-400">Não retém</td>
                  <td className="p-3 text-slate-400">Não retém</td>
                  <td className="p-3 font-semibold text-slate-900">Local da instalação crematória</td>
                  <td className="p-3">Local onde se encontra o crematório</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-bold">25.03 / 25.05</td>
                  <td className="p-3">Gestão de planos de assistência funeral e manutenção de cemitérios</td>
                  <td className="p-3 text-slate-400">Não retém</td>
                  <td className="p-3 text-slate-400">Não retém</td>
                  <td className="p-3 text-slate-500">Sede da operadora de planos</td>
                  <td className="p-3">Segregar cessão de jazigo perpétuo (Súmula Vinculante 31 - não incidência de ISS)</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-bold">17.01</td>
                  <td className="p-3">Consultoria em gestão e assessoria empresarial</td>
                  <td className="p-3 font-bold text-emerald-700">Retém 1,5%</td>
                  <td className="p-3 font-bold text-emerald-700">Retém 4,65% (se PJ para PJ)</td>
                  <td className="p-3 text-slate-400">Geralmente não retém (Sede prestador)</td>
                  <td className="p-3">Retenções federais obrigatórias quando contratado por pessoas jurídicas</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA SUB-ABA: DOCUMENTOS FISCAIS & AUDITORIA CFC/CRCS POR SEGMENTO */}
      {subAba === 'documentos-cfc' && (
        <div className="bg-white rounded-b-xl border-x border-b border-slate-200 p-6 space-y-6">
          {/* Header com Poder de Polícia dos CRCs */}
          <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold tracking-tight">
                  Diretrizes do Sistema CFC/CRCs & NBC TG 22 (Informações por Segmento)
                </h3>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded">
                  Manual de Fiscalização 2025
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-4xl">
                O Manual de Fiscalização do CFC estabelece que os CRCs possuem <strong>poder de polícia</strong> para examinar livros e documentos fiscais/contábeis em posse de escritórios ou profissionais, garantindo a conformidade técnica das apurações por segmento e prevenindo passivos tributários.
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-slate-800 text-slate-200 px-3 py-1 rounded-lg border border-slate-700 shrink-0">
              Orientação Técnica CFC nº 1/2026
            </span>
          </div>

          {/* Matriz de Documentos Fiscais por Segmento */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Documentos Fiscais para Análise por Segmento de Atuação
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Comércio Geral */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Comércio Geral (Varejo e Atacado)</span>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Varejo / Atacado</span>
                </div>
                <div className="text-xs text-slate-700">
                  <strong>Documentos e SPED:</strong> NF-e (Modelo 55), NFC-e (Modelo 65), SPED Fiscal (EFD ICMS/IPI) e Bloco K (Controle de Estoque).
                </div>
                <div className="text-[11px] text-slate-600">
                  <strong>Foco do Cruzamento:</strong> Confronto de XMLs de entrada/saída, consistência de inventário físico, uso de créditos e correções nos Códigos de Situação Tributária (CST).
                </div>
              </div>

              {/* Indústria */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Indústria e Manufatura</span>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Industrial</span>
                </div>
                <div className="text-xs text-slate-700">
                  <strong>Documentos e SPED:</strong> NF-e, Bloco K completo, EFD ICMS/IPI e notas de insumos/matérias-primas.
                </div>
                <div className="text-[11px] text-slate-600">
                  <strong>Foco do Cruzamento:</strong> Rastreabilidade de perdas no processo produtivo, apropriação de custos de produção e apuração do IPI.
                </div>
              </div>

              {/* Prestação de Serviços (Funerário & Cemiterial - Recanto da Saudade) */}
              <div className={`p-4 rounded-xl border space-y-2 ${empresaAtiva.id === 'recanto-da-saudade' ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Serviços Funerários, Cemitérios & Planos</span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    {empresaAtiva.id === 'recanto-da-saudade' ? 'EMPRESA ATIVA: Recanto' : 'Cemiterial'}
                  </span>
                </div>
                <div className="text-xs text-slate-700">
                  <strong>Documentos e SPED:</strong> NFS-e (Item 25 - 25.01 a 25.05), EFD-Reinf, Contratos de Cessão de Jazigo Perpétuo e EFD-Contribuições.
                </div>
                <div className="text-[11px] text-slate-600">
                  <strong>Foco do Cruzamento:</strong> Segregação de receitas de locação de jazigos (não incidência de ISS / Súmula Vinculante 31) versus serviços de sepultamento/manutenção (com ISS 5%), e apropriação por competência da receita de planos funerários (NBC TG 47).
                </div>
              </div>

              {/* Prestação de Serviços (Saúde & Clínicas - Instituto GO) */}
              <div className={`p-4 rounded-xl border space-y-2 ${empresaAtiva.id === 'instituto-go' ? 'bg-sky-50/70 border-sky-300 ring-2 ring-sky-500/20' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Saúde, Clínicas Médicas & Diagnósticos</span>
                  <span className="text-[10px] font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded">
                    {empresaAtiva.id === 'instituto-go' ? 'EMPRESA ATIVA: Instituto GO' : 'Saúde / Medicina'}
                  </span>
                </div>
                <div className="text-xs text-slate-700">
                  <strong>Documentos e SPED:</strong> NFS-e Belém (Item 4.01 a 4.23), DMED (Declaração de Serviços Médicos da RFB), Lotes TISS/TUSS XML e EFD-Reinf (Série R-4000).
                </div>
                <div className="text-[11px] text-slate-600">
                  <strong>Foco do Cruzamento:</strong> Cruzamento estrito entre a DMED (gastos de pessoas físicas dedutíveis no IRPF) e as NFS-e emitidas. Retenção de CSRF (4,65%) e IRRF (1,5%) em repasses ao corpo clínico e comprovação de requisitos da equiparação hospitalar (Lei 9.249/95).
                </div>
              </div>

              {/* Transporte e Logística */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Transporte e Logística Especializada (Cortejos e Cargas)</span>
                  <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">Transporte</span>
                </div>
                <div className="text-xs text-slate-700">
                  <strong>Documentos e SPED:</strong> CT-e (Conhecimento de Transporte Eletrônico) e MDF-e (Manifesto Eletrônico de Documentos Fiscais).
                </div>
                <div className="text-[11px] text-slate-600">
                  <strong>Foco do Cruzamento:</strong> Validação do creditamento de ICMS sobre combustíveis/peças e regularidade do trajeto versus documentos fiscais emitidos.
                </div>
              </div>
            </div>
          </div>

          {/* Obrigações Digitais Gerais Coletadas pelos CRCs e Fisco */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Obrigações Digitais Gerais Coletadas pelos CRCs e Fisco
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="font-bold text-blue-900 block">ECD (Escrituração Contábil Digital)</span>
                <p className="text-[11px] text-slate-600">
                  Validação dos livros Diário e Razão emitidos pelo profissional contábil responsável registrado no CRC.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="font-bold text-purple-900 block">ECF (Escrituração Contábil Fiscal)</span>
                <p className="text-[11px] text-slate-600">
                  Cruzamento do lucro líquido apurado (LALUR/LACS) com os tributos federais devidos (IRPJ e CSLL).
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="font-bold text-emerald-900 block">EFD Contribuições</span>
                <p className="text-[11px] text-slate-600">
                  Apuração da base de cálculo detalhada e tomada de créditos sobre PIS e COFINS (regime cumulativo vs não-cumulativo).
                </p>
              </div>
            </div>
          </div>

          {/* Normas Técnicas Relevantes & Reforma 2026 */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 space-y-2 text-xs">
            <h4 className="font-bold text-amber-950 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Normas Técnicas Aplicáveis & Orientação Técnica CFC nº 1/2026
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-amber-900">
              <div className="p-2.5 bg-white/80 rounded-lg border border-amber-200">
                <strong className="block font-bold text-slate-900">NBC TG 22 — Informações por Segmento</strong>
                Exige que entidades evidenciem suas demonstrações financeiras separadas por componentes/segmentos operacionais, permitindo aos usuários avaliar a natureza e os efeitos financeiros das atividades econômicas.
              </div>
              <div className="p-2.5 bg-white/80 rounded-lg border border-amber-200">
                <strong className="block font-bold text-slate-900">Orientação Técnica CFC nº 1/2026 (IBS / CBS)</strong>
                Alinha a contabilização e a análise fiscal em período de testes operacionais do IBS (0,1%) e da CBS (0,9%), preparando o plano de contas e o cruzamento com documentos fiscais eletrônicos por segmento.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA SUB-ABA: CONFORMIDADE PILOTO CBS (LC 214/2025) */}
      {subAba === 'conformidade-cbs' && (
        <PainelConformidadeCbs
          empresas={empresas}
          empresaAtivaId={empresaAtiva.id}
          onSelectEmpresa={onSelectEmpresa}
        />
      )}

      {/* CONTEÚDO DA SUB-ABA: CONSUMO DA API CBS POR DIRETORIA (RECHARTS) */}
      {subAba === 'consumo-api' && (
        <GraficoConsumoCbsDiretoria />
      )}

      {/* CONTEÚDO DA SUB-ABA: TRILHA DE AUDITORIA DAS CONSULTAS APIS */}
      {subAba === 'auditoria-apis' && (
        <LogAuditoriaApis
          empresas={empresas}
          empresaAtivaId={empresaAtiva.id}
        />
      )}
    </div>
  );
};
