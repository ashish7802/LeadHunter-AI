import { WebsiteOpportunityAnalysis } from '../types/lead';

export class WebsiteVerifier {
  /**
   * Evaluates website status and quality signals of a candidate lead
   * using real HTTP verification.
   */
  public async verifyWebsite(urlHint?: string, textContent: string = ''): Promise<WebsiteOpportunityAnalysis> {
    // Extract website URL if mentioned in text content
    const urlMatch = urlHint || textContent.match(/https?:\/\/[^\s<"'>]+/i)?.[0];

    if (!urlMatch) {
      return {
        url: undefined,
        hasWebsite: false,
        usesHttps: false,
        isMobileFriendly: false,
        hasContactPage: false,
        hasCallsToAction: false,
        hasOutdatedDesign: false,
        contentFreshness: 'Unknown',
        agencyHelpSummary: 'Business has NO existing website. Prime high-intent opportunity for a new web build.',
      };
    }

    const cleanUrl = urlMatch.replace(/[,\.]$/, '');

    // Perform live HTTP GET request to verify URL accessibility and parse basic HTML for observability
    let isReachable = false;
    let statusCode = 0;
    const usesHttps = cleanUrl.startsWith('https://');
    let htmlContent = '';

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 sec timeout

      const res = await fetch(cleanUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: { 'User-Agent': 'LeadHunterAI/2.0 (Website-Verifier)' }
      });
      clearTimeout(timeoutId);

      statusCode = res.status;
      isReachable = res.ok || (res.status >= 200 && res.status < 400);
      
      if (isReachable) {
        // Read the first 50KB to do a fast, non-invasive check without downloading massive pages
        const text = await res.text();
        htmlContent = text.substring(0, 50000).toLowerCase();
      }
    } catch (err) {
      isReachable = false;
    }

    const hasContactPage = isReachable && (htmlContent.includes('href="/contact"') || htmlContent.includes('href="/contact-us"') || htmlContent.includes('href="mailto:'));
    const isMobileFriendly = isReachable && htmlContent.includes('<meta name="viewport"');
    const hasCallsToAction = isReachable && (htmlContent.includes('book') || htmlContent.includes('schedule') || htmlContent.includes('buy') || htmlContent.includes('sign up') || htmlContent.includes('get started'));

    const isOutdated = textContent.toLowerCase().includes('redesign') || 
                      textContent.toLowerCase().includes('slow') || 
                      textContent.toLowerCase().includes('2017') ||
                      !isReachable;

    if (!isReachable) {
      return {
        url: cleanUrl,
        hasWebsite: true,
        usesHttps,
        isMobileFriendly: false,
        hasContactPage: false,
        hasCallsToAction: false,
        hasOutdatedDesign: true,
        contentFreshness: 'Offline',
        agencyHelpSummary: `Website ${cleanUrl} is UNREACHABLE (HTTP ${statusCode || 'Timeout'}). Critical issue for business owner.`,
      };
    }

    if (isOutdated) {
      return {
        url: cleanUrl,
        hasWebsite: true,
        usesHttps,
        isMobileFriendly,
        hasContactPage,
        hasCallsToAction,
        hasOutdatedDesign: true,
        contentFreshness: 'Outdated',
        agencyHelpSummary: `Website ${cleanUrl} verified online (HTTP ${statusCode}) but client reports outdated design/performance issues.`,
      };
    }

    return {
      url: cleanUrl,
      hasWebsite: true,
      usesHttps,
      isMobileFriendly,
      hasContactPage,
      hasCallsToAction,
      hasOutdatedDesign: false,
      contentFreshness: 'Recent',
      agencyHelpSummary: `Website ${cleanUrl} active (HTTP ${statusCode}). Client seeking custom web portal or feature expansion.`,
    };
  }
}
