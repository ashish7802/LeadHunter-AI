'use client';

import React, { useEffect, useState } from 'react';
import { Activity, ShieldCheck, ShieldAlert, AlertTriangle, RefreshCw, BarChart2, Database, WifiOff } from 'lucide-react';

export default function SourceHealthPage() {
  const [connectors, setConnectors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pipeline/history') // We can reuse or create an endpoint to fetch connector health
      .then(res => res.json())
      .then(data => {
        // Since we didn't make a dedicated endpoint for health yet, let's create a mocked view 
        // that fetches from a new endpoint /api/health which we will create shortly
      })
      .catch(console.error);

    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setConnectors(data.connectors);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Connected': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Rate Limited': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'Error': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'Not Configured': return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Connected': return <ShieldCheck className="w-4 h-4" />;
      case 'Rate Limited': return <AlertTriangle className="w-4 h-4" />;
      case 'Error': return <ShieldAlert className="w-4 h-4" />;
      case 'Not Configured': return <WifiOff className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Connector Health
          </h1>
          <p className="text-gray-400 mt-2">Production data source connectivity and metrics</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors"
        >
          <RefreshCw className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {connectors.map((connector, i) => (
            <div key={i} className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${
                    connector.status === 'Connected' ? 'bg-emerald-500/20 text-emerald-400' :
                    connector.status === 'Not Configured' ? 'bg-gray-500/20 text-gray-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{connector.sourceName}</h3>
                    <p className="text-xs text-gray-500">{connector.sourceId}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(connector.status)}`}>
                  {getStatusIcon(connector.status)}
                  {connector.status}
                </div>
              </div>

              {connector.errorMessage && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{connector.errorMessage}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-400">Total Retrieved</p>
                  <p className="text-xl font-semibold text-white">{connector.totalPostsRetrieved}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-400">Qualified Leads</p>
                  <p className="text-xl font-semibold text-emerald-400">{connector.qualifiedLeadsProduced}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-400">Avg Response Time</p>
                  <p className="text-xl font-semibold text-white">
                    {connector.averageResponseTimeMs > 0 ? `${Math.round(connector.averageResponseTimeMs)}ms` : '-'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-400">API Usage</p>
                  <p className="text-xl font-semibold text-indigo-400">{connector.apiUsageCount}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 text-xs text-gray-500 flex justify-between">
                <span>Last Sync: {new Date(connector.lastSync).toLocaleString()}</span>
                {connector.errorCount > 0 && <span className="text-red-400">{connector.errorCount} Errors</span>}
              </div>
            </div>
          ))}

          {connectors.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-400 border border-dashed border-white/10 rounded-2xl">
              No connectors initialized. Run a pipeline to register connectors.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
