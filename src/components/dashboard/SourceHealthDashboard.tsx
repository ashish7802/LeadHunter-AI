'use client';

import React, { useEffect, useState } from 'react';
import { ConnectorHealth, QualityReport, QualityIssue } from '@/lib/types/lead';
import { Activity, CheckCircle2, XCircle, AlertTriangle, Clock, RefreshCw, ShieldAlert, Cpu, Heart, Check } from 'lucide-react';

export const SourceHealthDashboard: React.FC = () => {
  const [connectors, setConnectors] = useState<ConnectorHealth[]>([]);
  const [qualityReport, setQualityReport] = useState<QualityReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/connectors/health');
      if (res.ok) {
        const data = await res.json();
        setConnectors(data.connectors || []);
      }
      const qRes = await fetch('/api/quality/report');
      if (qRes.ok) {
        const qData = await qRes.json();
        setQualityReport(qData);
      }
    } catch (err) {
      console.error('[SourceHealth] Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Connected': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'Error': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      case 'Rate Limited': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'Not Configured': return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
      case 'Authentication Failed': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Connected': return <CheckCircle2 className="w-4 h-4" />;
      case 'Error': 
      case 'Authentication Failed': return <XCircle className="w-4 h-4" />;
      case 'Rate Limited': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getReliabilityColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-rose-400';
  };

  if (isLoading) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center border border-white/10">
        <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin mx-auto mb-3" />
        <p className="text-xs text-gray-400 font-mono">Loading Revenue Quality Auditor Reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            Revenue Auditor & Source Health
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Real-time status, reliability, and quality checks for the Revenue Intelligence Engine.
          </p>
        </div>
        <button 
          onClick={fetchData}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 transition-colors border border-white/10"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Audit
        </button>
      </div>

      {/* Quality Auditor Report Block */}
      {qualityReport && (
        <div className="glass-panel rounded-2xl p-5 border border-white/10 bg-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400" />
                Autonomous Quality Auditor Report
              </h3>
              <p className="text-xs text-gray-400">Timestamp: {new Date(qualityReport.timestamp).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">Auditor Health Index:</span>
              <span className={`text-xl font-black ${getReliabilityColor(qualityReport.score)}`}>{qualityReport.score}/100</span>
            </div>
          </div>

          {/* Issue list */}
          {qualityReport.issues.length === 0 ? (
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-3 text-xs text-emerald-400">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>No structural or data anomalies detected. All pipelines operating normally.</span>
            </div>
          ) : (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Identified Quality Issues ({qualityReport.issues.length})</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {qualityReport.issues.map((issue, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border space-y-2 text-xs ${
                    issue.severity === 'high' ? 'bg-rose-500/5 border-rose-500/20' : 'bg-amber-500/5 border-amber-500/20'
                  }`}>
                    <div className="flex justify-between items-start gap-2">
                      <span className={`font-bold uppercase text-[9px] px-1.5 py-0.5 rounded ${
                        issue.severity === 'high' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>{issue.severity} priority</span>
                      <span className="text-[10px] text-gray-400 capitalize">{issue.area.replace('_', ' ')}</span>
                    </div>
                    <h5 className="font-semibold text-white text-sm">{issue.title}</h5>
                    <p className="text-gray-300 leading-relaxed">{issue.explanation}</p>
                    <div className="pt-2 border-t border-white/5 space-y-1 text-[11px]">
                      <span className="text-gray-500 block"><strong className="text-gray-400">Impact:</strong> {issue.impactEstimate}</span>
                      <span className="text-indigo-300 block"><strong className="text-indigo-400">Fix Recommendation:</strong> {issue.recommendedFix}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Calibration recommendations */}
          {qualityReport.manualCalibrationRecommendations.length > 0 && (
            <div className="mt-4 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 space-y-2">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Continuous Calibration Action Items</h4>
              <ul className="list-disc list-inside text-xs text-gray-300 space-y-1.5">
                {qualityReport.manualCalibrationRecommendations.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Connectors Health Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {connectors.map((connector) => (
          <div key={connector.sourceId} className="glass-panel rounded-2xl p-5 border border-white/10 flex flex-col h-full hover:border-indigo-500/30 transition-all bg-white/5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-white">{connector.sourceName}</h3>
                <p className="text-xs text-gray-500 font-mono mt-0.5">{connector.sourceId}</p>
              </div>
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${getStatusColor(connector.status)}`}>
                {getStatusIcon(connector.status)}
                {connector.status}
              </div>
            </div>

            <div className="space-y-4 flex-grow">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-[#090D16] p-3 rounded-xl border border-white/5">
                  <div className="text-gray-500 text-xs mb-0.5">Reliability Score</div>
                  <div className={`text-xl font-bold ${getReliabilityColor(connector.reliabilityScore ?? 100)}`}>
                    {connector.reliabilityScore ?? 100}%
                  </div>
                </div>
                <div className="bg-[#090D16] p-3 rounded-xl border border-white/5">
                  <div className="text-gray-500 text-xs mb-0.5">Success Rate</div>
                  <div className="text-white font-semibold">{connector.successRate ?? 100}%</div>
                </div>
                <div className="bg-[#090D16] p-3 rounded-xl border border-white/5">
                  <div className="text-gray-500 text-xs mb-0.5">Average Runtime</div>
                  <div className="text-white font-semibold">
                    {connector.avgRuntimeMs ? `${Math.round(connector.avgRuntimeMs / 100) / 10}s` : 'N/A'}
                  </div>
                </div>
                <div className="bg-[#090D16] p-3 rounded-xl border border-white/5">
                  <div className="text-gray-500 text-xs mb-0.5">Qualified Produced</div>
                  <div className="text-emerald-400 font-semibold">{connector.qualifiedLeadsProduced.toLocaleString()}</div>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-gray-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Last Success
                  </span>
                  <span className="text-gray-200">
                    {connector.lastSync ? new Date(connector.lastSync).toLocaleString() : 'Never'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-gray-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> API Rate Limit Status
                  </span>
                  <span className={`font-medium ${
                    connector.apiRateLimitStatus === 'Good' ? 'text-emerald-400' :
                    connector.apiRateLimitStatus === 'Warning' ? 'text-amber-400' :
                    connector.apiRateLimitStatus === 'Exceeded' ? 'text-rose-400' :
                    'text-gray-400'
                  }`}>
                    {connector.apiRateLimitStatus}
                  </span>
                </div>
                {connector.errorMessage && (
                  <div className="mt-3 p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-300">
                    <span className="font-semibold block mb-0.5">Error:</span>
                    {connector.errorMessage}
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-xs text-gray-500">
              <span>Avg Quality Score: <span className="text-white font-medium">{connector.averageLeadScore || 0}</span></span>
              <span>API Usage: <span className="text-white font-medium">{connector.apiUsageCount}</span></span>
            </div>
          </div>
        ))}

        {connectors.length === 0 && (
          <div className="col-span-full glass-panel rounded-2xl p-8 text-center border border-white/10 bg-white/5">
            <p className="text-gray-400">No connectors configured. Run the pipeline to initialize sources.</p>
          </div>
        )}
      </div>
    </div>
  );
};
