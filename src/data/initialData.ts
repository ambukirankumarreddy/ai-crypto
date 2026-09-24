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
  CompliancePolicy,
  RegulatoryChangeAlert,
  ComplianceAuditRecord,
  TaxAccountingRecord
} from '../types';

export const INITIAL_AGENTS: AIAgent[] = [
  // LEVEL 1: GOVERNOR
  {
    id: 'agent_gov_01',
    name: 'Aegis Governor',
    title: 'AI Governor & Chief Orchestrator',
    department: 'EXECUTIVE',
    level: 1,
    role: 'GOVERNOR',
    status: 'ACTIVE',
    currentTask: 'Synthesizing cross-director telemetry & priority balancing',
    successRate: 99.4,
    tasksCompleted: 1420,
    tasksFailed: 8,
    lastActive: 'Just now',
    decisionsMade: 3240,
    resourceUsage: { tokensPerHour: 14200, computeMs: 310 },
    permissions: [
      { id: 'p1', name: 'READ_TELEMETRY', allowed: true, scope: 'ALL_SYSTEMS', description: 'Read status and reports from all directors' },
      { id: 'p2', name: 'TASK_PRIORITIZATION', allowed: true, scope: 'ORCHESTRATOR', description: 'Assign tasks to department queues' },
      { id: 'p3', name: 'POLICY_VERIFICATION', allowed: true, scope: 'POLICY_ENGINE', description: 'Query central policy engine before dispatch' },
      { id: 'p4', name: 'DIRECT_KEY_ACCESS', allowed: false, scope: 'WALLET', description: 'Access private keys or signing seeds' },
      { id: 'p5', name: 'POLICY_BYPASS', allowed: false, scope: 'SECURITY', description: 'Override risk threshold or limits' },
    ]
  },
  // LEVEL 2: DIRECTORS
  {
    id: 'agent_dir_res',
    name: 'Dr. Evelyn Vance',
    title: 'Research Director',
    department: 'RESEARCH',
    level: 2,
    role: 'DIRECTOR',
    status: 'ACTIVE',
    currentTask: 'Auditing Layer-2 incentive programs & developer grants',
    successRate: 98.1,
    tasksCompleted: 890,
    tasksFailed: 17,
    lastActive: '12s ago',
    decisionsMade: 1820,
    resourceUsage: { tokensPerHour: 22400, computeMs: 540 },
    permissions: [
      { id: 'p6', name: 'DISCOVERY_ROUTING', allowed: true, scope: 'PUBLIC_APIS', description: 'Assign crawling and scouting mandates' },
      { id: 'p7', name: 'OPPORTUNITY_INGEST', allowed: true, scope: 'DATABASE', description: 'Write validated opportunity drafts' },
      { id: 'p8', name: 'WALLET_TRANSACTION', allowed: false, scope: 'ON_CHAIN', description: 'Direct transaction execution' },
    ]
  },
  {
    id: 'agent_dir_strat',
    name: 'Cassian Vane',
    title: 'Strategy Director',
    department: 'STRATEGY',
    level: 2,
    role: 'DIRECTOR',
    status: 'ACTIVE',
    currentTask: 'Simulating multi-chain liquidity yield cycles',
    successRate: 97.5,
    tasksCompleted: 430,
    tasksFailed: 11,
    lastActive: '45s ago',
    decisionsMade: 940,
    resourceUsage: { tokensPerHour: 18200, computeMs: 620 },
    permissions: [
      { id: 'p9', name: 'PROPOSE_STRATEGY', allowed: true, scope: 'STRATEGY_REGISTRY', description: 'Submit strategy proposals for 8-stage sandbox' },
      { id: 'p10', name: 'BACKTEST_ENGINE', allowed: true, scope: 'HISTORICAL_DB', description: 'Query historical yields and failure points' },
      { id: 'p11', name: 'DEPLOY_PRODUCTION', allowed: false, scope: 'SYSTEM', description: 'Automatic deployment without human signoff' },
    ]
  },
  {
    id: 'agent_dir_eng',
    name: 'Kaelen Thorne',
    title: 'Engineering Director',
    department: 'ENGINEERING',
    level: 2,
    role: 'DIRECTOR',
    status: 'ACTIVE',
    currentTask: 'Overseeing staging test suite & accessibility audit',
    successRate: 99.1,
    tasksCompleted: 610,
    tasksFailed: 5,
    lastActive: '1m ago',
    decisionsMade: 1250,
    resourceUsage: { tokensPerHour: 16500, computeMs: 480 },
    permissions: [
      { id: 'p12', name: 'CODE_STAGING_DEPLOY', allowed: true, scope: 'STAGING_ENV', description: 'Deploy reviewed code to sandbox staging' },
      { id: 'p13', name: 'AUTOMATED_TEST_RUN', allowed: true, scope: 'CI_PIPELINE', description: 'Execute unit and integration tests' },
      { id: 'p14', name: 'PROD_DEPLOY_OVERRIDE', allowed: false, scope: 'PRODUCTION', description: 'Deploy to live users without human approval' },
    ]
  },
  {
    id: 'agent_dir_sec',
    name: 'Seraphina Ward',
    title: 'Security Director',
    department: 'SECURITY',
    level: 2,
    role: 'DIRECTOR',
    status: 'ACTIVE',
    currentTask: 'Zero-trust contract auditing & anomaly tripwire scan',
    successRate: 99.9,
    tasksCompleted: 2150,
    tasksFailed: 2,
    lastActive: 'Just now',
    decisionsMade: 4380,
    resourceUsage: { tokensPerHour: 28400, computeMs: 720 },
    permissions: [
      { id: 'p15', name: 'TRIGGER_EMERGENCY_STOP', allowed: true, scope: 'GLOBAL', description: 'Halt all workers and on-chain activity' },
      { id: 'p16', name: 'CONTRACT_ALLOWLIST_AUDIT', allowed: true, scope: 'SMART_CONTRACTS', description: 'Approve or block smart contract addresses' },
      { id: 'p17', name: 'DYNAMIC_RISK_MODULATION', allowed: true, scope: 'POLICY_ENGINE', description: 'Increase strictness on anomalies' },
      { id: 'p18', name: 'LOWER_SECURITY_RESTRICTIONS', allowed: false, scope: 'SECURITY_POLICIES', description: 'Remove safety barriers autonomously' },
    ]
  },
  {
    id: 'agent_dir_comp',
    name: 'Elena Rostova',
    title: 'Regulatory & Compliance Director',
    department: 'COMPLIANCE',
    level: 2,
    role: 'DIRECTOR',
    status: 'ACTIVE',
    currentTask: 'Pre-flight multi-jurisdictional AML, sanctions, and Terms-of-Service gating',
    successRate: 100.0,
    tasksCompleted: 3120,
    tasksFailed: 0,
    lastActive: 'Just now',
    decisionsMade: 5210,
    resourceUsage: { tokensPerHour: 31200, computeMs: 640 },
    permissions: [
      { id: 'p_comp_1', name: 'COMPLIANCE_VETO_AUTHORITY', allowed: true, scope: 'GLOBAL', description: 'Independent veto power over all opportunities. Profit cannot override compliance.' },
      { id: 'p_comp_2', name: 'COMPLIANCE_KILL_SWITCH', allowed: true, scope: 'TARGETED_AND_GLOBAL', description: 'Trigger targeted pause on opportunities, projects, chains, or global operations' },
      { id: 'p_comp_3', name: 'SANCTIONS_SDN_SCREENING', allowed: true, scope: 'OFAC_EU_UN', description: 'Screen contract addresses and counter-parties against sanctions lists' },
      { id: 'p_comp_4', name: 'OVERRIDE_HUMAN_APPROVAL', allowed: false, scope: 'REGULATORY', description: 'Bypass human authorization requirements for regulated activities' },
    ]
  },
  {
    id: 'agent_dir_fin',
    name: 'Marcus Sterling',
    title: 'Finance Director',
    department: 'FINANCE',
    level: 2,
    role: 'DIRECTOR',
    status: 'ACTIVE',
    currentTask: 'Net profitability gas-to-reward ratio modeling',
    successRate: 98.8,
    tasksCompleted: 1340,
    tasksFailed: 16,
    lastActive: '30s ago',
    decisionsMade: 2980,
    resourceUsage: { tokensPerHour: 12800, computeMs: 290 },
    permissions: [
      { id: 'p19', name: 'CALCULATE_NET_PROFIT', allowed: true, scope: 'OPPORTUNITIES', description: 'Calculate gross minus gas, infra, and AI cost' },
      { id: 'p20', name: 'REWARD_RECONCILIATION', allowed: true, scope: 'ACCOUNTING', description: 'Reconcile on-chain receipts with ledger' },
      { id: 'p21', name: 'EXCEED_SPEND_LIMIT', allowed: false, scope: 'TREASURY', description: 'Authorize costs exceeding daily policy' },
    ]
  },
  {
    id: 'agent_dir_ops',
    name: 'Commander Drake',
    title: 'Operations Director',
    department: 'OPERATIONS',
    level: 2,
    role: 'DIRECTOR',
    status: 'ACTIVE',
    currentTask: 'Supervising 3 sandboxed worker task instances',
    successRate: 97.9,
    tasksCompleted: 1120,
    tasksFailed: 24,
    lastActive: '5s ago',
    decisionsMade: 2190,
    resourceUsage: { tokensPerHour: 19500, computeMs: 810 },
    permissions: [
      { id: 'p22', name: 'WORKER_DISPATCH', allowed: true, scope: 'SANDBOX_CLUSTER', description: 'Spawn isolated workers with strict timeboxes' },
      { id: 'p23', name: 'TASK_MONITORING', allowed: true, scope: 'PROCESSES', description: 'Kill rogue or hanging worker tasks' },
      { id: 'p24', name: 'RAW_SHELL_EXECUTION', allowed: false, scope: 'HOST_OS', description: 'Unsandboxed OS command execution' },
    ]
  },
  // LEVEL 3: SPECIALIZED AGENTS
  // Research Team
  {
    id: 'agent_scout_01',
    name: 'Opportunity Scout',
    title: 'Autonomous Ecosystem Crawler',
    department: 'RESEARCH',
    level: 3,
    role: 'RESEARCHER',
    status: 'ACTIVE',
    currentTask: 'Monitoring Base & Arbitrum testnet faucet registries',
    successRate: 99.2,
    tasksCompleted: 4520,
    tasksFailed: 35,
    lastActive: 'Just now',
    decisionsMade: 5120,
    resourceUsage: { tokensPerHour: 24100, computeMs: 380 },
    permissions: [
      { id: 'sc1', name: 'READ_PUBLIC_WEB', allowed: true, scope: 'ALLOWED_DOMAINS', description: 'Inspect approved docs, APIs, and GitHub repos' },
      { id: 'sc2', name: 'WRITE_OPPORTUNITY_DRAFT', allowed: true, scope: 'INBOX', description: 'Submit raw candidates for research verification' },
      { id: 'sc3', name: 'BYPASS_SECURITY_CAPTCHA', allowed: false, scope: 'WEB', description: 'Bypass CAPTCHAs, bot shields, or auth paywalls' },
      { id: 'sc4', name: 'WALLET_READ_WRITE', allowed: false, scope: 'WALLET', description: 'Access user balances or prepare signatures' },
    ]
  },
  {
    id: 'agent_trend_01',
    name: 'Trend Agent',
    title: 'Emerging Ecosystem & Grant Analyst',
    department: 'RESEARCH',
    level: 3,
    role: 'RESEARCHER',
    status: 'ACTIVE',
    currentTask: 'Mapping DePIN compute incentivization reward curves',
    successRate: 96.8,
    tasksCompleted: 870,
    tasksFailed: 28,
    lastActive: '2m ago',
    decisionsMade: 1410,
    resourceUsage: { tokensPerHour: 11300, computeMs: 250 },
    permissions: [
      { id: 'tr1', name: 'READ_ECOSYSTEM_DATA', allowed: true, scope: 'PUBLIC_CHAIN_APIS', description: 'Read DeFiLlama, CoinGecko, Github telemetry' },
      { id: 'tr2', name: 'WRITE_TREND_REPORTS', allowed: true, scope: 'KNOWLEDGE_BASE', description: 'Record ecosystem growth vectors' },
    ]
  },
  {
    id: 'agent_res_spec_01',
    name: 'Deep Research Agent',
    title: 'Protocol Docs & Whitepaper Verifier',
    department: 'RESEARCH',
    level: 3,
    role: 'RESEARCHER',
    status: 'ACTIVE',
    currentTask: 'Cross-verifying official git commit hashes for EigenLayer AVS quest',
    successRate: 98.9,
    tasksCompleted: 1290,
    tasksFailed: 14,
    lastActive: '18s ago',
    decisionsMade: 2180,
    resourceUsage: { tokensPerHour: 18900, computeMs: 440 },
    permissions: [
      { id: 'dr1', name: 'OFFICIAL_DOMAIN_VALIDATE', allowed: true, scope: 'SECURITY', description: 'Match DNS records and official X/GitHub links' },
      { id: 'dr2', name: 'CONVERT_STRUCTURED_RECORD', allowed: true, scope: 'DATABASE', description: 'Generate structured opportunity schema' },
    ]
  },
  {
    id: 'agent_historian_01',
    name: 'Opportunity Historian',
    title: 'Longitudinal Yield & Risk Archivist',
    department: 'RESEARCH',
    level: 3,
    role: 'RESEARCHER',
    status: 'ACTIVE',
    currentTask: 'Indexing gas-to-yield realization stats over 180 days',
    successRate: 100.0,
    tasksCompleted: 3450,
    tasksFailed: 0,
    lastActive: '4m ago',
    decisionsMade: 3450,
    resourceUsage: { tokensPerHour: 8400, computeMs: 190 },
    permissions: [
      { id: 'oh1', name: 'READ_HISTORICAL_RUNS', allowed: true, scope: 'HISTORICAL_DB', description: 'Compute success percentages and median delays' },
      { id: 'oh2', name: 'FEED_LEARNING_WEIGHTS', allowed: true, scope: 'PRIORITY_ENGINE', description: 'Adjust scoring heuristics for future scouts' },
    ]
  },
  // Security Agents
  {
    id: 'agent_sec_sc_01',
    name: 'Smart Contract Risk Agent',
    title: 'Bytecode & Slither Static Auditor',
    department: 'SECURITY',
    level: 3,
    role: 'SECURITY',
    status: 'ACTIVE',
    currentTask: 'Static analysis on Stargate V2 Polygon bridge interaction contract',
    successRate: 99.8,
    tasksCompleted: 2840,
    tasksFailed: 5,
    lastActive: 'Just now',
    decisionsMade: 4120,
    resourceUsage: { tokensPerHour: 15400, computeMs: 680 },
    permissions: [
      { id: 'sc_aud1', name: 'BYTECODE_DECOMPILE', allowed: true, scope: 'EVM_NODES', description: 'Analyze verified source & proxy implementations' },
      { id: 'sc_aud2', name: 'CONTRACT_BLACKLIST', allowed: true, scope: 'POLICY_ENGINE', description: 'Flag malicious reentrancy or mint exploits' },
    ]
  },
  {
    id: 'agent_sec_wallet_01',
    name: 'Wallet Security Agent',
    title: 'Allowance & Nonce Sentinel',
    department: 'SECURITY',
    level: 3,
    role: 'SECURITY',
    status: 'ACTIVE',
    currentTask: 'Verifying zero active infinite ERC-20 allowances on connected wallet',
    successRate: 100.0,
    tasksCompleted: 4890,
    tasksFailed: 0,
    lastActive: 'Just now',
    decisionsMade: 4890,
    resourceUsage: { tokensPerHour: 9200, computeMs: 180 },
    permissions: [
      { id: 'ws1', name: 'READ_ALLOWANCES', allowed: true, scope: 'WALLET_MONITOR', description: 'Monitor token approvals and pending nonces' },
      { id: 'ws2', name: 'FLAG_UNAUTHORIZED_PERMIT', allowed: true, scope: 'SECURITY_BUS', description: 'Alert on suspect permit signatures' },
      { id: 'ws3', name: 'HOLD_PRIVATE_KEYS', allowed: false, scope: 'VAULT', description: 'Store or access raw seed phrases' },
    ]
  },
  {
    id: 'agent_sec_fraud_01',
    name: 'Fraud Detection Agent',
    title: 'Phishing & Honeypot Scrutinizer',
    department: 'SECURITY',
    level: 3,
    role: 'SECURITY',
    status: 'ACTIVE',
    currentTask: 'Evaluating token liquidity locks for newly announced Arbitrum quest',
    successRate: 99.7,
    tasksCompleted: 3120,
    tasksFailed: 9,
    lastActive: '1m ago',
    decisionsMade: 3870,
    resourceUsage: { tokensPerHour: 14600, computeMs: 310 },
    permissions: [
      { id: 'fd1', name: 'SCAN_LOOKALIKE_DOMAINS', allowed: true, scope: 'DNS_INTEL', description: 'Check domain registration dates & SSL certs' },
      { id: 'fd2', name: 'AUTO_BLOCK_PHISHING', allowed: true, scope: 'DOMAIN_FIREWALL', description: 'Block rogue sites immediately' },
    ]
  },
  {
    id: 'agent_sec_tx_01',
    name: 'Transaction Risk Agent',
    title: 'Pre-Flight EVM State Simulator',
    department: 'SECURITY',
    level: 3,
    role: 'SECURITY',
    status: 'ACTIVE',
    currentTask: 'Tenderly fork simulation of quest task #TK-8842',
    successRate: 99.6,
    tasksCompleted: 1980,
    tasksFailed: 8,
    lastActive: '8s ago',
    decisionsMade: 2650,
    resourceUsage: { tokensPerHour: 16100, computeMs: 510 },
    permissions: [
      { id: 'tr_sim1', name: 'CALL_SIMULATION_RPC', allowed: true, scope: 'SIMULATOR', description: 'Execute eth_call / Tenderly dry runs' },
      { id: 'tr_sim2', name: 'BLOCK_REVERTING_TX', allowed: true, scope: 'POLICY_ENGINE', description: 'Halt transactions that fail simulation' },
    ]
  },
  {
    id: 'agent_sec_audit_01',
    name: 'Audit Sentinel',
    title: 'Cryptographic Hash Chainer',
    department: 'SECURITY',
    level: 3,
    role: 'SECURITY',
    status: 'ACTIVE',
    currentTask: 'Sealing block hash chain for audit ledger entry #AL-9942',
    successRate: 100.0,
    tasksCompleted: 9420,
    tasksFailed: 0,
    lastActive: 'Just now',
    decisionsMade: 9420,
    resourceUsage: { tokensPerHour: 6200, computeMs: 140 },
    permissions: [
      { id: 'as1', name: 'APPEND_AUDIT_LOG', allowed: true, scope: 'AUDIT_LEDGER', description: 'Write immutable tamper-evident logs' },
      { id: 'as2', name: 'MODIFY_PAST_LOGS', allowed: false, scope: 'AUDIT_LEDGER', description: 'Alter previous hash chain records' },
    ]
  },
  // Finance Team
  {
    id: 'agent_fin_profit_01',
    name: 'Profitability Engine',
    title: 'Net Yield & Cost Arbiter',
    department: 'FINANCE',
    level: 3,
    role: 'FINANCE',
    status: 'ACTIVE',
    currentTask: 'Computing net margin: $4.50 reward - $0.28 gas - $0.05 infra = +$4.17 net',
    successRate: 99.1,
    tasksCompleted: 2680,
    tasksFailed: 24,
    lastActive: 'Just now',
    decisionsMade: 3950,
    resourceUsage: { tokensPerHour: 11900, computeMs: 220 },
    permissions: [
      { id: 'pe1', name: 'EVALUATE_MARGINS', allowed: true, scope: 'OPPORTUNITIES', description: 'Enforce configured minimum net profit rule' },
      { id: 'pe2', name: 'ESTIMATE_GAS_VOLATILITY', allowed: true, scope: 'ORACLES', description: 'Query EIP-1559 base fee trends' },
    ]
  },
  // Operations & Workers
  {
    id: 'agent_worker_alpha',
    name: 'Worker Alpha (Sandboxed)',
    title: 'Quest & Interaction Executor',
    department: 'OPERATIONS',
    level: 3,
    role: 'WORKER',
    status: 'BUSY',
    currentTask: 'Executing Base Goerli verified faucet claim for deployment testnet credits',
    successRate: 98.4,
    tasksCompleted: 780,
    tasksFailed: 12,
    lastActive: 'Just now',
    decisionsMade: 920,
    resourceUsage: { tokensPerHour: 21000, computeMs: 920 },
    permissions: [
      { id: 'wa1', name: 'EXECUTE_PERMITTED_TASK', allowed: true, scope: 'SANDBOX_CONTAINER', description: 'Perform approved workflow under strict limits' },
      { id: 'wa2', name: 'TRANSACTION_PREPARATION', allowed: true, scope: 'EXECUTION_BUDGET', description: 'Formulate transaction data strictly under $5' },
      { id: 'wa3', name: 'TRANSACTION_SIGNING', allowed: false, scope: 'DIRECT_KEYS', description: 'Autonomous signing without policy gate' },
    ]
  },
  {
    id: 'agent_worker_beta',
    name: 'Worker Beta (Sandboxed)',
    title: 'DePIN & Faucet Protocol Worker',
    department: 'OPERATIONS',
    level: 3,
    role: 'WORKER',
    status: 'IDLE',
    currentTask: 'Standby in isolated container sandbox',
    successRate: 97.6,
    tasksCompleted: 640,
    tasksFailed: 16,
    lastActive: '4m ago',
    decisionsMade: 710,
    resourceUsage: { tokensPerHour: 1500, computeMs: 40 },
    permissions: [
      { id: 'wb1', name: 'EXECUTE_PERMITTED_TASK', allowed: true, scope: 'SANDBOX_CONTAINER', description: 'Perform approved workflow under strict limits' },
      { id: 'wb2', name: 'NETWORK_ISOLATION', allowed: true, scope: 'FIREWALL', description: 'Restricted strictly to allowlisted domains' },
    ]
  },
  // Website AI Engineers
  {
    id: 'agent_web_ux_01',
    name: 'UX Agent',
    title: 'Usability & Latency Monitor',
    department: 'ENGINEERING',
    level: 3,
    role: 'ENGINEER',
    status: 'ACTIVE',
    currentTask: 'Auditing one-click wallet connect ergonomics & mobile responsive bounds',
    successRate: 100.0,
    tasksCompleted: 390,
    tasksFailed: 0,
    lastActive: '12m ago',
    decisionsMade: 480,
    resourceUsage: { tokensPerHour: 7800, computeMs: 160 },
    permissions: [
      { id: 'ux1', name: 'INSPECT_CLIENT_VITALS', allowed: true, scope: 'FRONTEND', description: 'Read DOM render latency and interaction feedback' },
      { id: 'ux2', name: 'PROPOSE_UI_SPEC', allowed: true, scope: 'STAGING_QUEUE', description: 'Submit UX enhancement pull requests' },
    ]
  },
  {
    id: 'agent_web_perf_01',
    name: 'Performance Agent',
    title: 'Web Vitals & Bundle Optimizer',
    department: 'ENGINEERING',
    level: 3,
    role: 'ENGINEER',
    status: 'ACTIVE',
    currentTask: 'Optimizing tabular numeral repaints during live stream updates',
    successRate: 99.4,
    tasksCompleted: 510,
    tasksFailed: 3,
    lastActive: '18m ago',
    decisionsMade: 620,
    resourceUsage: { tokensPerHour: 9100, computeMs: 210 },
    permissions: [
      { id: 'pf1', name: 'PROFILE_LATENCY', allowed: true, scope: 'CODEBASE', description: 'Profile memory leaks and event loop timings' },
    ]
  },
  {
    id: 'agent_web_qa_01',
    name: 'QA & Security Reviewer',
    title: 'Automated Test & A11y Suite',
    department: 'ENGINEERING',
    level: 3,
    role: 'ENGINEER',
    status: 'ACTIVE',
    currentTask: 'Running 64 automated regression tests on staging environment',
    successRate: 99.8,
    tasksCompleted: 1140,
    tasksFailed: 2,
    lastActive: '6m ago',
    decisionsMade: 1390,
    resourceUsage: { tokensPerHour: 14200, computeMs: 430 },
    permissions: [
      { id: 'qa1', name: 'EXECUTE_TEST_SUITE', allowed: true, scope: 'STAGING', description: 'Execute integration tests and accessibility scans' },
      { id: 'qa2', name: 'GATEKEEPER_SIGN_OFF', allowed: true, scope: 'PR_PIPELINE', description: 'Approve code before passing to human review' },
    ]
  }
];

export const INITIAL_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'OPP-10492',
    title: 'Polygon PoS Stargate V2 Bridge Volume Incentive',
    project: 'Stargate Finance',
    category: 'LIQUIDITY_INCENTIVE',
    chain: 'Polygon',
    sourceUrl: 'https://stargate.finance/rewards',
    verifiedOfficial: true,
    requiredCapital: 10.00,
    estimatedGasCost: 0.04,
    estimatedInfraCost: 0.02,
    estimatedAiCost: 0.01,
    expectedGrossReward: 3.80,
    expectedNetProfit: 3.73,
    riskScore: 12,
    status: 'APPROVED',
    discoveredAt: '12m ago',
    deadline: 'In 6 days',
    eligibilityRequirements: ['Active Polygon wallet', 'Zero malicious history', 'Gas threshold >= 0.1 POL'],
    smartContractAddress: '0x45A01E4e04F14f7A4a6702c74187c5F6222033cd',
    executionSteps: [
      'Query verified Stargate liquidity contract on Polygon',
      'Verify allowance simulation in sandbox',
      'Execute single bridge liquidity relay ($10 principal)',
      'Register reward signature for STG distribution'
    ],
    historicalSuccessRate: 99.1
  },
  {
    id: 'OPP-10493',
    title: 'Base Ecosystem Builder Quest: Smart Contract Verification',
    project: 'Base Network',
    category: 'BLOCKCHAIN_QUEST',
    chain: 'Base',
    sourceUrl: 'https://base.org/quests',
    verifiedOfficial: true,
    requiredCapital: 0.00,
    estimatedGasCost: 0.18,
    estimatedInfraCost: 0.03,
    estimatedAiCost: 0.02,
    expectedGrossReward: 5.50,
    expectedNetProfit: 5.27,
    riskScore: 8,
    status: 'APPROVED',
    discoveredAt: '24m ago',
    deadline: 'In 3 days',
    eligibilityRequirements: ['Connected Base address', 'Gitcoin Passport score >= 12 or clean on-chain history'],
    smartContractAddress: '0x3154Cf16ccdb4C6d922629664174b904d80F2C35',
    executionSteps: [
      'Call official Base Quest validator contract',
      'Verify GitHub developer identity signature',
      'Mint verifiable soulbound completion credential',
      'Claim native gas grant voucher'
    ],
    historicalSuccessRate: 98.7
  },
  {
    id: 'OPP-10494',
    title: 'Arbitrum Stylus Testnet Faucet & Execution Reward',
    project: 'Arbitrum Foundation',
    category: 'TESTNET',
    chain: 'Arbitrum',
    sourceUrl: 'https://arbitrum.io/stylus',
    verifiedOfficial: true,
    requiredCapital: 0.00,
    estimatedGasCost: 0.05,
    estimatedInfraCost: 0.01,
    estimatedAiCost: 0.01,
    expectedGrossReward: 2.50,
    expectedNetProfit: 2.43,
    riskScore: 6,
    status: 'APPROVED',
    discoveredAt: '45m ago',
    deadline: 'In 14 days',
    eligibilityRequirements: ['EVM address with >0 tx history on Sepolia or Arbitrum'],
    smartContractAddress: '0x912CE59144191C1204E64559FE8253a0e49E6548',
    executionSteps: [
      'Request authorized testnet allocation from official Stylus faucet endpoint',
      'Deploy 1 lightweight verified Rust/Wasm micro-contract',
      'Log transaction hash with official campaign oracle',
      'Accumulate Stylus Sprint developer points convertible to ARB grant'
    ],
    historicalSuccessRate: 99.8
  },
  {
    id: 'OPP-10495',
    title: 'Grass Network DePIN Bandwidth Worker Incentive',
    project: 'Grass Foundation',
    category: 'DEPIN',
    chain: 'Solana',
    sourceUrl: 'https://getgrass.io',
    verifiedOfficial: true,
    requiredCapital: 0.00,
    estimatedGasCost: 0.00,
    estimatedInfraCost: 0.15,
    estimatedAiCost: 0.05,
    expectedGrossReward: 7.20,
    expectedNetProfit: 7.00,
    riskScore: 14,
    status: 'APPROVED',
    discoveredAt: '1h ago',
    deadline: 'Continuous season',
    eligibilityRequirements: ['Verified residential IP connection via sandbox agent', 'Zero proxy flags'],
    executionSteps: [
      'Authenticate with Grass worker node API using public credential token',
      'Route verified AI scraping heartbeat through sandboxed gateway',
      'Log periodic epoch uptime receipts',
      'Accrue Grass Epoch token credits'
    ],
    historicalSuccessRate: 97.4
  },
  {
    id: 'OPP-10496',
    title: 'EigenLayer Active Validator AVS Node Delegator Staking',
    project: 'EigenLayer',
    category: 'STAKING',
    chain: 'Ethereum',
    sourceUrl: 'https://app.eigenlayer.xyz',
    verifiedOfficial: true,
    requiredCapital: 25.00,
    estimatedGasCost: 1.85,
    estimatedInfraCost: 0.10,
    estimatedAiCost: 0.05,
    expectedGrossReward: 12.00,
    expectedNetProfit: 10.00,
    riskScore: 19,
    status: 'HUMAN_APPROVAL_REQUIRED',
    statusReason: 'Capital required ($25) and gas cost exceed automatic zero-touch threshold ($5)',
    discoveredAt: '2h ago',
    deadline: 'In 18 days',
    eligibilityRequirements: ['Holding minimum 0.01 stETH or native ETH', 'Human signature authorization'],
    smartContractAddress: '0x858646372CC42E1A627fcCD94a70739b6e8a1a3A',
    executionSteps: [
      'Require Owner approval via Approval Queue',
      'Deposit stETH into verified EigenLayer Strategy Manager contract',
      'Delegate to top-rated decentralized operator with zero slashing history',
      'Accrue weekly EigenLayer point allocations & AVS rewards'
    ],
    historicalSuccessRate: 98.2
  },
  {
    id: 'OPP-10497',
    title: 'Optimism RetroPGF Open-Source Tooling Micro-Grant',
    project: 'Optimism Collective',
    category: 'GRANT',
    chain: 'Optimism',
    sourceUrl: 'https://app.optimism.io/retropgf',
    verifiedOfficial: true,
    requiredCapital: 0.00,
    estimatedGasCost: 0.08,
    estimatedInfraCost: 0.20,
    estimatedAiCost: 0.15,
    expectedGrossReward: 45.00,
    expectedNetProfit: 44.57,
    riskScore: 15,
    status: 'HUMAN_APPROVAL_REQUIRED',
    statusReason: 'Grant milestone submission requires human owner verification of code repository',
    discoveredAt: '3h ago',
    deadline: 'In 8 days',
    eligibilityRequirements: ['Open source repository commit on GitHub', 'EAS attestations'],
    executionSteps: [
      'Document AI Crypto Earning Org public adapters on GitHub',
      'Submit Ethereum Attestation Service (EAS) credential',
      'Human owner approves submission payload',
      'Receive OP distribution upon round closing'
    ],
    historicalSuccessRate: 94.0
  },
  {
    id: 'OPP-10498',
    title: 'Suspicious High-Yield Telegram Airdrop Bot',
    project: 'Unknown Protocol',
    category: 'AIRDROP_ELIGIBILITY',
    chain: 'Ethereum',
    sourceUrl: 'https://claim-free-airdrop-now.xyz',
    verifiedOfficial: false,
    requiredCapital: 0.00,
    estimatedGasCost: 15.00,
    estimatedInfraCost: 0.10,
    estimatedAiCost: 0.05,
    expectedGrossReward: 500.00,
    expectedNetProfit: 484.85,
    riskScore: 98,
    status: 'REJECTED',
    statusReason: 'Fraud Detection Agent identified unverified domain, drainer signature, and fake promises.',
    discoveredAt: '4h ago',
    eligibilityRequirements: ['Requires signing unverified permit hash (BLOCKED)'],
    executionSteps: ['REJECTED BY FRAUD DETECTION AGENT'],
    historicalSuccessRate: 0.0
  }
];

export const INITIAL_TASKS: TaskRecord[] = [
  {
    id: 'TK-8842',
    opportunityId: 'OPP-10493',
    opportunityTitle: 'Base Ecosystem Builder Quest: Smart Contract Verification',
    assignedWorkerId: 'agent_worker_alpha',
    assignedWorkerName: 'Worker Alpha (Sandboxed)',
    chain: 'Base',
    status: 'EXECUTING',
    progressPercent: 68,
    startedAt: '3m ago',
    gasSpentUSD: 0.14,
    simulationPassed: true,
    sandbox: {
      workerId: 'agent_worker_alpha',
      workerName: 'Worker Alpha',
      allowedDomains: ['base.org', 'api.basescan.org', 'quest.base.org'],
      allowedActions: ['HTTP_GET', 'READ_CONTRACT', 'SIMULATE_TX', 'PREPARE_GAS_CLAIM'],
      maxTxBudgetUSD: 5.00,
      timeLimitSeconds: 300,
      status: 'ACTIVE'
    },
    logSteps: [
      { timestamp: '13:28:10', message: 'Assigned by Operations Director to Worker Alpha sandbox', level: 'INFO' },
      { timestamp: '13:28:18', message: 'Domain allowlist validated (base.org, api.basescan.org)', level: 'INFO' },
      { timestamp: '13:28:34', message: 'Tenderly simulation passed: 0x3154...2C35 returns status 1 (success)', level: 'SUCCESS' },
      { timestamp: '13:29:12', message: 'Transaction gas prepared: 0.000045 ETH ($0.14) <= policy limit ($5.00)', level: 'INFO' },
      { timestamp: '13:29:50', message: 'Calling quest verification oracle... waiting for block inclusion', level: 'INFO' }
    ]
  },
  {
    id: 'TK-8841',
    opportunityId: 'OPP-10494',
    opportunityTitle: 'Arbitrum Stylus Testnet Faucet & Execution Reward',
    assignedWorkerId: 'agent_worker_alpha',
    assignedWorkerName: 'Worker Alpha (Sandboxed)',
    chain: 'Arbitrum',
    status: 'SUCCESS',
    progressPercent: 100,
    startedAt: '18m ago',
    completedAt: '12m ago',
    gasSpentUSD: 0.05,
    actualRewardUSD: 2.50,
    txHash: '0x8f2d93e1b7305948a31e84d43657cb029a5f7823b491ecda592984920c81d3f9',
    simulationPassed: true,
    sandbox: {
      workerId: 'agent_worker_alpha',
      workerName: 'Worker Alpha',
      allowedDomains: ['arbitrum.io', 'faucet.arbitrum.io'],
      allowedActions: ['HTTP_GET', 'FAUCET_REQUEST', 'DEPLOY_WASM'],
      maxTxBudgetUSD: 5.00,
      timeLimitSeconds: 300,
      status: 'IDLE'
    },
    logSteps: [
      { timestamp: '13:12:00', message: 'Worker spawned in sandboxed container', level: 'INFO' },
      { timestamp: '13:13:20', message: 'Faucet claim signature verified against Stylus endpoint', level: 'INFO' },
      { timestamp: '13:14:05', message: 'Micro-contract deployed on Arbitrum Stylus testnet', level: 'SUCCESS' },
      { timestamp: '13:16:30', message: 'Receipt validated: 0x8f2d...d3f9 confirmed on-chain. $2.50 reward credited.', level: 'SUCCESS' }
    ]
  },
  {
    id: 'TK-8840',
    opportunityId: 'OPP-10492',
    opportunityTitle: 'Polygon PoS Stargate V2 Bridge Volume Incentive',
    assignedWorkerId: 'agent_worker_beta',
    assignedWorkerName: 'Worker Beta (Sandboxed)',
    chain: 'Polygon',
    status: 'QUEUED',
    progressPercent: 15,
    startedAt: '1m ago',
    gasSpentUSD: 0.00,
    simulationPassed: true,
    sandbox: {
      workerId: 'agent_worker_beta',
      workerName: 'Worker Beta',
      allowedDomains: ['stargate.finance', 'polygonscan.com'],
      allowedActions: ['READ_CONTRACT', 'ESTIMATE_SLIPPAGE'],
      maxTxBudgetUSD: 5.00,
      timeLimitSeconds: 180,
      status: 'ACTIVE'
    },
    logSteps: [
      { timestamp: '13:30:10', message: 'Queued by Task Orchestrator after policy check passed', level: 'INFO' },
      { timestamp: '13:30:25', message: 'Awaiting current active worker batch completion', level: 'INFO' }
    ]
  }
];

export const INITIAL_REWARDS: RewardRecord[] = [
  {
    id: 'REW-401',
    opportunityId: 'OPP-10494',
    opportunityTitle: 'Arbitrum Stylus Testnet Faucet & Execution Reward',
    project: 'Arbitrum Foundation',
    chain: 'Arbitrum',
    category: 'TESTNET',
    rewardType: 'TOKEN',
    estimatedAmountUSD: 2.50,
    actualAmountUSD: 2.50,
    tokenSymbol: 'ARB',
    tokenAmount: 3.25,
    status: 'CLAIMABLE',
    claimTxHash: '0x8f2d93e1b7305948a31e84d43657cb029a5f7823b491ecda592984920c81d3f9',
    detectedAt: '12m ago',
    isSimulatedEstimated: false
  },
  {
    id: 'OPP-10493-REW',
    opportunityId: 'OPP-10493',
    opportunityTitle: 'Base Ecosystem Builder Quest: Smart Contract Verification',
    project: 'Base Network',
    chain: 'Base',
    category: 'BLOCKCHAIN_QUEST',
    rewardType: 'FAUCET_GAS',
    estimatedAmountUSD: 5.50,
    actualAmountUSD: 0.00,
    tokenSymbol: 'ETH',
    tokenAmount: 0.0018,
    status: 'IN_PROGRESS',
    detectedAt: '24m ago',
    isSimulatedEstimated: true
  },
  {
    id: 'REW-399',
    opportunityId: 'OPP-10488',
    opportunityTitle: 'Polygon PoS QuickSwap Liquidity Milestone Reward',
    project: 'QuickSwap',
    chain: 'Polygon',
    category: 'LIQUIDITY_INCENTIVE',
    rewardType: 'TOKEN',
    estimatedAmountUSD: 6.80,
    actualAmountUSD: 6.75,
    tokenSymbol: 'QUICK',
    tokenAmount: 14.2,
    status: 'CLAIMED',
    claimTxHash: '0x3b1c8e94a50d22180fa9321c84918e9182049182390a82049182309182049a81',
    claimedAt: 'Yesterday, 18:40',
    detectedAt: 'Yesterday, 17:10',
    isSimulatedEstimated: false
  },
  {
    id: 'REW-398',
    opportunityId: 'OPP-10482',
    opportunityTitle: 'Gitcoin Passport On-Chain Verification Bounty',
    project: 'Gitcoin Grants',
    chain: 'Optimism',
    category: 'BOUNTY',
    rewardType: 'BOUNTY_USD',
    estimatedAmountUSD: 15.00,
    actualAmountUSD: 15.00,
    tokenSymbol: 'USDC',
    tokenAmount: 15.00,
    status: 'CLAIMED',
    claimTxHash: '0x1928374650192837465019283746501928374650192837465019283746501928',
    claimedAt: '2 days ago',
    detectedAt: '2 days ago',
    isSimulatedEstimated: false
  }
];

export const INITIAL_STRATEGIES: StrategyProposal[] = [
  {
    id: 'STRAT-01',
    title: 'Multi-Chain Gas Arbitrage & Faucet Micro-Recycling',
    category: 'TESTNET',
    targetChains: ['Arbitrum', 'Base', 'Polygon', 'Optimism'],
    stage: 'MONITORING',
    expectedMonthlyYieldUSD: 85.00,
    estimatedRiskScore: 8,
    proposedByAgent: 'agent_dir_strat',
    proposerTitle: 'Strategy Director (Cassian Vane)',
    description: 'Systematically collects authorized testnet gas vouchers across top EVM testnets, participates in developer sprint quests, and converts reward credits into operational gas reserves without manual labor.',
    backtestResults: {
      simulatedRuns: 120,
      successRate: 98.3,
      avgProfitPerRun: 2.15,
      maxDrawdown: 0.12
    },
    securityAuditScore: 96,
    requiresHumanApproval: false,
    approvedByHuman: true,
    createdAt: '14 days ago'
  },
  {
    id: 'STRAT-02',
    title: 'DePIN Edge Micro-Verification Bandwidth Harvest',
    category: 'DEPIN',
    targetChains: ['Solana', 'Base'],
    stage: 'LIMITED_DEPLOYMENT',
    expectedMonthlyYieldUSD: 140.00,
    estimatedRiskScore: 14,
    proposedByAgent: 'agent_dir_strat',
    proposerTitle: 'Strategy Director (Cassian Vane)',
    description: 'Runs isolated containerized heartbeat probes against verified decentralized compute & storage networks (Grass, Helium, io.net) verifying AI training datasets and receiving protocol tokens.',
    backtestResults: {
      simulatedRuns: 85,
      successRate: 96.5,
      avgProfitPerRun: 4.80,
      maxDrawdown: 0.45
    },
    securityAuditScore: 92,
    requiresHumanApproval: true,
    approvedByHuman: true,
    createdAt: '6 days ago'
  },
  {
    id: 'STRAT-03',
    title: 'Layer-2 Restaking Yield Optimizer via EigenLayer & Symbiotic',
    category: 'STAKING',
    targetChains: ['Ethereum'],
    stage: 'APPROVAL',
    expectedMonthlyYieldUSD: 320.00,
    estimatedRiskScore: 22,
    proposedByAgent: 'agent_dir_strat',
    proposerTitle: 'Strategy Director (Cassian Vane)',
    description: 'Calculates optimal restaking points allocation for stETH across audited AVS operators with slashing insurance. Awaiting final human owner sign-off.',
    backtestResults: {
      simulatedRuns: 45,
      successRate: 97.8,
      avgProfitPerRun: 18.40,
      maxDrawdown: 1.20
    },
    securityAuditScore: 94,
    requiresHumanApproval: true,
    approvedByHuman: false,
    createdAt: '2 days ago'
  }
];

export const INITIAL_WEBSITE_IMPROVEMENTS: WebsiteImprovement[] = [
  {
    id: 'WEB-PR-108',
    agentName: 'UX Agent',
    component: 'WalletConnect Modal & Error Boundary',
    type: 'UX',
    title: 'Enhanced Non-Custodial Zero-Key Proofs & Session Reconnect',
    problemDiscovered: 'Users need visual confirmation that their private keys never leave their browser during Web3 wallet connection.',
    proposedSolution: 'Inject clear cryptographic isolation guarantee badge and auto-restore previous read-only session state from localStorage.',
    stage: 'STAGING_VERIFIED',
    diffPreview: `@@ -42,6 +42,12 @@
+ <div className="border border-emerald-500/20 bg-emerald-950/30 p-3 rounded">
+   <span className="text-emerald-400 font-mono text-xs">NON-CUSTODIAL ISOLATION: ACTIVE</span>
+   <p className="text-xs text-slate-400">Zero private keys stored. All actions require typed EIP-712 permission.</p>
+ </div>`,
    testResults: {
      unitTests: true,
      securityScan: true,
      a11yScore: 98,
      latencyImpactMs: -14
    },
    isHighRisk: false,
    humanApproved: false,
    createdAt: '4 hours ago'
  },
  {
    id: 'WEB-PR-107',
    agentName: 'Performance Agent',
    component: 'Audit Logs Hash-Chain Virtualized List',
    type: 'PERFORMANCE',
    title: 'Windowed Virtualization for Live Telemetry Stream',
    problemDiscovered: 'High-frequency streaming events cause minor DOM repaints when audit log expands past 500 rows.',
    proposedSolution: 'Mount sliding window virtualization to keep active DOM nodes capped at 30 items maximum.',
    stage: 'PRODUCTION_DEPLOYED',
    diffPreview: `@@ -15,4 +15,6 @@
- return <div>{logs.map(log => <LogRow key={log.id} log={log} />)}</div>;
+ const visibleItems = logs.slice(0, 30);
+ return <div className="divide-y divide-slate-800">{visibleItems.map(renderRow)}</div>;`,
    testResults: {
      unitTests: true,
      securityScan: true,
      a11yScore: 100,
      latencyImpactMs: -45
    },
    isHighRisk: false,
    humanApproved: true,
    createdAt: 'Yesterday'
  }
];

export const INITIAL_POLICY: SecurityPolicy = {
  maxTransactionValueUSD: 5.00,
  maxDailySpendingUSD: 25.00,
  minExpectedNetProfitUSD: 1.00,
  maxRiskScoreAllowed: 25,
  maxSimultaneousTasks: 4,
  requireApprovalAboveUSD: 10.00,
  allowedChains: ['Ethereum', 'Polygon', 'Arbitrum', 'Base', 'Optimism'],
  allowedDomains: [
    'ethereum.org',
    'polygon.technology',
    'arbitrum.io',
    'base.org',
    'optimism.io',
    'stargate.finance',
    'app.uniswap.org',
    'quickswap.exchange',
    'getgrass.io',
    'github.com',
    'api.basescan.org',
    'api.arbiscan.io',
    'api.polygonscan.com'
  ],
  allowedContractAllowlist: [
    { address: '0x45A01E4e04F14f7A4a6702c74187c5F6222033cd', chain: 'Polygon', protocolName: 'Stargate V2 Router', verifiedAt: '2026-08-10' },
    { address: '0x3154Cf16ccdb4C6d922629664174b904d80F2C35', chain: 'Base', protocolName: 'Base Quest Portal', verifiedAt: '2026-08-14' },
    { address: '0x912CE59144191C1204E64559FE8253a0e49E6548', chain: 'Arbitrum', protocolName: 'Arbitrum Token Distributor', verifiedAt: '2026-08-01' },
    { address: '0x858646372CC42E1A627fcCD94a70739b6e8a1a3A', chain: 'Ethereum', protocolName: 'EigenLayer StrategyManager', verifiedAt: '2026-08-20' }
  ],
  autoHaltOnFailedTxCount: 5,
  currentFailedTxCount: 0,
  emergencyStopActive: false,
  strictModeEnabled: true
};

export const INITIAL_APPROVALS: ApprovalRequest[] = [
  {
    id: 'APP-901',
    type: 'HIGH_VALUE_TRANSACTION',
    title: 'Authorize $25 stETH EigenLayer Restaking Deposit',
    description: 'Opportunity OPP-10496 requires $25.00 deposit, which exceeds the autonomous $5.00 cap. Security audit passed with score 94.',
    requestedByAgent: 'Operations Director (Commander Drake)',
    amountUSD: 25.00,
    chain: 'Ethereum',
    riskAssessment: {
      score: 19,
      notes: 'Audited contract, zero historical slashing, verifiable withdrawal rights within 7 days.'
    },
    payload: {
      opportunityId: 'OPP-10496',
      targetContract: '0x858646372CC42E1A627fcCD94a70739b6e8a1a3A',
      stakedAmount: 0.0085,
      asset: 'stETH'
    },
    createdAt: '1 hour ago',
    status: 'PENDING'
  },
  {
    id: 'APP-902',
    type: 'WEBSITE_PRODUCTION_DEPLOY',
    title: 'Deploy UX Agent Staging PR #108 to Production',
    description: 'Code change improves non-custodial zero-key proof indicators and session restoration. Automated tests passed 64/64 with 0 security warnings.',
    requestedByAgent: 'Engineering Director (Kaelen Thorne)',
    riskAssessment: {
      score: 4,
      notes: 'Frontend DOM enhancement only. Zero backend/wallet state mutations.'
    },
    payload: {
      prId: 'WEB-PR-108',
      testRunsPassed: 64,
      a11yScore: 98
    },
    createdAt: '3 hours ago',
    status: 'PENDING'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'AL-9942',
    timestamp: '13:30:14',
    agentId: 'agent_sec_audit_01',
    agentName: 'Audit Sentinel',
    actionType: 'TRANSACTION_SIMULATION',
    details: 'Simulation passed for task TK-8842 on Base: zero revert conditions detected, gas capped at $0.14.',
    targetChain: 'Base',
    targetAddress: '0x3154Cf16ccdb4C6d922629664174b904d80F2C35',
    hash: '0x9e8a71b4c30291f8a7e4b901928374a589301928374619283746192837461928',
    previousHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    tamperVerified: true
  },
  {
    id: 'AL-9941',
    timestamp: '13:28:40',
    agentId: 'agent_fin_profit_01',
    agentName: 'Profitability Engine',
    actionType: 'PROFIT_EVALUATION',
    details: 'Evaluated OPP-10493: Gross $5.50 - Gas $0.18 - Infra $0.03 - AI $0.02 = Net $5.27 >= Min $1.00. APPROVED.',
    hash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    previousHash: '0x7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7f8e',
    tamperVerified: true
  },
  {
    id: 'AL-9940',
    timestamp: '13:24:12',
    agentId: 'agent_sec_sc_01',
    agentName: 'Smart Contract Risk Agent',
    actionType: 'SECURITY_RISK_CHECK',
    details: 'Static analysis on Base contract 0x3154...2C35 verified 0 reentrancy flags, 0 mint powers. Risk score: 8/100.',
    targetChain: 'Base',
    targetAddress: '0x3154Cf16ccdb4C6d922629664174b904d80F2C35',
    hash: '0x7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7f8e',
    previousHash: '0x5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b',
    tamperVerified: true
  },
  {
    id: 'AL-9939',
    timestamp: '13:20:05',
    agentId: 'agent_scout_01',
    agentName: 'Opportunity Scout',
    actionType: 'OPPORTUNITY_DISCOVERY',
    details: 'Discovered official Base Ecosystem Builder Quest OPP-10493 from verified portal base.org/quests.',
    targetChain: 'Base',
    hash: '0x5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b',
    previousHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    tamperVerified: true
  }
];

export const INITIAL_MESSAGES: AgentMessage[] = [
  {
    id: 'msg_01',
    timestamp: '13:30:14',
    messageType: 'TASK_STEP_EXECUTING',
    fromAgent: 'agent_worker_alpha',
    toAgent: 'agent_dir_ops',
    opportunityId: 'OPP-10493',
    priority: 'LOW',
    summary: 'Worker Alpha progress 68%: awaiting final contract receipt on Base.',
  },
  {
    id: 'msg_02',
    timestamp: '13:28:40',
    messageType: 'PROFIT_CHECK_APPROVED',
    fromAgent: 'agent_fin_profit_01',
    toAgent: 'agent_gov_01',
    opportunityId: 'OPP-10493',
    priority: 'MEDIUM',
    summary: 'Expected net profit ($5.27) satisfies minimum policy rule ($1.00). Approved for task creation.',
  },
  {
    id: 'msg_03',
    timestamp: '13:24:12',
    messageType: 'SECURITY_AUDIT_PASS',
    fromAgent: 'agent_sec_sc_01',
    toAgent: 'agent_dir_sec',
    opportunityId: 'OPP-10493',
    priority: 'MEDIUM',
    summary: 'Smart contract verified: low risk score 8/100, zero high-severity vulnerabilities.',
  },
  {
    id: 'msg_04',
    timestamp: '13:20:05',
    messageType: 'OPPORTUNITY_FOUND',
    fromAgent: 'agent_scout_01',
    toAgent: 'agent_dir_res',
    opportunityId: 'OPP-10493',
    priority: 'LOW',
    summary: 'Scout identified new official Base Network builder quest from base.org/quests.',
  }
];

export const BLOCKCHAIN_ADAPTERS: BlockchainAdapterInfo[] = [
  {
    chain: 'Ethereum',
    chainId: 1,
    rpcUrl: 'https://eth.llamarpc.com',
    symbol: 'ETH',
    gasPriceGwei: 14.2,
    blockTimeSec: 12.1,
    status: 'OPERATIONAL',
    adapterClass: 'EthereumMainnetAdapter',
    activeContractsAllowed: 12
  },
  {
    chain: 'Polygon',
    chainId: 137,
    rpcUrl: 'https://polygon-rpc.com',
    symbol: 'POL',
    gasPriceGwei: 32.5,
    blockTimeSec: 2.1,
    status: 'OPERATIONAL',
    adapterClass: 'PolygonPoSAdapter',
    activeContractsAllowed: 24
  },
  {
    chain: 'Arbitrum',
    chainId: 42161,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    symbol: 'ETH',
    gasPriceGwei: 0.12,
    blockTimeSec: 0.25,
    status: 'OPERATIONAL',
    adapterClass: 'ArbitrumOneAdapter',
    activeContractsAllowed: 18
  },
  {
    chain: 'Base',
    chainId: 8453,
    rpcUrl: 'https://mainnet.base.org',
    symbol: 'ETH',
    gasPriceGwei: 0.08,
    blockTimeSec: 2.0,
    status: 'OPERATIONAL',
    adapterClass: 'BaseNetworkAdapter',
    activeContractsAllowed: 16
  },
  {
    chain: 'Optimism',
    chainId: 10,
    rpcUrl: 'https://mainnet.optimism.io',
    symbol: 'ETH',
    gasPriceGwei: 0.09,
    blockTimeSec: 2.0,
    status: 'OPERATIONAL',
    adapterClass: 'OptimismAdapter',
    activeContractsAllowed: 14
  }
];

export const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif_1',
    timestamp: '12m ago',
    title: 'Reward Detected',
    message: 'Arbitrum Stylus Testnet reward ($2.50) confirmed on-chain and ready to claim.',
    type: 'REWARD',
    read: false,
    actionUrl: 'earnings'
  },
  {
    id: 'notif_2',
    timestamp: '1h ago',
    title: 'Approval Required',
    message: 'High-value opportunity ($25 stETH EigenLayer deposit) requires Owner sign-off.',
    type: 'APPROVAL',
    read: false,
    actionUrl: 'approvals'
  },
  {
    id: 'notif_3',
    timestamp: '4h ago',
    title: 'Phishing Prevented',
    message: 'Fraud Detection Agent blocked suspicious airdrop domain claim-free-airdrop-now.xyz.',
    type: 'SECURITY',
    read: true,
    actionUrl: 'security'
  }
];

export const INITIAL_COMPLIANCE_POLICY: CompliancePolicy = {
  userDeclaredJurisdiction: 'United States (US)',
  businessEntityJurisdiction: 'Delaware C-Corp (Non-Custodial Developer)',
  serviceOperatingJurisdiction: 'Decentralized Multi-Region (US/EU/Global)',
  complianceKillSwitch: {
    pausedOpportunities: ['OPP-10499'],
    pausedProjects: [],
    pausedChains: [],
    pausedJurisdictions: ['IR', 'KP', 'CU', 'SY', 'RU'],
    pausedStrategies: [],
    allAutomatedTransactionsPaused: false,
    allAutomatedExecutionPaused: false,
    lastTriggeredBy: 'Elena Rostova (Compliance Director)',
    lastTriggeredReason: 'OFAC SDN screening active. Section 31 non-override policy enforced.',
    lastTriggeredAt: '2h ago'
  },
  strictNonCustodialOnly: true,
  blockUnknownJurisdiction: true,
  blockUnregulatedServices: true,
  blockIfAutomationProhibited: true,
  requireKycAboveUSD: 10.00,
  prohibitGuaranteedYieldMarketing: true,
  jurisdictionConfigs: [
    {
      code: 'US',
      name: 'United States',
      status: 'CONDITIONAL',
      requiresKyc: true,
      prohibitedCategories: ['BROKERAGE_LIKE_ACTIVITY', 'CUSTODY', 'PAYMENT_ACTIVITY'],
      sanctioned: false,
      taxReportingStandard: 'IRS 1099-DA / FMV Receipt',
      regulatoryAuthority: 'SEC / CFTC / FinCEN'
    },
    {
      code: 'EU',
      name: 'European Union (MiCA)',
      status: 'PERMITTED',
      requiresKyc: false,
      prohibitedCategories: ['CUSTODY', 'BROKERAGE_LIKE_ACTIVITY'],
      sanctioned: false,
      taxReportingStandard: 'EU DAC8 Crypto Tax Standard',
      regulatoryAuthority: 'ESMA / EBA'
    },
    {
      code: 'GB',
      name: 'United Kingdom',
      status: 'PERMITTED',
      requiresKyc: false,
      prohibitedCategories: ['FINANCIAL_PROMOTION', 'CUSTODY'],
      sanctioned: false,
      taxReportingStandard: 'HMRC Cryptoasset Manual',
      regulatoryAuthority: 'FCA'
    },
    {
      code: 'SG',
      name: 'Singapore',
      status: 'PERMITTED',
      requiresKyc: false,
      prohibitedCategories: ['PAYMENT_ACTIVITY', 'CUSTODY'],
      sanctioned: false,
      taxReportingStandard: 'IRAS Digital Token Guidelines',
      regulatoryAuthority: 'MAS'
    },
    {
      code: 'KP',
      name: 'North Korea (DPRK)',
      status: 'PROHIBITED',
      requiresKyc: true,
      prohibitedCategories: [
        'EDUCATIONAL_ACTIVITY',
        'TESTNET_PARTICIPATION',
        'FAUCET_CLAIM',
        'AIRDROP_PARTICIPATION',
        'STAKING',
        'LENDING',
        'LIQUIDITY_PROVISION',
        'TOKEN_SWAP',
        'CUSTODY',
        'ASSET_TRANSFER',
        'BROKERAGE_LIKE_ACTIVITY',
        'PAYMENT_ACTIVITY',
        'FINANCIAL_PROMOTION',
        'INVESTMENT_RELATED_ACTIVITY',
        'DEFI_INTERACTION',
        'MINING_COMPUTE_PARTICIPATION'
      ],
      sanctioned: true,
      taxReportingStandard: 'Comprehensive Sanctions Embargo',
      regulatoryAuthority: 'UN / OFAC Sanctions Regime'
    }
  ]
};

export const INITIAL_REGULATORY_ALERTS: RegulatoryChangeAlert[] = [
  {
    id: 'REG-ALERT-2026-001',
    detectedAt: '35m ago',
    source: 'SEC / FinCEN Joint Advisory',
    jurisdiction: 'United States',
    summary: 'Updated non-custodial software developer guidance reaffirming exclusion of automated testnet interactions from money transmitter status.',
    affectedChains: ['Ethereum', 'Arbitrum', 'Polygon', 'Base', 'Optimism'],
    affectedStrategies: ['Testnet Faucet Cycle', 'Developer Bounty Automation'],
    affectedOpportunities: ['OPP-001', 'OPP-003'],
    impactLevel: 'LOW',
    status: 'ACTIVE_REVIEW',
    actionTaken: 'Verified non-custodial status for all testnet worker sandboxes. No halt required.',
    requiresLegalCounsel: false
  },
  {
    id: 'REG-ALERT-2026-002',
    detectedAt: '2h ago',
    source: 'OFAC SDN Update Bulletin',
    jurisdiction: 'United States / Global',
    summary: 'Designation of 3 new mixer contract addresses under cyber sanctions program.',
    affectedChains: ['Ethereum Mainnet', 'BNB Chain'],
    affectedStrategies: ['Multi-Chain Routing'],
    affectedOpportunities: ['OPP-10499'],
    impactLevel: 'CRITICAL',
    status: 'STRATEGIES_PAUSED',
    actionTaken: 'Elena Rostova triggered immediate COMPLIANCE VETO on OPP-10499. Address added to global blacklist.',
    requiresLegalCounsel: true
  },
  {
    id: 'REG-ALERT-2026-003',
    detectedAt: '5h ago',
    source: 'ESMA MiCA Title III Rules',
    jurisdiction: 'European Union',
    summary: 'Clarification on liquid staking token classification under asset-referenced token exemptions.',
    affectedChains: ['Ethereum'],
    affectedStrategies: ['Lido / RocketPool Validator Flow'],
    affectedOpportunities: ['OPP-007'],
    impactLevel: 'MEDIUM',
    status: 'ACTIVE_REVIEW',
    actionTaken: 'Flagged staking opportunities requiring human owner confirmation of custody disclaimer.',
    requiresLegalCounsel: false
  }
];

export const INITIAL_COMPLIANCE_AUDIT_LOGS: ComplianceAuditRecord[] = [
  {
    id: 'COMP-LOG-001',
    opportunityId: 'OPP-001',
    opportunityTitle: 'Arbitrum Stylus Testnet Interaction',
    jurisdiction: 'United States & EU Permitted',
    classification: 'TESTNET_PARTICIPATION',
    rulesEvaluated: [
      'GATE_00_KILL_SWITCH: Evaluation of targeted and global pause states',
      'GATE_01_AML_SANCTIONS: Screen address against OFAC, EU, UN SDN lists',
      'GATE_02_CONSUMER_PROTECTION: Audit against misleading claims & enforce disclosures',
      'GATE_03_TERMS_OF_SERVICE: Check automation permission and bypass prohibition',
      'GATE_04_JURISDICTION_ACTIVITY: Permitted non-custodial testnet interaction',
      'GATE_05_CAPITAL_POLICY: Zero capital lockup required ($0.00)'
    ],
    documentsConsulted: [
      'Internal Compliance Manual Sections 30-48',
      'OFAC SDN Master Database (2026)',
      'Arbitrum Foundation Developer Terms of Service v2.1'
    ],
    decision: 'COMPLIANCE_APPROVED',
    reason: 'Non-custodial testnet participation verified. Zero private key exposure. No ToS automation restrictions.',
    agent: 'agent_dir_comp',
    agentTitle: 'Elena Rostova (Regulatory & Compliance Director)',
    timestamp: '15m ago',
    policyVersion: 'v2.4.1-COMPLIANCE-STRICT',
    humanApprovalRequired: false,
    hash: '0x8f2a9e4b1c7d3e5f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f',
    previousHash: '0x0000000000000000000000000000000000000000'
  },
  {
    id: 'COMP-LOG-002',
    opportunityId: 'OPP-10499',
    opportunityTitle: 'High-Yield Privacy Mixer Relayer Pool',
    jurisdiction: 'Sanctions Violation (OFAC / FATF)',
    classification: 'BROKERAGE_LIKE_ACTIVITY',
    rulesEvaluated: [
      'GATE_01_AML_SANCTIONS: Screen address against OFAC Specially Designated Nationals',
      'GATE_04_JURISDICTION_ACTIVITY: Prohibited money transmission classification'
    ],
    documentsConsulted: [
      'OFAC SDN List Identification 2026',
      'FATF Travel Rule Advisory Note 16'
    ],
    decision: 'COMPLIANCE_BLOCKED',
    reason: 'COMPLIANCE DIRECTOR VETO: Identified smart contract address linked to OFAC sanctions list. Profit cannot override compliance.',
    agent: 'agent_dir_comp',
    agentTitle: 'Elena Rostova (Regulatory & Compliance Director)',
    timestamp: '2h ago',
    policyVersion: 'v2.4.1-COMPLIANCE-STRICT',
    humanApprovalRequired: false,
    hash: '0x3c5d7e9f1a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d',
    previousHash: '0x8f2a9e4b1c7d3e5f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f'
  },
  {
    id: 'COMP-LOG-003',
    opportunityId: 'OPP-007',
    opportunityTitle: 'EigenLayer Restaking Liquid Deposit',
    jurisdiction: 'Declared US Retail Jurisdiction',
    classification: 'STAKING',
    rulesEvaluated: [
      'GATE_04_JURISDICTION_ACTIVITY: Staking classification requires explicit human waiver',
      'GATE_05_CAPITAL_POLICY: Capital required ($25.00) exceeds $10.00 automated limit'
    ],
    documentsConsulted: [
      'Section 33 Staking Disclosures & Custody Boundaries',
      'Section 46 Human-in-the-loop Execution Gate'
    ],
    decision: 'HUMAN_REVIEW_REQUIRED',
    reason: 'Mandatory Human Authorization Required: Staking activity with capital commitment requires human owner signature.',
    agent: 'agent_dir_comp',
    agentTitle: 'Elena Rostova (Regulatory & Compliance Director)',
    timestamp: '1h ago',
    policyVersion: 'v2.4.1-COMPLIANCE-STRICT',
    humanApprovalRequired: true,
    hash: '0x7e9a1b3c5d7f2a4e6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a',
    previousHash: '0x3c5d7e9f1a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d'
  }
];

export const INITIAL_TAX_RECORDS: TaxAccountingRecord[] = [
  {
    id: 'TAX-REC-001',
    rewardEventId: 'REW-001',
    timestamp: '2026-09-22T14:32:00Z',
    chain: 'Polygon',
    tokenSymbol: 'POL',
    tokenQuantity: 1.5,
    estimatedFiatValueUSD: 0.85,
    gasFeeUSD: 0.02,
    netTaxableBasisUSD: 0.83,
    txHash: '0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    sourceCategory: 'TESTNET_PARTICIPATION',
    jurisdiction: 'United States (IRS FMV Basis)',
    taxStatus: 'PROFESSIONAL_REVIEW_REQUIRED',
    disclaimer: 'Informational accounting record only. Consult a licensed CPA.'
  },
  {
    id: 'TAX-REC-002',
    rewardEventId: 'REW-002',
    timestamp: '2026-09-23T08:15:00Z',
    chain: 'Arbitrum',
    tokenSymbol: 'ARB',
    tokenQuantity: 3.25,
    estimatedFiatValueUSD: 2.50,
    gasFeeUSD: 0.05,
    netTaxableBasisUSD: 2.45,
    txHash: '0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
    sourceCategory: 'TESTNET_PARTICIPATION',
    jurisdiction: 'United States (IRS FMV Basis)',
    taxStatus: 'PROFESSIONAL_REVIEW_REQUIRED',
    disclaimer: 'Informational accounting record only. Consult a licensed CPA.'
  }
];
