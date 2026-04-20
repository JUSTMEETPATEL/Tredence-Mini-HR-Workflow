"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, X, Loader2, CheckCircle2, ChevronRight, Wand2, MessageSquare, ArrowRight } from "lucide-react";
import { useCanvasStore } from "@/stores/canvasStore";
import { useViewStore } from "@/stores/viewStore";

/* ── Types ──────────────────────────────────────── */
import type { Node, Edge } from '@xyflow/react';

interface AiOption {
  label: string;
  value: string;
  allowCustom?: boolean;
}

interface AiQuestion {
  id: string;
  text: string;
  options: AiOption[];
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  // Structured data attached to assistant messages
  questions?: AiQuestion[];
  workflow?: {
    name: string;
    nodes: Node[];
    edges: Edge[];
  };
}

/* ── Main Component ─────────────────────────────── */
export function AiWorkflowBuilder() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating AI Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-[60] flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-orange-600 to-pink-600 text-white text-sm font-semibold shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:scale-105 transition-all duration-200 cursor-pointer group"
        title="AI Workflow Builder"
      >
        <Sparkles size={18} className="group-hover:animate-pulse" />
        AI Builder
      </button>

      {/* Modal */}
      {open && <AiBuilderModal onClose={() => setOpen(false)} />}
    </>
  );
}

/* ── Modal ──────────────────────────────────────── */
function AiBuilderModal({ onClose }: { onClose: () => void }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatedWorkflow, setGeneratedWorkflow] = useState<{ name: string; nodes: Node[]; edges: Edge[] } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const setActiveView = useViewStore(s => s.setActiveView);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async (userText: string) => {
    if (!userText.trim() || loading) return;

    const userMsg: ChatMessage = { role: "user", content: userText };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      // Build the API payload (just role + content, no extra fields)
      const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/ai-workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await res.json();

      if (data.error) {
        setMessages([...newMessages, { role: "assistant", content: `Error: ${data.error}` }]);
      } else if (data.type === "questions") {
        setMessages([...newMessages, {
          role: "assistant",
          content: data.message || "I need a few more details:",
          questions: data.questions,
        }]);
      } else if (data.type === "workflow") {
        setGeneratedWorkflow(data.workflow);
        setMessages([...newMessages, {
          role: "assistant",
          content: data.message || "Here's your generated workflow!",
          workflow: data.workflow,
        }]);
      } else {
        // Plain message fallback
        setMessages([...newMessages, {
          role: "assistant",
          content: data.message || JSON.stringify(data),
        }]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setMessages([...newMessages, { role: "assistant", content: `Network error: ${msg}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchAnswers = (answers: Record<string, string>) => {
    const formattedAnswers = Object.entries(answers)
      .map(([question, answer]) => `- ${question}: ${answer}`)
      .join('\n');
    sendMessage(`Here are my answers:\n${formattedAnswers}`);
  };

  const handleApplyWorkflow = () => {
    if (!generatedWorkflow) return;
    useCanvasStore.setState({
      nodes: generatedWorkflow.nodes,
      edges: generatedWorkflow.edges,
      currentWorkflowId: null,
      history: [],
      historyIndex: -1,
      selectedNodeId: null,
      selectedNodeIds: [],
      validationErrors: [],
      isDirty: true,
      lastSavedAt: null,
    });
    setActiveView("dashboard");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="panel-card w-full max-w-[600px] h-[85vh] max-h-[700px] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-default)] bg-[linear-gradient(135deg,var(--surface-secondary),var(--surface-primary))]">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">AI Workflow Builder</h2>
              <p className="text-[11px] text-[var(--text-secondary)]">Describe your workflow and I will build it with tasks, approvals, decisions, and automations.</p>
            </div>
          </div>
          <button onClick={onClose} className="interactive-subtle p-1.5 rounded-lg transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-[var(--surface-primary)]">
          {/* Welcome state */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">What workflow would you like to build?</h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm mb-6">Describe your HR process in plain English. I can now add decision nodes for policy checks and yes/no branches, then generate the complete workflow.</p>
              
              {/* Quick suggestions */}
              <div className="space-y-2 w-full max-w-sm">
                <p className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold tracking-wider">Try these:</p>
                {[
                  "Employee onboarding with IT provisioning and manager approval",
                  "Leave request workflow with auto-escalation",
                  "Performance review cycle with 360 feedback",
                  "Leave request with a decision node for balance eligibility",
                ].map(suggestion => (
                  <button
                    key={suggestion}
                    onClick={() => sendMessage(suggestion)}
                    className="w-full text-left px-4 py-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-elevated)] text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:border-[var(--color-brand-400)] hover:text-[var(--text-primary)] transition-all group flex items-center justify-between"
                  >
                    <span>{suggestion}</span>
                    <ChevronRight size={14} className="text-[var(--text-tertiary)] group-hover:text-[var(--color-brand-500)] transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat messages */}
          {messages.map((msg, idx) => (
            <div key={idx}>
              {msg.role === "user" ? (
                <UserBubble text={msg.content} />
              ) : (
                <AssistantBubble
                  msg={msg}
                  onSubmitAllAnswers={handleBatchAnswers}
                  onApply={handleApplyWorkflow}
                />
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="bg-[var(--surface-secondary)] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-orange-500" />
                <span className="text-xs text-[var(--text-secondary)]">Thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t border-[var(--border-default)] bg-[var(--surface-secondary)]">
          <form
            onSubmit={e => { e.preventDefault(); sendMessage(input); }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Describe a workflow..."
              disabled={loading}
              className="flex-1 text-sm border border-[var(--border-default)] rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 bg-[var(--surface-elevated)] text-[var(--text-primary)]"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-pink-600 text-white disabled:opacity-40 hover:shadow-md transition-all disabled:cursor-not-allowed cursor-pointer"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ── User Bubble ─────────────────────────────── */
function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-[85%] shadow-sm">
        <p className="text-sm">{text}</p>
      </div>
    </div>
  );
}

/* ── Assistant Bubble ────────────────────────── */
function AssistantBubble({
  msg,
  onSubmitAllAnswers,
  onApply,
}: {
  msg: ChatMessage;
  onSubmitAllAnswers: (answers: Record<string, string>) => void;
  onApply: () => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [customTexts, setCustomTexts] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const questions = msg.questions || [];
  const totalQuestions = questions.length;
  
  // Count how many are fully answered (selected + custom filled if needed)
  const answeredCount = questions.filter(q => {
    const sel = answers[q.id];
    if (!sel) return false;
    const opt = q.options.find(o => o.value === sel);
    if (opt?.allowCustom && !customTexts[q.id]?.trim()) return false;
    return true;
  }).length;

  const allAnswered = totalQuestions > 0 && answeredCount === totalQuestions;

  const handleSelect = (questionId: string, optionValue: string) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: optionValue }));
  };

  const handleCustomText = (questionId: string, text: string) => {
    setCustomTexts(prev => ({ ...prev, [questionId]: text }));
  };

  const handleSubmitAll = () => {
    if (!allAnswered || submitted) return;
    setSubmitted(true);

    // Build a combined answer map: questionText -> answerLabel
    const combined: Record<string, string> = {};
    questions.forEach(q => {
      const sel = answers[q.id];
      const opt = q.options.find(o => o.value === sel);
      if (opt?.allowCustom) {
        combined[q.text] = customTexts[q.id] || sel;
      } else {
        combined[q.text] = opt?.label || sel;
      }
    });
    onSubmitAllAnswers(combined);
  };

  return (
    <div className="flex items-start gap-3">
      <div className="flex-1 min-w-0 space-y-3">
        {/* Text */}
        <div className="bg-[var(--surface-secondary)] rounded-2xl rounded-tl-sm px-4 py-3 inline-block max-w-[95%]">
          <p className="text-sm text-[var(--text-primary)]">{msg.content}</p>
        </div>

        {/* MCQ Questions */}
        {questions.length > 0 && (
          <div className="space-y-3">
            {questions.map(q => (
              <McqCard
                key={q.id}
                question={q}
                selected={answers[q.id] || null}
                customText={customTexts[q.id] || ""}
                submitted={submitted}
                onSelect={(val) => handleSelect(q.id, val)}
                onCustomText={(text) => handleCustomText(q.id, text)}
              />
            ))}

            {/* Submit All Button */}
            {!submitted && (
              <div className="flex items-center justify-between pt-1">
                <p className="text-[10px] text-[var(--text-tertiary)]">
                  {answeredCount}/{totalQuestions} answered
                </p>
                <button
                  onClick={handleSubmitAll}
                  disabled={!allAnswered}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-orange-600 to-pink-600 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-md transition-all cursor-pointer"
                >
                  <Send size={13} />
                  Submit All Answers
                </button>
              </div>
            )}

            {submitted && (
              <p className="text-[10px] text-emerald-600 flex items-center gap-1 pt-1"><CheckCircle2 size={10} /> All answers submitted</p>
            )}
          </div>
        )}

        {/* Workflow preview */}
        {msg.workflow && (
          <WorkflowPreviewCard workflow={msg.workflow} onApply={onApply} />
        )}
      </div>
    </div>
  );
}

/* ── MCQ Card ────────────────────────────────── */
function McqCard({
  question,
  selected,
  customText,
  submitted,
  onSelect,
  onCustomText,
}: {
  question: AiQuestion;
  selected: string | null;
  customText: string;
  submitted: boolean;
  onSelect: (value: string) => void;
  onCustomText: (text: string) => void;
}) {
  const isCustomSelected = selected && question.options.find(o => o.value === selected)?.allowCustom;
  const isAnswered = selected && (!isCustomSelected || customText.trim());

  return (
    <div
      className={`border rounded-xl p-4 transition-all ${submitted ? 'border-emerald-200 bg-emerald-50/50' : 'border-[var(--border-default)] bg-[var(--surface-elevated)]'}`}
      style={!submitted && isAnswered ? { borderColor: 'rgba(249, 115, 22, 0.45)', backgroundColor: 'var(--surface-tint)' } : undefined}
    >
      <p className="text-xs font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
        <MessageSquare size={13} className="text-orange-500" />
        {question.text}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {question.options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            disabled={submitted}
            className={`
              text-left px-3 py-2.5 rounded-lg text-xs border transition-all
              ${selected === opt.value
                ? 'font-medium shadow-sm'
                : submitted
                  ? 'border-[var(--border-default)] bg-[var(--surface-secondary)] text-[var(--text-tertiary)] cursor-not-allowed'
                  : 'border-[var(--border-default)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] cursor-pointer'
              }
              flex items-center gap-2
            `}
            style={
              selected === opt.value
                ? {
                    borderColor: 'var(--color-brand-500)',
                    backgroundColor: 'var(--surface-secondary)',
                    color: 'var(--text-primary)',
                  }
                : !submitted
                  ? {
                      transition: 'background-color 140ms ease, border-color 140ms ease, color 140ms ease',
                    }
                  : undefined
            }
            onMouseEnter={(event) => {
              if (selected === opt.value || submitted) return;
              event.currentTarget.style.borderColor = 'rgba(249, 115, 22, 0.45)';
              event.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
              event.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(event) => {
              if (selected === opt.value || submitted) return;
              event.currentTarget.style.borderColor = 'var(--border-default)';
              event.currentTarget.style.backgroundColor = 'var(--surface-elevated)';
              event.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <span
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selected === opt.value ? '' : 'border-gray-300'}`}
              style={selected === opt.value ? { borderColor: 'var(--color-brand-500)', backgroundColor: 'var(--color-brand-500)' } : undefined}
            >
              {selected === opt.value && <CheckCircle2 size={10} className="text-white" />}
            </span>
            {opt.label}
          </button>
        ))}
      </div>

      {/* Custom text input for "Other" */}
      {isCustomSelected && !submitted && (
        <div className="mt-3">
          <input
            value={customText}
            onChange={e => onCustomText(e.target.value)}
            placeholder="Type your answer..."
            className="w-full text-xs border border-[var(--border-default)] bg-[var(--surface-elevated)] text-[var(--text-primary)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            autoFocus
          />
        </div>
      )}
    </div>
  );
}

/* ── Workflow Preview Card ───────────────────── */
function WorkflowPreviewCard({ workflow, onApply }: { workflow: { name: string; nodes: Node[]; edges: Edge[] }; onApply: () => void }) {
  const nodeTypes = workflow.nodes.reduce((acc: Record<string, number>, n: Node) => {
    const type = n.type || 'task';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const typeColors: Record<string, string> = {
    start: 'bg-blue-100 text-blue-700',
    task: 'bg-orange-100 text-orange-700',
    approval: 'bg-orange-100 text-orange-700',
    decision: 'bg-teal-100 text-teal-700',
    automated_step: 'bg-pink-100 text-pink-700',
    end: 'bg-red-100 text-red-700',
  };

  return (
    <div className="border border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-green-50/30 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-bold text-emerald-800">{workflow.name}</p>
          <p className="text-[10px] text-emerald-600 mt-0.5">{workflow.nodes.length} nodes • {workflow.edges.length} connections</p>
        </div>
        <CheckCircle2 size={18} className="text-emerald-500" />
      </div>

      {/* Node type badges */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {Object.entries(nodeTypes).map(([type, count]) => (
          <span key={type} className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${typeColors[type] || 'bg-gray-100 text-gray-600'}`}>
            {count}× {type.replace('_', ' ')}
          </span>
        ))}
      </div>

      {/* Node list preview */}
      <div className="bg-[var(--surface-elevated)] rounded-lg p-3 mb-4 max-h-36 overflow-y-auto border border-[var(--border-default)]">
        <div className="space-y-1.5">
          {workflow.nodes.map((n: Node, i: number) => {
            const type = n.type || 'task';
            return (
              <div key={n.id} className="flex items-center gap-2 text-[11px]">
                <span className="text-[var(--text-tertiary)] w-4 text-right">{i + 1}.</span>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  type === 'start' ? 'bg-blue-500' : type === 'end' ? 'bg-red-500' : type === 'task' ? 'bg-orange-500' : type === 'approval' ? 'bg-orange-500' : type === 'decision' ? 'bg-teal-500' : 'bg-pink-500'
                }`} />
                <span className="text-[var(--text-secondary)] capitalize font-medium">{type.replace('_', ' ')}</span>
                <span className="text-[var(--text-tertiary)]">—</span>
                <span className="text-[var(--text-primary)] truncate">{String(n.data?.title || 'Untitled')}</span>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={onApply}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-semibold hover:shadow-md hover:shadow-emerald-500/20 transition-all cursor-pointer"
      >
        <Wand2 size={14} />
        Apply to Canvas
        <ArrowRight size={14} />
      </button>
    </div>
  );
}
