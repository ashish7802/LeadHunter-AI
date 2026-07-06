'use client';

import React from 'react';
import { Filter, SlidersHorizontal, RotateCcw } from 'lucide-react';

interface FiltersProps {
  industryFilter: string;
  onIndustryChange: (val: string) => void;
  platformFilter: string;
  onPlatformChange: (val: string) => void;
  priorityFilter: string;
  onPriorityChange: (val: string) => void;
  websiteFilter: string;
  onWebsiteChange: (val: string) => void;
  onReset: () => void;
}

export const LeadFilters: React.FC<FiltersProps> = ({
  industryFilter,
  onIndustryChange,
  platformFilter,
  onPlatformChange,
  priorityFilter,
  onPriorityChange,
  websiteFilter,
  onWebsiteChange,
  onReset,
}) => {
  return (
    <div className="glass-panel rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 border border-white/10 text-xs">
      
      <div className="flex items-center gap-2 text-gray-400 font-semibold uppercase tracking-wider text-[11px]">
        <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
        <span>Refine Lead Pipeline</span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Industry / Category */}
        <select
          value={industryFilter}
          onChange={(e) => onIndustryChange(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-gray-300 focus:outline-none focus:border-indigo-500/50"
        >
          <option value="All" className="bg-[#111827]">All Industries</option>
          <option value="Healthcare" className="bg-[#111827]">Healthcare</option>
          <option value="E-Commerce" className="bg-[#111827]">E-Commerce</option>
          <option value="Real Estate" className="bg-[#111827]">Real Estate</option>
          <option value="Food & Beverage" className="bg-[#111827]">Food & Beverage</option>
          <option value="Technology" className="bg-[#111827]">Technology</option>
        </select>

        {/* Platform */}
        <select
          value={platformFilter}
          onChange={(e) => onPlatformChange(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-gray-300 focus:outline-none focus:border-indigo-500/50"
        >
          <option value="All" className="bg-[#111827]">All Sources</option>
          <option value="twitter" className="bg-[#111827]">X (Twitter)</option>
          <option value="linkedin" className="bg-[#111827]">LinkedIn</option>
          <option value="reddit" className="bg-[#111827]">Reddit</option>
          <option value="facebook" className="bg-[#111827]">Facebook</option>
        </select>

        {/* Priority Tier */}
        <select
          value={priorityFilter}
          onChange={(e) => onPriorityChange(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-gray-300 focus:outline-none focus:border-indigo-500/50"
        >
          <option value="All" className="bg-[#111827]">All Priorities</option>
          <option value="Hot Lead" className="bg-[#111827]">🔥 Hot Leads (90+)</option>
          <option value="Qualified Lead" className="bg-[#111827]">✅ Qualified (80-89)</option>
          <option value="Needs Review" className="bg-[#111827]">⚠️ Needs Review (60-79)</option>
        </select>

        {/* Website Opportunity */}
        <select
          value={websiteFilter}
          onChange={(e) => onWebsiteChange(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-gray-300 focus:outline-none focus:border-indigo-500/50"
        >
          <option value="All" className="bg-[#111827]">Website Status</option>
          <option value="No Website" className="bg-[#111827]">🚀 No Website (High Opportunity)</option>
          <option value="Has Website" className="bg-[#111827]">🌐 Existing Website (Redesign)</option>
        </select>

        {/* Reset */}
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

    </div>
  );
};
