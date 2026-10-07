import { FC } from 'react';
import { Clock, Flame, AlertTriangle, CheckCircle2, Share2, Mail, Copy } from 'lucide-react';
import { formatarData } from '../utils/formatters';

interface CountdownPrazoLegalProps {
  prazoLegal?: string;
  prazoInterno?: string;
  dataHomologacao?: string;
  diasRestantes?: number;
  status?: string;
  acaoDescricao: string;
  responsavel: string;
  area?: string;
}

export const CountdownPrazoLegal: FC<CountdownPrazoLegalProps> = ({
  prazoLegal,
  prazoInterno,
  dataHomologacao,
  diasRestantes = 30,
  status,
  acaoDescricao,
  responsavel,
  area,
}) => {
  const isConcluida = status === 'CONCLUIDA';
  const isVencida = diasRestantes < 0 && !isConcluida;
  const isCritico = diasRestantes >= 0 && diasRestantes <= 7 && !isConcluida;
  const isAlto = diasRestantes > 7 && diasRestantes <= 30 && !isConcluida;
  const isMedio = diasRestantes > 30 && diasRestantes <= 90 && !isConcluida;

  // Barra de urgência: percentual de 0 a 100%
  let percentualUrgencia = 100;
  if (isVencida) percentualUrgencia = 100;
  else if (diasRestantes <= 7) percentualUrgencia = 90;
  else if (diasRestantes <= 30) percentualUrgencia = 65;
  else if (diasRestantes <= 90) percentualUrgencia = 35;
  else percentualUrgencia = 15;

  const handleWhatsAppCobrar = () => {
    const texto = encodeURIComponent(
      `*ALERTA DE PRAZO LEGAL - GRUPO OHANA*\n` +
      `⚠️ *Ação:* ${acaoDescricao}\n` +
      `👤 *Responsável:* ${responsavel} (${area || 'Geral'})\n` +
      `📅 *Prazo Legal Impreterível:* ${formatarData(prazoLegal || '')}\n` +
      `⏰ *Prazo Interno Meta:* ${formatarData(prazoInterno || '')}\n` +
      `🔥 *Status:* ${isVencida ? `VENCIDO HÁ ${Math.abs(diasRestantes)} DIAS!` : `${diasRestantes} DIAS RESTANTES!`}\n\n` +
      `Favor confirmar a homologação técnica e anexar a evidência no sistema.`
    );
    window.open(`https://api.whatsapp.com/send?text=${texto}`, '_blank');
  };

  const handleEmailCobrar = () => {
    const assunto = encodeURIComponent(`[URGENTE - PRAZO LEGAL] ${acaoDescricao}`);
    const corpo = encodeURIComponent(
      `Prezado(a) ${responsavel},\n\n` +
      `Informamos que a seguinte obrigação normativa requer atenção imediata:\n\n` +
      `- Ação: ${acaoDescricao}\n` +
      `- Área: ${area || 'Geral'}\n` +
      `- Prazo Legal: ${formatarData(prazoLegal || '')}\n` +
      `- Prazo Interno: ${formatarData(prazoInterno || '')}\n` +
      `- Dias Restantes: ${isVencida ? `VENCIDO HÁ ${Math.abs(diasRestantes)} DIAS` : `${diasRestantes} dias`}\n\n` +
      `Solicitamos a atualização do status e o registro da evidência de conformidade no sistema OHANA.\n\n` +
      `Atenciosamente,\nPresidência & Governança Corporativa`
    );
    window.open(`mailto:?subject=${assunto}&body=${corpo}`, '_blank');
  };

  return (
    <div className={`p-3 rounded-xl border transition-all ${
      isConcluida
        ? 'bg-emerald-50/60 border-emerald-200'
        : isVencida
        ? 'bg-red-50 border-red-300 ring-1 ring-red-400'
        : isCritico
        ? 'bg-rose-50/80 border-rose-300 shadow-xs'
        : isAlto
        ? 'bg-amber-50/60 border-amber-200'
        : 'bg-slate-50 border-slate-200'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Lado Esquerdo: Indicador e Contador */}
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            isConcluida
              ? 'bg-emerald-600 text-white'
              : isVencida
              ? 'bg-red-600 text-white animate-bounce'
              : isCritico
              ? 'bg-rose-600 text-white'
              : isAlto
              ? 'bg-amber-500 text-white'
              : 'bg-slate-700 text-white'
          }`}>
            {isConcluida ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : isVencida || isCritico ? (
              <Flame className="w-5 h-5" />
            ) : (
              <Clock className="w-5 h-5" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wide ${
                isConcluida
                  ? 'bg-emerald-200 text-emerald-900'
                  : isVencida
                  ? 'bg-red-600 text-white animate-pulse'
                  : isCritico
                  ? 'bg-rose-200 text-rose-950 font-bold'
                  : isAlto
                  ? 'bg-amber-200 text-amber-950'
                  : 'bg-slate-200 text-slate-800'
              }`}>
                {isConcluida
                  ? 'Concluída'
                  : isVencida
                  ? `Vencida (${Math.abs(diasRestantes)}d)`
                  : isCritico
                  ? 'Crítico (≤ 7 dias)'
                  : isAlto
                  ? 'Urgência Alta'
                  : 'No Cronograma'}
              </span>

              <span className="text-[11px] font-mono text-slate-500">
                Legal: <strong className="text-slate-800">{formatarData(prazoLegal || '')}</strong>
              </span>
            </div>

            {/* Countdown em Destaque */}
            <div className="flex items-baseline gap-1.5 mt-0.5">
              {isConcluida ? (
                <span className="text-xs font-bold text-emerald-800">
                  Obrigação homologada e arquivada com evidência.
                </span>
              ) : isVencida ? (
                <span className="text-xs font-extrabold text-red-700">
                  Prazo expirado há {Math.abs(diasRestantes)} dias. Risco ativo de autuação!
                </span>
              ) : (
                <>
                  <span className="text-sm font-black text-slate-900 tracking-tight">
                    {diasRestantes} dias restantes
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    (Meta Interna: {formatarData(prazoInterno || '')})
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Lado Direito: Ações Rápidas de Notificação / Cobrança */}
        {!isConcluida && (
          <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={handleWhatsAppCobrar}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-xs"
              title="Disparar cobrança e detalhes desta ação no WhatsApp do responsável"
            >
              <Share2 className="w-3 h-3" />
              <span>Cobrar WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleEmailCobrar}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              title="Disparar cobrança oficial por E-mail"
            >
              <Mail className="w-3 h-3" />
              <span>E-mail</span>
            </button>
          </div>
        )}
      </div>

      {/* Barra Visual de Proximidade do Vencimento */}
      {!isConcluida && (
        <div className="mt-2.5 pt-2 border-t border-slate-200/70">
          <div className="flex items-center justify-between text-[9px] text-slate-500 mb-1 font-semibold uppercase">
            <span>Proximidade do Limite Legal</span>
            <span className={isVencida ? 'text-red-600 font-bold' : isCritico ? 'text-rose-600 font-bold' : ''}>
              {percentualUrgencia}% de risco
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isVencida
                  ? 'bg-red-600 w-full animate-pulse'
                  : isCritico
                  ? 'bg-rose-500'
                  : isAlto
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${percentualUrgencia}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
