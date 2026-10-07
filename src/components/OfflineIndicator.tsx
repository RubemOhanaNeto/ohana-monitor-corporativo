import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <aside aria-label="Aviso de conexão offline" className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-amber-500/95 text-slate-950 px-3.5 py-2 text-xs font-semibold shadow-xl shadow-amber-950/20 backdrop-blur-sm border border-amber-300">
      <WifiOff className="w-4 h-4 animate-pulse text-slate-900" />
      <span>Modo Offline — Navegando com dados em cache local.</span>
    </aside>
  );
};
