import { FC, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { AlertOctagon, CheckCircle2, Clock, BarChart3, Building2, TrendingUp, ShieldAlert } from 'lucide-react';
import { EmpresaPerfil, FiscalNoticia } from '../types';

interface GraficoAcoesPorEmpresaProps {
  empresas: EmpresaPerfil[];
  noticias: FiscalNoticia[];
  selectedEmpresaId: string | null;
  onSelectEmpresa: (empresaId: string | null) => void;
}

export const GraficoAcoesPorEmpresa: FC<GraficoAcoesPorEmpresaProps> = ({
  empresas,
  noticias,
  selectedEmpresaId,
  onSelectEmpresa,
}) => {
  const [visualizacao, setVisualizacao] = useState<'EMPILHADO' | 'LADO_A_LADO'>('EMPILHADO');

  // Calcular métricas de ações para cada empresa
  const dadosGrafico = empresas.map((emp) => {
    // Filtrar ações da empresa
    const acoes = noticias.flatMap((n) =>
      n.acoesVinculadas.filter((a) =>
        a.empresaId === emp.id ||
        (!a.empresaId && (emp.id === 'recanto-da-saudade' || emp.id === 'recanto'))
      )
    );

    // Contabilizar por criticidade e status
    const criticas = acoes.filter(
      (a) =>
        a.status !== 'CONCLUIDA' &&
        (a.risco === 'CRITICO' || a.risco === 'ALTO' || (a.diasRestantes != null && a.diasRestantes <= 2))
    ).length;

    const regulares = acoes.filter(
      (a) =>
        a.status !== 'CONCLUIDA' &&
        a.risco !== 'CRITICO' &&
        a.risco !== 'ALTO' &&
        !(a.diasRestantes != null && a.diasRestantes <= 2)
    ).length;

    const concluidas = acoes.filter((a) => a.status === 'CONCLUIDA').length;
    const total = acoes.length;
    const taxaConclusao = total > 0 ? Math.round((concluidas / total) * 100) : 100;

    return {
      id: emp.id,
      nome: emp.nome,
      razaoSocial: emp.razaoSocial,
      cnpj: emp.cnpj,
      segmento: emp.segmento,
      criticas,
      regulares,
      concluidas,
      totalPendentes: criticas + regulares,
      total,
      taxaConclusao,
    };
  });

  // Totais consolidados
  const totalCriticasGeral = dadosGrafico.reduce((acc, cur) => acc + cur.criticas, 0);
  const totalPendentesGeral = dadosGrafico.reduce((acc, cur) => acc + cur.totalPendentes, 0);
  const totalConcluidasGeral = dadosGrafico.reduce((acc, cur) => acc + cur.concluidas, 0);
  const empresaMaiorCarga = [...dadosGrafico].sort((a, b) => b.totalPendentes - a.totalPendentes)[0];

  // Custom Tooltip para o Recharts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs space-y-2 min-w-[220px]">
          <div className="border-b border-slate-700 pb-1.5">
            <div className="flex items-center gap-1.5 font-bold text-emerald-400 text-sm">
              <Building2 className="w-4 h-4" />
              <span>{data.nome}</span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">{data.cnpj}</p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-rose-300 font-semibold">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Críticas / Urgentes:
              </span>
              <span className="font-mono font-bold text-rose-400">{data.criticas}</span>
            </div>
            <div className="flex items-center justify-between text-amber-300">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Regulares Pendentes:
              </span>
              <span className="font-mono font-bold text-amber-400">{data.regulares}</span>
            </div>
            <div className="flex items-center justify-between text-emerald-300">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Concluídas:
              </span>
              <span className="font-mono font-bold text-emerald-400">{data.concluidas}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-300">
            <span>Taxa de Resolução:</span>
            <span className="font-bold text-emerald-400">{data.taxaConclusao}%</span>
          </div>
          <p className="text-[9px] text-slate-400 italic text-center">Clique na barra para filtrar esta empresa</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5" id="grafico-acoes-empresas-card">
      {/* Cabeçalho do Gráfico com Controles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
              Comparativo de Volume de Ações Pendentes por Empresa
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Distribuição de exigências fiscais, adequações Protheus e obrigações por CNPJ
          </p>
        </div>

        {/* Alternador de Modo de Exibição */}
        <div className="flex items-center gap-2">
          <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setVisualizacao('EMPILHADO')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                visualizacao === 'EMPILHADO'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Empilhado
            </button>
            <button
              type="button"
              onClick={() => setVisualizacao('LADO_A_LADO')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                visualizacao === 'LADO_A_LADO'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lado a Lado
            </button>
          </div>
        </div>
      </div>

      {/* Cards de Métricas Resumidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">Ações Críticas</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-rose-900">{totalCriticasGeral}</span>
            <span className="text-[10px] text-rose-700 font-medium">prioridade máxima</span>
          </div>
        </div>

        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Total Pendentes</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-amber-900">{totalPendentesGeral}</span>
            <span className="text-[10px] text-amber-700 font-medium">em andamento</span>
          </div>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Ações Concluídas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-900">{totalConcluidasGeral}</span>
            <span className="text-[10px] text-emerald-700 font-medium">homologadas</span>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Maior Exposição</span>
            <TrendingUp className="w-4 h-4 text-slate-500" />
          </div>
          <div className="mt-1 truncate">
            <span className="text-sm font-black text-slate-900 truncate block">
              {empresaMaiorCarga?.nome || 'Nenhuma'}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              {empresaMaiorCarga?.totalPendentes || 0} pendência(s)
            </span>
          </div>
        </div>
      </div>

      {/* Gráfico de Barras Recharts */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={dadosGrafico}
            margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
            onClick={(state: any) => {
              if (state && state.activePayload && state.activePayload.length > 0) {
                const clickedEmpresaId = state.activePayload[0].payload.id;
                onSelectEmpresa(clickedEmpresaId === selectedEmpresaId ? null : clickedEmpresaId);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis
              dataKey="nome"
              tickLine={false}
              axisLine={{ stroke: '#CBD5E1' }}
              tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
              interval={0}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#64748B', fontSize: 11 }}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F1F5F9' }} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '12px', fontSize: '11px', fontWeight: 600 }}
            />
            <Bar
              dataKey="criticas"
              name="Críticas / Urgentes"
              fill="#E11D48"
              stackId={visualizacao === 'EMPILHADO' ? 'a' : undefined}
              radius={visualizacao === 'EMPILHADO' ? [0, 0, 0, 0] : [6, 6, 0, 0]}
              cursor="pointer"
            />
            <Bar
              dataKey="regulares"
              name="Regulares Pendentes"
              fill="#F59E0B"
              stackId={visualizacao === 'EMPILHADO' ? 'a' : undefined}
              radius={visualizacao === 'EMPILHADO' ? [0, 0, 0, 0] : [6, 6, 0, 0]}
              cursor="pointer"
            />
            <Bar
              dataKey="concluidas"
              name="Concluídas"
              fill="#10B981"
              stackId={visualizacao === 'EMPILHADO' ? 'a' : undefined}
              radius={visualizacao === 'EMPILHADO' ? [6, 6, 0, 0] : [6, 6, 0, 0]}
              cursor="pointer"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Dica de Interatividade */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 flex-wrap gap-2">
        <span className="flex items-center gap-1.5">
          <AlertOctagon className="w-3.5 h-3.5 text-slate-400" />
          Clique em qualquer barra do gráfico para isolar a visualização da empresa selecionada.
        </span>
        {selectedEmpresaId && (
          <button
            type="button"
            onClick={() => onSelectEmpresa(null)}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline"
          >
            Limpar Filtro de Empresa
          </button>
        )}
      </div>
    </div>
  );
};
