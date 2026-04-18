import { Handle, Position } from '@xyflow/react';
import { Database, Link, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

export const CustomNode = ({ data, type }: { data: any, type: string }) => {
  const isStart = type === 'start';
  const isEnd = type === 'end';
  
  const iconMap: Record<string, React.ReactNode> = {
    start: <User size={14} className="text-cyan-500" />,
    task: <Database size={14} className="text-gray-500" />,
    automated_step: <Link size={14} className="text-gray-500" />,
    approval: <User size={14} className="text-gray-500" />,
  };
  
  const borderColors: Record<string, string> = {
    start: 'border-cyan-400',
    task: 'border-gray-200',
    automated_step: 'border-orange-400',
    approval: 'border-purple-400',
    end: 'border-red-400'
  };

  return (
    <div className={cn("bg-white border rounded-xl shadow-[var(--shadow-node)] min-w-[240px]", borderColors[data.nodeType || 'task'])}>
      {!isStart && <Handle type="target" position={Position.Top} className="w-3 h-3 bg-white border-2 border-gray-400" />}
      
      <div className="flex items-start gap-3 p-3">
        <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 flex-shrink-0">
          {iconMap[data.nodeType || 'task']}
        </div>
        <div>
          <h4 className="text-sm font-semibold text-[var(--text-primary)]">{data.label}</h4>
          <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">{data.description || 'Workflow node'}</p>
        </div>
      </div>
      
      {data.stats && (
        <div className="px-3 pb-3 pt-1 flex gap-2">
            <span className="text-[10px] flex items-center gap-1 bg-gray-50 text-gray-600 px-1.5 py-0.5 rounded"><span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> {data.stats[0]}</span>
            <span className="text-[10px] flex items-center gap-1 bg-gray-50 text-gray-600 px-1.5 py-0.5 rounded"><span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> {data.stats[1]}</span>
            <span className="text-[10px] flex items-center gap-1 bg-green-50 border border-green-200 text-green-600 px-1.5 py-0.5 rounded"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> {data.stats[2]}</span>
            <span className="text-[10px] flex items-center gap-1 bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded"><span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> {data.stats[3]}</span>
        </div>
      )}
      
      {!isEnd && <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-white border-2 border-blue-500" />}
    </div>
  );
};
