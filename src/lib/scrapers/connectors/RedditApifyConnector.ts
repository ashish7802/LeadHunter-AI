import { BaseConnector } from './BaseConnector';
import { RawPost } from '../../types/lead';

export class RedditApifyConnector extends BaseConnector {
  sourceId = 'apify_reddit';
  sourceName = 'Reddit Post Scraper';
  actorId = 'trudax/reddit-scraper-lite';

  protected async fetchRawData(country?: string): Promise<any[]> {
    const subreddits = [
      'https://www.reddit.com/r/Entrepreneur/new/', 
      'https://www.reddit.com/r/smallbusiness/new/',
      'https://www.reddit.com/r/SaaS/new/',
      'https://www.reddit.com/r/forhire/new/'
    ];
      
    const input = {
      startUrls: subreddits.map(url => ({ url })),
      maxItems: 10,
      proxyConfiguration: { useApifyProxy: true }
    };
    return this.runActorWithRetry(input);
  }

  protected normalizeData(rawData: any[], country?: string): RawPost[] {
    return rawData.map(post => ({
      id: post.id || post.parsedId || Math.random().toString(36).substring(7),
      platform: 'reddit',
      sourceUrl: post.url || '',
      author: post.username || post.author || 'Unknown',
      authorHandle: `@${post.username || post.author || 'unknown'}`,
      timestamp: post.createdAt || post.created_utc || new Date().toISOString(),
      content: `${post.title || ''}\n\n${post.body || post.text || post.selftext || ''}`,
      locationHint: country || 'Worldwide'
    }));
  }
}
