import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, CheckCircle, XCircle, ShieldCheck, AlertTriangle, FileText } from 'lucide-react';

export const ApprovalModal: React.FC = () => {
  const { selectedApproval, setSelectedApproval, resolveApproval } = useApp();
  const [decisionReason, setDecisionReason] = useState<string>('');

  if (!selectedApproval) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
        <button
          onClick={() => setSelectedApproval(null)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-amber-950/60 border border-amber-500/30 rounded-xl text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">
              LEVEL 0 · HUMAN OWNER AUTHORIZATION
            </span>
            <h3 className="text-base font-bold text-white tracking-tight">
              {selectedApproval.title}
            </h3>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          {selectedApproval.description}
        </p>

        {/* Risk Assessment Box */}
        <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl mb-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono">Assessed Risk Score</span>
            <span className={`font-mono font-bold ${
              selectedApproval.riskAssessment.score > 20 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {selectedApproval.riskAssessment.score} / 100
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-normal">
            {selectedApproval.riskAssessment.notes}
          </p>
          <div className="text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-800/80">
            Requested by: {selectedApproval.requestedByAgent}
          </div>
        </div>

        {/* Payload / Parameters Preview */}
        <div className="mb-4">
          <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            Execution Parameters
          </div>
          <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-300 font-mono overflow-x-auto max-h-32">
            {JSON.stringify(selectedApproval.payload, null, 2)}
          </pre>
        </div>

        {/* Optional reason */}
        <div className="space-y-1 mb-6">
          <label className="text-xs font-medium text-slate-400">Decision Notes (optional)</label>
          <input
            type="text"
            value={decisionReason}
            onChange={e => setDecisionReason(e.target.value)}
            placeholder="Reason for approval or rejection..."
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={() => {
              resolveApproval(selectedApproval.id, false, decisionReason);
              setSelectedApproval(null);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-950/40 border border-rose-800/60 transition-colors"
          >
            <XCircle className="w-4 h-4" />
            <span>Decline / Reject</span>
          </button>
          <button
            onClick={() => {
              resolveApproval(selectedApproval.id, true, decisionReason);
              setSelectedApproval(null);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-colors shadow-lg shadow-emerald-600/20"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Authorize & Execute</span>
          </button>
        </div>
      </div>
    </div>
  );
};
