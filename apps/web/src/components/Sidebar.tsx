"use client";

import { LayoutDashboard, ShieldCheck, Calendar, BarChart2, Link, Server, Workflow, Settings, HelpCircle, Play, ClipboardList, Zap, Square } from "lucide-react";

const NODE_PALETTE = [
  { type: 'start', label: 'Start Node', color: 'var(--node-start)', icon: Play },
  { type: 'task', label: 'Task Node', color: 'var(--node-task)', icon: ClipboardList },
  { type: 'approval', label: 'Approval Node', color: 'var(--node-approval)', icon: ShieldCheck },
  { type: 'automated_step', label: 'Automated Step', color: 'var(--node-automated)', icon: Zap },
  { type: 'end', label: 'End Node', color: 'var(--node-end)', icon: Square },
];

export function Sidebar() {
  return (
    <aside className="w-[var(--sidebar-width)] bg-[var(--surface-primary)] border-r border-[var(--border-default)] h-full flex flex-col shrink-0">
      <div className="flex-1 overflow-y-auto py-4">
        {/* Navigation */}
        <div className="px-4 mb-2">
          <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">General</p>
          <ul className="space-y-0.5">
            <li>
              <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-[var(--color-brand-600)] bg-[var(--color-brand-50)] rounded-md cursor-pointer">
                <LayoutDashboard size={16} />
                Dashboard
              </a>
            </li>
            <li><a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-gray-50 rounded-md cursor-pointer"><ShieldCheck size={16} />Compliance</a></li>
            <li>
              <a href="#" className="flex items-center justify-between px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-gray-50 rounded-md cursor-pointer">
                <span className="flex items-center gap-3"><Calendar size={16} />Scheduler</span>
                <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">11</span>
              </a>
            </li>
            <li><a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-gray-50 rounded-md cursor-pointer"><BarChart2 size={16} />Analytics</a></li>
          </ul>
        </div>

        <div className="px-4 mb-2 mt-5">
          <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Automation</p>
          <ul className="space-y-0.5">
            <li><a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-gray-50 rounded-md cursor-pointer"><Link size={16} />Integrations</a></li>
            <li>
              <a href="#" className="flex items-center justify-between px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-gray-50 rounded-md cursor-pointer">
                <span className="flex items-center gap-3"><Server size={16} />Repository</span>
                <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">7</span>
              </a>
            </li>
            <li><a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-gray-50 rounded-md cursor-pointer"><Workflow size={16} />Workflows</a></li>
          </ul>
        </div>

        {/* Node Palette — drag nodes onto canvas */}
        <div className="px-4 mt-6">
          <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Node Palette</p>
          <div className="space-y-1.5">
            {NODE_PALETTE.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.type}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/reactflow', item.type);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  className="border border-[var(--border-default)] rounded-lg p-2.5 text-xs flex items-center gap-2.5 cursor-grab bg-white hover:shadow-md active:cursor-grabbing transition-shadow"
                  style={{ borderLeftColor: item.color, borderLeftWidth: 3 }}
                >
                  <Icon size={14} style={{ color: item.color }} />
                  <span className="font-medium text-[var(--text-primary)]">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-[var(--border-default)] space-y-0.5">
        <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-gray-50 rounded-md cursor-pointer"><Settings size={16} />Settings</a>
        <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-gray-50 rounded-md cursor-pointer"><HelpCircle size={16} />Help & Support</a>
      </div>
    </aside>
  );
}
