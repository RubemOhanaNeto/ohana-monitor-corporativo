import { FC, useState } from 'react';
import {
  Cpu,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  Server,
  Layers,
  FileCode2,
  Building2,
  Activity,
  FileText,
  Stethoscope,
} from 'lucide-react';
import { FiscalNoticia, EmpresaPerfil } from '../types';
import { formatarData } from '../utils/formatters';

interface ModuloProtheusProps {
  noticias: FiscalNoticia[];
  onSelectNoticia: (noticia: FiscalNoticia) => void;
  empresas?: EmpresaPerfil[];
  selectedEmpresaId?: string | null;
  onSelectEmpresa?: (id: string) => void;
}

export const ModuloProtheus: FC<ModuloProtheusProps> = ({
  noticias,
  onSelectNoticia,
  empresas = [],
  selectedEmpresaId = null,
  onSelectEmpresa = () => {},
}) => {
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');

  const empresaAtiva = empresas.find((e) => e.id === selectedEmpresaId) || empresas[0];
  const isClinica = empresaAtiva?.id === 'instituto-go' || empresaAtiva?.segmento?.toLowerCase().includes('saúde') || empresaAtiva?.segmento?.toLowerCase().includes('médic');

  // Filter Protheus/ERP-relevant news
  const materiasErp = noticias.filter((n) => {
    if (filtroStatus === 'TODOS') return true;
    if (filtroStatus === 'COM_IMPACTO') return n.protheusParametrizacaoNecessaria;
    if (filtroStatus === 'SEM_IMPACTO') return !n.protheusParametrizacaoNecessaria;
    return n.protheusStatusHomologacao === filtroStatus;
  });

  return (
    <div className="space-y-6" id="modulo-protheus-container">
      {/* Top Header com Seletor de Empresa */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`p-2 rounded-lg ${isClinica ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'}`}>
            {isClinica ? <Stethoscope className="w-5 h-5" /> : <Cpu className="w-5 h-5" />}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                {isClinica ? 'Módulo ERP — Gestão Médica, Clínica & TISS' : 'Módulo ERP — TOTVS Protheus & TSS'}
              </h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isClinica ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'}`}>
                {isClinica ? 'Alterdata / Soul MV / CFM' : 'TOTVS 12.1.2510'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Parametrização do ERP e integrações com o Fisco para <strong>{empresaAtiva?.nome}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={empresaAtiva?.id || ''}
            onChange={(e) => onSelectEmpresa(e.target.value)}
            className="w-full md:w-64 text-xs font-semibold bg-slate-50 border border-slate-300 text-slate-800 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            {empresas.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.nome} ({emp.sistemasUtilizados?.[0] || emp.segmento})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Top Banner - Architecture & Safety Rules */}
      <div className={`text-white rounded-xl p-5 border shadow-xs ${isClinica ? 'bg-sky-950 border-sky-900' : 'bg-emerald-950 border-emerald-900'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              {isClinica ? <Activity className="w-6 h-6 text-sky-400" /> : <Cpu className="w-6 h-6 text-emerald-400" />}
              <h2 className="text-lg font-bold tracking-tight text-white">
                {isClinica ? 'Sistema ERP Clínico — Alterdata Clínicas & Padrão TISS ANS' : 'Sistema ERP — TOTVS Protheus & TSS'}
              </h2>
            </div>
            <p className={`text-xs mt-1 max-w-3xl leading-relaxed ${isClinica ? 'text-sky-200' : 'text-emerald-200'}`}>
              {isClinica
                ? 'Mapeamento de integrações para Prontuário Eletrônico (CFM), Padrão TISS v4.01 (ANS), Tabela TUSS, controle de Glosas Médicas, exportação para DMED da Receita Federal e NFS-e Belém.'
                : 'Mapeamento de impactos em TES, Configurador de Tributos, Códigos de Serviço (SB1), Naturezas Financeiras (SED), TSS (WebServices de NFS-e), SPED e EFD-Reinf.'}
            </p>
          </div>

          {/* Safety Rule Box */}
          <div className={`border rounded-lg p-3 text-xs shrink-0 ${isClinica ? 'bg-sky-900/60 border-sky-800 text-sky-200' : 'bg-emerald-900/60 border-emerald-800 text-emerald-200'}`}>
            <span className={`block text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${isClinica ? 'text-sky-300' : 'text-emerald-400'}`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              {isClinica ? 'Conformidade LGPD Saúde & CFM' : 'Regra de Segurança Protheus'}
            </span>
            <p className={`text-[11px] mt-0.5 max-w-xs ${isClinica ? 'text-sky-100' : 'text-emerald-100'}`}>
              {isClinica
                ? 'Prontuários médicos e dados de saúde possuem nível máximo de sigilo (CFM 1.821/07 e Res. 2.299/21). Guarda digital probatória de 20 anos.'
                : 'Nunca inventar campo, rotina, tabela ou parâmetro inexistente. Se não houver base técnica: "Sem impacto técnico identificado no Protheus até o momento."'}
            </p>
          </div>
        </div>

        {/* Filter buttons */}
        <div className={`mt-4 pt-3 border-t flex flex-wrap gap-2 ${isClinica ? 'border-sky-900/80' : 'border-emerald-900/80'}`}>
          {[
            { id: 'TODOS', label: 'Todas as Normas' },
            { id: 'COM_IMPACTO', label: 'Requer Parametrização' },
            { id: 'PENDENTE', label: 'Homologação Pendente' },
            { id: 'EM_TESTE', label: 'Em Teste no ERP' },
            { id: 'HOMOLOGADO', label: 'Homologado' },
            { id: 'SEM_IMPACTO', label: 'Sem Impacto Técnico' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFiltroStatus(item.id)}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                filtroStatus === item.id
                  ? isClinica
                    ? 'bg-sky-500 text-white shadow-xs font-semibold'
                    : 'bg-emerald-500 text-white shadow-xs font-semibold'
                  : isClinica
                  ? 'bg-sky-900/40 text-sky-200 hover:bg-sky-800/60'
                  : 'bg-emerald-900/40 text-emerald-200 hover:bg-emerald-800/60'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Protheus or Clinical Architecture Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {isClinica ? (
          <>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                <FileText className="w-4 h-4 text-sky-600" />
                <span>Padrão TISS & TUSS (ANS)</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Geração de lotes XML no padrão TISS v4.01 e de-para de procedimentos TUSS/CBHPM.
              </p>
              <div className="mt-2.5 text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded inline-block">
                TISS Protocolo XML v4.01
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Prontuário CFM & Prescrição</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Assinatura digital ICP-Brasil de laudos, prescrições e prontuários médicos (Res. CFM 2.299/21).
              </p>
              <div className="mt-2.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded inline-block">
                CFM Digital / ICP-Brasil
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Conciliação de Glosas</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Controle de glosas administrativas e técnicas de convênios (Unimed, Bradesco, etc.).
              </p>
              <div className="mt-2.5 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded inline-block">
                Taxa de Recuperação: 78,5%
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                <Server className="w-4 h-4 text-purple-600" />
                <span>Exportador DMED & NFS-e</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Layout de integração com a Receita Federal (DMED) e emissão de NFS-e Belém (Item 4.01).
              </p>
              <div className="mt-2.5 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded inline-block">
                Layout DMED RFB 2026
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Configurador de Tributos</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Regras de IBS/CBS, alíquotas de teste e substituição gradual do ISS.
              </p>
              <div className="mt-2.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded inline-block">
                Rotina FISA170 / FISA022
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                <FileCode2 className="w-4 h-4 text-sky-600" />
                <span>TES (Tipos de Entrada/Saída)</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Segregação de Cessão de Jazigo (F4_ISS=N) vs Manutenção Cemiterial (F4_ISS=S).
              </p>
              <div className="mt-2.5 text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded inline-block">
                Tabela SF4
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                <Server className="w-4 h-4 text-purple-600" />
                <span>TSS (Totvs Sped Services)</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Recepção do layout NFS-e Padrão Nacional v2.1 e transmissão de lotes.
              </p>
              <div className="mt-2.5 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded inline-block">
                Patch TSS 12.1.2510
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                <span>Naturezas Financeiras</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Separação de receitas de planos funerários, cessão perpétua e taxas acessórias.
              </p>
              <div className="mt-2.5 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded inline-block">
                Tabela SED / MATA070
              </div>
            </div>
          </>
        )}
      </div>

      {/* Matérias e Ações Técnicas no ERP */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {isClinica
                ? 'Checklist de Parametrização & Normas no ERP de Saúde'
                : 'Parecer Técnico & Checklist de Parametrização no Protheus'}
            </h3>
            <p className="text-xs text-slate-500">
              {isClinica
                ? 'Normas da ANS, CFM e Receita Federal cruzadas com o sistema de gestão clínica'
                : 'Normas oficiais cruzadas com o dicionário de dados e módulos do TOTVS Protheus'}
            </p>
          </div>
        </div>

        <div className="space-y-4 mt-4">
          {materiasErp.map((noticia) => {
            const hasImpact = noticia.protheusParametrizacaoNecessaria;

            return (
              <div
                key={noticia.id}
                onClick={() => onSelectNoticia(noticia)}
                className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 cursor-pointer transition-all bg-white"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                      {noticia.ato} {noticia.numeroAto}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">{noticia.orgao}</span>
                  </div>

                  {/* Homologation Status Badge */}
                  <div>
                    {hasImpact ? (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          noticia.protheusStatusHomologacao === 'HOMOLOGADO'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : noticia.protheusStatusHomologacao === 'EM_TESTE'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        Homologação: {noticia.protheusStatusHomologacao || 'PENDENTE'}
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                        Sem impacto técnico no ERP
                      </span>
                    )}
                  </div>
                </div>

                <h4 className="text-xs font-bold text-slate-900 leading-snug">{noticia.titulo}</h4>

                {/* Technical Impact Box */}
                <div
                  className={`mt-2.5 p-3 rounded-lg border text-xs leading-relaxed ${
                    hasImpact
                      ? isClinica
                        ? 'bg-sky-50/50 border-sky-200 text-sky-950'
                        : 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                      : 'bg-slate-50 border-slate-200 text-slate-600 italic'
                  }`}
                >
                  <div className={`font-bold text-[11px] mb-0.5 flex items-center gap-1 ${isClinica ? 'text-sky-900' : 'text-emerald-900'}`}>
                    {isClinica ? <Activity className="w-3.5 h-3.5 text-sky-700" /> : <Cpu className="w-3.5 h-3.5 text-emerald-700" />}
                    {isClinica ? 'Impacto Técnico no ERP Clínico & Faturamento TISS:' : 'Impacto Técnico no Protheus:'}
                  </div>
                  <p>
                    {isClinica && noticia.impactoGeral.toLowerCase().includes('saúde')
                      ? `Exige atualização das regras de validação no ERP da clínica: ${noticia.impactoGeral}`
                      : noticia.impactoProtheus}
                  </p>

                  {hasImpact && noticia.protheusModulosAfetados.length > 0 && (
                    <div className={`mt-2 pt-2 border-t flex items-center gap-1.5 flex-wrap ${isClinica ? 'border-sky-200/60' : 'border-emerald-200/60'}`}>
                      <span className={`text-[10px] font-semibold ${isClinica ? 'text-sky-800' : 'text-emerald-800'}`}>
                        {isClinica ? 'Tabelas/Módulos Afetados:' : 'Módulos/Tabelas:'}
                      </span>
                      {noticia.protheusModulosAfetados.map((mod, i) => (
                        <span key={i} className={`text-[10px] px-2 py-0.5 rounded bg-white font-mono border ${isClinica ? 'text-sky-800 border-sky-200' : 'text-emerald-800 border-emerald-200'}`}>
                          {mod}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Vigência da Norma: <strong>{formatarData(noticia.dataVigencia)}</strong></span>
                  <span className={`${isClinica ? 'text-sky-700' : 'text-emerald-700'} font-semibold flex items-center gap-1`}>
                    Ver Ações Vinculadas <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
