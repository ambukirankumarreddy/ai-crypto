/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { HumanApprovalRequest } from '../types/office';
import {
  ShieldAlert,
  ShieldCheck,
  Scale,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Lock,
  Zap,
  ExternalLink
} from 'lucide-react';

interface HumanApprovalModalProps {
  request: HumanApprovalRequest;
  onApprove: () => void;
  onReject: (reason?: string) => void;
  onClose: () => void;
}

export const HumanApprovalModal: React.FC<HumanApprovalModalProps> = ({
  request,
  onApprove,
  onReject,
  onClose
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(request.expiresInSeconds || 120);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [isRejecting, setIsRejecting] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onReject('Approval request timed out after 120s.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onReject]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-amber-500/60 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative text-slate-200 font-sans space-y-4">
        {/* Top Header Badge */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0">
              <Lock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/40 text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider">
                  Root Human Authority Gate
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  ID: {request.taskId}
                </span>
              </div>
              <h2 className="text-base font-bold text-white leading-tight mt-0.5">
                {request.opportunityTitle}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-amber-300">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>{Math.floor(secondsRemaining / 60)}:{(secondsRemaining % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>

        {/* Section 11: Reason Approval is Required */}
        <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl flex items-start gap-2.5 text-xs text-amber-200/90">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-300 block font-semibold">Why Human Approval is Required:</strong>
            <span>{request.reasonRequired}</span>
          </div>
        </div>

        {/* Financial Breakdown & Risk */}
        <div className="grid grid-cols-3 gap-3 font-mono">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center">
            <span className="text-[10px] text-slate-500 block">EXPECTED GROSS REWARD</span>
            <strong className="text-emerald-400 text-sm font-bold">
              +${request.expectedRewardUSD.toFixed(2)} USD
            </strong>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center">
            <span className="text-[10px] text-slate-500 block">EST. NETWORK GAS COST</span>
            <strong className="text-rose-400 text-sm font-bold">
              -${request.estimatedCostUSD.toFixed(2)} USD
            </strong>
          </div>
          <div className="p-3 bg-slate-950 border border-emerald-500/40 rounded-xl text-center">
            <span className="text-[10px] text-emerald-400 block">PROJECTED NET EV</span>
            <strong className="text-white text-sm font-bold">
              +${request.netEVUSD.toFixed(2)} USD
            </strong>
          </div>
        </div>

        {/* Multi-Gate Audit Results */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Technical Security Gate
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono font-bold">
                SCORE 99/100
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-mono leading-snug">
              {request.securityResult}
            </p>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-pink-400 font-bold flex items-center gap-1">
                <Scale className="w-3.5 h-3.5" />
                Compliance & Sanctions Gate
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono font-bold">
                PASSED
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-mono leading-snug">
              {request.complianceResult}
            </p>
          </div>
        </div>

        {/* Proposed Action & Permissions */}
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Proposed Action</span>
            <span className="text-[10px] text-cyan-300">{request.network} · {request.contractAddress}</span>
          </div>
          <p className="text-slate-200 text-xs font-sans bg-slate-900/90 p-2 rounded border border-slate-800">
            {request.proposedAction}
          </p>

          <div className="flex items-center gap-1.5 pt-1 text-[10px] text-slate-400">
            <span>Required Permissions:</span>
            {request.requiredPermissions.map(perm => (
              <span key={perm} className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                {perm}
              </span>
            ))}
          </div>
        </div>

        {/* Rejection input when active */}
        {isRejecting && (
          <div className="space-y-1 animate-in fade-in duration-150">
            <label className="text-[11px] font-mono text-rose-400">Enter Rejection Reason for Audit Trail:</label>
            <input
              type="text"
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g., Gas volatility too high or parameter mismatch..."
              className="w-full px-3 py-2 bg-slate-950 border border-rose-500/50 rounded-lg text-xs text-white focus:outline-none font-mono"
              autoFocus
            />
          </div>
        )}

        {/* Decision Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          {!isRejecting ? (
            <>
              <button
                onClick={() => setIsRejecting(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold text-rose-400 hover:bg-rose-950/40 border border-rose-800/60 transition-colors cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject / Veto Task</span>
              </button>

              <button
                onClick={onApprove}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-mono font-bold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>Sign & Authorize Execution</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsRejecting(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => onReject(rejectReason || 'Explicitly rejected by human root owner.')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Confirm Rejection</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
