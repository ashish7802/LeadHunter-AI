import { BaseConnector } from './BaseConnector';
import { RawPost } from '../../types/lead';

export class LinkedInConnector extends BaseConnector {
  sourceId = 'apify_linkedin';
  sourceName = 'LinkedIn Posts Search Scraper';
  actorId = 'apimaestro/linkedin-posts-search-scraper-no-cookies';

  protected async fetchRawData(country?: string): Promise<any[]> {
    const locationStr = country ? ` "${country}"` : '';
    const input = {
      searchQueries: [
        `"need website"${locationStr}`,
        `"looking for web agency"${locationStr}`,
        `"ecommerce development"${locationStr}`,
        `"SaaS MVP"${locationStr}`,
        `"API integration" "hiring"${locationStr}`
      ],
      maxPostsPerQuery: 5,
      sortBy: "date_posted",
      proxyConfiguration: { useApifyProxy: true }
    };
    return this.runActorWithRetry(input);
  }

  protected normalizeData(rawData: any[], country?: string): RawPost[] {
    return rawData.map(post => ({
      id: post.activity_id || post.id || post.urn || Math.random().toString(36).substring(7),
      platform: 'linkedin',
      sourceUrl: post.post_url || post.url || post.postUrl || '',
      author: post.author?.name || post.authorName || 'Unknown',
      authorHandle: post.author?.profileUrl || post.authorUrl || '',
      timestamp: post.posted_at || post.postedAtISO || post.date || new Date().toISOString(),
      content: post.text || post.content || '',
      locationHint: country || 'Worldwide'
    }));
  }
}
