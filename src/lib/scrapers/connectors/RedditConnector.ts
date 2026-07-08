import { BaseConnector } from './BaseConnector';
import { RawPost } from '../../types/lead';

export class RedditConnector extends BaseConnector {
  sourceId = 'reddit_public';
  sourceName = 'Reddit (Public APIs)';

  async fetchPosts(country: 'India' | 'Canada'): Promise<RawPost[]> {
    this.health.status = 'Connected';
    this.health.lastSync = new Date().toISOString();
    
    const results: RawPost[] = [];
    const subreddits = country === 'India' 
      ? ['smallbusiness', 'Entrepreneur', 'developersIndia', 'SaaS', 'forhire']
      : ['smallbusiness', 'Entrepreneur', 'SaaS', 'forhire', 'canadajobs'];
    
    const queries = [
      'web developer',
      'need website',
      'website redesign',
      'looking for developer'
    ];

    try {
      for (const sub of subreddits) {
        for (const query of queries) {
          const url = `https://www.reddit.com/r/${sub}/search.json?q=${encodeURIComponent(query)}&restrict_sr=1&sort=new&limit=5`;
          
          try {
            const res = await this.fetchWithRetry(url, {
              headers: {
                'User-Agent': 'LeadHunterAI/2.0 (lead-discovery-bot)'
              }
            });
            
            const data = await res.json();
            
            if (data?.data?.children) {
              for (const child of data.data.children) {
                const post = child.data;
                results.push({
                  id: `t3_${post.id}`,
                  platform: 'reddit',
                  sourceUrl: `https://reddit.com${post.permalink}`,
                  author: post.author,
                  authorHandle: `@${post.author}`,
                  timestamp: new Date(post.created_utc * 1000).toISOString(),
                  content: post.selftext || post.title,
                  locationHint: country
                });
              }
            }
          } catch (err: any) {
            console.warn(`[RedditConnector] Error fetching ${sub} with query ${query}: ${err.message}`);
          }
        }
      }
      
      this.health.totalPostsRetrieved += results.length;
      return results;
    } catch (error: any) {
      this.health.status = 'Error';
      this.health.errorMessage = error.message;
      return [];
    }
  }
}
