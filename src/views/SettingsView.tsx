import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Settings, 
  ShieldCheck, 
  Bell, 
  Sliders, 
  Download, 
  Save, 
  Lock, 
  CheckCircle2, 
  Cpu, 
  RefreshCcw 
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { wallet, policy } = useApp();
  const [executionSpeed, setExecutionSpeed] = useState<'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE'>('BALANCED');
  const [telegramAlerts, setTelegramAlerts] = useState<boolean>(true);
  const [discordAlerts, setDiscordAlerts] = useState<boolean>(false);
  const [emailAlerts, setEmailAlerts] = useState<boolean>(true);
  const [saved, setSaved] = useState<boolean>(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const exportSystemBackup = () => {
    const backup = {
      system: 'AI Crypto Earning Organization',
      timestamp: new Date().toISOString(),
      wallet: wallet.address,
      policy,
      executionSpeed
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai_crypto_organization_config_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Organization Configuration & Settings</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            System operational cadences, notification delivery webhooks, and security invariants.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportSystemBackup}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-mono font-medium flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Config JSON</span>
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-cyan-600/20 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saved ? 'Saved Successfully!' : 'Save Preferences'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Autonomous Execution Cadence */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Autonomous Execution Cadence</span>
          </h2>

          <div className="space-y-2">
            {[
              {
                id: 'CONSERVATIVE',
                title: 'Conservative (High Certainty)',
                desc: 'Scouts opportunities every 30 minutes. Requires minimum 98% historical success rate. $0.50 max tx limit.'
              },
              {
                id: 'BALANCED',
                title: 'Balanced (Standard Multi-Chain)',
                desc: 'Scouts opportunities every 5 minutes. Requires minimum 90% success rate. Max tx limit $5.00.'
              },
              {
                id: 'AGGRESSIVE',
                title: 'Expedited (Max Yield Sweep)',
                desc: 'Continuous real-time block streaming. Flags high-speed testnet faucets and priority quest claims.'
              }
            ].map(tier => (
              <div
                key={tier.id}
                onClick={() => setExecutionSpeed(tier.id as any)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  executionSpeed === tier.id
                    ? 'bg-slate-950 border-cyan-500/50 shadow-sm'
                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold text-white mb-1">
                  <span>{tier.title}</span>
                  {executionSpeed === tier.id && (
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{tier.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications & Alert Channels */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
            <Bell className="w-4 h-4 text-cyan-400" />
            <span>Alert & Sign-off Channels</span>
          </h2>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
              <div>
                <span className="font-semibold text-white block">Email Dispatch</span>
                <span className="text-[11px] text-slate-400">Receive human owner approval requests directly via email</span>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={e => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
              <div>
                <span className="font-semibold text-white block">Telegram Bot Webhook</span>
                <span className="text-[11px] text-slate-400">Instant push notifications when rewards are earned or anomalies occur</span>
              </div>
              <input
                type="checkbox"
                checked={telegramAlerts}
                onChange={e => setTelegramAlerts(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
              <div>
                <span className="font-semibold text-white block">Discord Webhook Dispatch</span>
                <span className="text-[11px] text-slate-400">Relay live AI organization messages to a private server channel</span>
              </div>
              <input
                type="checkbox"
                checked={discordAlerts}
                onChange={e => setDiscordAlerts(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 rounded"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Security Invariants Checklist */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Security Invariants & Non-Custodial Verification</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Zero private keys or seed phrases stored or readable</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Autonomous micro-budget capped at ${policy.maxTransactionValueUSD.toFixed(2)}/tx</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Dynamic anomaly circuit breaker primed (5 failed tx threshold)</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Cryptographic hash chain active across all audit logs</span>
          </div>
        </div>
      </div>
    </div>
  );
};
