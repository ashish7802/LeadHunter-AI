export type PlatformType = 'twitter' | 'reddit' | 'linkedin' | 'facebook' | 'instagram' | 'upwork';
export type CountryType = string;

// ─── Opportunity Lifecycle ───────────────────────────────────────
export type OpportunityStage =
  | 'Discovered'
  | 'AI Qualified'
  | 'Company Verified'
  | 'Contact Verified'
  | 'Needs Research'
  | 'Ready For Outreach'
  | 'Outreach Sent'
  | 'Follow-up Scheduled'
  | 'Meeting Booked'
  | 'Proposal Sent'
  | 'Negotiation'
  | 'Won'
  | 'Lost'
  | 'Archived';

// Legacy alias for backward compatibility with existing pipeline views
export type OpportunityPriority =
  | 'Contact Today'
  | 'Contact This Week'
  | 'Monitor'
  | 'Needs Research'
  | 'Archive';

export type RevenueConfidence = 'Low' | 'Medium' | 'High' | 'Very High';
export type UserFeedbackType = 'Excellent' | 'Good' | 'Average' | 'Poor' | 'Wrong' | 'Spam' | 'Duplicate';

// ─── CRM Types ──────────────────────────────────────────────────

export interface StageChangeEvent {
  fromStage: OpportunityStage | 'New';
  toStage: OpportunityStage;
  changedBy: string;
  changedAt: string;
  note?: string;
}

export interface InternalNote {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  mentions?: string[];
}

export interface FollowUp {
  id: string;
  scheduledDate: string;
  type: 'Email' | 'Call' | 'LinkedIn' | 'Meeting' | 'Other';
  status: 'Pending' | 'Completed' | 'Overdue' | 'Cancelled';
  assignedTo: string;
  notes?: string;
  completedAt?: string;
}

export type TeamRole = 'Owner' | 'Sales' | 'Research' | 'Developer';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  color: string;
  createdAt: string;
}

export type MeetingStatus = 'None' | 'Requested' | 'Scheduled' | 'Completed' | 'No Show';
export type ProposalStatus = 'None' | 'Draft' | 'Sent' | 'Viewed' | 'Accepted' | 'Rejected';

// ─── Intent & Service Types ─────────────────────────────────────

export type IntentCategory =
  | 'Website Purchase' | 'Landing Page' | 'Ecommerce Store' | 'SaaS Development'
  | 'MVP Development' | 'Automation' | 'Dashboard Development' | 'Booking System'
  | 'Website Redesign' | 'Business Launch' | 'Digital Transformation'
  | 'Freelancer Hiring' | 'Agency Hiring' | 'Marketing Only' | 'Recruiting Employees'
  | 'Looking For Job' | 'Learning' | 'Tutorial' | 'Discussion'
  | 'Meme' | 'News' | 'Spam' | 'Unknown';

export type AgencyService =
  | 'Custom Web Development'
  | 'AI Automation'
  | 'Lead Generation Systems'
  | 'Business Automation'
  | 'Landing Pages'
  | 'SaaS Development'
  | 'E-commerce Solutions'
  | 'CRM & Dashboard Development'
  | 'API Integrations'
  | 'Performance Optimization';

export type OpportunityValue = 'Low' | 'Medium' | 'High' | 'Enterprise';

// ─── Scoring & Research Interfaces ──────────────────────────────

export interface OpportunityQualityScore {
  businessVerification: number;
  decisionMakerConfidence: number;
  purchaseIntent: number;
  publicContactAvailability: number;
  websiteOpportunity: number;
  serviceMatch: number;
  companyMaturity: number;
  buyingSignalStrength: number;
  recentActivity: number;
  sourceReliability: number;
  totalScore: number;
}

export interface AgencyFitEngine {
  agencyFitScore: number;
  primaryService: AgencyService;
  secondaryServices: AgencyService[];
  recommendedSolution: string;
  confidence: number;
}

export interface CompanyResearch {
  companyWebsite?: string;
  industry?: string;
  businessSize?: string;
  digitalMaturity?: 'Low' | 'Medium' | 'High' | 'Unknown';
  recentAnnouncements?: string[];
  techIndicators?: string[];
  hasOnlineBooking?: boolean;
  contactPageUrl?: string;
  socialPresence?: string[];
}

export interface WebsiteOpportunityAnalysis {
  url?: string;
  hasWebsite: boolean;
  usesHttps?: boolean;
  isMobileFriendly?: boolean;
  hasContactPage?: boolean;
  hasCallsToAction?: boolean;
  hasOutdatedDesign?: boolean;
  contentFreshness?: string;
  agencyHelpSummary?: string;
}

export interface OpportunityTimelineEvent {
  title: string;
  date: string;
  publicSourceReference: string;
  description: string;
}

export interface InternalSalesWorkspace {
  opportunitySummary: string;
  aiReasoning: string;
  businessPainPoints: string[];
  suggestedAgencyServices: AgencyService[];
  recommendedOutreachChannel: string;
  recommendedFollowUpTiming: string;
  publicSupportingEvidence: string[];
  nextActions: string[];
}

// ─── Lead (Opportunity) ─────────────────────────────────────────

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
  intentCategory: IntentCategory;
  matchedServices: AgencyService[];
  opportunityValue: OpportunityValue;
  opportunityConfidence: number;
  estimatedBudget: string;
  urgency: 'Immediate (ASAP)' | 'High' | 'Medium' | 'Low';

  // Lifecycle
  stage: OpportunityStage;
  stageHistory: StageChangeEvent[];
  priority: OpportunityPriority;

  // Scoring & intelligence
  qualityScore: OpportunityQualityScore;
  agencyFit: AgencyFitEngine;
  companyResearch: CompanyResearch;
  websiteAnalysis: WebsiteOpportunityAnalysis;
  internalWorkspace: InternalSalesWorkspace;
  timelineEvents: OpportunityTimelineEvent[];

  // Contact
  publicEmail?: string;
  publicPhone?: string;
  socialProfileUrl?: string;

  // Source
  platform: PlatformType;
  sourceUrl: string;
  sourceTimestamp: string;
  rawContent: string;
  authorHandle: string;

  // Verification
  verificationStatus: 'Verified Real Business' | 'Pending Verification' | 'Rejected';
  duplicateStatus: 'Unique' | 'Duplicate Flagged';

  // CRM fields
  pipelineStatus: OpportunityPriority | 'In Discussion' | 'Proposal Sent' | 'Closed Won' | 'Archived';
  internalNotes: InternalNote[];
  userNotes: string[];
  tags: string[];
  customLabels: string[];
  assignedTo: string | null;
  isStarred: boolean;
  manualScoreOverride: number | null;

  // Revenue Validation & Audit
  revenueValidation: {
    legitimacy: number;
    intent: number;
    fit: number;
    contact: number;
    website: number;
    maturity: number;
    urgency: number;
    effort: number;
    value: number;
    competition: string;
    confidence: RevenueConfidence;
    reasoning: string;
  };
  uncertaintyPoints: string[];
  userFeedback: UserFeedbackType | null;
  acceptanceReason: string;
  rejectionReason: string | null;

  // Follow-up & outreach tracking
  followUps: FollowUp[];
  reminderDate: string | null;
  lastContactDate: string | null;
  contactAttempts: number;
  meetingStatus: MeetingStatus;
  proposalStatus: ProposalStatus;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  companyId?: string;
}

// ─── Company ────────────────────────────────────────────────────

export interface Company {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  businessCategory?: string;
  description?: string;
  location?: string;
  companySize?: string;
  publicEmail?: string;
  publicPhone?: string;
  contactPage?: string;
  socialProfiles: string[];

  leadIds: string[];
  latestActivityTimestamp: string;
  outreachReadinessScore: number;
  matchedServices: AgencyService[];
  opportunityValue: OpportunityValue;
  buyingIntentTrend: 'Rising' | 'Stable' | 'Declining';

  createdAt: string;
  updatedAt: string;
}

// ─── Raw Data ───────────────────────────────────────────────────

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

// ─── Connector Health ───────────────────────────────────────────

export type ConnectorStatus = 'Connected' | 'Error' | 'Rate Limited' | 'Not Configured' | 'Authentication Failed';

export interface ConnectorHealth {
  sourceId: string;
  sourceName: string;
  status: ConnectorStatus;
  lastSync: string;
  lastFailedSync?: string;
  totalPostsRetrieved: number;
  qualifiedLeadsProduced: number;
  contactVerificationRate: number;
  apiUsageCount: number;
  apiRateLimitStatus: 'Good' | 'Warning' | 'Exceeded' | 'N/A';
  errorMessage?: string;
  averageResponseTimeMs: number;
  errorCount: number;
  qualityScore: number;

  duplicateRate: number;
  spamRate: number;
  falsePositiveEstimate: number;
  outreachReadyLeads: number;
  averageLeadScore: number;
  businessOpportunityScore: number;

  // New detailed reliability metrics
  successRate: number;         // percentage (0-100)
  failureRate: number;         // percentage (0-100)
  avgRuntimeMs: number;
  retryCount: number;
  reliabilityScore: number;    // calculated dynamic score (0-100)
}

// ─── AI Audit ───────────────────────────────────────────────────

export interface AILeadQualityAudit {
  totalPosts: number;
  qualifiedLeads: number;
  hotLeads: number;
  contactVerifiedLeads: number;
  needsContactVerification: number;
  spam: number;
  recruiters: number;
  agencies: number;
  students: number;
  developers: number;
  falsePositiveEstimate: number;
  topPerformingSource: string;
  worstPerformingSource: string;
  recommendedSourcePriority: string[];
  recommendationReasons: string[];
}

// ─── Pipeline Metrics ───────────────────────────────────────────

export interface PipelineMetrics {
  totalOpportunities: number;
  outreachReady: number;
  verifiedBusinesses: number;
  highAgencyFit: number;
  contactableDecisionMakers: number;
  avgOpportunityScore: number;
  avgAgencyFitScore: number;
  falsePositiveRate: number;
  totalNoiseEliminated: number;
  contactMatchRate: number;

  // Execution metrics
  meetingsBooked: number;
  proposalsSent: number;
  wonOpportunities: number;
  lostOpportunities: number;
  avgTimeToContactDays: number;
  conversionRate: number;
  stageDistribution: Record<string, number>;
}

// ─── CRM Filters ────────────────────────────────────────────────

export interface CRMFilters {
  searchQuery: string;
  country: string;
  industry: string;
  platform: string;
  priority: string;
  websiteStatus: string;
  minScore: number;
  maxScore: number;
  opportunityValue?: string;
  service?: string;

  // CRM filters
  stage?: string;
  assignedTo?: string;
  isStarred?: string;
  hasFollowUp?: string;
  label?: string;
  meetingStatus?: string;
  proposalStatus?: string;
}

// ─── AI Recommendations ─────────────────────────────────────────

export interface AIRecommendation {
  type: 'attention' | 'cold' | 'overdue' | 'archive' | 'hot_industry';
  title: string;
  description: string;
  leadId?: string;
  companyName?: string;
  urgency: 'High' | 'Medium' | 'Low';
  actionLabel: string;
}

// ─── Agency Analytics ───────────────────────────────────────────

export interface AgencyAnalytics {
  funnel: { stage: string; count: number }[];
  conversionRates: { from: string; to: string; rate: number }[];
  topSources: { source: string; count: number; qualifiedRate: number }[];
  topIndustries: { industry: string; count: number; avgScore: number }[];
  topServices: { service: string; count: number }[];
  topCountries: { country: string; count: number }[];
  wonAnalysis: { totalWon: number; avgDaysToClose: number; topService: string };
  lostAnalysis: { totalLost: number; topReason: string };
  teamPerformance: { memberId: string; name: string; assigned: number; won: number; avgScore: number }[];
}

// ─── Quality Auditor & Release Reports ──────────────────────────

export interface QualityIssue {
  area: 'connectors' | 'ai_qualification' | 'duplicates' | 'merging' | 'scoring' | 'website_verification' | 'enrichment' | 'contacts' | 'crm_integrity';
  severity: 'low' | 'medium' | 'high';
  title: string;
  explanation: string;
  impactEstimate: string;
  recommendedFix: string;
}

export interface QualityReport {
  timestamp: string;
  score: number; // Quality Score (0 to 100)
  connectorReliabilitySummary: Record<string, number>;
  totalIssuesCount: number;
  resolvedIssuesCount: number;
  issues: QualityIssue[];
  manualCalibrationRecommendations: string[];
}

export interface DeploymentReadinessReport {
  timestamp: string;
  isReady: boolean;
  checks: {
    noMockData: boolean;
    noPlaceholderCode: boolean;
    connectorsHealthy: boolean;
    noTypeErrors: boolean;
    noBrokenRoutes: boolean;
    noDuplicateCompanies: boolean;
    noInvalidOpportunities: boolean;
    noMissingRequiredFields: boolean;
    noExposedSecrets: boolean;
    buildSucceeds: boolean;
    healthDashboardGreen: boolean;
  };
  details: string[];
}

