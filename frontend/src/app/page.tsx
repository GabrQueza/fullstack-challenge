import { CrashChart } from "../components/game/CrashChart";
import { BetControls } from "../components/game/BetControls";
import { BetsSidebar } from "../components/game/BetsSidebar";
import { SocketInitializer } from "../components/game/SocketInitializer";

import { Header } from "../components/game/Header";
import { CrashHistory } from "../components/game/CrashHistory";

export default function Home() {
  return (
    <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 min-h-screen flex flex-col">
      <SocketInitializer />
      
      <Header />

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-w-0">
        <aside className="w-full lg:w-80 order-2 lg:order-1">
          <BetsSidebar />
        </aside>
        
        <section className="flex-1 flex flex-col order-1 lg:order-2 min-w-0">
          <CrashHistory />
          <div className="flex flex-col gap-6">
            <CrashChart />
            <BetControls />
          </div>
        </section>
      </div>
    </main>
  );
}
