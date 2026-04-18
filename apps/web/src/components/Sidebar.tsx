"use client";

import { LayoutDashboard, ShieldCheck, Calendar, BarChart2, Link, Server, Workflow, Users, Inbox, MessageSquare, Settings, HelpCircle } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="w-[var(--sidebar-width)] bg-[var(--surface-primary)] border-r border-[var(--border-default)] h-full flex flex-col shrink-0">
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-2">
          <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">General</p>
          <ul className="space-y-1">
            <li>
              <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-500 bg-red-50 rounded-md">
                <LayoutDashboard size={18} />
                Dashboard
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-gray-50 rounded-md">
                <ShieldCheck size={18} />
                Compliance
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center justify-between px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-gray-50 rounded-md">
                <span className="flex items-center gap-3">
                  <Calendar size={18} />
                  Scheduler
                </span>
                <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">11</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-gray-50 rounded-md">
                <BarChart2 size={18} />
                Analytics
              </a>
            </li>
          </ul>
        </div>

        <div className="px-4 mb-2 mt-6">
          <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Automation</p>
          <ul className="space-y-1">
            <li>
              <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-gray-50 rounded-md">
                <Link size={18} />
                Integrations
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center justify-between px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-gray-50 rounded-md">
                <span className="flex items-center gap-3">
                  <Server size={18} />
                  Repository
                </span>
                <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">7</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-gray-50 rounded-md">
                <Workflow size={18} />
                Workflows
              </a>
            </li>
          </ul>
        </div>
        
        {/* Node Palette - PRD specifies dragging nodes from sidebar */}
        <div className="px-4 mb-2 mt-6">
          <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Node Palette</p>
          <div className="space-y-2">
            <div className="border border-[var(--border-default)] rounded p-2 text-xs flex items-center gap-2 cursor-grab bg-white hover:border-[var(--node-start)] shadow-[var(--shadow-node)]" onDragStart={(event) => { event.dataTransfer.setData('application/reactflow', 'start'); event.dataTransfer.effectAllowed = 'move'; }} draggable>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--node-start)' }}></div>
              Start Node
            </div>
            <div className="border border-[var(--border-default)] rounded p-2 text-xs flex items-center gap-2 cursor-grab bg-white hover:border-[var(--node-task)] shadow-[var(--shadow-node)]" onDragStart={(event) => { event.dataTransfer.setData('application/reactflow', 'task'); event.dataTransfer.effectAllowed = 'move'; }} draggable>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--node-task)' }}></div>
              Task Node
            </div>
            <div className="border border-[var(--border-default)] rounded p-2 text-xs flex items-center gap-2 cursor-grab bg-white hover:border-[var(--node-approval)] shadow-[var(--shadow-node)]" onDragStart={(event) => { event.dataTransfer.setData('application/reactflow', 'approval'); event.dataTransfer.effectAllowed = 'move'; }} draggable>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--node-approval)' }}></div>
              Approval Node
            </div>
            <div className="border border-[var(--border-default)] rounded p-2 text-xs flex items-center gap-2 cursor-grab bg-white hover:border-[var(--node-automated)] shadow-[var(--shadow-node)]" onDragStart={(event) => { event.dataTransfer.setData('application/reactflow', 'automated_step'); event.dataTransfer.effectAllowed = 'move'; }} draggable>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--node-automated)' }}></div>
              Automated Step
            </div>
            <div className="border border-[var(--border-default)] rounded p-2 text-xs flex items-center gap-2 cursor-grab bg-white hover:border-[var(--node-end)] shadow-[var(--shadow-node)]" onDragStart={(event) => { event.dataTransfer.setData('application/reactflow', 'end'); event.dataTransfer.effectAllowed = 'move'; }} draggable>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--node-end)' }}></div>
              End Node
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-[var(--border-default)] space-y-1">
        <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-gray-50 rounded-md">
          <Settings size={18} />
          Settings
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-gray-50 rounded-md">
          <HelpCircle size={18} />
          Help & Support
        </a>
      </div>
    </aside>
  );
}
