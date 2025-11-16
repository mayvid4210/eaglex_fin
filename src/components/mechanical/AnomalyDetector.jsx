import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp, AlertOctagon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AnomalyDetector({ agent }) {
  const [expanded, setExpanded] = useState(false);

  const anomalies = [
    { id: 1, metric: 'Rotor Temp', type: 'spike', value: '+85°C', time: '2.3s ago', severity: 'high' },
    { id: 2, metric: 'Regen Efficiency', type: 'drop', value: '-12%', time: '5.1s ago', severity: 'medium' },
    { id: 3, metric: 'Inverter Temp', type: 'spike', value: '+42°C', time: '8.7s ago', severity: 'low' }
  ];

  const generateHistoricalData = () => {
    const data = [];
    for (let i = 0; i < 30; i++) {
      data.push({
        time: i,
        rotorTemp: 480 + Math.sin(i / 3) * 50 + (i === 22 ? 85 : 0) + Math.random() * 20,
        regenEff: 82 + Math.cos(i / 4) * 8 + (i === 18 ? -12 : 0) + Math.random() * 3,
        inverterTemp: 95 + Math.sin(i / 5) * 15 + (i === 15 ? 42 : 0) + Math.random() * 5
      });
    }
    return data;
  };

  const historicalData = generateHistoricalData();
  const latestAnomaly = anomalies[0];

  return (
    <Card className="bg-gradient-to-br from-yellow-500/5 to-red-500/5 border-yellow-500/20 hover:border-yellow-500/40 transition-all">
      <CardHeader 
        className="cursor-pointer pb-3"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
              <AlertOctagon className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                Anomaly Detector
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-yellow-400"
                />
              </CardTitle>
              <div className="text-xs text-white/60 mt-0.5">
                {anomalies.length} anomalies detected
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
              {latestAnomaly.metric}
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
              {/* Anomaly Timeline */}
              <div>
                <div className="text-xs text-white/70 mb-2 font-semibold">Recent Anomalies</div>
                <div className="space-y-2">
                  {anomalies.map((anomaly, idx) => (
                    <motion.div
                      key={anomaly.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`p-2.5 rounded-lg border ${
                        anomaly.severity === 'high' ? 'bg-red-500/10 border-red-500/30' :
                        anomaly.severity === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                        'bg-blue-500/10 border-blue-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {anomaly.type === 'spike' ? 
                            <TrendingUp className="w-4 h-4 text-red-400" /> : 
                            <TrendingDown className="w-4 h-4 text-blue-400" />
                          }
                          <span className="text-xs font-semibold text-white">{anomaly.metric}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs font-mono ${
                            anomaly.type === 'spike' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                          }`}>
                            {anomaly.value}
                          </Badge>
                          <span className="text-xs text-white/40">{anomaly.time}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Historical Graph */}
              <div>
                <div className="text-xs text-white/70 mb-2 font-semibold">Historical Trends</div>
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="time" stroke="#ffffff40" style={{ fontSize: '10px' }} />
                    <YAxis stroke="#ffffff40" style={{ fontSize: '10px' }} />
                    <Tooltip 
                      contentStyle={{ background: '#0A0E27', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}
                    />
                    <ReferenceLine x={22} stroke="#ef4444" strokeDasharray="3 3" />
                    <ReferenceLine x={18} stroke="#f59e0b" strokeDasharray="3 3" />
                    <ReferenceLine x={15} stroke="#06b6d4" strokeDasharray="3 3" />
                    <Line type="monotone" dataKey="rotorTemp" stroke="#ef4444" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}