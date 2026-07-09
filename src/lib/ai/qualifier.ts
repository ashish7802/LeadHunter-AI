import { 
  RawPost, 
  CountryType, 
  IntentCategory, 
  AgencyService, 
  OpportunityValue, 
  OpportunityPriority,
  OpportunityQualityScore,
  AgencyFitEngine,
  WebsiteOpportunityAnalysis,
  OpportunityTimelineEvent,
  InternalSalesWorkspace,
  CompanyResearch,
  RevenueConfidence
} from '../types/lead';

export interface AIQualificationResult {
  isBusinessOwner: boolean;
  hasPurchaseIntent: boolean;
  leadName: string;
  companyName: string;
  businessType: string;
  industry: string;
  country: string;
  city: string;
  language: string;
  needSummary: string;
  intentCategory: IntentCategory;
  
  estimatedBudget: string;
  urgency: 'Immediate (ASAP)' | 'High' | 'Medium' | 'Low';
  
  opportunityValue: OpportunityValue;
  priority: OpportunityPriority;
  
  qualityScore: OpportunityQualityScore;
  agencyFit: AgencyFitEngine;
  internalWorkspace: InternalSalesWorkspace;
  companyResearch: CompanyResearch;
  websiteAnalysis: WebsiteOpportunityAnalysis;
  timelineEvents: OpportunityTimelineEvent[];
  
  // Revenue validation & uncertainty
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
  acceptanceReason: string;
  rejectionReason: string | null;

  publicEmail?: string;
  publicPhone?: string;
  isSpam: boolean;
  isRecruiter: boolean;
  isAgencySelling: boolean;
  isJobSeeker: boolean;
  isStudent: boolean;
}

export class GroqQualifier {
  private apiKey: string;
  private model: string;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey || process.env.GROQ_API_KEY || '';
    this.model = model || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  }

  /**
   * Qualifies a raw social post using Groq LLaMA 3.3 70B AI Engine with exponential retries
   */
  async qualifyPost(post: RawPost): Promise<AIQualificationResult> {
    if (!this.apiKey) {
      console.warn('[GroqQualifier] No GROQ_API_KEY set, using rule-based fallback.');
      return this.ruleBasedFallback(post);
    }

    const systemPrompt = `You are LeadHunter AI's Senior Agency Strategist powered by Groq LLaMA 3.3 70B.
Your task is to analyze raw public posts and identify high-quality business opportunities worldwide for our custom web development and automation agency.

Our Agency Services:
- Custom Web Development
- AI Automation
- Lead Generation Systems
- Business Automation
- Landing Pages
- SaaS Development
- E-commerce Solutions
- CRM & Dashboard Development
- API Integrations
- Performance Optimization

Strict Rules (CRITICAL - DO NOT IGNORE):
1. NO KEYWORD MATCHING: Do not classify a lead just because they said "web development". Read the whole post. Is this a genuine business owner asking for help? Or a student/developer?
2. REJECT FALSE POSITIVES: You MUST aggressively reject (set isJobSeeker=true, isStudent=true, isRecruiter=true, isAgencySelling=true, or isSpam=true) if the post is a developer, student, tutorial, meme, recruiter, or agency selling services.
3. CONVERSION INTELLIGENCE: Evaluate "Opportunity Quality Score" out of 100 based on multiple dimensions like decision maker confidence, purchase intent, etc.
4. AGENCY FIT ENGINE: Only accept if the company matches our Agency Services. Calculate an Agency Fit Score (0-100).
5. OPPORTUNITY PRIORITY: Organize into 'Contact Today', 'Contact This Week', 'Monitor', 'Needs Research', or 'Archive'.
6. REVENUE VALIDATION: Evaluate if this is realistically worth our outreach. Calculate legitimacy, intent, fit, contact, website, maturity, urgency, effort, and value scores (0 to 10). Assign a Revenue Confidence rating ('Low', 'Medium', 'High', 'Very High') with a detailed reasoning.
7. AI SELF-CRITIQUE: If you accept an opportunity, explain why it could be wrong. Be critical. List uncertainty points (e.g. "Missing contact", "Intent uncertain", "Possible recruiter", "Old post").
8. EXPLAINABILITY: Provide a clear acceptanceReason (why this was qualified) or a rejectionReason (if disqualified).
9. NO FABRICATION: If a website, metric, or event is not publicly observable in the text or author metadata, leave it empty or false. Do NOT claim issues that cannot be verified.
10. TIMELINE: Extract events like "Company launched", "Hiring related to digital growth", etc.
11. INTERNAL SALES WORKSPACE: Create an internal workspace summary mapping out business pain points, suggested services, and next actions.`;

    const userPrompt = `Analyze this post and output structured JSON:

Author: ${post.author} (${post.authorHandle})
Platform: ${post.platform}
Location Hint: ${post.locationHint || 'Unknown'}
Content: "${post.content}"

Required JSON Schema (MUST MATCH EXACTLY):
{
  "isBusinessOwner": boolean,
  "hasPurchaseIntent": boolean,
  "leadName": "Person's name or author handle",
  "companyName": "Company or Brand Name",
  "businessType": "e.g., Healthcare Clinic, B2B SaaS",
  "industry": "e.g., Healthcare, Software",
  "country": "Country name, or 'Worldwide'",
  "city": "City name if mentioned",
  "language": "English",
  "needSummary": "1-2 sentence concise summary of their problem",
  "intentCategory": "Website Purchase" | "Landing Page" | "Ecommerce Store" | "SaaS Development" | "MVP Development" | "Automation" | "Dashboard Development" | "Booking System" | "Website Redesign" | "Business Launch" | "Digital Transformation" | "Freelancer Hiring" | "Agency Hiring" | "Marketing Only" | "Recruiting Employees" | "Looking For Job" | "Learning" | "Tutorial" | "Discussion" | "Meme" | "News" | "Spam" | "Unknown",
  "estimatedBudget": "e.g., $5,000, $500/mo, or 'Not Estimated'",
  "urgency": "Immediate (ASAP)" | "High" | "Medium" | "Low",
  "opportunityValue": "Low" | "Medium" | "High" | "Enterprise",
  "priority": "Contact Today" | "Contact This Week" | "Monitor" | "Needs Research" | "Archive",
  "qualityScore": {
    "businessVerification": 0 to 10,
    "decisionMakerConfidence": 0 to 10,
    "purchaseIntent": 0 to 10,
    "publicContactAvailability": 0 to 10,
    "websiteOpportunity": 0 to 10,
    "serviceMatch": 0 to 10,
    "companyMaturity": 0 to 10,
    "buyingSignalStrength": 0 to 10,
    "recentActivity": 0 to 10,
    "sourceReliability": 0 to 10,
    "totalScore": 0 to 100
  },
  "revenueValidation": {
    "legitimacy": 0 to 10,
    "intent": 0 to 10,
    "fit": 0 to 10,
    "contact": 0 to 10,
    "website": 0 to 10,
    "maturity": 0 to 10,
    "urgency": 0 to 10,
    "effort": 0 to 10,
    "value": 0 to 10,
    "competition": "e.g., High, None, Low, or explain evidence",
    "confidence": "Low" | "Medium" | "High" | "Very High",
    "reasoning": "Explain why this company is or is not realistically worth outreach effort"
  },
  "uncertaintyPoints": ["Point 1", "Point 2"],
  "acceptanceReason": "Explain why this lead is qualified and worth checking",
  "rejectionReason": "If disqualified, explain why (else null)",
  "agencyFit": {
    "agencyFitScore": 0 to 100,
    "primaryService": "Must exactly match one of Our Agency Services",
    "secondaryServices": ["Matches from Our Agency Services"],
    "recommendedSolution": "Brief description of the solution we can offer",
    "confidence": 0 to 100
  },
  "internalWorkspace": {
    "opportunitySummary": "Summary for internal sales team",
    "aiReasoning": "AI's reasoning for this opportunity",
    "businessPainPoints": ["Point 1", "Point 2"],
    "suggestedAgencyServices": ["Matches from Our Agency Services"],
    "recommendedOutreachChannel": "e.g., LinkedIn, Email",
    "recommendedFollowUpTiming": "e.g., Today, Next Week",
    "publicSupportingEvidence": ["Evidence 1 from text"],
    "nextActions": ["Action 1", "Action 2"]
  },
  "companyResearch": {
    "companyWebsite": "Extract if present, else empty",
    "industry": "Extract if present, else empty",
    "businessSize": "Extract if present, else empty",
    "digitalMaturity": "Low" | "Medium" | "High" | "Unknown",
    "recentAnnouncements": ["Announcement 1 if present"],
    "techIndicators": ["Tech 1 if present"],
    "hasOnlineBooking": boolean,
    "contactPageUrl": "Extract if present, else empty",
    "socialPresence": ["Platform name if present"]
  },
  "websiteAnalysis": {
    "url": "Website URL if present",
    "hasWebsite": boolean,
    "usesHttps": boolean,
    "isMobileFriendly": boolean,
    "hasContactPage": boolean,
    "hasCallsToAction": boolean,
    "hasOutdatedDesign": boolean,
    "contentFreshness": "e.g., Active, Stale, Unknown",
    "agencyHelpSummary": "How our agency can help improve the website"
  },
  "timelineEvents": [
    {
      "title": "Event Title",
      "date": "YYYY-MM-DD or timeframe",
      "publicSourceReference": "Text segment indicating this event",
      "description": "Description of the event"
    }
  ],
  "publicEmail": "extracted email if present, else empty string",
  "publicPhone": "extracted phone if present, else empty string",
  "isSpam": boolean,
  "isRecruiter": boolean,
  "isAgencySelling": boolean,
  "isJobSeeker": boolean,
  "isStudent": boolean
}`;

    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.1,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          let waitMs = 0;
          if (response.status === 429) {
            const match = errText.match(/Please try again in ([0-9.]+)s/);
            if (match && match[1]) {
              waitMs = Math.ceil(parseFloat(match[1]) * 1000) + 500;
            }
          }
          const err = new Error(`Groq API HTTP ${response.status}: ${errText}`);
          (err as any).waitMs = waitMs;
          throw err;
        }

        const data = await response.json();
        const rawText = data.choices?.[0]?.message?.content;
        if (!rawText) throw new Error('Empty response from Groq API');

        const parsed: AIQualificationResult = JSON.parse(rawText);

        // Basic Schema Validation
        if (typeof parsed.isBusinessOwner !== 'boolean' || !parsed.qualityScore || !parsed.agencyFit || !parsed.internalWorkspace) {
          throw new Error('Groq response failed schema validation');
        }

        return parsed;
      } catch (err: any) {
        console.warn(`[GroqQualifier] Attempt ${attempt}/${maxRetries} failed:`, err.message);
        if (attempt < maxRetries) {
          const waitMs = err.waitMs || (1000 * Math.pow(2, attempt - 1));
          console.warn(`[GroqQualifier] Waiting ${waitMs}ms before retry...`);
          await new Promise((r) => setTimeout(r, waitMs));
        }
      }
    }

    console.warn('[GroqQualifier] All Groq API retries failed. Using rule-based fallback.');
    return this.ruleBasedFallback(post);
  }

  private ruleBasedFallback(post: RawPost): AIQualificationResult {
    const text = post.content.toLowerCase();
    
    const emailMatch = post.content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const publicEmail = emailMatch ? emailMatch[0] : '';

    return {
      isBusinessOwner: true,
      hasPurchaseIntent: true,
      leadName: post.author,
      companyName: post.author ? `${post.author} Business` : 'Unknown Business',
      businessType: 'General Services',
      industry: 'Technology',
      country: post.locationHint || 'Worldwide',
      city: 'Unknown',
      language: 'English',
      needSummary: 'Potential web development needs inferred from text.',
      intentCategory: 'Unknown',
      estimatedBudget: 'Not Estimated',
      urgency: 'Medium',
      opportunityValue: 'Medium',
      priority: 'Monitor',
      qualityScore: {
        businessVerification: 5,
        decisionMakerConfidence: 5,
        purchaseIntent: 5,
        publicContactAvailability: publicEmail ? 10 : 0,
        websiteOpportunity: 0,
        serviceMatch: 5,
        companyMaturity: 5,
        buyingSignalStrength: 5,
        recentActivity: 5,
        sourceReliability: 5,
        totalScore: 50
      },
      revenueValidation: {
        legitimacy: 5,
        intent: 5,
        fit: 5,
        contact: publicEmail ? 10 : 0,
        website: 5,
        maturity: 5,
        urgency: 5,
        effort: 5,
        value: 5,
        competition: 'Unknown',
        confidence: 'Medium',
        reasoning: 'FALLBACK: Rule-based verification fallback.'
      },
      uncertaintyPoints: ['Groq API offline', 'Inferred location', 'General keyword match'],
      acceptanceReason: 'Rule-based check triggered matching fallback rules',
      rejectionReason: null,
      agencyFit: {
        agencyFitScore: 50,
        primaryService: 'Custom Web Development',
        secondaryServices: [],
        recommendedSolution: 'Fallback generation',
        confidence: 40
      },
      internalWorkspace: {
        opportunitySummary: 'Fallback logic.',
        aiReasoning: 'Fallback',
        businessPainPoints: ['Unknown'],
        suggestedAgencyServices: ['Custom Web Development'],
        recommendedOutreachChannel: 'Email',
        recommendedFollowUpTiming: 'Whenever',
        publicSupportingEvidence: [],
        nextActions: ['Investigate manually']
      },
      companyResearch: {
        digitalMaturity: 'Unknown'
      },
      websiteAnalysis: {
        hasWebsite: false,
        agencyHelpSummary: 'No analysis'
      },
      timelineEvents: [],
      publicEmail,
      publicPhone: '',
      isSpam: false,
      isRecruiter: false,
      isAgencySelling: false,
      isJobSeeker: false,
      isStudent: false
    };
  }
}
