import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-3 left-3 z-50 flex items-center gap-2 rounded-full bg-amber-600 border border-amber-400 text-white px-3.5 py-1.5 text-xs font-semibold shadow-lg animate-pulse">
      <WifiOff className="w-3.5 h-3.5 text-white" />
      <span>Modo Sin Conexión · Datos guardados localmente</span>
    </div>
  );
};
