"use client";

import { FlowCanvas } from "@/components/FlowCanvas";
import { Sidebar } from "@/components/Sidebar";
import { NodeFormPanel } from "@/components/NodeFormPanel";
import { TopBar } from "@/components/TopBar";
import { SimulationSandbox } from "@/components/SimulationSandbox";

export default function Page() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--canvas-bg)] flex-col">
      <TopBar />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        <main className="flex-1 h-full w-full relative">
          <FlowCanvas />
        </main>
        <NodeFormPanel />
      </div>
      <SimulationSandbox />
    </div>
  );
}
