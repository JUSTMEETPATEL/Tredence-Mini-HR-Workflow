"use client";

import { ShieldCheck, Calendar, BarChart2, Link, Server, CheckCircle2, XCircle, Clock, AlertTriangle, TrendingUp, Users, FileText, ArrowRight, Activity } from "lucide-react";
import { useCanvasStore } from "@/stores/canvasStore";
import { DEMO_WORKFLOWS } from "@/lib/demo-workflows";
import { useViewStore } from "@/stores/viewStore";

/* ────────────────────────────────────────────────────────
   Compliance View
   ──────────────────────────────────────────────────────── */
export function ComplianceView() {
  const rules = [
    { id: 'R-001', label: 'All workflows must have a Start node', status: 'pass' },
    { id: 'R-002', label: 'All workflows must have an End node', status: 'pass' },
    { id: 'R-003', label: 'Every task must have an assignee defined', status: 'warn' },
    { id: 'R-004', label: 'Approval nodes require an approver field', status: 'pass' },
    { id: 'R-005', label: 'No orphan nodes (disconnected from graph)', status: 'fail' },
    { id: 'R-006', label: 'Workflows must not exceed 50 nodes', status: 'pass' },
    { id: 'R-007', label: 'Sensitive data fields must be encrypted', status: 'warn' },
    { id: 'R-008', label: 'Automated steps must reference valid endpoints', status: 'pass' },
  ];

  const passCount = rules.filter(r => r.status === 'pass').length;
  const warnCount = rules.filter(r => r.status === 'warn').length;
  const failCount = rules.filter(r => r.status === 'fail').length;

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50/50">
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600"><ShieldCheck size={22} /></div>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">Compliance Dashboard</h1>
            <p className="text-sm text-[var(--text-tertiary)]">Audit your workflows against HR policy rules</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase">Passing</span>
              <CheckCircle2 size={18} className="text-emerald-500" />
            </div>
            <p className="text-3xl font-bold text-emerald-600">{passCount}</p>
            <p className="text-xs text-gray-400 mt-1">of {rules.length} rules</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase">Warnings</span>
              <AlertTriangle size={18} className="text-amber-500" />
            </div>
            <p className="text-3xl font-bold text-amber-600">{warnCount}</p>
            <p className="text-xs text-gray-400 mt-1">need attention</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase">Failing</span>
              <XCircle size={18} className="text-red-500" />
            </div>
            <p className="text-3xl font-bold text-red-600">{failCount}</p>
            <p className="text-xs text-gray-400 mt-1">violations found</p>
          </div>
        </div>

        {/* Rules Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Policy Rules ({rules.length})</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {rules.map(rule => (
              <div key={rule.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  {rule.status === 'pass' && <CheckCircle2 size={16} className="text-emerald-500" />}
                  {rule.status === 'warn' && <AlertTriangle size={16} className="text-amber-500" />}
                  {rule.status === 'fail' && <XCircle size={16} className="text-red-500" />}
                  <div>
                    <p className="text-sm text-[var(--text-primary)]">{rule.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{rule.id}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${rule.status === 'pass' ? 'bg-emerald-50 text-emerald-600' : rule.status === 'warn' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                  {rule.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   Scheduler View
   ──────────────────────────────────────────────────────── */
export function SchedulerView() {
  const setActiveView = useViewStore(s => s.setActiveView);

  const schedules = [
    { name: 'Weekly Onboarding Batch', cron: 'Every Monday 9:00 AM', status: 'active', lastRun: '2 hours ago', nextRun: 'Mon, Apr 21' },
    { name: 'Expense Report Sweep', cron: 'Daily at 6:00 PM', status: 'active', lastRun: '18 hours ago', nextRun: 'Today, 6:00 PM' },
    { name: 'Compliance Audit', cron: 'Monthly 1st', status: 'paused', lastRun: 'Mar 1, 2026', nextRun: 'May 1, 2026' },
    { name: 'Offboarding Reminder', cron: 'Every Friday 4:00 PM', status: 'active', lastRun: 'Last Friday', nextRun: 'Fri, Apr 25' },
    { name: 'Leave Approval Escalation', cron: 'Every 4 hours', status: 'active', lastRun: '1 hour ago', nextRun: 'In 3 hours' },
    { name: 'Quarterly Performance Review', cron: 'Quarterly', status: 'paused', lastRun: 'Jan 1, 2026', nextRun: 'Jul 1, 2026' },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50/50">
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600"><Calendar size={22} /></div>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">Workflow Scheduler</h1>
            <p className="text-sm text-[var(--text-tertiary)]">Automate workflow execution on a schedule</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase">Active</span>
              <Activity size={18} className="text-emerald-500" />
            </div>
            <p className="text-3xl font-bold text-emerald-600">{schedules.filter(s => s.status === 'active').length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase">Paused</span>
              <Clock size={18} className="text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-500">{schedules.filter(s => s.status === 'paused').length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase">Total Runs</span>
              <TrendingUp size={18} className="text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-blue-600">1,247</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Scheduled Workflows</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {schedules.map((s, i) => (
              <div key={i} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{s.name}</p>
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${s.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>{s.status}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Clock size={11} />{s.cron}</span>
                  <span>Last: {s.lastRun}</span>
                  <span>Next: {s.nextRun}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-center text-gray-400 mt-6">Build a workflow in the <button onClick={() => setActiveView('dashboard')} className="text-[var(--color-brand-600)] hover:underline font-medium">Dashboard</button> to schedule it here.</p>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   Analytics View
   ──────────────────────────────────────────────────────── */
export function AnalyticsView() {
  const savedWorkflows = useCanvasStore(s => s.savedWorkflows);
  const totalNodes = savedWorkflows.reduce((sum, wf) => sum + wf.nodes.length, 0);
  const totalEdges = savedWorkflows.reduce((sum, wf) => sum + wf.edges.length, 0);

  const metrics = [
    { label: 'Total Workflows', value: savedWorkflows.length, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Total Nodes', value: totalNodes, icon: Users, color: 'text-violet-600', bg: 'bg-violet-100' },
    { label: 'Total Edges', value: totalEdges, icon: ArrowRight, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Avg Nodes/Workflow', value: savedWorkflows.length ? Math.round(totalNodes / savedWorkflows.length) : 0, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-100' },
  ];

  // Simulated usage bars
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const usage = [72, 85, 64, 91, 78, 30, 15];

  const typeBreakdown = savedWorkflows.reduce((acc, wf) => {
    acc[wf.type] = (acc[wf.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50/50">
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-violet-100 text-violet-600"><BarChart2 size={22} /></div>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">Analytics</h1>
            <p className="text-sm text-[var(--text-tertiary)]">Workflow usage metrics and insights</p>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {metrics.map(m => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-semibold text-gray-500 uppercase">{m.label}</span>
                  <div className={`p-1.5 rounded-lg ${m.bg}`}><Icon size={14} className={m.color} /></div>
                </div>
                <p className={`text-3xl font-bold ${m.color}`}>{m.value}</p>
              </div>
            );
          })}
        </div>

        {/* Weekly Activity Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Weekly Activity</h2>
          <div className="flex items-end gap-3 h-32">
            {weekdays.map((day, i) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-md bg-[var(--color-brand-100)] relative overflow-hidden" style={{ height: `${usage[i]}%` }}>
                  <div className="absolute inset-0 bg-[var(--color-brand-500)] opacity-60 rounded-t-md" />
                </div>
                <span className="text-[10px] text-gray-400 font-medium">{day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Type Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Workflow Types</h2>
          {Object.keys(typeBreakdown).length === 0 ? (
            <p className="text-xs text-gray-400 italic">No saved workflows to analyze.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(typeBreakdown).map(([type, count]) => (
                <div key={type} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-24 capitalize">{type}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--color-brand-500)] rounded-full" style={{ width: `${(count / savedWorkflows.length) * 100}%` }} />
                  </div>
                  <span className="text-xs font-medium text-gray-500 w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   Integrations View
   ──────────────────────────────────────────────────────── */
export function IntegrationsView() {
  const integrations = [
    { name: 'Slack', desc: 'Send notifications and approvals via Slack channels', icon: '💬', connected: true },
    { name: 'Microsoft Teams', desc: 'Push workflow updates to Teams channels', icon: '🟦', connected: false },
    { name: 'Gmail / SMTP', desc: 'Send automated email notifications', icon: '📧', connected: true },
    { name: 'Jira', desc: 'Create and track issues from workflow tasks', icon: '🔵', connected: false },
    { name: 'SAP SuccessFactors', desc: 'Sync employee data with HR system', icon: '🏢', connected: true },
    { name: 'Workday', desc: 'Import org charts and employee records', icon: '📊', connected: false },
    { name: 'DocuSign', desc: 'Request e-signatures within approval flows', icon: '✍️', connected: false },
    { name: 'Google Sheets', desc: 'Log workflow outcomes to spreadsheets', icon: '📗', connected: true },
    { name: 'Webhooks', desc: 'Send and receive custom HTTP webhook calls', icon: '🔗', connected: true },
    { name: 'PostgreSQL', desc: 'Read/write data from internal databases', icon: '🐘', connected: true },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50/50">
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-sky-100 text-sky-600"><Link size={22} /></div>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">Integrations</h1>
            <p className="text-sm text-[var(--text-tertiary)]">Connect external services to your HR workflows</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <span className="text-xs font-semibold text-gray-500 uppercase">Connected</span>
            <p className="text-3xl font-bold text-emerald-600 mt-2">{integrations.filter(i => i.connected).length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <span className="text-xs font-semibold text-gray-500 uppercase">Available</span>
            <p className="text-3xl font-bold text-gray-500 mt-2">{integrations.filter(i => !i.connected).length}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {integrations.map(int => (
            <div key={int.name} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow flex items-start gap-3">
              <span className="text-2xl mt-0.5">{int.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{int.name}</p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${int.connected ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                    {int.connected ? 'Connected' : 'Available'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{int.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   Repository View
   ──────────────────────────────────────────────────────── */
export function RepositoryView() {
  const savedWorkflows = useCanvasStore(s => s.savedWorkflows);
  const setActiveView = useViewStore(s => s.setActiveView);

  const allWorkflows = [
    ...savedWorkflows.map(wf => ({ ...wf, source: 'saved' as const })),
    ...DEMO_WORKFLOWS.map(wf => ({ ...wf, source: 'demo' as const })),
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50/50">
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-orange-100 text-orange-600"><Server size={22} /></div>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">Workflow Repository</h1>
            <p className="text-sm text-[var(--text-tertiary)]">All saved and demo workflows in one place</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <span className="text-xs font-semibold text-gray-500 uppercase">Your Workflows</span>
            <p className="text-3xl font-bold text-blue-600 mt-2">{savedWorkflows.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <span className="text-xs font-semibold text-gray-500 uppercase">Demo Templates</span>
            <p className="text-3xl font-bold text-violet-600 mt-2">{DEMO_WORKFLOWS.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <span className="text-xs font-semibold text-gray-500 uppercase">Total</span>
            <p className="text-3xl font-bold text-[var(--text-primary)] mt-2">{allWorkflows.length}</p>
          </div>
        </div>

        {allWorkflows.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
            <p className="text-sm text-gray-400 mb-2">No workflows yet</p>
            <button onClick={() => setActiveView('dashboard')} className="text-xs text-[var(--color-brand-600)] hover:underline font-medium">Go to Dashboard to create one →</button>
          </div>
        ) : (
          <div className="space-y-3">
            {allWorkflows.map(wf => (
              <div key={wf.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-8 rounded-full ${wf.source === 'demo' ? 'bg-violet-400' : 'bg-blue-400'}`} />
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{wf.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-gray-400 capitalize">{wf.type}</span>
                        <span className="text-[10px] text-gray-300">•</span>
                        <span className="text-[10px] text-gray-400">{wf.nodes.length} nodes, {wf.edges.length} edges</span>
                        <span className="text-[10px] text-gray-300">•</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${wf.source === 'demo' ? 'bg-violet-50 text-violet-600' : 'bg-blue-50 text-blue-600'}`}>{wf.source === 'demo' ? 'Template' : 'Saved'}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      if (wf.source === 'saved') {
                        useCanvasStore.getState().loadWorkflow(wf.id);
                      } else {
                        useCanvasStore.setState({
                          nodes: JSON.parse(JSON.stringify(wf.nodes)),
                          edges: JSON.parse(JSON.stringify(wf.edges)),
                          currentWorkflowId: null,
                          history: [], historyIndex: -1, selectedNodeId: null, validationErrors: []
                        });
                      }
                      setActiveView('dashboard');
                    }}
                    className="text-xs text-[var(--color-brand-600)] hover:text-[var(--color-brand-700)] font-medium flex items-center gap-1"
                  >
                    Open <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
