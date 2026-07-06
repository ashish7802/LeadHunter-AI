'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/dashboard/Header';
import { MetricsOverview } from '@/components/dashboard/MetricsOverview';
import { AnalyticsCharts } from '@/components/dashboard/AnalyticsCharts';
import { LeadFilters } from '@/components/dashboard/LeadFilters';
import { LeadTable } from '@/components/dashboard/LeadTable';
import { LeadPipelineView } from '@/components/dashboard/LeadPipelineView';
import { LeadDrawer } from '@/components/dashboard/LeadDrawer';
import { PipelineRunnerModal } from '@/components/dashboard/PipelineRunnerModal';
import { Lead, PipelineMetrics } from '@/lib/types/lead';
import { LayoutGrid, Table, RefreshCw, Sparkles } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [metrics, setMetrics] = useState<PipelineMetrics>({
    totalLeads: 0,
    qualifiedLeads: 0,
    hotLeads: 0,
    indiaLeads: 0,
    canadaLeads: 0,
    todayLeads: 0,
    avgLeadScore: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'pipeline'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');

  // Filters
  const [industryFilter, setIndustryFilter] = useState('All');
  const [platformFilter, setPlatformFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [websiteFilter, setWebsiteFilter] = useState('All');

  // Drawer & Modal states
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [modalSummary, setModalSummary] = useState<any | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Fetch leads from API
  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        searchQuery,
        country: selectedCountry,
        industry: industryFilter,
        platform: platformFilter,
        priority: priorityFilter,
        websiteStatus: websiteFilter,
      });

      const res = await fetch(`/api/leads?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
        setMetrics(data.metrics || metrics);
      }
    } catch (err) {
      console.error('[Dashboard] Fetch error:', err);
      addToast('Failed to load leads from server.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCountry, industryFilter, platformFilter, priorityFilter, websiteFilter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Trigger Live Scraper & AI Qualification Pipeline
  const handleTriggerPipeline = async (region: string) => {
    setIsPipelineRunning(true);
    setModalOpen(true);
    setModalStep(1);
    setModalSummary(null);

    try {
      setTimeout(() => setModalStep(2), 900);
      setTimeout(() => setModalStep(3), 1800);
      setTimeout(() => setModalStep(4), 2700);
      setTimeout(() => setModalStep(5), 3600);

      const res = await fetch('/api/pipeline/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region: region === 'All' ? 'All' : region }),
      });

      if (res.ok) {
        const data = await res.json();
        setModalSummary(data.summary);
        fetchLeads();
        addToast(
          `Pipeline complete! Discovered ${data.summary?.newQualified || 0} qualified lead signals.`,
          'success'
        );
      } else {
        addToast('Pipeline execution encountered an issue.', 'error');
      }
    } catch (err) {
      console.error('[Pipeline] Execution error:', err);
      addToast('Error running pipeline scanner.', 'error');
    } finally {
      setIsPipelineRunning(false);
    }
  };

  // Export handler
  const handleExport = (format: 'csv' | 'json') => {
    window.open(`/api/export?format=${format}&country=${selectedCountry}`, '_blank');
    addToast(`Exporting leads as ${format.toUpperCase()}...`, 'info');
  };

  // Update lead pipeline stage
  const handleUpdateStatus = async (leadId: string, status: Lead['pipelineStatus']) => {
    try {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, pipelineStatus: status }),
      });
      if (res.ok) {
        const data = await res.json();
        setLeads((prev) => prev.map((l) => (l.id === leadId ? data.lead : l)));
        if (selectedLead?.id === leadId) {
          setSelectedLead(data.lead);
        }
        addToast('Pipeline stage updated.', 'success');
      }
    } catch (err) {
      console.error('[UpdateStatus] Error:', err);
    }
  };

  // Delete lead handler
  const handleDeleteLead = async (leadId: string) => {
    try {
      const res = await fetch(`/api/leads?id=${leadId}`, { method: 'DELETE' });
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => l.id !== leadId));
        if (selectedLead?.id === leadId) {
          setSelectedLead(null);
        }
        addToast('Lead removed from CRM.', 'success');
      }
    } catch (err) {
      addToast('Failed to delete lead.', 'error');
    }
  };

  // Add User Note
  const handleAddNote = async (leadId: string, note: string) => {
    try {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, userNote: note }),
      });
      if (res.ok) {
        const data = await res.json();
        setLeads((prev) => prev.map((l) => (l.id === leadId ? data.lead : l)));
        if (selectedLead?.id === leadId) {
          setSelectedLead(data.lead);
        }
        addToast('Note added.', 'success');
      }
    } catch (err) {
      console.error('[AddNote] Error:', err);
    }
  };

  // Add Tag
  const handleAddTag = async (leadId: string, tag: string) => {
    try {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, tagToAdd: tag }),
      });
      if (res.ok) {
        const data = await res.json();
        setLeads((prev) => prev.map((l) => (l.id === leadId ? data.lead : l)));
        if (selectedLead?.id === leadId) {
          setSelectedLead(data.lead);
        }
        addToast('Tag added.', 'success');
      }
    } catch (err) {
      console.error('[AddTag] Error:', err);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCountry('All');
    setIndustryFilter('All');
    setPlatformFilter('All');
    setPriorityFilter('All');
    setWebsiteFilter('All');
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-gray-100 flex flex-col">
      {/* Top Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCountry={selectedCountry}
        onCountryChange={setSelectedCountry}
        onTriggerPipeline={handleTriggerPipeline}
        isPipelineRunning={isPipelineRunning}
        onExport={handleExport}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        
        {/* Metrics Grid */}
        <MetricsOverview metrics={metrics} />

        {/* Analytics Visualizations */}
        <AnalyticsCharts leads={leads} />

        {/* Filters & View Controls */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <LeadFilters
              industryFilter={industryFilter}
              onIndustryChange={setIndustryFilter}
              platformFilter={platformFilter}
              onPlatformChange={setPlatformFilter}
              priorityFilter={priorityFilter}
              onPriorityChange={setPriorityFilter}
              websiteFilter={websiteFilter}
              onWebsiteChange={setWebsiteFilter}
              onReset={handleResetFilters}
            />

            {/* View Mode Toggle Buttons */}
            <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10 text-xs self-end sm:self-auto">
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  viewMode === 'table'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>
              <button
                onClick={() => setViewMode('pipeline')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  viewMode === 'pipeline'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Pipeline Board</span>
              </button>
            </div>
          </div>

          {/* Main Content View */}
          {isLoading ? (
            <div className="glass-panel rounded-2xl p-12 text-center border border-white/10">
              <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin mx-auto mb-3" />
              <p className="text-xs text-gray-400 font-mono">Loading Lead Intelligence Data...</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="glass-panel rounded-2xl p-16 text-center border border-white/10">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-6 border border-indigo-500/30 shadow-xl">
                <Sparkles className="w-10 h-10 text-indigo-400 animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Leads Discovered Yet</h3>
              <p className="text-sm text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">
                Click "Discover Real Leads Now" to trigger live public scrapers (Algolia HN, GitHub Discussions, HN Jobs) and qualify leads using Groq LLaMA 3.3 70B for India 🇮🇳 & Canada 🇨🇦.
              </p>
              <button
                onClick={() => handleTriggerPipeline(selectedCountry)}
                disabled={isPipelineRunning}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Discover Real Leads Now</span>
              </button>
            </div>
          ) : viewMode === 'table' ? (
            <LeadTable
              leads={leads}
              onSelectLead={setSelectedLead}
              onUpdateStatus={handleUpdateStatus}
              onDeleteLead={handleDeleteLead}
            />
          ) : (
            <LeadPipelineView
              leads={leads}
              onSelectLead={setSelectedLead}
              onUpdateStatus={handleUpdateStatus}
            />
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#060911] py-6 px-6 text-center text-xs text-gray-500">
        <p>LeadHunter AI v2 • Powered by Groq LLaMA 3.3 70B & Real Public Data Sources • India 🇮🇳 & Canada 🇨🇦</p>
      </footer>

      {/* Lead Detail Inspector Drawer */}
      <LeadDrawer
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onUpdateStatus={handleUpdateStatus}
        onAddNote={handleAddNote}
        onAddTag={handleAddTag}
        onDeleteLead={handleDeleteLead}
      />

      {/* Pipeline Progress Modal */}
      <PipelineRunnerModal
        isOpen={modalOpen}
        region={selectedCountry}
        step={modalStep}
        resultsSummary={modalSummary}
        onClose={() => setModalOpen(false)}
      />

      {/* Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-[100] space-y-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-5 py-3 rounded-xl text-sm font-medium shadow-xl border backdrop-blur-sm animate-slide-up ${
              toast.type === 'success'
                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                : toast.type === 'error'
                ? 'bg-rose-500/20 border-rose-500/30 text-rose-300'
                : 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
