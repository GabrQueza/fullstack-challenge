import { CrashChart } from "../components/game/CrashChart";
import { BetControls } from "../components/game/BetControls";
import { BetsSidebar } from "../components/game/BetsSidebar";
import { SocketInitializer } from "../components/game/SocketInitializer";

export default function Home() {
  return (
    <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 min-h-screen flex flex-col">
      <SocketInitializer />
      
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black text-emerald-500 tracking-tighter uppercase">Crash<span className="text-white">Game</span></h1>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 flex-1">
        <aside className="w-full lg:w-80 order-2 lg:order-1">
          <BetsSidebar />
        </aside>
        
        <section className="flex-1 flex flex-col gap-6 order-1 lg:order-2">
          <CrashChart />
          <BetControls />
        </section>
      </div>
    </main>
  );
}
