'use client';

import React, { useState } from 'react';
import { Search, Sparkles, Download, RefreshCw, Globe, ShieldCheck, Cpu } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCountry: string;
  onCountryChange: (c: string) => void;
  onTriggerPipeline: (region: string) => void;
  isPipelineRunning: boolean;
  onExport: (format: 'csv' | 'json') => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  selectedCountry,
  onCountryChange,
  onTriggerPipeline,
  isPipelineRunning,
  onExport,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/10 bg-[#090D16]/80 backdrop-blur-xl px-6 py-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
        
        {/* Brand & System Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-[#090D16] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">LeadHunter <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">AI</span></h1>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">v2.0 Enterprise</span>
              </div>
              <p className="text-xs text-gray-400">High-Intent Web Development Intelligence • India & Canada</p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3 ml-4 pl-4 border-l border-white/10 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 live-badge-glow"></span>
              <Cpu className="w-3.5 h-3.5" />
              <span className="font-medium">Groq LLaMA 3.3 70B</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Globe className="w-3.5 h-3.5" />
              <span className="font-medium">Social Fetch API</span>
            </div>
          </div>
        </div>

        {/* Search & Country Tabs */}
        <div className="flex flex-1 max-w-xl items-center gap-3 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search company, tech need, city, industry, or lead name..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
            />
          </div>

          {/* Country Filter Pills */}
          <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10 text-xs">
            {['All', 'India', 'Canada'].map((c) => (
              <button
                key={c}
                onClick={() => onCountryChange(c)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  selectedCountry === c
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {c === 'India' && '🇮🇳 '}
                {c === 'Canada' && '🇨🇦 '}
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Pipeline Run Button */}
          <button
            onClick={() => onTriggerPipeline(selectedCountry)}
            disabled={isPipelineRunning}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${isPipelineRunning ? 'animate-spin' : ''}`} />
            <span>{isPipelineRunning ? 'Hunting Leads...' : 'Scan Public Feeds'}</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 py-2 rounded-xl bg-[#111827] border border-white/10 shadow-2xl z-50">
                <button
                  onClick={() => {
                    onExport('csv');
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-indigo-600/20 hover:text-white transition-colors flex items-center justify-between"
                >
                  <span>Export Qualified CSV</span>
                  <span className="text-[10px] font-mono bg-white/10 px-1.5 py-0.5 rounded">.CSV</span>
                </button>
                <button
                  onClick={() => {
                    onExport('json');
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-indigo-600/20 hover:text-white transition-colors flex items-center justify-between"
                >
                  <span>Export Structured JSON</span>
                  <span className="text-[10px] font-mono bg-white/10 px-1.5 py-0.5 rounded">.JSON</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
