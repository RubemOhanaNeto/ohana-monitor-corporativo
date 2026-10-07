import { FC, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { AlertTriangle, ShieldAlert, Flame, ChevronRight } from 'lucide-react';
import { FiscalAcao, FiscalNoticia, DiretoriaCodigo } from '../types';

interface GraficoRiscosDiretoriaProps {
  acoes: FiscalAcao[];
  noticias?: FiscalNoticia[];
  diretoriaSelecionada?: string | null;
  onSelecionarDiretoria?: (diretoria: DiretoriaCodigo | 'TODAS') => void;
}

interface DiretoriaRisco {
  codigo: DiretoriaCodigo;
  nome: string;
  totalAcoes: number;
  criticas: number;
  altas: number;
  medias: number;
  scoreRisco: number;
  maiorRiscoDescricao?: string;
  cor: string;
}

const DIRETORIAS_INFO: Record<string, { nome: string; cor: string }> = {
  CFO: { nome: 'CFO (Financeiro & Fiscal)', cor: '#ef4444' }, // Vermelho
  COO: { nome: 'COO (Operações & Cemitério)', cor: '#f97316' }, // Laranja
  CLO: { nome: 'CLO (Jurídico & Compliance)', cor: '#8b5cf6' }, // Roxo
  CTO: { nome: 'CTO (TI & Protheus)', cor: '#0ea5e9' }, // Sky
  CEO: { nome: 'CEO (Presidência & Relações)', cor: '#10b981' }, // Emerald
  CRO: { nome: 'CRO (Comercial & Vendas)', cor: '#eab308' }, // Amarelo
};

export const GraficoRiscosDiretoria: FC<GraficoRiscosDiretoriaProps> = ({
  acoes = [],
  noticias = [],
  diretoriaSelecionada,
  onSelecionarDiretoria,
}) => {
  // Mapear e calcular os riscos por diretoria
  const rankingDiretorias = useMemo(() => {
    const contagem: Record<string, DiretoriaRisco> = {
      CFO: { codigo: 'CFO', nome: DIRETORIAS_INFO.CFO.nome, totalAcoes: 0, criticas: 0, altas: 0, medias: 0, scoreRisco: 0, cor: DIRETORIAS_INFO.CFO.cor },
      COO: { codigo: 'COO', nome: DIRETORIAS_INFO.COO.nome, totalAcoes: 0, criticas: 0, altas: 0, medias: 0, scoreRisco: 0, cor: DIRETORIAS_INFO.COO.cor },
      CLO: { codigo: 'CLO', nome: DIRETORIAS_INFO.CLO.nome, totalAcoes: 0, criticas: 0, altas: 0, medias: 0, scoreRisco: 0, cor: DIRETORIAS_INFO.CLO.cor },
      CTO: { codigo: 'CTO', nome: DIRETORIAS_INFO.CTO.nome, totalAcoes: 0, criticas: 0, altas: 0, medias: 0, scoreRisco: 0, cor: DIRETORIAS_INFO.CTO.cor },
      CEO: { codigo: 'CEO', nome: DIRETORIAS_INFO.CEO.nome, totalAcoes: 0, criticas: 0, altas: 0, medias: 0, scoreRisco: 0, cor: DIRETORIAS_INFO.CEO.cor },
      CRO: { codigo: 'CRO', nome: DIRETORIAS_INFO.CRO.nome, totalAcoes: 0, criticas: 0, altas: 0, medias: 0, scoreRisco: 0, cor: DIRETORIAS_INFO.CRO.cor },
    };

    // Computar a partir das ações
    acoes.forEach((acao) => {
      let dir: DiretoriaCodigo = 'CFO';
      if (acao.area === 'FISCAL' || acao.area === 'FINANCEIRO' || acao.area === 'CONTABIL') dir = 'CFO';
      else if (acao.area === 'TI_PROTHEUS') dir = 'CTO';
      else if (acao.area === 'JURIDICO') dir = 'CLO';
      else if (acao.area === 'GESTAO_FUNERARIA' || (acao.area as string) === 'OPERACIONAL') dir = 'COO';
      else if (acao.responsavel?.toLowerCase().includes('jurídico')) dir = 'CLO';
      else if (acao.responsavel?.toLowerCase().includes('ti') || acao.responsavel?.toLowerCase().includes('protheus')) dir = 'CTO';
      else if (acao.responsavel?.toLowerCase().includes('presidente') || acao.responsavel?.toLowerCase().includes('rubinho')) dir = 'CEO';

      if (acao.status !== 'CONCLUIDA') {
        contagem[dir].totalAcoes += 1;
        const dias = acao.diasRestantes ?? 30;
        const isCritico = acao.risco === 'CRITICO' || acao.prioridade === 'CRITICA' || dias <= 7;
        const isAlto = acao.risco === 'ALTO' || acao.prioridade === 'ALTA' || (dias > 7 && dias <= 30);

        if (isCritico) {
          contagem[dir].criticas += 1;
          contagem[dir].scoreRisco += 10;
          if (!contagem[dir].maiorRiscoDescricao) {
            contagem[dir].maiorRiscoDescricao = acao.consequencia || acao.acao;
          }
        } else if (isAlto) {
          contagem[dir].altas += 1;
          contagem[dir].scoreRisco += 5;
          if (!contagem[dir].maiorRiscoDescricao) {
            contagem[dir].maiorRiscoDescricao = acao.consequencia || acao.acao;
          }
        } else {
          contagem[dir].medias += 1;
          contagem[dir].scoreRisco += 2;
        }
      }
    });

    // Também incorporar notícias sem ação aberta mas de alta criticidade
    noticias.forEach((noticia) => {
      if (noticia.nivelUrgencia === 'CRITICO' || noticia.nivelUrgencia === 'ALTO') {
        const dirs = noticia.diretoriasResponsaveis || ['CFO'];
        dirs.forEach((dir) => {
          if (contagem[dir]) {
            contagem[dir].scoreRisco += noticia.nivelUrgencia === 'CRITICO' ? 6 : 3;
            if (noticia.nivelUrgencia === 'CRITICO') {
              contagem[dir].criticas += 1;
            }
          }
        });
      }
    });

    return Object.values(contagem).sort((a, b) => b.scoreRisco - a.scoreRisco);
  }, [acoes, noticias]);

  // Dados formatados para o Recharts
  const dataGrafico = useMemo(() => {
    return rankingDiretorias.map((d) => ({
      diretoria: d.codigo,
      nomeCompleto: d.nome,
      'Risco Acumulado': d.scoreRisco,
      Críticas: d.criticas,
      Altas: d.altas,
      Total: d.totalAcoes,
      cor: d.cor,
    }));
  }, [rankingDiretorias]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-white text-xs space-y-1.5 z-50">
          <div className="font-bold text-slate-100 flex items-center justify-between gap-3">
            <span>{data.nomeCompleto}</span>
            <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-400 font-mono text-[10px]">
              Score: {data['Risco Acumulado']} pts
            </span>
          </div>
          <div className="text-slate-300 grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800">
            <div>
              <span className="text-red-400 font-bold">● {data.Críticas}</span> Críticas (≤ 7d)
            </div>
            <div>
              <span className="text-amber-400 font-bold">● {data.Altas}</span> Altas (8-30d)
            </div>
          </div>
          <p className="text-[10px] text-slate-400 italic pt-1">
            Clique para filtrar todo o painel por esta diretoria
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-5" id="grafico-riscos-diretoria">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Mapa de Calor & Concentração de Riscos por Diretoria
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 animate-pulse">
              Prioridade Executiva
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Visualização comparativa das áreas com maior acúmulo de matérias e ações pendentes críticas para a tomada de decisão do Presidente.
          </p>
        </div>

        {diretoriaSelecionada && diretoriaSelecionada !== 'TODAS' && (
          <button
            type="button"
            onClick={() => onSelecionarDiretoria?.('TODAS')}
            className="self-start sm:self-auto text-xs px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
          >
            Limpar Filtro ({diretoriaSelecionada})
          </button>
        )}
      </div>

      {/* Grid: Gráfico de Barras à esquerda e Lista Ranqueada à direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Gráfico Recharts (7 cols) */}
        <div className="lg:col-span-7 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dataGrafico}
              margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload[0]) {
                  const dir = e.activePayload[0].payload.diretoria as DiretoriaCodigo;
                  onSelecionarDiretoria?.(dir);
                }
              }}
            >
              <XAxis
                dataKey="diretoria"
                tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="Risco Acumulado"
                radius={[6, 6, 0, 0]}
                cursor="pointer"
              >
                {dataGrafico.map((entry, index) => {
                  const isSelected = diretoriaSelecionada === entry.diretoria;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.cor}
                      opacity={diretoriaSelecionada && !isSelected ? 0.4 : 1}
                      stroke={isSelected ? '#0f172a' : undefined}
                      strokeWidth={isSelected ? 2 : 0}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Ranking Detalhado (5 cols) */}
        <div className="lg:col-span-5 space-y-2.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Ranking de Vulnerabilidade Corporativa
          </span>

          <div className="space-y-2">
            {rankingDiretorias.map((d, index) => {
              const isSelected = diretoriaSelecionada === d.codigo;
              return (
                <button
                  key={d.codigo}
                  type="button"
                  onClick={() => onSelecionarDiretoria?.(d.codigo)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                      : 'bg-slate-50/70 hover:bg-slate-100/90 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
                        index === 0
                          ? 'bg-red-600 text-white'
                          : index === 1
                          ? 'bg-orange-500 text-white'
                          : 'bg-slate-300 text-slate-800'
                      }`}
                    >
                      {index + 1}º
                    </span>

                    <div className="truncate">
                      <span className={`text-xs font-bold block truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        {d.nome}
                      </span>
                      <span className={`text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {d.totalAcoes} ações ({d.criticas} críticas • {d.altas} altas)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span
                        className={`text-xs font-extrabold block ${
                          isSelected ? 'text-red-300' : 'text-red-600'
                        }`}
                      >
                        {d.scoreRisco} pts
                      </span>
                      <span className={`text-[9px] uppercase font-semibold ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                        Vulnerabilidade
                      </span>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
