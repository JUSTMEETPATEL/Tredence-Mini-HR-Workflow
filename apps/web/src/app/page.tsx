import { FlowCanvas } from "@/components/FlowCanvas";
import { Sidebar } from "@/components/Sidebar";
import { RightPanel } from "@/components/RightPanel";
import { TopBar } from "@/components/TopBar";

export default function Page() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--canvas-bg)] flex-col">
      <TopBar />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        <main className="flex-1 h-full w-full relative">
          <FlowCanvas />
        </main>
        <RightPanel />
      </div>
    </div>
  );
}
