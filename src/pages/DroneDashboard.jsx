import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Pause, Plane, Battery, Radio, AlertTriangle, Navigation } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DroneMap from '../components/simulation/DroneMap';

export default function DroneDashboard() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const simId = urlParams.get('id');
  const [simulation, setSimulation] = useState(null);
  const [drones, setDrones] = useState([]);
  const [selectedDrone, setSelectedDrone] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!simId) { navigate(createPageUrl('Landing')); return; }
    loadSimulation();
  }, [simId]);

  const loadSimulation = async () => {
    const sim = await base44.entities.Simulation.filter({ id: simId });
    if (sim?.[0]) {
      setSimulation(sim[0]);
      const mockDrones = Array(sim[0].settings?.num_agents || 12).fill(0).map((_, i) => ({
        id: `drone-${i}`,
        number: `D${String(i + 1).padStart(2, '0')}`,
        status: ['active', 'active', 'active', 'warning', 'active'][Math.floor(Math.random() * 5)],
        battery: 60 + Math.random() * 40,
        altitude: 50 + Math.random() * 150,
        signal: 70 + Math.random() * 30,
        speed: 20 + Math.random() * 40,
        lat: 36.1699 + (Math.random() - 0.5) * 0.01,
        lng: -115.1398 + (Math.random() - 0.5) * 0.01,
        windResistance: Math.random() * 30,
        collisionRisk: Math.random() * 100
      }));
      setDrones(mockDrones);
      setSelectedDrone(mockDrones[0]);
      
      // Dynamic updates
      const interval = setInterval(() => {
        setDrones(prev => prev.map(d => ({
          ...d,
          battery: Math.max(10, d.battery - 0.2),
          altitude: Math.max(30, Math.min(200, d.altitude + (Math.random() - 0.5) * 5)),
          signal: Math.max(40, Math.min(100, d.signal + (Math.random() - 0.5) * 3)),
          speed: Math.max(10, Math.min(60, d.speed + (Math.random() - 0.5) * 4)),
          windResistance: Math.max(0, Math.min(50, d.windResistance + (Math.random() - 0.5) * 3)),
          collisionRisk: Math.max(0, Math.min(100, d.collisionRisk + (Math.random() - 0.5) * 5)),
          status: d.battery < 25 ? 'warning' : 'active'
        })));
      }, 800);
      
      return () => clearInterval(interval);
    }
  };

  if (!simulation) return <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center"><div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" /></div>;

  const activeDrones = drones.filter(d => d.status === 'active').length;
  const avgBattery = drones.length > 0 ? drones.reduce((s, d) => s + d.battery, 0) / drones.length : 0;
  const warningDrones = drones.filter(d => d.status === 'warning').length;

  return (
    <div className="h-screen bg-[#0A0E27] text-white flex flex-col overflow-hidden">
      <div className="fixed inset-0 pointer-events-none"><div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-cyan-900/20 to-blue-900/20" /></div>

      <div className="relative z-10 border-b border-white/10 backdrop-blur-xl bg-[#0A0E27]/80">
        <div className="px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Landing')}><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
            <div className="text-lg font-bold text-white">EAGLEX</div>
            <div className="text-xs text-white/50">/ DRONE FLEET</div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2"><Plane className="w-3.5 h-3.5 text-green-400" /><div><div className="text-xs text-white/50">Active</div><div className="text-sm font-semibold text-white">{activeDrones}/{drones.length}</div></div></div>
            <div className="flex items-center gap-2"><Battery className="w-3.5 h-3.5 text-cyan-400" /><div><div className="text-xs text-white/50">Avg Battery</div><div className="text-sm font-semibold text-white">{avgBattery.toFixed(0)}%</div></div></div>
            <div className="flex items-center gap-2"><AlertTriangle className="w-3.5 h-3.5 text-orange-400" /><div><div className="text-xs text-white/50">Warnings</div><div className="text-sm font-semibold text-white">{warningDrones}</div></div></div>
          </div>
          <Button size="sm" onClick={() => setIsPlaying(!isPlaying)} className="gap-2 bg-green-500 hover:bg-green-600 text-white">{isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}</Button>
        </div>
      </div>

      <div className="relative flex-1 flex gap-3 p-3 overflow-hidden">
        {/* Left: Swarm Map */}
        <div className="flex-1 bg-white/5 backdrop-blur-xl rounded-xl border border-green-400/20 p-4">
          <div className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Navigation className="w-4 h-4 text-green-400" />Swarm Position Map</div>
          <div className="h-full"><DroneMap drones={drones} /></div>
        </div>

        {/* Center: Drone List */}
        <div className="w-[350px] space-y-2 overflow-y-auto">
          {drones.map(drone => (
            <motion.div key={drone.id} onClick={() => setSelectedDrone(drone)} className={`p-2.5 rounded-lg border cursor-pointer transition-all ${selectedDrone?.id === drone.id ? 'bg-green-500/20 border-green-400/50' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Plane className={`w-4 h-4 ${drone.status === 'warning' ? 'text-orange-400' : 'text-green-400'}`} />
                  <div className="text-sm font-semibold text-white">{drone.number}</div>
                  <Badge variant="outline" className={`text-xs ${drone.status === 'warning' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30'}`}>{drone.status}</Badge>
                </div>
                <div className="text-xs font-semibold text-cyan-400">{drone.battery.toFixed(0)}%</div>
              </div>
              <div className="grid grid-cols-3 gap-1 text-xs">
                <div><div className="text-white/50">Alt</div><div className="font-semibold text-white">{drone.altitude.toFixed(0)}m</div></div>
                <div><div className="text-white/50">Signal</div><div className="font-semibold text-white">{drone.signal.toFixed(0)}%</div></div>
                <div><div className="text-white/50">Speed</div><div className="font-semibold text-white">{drone.speed.toFixed(0)} m/s</div></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Right: Drone Details */}
        {selectedDrone && (
          <div className="w-[320px] space-y-3 overflow-y-auto">
            <Card className="bg-white/5 border-green-400/20"><CardHeader><CardTitle className="text-white text-lg">{selectedDrone.number} Details</CardTitle></CardHeader><CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30"><div className="text-xs text-white/70">Battery</div><div className="text-xl font-bold text-green-400">{selectedDrone.battery.toFixed(0)}%</div></div>
                <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/30"><div className="text-xs text-white/70">Altitude</div><div className="text-xl font-bold text-cyan-400">{selectedDrone.altitude.toFixed(0)}m</div></div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-white/70">GPS Signal:</span><span className="font-semibold text-white">{selectedDrone.signal.toFixed(0)}%</span></div>
                <div className="flex justify-between"><span className="text-white/70">Speed:</span><span className="font-semibold text-white">{selectedDrone.speed.toFixed(1)} m/s</span></div>
                <div className="flex justify-between"><span className="text-white/70">Wind Resistance:</span><span className="font-semibold text-white">{selectedDrone.windResistance.toFixed(1)}%</span></div>
                <div className="flex justify-between"><span className="text-white/70">Collision Risk:</span><span className={`font-semibold ${selectedDrone.collisionRisk > 50 ? 'text-red-400' : 'text-green-400'}`}>{selectedDrone.collisionRisk.toFixed(0)}%</span></div>
              </div>
            </CardContent></Card>

            <Card className="bg-white/5 border-green-400/20"><CardHeader><CardTitle className="text-white text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-orange-400" />Active Alerts</CardTitle></CardHeader><CardContent>
              {selectedDrone.battery < 30 && <div className="p-2 rounded-lg bg-orange-500/20 border border-orange-500/30 mb-2 text-xs text-white"><div className="font-semibold text-orange-400 mb-1">Low Battery Warning</div><div className="text-white/70">Return to base recommended</div></div>}
              {selectedDrone.collisionRisk > 70 && <div className="p-2 rounded-lg bg-red-500/20 border border-red-500/30 text-xs text-white"><div className="font-semibold text-red-400 mb-1">Collision Risk High</div><div className="text-white/70">Adjust flight path immediately</div></div>}
              {selectedDrone.battery >= 30 && selectedDrone.collisionRisk <= 70 && <div className="text-xs text-white/50 text-center py-2">No active alerts</div>}
            </CardContent></Card>
          </div>
        )}
      </div>
    </div>
  );
}