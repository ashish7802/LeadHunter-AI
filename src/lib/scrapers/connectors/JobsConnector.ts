import { BaseConnector } from './BaseConnector';
import { RawPost } from '../../types/lead';

export class JobsConnector extends BaseConnector {
  sourceId = 'apify_all_jobs';
  sourceName = 'All Jobs Scraper';
  actorId = 'agentx/all-jobs-scraper';

  protected async fetchRawData(country?: string): Promise<any[]> {
    const input = {
      searchQueries: [
        'need website', 'looking for web agency', 'ecommerce development', 'custom software development', 
        'CRM implementation', 'process automation', 'API integration', 'SaaS MVP', 'need landing page'
      ],
      locations: [country || 'Worldwide'],
      max_results: 10,
      proxyConfiguration: { useApifyProxy: true }
    };
    return this.runActorWithRetry(input);
  }

  protected normalizeData(rawData: any[], country?: string): RawPost[] {
    return rawData.map(job => ({
      id: job.id || job.job_id || Math.random().toString(36).substring(7),
      platform: 'linkedin', // Treat job boards as linkedin for type compatibility for now
      sourceUrl: job.url || job.jobUrl || '',
      author: job.companyName || job.company || job.company_name || 'Unknown Company',
      authorHandle: '@' + (job.companyName || job.company_name || 'unknown').replace(/\s+/g, '').toLowerCase(),
      timestamp: job.postedAt || job.datePosted || job.publishedAt || new Date().toISOString(),
      content: `${job.title || job.job_title || ''}\n\n${job.description || ''}`,
      locationHint: job.location || country || 'Worldwide'
    }));
  }
}
