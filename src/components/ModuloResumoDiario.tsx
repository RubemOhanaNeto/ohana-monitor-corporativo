import React, { FC, useState } from 'react';
import {
  FileText,
  Calendar,
  Building2,
  Copy,
  Check,
  Download,
  Printer,
  Sparkles,
  ShieldAlert,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { FiscalNoticia, EmpresaPerfil } from '../types';

interface ModuloResumoDiarioProps {
  noticias: FiscalNoticia[];
  empresas: EmpresaPerfil[];
  onVerDetalhesNoticia: (noticia: FiscalNoticia) => void;
}

export const ModuloResumoDiario: FC<ModuloResumoDiarioProps> = ({
  noticias,
  empresas,
  onVerDetalhesNoticia,
}) => {
  const [copiado, setCopiado] = useState(false);

  const noticiasCriticas = noticias.filter((n) => n.nivelUrgencia === 'CRITICO');
  const noticiasAltas = noticias.filter((n) => n.nivelUrgencia === 'ALTO');

  const gerarTextoResumo = () => {
    return `# OHANA MONITOR CORPORATIVO — RESUMO EXECUTIVO DIÁRIO
Data: 17 de Setembro de 2026 | Destinatário: Rubinho (Presidente)

---

## 1. PANORAMA GERAL DO DIA
- Fontes Ativas: 84 fontes monitoradas 24/7
- Coletas Brutas Processadas: 8.421 registros
- Matérias com Relevância Direta: 17
- Matérias Críticas que Exigem Atenção: 3
- Decisões Pendentes do Presidente: 2

---

## 2. ITENS QUE DEMANDAM SUA DECISÃO
1. RECANTO DA SAUDADE (COO / CCO)
   - Resolução SEMAS/PA nº 482/2026: Novo protocolo de piezômetros e monitoramento de águas subterrâneas.
   - Impacto: R$ 38.500 para laudo hidrogeológico até 31/10/2026.
   - Decisão Necessária: Aprovação do orçamento e contratação da empresa técnica.

2. RECANTO DA SAUDADE (CRO / COO)
   - Edital de Pregão Eletrônico Belém nº 042/2026: R$ 4,8M para sepultamentos e auxílio-funeral.
   - Prazo de Abertura: 08/10/2026.
   - Decisão Necessária: Validação da participação com consórcio regional.

---

## 3. DESTAQUES POR DIRETORIA
- CFO (Finanças & Fiscal): Receita Federal publicou IN 2.290/2026 confirmando crédito de CBS sobre contratos de tecnologia e segurança predial. Selic em 10,50% a.a.
- CTO (Tecnologia & Protheus): Patch TSS 3.0 disponibilizado para rotina MATA953 com prazo até 15/10/2026.
- CLO (Jurídico): Despacho no TJPA sobre processo de reajuste tarifário (prazo de 15 dias para manifestação).
- NAYÁ (Inteligência Artificial): Modelos de extração com 40% menor latência e deduplicação precisa por SHA-256.

---
Relatório gerado automaticamente pelo OHANA Orquestrador.`;
  };

  const handleCopiar = () => {
    navigator.clipboard.writeText(gerarTextoResumo());
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12" id="modulo-resumo-diario">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
            BRIEFING SINTÉTICO AUTOMATIZADO
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Resumo Executivo Diário para o Presidente
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            17 de Setembro de 2026 • Síntese estruturada das principais movimentações que impactam o grupo OHANA.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopiar}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            {copiado ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiado ? 'Copiado!' : 'Copiar Markdown'}</span>
          </button>
        </div>
      </div>

      {/* Relatório Formatado */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 max-w-4xl mx-auto">
        {/* Bloco 1: KPIs do dia */}
        <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-emerald-400 uppercase">
              1. PANORAMA EXECUTIVO
            </span>
            <span className="text-xs font-mono text-slate-400">17/09/2026</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            O OHANA Data Hub processou hoje <strong>8.421 registros</strong> em <strong>84 fontes ativas</strong>. Aplicando o funil de relevância e especialidade do grupo, <strong>17 matérias</strong> foram catalogadas com impacto direto, das quais <strong>3 são críticas</strong> e <strong>2 necessitam da sua validação formal</strong>.
          </p>
        </div>

        {/* Bloco 2: Itens que exigem decisão */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            2. DECISÕES EXECUTIVAS IMEDIATAS (RUBINHO)
          </h3>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-950">
                  Recanto da Saudade • Resolução SEMAS/PA nº 482/2026
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-200 text-red-900">
                  Prazo: 31/10/2026
                </span>
              </div>
              <p className="text-xs text-red-900">
                Nova exigência técnica de medição contínua em poços piezométricos no cemitério parque em Ananindeua. Necessita aprovar a contratação de engenharia ambiental (R$ 38.500) e protocolo no portal da SEMAS.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950">
                  Recanto da Saudade • Pregão Eletrônico Belém nº 042/2026
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                  Abertura: 08/10/2026
                </span>
              </div>
              <p className="text-xs text-amber-900">
                Licitação pública de R$ 4,8 milhões para serviços de auxílio-funeral continuado na Região Metropolitana de Belém. Validar viabilidade técnica e formação de consórcio.
              </p>
            </div>
          </div>
        </div>

        {/* Bloco 3: Destaques por Diretoria */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-emerald-600" />
            3. DESTAQUES DE VIGILÂNCIA POR DIRETORIA
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <strong className="text-slate-900 block font-bold">CFO (Finanças & Tributário)</strong>
              <p className="text-slate-600">
                IN 2.290/2026 da Receita Federal permitindo aproveitamento de crédito de CBS sobre contratações de segurança e TI. Selic estável em 10,50% a.a.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <strong className="text-slate-900 block font-bold">CTO (Tecnologia & Protheus)</strong>
              <p className="text-slate-600">
                Atualização técnica da TOTVS para rotina MATA953 (TSS 3.0) já em testes no ambiente de homologação. Prazo de corte para produção em 15/10.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <strong className="text-slate-900 block font-bold">CLO (Jurídico & Compliance)</strong>
              <p className="text-slate-600">
                DataJud TJPA: Intimação sobre processo de taxa de manutenção cemiterial com prazo legal de 15 dias úteis para resposta.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <strong className="text-slate-900 block font-bold">NAYÁ (Inteligência Artificial)</strong>
              <p className="text-slate-600">
                Ingestão automática do DOU e DOE-PA operando com 99,8% de precisão e deduplicação de notícias por Hash SHA-256.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
