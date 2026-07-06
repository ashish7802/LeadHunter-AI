import { WebsiteAnalysis } from '../types/lead';

export class WebsiteVerifier {
  /**
   * Evaluates website status and quality signals of a candidate lead
   * using real HTTP verification.
   */
  public async verifyWebsite(urlHint?: string, textContent: string = ''): Promise<WebsiteAnalysis> {
    // Extract website URL if mentioned in text content
    const urlMatch = urlHint || textContent.match(/https?:\/\/[^\s<"'>]+/i)?.[0];

    if (!urlMatch) {
      return {
        url: undefined,
        hasWebsite: false,
        isResponsive: false,
        usesHttps: false,
        isMobileFriendly: false,
        qualityGrade: 'No Website',
        opportunityScore: 95, // High opportunity lead because they have no website
        notes: 'Business has NO existing website. Prime high-intent opportunity for a new web build.',
      };
    }

    const cleanUrl = urlMatch.replace(/[,\.]$/, '');

    // Perform live HTTP HEAD request to verify URL accessibility
    let isReachable = false;
    let statusCode = 0;
    const usesHttps = cleanUrl.startsWith('https://');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 sec timeout

      const res = await fetch(cleanUrl, {
        method: 'HEAD',
        signal: controller.signal,
        headers: { 'User-Agent': 'LeadHunterAI/2.0 (Website-Verifier)' }
      });
      clearTimeout(timeoutId);

      statusCode = res.status;
      isReachable = res.ok || (res.status >= 200 && res.status < 400);
    } catch (err) {
      isReachable = false;
    }

    const isOutdated = textContent.toLowerCase().includes('redesign') || 
                      textContent.toLowerCase().includes('slow') || 
                      textContent.toLowerCase().includes('2017') ||
                      !isReachable;

    if (!isReachable) {
      return {
        url: cleanUrl,
        hasWebsite: true,
        isResponsive: false,
        usesHttps,
        isMobileFriendly: false,
        qualityGrade: 'F',
        opportunityScore: 92,
        notes: `Website ${cleanUrl} is UNREACHABLE (HTTP ${statusCode || 'Timeout'}). Critical issue for business owner.`,
      };
    }

    if (isOutdated) {
      return {
        url: cleanUrl,
        hasWebsite: true,
        isResponsive: false,
        usesHttps,
        isMobileFriendly: false,
        estimatedAgeYears: 5,
        qualityGrade: 'D',
        opportunityScore: 88,
        notes: `Website ${cleanUrl} verified online (HTTP ${statusCode}) but client reports outdated design/performance issues.`,
      };
    }

    return {
      url: cleanUrl,
      hasWebsite: true,
      isResponsive: true,
      usesHttps,
      isMobileFriendly: true,
      estimatedAgeYears: 2,
      qualityGrade: 'B',
      opportunityScore: 70,
      notes: `Website ${cleanUrl} active (HTTP ${statusCode}). Client seeking custom web portal or feature expansion.`,
    };
  }
}
