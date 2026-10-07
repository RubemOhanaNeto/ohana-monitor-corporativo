import { FC, useState } from 'react';
import {
  BookOpen,
  Building2,
  Scale,
  TrendingUp,
  FileCheck2,
  FolderTree,
  DollarSign,
  Download,
  Search,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Layers,
  Activity,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import { EmpresaPerfil, ItemDRE, ContaBalancete } from '../types';
import { obterDadosSegmentoEmpresa } from '../data/segmentoEmpresasData';

interface ModuloContabilProps {
  empresas: EmpresaPerfil[];
  selectedEmpresaId: string | null;
  onSelectEmpresa: (id: string | null) => void;
}

export const ModuloContabil: FC<ModuloContabilProps> = ({
  empresas,
  selectedEmpresaId,
  onSelectEmpresa,
}) => {
  const [subAba, setSubAba] = useState<'dre' | 'balanco' | 'balancete' | 'auditoria-cfc' | 'plano-contas'>('dre');
  const [buscaConta, setBuscaConta] = useState('');
  const [filtroTipoConta, setFiltroTipoConta] = useState<string>('TODAS');

  const empresaAtiva = empresas.find((e) => e.id === selectedEmpresaId) || empresas[0];
  const dadosSegmento = obterDadosSegmentoEmpresa(empresaAtiva?.id);

  const formatarMoeda = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const itensDre = dadosSegmento.dreSegmentada;
  const contasBalancete = dadosSegmento.contasBalancete;

  const totalAtivo = contasBalancete.filter((c) => c.tipo === 'ATIVO').reduce((acc, c) => acc + c.saldoAtual, 0);
  const totalPassivo = contasBalancete.filter((c) => c.tipo === 'PASSIVO').reduce((acc, c) => acc + c.saldoAtual, 0);
  const totalPL = contasBalancete.filter((c) => c.tipo === 'PATRIMONIO_LIQUIDO').reduce((acc, c) => acc + c.saldoAtual, 0);

  const receitaOperacionalLiquida = itensDre.find((i) => i.tipo === 'RECEITA_LIQUIDA')?.valor || 0;
  const ebitda = itensDre.find((i) => i.tipo === 'EBITDA')?.valor || 0;
  const lucroLiquido = itensDre.find((i) => i.tipo === 'LUCRO_LIQUIDO')?.valor || 0;
  const receitaBruta = itensDre.find((i) => i.descricao.includes('TOTAL') || i.tipo === 'RECEITA_BRUTA')?.valor || 1;

  const contasFiltradas = contasBalancete.filter((c) => {
    if (filtroTipoConta !== 'TODAS' && c.tipo !== filtroTipoConta) return false;
    if (buscaConta) {
      const q = buscaConta.toLowerCase();
      return c.descricao.toLowerCase().includes(q) || c.codigo.includes(q);
    }
    return true;
  });

  const isClinica = dadosSegmento.setorCodigo === 'SAUDE_CLINICAS';

  return (
    <div className="space-y-6" id="modulo-contabil-root">
      {/* Top Banner Contextualizado */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className={`p-2.5 rounded-xl ${isClinica ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'}`}>
            {isClinica ? <Stethoscope className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Módulo Contábil & Demonstrações</h2>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                isClinica ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                NBC TG 22 — {dadosSegmento.segmentoNome.split(',')[0]}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Demonstrações Contábeis parametrizadas pelo Sistema CFC/CRCs e escrituração digital (ECD/ECF/Sped).
            </p>
          </div>
        </div>

        {/* Seletor de Empresa */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={empresaAtiva?.id || ''}
            onChange={(e) => onSelectEmpresa(e.target.value)}
            className="w-full md:w-64 text-xs font-semibold bg-slate-50 border border-slate-300 text-slate-800 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
            id="select-empresa-contabil"
          >
            {empresas.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.nome} ({emp.segmento.split(',')[0]})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4 Cards de Resumo Contábil do Segmento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold block">Receita Operacional Líquida</span>
          <div className="text-xl font-black text-slate-900 mt-1">{formatarMoeda(receitaOperacionalLiquida)}</div>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
            Segmento: {isClinica ? 'Consultas & Procedimentos' : 'Planos Funerários & Jazigos'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold block">EBITDA Gerencial</span>
          <div className="text-xl font-black text-blue-900 mt-1">{formatarMoeda(ebitda)}</div>
          <span className="text-[11px] text-blue-700 font-semibold block mt-1">
            Margem Operacional: {((ebitda / (receitaBruta || 1)) * 100).toFixed(1)}%
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold block">Lucro Líquido do Mês</span>
          <div className="text-xl font-black text-emerald-700 mt-1">{formatarMoeda(lucroLiquido)}</div>
          <span className="text-[11px] text-emerald-700 font-semibold block mt-1">
            Margem Líquida: {((lucroLiquido / (receitaBruta || 1)) * 100).toFixed(1)}%
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold block">Patrimônio Líquido (PL)</span>
          <div className="text-xl font-black text-slate-900 mt-1">
            {formatarMoeda(totalPL)}
          </div>
          <span className="text-[11px] text-slate-500 font-medium block mt-1">
            Capital Social + Reservas Segmentadas
          </span>
        </div>
      </div>

      {/* Sub-navegação interna do Módulo Contábil */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 gap-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setSubAba('dre')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            subAba === 'dre'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          {isClinica ? 'DRE de Clínicas & Procedimentos' : 'DRE Funerária & Planos'}
        </button>
        <button
          onClick={() => setSubAba('balanco')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            subAba === 'balanco'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          {isClinica ? 'Balanço Patrimonial Clínico' : 'Balanço Patrimonial & Planos'}
        </button>
        <button
          onClick={() => setSubAba('balancete')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            subAba === 'balancete'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Balancete de Verificação Analítico
        </button>
        <button
          onClick={() => setSubAba('auditoria-cfc')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            subAba === 'auditoria-cfc'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Auditoria CFC & NBC TG 22
        </button>
        <button
          onClick={() => setSubAba('plano-contas')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            subAba === 'plano-contas'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Plano de Contas SPED
        </button>
      </div>

      {/* SUB-ABA 1: DRE SEGMENTADA */}
      {subAba === 'dre' && (
        <div className="bg-white rounded-b-xl border-x border-b border-slate-200 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                DRE - Demonstração do Resultado por Segmento Operacional (NBC TG 22)
              </h3>
              <p className="text-xs text-slate-500">
                {empresaAtiva.razaoSocial} • Segmento: {dadosSegmento.segmentoNome}
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar DRE</span>
            </button>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white font-bold">
                <tr>
                  <th className="p-3">Conta / Linha de Resultado</th>
                  <th className="p-3 text-right">Valor no Período (R$)</th>
                  <th className="p-3 text-right">% Receita Bruta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {itensDre.map((item, idx) => (
                  <tr
                    key={idx}
                    className={`${
                      item.destaque
                        ? 'bg-slate-50/90 font-bold text-slate-900'
                        : 'text-slate-700 hover:bg-slate-50/40'
                    }`}
                  >
                    <td className={`p-3 ${item.destaque ? 'pl-3' : 'pl-6 text-slate-600'}`}>
                      {item.descricao}
                    </td>
                    <td
                      className={`p-3 text-right font-mono ${
                        item.valor < 0
                          ? 'text-red-600 font-semibold'
                          : item.destaque
                          ? 'text-slate-950 font-bold'
                          : 'text-slate-800'
                      }`}
                    >
                      {formatarMoeda(item.valor)}
                    </td>
                    <td className="p-3 text-right font-mono text-slate-500">
                      {item.percentualReceita.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-ABA 2: BALANÇO PATRIMONIAL ESTRUTURADO */}
      {subAba === 'balanco' && (
        <div className="bg-white rounded-b-xl border-x border-b border-slate-200 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Balanço Patrimonial Estruturado — {empresaAtiva.nome}
              </h3>
              <p className="text-xs text-slate-500">
                {isClinica
                  ? 'Ativos Clínicos, Faturamento TISS Convênios, Glosas e Repasses ao Corpo Clínico'
                  : 'Cemitério Parque, Terrenos, Cremação e Provisão de Manutenção Perpétua (Idade de Planos)'}
              </p>
            </div>
            <span className="text-xs bg-blue-50 text-blue-800 font-bold px-2.5 py-1 rounded-full border border-blue-200">
              Conforme NBC TG 22 / Exercício 2026
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ATIVO */}
            <div className="border border-slate-200 rounded-xl overflow-hidden space-y-2">
              <div className="bg-blue-900 text-white p-3 font-bold text-xs flex justify-between">
                <span>ATIVO TOTAL</span>
                <span>{formatarMoeda(totalAtivo)}</span>
              </div>
              <div className="p-4 space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-bold text-slate-900 border-b border-slate-200 pb-1">
                    <span>1. ATIVO CIRCULANTE</span>
                    <span>{formatarMoeda(contasBalancete.filter(c => c.tipo === 'ATIVO' && c.codigo.startsWith('1.1')).reduce((a,b)=>a+b.saldoAtual,0))}</span>
                  </div>
                  <div className="space-y-1.5 pt-2 text-slate-600 text-[11px]">
                    {contasBalancete.filter(c => c.tipo === 'ATIVO' && c.codigo.startsWith('1.1')).map(c => (
                      <div key={c.codigo} className="flex justify-between">
                        <span>• {c.descricao}</span>
                        <span className="font-mono font-semibold text-slate-800">{formatarMoeda(c.saldoAtual)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between font-bold text-slate-900 border-b border-slate-200 pb-1">
                    <span>2. ATIVO NÃO CIRCULANTE (IMOBILIZADO & INTANGÍVEL)</span>
                    <span>{formatarMoeda(contasBalancete.filter(c => c.tipo === 'ATIVO' && c.codigo.startsWith('1.2')).reduce((a,b)=>a+b.saldoAtual,0))}</span>
                  </div>
                  <div className="space-y-1.5 pt-2 text-slate-600 text-[11px]">
                    {contasBalancete.filter(c => c.tipo === 'ATIVO' && c.codigo.startsWith('1.2')).map(c => (
                      <div key={c.codigo} className="flex justify-between">
                        <span>• {c.descricao}</span>
                        <span className="font-mono font-semibold text-slate-800">{formatarMoeda(c.saldoAtual)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* PASSIVO E PL */}
            <div className="border border-slate-200 rounded-xl overflow-hidden space-y-2">
              <div className="bg-slate-900 text-white p-3 font-bold text-xs flex justify-between">
                <span>PASSIVO & PATRIMÔNIO LÍQUIDO</span>
                <span>{formatarMoeda(totalPassivo + totalPL)}</span>
              </div>
              <div className="p-4 space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-bold text-slate-900 border-b border-slate-200 pb-1">
                    <span>2.1 PASSIVO CIRCULANTE</span>
                    <span>{formatarMoeda(contasBalancete.filter(c => c.tipo === 'PASSIVO' && c.codigo.startsWith('2.1')).reduce((a,b)=>a+b.saldoAtual,0))}</span>
                  </div>
                  <div className="space-y-1.5 pt-2 text-slate-600 text-[11px]">
                    {contasBalancete.filter(c => c.tipo === 'PASSIVO' && c.codigo.startsWith('2.1')).map(c => (
                      <div key={c.codigo} className="flex justify-between">
                        <span>• {c.descricao}</span>
                        <span className="font-mono font-semibold text-slate-800">{formatarMoeda(c.saldoAtual)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between font-bold text-slate-900 border-b border-slate-200 pb-1">
                    <span>2.2 PASSIVO NÃO CIRCULANTE</span>
                    <span>{formatarMoeda(contasBalancete.filter(c => c.tipo === 'PASSIVO' && c.codigo.startsWith('2.2')).reduce((a,b)=>a+b.saldoAtual,0))}</span>
                  </div>
                  <div className="space-y-1.5 pt-2 text-slate-600 text-[11px]">
                    {contasBalancete.filter(c => c.tipo === 'PASSIVO' && c.codigo.startsWith('2.2')).map(c => (
                      <div key={c.codigo} className="flex justify-between">
                        <span>• {c.descricao}</span>
                        <span className="font-mono font-semibold text-slate-800">{formatarMoeda(c.saldoAtual)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between font-bold text-emerald-800 border-b border-emerald-200 pb-1 bg-emerald-50/50 px-1">
                    <span>2.3 PATRIMÔNIO LÍQUIDO</span>
                    <span>{formatarMoeda(totalPL)}</span>
                  </div>
                  <div className="space-y-1.5 pt-2 text-slate-600 text-[11px]">
                    {contasBalancete.filter(c => c.tipo === 'PATRIMONIO_LIQUIDO').map(c => (
                      <div key={c.codigo} className="flex justify-between">
                        <span>• {c.descricao}</span>
                        <span className="font-mono font-semibold text-emerald-700">{formatarMoeda(c.saldoAtual)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Destaque Setorial no Balanço (Idade de Planos vs Gestão de Glosas Médicas) */}
          <div className={`p-4 rounded-xl border ${isClinica ? 'bg-sky-50 border-sky-200 text-sky-950' : 'bg-emerald-50 border-emerald-200 text-emerald-950'}`}>
            <div className="flex items-start gap-3 text-xs">
              <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">
                  {isClinica
                    ? 'Particularidade Contábil de Clínicas Médicas (DMED & Glosas TISS)'
                    : 'Particularidade Contábil Cemiterial (Idade de Planos & Manutenção Perpétua)'}
                </strong>
                <p className="mt-1 leading-relaxed text-[11px]">
                  {isClinica
                    ? 'No segmento de Clínicas Médicas, as contas a receber sofrem desconto das glosas iniciais das operadoras (~3,8%). O Balanço evidencia os repasses de honorários ao corpo clínico credenciado e a conciliação obrigatória com a DMED anual da Receita Federal.'
                    : 'No segmento funerário e cemiterial, o Balanço evidencia a idade dos contratos de planos funerários e a provisão atuarial de longo prazo para manutenção perpétua de jazigos (NBC TG 25 / NBC TG 47), mantendo a receita diferida até o momento da prestação efetiva.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-ABA 3: BALANCETE ANALÍTICO */}
      {subAba === 'balancete' && (
        <div className="bg-white rounded-b-xl border-x border-b border-slate-200 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Balancete de Verificação Analítico — 4º Grau (Sped Contábil)
              </h3>
              <p className="text-xs text-slate-500">
                Movimentação a débito, crédito e saldo atual para geração do Livro Diário/Razão no CRC.
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-56">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={buscaConta}
                  onChange={(e) => setBuscaConta(e.target.value)}
                  placeholder="Buscar conta..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filtroTipoConta}
                onChange={(e) => setFiltroTipoConta(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg py-1.5 px-2.5 font-semibold text-slate-700"
              >
                <option value="TODAS">Todos os Tipos</option>
                <option value="ATIVO">Ativo</option>
                <option value="PASSIVO">Passivo</option>
                <option value="PATRIMONIO_LIQUIDO">Patrimônio Líquido</option>
              </select>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white font-bold">
                <tr>
                  <th className="p-3">Classificação / Conta</th>
                  <th className="p-3">Descrição da Conta</th>
                  <th className="p-3 text-right">Saldo Anterior</th>
                  <th className="p-3 text-right">Débitos</th>
                  <th className="p-3 text-right">Créditos</th>
                  <th className="p-3 text-right">Saldo Atual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {contasFiltradas.map((conta) => (
                  <tr key={conta.codigo} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-900">{conta.codigo}</td>
                    <td className="p-3 font-sans font-medium text-slate-800">{conta.descricao}</td>
                    <td className="p-3 text-right text-slate-600">{formatarMoeda(conta.saldoAnterior)}</td>
                    <td className="p-3 text-right text-blue-700">{formatarMoeda(conta.debitos)}</td>
                    <td className="p-3 text-right text-amber-700">{formatarMoeda(conta.creditos)}</td>
                    <td className="p-3 text-right font-bold text-slate-900">{formatarMoeda(conta.saldoAtual)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-ABA 4: AUDITORIA CFC & NBC TG 22 */}
      {subAba === 'auditoria-cfc' && (
        <div className="bg-white rounded-b-xl border-x border-b border-slate-200 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Scale className="w-4 h-4 text-blue-600" />
                Auditoria do Sistema CFC/CRCs & NBC TG 22 (Informações por Segmento)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manual de Fiscalização do CFC 2025 • Poder de polícia dos CRCs sobre livros Diário/Razão e ECF.
              </p>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold px-3 py-1 rounded-full">
              4 Normas Aplicadas
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dadosSegmento.normasCfcAplicaveis.map((norma, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                    {norma.codigo}
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                    {norma.statusAuditoria}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">{norma.titulo}</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">{norma.impactoEmpresa}</p>
              </div>
            ))}
          </div>

          {/* Checklist de Fiscalização do Manual do CFC */}
          <div className="p-5 bg-slate-900 text-white rounded-xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Checklist de Fiscalização do Exercício Profissional do CRC no Segmento
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              {dadosSegmento.documentosFiscais.checklistAuditoriaCfc.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* SUB-ABA 5: PLANO DE CONTAS SPED */}
      {subAba === 'plano-contas' && (
        <div className="bg-white rounded-b-xl border-x border-b border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Mapeamento do Plano de Contas Referencial SPED ECD/ECF
              </h3>
              <p className="text-xs text-slate-500">
                Correspondência entre as contas internas do ERP e a tabela padrão da Receita Federal do Brasil.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
              Layout 9.00 SPED Contábil
            </span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Conta Interna</th>
                  <th className="p-3">Conta Referencial SPED (RFB)</th>
                  <th className="p-3">Descrição SPED</th>
                  <th className="p-3">Natureza</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-mono text-[11px]">
                {contasBalancete.map((c) => (
                  <tr key={c.codigo} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{c.codigo}</td>
                    <td className="p-3 text-blue-700">{c.codigo}.01</td>
                    <td className="p-3 font-sans">{c.descricao}</td>
                    <td className="p-3 font-semibold">{c.natureza}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
