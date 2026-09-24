/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RoomId = 
  | 'room_owner'
  | 'room_governor'
  | 'room_research'
  | 'room_security'
  | 'room_compliance'
  | 'room_finance'
  | 'room_engineering'
  | 'room_operations'
  | 'room_execution'
  | 'room_meeting';

export interface OfficeRoom {
  id: RoomId;
  name: string;
  department: string;
  gridX: number; // grid tile X
  gridY: number; // grid tile Y
  width: number; // width in tiles
  height: number; // height in tiles
  color: string;
  accentColor: string;
  iconName: string;
  description: string;
  keyAgents: string[];
  equipment: string[];
  doorPosition: { x: number; y: number };
  workstations: Array<{
    id: string;
    name: string;
    x: number;
    y: number;
    facing: 'up' | 'down' | 'left' | 'right';
    assignedAgentId?: string;
  }>;
}

// P0.4 State Machine: IDLE -> TASK_ASSIGNED -> WALKING -> WORKING -> REPORTING -> COMPLETED (or BLOCKED / FAILED)
export type AgentVisualState = 
  | 'IDLE'
  | 'TASK_ASSIGNED'
  | 'WALKING'
  | 'WORKING'
  | 'REPORTING'
  | 'COMPLETED'
  | 'BLOCKED'
  | 'FAILED'
  | 'THINKING'
  | 'MEETING'
  | 'ALERT'
  | 'WAITING';

export interface OfficeAgentVisual {
  id: string;
  name: string;
  role: string;
  department: string;
  color: string;
  headColor: string;
  gridX: number;
  gridY: number;
  pixelX: number;
  pixelY: number;
  targetGridX: number;
  targetGridY: number;
  facing: 'up' | 'down' | 'left' | 'right';
  state: AgentVisualState;
  currentRoomId: RoomId;
  targetRoomId?: RoomId;
  path: Array<{ x: number; y: number }>;
  currentTaskId?: string;
  currentTaskTitle?: string;
  currentTaskStage?: WorkflowStageId;
  speechBubble?: {
    text: string;
    icon?: string;
    expiresAt: number;
    type: 'info' | 'success' | 'warning' | 'error' | 'meeting';
  };
  animationFrame: number;
  stats: {
    tasksCompleted: number;
    tasksFailed: number;
    successRate: number;
    securityScore: number;
    complianceScore: number;
    distanceWalked: number;
  };
  // Inspector fields
  permissionLevel: 'ROOT' | 'STRATEGIC' | 'SUPERVISORY' | 'EXECUTION' | 'READ_ONLY';
  securityStatus: 'CLEAR' | 'ELEVATED' | 'AUDITING' | 'RESTRICTED';
  complianceStatus: 'VERIFIED' | 'SCREENING' | 'NON_CUSTODIAL' | 'FLAGGED';
  lastAction: string;
  nextAction: string;
}

export type WorkflowStageId = 
  | 'DISCOVER'
  | 'RESEARCH'
  | 'SECURITY'
  | 'COMPLIANCE'
  | 'FINANCE'
  | 'GOVERNOR'
  | 'APPROVAL'
  | 'EXECUTION'
  | 'REWARD'
  | 'ACCOUNTING';

export interface WorkflowStageInfo {
  id: WorkflowStageId;
  label: string;
  agentName: string;
  department: string;
  description: string;
  status: 'PENDING' | 'RUNNING' | 'PASSED' | 'FAILED' | 'BLOCKED';
}

export interface HumanApprovalRequest {
  taskId: string;
  opportunityTitle: string;
  expectedRewardUSD: number;
  estimatedCostUSD: number;
  netEVUSD: number;
  riskScore: string;
  securityResult: string;
  complianceResult: string;
  requiredPermissions: string[];
  proposedAction: string;
  reasonRequired: string;
  expiresInSeconds: number;
  network: string;
  contractAddress: string;
}

export interface ScorecardTargetResult {
  id: string;
  title: string;
  target: string;
  measured: string;
  status: 'PASS' | 'BELOW TARGET' | 'EXCEEDS TARGET';
}

export interface HardReleaseGateResult {
  gateNumber: number;
  gateName: string;
  requirement: string;
  measured: string;
  passed: boolean;
}

export interface AutomatedAuditReport {
  timestamp: string;
  fpsAverage: number;
  fpsMin: number;
  resetTestCount: number;
  resetSuccessCount: number;
  pathfindingTestCount: number;
  pathfindingSuccessRate: number;
  targets: ScorecardTargetResult[];
  hardGates: HardReleaseGateResult[];
  isMvpComplete: boolean;
}

export interface DemoOfficeTask {
  id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'RUNNING' | 'WAITING_APPROVAL' | 'EXECUTING' | 'COMPLETED' | 'BLOCKED' | 'FAILED';
  activeAgentId: string;
  activeAgentName: string;
  currentStage: WorkflowStageId;
  progressPercent: number;
  stages: WorkflowStageInfo[];
  rewardUSD: number;
  netEV: number;
  gasEstimatedUSD: number;
  targetContract: string;
  network: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActiveOfficeMeeting {
  id: string;
  participants: string[];
  participantNames: string[];
  topic: string;
  roomId: RoomId;
  active: boolean;
  startedAt: string;
}

export interface OfficeRewardEvent {
  amountUSD: number;
  treasuryBeforeUSD: number;
  treasuryAfterUSD: number;
  taskId: string;
  taskTitle: string;
  agentName: string;
  timestamp: string;
  isSimulated: boolean;
}

export interface OfficeEvent {
  id: string;
  timestamp: string;
  timeFormatted: string;
  agentId: string;
  agentName: string;
  eventType: 
    | 'DISCOVERY'
    | 'TASK_ASSIGNED'
    | 'MOVE'
    | 'SECURITY_CHECK'
    | 'COMPLIANCE_CHECK'
    | 'FINANCIAL_CALC'
    | 'GOVERNOR_APPROVAL'
    | 'APPROVAL_REQUEST'
    | 'EXECUTION_START'
    | 'REWARD_CLAIM'
    | 'BLOCKED'
    | 'EMERGENCY_STOP'
    | 'MEETING'
    | 'SYSTEM';
  description: string;
  roomId: RoomId;
  metadata?: Record<string, any>;
}

export interface OfficeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'coin' | 'spark' | 'smoke' | 'scan' | 'laser' | 'shield';
  text?: string;
}

export type TimeOfDay = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';

export interface OfficeSimConfig {
  mode: 'SIMULATION' | 'LIVE';
  simulationSpeed: 1 | 2 | 4;
  isPaused: boolean;
  timeOfDay: TimeOfDay;
  emergencyStopActive: boolean;
  activeScenario?: string;
}
