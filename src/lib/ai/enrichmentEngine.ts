import { Lead, BusinessEnrichment, OutreachReadiness } from '../types/lead';

export class EnrichmentEngine {
  
  /**
   * Performs post-qualification public research (simulated/extracted for now unless API key provided)
   */
  async enrichLead(lead: Lead): Promise<Lead> {
    const enrichment: BusinessEnrichment = {};
    
    // In a full production environment, this would call Tavily/Exa or Google Custom Search API
    // with the lead's companyName or domain if available.
    
    // For now, we will extract heuristics from the raw content or websiteAnalysis
    if (lead.websiteAnalysis?.url) {
      enrichment.companyWebsite = lead.websiteAnalysis.url;
    }

    if (lead.industry && lead.industry !== 'Unknown') {
      enrichment.businessCategory = lead.industry;
    }

    // Try to guess company size from content
    if (lead.rawContent.toLowerCase().includes('startup') || lead.rawContent.toLowerCase().includes('founder')) {
      enrichment.companySize = '1-10 employees (Startup)';
    } else if (lead.rawContent.toLowerCase().includes('enterprise') || lead.rawContent.toLowerCase().includes('large company')) {
      enrichment.companySize = '50+ employees (Enterprise)';
    } else {
      enrichment.companySize = 'Unknown';
    }

    // Socials
    enrichment.socialProfiles = [];
    if (lead.socialProfileUrl) {
      enrichment.socialProfiles.push(lead.socialProfileUrl);
    }
    
    enrichment.location = lead.country;

    lead.businessEnrichment = enrichment;
    lead.outreachReadiness = this.calculateReadiness(lead);

    return lead;
  }

  private calculateReadiness(lead: Lead): OutreachReadiness {
    let score = 0;
    const reasons: string[] = [];
    let canContactToday = false;

    // Direct Contact checks
    if (lead.publicEmail) {
      score += 40;
      canContactToday = true;
      reasons.push('Public email available');
    }
    
    if (lead.publicPhone) {
      score += 20;
      canContactToday = true;
      reasons.push('Public phone number available');
    }

    if (lead.socialProfileUrl || (lead.platform === 'reddit' && lead.sourceUrl)) {
      score += 15;
      canContactToday = true;
      reasons.push('Direct messaging possible via platform');
    }

    // Enrichment checks
    if (lead.businessEnrichment?.companyWebsite) {
      score += 15;
      reasons.push('Website identified for research');
    }

    if (lead.businessEnrichment?.businessCategory) {
      score += 10;
      reasons.push('Industry/Category is clear');
    }

    if (!canContactToday) {
      reasons.push('No direct contact method found. Outreach impossible.');
    }

    const isInformationSufficient = score >= 50 && canContactToday;

    return {
      score: Math.min(score, 100),
      canContactToday,
      isInformationSufficient,
      likelyToSucceed: isInformationSufficient && lead.leadScore > 60,
      reasons
    };
  }
}
