import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Pause, RotateCcw, Settings, Gauge, Activity, AlertCircle, TrendingUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { base44 } from '@/api/base44Client';
import InteractiveMap from '../components/simulation/InteractiveMap';
import LiveLeaderboard from '../components/simulation/LiveLeaderboard';
import MechanicPanel from '../components/simulation/MechanicPanel';
import SimulationEngine from '../components/simulation/SimulationEngine';

export default function Simulation() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const simId = urlParams.get('id');
  const mode = urlParams.get('mode');

  const [simulation, setSimulation] = useState(null);
  const [agents, setAgents] = useState([]);
  const [events, setEvents] = useState([]);
  const [strategies, setStrategies] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const engineRef = useRef(null);

  // Route to mode-specific dashboard
  useEffect(() => {
    if (!simId) {
      navigate(createPageUrl('Landing'));
      return;
    }

    const loadSimulation = async () => {
      try {
        const sim = await base44.entities.Simulation.filter({ id: simId });
        if (sim && sim.length > 0) {
          const simMode = sim[0].mode;
          
          // Route to appropriate dashboard
          if (simMode === 'formula_e') {
            navigate(createPageUrl(`FormulaEDashboard?id=${simId}`));
          } else if (simMode === 'motogp') {
            navigate(createPageUrl(`MotoGPDashboard?id=${simId}`));
          } else if (simMode === 'drone_racing') {
            navigate(createPageUrl(`DroneDashboard?id=${simId}`));
          } else if (simMode === 'supply_chain') {
            navigate(createPageUrl(`SupplyChainDashboard?id=${simId}`));
          } else if (simMode === 'traffic_system') {
            navigate(createPageUrl(`TrafficDashboard?id=${simId}`));
          } else {
            // Fallback to Formula E
            navigate(createPageUrl(`FormulaEDashboard?id=${simId}`));
          }
        }
      } catch (error) {
        console.error('Failed to load simulation:', error);
      }
    };

    loadSimulation();
  }, [simId]);

  const initializeAgents = async (sim) => {
    if (!sim || !sim.id) return;
    
    const numAgents = sim.settings?.num_agents || 6;
    const mode = sim.mode;
    
    const newAgents = [];
    for (let i = 0; i < numAgents; i++) {
      const agentNum = String(i + 1).padStart(2, '0');
      const agent = await base44.entities.Agent.create({
        simulation_id: sim.id,
        agent_number: `CAR${agentNum}`,
        team_name: `Team ${String.fromCharCode(65 + i)}`,
        driver_name: `Driver ${i + 1}`,
        position: {
          x: 100 + i * 30,
          y: 200,
          z: 0,
          sector: 1,
          lap: 0,
          heading: 45
        },
        rank: i + 1,
        race_time: 0,
        mechanical_health: 100 - Math.random() * 10,
        time_to_critical: 15 + Math.random() * 10,
        service_load: Math.random() * 5,
        dnf_risk: Math.random() * 15,
        pit_status: 'on_track',
        telemetry: {
          speed: 250 + Math.random() * 50,
          throttle: 0.8 + Math.random() * 0.2,
          brakePressure: 0,
          rotorTemp: 500 + Math.random() * 100,
          batterySoc: 0.8 + Math.random() * 0.2
        }
      });
      newAgents.push(agent);
    }
    
    setAgents(newAgents);

    // Generate some initial events
    setTimeout(() => generateInitialEvents(newAgents), 3000);
  };

  const generateInitialEvents = async (agentList) => {
    if (!simulation || !simulation.id) return;
    
    const eventTypes = ['thermal_surge', 'bottom_out', 'sensor_drift', 'cross_thread'];
    const criticalAgents = agentList.filter(a => a && a.mechanical_health < 95).slice(0, 2);
    
    for (const agent of criticalAgents) {
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const severity = 0.4 + Math.random() * 0.4;
      
      const event = await base44.entities.Event.create({
        simulation_id: simulation.id,
        agent_id: agent.id,
        event_type: eventType,
        severity,
        trigger_signals: ['rotor_temp', 'brake_pressure', 'throttle'],
        time_to_critical: 5 + Math.random() * 10,
        service_time: 3 + Math.random() * 7,
        fail_probability: severity * 100,
        prognosis: `Component degradation detected. Estimated failure in ${(5 + Math.random() * 10).toFixed(1)} laps if not addressed.`,
        recommendation: severity > 0.6 ? 'Emergency pit stop recommended' : 'Monitor closely and pit at next opportunity',
        action_type: severity > 0.7 ? 'emergency_pit' : 'monitor',
        confidence: 0.8 + Math.random() * 0.2,
        status: 'active',
        sim_time: 0
      });
      
      setEvents(prev => [...prev, event]);
    }

    // Generate AI strategies
    generateStrategies(criticalAgents);
  };

  const generateStrategies = async (agentList) => {
    if (!simulation || !simulation.id) return;
    
    // Generate strategies for ALL agents
    for (const agent of agentList) {
      if (!agent || !agent.id) continue;
      
      const isCritical = agent.mechanical_health < 70;
      const strategy = await base44.entities.AIStrategy.create({
        simulation_id: simulation.id,
        agent_id: agent.id,
        strategy_type: 'pit_advisor',
        recommendation: isCritical ? 'Box now — TtC < 0.8 laps, thermal surge imminent' : 'Pit in 3-5 laps during optimal window',
        reasons: [
          `Mechanical health at ${agent.mechanical_health.toFixed(0)}%`,
          'Competitor pit window opening in sector 2',
          'Expected service load: 6.2 minutes'
        ],
        detailed_reasons: [
          { metric: 'Thermal Surge Probability', current_value: `${(60 + Math.random() * 30).toFixed(0)}%`, threshold: '60%', explanation: 'Rotor temperature rising rapidly - glazing risk imminent' },
          { metric: 'Rotor ΔT', current_value: `+${(80 + Math.random() * 50).toFixed(0)}°C in 4.9s`, threshold: '80°C/6s', explanation: 'Severe thermal gradient detected - brake failure risk high' },
          { metric: 'Opponent Pit Window', current_value: 'Lap 18', threshold: 'Lap 20', explanation: 'Rival predicted to pit in 2 laps - undercut opportunity' },
          { metric: 'Undercut Delta', current_value: '+1.14s', threshold: '+0.8s', explanation: 'Strategic advantage available with early pit stop' },
          { metric: 'Tyre Drop-Off', current_value: '+0.3s/lap', threshold: '+0.2s/lap', explanation: 'Performance degrading - optimal pit window closing' },
          { metric: 'Safety Car Probability', current_value: '24%', threshold: '15%', explanation: 'Elevated incident risk - potential free stop if delayed 1 lap' }
        ],
        confidence: 0.75 + Math.random() * 0.2,
        priority: isCritical ? 'high' : 'medium',
        expected_impact: {
          position_delta: -2,
          time_delta: 24.5,
          risk_delta: -35
        },
        action_cta: isCritical ? 'EXECUTE: PIT NOW' : 'Plan Pit Stop',
        time_window: '2 sectors',
        sim_time: 0
      });
      
      setStrategies(prev => [...prev, strategy]);
    }
  };

  const handlePlayPause = async () => {
    setIsPlaying(!isPlaying);
    if (simulation) {
      await base44.entities.Simulation.update(simulation.id, {
        status: isPlaying ? 'paused' : 'running'
      });
    }
  };

  const handleSpeedChange = async (value) => {
    setSpeedMultiplier(value);
    if (simulation) {
      await base44.entities.Simulation.update(simulation.id, {
        speed_multiplier: value
      });
    }
  };

  const handleAgentSelect = (agent) => {
    setSelectedAgent(agent);
  };

  const handleAction = async (action) => {
    console.log('Action triggered:', action);
    // Implement action handling
  };

  if (!simulation) {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center">
        <Activity className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  const globalStats = simulation.global_stats || {};

  return (
    <div className="h-screen bg-[#0A0E27] text-white flex flex-col overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-purple-900/20 to-pink-900/20" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />
      </div>

      {/* Top Navigation Bar */}
      <div className="relative z-10 border-b border-white/10 backdrop-blur-xl bg-[#0A0E27]/80">
        <div className="px-6 py-2.5 flex items-center justify-between">
          {/* Left: Logo & Back */}
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Landing')}>
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="text-lg font-bold text-white">
              EAGLEX
            </div>
            <div className="text-xs text-white/50">/ {simulation.mode.replace('_', ' ').toUpperCase()}</div>
          </div>

          {/* Center: Global Stats */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Gauge className="w-3.5 h-3.5 text-green-400" />
              <div>
                <div className="text-xs text-white/50">Health</div>
                <div className="text-sm font-semibold text-white">
                  {agents.length > 0 
                    ? (agents.reduce((sum, a) => sum + (a.mechanical_health || 100), 0) / agents.length).toFixed(0)
                    : 100}%
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-yellow-400" />
              <div>
                <div className="text-xs text-white/50">TtC</div>
                <div className="text-sm font-semibold text-white">
                  {agents.length > 0 
                    ? Math.min(...agents.map(a => a.time_to_critical || 999)).toFixed(1)
                    : '--'}L
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
              <div>
                <div className="text-xs text-white/50">Risk</div>
                <div className="text-sm font-semibold text-white">
                  {agents.length > 0 
                    ? Math.max(...agents.map(a => a.dnf_risk || 0)).toFixed(0)
                    : 0}%
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <div>
                <div className="text-xs text-white/50">Service</div>
                <div className="text-sm font-semibold text-white">
                  {agents.length > 0 
                    ? agents.reduce((sum, a) => sum + (a.service_load || 0), 0).toFixed(0)
                    : 0}m
                </div>
              </div>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
              <span className="text-xs text-white/50">Speed:</span>
              <button
                onClick={() => handleSpeedChange(0.5)}
                className={`px-2 py-0.5 rounded text-xs ${speedMultiplier === 0.5 ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400'}`}
              >
                0.5x
              </button>
              <button
                onClick={() => handleSpeedChange(1)}
                className={`px-2 py-0.5 rounded text-xs ${speedMultiplier === 1 ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400'}`}
              >
                1x
              </button>
              <button
                onClick={() => handleSpeedChange(2)}
                className={`px-2 py-0.5 rounded text-xs ${speedMultiplier === 2 ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400'}`}
              >
                2x
              </button>
            </div>
            <Button
              size="sm"
              variant={isPlaying ? 'default' : 'outline'}
              onClick={handlePlayPause}
              className="gap-2 bg-cyan-500 hover:bg-cyan-600 text-white border-cyan-400"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="relative flex-1 flex gap-3 p-3 overflow-hidden">
        {/* Left: Interactive Map */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1"
        >
          <InteractiveMap
            agents={agents}
            events={events}
            onAgentClick={handleAgentSelect}
            mode={simulation.mode}
          />
        </motion.div>

        {/* Center: Live Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-[450px]"
        >
          <LiveLeaderboard
            agents={agents}
            events={events}
            onAgentSelect={handleAgentSelect}
          />
        </motion.div>

        {/* Right: Mechanic Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="w-[380px]"
        >
          <MechanicPanel
            agent={selectedAgent}
            events={events}
            strategies={strategies}
            onAction={handleAction}
          />
        </motion.div>
      </div>

      {/* Simulation Engine (hidden, runs in background) */}
      <SimulationEngine
        ref={engineRef}
        simulation={simulation}
        agents={agents}
        isPlaying={isPlaying}
        speedMultiplier={speedMultiplier}
        onAgentsUpdate={setAgents}
        onEventsUpdate={(newEvents) => setEvents(prev => [...prev, ...newEvents])}
      />
    </div>
  );
}