import { FC, useState } from 'react';
import {
  Building2,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Info,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import { FiscalNoticia, FiscalServico, EmpresaPerfil } from '../types';

interface ModuloFunerariaCemiterioProps {
  noticias: FiscalNoticia[];
  servicos: FiscalServico[];
  onSelectNoticia: (noticia: FiscalNoticia) => void;
  empresas?: EmpresaPerfil[];
  selectedEmpresaId?: string | null;
  onSelectEmpresa?: (id: string) => void;
}

export const ModuloFunerariaCemiterio: FC<ModuloFunerariaCemiterioProps> = ({
  noticias,
  servicos,
  onSelectNoticia,
  empresas = [],
  selectedEmpresaId = null,
  onSelectEmpresa = () => {},
}) => {
  const [subsegmentoAtivo, setSubsegmentoAtivo] = useState<string>('TODOS');
  const [expandedServico, setExpandedServico] = useState<string | null>('25.01');

  const empresaAtiva = empresas.find((e) => e.id === selectedEmpresaId) || empresas[0];
  const isClinica = empresaAtiva?.id === 'instituto-go' || empresaAtiva?.segmento?.toLowerCase().includes('saúde') || empresaAtiva?.segmento?.toLowerCase().includes('médic');

  const subsegmentosFunerario = [
    'TODOS',
    'Funerárias',
    'Cemitérios',
    'Planos funerários',
    'Sepultamento',
    'Cremação',
    'Translado',
    'Jazigos',
    'Manutenção de cemitérios',
    'Cessão de espaços',
    'Receitas recorrentes',
    'Contratos',
  ];

  const subsegmentosSaude = [
    'TODOS',
    'Consultas Médicas',
    'Procedimentos Ambulatoriais',
    'Exames & Diagnósticos',
    'TISS & TUSS (ANS)',
    'DMED (Receita Federal)',
    'Equiparação Hospitalar',
    'Glosas de Convênios',
    'CFM & CRM',
    'ANVISA (RDC 50)',
  ];

  const subsegmentos = isClinica ? subsegmentosSaude : subsegmentosFunerario;

  const servicosSaude: FiscalServico[] = [
    {
      codigo: '4.01',
      tipoServico: 'Medicina e biomedicina (Consultas e Telemedicina)',
      descricao: 'Consultas médicas especializadas eletivas e de urgência, telemedicina e laudos emitidos com certificação digital ICP-Brasil.',
      regraAtual: 'Tributação de ISS (5% Belém). Retenção na fonte de IRRF (1,5%) e CSRF (4,65%) se contratado por pessoa jurídica.',
      regraFutura: 'Alíquota reduzida de IBS/CBS com desconto de 60% (alíquota efetiva projetada em 10,6%). Split payment na liquidação.',
      protheusRegra: 'Parametrização no módulo de faturamento clínico com emissão de NFS-e (Item 4.01) e exportador para DMED.',
      documento: 'NFS-e Belém + Guia TISS XML',
      codigoIss: '04.01',
      statusValidacao: 'VALIDADO',
    },
    {
      codigo: '4.02',
      tipoServico: 'Análises clínicas, patologia, tomografia, ressonância e métodos gráficos',
      descricao: 'Serviços de auxílio diagnóstico e terapia (SADT), exames laboratoriais, ecografia e procedimentos ambulatoriais especializados.',
      regraAtual: 'ISS 5%. Possibilidade de fruição de base reduzida de IRPJ (8%) e CSLL (12%) por Equiparação Hospitalar (Lei 9.249/95).',
      regraFutura: 'Regime favorecido de saúde (redução de 60% na CBS/IBS). Direito a crédito de IBS/CBS sobre reagentes e equipamentos.',
      protheusRegra: 'Cadastro de procedimentos SADT na tabela TUSS/CBHPM vinculados aos pedidos de exames.',
      documento: 'NFS-e + Lote XML SADT TISS',
      codigoIss: '04.02',
      statusValidacao: 'VALIDADO',
    },
    {
      codigo: '4.03',
      tipoServico: 'Hospitais, clínicas médicas ambulatoriais, prontos-socorros e infusões',
      descricao: 'Atendimento ambulatorial integral com infraestrutura cirúrgica de baixa/média complexidade, biópsias e infusões de medicamentos.',
      regraAtual: 'ISS no município do estabelecimento prestador. Retenção de 4,65% de CSRF nas faturas entre operadoras e clínicas PJ.',
      regraFutura: 'Alíquota favorecida da Reforma Tributária (LC 214/2025). Desoneração da cesta de medicamentos essenciais.',
      protheusRegra: 'Parametrização das regras de repasse médico e retenções automáticas nos pagamentos ao corpo clínico.',
      documento: 'NFS-e + Protocolo de Lote TISS',
      codigoIss: '04.03',
      statusValidacao: 'VALIDADO',
    },
    {
      codigo: '4.23',
      tipoServico: 'Outros serviços de assistência médica, enfermagem e terapias',
      descricao: 'Procedimentos multidisciplinares integrados à assistência médica especializada (enfermagem ambulatorial, nutrição clínica).',
      regraAtual: 'Tributação pelo ISS municipal. Dedução para DMED vinculada ao prontuário médico responsável.',
      regraFutura: 'Tratamento de serviços de saúde humana com redução de 60% na CBS e no IBS.',
      protheusRegra: 'Segregação de faturamento entre serviços médicos e serviços complementares multiprofissionais.',
      documento: 'NFS-e Padrão Nacional',
      codigoIss: '04.23',
      statusValidacao: 'VALIDADO',
    },
  ];

  const listaServicos = isClinica ? servicosSaude : servicos;

  const noticiasSetor = noticias.filter((n) => {
    if (subsegmentoAtivo === 'TODOS') {
      if (isClinica) {
        return (
          n.impactoGeral.toLowerCase().includes('saúde') ||
          (n.tema ? n.tema.toLowerCase().includes('saúde') : false) ||
          n.titulo.toLowerCase().includes('saúde') ||
          n.titulo.toLowerCase().includes('médic')
        );
      }
      return n.subsegmentosFunerariosAfetados.length > 0 || n.impactoFunerario.length > 0;
    }
    return n.subsegmentosFunerariosAfetados.includes(subsegmentoAtivo);
  });

  return (
    <div className="space-y-6" id="modulo-funeraria-container">
      {/* Top Header com Seletor de Empresa */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`p-2 rounded-lg ${isClinica ? 'bg-sky-100 text-sky-800' : 'bg-indigo-100 text-indigo-800'}`}>
            {isClinica ? <Stethoscope className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                {isClinica ? 'Setor Especializado: Clínicas Médicas & Saúde' : 'Setor Especializado: Cemitérios & Funerárias'}
              </h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isClinica ? 'bg-sky-100 text-sky-800' : 'bg-indigo-100 text-indigo-800'}`}>
                {isClinica ? 'Saúde Suplementar & ANS' : 'Lei 13.261/2016'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Legislação vertical, normas setoriais e parametrizações para <strong>{empresaAtiva?.nome}</strong>
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
                {emp.nome} ({emp.segmento})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sector Header */}
      <div className={`text-white rounded-xl p-5 border shadow-sm ${isClinica ? 'bg-sky-950 border-sky-900' : 'bg-indigo-950 border-indigo-900'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              {isClinica ? <Activity className="w-6 h-6 text-sky-400" /> : <Building2 className="w-6 h-6 text-indigo-400" />}
              <h2 className="text-lg font-bold tracking-tight text-white">
                {isClinica ? 'Módulo — Clínicas Médicas, Saúde & Diagnósticos' : 'Módulo — Funerárias & Cemitérios'}
              </h2>
            </div>
            <p className={`text-xs mt-1 max-w-3xl leading-relaxed ${isClinica ? 'text-sky-200' : 'text-indigo-200'}`}>
              {isClinica
                ? 'Monitoramento verticalizado para clínicas médicas, diagnósticos, faturamento de convênios TISS (ANS), DMED da Receita Federal, equiparação hospitalar e regulação do CFM.'
                : 'Monitoramento verticalizado para funerárias, cemitérios particulares, planos de assistência funeral, cremação, concessão de jazigos perpétuos e receitas recorrentes de manutenção (LC 116/2003 Item 25).'}
            </p>
          </div>
          <div className={`border rounded-lg p-3 text-xs shrink-0 ${isClinica ? 'bg-sky-900/60 border-sky-800 text-sky-200' : 'bg-indigo-900/60 border-indigo-800 text-indigo-200'}`}>
            <span className={`block text-[11px] font-bold uppercase tracking-wider ${isClinica ? 'text-sky-300' : 'text-indigo-400'}`}>
              {isClinica ? 'Regra de Saúde (LC 214/2025)' : 'Regra de Enquadramento'}
            </span>
            <span>{isClinica ? 'Redução de 60% na alíquota de CBS/IBS para saúde.' : 'Sem tratamento específico = decorre da regra geral.'}</span>
          </div>
        </div>

        {/* Subsegment Filter Buttons */}
        <div className={`mt-4 pt-3 border-t flex flex-wrap gap-1.5 ${isClinica ? 'border-sky-900/80' : 'border-indigo-900/80'}`}>
          {subsegmentos.map((sub) => (
            <button
              key={sub}
              onClick={() => setSubsegmentoAtivo(sub)}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                subsegmentoAtivo === sub
                  ? isClinica
                    ? 'bg-sky-500 text-white shadow-xs font-semibold'
                    : 'bg-indigo-500 text-white shadow-xs font-semibold'
                  : isClinica
                  ? 'bg-sky-900/40 text-sky-200 hover:bg-sky-800/60'
                  : 'bg-indigo-900/40 text-indigo-200 hover:bg-indigo-800/60'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Base Legal do Segmento: LC 116/2003 */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className={`w-4 h-4 ${isClinica ? 'text-sky-600' : 'text-indigo-600'}`} />
              {isClinica
                ? 'Base Legal do Segmento — Lei Complementar nº 116/2003 (Item 4: Saúde e Medicina)'
                : 'Base Legal do Segmento — Lei Complementar nº 116/2003 (Item 25: Funerais e Cemitérios)'}
            </h3>
            <p className="text-xs text-slate-500">
              Mapeamento de subitens, regra atual de ISS vs regra futura de IBS/CBS e parametrização fiscal
            </p>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {listaServicos.length} Subitens Regulados
          </span>
        </div>

        <div className="divide-y divide-slate-200 mt-3">
          {listaServicos.map((servico) => {
            const isExpanded = expandedServico === servico.codigo;
            return (
              <div key={servico.codigo} className="py-3">
                <div
                  onClick={() => setExpandedServico(isExpanded ? null : servico.codigo)}
                  className="flex items-center justify-between cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded font-mono text-xs font-bold border ${isClinica ? 'bg-sky-50 text-sky-800 border-sky-200' : 'bg-indigo-50 text-indigo-800 border-indigo-200'}`}>
                      Subitem {servico.codigo}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{servico.tipoServico}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{servico.descricao}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        servico.statusValidacao === 'VALIDADO'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {servico.statusValidacao}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-3">
                    <div className="text-slate-700 text-xs italic bg-white p-2.5 rounded border border-slate-200">
                      <strong>Texto Legal:</strong> {servico.descricao}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="bg-white p-3 rounded border border-slate-200">
                        <div className="font-bold text-slate-900 text-xs mb-1 text-sky-800">Regra Atual (ISS)</div>
                        <p className="text-slate-600 text-xs leading-relaxed">{servico.regraAtual}</p>
                      </div>

                      <div className="bg-white p-3 rounded border border-slate-200">
                        <div className="font-bold text-slate-900 text-xs mb-1 text-purple-800">Regra Futura (IBS/CBS)</div>
                        <p className="text-slate-600 text-xs leading-relaxed">{servico.regraFutura}</p>
                      </div>

                      <div className="bg-white p-3 rounded border border-slate-200">
                        <div className="font-bold text-slate-900 text-xs mb-1 text-emerald-800">Regra ERP / Gestão</div>
                        <p className="text-slate-600 text-xs leading-relaxed">{servico.protheusRegra}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>Documento Fiscal Padrão: <strong>{servico.documento}</strong></span>
                      <span>Código ISS/NFS-e: <strong>{servico.codigoIss}</strong></span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Normas e Mudanças com Impacto no Segmento */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Publicações Oficiais com Reflexos no Segmento
            </h3>
            <p className="text-xs text-slate-500">
              Filtro ativo: <strong>{subsegmentoAtivo}</strong> ({noticiasSetor.length} matérias encontradas)
            </p>
          </div>
        </div>

        <div className="space-y-3.5 mt-4">
          {noticiasSetor.map((noticia) => (
            <div
              key={noticia.id}
              onClick={() => onSelectNoticia(noticia)}
              className="p-4 rounded-xl border border-slate-200 hover:border-indigo-400 bg-white hover:shadow-xs cursor-pointer transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                    {noticia.ato} {noticia.numeroAto}
                  </span>
                  <span className="text-xs font-semibold text-slate-700">{noticia.orgao}</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {noticia.subsegmentosFunerariosAfetados.map((sub, i) => (
                    <span key={i} className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              <h4 className="text-xs font-bold text-slate-900 leading-snug">{noticia.titulo}</h4>

              {/* Specific Funeral Impact Highlight Box */}
              <div className="mt-2.5 p-3 rounded-lg bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-950">
                <div className="font-bold text-[11px] text-indigo-900 mb-0.5 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-indigo-600" />
                  Análise Específica Funerárias & Cemitérios:
                </div>
                <p className="text-slate-700 text-xs leading-relaxed">{noticia.impactoFunerario}</p>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                <span>Vigência: <strong>{noticia.dataVigencia}</strong></span>
                <span className="text-indigo-700 font-semibold flex items-center gap-1">
                  Ver Análise Completa <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
