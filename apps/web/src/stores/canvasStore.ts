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
import { apiUrl } from '@/lib/api-config';
import type { WorkflowNode, WorkflowEdge } from '@/lib/types';

export interface ValidationError {
  nodeId?: string;
  rule: string;
  message: string;
}

export interface SavedWorkflow {
  id: string;
  name: string;
  type: string;
  nodes: Node[];
  edges: Edge[];
  updatedAt: string;
}

interface ClipboardSnapshot {
  nodes: Node[];
  edges: Edge[];
}

export interface CanvasState {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  selectedNodeIds: string[];
  clipboard: ClipboardSnapshot | null;
  validationErrors: ValidationError[];

  currentWorkflowId: string | null;
  savedWorkflows: SavedWorkflow[];
  
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  addNode: (node: Node) => void;
  updateNodeData: (nodeId: string, data: Record<string, unknown>) => void;
  selectNode: (nodeId: string | null) => void;
  setSelectedNodes: (nodeIds: string[]) => void;
  deleteSelected: () => void;
  copySelected: () => void;
  pasteClipboard: () => void;
  autoConnectNodes: () => void;
  applyAutoLayout: () => void;
  runValidation: () => ValidationError[];

  saveWorkflow: (name: string, type: string) => void;
  loadWorkflow: (id: string) => void;
  createNewWorkflow: () => void;
  deleteWorkflow: (id: string) => void;

  history: { nodes: Node[]; edges: Edge[] }[];
  historyIndex: number;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
}

export const useCanvasStore = create<CanvasState>((set, get) => {
  // Try to load initial saved workflows from localstorage if possible.
  // Note: Since this is executed purely on the client side in most cases, we can initialize it safely.
  let initWorkflows: SavedWorkflow[] = [];
  if (typeof window !== 'undefined') {
    try {
      initWorkflows = JSON.parse(localStorage.getItem('savedWorkflows') || '[]');
    } catch {}
  }

  return {
    nodes: [],
    edges: [],
    selectedNodeId: null,
    selectedNodeIds: [],
    clipboard: null,
    validationErrors: [],
    history: [],
    historyIndex: -1,

    currentWorkflowId: null,
    savedWorkflows: initWorkflows,

    setNodes: (nodes) => {
      const selectedNodeIds = nodes.filter((node) => node.selected).map((node) => node.id);
      set({
        nodes,
        selectedNodeIds,
        selectedNodeId: selectedNodeIds.length === 1 ? selectedNodeIds[0] : null,
      });
    },
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
      set({ edges: addEdge({ ...connection, type: 'smoothstep', animated: true }, state.edges) });
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
            const historyLog = (oldData.__history as unknown[]) || [];
            delete oldData.__history;
            
            const newHistoryLog = [
              { timestamp, previousData: oldData, updatedFields: Object.keys(data) },
              ...historyLog
            ].slice(0, 10);
            
            return {
              ...n,
              data: { ...n.data, ...data, __history: newHistoryLog }
            };
          }
          return n;
        }),
      });
    },

    selectNode: (nodeId) => set({ selectedNodeId: nodeId, selectedNodeIds: nodeId ? [nodeId] : [] }),

    setSelectedNodes: (nodeIds) => set({
      selectedNodeIds: nodeIds,
      selectedNodeId: nodeIds.length === 1 ? nodeIds[0] : null,
    }),

    deleteSelected: () => {
      const state = get();
      const selectedIds = new Set([
        ...state.selectedNodeIds,
        ...state.nodes.filter((n) => n.selected).map((n) => n.id),
      ]);
      if (selectedIds.size === 0 && state.selectedNodeId) selectedIds.add(state.selectedNodeId);
      if (selectedIds.size === 0) return;
      state.pushHistory();
      set({
        nodes: state.nodes.filter((n) => !selectedIds.has(n.id)),
        edges: state.edges.filter(
          (e) => !selectedIds.has(e.source) && !selectedIds.has(e.target)
        ),
        selectedNodeId: null,
        selectedNodeIds: [],
      });
    },

    copySelected: () => {
      const state = get();
      const selectedIds = new Set([
        ...state.selectedNodeIds,
        ...state.nodes.filter((n) => n.selected).map((n) => n.id),
      ]);
      if (selectedIds.size === 0 && state.selectedNodeId) selectedIds.add(state.selectedNodeId);
      if (selectedIds.size === 0) return;

      const copiedNodes = state.nodes.filter((n) => selectedIds.has(n.id));
      const copiedEdges = state.edges.filter((e) => selectedIds.has(e.source) && selectedIds.has(e.target));

      set({
        clipboard: {
          nodes: JSON.parse(JSON.stringify(copiedNodes)),
          edges: JSON.parse(JSON.stringify(copiedEdges)),
        },
      });
    },

    pasteClipboard: () => {
      const state = get();
      if (!state.clipboard || state.clipboard.nodes.length === 0) return;
      state.pushHistory();

      const timestamp = Date.now();
      const idMap = new Map<string, string>();
      const pasteOffset = 48;

      const pastedNodes = state.clipboard.nodes.map((node, index) => {
        const newId = `${node.type || 'node'}-${timestamp}-${index}`;
        idMap.set(node.id, newId);

        return {
          ...JSON.parse(JSON.stringify(node)),
          id: newId,
          selected: true,
          position: {
            x: node.position.x + pasteOffset,
            y: node.position.y + pasteOffset,
          },
        } satisfies Node;
      });

      const pastedEdges = state.clipboard.edges.flatMap((edge, index) => {
        const source = idMap.get(edge.source);
        const target = idMap.get(edge.target);
        if (!source || !target) return [];

        return [{
          ...JSON.parse(JSON.stringify(edge)),
          id: `edge-${source}-${target}-${timestamp}-${index}`,
          source,
          target,
          selected: false,
        } satisfies Edge];
      });

      const pastedIds = pastedNodes.map((node) => node.id);

      set({
        nodes: [
          ...state.nodes.map((node) => ({ ...node, selected: false })),
          ...pastedNodes,
        ],
        edges: [
          ...state.edges.map((edge) => ({ ...edge, selected: false })),
          ...pastedEdges,
        ],
        selectedNodeIds: pastedIds,
        selectedNodeId: pastedIds.length === 1 ? pastedIds[0] : null,
      });
    },

    autoConnectNodes: () => {
      const state = get();
      if (state.nodes.length < 2) return;

      const orderedNodes = [...state.nodes].sort((a, b) => {
        const xDiff = a.position.x - b.position.x;
        return Math.abs(xDiff) > 40 ? xDiff : a.position.y - b.position.y;
      });

      const existingPairs = new Set(state.edges.map((edge) => `${edge.source}->${edge.target}`));
      const newEdges: Edge[] = [];

      for (let i = 0; i < orderedNodes.length - 1; i += 1) {
        const source = orderedNodes[i].id;
        const target = orderedNodes[i + 1].id;
        const pair = `${source}->${target}`;
        if (existingPairs.has(pair)) continue;

        existingPairs.add(pair);
        newEdges.push({
          id: `edge-${source}-${target}-${Date.now()}-${i}`,
          source,
          target,
          type: 'smoothstep',
          animated: true,
        });
      }

      if (newEdges.length === 0) return;
      state.pushHistory();
      set({ edges: [...state.edges, ...newEdges] });
    },

    applyAutoLayout: () => {
      const state = get();
      state.pushHistory();
      const layouted = autoLayout(state.nodes, state.edges, 'LR');
      set({ nodes: layouted });
    },

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

    saveWorkflow: (name, type) => {
      const state = get();
      const newWorkflow: SavedWorkflow = {
        id: state.currentWorkflowId || `wf_${Date.now()}`,
        name,
        type,
        nodes: JSON.parse(JSON.stringify(state.nodes)),
        edges: JSON.parse(JSON.stringify(state.edges)),
        updatedAt: new Date().toISOString()
      };
      
      const newWorkflows = state.currentWorkflowId 
        ? state.savedWorkflows.map(wf => wf.id === state.currentWorkflowId ? newWorkflow : wf)
        : [newWorkflow, ...state.savedWorkflows];
        
      if (typeof window !== 'undefined') {
        localStorage.setItem('savedWorkflows', JSON.stringify(newWorkflows));
      }
      
      set({ savedWorkflows: newWorkflows, currentWorkflowId: newWorkflow.id });

      // Background DB Sync
      fetch(apiUrl(`/workflows/${newWorkflow.id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newWorkflow.name,
          description: newWorkflow.type,
          nodes: newWorkflow.nodes.map(n => ({
            id: n.id,
            type: n.type || 'task',
            position: n.position,
            data: n.data || {}
          })),
          edges: newWorkflow.edges.map(e => ({
            id: e.id,
            source: e.source,
            target: e.target,
            label: (e as Edge & { label?: string }).label
          }))
        })
      }).catch(err => {
        console.error('[DB Sync] Failed to save workflow to backend:', err);
      });
    },

    loadWorkflow: (id) => {
      const state = get();
      const wf = state.savedWorkflows.find(w => w.id === id);
      if (wf) {
        set({ nodes: wf.nodes, edges: wf.edges, currentWorkflowId: wf.id, history: [], historyIndex: -1, selectedNodeId: null, selectedNodeIds: [], validationErrors: [] });
      }
    },

    createNewWorkflow: () => {
      set({ nodes: [], edges: [], currentWorkflowId: null, history: [], historyIndex: -1, selectedNodeId: null, selectedNodeIds: [], validationErrors: [] });
    },

    deleteWorkflow: (id) => {
      const state = get();
      const newWorkflows = state.savedWorkflows.filter(wf => wf.id !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('savedWorkflows', JSON.stringify(newWorkflows));
      }
      set({ savedWorkflows: newWorkflows });
      if (state.currentWorkflowId === id) {
        get().createNewWorkflow();
      }
    },

    pushHistory: () => {
      const { nodes, edges, history, historyIndex } = get();
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({
        nodes: JSON.parse(JSON.stringify(nodes)),
        edges: JSON.parse(JSON.stringify(edges)),
      });
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
  };
});
