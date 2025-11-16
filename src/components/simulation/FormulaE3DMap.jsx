import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

// Las Vegas GP track coordinates (same as existing)
const TRACK_PATH = [
  { x: 100, y: 200 }, { x: 150, y: 180 }, { x: 200, y: 170 }, { x: 250, y: 160 },
  { x: 300, y: 155 }, { x: 350, y: 160 }, { x: 400, y: 180 }, { x: 450, y: 210 },
  { x: 480, y: 250 }, { x: 490, y: 300 }, { x: 480, y: 350 }, { x: 450, y: 390 },
  { x: 400, y: 420 }, { x: 350, y: 430 }, { x: 300, y: 425 }, { x: 250, y: 410 },
  { x: 200, y: 380 }, { x: 150, y: 340 }, { x: 120, y: 290 }, { x: 100, y: 240 }
];

export default function FormulaE3DMap({ agents = [], events = [], onAgentClick }) {
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [trackMetadata, setTrackMetadata] = useState(null);
  const animationRef = useRef(null);

  useEffect(() => {
    // Load track metadata
    base44.entities.TrackMetadata.filter({ track_id: 'las_vegas_gp' })
      .then(data => setTrackMetadata(data[0]))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !trackMetadata) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const hints = trackMetadata.rendering_hints || {};
    const perspectiveAngle = hints.perspective_angle || 25;
    const elevationScale = hints.elevation_scale || 15;

    const render = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.save();
      ctx.translate(pan.x + rect.width / 2, pan.y + rect.height / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-300, -300);

      // Apply 3D perspective transform
      const apply3D = (x, y, z = 0) => {
        const scale = 1 - (y / 1000) * 0.3;
        const offsetY = y * Math.sin(perspectiveAngle * Math.PI / 180) * 0.3;
        return {
          x: x * scale,
          y: (y - offsetY + z * elevationScale) * scale
        };
      };

      // Draw track shadows first (depth)
      ctx.globalAlpha = hints.shadow_intensity || 0.3;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      TRACK_PATH.forEach((point, i) => {
        const sector = trackMetadata.sectors?.find(s => i >= s.start_index && i <= s.end_index);
        const elevation = sector?.elevation_delta || 0;
        const p3d = apply3D(point.x, point.y, elevation - 3);
        if (i === 0) ctx.moveTo(p3d.x, p3d.y);
        else ctx.lineTo(p3d.x, p3d.y);
      });
      ctx.closePath();
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Draw track with sector colors and elevation
      trackMetadata.sectors?.forEach(sector => {
        ctx.beginPath();
        ctx.strokeStyle = sector.color;
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        for (let i = sector.start_index; i <= sector.end_index && i < TRACK_PATH.length; i++) {
          const point = TRACK_PATH[i];
          const p3d = apply3D(point.x, point.y, sector.elevation_delta || 0);
          if (i === sector.start_index) ctx.moveTo(p3d.x, p3d.y);
          else ctx.lineTo(p3d.x, p3d.y);
        }
        ctx.stroke();

        // Glow effect
        ctx.shadowColor = sector.color;
        ctx.shadowBlur = 15 * (hints.glow_intensity || 0.8);
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      // Draw track boundaries (kerbs)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      TRACK_PATH.forEach((point, i) => {
        if (i === 0) return;
        const prev = TRACK_PATH[i - 1];
        const dx = point.x - prev.x;
        const dy = point.y - prev.y;
        const angle = Math.atan2(dy, dx);
        const offset = 12;
        
        const p1 = apply3D(point.x + Math.cos(angle + Math.PI / 2) * offset, point.y + Math.sin(angle + Math.PI / 2) * offset);
        const p2 = apply3D(point.x - Math.cos(angle + Math.PI / 2) * offset, point.y - Math.sin(angle + Math.PI / 2) * offset);
        
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // Draw start/finish line
      const startPoint = apply3D(TRACK_PATH[0].x, TRACK_PATH[0].y);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(startPoint.x - 15, startPoint.y - 15);
      ctx.lineTo(startPoint.x + 15, startPoint.y + 15);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw turn numbers
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      trackMetadata.turns?.forEach(turn => {
        if (turn.path_index < TRACK_PATH.length) {
          const point = TRACK_PATH[turn.path_index];
          const p3d = apply3D(point.x, point.y + 20);
          ctx.fillText(`T${turn.number}`, p3d.x, p3d.y);
        }
      });

      // Draw cars as glowing dots
      agents.forEach(agent => {
        if (!agent?.position) return;
        const teamColor = trackMetadata.team_colors?.[agent.team_name] || '#06b6d4';
        const p3d = apply3D(agent.position.x, agent.position.y, 5);

        // Glow trail (last position)
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = teamColor;
        ctx.beginPath();
        ctx.arc(p3d.x - 2, p3d.y - 2, 6, 0, Math.PI * 2);
        ctx.fill();

        // Main dot
        ctx.globalAlpha = 1;
        ctx.shadowColor = teamColor;
        ctx.shadowBlur = 15;
        ctx.fillStyle = teamColor;
        ctx.beginPath();
        ctx.arc(p3d.x, p3d.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Direction indicator
        const heading = (agent.position.heading || 0) * Math.PI / 180;
        ctx.strokeStyle = teamColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p3d.x, p3d.y);
        ctx.lineTo(p3d.x + Math.cos(heading) * 8, p3d.y + Math.sin(heading) * 8);
        ctx.stroke();

        // Health bar
        const health = agent.mechanical_health || 100;
        if (health < 100) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.fillRect(p3d.x - 10, p3d.y - 12, 20, 2);
          ctx.fillStyle = health > 70 ? '#10b981' : health > 40 ? '#f59e0b' : '#ef4444';
          ctx.fillRect(p3d.x - 10, p3d.y - 12, 20 * (health / 100), 2);
        }
      });

      ctx.restore();
    };

    render();
    animationRef.current = requestAnimationFrame(render);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [agents, events, zoom, pan, trackMetadata]);

  return (
    <div className="h-full flex flex-col bg-[#0A0E27]/80 backdrop-blur-xl rounded-xl border border-cyan-400/20 shadow-2xl shadow-cyan-500/10 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-cyan-400/20 bg-gradient-to-r from-cyan-500/5 to-purple-500/5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-white/70">LAS VEGAS GP - 3D VIEW</span>
          <motion.span 
            className="text-xs text-cyan-400 font-medium"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            LIVE
          </motion.span>
        </div>
        
        <div className="flex items-center gap-0.5">
          <Button size="sm" variant="ghost" onClick={() => setZoom(Math.max(0.5, zoom - 0.2))} className="h-7 w-7 p-0">
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setZoom(Math.min(3, zoom + 0.2))} className="h-7 w-7 p-0">
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="h-7 w-7 p-0">
            <Maximize2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 relative">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </div>
  );
}