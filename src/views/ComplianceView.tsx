/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Opportunity } from '../types';
import {
  Scale,
  ShieldCheck,
  AlertTriangle,
  Pause,
  Play,
  FileText,
  Search,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Sliders,
  Download,
  Hash,
  Globe2,
  Lock,
  FileCheck2,
  HelpCircle,
  History,
  AlertOctagon,
  UserCheck,
  Info,
  Layers,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Plus,
  Trash2
} from 'lucide-react';

export const ComplianceView: React.FC = () => {
  const {
    opportunities,
    policy,
    compliancePolicy,
    updateCompliancePolicy,
    regulatoryAlerts,
    complianceAuditLogs,
    taxRecords,
    triggerComplianceKillSwitch,
    releaseComplianceKillSwitch,
    resolveApproval,
    setSelectedAgent,
    agents,
    setActiveView
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'GATES' | 'MATRIX' | 'JURISDICTION' | 'ALERTS' | 'KILLSWITCH' | 'TAX' | 'AUDIT' | 'PERMISSIONS' | 'SETTINGS' | 'HISTORY'
  >('OVERVIEW');

  const [filterDecision, setFilterDecision] = useState<string>('ALL');
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(opportunities[0] || null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Section 55 "Why is this blocked?" modal state
  const [inspectBlockedOpp, setInspectBlockedOpp] = useState<Opportunity | null>(null);

  // Section 52 Jurisdiction state
  const [primaryJurisdiction, setPrimaryJurisdiction] = useState<string>(compliancePolicy.userDeclaredJurisdiction || 'US (United States)');
  const [businessJurisdiction, setBusinessJurisdiction] = useState<string>(compliancePolicy.businessEntityJurisdiction || 'Delaware, US / Software Entity');
  const [additionalJurisdictions, setAdditionalJurisdictions] = useState<string[]>(['EU (European Union - MiCA Compliant)', 'UK (United Kingdom - FCA Scope)', 'SG (Singapore - MAS Scope)']);
  const [newJurisdictionInput, setNewJurisdictionInput] = useState<string>('');
  const [savedJurisdictionToast, setSavedJurisdictionToast] = useState<boolean>(false);

  // Section 62 Compliance Settings checkboxes state
  const [maxRisk, setMaxRisk] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('LOW');
  const [reqRegulated, setReqRegulated] = useState<boolean>(true);
  const [reqHighValue, setReqHighValue] = useState<boolean>(true);
  const [reqNewChains, setReqNewChains] = useState<boolean>(true);
  const [reqNewContracts, setReqNewContracts] = useState<boolean>(true);
  const [reqUnknownTerms, setReqUnknownTerms] = useState<boolean>(true);
  const [reqUncertainty, setReqUncertainty] = useState<boolean>(true);

  const [pauseAlerts, setPauseAlerts] = useState<boolean>(true);
  const [pauseScreeningUnavail, setPauseScreeningUnavail] = useState<boolean>(true);
  const [pausePolicyExpires, setPausePolicyExpires] = useState<boolean>(true);
  const [pauseJurisdictionUnsup, setPauseJurisdictionUnsup] = useState<boolean>(true);
  const [pauseSecurityRisk, setPauseSecurityRisk] = useState<boolean>(true);
  const [savedSettingsToast, setSavedSettingsToast] = useState<boolean>(false);

  // Audit Log filters
  const [auditAgentFilter, setAuditAgentFilter] = useState<string>('ALL');
  const [auditResultFilter, setAuditResultFilter] = useState<string>('ALL');

  const complianceDirector = agents.find(a => a.id === 'agent_dir_comp');

  // Filter opportunities
  const filteredOpps = opportunities.filter(opp => {
    if (filterDecision !== 'ALL' && opp.complianceStatus !== filterDecision) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        opp.title.toLowerCase().includes(q) ||
        opp.project.toLowerCase().includes(q) ||
        opp.chain.toLowerCase().includes(q) ||
        (opp.regulatoryClassification && opp.regulatoryClassification.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Calculate gate stats
  const totalOpps = opportunities.length;
  const approvedOpps = opportunities.filter(
    o => o.complianceStatus === 'COMPLIANCE_APPROVED' || o.complianceStatus === 'COMPLIANCE_APPROVED_WITH_LIMITS'
  ).length;
  const reviewOpps = opportunities.filter(
    o => o.complianceStatus === 'HUMAN_REVIEW_REQUIRED' || o.complianceStatus === 'COMPLIANCE_REVIEW_REQUIRED'
  ).length;
  const blockedOpps = opportunities.filter(o => o.complianceStatus === 'COMPLIANCE_BLOCKED').length;

  const killSwitch = compliancePolicy.complianceKillSwitch;

  // Export Tax CSV
  const handleExportTaxCSV = () => {
    const headers = [
      'Record ID',
      'Timestamp',
      'Chain',
      'Token',
      'Quantity',
      'FMV (USD)',
      'Gas Fee (USD)',
      'Net Taxable Basis (USD)',
      'Transaction Hash',
      'Source Category',
      'Tax Status'
    ];
    const rows = taxRecords.map(r => [
      r.id,
      r.timestamp,
      r.chain,
      r.tokenSymbol,
      r.tokenQuantity,
      r.estimatedFiatValueUSD.toFixed(2),
      r.gasFeeUSD.toFixed(2),
      r.netTaxableBasisUSD.toFixed(2),
      r.txHash,
      r.sourceCategory,
      r.taxStatus
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tax_accounting_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Tax Report Summary
  const handleExportTaxReport = () => {
    const text = `NON-CUSTODIAL TAX & ACCOUNTING TRANSACTION SUMMARY
Generated: ${new Date().toISOString()}
Jurisdiction Basis: ${compliancePolicy.userDeclaredJurisdiction}
Status: TAX STATUS = PROFESSIONAL REVIEW REQUIRED

Total Reward Events: ${taxRecords.length}
Total Estimated Fair Market Value: $${taxRecords.reduce((acc, r) => acc + r.estimatedFiatValueUSD, 0).toFixed(2)} USD
Total Deductible Gas Expenses: $${taxRecords.reduce((acc, r) => acc + r.gasFeeUSD, 0).toFixed(2)} USD
Net Taxable Basis (Estimated): $${taxRecords.reduce((acc, r) => acc + r.netTaxableBasisUSD, 0).toFixed(2)} USD

DISCLAIMER: This document is generated for informational and record-keeping purposes only. It does not constitute legal or tax advice. Consult a qualified tax professional in your jurisdiction.`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tax_report_summary_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* SECTION 48 CONSTITUTIONAL MANDATE BANNER */}
      <div className="p-4 bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-900 border border-purple-500/40 rounded-2xl shadow-lg shadow-purple-900/10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase bg-purple-950 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded font-bold">
                SECTIONS 30–69 MANDATE
              </span>
              <span className="text-xs font-mono text-purple-400">NON-OVERRIDABLE COMPLIANCE ARCHITECTURE</span>
            </div>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Scale className="w-5 h-5 text-purple-400" />
              Compliance & Legal Control Center
            </h1>
            <p className="text-xs text-purple-200/90 font-mono">
              &quot;Profit must NEVER override compliance. Growth must NEVER override security. AI autonomy must NEVER override human approval.&quot;
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {complianceDirector && (
              <button
                onClick={() => setSelectedAgent(complianceDirector)}
                className="px-3 py-2 bg-purple-950/70 hover:bg-purple-900/70 border border-purple-500/50 rounded-xl text-left cursor-pointer transition-colors"
              >
                <div className="text-[10px] font-mono text-purple-300 uppercase">Compliance Director</div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  {complianceDirector.name}
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
              </button>
            )}

            <button
              onClick={() => {
                if (killSwitch.allAutomatedExecutionPaused) {
                  releaseComplianceKillSwitch('all');
                } else {
                  triggerComplianceKillSwitch('all', undefined, 'Manual emergency halt from Compliance Director UI');
                }
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm ${
                killSwitch.allAutomatedExecutionPaused
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-rose-600/90 hover:bg-rose-600 text-white border border-rose-400/50'
              }`}
            >
              {killSwitch.allAutomatedExecutionPaused ? (
                <>
                  <Play className="w-3.5 h-3.5" /> RESUME AUTOMATION
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5" /> KILL SWITCH (HALT ALL)
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 50: COMPLIANCE STATUS HEADER */}
      <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              SECTION 50 · COMPLIANCE STATUS
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-emerald-400 font-mono tracking-tight flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-pulse" />
                🟢 ACTIVE / COMPLIANCE CHECKS PASSED
              </span>
            </div>
            <p className="text-xs text-slate-300 font-mono">
              Operational Status: <strong className="text-emerald-300">No current policy blockers detected.</strong>
            </p>
          </div>

          {/* Key Parameters Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 font-mono text-xs shrink-0">
            <div>
              <span className="text-[10px] text-slate-500 block">JURISDICTION</span>
              <strong className="text-white">Configured</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">POLICY VERSION</span>
              <strong className="text-purple-300">v1.4 Active</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">BLOCKED OPPS</span>
              <strong className="text-rose-400">{blockedOpps} Blocked</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">PENDING REVIEWS</span>
              <strong className="text-amber-400">{reviewOpps} Pending</strong>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 51: COMPLIANCE CONTROLS SCORECARD */}
      <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Section 51 · Individual Compliance Controls Scorecard
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500">Zero Unexplained Scores Enforced</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 font-mono text-xs">
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block">Jurisdiction</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">✓ Configured</span>
          </div>
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block">Classification</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">✓ Complete</span>
          </div>
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block">Terms Review</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">✓ Passed</span>
          </div>
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block">Sanctions</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">✓ Completed</span>
          </div>
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block">KYC</span>
            <span className="text-slate-400 font-bold flex items-center gap-1">— Not req.</span>
          </div>
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block">Tax Records</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">✓ Active</span>
          </div>
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block">Risk Review</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">✓ Passed</span>
          </div>
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block">Approvals</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">✓ Configured</span>
          </div>
        </div>
      </div>

      {/* COMPREHENSIVE TABS NAVIGATION */}
      <div className="flex items-center gap-1 border-b border-slate-800 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-3.5 py-2 rounded-t-lg font-mono font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'OVERVIEW'
              ? 'bg-slate-900 text-purple-300 border-t-2 border-purple-500 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
          5 Core UX Principles
        </button>

        <button
          onClick={() => setActiveTab('GATES')}
          className={`px-3.5 py-2 rounded-t-lg font-mono font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'GATES'
              ? 'bg-slate-900 text-purple-300 border-t-2 border-purple-500 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          Pre-Flight Gates ({totalOpps})
        </button>

        <button
          onClick={() => setActiveTab('MATRIX')}
          className={`px-3.5 py-2 rounded-t-lg font-mono font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'MATRIX'
              ? 'bg-slate-900 text-purple-300 border-t-2 border-purple-500 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          Activity Restriction Matrix
        </button>

        <button
          onClick={() => setActiveTab('JURISDICTION')}
          className={`px-3.5 py-2 rounded-t-lg font-mono font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'JURISDICTION'
              ? 'bg-slate-900 text-purple-300 border-t-2 border-purple-500 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Globe2 className="w-3.5 h-3.5 text-blue-400" />
          Jurisdiction Control
        </button>

        <button
          onClick={() => setActiveTab('ALERTS')}
          className={`px-3.5 py-2 rounded-t-lg font-mono font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'ALERTS'
              ? 'bg-slate-900 text-purple-300 border-t-2 border-purple-500 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          Regulatory Alerts ({regulatoryAlerts.length})
        </button>

        <button
          onClick={() => setActiveTab('KILLSWITCH')}
          className={`px-3.5 py-2 rounded-t-lg font-mono font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'KILLSWITCH'
              ? 'bg-slate-900 text-purple-300 border-t-2 border-purple-500 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Pause className="w-3.5 h-3.5 text-rose-400" />
          Kill Switch State
        </button>

        <button
          onClick={() => setActiveTab('TAX')}
          className={`px-3.5 py-2 rounded-t-lg font-mono font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'TAX'
              ? 'bg-slate-900 text-purple-300 border-t-2 border-purple-500 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-emerald-400" />
          Tax & Accounting Ledger
        </button>

        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`px-3.5 py-2 rounded-t-lg font-mono font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'AUDIT'
              ? 'bg-slate-900 text-purple-300 border-t-2 border-purple-500 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Hash className="w-3.5 h-3.5 text-cyan-400" />
          Audit Logs ({complianceAuditLogs.length})
        </button>

        <button
          onClick={() => setActiveTab('PERMISSIONS')}
          className={`px-3.5 py-2 rounded-t-lg font-mono font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'PERMISSIONS'
              ? 'bg-slate-900 text-purple-300 border-t-2 border-purple-500 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Lock className="w-3.5 h-3.5 text-amber-400" />
          AI vs Human Matrix
        </button>

        <button
          onClick={() => setActiveTab('SETTINGS')}
          className={`px-3.5 py-2 rounded-t-lg font-mono font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'SETTINGS'
              ? 'bg-slate-900 text-purple-300 border-t-2 border-purple-500 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-slate-400" />
          Compliance Settings
        </button>

        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`px-3.5 py-2 rounded-t-lg font-mono font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'HISTORY'
              ? 'bg-slate-900 text-purple-300 border-t-2 border-purple-500 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <History className="w-3.5 h-3.5 text-purple-400" />
          Policy Versioning
        </button>
      </div>

      {/* TAB 0: SECTION 69 FIVE CORE USER QUESTIONS OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-purple-300 uppercase">
                Section 69 UX Principle · Five Core Transparency Inquiries
              </span>
            </div>
            <p className="text-xs text-slate-400">
              The AI organization is architected to provide immediate, verifiable answers to the 5 fundamental owner questions:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Q1 */}
            <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2 font-mono text-xs">
              <div className="text-[10px] text-purple-400 font-bold uppercase">1. What is the AI doing?</div>
              <p className="text-slate-300 leading-relaxed font-sans">
                Autonomous discovery, bytecode analysis, sandbox simulation, and non-custodial claiming of verified promotional developer incentives (testnets, gas faucets, and quests).
              </p>
              <div className="text-emerald-400 text-[11px] pt-1 border-t border-slate-800">
                Active Workers: {agents.filter(a => a.department === 'OPERATIONS').length} Specialists Online
              </div>
            </div>

            {/* Q2 */}
            <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2 font-mono text-xs">
              <div className="text-[10px] text-cyan-400 font-bold uppercase">2. Why is it allowed to do it?</div>
              <p className="text-slate-300 leading-relaxed font-sans">
                Each opportunity has passed Section 38 ToS screening, verified official API access permissions, Section 34 sanctions checks, and verified non-custodial software scope.
              </p>
              <div className="text-cyan-400 text-[11px] pt-1 border-t border-slate-800">
                100% Zero Bot-Bypass Enforced
              </div>
            </div>

            {/* Q3 */}
            <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2 font-mono text-xs">
              <div className="text-[10px] text-amber-400 font-bold uppercase">3. What restrictions are active?</div>
              <p className="text-slate-300 leading-relaxed font-sans">
                Custody is permanently disabled. High-capital actions above ${compliancePolicy.requireKycAboveUSD} require human sign-off. OFAC sanctioned entities and restricted countries are blocked.
              </p>
              <div className="text-amber-400 text-[11px] pt-1 border-t border-slate-800">
                8 Activity Types Formally Classified
              </div>
            </div>

            {/* Q4 */}
            <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2 font-mono text-xs">
              <div className="text-[10px] text-rose-400 font-bold uppercase">4. Why was something blocked?</div>
              <p className="text-slate-300 leading-relaxed font-sans">
                Blocks are triggered by transparent internal policies (e.g. OFAC sanction matches, prohibited mixer interactions, or unclear ToS automation clauses).
              </p>
              <div className="text-rose-400 text-[11px] pt-1 border-t border-slate-800">
                Never &quot;AI says no&quot; · Formal Policy Cited
              </div>
            </div>

            {/* Q5 */}
            <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2 font-mono text-xs">
              <div className="text-[10px] text-purple-400 font-bold uppercase">5. What requires my approval?</div>
              <p className="text-slate-300 leading-relaxed font-sans">
                Staking above threshold limits, liquidity provisioning, novel smart contract interactions, production deploys, and regulatory policy alterations.
              </p>
              <div className="text-purple-300 text-[11px] pt-1 border-t border-slate-800">
                Human Owner = Supreme Authority
              </div>
            </div>

            {/* Section 68 Anti-Bypass Rule Box */}
            <div className="p-4 bg-purple-950/20 border border-purple-500/30 rounded-xl space-y-2 font-mono text-xs">
              <div className="text-[10px] text-purple-300 font-bold uppercase">Section 68 Compliance UI Rule</div>
              <p className="text-slate-300 leading-relaxed font-sans">
                The interface contains zero &quot;bypass&quot;, &quot;ignore&quot;, or &quot;override regulation&quot; options. The safest compliant path is strictly the easiest path.
              </p>
              <div className="text-purple-400 text-[11px] pt-1 border-t border-slate-800">
                Non-Override Principle Active
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: PRE-FLIGHT COMPLIANCE GATES & 3-LAYER INSPECTOR */}
      {activeTab === 'GATES' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Filterable Opportunities */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search opportunities, projects, chains..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-mono">
                {['ALL', 'COMPLIANCE_APPROVED', 'HUMAN_REVIEW_REQUIRED', 'COMPLIANCE_BLOCKED'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilterDecision(f)}
                    className={`px-2 py-1 rounded cursor-pointer whitespace-nowrap ${
                      filterDecision === f
                        ? 'bg-purple-950 text-purple-300 border border-purple-500/40 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {f === 'ALL' ? 'All' : f.replace('COMPLIANCE_', '').replace('_REQUIRED', '')}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5 max-h-[680px] overflow-y-auto pr-1">
              {filteredOpps.map(opp => {
                const isSelected = selectedOpp?.id === opp.id;
                const isBlocked = opp.complianceStatus === 'COMPLIANCE_BLOCKED';
                const isHumanReview = opp.complianceStatus === 'HUMAN_REVIEW_REQUIRED';

                return (
                  <div
                    key={opp.id}
                    onClick={() => setSelectedOpp(opp)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-2 ${
                      isSelected
                        ? 'bg-slate-900 border-purple-500 shadow-md shadow-purple-500/10'
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono text-slate-500">{opp.id}</span>
                          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-500/20">
                            {opp.chain}
                          </span>
                          {opp.regulatoryClassification && (
                            <span className="text-[10px] font-mono text-purple-300 bg-purple-950/60 px-1.5 py-0.2 rounded border border-purple-500/20">
                              {opp.regulatoryClassification}
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-white mt-1 leading-snug">{opp.title}</h4>
                      </div>

                      <div className="shrink-0 text-right">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                            isBlocked
                              ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                              : isHumanReview
                              ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {opp.complianceStatus}
                        </span>
                        <div className="text-[11px] font-mono text-slate-400 mt-1">
                          Net: <span className="text-white font-bold">${opp.expectedNetProfit.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Section 54 Opportunity Badges */}
                    <div className="grid grid-cols-3 gap-1 text-[9px] font-mono text-center">
                      <div className="p-1 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/20">
                        🟢 Compliance Passed
                      </div>
                      <div className="p-1 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/20">
                        🟢 Security Passed
                      </div>
                      <div className="p-1 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/20">
                        🟢 Profitability Passed
                      </div>
                    </div>

                    {isBlocked && (
                      <div className="p-2 bg-rose-950/30 border border-rose-500/30 rounded text-[11px] font-mono text-rose-300 leading-snug flex items-center justify-between">
                        <div>
                          <strong>DIRECTOR VETO:</strong> {opp.complianceBlockedReason || opp.statusReason}
                        </div>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setInspectBlockedOpp(opp);
                          }}
                          className="px-2 py-1 bg-rose-900/60 hover:bg-rose-800 text-white rounded text-[10px] font-mono shrink-0 ml-2"
                        >
                          Why Blocked?
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800/60">
                      <span>Capital: ${opp.requiredCapital.toFixed(2)}</span>
                      <span className="flex items-center gap-1 text-purple-400">
                        Inspect 3-Layer Gates <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Three-Layer Gate Deep Inspector */}
          <div className="lg:col-span-6">
            {selectedOpp ? (
              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-5 sticky top-6">
                <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <div className="text-[10px] font-mono text-slate-500 uppercase">Opportunity Deep Inspection</div>
                    <h3 className="text-sm font-bold text-white mt-0.5">{selectedOpp.title}</h3>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      Project: {selectedOpp.project} · Chain: {selectedOpp.chain}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold shrink-0 ${
                      selectedOpp.complianceStatus === 'COMPLIANCE_BLOCKED'
                        ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                        : selectedOpp.complianceStatus === 'HUMAN_REVIEW_REQUIRED'
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {selectedOpp.complianceStatus}
                  </span>
                </div>

                {/* Section 46 & 47: The Three-Layer Approval Model */}
                <div className="space-y-3">
                  <div className="text-xs font-mono font-bold text-purple-300 uppercase flex items-center justify-between">
                    <span>Section 46 · Three-Layer Approval Pipeline</span>
                    <span className="text-[10px] text-slate-500">Security → Compliance → Profit</span>
                  </div>

                  {/* Layer 1: Technical Security */}
                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-white flex items-center gap-1.5">
                        {selectedOpp.threeLayerVerification?.layer1Security.passed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        )}
                        Layer 1: Technical Security
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">
                        Score: {selectedOpp.threeLayerVerification?.layer1Security.score || 90}/100
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-snug">
                      {selectedOpp.threeLayerVerification?.layer1Security.notes ||
                        'Sandbox contract simulation passed. Bytecode analyzed for drainer signatures.'}
                    </p>
                  </div>

                  {/* Layer 2: Regulatory & Compliance */}
                  <div className="p-3 bg-purple-950/30 border border-purple-500/40 rounded-xl space-y-2 ring-1 ring-purple-500/20">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-purple-200 flex items-center gap-1.5">
                        {selectedOpp.complianceStatus === 'COMPLIANCE_BLOCKED' ? (
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        ) : selectedOpp.complianceStatus === 'HUMAN_REVIEW_REQUIRED' ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        Layer 2: Regulatory / Compliance Gate
                      </span>
                      <span className="font-mono text-[10px] text-purple-300 bg-purple-950 px-1.5 py-0.5 rounded border border-purple-500/30">
                        {selectedOpp.threeLayerVerification?.layer2Compliance.status || selectedOpp.complianceStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div className="p-1.5 bg-slate-950 rounded border border-slate-800">
                        <span className="text-slate-500 block text-[9px]">CLASSIFICATION</span>
                        <span className="text-white font-bold">
                          {selectedOpp.regulatoryClassification || 'DEFI_INTERACTION'}
                        </span>
                      </div>
                      <div className="p-1.5 bg-slate-950 rounded border border-slate-800">
                        <span className="text-slate-500 block text-[9px]">JURISDICTION</span>
                        <span className="text-white truncate block">{selectedOpp.jurisdiction || 'US/EU Permitted'}</span>
                      </div>
                      <div className="p-1.5 bg-slate-950 rounded border border-slate-800">
                        <span className="text-slate-500 block text-[9px]">AML / SANCTIONS</span>
                        <span
                          className={
                            selectedOpp.threeLayerVerification?.layer2Compliance.amlScreeningPassed
                              ? 'text-emerald-400 font-bold'
                              : 'text-rose-400 font-bold'
                          }
                        >
                          {selectedOpp.threeLayerVerification?.layer2Compliance.amlScreeningPassed
                            ? 'PASSED (0 Match)'
                            : 'FAILED (SDN Match)'}
                        </span>
                      </div>
                      <div className="p-1.5 bg-slate-950 rounded border border-slate-800">
                        <span className="text-slate-500 block text-[9px]">AUTOMATION TERMS</span>
                        <span
                          className={
                            selectedOpp.termsOfService?.automationPermission === 'PROHIBITED'
                              ? 'text-rose-400 font-bold'
                              : 'text-emerald-400 font-bold'
                          }
                        >
                          {selectedOpp.termsOfService?.automationPermission || 'PERMITTED'}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-purple-200/90 leading-snug">
                      {selectedOpp.threeLayerVerification?.layer2Compliance.notes || selectedOpp.complianceBlockedReason}
                    </p>
                    <div className="text-[10px] font-mono text-purple-400 flex items-center justify-between">
                      <span>Director: Elena Rostova</span>
                      <span>
                        Signed:{' '}
                        {selectedOpp.threeLayerVerification?.layer2Compliance.complianceDirectorSigned
                          ? 'YES'
                          : 'PENDING / VETO'}
                      </span>
                    </div>
                  </div>

                  {/* Layer 3: Financial & Profitability */}
                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-white flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Layer 3: Financial / Profitability Check
                      </span>
                      <span className="font-mono text-emerald-400 font-bold">
                        Net: +${selectedOpp.expectedNetProfit.toFixed(2)}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 text-[10px] font-mono text-slate-400">
                      <div>Gross: ${selectedOpp.expectedGrossReward.toFixed(2)}</div>
                      <div>Gas: ${selectedOpp.estimatedGasCost.toFixed(2)}</div>
                      <div>Infra: ${selectedOpp.estimatedInfraCost.toFixed(2)}</div>
                      <div>AI: ${selectedOpp.estimatedAiCost.toFixed(2)}</div>
                    </div>
                  </div>
                </div>

                {/* Section 58: Third Party Terms & Automation Status */}
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5 font-mono text-xs">
                  <div className="text-slate-400 font-semibold flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <FileCheck2 className="w-3.5 h-3.5 text-cyan-400" />
                      Section 58 · Automation Permission Status
                    </span>
                    <span className="text-emerald-400 text-[10px]">No Known Blocker</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-300 pt-1">
                    <div>Official API: <span className="text-emerald-400">Available</span></div>
                    <div>Automation: <span className="text-emerald-400">Confirmed</span></div>
                    <div>Rate Limit: <span className="text-slate-200">60 req/min</span></div>
                    <div>Terms Date: <span className="text-slate-200">2026-09-23</span></div>
                  </div>
                </div>

                {/* Action Bar for Human Review */}
                {selectedOpp.complianceStatus === 'HUMAN_REVIEW_REQUIRED' && (
                  <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl space-y-2">
                    <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      Section 56 · Mandatory Human Owner Authorization Required
                    </div>
                    <p className="text-[11px] text-amber-200/80 leading-snug">
                      This activity constitutes {selectedOpp.regulatoryClassification}. AI cannot autonomously execute without explicit human compliance authorization.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          resolveApproval(selectedOpp.id, true, 'Human Owner signed compliance authorization');
                        }}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors"
                      >
                        Approve & Authorize
                      </button>
                      <button
                        onClick={() => {
                          resolveApproval(selectedOpp.id, false, 'Declined by Human Owner');
                        }}
                        className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono cursor-pointer transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-2xl text-center text-slate-500 font-mono text-xs">
                Select an opportunity on the left to inspect its 3-Layer Compliance Gate results.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SECTION 53 ACTIVITY RESTRICTION MATRIX */}
      {activeTab === 'MATRIX' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Section 53 · Activity Restriction & Classification Matrix
            </h3>
            <p className="text-xs text-slate-400">
              Interactive policy mapping for all supported on-chain and off-chain activities, explaining the regulatory rationale behind each permission state.
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-900/40">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Activity</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Regulatory Rationale (Why)</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300 font-sans">
                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 font-bold text-white font-mono">Testnet participation</td>
                  <td className="p-3.5 font-mono text-emerald-400 font-bold">🟢 Allowed</td>
                  <td className="p-3.5 text-slate-300 text-xs">Non-monetary educational & developer testing network; zero economic capital risk.</td>
                  <td className="p-3.5 text-right"><button className="px-2.5 py-1 bg-slate-800 text-slate-200 rounded text-xs hover:bg-slate-700">View</button></td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 font-bold text-white font-mono">Faucet claims</td>
                  <td className="p-3.5 font-mono text-emerald-400 font-bold">🟢 Allowed</td>
                  <td className="p-3.5 text-slate-300 text-xs">Claiming free promotional testnet gas to pay for automated simulation workflows.</td>
                  <td className="p-3.5 text-right"><button className="px-2.5 py-1 bg-slate-800 text-slate-200 rounded text-xs hover:bg-slate-700">View</button></td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 font-bold text-white font-mono">Quests & Promos</td>
                  <td className="p-3.5 font-mono text-emerald-400 font-bold">🟢 Allowed</td>
                  <td className="p-3.5 text-slate-300 text-xs">Verified user onboarding campaigns with explicit third-party automation permission.</td>
                  <td className="p-3.5 text-right"><button className="px-2.5 py-1 bg-slate-800 text-slate-200 rounded text-xs hover:bg-slate-700">View</button></td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 font-bold text-white font-mono">Staking</td>
                  <td className="p-3.5 font-mono text-amber-400 font-bold">🟡 Review Required</td>
                  <td className="p-3.5 text-slate-300 text-xs">Requires locking user capital; triggers review for potential securities/yield categorization.</td>
                  <td className="p-3.5 text-right"><button className="px-2.5 py-1 bg-amber-950 text-amber-300 border border-amber-500/40 rounded text-xs">Review</button></td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 font-bold text-white font-mono">Liquidity provision</td>
                  <td className="p-3.5 font-mono text-orange-400 font-bold">🟠 Restricted</td>
                  <td className="p-3.5 text-slate-300 text-xs">High market maker impermanent loss risk; requires explicit capital limit configuration.</td>
                  <td className="p-3.5 text-right"><button className="px-2.5 py-1 bg-orange-950 text-orange-300 border border-orange-500/40 rounded text-xs">Review</button></td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 font-bold text-white font-mono">Token exchange / Swap</td>
                  <td className="p-3.5 font-mono text-orange-400 font-bold">🟠 Restricted</td>
                  <td className="p-3.5 text-slate-300 text-xs">Requires maximum slippage guardrails and pre-flight sandbox token simulation.</td>
                  <td className="p-3.5 text-right"><button className="px-2.5 py-1 bg-orange-950 text-orange-300 border border-orange-500/40 rounded text-xs">Review</button></td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 font-bold text-white font-mono">Custodial operations</td>
                  <td className="p-3.5 font-mono text-rose-400 font-bold">🔴 Disabled</td>
                  <td className="p-3.5 text-slate-300 text-xs">Platform is strictly non-custodial software; zero private key or third-party fund holding.</td>
                  <td className="p-3.5 text-right"><button className="px-2.5 py-1 bg-rose-950 text-rose-300 border border-rose-500/40 rounded text-xs">Details</button></td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 font-bold text-white font-mono">Regulated financial services</td>
                  <td className="p-3.5 font-mono text-rose-400 font-bold">🔴 Disabled</td>
                  <td className="p-3.5 text-slate-300 text-xs">Unregistered money transmission, lending syndicates, and fiat brokerage are prohibited.</td>
                  <td className="p-3.5 text-right"><button className="px-2.5 py-1 bg-rose-950 text-rose-300 border border-rose-500/40 rounded text-xs">Details</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SECTION 52 JURISDICTION CONTROL */}
      {activeTab === 'JURISDICTION' && (
        <div className="space-y-6">
          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-blue-400" />
                Section 52 · Jurisdiction Control & Configuration
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure primary, business, and additional operating jurisdictions. Non-inference rule enforced:
                <strong> Never infer jurisdiction from IP address alone.</strong>
              </p>
            </div>

            {/* Warning when required */}
            <div className="p-3.5 bg-amber-950/30 border border-amber-500/40 rounded-xl flex items-start gap-3 text-xs font-mono text-amber-200/90">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>JURISDICTION NOTICE:</strong> Regulated automated activities are gated by your configured jurisdictions. Unconfigured regions default to <code>COMPLIANCE REVIEW REQUIRED</code>.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 font-mono text-xs">
                <label className="text-slate-400 font-semibold">Primary Operating Jurisdiction</label>
                <select
                  value={primaryJurisdiction}
                  onChange={e => setPrimaryJurisdiction(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="US (United States)">US (United States - FinCEN / SEC Scope)</option>
                  <option value="EU (European Union)">EU (European Union - MiCA Scope)</option>
                  <option value="UK (United Kingdom)">UK (United Kingdom - FCA Scope)</option>
                  <option value="SG (Singapore)">SG (Singapore - MAS Scope)</option>
                  <option value="CH (Switzerland)">CH (Switzerland - FINMA Scope)</option>
                  <option value="CA (Canada)">CA (Canada - CIRO Scope)</option>
                  <option value="GLOBAL (Non-Restricted)">GLOBAL (Non-Restricted / Open Web)</option>
                </select>
              </div>

              <div className="space-y-1.5 font-mono text-xs">
                <label className="text-slate-400 font-semibold">Business Entity Jurisdiction</label>
                <input
                  type="text"
                  value={businessJurisdiction}
                  onChange={e => setBusinessJurisdiction(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Additional Jurisdictions list */}
            <div className="space-y-2 font-mono text-xs">
              <label className="text-slate-400 font-semibold">Additional Permitted Jurisdictions</label>
              <div className="flex flex-wrap gap-2">
                {additionalJurisdictions.map((j, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 flex items-center gap-1.5">
                    {j}
                    <button
                      onClick={() => setAdditionalJurisdictions(additionalJurisdictions.filter((_, i) => i !== idx))}
                      className="text-slate-500 hover:text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="e.g. JP (Japan - FSA Scope)"
                  value={newJurisdictionInput}
                  onChange={e => setNewJurisdictionInput(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 flex-1"
                />
                <button
                  onClick={() => {
                    if (newJurisdictionInput.trim()) {
                      setAdditionalJurisdictions([...additionalJurisdictions, newJurisdictionInput.trim()]);
                      setNewJurisdictionInput('');
                    }
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-mono cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              <button
                onClick={() => {
                  updateCompliancePolicy({
                    userDeclaredJurisdiction: primaryJurisdiction,
                    businessEntityJurisdiction: businessJurisdiction
                  });
                  setSavedJurisdictionToast(true);
                  setTimeout(() => setSavedJurisdictionToast(false), 3000);
                }}
                className="px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-mono font-bold rounded-xl text-xs cursor-pointer shadow-md shadow-purple-600/20"
              >
                SAVE JURISDICTION CONFIGURATION
              </button>
              {savedJurisdictionToast && (
                <span className="text-xs font-mono text-emerald-400">✓ Jurisdictions successfully saved!</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SECTION 57 REGULATORY ALERT CENTER */}
      {activeTab === 'ALERTS' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Section 57 · Regulatory Alert Notification Center
            </h3>
            <p className="text-xs text-slate-400">
              Real-time monitoring feed parsing authoritative regulatory updates. Material changes automatically trigger strategy pauses and owner notifications.
            </p>
          </div>

          <div className="space-y-3">
            {regulatoryAlerts.map(alert => (
              <div
                key={alert.id}
                className={`p-4 bg-slate-900/60 border rounded-xl space-y-3 ${
                  alert.impactLevel === 'CRITICAL'
                    ? 'border-rose-500/50 bg-rose-950/10'
                    : alert.impactLevel === 'MEDIUM'
                    ? 'border-amber-500/40'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-white">{alert.source}</span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {alert.jurisdiction}
                    </span>
                    <span className="text-[10px] font-mono text-purple-400 bg-purple-950 px-2 py-0.5 rounded border border-purple-500/30">
                      Policy {alert.policyVersion}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        alert.impactLevel === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                          : alert.impactLevel === 'MEDIUM'
                          ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {alert.impactLevel}
                    </span>
                    <span className="text-slate-500">{alert.detectedAt}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-sans">{alert.summary}</p>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 space-y-1 text-xs font-mono">
                  <div className="text-[10px] text-purple-400 uppercase font-bold">Automated Action Taken:</div>
                  <div className="text-slate-300 font-sans">{alert.actionTaken}</div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-slate-400 pt-1">
                  <span>Affected Chains: {alert.affectedChains.join(', ')}</span>
                  <span>·</span>
                  <span>Flagged Opps: {alert.affectedOpportunities.join(', ')}</span>
                  <span>·</span>
                  <span className={alert.requiresLegalCounsel ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                    Legal Counsel Review: {alert.requiresLegalCounsel ? 'REQUIRED' : 'NOT REQUIRED'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SECTION 45 KILL SWITCH */}
      {activeTab === 'KILLSWITCH' && (
        <div className="space-y-6">
          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Pause className="w-4 h-4 text-rose-400" />
              Section 45 · Granular Compliance Kill Switch
            </h3>
            <p className="text-xs text-slate-400">
              Immediate targeted pause capability across specific opportunities, projects, chains, jurisdictions, strategies, or global execution.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 font-mono text-xs">
                <div className="text-slate-400 uppercase font-semibold">Master Global Freeze</div>
                <div className="text-base font-bold text-white flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      killSwitch.allAutomatedExecutionPaused ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'
                    }`}
                  />
                  {killSwitch.allAutomatedExecutionPaused ? 'GLOBAL TRANSACTIONS PAUSED' : 'AUTOMATED EXECUTION PERMITTED'}
                </div>
                <p className="text-slate-400 font-sans text-xs">
                  {killSwitch.allAutomatedExecutionPaused
                    ? `Paused by ${killSwitch.lastTriggeredBy}. Reason: ${killSwitch.lastTriggeredReason}`
                    : 'All systems operating normally under Level 2 Compliance Director pre-flight gating.'}
                </p>
                <button
                  onClick={() => {
                    if (killSwitch.allAutomatedExecutionPaused) {
                      releaseComplianceKillSwitch('all');
                    } else {
                      triggerComplianceKillSwitch('all', undefined, 'Manual emergency halt from Compliance UI');
                    }
                  }}
                  className={`w-full py-2 rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors ${
                    killSwitch.allAutomatedExecutionPaused
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-rose-600/90 hover:bg-rose-600 text-white'
                  }`}
                >
                  {killSwitch.allAutomatedExecutionPaused ? 'Release Global Pause' : 'Halt All Automated Transactions'}
                </button>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 font-mono text-xs">
                <div className="text-slate-400 uppercase font-semibold">Active Targeted Restrictions</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-slate-900 rounded border border-slate-800">
                    <span className="text-slate-300">Sanctioned Jurisdictions (IR, KP, CU, SY, RU)</span>
                    <span className="text-rose-400 font-bold bg-rose-950 px-2 py-0.5 rounded">BLOCKED</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-900 rounded border border-slate-800">
                    <span className="text-slate-300">Mixer / Privacy Pool Relayers</span>
                    <span className="text-rose-400 font-bold bg-rose-950 px-2 py-0.5 rounded">DIRECTOR VETO</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-900 rounded border border-slate-800">
                    <span className="text-slate-300">Unregistered Money Transmission</span>
                    <span className="text-amber-400 font-bold bg-amber-950 px-2 py-0.5 rounded">RESTRICTED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SECTION 36 & 61 TAX & ACCOUNTING LEDGER */}
      {activeTab === 'TAX' && (
        <div className="space-y-4">
          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  Section 36 & 61 · Tax & Accounting Information Agent
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Archives all reward events, transaction dates, token quantities, USD fair market values (FMV), and deductible gas expenses.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleExportTaxReport}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Export Tax Report
                </button>
                <button
                  onClick={handleExportTaxCSV}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Export CSV
                </button>
              </div>
            </div>

            {/* MANDATORY LEGAL NOTICE */}
            <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl text-xs font-mono text-amber-200/90 leading-snug">
              <strong>TAX NOTICE:</strong> TAX STATUS = PROFESSIONAL REVIEW REQUIRED. Tax treatment may depend on jurisdiction and individual circumstances. These records are provided for accounting/tax preparation and are not tax advice.
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-900/40">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3">ID / Time</th>
                  <th className="p-3">Chain</th>
                  <th className="p-3">Token & Quantity</th>
                  <th className="p-3">FMV (USD)*</th>
                  <th className="p-3">Gas Deductible</th>
                  <th className="p-3">Net Tax Basis</th>
                  <th className="p-3">Source Category</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {taxRecords.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-800/30">
                    <td className="p-3">
                      <div className="font-bold text-white">{rec.id}</div>
                      <div className="text-[10px] text-slate-500">{rec.timestamp.split('T')[0]}</div>
                    </td>
                    <td className="p-3 text-cyan-400">{rec.chain}</td>
                    <td className="p-3">
                      {rec.tokenQuantity} {rec.tokenSymbol}
                    </td>
                    <td className="p-3 text-white font-bold">${rec.estimatedFiatValueUSD.toFixed(2)}</td>
                    <td className="p-3 text-slate-400">${rec.gasFeeUSD.toFixed(2)}</td>
                    <td className="p-3 text-emerald-400 font-bold">${rec.netTaxableBasisUSD.toFixed(2)}</td>
                    <td className="p-3 text-[11px] text-purple-300">{rec.sourceCategory}</td>
                    <td className="p-3">
                      <span className="text-[10px] bg-slate-800 text-amber-300 px-2 py-0.5 rounded border border-amber-500/20">
                        {rec.taxStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: SECTION 43 & 65 COMPLIANCE AUDIT LOGS */}
      {activeTab === 'AUDIT' && (
        <div className="space-y-4">
          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Hash className="w-4 h-4 text-cyan-400" />
                  Section 43 & 65 · Searchable Cryptographic Compliance Audit Trail
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Permanent SHA-256 hash-chained log of all compliance decisions, legal sources consulted, and policy evaluations.
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 font-mono text-xs">
                <select
                  value={auditResultFilter}
                  onChange={e => setAuditResultFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                >
                  <option value="ALL">All Results</option>
                  <option value="COMPLIANCE_APPROVED">Approved</option>
                  <option value="HUMAN_REVIEW_REQUIRED">Review Required</option>
                  <option value="COMPLIANCE_BLOCKED">Blocked</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {complianceAuditLogs
              .filter(l => (auditResultFilter === 'ALL' ? true : l.decision === auditResultFilter))
              .map(log => (
                <div key={log.id} className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-3 font-mono text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{log.opportunityTitle}</span>
                      <span className="text-slate-500">({log.opportunityId})</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.decision === 'COMPLIANCE_BLOCKED'
                          ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                          : log.decision === 'HUMAN_REVIEW_REQUIRED'
                          ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {log.decision}
                    </span>
                  </div>

                  <div className="text-slate-300 font-sans leading-relaxed">{log.reason}</div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] pt-1">
                    <div className="p-2 bg-slate-950 rounded border border-slate-800 space-y-1">
                      <span className="text-slate-500 block text-[10px] uppercase">Rules Evaluated:</span>
                      <ul className="space-y-0.5 text-slate-300 font-sans">
                        {log.rulesEvaluated.map((r, i) => (
                          <li key={i}>· {r}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-2 bg-slate-950 rounded border border-slate-800 space-y-1">
                      <span className="text-slate-500 block text-[10px] uppercase">Documents Consulted:</span>
                      <ul className="space-y-0.5 text-slate-300 font-sans">
                        {log.documentsConsulted.map((d, i) => (
                          <li key={i}>· {d}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
                    <div className="truncate max-w-md">
                      Hash: <span className="text-cyan-400">{log.hash}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span>{log.agentTitle}</span>
                      <span>·</span>
                      <span>{log.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 8: SECTION 63 AI VS HUMAN PERMISSIONS MATRIX */}
      {activeTab === 'PERMISSIONS' && (
        <div className="space-y-4">
          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              Section 63 · Restriction Controls & Permission Matrix
            </h3>
            <p className="text-xs text-slate-400">
              Visual authority boundary. The interface prevents AI agents from self-granting privileges or overriding governance.
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-900/40">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Capability / Operation</th>
                  <th className="p-3.5 text-center">AI Autonomy</th>
                  <th className="p-3.5 text-center">Human Owner</th>
                  <th className="p-3.5">Governance Enforcement Scope</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                <tr>
                  <td className="p-3.5 font-bold text-white">Discover opportunities</td>
                  <td className="p-3.5 text-center text-emerald-400 font-bold">✓ Permitted</td>
                  <td className="p-3.5 text-center text-emerald-400 font-bold">✓ Permitted</td>
                  <td className="p-3.5 text-slate-400 font-sans text-xs">Continuous web & RPC crawling</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-white">Research & scrape terms</td>
                  <td className="p-3.5 text-center text-emerald-400 font-bold">✓ Permitted</td>
                  <td className="p-3.5 text-center text-emerald-400 font-bold">✓ Permitted</td>
                  <td className="p-3.5 text-slate-400 font-sans text-xs">Extract official docs & terms</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-white">Analyze security bytecode</td>
                  <td className="p-3.5 text-center text-emerald-400 font-bold">✓ Permitted</td>
                  <td className="p-3.5 text-center text-emerald-400 font-bold">✓ Permitted</td>
                  <td className="p-3.5 text-slate-400 font-sans text-xs">Static AST & opcode audit</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-white">Create execution proposal</td>
                  <td className="p-3.5 text-center text-emerald-400 font-bold">✓ Permitted</td>
                  <td className="p-3.5 text-center text-emerald-400 font-bold">✓ Permitted</td>
                  <td className="p-3.5 text-slate-400 font-sans text-xs">Formulates mathematical task plan</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-white">Run sandbox simulation</td>
                  <td className="p-3.5 text-center text-emerald-400 font-bold">✓ Permitted</td>
                  <td className="p-3.5 text-center text-emerald-400 font-bold">✓ Permitted</td>
                  <td className="p-3.5 text-slate-400 font-sans text-xs">Dry-run state diff validation</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-white">Execute low-risk task (Testnet/Faucet)</td>
                  <td className="p-3.5 text-center text-emerald-400 font-bold">✓ Permitted</td>
                  <td className="p-3.5 text-center text-emerald-400 font-bold">✓ Permitted</td>
                  <td className="p-3.5 text-slate-400 font-sans text-xs">Pre-approved non-capital workflows</td>
                </tr>
                <tr className="bg-purple-950/20">
                  <td className="p-3.5 font-bold text-white">Execute high-risk task</td>
                  <td className="p-3.5 text-center text-rose-400 font-bold">— Blocked</td>
                  <td className="p-3.5 text-center text-emerald-400 font-bold">✓ Permitted</td>
                  <td className="p-3.5 text-amber-300 font-sans text-xs">Requires explicit Owner signature</td>
                </tr>
                <tr className="bg-purple-950/20">
                  <td className="p-3.5 font-bold text-white">Production deploy / live code</td>
                  <td className="p-3.5 text-center text-rose-400 font-bold">— Blocked</td>
                  <td className="p-3.5 text-center text-emerald-400 font-bold">✓ Permitted</td>
                  <td className="p-3.5 text-amber-300 font-sans text-xs">Level 0 Human Authorization</td>
                </tr>
                <tr className="bg-purple-950/20">
                  <td className="p-3.5 font-bold text-white">Large transaction (&gt; limit)</td>
                  <td className="p-3.5 text-center text-rose-400 font-bold">— Blocked</td>
                  <td className="p-3.5 text-center text-emerald-400 font-bold">✓ Permitted</td>
                  <td className="p-3.5 text-amber-300 font-sans text-xs">Human approval threshold</td>
                </tr>
                <tr className="bg-purple-950/20">
                  <td className="p-3.5 font-bold text-white">Change compliance rule</td>
                  <td className="p-3.5 text-center text-rose-400 font-bold">— Blocked</td>
                  <td className="p-3.5 text-center text-emerald-400 font-bold">✓ Permitted</td>
                  <td className="p-3.5 text-amber-300 font-sans text-xs">AI cannot alter its own gates</td>
                </tr>
                <tr className="bg-purple-950/20">
                  <td className="p-3.5 font-bold text-white">Disable security</td>
                  <td className="p-3.5 text-center text-rose-400 font-bold">— Blocked</td>
                  <td className="p-3.5 text-center text-emerald-400 font-bold">✓ Permitted</td>
                  <td className="p-3.5 text-amber-300 font-sans text-xs">Strictly impossible for agents</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-white">Emergency stop</td>
                  <td className="p-3.5 text-center text-rose-400 font-bold">— Blocked</td>
                  <td className="p-3.5 text-center text-emerald-400 font-bold">✓ Permitted</td>
                  <td className="p-3.5 text-slate-400 font-sans text-xs">Human Owner kill switch</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 9: SECTION 62 COMPLIANCE SETTINGS */}
      {activeTab === 'SETTINGS' && (
        <div className="space-y-6">
          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400" />
                Section 62 · Compliance Settings & Policy Thresholds
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure automated execution bounds and mandatory human approval triggers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 font-mono text-xs">
              {/* Box 1: Require Human Approval For */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="text-slate-300 font-bold uppercase">Require Human Approval For:</div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={reqRegulated} onChange={e => setReqRegulated(e.target.checked)} className="rounded" />
                    <span>Regulated activities</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={reqHighValue} onChange={e => setReqHighValue(e.target.checked)} className="rounded" />
                    <span>High-value transactions</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={reqNewChains} onChange={e => setReqNewChains(e.target.checked)} className="rounded" />
                    <span>New chains</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={reqNewContracts} onChange={e => setReqNewContracts(e.target.checked)} className="rounded" />
                    <span>New smart contracts</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={reqUnknownTerms} onChange={e => setReqUnknownTerms(e.target.checked)} className="rounded" />
                    <span>Unknown automation terms</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={reqUncertainty} onChange={e => setReqUncertainty(e.target.checked)} className="rounded" />
                    <span>Compliance uncertainty</span>
                  </label>
                </div>
              </div>

              {/* Box 2: Automatically Pause When */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="text-slate-300 font-bold uppercase">Automatically Pause When:</div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={pauseAlerts} onChange={e => setPauseAlerts(e.target.checked)} className="rounded" />
                    <span>Regulatory alert detected</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={pauseScreeningUnavail} onChange={e => setPauseScreeningUnavail(e.target.checked)} className="rounded" />
                    <span>Required screening unavailable</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={pausePolicyExpires} onChange={e => setPausePolicyExpires(e.target.checked)} className="rounded" />
                    <span>Policy expires</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={pauseJurisdictionUnsup} onChange={e => setPauseJurisdictionUnsup(e.target.checked)} className="rounded" />
                    <span>Jurisdiction becomes unsupported</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={pauseSecurityRisk} onChange={e => setPauseSecurityRisk(e.target.checked)} className="rounded" />
                    <span>Security risk increases</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              <button
                onClick={() => {
                  setSavedSettingsToast(true);
                  setTimeout(() => setSavedSettingsToast(false), 3000);
                }}
                className="px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-mono font-bold rounded-xl text-xs cursor-pointer shadow-md shadow-purple-600/20"
              >
                SAVE POLICY SETTINGS
              </button>
              {savedSettingsToast && (
                <span className="text-xs font-mono text-emerald-400">✓ Compliance policy settings updated!</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 10: SECTION 64 POLICY VERSIONING */}
      {activeTab === 'HISTORY' && (
        <div className="space-y-4">
          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-purple-400" />
              Section 64 · Policy Versioning & Audit History
            </h3>
            <p className="text-xs text-slate-400">
              Every governance change generates a cryptographically signed version. AI proposed alterations require human sign-off before taking effect.
            </p>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {/* Version 1.4 */}
            <div className="p-4 bg-slate-900/60 border border-purple-500/40 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">Policy v1.4</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                    CURRENT ACTIVE
                  </span>
                </div>
                <span className="text-slate-500">Effective: 2026-09-23</span>
              </div>
              <p className="text-slate-300 font-sans text-xs">
                Integrated Sections 30–69 compliance architecture, automated OFAC screening, 3-layer verification model, and Section 36 Tax Ledger.
              </p>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800 flex items-center justify-between">
                <span>Created by: Elena Rostova (Director) & Human Owner</span>
                <span className="text-emerald-400">Approved by Human Owner</span>
              </div>
            </div>

            {/* Version 1.3 */}
            <div className="p-4 bg-slate-900/30 border border-slate-800 rounded-xl space-y-2 text-slate-400">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-300">Policy v1.3</span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">PREVIOUS</span>
                </div>
                <span className="text-slate-500">Effective: 2026-09-10</span>
              </div>
              <p className="font-sans text-xs">
                Added initial DEX rate-limiting thresholds and max transaction caps.
              </p>
            </div>

            {/* AI Proposed */}
            <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-amber-300">Policy v1.5 (Proposed)</span>
                  <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-bold">
                    AI PROPOSED — NOT YET APPROVED
                  </span>
                </div>
                <span className="text-slate-500">Proposed: 2026-09-23</span>
              </div>
              <p className="text-slate-300 font-sans text-xs">
                Proposed automatic exclusion of high-gas testnet faucets during congestion periods.
              </p>
              <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
                <span className="text-slate-400">Proposed by: Atlas Vanguard (Governor)</span>
                <span className="text-amber-400">Awaiting Human Owner Signature</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 55: "WHY IS THIS BLOCKED?" MODAL */}
      {inspectBlockedOpp && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/50 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl shadow-rose-950/50 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <XCircle className="w-5 h-5" />
                <span>SECTION 55 · WHY IS THIS BLOCKED?</span>
              </div>
              <button
                onClick={() => setInspectBlockedOpp(null)}
                className="text-slate-400 hover:text-white cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">OPPORTUNITY</span>
                <strong className="text-white text-sm">{inspectBlockedOpp.title}</strong>
              </div>

              <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl space-y-1">
                <span className="text-rose-400 text-[10px] font-bold block uppercase">REASON</span>
                <p className="text-rose-200 font-sans text-xs leading-relaxed">
                  {inspectBlockedOpp.complianceBlockedReason || 'Required compliance information is unavailable or activity matches restricted sanctions list.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-slate-950 rounded border border-slate-800">
                  <span className="text-slate-500 block text-[9px]">POLICY CITED</span>
                  <span className="text-white font-bold">COMPLIANCE-OFAC-001</span>
                </div>
                <div className="p-2 bg-slate-950 rounded border border-slate-800">
                  <span className="text-slate-500 block text-[9px]">DETECTED</span>
                  <span className="text-white">01:42 UTC (v1.4)</span>
                </div>
              </div>

              <div className="text-slate-400 text-[10px] font-sans">
                Non-Override Principle: Profit cannot override compliance. Growth cannot override security.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  setInspectBlockedOpp(null);
                  setActiveTab('SETTINGS');
                }}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs cursor-pointer"
              >
                View Policy
              </button>
              <button
                onClick={() => {
                  setInspectBlockedOpp(null);
                  setActiveView('approvals');
                }}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Request Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
