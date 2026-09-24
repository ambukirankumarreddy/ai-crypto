import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Play, 
  Pause, 
  AlertOctagon, 
  Bell, 
  ShieldCheck, 
  Wallet, 
  ChevronDown,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';

interface HeaderProps {
  onOpenWalletModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenWalletModal }) => {
  const { 
    aiRunning, 
    startAI, 
    stopAI, 
    setShowEmergencyModal, 
    policy, 
    wallet, 
    notifications,
    markNotificationRead,
    clearAllNotifications,
    setActiveView
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-4">
        <a href="#dashboard" onClick={() => setActiveView('dashboard')} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm tracking-wider shadow-sm shadow-cyan-500/20">
            AE
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight text-white group-hover:text-cyan-400 transition-colors">
              AI Crypto Earning Organization
            </div>
            <div className="text-[11px] text-slate-400 font-mono tracking-tight flex items-center gap-1.5">
              <span>Autonomous Multi-Agent System</span>
              <span>·</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Policy Enforced
              </span>
            </div>
          </div>
        </a>
      </div>

      {/* Zone 2: System Status Indicators */}
      <div className="hidden lg:flex items-center gap-6 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">System Health</span>
          <span className="text-slate-200 font-mono flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            99.98%
          </span>
        </div>
        <div className="h-3 w-px bg-slate-800" />
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Security Gate</span>
          <span className="text-slate-200 font-mono flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            Max Tx ${policy.maxTransactionValueUSD.toFixed(2)}
          </span>
        </div>
        <div className="h-3 w-px bg-slate-800" />
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Execution Mode</span>
          <span className="text-amber-400 font-mono">Non-Custodial</span>
        </div>
      </div>

      {/* Zone 3: Actions & Controls */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
                <span className="font-semibold text-slate-200">System Notifications</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={clearAllNotifications}
                    className="text-cyan-400 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <div className="text-xs text-slate-500 text-center py-4">No notifications</div>
                ) : (
                  notifications.map((notif, idx) => (
                    <div 
                      key={`${notif.id}-${idx}`}
                      onClick={() => {
                        markNotificationRead(notif.id);
                        if (notif.actionUrl) {
                          setActiveView(notif.actionUrl);
                          setShowNotifications(false);
                        }
                      }}
                      className={`p-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                        notif.read ? 'bg-slate-950/40 text-slate-400' : 'bg-slate-800/80 text-slate-200 border border-cyan-500/20'
                      }`}
                    >
                      <div className="flex items-center justify-between font-medium text-slate-200 mb-1">
                        <span>{notif.title}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{notif.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Wallet Button */}
        <button
          onClick={onOpenWalletModal}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 transition-colors"
        >
          <Wallet className="w-3.5 h-3.5 text-cyan-400" />
          {wallet.isConnected && wallet.address ? (
            <span>{wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}</span>
          ) : (
            <span>Connect Wallet</span>
          )}
          <ChevronDown className="w-3 h-3 text-slate-500" />
        </button>

        {/* Primary Start/Running AI Button */}
        {aiRunning ? (
          <button
            onClick={stopAI}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium text-emerald-300 bg-emerald-950/80 border border-emerald-500/30 hover:bg-emerald-900/60 transition-all shadow-sm shadow-emerald-500/10 whitespace-nowrap cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>AI RUNNING</span>
            <Pause className="w-3.5 h-3.5 text-emerald-400 ml-0.5" />
          </button>
        ) : (
          <button
            onClick={startAI}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-all shadow-md shadow-cyan-500/20 whitespace-nowrap cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>START AI</span>
          </button>
        )}

        {/* GLOBAL EMERGENCY STOP */}
        <button
          onClick={() => setShowEmergencyModal(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            policy.emergencyStopActive 
              ? 'bg-rose-950 text-rose-300 border border-rose-600 animate-pulse' 
              : 'bg-rose-900/30 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60'
          }`}
          title="Emergency Stop: halts all workers, transactions, and deployments immediately"
        >
          <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden sm:inline">EMERGENCY STOP</span>
        </button>
      </div>
    </header>
  );
};
