'use client';

import React from 'react';
import { Company, Lead } from '@/lib/types/lead';
import { X, Building2, Globe, Mail, Phone, ExternalLink, Activity, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';

interface DrawerProps {
  company: (Company & { leads: Lead[] }) | null;
  onClose: () => void;
}

export const CompanyDrawer: React.FC<DrawerProps> = ({ company, onClose }) => {
  if (!company) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]" onClick={onClose} />
      
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-[#090D16] border-l border-white/10 z-[100] shadow-2xl flex flex-col animate-slide-left">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <Building2 className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{company.name}</h2>
              <p className="text-xs text-gray-400">{company.industry || 'Unknown Industry'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="glass-panel p-3 rounded-xl border border-white/5">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">Opportunity Value</span>
              <div className={`text-xl font-bold mt-1 ${
                company.opportunityValue === 'Enterprise' ? 'text-purple-400' :
                company.opportunityValue === 'High' ? 'text-emerald-400' :
                company.opportunityValue === 'Medium' ? 'text-blue-400' :
                'text-gray-400'
              }`}>{company.opportunityValue || 'Unknown'}</div>
            </div>
            <div className="glass-panel p-3 rounded-xl border border-white/5">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">Matched Services</span>
              <div className="text-xl font-bold text-indigo-400 mt-1">{company.matchedServices?.length || 0}</div>
            </div>
            <div className="glass-panel p-3 rounded-xl border border-white/5">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">Total Signals</span>
              <div className="text-xl font-bold text-white mt-1">{company.leadIds.length}</div>
            </div>
          </div>

          {/* Company Details */}
          <div className="glass-panel p-5 rounded-xl border border-white/5 space-y-4">
            <h3 className="text-sm font-semibold text-white border-b border-white/10 pb-2">Business Profile</h3>
            
            {company.description && (
              <p className="text-xs text-gray-300 leading-relaxed">{company.description}</p>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              {company.website && (
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Website</span>
                  <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:underline">
                    <Globe className="w-3 h-3" /> {company.website.replace(/^https?:\/\//, '')} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
              {company.location && (
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Location</span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-300">
                    <MapPin className="w-3 h-3 text-rose-400" /> {company.location}
                  </span>
                </div>
              )}
              {company.publicEmail && (
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Email</span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-300">
                    <Mail className="w-3 h-3 text-cyan-400" /> {company.publicEmail}
                  </span>
                </div>
              )}
              {company.publicPhone && (
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Phone</span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-300">
                    <Phone className="w-3 h-3 text-emerald-400" /> {company.publicPhone}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Internal Sales Workspace (from latest lead) */}
          {company.leads.length > 0 && company.leads[0].internalWorkspace && (
            <div className="glass-panel p-5 rounded-xl border border-indigo-500/30 bg-indigo-500/5 space-y-4">
              <h3 className="text-sm font-semibold text-indigo-300 border-b border-indigo-500/20 pb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                AI Sales Workspace
              </h3>
              
              <div>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Opportunity Summary</span>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {company.leads[0].internalWorkspace.opportunitySummary}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">AI Reasoning</span>
                <p className="text-[11px] text-gray-400 leading-relaxed bg-black/20 p-2 rounded">
                  {company.leads[0].internalWorkspace.aiReasoning}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Recommended Channel</span>
                  <p className="text-xs text-gray-300">
                    {company.leads[0].internalWorkspace.recommendedOutreachChannel}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Follow Up Timing</span>
                  <p className="text-xs font-bold text-emerald-400">
                    {company.leads[0].internalWorkspace.recommendedFollowUpTiming}
                  </p>
                </div>
              </div>

              {company.leads[0].internalWorkspace.businessPainPoints && company.leads[0].internalWorkspace.businessPainPoints.length > 0 && (
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-2">Key Pain Points</span>
                  <ul className="list-disc pl-4 space-y-1">
                    {company.leads[0].internalWorkspace.businessPainPoints.map((point, i) => (
                      <li key={i} className="text-xs text-gray-300">{point}</li>
                    ))}
                  </ul>
                </div>
              )}

              {company.leads[0].internalWorkspace.suggestedAgencyServices && company.leads[0].internalWorkspace.suggestedAgencyServices.length > 0 && (
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-2">Suggested Services</span>
                  <div className="flex flex-wrap gap-2">
                    {company.leads[0].internalWorkspace.suggestedAgencyServices.map((service, i) => (
                      <span key={i} className="text-[10px] px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {company.leads[0].internalWorkspace.nextActions && company.leads[0].internalWorkspace.nextActions.length > 0 && (
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-2">Next Actions</span>
                  <ul className="list-disc pl-4 space-y-1">
                    {company.leads[0].internalWorkspace.nextActions.map((action, i) => (
                      <li key={i} className="text-[11px] text-gray-300">{action}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Signal Timeline */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              Buying Signal Timeline
            </h3>
            
            <div className="space-y-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
              {company.leads.map((lead, idx) => (
                <div key={lead.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-[#090D16] group-[.is-active]:bg-indigo-500/20 text-indigo-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-xl">
                    <span className="text-[10px] font-bold">{idx + 1}</span>
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-panel p-4 rounded-xl border border-white/5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-indigo-300 px-2 py-0.5 bg-indigo-500/10 rounded">
                        {lead.platform}
                      </span>
                      <time className="text-[10px] text-gray-500">{new Date(lead.sourceTimestamp).toLocaleDateString()}</time>
                    </div>
                    <div className="text-xs text-white font-medium mb-2">{lead.intentCategory}</div>
                    <p className="text-[11px] text-gray-400 line-clamp-3 bg-white/5 p-2 rounded border border-white/5">"{lead.rawContent}"</p>
                    <a href={lead.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-blue-400 hover:underline mt-2">
                      View Source <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};
