import { FC } from 'react';
import {
  Building2,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  Calendar,
  MapPin,
  FileText,
  Users,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import { EmpresaPerfil } from '../types';

interface CartaoCnpjOficialProps {
  empresa: EmpresaPerfil;
  onClose?: () => void;
}

export const CartaoCnpjOficial: FC<CartaoCnpjOficialProps> = ({ empresa }) => {
  const [copiado, setCopiado] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<'cartao' | 'qsa' | 'faturamento'>('cartao');

  const handleCopiarCnpj = () => {
    navigator.clipboard.writeText(empresa.cnpj);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  const handleImprimir = () => {
    window.print();
  };

  const formatarMoeda = (val?: number) => {
    if (!val) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const end = empresa.endereco || {
    logradouro: 'Logradouro não informado',
    numero: 'S/N',
    bairro: 'Centro',
    cep: '00000-000',
    municipio: empresa.localidades?.municipios?.[0] || 'Município',
    uf: empresa.localidades?.uf || 'DF',
  };

  const cnaePrincipal = empresa.cnaePrincipalDetalhado || {
    codigo: empresa.cnaes?.[0]?.split(' - ')?.[0] || '9603-3/04',
    descricao: empresa.cnaes?.[0]?.split(' - ')?.[1] || 'Serviços Funerários e Cemiteriais',
  };

  const cnaesSecundarios = empresa.cnaesSecundariosDetalhados || [];

  return (
    <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden" id="cartao-cnpj-container">
      {/* Top action header bar */}
      <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span className="text-xs sm:text-sm font-bold tracking-wide">
            Comprovante de Inscrição e Situação Cadastral (Cartão CNPJ Oficial)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub-tabs */}
          <div className="bg-slate-800 p-0.5 rounded-lg flex text-xs">
            <button
              onClick={() => setAbaAtiva('cartao')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                abaAtiva === 'cartao' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              Cartão CNPJ
            </button>
            <button
              onClick={() => setAbaAtiva('qsa')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1 ${
                abaAtiva === 'qsa' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Quadro Societário ({empresa.qsa?.length || 0})</span>
            </button>
            <button
              onClick={() => setAbaAtiva('faturamento')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1 ${
                abaAtiva === 'faturamento' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Faturamento & Porte</span>
            </button>
          </div>

          <button
            onClick={handleCopiarCnpj}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            title="Copiar número do CNPJ"
          >
            {copiado ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiado ? 'Copiado!' : 'Copiar CNPJ'}</span>
          </button>

          <button
            onClick={handleImprimir}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            title="Imprimir comprovante cadastral"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {abaAtiva === 'cartao' && (
        <div className="p-6 md:p-8 font-sans text-slate-800 bg-white" id="folha-cartao-cnpj">
          {/* Header standard of Receita Federal */}
          <div className="border-2 border-slate-900 p-4 text-center rounded-sm bg-slate-50/50 mb-3">
            <div className="flex items-center justify-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xs shadow-xs">
                ★ RFB ★
              </div>
              <div className="text-center">
                <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                  REPÚBLICA FEDERATIVA DO BRASIL
                </div>
                <div className="text-[11px] font-semibold text-slate-700 uppercase">
                  MINISTÉRIO DA FAZENDA • SECRETARIA ESPECIAL DA RECEITA FEDERAL DO BRASIL
                </div>
                <div className="text-xs font-extrabold uppercase text-slate-950 mt-0.5 tracking-wide">
                  COMPROVANTE DE INSCRIÇÃO E DE SITUAÇÃO CADASTRAL
                </div>
              </div>
            </div>
          </div>

          {/* Grid Box Layout of the Official Card */}
          <div className="border-2 border-slate-900 divide-y-2 divide-slate-900 text-xs">
            {/* Linha 1: CNPJ e Matriz */}
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y-2 md:divide-y-0 md:divide-x-2 divide-slate-900">
              <div className="p-2.5 col-span-2">
                <span className="block text-[10px] font-bold uppercase text-slate-600">NÚMERO DE INSCRIÇÃO</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-black text-slate-950">{empresa.cnpj}</span>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded uppercase">
                    MATRIZ
                  </span>
                </div>
              </div>
              <div className="p-2.5">
                <span className="block text-[10px] font-bold uppercase text-slate-600">DATA DE ABERTURA</span>
                <span className="font-bold text-sm text-slate-900">{empresa.dataAbertura || '15/03/2014'}</span>
              </div>
            </div>

            {/* Linha 2: Razão Social */}
            <div className="p-2.5">
              <span className="block text-[10px] font-bold uppercase text-slate-600">NOME EMPRESARIAL (RAZÃO SOCIAL)</span>
              <span className="font-bold text-sm sm:text-base text-slate-950 block">{empresa.razaoSocial}</span>
            </div>

            {/* Linha 3: Nome Fantasia e Porte */}
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y-2 md:divide-y-0 md:divide-x-2 divide-slate-900">
              <div className="p-2.5 col-span-2">
                <span className="block text-[10px] font-bold uppercase text-slate-600">
                  TÍTULO DO ESTABELECIMENTO (NOME DE FANTASIA)
                </span>
                <span className="font-bold text-sm text-slate-900">{empresa.nome}</span>
              </div>
              <div className="p-2.5">
                <span className="block text-[10px] font-bold uppercase text-slate-600">PORTE</span>
                <span className="font-bold text-sm text-slate-900">{empresa.porte || 'DEMAIS'}</span>
              </div>
            </div>

            {/* Linha 4: CNAE Principal */}
            <div className="p-2.5 bg-emerald-50/20">
              <span className="block text-[10px] font-bold uppercase text-emerald-900">
                CÓDIGO E DESCRIÇÃO DA ATIVIDADE ECONÔMICA PRINCIPAL
              </span>
              <div className="mt-0.5 font-mono text-xs font-bold text-slate-950">
                <span className="text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded mr-2">
                  {cnaePrincipal.codigo}
                </span>
                <span>{cnaePrincipal.descricao}</span>
              </div>
            </div>

            {/* Linha 5: CNAEs Secundários */}
            <div className="p-2.5">
              <span className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                CÓDIGO E DESCRIÇÃO DAS ATIVIDADES ECONÔMICAS SECUNDÁRIAS ({cnaesSecundarios.length})
              </span>
              {cnaesSecundarios.length > 0 ? (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {cnaesSecundarios.map((cs, idx) => (
                    <div key={idx} className="font-mono text-[11px] text-slate-800 flex items-start gap-2">
                      <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                        {cs.codigo}
                      </span>
                      <span>{cs.descricao}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-[11px] text-slate-500 italic">
                  Não há atividades secundárias cadastradas na base.
                </span>
              )}
            </div>

            {/* Linha 6: Natureza Jurídica */}
            <div className="p-2.5">
              <span className="block text-[10px] font-bold uppercase text-slate-600">
                CÓDIGO E DESCRIÇÃO DA NATUREZA JURÍDICA
              </span>
              <span className="font-bold text-slate-900 text-xs">
                {empresa.naturezaJuridica || '206-2 - Sociedade Empresária Limitada'}
              </span>
            </div>

            {/* Linha 7: Endereço completo */}
            <div className="grid grid-cols-1 md:grid-cols-4 divide-y-2 md:divide-y-0 md:divide-x-2 divide-slate-900">
              <div className="p-2.5 col-span-2">
                <span className="block text-[10px] font-bold uppercase text-slate-600">LOGRADOURO</span>
                <span className="font-semibold text-slate-900">{end.logradouro}</span>
              </div>
              <div className="p-2.5">
                <span className="block text-[10px] font-bold uppercase text-slate-600">NÚMERO</span>
                <span className="font-semibold text-slate-900">{end.numero}</span>
              </div>
              <div className="p-2.5">
                <span className="block text-[10px] font-bold uppercase text-slate-600">COMPLEMENTO</span>
                <span className="font-semibold text-slate-900">{end.complemento || 'NÃO HÁ'}</span>
              </div>
            </div>

            {/* Linha 8: CEP, Bairro, Município, UF */}
            <div className="grid grid-cols-1 md:grid-cols-4 divide-y-2 md:divide-y-0 md:divide-x-2 divide-slate-900">
              <div className="p-2.5">
                <span className="block text-[10px] font-bold uppercase text-slate-600">CEP</span>
                <span className="font-mono font-bold text-slate-900">{end.cep}</span>
              </div>
              <div className="p-2.5">
                <span className="block text-[10px] font-bold uppercase text-slate-600">BAIRRO/DISTRITO</span>
                <span className="font-semibold text-slate-900">{end.bairro}</span>
              </div>
              <div className="p-2.5">
                <span className="block text-[10px] font-bold uppercase text-slate-600">MUNICÍPIO</span>
                <span className="font-semibold text-slate-900">{end.municipio}</span>
              </div>
              <div className="p-2.5">
                <span className="block text-[10px] font-bold uppercase text-slate-600">UF</span>
                <span className="font-bold text-slate-900">{end.uf}</span>
              </div>
            </div>

            {/* Linha 9: Contatos */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y-2 md:divide-y-0 md:divide-x-2 divide-slate-900">
              <div className="p-2.5">
                <span className="block text-[10px] font-bold uppercase text-slate-600">ENDEREÇO ELETRÔNICO</span>
                <span className="font-medium text-slate-900">{empresa.contato?.email || 'contato@empresa.com.br'}</span>
              </div>
              <div className="p-2.5">
                <span className="block text-[10px] font-bold uppercase text-slate-600">TELEFONE</span>
                <span className="font-medium text-slate-900">{empresa.contato?.telefone || '(85) 3456-7890'}</span>
              </div>
            </div>

            {/* Linha 10: Situação Cadastral e Motivo */}
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y-2 md:divide-y-0 md:divide-x-2 divide-slate-900 bg-slate-50/50">
              <div className="p-2.5">
                <span className="block text-[10px] font-bold uppercase text-slate-600">SITUAÇÃO CADASTRAL</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded uppercase mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                  {empresa.situacaoCadastral || 'ATIVA'}
                </span>
              </div>
              <div className="p-2.5">
                <span className="block text-[10px] font-bold uppercase text-slate-600">DATA DA SITUAÇÃO CADASTRAL</span>
                <span className="font-bold text-slate-900">{empresa.dataSituacaoCadastral || '15/03/2014'}</span>
              </div>
              <div className="p-2.5">
                <span className="block text-[10px] font-bold uppercase text-slate-600">MOTIVO DE SITUAÇÃO CADASTRAL</span>
                <span className="text-slate-800 font-semibold">{empresa.motivoSituacaoCadastral || 'SEM RESTRIÇÕES'}</span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-4 pt-3 border-t border-slate-200 text-[10px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>Aprovado pela Instrução Normativa RFB nº 2.119, de 06 de dezembro de 2022.</span>
            <span>Documento emitido e consultado via Radar Fiscal / BrasilAPI pública.</span>
          </div>
        </div>
      )}

      {/* SUBTAB: QUADRO DE SÓCIOS E ADMINISTRADORES (QSA) */}
      {abaAtiva === 'qsa' && (
        <div className="p-6 bg-slate-50 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                Quadro de Sócios e Administradores (QSA)
              </h3>
              <p className="text-xs text-slate-500">
                Membros com poderes de representação legal e quotas societárias perante a Receita Federal.
              </p>
            </div>
            <span className="text-xs bg-slate-200 text-slate-700 font-bold px-2.5 py-1 rounded-full">
              {empresa.qsa?.length || 0} sócios listados
            </span>
          </div>

          {empresa.qsa && empresa.qsa.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {empresa.qsa.map((socio, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-slate-900 text-sm">{socio.nome}</span>
                    <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                      {socio.qualificacao}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">País de Origem</span>
                      <span className="font-semibold text-slate-800">{socio.paisOrigem || 'Brasil'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Faixa Etária</span>
                      <span className="font-semibold text-slate-800">{socio.faixaEtaria || 'Não especificada'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-300">
              <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs text-slate-500">Nenhum sócio ou administrador encontrado no registro do CNPJ.</p>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB: FATURAMENTO, PORTE E CAPITAL SOCIAL */}
      {abaAtiva === 'faturamento' && (
        <div className="p-6 bg-slate-50 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-semibold block">Capital Social Registrado</span>
              <span className="text-lg sm:text-xl font-extrabold text-slate-900 block mt-1">
                {formatarMoeda(empresa.capitalSocial)}
              </span>
              <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
                Totalmente integralizado na Junta Comercial
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-semibold block">Faturamento Anual Estimado</span>
              <span className="text-lg sm:text-xl font-extrabold text-slate-900 block mt-1">
                {formatarMoeda(empresa.faturamentoAnualEstimado)}
              </span>
              <span className="text-[11px] text-slate-600 block mt-1 font-medium">
                Faixa: {empresa.faixaFaturamento || 'Acima de R$ 10M'}
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-semibold block">Faturamento Mensal Médio</span>
              <span className="text-lg sm:text-xl font-extrabold text-emerald-700 block mt-1">
                {formatarMoeda(empresa.faturamentoMensalEstimado)}
              </span>
              <span className="text-[11px] text-slate-600 block mt-1 font-medium">
                Base para cálculo de adiantamentos e tributos
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Enquadramento Tributário & Tratamento Diferenciado
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Regime Vigente</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {empresa.regimeTributario.replace('_', ' ')}
                </span>
                <span className="text-[11px] text-slate-600 mt-1 block">
                  Determina a sistemática de apuração do PIS/COFINS e IRPJ/CSLL.
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Simples Nacional</span>
                <span className={`font-bold text-sm mt-0.5 block ${empresa.opcaoSimples ? 'text-emerald-700' : 'text-slate-700'}`}>
                  {empresa.opcaoSimples ? 'Optante pelo Simples Nacional' : 'NÃO Optante pelo Simples Nacional'}
                </span>
                <span className="text-[11px] text-slate-600 mt-1 block">
                  {empresa.opcaoSimples ? 'Recolhimento unificado no DAS.' : 'Tributada no Lucro Presumido ou Real.'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Enquadramento MEI</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {empresa.opcaoMei ? 'Enquadrado como MEI' : 'NÃO enquadrado como MEI'}
                </span>
                <span className="text-[11px] text-slate-600 mt-1 block">
                  Limite anual de R$ 81.000,00 para microempreendedor.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
