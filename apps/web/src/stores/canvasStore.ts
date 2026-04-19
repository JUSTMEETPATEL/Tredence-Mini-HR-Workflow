// ── Canvas Store — Zustand ────────────────────────────
// Manages nodes, edges, selection state for the React Flow canvas.

import { create } from 'zustand';
import {
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type Connection,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react';
import { autoLayout } from '@/lib/auto-layout';
import { validateWorkflow } from '@/lib/workflow-engine';
import type { WorkflowNode, WorkflowEdge } from '@/lib/types';

export interface ValidationError {
  nodeId?: string;
  rule: string;
  message: string;
}

export interface CanvasState {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  validationErrors: ValidationError[];

  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  addNode: (node: Node) => void;
  updateNodeData: (nodeId: string, data: Record<string, unknown>) => void;
  selectNode: (nodeId: string | null) => void;
  deleteSelected: () => void;
  applyAutoLayout: () => void;
  runValidation: () => ValidationError[];

  // History (undo/redo)
  history: { nodes: Node[]; edges: Edge[] }[];
  historyIndex: number;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  validationErrors: [],
  history: [],
  historyIndex: -1,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (connection) => {
    const state = get();
    state.pushHistory();
    set({ edges: addEdge(connection, state.edges) });
  },

  addNode: (node) => {
    const state = get();
    state.pushHistory();
    set({ nodes: [...state.nodes, node] });
  },

  updateNodeData: (nodeId, data) => {
    set({
      nodes: get().nodes.map((n) => {
        if (n.id === nodeId) {
          const timestamp = new Date().toISOString();
          const oldData = { ...n.data };
          // Remove internal history array to avoid massive recursion log
          const historyLog = (oldData.__history as unknown[]) || [];
          delete oldData.__history;
          
          const newHistoryLog = [
            { timestamp, previousData: oldData, updatedFields: Object.keys(data) },
            ...historyLog
          ].slice(0, 10); // keep last 10 edits
          
          return {
            ...n,
            data: { ...n.data, ...data, __history: newHistoryLog }
          };
        }
        return n;
      }),
    });
  },

  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

  deleteSelected: () => {
    const state = get();
    const { selectedNodeId } = state;
    if (!selectedNodeId) return;
    state.pushHistory();
    set({
      nodes: state.nodes.filter((n) => n.id !== selectedNodeId),
      edges: state.edges.filter(
        (e) => e.source !== selectedNodeId && e.target !== selectedNodeId
      ),
      selectedNodeId: null,
    });
  },

  // ── Auto-layout (dagre) ───────────────────────
  applyAutoLayout: () => {
    const state = get();
    state.pushHistory();
    const layouted = autoLayout(state.nodes, state.edges, 'TB');
    set({ nodes: layouted });
  },

  // ── Validation ────────────────────────────────
  runValidation: () => {
    const { nodes, edges } = get();
    if (nodes.length === 0) {
      set({ validationErrors: [] });
      return [];
    }

    const wfNodes: WorkflowNode[] = nodes.map((n) => ({
      id: n.id,
      type: (n.type || 'task') as WorkflowNode['type'],
      position: n.position,
      data: n.data as unknown as WorkflowNode['data'],
    }));
    const wfEdges: WorkflowEdge[] = edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
    }));

    const violations = validateWorkflow(wfNodes, wfEdges);
    set({ validationErrors: violations });
    return violations;
  },

  // ── History ────────────────────────────────────
  pushHistory: () => {
    const { nodes, edges, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    });
    // Keep max 50 entries
    if (newHistory.length > 50) newHistory.shift();
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return;
    const prev = history[historyIndex - 1];
    set({
      nodes: JSON.parse(JSON.stringify(prev.nodes)),
      edges: JSON.parse(JSON.stringify(prev.edges)),
      historyIndex: historyIndex - 1,
    });
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    const next = history[historyIndex + 1];
    set({
      nodes: JSON.parse(JSON.stringify(next.nodes)),
      edges: JSON.parse(JSON.stringify(next.edges)),
      historyIndex: historyIndex + 1,
    });
  },
}));

