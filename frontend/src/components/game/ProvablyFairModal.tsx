"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAxiosAuth } from "../../hooks/useAxiosAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { ShieldCheck, Copy, CheckCheck } from "lucide-react";
import { toast } from "sonner";

interface ProvablyFairModalProps {
  round: {
    id: string;
    crashPoint: number;
    serverSeedHash?: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProvablyFairModal({ round, open, onOpenChange }: ProvablyFairModalProps) {
  const axios = useAxiosAuth();
  const [copied, setCopied] = useState<string | null>(null);

  const { data: verification, isLoading } = useQuery({
    queryKey: ['verifyRound', round.id],
    queryFn: async () => {
      const res = await axios.get(`/games/rounds/${round.id}/verify`);
      return res.data;
    },
    enabled: open,
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`${label} copiado!`);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck size={20} className="text-emerald-500" />
            Auditoria Provably Fair
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3 mt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 bg-zinc-800/50 animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : verification ? (
          <div className="space-y-3 mt-2">
            {/* Crash Point */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-center">
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Crash Point</div>
              <div className={`text-3xl font-black font-mono ${round.crashPoint >= 2.0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {round.crashPoint.toFixed(2)}x
              </div>
            </div>

            {/* Server Seed */}
            <FieldRow
              label="Server Seed"
              value={verification.serverSeed}
              onCopy={() => copyToClipboard(verification.serverSeed, 'Server Seed')}
              isCopied={copied === 'Server Seed'}
            />

            {/* Server Seed Hash */}
            <FieldRow
              label="Server Seed Hash (SHA-256)"
              value={verification.serverSeedHash}
              onCopy={() => copyToClipboard(verification.serverSeedHash, 'Hash')}
              isCopied={copied === 'Hash'}
            />

            {/* Client Seed */}
            <FieldRow
              label="Client Seed"
              value={verification.clientSeed}
              onCopy={() => copyToClipboard(verification.clientSeed, 'Client Seed')}
              isCopied={copied === 'Client Seed'}
            />

            {/* Explanation */}
            <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-400 leading-relaxed">
              <p className="font-semibold text-zinc-300 mb-1">Como verificar:</p>
              <p>
                O <strong>Server Seed Hash</strong> é divulgado <em>antes</em> da rodada começar. 
                Após o crash, a <strong>Server Seed</strong> é revelada. 
                Você pode confirmar que o hash corresponde à seed usando qualquer ferramenta SHA-256 online, 
                garantindo que o resultado não foi manipulado.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center text-zinc-500 py-8">
            Erro ao carregar dados da verificação.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function FieldRow({ label, value, onCopy, isCopied }: { label: string; value: string; onCopy: () => void; isCopied: boolean }) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-zinc-500 uppercase tracking-wider">{label}</span>
        <button
          onClick={onCopy}
          className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
        >
          {isCopied ? <CheckCheck size={14} className="text-emerald-500" /> : <Copy size={14} />}
        </button>
      </div>
      <code className="text-xs text-zinc-300 font-mono break-all leading-relaxed">{value}</code>
    </div>
  );
}
