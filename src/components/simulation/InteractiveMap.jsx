import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';


// Las Vegas GP track simplified coordinates
const LAS_VEGAS_TRACK = [
  { x: 100, y: 200 }, { x: 150, y: 180 }, { x: 200, y: 170 }, { x: 250, y: 160 },
  { x: 300, y: 155 }, { x: 350, y: 160 }, { x: 400, y: 180 }, { x: 450, y: 210 },
  { x: 480, y: 250 }, { x: 490, y: 300 }, { x: 480, y: 350 }, { x: 450, y: 390 },
  { x: 400, y: 420 }, { x: 350, y: 430 }, { x: 300, y: 425 }, { x: 250, y: 410 },
  { x: 200, y: 380 }, { x: 150, y: 340 }, { x: 120, y: 290 }, { x: 100, y: 240 }
];

const SECTORS = [
  { id: 1, start: 0, end: 7, color: 'rgba(6, 182, 212, 0.2)' },
  { id: 2, start: 7, end: 14, color: 'rgba(168, 85, 247, 0.2)' },
  { id: 3, start: 14, end: 20, color: 'rgba(236, 72, 153, 0.2)' }
];

export default function InteractiveMap({ agents = [], events = [], onAgentClick, mode = 'formula_e' }) {
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [hoveredAgent, setHoveredAgent] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const render = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.save();
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      // Draw track
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      LAS_VEGAS_TRACK.forEach((point, i) => {
        if (i === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.closePath();
      ctx.stroke();

      // Draw track glow
      ctx.shadowColor = 'rgba(6, 182, 212, 0.5)';
      ctx.shadowBlur = 15;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw sectors
      SECTORS.forEach(sector => {
        ctx.beginPath();
        ctx.fillStyle = sector.color;
        for (let i = sector.start; i <= sector.end && i < LAS_VEGAS_TRACK.length; i++) {
          const point = LAS_VEGAS_TRACK[i];
          if (i === sector.start) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
        }
        ctx.fill();
      });

      // Draw start/finish line
      const startPoint = LAS_VEGAS_TRACK[0];
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(startPoint.x - 10, startPoint.y - 10);
      ctx.lineTo(startPoint.x + 10, startPoint.y + 10);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw event zones
      events.forEach(event => {
        if (event && event.position && event.position.x !== undefined && event.position.y !== undefined) {
          ctx.beginPath();
          ctx.arc(event.position.x, event.position.y, 20, 0, Math.PI * 2);
          ctx.fillStyle = event.severity > 0.7 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(251, 191, 36, 0.3)';
          ctx.fill();
          ctx.strokeStyle = event.severity > 0.7 ? 'rgba(239, 68, 68, 0.8)' : 'rgba(251, 191, 36, 0.8)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });

      // Draw agents
      agents.forEach(agent => {
        if (!agent || !agent.position || agent.position.x === undefined || agent.position.y === undefined) return;

        const x = agent.position.x;
        const y = agent.position.y;
        const heading = agent.position.heading || 0;
        const isSelected = selectedAgent === agent.agent_number;

        // Agent glow
        if (isSelected) {
          ctx.shadowColor = 'rgba(6, 182, 212, 0.8)';
          ctx.shadowBlur = 20;
        }

        // Agent body
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(heading * Math.PI / 180);

        // Draw velocity vector
        const speed = agent.telemetry?.speed || 0;
        const vectorLength = Math.min(speed / 5, 30);
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(vectorLength, 0);
        ctx.stroke();

        // Draw car
        const health = agent.mechanical_health || 100;
        const healthColor = health > 70 ? '#10b981' : health > 40 ? '#f59e0b' : '#ef4444';
        
        ctx.fillStyle = healthColor;
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Agent number
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(agent.agent_number || '', 0, 2);

        ctx.restore();
        ctx.shadowBlur = 0;

        // Health bar above agent
        if (health < 100) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.fillRect(x - 15, y - 15, 30, 3);
          ctx.fillStyle = healthColor;
          ctx.fillRect(x - 15, y - 15, 30 * (health / 100), 3);
        }
      });

      ctx.restore();
    };

    render();
    animationRef.current = requestAnimationFrame(render);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [agents, events, zoom, pan, selectedAgent]);

  const handleAgentClickCanvas = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    // Find clicked agent
    const clickedAgent = agents.find(agent => {
      if (!agent || !agent.position || agent.position.x === undefined || agent.position.y === undefined) return false;
      const dx = x - agent.position.x;
      const dy = y - agent.position.y;
      return Math.sqrt(dx * dx + dy * dy) < 15;
    });

    if (clickedAgent) {
      setSelectedAgent(clickedAgent.agent_number);
      onAgentClick?.(clickedAgent);
    } else {
      setSelectedAgent(null);
    }
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });

    // Find hovered agent
    const hoveredAgent = agents.find(agent => {
      if (!agent || !agent.position || agent.position.x === undefined || agent.position.y === undefined) return false;
      const dx = x - agent.position.x;
      const dy = y - agent.position.y;
      return Math.sqrt(dx * dx + dy * dy) < 15;
    });

    setHoveredAgent(hoveredAgent || null);
  };

  return (
    <div className="h-full flex flex-col bg-[#0A0E27]/80 backdrop-blur-xl rounded-xl border border-cyan-400/20 shadow-2xl shadow-cyan-500/10 overflow-hidden">
      {/* Map Controls */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-cyan-400/20 bg-gradient-to-r from-cyan-500/5 to-purple-500/5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-white/70">LAS VEGAS GP</span>
          <span className="text-xs text-white/40">•</span>
          <motion.span 
            className="text-xs text-cyan-400 font-medium"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            LIVE
          </motion.span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center gap-0.5">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setZoom(Math.max(0.5, zoom - 0.2))}
              className="h-7 w-7 p-0 hover:bg-cyan-500/10 hover:text-cyan-400"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setZoom(Math.min(3, zoom + 0.2))}
              className="h-7 w-7 p-0 hover:bg-cyan-500/10 hover:text-cyan-400"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
              className="h-7 w-7 p-0 hover:bg-cyan-500/10 hover:text-cyan-400"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          onClick={handleAgentClickCanvas}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredAgent(null)}
          className="w-full h-full cursor-pointer"
        />

        {/* Sector Legend */}
        <div className="absolute top-4 left-4 space-y-2">
          {SECTORS.map(sector => (
            <div
              key={sector.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10 text-xs"
            >
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: sector.color.replace('0.2', '0.8') }}
              />
              <span className="text-gray-300">Sector {sector.id}</span>
            </div>
          ))}
        </div>

        {/* Event Count */}
        {events.length > 0 && (
          <div className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-xs">
            <span className="text-red-400 font-semibold">{events.length} Active Events</span>
          </div>
        )}

        {/* Agent Hover Tooltip */}
        {hoveredAgent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute pointer-events-none"
            style={{
              left: mousePos.x + 15,
              top: mousePos.y + 15
            }}
          >
            <div className="px-3 py-2 rounded-lg bg-black/80 backdrop-blur-md border border-cyan-400/40 shadow-xl shadow-cyan-500/20">
              <div className="text-sm font-bold text-cyan-400">{hoveredAgent.agent_number}</div>
              <div className="text-xs text-white/70 mt-1 space-y-0.5">
                <div className="font-mono">Lap {hoveredAgent.position?.lap || 0}</div>
                <div className="font-mono text-cyan-400">
                  {hoveredAgent.last_lap_time ? `${hoveredAgent.last_lap_time.toFixed(3)}s` : 'No lap time'}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>




    </div>
  );
}