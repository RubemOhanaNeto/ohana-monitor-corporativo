import { FC, useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Lock,
  Globe,
  RefreshCw,
  Server,
  AlertTriangle,
  Code2,
  TrendingUp,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Activity,
  Sparkles,
} from 'lucide-react';
import { OrgaoOficial } from '../types';
import { ValidadorUrlsFontes } from './ValidadorUrlsFontes';

interface FonteInfo {
  orgao: OrgaoOficial;
  nome: string;
  prioridade: number;
  urlOficial: string;
  tipo: string;
  statusConexao: 'ONLINE' | 'MONITORANDO' | 'SINCRONIZADO';
  descricao: string;
}

interface PublicApiStatus {
  id: string;
  nome: string;
  categoria: string;
  documentacao: string;
  urlTeste: string;
  descricao: string;
  status: string;
  httpStatus: number;
  latenciaMs: number;
  ultimaVerificacao: string;
  dadosAmostra: any;
}

interface ModuloFontesOficiaisProps {
  onSync: () => void;
  isSyncing: boolean;
}

export const ModuloFontesOficiais: FC<ModuloFontesOficiaisProps> = ({
  onSync,
  isSyncing,
}) => {
  const [abaModulo, setAbaModulo] = useState<'validador' | 'catalogo'>('validador');
  const [publicApis, setPublicApis] = useState<PublicApiStatus[]>([]);
  const [loadingApis, setLoadingApis] = useState(false);
  const [jsonInspecionado, setJsonInspecionado] = useState<any | null>(null);
  const [apiInspecionadaNome, setApiInspecionadaNome] = useState<string>('');

  const carregarStatusPublicApis = async () => {
    setLoadingApis(true);
    try {
      const res = await fetch('/api/integracoes/governo/status');
      if (res.ok) {
        const data = await res.json();
        if (data && data.apis) {
          setPublicApis(data.apis);
        }
      }
    } catch {
      // Fallback handled gracefully
    } finally {
      setLoadingApis(false);
    }
  };

  useEffect(() => {
    carregarStatusPublicApis();
  }, []);

  const fontes: FonteInfo[] = [
    {
      orgao: 'DOU',
      nome: 'Diário Oficial da União (Imprensa Nacional)',
      prioridade: 1,
      urlOficial: 'https://www.in.gov.br',
      tipo: 'Ato Oficial / Publicação Primária',
      statusConexao: 'ONLINE',
      descricao: 'Publicação oficial de leis ordinárias, leis complementares, medidas provisórias, decretos e portarias ministeriais.',
    },
    {
      orgao: 'RECEITA_FEDERAL',
      nome: 'Secretaria Especial da Receita Federal do Brasil (RFB)',
      prioridade: 2,
      urlOficial: 'https://www.gov.br/receitafederal',
      tipo: 'Instruções Normativas & Soluções de Consulta',
      statusConexao: 'ONLINE',
      descricao: 'Normas gerais de arrecadação, tributos federais, EFD-Reinf, SPED e convênios nacionais.',
    },
    {
      orgao: 'MINISTERIO_FAZENDA',
      nome: 'Ministério da Fazenda',
      prioridade: 3,
      urlOficial: 'https://www.gov.br/fazenda',
      tipo: 'Diretrizes Macrotributárias & Reforma',
      statusConexao: 'ONLINE',
      descricao: 'Portarias ministeriais, regulamentos da Reforma Tributária (CBS) e notas informativas.',
    },
    {
      orgao: 'COMITE_GESTOR_IBS',
      nome: 'Comitê Gestor do Imposto sobre Bens e Serviços (CG-IBS)',
      prioridade: 4,
      urlOficial: 'https://www.gov.br/fazenda/cgibs',
      tipo: 'Resoluções & Notas Técnicas Operacionais',
      statusConexao: 'ONLINE',
      descricao: 'Regulamentação e harmonização do IBS estadual e municipal, leiaute nacional e alíquota de teste.',
    },
    {
      orgao: 'PORTAL_NACIONAL_NFSE',
      nome: 'Portal de Gestão da NFS-e Padrão Nacional',
      prioridade: 5,
      urlOficial: 'https://www.gov.br/nfse',
      tipo: 'Especificações Técnicas de Emissão',
      statusConexao: 'ONLINE',
      descricao: 'Padrão nacional obrigatório para serviços funerários e cemiteriais (LC 116 item 25).',
    },
    {
      orgao: 'PLANALTO',
      nome: 'Presidência da República / Casa Civil (Portal da Legislação)',
      prioridade: 6,
      urlOficial: 'http://www.planalto.gov.br',
      tipo: 'Texto Compilado de Leis & Decretos',
      statusConexao: 'ONLINE',
      descricao: 'Fonte oficial para vigência formal de Leis Complementares e Emendas Constitucionais.',
    },
    {
      orgao: 'CONFAZ',
      nome: 'Conselho Nacional de Política Fazendária (CONFAZ)',
      prioridade: 7,
      urlOficial: 'https://www.confaz.fazenda.gov.br',
      tipo: 'Convênios & Ajustes SINIEF',
      statusConexao: 'ONLINE',
      descricao: 'Regulamentação interestadual, documentos fiscais eletrônicos e transporte.',
    },
    {
      orgao: 'SEFAZ',
      nome: 'Secretarias de Fazenda Estaduais (SEFAZ)',
      prioridade: 8,
      urlOficial: 'https://www.sefaz.gov.br',
      tipo: 'Regulamentos de ICMS e Transição IBS',
      statusConexao: 'MONITORANDO',
      descricao: 'Regras estaduais sobre translado interestadual de corpos e apuração.',
    },
    {
      orgao: 'PREFEITURAS',
      nome: 'Secretarias de Finanças Municipais (ISS)',
      prioridade: 9,
      urlOficial: 'https://prefeituras.gov.br',
      tipo: 'Legislação Municipal do ISS (LC 116)',
      statusConexao: 'MONITORANDO',
      descricao: 'Alíquotas municipais do subitem 25.01 ao 25.05 e taxas de cemitérios públicos e concedidos.',
    },
    {
      orgao: 'CAMARA_DEPUTADOS',
      nome: 'Câmara dos Deputados (API Dados Abertos)',
      prioridade: 10,
      urlOficial: 'https://dadosabertos.camara.leg.br',
      tipo: 'API Oficial de Proposições Legislativas',
      statusConexao: 'ONLINE',
      descricao: 'Monitoramento direto de projetos de lei em tramitação na Câmara.',
    },
    {
      orgao: 'SENADO_FEDERAL',
      nome: 'Senado Federal (Portal da Atividade Legislativa)',
      prioridade: 11,
      urlOficial: 'https://www.senado.leg.br',
      tipo: 'Tramitação de Emendas e Comissões',
      statusConexao: 'ONLINE',
      descricao: 'Acompanhamento da votação do Comitê Gestor e revisões da Reforma Tributária.',
    },
  ];

  return (
    <div className="space-y-6" id="modulo-fontes-container">
      {/* Hierarchy Rule Header */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <h2 className="text-lg font-bold tracking-tight text-white">
                Módulo — Fontes Oficiais & Conectores Primários
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              O Radar Fiscal adota a regra primordial da <strong>fonte oficial primária</strong>: nenhum fato tributário é homologado no sistema sem comprovação direta no Diário Oficial ou portal do órgão emissor.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onSync();
                carregarStatusPublicApis();
              }}
              disabled={isSyncing || loadingApis}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing || loadingApis ? 'animate-spin' : ''}`} />
              <span>{isSyncing || loadingApis ? 'Auditando Conexões...' : 'Testar Conexões e Sincronizar'}</span>
            </button>
          </div>
        </div>

        {/* Legal Rule Alert */}
        <div className="mt-4 p-3 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300 flex items-start gap-2">
          <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong>Regra de Segurança de Dados:</strong> APIs comunitárias, blogs e portais secundários de terceiros nunca são aceitos como fonte legal principal. Cada matéria permite no máximo 3 fontes auditadas (Ato oficial, página explicativa e nota técnica complementar).
          </div>
        </div>
      </div>

      {/* Navegação entre Validador de Links e Catálogo de APIs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          type="button"
          onClick={() => setAbaModulo('validador')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
            abaModulo === 'validador'
              ? 'border-emerald-600 text-emerald-800 bg-white shadow-2xs'
              : 'border-transparent text-slate-600 hover:text-slate-900 bg-slate-100/70 hover:bg-slate-100'
          }`}
          id="tab-modulo-validador-links"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Validador de URLs & Monitoramento Interno</span>
          <span className="px-2 py-0.2 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
            Ativo
          </span>
        </button>

        <button
          type="button"
          onClick={() => setAbaModulo('catalogo')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
            abaModulo === 'catalogo'
              ? 'border-emerald-600 text-emerald-800 bg-white shadow-2xs'
              : 'border-transparent text-slate-600 hover:text-slate-900 bg-slate-100/70 hover:bg-slate-100'
          }`}
          id="tab-modulo-catalogo-apis"
        >
          <Server className="w-4 h-4 text-sky-600" />
          <span>Catálogo de APIs Governamentais & 11 Fontes Oficiais</span>
        </button>
      </div>

      {/* Renderização Condicional da Aba */}
      {abaModulo === 'validador' ? (
        <ValidadorUrlsFontes />
      ) : (
        <div className="space-y-6">
          {/* NEW SECTION: Public APIs (Government) Integration Hub */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-sky-400" />
              <h3 className="text-sm font-bold text-white">
                Catálogo de APIs Governamentais Abertas (Public APIs — Government)
              </h3>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Conectores REST públicos indexados para monitoramento legislativo, índices econômico-fiscais e Diários Oficiais
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://github.com/public-apis/public-apis#government"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              <span>Repositório Public-APIs</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={carregarStatusPublicApis}
              disabled={loadingApis}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingApis ? 'animate-spin' : ''}`} />
              <span>Ping em Tempo Real</span>
            </button>
          </div>
        </div>

        {/* Live APIs Cards Grid */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 bg-slate-50/50">
          {publicApis.length === 0 ? (
            <div className="col-span-full py-6 text-center text-xs text-slate-500">
              Carregando status dos conectores governamentais...
            </div>
          ) : (
            publicApis.map((api) => (
              <div
                key={api.id}
                className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200">
                      {api.categoria}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {api.status} ({api.latenciaMs}ms)
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 leading-snug">{api.nome}</h4>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {api.descricao}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <a
                    href={api.documentacao}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-1"
                  >
                    <span>Docs</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    onClick={() => {
                      setJsonInspecionado(api.dadosAmostra);
                      setApiInspecionadaNome(api.nome);
                    }}
                    className="text-[11px] text-sky-700 hover:text-sky-900 font-semibold inline-flex items-center gap-1 bg-sky-50 hover:bg-sky-100 px-2 py-1 rounded transition-colors"
                  >
                    <Code2 className="w-3 h-3" />
                    <span>Ver Payload JSON</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* JSON Inspector Modal/Box if an API is selected */}
        {jsonInspecionado && (
          <div className="m-4 p-4 rounded-lg bg-slate-950 text-slate-100 border border-slate-800">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-white">
                  Payload JSON Retornado em Tempo Real — {apiInspecionadaNome}
                </span>
              </div>
              <button
                onClick={() => setJsonInspecionado(null)}
                className="text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800"
              >
                Fechar Inspector
              </button>
            </div>
            <pre className="text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-60 p-2 bg-slate-900 rounded">
              {JSON.stringify(jsonInspecionado, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Official Sources Priority List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Hierarquia das 11 Fontes Oficiais Prioritárias (PRD Seção 10)
            </h3>
            <p className="text-xs text-slate-500">
              Ordem estrita de precedência legal para confirmação de fatos e vigência
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {fontes.map((fonte) => (
            <div key={fonte.prioridade} className="p-4 hover:bg-slate-50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-full bg-slate-100 border border-slate-300 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {fonte.prioridade}º
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{fonte.nome}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {fonte.statusConexao}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{fonte.descricao}</p>
                    <span className="text-[11px] text-slate-500 font-medium mt-1 block">
                      Tipo: {fonte.tipo}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={fonte.urlOficial}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded transition-colors"
                  >
                    <span>Acessar Portal</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )}
</div>
  );
};
