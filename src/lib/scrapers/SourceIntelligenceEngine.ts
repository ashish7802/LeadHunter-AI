import { RawPost } from '../types/lead';
import { BaseConnector } from './connectors/BaseConnector';
import { JobsConnector } from './connectors/JobsConnector';
import { FacebookConnector } from './connectors/FacebookConnector';
import { LinkedInConnector } from './connectors/LinkedInConnector';
import { RedditApifyConnector } from './connectors/RedditApifyConnector';
import { TwitterConnector } from './connectors/TwitterConnector';
import { LeadStore } from '../db/store';

export class SourceIntelligenceEngine {
  private connectors: BaseConnector[] = [];

  constructor() {
    this.connectors = [
      new JobsConnector(),
      new FacebookConnector(),
      new LinkedInConnector(),
      new RedditApifyConnector(),
      new TwitterConnector()
    ];
  }

  async fetchPostsWorldwide(country?: string): Promise<{ posts: RawPost[], sourceId: string }[]> {
    const results: { posts: RawPost[], sourceId: string }[] = [];
    const store = LeadStore.getInstance();

    // Prioritize connectors by Quality Score (highest first)
    const sortedConnectors = [...this.connectors].sort((a, b) => {
       return b.getHealth().qualityScore - a.getHealth().qualityScore;
    });

    const fetchPromises = sortedConnectors.map(async (connector) => {
      try {
        const posts = await connector.fetchPosts(country);
        store.saveConnectorHealth(connector.getHealth());
        return { posts, sourceId: connector.sourceId };
      } catch (err) {
        console.warn(`[SourceIntelligenceEngine] Error fetching from ${connector.sourceName}:`, err);
        store.saveConnectorHealth(connector.getHealth());
        return { posts: [], sourceId: connector.sourceId };
      }
    });

    const settledResults = await Promise.all(fetchPromises);
    results.push(...settledResults.filter(r => r.posts.length > 0));

    return results;
  }
}
