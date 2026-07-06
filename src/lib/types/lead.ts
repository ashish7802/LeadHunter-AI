export type PlatformType = 'twitter' | 'reddit' | 'linkedin' | 'facebook' | 'instagram';
export type CountryType = 'India' | 'Canada' | 'Other';
export type LeadPriority = 'Hot Lead' | 'Qualified Lead' | 'Needs Review' | 'Rejected';
export type WebsiteStatus = 'No Website' | 'Outdated' | 'Needs Redesign' | 'Good' | 'Unreachable';

export interface LeadScoreBreakdown {
  websiteNeed: number;        // Max +25
  businessOwnerIntent: number; // Max +20
  budgetClarity: number;      // Max +15
  urgency: number;            // Max +15
  publicContact: number;      // Max +10
  targetCountryMatch: number; // Max +15
  recentPostBonus: number;    // Max +10
  spamPenalty: number;        // Penalty -50
  agencyPenalty: number;      // Penalty -40
  recruiterPenalty: number;   // Penalty -40
  duplicatePenalty: number;   // Penalty -30
  totalScore: number;         // 0 - 100
}

export interface WebsiteAnalysis {
  url?: string;
  hasWebsite: boolean;
  isResponsive?: boolean;
  usesHttps?: boolean;
  isMobileFriendly?: boolean;
  estimatedAgeYears?: number;
  qualityGrade?: 'A' | 'B' | 'C' | 'D' | 'F' | 'No Website';
  opportunityScore: number; // 0 - 100
  notes: string;
}

export interface Lead {
  id: string;
  leadName: string;
  companyName: string;
  businessType: string;
  industry: string;
  country: CountryType;
  city: string;
  language: string;
  needSummary: string;
  needCategory: 'New Website' | 'Redesign' | 'E-Commerce' | 'SaaS/App' | 'Landing Page' | 'Automation/CRM';
  estimatedBudget: string;
  urgency: 'Immediate (ASAP)' | 'High' | 'Medium' | 'Low';
  priority: LeadPriority;
  leadScore: number;
  confidenceScore: number;
  scoreBreakdown: LeadScoreBreakdown;
  
  publicEmail?: string;
  publicPhone?: string;
  socialProfileUrl?: string;
  
  platform: PlatformType;
  sourceUrl: string;
  sourceTimestamp: string;
  rawContent: string;
  authorHandle: string;
  
  websiteAnalysis: WebsiteAnalysis;
  aiReasoning: string;
  verificationStatus: 'Verified Real Business' | 'Pending Verification' | 'Rejected';
  duplicateStatus: 'Unique' | 'Duplicate Flagged';
  
  pipelineStatus: 'New Lead' | 'In Discussion' | 'Proposal Sent' | 'Closed Won' | 'Archived';
  userNotes: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RawPost {
  id: string;
  platform: PlatformType;
  sourceUrl: string;
  author: string;
  authorHandle: string;
  timestamp: string;
  content: string;
  locationHint?: string;
}

export interface PipelineMetrics {
  totalLeads: number;
  qualifiedLeads: number;
  hotLeads: number;
  indiaLeads: number;
  canadaLeads: number;
  todayLeads: number;
  avgLeadScore: number;
}

export interface CRMFilters {
  searchQuery: string;
  country: string;
  industry: string;
  platform: string;
  priority: string;
  websiteStatus: string;
  minScore: number;
  maxScore: number;
}
