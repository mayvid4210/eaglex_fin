import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Pause, Package, Truck, Ship, AlertCircle, TrendingUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SupplyChainDashboard() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const simId = urlParams.get('id');
  const [simulation, setSimulation] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!simId) { navigate(createPageUrl('Landing')); return; }
    loadSimulation();
  }, [simId]);

  const loadSimulation = async () => {
    const sim = await base44.entities.Simulation.filter({ id: simId });
    if (sim?.[0]) {
      setSimulation(sim[0]);
      const mockShipments = Array(sim[0].settings?.num_agents || 10).fill(0).map((_, i) => ({
        id: `ship-${i}`,
        trackingId: `SC${String(i + 1).padStart(4, '0')}`,
        type: ['truck', 'ship', 'container'][Math.floor(Math.random() * 3)],
        status: ['on_time', 'on_time', 'delayed', 'on_time'][Math.floor(Math.random() * 4)],
        origin: ['Shanghai', 'Los Angeles', 'New York', 'Rotterdam'][Math.floor(Math.random() * 4)],
        destination: ['Chicago', 'Dallas', 'Seattle', 'Miami'][Math.floor(Math.random() * 4)],
        eta: Math.floor(2 + Math.random() * 8),
        progress: 20 + Math.random() * 70,
        delayRisk: Math.random() * 100,
        cost: 5000 + Math.random() * 15000,
        warehouseLoad: 60 + Math.random() * 40
      }));
      setShipments(mockShipments);
      setSelectedShipment(mockShipments[0]);
      
      // Dynamic updates
      const interval = setInterval(() => {
        setShipments(prev => prev.map(s => ({
          ...s,
          progress: Math.min(100, s.progress + 0.5),
          eta: Math.max(0, s.eta - 0.01),
          delayRisk: Math.max(0, Math.min(100, s.delayRisk + (Math.random() - 0.5) * 2)),
          warehouseLoad: Math.max(50, Math.min(100, s.warehouseLoad + (Math.random() - 0.5) * 3)),
          status: s.delayRisk > 60 ? 'delayed' : 'on_time'
        })));
      }, 1000);
      
      return () => clearInterval(interval);
    }
  };

  if (!simulation) return <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center"><div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" /></div>;

  const onTimeShipments = shipments.filter(s => s.status === 'on_time').length;
  const avgETA = shipments.length > 0 ? shipments.reduce((s, sh) => s + sh.eta, 0) / shipments.length : 0;
  const highRiskShipments = shipments.filter(s => s.delayRisk > 60).length;

  return (
    <div className="h-screen bg-[#0A0E27] text-white flex flex-col overflow-hidden">
      <div className="fixed inset-0 pointer-events-none"><div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-orange-900/20 to-red-900/20" /></div>

      <div className="relative z-10 border-b border-white/10 backdrop-blur-xl bg-[#0A0E27]/80">
        <div className="px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Landing')}><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
            <div className="text-lg font-bold text-white">EAGLEX</div>
            <div className="text-xs text-white/50">/ SUPPLY CHAIN</div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2"><Package className="w-3.5 h-3.5 text-green-400" /><div><div className="text-xs text-white/50">On Time</div><div className="text-sm font-semibold text-white">{onTimeShipments}/{shipments.length}</div></div></div>
            <div className="flex items-center gap-2"><TrendingUp className="w-3.5 h-3.5 text-amber-400" /><div><div className="text-xs text-white/50">Avg ETA</div><div className="text-sm font-semibold text-white">{avgETA.toFixed(1)}d</div></div></div>
            <div className="flex items-center gap-2"><AlertCircle className="w-3.5 h-3.5 text-red-400" /><div><div className="text-xs text-white/50">High Risk</div><div className="text-sm font-semibold text-white">{highRiskShipments}</div></div></div>
          </div>
          <Button size="sm" onClick={() => setIsPlaying(!isPlaying)} className="gap-2 bg-amber-500 hover:bg-amber-600 text-white">{isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}</Button>
        </div>
      </div>

      <div className="relative flex-1 flex gap-3 p-3 overflow-hidden">
        {/* Left: KPI Clusters */}
        <div className="w-[350px] space-y-3 overflow-y-auto">
          <Card className="bg-white/5 border-amber-400/20"><CardHeader><CardTitle className="text-white text-sm">Fleet Overview</CardTitle></CardHeader><CardContent className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5"><div className="flex items-center gap-2"><Truck className="w-4 h-4 text-amber-400" /><span className="text-sm text-white">Trucks</span></div><span className="text-sm font-semibold text-white">{shipments.filter(s => s.type === 'truck').length}</span></div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5"><div className="flex items-center gap-2"><Ship className="w-4 h-4 text-cyan-400" /><span className="text-sm text-white">Ships</span></div><span className="text-sm font-semibold text-white">{shipments.filter(s => s.type === 'ship').length}</span></div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5"><div className="flex items-center gap-2"><Package className="w-4 h-4 text-green-400" /><span className="text-sm text-white">Containers</span></div><span className="text-sm font-semibold text-white">{shipments.filter(s => s.type === 'container').length}</span></div>
          </CardContent></Card>

          <Card className="bg-white/5 border-amber-400/20"><CardHeader><CardTitle className="text-white text-sm">Risk Analysis</CardTitle></CardHeader><CardContent className="space-y-2">
            <div className="flex justify-between text-sm"><span className="text-white/70">Low Risk:</span><span className="text-green-400 font-semibold">{shipments.filter(s => s.delayRisk < 30).length}</span></div>
            <div className="flex justify-between text-sm"><span className="text-white/70">Medium Risk:</span><span className="text-yellow-400 font-semibold">{shipments.filter(s => s.delayRisk >= 30 && s.delayRisk < 60).length}</span></div>
            <div className="flex justify-between text-sm"><span className="text-white/70">High Risk:</span><span className="text-red-400 font-semibold">{shipments.filter(s => s.delayRisk >= 60).length}</span></div>
          </CardContent></Card>

          <Card className="bg-white/5 border-amber-400/20"><CardHeader><CardTitle className="text-white text-sm">Cost Summary</CardTitle></CardHeader><CardContent>
            <div className="text-3xl font-bold text-amber-400">${(shipments.reduce((s, sh) => s + sh.cost, 0) / 1000).toFixed(1)}K</div>
            <div className="text-xs text-white/50 mt-1">Total shipping costs</div>
          </CardContent></Card>
        </div>

        {/* Center: Shipment List */}
        <div className="flex-1 space-y-2 overflow-y-auto">
          {shipments.map(shipment => (
            <motion.div key={shipment.id} onClick={() => setSelectedShipment(shipment)} className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedShipment?.id === shipment.id ? 'bg-amber-500/20 border-amber-400/50' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {shipment.type === 'truck' && <Truck className="w-4 h-4 text-amber-400" />}
                  {shipment.type === 'ship' && <Ship className="w-4 h-4 text-cyan-400" />}
                  {shipment.type === 'container' && <Package className="w-4 h-4 text-green-400" />}
                  <div className="text-sm font-semibold text-white">{shipment.trackingId}</div>
                  <Badge variant="outline" className={`text-xs ${shipment.status === 'on_time' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>{shipment.status.replace('_', ' ')}</Badge>
                </div>
                <div className="text-xs text-white/50">ETA: {shipment.eta}d</div>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex-1"><div className="text-white/50">{shipment.origin} → {shipment.destination}</div><div className="w-full bg-white/10 rounded-full h-1.5 mt-1"><div className="bg-amber-400 h-1.5 rounded-full" style={{width: `${shipment.progress}%`}} /></div></div>
                <div className="text-right"><div className="text-white/50">Risk</div><div className={`font-semibold ${shipment.delayRisk > 60 ? 'text-red-400' : shipment.delayRisk > 30 ? 'text-yellow-400' : 'text-green-400'}`}>{shipment.delayRisk.toFixed(0)}%</div></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Right: Details */}
        {selectedShipment && (
          <div className="w-[320px] space-y-3 overflow-y-auto">
            <Card className="bg-white/5 border-amber-400/20"><CardHeader><CardTitle className="text-white text-lg">{selectedShipment.trackingId}</CardTitle></CardHeader><CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-white/70">Type:</span><span className="font-semibold text-white capitalize">{selectedShipment.type}</span></div>
                <div className="flex justify-between"><span className="text-white/70">Status:</span><span className="font-semibold text-white capitalize">{selectedShipment.status.replace('_', ' ')}</span></div>
                <div className="flex justify-between"><span className="text-white/70">Origin:</span><span className="font-semibold text-white">{selectedShipment.origin}</span></div>
                <div className="flex justify-between"><span className="text-white/70">Destination:</span><span className="font-semibold text-white">{selectedShipment.destination}</span></div>
                <div className="flex justify-between"><span className="text-white/70">ETA:</span><span className="font-semibold text-white">{selectedShipment.eta} days</span></div>
                <div className="flex justify-between"><span className="text-white/70">Progress:</span><span className="font-semibold text-white">{selectedShipment.progress.toFixed(0)}%</span></div>
                <div className="flex justify-between"><span className="text-white/70">Cost:</span><span className="font-semibold text-amber-400">${selectedShipment.cost.toFixed(0)}</span></div>
                <div className="flex justify-between"><span className="text-white/70">Warehouse Load:</span><span className="font-semibold text-white">{selectedShipment.warehouseLoad.toFixed(0)}%</span></div>
              </div>
            </CardContent></Card>

            <Card className="bg-white/5 border-amber-400/20"><CardHeader><CardTitle className="text-white text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4 text-red-400" />Delay Risk Analysis</CardTitle></CardHeader><CardContent>
              <div className="text-2xl font-bold text-amber-400 mb-2">{selectedShipment.delayRisk.toFixed(0)}%</div>
              {selectedShipment.delayRisk > 60 && <div className="p-2 rounded-lg bg-red-500/20 border border-red-500/30 text-xs text-white"><div className="font-semibold text-red-400 mb-1">High Risk</div><div className="text-white/70">Immediate action required</div></div>}
              {selectedShipment.delayRisk >= 30 && selectedShipment.delayRisk <= 60 && <div className="p-2 rounded-lg bg-yellow-500/20 border border-yellow-500/30 text-xs text-white"><div className="font-semibold text-yellow-400 mb-1">Medium Risk</div><div className="text-white/70">Monitor closely</div></div>}
              {selectedShipment.delayRisk < 30 && <div className="p-2 rounded-lg bg-green-500/20 border border-green-500/30 text-xs text-white"><div className="font-semibold text-green-400 mb-1">Low Risk</div><div className="text-white/70">On track</div></div>}
            </CardContent></Card>
          </div>
        )}
      </div>
    </div>
  );
}