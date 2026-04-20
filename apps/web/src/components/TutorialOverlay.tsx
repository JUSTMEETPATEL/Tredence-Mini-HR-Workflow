"use client";

/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useCallback, useRef } from "react";
import { X, MousePointer2 } from "lucide-react";
import { useCanvasStore } from "@/stores/canvasStore";

function getInitialStep(): number {
  if (typeof window === 'undefined') return 0;
  const completed = localStorage.getItem("tredence_tutorial_completed");
  return completed ? 0 : 1;
}

export function TutorialOverlay() {
  const [step, setStepInner] = useState(getInitialStep); // 0=off, 1...9
  const [demoPlaying, setDemoPlaying] = useState(false);
  
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const selectedNodeId = useCanvasStore((s) => s.selectedNodeId);

  const completeTutorial = useCallback(() => {
    setStepInner(() => 0);
    setDemoPlaying(false);
    localStorage.setItem("tredence_tutorial_completed", "true");
  }, []);

  const setStep = useCallback((newStep: number | ((prev: number) => number)) => {
    setDemoPlaying(false);
    setStepInner(newStep);
  }, []);

  useEffect(() => {
    if (step === 0) return;
    
    if (step === 1 || step === 1.5) {
      if (step === 1.5) {
        let accumulatedDelta = 0;
        const handleWheel = (event: WheelEvent) => {
          accumulatedDelta += Math.abs(event.deltaX) + Math.abs(event.deltaY);
          if (accumulatedDelta > 30) {
            setStep(2);
          }
        };

        window.addEventListener('wheel', handleWheel, { passive: true, capture: true });
        return () => window.removeEventListener('wheel', handleWheel, { capture: true });
      }
    } else if (step === 2 || step === 2.5) {
      if (nodes.some((n) => n.type === "start")) {
        setStep(3);
      }
    } else if (step === 3 || step === 3.5) {
      if (nodes.some((n) => n.type === "task")) {
        setStep(4);
      }
    } else if (step === 4 || step === 4.5) {
      if (edges.length > 0) {
        setStep(5);
      }
    } else if (step === 5 || step === 5.5) {
      const tNode = nodes.find(n => n.type === "task");
      if (selectedNodeId && selectedNodeId === tNode?.id) {
        setStep(6);
      }
    } else if (step === 6 || step === 6.5) {
      const tNode = nodes.find(n => n.type === "task");
      if (tNode?.data?.title && tNode.data.title !== "Task" && String(tNode.data.title).length > 0) {
        setStep(7);
      } else if (step === 6.5) {
        const handleFocus = () => setDemoPlaying(false);
        const input = document.querySelector('[data-tutorial="tutorial-task-title"]');
        if (input) {
          input.addEventListener("focus", handleFocus);
          input.addEventListener("click", handleFocus);
          return () => {
             input.removeEventListener("focus", handleFocus);
             input.removeEventListener("click", handleFocus);
          };
        }
      }
    } else if (step === 7 || step === 7.5) {
      if (nodes.some((n) => n.type === "end")) {
        setStep(8);
      }
    } else if (step === 8 || step === 8.5) {
      const tNode = nodes.find(n => n.type === "task");
      const eNode = nodes.find(n => n.type === "end");
      if (tNode && eNode && edges.some(e => e.source === tNode.id && e.target === eNode.id)) {
        setStep(9);
      }
    } else if (step === 9) {
      const handleSimulateClick = () => completeTutorial();
      const btn = document.querySelector('[data-tutorial="tutorial-simulate-btn"]');
      if (btn) btn.addEventListener("click", handleSimulateClick);
      return () => {
        if (btn) btn.removeEventListener("click", handleSimulateClick);
      };
    }
  }, [step, nodes, edges, selectedNodeId, setStep, completeTutorial]);

  const handleNext = () => {
    setDemoPlaying(true);
    setStepInner(Math.floor(step) + 0.5);
  };

  if (step === 0) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
      <TutorialDialog step={step} demoPlaying={demoPlaying} onNext={handleNext} onSkip={completeTutorial} />
      {demoPlaying && <DemoCursor step={step} />}
    </div>
  );
}

function TutorialDialog({ step, demoPlaying, onNext, onSkip }: { step: number, demoPlaying: boolean, onNext: () => void, onSkip: () => void }) {
  const [pos, setPos] = useState({ top: 0, left: 0, show: false, align: "right" });
  
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    let targetSelector = "";
    let align = "right";
    
    if (step === 1 || step === 1.5) {
      setPos({ top: window.innerHeight/2 - 100, left: window.innerWidth/2 - 150, show: true, align: "center" });
      return;
    } else if (step === 2 || step === 2.5) {
      targetSelector = '[data-tutorial="tutorial-start-node"]';
      align = "right";
    } else if (step === 3 || step === 3.5) {
      targetSelector = '[data-tutorial="tutorial-task-node"]';
      align = "right";
    } else if (step === 4 || step === 4.5) {
      setPos({ top: window.innerHeight/2 - 100, left: window.innerWidth/2 - 150, show: true, align: "center" });
      return;
    } else if (step === 5 || step === 5.5) {
      targetSelector = '.react-flow__node-task';
      align = "right";
    } else if (step === 6 || step === 6.5) {
      targetSelector = '[data-tutorial="tutorial-task-title"]';
      align = "left";
    } else if (step === 7 || step === 7.5) {
      targetSelector = '[data-tutorial="tutorial-end-node"]';
      align = "right";
    } else if (step === 8 || step === 8.5) {
      setPos({ top: window.innerHeight/2 - 100, left: window.innerWidth/2 - 150, show: true, align: "center" });
      return;
    } else if (step === 9) {
      targetSelector = '[data-tutorial="tutorial-simulate-btn"]';
      align = "bottom";
    }

    if (!targetSelector) return;

    const constrain = (t: number, l: number) => {
      const ew = 320, eh = 200; // estimated
      return {
        top: Math.max(10, Math.min(t, window.innerHeight - eh - 10)),
        left: Math.max(10, Math.min(l, window.innerWidth - ew - 10))
      };
    };

    const findTarget = () => {
      const el = document.querySelector(targetSelector);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (align === "right") {
          setPos({ show: true, align, ...constrain(rect.top - 10, rect.right + 20) });
        } else if (align === "bottom") {
          setPos({ show: true, align, ...constrain(rect.bottom + 20, rect.left - 200) });
        } else if (align === "left") {
          setPos({ show: true, align, ...constrain(rect.top - 10, rect.left - 340) });
        }
      }
    };
    
    findTarget();
    const iv = setInterval(findTarget, 500);
    return () => clearInterval(iv);
  }, [step]);

  if (!pos.show || demoPlaying) return null;

  let title = "", text = "";
  
  if (Math.floor(step) === 1) {
    title = "Step 1: Move Around"; text = "Use two fingers on your trackpad to pan across the canvas. Click and drag is reserved for selecting multiple nodes.";
  } else if (Math.floor(step) === 2) {
    title = "Step 2: Start Node"; text = "Drag the Start Node onto the canvas. It represents the beginning of the workflow.";
  } else if (Math.floor(step) === 3) {
    title = "Step 3: Task Node"; text = "Now, drag a Task Node onto the canvas. Tasks represent actions or processes in your HR workflow.";
  } else if (Math.floor(step) === 4) {
    title = "Step 4: Connect Nodes"; text = "Drag from the bottom point of the Start Node to the top point of the Task Node to connect them.";
  } else if (Math.floor(step) === 5) {
    title = "Step 5: Configure Task"; text = "Click the Task Node on the canvas to open its configuration panel.";
  } else if (Math.floor(step) === 6) {
    title = "Step 6: Define Task"; text = "In the right panel, change the Title and save to configure what this task does.";
  } else if (Math.floor(step) === 7) {
    title = "Step 7: End Node"; text = "Drag an End Node from the sidebar onto the canvas to complete your flow.";
  } else if (Math.floor(step) === 8) {
    title = "Step 8: Connect End"; text = "Connect the bottom of the Task Node to the top of the End Node.";
  } else if (step === 9) {
    title = "You're Done!"; text = "Click the Simulate button on the top bar to run a mock execution of your automated flow!";
  }

  return (
    <div 
      className="absolute bg-white shadow-2xl border border-[var(--border-default)] p-5 rounded-xl w-[320px] pointer-events-auto transition-all duration-300"
      style={{ top: pos.top, left: pos.left }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-[var(--color-brand-500)] text-sm">{title}</h3>
        <button onClick={onSkip} className="text-gray-400 hover:text-gray-600" title="Skip Tutorial"><X size={16} /></button>
      </div>
      <p className="text-sm text-[var(--text-secondary)] mb-4">{text}</p>
      {step !== 9 ? (
        <div className="flex justify-end gap-2">
          <button onClick={onSkip} className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700">Skip</button>
          <button onClick={onNext} className="px-3 py-1.5 text-xs bg-[var(--color-brand-500)] text-white rounded-md hover:bg-[var(--color-brand-600)] transition-colors shadow-sm cursor-pointer">Next</button>
        </div>
      ) : (
        <div className="flex justify-end gap-2">
          <button onClick={onSkip} className="px-3 py-1.5 text-xs bg-[var(--color-brand-500)] text-white rounded-md hover:bg-[var(--color-brand-600)] transition-colors shadow-sm cursor-pointer">Got it</button>
        </div>
      )}
    </div>
  );
}

function DemoCursor({ step }: { step: number }) {
  const cursorRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    let animationFrame: number;
    let startTimestamp: number | null = null;
    const DURATION = 2500;

    const getElCenter = (sel: string) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    };
    
    const getCanvasCenter = () => {
      const canvas = document.querySelector('.react-flow');
      if (!canvas) return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      const r = canvas.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    };

    const runLoop = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = (timestamp - startTimestamp) % DURATION;
      const progress = elapsed / DURATION;
      
      let startP = { x: 0, y: 0 };
      let endP = { x: 0, y: 0 };
      let clicking = false;

      if (step === 1.5) {
        const center = getCanvasCenter();
        startP = { x: center.x + 120, y: center.y + 70 };
        endP = { x: center.x - 120, y: center.y - 70 };
      } else if (step === 2.5) {
        startP = getElCenter('[data-tutorial="tutorial-start-node"]') || { x: 50, y: 300 };
        endP = getCanvasCenter();
        clicking = progress > 0.1 && progress < 0.8;
      } else if (step === 3.5) {
        startP = getElCenter('[data-tutorial="tutorial-task-node"]') || { x: 50, y: 350 };
        endP = getCanvasCenter();
        clicking = progress > 0.1 && progress < 0.8;
      } else if (step === 4.5) {
        const snDom = document.querySelector('.react-flow__node-start') || Array.from(document.querySelectorAll('.react-flow__node')).find(n => n.textContent?.includes('Start'));
        const tnDom = document.querySelector('.react-flow__node-task') || Array.from(document.querySelectorAll('.react-flow__node')).find(n => n.textContent?.includes('Task'));
        const snHandle = snDom?.querySelector('.react-flow__handle-bottom') || snDom;
        const tnHandle = tnDom?.querySelector('.react-flow__handle-top') || tnDom;
        if (snHandle && tnHandle) {
          const r1 = snHandle.getBoundingClientRect();
          const r2 = tnHandle.getBoundingClientRect();
          startP = { x: r1.left + r1.width/2, y: r1.top + r1.height/2 };
          endP = { x: r2.left + r2.width/2, y: r2.top + r2.height/2 };
        } else {
          startP = { x: window.innerWidth/2 - 50, y: window.innerHeight/2 - 100 };
          endP = { x: window.innerWidth/2 + 50, y: window.innerHeight/2 + 100 };
        }
        clicking = progress > 0.2 && progress < 0.8;
      } else if (step === 5.5) {
        startP = { x: window.innerWidth/2, y: window.innerHeight/2 - 200 };
        endP = getElCenter('.react-flow__node-task') || getCanvasCenter();
        clicking = progress > 0.5 && progress < 0.7;
      } else if (step === 6.5) {
        startP = { x: window.innerWidth/2, y: window.innerHeight/2 };
        endP = getElCenter('[data-tutorial="tutorial-task-title"]') || { x: window.innerWidth - 100, y: 200 };
        clicking = progress > 0.5 && progress < 0.7;
      } else if (step === 7.5) {
        startP = getElCenter('[data-tutorial="tutorial-end-node"]') || { x: 50, y: 400 };
        endP = getCanvasCenter();
        endP.y += 100;
        clicking = progress > 0.1 && progress < 0.8;
      } else if (step === 8.5) {
        const tnDom = document.querySelector('.react-flow__node-task') || Array.from(document.querySelectorAll('.react-flow__node')).find(n => n.textContent?.includes('Task'));
        const enDom = document.querySelector('.react-flow__node-end') || Array.from(document.querySelectorAll('.react-flow__node')).find(n => n.textContent?.includes('End'));
        const tnHandle = tnDom?.querySelector('.react-flow__handle-bottom') || tnDom;
        const enHandle = enDom?.querySelector('.react-flow__handle-top') || enDom;
        if (tnHandle && enHandle) {
          const r1 = tnHandle.getBoundingClientRect();
          const r2 = enHandle.getBoundingClientRect();
          startP = { x: r1.left + r1.width/2, y: r1.top + r1.height/2 };
          endP = { x: r2.left + r2.width/2, y: r2.top + r2.height/2 };
        } else {
          startP = { x: window.innerWidth/2, y: window.innerHeight/2 };
          endP = { x: window.innerWidth/2, y: window.innerHeight/2 + 150 };
        }
        clicking = progress > 0.2 && progress < 0.8;
      }

      const ease = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      let animProgress = 0;
      if (progress < 0.2) animProgress = 0;
      else if (progress > 0.8) animProgress = 1;
      else animProgress = ease((progress - 0.2) / 0.6);

      const x = startP.x + (endP.x - startP.x) * animProgress;
      const y = startP.y + (endP.y - startP.y) * animProgress;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${x}px, ${y}px) scale(${clicking ? 0.9 : 1})`;
        const ghost = cursorRef.current.querySelector('.ghost-box') as HTMLElement;
        if (ghost) {
           ghost.style.opacity = (step === 1.5 || (clicking && [2.5, 3.5, 7.5].includes(step))) ? '0.7' : '0';
        }
      }

      animationFrame = requestAnimationFrame(runLoop);
    };

    animationFrame = requestAnimationFrame(runLoop);
    return () => cancelAnimationFrame(animationFrame);
  }, [step]);

  return (
    <div ref={cursorRef} data-testid="tutorial-demo-cursor" className="fixed top-0 left-0 z-[100] pointer-events-none will-change-transform" style={{ transform: 'translate(-1000px, -1000px)' }}>
      <div className="relative">
        <MousePointer2 className="text-black drop-shadow-md relative z-10 fill-white" size={32} />
        {[1.5, 2.5, 3.5, 7.5].includes(step) && (
          <div className="ghost-box absolute top-6 left-6 opacity-0 transition-opacity duration-150">
            <div className={`p-2 border-l-4 ${step === 1.5 ? 'border-[var(--color-brand-500)]' : step === 2.5 ? 'border-[var(--node-start)]' : step === 3.5 ? 'border-[var(--node-task)]' : 'border-[var(--node-end)]'} rounded-md shadow-lg bg-white/90 text-xs font-medium text-black`}>
              {step === 1.5 ? 'Two-finger pan' : step === 2.5 ? 'Start Node' : step === 3.5 ? 'Task Node' : 'End Node'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
