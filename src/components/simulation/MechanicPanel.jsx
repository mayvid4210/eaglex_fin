import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, TrendingDown, Wrench, Brain, ChevronRight, X, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AIStrategyDetailed from './AIStrategyDetailed';

import { Flame, Wrench as WrenchIcon, Zap, Wind, Link, Radio, Skull, Octagon, Droplet, Layers, Battery, Bomb, AlertTriangle as AlertIcon } from 'lucide-react';

const EVENT_CONFIG = {
  thermal_surge: {
    Icon: Flame,
    color: 'red',
    label: 'Thermal Surge'
  },
  cross_thread: {
    Icon: WrenchIcon,
    color: 'orange',
    label: 'Cross-Thread'
  },
  bottom_out: {
    Icon: Zap,
    color: 'yellow',
    label: 'Bottom-Out'
  },
  damper_cavitation: {
    Icon: Wind,
    color: 'blue',
    label: 'Damper Cavitation'
  },
  micro_failure_chain: {
    Icon: Link,
    color: 'purple',
    label: 'Failure Chain'
  },
  sensor_drift: {
    Icon: Radio,
    color: 'cyan',
    label: 'Sensor Drift'
  },
  death_spiral: {
    Icon: Skull,
    color: 'red',
    label: 'Death Spiral'
  },
  brake_debris: {
    Icon: Octagon,
    color: 'orange',
    label: 'Brake Debris'
  },
  vapor_lock: {
    Icon: Droplet,
    color: 'blue',
    label: 'Vapor Lock'
  },
  delamination: {
    Icon: Layers,
    color: 'yellow',
    label: 'Delamination'
  },
  ers_shutdown: {
    Icon: Battery,
    color: 'red',
    label: 'ERS Shutdown'
  },
  shock_event: {
    Icon: Bomb,
    color: 'red',
    label: 'Shock Event'
  },
  assembly_error: {
    Icon: AlertIcon,
    color: 'orange',
    label: 'Assembly Error'
  }
};

const ACTION_COLORS = {
  emergency_pit: 'bg-red-500/20 border-red-500/30 text-red-400',
  monitor: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
  ignore: 'bg-gray-500/20 border-gray-500/30 text-gray-400',
  adjust_settings: 'bg-blue-500/20 border-blue-500/30 text-blue-400'
};

export default function MechanicPanel({ agent, events = [], strategies = [], onClose, onAction }) {
  const [selectedTab, setSelectedTab] = useState('events');

  if (!agent) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <Wrench className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <div className="text-sm">Select an agent to view details</div>
        </div>
      </div>
    );
  }

  const agentEvents = events.filter(e => e.agent_id === agent.id && e.status === 'active');
  const agentStrategies = strategies.filter(s => s.agent_id === agent.id);

  const healthColor = agent.mechanical_health >= 80 ? 'green' : 
                      agent.mechanical_health >= 50 ? 'yellow' : 'red';

  return (
    <div className="h-full flex flex-col bg-[#0A0E27]/80 backdrop-blur-xl rounded-xl border border-cyan-400/20 shadow-2xl shadow-cyan-500/10 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-cyan-400/20 bg-gradient-to-r from-cyan-500/5 to-purple-500/5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2 text-white">
              <Wrench className="w-4 h-4 text-cyan-400" />
              <span className="text-white">Mechanic Panel</span>
            </h2>
            <p className="text-xs text-white/60 mt-1">{agent.agent_number} • {agent.team_name || 'Team'}</p>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 text-white hover:text-cyan-400">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30">
            <div className="text-xs text-white/70 mb-1">Health</div>
            <div className={`text-xl font-bold text-${healthColor}-400`}>
              {agent.mechanical_health?.toFixed(0) || 100}%
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/30">
            <div className="text-xs text-white/70 mb-1">DNF Risk</div>
            <div className="text-xl font-bold text-red-400">
              {agent.dnf_risk?.toFixed(0) || 0}%
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/30">
            <div className="text-xs text-white/70 mb-1">TtC</div>
            <div className="text-xl font-bold text-yellow-400 font-mono">
              {agent.time_to_critical ? `${agent.time_to_critical.toFixed(1)}L` : '--'}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/30">
            <div className="text-xs text-white/70 mb-1">Service</div>
            <div className="text-xl font-bold text-cyan-400 font-mono">
              {agent.service_load?.toFixed(0) || 0}m
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-2 bg-white/5 h-9">
          <TabsTrigger value="events" className="flex-1 text-xs">
            Events
            {agentEvents.length > 0 && (
              <Badge className="ml-1.5 bg-red-500/20 text-red-400 text-xs">{agentEvents.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex-1 text-xs">
            AI Strategy
          </TabsTrigger>
          <TabsTrigger value="survival" className="flex-1 text-xs">
            Survival
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          {/* Events Tab */}
          <TabsContent value="events" className="h-full m-0 p-4 overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {agentEvents.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full text-gray-500"
                >
                  <CheckCircle className="w-12 h-12 mb-3 opacity-50" />
                  <div className="text-sm">No active events</div>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  {agentEvents.slice(0, 2).map((event, index) => {
                    const config = EVENT_CONFIG[event.event_type] || { Icon: AlertIcon, color: 'gray', label: event.event_type };
                    const EventIcon = config.Icon;
                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-cyan-400/30 transition-all">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg bg-${config.color}-500/20 border border-${config.color}-500/30`}>
                                  <EventIcon className={`w-5 h-5 text-${config.color}-400`} />
                                </div>
                                <div>
                                  <CardTitle className="text-sm text-white font-semibold">{config.label}</CardTitle>
                                  <CardDescription className="text-xs text-white/70">
                                    Severity: {(event.severity * 100).toFixed(0)}%
                                  </CardDescription>
                                </div>
                              </div>
                              <Badge className={ACTION_COLORS[event.action_type]}>
                                {event.action_type?.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {/* Severity Bar */}
                            <div>
                              <Progress value={event.severity * 100} className="h-2" />
                            </div>

                            {/* Metrics */}
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div className="p-2 rounded bg-white/5 border border-white/10">
                                <div className="text-white/60 font-medium">TtC</div>
                                <div className="font-mono font-bold text-yellow-400">
                                  {event.time_to_critical?.toFixed(1) || '--'}L
                                </div>
                              </div>
                              <div className="p-2 rounded bg-white/5 border border-white/10">
                                <div className="text-white/60 font-medium">Service</div>
                                <div className="font-mono font-bold text-cyan-400">
                                  {event.service_time?.toFixed(0) || '--'}m
                                </div>
                              </div>
                              <div className="p-2 rounded bg-white/5 border border-white/10">
                                <div className="text-white/60 font-medium">Fail %</div>
                                <div className="font-mono font-bold text-red-400">
                                  {event.fail_probability?.toFixed(0) || '--'}%
                                </div>
                              </div>
                            </div>

                            {/* Prognosis */}
                            <div className="text-xs text-white/80 leading-relaxed">
                              {event.prognosis || 'Analyzing...'}
                            </div>

                            {/* Recommendation */}
                            <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                              <div className="text-xs font-semibold text-cyan-400 mb-1">Recommendation</div>
                              <div className="text-xs text-white/90">
                                {event.recommendation || 'Monitor situation'}
                              </div>
                            </div>

                            {/* Action Button */}
                            {event.action_type === 'emergency_pit' && (
                              <Button
                                size="sm"
                                className="w-full bg-red-500 hover:bg-red-600"
                                onClick={() => onAction?.({ type: 'emergency_pit', agentId: agent.id })}
                              >
                                Emergency Pit Now
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                  {agentEvents.length > 2 && (
                    <div className="text-center py-2">
                      <Badge variant="outline" className="bg-white/5 text-white/70 border-white/20">
                        +{agentEvents.length - 2} more events
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* AI Strategy Tab */}
          <TabsContent value="ai" className="h-full m-0 p-4 overflow-y-auto">
            <AIStrategyDetailed 
              strategy={agentStrategies[0]} 
              onExecute={(strategy) => onAction?.({ type: 'execute_strategy', agentId: agent.id, strategy })}
            />
          </TabsContent>

          {/* Survival Curve Tab */}
          <TabsContent value="survival" className="h-full m-0 p-4 overflow-y-auto space-y-4">
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-sm text-white">Weibull Survival Analysis</CardTitle>
                <CardDescription className="text-xs text-white/70">Time-to-failure distribution</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Placeholder survival curve */}
                <div className="h-40 bg-gradient-to-br from-purple-500/10 to-red-500/10 rounded-lg border border-white/10 flex items-center justify-center relative overflow-hidden">
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 100">
                    <path
                      d="M 10,20 Q 50,25 90,50 T 170,85"
                      fill="none"
                      stroke="rgba(6, 182, 212, 0.6)"
                      strokeWidth="2"
                    />
                    <circle cx="90" cy="50" r="4" fill="#06b6d4" />
                  </svg>
                  <div className="relative z-10 text-xs text-gray-500">
                    Hazard curve visualization
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-white/70">Mean Time to Failure:</span>
                    <span className="font-mono font-bold text-yellow-400">
                      {agent.time_to_critical ? `${(agent.time_to_critical * 1.5).toFixed(1)} laps` : '--'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Failure Probability (Next 5 laps):</span>
                    <span className="font-mono font-bold text-red-400">
                      {agent.dnf_risk ? `${(agent.dnf_risk * 0.8).toFixed(0)}%` : '--'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Recommended Action:</span>
                    <span className="font-semibold text-cyan-400">
                      {agent.mechanical_health < 50 ? 'Emergency Pit' : agent.mechanical_health < 80 ? 'Monitor Closely' : 'Continue'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Repair Checklist */}
            <Card className="mt-3 bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-sm text-white">Prioritized Repair Checklist</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {agentEvents.slice(0, 5).map((event, i) => {
                    const config = EVENT_CONFIG[event.event_type] || { Icon: AlertIcon };
                    const EventIcon = config.Icon;
                    return (
                      <div key={i} className="flex items-center gap-3 text-xs p-2 rounded-lg bg-white/5 border border-white/10">
                        <div className="w-6 h-6 rounded flex items-center justify-center bg-cyan-500/20 text-cyan-400 font-bold flex-shrink-0">
                          {i + 1}
                        </div>
                        <EventIcon className={`w-4 h-4 text-${config.color}-400 flex-shrink-0`} />
                        <div className="flex-1">
                          <div className="font-semibold text-white">{config.label || event.event_type}</div>
                          <div className="text-white/60">Est. {event.service_time?.toFixed(0) || 5}min</div>
                        </div>
                        <Badge variant="outline" className={`text-xs ${ACTION_COLORS[event.action_type]}`}>
                          {event.action_type?.replace('_', ' ')}
                        </Badge>
                      </div>
                    );
                  })}
                  {agentEvents.length === 0 && (
                    <div className="text-center text-white/60 py-4">
                      No repairs needed
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}