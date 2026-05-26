"use client";

import { useQuery } from "@tanstack/react-query";
import { useAxiosAuth } from "../../hooks/useAxiosAuth";
import { useGameStore } from "../../store/useGameStore";
import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import { ProvablyFairModal } from "./ProvablyFairModal";

export function CrashHistory() {
  const axios = useAxiosAuth();
  const status = useGameStore((s) => s.status);
  const [selectedRound, setSelectedRound] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: history, refetch, isLoading } = useQuery({
    queryKey: ['crashHistory'],
    queryFn: async () => {
      const res = await axios.get('/games/rounds/history');
      return res.data;
    },
  });

  // Refetch history when a new round starts
  useEffect(() => {
    if (status === 'BETTING') {
      refetch();
    }
  }, [status, refetch]);

  const handleRoundClick = (round: any) => {
    setSelectedRound(round);
    setModalOpen(true);
  };

  if (isLoading || !history) {
    return (
      <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl mb-4 p-1.5 flex items-center overflow-hidden">
        <span className="shrink-0 text-xs text-zinc-500 font-semibold px-3 uppercase tracking-wider mr-2 border-r border-zinc-800">
          Histórico
        </span>
        <div className="flex gap-2 overflow-hidden w-full px-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="shrink-0 w-16 h-6 bg-zinc-800/50 animate-pulse rounded-full border border-zinc-700/50"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl mb-4 p-1.5 flex items-center overflow-hidden">
        <span className="shrink-0 text-xs text-zinc-500 font-semibold px-3 uppercase tracking-wider border-r border-zinc-800 z-10 bg-zinc-900 mr-2">
          Histórico
        </span>
        
        <div className="flex-1 min-w-0 px-8 relative">
          <Carousel
            opts={{
              align: "start",
              dragFree: true,
            }}
            className="w-full max-w-full"
          >
            <CarouselContent className="-ml-2">
              {history.map((round: any) => {
                const isGreen = round.crashPoint >= 2.0;
                return (
                  <CarouselItem key={round.id} className="pl-2 basis-auto">
                    <button
                      onClick={() => handleRoundClick(round)}
                      className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold font-mono border transition-all hover:-translate-y-0.5 hover:brightness-125 cursor-pointer select-none ${
                        isGreen 
                          ? 'bg-emerald-900/20 text-emerald-500 border-emerald-900/50' 
                          : 'bg-red-950/40 text-red-500 border-red-900/50'
                      }`}
                    >
                      {round.crashPoint.toFixed(2)}x
                    </button>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="absolute -left-7 h-6 w-6 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700 active:translate-y-0" />
            <CarouselNext className="absolute -right-7 h-6 w-6 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700 active:translate-y-0" />
          </Carousel>
        </div>
      </div>

      {selectedRound && (
        <ProvablyFairModal
          round={selectedRound}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      )}
    </>
  );
}
