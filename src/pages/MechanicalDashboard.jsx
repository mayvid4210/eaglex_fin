import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Maximize2, Minimize2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import ThermalOvershootPredictor from '../components/mechanical/ThermalOvershootPredictor';
import FailureModePrediction from '../components/mechanical/FailureModePrediction';
import SectorLoadHeatmap from '../components/mechanical/SectorLoadHeatmap';
import AnomalyDetector from '../components/mechanical/AnomalyDetector';
import EnergyDegradationModel from '../components/mechanical/EnergyDegradationModel';
import ComponentStressIndex from '../components/mechanical/ComponentStressIndex';
import AIMechanicalAnalysis from '../components/mechanical/AIMechanicalAnalysis';

export default function MechanicalDashboard() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const simId = urlParams.get('id');

  const [simulation, setSimulation] = useState(null);
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [viewMode, setViewMode] = useState('compact');

  useEffect(() => {
    if (!simId) {
      navigate(createPageUrl('Landing'));
      return;
    }
    loadSimulation();
  }, [simId]);

  const loadSimulation = async () => {
    try {
      const sim = await base44.entities.Simulation.filter({ id: simId });
      if (sim && sim.length > 0) {
        setSimulation(sim[0]);
        await loadAgents(sim[0]);
      } else {
        console.error('Simulation not found');
        navigate(createPageUrl('Landing'));
      }
    } catch (error) {
      console.error('Failed to load simulation:', error);
      navigate(createPageUrl('Landing'));
    }
  };

  const loadAgents = async (sim) => {
    try {
      const agentList = await base44.entities.Agent.filter({ simulation_id: sim.id });
      if (agentList && agentList.length > 0) {
        setAgents(agentList);
        setSelectedAgent(agentList[0]);
      }
    } catch (error) {
      console.error('Failed to load agents:', error);
    }
  };

  if (!simulation) {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-purple-900/20 to-pink-900/20" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-white/10 backdrop-blur-xl bg-[#0A0E27]/80">
        <div className="max-w-[1800px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl(`FormulaEDashboard?id=${simId}`)}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <div className="text-lg font-bold">MECHANICAL INTELLIGENCE</div>
              <div className="text-xs text-white/50">AI-Powered Predictive Analytics</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Agent Selector */}
            <Tabs value={selectedAgent?.id} onValueChange={(id) => setSelectedAgent(agents.find(a => a.id === id))}>
              <TabsList className="bg-white/5">
                {agents.slice(0, 6).map(agent => (
                  <TabsTrigger key={agent.id} value={agent.id} className="text-xs">
                    {agent.agent_number}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* View Mode Toggle */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setViewMode(viewMode === 'compact' ? 'expanded' : 'compact')}
              className="gap-2 border-cyan-400/30 hover:bg-cyan-500/10"
            >
              {viewMode === 'compact' ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              {viewMode === 'compact' ? 'Expand All' : 'Collapse All'}
            </Button>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="relative z-10 max-w-[1800px] mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`grid ${viewMode === 'compact' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 lg:grid-cols-2'} gap-4`}
        >
          {/* Module 1: Thermal Overshoot Predictor */}
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0 }}
          >
            <ThermalOvershootPredictor agent={selectedAgent} />
          </motion.div>

          {/* Module 2: Failure Mode Prediction */}
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <FailureModePrediction agent={selectedAgent} />
          </motion.div>

          {/* Module 3: Sector Load Heatmap */}
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <SectorLoadHeatmap />
          </motion.div>

          {/* Module 4: Anomaly Detector */}
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <AnomalyDetector agent={selectedAgent} />
          </motion.div>

          {/* Module 5: Energy Degradation Model */}
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <EnergyDegradationModel agent={selectedAgent} />
          </motion.div>

          {/* Module 6: Component Stress Index */}
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <ComponentStressIndex agent={selectedAgent} />
          </motion.div>
        </motion.div>

        {/* AI Mechanical Analysis - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-4"
        >
          <AIMechanicalAnalysis agent={selectedAgent} />
        </motion.div>
      </div>
    </div>
  );
}