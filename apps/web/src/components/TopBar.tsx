import { Code, TerminalSquare, RotateCcw, RotateCw, FileJson, Play } from "lucide-react";

export function TopBar() {
  return (
    <header className="h-[var(--toolbar-height)] border-b border-[var(--border-default)] bg-[var(--surface-primary)] flex items-center justify-between px-6 z-10 shadow-sm shrink-0">
      <div className="flex items-center gap-2">
        <div className="bg-[var(--color-brand-600)] text-white p-1.5 rounded-md">
          <Code size={18} />
        </div>
        <span className="font-semibold text-lg text-[var(--text-primary)]">CodeAuto</span>
      </div>
      
      <div className="flex flex-col items-center">
        <span className="text-sm font-medium">User Automation &or;</span>
        <span className="text-xs text-[var(--text-tertiary)]">Overview of User Workflows.</span>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-1.5 text-[var(--text-secondary)] hover:text-black hover:bg-gray-100 rounded">
          <RotateCcw size={16} />
        </button>
        <button className="p-1.5 text-[var(--text-secondary)] hover:text-black hover:bg-gray-100 rounded">
          <RotateCw size={16} />
        </button>
        <div className="w-px h-5 bg-gray-200 mx-1"></div>
        <button className="p-1.5 text-[var(--text-secondary)] hover:text-black hover:bg-gray-100 rounded" title="Export JSON">
          <FileJson size={16} />
        </button>
        <button className="p-1.5 text-[var(--text-secondary)] hover:text-black hover:bg-gray-100 rounded flex items-center gap-1" title="Validate">
          <TerminalSquare size={16} />
        </button>
        <button className="p-1.5 text-[var(--node-task)] hover:text-blue-700 hover:bg-blue-50 rounded flex items-center gap-1" title="Run Simulation">
          <Play size={16} fill="currentColor" />
        </button>
      </div>
    </header>
  );
}
