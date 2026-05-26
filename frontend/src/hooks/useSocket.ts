import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useGameStore } from '../store/useGameStore';
import { useQueryClient } from '@tanstack/react-query';

export const useSocket = () => {
  const { setGameState, setTick, setCrash, addBet, updateBet } = useGameStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4001';
    const socket = io(socketUrl, {
      transports: ['websocket'],
    });

    socket.on('game.state', (data: any) => {
      setGameState({
        status: data.status,
        roundId: data.roundId,
        timeRemaining: data.timeRemaining || null,
        serverSeedHash: data.serverSeedHash || null,
        multiplier: data.status === 'BETTING' ? 1.0 : useGameStore.getState().multiplier,
        crashPoint: data.status === 'BETTING' ? null : useGameStore.getState().crashPoint,
        bets: data.status === 'BETTING' ? [] : useGameStore.getState().bets,
      });
    });

    socket.on('game.tick', (data: { multiplier: number }) => {
      setTick(data.multiplier);
    });

    socket.on('game.crash', (data: { roundId: string, crashPoint: number, serverSeed: string }) => {
      setCrash(data.crashPoint);
    });

    socket.on('game.betPlaced', (data: { userId: string, amount: number }) => {
      addBet({ userId: data.userId, amount: data.amount });
    });

    socket.on('game.betWon', (data: { userId: string, multiplier: number, amount: number }) => {
      updateBet(data.userId, data.multiplier);
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    });

    return () => {
      socket.disconnect();
    };
  }, [setGameState, setTick, setCrash, addBet, updateBet, queryClient]);
};
