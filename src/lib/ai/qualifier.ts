import { RawPost, CountryType } from '../types/lead';

export interface AIQualificationResult {
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
  needCategory: 'New Website' | 'Redesign' | 'E-Commerce' | 'SaaS/App' | 'Landing Page' | 'Automation/CRM';
  estimatedBudget: string;
  urgency: 'Immediate (ASAP)' | 'High' | 'Medium' | 'Low';
  publicEmail?: string;
  publicPhone?: string;
  isSpam: boolean;
  isRecruiter: boolean;
  isAgencySelling: boolean;
  isJobSeeker: boolean;
  confidenceScore: number;
  aiReasoning: string;
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

    const systemPrompt = `You are LeadHunter AI's Lead Intelligence Engine powered by Groq LLaMA 3.3 70B.
Your task is to analyze raw public posts and extract structured business lead signals for web development services.

Strict Rules:
1. Target Countries: India or Canada (if unknown or other, set country accordingly).
2. DO NOT hallucinate email addresses or phone numbers. Only extract them if explicitly present in the raw content.
3. Identify whether this is a genuine business looking to HIRE/PAY for web development services vs a job seeker looking for work, a recruiter hiring an employee, an agency selling services, or spam.
4. You MUST respond with a single valid JSON object matching the requested schema.`;

    const userPrompt = `Analyze this post and output structured JSON:

Author: ${post.author} (${post.authorHandle})
Platform: ${post.platform}
Location Hint: ${post.locationHint || 'Unknown'}
Content: "${post.content}"

Required JSON Keys:
{
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
  "needCategory": "New Website" or "Redesign" or "E-Commerce" or "SaaS/App" or "Landing Page" or "Automation/CRM",
  "estimatedBudget": "e.g. ₹80k - 1.5L, $3,500 CAD, or Unknown",
  "urgency": "Immediate (ASAP)" or "High" or "Medium" or "Low",
  "publicEmail": "extracted email if present, else empty string",
  "publicPhone": "extracted phone if present, else empty string",
  "isSpam": boolean,
  "isRecruiter": boolean,
  "isAgencySelling": boolean,
  "isJobSeeker": boolean,
  "confidenceScore": integer 0 to 100,
  "aiReasoning": "Technical analysis explaining why lead is qualified or rejected."
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
        if (typeof parsed.isBusinessOwner !== 'boolean' || typeof parsed.needSummary !== 'string') {
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

    const isRecruiter = text.includes('hiring employee') || text.includes('recruiter') || text.includes('full-time role');
    const isJobSeeker = text.includes('i am looking for work') || text.includes('hire me');

    return {
      isBusinessOwner: true,
      hasPurchaseIntent: !isRecruiter && !isJobSeeker,
      leadName: post.author,
      companyName: post.author ? `${post.author} Business` : 'Unknown Business',
      businessType: text.includes('clinic') ? 'Healthcare' : text.includes('d2c') ? 'D2C Retail' : 'Services',
      industry: text.includes('clinic') ? 'Healthcare' : text.includes('d2c') ? 'E-Commerce' : 'Technology',
      country: isIndia ? 'India' : isCanada ? 'Canada' : 'Other',
      city: isIndia ? 'Bengaluru' : isCanada ? 'Toronto' : 'Other',
      language: 'English',
      needSummary: 'Looking for professional web development or redesign services.',
      needCategory: text.includes('redesign') ? 'Redesign' : text.includes('ecommerce') ? 'E-Commerce' : 'New Website',
      estimatedBudget: isIndia ? '₹80,000+' : isCanada ? 'CAD $3,500' : 'Unknown',
      urgency: text.includes('asap') || text.includes('urgent') ? 'Immediate (ASAP)' : 'High',
      publicEmail,
      publicPhone: '',
      isSpam: false,
      isRecruiter,
      isAgencySelling: false,
      isJobSeeker,
      confidenceScore: 40,
      aiReasoning: 'FALLBACK: Groq API was unavailable. This is a rule-based signal estimate.',
    };
  }
}
