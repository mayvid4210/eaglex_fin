import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Zap, Bike, Plane, Package, TrafficCone, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';

const modes = [
  {
    id: 'formula_e',
    icon: Zap,
    title: 'Formula E',
    description: 'Mechanic-grade predictive racing on Las Vegas GP',
    color: 'from-cyan-500 to-blue-600',
    emoji: '⚡'
  },
  {
    id: 'motogp',
    icon: Bike,
    title: 'MotoGP',
    description: 'High-precision lean dynamics and tire telemetry',
    color: 'from-purple-500 to-pink-600',
    emoji: '🏍️'
  },
  {
    id: 'drone_racing',
    icon: Plane,
    title: 'Drone Racing',
    description: 'Six-DOF flight dynamics with gate navigation',
    color: 'from-green-500 to-emerald-600',
    emoji: '🚁'
  },
  {
    id: 'supply_chain',
    icon: Package,
    title: 'Supply Chain',
    description: 'Fleet optimization and predictive logistics',
    color: 'from-orange-500 to-red-600',
    emoji: '📦'
  },
  {
    id: 'traffic_system',
    icon: TrafficCone,
    title: 'Traffic System',
    description: 'Urban mobility and signal optimization',
    color: 'from-yellow-500 to-amber-600',
    emoji: '🚦'
  }
];

export default function Landing() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, 100]);
  const y2 = useTransform(scrollY, [0, 300], [0, -50]);
  const opacity = useTransform(scrollY, [0, 200], [1, 0]);

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-purple-900/20 to-pink-900/20" />
        <motion.div 
          style={{ y: y1 }}
          className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
        />
        <motion.div 
          style={{ y: y2 }}
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-magenta-500/10 rounded-full blur-3xl"
        />
        
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />
      </div>

      {/* Hero Section */}
      <motion.div 
        style={{ opacity }}
        className="relative min-h-screen flex flex-col items-center justify-center px-6"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12"
        >
          <div className="relative">
            <h1 className="text-8xl md:text-9xl font-black tracking-tighter bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              EAGLEX
            </h1>
            <motion.div
              animate={{ 
                boxShadow: ['0 0 20px rgba(6, 182, 212, 0.3)', '0 0 60px rgba(6, 182, 212, 0.6)', '0 0 20px rgba(6, 182, 212, 0.3)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-2xl -z-10"
            />
          </div>
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-light tracking-wide text-gray-300 mb-4">
            Simulate. Predict. Dominate.
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl">
            Mechanic Intelligence Layer — Turn raw telemetry into actionable insights
          </p>
        </motion.div>

        {/* Primary CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mb-20"
        >
          <div className="relative pointer-events-none">
            <Button 
              size="lg"
              className="relative group px-12 py-8 text-xl font-bold bg-gradient-to-r from-cyan-500 to-purple-600 border-0 rounded-2xl overflow-hidden cursor-default"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-white/20 to-purple-400/0"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute inset-0"
                animate={{ 
                  boxShadow: [
                    '0 0 20px rgba(6, 182, 212, 0.5)',
                    '0 0 60px rgba(168, 85, 247, 0.7)',
                    '0 0 20px rgba(6, 182, 212, 0.5)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="relative z-10 flex items-center gap-3">
                <Sparkles className="w-6 h-6" />
                START SIMULATION
                <ArrowRight className="w-6 h-6" />
              </span>
            </Button>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap">
              Select a mode below to begin
            </div>
          </div>
        </motion.div>

        {/* Mode Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-7xl w-full px-4">
          {modes.map((mode, index) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
            >
              <Link to={createPageUrl(`Setup?mode=${mode.id}`)}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -8 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-cyan-400/50 transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  {/* Hover glow */}
                  <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 from-cyan-500/10 to-purple-500/10" />
                  
                  {/* Icon with hologram effect */}
                  <div className="relative mb-4">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${mode.color} flex items-center justify-center text-3xl mb-3 group-hover:shadow-2xl group-hover:shadow-cyan-500/50 transition-shadow duration-300`}>
                      {mode.emoji}
                    </div>
                    <motion.div
                      className="absolute inset-0 rounded-xl border-2 border-cyan-400/0 group-hover:border-cyan-400/50"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        opacity: [0, 0.5, 0]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        repeatDelay: 1
                      }}
                    />
                  </div>

                  <h3 className="text-lg font-bold mb-2 relative z-10">{mode.title}</h3>
                  <p className="text-sm text-gray-400 relative z-10">{mode.description}</p>

                  {/* Arrow indicator */}
                  <motion.div
                    className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100"
                    initial={{ x: -10 }}
                    whileHover={{ x: 0 }}
                  >
                    <ArrowRight className="w-5 h-5 text-cyan-400" />
                  </motion.div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="relative py-12 border-t border-white/10 mt-20"
      >
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-8 text-sm text-gray-400">
          <a href="#" className="hover:text-cyan-400 transition-colors">Demo</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">Documentation</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">API</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">Contact</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">Terms</a>
        </div>
        <div className="text-center mt-6 text-xs text-gray-500">
          © 2024 EAGLEX — Mechanical Intelligence Layer
        </div>
      </motion.footer>
    </div>
  );
}