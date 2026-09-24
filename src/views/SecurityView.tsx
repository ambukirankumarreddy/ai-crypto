import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  AlertOctagon, 
  Sliders, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Flame,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';

export const SecurityView: React.FC = () => {
  const { 
    policy, 
    updatePolicy, 
    triggerEmergencyStop, 
    resetEmergencyStop, 
    simulateDynamicAnomaly 
  } = useApp();

  const [maxTx, setMaxTx] = useState<number>(policy.maxTransactionValueUSD);
  const [dailyLimit, setDailyLimit] = useState<number>(policy.maxDailySpendingUSD);
  const [minProfit, setMinProfit] = useState<number>(policy.minExpectedNetProfitUSD);
  const [maxRisk, setMaxRisk] = useState<number>(policy.maxRiskScoreAllowed);
  const [newDomain, setNewDomain] = useState<string>('');

  const handleSavePolicy = () => {
    updatePolicy({
      maxTransactionValueUSD: maxTx,
      maxDailySpendingUSD: dailyLimit,
      minExpectedNetProfitUSD: minProfit,
      maxRiskScoreAllowed: maxRisk
    });
  };

  const toggleChain = (chain: string) => {
    const nextChains = policy.allowedChains.includes(chain)
      ? policy.allowedChains.filter(c => c !== chain)
      : [...policy.allowedChains, chain];
    updatePolicy({ allowedChains: nextChains });
  };

  const handleAddDomain = () => {
    if (!newDomain.trim()) return;
    const clean = newDomain.trim().toLowerCase().replace('https://', '').replace('http://', '');
    updatePolicy({ allowedDomains: [...policy.allowedDomains, clean] });
    setNewDomain('');
  };

  const handleRemoveDomain = (domain: string) => {
    updatePolicy({ allowedDomains: policy.allowedDomains.filter(d => d !== domain) });
  };

  const allSupportedChains = ['Ethereum', 'Polygon', 'Arbitrum', 'Base', 'Optimism', 'Solana'];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Security & Policy Governance Engine</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict permission barriers, spend boundaries, and dynamic anomaly circuit breakers.
          </p>
        </div>

        {policy.emergencyStopActive ? (
          <button
            onClick={resetEmergencyStop}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/20"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Reset Emergency Stop</span>
          </button>
        ) : (
          <button
            onClick={() => triggerEmergencyStop('Manual Owner security inspection')}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-600/20"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Trip Emergency Circuit Breaker</span>
          </button>
        )}
      </div>

      {/* Dynamic Security & Circuit Breaker Status Banner */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
        policy.emergencyStopActive 
          ? 'bg-rose-950/40 border-rose-600' 
          : 'bg-slate-900/60 border-slate-800'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              DYNAMIC ANOMALY TRIPWIRE MONITOR
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
              policy.currentFailedTxCount > 0 ? 'bg-amber-950 text-amber-400' : 'bg-emerald-950 text-emerald-400'
            }`}>
              {policy.currentFailedTxCount} / {policy.autoHaltOnFailedTxCount} Consecutive Failures
            </span>
          </div>
          <p className="text-xs text-slate-400">
            If 5 consecutive execution failures occur, the policy engine automatically locks autonomous execution, lowers agent permissions, and notifies the human owner.
          </p>
        </div>

        <button
          onClick={simulateDynamicAnomaly}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-mono flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Activity className="w-3.5 h-3.5 text-amber-400" />
          <span>Simulate Execution Anomaly (+1)</span>
        </button>
      </div>

      {/* Main Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Financial Limits & Risk Thresholds */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Capital & Transaction Limits</span>
            </h2>
            <button
              onClick={handleSavePolicy}
              className="text-xs font-mono text-cyan-400 hover:underline"
            >
              Save Policy Changes
            </button>
          </div>

          <div className="space-y-4">
            {/* Max Transaction Value */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Max Autonomous Transaction Value:</span>
                <span className="text-white font-bold">${maxTx.toFixed(2)} USD</span>
              </div>
              <input
                type="range"
                min="0.50"
                max="25.00"
                step="0.50"
                value={maxTx}
                onChange={e => setMaxTx(parseFloat(e.target.value))}
                className="w-full accent-cyan-500"
              />
              <span className="text-[10px] text-slate-500">Any task exceeding ${maxTx.toFixed(2)} requires explicit Human Owner approval.</span>
            </div>

            {/* Max Daily Spend Limit */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Max Daily Gas & Capital Spend:</span>
                <span className="text-white font-bold">${dailyLimit.toFixed(2)} USD</span>
              </div>
              <input
                type="range"
                min="5.00"
                max="100.00"
                step="5.00"
                value={dailyLimit}
                onChange={e => setDailyLimit(parseFloat(e.target.value))}
                className="w-full accent-cyan-500"
              />
              <span className="text-[10px] text-slate-500">Total expenditure limit per 24 hour rolling window.</span>
            </div>

            {/* Minimum Expected Profit */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Minimum Expected Net Profit:</span>
                <span className="text-emerald-400 font-bold">${minProfit.toFixed(2)} USD</span>
              </div>
              <input
                type="range"
                min="0.25"
                max="10.00"
                step="0.25"
                value={minProfit}
                onChange={e => setMinProfit(parseFloat(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <span className="text-[10px] text-slate-500">Opportunities yielding net profit below ${minProfit.toFixed(2)} are immediately rejected.</span>
            </div>

            {/* Max Risk Score Allowed */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Maximum Allowed Risk Score:</span>
                <span className="text-amber-400 font-bold">{maxRisk} / 100</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="1"
                value={maxRisk}
                onChange={e => setMaxRisk(parseInt(e.target.value))}
                className="w-full accent-amber-500"
              />
              <span className="text-[10px] text-slate-500">Risk scores calculated from contract age, audit status, and domain trust.</span>
            </div>
          </div>
        </div>

        {/* Right: Allowed Blockchain Networks */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Permitted Blockchain Networks</span>
            </h2>
            <span className="text-[10px] font-mono text-slate-500">
              {policy.allowedChains.length} active
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {allSupportedChains.map(chain => {
              const isAllowed = policy.allowedChains.includes(chain);
              return (
                <div
                  key={chain}
                  onClick={() => toggleChain(chain)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isAllowed
                      ? 'bg-slate-950 border-cyan-500/40 text-white'
                      : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-mono font-medium">{chain}</span>
                  {isAllowed ? (
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-slate-600" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Domain Firewall Allowlist */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-200 font-mono">
              <span>APPROVED DOMAIN FIREWALL</span>
              <span className="text-[10px] text-slate-500">{policy.allowedDomains.length} domains</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newDomain}
                onChange={e => setNewDomain(e.target.value)}
                placeholder="e.g. optimism.io"
                className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleAddDomain}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-mono cursor-pointer"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
              {policy.allowedDomains.map(d => (
                <span 
                  key={d}
                  className="px-2 py-0.5 bg-slate-950 text-slate-300 text-[11px] font-mono rounded border border-slate-800 flex items-center gap-1.5"
                >
                  <span>{d}</span>
                  <button 
                    onClick={() => handleRemoveDomain(d)}
                    className="text-slate-500 hover:text-rose-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
