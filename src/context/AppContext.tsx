import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  AIAgent,
  Opportunity,
  TaskRecord,
  RewardRecord,
  StrategyProposal,
  WebsiteImprovement,
  SecurityPolicy,
  ApprovalRequest,
  AuditLogEntry,
  AgentMessage,
  BlockchainAdapterInfo,
  SystemNotification,
  WalletState,
  CompliancePolicy,
  RegulatoryChangeAlert,
  ComplianceAuditRecord,
  TaxAccountingRecord
} from '../types';
import {
  INITIAL_AGENTS,
  INITIAL_OPPORTUNITIES,
  INITIAL_TASKS,
  INITIAL_REWARDS,
  INITIAL_STRATEGIES,
  INITIAL_WEBSITE_IMPROVEMENTS,
  INITIAL_POLICY,
  INITIAL_APPROVALS,
  INITIAL_AUDIT_LOGS,
  INITIAL_MESSAGES,
  BLOCKCHAIN_ADAPTERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_COMPLIANCE_POLICY,
  INITIAL_REGULATORY_ALERTS,
  INITIAL_COMPLIANCE_AUDIT_LOGS,
  INITIAL_TAX_RECORDS
} from '../data/initialData';
import { PolicyEngine } from '../services/policyEngine';
import { ProfitabilityEngine } from '../services/profitEngine';
import { AuditHashChainer } from '../services/cryptoAudit';
import { ComplianceEngine } from '../services/complianceEngine';

interface AppContextType {
  // Master Control
  aiRunning: boolean;
  startAI: () => void;
  stopAI: () => void;
  triggerEmergencyStop: (reason?: string) => void;
  resetEmergencyStop: () => void;

  // Active View
  activeView: string;
  setActiveView: (view: string) => void;

  // State
  agents: AIAgent[];
  opportunities: Opportunity[];
  tasks: TaskRecord[];
  rewards: RewardRecord[];
  strategies: StrategyProposal[];
  websiteImprovements: WebsiteImprovement[];
  policy: SecurityPolicy;
  compliancePolicy: CompliancePolicy;
  regulatoryAlerts: RegulatoryChangeAlert[];
  complianceAuditLogs: ComplianceAuditRecord[];
  taxRecords: TaxAccountingRecord[];
  approvals: ApprovalRequest[];
  auditLogs: AuditLogEntry[];
  messages: AgentMessage[];
  blockchainAdapters: BlockchainAdapterInfo[];
  notifications: SystemNotification[];
  wallet: WalletState;

  // Modals & Inspectors
  selectedAgent: AIAgent | null;
  setSelectedAgent: (agent: AIAgent | null) => void;
  showEmergencyModal: boolean;
  setShowEmergencyModal: (show: boolean) => void;
  selectedApproval: ApprovalRequest | null;
  setSelectedApproval: (approval: ApprovalRequest | null) => void;

  // Actions
  connectWallet: (type: 'MetaMask' | 'WalletConnect' | 'Demo Execution Sandbox' | 'Coinbase Wallet' | 'Phantom' | string) => Promise<void>;
  setCustomWalletAddress: (address: string, network?: string, walletLabel?: string) => boolean;
  disconnectWallet: () => void;
  resolveApproval: (approvalId: string, approved: boolean, reason?: string) => void;
  updatePolicy: (newPolicy: Partial<SecurityPolicy>) => void;
  updateCompliancePolicy: (newPolicy: Partial<CompliancePolicy>) => void;
  triggerComplianceKillSwitch: (scope: 'all' | 'opportunity' | 'project' | 'chain', targetId?: string, reason?: string) => void;
  releaseComplianceKillSwitch: (scope: 'all' | 'opportunity' | 'project' | 'chain', targetId?: string) => void;
  claimReward: (rewardId: string) => Promise<boolean>;
  executeManualOpportunitySweep: () => void;
  approveWebsitePR: (prId: string) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  simulateDynamicAnomaly: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [aiRunning, setAiRunning] = useState<boolean>(true);
  const [activeView, setActiveView] = useState<string>('dashboard');

  const [agents, setAgents] = useState<AIAgent[]>(INITIAL_AGENTS);
  const [compliancePolicy, setCompliancePolicy] = useState<CompliancePolicy>(INITIAL_COMPLIANCE_POLICY);
  const [regulatoryAlerts, setRegulatoryAlerts] = useState<RegulatoryChangeAlert[]>(INITIAL_REGULATORY_ALERTS);
  const [complianceAuditLogs, setComplianceAuditLogs] = useState<ComplianceAuditRecord[]>(INITIAL_COMPLIANCE_AUDIT_LOGS);
  const [taxRecords, setTaxRecords] = useState<TaxAccountingRecord[]>(INITIAL_TAX_RECORDS);

  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => {
    return INITIAL_OPPORTUNITIES.map(opp => {
      const evalRes = ComplianceEngine.evaluateOpportunityCompliance(opp, INITIAL_COMPLIANCE_POLICY);
      return {
        ...opp,
        complianceStatus: evalRes.decision,
        regulatoryClassification: evalRes.classification,
        complianceBlockedReason: evalRes.blockedReason,
        threeLayerVerification: evalRes.threeLayerVerification
      };
    });
  });
  const [tasks, setTasks] = useState<TaskRecord[]>(INITIAL_TASKS);
  const [rewards, setRewards] = useState<RewardRecord[]>(INITIAL_REWARDS);
  const [strategies, setStrategies] = useState<StrategyProposal[]>(INITIAL_STRATEGIES);
  const [websiteImprovements, setWebsiteImprovements] = useState<WebsiteImprovement[]>(INITIAL_WEBSITE_IMPROVEMENTS);
  const [policy, setPolicy] = useState<SecurityPolicy>(INITIAL_POLICY);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(INITIAL_APPROVALS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [messages, setMessages] = useState<AgentMessage[]>(INITIAL_MESSAGES);
  const [blockchainAdapters] = useState<BlockchainAdapterInfo[]>(BLOCKCHAIN_ADAPTERS);
  const [notifications, setNotifications] = useState<SystemNotification[]>(INITIAL_NOTIFICATIONS);

  // Wallet State with localStorage hydration
  const [wallet, setWallet] = useState<WalletState>(() => {
    const DEFAULT_WALLET: WalletState = {
      isConnected: true,
      address: '0xe544B74E581d6e6b57a3CC5cDf5b80bDc084734E',
      network: 'Ethereum & Layer 2s',
      nativeBalances: {
        Ethereum: 0.142,
        Polygon: 24.5,
        Arbitrum: 0.084,
        Base: 0.062,
        Optimism: 0.051
      },
      tokenBalances: [
        { symbol: 'USDC', chain: 'Polygon', balance: 145.00, priceUSD: 1.00 },
        { symbol: 'USDT', chain: 'Arbitrum', balance: 50.00, priceUSD: 1.00 },
        { symbol: 'ARB', chain: 'Arbitrum', balance: 42.0, priceUSD: 0.77 },
        { symbol: 'OP', chain: 'Optimism', balance: 28.5, priceUSD: 1.55 }
      ],
      totalBalanceUSD: 846.50,
      walletType: 'MetaMask',
      hasExecutionWallet: true,
      executionWalletAddress: '0x3841C52b46C9B033A6B41366b447814bA940026e'
    };

    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ai_crypto_hq_wallet');
        console.log('[Wallet:Init] Hydrating wallet state from localStorage "ai_crypto_hq_wallet":', saved);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object' && parsed.address) {
            console.log('[Wallet:Init] Successfully restored saved wallet:', parsed.address, parsed.walletType);
            return { ...DEFAULT_WALLET, ...parsed };
          }
        }
      } catch (e) {
        console.warn('[Wallet:Init] Could not load saved wallet state:', e);
      }
    }
    console.log('[Wallet:Init] Initialized with default wallet state:', DEFAULT_WALLET.address, DEFAULT_WALLET.walletType);
    return DEFAULT_WALLET;
  });

  // Sync wallet state to localStorage whenever changed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        console.log('[Wallet:Persist] Storing active wallet to localStorage:', wallet.address, wallet.walletType, wallet.isConnected);
        localStorage.setItem('ai_crypto_hq_wallet', JSON.stringify(wallet));
      } catch (e) {
        console.warn('[Wallet:Persist] Could not save wallet state to localStorage:', e);
      }
    }
  }, [wallet]);

  // Modals
  const [selectedAgent, setSelectedAgent] = useState<AIAgent[] | null | any>(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState<boolean>(false);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null);

  // Track fresh state in refs for interval processing
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  const policyRef = useRef(policy);
  policyRef.current = policy;

  const agentsRef = useRef(agents);
  agentsRef.current = agents;

  const idCounterRef = useRef(0);
  const generateUniqueId = useCallback((prefix: string) => {
    idCounterRef.current += 1;
    const time = Date.now();
    const rand = Math.random().toString(36).substring(2, 9);
    return `${prefix}_${time}_${idCounterRef.current}_${rand}`;
  }, []);

  // Helper to add audit log entry
  const addAuditLog = useCallback((
    agentId: string,
    agentName: string,
    actionType: AuditLogEntry['actionType'],
    details: string,
    targetChain?: string,
    targetAddress?: string
  ) => {
    setAuditLogs(prev => {
      const lastHash = prev.length > 0 ? prev[0].hash : '0x0000000000000000000000000000000000000000';
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const newHash = AuditHashChainer.createEntryHash(timeStr, agentId, actionType, details, lastHash);
      const newEntry: AuditLogEntry = {
        id: generateUniqueId('AL'),
        timestamp: timeStr,
        agentId,
        agentName,
        actionType,
        details,
        targetChain,
        targetAddress,
        hash: newHash,
        previousHash: lastHash,
        tamperVerified: true
      };
      if (prev.some(entry => entry.id === newEntry.id)) {
        return prev;
      }
      return [newEntry, ...prev.slice(0, 100)];
    });
  }, [generateUniqueId]);

  // Helper to add agent message
  const addMessage = useCallback((
    messageType: string,
    fromAgent: string,
    toAgent: string,
    summary: string,
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW',
    opportunityId?: string
  ) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const newMsg: AgentMessage = {
      id: generateUniqueId('msg'),
      timestamp: timeStr,
      messageType,
      fromAgent,
      toAgent,
      summary,
      priority,
      opportunityId
    };
    setMessages(prev => {
      if (prev.some(m => m.id === newMsg.id)) {
        return prev;
      }
      return [newMsg, ...prev.slice(0, 50)];
    });
  }, [generateUniqueId]);

  // Add notification
  const addNotification = useCallback((
    title: string,
    message: string,
    type: SystemNotification['type'],
    actionUrl?: string
  ) => {
    const newNotif: SystemNotification = {
      id: generateUniqueId('notif'),
      timestamp: 'Just now',
      title,
      message,
      type,
      read: false,
      actionUrl
    };
    setNotifications(prev => {
      if (prev.some(n => n.id === newNotif.id)) {
        return prev;
      }
      return [newNotif, ...prev];
    });
  }, [generateUniqueId]);

  // Master controls
  const startAI = useCallback(() => {
    if (policy.emergencyStopActive) {
      addNotification('Cannot Start AI', 'Global Emergency Stop is active. Reset emergency stop first.', 'EMERGENCY');
      return;
    }
    setAiRunning(true);
    addAuditLog('agent_gov_01', 'Aegis Governor', 'POLICY_VERIFICATION', 'Autonomous AI Organization resumed normal operations.');
    addNotification('AI Organization Started', 'All specialized agents resumed real-time discovery and execution.', 'SECURITY');
  }, [policy.emergencyStopActive, addAuditLog, addNotification]);

  const stopAI = useCallback(() => {
    setAiRunning(false);
    addAuditLog('agent_gov_01', 'Aegis Governor', 'POLICY_VERIFICATION', 'Autonomous AI operations paused by Human Owner.');
    addNotification('AI Paused', 'AI agents are in idle standby mode.', 'SECURITY');
  }, [addAuditLog, addNotification]);

  const triggerEmergencyStop = useCallback((reason: string = 'Triggered by Human Owner') => {
    setAiRunning(false);
    setPolicy(prev => ({
      ...prev,
      emergencyStopActive: true,
      emergencyStopReason: reason
    }));
    // Restrict all active tasks
    setTasks(prev => prev.map(t => t.status === 'EXECUTING' || t.status === 'QUEUED' ? { ...t, status: 'HALTED_BY_POLICY' } : t));
    // Restrict agents
    setAgents(prev => prev.map(a => a.role === 'WORKER' ? { ...a, status: 'RESTRICTED' } : a));

    addAuditLog('agent_dir_sec', 'Security Director (Seraphina Ward)', 'EMERGENCY_STOP', `GLOBAL EMERGENCY STOP ACTIVATED: ${reason}`);
    addNotification('EMERGENCY STOP ACTIVATED', `All workers, transactions, and automations immediately terminated. Reason: ${reason}`, 'EMERGENCY');
  }, [addAuditLog, addNotification]);

  const resetEmergencyStop = useCallback(() => {
    setPolicy(prev => ({
      ...prev,
      emergencyStopActive: false,
      emergencyStopReason: undefined,
      currentFailedTxCount: 0
    }));
    setAgents(prev => prev.map(a => a.status === 'RESTRICTED' ? { ...a, status: 'ACTIVE' } : a));
    addAuditLog('agent_dir_sec', 'Security Director (Seraphina Ward)', 'SECURITY_RISK_CHECK', 'Global Emergency Stop manually reset by Human Owner after security review.');
    addNotification('Emergency Stop Reset', 'Safety checks nominal. You may resume autonomous operation when ready.', 'SECURITY');
  }, [addAuditLog, addNotification]);

  // Connect Wallet
  const connectWallet = useCallback(async (type: 'MetaMask' | 'WalletConnect' | 'Demo Execution Sandbox' | 'Coinbase Wallet' | 'Phantom' | string) => {
    console.group(`[Wallet:connectWallet] Initiating connection for: "${type}"`);
    console.log('[Wallet:connectWallet] Timestamp:', new Date().toISOString());

    if (type === 'MetaMask' || type === 'Browser Extension') {
      const hasEthereum = typeof window !== 'undefined' && !!(window as any).ethereum;
      console.log('[Wallet:connectWallet] Checking window.ethereum provider:', hasEthereum ? 'FOUND' : 'NOT DETECTED');

      if (hasEthereum) {
        try {
          const eth = (window as any).ethereum;
          console.log('[Wallet:connectWallet] Requesting accounts via eth_requestAccounts...');
          const accounts = await eth.request({ method: 'eth_requestAccounts' });
          console.log('[Wallet:connectWallet] eth_requestAccounts returned:', accounts);
          if (accounts && accounts[0]) {
            const connectedAddr = accounts[0];
            setWallet(prev => {
              const updated = {
                ...prev,
                isConnected: true,
                address: connectedAddr,
                walletType: 'MetaMask'
              };
              console.log('[Wallet:connectWallet] State updated with active MetaMask account:', updated);
              return updated;
            });
            addAuditLog('agent_sec_wallet_01', 'Wallet Security Agent', 'SECURITY_RISK_CHECK', `Connected MetaMask address: ${connectedAddr.slice(0, 8)}... (Zero private keys accessed)`);
            addNotification('MetaMask Connected', `Active account: ${connectedAddr.slice(0, 6)}...${connectedAddr.slice(-4)}`, 'SECURITY');
            console.groupEnd();
            return;
          }
        } catch (err: any) {
          console.error('[Wallet:connectWallet] MetaMask connection rejected / error:', err);
          addNotification('Connection Rejected', err?.message || 'MetaMask connection request was cancelled.', 'SECURITY');
          console.groupEnd();
          return;
        }
      } else {
        console.warn('[Wallet:connectWallet] No EIP-1193 window.ethereum provider in this iframe/window context.');
        // Retain current address or user's MetaMask address
        setWallet(prev => {
          const targetAddr = (prev.address && prev.address.length >= 8) 
            ? prev.address 
            : '0xe544B74E581d6e6b57a3CC5cDf5b80bDc084734E';
          const updated = {
            ...prev,
            isConnected: true,
            address: targetAddr,
            walletType: 'MetaMask'
          };
          console.log('[Wallet:connectWallet] Keeping / activating non-custodial address:', updated);
          return updated;
        });
        addNotification('MetaMask Active', 'Direct non-custodial mode active for your Ethereum wallet address.', 'SECURITY');
        console.groupEnd();
        return;
      }
    }

    if (type === 'Phantom') {
      const hasSolana = typeof window !== 'undefined' && !!(window as any).solana;
      console.log('[Wallet:connectWallet] Checking window.solana provider:', hasSolana);
      if (hasSolana) {
        try {
          const resp = await (window as any).solana.connect();
          console.log('[Wallet:connectWallet] Phantom connect response:', resp);
          if (resp && resp.publicKey) {
            const solAddr = resp.publicKey.toString();
            setWallet(prev => ({
              ...prev,
              isConnected: true,
              address: solAddr,
              walletType: 'Phantom'
            }));
            addAuditLog('agent_sec_wallet_01', 'Wallet Security Agent', 'SECURITY_RISK_CHECK', `Connected Phantom address: ${solAddr.slice(0, 8)}...`);
            addNotification('Phantom Connected', `Active account: ${solAddr.slice(0, 6)}...${solAddr.slice(-4)}`, 'SECURITY');
            console.groupEnd();
            return;
          }
        } catch (err: any) {
          console.error('[Wallet:connectWallet] Phantom connection rejected / error:', err);
          addNotification('Connection Rejected', 'Phantom connection request was cancelled.', 'SECURITY');
          console.groupEnd();
          return;
        }
      } else {
        console.warn('[Wallet:connectWallet] No Phantom solana provider found in browser.');
      }
    }

    // Default Sandbox or WalletConnect
    const fallbackAddr = type === 'Demo Execution Sandbox' 
      ? '0x71C8A9e46a7821B27357A42718E1924619a9B801'
      : (wallet.address || '0xe544B74E581d6e6b57a3CC5cDf5b80bDc084734E');

    console.log(`[Wallet:connectWallet] Setting ${type} with address: ${fallbackAddr}`);
    setWallet(prev => ({
      ...prev,
      isConnected: true,
      address: fallbackAddr,
      walletType: type
    }));
    addAuditLog('agent_sec_wallet_01', 'Wallet Security Agent', 'SECURITY_RISK_CHECK', `Non-custodial ${type} connection established for ${fallbackAddr.slice(0, 8)}...`);
    addNotification('Wallet Connected', `Session initialized via ${type}. Zero private key storage active.`, 'SECURITY');
    console.groupEnd();
  }, [addAuditLog, addNotification, wallet.address]);

  // Set Custom / User Wallet Address
  const setCustomWalletAddress = useCallback((customAddress: string, network: string = 'Ethereum & Layer 2s', label: string = 'Custom Wallet') => {
    console.group('[Wallet:setCustomWalletAddress] Processing Custom Wallet Input');
    console.log('[Wallet:setCustomWalletAddress] Raw input:', customAddress);
    console.log('[Wallet:setCustomWalletAddress] Selected network:', network);
    console.log('[Wallet:setCustomWalletAddress] Wallet label:', label);

    const cleanAddr = customAddress.trim();
    if (!cleanAddr) {
      console.error('[Wallet:setCustomWalletAddress] Validation error: Address is empty or whitespace.');
      addNotification('Invalid Wallet ID', 'Please enter a valid wallet address, public key, or ENS name.', 'SECURITY');
      console.groupEnd();
      return false;
    }

    // Validation patterns:
    const isEVM = /^0x[a-fA-F0-9]{40}$/.test(cleanAddr);
    const isENS = /^[a-zA-Z0-9-]+\.eth$/i.test(cleanAddr);
    const isBase58Sol = /^[1-9A-HJ-NP-za-km-z]{32,44}$/.test(cleanAddr);
    const isValidFormat = isEVM || isENS || isBase58Sol || cleanAddr.length >= 8;

    console.log('[Wallet:setCustomWalletAddress] Address validation diagnostics:', {
      address: cleanAddr,
      length: cleanAddr.length,
      isEVM,
      isENS,
      isBase58Sol,
      isValidFormat
    });

    setWallet(prev => {
      const updated: WalletState = {
        ...prev,
        isConnected: true,
        address: cleanAddr,
        network: network || prev.network,
        walletType: label || (isEVM ? 'MetaMask' : 'Custom Wallet')
      };
      console.log('[Wallet:setCustomWalletAddress] Successfully updated wallet state:', updated);
      return updated;
    });

    const shortAddr = cleanAddr.length > 12 ? `${cleanAddr.slice(0, 6)}...${cleanAddr.slice(-4)}` : cleanAddr;
    addAuditLog(
      'agent_sec_wallet_01',
      'Wallet Security Agent',
      'SECURITY_RISK_CHECK',
      `Custom wallet address configured: ${cleanAddr} (Non-custodial, zero private key access required).`
    );
    addNotification(
      'Wallet ID Configured',
      `Active address updated to ${shortAddr}. Non-custodial security policy active.`,
      'SECURITY'
    );
    console.groupEnd();
    return true;
  }, [addAuditLog, addNotification]);

  const disconnectWallet = useCallback(() => {
    setWallet(prev => ({
      ...prev,
      isConnected: false,
      address: null,
      walletType: null
    }));
    addNotification('Wallet Disconnected', 'Read and write sessions cleared.', 'SECURITY');
  }, [addNotification]);

  // Approvals
  const resolveApproval = useCallback((approvalId: string, approved: boolean, reason?: string) => {
    setApprovals(prev => prev.map(app => {
      if (app.id !== approvalId) return app;
      return {
        ...app,
        status: approved ? 'APPROVED' : 'REJECTED',
        resolvedAt: 'Just now',
        decisionReason: reason || (approved ? 'Authorized by Human Owner' : 'Declined by Human Owner')
      };
    }));

    const app = approvals.find(a => a.id === approvalId);
    if (app) {
      addAuditLog(
        'agent_gov_01',
        'Human Owner (Level 0)',
        'APPROVAL_DECISION',
        `Human Owner ${approved ? 'APPROVED' : 'REJECTED'} request ${approvalId}: ${app.title}`
      );
      addNotification(
        `Approval ${approved ? 'Granted' : 'Rejected'}`,
        `${app.title} was ${approved ? 'approved' : 'rejected'}.`,
        'APPROVAL'
      );

      // If approved a high-value opportunity, advance its status
      if (approved && app.payload.opportunityId) {
        setOpportunities(prev => prev.map(o => {
          if (o.id === app.payload.opportunityId) {
            return { ...o, status: 'APPROVED', statusReason: 'Authorized by Human Owner' };
          }
          return o;
        }));
      }

      // If approved website PR
      if (approved && app.payload.prId) {
        setWebsiteImprovements(prev => prev.map(pr => {
          if (pr.id === app.payload.prId) {
            return { ...pr, stage: 'PRODUCTION_DEPLOYED', humanApproved: true };
          }
          return pr;
        }));
      }
    }
  }, [approvals, addAuditLog, addNotification]);

  // Update Policy
  const updatePolicy = useCallback((newPolicy: Partial<SecurityPolicy>) => {
    setPolicy(prev => {
      const updated = { ...prev, ...newPolicy };
      addAuditLog(
        'agent_dir_sec',
        'Security Director (Seraphina Ward)',
        'POLICY_CHANGE',
        `Security Policy parameters updated: maxTx=$${updated.maxTransactionValueUSD}, minProfit=$${updated.minExpectedNetProfitUSD}, maxRisk=${updated.maxRiskScoreAllowed}`
      );
      return updated;
    });
    addNotification('Policy Updated', 'Security rules synchronized across all agents and workers.', 'SECURITY');
  }, [addAuditLog, addNotification]);

  // Update Compliance Policy (Section 30-48)
  const updateCompliancePolicy = useCallback((newPolicy: Partial<CompliancePolicy>) => {
    setCompliancePolicy(prev => {
      const updated = { ...prev, ...newPolicy };
      addAuditLog(
        'agent_dir_comp',
        'Elena Rostova (Compliance Director)',
        'POLICY_CHANGE',
        `Compliance policy updated. Strict non-custodial: ${updated.strictNonCustodialOnly}, KYC threshold: $${updated.requireKycAboveUSD}`
      );
      return updated;
    });
    addNotification('Compliance Policy Updated', 'Section 30-48 regulatory parameters updated.', 'COMPLIANCE');
  }, [addAuditLog, addNotification]);

  // Section 45 Compliance Kill Switch Trigger
  const triggerComplianceKillSwitch = useCallback((
    scope: 'all' | 'opportunity' | 'project' | 'chain',
    targetId?: string,
    reason?: string
  ) => {
    const triggerReason = reason || 'Emergency compliance veto triggered by Elena Rostova (Compliance Director).';
    setCompliancePolicy(prev => {
      const ks = { ...prev.complianceKillSwitch };
      if (scope === 'all') {
        ks.allAutomatedExecutionPaused = true;
        ks.allAutomatedTransactionsPaused = true;
      } else if (scope === 'opportunity' && targetId) {
        if (!ks.pausedOpportunities.includes(targetId)) ks.pausedOpportunities.push(targetId);
      } else if (scope === 'project' && targetId) {
        if (!ks.pausedProjects.includes(targetId)) ks.pausedProjects.push(targetId);
      } else if (scope === 'chain' && targetId) {
        if (!ks.pausedChains.includes(targetId)) ks.pausedChains.push(targetId);
      }
      ks.lastTriggeredBy = 'Elena Rostova (Compliance Director)';
      ks.lastTriggeredReason = triggerReason;
      ks.lastTriggeredAt = 'Just now';
      return { ...prev, complianceKillSwitch: ks };
    });

    addAuditLog(
      'agent_dir_comp',
      'Elena Rostova (Compliance Director)',
      'EMERGENCY_STOP',
      `COMPLIANCE KILL SWITCH TRIGGERED: Scope [${scope}] ${targetId ? `Target: ${targetId}` : ''}. Reason: ${triggerReason}`
    );
    addNotification(
      'Compliance Kill Switch Active',
      `Scope: ${scope.toUpperCase()} ${targetId ? `(${targetId})` : ''} has been paused under Section 45 authority.`,
      'COMPLIANCE'
    );
  }, [addAuditLog, addNotification]);

  // Section 45 Compliance Kill Switch Release
  const releaseComplianceKillSwitch = useCallback((
    scope: 'all' | 'opportunity' | 'project' | 'chain',
    targetId?: string
  ) => {
    setCompliancePolicy(prev => {
      const ks = { ...prev.complianceKillSwitch };
      if (scope === 'all') {
        ks.allAutomatedExecutionPaused = false;
        ks.allAutomatedTransactionsPaused = false;
      } else if (scope === 'opportunity' && targetId) {
        ks.pausedOpportunities = ks.pausedOpportunities.filter(id => id !== targetId);
      } else if (scope === 'project' && targetId) {
        ks.pausedProjects = ks.pausedProjects.filter(p => p !== targetId);
      } else if (scope === 'chain' && targetId) {
        ks.pausedChains = ks.pausedChains.filter(c => c !== targetId);
      }
      return { ...prev, complianceKillSwitch: ks };
    });

    addAuditLog(
      'agent_dir_comp',
      'Elena Rostova (Compliance Director)',
      'APPROVAL_DECISION',
      `Compliance Kill Switch RELEASED for Scope: [${scope}] ${targetId || ''} after full compliance review.`
    );
    addNotification(
      'Compliance Pause Released',
      `Scope: ${scope.toUpperCase()} ${targetId || ''} is cleared for operations.`,
      'COMPLIANCE'
    );
  }, [addAuditLog, addNotification]);

  // Claim Reward
  const claimReward = useCallback(async (rewardId: string): Promise<boolean> => {
    const target = rewards.find(r => r.id === rewardId);
    if (!target) return false;

    // Simulate claim
    const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setRewards(prev => prev.map(r => {
      if (r.id === rewardId) {
        return {
          ...r,
          status: 'CLAIMED',
          claimTxHash: txHash,
          claimedAt: 'Just now'
        };
      }
      return r;
    }));

    // Update wallet balance
    setWallet(prev => ({
      ...prev,
      totalBalanceUSD: prev.totalBalanceUSD + target.actualAmountUSD
    }));

    // Section 36 Tax Ledger Recording
    const newTaxRec = ComplianceEngine.generateTaxRecord(
      rewardId,
      target.chain,
      target.tokenSymbol,
      target.tokenAmount,
      target.actualAmountUSD,
      target.gasFeeUSD || 0.04,
      txHash,
      'TESTNET_PARTICIPATION'
    );
    setTaxRecords(prev => [newTaxRec, ...prev]);

    addAuditLog(
      'agent_worker_alpha',
      'Worker Alpha (Sandboxed)',
      'REWARD_DETECTION',
      `Claimed ${target.tokenAmount} ${target.tokenSymbol} ($${target.actualAmountUSD.toFixed(2)}) on ${target.chain}. Tx: ${txHash.slice(0, 10)}...`,
      target.chain,
      target.claimTxHash
    );

    addNotification(
      'Reward Claimed & Tax Basis Recorded',
      `Successfully claimed $${target.actualAmountUSD.toFixed(2)} (${target.tokenAmount} ${target.tokenSymbol}) on ${target.chain}. Section 36 tax record created.`,
      'REWARD'
    );

    return true;
  }, [rewards, addAuditLog, addNotification]);

  // Manual Scout Sweep
  const executeManualOpportunitySweep = useCallback(() => {
    addMessage('SWEEP_TRIGGERED', 'agent_dir_res', 'agent_scout_01', 'Executing comprehensive multi-chain ecosystem crawler sweep across verified testnets and quest hubs.', 'MEDIUM');
    addAuditLog('agent_scout_01', 'Opportunity Scout', 'OPPORTUNITY_DISCOVERY', 'Manual crawler sweep initiated across Ethereum, Arbitrum, Base, Polygon, and Optimism.');
    addNotification('Scout Sweep Started', 'Opportunity Scout is scanning 14 approved public registries.', 'OPPORTUNITY');

    setTimeout(() => {
      const newOpp: Opportunity = {
        id: `OPP-${Math.floor(10500 + Math.random() * 500)}`,
        title: 'Optimism Superchain Devnet Gas Voucher Faucet',
        project: 'Optimism Superchain',
        category: 'FAUCET',
        chain: 'Optimism',
        sourceUrl: 'https://optimism.io/faucet',
        verifiedOfficial: true,
        requiredCapital: 0.00,
        estimatedGasCost: 0.02,
        estimatedInfraCost: 0.01,
        estimatedAiCost: 0.01,
        expectedGrossReward: 3.20,
        expectedNetProfit: 3.16,
        riskScore: 7,
        status: 'APPROVED',
        discoveredAt: 'Just now',
        deadline: 'In 10 days',
        eligibilityRequirements: ['GitHub auth credential >= 30 days', 'Zero bot telemetry flags'],
        executionSteps: ['Verify GitHub OAuth hash in sandbox', 'Request devnet gas voucher', 'Deposit to testnet relayer'],
        historicalSuccessRate: 99.5
      };

      setOpportunities(prev => [newOpp, ...prev]);
      addAuditLog('agent_fin_profit_01', 'Profitability Engine', 'PROFIT_EVALUATION', `Evaluated new opportunity ${newOpp.id}: Net profit $${newOpp.expectedNetProfit.toFixed(2)} >= $${policy.minExpectedNetProfitUSD}. APPROVED.`);
      addMessage('OPPORTUNITY_FOUND', 'agent_scout_01', 'agent_dir_res', `Found new opportunity ${newOpp.title} with estimated profit $${newOpp.expectedNetProfit.toFixed(2)}`, 'MEDIUM', newOpp.id);
      addNotification('New Opportunity Discovered', `${newOpp.title} ($${newOpp.expectedNetProfit.toFixed(2)} net profit)`, 'OPPORTUNITY');
    }, 1500);
  }, [addAuditLog, addMessage, addNotification, policy.minExpectedNetProfitUSD]);

  // Website PR approval
  const approveWebsitePR = useCallback((prId: string) => {
    setWebsiteImprovements(prev => prev.map(pr => {
      if (pr.id === prId) {
        return {
          ...pr,
          stage: 'PRODUCTION_DEPLOYED',
          humanApproved: true
        };
      }
      return pr;
    }));
    addAuditLog('agent_dir_eng', 'Engineering Director (Kaelen Thorne)', 'DEPLOYMENT', `Deployed approved pull request ${prId} to production.`);
    addNotification('Website Updated', `PR ${prId} successfully merged into production.`, 'TASK');
  }, [addAuditLog, addNotification]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // Simulate dynamic anomaly to test security tripwire
  const simulateDynamicAnomaly = useCallback(() => {
    const current = policyRef.current;
    const newFailCount = current.currentFailedTxCount + 1;
    const willHalt = newFailCount >= current.autoHaltOnFailedTxCount;

    setPolicy(prev => ({
      ...prev,
      currentFailedTxCount: newFailCount
    }));

    if (willHalt) {
      triggerEmergencyStop('Dynamic Tripwire: 5 consecutive simulated failed transactions detected.');
    } else {
      addAuditLog(
        'agent_sec_sc_01',
        'Smart Contract Risk Agent',
        'SECURITY_RISK_CHECK',
        `Warning: Simulated RPC execution failure recorded (${newFailCount}/${current.autoHaltOnFailedTxCount} threshold)`
      );
      addNotification('Security Alert', `Execution anomaly detected (${newFailCount}/${current.autoHaltOnFailedTxCount}). Tripwire primed.`, 'SECURITY');
    }
  }, [triggerEmergencyStop, addAuditLog, addNotification]);

  // Autonomous Engine Tick
  const lastTickTime = useRef(Date.now());
  useEffect(() => {
    if (!aiRunning || policy.emergencyStopActive) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const currentTasks = tasksRef.current;

      const completedTasks: { task: TaskRecord; rewardUSD: number }[] = [];
      const promotedTasks: TaskRecord[] = [];
      let hasChanges = false;

      const updatedTasks = currentTasks.map(task => {
        if (task.status === 'EXECUTING') {
          hasChanges = true;
          const newProgress = Math.min(100, task.progressPercent + 15);
          if (newProgress >= 100) {
            const rewardUSD = task.actualRewardUSD || 3.50;
            completedTasks.push({ task, rewardUSD });
            return {
              ...task,
              status: 'SUCCESS' as const,
              progressPercent: 100,
              completedAt: 'Just now',
              actualRewardUSD: rewardUSD
            };
          }
          return {
            ...task,
            progressPercent: newProgress
          };
        } else if (task.status === 'QUEUED') {
          hasChanges = true;
          promotedTasks.push(task);
          return {
            ...task,
            status: 'EXECUTING' as const,
            startedAt: 'Just now'
          };
        }
        return task;
      });

      if (hasChanges) {
        setTasks(updatedTasks);
      }

      // Execute side-effects safely outside state updater functions
      for (const item of completedTasks) {
        addAuditLog(
          item.task.assignedWorkerId,
          item.task.assignedWorkerName,
          'TRANSACTION_EXECUTION',
          `Task ${item.task.id} completed successfully. Reward detected: +$${item.rewardUSD.toFixed(2)}.`,
          item.task.chain,
          item.task.txHash
        );
        addMessage(
          'TASK_COMPLETED',
          item.task.assignedWorkerId,
          'agent_dir_ops',
          `Task ${item.task.id} (${item.task.opportunityTitle}) completed. Verified on-chain.`,
          'LOW',
          item.task.opportunityId
        );
      }

      for (const task of promotedTasks) {
        addMessage(
          'WORKER_DISPATCHED',
          'agent_dir_ops',
          task.assignedWorkerId,
          `Dispatched ${task.assignedWorkerName} to task ${task.id} on ${task.chain}.`,
          'LOW',
          task.opportunityId
        );
      }

      // Periodic agent telemetry ping
      if (now - lastTickTime.current > 12000) {
        lastTickTime.current = now;
        const currentAgents = agentsRef.current;
        const activeWorkers = currentAgents.filter(a => a.status === 'ACTIVE' || a.status === 'BUSY');
        const randAgent = activeWorkers[Math.floor(Math.random() * activeWorkers.length)];
        if (randAgent) {
          addMessage(
            'HEARTBEAT_TELEMETRY',
            randAgent.id,
            'agent_gov_01',
            `${randAgent.name} telemetry nominal. Tasks evaluated: ${randAgent.tasksCompleted}. Success: ${randAgent.successRate}%`,
            'LOW'
          );
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [aiRunning, policy.emergencyStopActive, addAuditLog, addMessage]);

  return (
    <AppContext.Provider
      value={{
        aiRunning,
        startAI,
        stopAI,
        triggerEmergencyStop,
        resetEmergencyStop,
        activeView,
        setActiveView,
        agents,
        opportunities,
        tasks,
        rewards,
        strategies,
        websiteImprovements,
        policy,
        compliancePolicy,
        regulatoryAlerts,
        complianceAuditLogs,
        taxRecords,
        approvals,
        auditLogs,
        messages,
        blockchainAdapters,
        notifications,
        wallet,
        selectedAgent,
        setSelectedAgent,
        showEmergencyModal,
        setShowEmergencyModal,
        selectedApproval,
        setSelectedApproval,
        connectWallet,
        setCustomWalletAddress,
        disconnectWallet,
        resolveApproval,
        updatePolicy,
        updateCompliancePolicy,
        triggerComplianceKillSwitch,
        releaseComplianceKillSwitch,
        claimReward,
        executeManualOpportunitySweep,
        approveWebsitePR,
        markNotificationRead,
        clearAllNotifications,
        simulateDynamicAnomaly
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
