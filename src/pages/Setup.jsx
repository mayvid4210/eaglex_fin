import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Settings2, Cloud, CloudRain, Wind, Users, Zap, Gauge, Activity } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';

const tracks = {
  formula_e: [
    { id: 'las_vegas_gp', name: 'Las Vegas GP', length: 6.12, sectors: 3 },
    { id: 'monaco', name: 'Monaco ePrix', length: 3.32, sectors: 3 },
    { id: 'berlin', name: 'Berlin Tempelhof', length: 2.38, sectors: 3 }
  ],
  motogp: [
    { id: 'mugello', name: 'Mugello Circuit', length: 5.25, sectors: 4 }
  ],
  drone_racing: [
    { id: 'downtown_gates', name: 'Downtown Gates', gates: 12 }
  ],
  supply_chain: [
    { id: 'west_coast', name: 'West Coast Network', hubs: 8 }
  ],
  traffic_system: [
    { id: 'metro_grid', name: 'Metropolitan Grid', intersections: 24 }
  ]
};

export default function Setup() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const initialMode = urlParams.get('mode') || 'formula_e';

  const [mode, setMode] = useState(initialMode);
  const [track, setTrack] = useState(tracks[initialMode][0].id);
  const [numAgents, setNumAgents] = useState(6);
  const [isLoading, setIsLoading] = useState(false);
  
  // Formula E
  const [carModel, setCarModel] = useState('gen3');
  const [driverStyle, setDriverStyle] = useState('balanced');
  const [energyTarget, setEnergyTarget] = useState(70);
  const [tireCompound, setTireCompound] = useState('medium');
  const [regenStrategy, setRegenStrategy] = useState('auto');
  
  // MotoGP
  const [bikeType, setBikeType] = useState('standard');
  const [suspension, setSuspension] = useState('balanced');
  const [riderAggression, setRiderAggression] = useState(50);
  const [tireChoice, setTireChoice] = useState('medium');
  
  // Drone
  const [droneModel, setDroneModel] = useState('surveyor');
  const [flightMode, setFlightMode] = useState('patrol');
  const [altitudeTarget, setAltitudeTarget] = useState(100);
  const [batteryThreshold, setBatteryThreshold] = useState(20);
  const [payloadType, setPayloadType] = useState('camera');
  
  // Supply Chain
  const [capacityLoad, setCapacityLoad] = useState(80);
  const [vehiclePriority, setVehiclePriority] = useState('medium');
  const [etaTolerance, setEtaTolerance] = useState(10);
  
  // Traffic
  const [region, setRegion] = useState('downtown');
  const [targetDensity, setTargetDensity] = useState(50);
  const [signalTiming, setSignalTiming] = useState('adaptive');
  const [flowGoal, setFlowGoal] = useState('balanced');

  const selectedTrack = tracks[mode].find(t => t.id === track);

  const handleLaunch = async () => {
    setIsLoading(true);
    
    try {
      const simulation = await base44.entities.Simulation.create({
        mode,
        track_id: track,
        status: 'running',
        settings: {
          num_agents: numAgents,
          // Formula E
          car_model: carModel,
          driver_style: driverStyle,
          energy_target: energyTarget,
          tire_compound: tireCompound,
          regen_strategy: regenStrategy,
          // MotoGP
          bike_type: bikeType,
          suspension: suspension,
          rider_aggression: riderAggression,
          tire_choice: tireChoice,
          // Drone
          drone_model: droneModel,
          flight_mode: flightMode,
          altitude_target: altitudeTarget,
          battery_threshold: batteryThreshold,
          payload_type: payloadType,
          // Supply Chain
          capacity_load: capacityLoad,
          vehicle_priority: vehiclePriority,
          eta_tolerance: etaTolerance,
          // Traffic
          region: region,
          target_density: targetDensity,
          signal_timing: signalTiming,
          flow_goal: flowGoal
        },
        sim_time: 0,
        speed_multiplier: 1.0,
        global_stats: {
          avg_mechanical_health: 100,
          total_dnf_risk: 0,
          total_service_load: 0,
          critical_agents: 0
        }
      });

      navigate(createPageUrl(`Simulation?id=${simulation.id}`));
    } catch (error) {
      console.error('Failed to create simulation:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-purple-900/20 to-pink-900/20" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />
      </div>

      <div className="relative">
        {/* Header */}
        <div className="border-b border-white/10 backdrop-blur-xl bg-white/5">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link to={createPageUrl('Landing')}>
              <Button variant="ghost" className="gap-2 text-gray-300 hover:text-white">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              EAGLEX
            </div>
            <div className="w-24" />
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Title */}
            <div>
              <h1 className="text-4xl font-bold mb-2">Configure Simulation</h1>
              <p className="text-gray-400">Set up your multi-agent simulation parameters</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left: Configuration */}
              <div className="lg:col-span-2 space-y-6">
                {/* Track Selection */}
                <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-lg shadow-cyan-500/10">
                  <CardHeader>
                    <CardTitle className="text-white">Track / Environment</CardTitle>
                    <CardDescription className="text-white/70">Select your simulation environment</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm text-white mb-2 block font-medium">Track</label>
                      <Select value={track} onValueChange={setTrack}>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white hover:border-cyan-400/50 transition-colors">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {tracks[mode].map(t => (
                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedTrack && (
                      <div className="p-4 rounded-lg bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/30 shadow-lg shadow-cyan-500/20">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/80">Length:</span>
                          <span className="font-mono text-white">{selectedTrack.length} km</span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-2">
                          <span className="text-white/80">Sectors:</span>
                          <span className="font-mono text-white">{selectedTrack.sectors || selectedTrack.gates || selectedTrack.hubs || selectedTrack.intersections}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Number of Agents */}
                <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-lg shadow-cyan-500/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Users className="w-5 h-5 text-cyan-400" />
                      Number of Agents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white/70">Agents:</span>
                      <span className="font-mono text-cyan-400 text-lg font-bold">{numAgents}</span>
                    </div>
                    <Slider
                      value={[numAgents]}
                      onValueChange={([v]) => setNumAgents(v)}
                      min={2}
                      max={20}
                      step={1}
                      className="py-4"
                    />
                  </CardContent>
                </Card>

                {/* Mode-Specific Settings */}
                {mode === 'formula_e' && (
                  <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-lg shadow-cyan-500/10">
                    <CardHeader><CardTitle className="text-white">Formula E Configuration</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm text-white mb-2 block font-medium">Car Model</label>
                        <Select value={carModel} onValueChange={setCarModel}>
                          <SelectTrigger className="bg-white/5 border-white/20 text-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gen3">Gen3</SelectItem>
                            <SelectItem value="gen2">Gen2</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm text-white mb-2 block font-medium">Driver Style</label>
                        <Select value={driverStyle} onValueChange={setDriverStyle}>
                          <SelectTrigger className="bg-white/5 border-white/20 text-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="aggressive">Aggressive</SelectItem>
                            <SelectItem value="balanced">Balanced</SelectItem>
                            <SelectItem value="conservative">Conservative</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm text-white mb-2 flex justify-between font-medium"><span>Energy Target</span><span className="text-cyan-400">{energyTarget}%</span></label>
                        <Slider value={[energyTarget]} onValueChange={([v]) => setEnergyTarget(v)} min={50} max={100} step={5} />
                      </div>
                      <div>
                        <label className="text-sm text-white mb-2 block font-medium">Tire Compound</label>
                        <Select value={tireCompound} onValueChange={setTireCompound}>
                          <SelectTrigger className="bg-white/5 border-white/20 text-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="soft">Soft</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm text-white mb-2 block font-medium">Regen Strategy</label>
                        <Select value={regenStrategy} onValueChange={setRegenStrategy}>
                          <SelectTrigger className="bg-white/5 border-white/20 text-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="auto">Auto</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {mode === 'motogp' && (
                  <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-lg shadow-purple-500/10">
                    <CardHeader><CardTitle className="text-white">MotoGP Configuration</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm text-white mb-2 block font-medium">Bike Type</label>
                        <Select value={bikeType} onValueChange={setBikeType}>
                          <SelectTrigger className="bg-white/5 border-white/20 text-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="performance">Performance</SelectItem>
                            <SelectItem value="endurance">Endurance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm text-white mb-2 block font-medium">Suspension Tuning</label>
                        <Select value={suspension} onValueChange={setSuspension}>
                          <SelectTrigger className="bg-white/5 border-white/20 text-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="soft">Soft</SelectItem>
                            <SelectItem value="balanced">Balanced</SelectItem>
                            <SelectItem value="stiff">Stiff</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm text-white mb-2 flex justify-between font-medium"><span>Rider Aggression</span><span className="text-purple-400">{riderAggression}%</span></label>
                        <Slider value={[riderAggression]} onValueChange={([v]) => setRiderAggression(v)} min={0} max={100} step={5} />
                      </div>
                      <div>
                        <label className="text-sm text-white mb-2 block font-medium">Tire Choice</label>
                        <Select value={tireChoice} onValueChange={setTireChoice}>
                          <SelectTrigger className="bg-white/5 border-white/20 text-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="soft">Soft</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {mode === 'drone_racing' && (
                  <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-lg shadow-green-500/10">
                    <CardHeader><CardTitle className="text-white">Drone Configuration</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm text-white mb-2 block font-medium">Drone Model</label>
                        <Select value={droneModel} onValueChange={setDroneModel}>
                          <SelectTrigger className="bg-white/5 border-white/20 text-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="surveyor">Surveyor</SelectItem>
                            <SelectItem value="racer">Racer</SelectItem>
                            <SelectItem value="delivery">Delivery</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm text-white mb-2 block font-medium">Flight Mode</label>
                        <Select value={flightMode} onValueChange={setFlightMode}>
                          <SelectTrigger className="bg-white/5 border-white/20 text-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="patrol">Patrol</SelectItem>
                            <SelectItem value="survey">Survey</SelectItem>
                            <SelectItem value="delivery">Delivery</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm text-white mb-2 flex justify-between font-medium"><span>Altitude Target</span><span className="text-green-400">{altitudeTarget}m</span></label>
                        <Slider value={[altitudeTarget]} onValueChange={([v]) => setAltitudeTarget(v)} min={50} max={200} step={10} />
                      </div>
                      <div>
                        <label className="text-sm text-white mb-2 flex justify-between font-medium"><span>Battery Threshold</span><span className="text-green-400">{batteryThreshold}%</span></label>
                        <Slider value={[batteryThreshold]} onValueChange={([v]) => setBatteryThreshold(v)} min={10} max={30} step={5} />
                      </div>
                      <div>
                        <label className="text-sm text-white mb-2 block font-medium">Payload Type</label>
                        <Select value={payloadType} onValueChange={setPayloadType}>
                          <SelectTrigger className="bg-white/5 border-white/20 text-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="camera">Camera</SelectItem>
                            <SelectItem value="package">Package</SelectItem>
                            <SelectItem value="sensor">Sensor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {mode === 'supply_chain' && (
                  <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-lg shadow-amber-500/10">
                    <CardHeader><CardTitle className="text-white">Supply Chain Configuration</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm text-white mb-2 flex justify-between font-medium"><span>Capacity Load</span><span className="text-amber-400">{capacityLoad}%</span></label>
                        <Slider value={[capacityLoad]} onValueChange={([v]) => setCapacityLoad(v)} min={50} max={100} step={5} />
                      </div>
                      <div>
                        <label className="text-sm text-white mb-2 block font-medium">Vehicle Priority</label>
                        <Select value={vehiclePriority} onValueChange={setVehiclePriority}>
                          <SelectTrigger className="bg-white/5 border-white/20 text-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm text-white mb-2 flex justify-between font-medium"><span>ETA Tolerance</span><span className="text-amber-400">{etaTolerance}%</span></label>
                        <Slider value={[etaTolerance]} onValueChange={([v]) => setEtaTolerance(v)} min={5} max={20} step={5} />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {mode === 'traffic_system' && (
                  <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-lg shadow-yellow-500/10">
                    <CardHeader><CardTitle className="text-white">Traffic System Configuration</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm text-white mb-2 block font-medium">Region</label>
                        <Select value={region} onValueChange={setRegion}>
                          <SelectTrigger className="bg-white/5 border-white/20 text-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="downtown">Downtown</SelectItem>
                            <SelectItem value="suburban">Suburban</SelectItem>
                            <SelectItem value="highway">Highway</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm text-white mb-2 flex justify-between font-medium"><span>Target Density</span><span className="text-yellow-400">{targetDensity}%</span></label>
                        <Slider value={[targetDensity]} onValueChange={([v]) => setTargetDensity(v)} min={20} max={100} step={10} />
                      </div>
                      <div>
                        <label className="text-sm text-white mb-2 block font-medium">Signal Timing</label>
                        <Select value={signalTiming} onValueChange={setSignalTiming}>
                          <SelectTrigger className="bg-white/5 border-white/20 text-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="adaptive">Adaptive</SelectItem>
                            <SelectItem value="fixed">Fixed</SelectItem>
                            <SelectItem value="coordinated">Coordinated</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm text-white mb-2 block font-medium">Flow Goal</label>
                        <Select value={flowGoal} onValueChange={setFlowGoal}>
                          <SelectTrigger className="bg-white/5 border-white/20 text-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="balanced">Balanced</SelectItem>
                            <SelectItem value="maximize_throughput">Maximize Throughput</SelectItem>
                            <SelectItem value="minimize_stops">Minimize Stops</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right: Preview & Launch */}
              <div className="space-y-6">
                {/* 3D Preview Placeholder */}
                <Card className="bg-white/5 backdrop-blur-md border-white/10 overflow-hidden">
                  <div className="aspect-square bg-gradient-to-br from-cyan-500/20 to-purple-500/20 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Gauge className="w-16 h-16 mx-auto mb-4 text-cyan-400 animate-pulse" />
                        <div className="text-sm text-gray-400">Track Preview</div>
                        <div className="text-xs text-gray-500 mt-1">{selectedTrack?.name}</div>
                      </div>
                    </div>
                    {/* Simulated track line */}
                    <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 200 200">
                      <path
                        d="M 50,100 Q 50,50 100,50 T 150,100 Q 150,150 100,150 T 50,100"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#06b6d4" />
                          <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </Card>

                {/* Summary */}
                <Card className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 backdrop-blur-md border-cyan-400/30 shadow-lg shadow-cyan-500/20">
                  <CardHeader>
                    <CardTitle className="text-lg text-white">Configuration Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/70">Mode:</span>
                      <span className="font-semibold capitalize text-white">{mode.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Agents:</span>
                      <span className="font-semibold text-white">{numAgents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Track:</span>
                      <span className="font-semibold text-white">{selectedTrack?.name}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Launch Button */}
                <Button
                  onClick={handleLaunch}
                  disabled={isLoading}
                  size="lg"
                  className="relative w-full py-6 text-lg font-bold bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 border-0 shadow-2xl shadow-cyan-500/50 hover:shadow-cyan-500/70 transition-all duration-300"
                >
                  <motion.div
                    className="absolute inset-0 rounded-lg"
                    animate={{ 
                      boxShadow: [
                        '0 0 20px rgba(6, 182, 212, 0.5)',
                        '0 0 40px rgba(168, 85, 247, 0.6)',
                        '0 0 20px rgba(6, 182, 212, 0.5)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  {isLoading ? (
                    <>
                      <Activity className="w-5 h-5 mr-2 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Launch Simulation
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}