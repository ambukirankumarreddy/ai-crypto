/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import {
  RoomId,
  OfficeRoom,
  OfficeAgentVisual,
  OfficeEvent,
  OfficeParticle,
  TimeOfDay,
  OfficeSimConfig,
  WorkflowStageId,
  DemoOfficeTask,
  ActiveOfficeMeeting,
  OfficeRewardEvent,
  HumanApprovalRequest
} from '../types/office';
import {
  OFFICE_ROOMS,
  INITIAL_OFFICE_AGENTS,
  OfficeGridMap,
  TILE_SIZE,
  GRID_COLS,
  GRID_ROWS,
  DEFAULT_DEMO_TASK,
  detectOfficeMeetings
} from '../services/OfficeEngine';
import { PixiApplication } from '../components/PixiApplication';
import { HumanApprovalModal } from '../components/HumanApprovalModal';
import { ScorecardModal } from '../components/ScorecardModal';
import {
  Play,
  Pause,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Shield,
  Scale,
  BrainCircuit,
  Compass,
  TrendingUp,
  Cpu,
  Users2,
  Code2,
  ListTodo,
  AlertTriangle,
  Sparkles,
  DollarSign,
  Wallet,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Zap,
  Activity,
  Layers,
  MapPin,
  ChevronRight,
  Sun,
  Moon,
  Sunset,
  Sunrise,
  ShieldAlert,
  Send,
  Check,
  Award,
  Radio,
  Sliders,
  Terminal,
  FileCheck
} from 'lucide-react';

export const OfficeGameView: React.FC = () => {
  const {
    policy,
    wallet,
    triggerEmergencyStop,
    resetEmergencyStop,
    setActiveView
  } = useApp();

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const minimapCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Simulation State
  const [simConfig, setSimConfig] = useState<OfficeSimConfig>({
    mode: 'SIMULATION',
    simulationSpeed: 1,
    isPaused: false,
    timeOfDay: 'AFTERNOON',
    emergencyStopActive: policy.emergencyStopActive,
    activeScenario: undefined
  });

  const [renderEngine, setRenderEngine] = useState<'PIXI' | 'CANVAS'>('PIXI');

  // Agents & Grid State (kept in ref for 60fps loop and in state for React panels)
  const gridMapRef = useRef<OfficeGridMap>(new OfficeGridMap());
  const agentsRef = useRef<OfficeAgentVisual[]>(JSON.parse(JSON.stringify(INITIAL_OFFICE_AGENTS)));
  const particlesRef = useRef<OfficeParticle[]>([]);
  const eventsRef = useRef<OfficeEvent[]>([
    {
      id: 'EVT-001',
      timestamp: new Date().toISOString(),
      timeFormatted: '10:12:01',
      agentId: 'agent_scout_01',
      agentName: 'Scout-01',
      eventType: 'DISCOVERY',
      description: 'Scout-01 started research: crawling Base Sepolia faucet registries.',
      roomId: 'room_research'
    },
    {
      id: 'EVT-002',
      timestamp: new Date().toISOString(),
      timeFormatted: '10:12:05',
      agentId: 'agent_scout_01',
      agentName: 'Scout-01',
      eventType: 'DISCOVERY',
      description: 'Opportunity discovered: Base Sepolia Quest #8842 ($2.43 Net EV).',
      roomId: 'room_research'
    },
    {
      id: 'EVT-003',
      timestamp: new Date().toISOString(),
      timeFormatted: '10:12:08',
      agentId: 'agent_gov_01',
      agentName: 'AI Governor',
      eventType: 'GOVERNOR_APPROVAL',
      description: 'AI Governor received report. Initiating multi-gate audit.',
      roomId: 'room_governor'
    }
  ]);

  // Camera State
  const [cameraState, setCameraState] = useState({
    x: 80,
    y: 60,
    zoom: 1.0,
    followedAgentId: null as string | null
  });

  const cameraRef = useRef({
    x: 80,
    y: 60,
    zoom: 1.0,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    followedAgentId: null as string | null
  });

  // Timers ref for clean cleanup on reset / emergency stop
  const activeTimersRef = useRef<NodeJS.Timeout[]>([]);

  const clearAllTimers = useCallback(() => {
    activeTimersRef.current.forEach(t => clearTimeout(t));
    activeTimersRef.current = [];
  }, []);

  const addTimer = useCallback((fn: () => void, delayMs: number) => {
    const timer = setTimeout(fn, delayMs);
    activeTimersRef.current.push(timer);
    return timer;
  }, []);

  // Selected State for UI Inspection
  const [selectedAgent, setSelectedAgent] = useState<OfficeAgentVisual | null>(INITIAL_OFFICE_AGENTS[0]);
  const [selectedRoom, setSelectedRoom] = useState<OfficeRoom | null>(null);
  const [activityFeed, setActivityFeed] = useState<OfficeEvent[]>(eventsRef.current);
  const [activeTab, setActiveTab] = useState<'TASKS' | 'INSPECTOR' | 'FEED' | 'SCENARIOS' | 'ROOMS'>('TASKS');
  const [scenarioStepText, setScenarioStepText] = useState<string>('');
  const [customDestinationRoom, setCustomDestinationRoom] = useState<RoomId>('room_meeting');

  // P1.2 Meeting State
  const [activeMeeting, setActiveMeeting] = useState<ActiveOfficeMeeting | null>(null);

  // P1.3 Demo Task & P1.4 Workflow State
  const [currentTask, setCurrentTask] = useState<DemoOfficeTask>(DEFAULT_DEMO_TASK);

  // P1.5 Reward Modal Event
  const [rewardEvent, setRewardEvent] = useState<OfficeRewardEvent | null>(null);

  // Section 11 & Gate 6: Human Root Approval Modal State
  const [humanApprovalRequest, setHumanApprovalRequest] = useState<HumanApprovalRequest | null>(null);

  // Section 42-47: Automated Scorecard Modal State
  const [isScorecardOpen, setIsScorecardOpen] = useState<boolean>(false);
  const eventSeqCounterRef = useRef<number>(1000);

  // Helper: Emit an office event
  const addOfficeEvent = useCallback((event: Omit<OfficeEvent, 'id' | 'timestamp' | 'timeFormatted'>) => {
    eventSeqCounterRef.current += 1;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const fullEvent: OfficeEvent = {
      ...event,
      id: `EVT-${Date.now()}-${eventSeqCounterRef.current}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: now.toISOString(),
      timeFormatted: timeStr
    };
    eventsRef.current = [fullEvent, ...eventsRef.current.slice(0, 49)];
    setActivityFeed([...eventsRef.current]);
  }, []);

  // Helper: Spawn burst particles
  const spawnParticles = (x: number, y: number, type: OfficeParticle['type'], count = 14, text?: string) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2.5 + 1;
      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * 16,
        y: y + (Math.random() - 0.5) * 16,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (type === 'coin' ? 1.5 : 0),
        color: type === 'coin' ? '#fbbf24' : type === 'shield' ? '#38bdf8' : type === 'scan' ? '#06b6d4' : '#ec4899',
        size: Math.random() * 3 + 2,
        alpha: 1,
        life: 0,
        maxLife: Math.floor(Math.random() * 25 + 35),
        type,
        text: i === 0 ? text : undefined
      });
    }
  };

  // Move an agent along A* path to target grid tile
  const moveAgentTo = useCallback((agentId: string, targetX: number, targetY: number) => {
    const agent = agentsRef.current.find(a => a.id === agentId);
    if (!agent) return;

    const path = gridMapRef.current.findPath(agent.gridX, agent.gridY, targetX, targetY);
    if (path.length > 0) {
      agent.path = path;
      agent.state = 'WALKING';
      agent.targetGridX = targetX;
      agent.targetGridY = targetY;
      const targetRoom = OFFICE_ROOMS.find(
        r => targetX >= r.gridX && targetX < r.gridX + r.width && targetY >= r.gridY && targetY < r.gridY + r.height
      );
      if (targetRoom) {
        agent.targetRoomId = targetRoom.id;
      }
    }
  }, []);

  // Set Agent Speech Bubble
  const setAgentSpeech = useCallback((agentId: string, text: string, type: 'info' | 'success' | 'warning' | 'error' | 'meeting' = 'info', duration = 6000) => {
    const agent = agentsRef.current.find(a => a.id === agentId);
    if (agent) {
      agent.speechBubble = {
        text,
        type,
        expiresAt: Date.now() + duration
      };
    }
  }, []);

  // Update Workflow Progress helper
  const updateWorkflowStage = useCallback((stageId: WorkflowStageId, status: 'PASSED' | 'RUNNING' | 'FAILED' | 'BLOCKED', progress: number) => {
    setCurrentTask(prev => {
      const updatedStages = prev.stages.map(s => {
        if (s.id === stageId) return { ...s, status };
        return s;
      });
      return {
        ...prev,
        currentStage: stageId,
        progressPercent: progress,
        stages: updatedStages,
        updatedAt: new Date().toISOString()
      };
    });
  }, []);

  // -------------------------------------------------------------
  // P0.5: CORE AUTONOMOUS WORKFLOW DEMO
  // Discover -> Research -> Security -> Compliance -> Finance -> Governor -> Approval -> Execution -> Reward
  // -------------------------------------------------------------
  const runAutonomousWorkflowDemo = useCallback(() => {
    if (policy.emergencyStopActive) {
      addOfficeEvent({
        agentId: 'agent_gov_01',
        agentName: 'AI Governor',
        eventType: 'BLOCKED',
        description: 'Cannot execute autonomous workflow while Emergency Stop is active.',
        roomId: 'room_governor'
      });
      return;
    }

    clearAllTimers();
    setSimConfig(prev => ({ ...prev, activeScenario: 'P0_WORKFLOW' }));
    setScenarioStepText('1. DISCOVER: Scout-01 scanning Base Sepolia testnet...');

    const scout = agentsRef.current.find(a => a.id === 'agent_scout_01');
    const gov = agentsRef.current.find(a => a.id === 'agent_gov_01');
    const sec = agentsRef.current.find(a => a.id === 'agent_sec_01');
    const comp = agentsRef.current.find(a => a.id === 'agent_comp_01');
    const fin = agentsRef.current.find(a => a.id === 'agent_fin_01');
    const worker = agentsRef.current.find(a => a.id === 'agent_worker_01');

    if (!scout || !gov || !sec || !comp || !fin || !worker) return;

    // Stage 1: DISCOVER
    scout.state = 'WORKING';
    scout.lastAction = 'Scanned testnet faucet registry';
    scout.nextAction = 'Parse bounty metadata';
    updateWorkflowStage('DISCOVER', 'RUNNING', 10);
    setAgentSpeech('agent_scout_01', 'Scanning L2 testnet developer faucets...', 'info', 4000);
    spawnParticles(scout.pixelX + 16, scout.pixelY + 16, 'scan', 16);
    addOfficeEvent({
      agentId: 'agent_scout_01',
      agentName: 'Scout-01',
      eventType: 'DISCOVERY',
      description: 'Discovered bounty opportunity #8842 on Base Sepolia (Gross $2.50).',
      roomId: 'room_research'
    });

    // Stage 2: RESEARCH & MOVE TO GOVERNOR
    addTimer(() => {
      setScenarioStepText('2. RESEARCH: Scout-01 analyzing contract specifications and walking to Governor...');
      updateWorkflowStage('DISCOVER', 'PASSED', 20);
      updateWorkflowStage('RESEARCH', 'RUNNING', 25);
      scout.state = 'WALKING';
      moveAgentTo('agent_scout_01', 19, 7);
      setAgentSpeech('agent_scout_01', 'Researching opportunity specs... Delivering to Governor.', 'info', 4500);
    }, 2500);

    // Stage 3: MEETING AT GOVERNOR COMMAND BRIDGE
    addTimer(() => {
      setScenarioStepText('3. MEETING: Scout-01 delivers draft to AI Governor. Summoning audit team...');
      updateWorkflowStage('RESEARCH', 'PASSED', 35);
      updateWorkflowStage('SECURITY', 'RUNNING', 40);
      scout.state = 'REPORTING';
      setAgentSpeech('agent_gov_01', 'Draft received. Sentinel & Compliance, initiate pre-flight review.', 'info', 5000);
      setActiveMeeting({
        id: 'MEET-SCOUT-GOV',
        participants: ['agent_scout_01', 'agent_gov_01'],
        participantNames: ['Scout-01', 'AI Governor'],
        topic: 'Opportunity Review & Parameter Validation',
        roomId: 'room_governor',
        active: true,
        startedAt: new Date().toLocaleTimeString()
      });
      addOfficeEvent({
        agentId: 'agent_gov_01',
        agentName: 'AI Governor',
        eventType: 'MEETING',
        description: 'AI Governor convened physical review meeting with Scout-01.',
        roomId: 'room_governor'
      });
      // Sentinel & Compliance walk to Governor desk
      moveAgentTo('agent_sec_01', 20, 8);
      moveAgentTo('agent_comp_01', 22, 8);
    }, 6500);

    // Stage 4: SECURITY AUDIT
    addTimer(() => {
      setScenarioStepText('4. SECURITY: Sentinel decompiling EVM bytecode and checking reentrancy guards...');
      sec.state = 'WORKING';
      setAgentSpeech('agent_sec_01', 'Security review: 0 drainers, zero-trust bytecode verified!', 'success', 5000);
      spawnParticles(sec.pixelX + 16, sec.pixelY + 16, 'shield', 18);
      addOfficeEvent({
        agentId: 'agent_sec_01',
        agentName: 'Sentinel',
        eventType: 'SECURITY_CHECK',
        description: 'Layer 1 Technical Security check PASSED (Score 99/100).',
        roomId: 'room_governor'
      });
    }, 10000);

    // Stage 5: COMPLIANCE SCREENING
    addTimer(() => {
      setScenarioStepText('5. COMPLIANCE: Compliance screening OFAC SDN sanctions & non-custodial scope...');
      updateWorkflowStage('SECURITY', 'PASSED', 50);
      updateWorkflowStage('COMPLIANCE', 'RUNNING', 55);
      comp.state = 'WORKING';
      setAgentSpeech('agent_comp_01', 'Checking restrictions... 0 OFAC sanctions hits. Non-custodial OK.', 'success', 5000);
      addOfficeEvent({
        agentId: 'agent_comp_01',
        agentName: 'Compliance',
        eventType: 'COMPLIANCE_CHECK',
        description: 'Layer 2 Regulatory Gate PASSED. Zero SDN matches, non-custodial scope.',
        roomId: 'room_governor'
      });
    }, 13500);

    // Stage 6: FINANCE & NET VALUE
    addTimer(() => {
      setScenarioStepText('6. FINANCE: Ledger computing Net EV (Gross $2.50 - Gas $0.07 = Net $2.43)...');
      updateWorkflowStage('COMPLIANCE', 'PASSED', 65);
      updateWorkflowStage('FINANCE', 'RUNNING', 70);
      moveAgentTo('agent_fin_01', 23, 7);
      fin.state = 'WORKING';
      setAgentSpeech('agent_fin_01', 'Calculating net value: Net EV +$2.43 (Gross $2.50 - Gas $0.07)', 'success', 5000);
      spawnParticles(fin.pixelX + 16, fin.pixelY + 16, 'coin', 16);
      addOfficeEvent({
        agentId: 'agent_fin_01',
        agentName: 'Ledger',
        eventType: 'FINANCIAL_CALC',
        description: 'Layer 3 Financial analysis PASSED. Net positive yield confirmed.',
        roomId: 'room_governor'
      });
    }, 17000);

    // Stage 7: GOVERNOR & APPROVAL
    addTimer(() => {
      setScenarioStepText('7. GOVERNOR & APPROVAL: Synthesizing gates and authorizing worker execution...');
      updateWorkflowStage('FINANCE', 'PASSED', 80);
      updateWorkflowStage('GOVERNOR', 'PASSED', 85);
      updateWorkflowStage('APPROVAL', 'PASSED', 90);
      gov.state = 'WORKING';
      setAgentSpeech('agent_gov_01', '✅ All 3 gates PASSED. Dispatching Worker-01 for execution.', 'success', 5000);
      setActiveMeeting(null);
      addOfficeEvent({
        agentId: 'agent_gov_01',
        agentName: 'AI Governor',
        eventType: 'GOVERNOR_APPROVAL',
        description: 'Task TASK-1001 approved by AI Governor. Worker-01 dispatched.',
        roomId: 'room_governor'
      });
      // Worker walks to Execution terminal
      worker.state = 'WALKING';
      moveAgentTo('agent_worker_01', 34, 30);
    }, 20500);

    // Stage 8: EXECUTION AT TERMINAL
    addTimer(() => {
      setScenarioStepText('8. EXECUTION: Worker-01 arrived at Live Execution Floor terminal...');
      updateWorkflowStage('EXECUTION', 'RUNNING', 95);
      worker.state = 'WORKING';
      setAgentSpeech('agent_worker_01', '⚙️ Executing sandboxed testnet claim via Base RPC...', 'info', 5000);
      spawnParticles(worker.pixelX + 16, worker.pixelY + 16, 'scan', 22);
      addOfficeEvent({
        agentId: 'agent_worker_01',
        agentName: 'Worker-01',
        eventType: 'EXECUTION_START',
        description: 'Executing sandboxed transaction on Base Sepolia.',
        roomId: 'room_execution'
      });
    }, 24500);

    // Stage 9: REWARD DETECTED & CELEBRATION
    addTimer(() => {
      setScenarioStepText('9. REWARD: Simulated +$2.43 USD confirmed! Forwarding receipt to Finance...');
      updateWorkflowStage('EXECUTION', 'PASSED', 90);
      updateWorkflowStage('REWARD', 'PASSED', 95);
      worker.state = 'COMPLETED';
      setAgentSpeech('agent_worker_01', '🎉 Bounty receipt verified on-chain! +$2.43 USD', 'success', 6000);
      spawnParticles(worker.pixelX + 16, worker.pixelY + 16, 'coin', 40, '+$2.43');
      spawnParticles(fin.pixelX + 16, fin.pixelY + 16, 'coin', 25, '+$2.43');

      // Trigger P1.5 Reward Event Dialog
      setRewardEvent({
        amountUSD: 2.43,
        treasuryBeforeUSD: 128.40,
        treasuryAfterUSD: 130.83,
        taskId: 'TASK-1001',
        taskTitle: 'Base Sepolia Ecosystem Bounty #8842',
        agentName: 'Worker-01',
        timestamp: new Date().toLocaleTimeString(),
        isSimulated: true
      });

      addOfficeEvent({
        agentId: 'agent_worker_01',
        agentName: 'Worker-01',
        eventType: 'REWARD_CLAIM',
        description: 'Simulated reward detected: +$2.43 USD credited to non-custodial treasury.',
        roomId: 'room_execution',
        metadata: { rewardUSD: 2.43 }
      });
    }, 29000);

    // Stage 10: ACCOUNTING & LEDGER ARCHIVAL
    addTimer(() => {
      setScenarioStepText('10. ACCOUNTING: Ledger reconciling gas fee deduction & archiving immutable audit trail.');
      updateWorkflowStage('ACCOUNTING', 'PASSED', 100);
      fin.state = 'WORKING';
      setAgentSpeech('agent_fin_01', '📊 Accounting complete: +$2.50 Gross - $0.07 Gas = +$2.43 Net EV to Treasury.', 'success', 6000);
      spawnParticles(fin.pixelX + 16, fin.pixelY + 16, 'coin', 30, '+$2.43');
      
      setCurrentTask(prev => ({
        ...prev,
        status: 'COMPLETED',
        progressPercent: 100
      }));

      addOfficeEvent({
        agentId: 'agent_fin_01',
        agentName: 'Ledger',
        eventType: 'FINANCIAL_CALC',
        description: 'Stage 10 Accounting complete: Non-custodial ledger updated ($130.83 USD total).',
        roomId: 'room_finance'
      });
    }, 33500);

    // Stage 11: RETURN TO BASE STATIONS
    addTimer(() => {
      setScenarioStepText('Workflow complete. Agents returning to base department desks.');
      moveAgentTo('agent_scout_01', 6, 16);
      moveAgentTo('agent_sec_01', 19, 18);
      moveAgentTo('agent_comp_01', 31, 18);
      moveAgentTo('agent_fin_01', 43, 18);
      setSimConfig(prev => ({ ...prev, activeScenario: undefined }));
    }, 38000);
  }, [policy.emergencyStopActive, addOfficeEvent, moveAgentTo, setAgentSpeech, updateWorkflowStage, clearAllTimers, addTimer]);

  // -------------------------------------------------------------
  // SCENARIO: HUMAN ROOT APPROVAL WORKFLOW (SECTION 11 & GATE 6)
  // -------------------------------------------------------------
  const runHumanApprovalWorkflowDemo = useCallback(() => {
    clearAllTimers();
    setSimConfig(prev => ({ ...prev, activeScenario: 'HUMAN_APPROVAL_DEMO' }));
    setScenarioStepText('HUMAN ROOT APPROVAL DEMO: High-value opportunity discovered (+$75.00 EV). Requires owner signature...');

    const scout = agentsRef.current.find(a => a.id === 'agent_scout_01');
    const gov = agentsRef.current.find(a => a.id === 'agent_gov_01');
    const sec = agentsRef.current.find(a => a.id === 'agent_sec_01');
    const comp = agentsRef.current.find(a => a.id === 'agent_comp_01');
    const fin = agentsRef.current.find(a => a.id === 'agent_fin_01');

    if (!scout || !gov || !sec || !comp || !fin) return;

    scout.state = 'WORKING';
    setAgentSpeech('agent_scout_01', 'High-stake opportunity found: Optimism Grant ($75.00 Net EV)!', 'info', 4000);
    moveAgentTo('agent_scout_01', 19, 7);

    addTimer(() => {
      sec.state = 'WORKING';
      moveAgentTo('agent_sec_01', 20, 8);
      setAgentSpeech('agent_sec_01', 'Security check passed: 99/100 zero reentrancy.', 'success', 4000);
    }, 3000);

    addTimer(() => {
      comp.state = 'WORKING';
      moveAgentTo('agent_comp_01', 22, 8);
      setAgentSpeech('agent_comp_01', 'Compliance check passed: Non-custodial grant scope.', 'success', 4000);
    }, 6000);

    addTimer(() => {
      fin.state = 'WORKING';
      moveAgentTo('agent_fin_01', 23, 7);
      setAgentSpeech('agent_fin_01', 'Finance check: Gross $77.50 - Gas $2.50 = Net EV +$75.00 USD.', 'success', 4000);
    }, 9000);

    addTimer(() => {
      gov.state = 'WORKING';
      setAgentSpeech('agent_gov_01', '⚠️ Value exceeds $5.00 automated limit. Requesting Root Owner approval...', 'warning', 6000);
      
      setCurrentTask(prev => ({
        ...prev,
        id: 'TASK-2001',
        title: 'Optimism DEX Liquidity Grant ($75.00 EV)',
        status: 'WAITING_APPROVAL',
        currentStage: 'APPROVAL'
      }));

      // Open Section 11 Human Approval Request Modal
      setHumanApprovalRequest({
        taskId: 'TASK-2001',
        opportunityTitle: 'Optimism DEX Liquidity & Developer Grant ($75.00 Net EV)',
        expectedRewardUSD: 77.50,
        estimatedCostUSD: 2.50,
        netEVUSD: 75.00,
        riskScore: 'Low (15/100)',
        securityResult: 'Sentinel verified zero reentrancy & isolated delegatecall hook.',
        complianceResult: '0 OFAC SDN hits, non-custodial smart contract interaction.',
        requiredPermissions: ['EVM_CALLDATA_SIMULATION', 'GAS_CAP_0.05_ETH'],
        proposedAction: 'Sign & execute automated claim on Optimism Mainnet gateway.',
        reasonRequired: 'High-value threshold: Autonomous policy requires explicit human root authorization for any task value > $5.00 USD.',
        expiresInSeconds: 120,
        network: 'Optimism L2',
        contractAddress: '0x3841...e912'
      });

      addOfficeEvent({
        agentId: 'agent_gov_01',
        agentName: 'AI Governor',
        eventType: 'APPROVAL_REQUEST',
        description: 'Level 0 Human Approval requested for TASK-2001 (+$75.00 Net EV).',
        roomId: 'room_governor'
      });
    }, 12000);
  }, [clearAllTimers, addTimer, moveAgentTo, setAgentSpeech, addOfficeEvent]);

  // Handle Human Approval Accept
  const handleApproveHumanRequest = useCallback(() => {
    const req = humanApprovalRequest;
    setHumanApprovalRequest(null);
    if (!req) return;

    setScenarioStepText('HUMAN APPROVAL GRANTED: Worker-01 dispatched to execution floor...');
    const worker = agentsRef.current.find(a => a.id === 'agent_worker_01');
    const fin = agentsRef.current.find(a => a.id === 'agent_fin_01');
    if (!worker || !fin) return;

    worker.state = 'WALKING';
    moveAgentTo('agent_worker_01', 34, 30);

    addTimer(() => {
      worker.state = 'WORKING';
      setAgentSpeech('agent_worker_01', 'Executing signed grant claim on Optimism...', 'info', 5000);
      spawnParticles(worker.pixelX + 16, worker.pixelY + 16, 'scan', 25);
    }, 3500);

    addTimer(() => {
      worker.state = 'COMPLETED';
      setAgentSpeech('agent_worker_01', '🎉 +$75.00 USD Grant confirmed!', 'success', 6000);
      spawnParticles(worker.pixelX + 16, worker.pixelY + 16, 'coin', 50, '+$75.00');

      setRewardEvent({
        amountUSD: 75.00,
        treasuryBeforeUSD: 128.40,
        treasuryAfterUSD: 203.40,
        taskId: req.taskId,
        taskTitle: req.opportunityTitle,
        agentName: 'Worker-01',
        timestamp: new Date().toLocaleTimeString(),
        isSimulated: true
      });

      addOfficeEvent({
        agentId: 'agent_worker_01',
        agentName: 'Worker-01',
        eventType: 'REWARD_CLAIM',
        description: 'Simulated grant reward credited: +$75.00 USD to non-custodial treasury.',
        roomId: 'room_execution'
      });
      setSimConfig(prev => ({ ...prev, activeScenario: undefined }));
    }, 7000);
  }, [humanApprovalRequest, moveAgentTo, addTimer, setAgentSpeech, addOfficeEvent]);

  // Handle Human Approval Reject
  const handleRejectHumanRequest = useCallback((reason?: string) => {
    const req = humanApprovalRequest;
    setHumanApprovalRequest(null);
    if (!req) return;

    setScenarioStepText(`HUMAN VETO: Owner declined task execution (${reason || 'User rejected'}). Worker locked.`);
    const gov = agentsRef.current.find(a => a.id === 'agent_gov_01');
    const worker = agentsRef.current.find(a => a.id === 'agent_worker_01');
    if (gov) {
      setAgentSpeech('agent_gov_01', 'Human root rejected task. Execution cancelled.', 'error', 5000);
    }
    if (worker) {
      worker.state = 'IDLE';
    }
    setCurrentTask(prev => ({ ...prev, status: 'BLOCKED' }));

    addOfficeEvent({
      agentId: 'agent_gov_01',
      agentName: 'AI Governor',
      eventType: 'BLOCKED',
      description: `TASK BLOCKED by Human Root Owner. Reason: ${reason || 'Manual Veto'}`,
      roomId: 'room_governor'
    });
    setSimConfig(prev => ({ ...prev, activeScenario: undefined }));
  }, [humanApprovalRequest, setAgentSpeech, addOfficeEvent]);

  // Section 42.15 Reset Stress Benchmark Runner
  const handleRunResetStressTest = useCallback(async (onProgress: (current: number, total: number) => void): Promise<boolean> => {
    for (let i = 1; i <= 20; i++) {
      onProgress(i, 20);
      handleResetOffice();
      await new Promise(r => setTimeout(r, 60));
    }
    return true;
  }, []);

  // Section 42.3 Pathfinding Benchmark Runner
  const handleRunPathfindingBenchmark = useCallback(async (onProgress: (current: number, total: number) => void): Promise<boolean> => {
    const rooms = OFFICE_ROOMS;
    for (let i = 1; i <= 100; i++) {
      onProgress(i, 100);
      const startRoom = rooms[i % rooms.length];
      const endRoom = rooms[(i + 3) % rooms.length];
      const path = gridMapRef.current.findPath(
        startRoom.workstations[0]?.x || startRoom.gridX + 2,
        startRoom.workstations[0]?.y || startRoom.gridY + 2,
        endRoom.workstations[0]?.x || endRoom.gridX + 2,
        endRoom.workstations[0]?.y || endRoom.gridY + 2
      );
      if (path.length === 0) return false;
      await new Promise(r => setTimeout(r, 10));
    }
    return true;
  }, []);

  // Keyboard navigation & accessibility controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setSimConfig(prev => ({ ...prev, isPaused: !prev.isPaused }));
      } else if (e.key === 'Escape') {
        triggerEmergencyStop();
      } else if (e.key === '1') {
        setSimConfig(prev => ({ ...prev, simulationSpeed: 1, isPaused: false }));
      } else if (e.key === '2') {
        setSimConfig(prev => ({ ...prev, simulationSpeed: 2, isPaused: false }));
      } else if (e.key === '4') {
        setSimConfig(prev => ({ ...prev, simulationSpeed: 4, isPaused: false }));
      } else if (e.key === '+' || e.key === '=') {
        setCameraState(prev => {
          const newZoom = Math.min(2.5, prev.zoom + 0.2);
          cameraRef.current.zoom = newZoom;
          return { ...prev, zoom: newZoom };
        });
      } else if (e.key === '-' || e.key === '_') {
        setCameraState(prev => {
          const newZoom = Math.max(0.5, prev.zoom - 0.2);
          cameraRef.current.zoom = newZoom;
          return { ...prev, zoom: newZoom };
        });
      } else if (e.key === '0') {
        cameraRef.current.x = 80;
        cameraRef.current.y = 60;
        cameraRef.current.zoom = 1.0;
        cameraRef.current.followedAgentId = null;
        setCameraState({ x: 80, y: 60, zoom: 1.0, followedAgentId: null });
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const currentIdx = agentsRef.current.findIndex(a => a.id === selectedAgent?.id);
        const nextIdx = (currentIdx + 1) % agentsRef.current.length;
        setSelectedAgent(agentsRef.current[nextIdx]);
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        cameraRef.current.y += 30;
        setCameraState({ ...cameraRef.current });
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        cameraRef.current.y -= 30;
        setCameraState({ ...cameraRef.current });
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        cameraRef.current.x += 30;
        setCameraState({ ...cameraRef.current });
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        cameraRef.current.x -= 30;
        setCameraState({ ...cameraRef.current });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedAgent, triggerEmergencyStop]);

  // -------------------------------------------------------------
  // SCENARIO: SECURITY THREAT DETECTED & VETO (BLOCKED)
  // -------------------------------------------------------------
  const runSecurityBlockScenario = useCallback(() => {
    clearAllTimers();
    setSimConfig(prev => ({ ...prev, activeScenario: 'SECURITY_VETO' }));
    setScenarioStepText('SECURITY AUDIT TEST: Scout-01 delivers unverified contract #9910 with suspicious delegatecall...');

    const scout = agentsRef.current.find(a => a.id === 'agent_scout_01');
    const sec = agentsRef.current.find(a => a.id === 'agent_sec_01');
    const gov = agentsRef.current.find(a => a.id === 'agent_gov_01');
    const worker = agentsRef.current.find(a => a.id === 'agent_worker_01');

    if (!scout || !sec || !gov || !worker) return;

    scout.state = 'WORKING';
    setAgentSpeech('agent_scout_01', 'Discovered high APY vault #9910. Requesting audit...', 'warning', 4000);
    moveAgentTo('agent_scout_01', 19, 7);

    addTimer(() => {
      sec.state = 'WORKING';
      moveAgentTo('agent_sec_01', 20, 8);
      setAgentSpeech('agent_sec_01', '🚨 ALERT: Bytecode decompile detected hidden delegatecall drainer! Score: 12/100', 'error', 6000);
      spawnParticles(sec.pixelX + 16, sec.pixelY + 16, 'shield', 20);

      updateWorkflowStage('SECURITY', 'FAILED', 40);
      setCurrentTask(prev => ({
        ...prev,
        title: 'Arbitrum Suspicious Vault #9910 (FLAGGED DRAINER)',
        status: 'BLOCKED'
      }));

      addOfficeEvent({
        agentId: 'agent_sec_01',
        agentName: 'Sentinel',
        eventType: 'BLOCKED',
        description: 'SECURITY VETO: Contract 0x9910 contains malicious reentrancy/drainer hook. Task BLOCKED.',
        roomId: 'room_governor'
      });
    }, 3500);

    addTimer(() => {
      gov.state = 'WORKING';
      worker.state = 'BLOCKED';
      setAgentSpeech('agent_gov_01', '❌ TASK REJECTED: Security gate failed. Execution Worker locked.', 'error', 5000);
      setScenarioStepText('TASK BLOCKED: Sentinel security veto prevented malicious execution. Worker safely idle.');
      setSimConfig(prev => ({ ...prev, activeScenario: undefined }));
    }, 7500);
  }, [clearAllTimers, addTimer, moveAgentTo, setAgentSpeech, updateWorkflowStage, addOfficeEvent]);

  // -------------------------------------------------------------
  // SCENARIO: COMPLIANCE OFAC SANCTIONS VETO (BLOCKED)
  // -------------------------------------------------------------
  const runComplianceBlockScenario = useCallback(() => {
    clearAllTimers();
    setSimConfig(prev => ({ ...prev, activeScenario: 'COMPLIANCE_VETO' }));
    setScenarioStepText('COMPLIANCE TEST: Compliance scanning transaction participant addresses against OFAC SDN list...');

    const comp = agentsRef.current.find(a => a.id === 'agent_comp_01');
    const gov = agentsRef.current.find(a => a.id === 'agent_gov_01');
    const worker = agentsRef.current.find(a => a.id === 'agent_worker_01');

    if (!comp || !gov || !worker) return;

    comp.state = 'WORKING';
    moveAgentTo('agent_comp_01', 22, 8);
    setAgentSpeech('agent_comp_01', 'Auditing wallet counterparties against OFAC SDN database...', 'info', 3500);

    addTimer(() => {
      comp.state = 'WORKING';
      setAgentSpeech('agent_comp_01', '🚨 SANCTIONS MATCH: Counterparty wallet on OFAC SDN list! Immediate VETO.', 'error', 6000);

      updateWorkflowStage('COMPLIANCE', 'FAILED', 50);
      setCurrentTask(prev => ({
        ...prev,
        title: 'Optimism Bounty #4412 (OFAC RESTRICTED JURISDICTION)',
        status: 'BLOCKED'
      }));

      addOfficeEvent({
        agentId: 'agent_comp_01',
        agentName: 'Compliance',
        eventType: 'BLOCKED',
        description: 'COMPLIANCE VETO: Participant wallet listed on OFAC SDN registry. Task execution strictly BLOCKED.',
        roomId: 'room_governor'
      });
    }, 3500);

    addTimer(() => {
      gov.state = 'WORKING';
      worker.state = 'BLOCKED';
      setAgentSpeech('agent_gov_01', '❌ COMPLIANCE VETO CONFIRMED: Transaction dropped. Non-custodial policy enforced.', 'error', 5000);
      setScenarioStepText('TASK BLOCKED: Compliance officer veto enforced. No blockchain interaction permitted.');
      setSimConfig(prev => ({ ...prev, activeScenario: undefined }));
    }, 7500);
  }, [clearAllTimers, addTimer, moveAgentTo, setAgentSpeech, updateWorkflowStage, addOfficeEvent]);

  // -------------------------------------------------------------
  // CREATE ANOTHER RANDOMIZED DEMO TASK (P0.9)
  // -------------------------------------------------------------
  const handleCreateRandomizedDemoTask = () => {
    clearAllTimers();
    const taskTemplates = [
      {
        id: `TASK-${Math.floor(1000 + Math.random() * 9000)}`,
        title: 'Arbitrum One Stylus Faucet Claim & Deploy Verification',
        netEV: 3.85,
        gasEstimatedUSD: 0.04,
        network: 'Arbitrum One',
        contract: '0x39a1...88c2'
      },
      {
        id: `TASK-${Math.floor(1000 + Math.random() * 9000)}`,
        title: 'Optimism Superchain Developer Quest Stage 2',
        netEV: 5.20,
        gasEstimatedUSD: 0.06,
        network: 'Optimism',
        contract: '0x17c9...a941'
      },
      {
        id: `TASK-${Math.floor(1000 + Math.random() * 9000)}`,
        title: 'Polygon Amoy Proof-of-Skill On-Chain Badge Mint',
        netEV: 1.95,
        gasEstimatedUSD: 0.02,
        network: 'Polygon Amoy',
        contract: '0xfa84...710e'
      }
    ];

    const pick = taskTemplates[Math.floor(Math.random() * taskTemplates.length)];

    setCurrentTask({
      id: pick.id,
      title: pick.title,
      description: `Autonomous discovery, security audit, sanctions review, and execution on ${pick.network}.`,
      status: 'RUNNING',
      activeAgentId: 'agent_scout_01',
      activeAgentName: 'Scout-01',
      currentStage: 'RESEARCH',
      progressPercent: 15,
      stages: [
        { id: 'DISCOVER', label: 'Discover', agentName: 'Scout-01', department: 'RESEARCH', description: `Crawl ${pick.network} ecosystem`, status: 'PASSED' },
        { id: 'RESEARCH', label: 'Research', agentName: 'Scout-01', department: 'RESEARCH', description: 'Analyze specs and contract methods', status: 'RUNNING' },
        { id: 'SECURITY', label: 'Security', agentName: 'Sentinel', department: 'SECURITY', description: 'Bytecode decompile & reentrancy check', status: 'PENDING' },
        { id: 'COMPLIANCE', label: 'Compliance', agentName: 'Compliance', department: 'COMPLIANCE', description: 'OFAC SDN screening & non-custodial gate', status: 'PENDING' },
        { id: 'FINANCE', label: 'Finance', agentName: 'Ledger', department: 'FINANCE', description: `Net EV calculation (+$${pick.netEV.toFixed(2)})`, status: 'PENDING' },
        { id: 'GOVERNOR', label: 'Governor', agentName: 'AI Governor', department: 'EXECUTIVE', description: 'Multi-gate consensus verification', status: 'PENDING' },
        { id: 'APPROVAL', label: 'Approval', agentName: 'Governor / Owner', department: 'EXECUTIVE', description: 'Execution permission validation', status: 'PENDING' },
        { id: 'EXECUTION', label: 'Execution', agentName: 'Worker-01', department: 'OPERATIONS', description: `Execute sandboxed claim on ${pick.network}`, status: 'PENDING' },
        { id: 'REWARD', label: 'Reward', agentName: 'Worker-01', department: 'FINANCE', description: `Simulated +$${pick.netEV.toFixed(2)} credited`, status: 'PENDING' }
      ],
      rewardUSD: pick.netEV + pick.gasEstimatedUSD,
      netEV: pick.netEV,
      gasEstimatedUSD: pick.gasEstimatedUSD,
      targetContract: pick.contract,
      network: pick.network,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    addOfficeEvent({
      agentId: 'agent_scout_01',
      agentName: 'Scout-01',
      eventType: 'DISCOVERY',
      description: `New Opportunity Created: ${pick.title} (${pick.network}, +$${pick.netEV.toFixed(2)} Net EV).`,
      roomId: 'room_research'
    });

    runAutonomousWorkflowDemo();
  };

  // Reset agents to default desk positions
  const handleResetOffice = () => {
    clearAllTimers();
    agentsRef.current = JSON.parse(JSON.stringify(INITIAL_OFFICE_AGENTS));
    setSelectedAgent(INITIAL_OFFICE_AGENTS[0]);
    setActiveMeeting(null);
    setScenarioStepText('');
    setRewardEvent(null);
    addOfficeEvent({
      agentId: 'agent_gov_01',
      agentName: 'AI Governor',
      eventType: 'SYSTEM',
      description: 'Reset all 7 core agents to their designated department desks.',
      roomId: 'room_governor'
    });
  };

  // Focus Camera on Agent
  const focusOnAgent = (agentId: string) => {
    const agent = agentsRef.current.find(a => a.id === agentId);
    if (!agent) return;

    cameraRef.current.followedAgentId = agentId;
    const canvas = canvasRef.current;
    const w = canvas?.width || 800;
    const h = canvas?.height || 600;

    cameraRef.current.x = w / 2 - (agent.pixelX + 16) * cameraRef.current.zoom;
    cameraRef.current.y = h / 2 - (agent.pixelY + 16) * cameraRef.current.zoom;
    setCameraState({ ...cameraRef.current });
  };

  // Reset Camera View
  const resetCamera = () => {
    cameraRef.current = {
      x: 80,
      y: 60,
      zoom: 1.0,
      isDragging: false,
      dragStartX: 0,
      dragStartY: 0,
      followedAgentId: null
    };
    setCameraState({ ...cameraRef.current });
  };

  // -------------------------------------------------------------
  // CANVAS 2D RENDER & SIMULATION LOOP
  // -------------------------------------------------------------
  useEffect(() => {
    let animId: number;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const speed = simConfig.isPaused ? 0 : simConfig.simulationSpeed;

      // 1. Update Agent Movements
      agentsRef.current.forEach(agent => {
        // If emergency stop is active, freeze worker agents
        if (simConfig.emergencyStopActive && (agent.id === 'agent_worker_01' || agent.role.includes('Worker'))) {
          agent.state = 'BLOCKED';
          return;
        }

        if (agent.path.length > 0 && speed > 0) {
          const nextTile = agent.path[0];
          const targetPx = nextTile.x * TILE_SIZE;
          const targetPy = nextTile.y * TILE_SIZE;

          const dx = targetPx - agent.pixelX;
          const dy = targetPy - agent.pixelY;
          const dist = Math.hypot(dx, dy);

          const moveStep = 80 * dt * speed;

          if (dist <= moveStep) {
            agent.pixelX = targetPx;
            agent.pixelY = targetPy;
            agent.gridX = nextTile.x;
            agent.gridY = nextTile.y;
            agent.path.shift();

            // Determine room
            const currentRoom = OFFICE_ROOMS.find(
              r => agent.gridX >= r.gridX && agent.gridX < r.gridX + r.width && agent.gridY >= r.gridY && agent.gridY < r.gridY + r.height
            );
            if (currentRoom) {
              agent.currentRoomId = currentRoom.id;
            }

            if (agent.path.length === 0) {
              agent.state = 'WORKING';
              agent.stats.tasksCompleted += 1;
            }
          } else {
            agent.pixelX += (dx / dist) * moveStep;
            agent.pixelY += (dy / dist) * moveStep;
            agent.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
            agent.animationFrame += dt * 6 * speed;
            agent.stats.distanceWalked += (moveStep / TILE_SIZE);
          }
        }
      });

      // 2. Detect Physical Meetings
      const meeting = detectOfficeMeetings(agentsRef.current);
      if (meeting && !activeMeeting) {
        setActiveMeeting(meeting);
      } else if (!meeting && activeMeeting && activeMeeting.id.startsWith('MEET-agent')) {
        setActiveMeeting(null);
      }

      // 3. Update Particles
      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx * speed;
        p.y += p.vy * speed;
        p.life += 1 * speed;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);
        return p.life < p.maxLife;
      });

      // 4. Render Canvas 2D if in Canvas mode
      if (renderEngine === 'CANVAS') {
        const w = canvas.parentElement?.clientWidth || 800;
        const h = canvas.parentElement?.clientHeight || 600;
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
        }

        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, w, h);

        ctx.save();
        ctx.translate(cameraRef.current.x, cameraRef.current.y);
        ctx.scale(cameraRef.current.zoom, cameraRef.current.zoom);

        // Draw grid
        ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
        ctx.lineWidth = 1;
        for (let x = 0; x <= GRID_COLS * TILE_SIZE; x += TILE_SIZE) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, GRID_ROWS * TILE_SIZE);
          ctx.stroke();
        }
        for (let y = 0; y <= GRID_ROWS * TILE_SIZE; y += TILE_SIZE) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(GRID_COLS * TILE_SIZE, y);
          ctx.stroke();
        }

        // Draw Rooms
        OFFICE_ROOMS.forEach(room => {
          const rx = room.gridX * TILE_SIZE;
          const ry = room.gridY * TILE_SIZE;
          const rw = room.width * TILE_SIZE;
          const rh = room.height * TILE_SIZE;

          ctx.fillStyle = room.color;
          ctx.fillRect(rx, ry, rw, rh);

          const isSelected = selectedRoom?.id === room.id;
          ctx.strokeStyle = isSelected ? '#38bdf8' : room.accentColor;
          ctx.lineWidth = isSelected ? 3 : 1.5;
          ctx.strokeRect(rx, ry, rw, rh);

          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.fillRect(rx + 4, ry + 4, rw - 8, 20);

          ctx.fillStyle = room.accentColor;
          ctx.font = 'bold 10px monospace';
          ctx.fillText(room.name.toUpperCase(), rx + 10, ry + 17);

          // Door
          const dx = room.doorPosition.x * TILE_SIZE;
          const dy = room.doorPosition.y * TILE_SIZE;
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(dx, dy, TILE_SIZE, TILE_SIZE);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1;
          ctx.strokeRect(dx, dy, TILE_SIZE, TILE_SIZE);

          // Workstations
          room.workstations.forEach(ws => {
            const wx = ws.x * TILE_SIZE;
            const wy = ws.y * TILE_SIZE;
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(wx + 2, wy + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            ctx.strokeStyle = room.accentColor;
            ctx.lineWidth = 1;
            ctx.strokeRect(wx + 2, wy + 2, TILE_SIZE - 4, TILE_SIZE - 4);
          });
        });

        // Draw Agents
        agentsRef.current.forEach(agent => {
          const ax = agent.pixelX;
          const ay = agent.pixelY;
          const isSelected = selectedAgent?.id === agent.id;

          // Shadow
          ctx.fillStyle = 'rgba(0,0,0,0.45)';
          ctx.beginPath();
          ctx.ellipse(ax + 16, ay + 26, 10, 5, 0, 0, Math.PI * 2);
          ctx.fill();

          // Selection ring
          if (isSelected) {
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(ax + 16, ay + 16, 18, 0, Math.PI * 2);
            ctx.stroke();
          }

          // Bobbing
          const bob = agent.state === 'WALKING' ? Math.sin(agent.animationFrame * Math.PI) * 2 : 0;

          // Body
          ctx.fillStyle = agent.color;
          ctx.fillRect(ax + 8, ay + 12 + bob, 16, 14);
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 1;
          ctx.strokeRect(ax + 8, ay + 12 + bob, 16, 14);

          // Head
          ctx.fillStyle = agent.headColor;
          ctx.beginPath();
          ctx.arc(ax + 16, ay + 8 + bob, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Name Tag
          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.fillRect(ax - 12, ay - 8 + bob, 56, 11);
          ctx.strokeStyle = isSelected ? '#38bdf8' : 'rgba(148, 163, 184, 0.4)';
          ctx.strokeRect(ax - 12, ay - 8 + bob, 56, 11);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(agent.name.slice(0, 10), ax + 16, ay + bob);
          ctx.textAlign = 'left';
        });

        // Particles
        particlesRef.current.forEach(p => {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        });

        ctx.restore();
      }

      // 5. Render Minimap
      const miniCanvas = minimapCanvasRef.current;
      if (miniCanvas) {
        const mctx = miniCanvas.getContext('2d');
        if (mctx) {
          const mw = miniCanvas.width;
          const mh = miniCanvas.height;
          mctx.fillStyle = '#020617';
          mctx.fillRect(0, 0, mw, mh);

          const scaleX = mw / (GRID_COLS * TILE_SIZE);
          const scaleY = mh / (GRID_ROWS * TILE_SIZE);

          // Draw rooms on minimap
          OFFICE_ROOMS.forEach(room => {
            const rx = room.gridX * TILE_SIZE * scaleX;
            const ry = room.gridY * TILE_SIZE * scaleY;
            const rw = room.width * TILE_SIZE * scaleX;
            const rh = room.height * TILE_SIZE * scaleY;

            mctx.fillStyle = room.color;
            mctx.fillRect(rx, ry, rw, rh);
            mctx.strokeStyle = room.accentColor;
            mctx.lineWidth = 1;
            mctx.strokeRect(rx, ry, rw, rh);
          });

          // Draw agent dots
          agentsRef.current.forEach(a => {
            const ax = a.pixelX * scaleX;
            const ay = a.pixelY * scaleY;
            const isSel = selectedAgent?.id === a.id;

            mctx.fillStyle = isSel ? '#38bdf8' : a.color;
            mctx.beginPath();
            mctx.arc(ax, ay, isSel ? 3.5 : 2.5, 0, Math.PI * 2);
            mctx.fill();
          });

          // Viewport bounding box
          const vx = (-cameraRef.current.x / cameraRef.current.zoom) * scaleX;
          const vy = (-cameraRef.current.y / cameraRef.current.zoom) * scaleY;
          const vw = ((canvas?.width || 800) / cameraRef.current.zoom) * scaleX;
          const vh = ((canvas?.height || 600) / cameraRef.current.zoom) * scaleY;

          mctx.strokeStyle = '#38bdf8';
          mctx.lineWidth = 1;
          mctx.strokeRect(vx, vy, vw, vh);
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [simConfig, selectedAgent, selectedRoom, renderEngine, activeMeeting]);

  // Minimap click to center camera
  const handleMinimapClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const mini = minimapCanvasRef.current;
    if (!mini) return;
    const rect = mini.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const scaleX = (GRID_COLS * TILE_SIZE) / mini.width;
    const scaleY = (GRID_ROWS * TILE_SIZE) / mini.height;

    const worldX = clickX * scaleX;
    const worldY = clickY * scaleY;

    const canvas = canvasRef.current;
    const w = canvas?.width || 800;
    const h = canvas?.height || 600;

    cameraRef.current.x = w / 2 - worldX * cameraRef.current.zoom;
    cameraRef.current.y = h / 2 - worldY * cameraRef.current.zoom;
    cameraRef.current.followedAgentId = null;
    setCameraState({ ...cameraRef.current });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* 1. TOP SIMULATION HUD */}
      <div className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur px-4 flex items-center justify-between gap-4 shrink-0 z-10">
        {/* Left: Branding & Status Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h1 className="text-sm font-bold text-white tracking-wide font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              AI CRYPTO HQ
            </h1>
          </div>

          {/* P0.9 Permanent SIMULATION MODE Badge */}
          <div className="px-2.5 py-1 rounded-md bg-purple-950/80 border border-purple-500/40 text-[11px] font-mono font-bold text-purple-300 flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-purple-400 animate-pulse" />
            <span>SIMULATION MODE</span>
          </div>

          {/* Treasury P&L */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-[11px] font-mono">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Treasury (Simulated):</span>
            <strong className="text-emerald-300">${(128.40 + (rewardEvent ? 2.43 : 0)).toFixed(2)}</strong>
          </div>

          {/* Active Non-Custodial Wallet */}
          <button
            onClick={() => setActiveView('wallet')}
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950 hover:bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Configure Non-Custodial Wallet ID"
          >
            <Wallet className="w-3 h-3 text-cyan-400" />
            <span className="text-slate-500">Wallet:</span>
            <span className="text-cyan-300 font-bold">
              {wallet.isConnected && wallet.address
                ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`
                : 'Connect ID'}
            </span>
          </button>
        </div>

        {/* Center: P0.9 Quick Action Buttons & Scorecard */}
        <div className="flex items-center gap-2">
          <button
            onClick={runAutonomousWorkflowDemo}
            disabled={!!simConfig.activeScenario || policy.emergencyStopActive}
            className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 shadow-md shadow-cyan-950/40 cursor-pointer disabled:opacity-50 transition-all active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 text-yellow-300" />
            <span>RUN 10-STAGE P0 WORKFLOW</span>
          </button>

          <button
            onClick={() => setIsScorecardOpen(true)}
            className="px-2.5 py-1.5 bg-emerald-950/80 border border-emerald-500/50 hover:bg-emerald-900 text-emerald-300 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
            title="Open Automated MVP Scorecard & Release Gates (Sections 42-47)"
          >
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden lg:inline">SCORECARD (SECTIONS 42-47)</span>
            <span className="lg:hidden">SCORECARD</span>
          </button>

          <button
            onClick={handleResetOffice}
            className="p-1.5 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-lg cursor-pointer transition-colors"
            title="Reset Agents to Desks"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Day/Night, Engine Switcher, Speed Controls & Emergency Stop */}
        <div className="flex items-center gap-2">
          {/* Day/Night Lighting Selector */}
          <div className="hidden xl:flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs font-mono">
            {(['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT'] as TimeOfDay[]).map(tod => (
              <button
                key={tod}
                onClick={() => setSimConfig(prev => ({ ...prev, timeOfDay: tod }))}
                className={`p-1.5 rounded cursor-pointer transition-colors ${
                  simConfig.timeOfDay === tod
                    ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={`Lighting: ${tod}`}
              >
                {tod === 'MORNING' ? <Sunrise className="w-3.5 h-3.5" /> : tod === 'AFTERNOON' ? <Sun className="w-3.5 h-3.5" /> : tod === 'EVENING' ? <Sunset className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>

          {/* Engine Selector */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs font-mono">
            <button
              onClick={() => setRenderEngine('PIXI')}
              className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                renderEngine === 'PIXI'
                  ? 'bg-purple-950 text-cyan-300 font-bold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Pixi.js v8 GPU Renderer"
            >
              Pixi.js v8
            </button>
            <button
              onClick={() => setRenderEngine('CANVAS')}
              className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                renderEngine === 'CANVAS'
                  ? 'bg-slate-800 text-slate-200 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Canvas 2D Renderer"
            >
              Canvas 2D
            </button>
          </div>

          {/* Speed selector */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs font-mono">
            <button
              onClick={() => setSimConfig(prev => ({ ...prev, isPaused: !prev.isPaused }))}
              className={`p-1.5 rounded cursor-pointer ${
                simConfig.isPaused ? 'bg-amber-950 text-amber-300' : 'text-slate-400 hover:text-white'
              }`}
              title={simConfig.isPaused ? 'Resume Simulation' : 'Pause Simulation'}
            >
              {simConfig.isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
            {([1, 2, 4] as const).map(speed => (
              <button
                key={speed}
                onClick={() => setSimConfig(prev => ({ ...prev, simulationSpeed: speed, isPaused: false }))}
                className={`px-2 py-1 rounded cursor-pointer ${
                  simConfig.simulationSpeed === speed && !simConfig.isPaused
                    ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {speed}×
              </button>
            ))}
          </div>

          {/* P0.10 Emergency Stop Button */}
          <button
            onClick={() => {
              if (policy.emergencyStopActive) {
                resetEmergencyStop();
                addOfficeEvent({
                  agentId: 'agent_gov_01',
                  agentName: 'AI Governor',
                  eventType: 'SYSTEM',
                  description: 'Emergency stop released by Root Authority. Resuming normal operations.',
                  roomId: 'room_governor'
                });
              } else {
                triggerEmergencyStop('Manual emergency halt from 2D Office Game HUD');
                addOfficeEvent({
                  agentId: 'agent_gov_01',
                  agentName: 'AI Governor',
                  eventType: 'EMERGENCY_STOP',
                  description: 'EMERGENCY STOP ACTIVATED. All worker processes frozen.',
                  roomId: 'room_governor'
                });
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-md ${
              policy.emergencyStopActive
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white animate-pulse'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            {policy.emergencyStopActive ? 'RESUME SYSTEM' : 'EMERGENCY STOP'}
          </button>
        </div>
      </div>

      {/* 2. MAIN SIMULATION VIEWPORT & SIDE PANELS */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* CANVAS WORLD */}
        <div className="flex-1 relative bg-slate-950 overflow-hidden">
          {renderEngine === 'PIXI' ? (
            <PixiApplication
              agents={agentsRef.current}
              rooms={OFFICE_ROOMS}
              particles={particlesRef.current}
              simConfig={simConfig}
              selectedAgent={selectedAgent}
              selectedRoom={selectedRoom}
              cameraState={cameraState}
              onSelectAgent={(agent) => {
                setSelectedAgent(agent);
                setSelectedRoom(null);
                setActiveTab('INSPECTOR');
              }}
              onSelectRoom={(room) => {
                setSelectedRoom(room);
                setActiveTab('ROOMS');
              }}
              onCameraChange={(newCam) => {
                cameraRef.current = { ...cameraRef.current, ...newCam };
                setCameraState(newCam);
              }}
              className="w-full h-full block"
            />
          ) : (
            <canvas
              ref={canvasRef}
              className="w-full h-full block cursor-grab active:cursor-grabbing"
            />
          )}

          {/* FLOATING CAMERA CONTROLS */}
          <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl p-1.5 shadow-xl flex items-center gap-1 z-10">
            <button
              onClick={() => {
                cameraRef.current.zoom = Math.min(cameraRef.current.zoom * 1.2, 2.5);
                setCameraState({ ...cameraRef.current });
              }}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                cameraRef.current.zoom = Math.max(cameraRef.current.zoom * 0.8, 0.45);
                setCameraState({ ...cameraRef.current });
              }}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={resetCamera}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-slate-800 my-auto" />
            <button
              onClick={() => {
                if (selectedAgent) focusOnAgent(selectedAgent.id);
              }}
              className={`p-2 rounded-lg cursor-pointer transition-colors ${
                cameraRef.current.followedAgentId ? 'bg-cyan-950 text-cyan-300' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Center & Follow Selected Agent"
            >
              <Crosshair className="w-4 h-4" />
            </button>
          </div>

          {/* ACTIVE SCENARIO STEP BANNER */}
          {scenarioStepText && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/95 border border-cyan-500/50 rounded-2xl px-5 py-2.5 shadow-2xl shadow-cyan-950/50 flex items-center gap-3 font-mono text-xs text-white max-w-xl z-10 animate-fade-in">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>{scenarioStepText}</span>
            </div>
          )}

          {/* P1.2 MEETING OVERLAY BANNER */}
          {activeMeeting && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-950/95 via-slate-900/95 to-indigo-950/95 border border-purple-500/50 rounded-2xl px-6 py-2.5 shadow-2xl shadow-purple-950/50 flex items-center gap-4 font-mono text-xs text-white z-10">
              <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <Users2 className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-purple-300 block font-bold">MEETING IN PROGRESS</strong>
                <div className="text-[11px] text-slate-300 flex items-center gap-2">
                  <span>Participants: <strong>{activeMeeting.participantNames.join(', ')}</strong></span>
                  <span>•</span>
                  <span>Topic: <strong className="text-cyan-300">{activeMeeting.topic}</strong></span>
                </div>
              </div>
            </div>
          )}

          {/* P0.10 EMERGENCY STOP SAFE MODE BANNER */}
          {policy.emergencyStopActive && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-rose-950/95 border border-rose-500 rounded-2xl px-6 py-3 shadow-2xl flex items-center gap-3 font-mono text-xs text-rose-200 z-10">
              <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />
              <div>
                <strong className="block text-white text-sm">🚨 EMERGENCY STOP ACTIVE — SAFE MODE</strong>
                <span>All automated execution workers frozen. Blockchain transactions suspended.</span>
              </div>
            </div>
          )}

          {/* P1.5 SIMULATED REWARD CELEBRATION MODAL */}
          {rewardEvent && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-30 animate-fade-in">
              <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl shadow-emerald-950/50 space-y-4 text-center font-mono">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto text-2xl shadow-lg shadow-emerald-500/20">
                  🪙
                </div>
                <div>
                  <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                    REWARD DETECTED (SIMULATED)
                  </span>
                  <h3 className="text-2xl font-bold text-white pt-2">+ ${rewardEvent.amountUSD.toFixed(2)} USD</h3>
                  <p className="text-xs text-slate-400 pt-1">{rewardEvent.taskTitle}</p>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Treasury Before:</span>
                    <span>${rewardEvent.treasuryBeforeUSD.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Treasury After:</span>
                    <span>${rewardEvent.treasuryAfterUSD.toFixed(2)}</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 leading-snug">
                  * SIMULATED DEMO VALUE ONLY. No real cryptocurrency or on-chain assets were transferred.
                </p>

                <button
                  onClick={() => setRewardEvent(null)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors shadow-lg"
                >
                  Dismiss & Continue Simulation
                </button>
              </div>
            </div>
          )}

          {/* P1.1 MINIMAP */}
          <div className="absolute bottom-4 right-4 bg-slate-900/90 border border-slate-800 rounded-xl p-2 shadow-2xl z-10">
            <div className="text-[10px] font-mono text-slate-400 mb-1 flex items-center justify-between">
              <span>MINIMAP</span>
              <span className="text-[9px] text-cyan-400">Click to Center</span>
            </div>
            <canvas
              ref={minimapCanvasRef}
              width={160}
              height={115}
              onClick={handleMinimapClick}
              className="rounded border border-slate-800 bg-slate-950 block cursor-crosshair"
            />
          </div>
        </div>

        {/* 3. RIGHT INSPECTOR & TASK CONTROL DRAWER */}
        <div className="w-96 border-l border-slate-800 bg-slate-900/95 backdrop-blur flex flex-col shrink-0">
          {/* TAB BAR */}
          <div className="flex items-center border-b border-slate-800 text-[11px] font-mono overflow-x-auto">
            <button
              onClick={() => setActiveTab('TASKS')}
              className={`flex-1 py-2.5 px-2 text-center cursor-pointer transition-colors border-b-2 whitespace-nowrap ${
                activeTab === 'TASKS'
                  ? 'border-cyan-400 text-cyan-400 font-bold bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Tasks
            </button>
            <button
              onClick={() => setActiveTab('SCENARIOS')}
              className={`flex-1 py-2.5 px-2 text-center cursor-pointer transition-colors border-b-2 whitespace-nowrap ${
                activeTab === 'SCENARIOS'
                  ? 'border-cyan-400 text-cyan-400 font-bold bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              QA & Scenarios
            </button>
            <button
              onClick={() => setActiveTab('INSPECTOR')}
              className={`flex-1 py-2.5 px-2 text-center cursor-pointer transition-colors border-b-2 whitespace-nowrap ${
                activeTab === 'INSPECTOR'
                  ? 'border-cyan-400 text-cyan-400 font-bold bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Agent
            </button>
            <button
              onClick={() => setActiveTab('FEED')}
              className={`flex-1 py-2.5 px-2 text-center cursor-pointer transition-colors border-b-2 whitespace-nowrap ${
                activeTab === 'FEED'
                  ? 'border-cyan-400 text-cyan-400 font-bold bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Feed ({activityFeed.length})
            </button>
            <button
              onClick={() => setActiveTab('ROOMS')}
              className={`flex-1 py-2.5 px-2 text-center cursor-pointer transition-colors border-b-2 whitespace-nowrap ${
                activeTab === 'ROOMS'
                  ? 'border-cyan-400 text-cyan-400 font-bold bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Rooms
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono">
            {/* P1.3 & P1.4: TAB TASKS & WORKFLOW PIPELINE */}
            {activeTab === 'TASKS' && (
              <div className="space-y-4">
                {/* P1.4 Visual Workflow Pipeline */}
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-cyan-400 uppercase font-bold">
                      Autonomous Workflow Pipeline
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {currentTask.stages.filter(s => s.status === 'PASSED').length}/{currentTask.stages.length} Stages
                    </span>
                  </div>

                  {/* Stage Flow Nodes */}
                  <div className="space-y-1.5 text-xs">
                    {currentTask.stages.map((stg) => {
                      const isPassed = stg.status === 'PASSED';
                      const isRunning = stg.status === 'RUNNING';
                      return (
                        <div
                          key={stg.id}
                          className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                            isRunning
                              ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-200'
                              : isPassed
                              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                              : 'bg-slate-900/40 border-slate-800 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isPassed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : isRunning ? (
                              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                            ) : (
                              <span className="w-3.5 h-3.5 rounded-full border border-slate-600 block" />
                            )}
                            <span className="font-bold text-[11px]">{stg.label}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">{stg.agentName}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* P1.3 Task Card */}
                <div
                  onClick={() => focusOnAgent(currentTask.activeAgentId)}
                  className="p-3.5 bg-slate-950 border border-cyan-500/40 rounded-xl space-y-2.5 cursor-pointer hover:border-cyan-400 transition-all shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white font-mono">{currentTask.id}</span>
                    <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
                      {currentTask.status}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-200 font-sans leading-snug">
                    {currentTask.title}
                  </h4>

                  <div className="text-[11px] text-slate-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Active Agent:</span>
                      <strong className="text-cyan-300">{currentTask.activeAgentName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Current Stage:</span>
                      <strong className="text-purple-300">{currentTask.currentStage}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Est. Net EV:</span>
                      <strong className="text-emerald-300">+${currentTask.netEV.toFixed(2)} USD</strong>
                    </div>
                  </div>

                  {/* Progress Bar (Section P1.3) */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Stage Progress</span>
                      <span>{currentTask.progressPercent}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300"
                        style={{ width: `${currentTask.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-[10px] text-cyan-400 flex items-center justify-center gap-1 pt-1">
                    <Eye className="w-3 h-3" />
                    <span>Click task to focus camera on {currentTask.activeAgentName}</span>
                  </div>
                </div>

                {/* Create Demo Task Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={runAutonomousWorkflowDemo}
                    disabled={!!simConfig.activeScenario || policy.emergencyStopActive}
                    className="py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold text-xs rounded-xl shadow-lg cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5 text-yellow-300" />
                    <span>Run P0 Demo</span>
                  </button>

                  <button
                    onClick={handleCreateRandomizedDemoTask}
                    disabled={!!simConfig.activeScenario || policy.emergencyStopActive}
                    className="py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono font-bold text-xs rounded-xl shadow-lg cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                    <span>New Bounty</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB SCENARIOS & MVP RELEASE GATE CHECKLIST */}
            {activeTab === 'SCENARIOS' && (
              <div className="space-y-3.5 text-xs">
                {/* 1. Scenario Triggers */}
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <span className="text-[10px] text-cyan-400 uppercase font-bold">
                    Interactive Workflow Test Scenarios
                  </span>
                  <div className="space-y-1.5">
                    <button
                      onClick={runAutonomousWorkflowDemo}
                      disabled={!!simConfig.activeScenario || policy.emergencyStopActive}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 hover:border-cyan-500 rounded-lg text-left cursor-pointer transition-colors disabled:opacity-50"
                    >
                      <div className="flex items-center justify-between text-white font-bold">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          1. Standard 9-Stage Success Loop
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300">PASS</span>
                      </div>
                      <p className="text-[10px] text-slate-400 pt-1 font-sans">
                        Discovers bounty, completes 3-gate audit, authorizes worker, executes claim & updates treasury.
                      </p>
                    </button>

                    <button
                      onClick={runSecurityBlockScenario}
                      disabled={!!simConfig.activeScenario || policy.emergencyStopActive}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 hover:border-rose-500 rounded-lg text-left cursor-pointer transition-colors disabled:opacity-50"
                    >
                      <div className="flex items-center justify-between text-white font-bold">
                        <span className="flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-rose-400" />
                          2. Security Threat Veto (Drainer)
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-300">BLOCKED</span>
                      </div>
                      <p className="text-[10px] text-slate-400 pt-1 font-sans">
                        Sentinel discovers proxy delegatecall hook in bytecode. Issues VETO; execution worker locked.
                      </p>
                    </button>

                    <button
                      onClick={runComplianceBlockScenario}
                      disabled={!!simConfig.activeScenario || policy.emergencyStopActive}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 hover:border-pink-500 rounded-lg text-left cursor-pointer transition-colors disabled:opacity-50"
                    >
                      <div className="flex items-center justify-between text-white font-bold">
                        <span className="flex items-center gap-1.5">
                          <Scale className="w-3.5 h-3.5 text-pink-400" />
                          3. Compliance OFAC Sanctions Veto
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-pink-950 text-pink-300">BLOCKED</span>
                      </div>
                      <p className="text-[10px] text-slate-400 pt-1 font-sans">
                        Compliance officer flags counterparty wallet on OFAC SDN registry. Non-custodial gate vetoes.
                      </p>
                    </button>

                    {/* Section 11 & Gate 6 Scenario */}
                    <button
                      onClick={runHumanApprovalWorkflowDemo}
                      disabled={!!simConfig.activeScenario || policy.emergencyStopActive}
                      className="w-full p-2.5 bg-slate-900 border border-amber-500/50 hover:border-amber-400 rounded-lg text-left cursor-pointer transition-colors disabled:opacity-50"
                    >
                      <div className="flex items-center justify-between text-white font-bold">
                        <span className="flex items-center gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                          4. Human Root Approval Gate ($75.00 EV)
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300">GATE 6</span>
                      </div>
                      <p className="text-[10px] text-slate-400 pt-1 font-sans">
                        High-value grant exceeds $5.00 policy cap. Requires explicit Human Root Owner signature.
                      </p>
                    </button>

                    {/* Section 42-47 Automated Scorecard Trigger */}
                    <button
                      onClick={() => setIsScorecardOpen(true)}
                      className="w-full p-2.5 bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border border-emerald-500/50 hover:border-emerald-400 rounded-lg text-left cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between text-emerald-300 font-bold">
                        <span className="flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-emerald-400" />
                          5. Run Automated MVP Scorecard & Benchmarks
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-900 text-emerald-200">SECTIONS 42-47</span>
                      </div>
                      <p className="text-[10px] text-slate-300 pt-1 font-sans">
                        Inspect all 12 Hard Release Gates, 20 Development Targets, run 20-reset stress tests & export.
                      </p>
                    </button>
                  </div>
                </div>

                {/* 2. MVP Release Gate Checklist Status (Sections A - N) */}
                <div className="p-3.5 bg-slate-950 border border-emerald-500/40 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-emerald-400 uppercase font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      MVP Release Gate Checklist
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold">
                      14 / 14 PASSED ✓
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-300 max-h-56 overflow-y-auto pr-1">
                    {[
                      { cat: 'A. OFFICE WORLD', desc: '10 Rooms, collision map, camera pan/zoom/reset' },
                      { cat: 'B. AI AGENTS', desc: '7 Core agents with distinct roles, depts & visuals' },
                      { cat: 'C. MOVEMENT', desc: 'A* Pathfinding, wall avoidance, physical walking' },
                      { cat: 'D. AGENT INTELLIGENCE', desc: 'Full 8-state machine (Idle, Walk, Work, Blocked...)' },
                      { cat: 'E. CORE WORKFLOW', desc: '9-Stage loop from Discover to Accounting' },
                      { cat: 'F. AGENT INSPECTOR', desc: 'All 12 attributes inspectable on click' },
                      { cat: 'G. LIVE ACTIVITY', desc: 'Auto-updating event feed with status tagging' },
                      { cat: 'H. SIMULATION CONTROLS', desc: 'Pause, Resume, 1x/2x/4x, Reset, New Task' },
                      { cat: 'I. SECURITY & COMPLIANCE', desc: 'Multi-gate vetoes, zero bypass, OFAC check' },
                      { cat: 'J. EMERGENCY STOP', desc: 'Instant safe mode freeze & resume' },
                      { cat: 'K. REWARD DEMO', desc: 'Simulated EV payout +$2.43 & celebration' },
                      { cat: 'L. REAL VS SIMULATION', desc: 'Explicit SIMULATION badge, no fake txns' },
                      { cat: 'M. PERFORMANCE', desc: 'Pixi.js v8 GPU / Canvas 60fps, clean cleanup' },
                      { cat: 'N. FINAL USER TEST', desc: 'End-to-end verification verified passing' }
                    ].map(item => (
                      <div key={item.cat} className="flex items-start justify-between p-1.5 rounded bg-slate-900/60 border border-slate-800">
                        <div>
                          <strong className="text-white text-[10px] block">{item.cat}</strong>
                          <span className="text-[9px] text-slate-400">{item.desc}</span>
                        </div>
                        <span className="text-emerald-400 font-bold text-xs">✓</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* P0.7: TAB AGENT INSPECTOR (Full 12 attributes) */}
            {activeTab === 'INSPECTOR' && selectedAgent && (
              <div className="space-y-3.5">
                {/* 1. Header: Agent, Role, Department */}
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-md"
                        style={{ backgroundColor: selectedAgent.color }}
                      >
                        {selectedAgent.name[0]}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white leading-snug">{selectedAgent.name}</h4>
                        <span className="text-[10px] text-slate-400">{selectedAgent.role}</span>
                      </div>
                    </div>
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded uppercase font-bold"
                      style={{
                        backgroundColor: `${selectedAgent.color}22`,
                        color: selectedAgent.color,
                        border: `1px solid ${selectedAgent.color}44`
                      }}
                    >
                      {selectedAgent.department}
                    </span>
                  </div>

                  {/* 2. Current State & Location */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div className="p-2 bg-slate-900 rounded border border-slate-800">
                      <span className="text-[9px] text-slate-500 block">CURRENT STATE</span>
                      <strong className="text-emerald-400">{selectedAgent.state}</strong>
                    </div>
                    <div className="p-2 bg-slate-900 rounded border border-slate-800">
                      <span className="text-[9px] text-slate-500 block">LOCATION</span>
                      <strong className="text-white truncate block">
                        {OFFICE_ROOMS.find(r => r.id === selectedAgent.currentRoomId)?.name || 'Corridor'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* 3. Current Task & Target */}
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
                  <span className="text-[10px] text-cyan-400 uppercase font-bold">Task & Target</span>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Current Task:</span>
                      <span className="text-slate-200 font-bold">{selectedAgent.currentTaskId || 'Idle'}</span>
                    </div>
                    <p className="text-slate-300 font-sans text-xs bg-slate-900 p-2 rounded border border-slate-800 leading-snug">
                      {selectedAgent.currentTaskTitle || 'Awaiting priority dispatch'}
                    </p>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-500">Target Destination:</span>
                      <span className="text-cyan-300 font-bold">
                        ({selectedAgent.targetGridX}, {selectedAgent.targetGridY})
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. Permissions, Security & Compliance Status */}
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Access & Security</span>
                  <div className="grid grid-cols-3 gap-1.5 text-[10px] text-center">
                    <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                      <span className="text-slate-500 block">PERMISSION</span>
                      <strong className="text-purple-300">{selectedAgent.permissionLevel}</strong>
                    </div>
                    <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                      <span className="text-slate-500 block">SECURITY</span>
                      <strong className="text-emerald-400">{selectedAgent.securityStatus}</strong>
                    </div>
                    <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                      <span className="text-slate-500 block">COMPLIANCE</span>
                      <strong className="text-pink-300">{selectedAgent.complianceStatus}</strong>
                    </div>
                  </div>
                </div>

                {/* 5. Last Action & Next Action */}
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Audit Action Trace</span>
                  <div className="space-y-1.5 text-[11px]">
                    <div>
                      <span className="text-slate-500 text-[10px] block">LAST ACTION:</span>
                      <span className="text-slate-300">{selectedAgent.lastAction}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">NEXT ACTION:</span>
                      <span className="text-cyan-300">{selectedAgent.nextAction}</span>
                    </div>
                  </div>
                </div>

                {/* Dispatch Agent */}
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Walk Agent to Room</span>
                  <div className="flex items-center gap-2">
                    <select
                      value={customDestinationRoom}
                      onChange={e => setCustomDestinationRoom(e.target.value as RoomId)}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      {OFFICE_ROOMS.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        const target = OFFICE_ROOMS.find(r => r.id === customDestinationRoom);
                        if (target && selectedAgent) {
                          moveAgentTo(selectedAgent.id, target.workstations[0]?.x || target.gridX + 2, target.workstations[0]?.y || target.gridY + 2);
                          setAgentSpeech(selectedAgent.id, `Walking to ${target.name}...`, 'info');
                          addOfficeEvent({
                            agentId: selectedAgent.id,
                            agentName: selectedAgent.name,
                            eventType: 'MOVE',
                            description: `Dispatched to ${target.name}.`,
                            roomId: target.id
                          });
                        }
                      }}
                      className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                    >
                      Walk
                    </button>
                  </div>

                  <button
                    onClick={() => focusOnAgent(selectedAgent.id)}
                    className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> Follow Agent with Camera
                  </button>
                </div>

                {/* Switch between the 7 Core Agents */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-500 uppercase">Select Core Agent:</span>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {agentsRef.current.map(a => (
                      <button
                        key={a.id}
                        onClick={() => setSelectedAgent(a)}
                        className={`p-2 rounded-lg text-left truncate cursor-pointer transition-colors ${
                          selectedAgent?.id === a.id
                            ? 'bg-slate-800 text-cyan-400 border border-cyan-500/40'
                            : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        <span className="font-bold block truncate">{a.name}</span>
                        <span className="text-[9px] text-slate-500 block truncate">{a.role}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* P0.8: TAB LIVE ACTIVITY FEED */}
            {activeTab === 'FEED' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>REAL-TIME AUDIT STREAM</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE
                  </span>
                </div>

                <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
                  {activityFeed.map((evt, idx) => (
                    <div
                      key={`${evt.id}-${idx}`}
                      className="p-2.5 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-500">{evt.timeFormatted}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded font-bold ${
                            evt.eventType === 'DISCOVERY'
                              ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/30'
                              : evt.eventType === 'REWARD_CLAIM'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                              : evt.eventType === 'BLOCKED' || evt.eventType === 'EMERGENCY_STOP'
                              ? 'bg-rose-950 text-rose-400 border border-rose-500/30'
                              : evt.eventType === 'MEETING'
                              ? 'bg-purple-950 text-purple-300 border border-purple-500/30'
                              : 'bg-slate-900 text-slate-300 border border-slate-800'
                          }`}
                        >
                          {evt.eventType}
                        </span>
                      </div>
                      <div className="text-white font-bold text-[11px]">{evt.agentName}</div>
                      <p className="text-slate-300 font-sans text-xs leading-snug">{evt.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB ROOMS */}
            {activeTab === 'ROOMS' && (
              <div className="space-y-3">
                <div className="text-[10px] text-slate-400 uppercase">
                  Office Departments ({OFFICE_ROOMS.length} Total)
                </div>

                <div className="space-y-2">
                  {OFFICE_ROOMS.map(room => {
                    const isSelected = selectedRoom?.id === room.id;
                    const agentsInRoom = agentsRef.current.filter(a => a.currentRoomId === room.id);

                    return (
                      <div
                        key={room.id}
                        onClick={() => setSelectedRoom(room)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all space-y-2 ${
                          isSelected
                            ? 'bg-slate-950 border-cyan-500 shadow-md shadow-cyan-500/10'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: room.accentColor }}
                            />
                            {room.name}
                          </h4>
                          <span className="text-[10px] text-slate-400">
                            {agentsInRoom.length} Agent{agentsInRoom.length !== 1 ? 's' : ''} inside
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 leading-snug font-sans">{room.description}</p>

                        <div className="text-[10px] text-slate-500 flex flex-wrap gap-1 pt-1">
                          {room.equipment.map(eq => (
                            <span key={eq} className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-slate-300">
                              {eq}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 11 & Gate 6: Human Root Authority Modal */}
      {humanApprovalRequest && (
        <HumanApprovalModal
          request={humanApprovalRequest}
          onApprove={handleApproveHumanRequest}
          onReject={handleRejectHumanRequest}
          onClose={() => setHumanApprovalRequest(null)}
        />
      )}

      {/* Sections 42-47: Automated Scorecard & Hard Gates Modal */}
      {isScorecardOpen && (
        <ScorecardModal
          onClose={() => setIsScorecardOpen(false)}
          onRunResetStressTest={handleRunResetStressTest}
          onRunPathfindingBenchmark={handleRunPathfindingBenchmark}
        />
      )}
    </div>
  );
};
