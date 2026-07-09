import { RawPost, ConnectorHealth, ConnectorStatus } from '../../types/lead';
import { ApifyClient } from 'apify-client';

export abstract class BaseConnector {
  abstract sourceId: string;
  abstract sourceName: string;
  abstract actorId: string;
  
  protected health: ConnectorHealth;
  protected client: ApifyClient | null = null;

  constructor() {
    this.health = {
      sourceId: '',
      sourceName: '',
      status: 'Not Configured',
      lastSync: new Date().toISOString(),
      totalPostsRetrieved: 0,
      qualifiedLeadsProduced: 0,
      contactVerificationRate: 0,
      apiUsageCount: 0,
      apiRateLimitStatus: 'N/A',
      averageResponseTimeMs: 0,
      errorCount: 0,
      qualityScore: 0,
      duplicateRate: 0,
      spamRate: 0,
      falsePositiveEstimate: 0,
      outreachReadyLeads: 0,
      averageLeadScore: 0,
      businessOpportunityScore: 0,
      successRate: 100,
      failureRate: 0,
      avgRuntimeMs: 0,
      retryCount: 0,
      reliabilityScore: 100
    };
  }

  public getHealth(): ConnectorHealth {
    this.health.sourceId = this.sourceId;
    this.health.sourceName = this.sourceName;
    
    // Recalculate quality score based on metrics
    let score = 50; // Base score
    if (this.health.totalPostsRetrieved > 0) {
      const qualifiedRatio = this.health.qualifiedLeadsProduced / this.health.totalPostsRetrieved;
      score += (qualifiedRatio * 50); // Up to +50 for high qualification rate
      score -= (this.health.spamRate * 30); // Penalty for spam
      score -= (this.health.duplicateRate * 20); // Penalty for duplicates
      score -= (this.health.errorCount * 5); // Penalty for errors
    }
    this.health.qualityScore = Math.max(0, Math.min(100, Math.round(score)));
    
    return this.health;
  }
  
  public authenticate(): boolean {
    const token = process.env.APIFY_API_TOKEN;
    if (!token) {
      this.health.status = 'Authentication Failed';
      this.health.errorMessage = 'APIFY_API_TOKEN is not set in .env.local';
      return false;
    }
    this.client = new ApifyClient({ token });
    this.health.status = 'Connected';
    return true;
  }

  protected async runActorWithRetry(input: any, maxRetries = 2): Promise<any[]> {
    if (!this.authenticate() || !this.client) {
      throw new Error(this.health.errorMessage || 'Authentication failed');
    }

    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const startTime = Date.now();
        
        console.log(`[${this.sourceName}] Starting Apify actor ${this.actorId} (Attempt ${attempt})...`);
        const run = await this.client.actor(this.actorId).call(input);
        console.log(`[${this.sourceName}] Actor finished. Fetching dataset ${run.defaultDatasetId}...`);
        
        const { items } = await this.client.dataset(run.defaultDatasetId).listItems();
        
        const duration = Date.now() - startTime;
        this.updateResponseTime(duration);
        this.health.apiUsageCount++;

        return items;
      } catch (error: any) {
        lastError = error;
        this.health.errorCount++;
        this.health.errorMessage = error.message;
        
        if (error.message && error.message.includes('Rate limit')) {
           this.health.apiRateLimitStatus = 'Exceeded';
           this.health.status = 'Rate Limited';
        }
        
        console.warn(`[${this.sourceName}] Error on attempt ${attempt}: ${error.message}`);
        
        if (attempt < maxRetries) {
          const waitTime = Math.pow(2, attempt) * 2000;
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    this.health.status = 'Error';
    this.health.lastFailedSync = new Date().toISOString();
    throw lastError;
  }

  private updateResponseTime(duration: number) {
    if (this.health.averageResponseTimeMs === 0) {
      this.health.averageResponseTimeMs = duration;
    } else {
      this.health.averageResponseTimeMs = (this.health.averageResponseTimeMs * 0.8) + (duration * 0.2);
    }
  }

  public async fetchPosts(country?: string): Promise<RawPost[]> {
    try {
      this.health.status = 'Connected';
      this.health.lastSync = new Date().toISOString();
      const rawData = await this.fetchRawData(country);
      const normalized = this.normalizeData(rawData, country);
      const deduplicated = this.deduplicate(normalized);
      const validated = this.validateData(deduplicated);
      
      this.health.totalPostsRetrieved += validated.length;
      return validated;
    } catch (err: any) {
      this.health.status = 'Error';
      this.health.errorMessage = err.message;
      return [];
    }
  }
  
  protected deduplicate(posts: RawPost[]): RawPost[] {
    const seen = new Set<string>();
    let duplicates = 0;
    const uniquePosts = posts.filter(post => {
      if (!post.sourceUrl) {
         duplicates++;
         return false;
      }
      const isDuplicate = seen.has(post.sourceUrl);
      if (isDuplicate) duplicates++;
      seen.add(post.sourceUrl);
      return !isDuplicate;
    });
    
    // Update duplicate rate metric
    if (posts.length > 0) {
      const currentRate = duplicates / posts.length;
      this.health.duplicateRate = (this.health.duplicateRate * 0.8) + (currentRate * 0.2);
    }
    
    return uniquePosts;
  }
  
  protected validateData(posts: RawPost[]): RawPost[] {
    let spamCount = 0;
    const spamKeywords = ['nft', 'crypto', 'giveaway', 'click here', 'buy followers', 'cheap followers', 'sugar daddy'];
    
    const validPosts = posts.filter(post => {
      if (!post.content || post.content.trim().length < 20) {
        spamCount++;
        return false;
      }
      
      const contentLower = post.content.toLowerCase();
      if (spamKeywords.some(keyword => contentLower.includes(keyword))) {
        spamCount++;
        return false;
      }
      
      return true;
    });
    
    if (posts.length > 0) {
      const currentRate = spamCount / posts.length;
      this.health.spamRate = (this.health.spamRate * 0.8) + (currentRate * 0.2);
    }
    
    return validPosts;
  }

  protected abstract fetchRawData(country?: string): Promise<any[]>;
  protected abstract normalizeData(rawData: any[], country?: string): RawPost[];
}
