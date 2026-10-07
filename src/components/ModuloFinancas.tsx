import { FC, useState, useEffect } from 'react';
import {
  DollarSign,
  Building2,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Wallet,
  Landmark,
  CreditCard,
  Layers,
  Filter,
  Stethoscope,
  Activity,
} from 'lucide-react';
import { EmpresaPerfil, TituloFinanceiro, IndicadorEconomico } from '../types';
import { obterDadosSegmentoEmpresa } from '../data/segmentoEmpresasData';

interface ModuloFinancasProps {
  empresas: EmpresaPerfil[];
  selectedEmpresaId: string | null;
  onSelectEmpresa: (id: string | null) => void;
}

export const ModuloFinancas: FC<ModuloFinancasProps> = ({
  empresas,
  selectedEmpresaId,
  onSelectEmpresa,
}) => {
  const [subAba, setSubAba] = useState<'kpis' | 'fluxo-caixa' | 'contas' | 'macro'>('kpis');
  const [indicadores, setIndicadores] = useState<IndicadorEconomico[]>([]);
  const [filtroTipoContas, setFiltroTipoContas] = useState<'TODOS' | 'PAGAR' | 'RECEBER'>('TODOS');

  const empresaAtiva = empresas.find((e) => e.id === selectedEmpresaId) || empresas[0];
  const dadosSegmento = obterDadosSegmentoEmpresa(empresaAtiva?.id);
  const isClinica = dadosSegmento.setorCodigo === 'SAUDE_CLINICAS';

  const faturamentoMensal = empresaAtiva?.faturamentoMensalEstimado || (isClinica ? 800000 : 1541660);
  const faturamentoAnual = empresaAtiva?.faturamentoAnualEstimado || (isClinica ? 9600000 : 18500000);

  // Buscar indicadores macroeconômicos do backend
  useEffect(() => {
    fetch('/api/indicadores-economicos')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.indicadores) {
          setIndicadores(data.indicadores);
        }
      })
      .catch(() => {
        // Fallback default
        setIndicadores([
          { nome: 'Taxa Selic Meta', sigla: 'SELIC', valor: 10.5, unidade: '% a.a.', periodicidade: 'Anual', dataAtualizacao: 'Banco Central', impactoNegocio: 'Balizador de juros de mora tributários e rendimento de caixa.' },
          { nome: 'CDI Over', sigla: 'CDI', valor: 10.4, unidade: '% a.a.', periodicidade: 'Anual', dataAtualizacao: 'B3', impactoNegocio: 'Remuneração de sobra de caixa e captação de recursos.' },
          { nome: 'IPCA 12M', sigla: 'IPCA', valor: 4.24, unidade: '% 12m', periodicidade: 'Mensal', dataAtualizacao: 'IBGE', impactoNegocio: isClinica ? 'Reajuste de tabelas de procedimentos e insumos clínicos.' : 'Reajuste anual de mensalidades dos planos funerários.' },
          { nome: 'Câmbio PTAX', sigla: 'USD/BRL', valor: 5.45, unidade: 'R$', periodicidade: 'Diário', dataAtualizacao: 'Banco Central', impactoNegocio: isClinica ? 'Importação de reagentes e peças de diagnóstico hospitalar.' : 'Custo de insumos importados para tanatopraxia.' },
        ]);
      });
  }, [isClinica]);

  const formatarMoeda = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // Lista dinâmica de Contas a Pagar e Contas a Receber da Empresa Ativa
  const titulos: TituloFinanceiro[] = dadosSegmento.titulosFinanceiros;

  const titulosFiltrados = titulos.filter((t) => {
    if (filtroTipoContas !== 'TODOS' && t.tipo !== filtroTipoContas) return false;
    return true;
  });

  const totalReceber = titulos.filter(t => t.tipo === 'RECEBER').reduce((acc, cur) => acc + cur.valorAtualizado, 0);
  const totalPagar = titulos.filter(t => t.tipo === 'PAGAR').reduce((acc, cur) => acc + cur.valorAtualizado, 0);
  const saldoCaixaEstimado = isClinica ? 1608000 : 3760000;

  return (
    <div className="space-y-6" id="modulo-financas-root">
      {/* Header com Seletor de Empresa */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
            <Wallet className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Módulo Finanças & Fluxo de Caixa</h2>
            <p className="text-xs text-slate-500">
              Gestão de faturamento, liquidez, contas a pagar/receber e integração com indicadores de mercado (Selic/CDI).
            </p>
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

      {/* 4 Cards de Resumo Financeiro */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Faturamento Médio Mensal</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-md">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-black text-slate-900 mt-2">{formatarMoeda(faturamentoMensal)}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            Anual Projetado: {formatarMoeda(faturamentoAnual)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Saldo em Caixa & Aplicações</span>
            <span className="p-1.5 bg-blue-50 text-blue-700 rounded-md">
              <Landmark className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-black text-blue-900 mt-2">{formatarMoeda(saldoCaixaEstimado)}</div>
          <div className="text-[11px] text-blue-600 font-medium mt-1">
            Rendimento a 100% do CDI ({indicadores.find(i => i.sigla === 'CDI')?.valor || 10.4}% a.a.)
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Contas a Receber (Setembro)</span>
            <span className="p-1.5 bg-purple-50 text-purple-700 rounded-md">
              <CreditCard className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-black text-purple-900 mt-2">{formatarMoeda(totalReceber)}</div>
          <div className="text-[11px] text-purple-700 font-medium mt-1">
            {isClinica ? 'Convênios TISS & Consultas Particulares' : 'Mensalidades Planos & Concessões'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Contas a Pagar (Setembro)</span>
            <span className="p-1.5 bg-amber-50 text-amber-700 rounded-md">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-black text-slate-900 mt-2">{formatarMoeda(totalPagar)}</div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">
            {isClinica ? 'Repasses Médicos, Medicamentos & Tributos' : 'Urnas, Folha Funerária & DCTFWeb'}
          </div>
        </div>
      </div>

      {/* Sub-navegação interna */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 gap-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setSubAba('kpis')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            subAba === 'kpis'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          {isClinica ? 'Visão Executiva & Convênios' : 'Visão Executiva & Planos'}
        </button>
        <button
          onClick={() => setSubAba('fluxo-caixa')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            subAba === 'fluxo-caixa'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Fluxo de Caixa (Previsto vs Realizado)
        </button>
        <button
          onClick={() => setSubAba('contas')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            subAba === 'contas'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Contas a Pagar & Receber ({titulos.length})
        </button>
        <button
          onClick={() => setSubAba('macro')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            subAba === 'macro'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Taxas & Indicadores Macroeconômicos
        </button>
      </div>

      {/* SUB-ABA 1: VISÃO EXECUTIVA */}
      {subAba === 'kpis' && (
        <div className="bg-white rounded-b-xl border-x border-b border-slate-200 p-6 space-y-6">
          {/* KPIs Específicos do Segmento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {dadosSegmento.kpisEspecificos.map((kpi, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-xs text-slate-500 font-semibold block">{kpi.titulo}</span>
                <span className="text-lg font-black text-slate-900 mt-1 block">{kpi.valor}</span>
                <span className={`text-[11px] font-medium block mt-0.5 ${
                  kpi.tipo === 'positivo' ? 'text-emerald-700' : kpi.tipo === 'alerta' ? 'text-amber-700' : 'text-slate-600'
                }`}>
                  {kpi.subtexto}
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase block">Composição da Receita</span>
              <div className="space-y-2 text-xs pt-1">
                {isClinica ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-600">• Consultas Médicas Especializadas:</span>
                      <span className="font-bold text-slate-900">52,5% (R$ 420k)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">• Procedimentos & Infusões:</span>
                      <span className="font-bold text-slate-900">32,5% (R$ 260k)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">• Exames & Diagnósticos:</span>
                      <span className="font-bold text-slate-900">15,0% (R$ 120k)</span>
                    </div>
                    <div className="flex justify-between text-amber-700">
                      <span>• Glosas Médicas Iniciais:</span>
                      <span className="font-bold">-3,8% (R$ -30,4k)</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-600">• Planos Funerários (Recorrência):</span>
                      <span className="font-bold text-slate-900">63,6% (R$ 980k)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">• Serviços Funerários e Cremação:</span>
                      <span className="font-bold text-slate-900">27,2% (R$ 420k)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">• Concessão e Manutenção Jazigos:</span>
                      <span className="font-bold text-slate-900">9,2% (R$ 141k)</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase block">Índices de Rentabilidade</span>
              <div className="space-y-2 text-xs pt-1">
                <div className="flex justify-between">
                  <span className="text-slate-600">• Margem Bruta:</span>
                  <span className="font-bold text-emerald-700">{isClinica ? '41,1%' : '49,4%'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">• Margem EBITDA:</span>
                  <span className="font-bold text-blue-700">{isClinica ? '24,1%' : '26,4%'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">• Margem Líquida:</span>
                  <span className="font-bold text-emerald-700">{isClinica ? '16,8%' : '16,4%'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">• Liquidez Corrente:</span>
                  <span className="font-bold text-slate-900">{isClinica ? '4,15' : '5,91'} (Sólida)</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase block">Ciclo Financeiro Operacional</span>
              <div className="space-y-2 text-xs pt-1">
                <div className="flex justify-between">
                  <span className="text-slate-600">• Prazo Médio Recebimento (PMR):</span>
                  <span className="font-bold text-slate-900">{isClinica ? '42 dias (TISS ANS)' : '16 dias'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">• Prazo Médio Pagamento (PMP):</span>
                  <span className="font-bold text-slate-900">{isClinica ? '30 dias (Médicos/Insumos)' : '28 dias'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">• Capital de Giro Próprio:</span>
                  <span className="font-bold text-emerald-700">{isClinica ? '+ R$ 1,51M' : '+ R$ 3,94M'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">• Ponto de Equilíbrio Mensal:</span>
                  <span className="font-bold text-slate-900">{isClinica ? 'R$ 380.000,00' : 'R$ 680.000,00'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-ABA 2: FLUXO DE CAIXA */}
      {subAba === 'fluxo-caixa' && (
        <div className="bg-white rounded-b-xl border-x border-b border-slate-200 p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Fluxo de Caixa Projetado vs Realizado - {empresaAtiva.nome}
            </h3>
            <p className="text-xs text-slate-500">
              Demonstrativo de entradas operacionais, custos fixos e saldo livre de tesouraria.
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white font-bold">
                <tr>
                  <th className="p-3">Período / Semana</th>
                  <th className="p-3 text-right">Entradas Previstas</th>
                  <th className="p-3 text-right">Entradas Realizadas</th>
                  <th className="p-3 text-right">Saídas Previstas</th>
                  <th className="p-3 text-right">Saídas Realizadas</th>
                  <th className="p-3 text-right">Saldo Líquido Período</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-800 text-[11px]">
                <tr className="hover:bg-slate-50/50">
                  <td className="p-3 font-sans font-bold text-slate-900">Semana 1 (01 a 07/09)</td>
                  <td className="p-3 text-right">{formatarMoeda(380000)}</td>
                  <td className="p-3 text-right text-emerald-700 font-bold">{formatarMoeda(395000)}</td>
                  <td className="p-3 text-right">{formatarMoeda(290000)}</td>
                  <td className="p-3 text-right text-red-600">{formatarMoeda(288000)}</td>
                  <td className="p-3 text-right font-bold text-emerald-700">+{formatarMoeda(107000)}</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="p-3 font-sans font-bold text-slate-900">Semana 2 (08 a 14/09)</td>
                  <td className="p-3 text-right">{formatarMoeda(420000)}</td>
                  <td className="p-3 text-right text-emerald-700 font-bold">{formatarMoeda(432000)}</td>
                  <td className="p-3 text-right">{formatarMoeda(210000)}</td>
                  <td className="p-3 text-right text-red-600">{formatarMoeda(205000)}</td>
                  <td className="p-3 text-right font-bold text-emerald-700">+{formatarMoeda(227000)}</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="p-3 font-sans font-bold text-slate-900">Semana 3 (15 a 21/09)</td>
                  <td className="p-3 text-right">{formatarMoeda(360000)}</td>
                  <td className="p-3 text-right text-emerald-700 font-bold">{formatarMoeda(358000)}</td>
                  <td className="p-3 text-right">{formatarMoeda(380000)} (Tributos)</td>
                  <td className="p-3 text-right text-red-600">{formatarMoeda(378000)}</td>
                  <td className="p-3 text-right font-bold text-red-600">-{formatarMoeda(20000)}</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="p-3 font-sans font-bold text-slate-900">Semana 4 (22 a 30/09 - Proj.)</td>
                  <td className="p-3 text-right">{formatarMoeda(380000)}</td>
                  <td className="p-3 text-right text-slate-400">Em andamento</td>
                  <td className="p-3 text-right">{formatarMoeda(240000)}</td>
                  <td className="p-3 text-right text-slate-400">Previsto</td>
                  <td className="p-3 text-right font-bold text-emerald-700">+{formatarMoeda(140000)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-ABA 3: CONTAS A PAGAR E RECEBER */}
      {subAba === 'contas' && (
        <div className="bg-white rounded-b-xl border-x border-b border-slate-200 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 font-semibold">Filtrar por:</span>
              <div className="flex gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => setFiltroTipoContas('TODOS')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    filtroTipoContas === 'TODOS' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Todos ({titulos.length})
                </button>
                <button
                  onClick={() => setFiltroTipoContas('RECEBER')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    filtroTipoContas === 'RECEBER' ? 'bg-emerald-600 text-white' : 'text-slate-600'
                  }`}
                >
                  A Receber ({titulos.filter(t => t.tipo === 'RECEBER').length})
                </button>
                <button
                  onClick={() => setFiltroTipoContas('PAGAR')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    filtroTipoContas === 'PAGAR' ? 'bg-red-600 text-white' : 'text-slate-600'
                  }`}
                >
                  A Pagar ({titulos.filter(t => t.tipo === 'PAGAR').length})
                </button>
              </div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Descrição / Documento</th>
                  <th className="p-3">Contraparte / Entidade</th>
                  <th className="p-3">Vencimento</th>
                  <th className="p-3 text-right">Valor</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                {titulosFiltrados.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50">
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.tipo === 'RECEBER'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {t.tipo === 'RECEBER' ? 'RECEBER' : 'PAGAR'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{t.descricao}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{t.documento}</div>
                    </td>
                    <td className="p-3 text-slate-600">{t.entidade}</td>
                    <td className="p-3 font-mono">{t.vencimento}</td>
                    <td
                      className={`p-3 text-right font-mono font-bold ${
                        t.tipo === 'RECEBER' ? 'text-emerald-700' : 'text-slate-900'
                      }`}
                    >
                      {formatarMoeda(t.valorAtualizado)}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.status === 'LIQUIDADO'
                            ? 'bg-slate-100 text-slate-700'
                            : t.status === 'EM_DIA'
                            ? 'bg-blue-100 text-blue-800'
                            : t.status === 'VENCE_HOJE'
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {t.status === 'LIQUIDADO'
                          ? 'Liquidado'
                          : t.status === 'EM_DIA'
                          ? 'Em Dia'
                          : t.status === 'VENCE_HOJE'
                          ? 'Vence Hoje'
                          : `Em Atraso (${t.diasAtraso}d)`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-ABA 4: TAXAS & MACROECONÔMICOS (BrasilAPI / BACEN) */}
      {subAba === 'macro' && (
        <div className="bg-white rounded-b-xl border-x border-b border-slate-200 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" />
                Painel de Indicadores Macroeconômicos em Tempo Real
              </h3>
              <p className="text-xs text-slate-500">
                Dados oficiais sincronizados via BrasilAPI e Banco Central do Brasil com impacto financeiro no negócio.
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
              Atualização Automática
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {indicadores.map((ind, idx) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">{ind.nome}</span>
                  <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                    {ind.sigla}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 font-mono">
                    {ind.valor.toFixed(2)}
                  </span>
                  <span className="text-xs font-semibold text-slate-600">{ind.unidade}</span>
                </div>
                <div className="text-[10px] text-slate-400">Fonte: {ind.dataAtualizacao}</div>
                <p className="text-[11px] text-slate-600 pt-2 border-t border-slate-200">
                  <span className="font-semibold text-slate-800">Impacto Direto: </span>
                  {ind.impactoNegocio}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
