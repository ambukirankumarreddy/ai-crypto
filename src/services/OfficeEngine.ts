/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  RoomId,
  OfficeRoom,
  OfficeAgentVisual,
  OfficeEvent,
  OfficeParticle,
  WorkflowStageId,
  DemoOfficeTask,
  ActiveOfficeMeeting
} from '../types/office';

export const TILE_SIZE = 32;
export const GRID_COLS = 50;
export const GRID_ROWS = 36;

// P0.1 - Top-Down 2D Office World (10 Dedicated Rooms)
export const OFFICE_ROOMS: OfficeRoom[] = [
  {
    id: 'room_owner',
    name: 'CEO / Root Authority',
    department: 'EXECUTIVE',
    gridX: 2,
    gridY: 2,
    width: 10,
    height: 8,
    color: '#1e1b4b',
    accentColor: '#eab308',
    iconName: 'Crown',
    description: 'Root Authority Command Desk. Master policy & final approval console.',
    keyAgents: ['Human Owner'],
    equipment: ['Master Console', 'Root Key Vault', 'Live P&L Hologram', 'Executive Desk'],
    doorPosition: { x: 7, y: 10 },
    workstations: [
      { id: 'ws_owner', name: 'Owner Command Desk', x: 6, y: 5, facing: 'down' }
    ]
  },
  {
    id: 'room_governor',
    name: 'AI Governor Command Center',
    department: 'EXECUTIVE',
    gridX: 14,
    gridY: 2,
    width: 14,
    height: 10,
    color: '#2e1065',
    accentColor: '#a855f7',
    iconName: 'BrainCircuit',
    description: 'Central orchestrator command bridge. Real-time telemetry synthesis and department prioritization.',
    keyAgents: ['agent_gov_01'],
    equipment: ['Central Hologram Core', 'Orchestration Table', 'Telemetry Wall', 'Director Feeds'],
    doorPosition: { x: 21, y: 12 },
    workstations: [
      { id: 'ws_gov_main', name: 'Governor Nexus Table', x: 21, y: 6, facing: 'down', assignedAgentId: 'agent_gov_01' }
    ]
  },
  {
    id: 'room_meeting',
    name: 'Strategy & Meeting Room',
    department: 'STRATEGY',
    gridX: 30,
    gridY: 2,
    width: 16,
    height: 10,
    color: '#0f172a',
    accentColor: '#38bdf8',
    iconName: 'Users2',
    description: 'Multi-agent cross-department consensus, strategy debates, and approval summits.',
    keyAgents: ['agent_gov_01', 'agent_scout_01', 'agent_sec_01', 'agent_comp_01', 'agent_fin_01'],
    equipment: ['Conference Table (8 Seats)', 'Projection Board', 'Risk Matrix Screen'],
    doorPosition: { x: 38, y: 12 },
    workstations: [
      { id: 'ws_meet_1', name: 'Seat 1 (Strategy)', x: 35, y: 6, facing: 'right' },
      { id: 'ws_meet_2', name: 'Seat 2 (Research)', x: 35, y: 7, facing: 'right' },
      { id: 'ws_meet_3', name: 'Seat 3 (Security)', x: 41, y: 6, facing: 'left' },
      { id: 'ws_meet_4', name: 'Seat 4 (Compliance)', x: 41, y: 7, facing: 'left' }
    ]
  },
  {
    id: 'room_research',
    name: 'Research & Discovery Lab',
    department: 'RESEARCH',
    gridX: 2,
    gridY: 12,
    width: 10,
    height: 10,
    color: '#083344',
    accentColor: '#06b6d4',
    iconName: 'Compass',
    description: 'Autonomous opportunity crawling, GitHub repo audits, testnet faucets, and protocol docs indexing.',
    keyAgents: ['agent_scout_01'],
    equipment: ['Ecosystem Radar Screen', 'Crawler Terminals', 'Testnet Discovery DB', 'Whitepaper Indexer'],
    doorPosition: { x: 12, y: 17 },
    workstations: [
      { id: 'ws_scout', name: 'Opportunity Scout Desk', x: 6, y: 16, facing: 'up', assignedAgentId: 'agent_scout_01' }
    ]
  },
  {
    id: 'room_security',
    name: 'Security Operations Center (SOC)',
    department: 'SECURITY',
    gridX: 14,
    gridY: 14,
    width: 11,
    height: 10,
    color: '#431407',
    accentColor: '#f97316',
    iconName: 'Shield',
    description: 'Zero-trust contract auditing, EVM bytecode simulation, reentrancy guards, and emergency tripwires.',
    keyAgents: ['agent_sec_01'],
    equipment: ['Bytecode Decompiler Rack', 'Tripwire Threat Wall', 'Simulation Nodes', 'Emergency Kill Switch'],
    doorPosition: { x: 19, y: 14 },
    workstations: [
      { id: 'ws_sec_sentinel', name: 'Sentinel Security Station', x: 19, y: 18, facing: 'down', assignedAgentId: 'agent_sec_01' }
    ]
  },
  {
    id: 'room_compliance',
    name: 'Compliance Office',
    department: 'COMPLIANCE',
    gridX: 27,
    gridY: 14,
    width: 10,
    height: 10,
    color: '#4a044e',
    accentColor: '#ec4899',
    iconName: 'Scale',
    description: 'Pre-flight multi-jurisdictional gating, OFAC sanctions screening, Terms of Service verification, and tax ledgering.',
    keyAgents: ['agent_comp_01'],
    equipment: ['Jurisdiction Map Board', 'Sanctions SDN Radar', 'Audit Ledger Terminal', 'ToS Scanner'],
    doorPosition: { x: 32, y: 14 },
    workstations: [
      { id: 'ws_comp_dir', name: 'Compliance Station', x: 31, y: 18, facing: 'down', assignedAgentId: 'agent_comp_01' }
    ]
  },
  {
    id: 'room_finance',
    name: 'Finance & Treasury Vault',
    department: 'FINANCE',
    gridX: 39,
    gridY: 14,
    width: 9,
    height: 10,
    color: '#064e3b',
    accentColor: '#10b981',
    iconName: 'TrendingUp',
    description: 'Net profitability modeling, gas-to-reward arb, EIP-1559 volatility tracking, and cryptographic treasury ledger.',
    keyAgents: ['agent_fin_01'],
    equipment: ['Treasury Vault Safe', 'Gas Cost Modeler', 'P&L Ticker Screen', 'Ledger Terminal'],
    doorPosition: { x: 39, y: 19 },
    workstations: [
      { id: 'ws_fin_dir', name: 'Ledger Terminal', x: 43, y: 18, facing: 'down', assignedAgentId: 'agent_fin_01' }
    ]
  },
  {
    id: 'room_engineering',
    name: 'Engineering Lab',
    department: 'ENGINEERING',
    gridX: 2,
    gridY: 24,
    width: 11,
    height: 10,
    color: '#1e293b',
    accentColor: '#6366f1',
    iconName: 'Code2',
    description: 'Code synthesis, 7-stage sandbox testing, static AST analysis, and continuous applet optimization.',
    keyAgents: ['agent_eng_01'],
    equipment: ['CI/CD Pipeline Servers', 'Sandbox Cluster', 'Code Terminal', 'AST Visualizer'],
    doorPosition: { x: 13, y: 28 },
    workstations: [
      { id: 'ws_eng_dir', name: 'Forge Engineering Pod', x: 7, y: 28, facing: 'right', assignedAgentId: 'agent_eng_01' }
    ]
  },
  {
    id: 'room_operations',
    name: 'Operations & Dispatch',
    department: 'OPERATIONS',
    gridX: 15,
    gridY: 26,
    width: 11,
    height: 8,
    color: '#134e4a',
    accentColor: '#14b8a6',
    iconName: 'ListTodo',
    description: 'Task queuing, worker lifecycle supervisor, sandboxed process isolation, and worker dispatch.',
    keyAgents: ['agent_worker_01'],
    equipment: ['Worker Dispatch Board', 'Process Watcher', 'Queue Terminal'],
    doorPosition: { x: 20, y: 26 },
    workstations: [
      { id: 'ws_ops_dir', name: 'Operations Dispatcher', x: 19, y: 30, facing: 'up' }
    ]
  },
  {
    id: 'room_execution',
    name: 'Live Execution Floor',
    department: 'OPERATIONS',
    gridX: 28,
    gridY: 26,
    width: 20,
    height: 8,
    color: '#042f2e',
    accentColor: '#2dd4bf',
    iconName: 'Cpu',
    description: 'Approved worker terminals for autonomous testnet interaction, faucet claims, and quest transactions.',
    keyAgents: ['agent_worker_01'],
    equipment: ['Execution Terminal 1', 'Execution Terminal 2', 'Execution Terminal 3', 'RPC Gateway Racks'],
    doorPosition: { x: 36, y: 26 },
    workstations: [
      { id: 'ws_exec_1', name: 'Worker Terminal 1', x: 34, y: 30, facing: 'up', assignedAgentId: 'agent_worker_01' },
      { id: 'ws_exec_2', name: 'Worker Terminal 2', x: 39, y: 30, facing: 'up' },
      { id: 'ws_exec_3', name: 'Worker Terminal 3', x: 44, y: 30, facing: 'up' }
    ]
  }
];

// P0.2 — Exactly 7 Core Agents as required by MVP Specification
export const INITIAL_OFFICE_AGENTS: OfficeAgentVisual[] = [
  {
    id: 'agent_gov_01',
    name: 'AI Governor',
    role: 'Executive Orchestrator',
    department: 'EXECUTIVE',
    color: '#8b5cf6',
    headColor: '#c4b5fd',
    gridX: 21,
    gridY: 6,
    pixelX: 21 * TILE_SIZE,
    pixelY: 6 * TILE_SIZE,
    targetGridX: 21,
    targetGridY: 6,
    facing: 'down',
    state: 'WORKING',
    currentRoomId: 'room_governor',
    path: [],
    currentTaskId: 'TASK-GOV-1001',
    currentTaskTitle: 'Coordinating cross-director strategy and risk gates',
    currentTaskStage: 'GOVERNOR',
    speechBubble: {
      text: 'Balancing priority across all departments...',
      expiresAt: Date.now() + 8000,
      type: 'info'
    },
    animationFrame: 0,
    stats: {
      tasksCompleted: 1420,
      tasksFailed: 8,
      successRate: 99.4,
      securityScore: 98,
      complianceScore: 100,
      distanceWalked: 420
    },
    permissionLevel: 'STRATEGIC',
    securityStatus: 'CLEAR',
    complianceStatus: 'VERIFIED',
    lastAction: 'Reviewed and validated telemetry stream from Scout-01',
    nextAction: 'Synthesize Security, Compliance, and Finance gates for next task'
  },
  {
    id: 'agent_scout_01',
    name: 'Scout-01',
    role: 'Opportunity Scout',
    department: 'RESEARCH',
    color: '#06b6d4',
    headColor: '#a5f3fc',
    gridX: 6,
    gridY: 16,
    pixelX: 6 * TILE_SIZE,
    pixelY: 16 * TILE_SIZE,
    targetGridX: 6,
    targetGridY: 16,
    facing: 'up',
    state: 'WORKING',
    currentRoomId: 'room_research',
    path: [],
    currentTaskId: 'TASK-SCOUT-1001',
    currentTaskTitle: 'Researching opportunity: Base Sepolia Quest #8842',
    currentTaskStage: 'RESEARCH',
    speechBubble: {
      text: 'Researching opportunity...',
      expiresAt: Date.now() + 7000,
      type: 'info'
    },
    animationFrame: 0,
    stats: {
      tasksCompleted: 4520,
      tasksFailed: 35,
      successRate: 99.2,
      securityScore: 95,
      complianceScore: 99,
      distanceWalked: 890
    },
    permissionLevel: 'READ_ONLY',
    securityStatus: 'CLEAR',
    complianceStatus: 'VERIFIED',
    lastAction: 'Crawled Base Sepolia developer faucet and indexed contract bytecode',
    nextAction: 'Transmit opportunity candidate #8842 to AI Governor'
  },
  {
    id: 'agent_sec_01',
    name: 'Sentinel',
    role: 'Security Auditor',
    department: 'SECURITY',
    color: '#f97316',
    headColor: '#fed7aa',
    gridX: 19,
    gridY: 18,
    pixelX: 19 * TILE_SIZE,
    pixelY: 18 * TILE_SIZE,
    targetGridX: 19,
    targetGridY: 18,
    facing: 'down',
    state: 'WORKING',
    currentRoomId: 'room_security',
    path: [],
    currentTaskId: 'TASK-SEC-1001',
    currentTaskTitle: 'Security review: EVM bytecode decompile & reentrancy guard check',
    currentTaskStage: 'SECURITY',
    speechBubble: {
      text: 'Security review: 0 drainers, 100% verified bytecode',
      expiresAt: Date.now() + 6000,
      type: 'info'
    },
    animationFrame: 0,
    stats: {
      tasksCompleted: 2150,
      tasksFailed: 2,
      successRate: 99.9,
      securityScore: 100,
      complianceScore: 100,
      distanceWalked: 310
    },
    permissionLevel: 'SUPERVISORY',
    securityStatus: 'CLEAR',
    complianceStatus: 'VERIFIED',
    lastAction: 'Simulated 14,000 gas call in isolated EVM sandbox pod',
    nextAction: 'Deliver cryptographic security signoff to Governor'
  },
  {
    id: 'agent_comp_01',
    name: 'Compliance',
    role: 'Compliance Officer',
    department: 'COMPLIANCE',
    color: '#ec4899',
    headColor: '#fbcfe8',
    gridX: 31,
    gridY: 18,
    pixelX: 31 * TILE_SIZE,
    pixelY: 18 * TILE_SIZE,
    targetGridX: 31,
    targetGridY: 18,
    facing: 'down',
    state: 'WORKING',
    currentRoomId: 'room_compliance',
    path: [],
    currentTaskId: 'TASK-COMP-1001',
    currentTaskTitle: 'Checking restrictions: OFAC SDN & Terms of Service',
    currentTaskStage: 'COMPLIANCE',
    speechBubble: {
      text: 'Checking restrictions... Clean OFAC SDN & non-custodial',
      expiresAt: Date.now() + 7500,
      type: 'info'
    },
    animationFrame: 0,
    stats: {
      tasksCompleted: 3120,
      tasksFailed: 0,
      successRate: 100.0,
      securityScore: 100,
      complianceScore: 100,
      distanceWalked: 240
    },
    permissionLevel: 'SUPERVISORY',
    securityStatus: 'CLEAR',
    complianceStatus: 'NON_CUSTODIAL',
    lastAction: 'Pre-flight screening: 0 sanctions hits on participant addresses',
    nextAction: 'Provide Section 48 compliance pass certificate'
  },
  {
    id: 'agent_fin_01',
    name: 'Ledger',
    role: 'Treasury & Profitability Analyst',
    department: 'FINANCE',
    color: '#10b981',
    headColor: '#a7f3d0',
    gridX: 43,
    gridY: 18,
    pixelX: 43 * TILE_SIZE,
    pixelY: 18 * TILE_SIZE,
    targetGridX: 43,
    targetGridY: 18,
    facing: 'down',
    state: 'WORKING',
    currentRoomId: 'room_finance',
    path: [],
    currentTaskId: 'TASK-FIN-1001',
    currentTaskTitle: 'Calculating net value: Net EV = Gross - Gas - Infra',
    currentTaskStage: 'FINANCE',
    speechBubble: {
      text: 'Calculating net value: Net EV +$2.43 (Gross $2.50 - Gas $0.07)',
      expiresAt: Date.now() + 8500,
      type: 'success'
    },
    animationFrame: 0,
    stats: {
      tasksCompleted: 1340,
      tasksFailed: 16,
      successRate: 98.8,
      securityScore: 99,
      complianceScore: 100,
      distanceWalked: 180
    },
    permissionLevel: 'SUPERVISORY',
    securityStatus: 'CLEAR',
    complianceStatus: 'VERIFIED',
    lastAction: 'Calculated EIP-1559 base fee cap: 0.00003 ETH ($0.07 USD)',
    nextAction: 'Confirm treasury balance and forward positive EV gate to Governor'
  },
  {
    id: 'agent_eng_01',
    name: 'Forge',
    role: 'Engineering & Sandbox Architect',
    department: 'ENGINEERING',
    color: '#6366f1',
    headColor: '#c7d2fe',
    gridX: 7,
    gridY: 28,
    pixelX: 7 * TILE_SIZE,
    pixelY: 28 * TILE_SIZE,
    targetGridX: 7,
    targetGridY: 28,
    facing: 'right',
    state: 'WORKING',
    currentRoomId: 'room_engineering',
    path: [],
    currentTaskId: 'TASK-ENG-1001',
    currentTaskTitle: 'Staging CI/CD execution pipeline in sandbox container',
    currentTaskStage: 'RESEARCH',
    speechBubble: {
      text: 'Sandbox harness staged: AST verification 100%',
      expiresAt: Date.now() + 6500,
      type: 'info'
    },
    animationFrame: 0,
    stats: {
      tasksCompleted: 610,
      tasksFailed: 5,
      successRate: 99.1,
      securityScore: 97,
      complianceScore: 100,
      distanceWalked: 290
    },
    permissionLevel: 'SUPERVISORY',
    securityStatus: 'CLEAR',
    complianceStatus: 'VERIFIED',
    lastAction: 'Built isolated execution harness for Base RPC gateway',
    nextAction: 'Monitor execution sandbox telemetry'
  },
  {
    id: 'agent_worker_01',
    name: 'Worker-01',
    role: 'Execution Worker',
    department: 'OPERATIONS',
    color: '#14b8a6',
    headColor: '#99f6e4',
    gridX: 34,
    gridY: 30,
    pixelX: 34 * TILE_SIZE,
    pixelY: 30 * TILE_SIZE,
    targetGridX: 34,
    targetGridY: 30,
    facing: 'up',
    state: 'WAITING',
    currentRoomId: 'room_execution',
    path: [],
    currentTaskId: 'TASK-EXEC-1001',
    currentTaskTitle: 'Waiting for approval to execute Base Sepolia claim',
    currentTaskStage: 'APPROVAL',
    speechBubble: {
      text: 'Waiting for approval...',
      expiresAt: Date.now() + 9000,
      type: 'info'
    },
    animationFrame: 0,
    stats: {
      tasksCompleted: 880,
      tasksFailed: 12,
      successRate: 98.6,
      securityScore: 99,
      complianceScore: 100,
      distanceWalked: 640
    },
    permissionLevel: 'EXECUTION',
    securityStatus: 'CLEAR',
    complianceStatus: 'VERIFIED',
    lastAction: 'Standing by at Execution Terminal 1 with key-shard loaded',
    nextAction: 'Execute approved smart contract call once approval signed'
  }
];

// P1.4 — Canonical 10-stage Workflow Pipeline
export const DEFAULT_DEMO_TASK: DemoOfficeTask = {
  id: 'TASK-1001',
  title: 'Research & Claim Base Sepolia Ecosystem Bounty',
  description: 'Autonomous discovery, security decompile, sanctions review, EV calculation, approval, execution, and accounting of Base testnet bounty #8842.',
  status: 'RUNNING',
  activeAgentId: 'agent_scout_01',
  activeAgentName: 'Scout-01',
  currentStage: 'RESEARCH',
  progressPercent: 20,
  stages: [
    { id: 'DISCOVER', label: '1. Discover', agentName: 'Scout-01', department: 'RESEARCH', description: 'Crawl L2 registries and discover bounty', status: 'PASSED' },
    { id: 'RESEARCH', label: '2. Research', agentName: 'Scout-01', department: 'RESEARCH', description: 'Analyze documentation and claim mechanics', status: 'RUNNING' },
    { id: 'SECURITY', label: '3. Security', agentName: 'Sentinel', department: 'SECURITY', description: 'Zero-trust bytecode decompile & audit', status: 'PENDING' },
    { id: 'COMPLIANCE', label: '4. Compliance', agentName: 'Compliance', department: 'COMPLIANCE', description: 'OFAC SDN sanctions & non-custodial scope', status: 'PENDING' },
    { id: 'FINANCE', label: '5. Finance', agentName: 'Ledger', department: 'FINANCE', description: 'Net Expected Value (EV) calculation', status: 'PENDING' },
    { id: 'GOVERNOR', label: '6. Governor', agentName: 'AI Governor', department: 'EXECUTIVE', description: 'Synthesize 3-gate consensus and allocate', status: 'PENDING' },
    { id: 'APPROVAL', label: '7. Approval', agentName: 'Human Root / Governor', department: 'EXECUTIVE', description: 'Verify execution policy constraints & root sign-off', status: 'PENDING' },
    { id: 'EXECUTION', label: '8. Execution', agentName: 'Worker-01', department: 'OPERATIONS', description: 'Execute sandboxed transaction on Base', status: 'PENDING' },
    { id: 'REWARD', label: '9. Reward', agentName: 'Worker-01', department: 'FINANCE', description: 'Simulated +$2.43 credited to non-custodial balance', status: 'PENDING' },
    { id: 'ACCOUNTING', label: '10. Accounting', agentName: 'Ledger', department: 'FINANCE', description: 'P&L ledgering, gas cost deduction, audit log archived', status: 'PENDING' }
  ],
  rewardUSD: 2.50,
  netEV: 2.43,
  gasEstimatedUSD: 0.07,
  targetContract: '0x8842...b4e7 (Base Sepolia)',
  network: 'Base Sepolia',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Grid Collision & Passability Map Builder
export class OfficeGridMap {
  private grid: boolean[][]; // true = walkable, false = solid/wall/furniture

  constructor() {
    this.grid = [];
    for (let y = 0; y < GRID_ROWS; y++) {
      this.grid[y] = [];
      for (let x = 0; x < GRID_COLS; x++) {
        // By default, the hallway grid is walkable
        this.grid[y][x] = true;
      }
    }

    this.buildWorldCollisions();
  }

  private buildWorldCollisions() {
    // Outer boundaries are solid
    for (let x = 0; x < GRID_COLS; x++) {
      this.grid[0][x] = false;
      this.grid[GRID_ROWS - 1][x] = false;
    }
    for (let y = 0; y < GRID_ROWS; y++) {
      this.grid[y][0] = false;
      this.grid[y][GRID_COLS - 1] = false;
    }

    // Build room walls & furniture for each room
    for (const room of OFFICE_ROOMS) {
      const { gridX, gridY, width, height, doorPosition } = room;

      // Outer room walls
      for (let x = gridX; x < gridX + width; x++) {
        // Top and bottom walls
        if (x !== doorPosition.x || gridY !== doorPosition.y) {
          this.grid[gridY][x] = false;
        }
        if (x !== doorPosition.x || gridY + height - 1 !== doorPosition.y) {
          this.grid[gridY + height - 1][x] = false;
        }
      }

      for (let y = gridY; y < gridY + height; y++) {
        // Left and right walls
        if (gridX !== doorPosition.x || y !== doorPosition.y) {
          this.grid[y][gridX] = false;
        }
        if (gridX + width - 1 !== doorPosition.x || y !== doorPosition.y) {
          this.grid[y][gridX + width - 1] = false;
        }
      }

      // Ensure the door itself is strictly walkable
      this.grid[doorPosition.y][doorPosition.x] = true;
      if (doorPosition.y > 0) this.grid[doorPosition.y - 1][doorPosition.x] = true;
      if (doorPosition.y < GRID_ROWS - 1) this.grid[doorPosition.y + 1][doorPosition.x] = true;
      if (doorPosition.x > 0) this.grid[doorPosition.y][doorPosition.x - 1] = true;
      if (doorPosition.x < GRID_COLS - 1) this.grid[doorPosition.y][doorPosition.x + 1] = true;

      // Solid furniture
      if (room.id === 'room_governor') {
        this.grid[5][20] = false;
        this.grid[5][21] = false;
        this.grid[5][22] = false;
      }
      if (room.id === 'room_meeting') {
        for (let mx = 37; mx <= 39; mx++) {
          for (let my = 5; my <= 8; my++) {
            this.grid[my][mx] = false;
          }
        }
      }
      if (room.id === 'room_finance') {
        this.grid[16][45] = false;
        this.grid[16][46] = false;
      }
      if (room.id === 'room_security') {
        this.grid[16][15] = false;
        this.grid[17][15] = false;
      }
    }
  }

  public isWalkable(x: number, y: number): boolean {
    if (x < 0 || x >= GRID_COLS || y < 0 || y >= GRID_ROWS) return false;
    return this.grid[y][x];
  }

  // P0.3 A* Pathfinding Algorithm (Guarantees smooth walking without teleportation)
  public findPath(
    startX: number,
    startY: number,
    targetX: number,
    targetY: number
  ): Array<{ x: number; y: number }> {
    let endX = targetX;
    let endY = targetY;
    if (!this.isWalkable(endX, endY)) {
      const neighbors = [
        { x: endX + 1, y: endY },
        { x: endX - 1, y: endY },
        { x: endX, y: endY + 1 },
        { x: endX, y: endY - 1 }
      ];
      for (const n of neighbors) {
        if (this.isWalkable(n.x, n.y)) {
          endX = n.x;
          endY = n.y;
          break;
        }
      }
    }

    interface Node {
      x: number;
      y: number;
      g: number;
      h: number;
      f: number;
      parent?: Node;
    }

    const openList: Node[] = [];
    const closedSet = new Set<string>();

    const startNode: Node = {
      x: startX,
      y: startY,
      g: 0,
      h: Math.abs(startX - endX) + Math.abs(startY - endY),
      f: Math.abs(startX - endX) + Math.abs(startY - endY)
    };

    openList.push(startNode);

    while (openList.length > 0) {
      let lowestIdx = 0;
      for (let i = 1; i < openList.length; i++) {
        if (openList[i].f < openList[lowestIdx].f) {
          lowestIdx = i;
        }
      }

      const current = openList.splice(lowestIdx, 1)[0];
      const key = `${current.x},${current.y}`;

      if (current.x === endX && current.y === endY) {
        const path: Array<{ x: number; y: number }> = [];
        let curr: Node | undefined = current;
        while (curr) {
          path.unshift({ x: curr.x, y: curr.y });
          curr = curr.parent;
        }
        if (path.length > 0 && path[0].x === startX && path[0].y === startY) {
          path.shift();
        }
        return path;
      }

      closedSet.add(key);

      const directions = [
        { x: 0, y: -1 }, // UP
        { x: 0, y: 1 },  // DOWN
        { x: -1, y: 0 }, // LEFT
        { x: 1, y: 0 }   // RIGHT
      ];

      for (const dir of directions) {
        const nx = current.x + dir.x;
        const ny = current.y + dir.y;
        const nKey = `${nx},${ny}`;

        if (!this.isWalkable(nx, ny) || closedSet.has(nKey)) {
          continue;
        }

        const gScore = current.g + 1;
        let neighbor = openList.find(n => n.x === nx && n.y === ny);

        if (!neighbor) {
          const h = Math.abs(nx - endX) + Math.abs(ny - endY);
          neighbor = {
            x: nx,
            y: ny,
            g: gScore,
            h,
            f: gScore + h,
            parent: current
          };
          openList.push(neighbor);
        } else if (gScore < neighbor.g) {
          neighbor.g = gScore;
          neighbor.f = gScore + neighbor.h;
          neighbor.parent = current;
        }
      }
    }

    return [];
  }
}

// P1.2 Meeting Detector
export function detectOfficeMeetings(agents: OfficeAgentVisual[]): ActiveOfficeMeeting | null {
  // Check if multiple agents are close together in the meeting room or governor room
  const meetingRoomAgents = agents.filter(a => a.currentRoomId === 'room_meeting' || a.currentRoomId === 'room_governor');
  if (meetingRoomAgents.length >= 2) {
    // Check pairwise distance < 3 tiles
    for (let i = 0; i < meetingRoomAgents.length; i++) {
      for (let j = i + 1; j < meetingRoomAgents.length; j++) {
        const a1 = meetingRoomAgents[i];
        const a2 = meetingRoomAgents[j];
        const dist = Math.hypot(a1.gridX - a2.gridX, a1.gridY - a2.gridY);
        if (dist <= 3.5) {
          return {
            id: `MEET-${a1.id}-${a2.id}`,
            participants: [a1.id, a2.id],
            participantNames: [a1.name, a2.name],
            topic: a1.id.includes('scout') || a2.id.includes('scout')
              ? 'Opportunity Review & Discovery Handoff'
              : a1.id.includes('sec') || a2.id.includes('sec')
              ? 'Security & Threat Vector Review'
              : a1.id.includes('comp') || a2.id.includes('comp')
              ? 'Pre-Flight Regulatory & Sanctions Screening'
              : 'Autonomous Task Strategy Summit',
            roomId: a1.currentRoomId,
            active: true,
            startedAt: new Date().toLocaleTimeString()
          };
        }
      }
    }
  }
  return null;
}
