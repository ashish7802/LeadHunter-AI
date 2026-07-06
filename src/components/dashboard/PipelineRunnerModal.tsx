'use client';

import React from 'react';
import { Sparkles, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  region: string;
  step: number;
  resultsSummary: any | null;
  onClose: () => void;
}

export const PipelineRunnerModal: React.FC<ModalProps> = ({
  isOpen,
  region,
  step,
  resultsSummary,
  onClose,
}) => {
  if (!isOpen) return null;

  const steps = [
    { num: 1, title: 'Multi-Source Public API Ingestion', desc: `Scanning Algolia HN, GitHub Issues, and HN JobStream for ${region} intent` },
    { num: 2, title: 'Data Cleaning & Content Hash Deduplication', desc: 'Filtering out spam, duplicate posts, and recruiters' },
    { num: 3, title: 'Groq LLaMA 3.3 70B AI Qualification', desc: 'Extracting business purchase intent, budget clarity, and urgency' },
    { num: 4, title: 'Live Website Verification Layer', desc: 'HTTP HEAD verification for domain status, HTTPS, and age signals' },
    { num: 5, title: 'Weighted Lead Scoring & CRM Sync', desc: 'Applying multi-signal scoring (0–100) and priority tagging' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="w-full max-w-lg bg-[#0F172A] border border-white/10 rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden">
        
        {/* Glow backdrop */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-lg">
            <Sparkles className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <h3 className="text-base font-bold">Live Lead Intelligence Pipeline Running</h3>
            <p className="text-xs text-gray-400">Target Region: <span className="text-cyan-400 font-semibold">{region}</span></p>
          </div>
        </div>

        {/* Pipeline Stepper */}
        <div className="space-y-4 mb-6">
          {steps.map((s) => {
            const isDone = step > s.num || Boolean(resultsSummary);
            const isCurrent = step === s.num && !resultsSummary;

            return (
              <div
                key={s.num}
                className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                  isDone
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : isCurrent
                    ? 'bg-indigo-500/10 border-indigo-500/40 text-white shadow-lg'
                    : 'bg-white/5 border-white/5 text-gray-500'
                }`}
              >
                <div className="mt-0.5">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-gray-600 flex items-center justify-center text-[10px]">
                      {s.num}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-semibold">{s.title}</h4>
                  <p className="text-[11px] opacity-80">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Results Summary when finished */}
        {resultsSummary && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 mb-6 animate-in fade-in">
            <h4 className="font-bold mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Pipeline Run Complete!</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 mt-2 text-[11px]">
              <div>Posts Ingested: <span className="font-bold text-white">{resultsSummary.totalIngested}</span></div>
              <div>Newly Qualified: <span className="font-bold text-emerald-400">{resultsSummary.newQualified}</span></div>
              <div>Duplicates Filtered: <span className="font-bold text-white">{resultsSummary.duplicatesFiltered}</span></div>
              <div>Spam/Low Score Rejected: <span className="font-bold text-rose-400">{resultsSummary.rejectedCount}</span></div>
            </div>
          </div>
        )}

        {resultsSummary && (
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-xs shadow-lg transition-all"
          >
            View Qualified Leads in CRM
          </button>
        )}

      </div>
    </div>
  );
};
