/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProductionEnvironment, TransactionExecutionMode } from '../types';
import {
  ShieldAlert,
  Sliders,
  Play,
  Pause,
  AlertOctagon,
  CheckCircle2,
  Lock,
  Zap,
  Activity,
  ChevronRight,
  ShieldCheck,
  Flame,
  HelpCircle
} from 'lucide-react';

interface ProductionControlBarProps {
  onOpenQAModal?: () => void;
}

export const ProductionControlBar: React.FC<ProductionControlBarProps> = ({ onOpenQAModal }) => {
  const {
    aiRunning,
    startAI,
    stopAI,
    policy,
    triggerEmergencyStop,
    setActiveView
  } = useApp();

  const [environment, setEnvironment] = useState<ProductionEnvironment>('LIMITED_LIVE');
  const [txMode, setTxMode] = useState<TransactionExecutionMode>('APPROVAL_ONLY');
  const [dailyLimitUSD, setDailyLimitUSD] = useState<number>(500);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const getEnvBadgeColor = () => {
    switch (environment) {
      case 'STAGING':
        return 'bg-blue-950/80 text-blue-300 border-blue-500/40';
      case 'LIMITED_LIVE':
        return 'bg-amber-950/80 text-amber-300 border-amber-500/40';
      case 'FULL_LIVE':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40';
    }
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Production Control Badge & Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-white tracking-wider text-[11px] flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              PRODUCTION CONTROL
            </span>
            <div className={`px-2 py-0.5 rounded border text-[10px] font-mono font-bold flex items-center gap-1 ${getEnvBadgeColor()}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                environment === 'STAGING' ? 'bg-blue-400' : environment === 'LIMITED_LIVE' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 animate-pulse'
              }`} />
              <span>{environment.replace('_', ' ')}</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-4 text-[11px] text-slate-400 font-mono border-l border-slate-800 pl-3">
            <span>
              Automation: <strong className={aiRunning && !policy.emergencyStopActive ? 'text-emerald-400' : 'text-amber-400'}>
                {policy.emergencyStopActive ? 'HALTED' : aiRunning ? 'ON' : 'PAUSED'}
              </strong>
            </span>
            <span>
              Transactions: <strong className="text-cyan-300">{txMode.replace('_', ' ')}</strong>
            </span>
            <span>
              Daily Limit: <strong className="text-white">${dailyLimitUSD} USD</strong>
            </span>
            <span>
              Emergency Stop: <strong className={policy.emergencyStopActive ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                {policy.emergencyStopActive ? 'TRIPPED' : 'READY'}
              </strong>
            </span>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2">
          {/* QA Readiness Runner Button */}
          <button
            onClick={() => setActiveView('qa-readiness')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-[11px] font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>QA Live Readiness</span>
          </button>

          {/* Pause / Resume Automation */}
          {aiRunning && !policy.emergencyStopActive ? (
            <button
              onClick={stopAI}
              className="px-2.5 py-1 rounded-lg bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-600/40 text-[11px] font-mono font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Pause className="w-3 h-3" />
              <span>PAUSE ALL</span>
            </button>
          ) : (
            <button
              onClick={startAI}
              disabled={policy.emergencyStopActive}
              className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-600/40 text-[11px] font-mono font-semibold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3 h-3" />
              <span>RESUME AI</span>
            </button>
          )}

          {/* Emergency Stop Button */}
          <button
            onClick={() => triggerEmergencyStop('Manual Production Control invocation')}
            disabled={policy.emergencyStopActive}
            className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-[11px] flex items-center gap-1 shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:bg-rose-950"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>EMERGENCY STOP</span>
          </button>

          {/* Expand Settings Drawer */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
            title="Configure Production Safeguards"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded Production Controls Drawer */}
      {isExpanded && (
        <div className="border-t border-slate-800 bg-slate-950/90 p-4 animate-in slide-in-from-top-2 duration-150">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
            {/* Launch Stage Selector */}
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold block">
                1. LAUNCH ENVIRONMENT
              </label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value as ProductionEnvironment)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-cyan-500 text-xs"
              >
                <option value="STAGING">Stage 1 — STAGING (Testnet / Read-Only)</option>
                <option value="LIMITED_LIVE">Stage 2 — LIMITED LIVE (Approval Only)</option>
                <option value="FULL_LIVE">Stage 3 — FULL LIVE (Autonomous Multi-Sig)</option>
              </select>
              <p className="text-[10px] text-slate-500 font-sans">
                {environment === 'STAGING'
                  ? 'Zero real funds executed. Read-only on-chain monitoring and testnet simulation.'
                  : environment === 'LIMITED_LIVE'
                  ? 'Real wallet active in strict Human-Approval-Only mode with tight daily caps.'
                  : 'Autonomous multi-sig execution unlocked after 100% QA gates pass.'}
              </p>
            </div>

            {/* Transaction Execution Policy */}
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold block">
                2. TRANSACTION POLICY
              </label>
              <select
                value={txMode}
                onChange={(e) => setTxMode(e.target.value as TransactionExecutionMode)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-cyan-500 text-xs"
              >
                <option value="APPROVAL_ONLY">APPROVAL ONLY (Human Sign-off)</option>
                <option value="READ_ONLY">READ ONLY (Zero Execution)</option>
                <option value="AUTONOMOUS">AUTONOMOUS (Within Budget Cap)</option>
              </select>
              <p className="text-[10px] text-slate-500 font-sans">
                Controls whether agent transactions require root confirmation before broadcast.
              </p>
            </div>

            {/* Daily Financial Limit */}
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold block">
                3. DAILY CAPITAL LIMIT
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">$</span>
                <input
                  type="number"
                  value={dailyLimitUSD}
                  onChange={(e) => setDailyLimitUSD(Math.max(10, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-cyan-500 text-xs"
                  step="50"
                  min="50"
                  max="10000"
                />
                <span className="text-slate-500">USD</span>
              </div>
              <p className="text-[10px] text-slate-500 font-sans">
                Hard ceiling for cumulative daily gas and bounty deposits.
              </p>
            </div>

            {/* Emergency & Safety Status */}
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5 flex flex-col justify-between">
              <div>
                <label className="text-[10px] text-slate-400 font-bold block">
                  4. SAFETY STATUS
                </label>
                <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 pt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sentinel Watchdog Armed</span>
                </div>
              </div>
              <button
                onClick={() => setActiveView('qa-readiness')}
                className="w-full py-1.5 px-2 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 rounded-lg text-[10px] font-bold text-center transition-colors cursor-pointer"
              >
                Run Live Readiness Suite →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
