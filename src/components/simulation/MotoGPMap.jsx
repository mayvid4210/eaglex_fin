import React, { useEffect, useRef } from 'react';

const MUGELLO_TRACK = [
  { x: 100, y: 250 }, { x: 150, y: 220 }, { x: 200, y: 200 }, { x: 250, y: 190 },
  { x: 300, y: 185 }, { x: 350, y: 190 }, { x: 400, y: 210 }, { x: 430, y: 240 },
  { x: 450, y: 280 }, { x: 460, y: 330 }, { x: 450, y: 380 }, { x: 420, y: 420 },
  { x: 380, y: 440 }, { x: 330, y: 450 }, { x: 280, y: 445 }, { x: 230, y: 420 },
  { x: 190, y: 380 }, { x: 160, y: 330 }, { x: 140, y: 280 }, { x: 120, y: 260 }
];

export default function MotoGPMap({ riders = [] }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    ctx.clearRect(0, 0, rect.width, rect.height);

    // Draw track
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    MUGELLO_TRACK.forEach((point, i) => {
      if (i === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.closePath();
    ctx.stroke();

    // Draw riders
    riders.forEach((rider, i) => {
      const idx = (i * 3) % MUGELLO_TRACK.length;
      const pos = MUGELLO_TRACK[idx];
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`#${rider.number}`, pos.x, pos.y + 3);
    });
  }, [riders]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}