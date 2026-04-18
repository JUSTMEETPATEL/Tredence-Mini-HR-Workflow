"use client";
// ── NodeValidationBadge — shows error count on nodes with violations ──

import { useCanvasStore } from '@/stores/canvasStore';
import { AlertTriangle } from 'lucide-react';

export function NodeValidationBadge({ nodeId }: { nodeId: string }) {
  const errors = useCanvasStore((s) =>
    s.validationErrors.filter((e) => e.nodeId === nodeId)
  );

  if (errors.length === 0) return null;

  return (
    <div className="absolute -top-2 -right-2 z-10 group">
      <div className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-md animate-pulse">
        <AlertTriangle size={11} />
      </div>
      {/* Tooltip */}
      <div className="absolute top-6 right-0 bg-red-50 border border-red-200 rounded-lg p-2 min-w-[180px] shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {errors.map((err, i) => (
          <p key={i} className="text-[10px] text-red-700 leading-tight">
            • {err.message}
          </p>
        ))}
      </div>
    </div>
  );
}
