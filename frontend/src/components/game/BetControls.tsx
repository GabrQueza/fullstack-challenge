"use client";

import { useState } from "react";
import { useGameStore } from "../../store/useGameStore";
import { useAxiosAuth } from "../../hooks/useAxiosAuth";
import { useSession, signIn } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function BetControls() {
  const { data: session, status: authStatus } = useSession();
  const axios = useAxiosAuth();
  const queryClient = useQueryClient();
  
  const [amount, setAmount] = useState(10);
  const [loading, setLoading] = useState(false);
  
  const isAuthLoading = authStatus === "loading";
  
  const status = useGameStore((s) => s.status);
  const multiplier = useGameStore((s) => s.multiplier);
  const bets = useGameStore((s) => s.bets);
  const addBet = useGameStore((s) => s.addBet);
  
  const userId = session?.user?.id;
  const activeBet = bets.find(b => b.userId === userId);
  
  const hasBet = !!activeBet;
  const hasCashedOut = !!activeBet?.cashOutMultiplier;

  const handleBet = async () => {
    if (!session || !userId) return signIn("keycloak");
    try {
      setLoading(true);
      const amountInCents = Math.round(amount * 100);
      await axios.post("/games/bet", { amount: amountInCents });
      addBet({ userId, amount: amountInCents });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      toast.success(`Aposta de R$ ${amount.toFixed(2)} realizada!`);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao realizar aposta';
      if (error.response?.status === 400) {
        if (message.toLowerCase().includes('saldo') || message.toLowerCase().includes('insufficient')) {
          toast.error('Saldo insuficiente!');
        } else {
          toast.error(message);
        }
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCashOut = async () => {
    try {
      setLoading(true);
      const res = await axios.post("/games/bet/cashout");
      const amountWon = res.data?.amountWon;
      if (amountWon) {
        toast.success(`Cashout de R$ ${(amountWon / 100).toFixed(2)} realizado!`);
      } else {
        toast.success('Cashout realizado com sucesso!');
      }
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao realizar cashout';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const isBettingPhase = status === "BETTING";
  const isInProgress = status === "IN_PROGRESS";

  return (
    <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">
      
      <div className="flex-1 w-full relative">
        <label className="text-xs text-zinc-400 font-semibold mb-1 block">Valor da Aposta</label>
        <div className="flex bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800 focus-within:border-zinc-700 transition-colors">
          <span className="flex items-center justify-center px-4 text-zinc-500 font-bold">R$</span>
          <input 
            type="number" 
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            disabled={hasBet || !isBettingPhase}
            className="w-full bg-transparent text-white font-mono text-lg py-3 outline-none"
          />
        </div>
      </div>

      <div className="w-full sm:w-auto mt-auto">
        {!hasBet ? (
          <button 
            onClick={handleBet}
            disabled={!isBettingPhase || loading || isAuthLoading}
            className="w-full sm:w-48 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold rounded-lg transition-all active:scale-95"
          >
            {isAuthLoading ? "AUTENTICANDO..." : loading ? "PROCESSANDO..." : isBettingPhase ? "APOSTAR" : "AGUARDANDO PRÓXIMA RODADA"}
          </button>
        ) : !hasCashedOut ? (
          <button 
            onClick={handleCashOut}
            disabled={!isInProgress || loading}
            className="w-full sm:w-48 py-4 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold rounded-lg transition-all active:scale-95 flex flex-col items-center justify-center leading-none gap-1"
          >
            <span className="text-sm">SACAR</span>
            <span className="text-xl tabular-nums">R$ {((activeBet.amount / 100) * multiplier).toFixed(2)}</span>
          </button>
        ) : (
          <button 
            disabled
            className="w-full sm:w-48 py-4 bg-zinc-800 text-emerald-500 font-bold rounded-lg flex flex-col items-center justify-center leading-none gap-1"
          >
            <span className="text-sm">SAQUE REALIZADO</span>
            <span className="text-xl tabular-nums">R$ {((activeBet.amount / 100) * (activeBet.cashOutMultiplier || 1)).toFixed(2)}</span>
          </button>
        )}
      </div>
    </div>
  );
}
