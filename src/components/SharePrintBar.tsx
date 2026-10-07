import { FC, useState } from 'react';
import { Printer, Share2, Mail, Copy, Check, FileText } from 'lucide-react';

interface SharePrintBarProps {
  titulo: string;
  empresaNome?: string;
  resumoTexto?: string;
  itensCriticos?: number;
  diretoria?: string;
  onAbrirRelatorioPdf?: () => void;
  className?: string;
}

export const SharePrintBar: FC<SharePrintBarProps> = ({
  titulo,
  empresaNome,
  resumoTexto,
  itensCriticos,
  diretoria,
  onAbrirRelatorioPdf,
  className = '',
}) => {
  const [copiado, setCopiado] = useState(false);

  // Formatar mensagem para WhatsApp e E-mail
  const gerarTextoCompartilhamento = () => {
    const dataHoje = new Date().toLocaleDateString('pt-BR');
    let texto = `*OHANA MONITOR CORPORATIVO - RELATÓRIO EXECUTIVO*\n`;
    texto += `📅 Data: ${dataHoje}\n`;
    if (empresaNome) texto += `🏢 Empresa: ${empresaNome}\n`;
    if (diretoria) texto += `👔 Diretoria: ${diretoria}\n`;
    texto += `📌 Assunto: ${titulo}\n`;
    if (typeof itensCriticos === 'number') {
      texto += `⚠️ Itens Críticos/Pendentes: ${itensCriticos}\n`;
    }
    texto += `\n📝 Resumo das Ações:\n${resumoTexto || 'Consulte o painel para verificar as obrigações e prazos legais.'}\n\n`;
    texto += `🔗 Acesso ao Sistema: https://ais-dev-omtv7wk4h52k76wsqnnwy3-823716618556.us-east1.run.app`;
    return texto;
  };

  const handleCopiar = () => {
    const texto = gerarTextoCompartilhamento();
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  };

  const handleWhatsApp = () => {
    const texto = encodeURIComponent(gerarTextoCompartilhamento());
    window.open(`https://api.whatsapp.com/send?text=${texto}`, '_blank');
  };

  const handleEmail = () => {
    const assunto = encodeURIComponent(`[OHANA Alerta Executivo] ${titulo} - ${empresaNome || 'Corporativo'}`);
    const corpo = encodeURIComponent(gerarTextoCompartilhamento());
    window.open(`mailto:?subject=${assunto}&body=${corpo}`, '_blank');
  };

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className={`flex items-center flex-wrap gap-2 text-xs no-print ${className}`}>
      {onAbrirRelatorioPdf && (
        <button
          type="button"
          onClick={onAbrirRelatorioPdf}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-semibold transition-colors shadow-xs"
          title="Gerar e imprimir Resumo Executivo em PDF com assinaturas"
        >
          <FileText className="w-3.5 h-3.5 text-emerald-200" />
          <span>Exportar PDF Executivo</span>
        </button>
      )}

      <button
        type="button"
        onClick={handleImprimir}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors border border-slate-700"
        title="Imprimir visualização atual"
      >
        <Printer className="w-3.5 h-3.5 text-slate-300" />
        <span className="hidden sm:inline">Imprimir</span>
      </button>

      <button
        type="button"
        onClick={handleWhatsApp}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors shadow-xs"
        title="Enviar alerta pelo WhatsApp aos gestores"
      >
        <Share2 className="w-3.5 h-3.5" />
        <span>WhatsApp</span>
      </button>

      <button
        type="button"
        onClick={handleEmail}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-600 text-white font-medium transition-colors"
        title="Encaminhar por E-mail aos setores responsáveis"
      >
        <Mail className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">E-mail</span>
      </button>

      <button
        type="button"
        onClick={handleCopiar}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors border border-slate-700"
        title="Copiar texto estruturado para a área de transferência"
      >
        {copiado ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400">Copiado!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Copiar</span>
          </>
        )}
      </button>
    </div>
  );
};
