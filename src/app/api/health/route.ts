import { NextResponse } from 'next/server';
import { LeadStore } from '@/lib/db/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const store = LeadStore.getInstance();
    const connectors = store.getConnectorHealth();

    if (connectors.length === 0) {
      const { SourceIntelligenceEngine } = await import('@/lib/scrapers/SourceIntelligenceEngine');
      const engine = new SourceIntelligenceEngine();
      
      const { RedditApifyConnector } = await import('@/lib/scrapers/connectors/RedditApifyConnector');
      const { FacebookConnector } = await import('@/lib/scrapers/connectors/FacebookConnector');
      const { JobsConnector } = await import('@/lib/scrapers/connectors/JobsConnector');
      const { LinkedInConnector } = await import('@/lib/scrapers/connectors/LinkedInConnector');
      const { TwitterConnector } = await import('@/lib/scrapers/connectors/TwitterConnector');
      
      const defaultConnectors = [
        new RedditApifyConnector().getHealth(),
        new FacebookConnector().getHealth(),
        new JobsConnector().getHealth(),
        new LinkedInConnector().getHealth(),
        new TwitterConnector().getHealth()
      ];
      
      return NextResponse.json({ success: true, connectors: defaultConnectors });
    }

    return NextResponse.json({ success: true, connectors });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
