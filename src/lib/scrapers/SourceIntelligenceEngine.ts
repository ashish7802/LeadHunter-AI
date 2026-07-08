import { RawPost, PlatformType } from '../types/lead';

export class SourceIntelligenceEngine {
  /**
   * Tier 1: Facebook Groups (SME Business Owners, Local Business Network), Upwork RSS feeds, specific founder subreddits (r/smallbusiness, r/Entrepreneur, r/SaaS)
   * Tier 2: Twitter (filtering for hashtags like #needwebsite, #lookingfordeveloper combined with business terms)
   * Tier 3: General subreddits (r/forhire)
   * Tier 4: Hacker News, StackOverflow (Removed)
   */
  async fetchPostsForRegion(country: 'India' | 'Canada'): Promise<{ posts: RawPost[], sourceId: string }[]> {
    const results: { posts: RawPost[], sourceId: string }[] = [];

    // TIER 1: Subreddits focused on Founders and SMEs
    try {
      const subreddits = ['smallbusiness', 'Entrepreneur', 'SaaS'];
      for (const sub of subreddits) {
        const query = country === 'India' 
          ? 'website india OR developer india OR hire india'
          : 'website canada OR developer canada OR hire canada';
        const url = `https://www.reddit.com/r/${sub}/search.json?q=${encodeURIComponent(query)}&restrict_sr=1&sort=new&limit=5`;
        
        const res = await fetch(url, { headers: { 'User-Agent': 'LeadHunterAI/3.0 (SourceIntelligence)' } });
        if (res.ok) {
          const data = await res.json();
          const posts: RawPost[] = [];
          if (data && data.data && Array.isArray(data.data.children)) {
            data.data.children.forEach((child: any) => {
              const post = child.data;
              posts.push({
                id: `reddit-${post.id}`,
                platform: 'reddit',
                sourceUrl: `https://reddit.com${post.permalink}`,
                author: post.author,
                authorHandle: `u/${post.author}`,
                timestamp: new Date(post.created_utc * 1000).toISOString(),
                content: `${post.title}\n\n${post.selftext}`,
                locationHint: country,
              });
            });
          }
          results.push({ posts, sourceId: `reddit-tier1-${sub}` });
        }
      }
    } catch (err) {
      console.warn(`[SourceIntelligenceEngine] Reddit Tier 1 fetch error:`, err);
    }

    // TIER 1: Mocked Upwork RSS Feed
    try {
      const posts: RawPost[] = [];
      const mockUpworkPost = {
        id: `upwork-${Date.now()}`,
        platform: 'upwork' as PlatformType,
        sourceUrl: `https://www.upwork.com/jobs/~${Date.now()}`,
        author: 'Verified Business Client',
        authorHandle: 'upwork_client',
        timestamp: new Date().toISOString(),
        content: country === 'India' 
          ? 'Looking for a reliable web development agency in India to rebuild our e-commerce store. Budget is around $5000. Please check out my current store at dummy-india-store.com'
          : 'Need a local Toronto developer to build a SaaS MVP for my real estate startup. Contact via upwork. Budget $10,000 CAD.',
        locationHint: country,
      };
      posts.push(mockUpworkPost);
      results.push({ posts, sourceId: `upwork-tier1-rss` });
    } catch (err) {
       console.warn(`[SourceIntelligenceEngine] Upwork Tier 1 fetch error:`, err);
    }

    // TIER 2: Mocked Facebook Group
    try {
      const posts: RawPost[] = [];
      const mockFbPost = {
        id: `fb-${Date.now()}`,
        platform: 'facebook' as PlatformType,
        sourceUrl: `https://facebook.com/groups/local-business-${Date.now()}`,
        author: 'Local Business Owner',
        authorHandle: '@businessowner',
        timestamp: new Date().toISOString(),
        content: `Hi everyone, my plumbing business needs a new website. Anyone know a good developer? email me at owner@plumbingbusiness.com. Based in ${country}`,
        locationHint: country,
      };
      posts.push(mockFbPost);
      results.push({ posts, sourceId: `facebook-tier2-groups` });
    } catch(err) {
       console.warn(`[SourceIntelligenceEngine] FB Tier 2 fetch error:`, err);
    }

    // TIER 3: General Subreddit (r/forhire)
    try {
      const query = country === 'India' ? 'hiring web developer india' : 'hiring web developer canada';
      const url = `https://www.reddit.com/r/forhire/search.json?q=${encodeURIComponent(query)}&restrict_sr=1&sort=new&limit=5`;
      const res = await fetch(url, { headers: { 'User-Agent': 'LeadHunterAI/3.0 (SourceIntelligence)' } });
      if (res.ok) {
        const data = await res.json();
        const posts: RawPost[] = [];
        if (data && data.data && Array.isArray(data.data.children)) {
          data.data.children.forEach((child: any) => {
            const post = child.data;
            posts.push({
              id: `reddit-${post.id}`,
              platform: 'reddit',
              sourceUrl: `https://reddit.com${post.permalink}`,
              author: post.author,
              authorHandle: `u/${post.author}`,
              timestamp: new Date(post.created_utc * 1000).toISOString(),
              content: `${post.title}\n\n${post.selftext}`,
              locationHint: country,
            });
          });
        }
        results.push({ posts, sourceId: `reddit-tier3-forhire` });
      }
    } catch (err) {
      console.warn(`[SourceIntelligenceEngine] Reddit Tier 3 fetch error:`, err);
    }

    return results;
  }
}
