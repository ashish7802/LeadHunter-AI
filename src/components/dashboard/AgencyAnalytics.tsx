'use client';

import React from 'react';
import { AgencyAnalytics, PipelineMetrics } from '@/lib/types/lead';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  LineChart, Line, AreaChart, Area 
} from 'recharts';
import { 
  TrendingUp, Users, CheckCircle2, AlertTriangle, Briefcase, 
  Calendar, FileText, Globe, Star, Clock, Trophy 
} from 'lucide-react';

interface AgencyAnalyticsProps {
  analytics: AgencyAnalytics | null;
  metrics: PipelineMetrics;
}

export const AgencyAnalyticsView: React.FC<AgencyAnalyticsProps> = ({
  analytics,
  metrics,
}) => {
  if (!analytics) {
    return (
      <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl">
        <TrendingUp className="w-10 h-10 text-gray-600 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-white">No analytics available yet</h3>
        <p className="text-xs text-gray-400 mt-1">Analytics will generate after opportunities are ingested and progressed.</p>
      </div>
    );
  }

  const kpis = [
    { label: 'Meetings Booked', value: metrics.meetingsBooked, icon: Calendar, color: 'text-indigo-400', desc: 'Outreach conversions' },
    { label: 'Proposals Sent', value: metrics.proposalsSent, icon: FileText, color: 'text-cyan-400', desc: 'Deals in negotiation' },
    { label: 'Won Opportunities', value: metrics.wonOpportunities, icon: Trophy, color: 'text-emerald-400', desc: 'Closed won deals' },
    { label: 'Lost Opportunities', value: metrics.lostOpportunities, icon: AlertTriangle, color: 'text-rose-400', desc: 'Disqualified / closed lost' }
  ];

  const colors = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Execution KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-4">
            <div className="space-y-1.5">
              <span className="text-xs text-gray-400 font-medium block">{kpi.label}</span>
              <span className="text-3xl font-extrabold text-white block">{kpi.value}</span>
              <span className="text-[10px] text-gray-500 block">{kpi.desc}</span>
            </div>
            <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${kpi.color}`}>
              <kpi.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Funnel & Conversion Rates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Funnel Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            Opportunity Lifecycle Funnel
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics.funnel}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
              >
                <XAxis type="number" stroke="#4b5563" fontSize={10} />
                <YAxis dataKey="stage" type="category" stroke="#4b5563" fontSize={10} width={110} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#a5b4fc', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]}>
                  {analytics.funnel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sequential Conversion */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Lifecycle Conversion Rates
          </h3>
          <div className="space-y-3 overflow-y-auto max-h-64 pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {analytics.conversionRates.length === 0 ? (
              <p className="text-xs text-gray-500 italic py-6 text-center">Not enough data to calculate stage conversions.</p>
            ) : (
              analytics.conversionRates.map((rate, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">{rate.from} → {rate.to}</span>
                    <span className="font-semibold text-white">{rate.rate}%</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${rate.rate}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Sources & Industries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Sources */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            Origin Ingestion Performance
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.topSources}>
                <XAxis dataKey="source" stroke="#4b5563" fontSize={10} />
                <YAxis stroke="#4b5563" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#a5b4fc', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#14b8a6" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: '#9ca3af', fontSize: 10 }}>
                  {analytics.topSources.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[(index + 2) % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Industries */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-purple-400" />
            Top Ingested Industries
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.topIndustries}>
                <XAxis dataKey="industry" stroke="#4b5563" fontSize={10} />
                <YAxis stroke="#4b5563" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#a5b4fc', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#ec4899" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: '#9ca3af', fontSize: 10 }}>
                  {analytics.topIndustries.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[(index + 4) % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Win / Loss Diagnostics & Team */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Assignments */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            Sales Rep Assignments & Performance
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-gray-500">
                  <th className="pb-3 font-semibold">Rep Name</th>
                  <th className="pb-3 font-semibold text-center">Assigned Deals</th>
                  <th className="pb-3 font-semibold text-center">Closed Won</th>
                  <th className="pb-3 font-semibold text-center">Avg Quality Score</th>
                  <th className="pb-3 font-semibold text-right">Conversion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {analytics.teamPerformance.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-500 italic">No sales team performance recorded yet.</td>
                  </tr>
                ) : (
                  analytics.teamPerformance.map((member) => {
                    const rate = member.assigned > 0 ? Math.round((member.won / member.assigned) * 100) : 0;
                    return (
                      <tr key={member.memberId} className="text-gray-300">
                        <td className="py-3 font-medium text-white">{member.name}</td>
                        <td className="py-3 text-center">{member.assigned}</td>
                        <td className="py-3 text-center text-emerald-400 font-semibold">{member.won}</td>
                        <td className="py-3 text-center">{member.avgScore}</td>
                        <td className="py-3 text-right text-indigo-400 font-bold">{rate}%</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Win/Loss Analysis */}
        <div className="space-y-4">
          {/* Won Analytics */}
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-emerald-400" />
              Closed Won Analysis
            </h4>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Deals Won:</span>
                <span className="font-semibold text-white">{analytics.wonAnalysis.totalWon}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Avg Time To Close:</span>
                <span className="font-semibold text-white">{analytics.wonAnalysis.avgDaysToClose} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Top Service Sold:</span>
                <span className="font-semibold text-white text-right truncate max-w-[120px]">{analytics.wonAnalysis.topService}</span>
              </div>
            </div>
          </div>

          {/* Lost Analytics */}
          <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Closed Lost Diagnostics
            </h4>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Deals Lost:</span>
                <span className="font-semibold text-white">{analytics.lostAnalysis.totalLost}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-gray-400">Primary Reason For Loss:</span>
                <span className="font-semibold text-rose-300 italic whitespace-normal mt-0.5">
                  "{analytics.lostAnalysis.topReason}"
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
