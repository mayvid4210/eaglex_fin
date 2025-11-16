import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Pause, Battery, Zap, Gauge, Flame, Wind } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import InteractiveMap from '../components/simulation/InteractiveMap';
import LiveLeaderboard from '../components/simulation/LiveLeaderboard';
import MechanicPanel from '../components/simulation/MechanicPanel';
import SimulationEngine from '../components/simulation/SimulationEngine';

export default function FormulaEDashboard() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const simId = urlParams.get('id');

  const [simulation, setSimulation] = useState(null);
  const [agents, setAgents] = useState([]);
  const [events, setEvents] = useState([]);
  const [strategies, setStrategies] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const engineRef = useRef(null);

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
        
        // Check if agents already exist to avoid duplicate creation
        const existingAgents = await base44.entities.Agent.filter({ simulation_id: sim[0].id });
        if (existingAgents && existingAgents.length > 0) {
          setAgents(existingAgents);
          setTimeout(() => generateEvents(existingAgents, sim[0]), 1000);
        } else {
          await initializeAgents(sim[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load simulation:', error);
      navigate(createPageUrl('Landing'));
    }
  };

  const initializeAgents = async (sim) => {
    try {
      const numAgents = sim.settings?.num_agents || 6;
      const newAgents = [];
      
      // Read settings
      const driverStyle = sim.settings?.driver_style || 'balanced';
      const energyTarget = sim.settings?.energy_target || 70;
      const tireCompound = sim.settings?.tire_compound || 'medium';
      const regenStrategy = sim.settings?.regen_strategy || 'auto';
      
      for (let i = 0; i < numAgents; i++) {
      // Create Driver entity
      const driver = await base44.entities.Driver.create({
        simulation_id: sim.id,
        driver_number: `D${String(i + 1).padStart(2, '0')}`,
        driver_name: `Driver ${i + 1}`,
        team_name: `Team ${String.fromCharCode(65 + i)}`,
        style: i === 0 ? driverStyle : ['aggressive', 'balanced', 'conservative'][i % 3],
        skill_rating: 0.7 + Math.random() * 0.3,
        energy_target: i === 0 ? energyTarget : 60 + Math.random() * 30,
        current_position: i + 1,
        current_lap: 0
      });
      
      // Create Car entity
      const car = await base44.entities.Car.create({
        simulation_id: sim.id,
        driver_id: driver.id,
        car_number: `CAR${String(i + 1).padStart(2, '0')}`,
        model: sim.settings?.car_model || 'gen3',
        tire_compound: i === 0 ? tireCompound : ['soft', 'medium', 'hard'][i % 3],
        regen_strategy: i === 0 ? regenStrategy : 'auto',
        battery_capacity_kwh: 54,
        mechanical_health: 100,
        battery_soc: 95 + Math.random() * 5
      });
      
      // Generate unique multipliers per agent
      const aggressionFactor = 0.8 + Math.random() * 0.4;  // 0.8-1.2
      const efficiencyFactor = 0.85 + Math.random() * 0.3; // 0.85-1.15
      const heatFactor = 0.9 + Math.random() * 0.3;        // 0.9-1.2
      const brakeFactor = 0.85 + Math.random() * 0.3;      // 0.85-1.15
      const riskFactor = 0.8 + Math.random() * 0.5;        // 0.8-1.3
      
      // Create Agent for frontend compatibility
      const agent = await base44.entities.Agent.create({
        simulation_id: sim.id,
        agent_number: car.car_number,
        team_name: driver.team_name,
        driver_name: driver.driver_name,
        position: { x: 100 + i * 30, y: 200, z: 0, sector: 1, lap: 1, heading: 45 },
        rank: i + 1,
        race_time: 0,
        last_lap_time: 89 + Math.random() * 5,
        best_lap_time: 89 + Math.random() * 5,
        mechanical_health: 95 + Math.random() * 5,
        time_to_critical: 12 + Math.random() * 8,
        service_load: Math.random() * 3,
        dnf_risk: 5 + Math.random() * 10,
        pit_status: 'on_track',
        telemetry: { 
          speed: 240 + Math.random() * 60, 
          batterySoc: (90 + Math.random() * 10) / 100, 
          rotorTemp: 450 + Math.random() * 150 
        },
        driver_id: driver.id,
        car_id: car.id,
        personality: driver.style,
        aggression_factor: aggressionFactor,
        efficiency_factor: efficiencyFactor,
        heat_factor: heatFactor,
        brake_factor: brakeFactor,
        risk_factor: riskFactor
      });
      
      newAgents.push(agent);
    }
    
    setAgents(newAgents);
    setTimeout(() => generateEvents(newAgents, sim), 3000);
    } catch (error) {
      console.error('Failed to initialize agents:', error);
    }
  };

  const generateEvents = async (agentList, sim) => {
    const criticalAgents = agentList.filter(a => a.mechanical_health < 95).slice(0, 2);
    for (const agent of criticalAgents) {
      const event = await base44.entities.Event.create({
        simulation_id: sim.id,
        agent_id: agent.id,
        event_type: ['thermal_surge', 'bottom_out', 'sensor_drift'][Math.floor(Math.random() * 3)],
        severity: 0.4 + Math.random() * 0.4,
        status: 'active'
      });
      setEvents(prev => [...prev, event]);
    }
    
    for (const agent of agentList) {
      const riskMult = agent.risk_factor || 1.0;
      const efficiencyMult = agent.efficiency_factor || 1.0;
      const health = agent.mechanical_health || 100;
      const batterySoc = agent.telemetry?.batterySoc || 0.85;
      
      let strategyType, recommendation, priority;
      
      if (health < 60 || riskMult > 1.15) {
        strategyType = 'pit_advisor';
        recommendation = `Pit stop recommended in ${Math.ceil(3 / riskMult)} laps - ${health < 60 ? 'critical wear' : 'high failure risk'}`;
        priority = 'critical';
      } else if (batterySoc < 0.3 || efficiencyMult > 1.1) {
        strategyType = 'conserve_energy';
        recommendation = `Reduce power by ${Math.ceil(efficiencyMult * 10)}% - energy critical`;
        priority = 'high';
      } else if (health < 80) {
        strategyType = 'tactical_coach';
        recommendation = `Monitor closely - pit window opens in ${Math.ceil(8 / riskMult)} laps`;
        priority = 'medium';
      } else {
        strategyType = 'attack_mode';
        recommendation = `Maintain pace - optimal window for overtake in ${Math.ceil(5 + Math.random() * 3)} laps`;
        priority = 'low';
      }
      
      const strategy = await base44.entities.AIStrategy.create({
        simulation_id: sim.id,
        agent_id: agent.id,
        strategy_type: strategyType,
        recommendation: recommendation,
        reasons: [
          `Health: ${health.toFixed(0)}% (risk factor: ${riskMult.toFixed(2)}x)`,
          `Battery: ${(batterySoc * 100).toFixed(0)}% (efficiency: ${efficiencyMult.toFixed(2)}x)`,
          `DNF Risk: ${(agent.dnf_risk || 0).toFixed(0)}%`,
          `Heat: ${(agent.heat_factor || 1.0).toFixed(2)}x, Brake: ${(agent.brake_factor || 1.0).toFixed(2)}x`
        ],
        confidence: 0.70 + Math.random() * 0.25,
        priority: priority
      });
      setStrategies(prev => [...prev, strategy]);
    }
  };

  if (!simulation) return <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center"><div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="h-screen bg-[#0A0E27] text-white flex flex-col overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-purple-900/20 to-pink-900/20" />
      </div>

      <div className="relative z-10 border-b border-white/10 backdrop-blur-xl bg-[#0A0E27]/80">
        <div className="px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Landing')}><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
            <div className="text-lg font-bold text-white">EAGLEX</div>
            <div className="text-xs text-white/50">/ FORMULA E</div>
            <Link to={createPageUrl(`MechanicalDashboard?id=${simulation.id}`)}>
              <Button size="sm" variant="outline" className="gap-2 border-cyan-400/30 hover:bg-cyan-500/10 text-cyan-400">
                <Gauge className="w-4 h-4" />
                Mechanical AI
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2"><Battery className="w-3.5 h-3.5 text-green-400" /><div><div className="text-xs text-white/50">Avg Battery</div><div className="text-sm font-semibold text-white">{agents.length > 0 ? ((agents.reduce((s, a) => s + (a.telemetry?.batterySoc || 0.8), 0) / agents.length) * 100).toFixed(0) : 80}%</div></div></div>
            <div className="flex items-center gap-2"><Flame className="w-3.5 h-3.5 text-red-400" /><div><div className="text-xs text-white/50">Max Rotor Temp</div><div className="text-sm font-semibold text-white">{agents.length > 0 ? Math.max(...agents.map(a => a.telemetry?.rotorTemp || 500)).toFixed(0) : 500}°C</div></div></div>
            <div className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-yellow-400" /><div><div className="text-xs text-white/50">Attack Mode</div><div className="text-sm font-semibold text-white">{agents.filter(a => Math.random() > 0.7).length}</div></div></div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
              <span className="text-xs text-white/50">Speed:</span>
              {[0.5, 1, 2].map(s => <button key={s} onClick={() => setSpeedMultiplier(s)} className={`px-2 py-0.5 rounded text-xs ${speedMultiplier === s ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400'}`}>{s}x</button>)}
            </div>
            <Button size="sm" onClick={() => setIsPlaying(!isPlaying)} className="gap-2 bg-cyan-500 hover:bg-cyan-600 text-white border-cyan-400">{isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}{isPlaying ? 'Pause' : 'Play'}</Button>
          </div>
        </div>
      </div>

      <div className="relative flex-1 flex gap-3 p-3 overflow-hidden">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1"><InteractiveMap agents={agents} events={events} onAgentClick={setSelectedAgent} mode="formula_e" /></motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="w-[450px]"><LiveLeaderboard agents={agents} events={events} onAgentSelect={setSelectedAgent} /></motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="w-[380px]"><MechanicPanel agent={selectedAgent} events={events} strategies={strategies} /></motion.div>
      </div>

      <SimulationEngine ref={engineRef} simulation={simulation} agents={agents} isPlaying={isPlaying} speedMultiplier={speedMultiplier} onAgentsUpdate={setAgents} onEventsUpdate={(e) => setEvents(prev => [...prev, ...e])} />
    </div>
  );
}