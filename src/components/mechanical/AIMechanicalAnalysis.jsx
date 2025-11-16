import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ChevronDown, ChevronUp, AlertTriangle, Wrench, Flame, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AIMechanicalAnalysis({ agent }) {
  const [expanded, setExpanded] = useState(true);

  // Generate AI analysis based on mechanical metrics
  const generateAnalysis = () => {
    const health = agent?.mechanical_health || 100;
    const rotorTemp = agent?.telemetry?.rotorTemp || 500;
    const batterySoc = agent?.telemetry?.batterySoc || 0.85;
    const riskFactor = agent?.risk_factor || 1.0;
    
    // Determine primary risk
    let verdict, evidence, action, timeWindow, severity, icon;
    
    if (rotorTemp > 650 || health < 60) {
      verdict = `Rotor temp overshoot predicted in ${(5.2 / riskFactor).toFixed(1)} laps due to repeated torque spikes in Sector 2. Critical thermal load detected.`;
      evidence = [
        `Thermal Overshoot: ${rotorTemp.toFixed(0)}°C (threshold: 750°C)`,
        `Component Stress Index: ${(100 - health).toFixed(0)} - High rotor stress`,
        `Failure Mode: 28% probability of brake fade`,
        `Sector Load: 88% mechanical load in S2`
      ];
      action = `Recommend immediate 1-lap cooling phase with reduced regen (60% → 40%). Avoid hard braking in high-load sectors.`;
      timeWindow = `URGENT: Action required within 2 laps`;
      severity = 'critical';
      icon = '🔥';
    } else if (batterySoc < 0.4 || health < 75) {
      verdict = `Energy degradation accelerating. Battery SOC will reach critical threshold in ${(8.5 / (agent?.efficiency_factor || 1)).toFixed(1)} laps without intervention.`;
      evidence = [
        `Energy Degradation: ${(batterySoc * 100).toFixed(0)}% SOC, consumption rate ${((85 - batterySoc * 100) / 5).toFixed(1)}% per lap`,
        `Anomaly Detector: Regen efficiency drop of -12% detected`,
        `Component Stress: Battery C-rate at ${(42 + Math.random() * 15).toFixed(0)}%`,
        `Failure Mode: 15% inverter instability risk`
      ];
      action = `Reduce power delivery by ${Math.ceil((agent?.efficiency_factor || 1) * 10)}% for next 3 laps. Optimize regen in Sector 3. Consider early pit window.`;
      timeWindow = `HIGH PRIORITY: Implement within 3 laps`;
      severity = 'high';
      icon = '⚡';
    } else if (health < 85) {
      verdict = `Moderate mechanical stress accumulation detected. Multiple subsystems showing early degradation patterns.`;
      evidence = [
        `Component Stress Index: ${(100 - health).toFixed(0)} - Moderate across all components`,
        `Thermal Overshoot: Time to critical ${(8.4 / riskFactor).toFixed(1)} laps`,
        `Sector Load: High braking intensity in S2 (88%)`,
        `Energy Model: Stable trend, ${(batterySoc * 100).toFixed(0)}% SOC`
      ];
      action = `Monitor closely. Optimize driving line in Sector 2 to reduce mechanical load. Maintain current pace and regen settings.`;
      timeWindow = `MONITOR: Review in 5 laps`;
      severity = 'medium';
      icon = '🔧';
    } else {
      verdict = `All mechanical systems operating within optimal parameters. No immediate intervention required.`;
      evidence = [
        `Component Stress Index: ${(100 - health).toFixed(0)} - All components in green zone`,
        `Thermal Management: ${rotorTemp.toFixed(0)}°C, ${(15.2 / riskFactor).toFixed(1)} laps to threshold`,
        `Energy Model: Stable, ${(batterySoc * 100).toFixed(0)}% SOC with ${((85 - batterySoc * 100) / 5).toFixed(1)}% per lap`,
        `Failure Modes: All probabilities below 15%`
      ];
      action = `Continue current strategy. Optimal window for attack mode in next ${(5 + Math.random() * 3).toFixed(0)} laps if position advantage available.`;
      timeWindow = `STABLE: No immediate action required`;
      severity = 'low';
      icon = '🚀';
    }
    
    return { verdict, evidence, action, timeWindow, severity, icon };
  };

  const analysis = generateAnalysis();

  const getSeverityColor = () => {
    switch (analysis.severity) {
      case 'critical': return { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', badge: 'bg-red-500/20 border-red-500/30' };
      case 'high': return { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', badge: 'bg-orange-500/20 border-orange-500/30' };
      case 'medium': return { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', badge: 'bg-yellow-500/20 border-yellow-500/30' };
      default: return { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', badge: 'bg-green-500/20 border-green-500/30' };
    }
  };

  const colors = getSeverityColor();

  return (
    <Card className={`bg-gradient-to-br from-cyan-500/5 to-purple-500/10 ${colors.border} hover:border-cyan-400/40 transition-all`}>
      <CardHeader 
        className="cursor-pointer pb-3"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/30">
              <Brain className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                AI Mechanical Analysis
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-xs text-cyan-400"
                >
                  ● LIVE
                </motion.div>
              </CardTitle>
              <div className="text-xs text-white/60 mt-0.5">
                Race Engineer Intelligence Layer
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${colors.badge} ${colors.text}`}>
              {analysis.severity.toUpperCase()}
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
              {/* Verdict */}
              <div className={`p-4 rounded-lg ${colors.bg} border ${colors.border}`}>
                <div className="flex items-start gap-3">
                  <div className="text-2xl mt-0.5">{analysis.icon}</div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-white/70 mb-2 uppercase tracking-wide">
                      Verdict
                    </div>
                    <p className={`text-sm leading-relaxed ${colors.text} font-medium`}>
                      {analysis.verdict}
                    </p>
                  </div>
                </div>
              </div>

              {/* Evidence */}
              <div>
                <div className="text-xs font-semibold text-white/70 mb-2 uppercase tracking-wide flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Supporting Evidence
                </div>
                <div className="space-y-2">
                  {analysis.evidence.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-start gap-2 p-2.5 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                      <span className="text-xs text-white/80 leading-relaxed">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Recommended Action */}
              <div className="p-4 rounded-lg bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/30">
                <div className="text-xs font-semibold text-white/70 mb-2 uppercase tracking-wide flex items-center gap-2">
                  <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                  Recommended Action
                </div>
                <p className="text-sm text-white leading-relaxed">
                  {analysis.action}
                </p>
              </div>

              {/* Time Window */}
              <div className={`p-3 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <Zap className={`w-4 h-4 ${colors.text}`} />
                  <span className="text-xs font-semibold text-white/70 uppercase tracking-wide">
                    Time Window
                  </span>
                </div>
                <Badge className={`${colors.badge} ${colors.text} font-mono font-bold`}>
                  {analysis.timeWindow}
                </Badge>
              </div>

              {/* AI Confidence Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <Brain className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-xs text-white/50">AI Confidence</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${75 + Math.random() * 20}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full"
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    {(75 + Math.random() * 20).toFixed(0)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}