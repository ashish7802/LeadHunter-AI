import { BaseConnector } from './BaseConnector';
import { RawPost } from '../../types/lead';

export class FacebookConnector extends BaseConnector {
  sourceId = 'apify_facebook';
  sourceName = 'Facebook Posts Scraper';
  actorId = 'apify/facebook-posts-scraper';

  protected async fetchRawData(country?: string): Promise<any[]> {
    const startUrls = [
      { url: 'https://www.facebook.com/groups/saasfounders' },
      { url: 'https://www.facebook.com/groups/ecommerceentrepreneurs' },
      { url: 'https://www.facebook.com/groups/smallbusinessowners' }
    ];
      
    const input = {
      startUrls,
      resultsLimit: 10,
      proxyConfiguration: { useApifyProxy: true }
    };
    return this.runActorWithRetry(input);
  }

  protected normalizeData(rawData: any[], country?: string): RawPost[] {
    return rawData
      .filter(post => !post.error)
      .map(post => ({
        id: post.id || post.post_id || Math.random().toString(36).substring(7),
        platform: 'facebook',
        sourceUrl: post.url || post.post_url || '',
        author: post.user?.name || post.page_name || 'Unknown',
        authorHandle: post.user?.profile_url || '',
        timestamp: post.time || post.date || new Date().toISOString(),
        content: post.text || post.message || '',
        locationHint: country || 'Worldwide'
      }));
  }
}
