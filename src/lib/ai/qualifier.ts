import { RawPost, CountryType, IntentCategory } from '../types/lead';

export interface AIQualificationResult {
  humanReasoning: string;
  isBusinessOwner: boolean;
  hasPurchaseIntent: boolean;
  leadName: string;
  companyName: string;
  businessType: string;
  industry: string;
  country: CountryType;
  city: string;
  language: string;
  needSummary: string;
  intentCategory: IntentCategory;
  estimatedBudget: string;
  urgency: 'Immediate (ASAP)' | 'High' | 'Medium' | 'Low';
  publicEmail?: string;
  publicPhone?: string;
  isSpam: boolean;
  isRecruiter: boolean;
  isAgencySelling: boolean;
  isJobSeeker: boolean;
  isStudent: boolean;
  intentConfidence: number;
  businessConfidence: number;
  explainability: {
    whyQualified: string;
    intentSentences: string[];
    contactValidation: string;
    businessCapability: string;
  };
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

    const systemPrompt = `You are LeadHunter AI's Deep Intent Engine powered by Groq LLaMA 3.3 70B.
Your task is to analyze raw public posts and extract structured business lead signals for web development services.

Strict Rules (CRITICAL - DO NOT IGNORE):
1. NO KEYWORD MATCHING: Do not classify a lead just because they said "web development", "react", "website", or "frontend". Read the whole post. Understand the context. Are they a buyer, a seller, a student, or a recruiter?
2. VERIFY CONTACT INFO: Never hallucinate or generate fake emails/phones. Only extract contact info if explicitly written in the raw content.
3. HUMAN REASONING FIRST: Begin your JSON with a 'humanReasoning' field explaining your logic internally like a human sales consultant. Ask yourself: "What is the author actually trying to achieve?"
4. CONFIDENCE SEPARATION: Separate intentConfidence (how sure are you they want to buy?) from businessConfidence (how sure are you they are a real business/founder?). Rate 0-100.
5. STRICT CATEGORIES: 'intentCategory' must be EXACTLY ONE of the allowed strings.
6. EXPLAINABILITY: Fill the 'explainability' object with rigorous, logical proofs from the text.
7. BUSINESS FIRST: Reject leads that are just developers looking for jobs or students asking questions. Only accept true business/founders/SMEs.
8. TARGET COUNTRIES: Only target India and Canada. If unknown, set 'Other'.`;

    const userPrompt = `Analyze this post and output structured JSON:

Author: ${post.author} (${post.authorHandle})
Platform: ${post.platform}
Location Hint: ${post.locationHint || 'Unknown'}
Content: "${post.content}"

Required JSON Schema (MUST MATCH EXACTLY):
{
  "humanReasoning": "Internal thought process explaining intent and business status",
  "isBusinessOwner": boolean,
  "hasPurchaseIntent": boolean,
  "leadName": "Person's name or author handle",
  "companyName": "Company or Brand Name",
  "businessType": "e.g., Healthcare Clinic, D2C Fashion, B2B SaaS, Restaurant, etc.",
  "industry": "e.g., Healthcare, E-Commerce, Software, Food & Beverage, Real Estate, Services",
  "country": "India" or "Canada" or "Other",
  "city": "City name if mentioned",
  "language": "English",
  "needSummary": "1-2 sentence concise summary of web dev request",
  "intentCategory": "Website Purchase" | "Landing Page" | "Ecommerce Store" | "SaaS Development" | "MVP Development" | "Automation" | "Dashboard Development" | "Booking System" | "Website Redesign" | "Business Launch" | "Digital Transformation" | "Freelancer Hiring" | "Agency Hiring" | "Marketing Only" | "Recruiting Employees" | "Looking For Job" | "Learning" | "Tutorial" | "Discussion" | "Meme" | "News" | "Spam" | "Unknown",
  "estimatedBudget": "e.g. ₹80k - 1.5L, $3,500 CAD, or Unknown",
  "urgency": "Immediate (ASAP)", "High", "Medium", or "Low",
  "publicEmail": "extracted email if present, else empty string",
  "publicPhone": "extracted phone if present, else empty string",
  "isSpam": boolean,
  "isRecruiter": boolean,
  "isAgencySelling": boolean,
  "isJobSeeker": boolean,
  "isStudent": boolean,
  "intentConfidence": integer 0 to 100,
  "businessConfidence": integer 0 to 100,
  "explainability": {
    "whyQualified": "Why is this a high intent B2B lead?",
    "intentSentences": ["Exact quote 1 from text", "Exact quote 2"],
    "contactValidation": "How can we contact them based on the text?",
    "businessCapability": "Why do we think they have the budget/authority to buy?"
  }
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
        if (typeof parsed.isBusinessOwner !== 'boolean' || typeof parsed.humanReasoning !== 'string' || !parsed.explainability) {
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
    const isIndia = post.content.includes('India') || post.content.includes('Bengaluru') || post.content.includes('Mumbai') || post.content.includes('Delhi') || post.content.includes('₹') || post.locationHint?.includes('India');
    const isCanada = post.content.includes('Canada') || post.content.includes('Toronto') || post.content.includes('Montreal') || post.content.includes('Vancouver') || post.content.includes('CAD') || post.locationHint?.includes('Canada');

    const emailMatch = post.content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const publicEmail = emailMatch ? emailMatch[0] : '';

    return {
      humanReasoning: 'FALLBACK: Groq API was unavailable. This is a rudimentary string matching estimate, not AI-verified semantic intent.',
      isBusinessOwner: true,
      hasPurchaseIntent: true,
      leadName: post.author,
      companyName: post.author ? `${post.author} Business` : 'Unknown Business',
      businessType: 'General Services',
      industry: 'Technology',
      country: isIndia ? 'India' : isCanada ? 'Canada' : 'Other',
      city: isIndia ? 'Bengaluru' : isCanada ? 'Toronto' : 'Other',
      language: 'English',
      needSummary: 'Potential web development needs inferred from text.',
      intentCategory: 'Unknown',
      estimatedBudget: 'Unknown',
      urgency: 'Medium',
      publicEmail,
      publicPhone: '',
      isSpam: false,
      isRecruiter: false,
      isAgencySelling: false,
      isJobSeeker: false,
      isStudent: false,
      intentConfidence: 40,
      businessConfidence: 40,
      explainability: {
        whyQualified: 'Rule-based fallback matched location/keywords.',
        intentSentences: [],
        contactValidation: 'Regex pattern matching.',
        businessCapability: 'Unknown.'
      }
    };
  }
}
