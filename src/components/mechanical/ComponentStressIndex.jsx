import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Gauge, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ComponentStressIndex({ agent }) {
  const [expanded, setExpanded] = useState(false);

  const components = [
    { name: 'Rotor', stress: 68 + Math.random() * 20, color: '#ef4444', icon: '🔴' },
    { name: 'Brake', stress: 55 + Math.random() * 25, color: '#f59e0b', icon: '🟠' },
    { name: 'Inverter', stress: 48 + Math.random() * 18, color: '#06b6d4', icon: '🔵' },
    { name: 'Battery', stress: 42 + Math.random() * 15, color: '#10b981', icon: '🟢' },
    { name: 'Suspension', stress: 38 + Math.random() * 12, color: '#8b5cf6', icon: '🟣' }
  ];

  const totalStress = components.reduce((sum, c) => sum + c.stress, 0);
  const avgStress = totalStress / components.length;
  const csi = Math.min(100, avgStress);

  const getStressLevel = () => {
    if (csi > 80) return { level: 'Critical', color: 'red' };
    if (csi > 60) return { level: 'High', color: 'orange' };
    if (csi > 40) return { level: 'Moderate', color: 'yellow' };
    return { level: 'Low', color: 'green' };
  };

  const stressLevel = getStressLevel();

  return (
    <Card className="bg-gradient-to-br from-cyan-500/5 to-blue-500/5 border-cyan-500/20 hover:border-cyan-500/40 transition-all">
      <CardHeader 
        className="cursor-pointer pb-3"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
              <Gauge className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-white">Component Stress Index</CardTitle>
              <div className="text-xs text-white/60 mt-0.5">
                Status: <span className={`text-${stressLevel.color}-400 font-semibold`}>{stressLevel.level}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`bg-${stressLevel.color}-500/20 text-${stressLevel.color}-400 border-${stressLevel.color}-500/30 font-mono text-lg`}>
              {csi.toFixed(0)}
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
              {/* Stress Gauge */}
              <div className="relative">
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={[{ value: csi }, { value: 100 - csi }]}
                        cx="50%"
                        cy="50%"
                        startAngle={180}
                        endAngle={0}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={0}
                        dataKey="value"
                      >
                        <Cell fill={stressLevel.color === 'red' ? '#ef4444' : stressLevel.color === 'orange' ? '#f59e0b' : stressLevel.color === 'yellow' ? '#fbbf24' : '#10b981'} />
                        <Cell fill="rgba(255,255,255,0.1)" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center mt-8">
                    <div className={`text-4xl font-mono font-bold text-${stressLevel.color}-400`}>
                      {csi.toFixed(0)}
                    </div>
                    <div className="text-xs text-white/60">CSI Score</div>
                  </div>
                </div>
              </div>

              {/* Component Breakdown */}
              <div>
                <div className="text-xs text-white/70 mb-2 font-semibold">Component Contributions</div>
                <div className="space-y-2">
                  {components.map((comp, idx) => (
                    <motion.div
                      key={comp.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <span className="text-lg">{comp.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-white/80">{comp.name}</span>
                          <span className="text-xs font-mono font-bold" style={{ color: comp.color }}>
                            {comp.stress.toFixed(0)}
                          </span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${comp.stress}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut', delay: idx * 0.1 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: comp.color }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Stress Distribution */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-xs text-white/60 mb-1">Peak Stress</div>
                  <div className="text-lg font-mono font-bold text-red-400">
                    {Math.max(...components.map(c => c.stress)).toFixed(0)}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-xs text-white/60 mb-1">Lowest Stress</div>
                  <div className="text-lg font-mono font-bold text-green-400">
                    {Math.min(...components.map(c => c.stress)).toFixed(0)}
                  </div>
                </div>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}