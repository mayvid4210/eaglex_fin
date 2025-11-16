import React from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Clock, Target, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function AIStrategyDetailed({ strategy, onExecute }) {
  if (!strategy) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <Brain className="w-12 h-12 mx-auto mb-3 opacity-50 animate-pulse" />
          <div className="text-sm">Computing optimal strategy...</div>
        </div>
      </div>
    );
  }

  const confidence = strategy.confidence || 0.85;
  const reasons = strategy.detailed_reasons || strategy.reasons || [
    { metric: 'Thermal Surge Probability', current_value: '82%', threshold: '60%', explanation: 'Rotor temperature rising rapidly - glazing risk imminent' },
    { metric: 'Rotor ΔT', current_value: '+112°C in 4.9s', threshold: '80°C/6s', explanation: 'Severe thermal gradient detected - brake failure risk high' },
    { metric: 'Opponent Pit Window', current_value: 'Lap 18', threshold: 'Lap 20', explanation: 'Rival predicted to pit in 2 laps - undercut opportunity' },
    { metric: 'Undercut Delta', current_value: '+1.14s', threshold: '+0.8s', explanation: 'Strategic advantage available with early pit stop' },
  ];
  const alternatives = strategy.alternatives || [];
  const risks = strategy.risks || [];

  return (
    <div className="space-y-4">
      {/* Section A: Primary Recommendation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative"
      >
        <Card className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 backdrop-blur-md border-cyan-400/50 shadow-2xl shadow-cyan-500/30 overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/10 to-cyan-400/0"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
          <CardHeader className="relative z-10">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl text-white font-bold mb-2">
                  {strategy.recommendation || 'Strategic Recommendation'}
                </CardTitle>
                <div className="text-sm text-cyan-400 font-medium">
                  Execute within next {strategy.time_window || '2 sectors'}
                </div>
              </div>
              <Badge className="bg-cyan-500/30 text-cyan-400 border-cyan-400/50 text-lg px-3 py-1">
                {(confidence * 100).toFixed(0)}% Confidence
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <Progress value={confidence * 100} className="h-2 mb-3" />
            <div className="flex items-center gap-2 text-xs text-white/70">
              <Clock className="w-4 h-4" />
              <span>AI Model: Hybrid ML + Rule-based | Last updated: 0.2s ago</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Section B: Reason Breakdown */}
      <Card className="bg-white/5 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400" />
            Detailed Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {reasons.length > 0 ? (
            reasons.map((reason, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-400/30 transition-all"
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="text-sm font-semibold text-white">{reason.metric || reason}</span>
                  {reason.current_value && (
                    <Badge variant="outline" className="text-xs bg-cyan-500/20 text-cyan-400 border-cyan-400/30">
                      {reason.current_value}
                    </Badge>
                  )}
                </div>
                {reason.threshold && (
                  <div className="text-xs text-gray-400 mb-1">
                    Threshold: {reason.threshold}
                  </div>
                )}
                {reason.explanation && (
                  <div className="text-xs text-gray-300 leading-relaxed">
                    {reason.explanation}
                  </div>
                )}
                {!reason.metric && typeof reason === 'string' && (
                  <div className="text-xs text-gray-300">{reason}</div>
                )}
              </motion.div>
            ))
          ) : (
            // Fallback detailed reasons
            [
              { metric: 'Thermal Surge Probability', current_value: '82%', threshold: '60%', explanation: 'Rotor temperature rising rapidly - glazing risk imminent' },
              { metric: 'Rotor ΔT', current_value: '+112°C in 4.9s', threshold: '80°C/6s', explanation: 'Severe thermal gradient detected - brake failure risk high' },
              { metric: 'Opponent Pit Window', current_value: 'Lap 18', threshold: 'Lap 20', explanation: 'Rival predicted to pit in 2 laps - undercut opportunity' },
              { metric: 'Undercut Delta', current_value: '+1.14s', threshold: '+0.8s', explanation: 'Strategic advantage available with early pit stop' },
              { metric: 'Tyre Drop-Off', current_value: '+0.3s/lap', threshold: '+0.2s/lap', explanation: 'Performance degrading - optimal pit window closing' },
              { metric: 'Safety Car Probability', current_value: '24%', threshold: '15%', explanation: 'Elevated incident risk - potential free stop if delayed 1 lap' }
            ].map((reason, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-400/30 transition-all"
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="text-sm font-semibold text-white">{reason.metric}</span>
                  <Badge variant="outline" className="text-xs bg-cyan-500/20 text-cyan-400 border-cyan-400/30">
                    {reason.current_value}
                  </Badge>
                </div>
                <div className="text-xs text-gray-400 mb-1">
                  Threshold: {reason.threshold}
                </div>
                <div className="text-xs text-gray-300 leading-relaxed">
                  {reason.explanation}
                </div>
              </motion.div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Section C: Predictive Timing Chart */}
      <Card className="bg-white/5 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            Next 5 Laps Prediction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24 relative">
            {/* Mini sparkline */}
            <svg className="w-full h-full" viewBox="0 0 200 60">
              <defs>
                <linearGradient id="gradient-area" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(6, 182, 212, 0.3)" />
                  <stop offset="100%" stopColor="rgba(6, 182, 212, 0)" />
                </linearGradient>
              </defs>
              
              {/* Degradation slope */}
              <path
                d="M 0,20 L 40,22 L 80,26 L 120,32 L 160,42 L 200,55"
                fill="none"
                stroke="rgba(239, 68, 68, 0.6)"
                strokeWidth="2"
                strokeDasharray="4 2"
              />
              
              {/* Pace prediction */}
              <path
                d="M 0,30 L 40,28 L 80,27 L 120,30 L 160,35 L 200,45"
                fill="url(#gradient-area)"
              />
              <path
                d="M 0,30 L 40,28 L 80,27 L 120,30 L 160,35 L 200,45"
                fill="none"
                stroke="rgba(6, 182, 212, 0.8)"
                strokeWidth="2"
              />
              
              {/* Optimal pit window shading */}
              <rect x="80" y="0" width="40" height="60" fill="rgba(168, 85, 247, 0.2)" />
              
              {/* Current position */}
              <circle cx="0" cy="30" r="3" fill="#06b6d4" />
            </svg>
            
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
              <span>Now</span>
              <span className="text-purple-400">Optimal</span>
              <span>+5 Laps</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section D: Alternative Strategies */}
      {alternatives.length > 0 && (
        <Card className="bg-white/5 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle className="text-sm text-white">Alternative Strategies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alternatives.map((alt, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">{alt.label}</div>
                    <div className="text-xs text-gray-400 mt-1">{alt.description}</div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {(alt.confidence * 100).toFixed(0)}%
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Section E: Risks & Consequences */}
      <Card className="bg-red-500/10 backdrop-blur-md border-red-500/30">
        <CardHeader>
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-red-400 font-semibold">If you DO NOT pit:</span>
                <span className="text-gray-300 ml-1">
                  TtC = 0.6 laps → Failure probability 88% → DNF likely
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-green-400 font-semibold">If you pit now:</span>
                <span className="text-gray-300 ml-1">
                  Risk reduced to 12% → Expected position loss: -2 → Recovery time: 6 laps
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section F: Final Recommendation CTA */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          onClick={() => onExecute?.(strategy)}
          className="w-full py-6 text-lg font-bold bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 border-0 shadow-2xl shadow-cyan-500/50 hover:shadow-cyan-500/70 transition-all relative overflow-hidden group"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-white/20 to-purple-400/0"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
          <span className="relative z-10 flex items-center justify-center gap-2">
            <Zap className="w-5 h-5" />
            {strategy.action_cta || 'EXECUTE: PIT NOW'}
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              →
            </motion.div>
          </span>
        </Button>
      </motion.div>
    </div>
  );
}