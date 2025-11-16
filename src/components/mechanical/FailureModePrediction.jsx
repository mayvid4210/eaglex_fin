import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function FailureModePrediction({ agent }) {
  const [expanded, setExpanded] = useState(false);

  const failureModes = [
    { name: 'Battery Thermal Collapse', probability: 28 + Math.random() * 15, color: '#ef4444', icon: '🔋', mitigation: 'Reduce regen intensity, increase cooling' },
    { name: 'Brake Fade', probability: 18 + Math.random() * 12, color: '#f59e0b', icon: '🛑', mitigation: 'Earlier braking, reduce brake bias' },
    { name: 'Inverter Instability', probability: 15 + Math.random() * 10, color: '#f97316', icon: '⚡', mitigation: 'Limit power delivery spikes' },
    { name: 'Cooling Inefficiency', probability: 12 + Math.random() * 8, color: '#06b6d4', icon: '❄️', mitigation: 'Increase airflow, check radiator' }
  ];

  const topFailure = failureModes.reduce((max, mode) => mode.probability > max.probability ? mode : max);

  return (
    <Card className="bg-gradient-to-br from-orange-500/5 to-red-500/5 border-orange-500/20 hover:border-orange-500/40 transition-all">
      <CardHeader 
        className="cursor-pointer pb-3"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/20 border border-orange-500/30">
              <AlertCircle className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-white">FMECA AI</CardTitle>
              <div className="text-xs text-white/60 mt-0.5">
                Most likely: <span className="text-orange-400 font-semibold">{topFailure.name}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
              {topFailure.probability.toFixed(0)}%
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
              {/* Pie Chart */}
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={failureModes}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="probability"
                    >
                      {failureModes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: '#0A0E27', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Failure Modes List */}
              <div className="space-y-2">
                {failureModes.map((mode, idx) => (
                  <motion.div
                    key={mode.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{mode.icon}</span>
                        <span className="text-xs font-semibold text-white">{mode.name}</span>
                      </div>
                      <Badge 
                        className="font-mono" 
                        style={{ backgroundColor: mode.color + '20', color: mode.color, borderColor: mode.color + '40' }}
                      >
                        {mode.probability.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${mode.probability}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: idx * 0.1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: mode.color }}
                      />
                    </div>
                    <div className="mt-2 text-xs text-white/50">
                      <span className="text-cyan-400">↳</span> {mode.mitigation}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}