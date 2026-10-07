// src/components/GraficoConsumoCbsDiretoria.tsx
// Gráfico de barras com Recharts para visualização de consumo da API CBS e InfoSimples por Diretoria Executiva

import React, { FC, useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Coins,
  Building2,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  HISTORICO_CONSUMO_DIARIO,
  DIRETORIAS_METRICAS,
  ConsumoDiarioItem,
} from '../data/cbsConsumoDiretoriasData';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
  }>;
  label?: string;
}

const CustomTooltip: FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const total = payload.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  const custoEstimado = (total * 0.05).toFixed(2);

  return (
    <div className="bg-slate-900/95 backdrop-blur-md text-white border border-slate-700 p-3.5 rounded-xl shadow-xl text-xs max-w-xs animate-in fade-in duration-100">
      <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-2">
        <span className="font-extrabold text-slate-200 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
          Dia {label}
        </span>
        <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
          {total} chamadas
        </span>
      </div>

      <div className="space-y-1.5">
        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-300 truncate max-w-[140px]">{entry.name}</span>
            </div>
            <span className="font-mono font-bold text-slate-100">{entry.value}</span>
          </div>
        ))}
      </div>

      <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
        <span>Custo Rateado Estimado:</span>
        <span className="font-bold text-amber-300">R$ {custoEstimado}</span>
      </div>
    </div>
  );
};

export const GraficoConsumoCbsDiretoria: FC = () => {
  const [periodo, setPeriodo] = useState<'7' | '14' | 'todos'>('todos');
  const [diretoriaFiltro, setDiretoriaFiltro] = useState<string>('todas');

  const dadosFiltrados = useMemo(() => {
    let list: ConsumoDiarioItem[] = [...HISTORICO_CONSUMO_DIARIO];
    if (periodo === '7') {
      list = list.slice(-7);
    } else if (periodo === '14') {
      list = list.slice(-14);
    }
    return list;
  }, [periodo]);

  const totaisGerais = useMemo(() => {
    const totalChamadas = dadosFiltrados.reduce((acc, curr) => acc + curr.totalDia, 0);
    const custoTotal = dadosFiltrados.reduce((acc, curr) => acc + curr.custoDiaReais, 0);
    const maiorPico = dadosFiltrados.reduce(
      (max, curr) => (curr.totalDia > max.totalDia ? curr : max),
      dadosFiltrados[0] || { totalDia: 0, data: '-' }
    );
    const diasAcimaQuota = dadosFiltrados.filter((d) => d.totalDia > d.limiteQuota).length;

    return {
      totalChamadas,
      custoTotal,
      maiorPico,
      diasAcimaQuota,
      mediaDiaria: Math.round(totalChamadas / (dadosFiltrados.length || 1)),
    };
  }, [dadosFiltrados]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-6">
      {/* Header com controles */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-900">
                Histórico de Consumo da API CBS / InfoSimples por Diretoria
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                Recharts Stacked Bar
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Rastreamento de volumetria de requisições à Receita Federal, picos de processamento e rateio de custos.
            </p>
          </div>
        </div>

        {/* Controles de Filtro */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
            <button
              onClick={() => setPeriodo('7')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                periodo === '7' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Últimos 7 dias
            </button>
            <button
              onClick={() => setPeriodo('14')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                periodo === '14' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Últimos 14 dias
            </button>
            <button
              onClick={() => setPeriodo('todos')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                periodo === 'todos' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mês Completo (Set/2026)
            </button>
          </div>

          <select
            value={diretoriaFiltro}
            onChange={(e) => setDiretoriaFiltro(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="todas">Todas as Diretorias</option>
            {DIRETORIAS_METRICAS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4 Cards de Métricas e KPIs de Governança */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Total de Requisições</span>
            <Zap className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-1.5">
            {totaisGerais.totalChamadas.toLocaleString('pt-BR')}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Média de <strong className="text-slate-700">{totaisGerais.mediaDiaria}</strong> consultas/dia
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Pico Máximo de Uso</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-black text-purple-900 mt-1.5">
            {totaisGerais.maiorPico.totalDia} <span className="text-xs font-normal text-slate-500">reqs</span>
          </div>
          <div className="text-[11px] text-purple-700 font-medium mt-0.5">
            Dia {totaisGerais.maiorPico.data} (Fechamento DCTFWeb / TSS)
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Custo Rateado Estimado</span>
            <Coins className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-900 mt-1.5">
            R$ {totaisGerais.custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
            Base: R$ 0,05 / consulta em API privada
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Status da Quota Diária</span>
            <AlertTriangle className={`w-4 h-4 ${totaisGerais.diasAcimaQuota > 0 ? 'text-amber-500' : 'text-emerald-500'}`} />
          </div>
          <div className="text-xl font-black text-slate-900 mt-1.5 flex items-center gap-1.5">
            <span>{totaisGerais.diasAcimaQuota}</span>
            <span className="text-xs font-normal text-slate-500">dias c/ pico</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Limite de segurança: <strong className="text-slate-700">400 req/dia</strong>
          </div>
        </div>
      </div>

      {/* Gráfico Recharts Stacked Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Volume Diário de Consultas (Segregado por Diretoria)</span>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="w-3 h-0.5 bg-red-500 inline-block" />
            <span>Linha de Quota Segura (400)</span>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dadosFiltrados}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="data"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              />

              {/* Linha de Quota Diária */}
              <ReferenceLine
                y={400}
                label={{
                  value: 'Limite Quota (400)',
                  position: 'insideTopRight',
                  fill: '#ef4444',
                  fontSize: 10,
                  fontWeight: 'bold',
                }}
                stroke="#ef4444"
                strokeDasharray="4 4"
              />

              {/* Barras Empilhadas */}
              {(diretoriaFiltro === 'todas' || diretoriaFiltro === 'tributaria') && (
                <Bar
                  dataKey="tributariaFiscal"
                  name="Diretoria Tributária & Fiscal"
                  stackId="a"
                  fill="#4f46e5"
                  radius={[0, 0, 0, 0]}
                />
              )}
              {(diretoriaFiltro === 'todas' || diretoriaFiltro === 'ti-protheus') && (
                <Bar
                  dataKey="tiProtheus"
                  name="TI & Conector Protheus"
                  stackId="a"
                  fill="#9333ea"
                  radius={[0, 0, 0, 0]}
                />
              )}
              {(diretoriaFiltro === 'todas' || diretoriaFiltro === 'controladoria') && (
                <Bar
                  dataKey="controladoriaFinancas"
                  name="Controladoria & Finanças"
                  stackId="a"
                  fill="#059669"
                  radius={[0, 0, 0, 0]}
                />
              )}
              {(diretoriaFiltro === 'todas' || diretoriaFiltro === 'juridico') && (
                <Bar
                  dataKey="juridico"
                  name="Diretoria Jurídica"
                  stackId="a"
                  fill="#d97706"
                  radius={[0, 0, 0, 0]}
                />
              )}
              {(diretoriaFiltro === 'todas' || diretoriaFiltro === 'operacoes') && (
                <Bar
                  dataKey="operacoes"
                  name="Operações & Atendimento"
                  stackId="a"
                  fill="#64748b"
                  radius={[4, 4, 0, 0]}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid com detalhamento e rateio por diretoria */}
      <div className="border-t border-slate-100 pt-4 space-y-3">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Rateio Operacional e Responsáveis por Diretoria
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {DIRETORIAS_METRICAS.map((d) => (
            <div
              key={d.id}
              className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors flex flex-col justify-between gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.corHex }} />
                  <span className="text-xs font-bold text-slate-800">{d.nome}</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                  {d.sigla}
                </span>
              </div>

              <div className="flex items-baseline justify-between text-xs pt-1 border-t border-slate-200/60">
                <span className="text-slate-500">Volume no Mês:</span>
                <span className="font-extrabold text-slate-900">
                  {d.totalChamadasMes.toLocaleString('pt-BR')} ({d.percentual}%)
                </span>
              </div>

              <div className="flex items-baseline justify-between text-xs">
                <span className="text-slate-500">Pico Máximo:</span>
                <span className="font-semibold text-slate-800">
                  {d.picoMaximoDia} reqs ({d.dataPico})
                </span>
              </div>

              <div className="flex items-baseline justify-between text-xs">
                <span className="text-slate-500">Custo Rateado:</span>
                <span className="font-bold text-emerald-700">
                  R$ {d.custoTotalReais.toFixed(2)}
                </span>
              </div>

              <div className="text-[10px] text-slate-400 truncate pt-1 border-t border-slate-200/40">
                Líder: {d.responsavel}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
