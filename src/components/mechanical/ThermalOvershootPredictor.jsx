import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Flame, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ThermalOvershootPredictor({ agent }) {
  const [expanded, setExpanded] = useState(false);

  // Generate thermal prediction data
  const generateThermalData = () => {
    const current = agent?.telemetry?.rotorTemp || 500;
    const data = [];
    for (let i = 0; i < 20; i++) {
      data.push({
        lap: i,
        actual: i < 10 ? current + i * 15 + Math.random() * 20 : null,
        predicted: i >= 10 ? current + i * 15 + Math.random() * 20 : null,
        threshold: 750
      });
    }
    return data;
  };

  const thermalData = generateThermalData();
  const timeToOverheat = 8 + Math.random() * 4;
  const probability = Math.min(95, 40 + (agent?.telemetry?.rotorTemp || 500) / 10);
  const isCritical = timeToOverheat < 5;

  const sectorHeatLoad = [
    { sector: 'S1', load: 65, color: '#fbbf24' },
    { sector: 'S2', load: 88, color: '#ef4444' },
    { sector: 'S3', load: 72, color: '#f59e0b' }
  ];

  return (
    <Card className="bg-gradient-to-br from-red-500/5 to-orange-500/5 border-red-500/20 hover:border-red-500/40 transition-all">
      <CardHeader 
        className="cursor-pointer pb-3"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/20 border border-red-500/30">
              <Flame className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                Thermal Overshoot Predictor
                {isCritical && <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />}
              </CardTitle>
              <div className="text-xs text-white/60 mt-0.5">
                Time to critical: <span className="text-red-400 font-mono font-bold">{timeToOverheat.toFixed(1)}L</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${isCritical ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}`}>
              {probability.toFixed(0)}% Risk
            </Badge>
            {expanded ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
          </div>
        </div>
      </CardHeader>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent className="space-y-4">
              {/* Temperature Trend Chart */}
              <div>
                <div className="text-xs text-white/70 mb-2 font-semibold">Temperature Projection</div>
                <ResponsiveContainer width="100%" height={150}>
                  <AreaChart data={thermalData}>
                    <defs>
                      <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="predictedGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="lap" stroke="#ffffff40" style={{ fontSize: '10px' }} />
                    <YAxis stroke="#ffffff40" style={{ fontSize: '10px' }} />
                    <Tooltip 
                      contentStyle={{ background: '#0A0E27', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="actual" stroke="#f59e0b" fill="url(#actualGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="predicted" stroke="#ef4444" fill="url(#predictedGrad)" strokeWidth={2} strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="threshold" stroke="#dc2626" strokeWidth={2} strokeDasharray="10 5" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Sector Heat Load */}
              <div>
                <div className="text-xs text-white/70 mb-2 font-semibold">Sector Heat Load</div>
                <div className="space-y-2">
                  {sectorHeatLoad.map(sector => (
                    <div key={sector.sector} className="flex items-center gap-3">
                      <div className="w-12 text-xs font-mono text-white/70">{sector.sector}</div>
                      <div className="flex-1 h-6 bg-white/5 rounded-lg overflow-hidden relative">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${sector.load}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="h-full rounded-lg"
                          style={{ backgroundColor: sector.color + '40', borderRight: `2px solid ${sector.color}` }}
                        />
                        <div className="absolute inset-0 flex items-center px-2">
                          <span className="text-xs font-mono font-bold" style={{ color: sector.color }}>
                            {sector.load}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Component Temps */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Battery', temp: 58 + Math.random() * 15, max: 80 },
                  { label: 'Motor', temp: 115 + Math.random() * 25, max: 150 },
                  { label: 'Inverter', temp: 95 + Math.random() * 20, max: 120 },
                  { label: 'Brakes', temp: agent?.telemetry?.rotorTemp || 500, max: 750 }
                ].map(comp => (
                  <div key={comp.label} className="p-2 rounded-lg bg-white/5 border border-white/10">
                    <div className="text-xs text-white/60 mb-1">{comp.label}</div>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-lg font-mono font-bold ${comp.temp / comp.max > 0.8 ? 'text-red-400' : 'text-yellow-400'}`}>
                        {comp.temp.toFixed(0)}
                      </span>
                      <span className="text-xs text-white/40">/ {comp.max}°C</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}