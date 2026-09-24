/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import {
  RoomId,
  OfficeRoom,
  OfficeAgentVisual,
  OfficeParticle,
  OfficeSimConfig
} from '../types/office';
import { TILE_SIZE, GRID_COLS, GRID_ROWS } from '../services/OfficeEngine';
import { Loader2 } from 'lucide-react';

interface PixiApplicationProps {
  agents: OfficeAgentVisual[];
  rooms: OfficeRoom[];
  particles: OfficeParticle[];
  simConfig: OfficeSimConfig;
  selectedAgent: OfficeAgentVisual | null;
  selectedRoom: OfficeRoom | null;
  cameraState: {
    x: number;
    y: number;
    zoom: number;
    followedAgentId: string | null;
  };
  onSelectAgent: (agent: OfficeAgentVisual) => void;
  onSelectRoom: (room: OfficeRoom) => void;
  onCameraChange?: (newCam: { x: number; y: number; zoom: number; followedAgentId: string | null }) => void;
  className?: string;
}

export const PixiApplication: React.FC<PixiApplicationProps> = ({
  agents,
  rooms,
  particles,
  simConfig,
  selectedAgent,
  selectedRoom,
  cameraState,
  onSelectAgent,
  onSelectRoom,
  onCameraChange,
  className = 'w-full h-full'
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pixiAppRef = useRef<Application | null>(null);
  const worldContainerRef = useRef<Container | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Dragging / Pan state ref
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const cameraRef = useRef(cameraState);

  // Keep camera ref synced
  useEffect(() => {
    cameraRef.current = cameraState;
  }, [cameraState]);

  // Initialize Pixi.js v8 Application
  useEffect(() => {
    let isCancelled = false;
    const parent = containerRef.current;
    if (!parent) return;

    const initPixi = async () => {
      const app = new Application();
      await app.init({
        resizeTo: parent,
        backgroundColor: 0x020617,
        antialias: true,
        autoDensity: true,
        resolution: window.devicePixelRatio || 1
      });

      if (isCancelled) {
        app.destroy(true, { children: true });
        return;
      }

      pixiAppRef.current = app;
      parent.appendChild(app.canvas);

      // Create main world container that handles pan/zoom
      const world = new Container();
      worldContainerRef.current = world;
      app.stage.addChild(world);

      setIsInitialized(true);
    };

    initPixi();

    return () => {
      isCancelled = true;
      if (pixiAppRef.current) {
        pixiAppRef.current.destroy(true, { children: true });
        pixiAppRef.current = null;
      }
    };
  }, []);

  // Pixi render loop & layers
  useEffect(() => {
    const app = pixiAppRef.current;
    const world = worldContainerRef.current;
    if (!app || !world || !isInitialized) return;

    // Layer Containers
    world.removeChildren();

    const gridLayer = new Graphics();
    const roomsLayer = new Container();
    const agentsLayer = new Container();
    const particlesLayer = new Graphics();
    const ambientLayer = new Graphics();

    world.addChild(gridLayer);
    world.addChild(roomsLayer);
    world.addChild(agentsLayer);
    world.addChild(particlesLayer);
    world.addChild(ambientLayer);

    // 1. Draw grid background
    gridLayer.clear();
    for (let x = 0; x <= GRID_COLS * TILE_SIZE; x += TILE_SIZE) {
      gridLayer.moveTo(x, 0).lineTo(x, GRID_ROWS * TILE_SIZE).stroke({ width: 1, color: 0x1e293b, alpha: 0.35 });
    }
    for (let y = 0; y <= GRID_ROWS * TILE_SIZE; y += TILE_SIZE) {
      gridLayer.moveTo(0, y).lineTo(GRID_COLS * TILE_SIZE, y).stroke({ width: 1, color: 0x1e293b, alpha: 0.35 });
    }

    // 2. Build Room Graphics
    rooms.forEach(room => {
      const rx = room.gridX * TILE_SIZE;
      const ry = room.gridY * TILE_SIZE;
      const rw = room.width * TILE_SIZE;
      const rh = room.height * TILE_SIZE;

      const roomGroup = new Container();
      roomGroup.eventMode = 'static';
      roomGroup.cursor = 'pointer';
      roomGroup.on('pointerdown', () => onSelectRoom(room));

      const roomGfx = new Graphics();
      const colorNum = parseInt(room.color.replace('#', '0x'), 16) || 0x1e1b4b;
      const accentNum = parseInt(room.accentColor.replace('#', '0x'), 16) || 0x38bdf8;
      const isSelected = selectedRoom?.id === room.id;

      // Floor
      roomGfx.rect(rx, ry, rw, rh).fill({ color: colorNum });
      roomGfx.rect(rx, ry, rw, rh).stroke({ width: isSelected ? 3 : 1.5, color: isSelected ? 0x38bdf8 : accentNum });

      // Title bar header
      roomGfx.rect(rx + 4, ry + 4, rw - 8, 20).fill({ color: 0x0f172a, alpha: 0.85 });

      // Doorway
      const dx = room.doorPosition.x * TILE_SIZE;
      const dy = room.doorPosition.y * TILE_SIZE;
      roomGfx.rect(dx, dy, TILE_SIZE, TILE_SIZE).fill({ color: 0x0f172a });
      roomGfx.rect(dx, dy, TILE_SIZE, TILE_SIZE).stroke({ width: 1, color: 0x38bdf8 });

      // Workstations
      room.workstations.forEach(ws => {
        const wx = ws.x * TILE_SIZE;
        const wy = ws.y * TILE_SIZE;
        roomGfx.rect(wx + 2, wy + 2, TILE_SIZE - 4, TILE_SIZE - 4).fill({ color: 0x0f172a });
        roomGfx.rect(wx + 2, wy + 2, TILE_SIZE - 4, TILE_SIZE - 4).stroke({ width: 1, color: accentNum });
        roomGfx.rect(wx + 8, wy + 8, TILE_SIZE - 16, TILE_SIZE - 18).fill({ color: 0x38bdf8 });
      });

      roomGroup.addChild(roomGfx);

      // Room Title Text
      const text = new Text({
        text: room.name.toUpperCase(),
        style: new TextStyle({
          fontFamily: 'monospace',
          fontSize: 10,
          fontWeight: 'bold',
          fill: accentNum
        })
      });
      text.x = rx + 10;
      text.y = ry + 8;
      roomGroup.addChild(text);

      roomsLayer.addChild(roomGroup);
    });

    // Ticker Update loop
    const tickerCallback = () => {
      // Update camera follow
      if (cameraRef.current.followedAgentId) {
        const followed = agents.find(a => a.id === cameraRef.current.followedAgentId);
        if (followed && parent) {
          const targetCamX = app.screen.width / 2 - (followed.pixelX + 16) * cameraRef.current.zoom;
          const targetCamY = app.screen.height / 2 - (followed.pixelY + 16) * cameraRef.current.zoom;
          cameraRef.current.x += (targetCamX - cameraRef.current.x) * 0.1;
          cameraRef.current.y += (targetCamY - cameraRef.current.y) * 0.1;
          if (onCameraChange) onCameraChange({ ...cameraRef.current });
        }
      }

      world.x = cameraRef.current.x;
      world.y = cameraRef.current.y;
      world.scale.set(cameraRef.current.zoom);

      // Redraw agents dynamically
      agentsLayer.removeChildren();
      const nowMs = Date.now();

      agents.forEach(agent => {
        const agentGroup = new Container();
        agentGroup.eventMode = 'static';
        agentGroup.cursor = 'pointer';
        agentGroup.on('pointerdown', (e) => {
          e.stopPropagation();
          onSelectAgent(agent);
        });

        const agGfx = new Graphics();
        const ax = agent.pixelX;
        const ay = agent.pixelY;
        const isSelected = selectedAgent?.id === agent.id;
        const agentColor = parseInt(agent.color.replace('#', '0x'), 16) || 0x8b5cf6;
        const headColor = parseInt(agent.headColor.replace('#', '0x'), 16) || 0xc4b5fd;

        // Shadow
        agGfx.ellipse(ax + 16, ay + 26, 10, 5).fill({ color: 0x000000, alpha: 0.45 });

        // Selection ring
        if (isSelected) {
          const pulse = Math.sin(nowMs / 200) * 2;
          agGfx.circle(ax + 16, ay + 16, 18 + pulse).stroke({ width: 2, color: 0x38bdf8 });
        }

        // Bobbing
        const bob = agent.state === 'WALKING' ? Math.sin(agent.animationFrame * Math.PI) * 2 : 0;

        // Uniform Body
        agGfx.rect(ax + 8, ay + 12 + bob, 16, 14).fill({ color: agentColor });
        agGfx.rect(ax + 8, ay + 12 + bob, 16, 14).stroke({ width: 1, color: 0x0f172a });

        // Head
        agGfx.circle(ax + 16, ay + 8 + bob, 7).fill({ color: headColor });
        agGfx.circle(ax + 16, ay + 8 + bob, 7).stroke({ width: 1, color: 0x0f172a });

        // Eyes / Facing
        if (agent.facing === 'down') {
          agGfx.rect(ax + 13, ay + 7 + bob, 2, 2).fill({ color: 0x0f172a });
          agGfx.rect(ax + 17, ay + 7 + bob, 2, 2).fill({ color: 0x0f172a });
        } else if (agent.facing === 'left') {
          agGfx.rect(ax + 11, ay + 7 + bob, 2, 2).fill({ color: 0x0f172a });
        } else if (agent.facing === 'right') {
          agGfx.rect(ax + 19, ay + 7 + bob, 2, 2).fill({ color: 0x0f172a });
        }

        // Department Badge Dot
        agGfx.circle(ax + 16, ay + 18 + bob, 3).fill({ color: agentColor });

        // Name tag background
        agGfx.rect(ax - 12, ay - 8 + bob, 56, 11).fill({ color: 0x0f172a, alpha: 0.9 });
        agGfx.rect(ax - 12, ay - 8 + bob, 56, 11).stroke({
          width: 1,
          color: isSelected ? 0x38bdf8 : 0x94a3b8,
          alpha: isSelected ? 1 : 0.4
        });

        agentGroup.addChild(agGfx);

        // Name text
        const nameText = new Text({
          text: agent.name.slice(0, 10),
          style: new TextStyle({
            fontFamily: 'monospace',
            fontSize: 7.5,
            fontWeight: 'bold',
            fill: 0xffffff
          })
        });
        nameText.x = ax + 16 - nameText.width / 2;
        nameText.y = ay - 9 + bob;
        agentGroup.addChild(nameText);

        // Speech Bubble if active
        if (agent.speechBubble && agent.speechBubble.expiresAt > nowMs) {
          const bubbleText = agent.speechBubble.text;
          const truncated = bubbleText.length > 28 ? bubbleText.slice(0, 26) + '...' : bubbleText;
          const bubbleWidth = Math.min(Math.max(truncated.length * 5.5 + 16, 70), 160);
          const bubbleX = ax + 16 - bubbleWidth / 2;
          const bubbleY = ay - 32 + bob;

          const bubbleGfx = new Graphics();
          const bubbleBg =
            agent.speechBubble.type === 'error'
              ? 0x9f1239
              : agent.speechBubble.type === 'success'
              ? 0x065f46
              : agent.speechBubble.type === 'warning'
              ? 0x92400e
              : 0x0f172a;
          const bubbleBorder =
            agent.speechBubble.type === 'error'
              ? 0xf43f5e
              : agent.speechBubble.type === 'success'
              ? 0x34d399
              : agent.speechBubble.type === 'warning'
              ? 0xfbbf24
              : 0x38bdf8;

          bubbleGfx.rect(bubbleX, bubbleY, bubbleWidth, 20).fill({ color: bubbleBg, alpha: 0.95 });
          bubbleGfx.rect(bubbleX, bubbleY, bubbleWidth, 20).stroke({ width: 1.5, color: bubbleBorder });

          // Pointer
          bubbleGfx.moveTo(ax + 12, bubbleY + 20).lineTo(ax + 16, bubbleY + 24).lineTo(ax + 20, bubbleY + 20).fill({ color: bubbleBg });

          agentGroup.addChild(bubbleGfx);

          const speech = new Text({
            text: truncated,
            style: new TextStyle({
              fontFamily: 'sans-serif',
              fontSize: 8,
              fontWeight: 'bold',
              fill: 0xffffff
            })
          });
          speech.x = bubbleX + (bubbleWidth - speech.width) / 2;
          speech.y = bubbleY + 5;
          agentGroup.addChild(speech);
        }

        agentsLayer.addChild(agentGroup);
      });

      // Redraw particles
      particlesLayer.clear();
      particles.forEach(p => {
        const pColor = parseInt(p.color.replace('#', '0x'), 16) || 0xfbbf24;
        if (p.type === 'coin') {
          particlesLayer.circle(p.x, p.y, p.size).fill({ color: pColor, alpha: p.alpha });
        } else {
          particlesLayer.rect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size).fill({ color: pColor, alpha: p.alpha });
        }
      });

      // Lighting Overlay
      ambientLayer.clear();
      if (simConfig.emergencyStopActive) {
        const sirenPulse = Math.sin(nowMs / 200) * 0.25 + 0.35;
        ambientLayer.rect(0, 0, GRID_COLS * TILE_SIZE, GRID_ROWS * TILE_SIZE).fill({ color: 0xe11d48, alpha: sirenPulse });
      } else if (simConfig.timeOfDay === 'MORNING') {
        ambientLayer.rect(0, 0, GRID_COLS * TILE_SIZE, GRID_ROWS * TILE_SIZE).fill({ color: 0x0ea5e9, alpha: 0.05 });
      } else if (simConfig.timeOfDay === 'EVENING') {
        ambientLayer.rect(0, 0, GRID_COLS * TILE_SIZE, GRID_ROWS * TILE_SIZE).fill({ color: 0x9333ea, alpha: 0.12 });
      } else if (simConfig.timeOfDay === 'NIGHT') {
        ambientLayer.rect(0, 0, GRID_COLS * TILE_SIZE, GRID_ROWS * TILE_SIZE).fill({ color: 0x020617, alpha: 0.45 });
      }
    };

    app.ticker.add(tickerCallback);

    return () => {
      if (app && app.ticker) {
        app.ticker.remove(tickerCallback);
      }
    };
  }, [agents, rooms, particles, simConfig, selectedAgent, selectedRoom, isInitialized, onSelectAgent, onSelectRoom, onCameraChange]);

  // Drag pan handlers on the Pixi wrapper
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX - cameraRef.current.x,
      y: e.clientY - cameraRef.current.y
    };
    cameraRef.current.followedAgentId = null;
    if (onCameraChange) onCameraChange({ ...cameraRef.current });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    cameraRef.current.x = e.clientX - dragStartRef.current.x;
    cameraRef.current.y = e.clientY - dragStartRef.current.y;
    if (onCameraChange) onCameraChange({ ...cameraRef.current });
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.min(Math.max(cameraRef.current.zoom * zoomDelta, 0.45), 2.5);

    const parent = containerRef.current;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    cameraRef.current.x = mouseX - (mouseX - cameraRef.current.x) * (newZoom / cameraRef.current.zoom);
    cameraRef.current.y = mouseY - (mouseY - cameraRef.current.y) * (newZoom / cameraRef.current.zoom);
    cameraRef.current.zoom = newZoom;

    if (onCameraChange) onCameraChange({ ...cameraRef.current });
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      className={`relative select-none overflow-hidden cursor-grab active:cursor-grabbing ${className}`}
    >
      {!isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur z-20">
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 font-mono text-xs">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            <span>Initializing Pixi.js 2D Game Engine...</span>
          </div>
        </div>
      )}
    </div>
  );
};
