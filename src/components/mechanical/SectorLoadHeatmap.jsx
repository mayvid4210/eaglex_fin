import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SectorLoadHeatmap() {
  const [expanded, setExpanded] = useState(false);

  const sectors = [
    { id: 1, name: 'Sector 1', torque: 72, braking: 58, suspension: 45, color: '#fbbf24' },
    { id: 2, name: 'Sector 2', torque: 94, braking: 88, suspension: 82, color: '#ef4444' },
    { id: 3, name: 'Sector 3', torque: 68, braking: 75, suspension: 61, color: '#f59e0b' }
  ];

  const highLoadSector = sectors.reduce((max, s) => 
    (s.torque + s.braking + s.suspension) > (max.torque + max.braking + max.suspension) ? s : max
  );

  return (
    <Card className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/20 hover:border-purple-500/40 transition-all">
      <CardHeader 
        className="cursor-pointer pb-3"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
              <MapPin className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-white">Sector Load Heatmap</CardTitle>
              <div className="text-xs text-white/60 mt-0.5">
                High Load Sector: <span className="text-purple-400 font-semibold">{highLoadSector.name}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 font-mono">
              {((highLoadSector.torque + highLoadSector.braking + highLoadSector.suspension) / 3).toFixed(0)}%
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
              {/* Track Visualization */}
              <div className="relative h-40 bg-gradient-to-br from-white/5 to-white/0 rounded-lg border border-white/10 overflow-hidden">
                <svg viewBox="0 0 400 160" className="w-full h-full">
                  {/* Track outline */}
                  <path
                    d="M 50 80 L 120 60 L 200 50 L 280 60 L 350 80 L 350 100 L 280 120 L 200 130 L 120 120 L 50 100 Z"
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="8"
                  />
                  
                  {/* Sector 1 */}
                  <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.6 }}
                    transition={{ duration: 1 }}
                    d="M 50 80 L 120 60 L 200 50"
                    fill="none"
                    stroke={sectors[0].color}
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                  
                  {/* Sector 2 */}
                  <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.6 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    d="M 200 50 L 280 60 L 350 80"
                    fill="none"
                    stroke={sectors[1].color}
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                  
                  {/* Sector 3 */}
                  <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.6 }}
                    transition={{ duration: 1, delay: 0.4 }}
                    d="M 350 80 L 350 100 L 280 120 L 200 130 L 120 120 L 50 100 L 50 80"
                    fill="none"
                    stroke={sectors[2].color}
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Sector Stats */}
              <div className="space-y-3">
                {sectors.map((sector, idx) => (
                  <motion.div
                    key={sector.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-white">{sector.name}</span>
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sector.color }} />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <div className="text-xs text-white/50">Torque</div>
                        <div className="text-sm font-mono font-bold text-cyan-400">{sector.torque}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-white/50">Braking</div>
                        <div className="text-sm font-mono font-bold text-orange-400">{sector.braking}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-white/50">Suspension</div>
                        <div className="text-sm font-mono font-bold text-purple-400">{sector.suspension}%</div>
                      </div>
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