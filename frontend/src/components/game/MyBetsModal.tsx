"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAxiosAuth } from "../../hooks/useAxiosAuth";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { History } from "lucide-react";

export function MyBetsModal() {
  const axios = useAxiosAuth();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const { data: bets, isLoading } = useQuery({
    queryKey: ['myBets'],
    queryFn: async () => {
      const res = await axios.get('/games/bets/me');
      return res.data;
    },
    enabled: open && !!session?.accessToken,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-lg border border-zinc-700 transition-colors cursor-pointer">
          <History size={14} />
          Minhas Apostas
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-zinc-900 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-white">Minhas Apostas</DialogTitle>
        </DialogHeader>
        
        <div className="max-h-[400px] overflow-y-auto mt-2">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 bg-zinc-800/50 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : !bets || bets.length === 0 ? (
            <div className="text-center text-zinc-500 py-8">
              Nenhuma aposta encontrada.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 text-xs uppercase tracking-wider">
                  <th className="py-2 text-left px-2">Data</th>
                  <th className="py-2 text-right px-2">Aposta</th>
                  <th className="py-2 text-right px-2">Multi.</th>
                  <th className="py-2 text-right px-2">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {bets.map((bet: any) => {
                  const amountReais = Number(bet.amount) / 100;
                  const cashOutMult = bet.cashOutMultiplier;
                  const isWin = !!cashOutMult;
                  const profit = isWin 
                    ? (amountReais * cashOutMult) - amountReais
                    : -amountReais;

                  return (
                    <tr key={bet.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                      <td className="py-2.5 px-2 text-zinc-400 font-mono text-xs">
                        {new Date(bet.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-2.5 px-2 text-right text-zinc-200 font-mono">
                        R$ {amountReais.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono font-bold">
                        {isWin ? (
                          <span className="text-emerald-500">{cashOutMult.toFixed(2)}x</span>
                        ) : (
                          <span className="text-red-500">—</span>
                        )}
                      </td>
                      <td className={`py-2.5 px-2 text-right font-mono font-bold ${isWin ? 'text-emerald-500' : 'text-red-500'}`}>
                        {profit >= 0 ? '+' : ''}R$ {profit.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
