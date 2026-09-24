import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Cpu, 
  Activity, 
  Lock, 
  Clock, 
  Award,
  ArrowRight
} from 'lucide-react';

export const AgentDetailModal: React.FC = () => {
  const { selectedAgent, setSelectedAgent } = useApp();

  if (!selectedAgent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setSelectedAgent(null)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Agent Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 font-mono text-base font-bold">
            L{selectedAgent.level}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">
                {selectedAgent.name}
              </h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                selectedAgent.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' :
                selectedAgent.status === 'BUSY' ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/30' :
                'bg-slate-800 text-slate-400'
              }`}>
                {selectedAgent.status}
              </span>
            </div>
            <p className="text-xs text-slate-400">{selectedAgent.title} · {selectedAgent.department}</p>
          </div>
        </div>

        {/* Current Mandate */}
        <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl mb-6">
          <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-1">
            Current Active Mandate
          </div>
          <div className="text-xs text-slate-200 font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
            <span>{selectedAgent.currentTask || 'Idle in standby loop'}</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
            <div className="text-[10px] text-slate-500 font-mono">Success Rate</div>
            <div className="text-lg font-bold text-white font-mono">{selectedAgent.successRate}%</div>
            <div className="text-[10px] text-slate-500">{selectedAgent.tasksCompleted} succeeded</div>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
            <div className="text-[10px] text-slate-500 font-mono">Decisions Made</div>
            <div className="text-lg font-bold text-white font-mono">{selectedAgent.decisionsMade}</div>
            <div className="text-[10px] text-slate-500">Autonomous evaluations</div>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
            <div className="text-[10px] text-slate-500 font-mono">Token Quota</div>
            <div className="text-lg font-bold text-cyan-400 font-mono">{selectedAgent.resourceUsage.tokensPerHour}</div>
            <div className="text-[10px] text-slate-500">tokens / hour</div>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
            <div className="text-[10px] text-slate-500 font-mono">Latency / Call</div>
            <div className="text-lg font-bold text-white font-mono">{selectedAgent.resourceUsage.computeMs}ms</div>
            <div className="text-[10px] text-slate-500">Median runtime</div>
          </div>
        </div>

        {/* Strict Capability-Based Permissions Matrix */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold text-slate-200 tracking-wider font-mono flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              CAPABILITY PERMISSION BOUNDARIES
            </h4>
            <span className="text-[11px] text-slate-500 font-mono">Strict Policy-Controlled</span>
          </div>

          <div className="border border-slate-800 rounded-xl divide-y divide-slate-800/80 overflow-hidden bg-slate-950/40">
            {selectedAgent.permissions.map(perm => (
              <div key={perm.id} className="p-3 flex items-start justify-between gap-4 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-semibold text-slate-200">{perm.name}</span>
                    <span className="text-[10px] text-slate-500 font-sans">[{perm.scope}]</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{perm.description}</p>
                </div>
                <div>
                  {perm.allowed ? (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-500/20 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3" />
                      ALLOWED
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-rose-400 bg-rose-950/50 border border-rose-500/20 px-2 py-0.5 rounded">
                      <XCircle className="w-3 h-3" />
                      DENIED
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Guarantee */}
        <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl text-xs text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>This agent cannot escalate its permissions or obtain raw private keys.</span>
          </div>
          <button
            onClick={() => setSelectedAgent(null)}
            className="text-cyan-400 hover:text-cyan-300 font-mono font-medium ml-4 shrink-0"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
