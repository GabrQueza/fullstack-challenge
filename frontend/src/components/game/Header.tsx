"use client";

import { useQuery } from "@tanstack/react-query";
import { useAxiosAuth } from "../../hooks/useAxiosAuth";
import { useSession } from "next-auth/react";

export function Header() {
  const axios = useAxiosAuth();
  const { data: session } = useSession();

  const { data: wallet, isLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const res = await axios.get('/wallets/me');
      return res.data;
    },
    enabled: !!session?.accessToken,
  });

  return (
    <header className="flex justify-between items-center mb-8 bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
      <h1 className="text-2xl font-black text-emerald-500 tracking-tighter uppercase">
        Crash<span className="text-white">Game</span>
      </h1>
      
      {session && (
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-xs text-zinc-400 font-semibold">{session.user?.name || 'Jogador'}</span>
            {isLoading ? (
              <div className="h-6 w-20 bg-zinc-800 animate-pulse rounded mt-1"></div>
            ) : (
              <span className="text-lg font-black text-emerald-400 font-mono tabular-nums">
                R$ {wallet?.balance ? (Number(wallet.balance) / 100).toFixed(2) : '0.00'}
              </span>
            )}
          </div>
          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-400 border border-zinc-700">
            {(session.user?.name || 'P')[0].toUpperCase()}
          </div>
        </div>
      )}
    </header>
  );
}
