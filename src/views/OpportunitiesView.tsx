import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Opportunity, OpportunityCategory } from '../types';
import { 
  Compass, 
  Search, 
  Filter, 
  ExternalLink, 
  ShieldCheck, 
  ShieldAlert, 
  DollarSign, 
  Flame, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Play,
  Layers,
  ArrowRight,
  Info,
  Scale,
  FileCheck2
} from 'lucide-react';
import { ProfitabilityEngine } from '../services/profitEngine';

export const OpportunitiesView: React.FC = () => {
  const { 
    opportunities, 
    policy, 
    executeManualOpportunitySweep, 
    setSelectedApproval, 
    approvals,
    setActiveView 
  } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [chainFilter, setChainFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);

  // Filtered
  const filtered = opportunities.filter(opp => {
    if (categoryFilter !== 'ALL' && opp.category !== categoryFilter) return false;
    if (chainFilter !== 'ALL' && opp.chain !== chainFilter) return false;
    if (statusFilter !== 'ALL' && opp.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = opp.title.toLowerCase().includes(q) || 
                    opp.project.toLowerCase().includes(q) ||
                    opp.chain.toLowerCase().includes(q) ||
                    opp.id.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const categories = [
    'ALL',
    'TESTNET',
    'FAUCET',
    'BLOCKCHAIN_QUEST',
    'BOUNTY',
    'GRANT',
    'AIRDROP_ELIGIBILITY',
    'DEPIN',
    'STAKING',
    'LIQUIDITY_INCENTIVE'
  ];

  const chains = ['ALL', 'Ethereum', 'Polygon', 'Arbitrum', 'Base', 'Optimism', 'Solana'];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Earning Opportunities</h1>
            <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              {filtered.length} indexed
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Autonomous multi-chain crawler cataloging strictly verified, permission-based reward programs.
          </p>
        </div>

        <button
          onClick={executeManualOpportunitySweep}
          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-cyan-600/20 cursor-pointer"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Run Ecosystem Scout Sweep</span>
        </button>
      </div>

      {/* Section 37 Consumer Protection Disclosure Banner */}
      <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            <strong className="text-slate-200">Section 37 Consumer Protection Disclosure:</strong> All rewards shown are <em>estimated potentials</em> based on protocol rules and historical yields. Zero "guaranteed profit" or "risk-free" claims permitted.
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-500 uppercase shrink-0 hidden md:block">
          Section 46 3-Layer Cleared
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by project name, title, or ID..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={chainFilter}
              onChange={e => setChainFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 font-mono focus:outline-none"
            >
              {chains.map(c => (
                <option key={c} value={c}>{c === 'ALL' ? 'All Networks' : c}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 font-mono focus:outline-none"
            >
              <option value="ALL">All Policy States</option>
              <option value="APPROVED">Approved (Autonomous)</option>
              <option value="HUMAN_APPROVAL_REQUIRED">Owner Sign-off Required</option>
              <option value="REJECTED">Policy Blocked / Fraud</option>
            </select>
          </div>
        </div>

        {/* Category Horizontal Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-md text-[11px] font-mono transition-colors whitespace-nowrap cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-slate-800 text-cyan-400 font-semibold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950'
              }`}
            >
              {cat === 'ALL' ? 'All Categories' : cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Opportunities Grid / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(opp => {
          const profitCalc = ProfitabilityEngine.calculate(opp, policy.minExpectedNetProfitUSD);
          const isApproved = opp.status === 'APPROVED';
          const isPendingHuman = opp.status === 'HUMAN_APPROVAL_REQUIRED';
          const isRejected = opp.status === 'REJECTED';

          const l1Passed = opp.threeLayerVerification?.layer1Security.passed ?? (opp.riskScore <= 35);
          const l2Passed = (opp.threeLayerVerification?.layer2Compliance.status === 'COMPLIANCE_APPROVED' || opp.threeLayerVerification?.layer2Compliance.complianceDirectorSigned) ?? (opp.status !== 'REJECTED');
          const l3Passed = opp.threeLayerVerification?.layer3Financial.passed ?? (opp.expectedNetProfit >= policy.minExpectedNetProfitUSD);

          return (
            <div
              key={opp.id}
              className={`p-4 bg-slate-900/40 border rounded-xl flex flex-col justify-between transition-all hover:border-slate-700 ${
                isApproved ? 'border-slate-800' :
                isPendingHuman ? 'border-amber-500/30 bg-amber-950/10' :
                'border-rose-900/40 bg-rose-950/10 opacity-75'
              }`}
            >
              <div className="space-y-3">
                {/* Header Strip */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-cyan-400">
                      {opp.chain} · {opp.category.replace('_', ' ')}
                    </span>
                    <h3 className="text-sm font-semibold text-white leading-snug">
                      {opp.title}
                    </h3>
                  </div>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded shrink-0 ${
                    isApproved ? 'text-emerald-400 bg-emerald-950/80 border border-emerald-500/30' :
                    isPendingHuman ? 'text-amber-400 bg-amber-950/80 border border-amber-500/30' :
                    'text-rose-400 bg-rose-950/80 border border-rose-500/30'
                  }`}>
                    {isApproved ? 'APPROVED' : isPendingHuman ? 'SIGN-OFF REQ' : 'REJECTED'}
                  </span>
                </div>

                <div className="text-xs text-slate-400 flex items-center justify-between">
                  <span className="text-slate-300 font-medium">{opp.project}</span>
                  {opp.regulatoryClassification && (
                    <span className="text-[9px] font-mono bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800">
                      {opp.regulatoryClassification.replace('_', ' ')}
                    </span>
                  )}
                </div>

                {/* Section 46: 3-Layer Verification Status */}
                <div className="p-2 bg-slate-950/60 border border-slate-800/80 rounded-lg text-[10px] font-mono space-y-1">
                  <div className="text-slate-500 uppercase text-[9px] font-semibold flex items-center justify-between">
                    <span>Section 46 3-Layer Check</span>
                    <span className="text-purple-400">Pre-Flight</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-center">
                    <div className={`p-1 rounded ${l1Passed ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/20' : 'bg-rose-950 text-rose-300'}`}>
                      L1: Sec {l1Passed ? '✓' : '✗'}
                    </div>
                    <div className={`p-1 rounded ${l2Passed ? 'bg-purple-950/60 text-purple-300 border border-purple-500/20' : 'bg-rose-950 text-rose-300'}`}>
                      L2: Reg {l2Passed ? '✓' : '✗'}
                    </div>
                    <div className={`p-1 rounded ${l3Passed ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/20' : 'bg-rose-950 text-rose-300'}`}>
                      L3: Fin {l3Passed ? '✓' : '✗'}
                    </div>
                  </div>
                </div>

                {/* Profit Breakdown Box */}
                <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-lg space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[10px] text-slate-500 uppercase">Estimated Potential:</span>
                    <span className="text-slate-200 font-semibold">${opp.expectedGrossReward.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span>Gas + Infra + AI cost:</span>
                    <span>-${(opp.estimatedGasCost + opp.estimatedInfraCost + opp.estimatedAiCost + 0.01).toFixed(2)}</span>
                  </div>
                  <div className="pt-1 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300 font-semibold">Expected Net Profit:</span>
                    <span className={`font-bold ${opp.expectedNetProfit >= policy.minExpectedNetProfitUSD ? 'text-emerald-400' : 'text-rose-400'}`}>
                      +${opp.expectedNetProfit.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Risk & Safety */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Risk Score:</span>
                  <span className={
                    opp.riskScore <= 15 ? 'text-emerald-400' :
                    opp.riskScore <= 35 ? 'text-amber-400' : 'text-rose-400'
                  }>
                    {opp.riskScore} / 100
                  </span>
                </div>

                {opp.statusReason && (
                  <p className="text-[11px] text-amber-300/90 leading-tight bg-amber-950/30 p-2 rounded border border-amber-500/20">
                    {opp.statusReason}
                  </p>
                )}
              </div>

              {/* Action Buttons Section 54 */}
              <div className="pt-4 mt-3 border-t border-slate-800/60 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedOpportunity(opp)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  VIEW DETAILS
                </button>

                {isPendingHuman ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        const matchApp = approvals.find(a => a.payload?.opportunityId === opp.id);
                        if (matchApp) {
                          setSelectedApproval(matchApp);
                        } else {
                          setActiveView('approvals');
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-sm cursor-pointer"
                    >
                      REVIEW
                    </button>
                    <button
                      disabled
                      title="The Start button is disabled while human compliance review is pending."
                      className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium text-slate-500 bg-slate-900 border border-slate-800 cursor-not-allowed opacity-60"
                    >
                      START (LOCKED)
                    </button>
                  </div>
                ) : isApproved ? (
                  <button
                    onClick={() => {
                      // execute task or queue
                      alert(`Queued execution worker for: ${opp.title}`);
                    }}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all shadow-sm shadow-emerald-500/20 cursor-pointer"
                  >
                    START
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedOpportunity(opp)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-mono text-rose-300 bg-rose-950/60 border border-rose-500/30 hover:bg-rose-900/60 transition-colors"
                    >
                      WHY BLOCKED?
                    </button>
                    <button
                      disabled
                      title="Start is disabled for blocked opportunities."
                      className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium text-slate-600 bg-slate-900 border border-slate-800 cursor-not-allowed opacity-50"
                    >
                      START (BLOCKED)
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Deep Inspection Drawer / Modal */}
      {selectedOpportunity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedOpportunity(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              ✕
            </button>

            <div className="mb-4">
              <span className="text-[10px] font-mono text-cyan-400 uppercase">
                {selectedOpportunity.chain} · {selectedOpportunity.category}
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {selectedOpportunity.title}
              </h2>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <span>{selectedOpportunity.project}</span>
                <span>·</span>
                <a 
                  href={selectedOpportunity.sourceUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-cyan-400 hover:underline flex items-center gap-1"
                >
                  Official Source <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Section 46 3-Layer Verification Breakdown */}
            <div className="p-4 bg-slate-950 border border-purple-500/30 rounded-xl mb-4 space-y-2">
              <div className="text-xs font-semibold text-purple-300 font-mono flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-purple-400" />
                SECTION 46 · THREE-LAYER APPROVAL PIPELINE
              </div>
              <div className="grid grid-cols-3 gap-2 font-mono text-center text-xs pt-1">
                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-500">LAYER 1</div>
                  <div className="text-emerald-400 font-bold">Security ✓</div>
                  <div className="text-[9px] text-slate-400">Risk {selectedOpportunity.riskScore}/100</div>
                </div>
                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-500">LAYER 2</div>
                  <div className="text-purple-400 font-bold">Compliance ✓</div>
                  <div className="text-[9px] text-slate-400">ToS & AML Cleared</div>
                </div>
                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-500">LAYER 3</div>
                  <div className="text-cyan-400 font-bold">Profitability ✓</div>
                  <div className="text-[9px] text-slate-400">+${selectedOpportunity.expectedNetProfit.toFixed(2)} Net</div>
                </div>
              </div>
            </div>

            {/* Section 38 Terms of Service & Permission */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl mb-4 space-y-1.5 text-xs font-mono">
              <div className="text-slate-400 font-semibold flex items-center gap-1">
                <FileCheck2 className="w-3.5 h-3.5 text-cyan-400" />
                SECTION 38 · THIRD-PARTY TERMS & AUTOMATION GATE
              </div>
              <div className="text-[11px] text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Source URL:</span>
                  <span className="text-slate-300 truncate max-w-[250px]">{selectedOpportunity.sourceUrl}</span>
                </div>
                <div className="flex justify-between">
                  <span>Verified Official Program:</span>
                  <span className="text-emerald-400">{selectedOpportunity.verifiedOfficial ? 'Yes (Verified)' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Anti-Bypass Compliance:</span>
                  <span className="text-emerald-400">Enforced (Zero bot/CAPTCHA bypass)</span>
                </div>
              </div>
            </div>

            {/* Profitability Formula Demonstration */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl mb-4 space-y-2">
              <div className="text-xs font-semibold text-slate-200 font-mono flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                PROFITABILITY FORMULA RECONCILIATION
              </div>
              <div className="text-[11px] text-slate-400 font-mono space-y-1">
                <div className="flex justify-between">
                  <span>Gross Reward:</span>
                  <span className="text-white">${selectedOpportunity.expectedGrossReward.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>- Gas Cost:</span>
                  <span>${selectedOpportunity.estimatedGasCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>- Infrastructure Cost:</span>
                  <span>${selectedOpportunity.estimatedInfraCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>- AI Orchestration Cost:</span>
                  <span>${selectedOpportunity.estimatedAiCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>- RPC & Simulation Fee:</span>
                  <span>$0.01</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-xs text-emerald-400">
                  <span>Expected Net Profit:</span>
                  <span>${selectedOpportunity.expectedNetProfit.toFixed(2)}</span>
                </div>
                <div className="text-[10px] text-slate-500 pt-1">
                  Threshold Check: ${selectedOpportunity.expectedNetProfit.toFixed(2)} &gt;= ${policy.minExpectedNetProfitUSD.toFixed(2)} (Configured minimum)
                </div>
              </div>
            </div>

            {/* Smart Contract & Execution Steps */}
            {selectedOpportunity.smartContractAddress && (
              <div className="mb-4 space-y-1">
                <div className="text-[10px] text-slate-500 font-mono uppercase">Target Smart Contract</div>
                <div className="font-mono text-xs text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800 break-all select-all">
                  {selectedOpportunity.smartContractAddress}
                </div>
              </div>
            )}

            {/* Execution Steps */}
            <div className="mb-4 space-y-1.5">
              <div className="text-[10px] text-slate-500 font-mono uppercase">Sandboxed Execution Workflow</div>
              <ul className="text-xs text-slate-300 space-y-1 font-mono list-decimal pl-4">
                {selectedOpportunity.executionSteps.map((step, idx) => (
                  <li key={idx} className="text-slate-300">{step}</li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedOpportunity(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium cursor-pointer"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
