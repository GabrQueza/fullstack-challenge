"use client";

import { useSocket } from "../../hooks/useSocket";

export function SocketInitializer() {
  useSocket();
  return null;
}
