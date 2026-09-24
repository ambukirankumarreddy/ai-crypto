import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WebsiteImprovement } from '../types';
import { 
  Code2, 
  CheckCircle2, 
  GitPullRequest, 
  ShieldCheck, 
  ExternalLink, 
  Sparkles, 
  Layers, 
  Play, 
  Check, 
  GitBranch, 
  Terminal,
  Cpu
} from 'lucide-react';

export const WebsiteAIView: React.FC = () => {
  const { websiteImprovements, approveWebsitePR } = useApp();
  const [selectedPR, setSelectedPR] = useState<WebsiteImprovement>(websiteImprovements[0] || null);
  const [deployingId, setDeployingId] = useState<string | null>(null);

  const handleApproveDeploy = (prId: string) => {
    setDeployingId(prId);
    setTimeout(() => {
      approveWebsitePR(prId);
      setDeployingId(null);
    }, 1000);
  };

  const engineeringAgents = [
    { name: 'Kaelen Thorne', role: 'Engineering Director', focus: 'PR orchestration & staging architecture' },
    { name: 'UX Agent', role: 'Level 3 Specialist', focus: 'Information hierarchy, interaction friction' },
    { name: 'Performance Agent', role: 'Level 3 Specialist', focus: 'Bundle size, RPC latency, memoization' },
    { name: 'Bug Detection Agent', role: 'Level 3 Specialist', focus: 'Runtime invariant exceptions, unhandled rejections' },
    { name: 'UI / Design Agent', role: 'Level 3 Specialist', focus: 'Color harmony, contrast ratios, token alignment' },
    { name: 'Accessibility Agent', role: 'Level 3 Specialist', focus: 'WCAG 2.1 AA keyboard nav, aria roles' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Website Self-Improvement AI Organization</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Engineering multi-agent cluster that continuously refactors, optimizes, and polishes the user interface under human sign-off.
        </p>
      </div>

      {/* Engineering Cluster Agents */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {engineeringAgents.map(ag => (
          <div key={ag.name} className="p-3 bg-slate-900/40 border border-slate-800 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Code2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">{ag.name}</span>
            </div>
            <div className="text-[10px] text-slate-400">{ag.role}</div>
            <div className="text-[10px] text-slate-500 line-clamp-2 pt-1 font-mono">
              {ag.focus}
            </div>
          </div>
        ))}
      </div>

      {/* Self-Improvement Pull Requests Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: PR Queue */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs text-slate-400 font-mono">
            ENGINEERING PULL REQUESTS ({websiteImprovements.length})
          </div>

          <div className="space-y-3">
            {websiteImprovements.map(pr => {
              const isSelected = selectedPR?.id === pr.id;
              const isDeployed = pr.stage === 'PRODUCTION_DEPLOYED';

              return (
                <div
                  key={pr.id}
                  onClick={() => setSelectedPR(pr)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500/50 shadow-md shadow-cyan-500/5'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <span className="text-[10px] font-mono text-cyan-400">{pr.id} · {pr.component}</span>
                      <h4 className="text-xs font-bold text-white leading-snug">
                        {pr.title}
                      </h4>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded shrink-0 ${
                      isDeployed ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' :
                      'bg-amber-950 text-amber-400 border border-amber-500/30'
                    }`}>
                      {pr.stage.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 mb-2 leading-relaxed">
                    {pr.problemDiscovered}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-800/80">
                    <span>Proposed by: {pr.agentName}</span>
                    <span className="text-slate-400 font-sans">{pr.type}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected PR Inspection & Deployment Gate */}
        <div className="lg:col-span-7">
          {selectedPR && (
            <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase">
                    PULL REQUEST DETAIL · {selectedPR.id}
                  </span>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {selectedPR.title}
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Proposed by: <span className="text-slate-200">{selectedPR.agentName}</span> · Component: <span className="text-cyan-400">{selectedPR.component}</span>
                  </div>
                </div>

                {selectedPR.stage === 'PRODUCTION_DEPLOYED' ? (
                  <span className="px-3 py-1.5 bg-emerald-950 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Merged & Live
                  </span>
                ) : (
                  <button
                    onClick={() => handleApproveDeploy(selectedPR.id)}
                    disabled={deployingId === selectedPR.id}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-lg text-xs font-mono transition-all shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                  >
                    {deployingId === selectedPR.id ? 'Deploying...' : 'Authorize & Deploy to Production'}
                  </button>
                )}
              </div>

              {/* Problem & Solution */}
              <div className="space-y-2">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <div className="text-[10px] text-slate-500 font-mono uppercase mb-1">Problem Discovered</div>
                  {selectedPR.problemDiscovered}
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <div className="text-[10px] text-cyan-500 font-mono uppercase mb-1">Proposed Optimization</div>
                  {selectedPR.proposedSolution}
                </div>
              </div>

              {/* Automated Test Suite Matrix */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="text-xs font-semibold text-slate-200 font-mono flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>AUTOMATED VERIFICATION CHECKS</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Unit Tests:</span>
                    <span className="text-emerald-400 font-bold">{selectedPR.testResults.unitTests ? 'PASSED' : 'FAILED'}</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Security Scan:</span>
                    <span className="text-emerald-400 font-bold">{selectedPR.testResults.securityScan ? 'PASSED' : 'FLAGGED'}</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">A11y Score:</span>
                    <span className="text-emerald-400 font-bold">{selectedPR.testResults.a11yScore} / 100</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Latency Impact:</span>
                    <span className="text-emerald-400 font-bold">{selectedPR.testResults.latencyImpactMs}ms</span>
                  </div>
                </div>
              </div>

              {/* Code Diff Preview */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span className="flex items-center gap-1.5">
                    <GitPullRequest className="w-3.5 h-3.5 text-cyan-400" />
                    SYNTHESIZED CODE DIFF
                  </span>
                  <span className="text-[10px] text-slate-500">Atomic Rollback Ready</span>
                </div>

                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-emerald-300 font-mono overflow-x-auto max-h-48 leading-relaxed">
                  {selectedPR.diffPreview}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
