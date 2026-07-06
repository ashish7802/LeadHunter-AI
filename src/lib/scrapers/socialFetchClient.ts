import { RawPost, PlatformType } from '../types/lead';

export class SocialFetchClient {
  /**
   * Scrapes real-world public web signals across multiple live public sources
   * (HN Algolia Search, Hacker News Job API, GitHub Public Issues Search)
   * filtering by target country (India or Canada).
   */
  async fetchPostsForRegion(country: 'India' | 'Canada'): Promise<RawPost[]> {
    const results: RawPost[] = [];

    // Query terms tailored for target countries
    const queries = country === 'India'
      ? ['looking for web developer India', 'need website Bangalore', 'hiring web developer Mumbai', 'need React developer Delhi']
      : ['looking for web developer Toronto', 'need website Vancouver', 'redesign shopify store Montreal', 'need React developer Calgary'];

    // Source 1: Algolia HN Search API (Real public posts & comments)
    for (const q of queries.slice(0, 2)) {
      try {
        const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(q)}&hitsPerPage=10`;
        const res = await fetch(url, { headers: { 'User-Agent': 'LeadHunterAI/2.0' } });
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.hits)) {
            data.hits.forEach((hit: any) => {
              const content = hit.comment_text || hit.story_text || hit.title || '';
              if (content.length > 20) {
                results.push({
                  id: `hn-${hit.objectID}`,
                  platform: 'twitter', // Nearest category for web discussion
                  sourceUrl: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
                  author: hit.author || 'HN User',
                  authorHandle: `@${hit.author || 'hn_user'}`,
                  timestamp: hit.created_at || new Date().toISOString(),
                  content: content.replace(/<[^>]*>?/gm, ''), // strip basic HTML tags
                  locationHint: country,
                });
              }
            });
          }
        }
      } catch (err) {
        console.warn(`[MultiSourceScraper] HN Algolia query warning for "${q}":`, err);
      }
    }

    // Source 2: GitHub Public Issues & Discussions Search API
    try {
      const ghQuery = country === 'India' 
        ? 'looking for web developer India' 
        : 'looking for web developer Canada';
      const ghUrl = `https://api.github.com/search/issues?q=${encodeURIComponent(ghQuery)}+in:title,body&sort=created&order=desc&per_page=10`;
      const res = await fetch(ghUrl, {
        headers: { 
          'User-Agent': 'LeadHunterAI/2.0',
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.items)) {
          data.items.forEach((item: any) => {
            const bodyText = item.body || item.title || '';
            results.push({
              id: `gh-${item.id}`,
              platform: 'reddit',
              sourceUrl: item.html_url,
              author: item.user?.login || 'GitHub User',
              authorHandle: `@${item.user?.login || 'gh_user'}`,
              timestamp: item.created_at,
              content: `${item.title}\n\n${bodyText}`,
              locationHint: country,
            });
          });
        }
      }
    } catch (err) {
      console.warn(`[MultiSourceScraper] GitHub Issues query warning:`, err);
    }

    // Source 3: Hacker News Live Jobs Stream
    try {
      const hnJobsRes = await fetch('https://hacker-news.firebaseio.com/v0/jobstories.json');
      if (hnJobsRes.ok) {
        const jobIds: number[] = await hnJobsRes.json();
        const topJobIds = jobIds.slice(0, 5);
        for (const jobId of topJobIds) {
          try {
            const itemRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${jobId}.json`);
            if (itemRes.ok) {
              const item = await itemRes.json();
              if (item && item.title) {
                results.push({
                  id: `hn-job-${item.id}`,
                  platform: 'linkedin',
                  sourceUrl: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
                  author: item.by || 'HackerNews Hiring',
                  authorHandle: `@${item.by || 'hn_hiring'}`,
                  timestamp: new Date(item.time * 1000).toISOString(),
                  content: item.text ? `${item.title}\n\n${item.text}` : item.title,
                  locationHint: country,
                });
              }
            }
          } catch (e) {
            // skip single item error
          }
        }
      }
    } catch (err) {
      console.warn('[MultiSourceScraper] HN JobStream warning:', err);
    }

    return results;
  }
}
