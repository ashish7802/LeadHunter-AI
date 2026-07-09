'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/dashboard/Header';
import { MetricsOverview } from '@/components/dashboard/MetricsOverview';
import { AnalyticsCharts } from '@/components/dashboard/AnalyticsCharts';
import { LeadFilters } from '@/components/dashboard/LeadFilters';
import { LeadTable } from '@/components/dashboard/LeadTable';
import { OpportunityBoard } from '@/components/dashboard/OpportunityBoard';
import { CRMDrawer } from '@/components/dashboard/CRMDrawer';
import { FollowUpManager } from '@/components/dashboard/FollowUpManager';
import { AIRecommendations } from '@/components/dashboard/AIRecommendations';
import { AgencyAnalyticsView } from '@/components/dashboard/AgencyAnalytics';
import { PipelineRunnerModal } from '@/components/dashboard/PipelineRunnerModal';
import { SourceHealthDashboard } from '@/components/dashboard/SourceHealthDashboard';
import { Lead, Company, PipelineMetrics, TeamMember, AIRecommendation, AgencyAnalytics, OpportunityStage } from '@/lib/types/lead';
import { LayoutGrid, Table, RefreshCw, Sparkles, Activity, Calendar, Trophy, BarChart3 } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

type ViewMode = 'board' | 'table' | 'followups' | 'recommendations' | 'analytics' | 'sources';

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AgencyAnalytics | null>(null);
  
  const [metrics, setMetrics] = useState<PipelineMetrics>({
    totalOpportunities: 0,
    outreachReady: 0,
    verifiedBusinesses: 0,
    highAgencyFit: 0,
    contactableDecisionMakers: 0,
    avgOpportunityScore: 0,
    avgAgencyFitScore: 0,
    falsePositiveRate: 0,
    totalNoiseEliminated: 0,
    contactMatchRate: 0,
    meetingsBooked: 0,
    proposalsSent: 0,
    wonOpportunities: 0,
    lostOpportunities: 0,
    avgTimeToContactDays: 0,
    conversionRate: 0,
    stageDistribution: {},
  });

  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');

  // Filters
  const [industryFilter, setIndustryFilter] = useState('All');
  const [platformFilter, setPlatformFilter] = useState('All');
  const [opportunityValueFilter, setOpportunityValueFilter] = useState('All');
  const [serviceFilter, setServiceFilter] = useState('All');
  const [websiteFilter, setWebsiteFilter] = useState('All');
  
  // CRM Filters
  const [stageFilter, setStageFilter] = useState('All');
  const [assignedFilter, setAssignedFilter] = useState('All');
  const [starredFilter, setStarredFilter] = useState('All');
  const [labelFilter, setLabelFilter] = useState('All');

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

  // Fetch core CRM data
  const fetchCRMData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        search: searchQuery,
        country: selectedCountry,
        industry: industryFilter,
        platform: platformFilter,
        opportunityValue: opportunityValueFilter,
        service: serviceFilter,
        websiteStatus: websiteFilter,
        stage: stageFilter,
        assignedTo: assignedFilter,
        isStarred: starredFilter,
        label: labelFilter,
      });

      const res = await fetch(`/api/opportunities?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
        setMetrics(data.metrics || metrics);
      }
      
      const teamRes = await fetch('/api/team');
      if (teamRes.ok) {
        const teamData = await teamRes.json();
        setTeamMembers(teamData.members || []);
      }

      const recsRes = await fetch('/api/ai/recommendations');
      if (recsRes.ok) {
        const recsData = await recsRes.json();
        setRecommendations(recsData.recommendations || []);
      }

      const analyticsRes = await fetch('/api/analytics');
      if (analyticsRes.ok) {
        const aData = await analyticsRes.json();
        setAnalyticsData(aData);
      }
    } catch (err) {
      console.error('[Dashboard] Fetch error:', err);
      addToast('Failed to load CRM data.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [
    searchQuery, selectedCountry, industryFilter, platformFilter,
    opportunityValueFilter, serviceFilter, websiteFilter,
    stageFilter, assignedFilter, starredFilter, labelFilter
  ]);

  useEffect(() => {
    fetchCRMData();
  }, [fetchCRMData]);

  // Trigger Scanner Pipeline
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
        fetchCRMData();
        addToast(
          `Pipeline complete! Discovered ${data.summary?.newQualified || 0} qualified opportunities.`,
          'success'
        );
      } else {
        addToast('Pipeline execution failed.', 'error');
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
    addToast(`Exporting pipeline as ${format.toUpperCase()}...`, 'info');
  };

  // CRM Mutation Dispatcher Helper
  const dispatchCRMAction = async (leadId: string, action: string, data: any) => {
    try {
      const res = await fetch('/api/opportunities', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, action, ...data }),
      });
      if (res.ok) {
        const body = await res.json();
        
        // Update state locally for speed
        setLeads((prev) => prev.map((l) => (l.id === leadId ? body.lead : l)));
        if (selectedLead?.id === leadId) {
          setSelectedLead(body.lead);
        }
        
        // Refresh dependencies
        const analyticsRes = await fetch('/api/analytics');
        if (analyticsRes.ok) {
          const aData = await analyticsRes.json();
          setAnalyticsData(aData);
        }
        
        const metricsRes = await fetch(`/api/opportunities?getMetricsOnly=true`);
        if (metricsRes.ok) {
          const mData = await metricsRes.json();
          setMetrics(mData.metrics);
        }
        
        return true;
      }
      return false;
    } catch (err) {
      console.error(`[CRM Action: ${action}] error:`, err);
      addToast('CRM operation failed.', 'error');
      return false;
    }
  };

  // Specific CRM Handlers
  const handleStageChange = async (leadId: string, stage: OpportunityStage) => {
    const ok = await dispatchCRMAction(leadId, 'updateStage', { stage });
    if (ok) addToast(`Moved opportunity to ${stage}`, 'success');
  };

  const handleAssign = async (leadId: string, memberId: string | null) => {
    const ok = await dispatchCRMAction(leadId, 'assign', { teamMemberId: memberId });
    if (ok) addToast(memberId ? 'Opportunity assigned to rep' : 'Opportunity unassigned', 'success');
  };

  const handleToggleStar = async (leadId: string) => {
    await dispatchCRMAction(leadId, 'toggleStar', {});
  };

  const handleAddNote = async (leadId: string, content: string) => {
    const ok = await dispatchCRMAction(leadId, 'addNote', { content, author: 'User' });
    if (ok) addToast('Internal note saved.', 'success');
  };

  const handleAddFollowUp = async (leadId: string, data: any) => {
    const ok = await dispatchCRMAction(leadId, 'addFollowUp', data);
    if (ok) addToast('Follow-up task scheduled.', 'success');
  };

  const handleCompleteFollowUp = async (leadId: string, followUpId: string) => {
    const ok = await dispatchCRMAction(leadId, 'completeFollowUp', { followUpId });
    if (ok) addToast('Follow-up task completed.', 'success');
  };

  const handleAddLabel = async (leadId: string, label: string) => {
    await dispatchCRMAction(leadId, 'addLabel', { label });
  };

  const handleRemoveLabel = async (leadId: string, label: string) => {
    await dispatchCRMAction(leadId, 'removeLabel', { label });
  };

  const handleUpdateMeeting = async (leadId: string, status: string) => {
    await dispatchCRMAction(leadId, 'updateMeeting', { meetingStatus: status });
  };

  const handleUpdateProposal = async (leadId: string, status: string) => {
    await dispatchCRMAction(leadId, 'updateProposal', { proposalStatus: status });
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      const res = await fetch(`/api/opportunities?id=${leadId}`, { method: 'DELETE' });
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => l.id !== leadId));
        if (selectedLead?.id === leadId) setSelectedLead(null);
        addToast('Opportunity deleted.', 'success');
      }
    } catch (err) {
      addToast('Failed to delete opportunity.', 'error');
    }
  };

  const handleRecommendationAction = (rec: AIRecommendation) => {
    if (rec.leadId) {
      const lead = leads.find(l => l.id === rec.leadId);
      if (lead) {
        setSelectedLead(lead);
      }
    } else if (rec.type === 'hot_industry') {
      setIndustryFilter(rec.title.split(' ')[0]);
      setViewMode('board');
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCountry('All');
    setIndustryFilter('All');
    setPlatformFilter('All');
    setOpportunityValueFilter('All');
    setServiceFilter('All');
    setWebsiteFilter('All');
    setStageFilter('All');
    setAssignedFilter('All');
    setStarredFilter('All');
    setLabelFilter('All');
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

        {/* Filters & View Controls */}
        <div className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <LeadFilters
                industryFilter={industryFilter}
                onIndustryChange={setIndustryFilter}
                platformFilter={platformFilter}
                onPlatformChange={setPlatformFilter}
                opportunityValueFilter={opportunityValueFilter}
                onOpportunityValueChange={setOpportunityValueFilter}
                serviceFilter={serviceFilter}
                onServiceChange={setServiceFilter}
                websiteFilter={websiteFilter}
                onWebsiteChange={setWebsiteFilter}
                stageFilter={stageFilter}
                onStageChange={setStageFilter}
                assignedFilter={assignedFilter}
                onAssignedChange={setAssignedFilter}
                starredFilter={starredFilter}
                onStarredChange={setStarredFilter}
                labelFilter={labelFilter}
                onLabelChange={setLabelFilter}
                teamMembers={teamMembers}
                onReset={handleResetFilters}
              />

              {/* View Mode Toggle Buttons */}
              <div className="flex flex-wrap items-center p-1 rounded-xl bg-white/5 border border-white/10 text-xs self-end sm:self-auto gap-1">
                <button
                  onClick={() => setViewMode('board')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                    viewMode === 'board'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Kanban</span>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                    viewMode === 'table'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>CRM Table</span>
                </button>
                <button
                  onClick={() => setViewMode('followups')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                    viewMode === 'followups'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Follow-ups</span>
                </button>
                <button
                  onClick={() => setViewMode('recommendations')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                    viewMode === 'recommendations'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Recs</span>
                </button>
                <button
                  onClick={() => setViewMode('analytics')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                    viewMode === 'analytics'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Analytics</span>
                </button>
                <button
                  onClick={() => setViewMode('sources')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                    viewMode === 'sources'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Sources</span>
                </button>
              </div>
            </div>

            {/* In-page charts (visible only in main board/table views to reduce clutter) */}
            {(viewMode === 'board' || viewMode === 'table') && (
              <AnalyticsCharts leads={leads} />
            )}
          </div>

          {/* Main Content View */}
          {isLoading ? (
            <div className="glass-panel rounded-2xl p-12 text-center border border-white/10">
              <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin mx-auto mb-3" />
              <p className="text-xs text-gray-400 font-mono">Synchronizing Workspace Intel...</p>
            </div>
          ) : leads.length === 0 && viewMode !== 'recommendations' && viewMode !== 'analytics' ? (
            <div className="glass-panel rounded-2xl p-16 text-center border border-white/10">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-6 border border-indigo-500/30 shadow-xl">
                <Sparkles className="w-10 h-10 text-indigo-400 animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Opportunities Match Your Filter</h3>
              <p className="text-sm text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">
                Click "Discover Real Leads Now" or reset your CRM/Pipeline filters to inspect worldwide business purchase opportunities.
              </p>
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5"
              >
                <span>Reset Workspace Filters</span>
              </button>
            </div>
          ) : viewMode === 'board' ? (
            <OpportunityBoard
              leads={leads}
              teamMembers={teamMembers}
              onSelectLead={setSelectedLead}
              onStageChange={handleStageChange}
              onToggleStar={handleToggleStar}
            />
          ) : viewMode === 'table' ? (
            <LeadTable
              leads={leads}
              teamMembers={teamMembers}
              onSelectLead={setSelectedLead}
              onStageChange={handleStageChange}
              onAssign={handleAssign}
              onToggleStar={handleToggleStar}
              onDeleteLead={handleDeleteLead}
            />
          ) : viewMode === 'followups' ? (
            <FollowUpManager
              leads={leads}
              teamMembers={teamMembers}
              onSelectLead={setSelectedLead}
              onCompleteFollowUp={handleCompleteFollowUp}
            />
          ) : viewMode === 'recommendations' ? (
            <AIRecommendations
              recommendations={recommendations}
              onAction={handleRecommendationAction}
            />
          ) : viewMode === 'analytics' ? (
            <AgencyAnalyticsView
              analytics={analyticsData}
              metrics={metrics}
            />
          ) : (
            <SourceHealthDashboard />
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#060911] py-6 px-6 text-center text-xs text-gray-500">
        <p>LeadHunter AI — Internal Agency CRM & Operating System • Groq LLaMA 3.3 70B & Production API Connectors • Worldwide</p>
      </footer>

      {/* CRM Slide-out Drawer */}
      <CRMDrawer
        lead={selectedLead}
        isOpen={Boolean(selectedLead)}
        onClose={() => setSelectedLead(null)}
        teamMembers={teamMembers}
        onStageChange={handleStageChange}
        onToggleStar={handleToggleStar}
        onAssign={handleAssign}
        onAddNote={handleAddNote}
        onAddFollowUp={handleAddFollowUp}
        onCompleteFollowUp={handleCompleteFollowUp}
        onAddLabel={handleAddLabel}
        onRemoveLabel={handleRemoveLabel}
        onUpdateMeeting={handleUpdateMeeting}
        onUpdateProposal={handleUpdateProposal}
        onDelete={handleDeleteLead}
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
