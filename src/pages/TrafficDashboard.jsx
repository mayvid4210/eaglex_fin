import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Pause, TrafficCone, AlertCircle, TrendingUp, Wind } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function TrafficDashboard() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const simId = urlParams.get('id');
  const [simulation, setSimulation] = useState(null);
  const [intersections, setIntersections] = useState([]);
  const [selectedIntersection, setSelectedIntersection] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!simId) { navigate(createPageUrl('Landing')); return; }
    loadSimulation();
  }, [simId]);

  const loadSimulation = async () => {
    const sim = await base44.entities.Simulation.filter({ id: simId });
    if (sim?.[0]) {
      setSimulation(sim[0]);
      const mockIntersections = Array(sim[0].settings?.num_agents || 16).fill(0).map((_, i) => ({
        id: `int-${i}`,
        name: `Intersection ${String.fromCharCode(65 + Math.floor(i / 4))}${(i % 4) + 1}`,
        congestion: Math.random() * 100,
        density: 50 + Math.random() * 50,
        signalTiming: 30 + Math.random() * 60,
        incidents: Math.random() > 0.8 ? Math.floor(Math.random() * 2) + 1 : 0,
        pollutionIndex: 40 + Math.random() * 60,
        transitLoad: Math.random() * 100,
        flowPrediction: Math.random() > 0.5 ? 'increasing' : 'stable',
        waitTime: Math.random() * 120
      }));
      setIntersections(mockIntersections);
      setSelectedIntersection(mockIntersections[0]);
      
      // Dynamic updates
      const interval = setInterval(() => {
        setIntersections(prev => prev.map(int => ({
          ...int,
          congestion: Math.max(0, Math.min(100, int.congestion + (Math.random() - 0.5) * 5)),
          density: Math.max(30, Math.min(100, int.density + (Math.random() - 0.5) * 4)),
          signalTiming: Math.max(20, Math.min(90, int.signalTiming + (Math.random() - 0.5) * 3)),
          pollutionIndex: Math.max(20, Math.min(100, int.pollutionIndex + (Math.random() - 0.5) * 2)),
          transitLoad: Math.max(0, Math.min(100, int.transitLoad + (Math.random() - 0.5) * 3)),
          waitTime: Math.max(10, Math.min(180, int.waitTime + (Math.random() - 0.5) * 10)),
          incidents: Math.random() > 0.97 ? Math.min(int.incidents + 1, 3) : Math.max(0, int.incidents - (Math.random() > 0.95 ? 1 : 0)),
          flowPrediction: int.congestion > 70 ? 'increasing' : int.congestion < 40 ? 'decreasing' : 'stable'
        })));
      }, 1200);
      
      return () => clearInterval(interval);
    }
  };

  if (!simulation) return <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center"><div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" /></div>;

  const avgCongestion = intersections.length > 0 ? intersections.reduce((s, i) => s + i.congestion, 0) / intersections.length : 0;
  const totalIncidents = intersections.reduce((s, i) => s + i.incidents, 0);
  const highCongestion = intersections.filter(i => i.congestion > 70).length;

  return (
    <div className="h-screen bg-[#0A0E27] text-white flex flex-col overflow-hidden">
      <div className="fixed inset-0 pointer-events-none"><div className="absolute inset-0 bg-gradient-to-br from-yellow-900/20 via-orange-900/20 to-red-900/20" /></div>

      <div className="relative z-10 border-b border-white/10 backdrop-blur-xl bg-[#0A0E27]/80">
        <div className="px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Landing')}><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
            <div className="text-lg font-bold text-white">EAGLEX</div>
            <div className="text-xs text-white/50">/ TRAFFIC SYSTEM</div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2"><TrafficCone className="w-3.5 h-3.5 text-yellow-400" /><div><div className="text-xs text-white/50">Avg Congestion</div><div className="text-sm font-semibold text-white">{avgCongestion.toFixed(0)}%</div></div></div>
            <div className="flex items-center gap-2"><AlertCircle className="w-3.5 h-3.5 text-red-400" /><div><div className="text-xs text-white/50">Incidents</div><div className="text-sm font-semibold text-white">{totalIncidents}</div></div></div>
            <div className="flex items-center gap-2"><TrendingUp className="w-3.5 h-3.5 text-orange-400" /><div><div className="text-xs text-white/50">High Congestion</div><div className="text-sm font-semibold text-white">{highCongestion}</div></div></div>
          </div>
          <Button size="sm" onClick={() => setIsPlaying(!isPlaying)} className="gap-2 bg-yellow-500 hover:bg-yellow-600 text-black">{isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}</Button>
        </div>
      </div>

      <div className="relative flex-1 flex gap-3 p-3 overflow-hidden">
        {/* Left: City Grid */}
        <div className="flex-1 bg-white/5 backdrop-blur-xl rounded-xl border border-yellow-400/20 p-4">
          <div className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><TrafficCone className="w-4 h-4 text-yellow-400" />City Traffic Heatmap</div>
          <div className="grid grid-cols-4 gap-2 h-full">
            {intersections.map(int => (
              <motion.div key={int.id} onClick={() => setSelectedIntersection(int)} className={`relative rounded-lg border-2 cursor-pointer transition-all ${selectedIntersection?.id === int.id ? 'border-yellow-400' : 'border-transparent'}`} style={{backgroundColor: `rgba(${int.congestion * 2.55}, ${255 - int.congestion * 2.55}, 0, 0.3)`}}>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-xs font-semibold text-white">{int.name}</div>
                  <div className="text-lg font-bold text-white">{int.congestion.toFixed(0)}%</div>
                  {int.incidents > 0 && <AlertCircle className="w-3 h-3 text-red-400 mt-1" />}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: Details */}
        {selectedIntersection && (
          <div className="w-[380px] space-y-3 overflow-y-auto">
            <Card className="bg-white/5 border-yellow-400/20"><CardHeader><CardTitle className="text-white text-lg">{selectedIntersection.name}</CardTitle></CardHeader><CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/30"><div className="text-xs text-white/70">Congestion</div><div className="text-xl font-bold text-yellow-400">{selectedIntersection.congestion.toFixed(0)}%</div></div>
                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/30"><div className="text-xs text-white/70">Density</div><div className="text-xl font-bold text-orange-400">{selectedIntersection.density.toFixed(0)}</div></div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-white/70">Signal Timing:</span><span className="font-semibold text-white">{selectedIntersection.signalTiming.toFixed(0)}s</span></div>
                <div className="flex justify-between"><span className="text-white/70">Incidents:</span><span className={`font-semibold ${selectedIntersection.incidents > 0 ? 'text-red-400' : 'text-green-400'}`}>{selectedIntersection.incidents}</span></div>
                <div className="flex justify-between"><span className="text-white/70">Wait Time:</span><span className="font-semibold text-white">{selectedIntersection.waitTime.toFixed(0)}s</span></div>
                <div className="flex justify-between"><span className="text-white/70">Flow Prediction:</span><span className={`font-semibold capitalize ${selectedIntersection.flowPrediction === 'increasing' ? 'text-red-400' : 'text-green-400'}`}>{selectedIntersection.flowPrediction}</span></div>
              </div>
            </CardContent></Card>

            <Card className="bg-white/5 border-yellow-400/20"><CardHeader><CardTitle className="text-white text-sm flex items-center gap-2"><Wind className="w-4 h-4 text-cyan-400" />Environmental Impact</CardTitle></CardHeader><CardContent className="space-y-2">
              <div><div className="text-xs text-white/70 mb-1">Pollution Index</div><div className="text-2xl font-bold text-cyan-400">{selectedIntersection.pollutionIndex.toFixed(0)}</div></div>
              <div className="w-full bg-white/10 rounded-full h-2"><div className="bg-cyan-400 h-2 rounded-full" style={{width: `${selectedIntersection.pollutionIndex}%`}} /></div>
            </CardContent></Card>

            <Card className="bg-white/5 border-yellow-400/20"><CardHeader><CardTitle className="text-white text-sm">Public Transit Load</CardTitle></CardHeader><CardContent>
              <div className="text-2xl font-bold text-yellow-400 mb-2">{selectedIntersection.transitLoad.toFixed(0)}%</div>
              <div className="w-full bg-white/10 rounded-full h-2"><div className="bg-yellow-400 h-2 rounded-full" style={{width: `${selectedIntersection.transitLoad}%`}} /></div>
            </CardContent></Card>

            {selectedIntersection.incidents > 0 && (
              <Card className="bg-white/5 border-red-400/20"><CardHeader><CardTitle className="text-white text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4 text-red-400" />Active Incidents</CardTitle></CardHeader><CardContent>
                <div className="p-2 rounded-lg bg-red-500/20 border border-red-500/30 text-xs text-white"><div className="font-semibold text-red-400 mb-1">{selectedIntersection.incidents} Incident{selectedIntersection.incidents > 1 ? 's' : ''} Detected</div><div className="text-white/70">Emergency response dispatched</div></div>
              </CardContent></Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}