import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Pause, Gauge, TrendingDown, Wind, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import MotoGPMap from '../components/simulation/MotoGPMap';

export default function MotoGPDashboard() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const simId = urlParams.get('id');
  const [simulation, setSimulation] = useState(null);
  const [riders, setRiders] = useState([]);
  const [selectedRider, setSelectedRider] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!simId) { navigate(createPageUrl('Landing')); return; }
    loadSimulation();
  }, [simId]);

  const loadSimulation = async () => {
    const sim = await base44.entities.Simulation.filter({ id: simId });
    if (sim?.[0]) {
      setSimulation(sim[0]);
      const mockRiders = Array(sim[0].settings?.num_agents || 8).fill(0).map((_, i) => ({
        id: `rider-${i}`,
        number: i + 1,
        name: `Rider ${i + 1}`,
        team: `Team ${String.fromCharCode(65 + i)}`,
        leanAngle: 40 + Math.random() * 15,
        gear: Math.floor(Math.random() * 6) + 1,
        throttle: 70 + Math.random() * 30,
        brake: Math.random() * 100,
        tireTempFront: 80 + Math.random() * 30,
        tireTempRear: 85 + Math.random() * 25,
        slipRatio: Math.random() * 15,
        cornerSpeed: 120 + Math.random() * 40,
        position: i + 1
      }));
      setRiders(mockRiders);
      setSelectedRider(mockRiders[0]);
      
      // Update telemetry dynamically
      const interval = setInterval(() => {
        setRiders(prev => prev.map(r => ({
          ...r,
          leanAngle: Math.max(35, Math.min(60, r.leanAngle + (Math.random() - 0.5) * 3)),
          gear: Math.max(1, Math.min(6, r.gear + (Math.random() > 0.5 ? 1 : -1))),
          throttle: Math.max(50, Math.min(100, r.throttle + (Math.random() - 0.5) * 10)),
          brake: Math.max(0, Math.min(100, r.brake + (Math.random() - 0.5) * 20)),
          tireTempFront: Math.max(70, Math.min(120, r.tireTempFront + (Math.random() - 0.5) * 5)),
          tireTempRear: Math.max(75, Math.min(125, r.tireTempRear + (Math.random() - 0.5) * 5)),
          slipRatio: Math.max(0, Math.min(25, r.slipRatio + (Math.random() - 0.5) * 2)),
          cornerSpeed: Math.max(100, Math.min(180, r.cornerSpeed + (Math.random() - 0.5) * 8))
        })));
      }, 500);
      
      return () => clearInterval(interval);
    }
  };

  if (!simulation) return <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center"><div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="h-screen bg-[#0A0E27] text-white flex flex-col overflow-hidden">
      <div className="fixed inset-0 pointer-events-none"><div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-orange-900/20" /></div>

      <div className="relative z-10 border-b border-white/10 backdrop-blur-xl bg-[#0A0E27]/80">
        <div className="px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Landing')}><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
            <div className="text-lg font-bold text-white">EAGLEX</div>
            <div className="text-xs text-white/50">/ MOTO GP</div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2"><Gauge className="w-3.5 h-3.5 text-purple-400" /><div><div className="text-xs text-white/50">Avg Lean</div><div className="text-sm font-semibold text-white">{riders.length > 0 ? (riders.reduce((s, r) => s + r.leanAngle, 0) / riders.length).toFixed(1) : 0}°</div></div></div>
            <div className="flex items-center gap-2"><TrendingDown className="w-3.5 h-3.5 text-orange-400" /><div><div className="text-xs text-white/50">Max Slip</div><div className="text-sm font-semibold text-white">{riders.length > 0 ? Math.max(...riders.map(r => r.slipRatio)).toFixed(1) : 0}%</div></div></div>
          </div>
          <Button size="sm" onClick={() => setIsPlaying(!isPlaying)} className="gap-2 bg-purple-500 hover:bg-purple-600 text-white">{isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}</Button>
        </div>
      </div>

      <div className="relative flex-1 flex gap-3 p-3 overflow-hidden">
        {/* Left: Track Map */}
        <div className="flex-1 bg-white/5 backdrop-blur-xl rounded-xl border border-purple-400/20 p-4">
          <div className="text-sm font-semibold text-white mb-3">Mugello Circuit</div>
          <div className="h-full"><MotoGPMap riders={riders} /></div>
        </div>

        {/* Center: Rider Grid */}
        <div className="w-[400px] space-y-2 overflow-y-auto">
          {riders.map(rider => (
            <motion.div key={rider.id} onClick={() => setSelectedRider(rider)} className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedRider?.id === rider.id ? 'bg-purple-500/20 border-purple-400/50' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-purple-400">#{rider.number}</div>
                  <div><div className="text-sm font-semibold text-white">{rider.name}</div><div className="text-xs text-white/50">{rider.team}</div></div>
                </div>
                <div className="text-right"><div className="text-xs text-white/50">Position</div><div className="text-lg font-bold text-white">{rider.position}</div></div>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div><div className="text-white/50">Lean</div><div className="font-semibold text-purple-400">{rider.leanAngle.toFixed(1)}°</div></div>
                <div><div className="text-white/50">Gear</div><div className="font-semibold text-white">{rider.gear}</div></div>
                <div><div className="text-white/50">Throttle</div><div className="font-semibold text-green-400">{rider.throttle.toFixed(0)}%</div></div>
                <div><div className="text-white/50">Brake</div><div className="font-semibold text-red-400">{rider.brake.toFixed(0)}%</div></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Right: Detailed Telemetry */}
        {selectedRider && (
          <div className="flex-1 space-y-3 overflow-y-auto">
            <Card className="bg-white/5 border-purple-400/20"><CardHeader><CardTitle className="text-white flex items-center gap-2"><Gauge className="w-5 h-5 text-purple-400" />Rider Telemetry</CardTitle></CardHeader><CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/30"><div className="text-xs text-white/70 mb-1">Lean Angle</div><div className="text-2xl font-bold text-purple-400">{selectedRider.leanAngle.toFixed(1)}°</div></div>
                <div className="p-3 rounded-lg bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/30"><div className="text-xs text-white/70 mb-1">Corner Speed</div><div className="text-2xl font-bold text-orange-400">{selectedRider.cornerSpeed.toFixed(0)} km/h</div></div>
              </div>
              <div><div className="text-sm text-white/70 mb-2">Throttle Position</div><Progress value={selectedRider.throttle} className="h-3" /></div>
              <div><div className="text-sm text-white/70 mb-2">Brake Pressure</div><Progress value={selectedRider.brake} className="h-3" /></div>
            </CardContent></Card>

            <Card className="bg-white/5 border-purple-400/20"><CardHeader><CardTitle className="text-white flex items-center gap-2"><Zap className="w-5 h-5 text-orange-400" />Tire Performance</CardTitle></CardHeader><CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><div className="text-xs text-white/70 mb-1">Front Tire Temp</div><div className="text-xl font-bold text-orange-400">{selectedRider.tireTempFront.toFixed(0)}°C</div></div>
                <div><div className="text-xs text-white/70 mb-1">Rear Tire Temp</div><div className="text-xl font-bold text-orange-400">{selectedRider.tireTempRear.toFixed(0)}°C</div></div>
              </div>
              <div><div className="text-sm text-white/70 mb-2">Slip Ratio: {selectedRider.slipRatio.toFixed(1)}%</div><Progress value={selectedRider.slipRatio} className="h-2" /></div>
            </CardContent></Card>

            <Card className="bg-white/5 border-purple-400/20"><CardHeader><CardTitle className="text-white flex items-center gap-2"><Wind className="w-5 h-5 text-cyan-400" />Aerodynamics</CardTitle></CardHeader><CardContent><div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-white/70">Downforce:</span><span className="font-semibold text-white">High</span></div><div className="flex justify-between"><span className="text-white/70">Drag Coefficient:</span><span className="font-semibold text-white">0.68</span></div><div className="flex justify-between"><span className="text-white/70">Air Pressure:</span><span className="font-semibold text-white">1013 hPa</span></div></div></CardContent></Card>
          </div>
        )}
      </div>
    </div>
  );
}