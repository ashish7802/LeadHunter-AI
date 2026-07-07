'use client';

import React from 'react';
import { Lead } from '@/lib/types/lead';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { BarChart3, PieChart as PieIcon, Layers } from 'lucide-react';

interface ChartsProps {
  leads: Lead[];
}

export const AnalyticsCharts: React.FC<ChartsProps> = ({ leads }) => {
  // Score distribution data
  const scoreBuckets = [
    { name: 'Hot (>90)', count: leads.filter((l) => l.leadScore >= 90).length, color: '#F43F5E' },
    { name: 'Qualified (80-89)', count: leads.filter((l) => l.leadScore >= 80 && l.leadScore < 90).length, color: '#10B981' },
    { name: 'Review (60-79)', count: leads.filter((l) => l.leadScore >= 60 && l.leadScore < 80).length, color: '#F59E0B' },
    { name: 'Rejected (<60)', count: leads.filter((l) => l.leadScore < 60).length, color: '#6B7280' },
  ];

  // Country breakdown data
  const countryCounts = [
    { name: 'India 🇮🇳', value: leads.filter((l) => l.country === 'India').length, color: '#F59E0B' },
    { name: 'Canada 🇨🇦', value: leads.filter((l) => l.country === 'Canada').length, color: '#EF4444' },
    { name: 'Other', value: leads.filter((l) => l.country !== 'India' && l.country !== 'Canada').length, color: '#6366F1' },
  ].filter((item) => item.value > 0);

  // Need Category data
  const categoryMap: Record<string, number> = {};
  leads.forEach((l) => {
    categoryMap[l.intentCategory] = (categoryMap[l.intentCategory] || 0) + 1;
  });

  const categoryData = Object.entries(categoryMap).map(([key, val]) => ({
    name: key,
    count: val,
  }));

  const COLORS = ['#6366F1', '#06B6D4', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Score Distribution */}
      <div className="glass-panel rounded-2xl p-5 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Lead Score Distribution</h3>
          </div>
          <span className="text-[11px] font-mono text-gray-400">0–100 Scale</span>
        </div>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scoreBuckets} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#6B7280" fontSize={11} tickLine={false} />
              <YAxis stroke="#6B7280" fontSize={11} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', fontSize: '12px' }}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {scoreBuckets.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Target Country Breakdown */}
      <div className="glass-panel rounded-2xl p-5 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">Country Intent Breakdown</h3>
          </div>
          <span className="text-[11px] font-mono text-gray-400">Target Markets</span>
        </div>
        <div className="h-44 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={countryCounts}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={5}
                dataKey="value"
              >
                {countryCounts.map((entry, index) => (
                  <Cell key={`pie-cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-2 ml-4">
            {countryCounts.map((c, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }}></span>
                <span className="text-gray-300 font-medium">{c.name}:</span>
                <span className="text-white font-bold">{c.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Service Need Categories */}
      <div className="glass-panel rounded-2xl p-5 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Service Need Categories</h3>
          </div>
          <span className="text-[11px] font-mono text-gray-400">Extracted AI Signals</span>
        </div>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 10, left: 30, bottom: 5 }}>
              <XAxis type="number" stroke="#6B7280" fontSize={11} hide />
              <YAxis dataKey="name" type="category" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', fontSize: '12px' }}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {categoryData.map((entry, index) => (
                  <Cell key={`cat-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
