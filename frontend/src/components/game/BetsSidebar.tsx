"use client";

import { useGameStore } from "../../store/useGameStore";

export function BetsSidebar() {
  const bets = useGameStore((s) => s.bets);
  
  // Sort bets so cashed out appear at top, or just keep chronological
  const totalBets = bets.reduce((acc, b) => acc + b.amount, 0);

  return (
    <div className="w-full lg:w-80 h-[500px] lg:h-auto bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col overflow-hidden">
      <div className="p-4 border-b border-zinc-800 bg-zinc-950/50 flex justify-between items-center">
        <h3 className="font-bold text-zinc-200">Apostas da Rodada</h3>
        <span className="text-zinc-400 text-sm">{bets.length} Jogadores</span>
      </div>
      
      <div className="p-2 border-b border-zinc-800/50 bg-zinc-900 text-xs text-zinc-500 font-semibold flex justify-between px-4">
        <span>Usuário</span>
        <span>Aposta / Saque</span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {bets.map((bet, i) => (
          <div 
            key={`${bet.userId}-${i}`} 
            className={`flex justify-between items-center p-2 rounded text-sm transition-colors ${
              bet.cashOutMultiplier ? 'bg-emerald-900/20 border border-emerald-900/50' : 'hover:bg-zinc-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-400 font-bold">
                {bet.userId.substring(0, 2).toUpperCase()}
              </div>
              <span className="text-zinc-300 max-w-[80px] truncate">{bet.userId}</span>
            </div>
            
            <div className="flex flex-col items-end">
              <span className="text-zinc-100 font-mono">R$ {(bet.amount / 100).toFixed(2)}</span>
              {bet.cashOutMultiplier && (
                <span className="text-emerald-500 font-bold font-mono text-xs">
                  {bet.cashOutMultiplier.toFixed(2)}x
                </span>
              )}
            </div>
          </div>
        ))}

        {bets.length === 0 && (
          <div className="h-full flex items-center justify-center text-zinc-600 text-sm p-8 text-center">
            Aguardando jogadores fazerem apostas...
          </div>
        )}
      </div>

      <div className="p-4 border-t border-zinc-800 bg-zinc-950/50 flex justify-between items-center">
        <span className="text-sm font-semibold text-zinc-400">Total Acumulado</span>
        <span className="text-lg font-black text-white tabular-nums">R$ {(totalBets / 100).toFixed(2)}</span>
      </div>
    </div>
  );
}
