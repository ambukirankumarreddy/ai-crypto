import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AlertOctagon, X, ShieldAlert, CheckCircle, RefreshCcw } from 'lucide-react';

export const EmergencyStopModal: React.FC = () => {
  const { 
    showEmergencyModal, 
    setShowEmergencyModal, 
    policy, 
    triggerEmergencyStop, 
    resetEmergencyStop 
  } = useApp();

  const [reason, setReason] = useState<string>('Owner manual intervention due to precautionary review');

  if (!showEmergencyModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-rose-600/60 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={() => setShowEmergencyModal(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-rose-950/80 border border-rose-500/40 rounded-xl text-rose-400">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Global Emergency Stop
            </h3>
            <p className="text-xs text-slate-400">Level 0 Human Owner Ultimate Override</p>
          </div>
        </div>

        {policy.emergencyStopActive ? (
          <div className="space-y-4">
            <div className="p-3.5 bg-rose-950/40 border border-rose-600/40 rounded-xl text-xs space-y-2 text-rose-200">
              <div className="font-semibold flex items-center gap-1.5 text-rose-400">
                <ShieldAlert className="w-4 h-4" />
                <span>SYSTEM IS CURRENTLY EMERGENCY STOPPED</span>
              </div>
              <p className="text-slate-300">
                All background workers have been killed. On-chain transaction submission is locked.
                Code deployments and automated strategies are frozen. Complete logs have been preserved.
              </p>
              {policy.emergencyStopReason && (
                <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-rose-800/40">
                  Trigger Reason: {policy.emergencyStopReason}
                </div>
              )}
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              To resume autonomous operations, verify system health, inspect recent transactions, and reset the circuit breaker.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  resetEmergencyStop();
                  setShowEmergencyModal(false);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/20"
              >
                <RefreshCcw className="w-4 h-4" />
                <span>Reset Emergency Stop</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              Activating the Global Emergency Stop immediately executes the following protocol:
            </p>

            <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4 font-mono">
              <li>TERMINATE all active sandboxed workers and sub-processes</li>
              <li>BLOCK all transaction signing and preparation routines</li>
              <li>FREEZE all website and strategy deployment pipelines</li>
              <li>SEAL cryptographic audit log state snapshot</li>
            </ul>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Incident Reason / Audit Note</label>
              <input
                type="text"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Reason for triggering emergency shutdown..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  triggerEmergencyStop(reason);
                  setShowEmergencyModal(false);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                <AlertOctagon className="w-4 h-4" />
                <span>ENGAGE EMERGENCY HALT</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
