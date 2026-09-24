import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  Download, 
  ExternalLink, 
  Sparkles, 
  Layers,
  ArrowUpRight
} from 'lucide-react';

export const EarningsView: React.FC = () => {
  const { rewards, claimReward } = useApp();
  const [filterType, setFilterType] = useState<string>('ALL');
  const [claimingId, setClaimingId] = useState<string | null>(null);

  // Distinguish Actual Claimed vs Estimated / In Progress
  const claimedRewards = rewards.filter(r => r.status === 'CLAIMED');
  const claimableRewards = rewards.filter(r => r.status === 'CLAIMABLE');
  const pendingRewards = rewards.filter(r => r.status === 'IN_PROGRESS' || r.status === 'PENDING');

  const actualEarnedUSD = claimedRewards.reduce((acc, r) => acc + r.actualAmountUSD, 0);
  const claimableUSD = claimableRewards.reduce((acc, r) => acc + r.actualAmountUSD, 0);
  const pendingEstimatedUSD = pendingRewards.reduce((acc, r) => acc + r.estimatedAmountUSD, 0);

  const handleClaim = async (rewardId: string) => {
    setClaimingId(rewardId);
    await claimReward(rewardId);
    setClaimingId(null);
  };

  const exportCSV = () => {
    const headers = ['ID,Project,Chain,Category,Estimated_USD,Actual_USD,Token,Status,TxHash,Date\n'];
    const rows = rewards.map(r => 
      `${r.id},"${r.project}",${r.chain},${r.category},${r.estimatedAmountUSD},${r.actualAmountUSD},${r.tokenSymbol},${r.status},"${r.claimTxHash || ''}","${r.detectedAt}"`
    );
    const blob = new Blob([...headers, ...rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crypto_earnings_audit_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Earnings & Rewards Ledger</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographically audited reward detection reconciling estimated rewards with actual on-chain receipts.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span>Export Audit CSV</span>
        </button>
      </div>

      {/* Actual vs Estimated Distinction Banner */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Actual Claimed */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>ACTUAL CLAIMED REWARDS</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            ${actualEarnedUSD.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            On-chain settled tokens
          </div>
        </div>

        {/* Claimable Ready */}
        <div className="p-4 bg-slate-950 rounded-xl border border-cyan-500/30 space-y-1">
          <div className="flex items-center justify-between text-xs text-cyan-400 font-mono">
            <span>CLAIMABLE READY</span>
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-300 font-mono">
            ${claimableUSD.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Verified on-chain · Ready to sweep
          </div>
        </div>

        {/* Pending Estimated */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>PENDING / ESTIMATED REWARDS</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300 font-mono">
            ${pendingEstimatedUSD.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Awaiting task epoch / block maturity
          </div>
        </div>
      </div>

      {/* Claimable Rewards Action Box */}
      {claimableRewards.length > 0 && (
        <div className="p-4 bg-cyan-950/20 border border-cyan-500/30 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white font-mono">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>REWARDS AVAILABLE FOR CLAIMING</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Zero slippage simulation passed</span>
          </div>

          <div className="space-y-2">
            {claimableRewards.map(reward => (
              <div 
                key={reward.id}
                className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="font-semibold text-white">{reward.opportunityTitle}</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {reward.tokenAmount} {reward.tokenSymbol} (${reward.actualAmountUSD.toFixed(2)}) · {reward.chain}
                  </div>
                </div>

                <button
                  onClick={() => handleClaim(reward.id)}
                  disabled={claimingId === reward.id}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-semibold font-mono flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                >
                  {claimingId === reward.id ? (
                    <span>Claiming...</span>
                  ) : (
                    <>
                      <span>Claim ${reward.actualAmountUSD.toFixed(2)}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rewards Ledger Table */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-white tracking-tight">Reward Detection Ledger</h2>
          <span className="text-[10px] text-slate-500 font-mono">
            {rewards.length} entries recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                <th className="pb-2.5">Opportunity</th>
                <th className="pb-2.5">Network</th>
                <th className="pb-2.5">Category</th>
                <th className="pb-2.5 text-right">Est. Amount</th>
                <th className="pb-2.5 text-right">Actual Amount</th>
                <th className="pb-2.5 text-center">Status</th>
                <th className="pb-2.5 text-right">Receipt / Tx</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {rewards.map((reward, idx) => (
                <tr key={`${reward.id}-${idx}`} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3 pr-3 font-sans">
                    <div className="font-semibold text-slate-200 truncate max-w-xs">{reward.opportunityTitle}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{reward.project} · {reward.id}</div>
                  </td>
                  <td className="py-3 text-cyan-300">
                    {reward.chain}
                  </td>
                  <td className="py-3 text-slate-400 text-[11px]">
                    {reward.category.replace('_', ' ')}
                  </td>
                  <td className="py-3 text-right text-slate-400">
                    ${reward.estimatedAmountUSD.toFixed(2)}
                  </td>
                  <td className="py-3 text-right font-bold">
                    {reward.actualAmountUSD > 0 ? (
                      <span className="text-emerald-400">+${reward.actualAmountUSD.toFixed(2)}</span>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </td>
                  <td className="py-3 text-center">
                    <span className={`text-[10px] px-2 py-0.5 rounded ${
                      reward.status === 'CLAIMED' ? 'text-emerald-400 bg-emerald-950/80 border border-emerald-500/20' :
                      reward.status === 'CLAIMABLE' ? 'text-cyan-400 bg-cyan-950/80 border border-cyan-500/20' :
                      'text-amber-400 bg-amber-950/80 border border-amber-500/20'
                    }`}>
                      {reward.status}
                    </span>
                  </td>
                  <td className="py-3 text-right text-[11px] text-slate-500">
                    {reward.claimTxHash ? (
                      <span className="text-cyan-400 truncate block max-w-[120px] ml-auto">
                        {reward.claimTxHash.slice(0, 8)}...
                      </span>
                    ) : (
                      <span>Pending Tx</span>
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
