'use client';

import React from 'react';
import { Company, Lead } from '@/lib/types/lead';
import { Building2, Globe, Mail, Phone, ExternalLink, Calendar, ChevronRight, Activity, TrendingUp } from 'lucide-react';

interface TableProps {
  companies: (Company & { leads: Lead[] })[];
  onSelectCompany: (company: Company & { leads: Lead[] }) => void;
}

export const CompanyTable: React.FC<TableProps> = ({ companies, onSelectCompany }) => {
  return (
    <div className="flex flex-col gap-4">
      {companies.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center border border-white/10 my-4">
          <div className="w-12 h-12 rounded-full bg-white/5 mx-auto flex items-center justify-center text-gray-400 mb-3">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">No Companies Found</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            Run the AI pipeline to discover and group leads into real companies.
          </p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-gray-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Company Info</th>
                  <th className="py-3.5 px-4">Signals</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Opportunity</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {companies.map((comp) => {
                  return (
                    <tr
                      key={comp.id}
                      onClick={() => onSelectCompany(comp)}
                      className="hover:bg-white/[0.04] transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-white text-sm group-hover:text-indigo-400 transition-colors">
                            {comp.name}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {comp.industry || comp.businessCategory || 'Unknown Industry'}
                          </span>
                          {comp.location && (
                            <span className="text-[11px] text-gray-500 mt-1">{comp.location}</span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1 text-xs text-indigo-300 font-medium">
                            <Activity className="w-3.5 h-3.5" />
                            {comp.leadIds.length} Buying Signal(s)
                          </span>
                          <span className="text-[10px] text-gray-400">
                            Last: {new Date(comp.latestActivityTimestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1.5">
                          {comp.website ? (
                            <a href={comp.website.startsWith('http') ? comp.website : `https://${comp.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-400 hover:underline text-[11px]">
                              <Globe className="w-3 h-3" />
                              {comp.website.replace(/^https?:\/\//, '')}
                            </a>
                          ) : (
                            <span className="flex items-center gap-1.5 text-gray-500 text-[11px]"><Globe className="w-3 h-3" /> No Website</span>
                          )}
                          {comp.publicEmail && (
                            <span className="flex items-center gap-1.5 text-cyan-400 text-[11px]"><Mail className="w-3 h-3" /> {comp.publicEmail}</span>
                          )}
                          {comp.publicPhone && (
                            <span className="flex items-center gap-1.5 text-emerald-400 text-[11px]"><Phone className="w-3 h-3" /> {comp.publicPhone}</span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                         <div className="flex flex-col gap-2 w-40">
                          <div className="flex justify-between items-center text-[10px] mb-1">
                            <span className="text-gray-400">Value</span>
                            <span className={`font-medium px-2 py-0.5 rounded-full ${
                              comp.opportunityValue === 'Enterprise' ? 'bg-purple-500/20 text-purple-300' :
                              comp.opportunityValue === 'High' ? 'bg-emerald-500/20 text-emerald-300' :
                              comp.opportunityValue === 'Medium' ? 'bg-blue-500/20 text-blue-300' :
                              'bg-gray-500/20 text-gray-300'
                            }`}>{comp.opportunityValue || 'Unknown'}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {comp.matchedServices && comp.matchedServices.slice(0, 2).map((service, idx) => (
                              <span key={idx} className="text-[9px] px-1.5 py-0.5 bg-indigo-500/10 text-indigo-300 rounded border border-indigo-500/20 whitespace-nowrap">
                                {service}
                              </span>
                            ))}
                            {comp.matchedServices && comp.matchedServices.length > 2 && (
                              <span className="text-[9px] px-1.5 py-0.5 bg-white/5 text-gray-400 rounded border border-white/10">
                                +{comp.matchedServices.length - 2}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCompany(comp);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 font-medium text-xs border border-indigo-500/30 transition-colors"
                        >
                          <span>View Profile</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
