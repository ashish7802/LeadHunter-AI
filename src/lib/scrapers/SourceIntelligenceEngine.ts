import { RawPost, ConnectorHealth } from '../types/lead';
import { RedditConnector } from './connectors/RedditConnector';
import { UpworkConnector } from './connectors/UpworkConnector';
import { FacebookConnector } from './connectors/FacebookConnector';
import { BaseConnector } from './connectors/BaseConnector';
import { LeadStore } from '../db/store';

export class SourceIntelligenceEngine {
  private connectors: BaseConnector[] = [];

  constructor() {
    this.connectors = [
      new RedditConnector(),
      new UpworkConnector(),
      new FacebookConnector()
    ];
  }

  async fetchPostsForRegion(country: 'India' | 'Canada'): Promise<{ posts: RawPost[], sourceId: string }[]> {
    const results: { posts: RawPost[], sourceId: string }[] = [];
    const store = LeadStore.getInstance();

    for (const connector of this.connectors) {
      try {
        const posts = await connector.fetchPosts(country);
        results.push({ posts, sourceId: connector.sourceId });
        
        // Save connector health status to DB
        store.saveConnectorHealth(connector.getHealth());
      } catch (err) {
        console.warn(`[SourceIntelligenceEngine] Error fetching from ${connector.sourceName}:`, err);
        // Save error health status
        store.saveConnectorHealth(connector.getHealth());
      }
    }

    return results;
  }
}
