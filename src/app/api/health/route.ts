import { NextResponse } from 'next/server';
import { LeadStore } from '@/lib/db/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const store = LeadStore.getInstance();
    const connectors = store.getConnectorHealth();

    // If no connectors recorded yet, we can instantiate the engine to get default unconfigured status
    if (connectors.length === 0) {
      const { SourceIntelligenceEngine } = await import('@/lib/scrapers/SourceIntelligenceEngine');
      const engine = new SourceIntelligenceEngine();
      // The engine constructor initializes the connectors. 
      // To get their health without running a fetch, we can cheat a bit for this mock endpoint, 
      // or just wait for the first pipeline run. Let's wait for the first run, 
      // but maybe pre-seed them for display purposes.
      
      const { RedditConnector } = await import('@/lib/scrapers/connectors/RedditConnector');
      const { UpworkConnector } = await import('@/lib/scrapers/connectors/UpworkConnector');
      const { FacebookConnector } = await import('@/lib/scrapers/connectors/FacebookConnector');
      
      const defaultConnectors = [
        new RedditConnector().getHealth(),
        new UpworkConnector().getHealth(),
        new FacebookConnector().getHealth()
      ];
      
      return NextResponse.json({ success: true, connectors: defaultConnectors });
    }

    return NextResponse.json({ success: true, connectors });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
