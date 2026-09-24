import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ApprovalRequest } from '../types';
import { 
  FileCheck2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  Check, 
  ChevronRight,
  Code2,
  DollarSign,
  Layers
} from 'lucide-react';

export const ApprovalsView: React.FC = () => {
  const { approvals, resolveApproval, setSelectedApproval } = useApp();
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED'>('ALL');

  const filteredApprovals = approvals.filter(app => {
    if (filter === 'PENDING') return app.status === 'PENDING';
    if (filter === 'RESOLVED') return app.status !== 'PENDING';
    return true;
  });

  const pendingCount = approvals.filter(a => a.status === 'PENDING').length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Human Owner Authorizations</h1>
            {pendingCount > 0 && (
              <span className="text-xs font-mono text-amber-400 bg-amber-950/80 border border-amber-500/30 px-2 py-0.5 rounded">
                {pendingCount} pending sign-off
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Level 0 supreme authority gating high-value executions, production deployments, and policy boundary changes.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filter === 'ALL' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({approvals.length})
          </button>
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filter === 'PENDING' ? 'bg-amber-950 text-amber-300 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('RESOLVED')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filter === 'RESOLVED' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Resolved
          </button>
        </div>
      </div>

      {/* Approvals List */}
      <div className="space-y-4">
        {filteredApprovals.map(approval => {
          const isPending = approval.status === 'PENDING';
          const isApproved = approval.status === 'APPROVED';
          const isRejected = approval.status === 'REJECTED';

          return (
            <div
              key={approval.id}
              className={`p-5 rounded-2xl border transition-all ${
                isPending
                  ? 'bg-slate-900/60 border-amber-500/30 shadow-lg shadow-amber-500/5'
                  : 'bg-slate-900/30 border-slate-800/80'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-cyan-400">
                      {approval.id} · {approval.type.replace('_', ' ')}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      isPending ? 'bg-amber-950 text-amber-400 border border-amber-500/30 animate-pulse' :
                      isApproved ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' :
                      'bg-rose-950 text-rose-400 border border-rose-500/30'
                    }`}>
                      {approval.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white tracking-tight">
                    {approval.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                    {approval.description}
                  </p>

                  {/* Section 56: Three-Layer Status Inspection */}
                  <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 max-w-2xl font-mono text-xs">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">
                      Section 56 Review Breakdown:
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                      <div className="p-1.5 bg-slate-900 border border-emerald-500/30 text-emerald-300 rounded">
                        <span className="text-[9px] text-slate-500 block">SECURITY</span>
                        <strong>✓ PASSED</strong>
                      </div>
                      <div className="p-1.5 bg-slate-900 border border-amber-500/30 text-amber-300 rounded">
                        <span className="text-[9px] text-slate-500 block">COMPLIANCE</span>
                        <strong>⚠ REVIEW REQ</strong>
                      </div>
                      <div className="p-1.5 bg-slate-900 border border-cyan-500/30 text-cyan-300 rounded">
                        <span className="text-[9px] text-slate-500 block">PROFITABILITY</span>
                        <strong>✓ PASSED</strong>
                      </div>
                    </div>
                    <div className="text-[11px] text-amber-200/90 font-sans pt-1">
                      <strong>Reason for review:</strong> {approval.riskAssessment.notes || 'Potentially regulated activity requiring explicit human authorization.'}
                    </div>
                  </div>

                  {/* Metadata line */}
                  <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-400 pt-1">
                    <span>Requested by: <strong className="text-slate-200">{approval.requestedByAgent}</strong></span>
                    <span>·</span>
                    <span>Risk Score: <strong className={approval.riskAssessment.score > 25 ? 'text-amber-400' : 'text-emerald-400'}>{approval.riskAssessment.score}/100</strong></span>
                    <span>·</span>
                    <span>Created: {approval.createdAt}</span>
                    {approval.resolvedAt && (
                      <>
                        <span>·</span>
                        <span className="text-slate-500">Resolved: {approval.resolvedAt}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Section 56 Action Buttons: [APPROVE], [REJECT], [KEEP PAUSED] */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 pt-2 lg:pt-0">
                  {isPending ? (
                    <>
                      <button
                        onClick={() => resolveApproval(approval.id, false, 'Decision: Kept paused by Human Owner for further monitoring')}
                        className="px-3 py-2 rounded-lg text-xs font-mono text-slate-300 hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer text-center"
                      >
                        Keep Paused
                      </button>
                      <button
                        onClick={() => resolveApproval(approval.id, false, 'Declined / Rejected by Human Owner')}
                        className="px-3.5 py-2 rounded-lg text-xs font-mono text-rose-400 hover:bg-rose-950/60 border border-rose-800/60 transition-colors cursor-pointer text-center"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => resolveApproval(approval.id, true, 'Authorized & Signed by Human Owner')}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-lg text-xs font-mono transition-all shadow-md shadow-emerald-600/20 cursor-pointer text-center"
                      >
                        Approve
                      </button>
                    </>
                  ) : (
                    <div className="text-right text-xs font-mono p-2 bg-slate-950 rounded-lg border border-slate-800">
                      <div className="text-slate-500 text-[10px]">DECISION RECORDED</div>
                      <div className={isApproved ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {approval.decisionReason || approval.status}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
