import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AIAgent, AgentDepartment } from '../types';
import { 
  Users2, 
  ShieldCheck, 
  Lock, 
  ChevronRight, 
  Sparkles, 
  Cpu, 
  CheckCircle2, 
  XCircle, 
  Sliders, 
  Activity,
  Layers,
  Scale
} from 'lucide-react';

export const AIOrganizationView: React.FC = () => {
  const { agents, setSelectedAgent, aiRunning, policy } = useApp();
  const [selectedDept, setSelectedDept] = useState<string>('ALL');

  // Group agents by level
  const governor = agents.find(a => a.level === 1);
  const directors = agents.filter(a => a.level === 2);
  const specialists = agents.filter(a => a.level >= 3);

  const filteredSpecialists = specialists.filter(a => {
    if (selectedDept !== 'ALL' && a.department !== selectedDept) return false;
    return true;
  });

  const departments: { key: string; label: string }[] = [
    { key: 'ALL', label: 'All Specialists' },
    { key: 'COMPLIANCE', label: 'Compliance & Legal' },
    { key: 'RESEARCH', label: 'Research & Scouting' },
    { key: 'SECURITY', label: 'Security & Risk' },
    { key: 'FINANCE', label: 'Finance & Margins' },
    { key: 'OPERATIONS', label: 'Operations & Workers' },
    { key: 'ENGINEERING', label: 'Website Self-AI' },
  ];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users2 className="w-5 h-5 text-cyan-400" />
            AI Organization & Regulatory Hierarchy
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Specialized capability-bounded autonomous multi-agent system. Sections 30-48 Non-Override Compliance Architecture.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] bg-purple-950/60 border border-purple-500/40 px-3 py-1.5 rounded-xl text-purple-300">
          <Scale className="w-3.5 h-3.5 text-purple-400" />
          <span>Independent Compliance Director Active</span>
        </div>
      </div>

      {/* SECTION 31: REGULATORY & COMPLIANCE GATE MAP */}
      <div className="p-4 bg-slate-900/60 border border-purple-500/30 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-mono text-purple-400 uppercase tracking-wider flex items-center gap-1.5 font-bold">
            <Scale className="w-3.5 h-3.5" />
            SECTION 31 · REGULATORY HIERARCHY & PRE-FLIGHT COMPLIANCE GATE
          </div>
          <span className="text-[10px] font-mono text-slate-400">Strict Non-Overridable Veto Pipeline</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-center text-[11px] font-mono">
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-500">ROOT AUTHORITY</div>
            <div className="text-xs font-bold text-white">Human Owner</div>
            <div className="text-[9px] text-slate-400">Section 48 Constitution</div>
          </div>

          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <div className="text-[10px] text-cyan-400">ORCHESTRATOR</div>
            <div className="text-xs font-bold text-cyan-300">AI Governor</div>
            <div className="text-[9px] text-slate-400">Telemetry & Balance</div>
          </div>

          <div className="p-2.5 bg-purple-950/60 rounded-xl border border-purple-500/50 space-y-1 ring-1 ring-purple-500/20">
            <div className="text-[10px] text-purple-300">INDEPENDENT VETO</div>
            <div className="text-xs font-bold text-white">Compliance Director</div>
            <div className="text-[9px] text-purple-200">Elena Rostova</div>
          </div>

          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <div className="text-[10px] text-amber-400">GATE FILTERS</div>
            <div className="text-xs font-bold text-amber-300">9 Compliance Gates</div>
            <div className="text-[9px] text-slate-400">AML · OFAC · ToS · Tax</div>
          </div>

          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <div className="text-[10px] text-emerald-400">EXECUTION QUEUE</div>
            <div className="text-xs font-bold text-emerald-300">Task Engine</div>
            <div className="text-[9px] text-slate-400">Cleared Sandbox Only</div>
          </div>
        </div>
      </div>

      {/* LEVEL 0: HUMAN OWNER */}
      <div className="relative">
        <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          LEVEL 0 · SUPREME HUMAN AUTHORITY
        </div>

        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-500/40 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg shadow-cyan-500/5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Human Owner (You)</span>
              <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded">
                ULTIMATE CONTROL
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Maintains non-custodial wallet ownership, sets hard transaction & daily spending limits,
              approves production deployments, authorizes high-risk tasks, and holds instant Global Emergency Stop authority.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 shrink-0">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Root Policy Enforcer</span>
          </div>
        </div>
      </div>

      {/* LEVEL 1: AI GOVERNOR */}
      {governor && (
        <div className="relative">
          <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            LEVEL 1 · CHIEF ORCHESTRATOR
          </div>

          <div 
            onClick={() => setSelectedAgent(governor)}
            className="p-5 bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 rounded-2xl cursor-pointer transition-all space-y-3 group"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {governor.name}
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                    {governor.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{governor.title}</p>
              </div>

              <div className="text-right font-mono text-xs">
                <span className="text-white font-bold">{governor.successRate}%</span>
                <span className="text-slate-500 text-[10px]"> success ({governor.tasksCompleted} tasks)</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <span className="text-slate-500 font-mono text-[10px] uppercase block mb-1">Active Mandate:</span>
              {governor.currentTask}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-slate-400 font-mono border-t border-slate-800/60">
              <span>{governor.permissions.filter(p => p.allowed).length} Allowed Capabilities</span>
              <span>·</span>
              <span className="text-rose-400">Zero Private Key Access</span>
              <span>·</span>
              <span>{governor.decisionsMade} Orchestrated Decisions</span>
              <span className="ml-auto text-cyan-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Inspect Governance Capabilities <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* LEVEL 2: DIRECTORS */}
      <div>
        <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          LEVEL 2 · DEPARTMENTAL DIRECTORS
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {directors.map(dir => (
            <div
              key={dir.id}
              onClick={() => setSelectedAgent(dir)}
              className="p-4 bg-slate-900/40 border border-slate-800 hover:border-slate-700 rounded-xl cursor-pointer transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-cyan-400">{dir.department}</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">
                    {dir.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                  {dir.name}
                </h3>
                <p className="text-xs text-slate-400">{dir.title}</p>
              </div>

              <div className="text-[11px] text-slate-300 font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed truncate">
                {dir.currentTask}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-800/60">
                <span>Success: {dir.successRate}%</span>
                <span className="text-cyan-400 flex items-center gap-0.5">
                  Inspect <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LEVEL 3: SPECIALIZED AGENTS & WORKERS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <Users2 className="w-3.5 h-3.5 text-cyan-400" />
            LEVEL 3 · SPECIALIZED AGENTS & ISOLATED WORKERS ({specialists.length})
          </div>

          <div className="flex items-center gap-1 overflow-x-auto text-xs w-full sm:w-auto">
            {departments.map(dept => (
              <button
                key={dept.key}
                onClick={() => setSelectedDept(dept.key)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors whitespace-nowrap cursor-pointer ${
                  selectedDept === dept.key
                    ? 'bg-slate-800 text-cyan-400 font-semibold border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {dept.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSpecialists.map(agent => (
            <div
              key={agent.id}
              onClick={() => setSelectedAgent(agent)}
              className="p-4 bg-slate-900/30 border border-slate-800/80 hover:border-cyan-500/30 rounded-xl cursor-pointer transition-all space-y-2.5 group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {agent.name}
                  </h4>
                  <div className="text-[11px] text-slate-400">{agent.title}</div>
                </div>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  agent.status === 'BUSY' ? 'text-cyan-400 bg-cyan-950 border border-cyan-500/30' :
                  agent.status === 'ACTIVE' ? 'text-emerald-400 bg-emerald-950 border border-emerald-500/30' :
                  'text-slate-500 bg-slate-900'
                }`}>
                  {agent.status}
                </span>
              </div>

              <div className="text-[11px] text-slate-300 font-mono bg-slate-950/70 p-2 rounded border border-slate-800/60 leading-snug line-clamp-2">
                {agent.currentTask || 'Idle in queue'}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                <span>{agent.tasksCompleted} Completed</span>
                <span className="text-slate-300">{agent.resourceUsage.tokensPerHour} tokens/hr</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
