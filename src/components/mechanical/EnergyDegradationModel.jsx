import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Battery, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function EnergyDegradationModel({ agent }) {
  const [expanded, setExpanded] = useState(false);

  const generateEnergyData = () => {
    const current = (agent?.telemetry?.batterySoc || 0.85) * 100;
    const degradationRate = 2.5 + Math.random() * 1.5;
    const data = [];
    
    for (let i = 0; i <= 10; i++) {
      const consumption = degradationRate * i + Math.random() * 3;
      data.push({
        lap: i,
        soc: Math.max(10, current - consumption),
        predicted: i >= 1 ? Math.max(10, current - consumption) : null,
        threshold: 20
      });
    }
    return data;
  };

  const energyData = generateEnergyData();
  const currentSoc = energyData[0].soc;
  const lap3Soc = energyData[3].soc;
  const lap5Soc = energyData[5].soc;
  const lap10Soc = energyData[10].soc;

  const getTrendStatus = () => {
    const degradationRate = currentSoc - lap5Soc;
    if (degradationRate > 25) return { status: 'Critical', color: 'red' };
    if (degradationRate > 15) return { status: 'Rising', color: 'yellow' };
    return { status: 'Stable', color: 'green' };
  };

  const trend = getTrendStatus();

  return (
    <Card className="bg-gradient-to-br from-green-500/5 to-cyan-500/5 border-green-500/20 hover:border-green-500/40 transition-all">
      <CardHeader 
        className="cursor-pointer pb-3"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20 border border-green-500/30">
              <Battery className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-white">Energy Degradation Model</CardTitle>
              <div className="text-xs text-white/60 mt-0.5">
                Energy Trend: <span className={`text-${trend.color}-400 font-semibold`}>{trend.status}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`bg-${trend.color}-500/20 text-${trend.color}-400 border-${trend.color}-500/30 font-mono`}>
              {currentSoc.toFixed(0)}%
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
              {/* Energy Projection Chart */}
              <div>
                <div className="text-xs text-white/70 mb-2 font-semibold">Battery Degradation Curve</div>
                <ResponsiveContainer width="100%" height={150}>
                  <AreaChart data={energyData}>
                    <defs>
                      <linearGradient id="socGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="lap" stroke="#ffffff40" style={{ fontSize: '10px' }} label={{ value: 'Laps', position: 'insideBottom', offset: -5, style: { fill: '#ffffff60', fontSize: '10px' } }} />
                    <YAxis stroke="#ffffff40" style={{ fontSize: '10px' }} label={{ value: 'SOC %', angle: -90, position: 'insideLeft', style: { fill: '#ffffff60', fontSize: '10px' } }} />
                    <Tooltip 
                      contentStyle={{ background: '#0A0E27', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}
                    />
                    <Area type="monotone" dataKey="soc" stroke="#10b981" fill="url(#socGrad)" strokeWidth={2} />
                    <Line type="monotone" dataKey="threshold" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Lap Predictions */}
              <div>
                <div className="text-xs text-white/70 mb-2 font-semibold">Predicted State of Charge</div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: '+3 Laps', soc: lap3Soc },
                    { label: '+5 Laps', soc: lap5Soc },
                    { label: '+10 Laps', soc: lap10Soc }
                  ].map((pred, idx) => (
                    <motion.div
                      key={pred.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`p-3 rounded-lg border ${
                        pred.soc < 20 ? 'bg-red-500/10 border-red-500/30' :
                        pred.soc < 40 ? 'bg-yellow-500/10 border-yellow-500/30' :
                        'bg-green-500/10 border-green-500/30'
                      }`}
                    >
                      <div className="text-xs text-white/60 mb-1">{pred.label}</div>
                      <div className={`text-xl font-mono font-bold ${
                        pred.soc < 20 ? 'text-red-400' :
                        pred.soc < 40 ? 'text-yellow-400' :
                        'text-green-400'
                      }`}>
                        {pred.soc.toFixed(0)}%
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Consumption Rate */}
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="text-xs text-white/60 mb-2">Average Consumption Rate</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-mono font-bold text-cyan-400">
                    {((currentSoc - lap5Soc) / 5).toFixed(1)}
                  </span>
                  <span className="text-sm text-white/60">% per lap</span>
                </div>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}