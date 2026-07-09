'use client';

import React from 'react';
import { AIRecommendation } from '@/lib/types/lead';
import { AlertTriangle, Clock, Archive, TrendingUp, Sparkles, Thermometer } from 'lucide-react';

interface AIRecommendationsProps {
  recommendations: AIRecommendation[];
  onAction: (recommendation: AIRecommendation) => void;
}

const TYPE_CONFIG = {
  attention: {
    icon: AlertTriangle,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20'
  },
  overdue: {
    icon: Clock,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/20'
  },
  cold: {
    icon: Thermometer,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20'
  },
  archive: {
    icon: Archive,
    color: 'text-gray-400',
    bg: 'bg-gray-500/10 border-gray-500/20'
  },
  hot_industry: {
    icon: TrendingUp,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20'
  }
};

export const AIRecommendations: React.FC<AIRecommendationsProps> = ({
  recommendations,
  onAction,
}) => {
  const getUrgencyColor = (urg: string) => {
    if (urg === 'High') return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    if (urg === 'Medium') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
  };

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl">
        <Sparkles className="w-10 h-10 text-gray-600 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-white">All caught up!</h3>
        <p className="text-xs text-gray-400 mt-1">AI has no new recommendations for today.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {recommendations.map((rec, idx) => {
        const config = TYPE_CONFIG[rec.type] || TYPE_CONFIG.attention;
        const Icon = config.icon;

        return (
          <div
            key={idx}
            className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all bg-white/5 border-white/10 hover:bg-white/10`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className={`p-2 rounded-xl bg-white/5 border border-white/10 ${config.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getUrgencyColor(rec.urgency)}`}>
                  {rec.urgency} Priority
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="font-semibold text-sm text-white line-clamp-1">
                  {rec.title}
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {rec.description}
                </p>
              </div>
            </div>

            <button
              onClick={() => onAction(rec)}
              className="w-full py-2 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-400 hover:text-white text-xs font-semibold rounded-xl transition-all"
            >
              {rec.actionLabel}
            </button>
          </div>
        );
      })}
    </div>
  );
};
