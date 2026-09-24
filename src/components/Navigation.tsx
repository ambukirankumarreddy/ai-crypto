import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Compass,
  Users2,
  ListTodo,
  Wallet,
  TrendingUp,
  BrainCircuit,
  Code2,
  Shield,
  FileCheck2,
  History,
  Settings,
  Sparkles,
  Scale,
  Gamepad2,
  ShieldCheck
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  highlight?: string;
  warning?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Navigation: React.FC = () => {
  const { activeView, setActiveView, approvals, tasks, policy } = useApp();

  const pendingApprovalsCount = approvals.filter(a => a.status === 'PENDING').length;
  const activeTasksCount = tasks.filter(t => t.status === 'EXECUTING').length;

  const navSections: NavSection[] = [
    {
      title: 'CORE PLATFORM',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'office', label: 'AI Crypto HQ (2D)', icon: Gamepad2, highlight: 'LIVE 2D' },
        { id: 'opportunities', label: 'Opportunities', icon: Compass },
        { id: 'organization', label: 'AI Organization', icon: Users2 },
        { id: 'tasks', label: 'Tasks', icon: ListTodo, badge: activeTasksCount > 0 ? `${activeTasksCount} active` : undefined },
      ]
    },
    {
      title: 'FINANCE & CAPITAL',
      items: [
        { id: 'earnings', label: 'Earnings', icon: TrendingUp },
        { id: 'wallet', label: 'Wallet', icon: Wallet },
        { id: 'strategies', label: 'Strategies', icon: BrainCircuit },
      ]
    },
    {
      title: 'ENGINEERING',
      items: [
        { id: 'website-ai', label: 'Website AI', icon: Code2 },
      ]
    },
    {
      title: 'GOVERNANCE & SECURITY',
      items: [
        { id: 'security', label: 'Security', icon: Shield, warning: policy.emergencyStopActive },
        { id: 'qa-readiness', label: 'QA Live Readiness', icon: ShieldCheck, highlight: 'GATE' },
        { id: 'compliance', label: 'Compliance', icon: Scale },
        { 
          id: 'approvals', 
          label: 'Approvals', 
          icon: FileCheck2, 
          highlight: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} pending` : undefined 
        },
        { id: 'audit-logs', label: 'Audit Logs', icon: History },
        { id: 'settings', label: 'Settings', icon: Settings },
      ]
    }
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 flex-1 overflow-y-auto space-y-6">
        {navSections.map(section => (
          <div key={section.title} className="space-y-1">
            <div className="px-3 text-[10px] font-semibold tracking-wider text-slate-500 font-mono">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map(item => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                      isActive
                        ? 'bg-slate-900 text-cyan-400 border border-slate-800 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.highlight && (
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 border border-amber-500/30 px-1.5 py-0.5 rounded">
                        {item.highlight}
                      </span>
                    )}

                    {item.badge && !item.highlight && (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                        {item.badge}
                      </span>
                    )}

                    {item.warning && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Philosophy Footnote & Safety Guarantee */}
      <div className="p-4 border-t border-slate-900 bg-slate-950/60">
        <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/40 text-[11px] text-slate-400 leading-relaxed">
          <div className="flex items-center gap-1.5 text-slate-300 font-medium mb-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Human-Governed AI</span>
          </div>
          <p className="text-[10px] text-slate-400">
            Discover · Research · Analyze · Validate · Simulate · Execute · Monitor · Earn · Learn · Improve
          </p>
          <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-emerald-400/90 font-mono">
            Zero Private Key Storage · Legitimate Only
          </div>
        </div>
      </div>
    </aside>
  );
};
