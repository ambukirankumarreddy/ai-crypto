import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Play, 
  Pause, 
  TrendingUp, 
  ShieldCheck, 
  AlertOctagon, 
  Compass, 
  Users, 
  ListTodo, 
  DollarSign, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Radio, 
  Cpu, 
  Layers,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  Gamepad2
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { 
    aiRunning, 
    startAI, 
    stopAI, 
    setShowEmergencyModal, 
    policy, 
    wallet, 
    tasks, 
    opportunities, 
    rewards, 
    agents, 
    messages, 
    setSelectedAgent, 
    setActiveView,
    executeManualOpportunitySweep,
    setSelectedApproval,
    approvals
  } = useApp();

  // Metrics calculations
  const totalEarnedUSD = rewards
    .filter(r => r.status === 'CLAIMED' || r.status === 'CLAIMABLE')
    .reduce((acc, r) => acc + (r.actualAmountUSD || r.estimatedAmountUSD), 0);

  const pendingRewardsUSD = rewards
    .filter(r => r.status === 'IN_PROGRESS' || r.status === 'PENDING')
    .reduce((acc, r) => acc + r.estimatedAmountUSD, 0);

  const todayEarningsUSD = 9.25;
  const monthlyEarningsUSD = 184.60;

  const activeAgentsCount = agents.filter(a => a.status === 'ACTIVE' || a.status === 'BUSY').length;
  const runningTasks = tasks.filter(t => t.status === 'EXECUTING' || t.status === 'QUEUED');
  const completedOppsCount = tasks.filter(t => t.status === 'SUCCESS').length + 14;

  const pendingApprovals = approvals.filter(a => a.status === 'PENDING');

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Emergency Warning if active */}
      {policy.emergencyStopActive && (
        <div className="p-4 bg-rose-950/60 border border-rose-600 rounded-xl flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <div className="text-sm font-bold text-white font-mono">GLOBAL EMERGENCY STOP ACTIVE</div>
              <div className="text-xs text-rose-300">All background workers and transactions are locked. Reason: {policy.emergencyStopReason}</div>
            </div>
          </div>
          <button
            onClick={() => setShowEmergencyModal(true)}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold"
          >
            Review & Reset
          </button>
        </div>
      )}

      {/* Primary Status & Quick Action Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Autonomous AI Organization</h1>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1 ${
              aiRunning && !policy.emergencyStopActive
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-950 text-amber-400 border border-amber-500/30'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${aiRunning && !policy.emergencyStopActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {policy.emergencyStopActive ? 'EMERGENCY HALT' : aiRunning ? 'AI RUNNING' : 'AI PAUSED'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Continuously discovering, validating, simulating, and executing legitimate permission-based crypto rewards.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={executeManualOpportunitySweep}
            className="flex-1 md:flex-initial px-3.5 py-2 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Trigger Scout Sweep</span>
          </button>

          {aiRunning ? (
            <button
              onClick={stopAI}
              className="flex-1 md:flex-initial px-5 py-2 rounded-lg text-xs font-semibold text-emerald-300 bg-emerald-950/80 border border-emerald-500/30 hover:bg-emerald-900/60 transition-all flex items-center justify-center gap-2 shadow-sm shadow-emerald-500/10 cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5 text-emerald-400 fill-current" />
              <span>AI RUNNING</span>
            </button>
          ) : (
            <button
              onClick={startAI}
              className="flex-1 md:flex-initial px-5 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-all flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>START AI</span>
            </button>
          )}
        </div>
      </div>

      {/* 2D LIVE OFFICE SIMULATOR HERO BANNER */}
      <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-cyan-950/60 border border-purple-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 z-10 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" /> 2D LIVE OFFICE SIMULATOR
            </span>
            <span className="text-[10px] font-mono text-cyan-400">10 Departments • 7+ Autonomous Agents</span>
          </div>
          <h2 className="text-base font-bold text-white tracking-tight">
            AI Crypto HQ — Strategy & Management Simulation
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Watch Opportunity Scouts crawl testnets, Governor coordinate strategy, Security audit bytecode, Compliance gate sanctions, and Workers execute approved jobs across 10 interactive physical office rooms.
          </p>
        </div>

        <button
          onClick={() => setActiveView('office')}
          className="z-10 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-mono font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-950/50 cursor-pointer transition-all shrink-0 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Gamepad2 className="w-4 h-4" />
          <span>ENTER 2D OFFICE GAME</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Metrics 4-Card Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Earned */}
        <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Total Earned</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tracking-tight">
            ${totalEarnedUSD.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-1">
            <span className="text-emerald-400 font-mono">+${todayEarningsUSD.toFixed(2)} today</span>
            <span>·</span>
            <span className="font-mono">${monthlyEarningsUSD.toFixed(2)} / mo</span>
          </div>
        </div>

        {/* Pending Rewards */}
        <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Pending Rewards</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300 font-mono tracking-tight">
            ${pendingRewardsUSD.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-1">
            <span className="font-mono">{rewards.filter(r => r.status === 'IN_PROGRESS' || r.status === 'PENDING').length} awaiting confirmation</span>
          </div>
        </div>

        {/* Active AI Agents */}
        <div 
          onClick={() => setActiveView('organization')}
          className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-1 cursor-pointer hover:border-slate-700 transition-colors group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Active Agents</span>
            <Users className="w-3.5 h-3.5 text-cyan-400 group-hover:text-cyan-300" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tracking-tight flex items-baseline gap-2">
            <span>{activeAgentsCount}</span>
            <span className="text-xs text-slate-500 font-normal">/ {agents.length} active</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Governor & 6 Directors operational</span>
          </div>
        </div>

        {/* Section 67: Compliance Widget */}
        <div 
          onClick={() => setActiveView('compliance')}
          className="p-4 bg-slate-900/40 border border-purple-500/30 rounded-xl space-y-1 cursor-pointer hover:border-purple-400/50 transition-colors group"
        >
          <div className="flex items-center justify-between text-xs text-purple-400 font-mono">
            <span>Compliance Status</span>
            <span className="text-[10px] bg-purple-950 px-1.5 py-0.5 rounded border border-purple-500/30">Section 67</span>
          </div>
          <div className="text-xl font-bold text-white font-mono tracking-tight flex items-center gap-3 pt-0.5">
            <span className="text-emerald-400 text-sm flex items-center gap-1">🟢 {opportunities.filter(o => o.complianceStatus === 'COMPLIANCE_APPROVED' || o.complianceStatus === 'COMPLIANCE_APPROVED_WITH_LIMITS').length} Approved</span>
            <span className="text-amber-400 text-sm flex items-center gap-1">🟡 {opportunities.filter(o => o.complianceStatus === 'HUMAN_REVIEW_REQUIRED' || o.complianceStatus === 'COMPLIANCE_REVIEW_REQUIRED').length} Review</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-1 font-mono">
            <span className="text-rose-400 font-bold">🔴 {opportunities.filter(o => o.complianceStatus === 'COMPLIANCE_BLOCKED').length} Blocked</span>
            <span>·</span>
            <span className="text-purple-300">⚠ 1 Regulatory Alert</span>
          </div>
        </div>
      </div>

      {/* Section 67 Subsystems Health Status Strip */}
      <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">Subsystem Status:</span>
        <div className="flex flex-wrap items-center gap-4">
          <button 
            onClick={() => setActiveView('security')}
            className="flex items-center gap-1.5 text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer"
          >
            <span>Security</span>
            <span className="text-emerald-400 font-bold">🟢</span>
          </button>
          <button 
            onClick={() => setActiveView('compliance')}
            className="flex items-center gap-1.5 text-slate-300 hover:text-purple-400 transition-colors cursor-pointer"
          >
            <span>Compliance</span>
            <span className="text-emerald-400 font-bold">🟢</span>
          </button>
          <button 
            onClick={() => setActiveView('wallet')}
            className="flex items-center gap-1.5 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
          >
            <span>Wallet</span>
            <span className="text-emerald-400 font-bold">🟢</span>
          </button>
          <button 
            onClick={() => setActiveView('tasks')}
            className="flex items-center gap-1.5 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
          >
            <span>Automation</span>
            <span className="text-emerald-400 font-bold">🟢</span>
          </button>
          <button 
            onClick={() => setActiveView('website-ai')}
            className="flex items-center gap-1.5 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
          >
            <span>Website</span>
            <span className="text-emerald-400 font-bold">🟢</span>
          </button>
        </div>
        <span className="text-[10px] text-slate-500 hidden sm:inline">Click subsystem to inspect</span>
      </div>

      {/* Pending Approvals Strip (Human in the loop) */}
      {pendingApprovals.length > 0 && (
        <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-900/40 rounded-lg text-amber-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">
                {pendingApprovals.length} Human Owner Authorization{pendingApprovals.length > 1 ? 's' : ''} Pending
              </div>
              <div className="text-[11px] text-amber-300/80">
                {pendingApprovals[0].title}
              </div>
            </div>
          </div>
          <button
            onClick={() => setSelectedApproval(pendingApprovals[0])}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
          >
            Review Request
          </button>
        </div>
      )}

      {/* Two Column Section: Live AI Feed vs Active Tasks Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live AI Stream (The exact specification from Prompt section 22) */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex flex-col h-[380px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 font-mono">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>LIVE AI ORGANIZATION FEED</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Real-time Agent Bus</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
            {messages.map((msg, idx) => (
              <div 
                key={`${msg.id}-${idx}`}
                className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60 flex items-start gap-3 hover:border-slate-700/80 transition-colors"
              >
                <span className="text-[10px] font-mono text-slate-500 shrink-0 pt-0.5">
                  {msg.timestamp}
                </span>
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-cyan-400 font-mono">
                      {msg.fromAgent.replace('agent_', '').replace('_01', '')}
                    </span>
                    <span className="text-[10px] text-slate-500">→</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {msg.toAgent.replace('agent_', '')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed break-words">
                    {msg.summary}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Active Tasks Pipeline */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex flex-col h-[380px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 font-mono">
              <ListTodo className="w-3.5 h-3.5 text-emerald-400" />
              <span>CURRENT EXECUTION PIPELINE</span>
            </div>
            <button 
              onClick={() => setActiveView('tasks')}
              className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 font-mono"
            >
              <span>View all ({tasks.length})</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {runningTasks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/40 mb-2" />
                <span>All queued tasks finished</span>
                <span className="text-[10px] text-slate-600">Scout agents are indexing new opportunities</span>
              </div>
            ) : (
              runningTasks.map(task => (
                <div 
                  key={task.id}
                  className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 truncate pr-2">
                      {task.opportunityTitle}
                    </span>
                    <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-1.5 py-0.5 rounded shrink-0">
                      {task.chain}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-mono text-[10px]">{task.assignedWorkerName}</span>
                      <span className="font-mono text-emerald-400">{task.progressPercent}%</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300"
                        style={{ width: `${task.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-900">
                    <span>Budget cap: ${task.sandbox.maxTxBudgetUSD.toFixed(2)}</span>
                    <span className="text-emerald-400">Simulation: Verified (0 Reverts)</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Discovered Opportunities Table (Preview) */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-white tracking-tight">Top Discovered Opportunities</h2>
            <p className="text-xs text-slate-400">Strictly verified, permission-based reward programs evaluated by the Profitability Engine</p>
          </div>
          <button
            onClick={() => setActiveView('opportunities')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 font-mono"
          >
            <span>Explore All Opportunities</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                <th className="pb-2.5">Opportunity</th>
                <th className="pb-2.5">Category</th>
                <th className="pb-2.5">Chain</th>
                <th className="pb-2.5 text-right">Required Capital</th>
                <th className="pb-2.5 text-right">Gas Est.</th>
                <th className="pb-2.5 text-right">Gross Reward</th>
                <th className="pb-2.5 text-right">Net Profit</th>
                <th className="pb-2.5 text-center">Risk Score</th>
                <th className="pb-2.5 text-center">Policy Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {opportunities.slice(0, 5).map(opp => (
                <tr key={opp.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3 pr-3 font-sans font-medium text-slate-200">
                    <div className="truncate max-w-xs">{opp.title}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{opp.project} · {opp.id}</div>
                  </td>
                  <td className="py-3 text-slate-400 text-[11px]">
                    {opp.category.replace('_', ' ')}
                  </td>
                  <td className="py-3">
                    <span className="text-cyan-300 bg-cyan-950/60 border border-cyan-500/20 px-1.5 py-0.5 rounded text-[10px]">
                      {opp.chain}
                    </span>
                  </td>
                  <td className="py-3 text-right text-slate-400">
                    ${opp.requiredCapital.toFixed(2)}
                  </td>
                  <td className="py-3 text-right text-slate-500">
                    ${opp.estimatedGasCost.toFixed(2)}
                  </td>
                  <td className="py-3 text-right text-slate-300 font-semibold">
                    ${opp.expectedGrossReward.toFixed(2)}
                  </td>
                  <td className="py-3 text-right text-emerald-400 font-bold">
                    +${opp.expectedNetProfit.toFixed(2)}
                  </td>
                  <td className="py-3 text-center">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      opp.riskScore <= 15 ? 'text-emerald-400 bg-emerald-950/60' :
                      opp.riskScore <= 35 ? 'text-amber-400 bg-amber-950/60' :
                      'text-rose-400 bg-rose-950/60'
                    }`}>
                      {opp.riskScore}/100
                    </span>
                  </td>
                  <td className="py-3 text-center font-sans">
                    {opp.status === 'APPROVED' ? (
                      <span className="text-[10px] text-emerald-400 font-mono">APPROVED</span>
                    ) : opp.status === 'HUMAN_APPROVAL_REQUIRED' ? (
                      <span className="text-[10px] text-amber-400 font-mono">OWNER SIGN-OFF</span>
                    ) : (
                      <span className="text-[10px] text-rose-400 font-mono">REJECTED</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
