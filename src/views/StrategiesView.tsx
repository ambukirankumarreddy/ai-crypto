import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StrategyProposal } from '../types';
import { 
  BrainCircuit, 
  CheckCircle2, 
  ShieldCheck, 
  TrendingUp, 
  AlertTriangle, 
  Play, 
  Layers, 
  Clock, 
  DollarSign,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

export const StrategiesView: React.FC = () => {
  const { strategies, setSelectedApproval, approvals, setActiveView } = useApp();
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyProposal>(strategies[0] || null);

  const stages = [
    'DISCOVERY',
    'SECURITY_REVIEW',
    'PROFIT_ANALYSIS',
    'SANDBOX',
    'TEST',
    'APPROVAL',
    'LIMITED_DEPLOYMENT',
    'MONITORING'
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Strategy Engine & Optimization</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          8-stage lifecycle validation ensuring every crypto strategy is backtested, simulated, and human-authorized.
        </p>
      </div>

      {/* 8-Stage Strategy Pipeline Banner */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
        <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
          STRATEGY LIFECYCLE GATEWAYS
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {stages.map((stage, idx) => (
            <React.Fragment key={stage}>
              <div className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[11px] font-mono text-slate-300 whitespace-nowrap">
                {idx + 1}. {stage.replace('_', ' ')}
              </div>
              {idx < stages.length - 1 && (
                <span className="text-slate-600 text-xs shrink-0">→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Split: Strategy Cards & Deep Backtest Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Strategy List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs text-slate-400 font-mono">
            ACTIVE & PROPOSED STRATEGIES ({strategies.length})
          </div>

          <div className="space-y-3">
            {strategies.map(strat => {
              const isSelected = selectedStrategy?.id === strat.id;

              return (
                <div
                  key={strat.id}
                  onClick={() => setSelectedStrategy(strat)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500/50 shadow-md shadow-cyan-500/5'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-mono text-cyan-400">{strat.id}</span>
                      <h3 className="text-sm font-bold text-white leading-snug">
                        {strat.title}
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30 shrink-0">
                      {strat.stage.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                    {strat.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-2 border-t border-slate-800/80">
                    <div className="text-slate-400">
                      Expected Net: <span className="text-emerald-400 font-bold">+${strat.expectedMonthlyYieldUSD.toFixed(2)}/mo</span>
                    </div>
                    <div className="text-right text-slate-400">
                      Risk: <span className="text-slate-200">{strat.estimatedRiskScore}/100</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Strategy Deep Inspector */}
        <div className="lg:col-span-7">
          {selectedStrategy && (
            <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase">
                    STRATEGY SPECIFICATION · {selectedStrategy.id}
                  </span>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    {selectedStrategy.title}
                  </h2>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Proposed by: {selectedStrategy.proposedByAgent} ({selectedStrategy.proposerTitle})
                  </div>
                </div>

                {selectedStrategy.approvedByHuman ? (
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 border border-emerald-500/30 px-2 py-1 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Human Authorized
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      const matchApp = approvals.find(a => a.payload?.strategyId === selectedStrategy.id);
                      if (matchApp) {
                        setSelectedApproval(matchApp);
                      } else {
                        setActiveView('approvals');
                      }
                    }}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg text-xs font-mono transition-colors cursor-pointer"
                  >
                    Authorize Deployment
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                {selectedStrategy.description}
              </p>

              {/* Financial & Backtest Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500">MONTHLY YIELD</div>
                  <div className="text-base font-bold text-emerald-400 mt-0.5">
                    +${selectedStrategy.expectedMonthlyYieldUSD.toFixed(2)}
                  </div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500">SIMULATED RUNS</div>
                  <div className="text-base font-bold text-white mt-0.5">
                    {selectedStrategy.backtestResults.simulatedRuns}
                  </div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500">WIN RATE</div>
                  <div className="text-base font-bold text-cyan-400 mt-0.5">
                    {selectedStrategy.backtestResults.successRate}%
                  </div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500">SECURITY AUDIT</div>
                  <div className="text-base font-bold text-emerald-400 mt-0.5">
                    {selectedStrategy.securityAuditScore}/100
                  </div>
                </div>
              </div>

              {/* Target Chains */}
              <div className="space-y-1.5 text-xs font-mono">
                <div className="text-[10px] text-slate-500 uppercase">Target Networks</div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedStrategy.targetChains.map(ch => (
                    <span key={ch} className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded text-cyan-400 text-xs font-mono">
                      {ch}
                    </span>
                  ))}
                </div>
              </div>

              {/* Failure Scenarios & Circuit Breaker */}
              <div className="space-y-1.5">
                <div className="text-[10px] text-slate-500 font-mono uppercase text-rose-400">
                  Risk Assessment & Maximum Drawdown Limits
                </div>
                <div className="p-3 bg-rose-950/20 rounded-xl border border-rose-900/40 text-xs font-mono space-y-1 text-rose-200">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Max tolerated drawdown: {selectedStrategy.backtestResults.maxDrawdown}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Risk score ({selectedStrategy.estimatedRiskScore}/100) satisfies policy threshold</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
