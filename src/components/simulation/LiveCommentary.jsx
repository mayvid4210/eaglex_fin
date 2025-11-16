import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const COMMENTARY_TEMPLATES = [
  (agent) => `${agent.agent_number} entering high-risk thermal zone — rotor temp rising +${Math.floor(Math.random() * 100 + 50)}°C/sec.`,
  (agent) => `Undercut opportunity forming for ${agent.agent_number} — rival pitting next lap.`,
  (agent) => `${agent.agent_number} experiencing stability issues — correction required.`,
  (agent) => `Critical mechanical alert: ${agent.agent_number} health at ${agent.mechanical_health?.toFixed(0)}% — pit window opening.`,
  (agent) => `${agent.agent_number} optimal pit window: execute in next 2-3 laps.`,
  (agent) => `Predictive analysis: ${agent.agent_number} DNF probability increased to ${agent.dnf_risk?.toFixed(0)}%.`,
  (agent) => `${agent.agent_number} brake temp spike detected — glazing risk imminent.`,
  (agent) => `Strategic advantage: ${agent.agent_number} can gain +1.2s with early pit stop.`,
  (agent) => `${agent.agent_number} lap time degrading — tire performance falling +0.3s per lap.`,
  (agent) => `${agent.agent_number} mechanical health critical — immediate action recommended.`,
];

export default function LiveCommentary({ agents = [], events = [], enabled = true }) {
  const [currentCommentary, setCurrentCommentary] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled || agents.length === 0) {
      setVisible(false);
      return;
    }

    const generateCommentary = () => {
      // Select any random agent for commentary
      const agent = agents[Math.floor(Math.random() * agents.length)];
      if (!agent) return;

      const template = COMMENTARY_TEMPLATES[Math.floor(Math.random() * COMMENTARY_TEMPLATES.length)];
      const commentary = template(agent);

      setCurrentCommentary(commentary);
      setVisible(true);

      // Hide after 6 seconds
      setTimeout(() => setVisible(false), 6000);
    };

    // Generate commentary every 10 seconds
    const interval = setInterval(generateCommentary, 10000);
    
    // Initial commentary after 2 seconds
    const initialTimeout = setTimeout(generateCommentary, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, [agents, events, enabled]);

  if (!enabled) return null;

  return (
    <AnimatePresence>
      {visible && currentCommentary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4 }}
          className="absolute bottom-4 left-4 right-4 z-20"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-xl" />
            <div className="relative bg-black/60 backdrop-blur-xl border border-cyan-400/50 rounded-xl p-4 shadow-2xl shadow-cyan-500/30">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-cyan-400"
                  />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-cyan-400 mb-1">AI COMMENTARY</div>
                  <div className="text-sm text-white leading-relaxed font-medium">
                    {currentCommentary}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}