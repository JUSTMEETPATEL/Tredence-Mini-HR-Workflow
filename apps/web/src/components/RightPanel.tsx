import { X, Search } from "lucide-react";

export function RightPanel() {
  return (
    <aside className="w-[var(--right-panel-width)] bg-[var(--surface-primary)] border-l border-[var(--border-default)] h-full overflow-y-auto flex flex-col shrink-0">
      <div className="p-4 border-b border-[var(--border-default)] flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Performance Overview</h3>
          <p className="text-xs text-[var(--text-tertiary)]">Overview Performance Time</p>
        </div>
        <button className="text-[var(--text-secondary)] hover:bg-gray-100 p-1 rounded">
          <X size={16} />
        </button>
      </div>

      <div className="p-4 border-b border-[var(--border-default)]">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium">Insight Metrics</h4>
          <span className="text-[var(--text-secondary)]">+</span>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-2 text-[var(--text-tertiary)]" />
          <input 
            type="text" 
            placeholder="Search Here..." 
            className="w-full bg-gray-50 border border-gray-200 rounded-md py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-500)]"
          />
        </div>
      </div>

      <div className="p-4 border-b border-[var(--border-default)] relative">
        <button className="absolute right-4 top-4 text-[var(--text-secondary)]"><X size={14} /></button>
        <h4 className="text-sm font-medium mb-1">Automation Coverage</h4>
        <p className="text-xs text-[var(--text-secondary)] mb-4">Your last week is better <span className="font-semibold text-[var(--text-primary)]">72%</span></p>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium">Workflow A</span>
              <span className="text-[var(--text-secondary)]">+</span>
            </div>
            <p className="text-[10px] text-[var(--text-tertiary)] mb-2">Triggered by User Actions</p>
            <div className="flex h-1.5 w-full rounded-full overflow-hidden bg-gray-100 mb-2">
              <div className="w-2/5 bg-red-400"></div>
              <div className="w-1/5 bg-blue-400"></div>
              <div className="w-2/5 bg-green-400"></div>
            </div>
            <div className="flex gap-2">
              <span className="text-[10px] flex items-center gap-1 border border-red-200 bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full"><span className="w-1 h-1 rounded-full bg-red-500"></span> Task: 29</span>
              <span className="text-[10px] flex items-center gap-1 border border-blue-200 bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full"><span className="w-1 h-1 rounded-full bg-blue-500"></span> Exec: 10</span>
              <span className="text-[10px] flex items-center gap-1 border border-green-200 bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full"><span className="w-1 h-1 rounded-full bg-green-500"></span> Done: 13</span>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium">Workflow B</span>
              <span className="text-[var(--text-secondary)]">+</span>
            </div>
            <p className="text-[10px] text-[var(--text-tertiary)] mb-2">Scheduled Automation</p>
            <div className="flex h-1.5 w-full rounded-full overflow-hidden bg-gray-100 mb-2">
              <div className="w-1/3 bg-red-400"></div>
              <div className="w-1/3 bg-blue-400"></div>
              <div className="w-1/3 bg-green-400"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 flex-1">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium">Flow Objectives</h4>
          <span className="text-[var(--text-secondary)]">+</span>
        </div>
        
        <div className="space-y-3">
          {/* Card 1 */}
          <div className="border border-[var(--border-default)] rounded-lg p-3 shadow-sm bg-white">
            <div className="flex gap-3 mb-3">
              <div className="bg-gray-100 p-2 rounded-md h-fit"><Link size={14} /></div>
              <div>
                <h5 className="text-xs font-semibold">Output Generation</h5>
                <p className="text-[10px] text-[var(--text-tertiary)]">Compiling Delivering Outputs</p>
              </div>
            </div>
            <div className="flex gap-2">
               <span className="text-[10px] flex items-center gap-1 bg-gray-50 text-gray-600 px-1.5 py-0.5 rounded"><span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> 15</span>
               <span className="text-[10px] flex items-center gap-1 bg-gray-50 text-gray-600 px-1.5 py-0.5 rounded"><span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> 55</span>
               <span className="text-[10px] flex items-center gap-1 bg-green-50 border border-green-200 text-green-600 px-1.5 py-0.5 rounded"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> 41</span>
               <span className="text-[10px] flex items-center gap-1 bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded"><span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> 69</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="border border-[var(--border-default)] rounded-lg p-3 shadow-sm bg-white">
            <div className="flex gap-3 mb-3">
              <div className="bg-gray-100 p-2 rounded-md h-fit"><Calendar size={14} /></div>
              <div>
                <h5 className="text-xs font-semibold">Lorem Ipsum</h5>
                <p className="text-[10px] text-[var(--text-tertiary)]">Lorem Ipsum Sit Dolor</p>
              </div>
            </div>
             <div className="flex gap-2">
               <span className="text-[10px] flex items-center gap-1 bg-gray-50 text-gray-600 px-1.5 py-0.5 rounded"><span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> 11</span>
               <span className="text-[10px] flex items-center gap-1 bg-gray-50 text-gray-600 px-1.5 py-0.5 rounded"><span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> 27</span>
               <span className="text-[10px] flex items-center gap-1 bg-green-50 border border-green-200 text-green-600 px-1.5 py-0.5 rounded"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> 41</span>
               <span className="text-[10px] flex items-center gap-1 bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded"><span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> 72</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// Importing a few icons missing in this file scope dynamically or just adding them above
import { Link, Calendar } from "lucide-react";
