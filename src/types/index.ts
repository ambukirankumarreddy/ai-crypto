export type AgentRole = 
  | 'GOVERNOR'
  | 'DIRECTOR'
  | 'RESEARCHER'
  | 'STRATEGIST'
  | 'ENGINEER'
  | 'SECURITY'
  | 'FINANCE'
  | 'OPERATIONS'
  | 'WORKER';

export type AgentDepartment = 
  | 'EXECUTIVE'
  | 'RESEARCH'
  | 'STRATEGY'
  | 'ENGINEERING'
  | 'SECURITY'
  | 'COMPLIANCE'
  | 'FINANCE'
  | 'OPERATIONS';

export interface AgentPermission {
  id: string;
  name: string;
  allowed: boolean;
  scope: string;
  description: string;
}

export interface AIAgent {
  id: string;
  name: string;
  title: string;
  department: AgentDepartment;
  level: number; // 0 = Human, 1 = Governor, 2 = Director, 3 = Specialist/Worker
  role: AgentRole;
  status: 'ACTIVE' | 'IDLE' | 'BUSY' | 'PAUSED' | 'RESTRICTED';
  currentTask?: string;
  successRate: number; // 0-100
  tasksCompleted: number;
  tasksFailed: number;
  lastActive: string;
  permissions: AgentPermission[];
  decisionsMade: number;
  resourceUsage: {
    tokensPerHour: number;
    computeMs: number;
  };
}

export type OpportunityCategory = 
  | 'TESTNET'
  | 'FAUCET'
  | 'BLOCKCHAIN_QUEST'
  | 'DEVELOPER_REWARD'
  | 'BOUNTY'
  | 'GRANT'
  | 'AIRDROP_ELIGIBILITY'
  | 'DEPIN'
  | 'COMPUTE_NETWORK'
  | 'STORAGE_NETWORK'
  | 'STAKING'
  | 'LIQUIDITY_INCENTIVE';

export type OpportunityStatus = 
  | 'DISCOVERED'
  | 'RESEARCHING'
  | 'ANALYZING'
  | 'SIMULATING'
  | 'APPROVED'
  | 'HUMAN_APPROVAL_REQUIRED'
  | 'EXECUTING'
  | 'COMPLETED'
  | 'REJECTED'
  | 'EXPIRED';

export interface Opportunity {
  id: string;
  title: string;
  project: string;
  category: OpportunityCategory;
  chain: string;
  sourceUrl: string;
  verifiedOfficial: boolean;
  requiredCapital: number; // USD
  estimatedGasCost: number; // USD
  estimatedInfraCost: number; // USD
  estimatedAiCost: number; // USD
  expectedGrossReward: number; // USD
  expectedNetProfit: number; // calculated: gross - gas - infra - ai
  riskScore: number; // 0 - 100 (lower is safer)
  status: OpportunityStatus;
  statusReason?: string;
  discoveredAt: string;
  deadline?: string;
  eligibilityRequirements: string[];
  smartContractAddress?: string;
  executionSteps: string[];
  historicalSuccessRate?: number;
  // Compliance & Regulatory Metadata (Sections 30-48)
  complianceStatus?: ComplianceDecisionState;
  regulatoryClassification?: RegulatoryActivityClassification;
  jurisdiction?: string;
  complianceBlockedReason?: string;
  threeLayerVerification?: ThreeLayerVerification;
  termsOfService?: TermsOfServiceAudit;
  consumerProtection?: ConsumerProtectionAudit;
  contractCompliance?: SmartContractCompliance;
}

export type TaskStatus = 
  | 'QUEUED'
  | 'VALIDATING'
  | 'SIMULATING'
  | 'EXECUTING'
  | 'VERIFYING'
  | 'SUCCESS'
  | 'FAILED'
  | 'HALTED_BY_POLICY';

export interface WorkerSandbox {
  workerId: string;
  workerName: string;
  allowedDomains: string[];
  allowedActions: string[];
  maxTxBudgetUSD: number;
  timeLimitSeconds: number;
  status: 'ACTIVE' | 'IDLE' | 'ISOLATED';
}

export interface TaskRecord {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  assignedWorkerId: string;
  assignedWorkerName: string;
  chain: string;
  status: TaskStatus;
  progressPercent: number;
  startedAt: string;
  completedAt?: string;
  gasSpentUSD: number;
  actualRewardUSD?: number;
  txHash?: string;
  simulationPassed: boolean;
  sandbox: WorkerSandbox;
  logSteps: {
    timestamp: string;
    message: string;
    level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
  }[];
}

export type RewardStatus = 
  | 'DISCOVERED'
  | 'ELIGIBLE'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'PENDING'
  | 'CLAIMABLE'
  | 'CLAIMED'
  | 'FAILED';

export interface RewardRecord {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  project: string;
  chain: string;
  category: OpportunityCategory;
  rewardType: 'TOKEN' | 'POINTS' | 'FAUCET_GAS' | 'GRANT_USD' | 'BOUNTY_USD';
  estimatedAmountUSD: number;
  actualAmountUSD: number;
  tokenSymbol: string;
  tokenAmount: number;
  gasFeeUSD?: number;
  status: RewardStatus;
  claimTxHash?: string;
  claimedAt?: string;
  detectedAt: string;
  isSimulatedEstimated: boolean;
}

export interface StrategyProposal {
  id: string;
  title: string;
  category: OpportunityCategory;
  targetChains: string[];
  stage: 
    | 'DISCOVERY'
    | 'SECURITY_REVIEW'
    | 'PROFIT_ANALYSIS'
    | 'SANDBOX'
    | 'TEST'
    | 'APPROVAL'
    | 'LIMITED_DEPLOYMENT'
    | 'MONITORING';
  expectedMonthlyYieldUSD: number;
  estimatedRiskScore: number;
  proposedByAgent: string;
  proposerTitle: string;
  description: string;
  backtestResults: {
    simulatedRuns: number;
    successRate: number;
    avgProfitPerRun: number;
    maxDrawdown: number;
  };
  securityAuditScore: number; // 0-100
  requiresHumanApproval: boolean;
  approvedByHuman: boolean;
  createdAt: string;
}

export interface WebsiteImprovement {
  id: string;
  agentName: string;
  component: string;
  type: 'PERFORMANCE' | 'UX' | 'BUG_FIX' | 'FEATURE' | 'SECURITY' | 'ACCESSIBILITY';
  title: string;
  problemDiscovered: string;
  proposedSolution: string;
  stage: 
    | 'PROBLEM_IDENTIFIED'
    | 'ARCHITECT_SPEC'
    | 'DEVELOPER_IMPLEMENTATION'
    | 'CODE_REVIEW'
    | 'AUTOMATED_TESTS'
    | 'SECURITY_TESTS'
    | 'STAGING_DEPLOYED'
    | 'STAGING_VERIFIED'
    | 'HUMAN_APPROVAL_REQUIRED'
    | 'PRODUCTION_DEPLOYED'
    | 'REJECTED';
  diffPreview: string;
  testResults: {
    unitTests: boolean;
    securityScan: boolean;
    a11yScore: number;
    latencyImpactMs: number;
  };
  isHighRisk: boolean;
  humanApproved: boolean;
  createdAt: string;
}

export interface SecurityPolicy {
  maxTransactionValueUSD: number;
  maxDailySpendingUSD: number;
  minExpectedNetProfitUSD: number;
  maxRiskScoreAllowed: number;
  maxSimultaneousTasks: number;
  requireApprovalAboveUSD: number;
  allowedChains: string[];
  allowedDomains: string[];
  allowedContractAllowlist: {
    address: string;
    chain: string;
    protocolName: string;
    verifiedAt: string;
  }[];
  autoHaltOnFailedTxCount: number;
  currentFailedTxCount: number;
  emergencyStopActive: boolean;
  emergencyStopReason?: string;
  strictModeEnabled: boolean;
}

export interface ApprovalRequest {
  id: string;
  type: 
    | 'HIGH_VALUE_TRANSACTION'
    | 'STRATEGY_PRODUCTION_DEPLOY'
    | 'WEBSITE_PRODUCTION_DEPLOY'
    | 'DOMAIN_ALLOWLIST_ADD'
    | 'CONTRACT_ALLOWLIST_ADD'
    | 'POLICY_OVERRIDE';
  title: string;
  description: string;
  requestedByAgent: string;
  amountUSD?: number;
  chain?: string;
  riskAssessment: {
    score: number;
    notes: string;
  };
  payload: Record<string, unknown>;
  createdAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  resolvedAt?: string;
  decisionReason?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  agentId: string;
  agentName: string;
  actionType: 
    | 'OPPORTUNITY_DISCOVERY'
    | 'SECURITY_RISK_CHECK'
    | 'PROFIT_EVALUATION'
    | 'POLICY_VERIFICATION'
    | 'TRANSACTION_SIMULATION'
    | 'TRANSACTION_EXECUTION'
    | 'REWARD_DETECTION'
    | 'DEPLOYMENT'
    | 'EMERGENCY_STOP'
    | 'APPROVAL_DECISION'
    | 'POLICY_CHANGE';
  details: string;
  targetChain?: string;
  targetAddress?: string;
  hash: string;
  previousHash: string;
  tamperVerified: boolean;
}

export interface AgentMessage {
  id: string;
  timestamp: string;
  messageType: string;
  fromAgent: string;
  toAgent: string;
  opportunityId?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  summary: string;
  data?: Record<string, unknown>;
}

export interface BlockchainAdapterInfo {
  chain: string;
  chainId: number;
  rpcUrl: string;
  symbol: string;
  gasPriceGwei: number;
  blockTimeSec: number;
  status: 'OPERATIONAL' | 'CONGESTED' | 'MAINTENANCE';
  adapterClass: string;
  activeContractsAllowed: number;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  network: string;
  nativeBalances: Record<string, number>; // chain -> balance
  tokenBalances: {
    symbol: string;
    chain: string;
    balance: number;
    priceUSD: number;
  }[];
  totalBalanceUSD: number;
  walletType: 'MetaMask' | 'WalletConnect' | 'Demo Execution Sandbox' | 'Manual Custom Address' | 'Coinbase Wallet' | 'Browser Extension' | string | null;
  hasExecutionWallet: boolean;
  executionWalletAddress: string;
}

export interface SystemNotification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'REWARD' | 'OPPORTUNITY' | 'APPROVAL' | 'SECURITY' | 'TASK' | 'EMERGENCY' | 'COMPLIANCE';
  read: boolean;
  actionUrl?: string;
}

// ==========================================
// SECTIONS 30 - 48: REGULATORY & COMPLIANCE ARCHITECTURE
// ==========================================

export type ComplianceDecisionState =
  | 'COMPLIANCE_APPROVED'
  | 'COMPLIANCE_APPROVED_WITH_LIMITS'
  | 'COMPLIANCE_REVIEW_REQUIRED'
  | 'HUMAN_REVIEW_REQUIRED'
  | 'COMPLIANCE_BLOCKED';

export type RegulatoryActivityClassification =
  | 'EDUCATIONAL_ACTIVITY'
  | 'TESTNET_PARTICIPATION'
  | 'FAUCET_CLAIM'
  | 'AIRDROP_PARTICIPATION'
  | 'STAKING'
  | 'LENDING'
  | 'LIQUIDITY_PROVISION'
  | 'TOKEN_SWAP'
  | 'CUSTODY'
  | 'ASSET_TRANSFER'
  | 'BROKERAGE_LIKE_ACTIVITY'
  | 'PAYMENT_ACTIVITY'
  | 'FINANCIAL_PROMOTION'
  | 'INVESTMENT_RELATED_ACTIVITY'
  | 'DEFI_INTERACTION'
  | 'MINING_COMPUTE_PARTICIPATION';

export interface ThreeLayerVerification {
  layer1Security: {
    passed: boolean;
    score: number;
    auditor: string;
    notes: string;
    checkedAt: string;
  };
  layer2Compliance: {
    status: ComplianceDecisionState;
    complianceDirectorSigned: boolean;
    auditor: string;
    jurisdiction: string;
    classification: RegulatoryActivityClassification;
    amlScreeningPassed: boolean;
    termsOfServicePermitted: boolean;
    consumerProtectionChecked: boolean;
    notes: string;
    checkedAt: string;
  };
  layer3Financial: {
    passed: boolean;
    expectedGrossUSD: number;
    netProfitUSD: number;
    gasUSD: number;
    infraUSD: number;
    aiUSD: number;
    auditor: string;
    checkedAt: string;
  };
  humanApprovalSigned?: boolean;
  finalDecision: 'APPROVED' | 'HUMAN_REVIEW_REQUIRED' | 'BLOCKED';
}

export interface TermsOfServiceAudit {
  sourceUrl: string;
  termsUrl: string;
  termsVersionDate?: string;
  automationPermission: 'EXPLICITLY_PERMITTED' | 'SILENT_OR_UNSPECIFIED' | 'PROHIBITED' | 'UNVERIFIED';
  apiUsageRestrictions: string[];
  rateLimits?: string;
  bypassChecksPassed: boolean;
  notes: string;
}

export interface ConsumerProtectionAudit {
  rewardDescriptionAccurate: boolean;
  rewardLabel: 'Estimated reward' | 'Potential reward' | 'Historical reward' | 'Confirmed reward' | 'Pending reward' | 'Actual reward received';
  isGuaranteedOrRiskFreeClaimBanned: boolean;
  feesDisclosed: boolean;
  risksDisclosed: boolean;
  eligibilityClear: boolean;
  lossPossibilityDisclosed: boolean;
  capitalRequiredDisclosed: boolean;
  lockupPeriodDisclosed: boolean;
  withdrawalRestrictionsDisclosed: boolean;
  disclosures: string[];
}

export interface SmartContractCompliance {
  contractAddress: string;
  chain: string;
  verifiedSource: boolean;
  adminControlsRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  tokenPermissions: string[];
  approvalRequirements: string;
  upgradeability: 'IMMUTABLE' | 'TIMELOCK_PROXY' | 'UNRESTRICTED_PROXY' | 'UNKNOWN';
  transferRestrictions: string;
  securityAuditFindingsCount: number;
  allowlistStatus: 'APPROVED' | 'REVIEW_REQUIRED' | 'BLOCKED';
}

export interface JurisdictionConfig {
  code: string;
  name: string;
  status: 'PERMITTED' | 'PROHIBITED' | 'CONDITIONAL';
  requiresKyc: boolean;
  prohibitedCategories: RegulatoryActivityClassification[];
  sanctioned: boolean;
  taxReportingStandard: string;
  regulatoryAuthority: string;
}

export interface ComplianceKillSwitchState {
  pausedOpportunities: string[];
  pausedProjects: string[];
  pausedChains: string[];
  pausedJurisdictions: string[];
  pausedStrategies: string[];
  allAutomatedTransactionsPaused: boolean;
  allAutomatedExecutionPaused: boolean;
  lastTriggeredBy?: string;
  lastTriggeredReason?: string;
  lastTriggeredAt?: string;
}

export interface CompliancePolicy {
  userDeclaredJurisdiction: string;
  businessEntityJurisdiction: string;
  serviceOperatingJurisdiction: string;
  complianceKillSwitch: ComplianceKillSwitchState;
  strictNonCustodialOnly: boolean;
  blockUnknownJurisdiction: boolean;
  blockUnregulatedServices: boolean;
  blockIfAutomationProhibited: boolean;
  requireKycAboveUSD: number;
  prohibitGuaranteedYieldMarketing: boolean;
  jurisdictionConfigs: JurisdictionConfig[];
}

export interface RegulatoryChangeAlert {
  id: string;
  detectedAt: string;
  source: string;
  jurisdiction: string;
  summary: string;
  affectedChains: string[];
  affectedStrategies: string[];
  affectedOpportunities: string[];
  impactLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'ACTIVE_REVIEW' | 'STRATEGIES_PAUSED' | 'RESOLVED';
  actionTaken: string;
  recommendedReview?: string;
  policyVersion?: string;
  requiresLegalCounsel: boolean;
}

export interface ComplianceAuditRecord {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  jurisdiction: string;
  classification: RegulatoryActivityClassification;
  rulesEvaluated: string[];
  documentsConsulted: string[];
  decision: ComplianceDecisionState;
  reason: string;
  agent: string;
  agentTitle: string;
  timestamp: string;
  policyVersion: string;
  humanApprovalRequired: boolean;
  humanApprovalGiven?: boolean;
  hash: string;
  previousHash: string;
}

export interface TaxAccountingRecord {
  id: string;
  rewardEventId: string;
  timestamp: string;
  chain: string;
  tokenSymbol: string;
  tokenQuantity: number;
  estimatedFiatValueUSD: number;
  gasFeeUSD: number;
  netTaxableBasisUSD: number;
  txHash: string;
  sourceCategory: RegulatoryActivityClassification | string;
  jurisdiction: string;
  taxStatus: 'REPORTED' | 'PENDING_EXPORT' | 'PROFESSIONAL_REVIEW_REQUIRED';
  disclaimer: string;
}

// ==========================================
// PRODUCTION QA & LIVE READINESS TYPES
// ==========================================

export type ProductionEnvironment = 'STAGING' | 'LIMITED_LIVE' | 'FULL_LIVE';
export type TransactionExecutionMode = 'READ_ONLY' | 'APPROVAL_ONLY' | 'AUTONOMOUS';

export interface QATestCase {
  id: string;
  name: string;
  description: string;
  status: 'PASS' | 'FAIL' | 'RUNNING' | 'PENDING';
  measured: string;
  error?: string;
  executionMs: number;
  retryCount?: number;
  maxRetries?: number;
  retryReasons?: string[];
  recoveredOnRetry?: boolean;
}

export interface QATestCategoryResult {
  category: string;
  status: 'PASS' | 'FAIL' | 'RUNNING' | 'PENDING';
  testCount: number;
  passedCount: number;
  failedCount: number;
  details: string[];
  cases: QATestCase[];
  metrics: Record<string, string | number>;
  durationMs: number;
  totalRetries?: number;
}

export interface LiveReadinessReport {
  timestamp: string;
  overallStatus: 'READY' | 'NOT READY';
  criticalFailures: number;
  environment: ProductionEnvironment;
  categories: QATestCategoryResult[];
  rawReportText: string;
  totalRetriesRecovered?: number;
}

