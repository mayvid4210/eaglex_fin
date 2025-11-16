import React, { useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import { base44 } from '@/api/base44Client';

// Las Vegas GP track path (simplified)
const TRACK_PATH = [
  { x: 100, y: 200, sector: 1 },
  { x: 150, y: 180, sector: 1 },
  { x: 200, y: 170, sector: 1 },
  { x: 250, y: 160, sector: 1 },
  { x: 300, y: 155, sector: 1 },
  { x: 350, y: 160, sector: 1 },
  { x: 400, y: 180, sector: 1 },
  { x: 450, y: 210, sector: 2 },
  { x: 480, y: 250, sector: 2 },
  { x: 490, y: 300, sector: 2 },
  { x: 480, y: 350, sector: 2 },
  { x: 450, y: 390, sector: 2 },
  { x: 400, y: 420, sector: 2 },
  { x: 350, y: 430, sector: 2 },
  { x: 300, y: 425, sector: 3 },
  { x: 250, y: 410, sector: 3 },
  { x: 200, y: 380, sector: 3 },
  { x: 150, y: 340, sector: 3 },
  { x: 120, y: 290, sector: 3 },
  { x: 100, y: 240, sector: 3 }
];

const SimulationEngine = forwardRef(({
  simulation,
  agents = [],
  isPlaying,
  speedMultiplier = 1,
  onAgentsUpdate,
  onEventsUpdate
}, ref) => {
  const tickRef = useRef(0);
  const intervalRef = useRef(null);
  const agentPathIndex = useRef(agents.map(() => 0));

  useImperativeHandle(ref, () => ({
    reset: () => {
      tickRef.current = 0;
      agentPathIndex.current = agents.map(() => 0);
    },
    getTick: () => tickRef.current
  }));

  useEffect(() => {
    if (!isPlaying || agents.length === 0 || !simulation) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initialize path indices if needed
    if (agentPathIndex.current.length !== agents.length) {
      agentPathIndex.current = agents.map((_, i) => i % TRACK_PATH.length);
    }

    // Physics update loop - 100ms base tick rate
    const tickRate = 100 / speedMultiplier;
    
    intervalRef.current = setInterval(() => {
      tickRef.current += 1;
      updatePhysics();
      
      // Periodic event generation
      if (tickRef.current % 50 === 0) {
        maybeGenerateEvent();
      }

      // Periodic health degradation
      if (tickRef.current % 10 === 0) {
        degradeHealth();
      }
    }, tickRate);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, agents, speedMultiplier]);

  const updatePhysics = async () => {
    const updatedAgents = await Promise.all(agents.map(async (agent, index) => {
      if (!agent) return agent;
      
      if (agentPathIndex.current[index] === undefined) {
        agentPathIndex.current[index] = index % TRACK_PATH.length;
      }
      
      const personality = agent.personality || 'balanced';
      const aggressionMult = agent.aggression_factor || 1.0;
      const efficiencyMult = agent.efficiency_factor || 1.0;
      const heatMult = agent.heat_factor || 1.0;
      const brakeMult = agent.brake_factor || 1.0;
      const riskMult = agent.risk_factor || 1.0;
      
      const speedBoost = (personality === 'aggressive' ? 1.15 : personality === 'conservative' ? 0.92 : 1.0) * aggressionMult;
      const aggressionFactor = (personality === 'aggressive' ? 0.4 : personality === 'conservative' ? 0.1 : 0.2) * aggressionMult;
      
      let pathIdx = agentPathIndex.current[index];
      const baseIncrement = Math.floor(1 * speedBoost * (1 + Math.random() * aggressionFactor));
      pathIdx = (pathIdx + baseIncrement) % TRACK_PATH.length;
      agentPathIndex.current[index] = pathIdx;

      const nextPoint = TRACK_PATH[pathIdx];
      const prevPoint = TRACK_PATH[(pathIdx - 1 + TRACK_PATH.length) % TRACK_PATH.length];
      
      const dx = nextPoint.x - prevPoint.x;
      const dy = nextPoint.y - prevPoint.y;
      const heading = Math.atan2(dy, dx) * 180 / Math.PI;

      const baseSpeed = 250 + Math.sin(pathIdx / 3) * 50;
      const personalityFactor = personality === 'aggressive' ? 1.15 : personality === 'conservative' ? 0.9 : 1.0;
      const speed = (baseSpeed * personalityFactor) + (Math.random() - 0.5) * 30;
      
      const isBraking = nextPoint.sector !== prevPoint.sector;
      const brakePressure = (isBraking ? 0.75 + Math.random() * 0.25 : Math.random() * 0.2) * brakeMult;
      const baseRotorTemp = 450 + Math.sin(pathIdx / 2) * 150 + (isBraking ? 100 : 0) + (100 - agent.mechanical_health);
      const rotorTemp = baseRotorTemp * heatMult;
      const throttle = (isBraking ? 0.2 + Math.random() * 0.3 : 0.7 + Math.random() * 0.3) * aggressionMult;

      const energyConsumption = throttle * 0.0003 * efficiencyMult * (personality === 'aggressive' ? 1.2 : 1.0);
      const regenGain = brakePressure * 0.0002 * (1 / efficiencyMult);
      const batterySoc = Math.max(0.05, Math.min(1.0, (agent.telemetry?.batterySoc || 0.85) - energyConsumption + regenGain));

      const lapTime = (agent.race_time || 0) + (0.1 * speedMultiplier);
      const prevPathIdx = agentPathIndex.current[index];
      const completedLap = prevPathIdx >= TRACK_PATH.length - 3 && pathIdx < 3;

      const newTelemetry = {
        speed,
        throttle,
        brakePressure,
        rotorTemp,
        hubTemp: rotorTemp * 0.25,
        batterySoc,
        tireTempFL: (85 + Math.random() * 20 + (speed / 10)) * heatMult,
        tireTempFR: (85 + Math.random() * 20 + (speed / 10)) * heatMult,
        tireTempRL: (80 + Math.random() * 20) * heatMult,
        tireTempRR: (80 + Math.random() * 20) * heatMult,
        regenPower: brakePressure * 50,
        suspensionTravel: {
          lf: 0.05 + Math.random() * 0.15,
          rf: 0.05 + Math.random() * 0.15,
          lr: 0.05 + Math.random() * 0.15,
          rr: 0.05 + Math.random() * 0.15
        }
      };

      const currentLap = (agent.position?.lap || 1) + (completedLap ? 1 : 0);
      const newLastLapTime = completedLap ? 88 + Math.random() * 6 : agent.last_lap_time;
      const newBestLapTime = completedLap 
        ? Math.min(agent.best_lap_time || 999, 88 + Math.random() * 6)
        : agent.best_lap_time;

      // Store telemetry snapshot for bulk creation (every 100 ticks to avoid rate limits)
      if (tickRef.current % 100 === 0) {
        return {
          ...agent,
          position: {
            ...nextPoint,
            heading,
            lap: currentLap
          },
          race_time: lapTime,
          last_lap_time: newLastLapTime,
          best_lap_time: newBestLapTime,
          telemetry: newTelemetry,
          _telemetrySnapshot: {
            simulation_id: simulation.id,
            agent_id: agent.id,
            tick: tickRef.current,
            position: { ...nextPoint, heading, lap: currentLap },
            speed_kph: speed,
            throttle,
            brake_pressure: brakePressure,
            rotor_temp: rotorTemp,
            hub_temp: newTelemetry.hubTemp,
            battery_soc: batterySoc * 100,
            tire_temp_fl: newTelemetry.tireTempFL,
            tire_temp_fr: newTelemetry.tireTempFR,
            tire_temp_rl: newTelemetry.tireTempRL,
            tire_temp_rr: newTelemetry.tireTempRR,
            regen_power: newTelemetry.regenPower
          }
        };
      }

      return {
        ...agent,
        position: {
          ...nextPoint,
          heading,
          lap: currentLap
        },
        race_time: lapTime,
        last_lap_time: newLastLapTime,
        best_lap_time: newBestLapTime,
        telemetry: newTelemetry
      };
    }));

    // Bulk create telemetry snapshots to avoid rate limits (every 100 ticks to reduce API load)
    if (tickRef.current % 100 === 0) {
      const telemetryBatch = updatedAgents
        .filter(a => a._telemetrySnapshot)
        .map(a => a._telemetrySnapshot);
      
      if (telemetryBatch.length > 0) {
        try {
          await base44.entities.Telemetry.bulkCreate(telemetryBatch);
        } catch (e) {
          console.warn('Telemetry bulk create skipped:', e.message);
        }
      }
      
      // Remove temp snapshot data
      updatedAgents.forEach(a => delete a._telemetrySnapshot);
    }

    onAgentsUpdate(updatedAgents);
  };

  const degradeHealth = () => {
    const updatedAgents = agents.map(agent => {
      if (!agent) return agent;
      
      const riskMult = agent.risk_factor || 1.0;
      const heatMult = agent.heat_factor || 1.0;
      const brakeMult = agent.brake_factor || 1.0;
      
      // Gradual health degradation based on stress and multipliers
      const stressFactor = (agent.telemetry?.throttle || 0.5) * (agent.telemetry?.brakePressure || 0.3);
      const baseDegradation = 0.05 + stressFactor * 0.1 + Math.random() * 0.05;
      const degradation = baseDegradation * riskMult * ((heatMult + brakeMult) / 2);
      
      const newHealth = Math.max(0, (agent.mechanical_health || 100) - degradation);
      const newTtC = (agent.time_to_critical || 15) - (0.05 * riskMult);
      const newDnfRisk = Math.min(100, (agent.dnf_risk || 0) + (newHealth < 50 ? 0.5 : 0.1) * riskMult);
      const newServiceLoad = (agent.service_load || 0) + degradation * 0.15;

      return {
        ...agent,
        mechanical_health: newHealth,
        time_to_critical: Math.max(0, newTtC),
        dnf_risk: newDnfRisk,
        service_load: newServiceLoad
      };
    });

    onAgentsUpdate(updatedAgents);
  };

  const maybeGenerateEvent = async () => {
    if (!simulation) return;
    
    // Probabilistic event generation
    const vulnerableAgents = agents.filter(a => 
      a && ((a.mechanical_health || 100) < 80 || (a.time_to_critical || 15) < 10)
    );

    if (vulnerableAgents.length === 0 || Math.random() > 0.3) return;

    const agent = vulnerableAgents[Math.floor(Math.random() * vulnerableAgents.length)];
    const eventTypes = ['thermal_surge', 'bottom_out', 'sensor_drift', 'damper_cavitation', 'brake_debris'];
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    const severity = 0.3 + Math.random() * 0.5;
    const isCritical = severity > 0.7;

    try {
      const newEvent = await base44.entities.Event.create({
        simulation_id: simulation.id,
        agent_id: agent.id,
        event_type: eventType,
        severity,
        trigger_signals: getTriggerSignals(eventType),
        time_to_critical: isCritical ? 2 + Math.random() * 3 : 5 + Math.random() * 10,
        service_time: isCritical ? 8 + Math.random() * 5 : 3 + Math.random() * 4,
        fail_probability: severity * 100,
        prognosis: getPrognosis(eventType, severity),
        recommendation: isCritical 
          ? 'Immediate pit stop required - component at risk of catastrophic failure'
          : 'Monitor closely. Pit at next convenient opportunity',
        action_type: isCritical ? 'emergency_pit' : 'monitor',
        confidence: 0.75 + Math.random() * 0.2,
        status: 'active',
        sim_time: tickRef.current
      });

      onEventsUpdate([newEvent]);
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  const getTriggerSignals = (eventType) => {
    const signals = {
      thermal_surge: ['rotor_temp', 'caliper_temp', 'brake_pressure', 'throttle'],
      bottom_out: ['suspension_travel', 'vertical_accel', 'damper_velocity'],
      sensor_drift: ['speed_sensor', 'temp_sensor', 'pressure_sensor'],
      damper_cavitation: ['damper_velocity', 'suspension_travel', 'vertical_accel'],
      brake_debris: ['brake_pressure', 'rotor_temp', 'pad_wear']
    };
    return signals[eventType] || ['unknown'];
  };

  const getPrognosis = (eventType, severity) => {
    const prognoses = {
      thermal_surge: `Brake rotor temperature ${severity > 0.7 ? 'critically' : 'significantly'} elevated. Risk of rotor glazing and reduced braking efficiency. ${severity > 0.7 ? 'Immediate action required.' : 'Monitor temperature trends.'}`,
      bottom_out: `Suspension bottoming detected. ${severity > 0.7 ? 'Multiple high-severity impacts may have damaged suspension components.' : 'Isolated bottoming event - monitor for repeated occurrences.'}`,
      sensor_drift: `Sensor readings diverging from expected values. ${severity > 0.7 ? 'Critical sensor failure - may affect vehicle control systems.' : 'Minor drift detected - recalibration recommended.'}`,
      damper_cavitation: `Damper cavitation detected. ${severity > 0.7 ? 'Severe cavitation - damper effectiveness compromised.' : 'Early signs of cavitation - service recommended.'}`,
      brake_debris: `Brake debris ingestion detected. ${severity > 0.7 ? 'Significant debris contamination - brake performance degraded.' : 'Minor debris ingestion - monitor brake temps.'}`
    };
    return prognoses[eventType] || 'Event detected. Monitoring situation.';
  };

  return null; // This component doesn't render anything
});

SimulationEngine.displayName = 'SimulationEngine';

export default SimulationEngine;