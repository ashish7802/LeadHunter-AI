import { BaseConnector } from './BaseConnector';
import { RawPost } from '../../types/lead';

export class TwitterConnector extends BaseConnector {
  sourceId = 'apify_twitter';
  sourceName = 'X.com (Twitter) Post Scraper';
  actorId = 'parseforge/x-com-scraper';

  protected async fetchRawData(country?: string): Promise<any[]> {
    const locationStr = country ? ` ${country}` : '';
    const input = {
      searchQueries: [
        `"need website"${locationStr}`,
        `"looking for web agency"${locationStr}`,
        `"ecommerce development"${locationStr}`,
        `"SaaS MVP"${locationStr}`
      ],
      tweetsDesired: 10,
      proxyConfiguration: { useApifyProxy: true }
    };
    return this.runActorWithRetry(input);
  }

  protected normalizeData(rawData: any[], country?: string): RawPost[] {
    return rawData.map(tweet => ({
      id: tweet.id || tweet.id_str || Math.random().toString(36).substring(7),
      platform: 'twitter',
      sourceUrl: tweet.url || '',
      author: tweet.user?.name || tweet.author?.name || 'Unknown',
      authorHandle: tweet.user?.screen_name ? `@${tweet.user.screen_name}` : '',
      timestamp: tweet.created_at || new Date().toISOString(),
      content: tweet.full_text || tweet.text || '',
      locationHint: country || 'Worldwide'
    }));
  }
}
