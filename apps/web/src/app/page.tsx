"use client";

import { FlowCanvas } from "@/components/FlowCanvas";
import { Sidebar } from "@/components/Sidebar";
import { NodeFormPanel } from "@/components/NodeFormPanel";
import { TopBar } from "@/components/TopBar";
import { SimulationSandbox } from "@/components/SimulationSandbox";
import { TutorialOverlay } from "@/components/TutorialOverlay";
import { ComplianceView, SchedulerView, AnalyticsView, IntegrationsView, RepositoryView } from "@/components/ViewPanels";
import { AiWorkflowBuilder } from "@/components/AiWorkflowBuilder";
import { useViewStore } from "@/stores/viewStore";

export default function Page() {
  const activeView = useViewStore((s) => s.activeView);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--canvas-bg)] flex-col relative">
      <TopBar />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />

        {activeView === 'dashboard' && (
          <>
            <main className="flex-1 h-full w-full relative">
              <FlowCanvas />
            </main>
            <NodeFormPanel />
          </>
        )}

        {activeView === 'compliance' && <ComplianceView />}
        {activeView === 'scheduler' && <SchedulerView />}
        {activeView === 'analytics' && <AnalyticsView />}
        {activeView === 'integrations' && <IntegrationsView />}
        {activeView === 'repository' && <RepositoryView />}

      </div>
      <SimulationSandbox />
      {activeView === 'dashboard' && <TutorialOverlay />}
      <AiWorkflowBuilder />
    </div>
  );
}
