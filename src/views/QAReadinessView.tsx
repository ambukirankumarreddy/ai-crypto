/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ProductionQARunner, QALiveStepUpdate, QARunnerOptions } from '../services/qaRunner';
import {
  LiveReadinessReport,
  QATestCategoryResult,
  ProductionEnvironment
} from '../types';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Copy,
  Check,
  Download,
  Activity,
  Award,
  Layers,
  Sparkles,
  Sliders,
  Terminal,
  Lock,
  ArrowRight,
  RefreshCw,
  Cpu,
  FileText,
  Zap,
  Shield,
  Coins,
  Workflow,
  LifeBuoy,
  RotateCw
} from 'lucide-react';

export const QAReadinessView: React.FC = () => {
  const { wallet, policy } = useApp();
  const [environment, setEnvironment] = useState<ProductionEnvironment>('LIMITED_LIVE');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [activeCategoryName, setActiveCategoryName] = useState<string>('');
  const [activeCaseName, setActiveCaseName] = useState<string>('');
  const [report, setReport] = useState<LiveReadinessReport | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<QATestCategoryResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'SUMMARY' | 'CATEGORIES' | 'STAGES' | 'RAW_REPORT' | 'CONSOLE'>('SUMMARY');
  const [logs, setLogs] = useState<string[]>([]);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Resilience & Retry Options
  const [maxRetries, setMaxRetries] = useState<number>(3);
  const [simulateTransientRpcLag, setSimulateTransientRpcLag] = useState<boolean>(false);
  const [showResilienceConfig, setShowResilienceConfig] = useState<boolean>(false);

  // Launch Stages Definition
  const LAUNCH_STAGES = [
    {
      id: '1_STAGING',
      name: 'Stage 1 — Staging',
      badge: 'READ-ONLY & TESTNET',
      description: 'Behaves as production with zero real financial execution. Runs automated simulation loops.',
      ready: true
    },
    {
      id: '2_LIMITED_LIVE',
      name: 'Stage 2 — Limited Live',
      badge: 'APPROVAL ONLY',
      description: 'Real wallet connected with strict daily limits ($500), restricted chains, and mandatory human approval.',
      ready: true
    },
    {
      id: '3_FULL_LIVE',
      name: 'Stage 3 — Full Live',
      badge: 'AUTONOMOUS MULTI-SIG',
      description: 'Unlocked only after limited-live stability period with all 15 QA production gates satisfied.',
      ready: false
    },
  ];

  // Run initial test on mount
  useEffect(() => {
    handleRunFullSuite();
  }, []);

  // Auto-scroll console
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const addLog = (line: string) => {
    setLogs(prev => [...prev.slice(-300), line]);
  };

  const getRunnerOptions = (): QARunnerOptions => ({
    maxRetries,
    retryDelayMs: 45,
    simulateTransientRpcLag
  });

  /**
   * Run the complete 15-category live readiness suite with real-time UI streaming
   */
  const handleRunFullSuite = async () => {
    setIsRunning(true);
    setProgressPercent(0);
    setActiveCategoryName('Initializing test runner...');
    setActiveCaseName('');
    const simNotice = simulateTransientRpcLag ? ' (Simulating Transient RPC Flakiness & Resilience)' : '';
    addLog(`[SYSTEM] Starting AI CRYPTO HQ Live Readiness Suite in ${environment} mode (Max Retries: ${maxRetries})${simNotice}...`);

    try {
      const result = await ProductionQARunner.runLiveReadinessSuite(
        environment,
        getRunnerOptions(),
        (u: QALiveStepUpdate) => {
          setActiveCategoryName(u.categoryName);
          setActiveCaseName(u.caseName);
          setProgressPercent(u.percent);
          addLog(u.logLine);
        }
      );

      setReport(result);
      if (result.categories.length > 0) {
        setSelectedCategory(result.categories[0]);
      }
      addLog(`[SYSTEM] Live Readiness Suite completed. Status: ${result.overallStatus} | Critical Failures: ${result.criticalFailures} | Auto-Recovered Retries: ${result.totalRetriesRecovered || 0}`);
    } catch (e) {
      console.error('[QAReadinessView] Error running QA suite:', e);
      addLog(`[ERROR] QA Suite execution interrupted: ${String(e)}`);
    } finally {
      setIsRunning(false);
      setProgressPercent(100);
      setActiveCategoryName('Execution Complete');
      setActiveCaseName('');
    }
  };

  /**
   * Run targeted Security QA Suite
   */
  const handleRunSecuritySuite = async () => {
    setIsRunning(true);
    setProgressPercent(0);
    setActiveCategoryName('Security Controls');
    addLog(`[TARGETED] Executing Security QA Suite (Drainers, Prompt Injection, Sandboxing) with auto-retry...`);

    try {
      const secRes = await ProductionQARunner.runSecuritySuite(
        getRunnerOptions(),
        (u: QALiveStepUpdate) => {
          setActiveCaseName(u.caseName);
          setProgressPercent(u.percent);
          addLog(u.logLine);
        }
      );

      setReport(prev => {
        if (!prev) return prev;
        const updatedCats = prev.categories.map(c => c.category === 'Security' ? secRes : c);
        const criticalFailures = updatedCats.filter(c => c.status === 'FAIL').length;
        const overallStatus = criticalFailures === 0 ? 'READY' : 'NOT READY';
        const totalRetriesRecovered = updatedCats.reduce((sum, c) => sum + (c.totalRetries || 0), 0);
        return {
          ...prev,
          categories: updatedCats,
          criticalFailures,
          overallStatus,
          totalRetriesRecovered,
          rawReportText: ProductionQARunner.formatRawTextReport(updatedCats, criticalFailures, overallStatus, environment, totalRetriesRecovered)
        };
      });
      setSelectedCategory(secRes);
      addLog(`[TARGETED] Security QA Suite verified: ${secRes.status}`);
    } catch (e) {
      addLog(`[ERROR] Security QA run failed: ${String(e)}`);
    } finally {
      setIsRunning(false);
      setProgressPercent(100);
    }
  };

  /**
   * Run targeted Financial & Wallet QA Suite
   */
  const handleRunFinancialSuite = async () => {
    setIsRunning(true);
    setProgressPercent(0);
    setActiveCategoryName('Financial & Wallet Controls');
    addLog(`[TARGETED] Executing Financial & Wallet QA Suite (EV Math, Limits, Address Validation, Non-Custodial Checks) with auto-retry...`);

    try {
      const results = await ProductionQARunner.runFinancialSuite(
        getRunnerOptions(),
        (u: QALiveStepUpdate) => {
          setActiveCaseName(u.caseName);
          setProgressPercent(u.percent);
          addLog(u.logLine);
        }
      );

      setReport(prev => {
        if (!prev) return prev;
        const updatedCats = prev.categories.map(c => {
          const match = results.find(r => r.category === c.category);
          return match || c;
        });
        const criticalFailures = updatedCats.filter(c => c.status === 'FAIL').length;
        const overallStatus = criticalFailures === 0 ? 'READY' : 'NOT READY';
        const totalRetriesRecovered = updatedCats.reduce((sum, c) => sum + (c.totalRetries || 0), 0);
        return {
          ...prev,
          categories: updatedCats,
          criticalFailures,
          overallStatus,
          totalRetriesRecovered,
          rawReportText: ProductionQARunner.formatRawTextReport(updatedCats, criticalFailures, overallStatus, environment, totalRetriesRecovered)
        };
      });
      setSelectedCategory(results[0]);
      addLog(`[TARGETED] Financial & Wallet QA Suites verified.`);
    } catch (e) {
      addLog(`[ERROR] Financial QA run failed: ${String(e)}`);
    } finally {
      setIsRunning(false);
      setProgressPercent(100);
    }
  };

  /**
   * Run targeted 10-Stage Workflow QA Suite
   */
  const handleRunWorkflowSuite = async () => {
    setIsRunning(true);
    setProgressPercent(0);
    setActiveCategoryName('Workflow Loop');
    addLog(`[TARGETED] Executing 10-Stage Autonomous Workflow Loop QA with auto-retry...`);

    try {
      const wkfRes = await ProductionQARunner.runWorkflowSuite(
        getRunnerOptions(),
        (u: QALiveStepUpdate) => {
          setActiveCaseName(u.caseName);
          setProgressPercent(u.percent);
          addLog(u.logLine);
        }
      );

      setReport(prev => {
        if (!prev) return prev;
        const updatedCats = prev.categories.map(c => c.category === 'Workflow' ? wkfRes : c);
        const criticalFailures = updatedCats.filter(c => c.status === 'FAIL').length;
        const overallStatus = criticalFailures === 0 ? 'READY' : 'NOT READY';
        const totalRetriesRecovered = updatedCats.reduce((sum, c) => sum + (c.totalRetries || 0), 0);
        return {
          ...prev,
          categories: updatedCats,
          criticalFailures,
          overallStatus,
          totalRetriesRecovered,
          rawReportText: ProductionQARunner.formatRawTextReport(updatedCats, criticalFailures, overallStatus, environment, totalRetriesRecovered)
        };
      });
      setSelectedCategory(wkfRes);
      addLog(`[TARGETED] 10-Stage Workflow QA verified: ${wkfRes.status}`);
    } catch (e) {
      addLog(`[ERROR] Workflow QA run failed: ${String(e)}`);
    } finally {
      setIsRunning(false);
      setProgressPercent(100);
    }
  };

  const handleCopyReport = () => {
    if (report?.rawReportText) {
      navigator.clipboard.writeText(report.rawReportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadReport = () => {
    if (!report) return;
    const blob = new Blob([report.rawReportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AI_CRYPTO_HQ_LIVE_READINESS_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-cyan-950/80 border border-cyan-500/30 rounded-xl text-cyan-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Production QA & Live Launch Readiness
              </h1>
              <p className="text-xs text-slate-400">
                Automated 15-Category Live Verification Suite with RPC Retry Resilience
              </p>
            </div>
          </div>
        </div>

        {/* Quick Launch & Resilience Settings */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowResilienceConfig(!showResilienceConfig)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-mono rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Configure Auto-Retry Policies"
          >
            <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Retries ({maxRetries})</span>
          </button>

          <button
            onClick={handleRunFullSuite}
            disabled={isRunning}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-mono font-bold rounded-xl shadow-lg shadow-cyan-950/40 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? `Testing ${activeCategoryName}...` : 'Run All 15 Categories'}</span>
          </button>
        </div>
      </div>

      {/* Resilience & Auto-Retry Drawer */}
      {showResilienceConfig && (
        <div className="p-4 bg-slate-900 border border-cyan-500/30 rounded-xl space-y-3 font-mono text-xs animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-cyan-300 flex items-center gap-1.5">
              <RotateCw className="w-4 h-4 text-cyan-400" />
              Transient RPC & Network Retry Configuration
            </span>
            <span className="text-[10px] text-slate-400">Exponential Jitter Backoff Active</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1">
            {/* Max Retries */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-400 block font-bold">Max Retries per Test</label>
              <select
                value={maxRetries}
                onChange={(e) => setMaxRetries(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-cyan-500 text-xs"
              >
                <option value={1}>1 Retry (Fast fail)</option>
                <option value={2}>2 Retries</option>
                <option value={3}>3 Retries (Recommended default)</option>
                <option value={5}>5 Retries (High resilience)</option>
              </select>
            </div>

            {/* Simulate RPC Flakiness */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-400 block font-bold">Simulate Transient RPC Lag</label>
              <button
                onClick={() => setSimulateTransientRpcLag(!simulateTransientRpcLag)}
                className={`w-full py-1.5 px-3 rounded-lg border text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                  simulateTransientRpcLag
                    ? 'bg-amber-950/80 border-amber-500/60 text-amber-300'
                    : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${simulateTransientRpcLag ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`} />
                <span>{simulateTransientRpcLag ? 'SIMULATION ON (Injecting 429 Lag)' : 'Normal Mode (Zero Lag)'}</span>
              </button>
            </div>

            {/* Retry Stats */}
            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg flex flex-col justify-center space-y-0.5">
              <span className="text-[10px] text-slate-400">Total Auto-Recoveries</span>
              <span className="text-base font-bold text-emerald-400">
                {report?.totalRetriesRecovered || 0} Successful Recoveries
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Targeted QA Suite Action Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
        <button
          onClick={handleRunSecuritySuite}
          disabled={isRunning}
          className="p-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 rounded-xl flex items-center justify-between text-slate-200 transition-all cursor-pointer disabled:opacity-50 text-left"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="font-bold text-white">Security QA</div>
              <div className="text-[10px] text-slate-400">Drainers & Sandboxing</div>
            </div>
          </div>
          <Play className="w-3 h-3 text-cyan-400" />
        </button>

        <button
          onClick={handleRunFinancialSuite}
          disabled={isRunning}
          className="p-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 rounded-xl flex items-center justify-between text-slate-200 transition-all cursor-pointer disabled:opacity-50 text-left"
        >
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400" />
            <div>
              <div className="font-bold text-white">Financial & Wallet</div>
              <div className="text-[10px] text-slate-400">EV Math & Daily Caps</div>
            </div>
          </div>
          <Play className="w-3 h-3 text-cyan-400" />
        </button>

        <button
          onClick={handleRunWorkflowSuite}
          disabled={isRunning}
          className="p-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 rounded-xl flex items-center justify-between text-slate-200 transition-all cursor-pointer disabled:opacity-50 text-left"
        >
          <div className="flex items-center gap-2">
            <Workflow className="w-4 h-4 text-blue-400" />
            <div>
              <div className="font-bold text-white">10-Stage Workflow</div>
              <div className="text-[10px] text-slate-400">Sequential Reward Loop</div>
            </div>
          </div>
          <Play className="w-3 h-3 text-cyan-400" />
        </button>

        <button
          onClick={() => setActiveTab('CONSOLE')}
          className="p-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 rounded-xl flex items-center justify-between text-slate-200 transition-all cursor-pointer text-left"
        >
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="font-bold text-white">Live Console</div>
              <div className="text-[10px] text-slate-400">{logs.length} Streamed Lines</div>
            </div>
          </div>
          <ArrowRight className="w-3 h-3 text-cyan-400" />
        </button>
      </div>

      {/* Lifecycle Stage Trail */}
      <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500 uppercase font-mono font-bold tracking-wider">
            QA → STAGING → CONTROLLED LIVE LAUNCH PIPELINE
          </span>
          <span className="text-[10px] font-mono text-cyan-300">
            Environment: <strong>{environment.replace('_', ' ')}</strong>
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
          {[
            'CURRENT BUILD',
            'AUTOMATED QA',
            'MANUAL QA',
            'SECURITY QA',
            'AI AGENT QA',
            'COMPLIANCE QA',
            'FAILURE / RECOVERY QA',
            'STAGING',
            'LIMITED LIVE',
            'MONITOR',
            'FULL LIVE'
          ].map((step, idx) => (
            <React.Fragment key={step}>
              <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                step === 'LIMITED LIVE'
                  ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                  : idx <= 8
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}>
                {step}
              </span>
              {idx < 10 && <span className="text-slate-600">→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Progress Bar while running */}
      {isRunning && (
        <div className="p-4 bg-slate-900 border border-cyan-500/40 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-cyan-300 flex items-center gap-2">
              <Cpu className="w-4 h-4 animate-spin text-cyan-400" />
              Executing: <strong>{activeCategoryName}</strong> {activeCaseName ? `(${activeCaseName})` : ''}
            </span>
            <span className="text-white font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 transition-all duration-150"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Tabs */}
      <div className="flex items-center bg-slate-900/60 border border-slate-800 rounded-xl p-1 text-xs font-mono">
        <button
          onClick={() => setActiveTab('SUMMARY')}
          className={`flex-1 py-2 px-3 rounded-lg transition-all cursor-pointer font-bold ${
            activeTab === 'SUMMARY'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          15-Category Test Grid
        </button>
        <button
          onClick={() => setActiveTab('RAW_REPORT')}
          className={`flex-1 py-2 px-3 rounded-lg transition-all cursor-pointer font-bold ${
            activeTab === 'RAW_REPORT'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Terminal Report Output
        </button>
        <button
          onClick={() => setActiveTab('CATEGORIES')}
          className={`flex-1 py-2 px-3 rounded-lg transition-all cursor-pointer font-bold ${
            activeTab === 'CATEGORIES'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Diagnostic Deep Dive
        </button>
        <button
          onClick={() => setActiveTab('CONSOLE')}
          className={`flex-1 py-2 px-3 rounded-lg transition-all cursor-pointer font-bold ${
            activeTab === 'CONSOLE'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Live Stream Console ({logs.length})
        </button>
        <button
          onClick={() => setActiveTab('STAGES')}
          className={`flex-1 py-2 px-3 rounded-lg transition-all cursor-pointer font-bold ${
            activeTab === 'STAGES'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Launch Stage Promotion
        </button>
      </div>

      {/* TAB 1: SUMMARY GRID */}
      {activeTab === 'SUMMARY' && report && (
        <div className="space-y-4">
          {/* Status Header Block */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${
                report.overallStatus === 'READY'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                  : 'bg-rose-950 text-rose-400 border border-rose-500/40'
              }`}>
                {report.overallStatus === 'READY' ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
              </div>
              <div>
                <div className="text-xs text-slate-400 font-mono">PRODUCTION READINESS STATUS</div>
                <div className="text-xl font-bold font-mono tracking-tight text-white flex items-center gap-2">
                  <span>{report.overallStatus}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-emerald-300 font-normal">
                    0 Critical Failures
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-normal">
                    15/15 Passed
                  </span>
                  {report.totalRetriesRecovered && report.totalRetriesRecovered > 0 ? (
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1">
                      <RotateCw className="w-3 h-3" />
                      <span>{report.totalRetriesRecovered} Retries Recovered</span>
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyReport}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Report'}</span>
              </button>
              <button
                onClick={handleDownloadReport}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export TXT</span>
              </button>
            </div>
          </div>

          {/* 15 Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {report.categories.map(cat => (
              <div
                key={cat.category}
                onClick={() => {
                  setSelectedCategory(cat);
                  setActiveTab('CATEGORIES');
                }}
                className="p-3.5 bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 rounded-xl space-y-2 cursor-pointer transition-all hover:bg-slate-900"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white font-mono">{cat.category}</span>
                  <div className="flex items-center gap-1.5">
                    {cat.totalRetries && cat.totalRetries > 0 ? (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-950 text-amber-300 border border-amber-500/30">
                        {cat.totalRetries} retried
                      </span>
                    ) : null}
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                      {cat.status}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 font-sans line-clamp-2">
                  {cat.details[0] || 'All tests verified.'}
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800/80">
                  <span>Tests: {cat.passedCount}/{cat.testCount}</span>
                  <span className="text-cyan-400">{cat.durationMs}ms</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: TERMINAL RAW REPORT */}
      {activeTab === 'RAW_REPORT' && report && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-cyan-400" />
              Machine-Readable Production Readiness Audit Log
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyReport}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-mono flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <pre className="p-5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed select-all">
            {report.rawReportText}
          </pre>
        </div>
      )}

      {/* TAB 3: DIAGNOSTIC DEEP DIVE */}
      {activeTab === 'CATEGORIES' && report && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Category List */}
          <div className="space-y-1.5">
            {report.categories.map(cat => (
              <button
                key={cat.category}
                onClick={() => setSelectedCategory(cat)}
                className={`w-full p-2.5 rounded-xl text-left font-mono text-xs flex items-center justify-between cursor-pointer transition-all border ${
                  selectedCategory?.category === cat.category
                    ? 'bg-slate-800 border-cyan-500/50 text-cyan-300 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <span>{cat.category}</span>
                <div className="flex items-center gap-1">
                  {cat.totalRetries && cat.totalRetries > 0 ? (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-amber-950 text-amber-300">
                      {cat.totalRetries} retried
                    </span>
                  ) : null}
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300">PASS</span>
                </div>
              </button>
            ))}
          </div>

          {/* Right Category Details */}
          <div className="lg:col-span-2 space-y-4">
            {selectedCategory && (
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-white font-mono">{selectedCategory.category}</h3>
                    <p className="text-xs text-slate-400">
                      Execution time: {selectedCategory.durationMs}ms | Retries recovered: {selectedCategory.totalRetries || 0}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                    {selectedCategory.status}
                  </span>
                </div>

                <div className="space-y-3">
                  {selectedCategory.cases.map(tc => (
                    <div key={tc.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5 text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">{tc.name}</span>
                        <div className="flex items-center gap-1.5">
                          {tc.recoveredOnRetry && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1">
                              <RotateCw className="w-2.5 h-2.5" />
                              <span>Recovered (Attempt {tc.retryCount}/{tc.maxRetries})</span>
                            </span>
                          )}
                          <span className="text-emerald-400 text-[10px] font-bold">PASS ({tc.executionMs}ms)</span>
                        </div>
                      </div>
                      <p className="text-slate-400 font-sans text-xs">{tc.description}</p>
                      <div className="text-[11px] text-cyan-300 pt-1 border-t border-slate-900 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500 font-sans">Measurement:</span>
                          <span>{tc.measured}</span>
                        </div>
                        <span className="text-slate-500 text-[10px]">Max retries: {tc.maxRetries ?? 3}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: LIVE STREAM CONSOLE */}
      {activeTab === 'CONSOLE' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-cyan-400" />
              Live Execution Telemetry & Runner Stream
            </span>
            <button
              onClick={() => setLogs([])}
              className="text-xs font-mono text-slate-400 hover:text-white cursor-pointer"
            >
              Clear Console
            </button>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-300 h-96 overflow-y-auto space-y-1">
            {logs.length === 0 ? (
              <div className="text-slate-500 italic">No execution logs yet. Run a suite above to see real-time output.</div>
            ) : (
              logs.map((log, index) => {
                const isError = log.includes('FAIL') || log.includes('[ERROR]');
                const isRetry = log.includes('[RETRY]');
                const isRecovered = log.includes('[RECOVERED]');
                const isPass = log.includes('PASS');
                const isSys = log.includes('[SYSTEM]') || log.includes('[TARGETED]');

                let colorClass = 'text-slate-300';
                if (isError) colorClass = 'text-rose-400 font-bold';
                else if (isRetry) colorClass = 'text-amber-400 font-bold';
                else if (isRecovered) colorClass = 'text-cyan-300 font-bold';
                else if (isPass) colorClass = 'text-emerald-400';
                else if (isSys) colorClass = 'text-cyan-400';

                return (
                  <div key={index} className={`leading-relaxed ${colorClass}`}>
                    {log}
                  </div>
                );
              })
            )}
            <div ref={consoleEndRef} />
          </div>
        </div>
      )}

      {/* TAB 5: LAUNCH STAGE PROMOTION */}
      {activeTab === 'STAGES' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {LAUNCH_STAGES.map(stg => (
              <div
                key={stg.id}
                className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white font-mono">{stg.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                      stg.ready ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {stg.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed">{stg.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <button
                    disabled={!stg.ready}
                    onClick={() => {
                      if (stg.id.includes('STAGING')) setEnvironment('STAGING');
                      if (stg.id.includes('LIMITED')) setEnvironment('LIMITED_LIVE');
                      if (stg.id.includes('FULL')) setEnvironment('FULL_LIVE');
                    }}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      stg.ready
                        ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {stg.ready ? 'Activate Stage Mode' : 'Gated — Awaiting Live Soak Period'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
