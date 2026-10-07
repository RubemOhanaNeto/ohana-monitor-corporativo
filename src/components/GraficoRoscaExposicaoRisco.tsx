import React, { FC, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ShieldAlert, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { FiscalNoticia } from '../types';

interface GraficoRoscaExposicaoRiscoProps {
  noticias: FiscalNoticia[];
  onSelectNivelRisco?: (nivel: string | null) => void;
  selectedNivel?: string | null;
}

const COLORS = {
  Alto: '#e11d48', // rose-600
  Médio: '#f59e0b', // amber-500
  Baixo: '#10b981', // emerald-500
};

export const GraficoRoscaExposicaoRisco: FC<GraficoRoscaExposicaoRiscoProps> = ({
  noticias,
  onSelectNivelRisco,
  selectedNivel,
}) => {
  const dados = useMemo(() => {
    // Filter pending matters (not archived, or having open actions or pending Rubinho decision)
    const pendentes = noticias.filter((n) => {
      const temAcoesAbertas = n.acoesVinculadas.some((a) => a.status !== 'CONCLUIDA');
      const decisaoPendente = n.decisaoRubinhoExigida && n.decisaoRubinho?.status === 'PENDENTE';
      return temAcoesAbertas || decisaoPendente || n.statusJuridico === 'VIGENTE' || n.statusJuridico === 'VIGENCIA_FUTURA';
    });

    let alto = 0;
    let medio = 0;
    let baixo = 0;

    pendentes.forEach((n) => {
      const risco = n.nivelRisco || 'MEDIO';
      if (risco === 'ALTO' || risco === 'CRITICO') {
        alto++;
      } else if (risco === 'MEDIO') {
        medio++;
      } else {
        baixo++;
      }
    });

    const total = alto + medio + baixo || 1;

    return [
      {
        name: 'Alto Risco',
        key: 'ALTO',
        value: alto,
        percent: Math.round((alto / total) * 100),
        color: COLORS.Alto,
        icon: ShieldAlert,
        descricao: 'Impacto direto no caixa, risco de autuação fiscal ou paralisação de serviço.',
      },
      {
        name: 'Médio Risco',
        key: 'MEDIO',
        value: medio,
        percent: Math.round((medio / total) * 100),
        color: COLORS.Médio,
        icon: AlertTriangle,
        descricao: 'Ajustes operacionais, atualização de parametrizações no Protheus e monitoramento.',
      },
      {
        name: 'Baixo Risco',
        key: 'BAIXO',
        value: baixo,
        percent: Math.round((baixo / total) * 100),
        color: COLORS.Baixo,
        icon: CheckCircle,
        descricao: 'Conformidade regular, rotinas preventivas ou informativas sem penalidade iminente.',
      },
    ];
  }, [noticias]);

  const totalGeral = dados.reduce((acc, d) => acc + d.value, 0);
  const percentualCritico = Math.round(((dados[0].value) / (totalGeral || 1)) * 100);

  return (
    <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-5 shadow-lg flex flex-col justify-between" id="grafico-rosca-risco-corporativo">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Vigilância Executiva
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-bold">
              Total: {totalGeral} Matérias
            </span>
          </div>
          <h3 className="text-base font-extrabold text-white mt-1">
            Exposição de Risco Corporativo das Matérias Pendentes
          </h3>
          <p className="text-xs text-slate-400">
            Distribuição do volume de matérias ativas por severidade para tomada de decisão presidencial.
          </p>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Índice de Severidade
          </span>
          <span className={`text-lg font-black ${percentualCritico > 40 ? 'text-rose-400' : 'text-amber-400'}`}>
            {percentualCritico}% Crítico
          </span>
        </div>
      </div>

      {/* Donut Chart with Center Label */}
      <div className="relative h-64 w-full my-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dados}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={4}
              dataKey="value"
              cursor="pointer"
              onClick={(entry: any) => {
                if (onSelectNivelRisco && entry) {
                  const itemKey = (entry.key as string) || null;
                  onSelectNivelRisco(selectedNivel === itemKey ? null : itemKey);
                }
              }}
            >
              {dados.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke="#0f172a"
                  strokeWidth={3}
                  opacity={selectedNivel && selectedNivel !== entry.key ? 0.35 : 1}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-950 border border-slate-700 p-3 rounded-xl shadow-xl text-xs text-slate-200 min-w-[200px]">
                      <div className="flex items-center justify-between gap-2 font-bold mb-1">
                        <span style={{ color: data.color }}>{data.name}</span>
                        <span className="font-mono text-white text-sm">{data.value} itens</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-semibold mb-1">
                        Representa {data.percent}% do volume pendente
                      </p>
                      <p className="text-[10px] text-slate-500 italic leading-tight">
                        {data.descricao}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text inside Donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-black text-white tracking-tight leading-none">
            {totalGeral}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1">
            Pendências
          </span>
        </div>
      </div>

      {/* Interactive Legend / Breakdown Cards */}
      <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-800/80">
        {dados.map((item) => {
          const isSelected = selectedNivel === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelectNivelRisco && onSelectNivelRisco(isSelected ? null : item.key)}
              className={`p-2.5 rounded-xl border text-left transition-all relative ${
                isSelected
                  ? 'bg-slate-800/90 border-slate-600 shadow-md ring-1 ring-slate-400'
                  : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800/90'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs font-mono font-bold text-slate-200">
                  {item.percent}%
                </span>
              </div>
              <div className="text-xs font-bold text-slate-100 truncate">
                {item.name}
              </div>
              <div className="text-[11px] font-extrabold text-slate-300 mt-0.5">
                {item.value} matérias
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
