import { RawPost, ConnectorHealth, ConnectorStatus } from '../../types/lead';

export abstract class BaseConnector {
  abstract sourceId: string;
  abstract sourceName: string;
  
  protected health: ConnectorHealth;

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
      qualityScore: 0
    };
  }

  public getHealth(): ConnectorHealth {
    this.health.sourceId = this.sourceId;
    this.health.sourceName = this.sourceName;
    return this.health;
  }

  protected async fetchWithRetry(url: string, options: RequestInit = {}, maxRetries = 3): Promise<Response> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const startTime = Date.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
        
        const res = await fetch(url, {
          ...options,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        const duration = Date.now() - startTime;
        this.updateResponseTime(duration);
        this.health.apiUsageCount++;

        if (res.status === 429) {
          this.health.apiRateLimitStatus = 'Warning';
          const waitTime = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        return res;
      } catch (error: any) {
        lastError = error;
        this.health.errorCount++;
        this.health.errorMessage = error.message;
        
        if (attempt < maxRetries) {
          const waitTime = Math.pow(2, attempt) * 1000;
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

  abstract fetchPosts(country: 'India' | 'Canada'): Promise<RawPost[]>;
}
