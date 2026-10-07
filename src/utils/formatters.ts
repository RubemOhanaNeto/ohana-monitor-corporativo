import {
  StatusJuridico,
  StatusAtualidade,
  NivelUrgencia,
  NivelRisco,
  StatusAcao,
  AreaResponsavel,
  OrgaoOficial,
  TramitacaoEtapa,
} from '../types';

export function formatarData(dataStr?: string): string {
  if (!dataStr) return 'Não definida';
  const parts = dataStr.split('-');
  if (parts.length !== 3) return dataStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export function calcularDiasRestantes(dataAlvo: string, dataBase: string = '2026-09-17'): number {
  const dAlvo = new Date(dataAlvo).getTime();
  const dBase = new Date(dataBase).getTime();
  const diffTime = dAlvo - dBase;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getStatusJuridicoLabel(status: StatusJuridico): string {
  switch (status) {
    case 'VIGENTE':
      return 'Vigente';
    case 'VIGENCIA_FUTURA':
      return 'Vigência Futura';
    case 'EM_TRAMITACAO':
      return 'Em Tramitação';
    case 'EM_DISCUSSAO':
      return 'Em Discussão';
    case 'NOTA_TECNICA':
      return 'Nota Técnica';
    case 'ORIENTACAO_OPERACIONAL':
      return 'Orientação Operacional';
    case 'BASE_LEGAL':
      return 'Base Legal';
    default:
      return status;
  }
}

export function getStatusJuridicoColor(status: StatusJuridico): { bg: string; text: string; border: string } {
  switch (status) {
    case 'VIGENTE':
      return { bg: 'bg-emerald-50 text-emerald-800 border-emerald-300', text: 'text-emerald-800', border: 'border-emerald-300' };
    case 'VIGENCIA_FUTURA':
      return { bg: 'bg-blue-50 text-blue-800 border-blue-300', text: 'text-blue-800', border: 'border-blue-300' };
    case 'EM_TRAMITACAO':
      return { bg: 'bg-purple-50 text-purple-800 border-purple-300', text: 'text-purple-800', border: 'border-purple-300' };
    case 'EM_DISCUSSAO':
      return { bg: 'bg-amber-50 text-amber-800 border-amber-300', text: 'text-amber-800', border: 'border-amber-300' };
    case 'NOTA_TECNICA':
      return { bg: 'bg-cyan-50 text-cyan-800 border-cyan-300', text: 'text-cyan-800', border: 'border-cyan-300' };
    case 'ORIENTACAO_OPERACIONAL':
      return { bg: 'bg-slate-100 text-slate-800 border-slate-300', text: 'text-slate-800', border: 'border-slate-300' };
    case 'BASE_LEGAL':
      return { bg: 'bg-indigo-50 text-indigo-800 border-indigo-300', text: 'text-indigo-800', border: 'border-indigo-300' };
  }
}

export function getStatusAtualidadeBadge(status: StatusAtualidade): { label: string; bg: string; text: string } {
  switch (status) {
    case 'NOVO_HOJE':
      return { label: 'NOVO HOJE', bg: 'bg-rose-600', text: 'text-white' };
    case 'ATUALIZADO_HOJE':
      return { label: 'ATUALIZADO HOJE', bg: 'bg-amber-600', text: 'text-white' };
    case 'ULTIMOS_7_DIAS':
      return { label: 'ÚLTIMOS 7 DIAS', bg: 'bg-sky-600', text: 'text-white' };
    case 'ANTERIOR':
      return { label: 'ANTERIOR', bg: 'bg-slate-500', text: 'text-white' };
  }
}

export function getNivelUrgenciaBadge(urgencia: NivelUrgencia): { label: string; desc: string; bg: string; text: string } {
  switch (urgencia) {
    case 'CRITICO':
      return { label: 'Crítico', desc: 'Até 7 dias', bg: 'bg-rose-100 text-rose-800 border-rose-300', text: 'text-rose-800' };
    case 'ALTO':
      return { label: 'Alto', desc: '8 a 30 dias', bg: 'bg-orange-100 text-orange-800 border-orange-300', text: 'text-orange-800' };
    case 'MEDIO':
      return { label: 'Médio', desc: '31 a 90 dias', bg: 'bg-amber-100 text-amber-800 border-amber-300', text: 'text-amber-800' };
    case 'PLANEJAMENTO':
      return { label: 'Planejamento', desc: 'Mais de 90 dias', bg: 'bg-slate-100 text-slate-700 border-slate-300', text: 'text-slate-700' };
  }
}

export function getNivelRiscoBadge(risco: NivelRisco): { label: string; bg: string } {
  switch (risco) {
    case 'CRITICO':
      return { label: 'Risco Crítico', bg: 'bg-red-600 text-white' };
    case 'ALTO':
      return { label: 'Risco Alto', bg: 'bg-orange-500 text-white' };
    case 'MEDIO':
      return { label: 'Risco Médio', bg: 'bg-amber-500 text-stone-900' };
    case 'BAIXO':
      return { label: 'Risco Baixo', bg: 'bg-emerald-600 text-white' };
  }
}

export function getStatusAcaoBadge(status: StatusAcao): { label: string; bg: string; text: string } {
  switch (status) {
    case 'ABERTA':
      return { label: 'Aberta', bg: 'bg-yellow-50 text-yellow-800 border-yellow-300', text: 'text-yellow-800' };
    case 'EM_ANDAMENTO':
      return { label: 'Em Andamento', bg: 'bg-blue-50 text-blue-800 border-blue-300', text: 'text-blue-800' };
    case 'EM_HOMOLOGACAO':
      return { label: 'Em Homologação', bg: 'bg-purple-50 text-purple-800 border-purple-300', text: 'text-purple-800' };
    case 'CONCLUIDA':
      return { label: 'Concluída', bg: 'bg-emerald-50 text-emerald-800 border-emerald-300', text: 'text-emerald-800' };
    case 'IMPEDIDA':
      return { label: 'Impedida', bg: 'bg-rose-50 text-rose-800 border-rose-300', text: 'text-rose-800' };
  }
}

export function getAreaLabel(area: AreaResponsavel): string {
  switch (area) {
    case 'FISCAL':
      return 'Fiscal';
    case 'CONTABIL':
      return 'Contábil';
    case 'FINANCEIRO':
      return 'Financeiro';
    case 'TI_PROTHEUS':
      return 'TI / Protheus';
    case 'GESTAO_FUNERARIA':
      return 'Gestão Funerária/Cemitério';
    case 'JURIDICO':
      return 'Jurídico';
    case 'DIRETORIA':
      return 'Diretoria';
  }
}

export function getOrgaoNome(orgao: OrgaoOficial): string {
  switch (orgao) {
    case 'DOU':
      return 'Diário Oficial da União';
    case 'RECEITA_FEDERAL':
      return 'Receita Federal';
    case 'MINISTERIO_FAZENDA':
      return 'Ministério da Fazenda';
    case 'COMITE_GESTOR_IBS':
      return 'Comitê Gestor do IBS';
    case 'PORTAL_NACIONAL_NFSE':
      return 'Portal Nacional da NFS-e';
    case 'PLANALTO':
      return 'Presidência / Planalto';
    case 'CONFAZ':
      return 'CONFAZ';
    case 'SEFAZ':
      return 'Secretaria de Fazenda (SEFAZ)';
    case 'PREFEITURAS':
      return 'Prefeituras Municipais';
    case 'CAMARA_DEPUTADOS':
      return 'Câmara dos Deputados';
    case 'SENADO_FEDERAL':
      return 'Senado Federal';
  }
}

export function getTramitacaoLabel(etapa: TramitacaoEtapa): string {
  switch (etapa) {
    case 'EM_DISCUSSAO':
      return '1. Em Discussão';
    case 'APROVADO_CAMARA':
      return '2. Aprovado na Câmara';
    case 'AGUARDANDO_SENADO':
      return '3. Aguardando Senado';
    case 'AGUARDANDO_SANCAO':
      return '4. Aguardando Sanção';
    case 'PUBLICADO':
      return '5. Publicado';
    case 'VIGENTE':
      return '6. Vigente';
  }
}
