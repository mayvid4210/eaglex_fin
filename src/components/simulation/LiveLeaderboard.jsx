import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertTriangle, Wrench, Flag, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Flame, Wrench as WrenchIcon, Zap, Wind, Link, Radio, Skull, Octagon, Droplet, Layers, Battery, Bomb, AlertTriangle as AlertIcon } from 'lucide-react';

const EVENT_ICONS = {
  thermal_surge: Flame,
  cross_thread: WrenchIcon,
  bottom_out: Zap,
  damper_cavitation: Wind,
  micro_failure_chain: Link,
  sensor_drift: Radio,
  death_spiral: Skull,
  brake_debris: Octagon,
  vapor_lock: Droplet,
  delamination: Layers,
  ers_shutdown: Battery,
  shock_event: Bomb,
  assembly_error: AlertIcon
};

export default function LiveLeaderboard({ agents = [], events = [], onAgentSelect }) {
  const [sortBy, setSortBy] = useState('rank');
  const [filterMode, setFilterMode] = useState('all');

  // Enrich agents with active events
  const enrichedAgents = agents.map(agent => ({
    ...agent,
    activeEvents: events.filter(e => e.agent_id === agent.id && e.status === 'active')
  }));

  // Filter agents
  const filteredAgents = enrichedAgents.filter(agent => {
    if (filterMode === 'top_3') return agent.rank <= 3;
    if (filterMode === 'mechanic_priority') return agent.mechanical_health < 80 || agent.activeEvents.length > 0;
    return true;
  });

  // Sort agents
  const sortedAgents = [...filteredAgents].sort((a, b) => {
    if (sortBy === 'rank') return a.rank - b.rank;
    if (sortBy === 'health') return a.mechanical_health - b.mechanical_health;
    if (sortBy === 'ttc') return (a.time_to_critical || 999) - (b.time_to_critical || 999);
    if (sortBy === 'risk') return b.dnf_risk - a.dnf_risk;
    if (sortBy === 'last_lap') return (a.last_lap_time || 999) - (b.last_lap_time || 999);
    if (sortBy === 'best_lap') return (a.best_lap_time || 999) - (b.best_lap_time || 999);
    return 0;
  });

  const getHealthColor = (health) => {
    if (health >= 80) return 'text-green-400';
    if (health >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRiskColor = (risk) => {
    if (risk < 20) return 'text-green-400';
    if (risk < 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="h-full flex flex-col bg-[#0A0E27]/80 backdrop-blur-xl rounded-xl border border-cyan-400/20 shadow-2xl shadow-cyan-500/10 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-cyan-400/20 bg-gradient-to-r from-cyan-500/5 to-purple-500/5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Flag className="w-4 h-4 text-cyan-400" />
            <span className="text-white">Live Leaderboard</span>
          </h2>
          <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-400/30 text-xs">
            {agents.length}
          </Badge>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mt-2">
          <Tabs value={filterMode} onValueChange={setFilterMode} className="w-full">
            <TabsList className="grid grid-cols-3 bg-white/5 h-8">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="top_3" className="text-xs">Top 3</TabsTrigger>
              <TabsTrigger value="mechanic_priority" className="text-xs">Priority</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Sorting bar (All tab only) */}
        {filterMode === 'all' && (
          <div className="flex items-center gap-2 mt-2 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <span className="text-xs text-white/60">Sort by:</span>
            <div className="flex gap-1 flex-wrap">
              <Button
                size="sm"
                variant={sortBy === 'rank' ? 'default' : 'ghost'}
                onClick={() => setSortBy('rank')}
                className={`h-6 px-2 text-xs ${sortBy === 'rank' ? 'bg-cyan-500/20 text-cyan-400' : 'text-white/70'}`}
              >
                Position
              </Button>
              <Button
                size="sm"
                variant={sortBy === 'risk' ? 'default' : 'ghost'}
                onClick={() => setSortBy('risk')}
                className={`h-6 px-2 text-xs ${sortBy === 'risk' ? 'bg-cyan-500/20 text-cyan-400' : 'text-white/70'}`}
              >
                Risk ↓
              </Button>
              <Button
                size="sm"
                variant={sortBy === 'health' ? 'default' : 'ghost'}
                onClick={() => setSortBy('health')}
                className={`h-6 px-2 text-xs ${sortBy === 'health' ? 'bg-cyan-500/20 text-cyan-400' : 'text-white/70'}`}
              >
                Health ↑
              </Button>
              <Button
                size="sm"
                variant={sortBy === 'last_lap' ? 'default' : 'ghost'}
                onClick={() => setSortBy('last_lap')}
                className={`h-6 px-2 text-xs ${sortBy === 'last_lap' ? 'bg-cyan-500/20 text-cyan-400' : 'text-white/70'}`}
              >
                Last Lap ↑
              </Button>
              <Button
                size="sm"
                variant={sortBy === 'best_lap' ? 'default' : 'ghost'}
                onClick={() => setSortBy('best_lap')}
                className={`h-6 px-2 text-xs ${sortBy === 'best_lap' ? 'bg-cyan-500/20 text-cyan-400' : 'text-white/70'}`}
              >
                Best Lap ↑
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Table Header */}
      <div className="px-4 py-2 bg-white/5 border-b border-white/5 grid grid-cols-12 gap-2 text-xs font-medium text-white/60">
        <div className="col-span-1">Rank</div>
        <div className="col-span-2">Agent</div>
        <div className="col-span-2">Lap Time</div>
        <div className="col-span-2">Health</div>
        <div className="col-span-1">TtC</div>
        <div className="col-span-2">Service</div>
        <div className="col-span-1">Risk</div>
        <div className="col-span-1">Events</div>
      </div>

      {/* Leaderboard Rows */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {sortedAgents.map((agent, index) => (
            <motion.div
              key={agent.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              onClick={() => onAgentSelect(agent)}
              className="px-4 py-4 border-b border-white/5 hover:bg-cyan-500/10 hover:border-cyan-400/30 cursor-pointer grid grid-cols-12 gap-2 items-center group transition-all"
            >
              {/* Rank */}
              <div className="col-span-1">
                <div className="flex items-center gap-1">
                  <span className={`text-lg font-bold ${
                    agent.rank === 1 ? 'text-yellow-400' :
                    agent.rank === 2 ? 'text-gray-300' :
                    agent.rank === 3 ? 'text-orange-400' :
                    'text-gray-500'
                  }`}>
                    {agent.rank}
                  </span>
                  {agent.rank < (agent.prev_rank || agent.rank) && (
                    <TrendingUp className="w-3 h-3 text-green-400" />
                  )}
                  {agent.rank > (agent.prev_rank || agent.rank) && (
                    <TrendingDown className="w-3 h-3 text-red-400" />
                  )}
                </div>
              </div>

              {/* Agent */}
              <div className="col-span-2">
                <div className="text-sm font-semibold text-white">{agent.agent_number}</div>
                <div className="text-xs text-gray-400">{agent.team_name || 'Team'}</div>
                <div className="text-xs text-cyan-400 font-mono mt-0.5">
                  Lap {agent.position?.lap || 0}
                </div>
              </div>

              {/* Lap Time */}
              <div className="col-span-2">
                <div className="text-sm font-mono text-white">
                  {agent.last_lap_time ? `${agent.last_lap_time.toFixed(3)}s` : '--'}
                </div>
                <div className="text-xs text-gray-400 font-mono">
                  Best: {agent.best_lap_time ? `${agent.best_lap_time.toFixed(3)}s` : '--'}
                </div>
                <div className="text-xs text-cyan-400 font-mono mt-0.5">
                  Lap: {agent.position?.lap || 0}
                </div>
                <div className="text-xs text-green-400 font-mono">
                  Last: {agent.last_lap_time ? `${agent.last_lap_time.toFixed(1)}s` : '--'}
                </div>
              </div>

              {/* Mechanical Health */}
              <div className="col-span-2">
                <div className="flex items-center gap-2">
                  <div className={`text-sm font-bold ${getHealthColor(agent.mechanical_health)}`}>
                    {agent.mechanical_health?.toFixed(0) || 100}%
                  </div>
                  {/* Mini sparkline */}
                  <div className="flex items-end gap-0.5 h-4">
                    {[95, 92, 88, 85, agent.mechanical_health].map((h, i) => (
                      <div
                        key={i}
                        className={`w-1 ${getHealthColor(h).replace('text-', 'bg-')} opacity-${100 - i * 20}`}
                        style={{ height: `${(h / 100) * 16}px` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Time to Critical */}
              <div className="col-span-1">
                <div className="text-sm font-mono">
                  {agent.time_to_critical ? `${agent.time_to_critical.toFixed(1)}L` : '--'}
                </div>
              </div>

              {/* Service Load */}
              <div className="col-span-2">
                <div className="flex items-center gap-1">
                  <Wrench className="w-3 h-3 text-gray-500" />
                  <span className="text-sm font-mono">{agent.service_load?.toFixed(0) || 0}min</span>
                </div>
                {agent.pit_status !== 'on_track' && (
                  <Badge variant="outline" className="text-xs bg-yellow-500/20 border-yellow-500/30 text-yellow-400 mt-1">
                    {agent.pit_status.replace('_', ' ').toUpperCase()}
                  </Badge>
                )}
              </div>

              {/* DNF Risk */}
              <div className="col-span-1">
                <div className={`text-sm font-bold ${getRiskColor(agent.dnf_risk)}`}>
                  {agent.dnf_risk?.toFixed(0) || 0}%
                </div>
              </div>

              {/* Active Events */}
              <div className="col-span-1">
                <div className="flex items-center gap-1">
                  {agent.activeEvents?.slice(0, 2).map((event, i) => {
                    const EventIcon = EVENT_ICONS[event.event_type] || AlertIcon;
                    return (
                      <div key={i} className="w-5 h-5 flex items-center justify-center" title={event.event_type}>
                        <EventIcon className="w-3.5 h-3.5 text-red-400" />
                      </div>
                    );
                  })}
                  {agent.activeEvents?.length > 2 && (
                    <span className="text-xs text-gray-400 font-semibold">+{agent.activeEvents.length - 2}</span>
                  )}
                </div>
              </div>

              {/* Penalties indicator */}
              {agent.penalties?.length > 0 && (
                <div className="col-span-12 mt-1">
                  <Badge variant="destructive" className="text-xs">
                    +{agent.penalties.reduce((sum, p) => sum + (p.value || 0), 0)}s penalty
                  </Badge>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer Stats */}
      <div className="p-3 border-t border-white/10 bg-white/5 backdrop-blur-sm grid grid-cols-4 gap-4 text-center">
        <div>
          <div className="text-xs text-gray-400">Avg Health</div>
          <div className="text-sm font-bold text-cyan-400">
            {(agents.reduce((sum, a) => sum + (a.mechanical_health || 100), 0) / agents.length).toFixed(0)}%
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Critical</div>
          <div className="text-sm font-bold text-red-400">
            {agents.filter(a => a.mechanical_health < 50).length}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Total Service</div>
          <div className="text-sm font-bold text-yellow-400">
            {agents.reduce((sum, a) => sum + (a.service_load || 0), 0).toFixed(0)}min
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400">High Risk</div>
          <div className="text-sm font-bold text-orange-400">
            {agents.filter(a => a.dnf_risk > 50).length}
          </div>
        </div>
      </div>
    </div>
  );
}