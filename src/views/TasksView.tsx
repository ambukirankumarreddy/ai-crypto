import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TaskRecord } from '../types';
import { 
  ListTodo, 
  Cpu, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Activity, 
  Layers, 
  ExternalLink,
  ChevronRight,
  Terminal,
  AlertTriangle
} from 'lucide-react';

export const TasksView: React.FC = () => {
  const { tasks, aiRunning, policy } = useApp();
  const [selectedTask, setSelectedTask] = useState<TaskRecord>(tasks[0] || null);

  const workflowSteps = [
    { key: 'DISCOVERY', label: '1. Opportunity' },
    { key: 'ELIGIBILITY', label: '2. Eligibility Check' },
    { key: 'SECURITY', label: '3. Security Check' },
    { key: 'PROFIT', label: '4. Profitability' },
    { key: 'POLICY', label: '5. Policy Gate' },
    { key: 'TASK_CREATE', label: '6. Task Creation' },
    { key: 'SANDBOX', label: '7. Worker Assignment' },
    { key: 'SIMULATE', label: '8. EVM Simulation' },
    { key: 'EXECUTE', label: '9. Sandboxed Execution' },
    { key: 'VERIFY', label: '10. Reward Verification' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Task Orchestrator & Sandboxed Workers</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Isolated worker containers executing approved opportunities under strict domain firewalls and transaction limits.
        </p>
      </div>

      {/* Visual Workflow Pipeline Banner */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
        <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
          AUTONOMOUS VERIFICATION & EXECUTION PIPELINE
        </div>
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
          {workflowSteps.map((step, idx) => (
            <React.Fragment key={step.key}>
              <div className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[11px] font-mono text-slate-300 whitespace-nowrap flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>{step.label}</span>
              </div>
              {idx < workflowSteps.length - 1 && (
                <span className="text-slate-600 text-xs shrink-0">→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Split: Task List & Sandbox Telemetry Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Task List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>TASK QUEUE ({tasks.length})</span>
            <span>Max Parallel: {policy.maxSimultaneousTasks}</span>
          </div>

          <div className="space-y-2.5">
            {tasks.map(task => {
              const isSelected = selectedTask?.id === task.id;
              const isExecuting = task.status === 'EXECUTING';
              const isSuccess = task.status === 'SUCCESS';
              const isQueued = task.status === 'QUEUED';

              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500/50 shadow-md shadow-cyan-500/5'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500">{task.id} · {task.chain}</span>
                      <h4 className="text-xs font-bold text-white leading-snug line-clamp-2">
                        {task.opportunityTitle}
                      </h4>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded shrink-0 ${
                      isExecuting ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/30' :
                      isSuccess ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {task.status}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>{task.assignedWorkerName}</span>
                      <span className="text-emerald-400 font-bold">{task.progressPercent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300"
                        style={{ width: `${task.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-2 mt-2 border-t border-slate-800/60">
                    <span>Started: {task.startedAt}</span>
                    <span>Gas: ${task.gasSpentUSD.toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Task Sandbox Inspector (7 cols) */}
        <div className="lg:col-span-7">
          {selectedTask ? (
            <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase">
                    WORKER SANDBOX PROFILE · {selectedTask.id}
                  </span>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {selectedTask.opportunityTitle}
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Assigned: <span className="text-slate-200 font-mono">{selectedTask.assignedWorkerName}</span>
                  </div>
                </div>

                <div className="text-right font-mono text-xs">
                  <div className="text-[10px] text-slate-500">SIMULATION RESULT</div>
                  <div className="text-emerald-400 font-bold flex items-center gap-1 justify-end">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>PASSED (0 REVERTS)</span>
                  </div>
                </div>
              </div>

              {/* Sandbox Boundary Specs */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="text-xs font-semibold text-slate-200 font-mono flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>CONTAINER ISOLATION CONSTRAINTS</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-2.5 bg-slate-900/80 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Max Tx Budget:</span>
                    <span className="text-slate-200 font-bold">${selectedTask.sandbox.maxTxBudgetUSD.toFixed(2)}</span>
                  </div>
                  <div className="p-2.5 bg-slate-900/80 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Execution Timeout:</span>
                    <span className="text-slate-200 font-bold">{selectedTask.sandbox.timeLimitSeconds}s</span>
                  </div>
                  <div className="p-2.5 bg-slate-900/80 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Sandbox Status:</span>
                    <span className="text-emerald-400 font-bold">{selectedTask.sandbox.status}</span>
                  </div>
                </div>

                {/* Allowed Domains */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-mono uppercase">Firewall Domain Allowlist</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTask.sandbox.allowedDomains.map(d => (
                      <span key={d} className="px-2 py-0.5 bg-slate-900 text-cyan-400 text-[11px] font-mono rounded border border-slate-800">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Permitted Actions */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-mono uppercase">Permitted Capability Scopes</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTask.sandbox.allowedActions.map(a => (
                      <span key={a} className="px-2 py-0.5 bg-slate-900 text-slate-300 text-[11px] font-mono rounded border border-slate-800">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Real-Time Step Log Terminal */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    SANDBOX STEP LOGS
                  </span>
                  <span className="text-[10px] text-slate-500">Auto-synced</span>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5 font-mono text-[11px] max-h-56 overflow-y-auto">
                  {selectedTask.logSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-slate-600 shrink-0">{step.timestamp}</span>
                      <span className={`shrink-0 ${
                        step.level === 'SUCCESS' ? 'text-emerald-400 font-bold' :
                        step.level === 'WARN' ? 'text-amber-400 font-bold' :
                        step.level === 'ERROR' ? 'text-rose-400 font-bold' :
                        'text-cyan-400'
                      }`}>
                        [{step.level}]
                      </span>
                      <span className="text-slate-300 break-words">{step.message}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* On-chain confirmation if available */}
              {selectedTask.txHash && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">On-Chain Transaction:</span>
                  <span className="text-cyan-400 truncate max-w-xs">{selectedTask.txHash}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs bg-slate-900/30 rounded-2xl border border-slate-800">
              Select a task to inspect sandboxed execution
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
