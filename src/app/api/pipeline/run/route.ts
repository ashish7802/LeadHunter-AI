import { NextRequest, NextResponse } from 'next/server';
import { SocialFetchClient } from '@/lib/scrapers/socialFetchClient';
import { GroqQualifier } from '@/lib/ai/qualifier';
import { WebsiteVerifier } from '@/lib/services/websiteVerifier';
import { LeadScorer } from '@/lib/services/leadScorer';
import { LeadStore } from '@/lib/db/store';
import { Lead } from '@/lib/types/lead';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await request.json().catch(() => ({}));
    const targetRegion: 'India' | 'Canada' | 'All' = body.region || 'All';

    const scraper = new SocialFetchClient();
    const qualifier = new GroqQualifier();
    const verifier = new WebsiteVerifier();
    const scorer = new LeadScorer();
    const store = LeadStore.getInstance();

    let rawPosts = [];
    if (targetRegion === 'All' || targetRegion === 'India') {
      const inPosts = await scraper.fetchPostsForRegion('India');
      rawPosts.push(...inPosts);
    }
    if (targetRegion === 'All' || targetRegion === 'Canada') {
      const caPosts = await scraper.fetchPostsForRegion('Canada');
      rawPosts.push(...caPosts);
    }

    // Limit to 10 posts maximum to prevent hitting Groq's 12000 TPM limit
    // We shuffle the array first so we get a mix of sources/regions
    rawPosts = rawPosts.sort(() => 0.5 - Math.random()).slice(0, 10);

    const processedLeads: Lead[] = [];
    let rejectedCount = 0;
    let duplicateCount = 0;

    for (const post of rawPosts) {
      // Deduplication check by URL and by Content Hash
      if (store.isDuplicate(post.sourceUrl) || store.isDuplicateByContent(post.content)) {
        duplicateCount++;
        continue;
      }

      // Step 1: AI Qualification via Groq LLaMA 3.3 70B
      const aiResult = await qualifier.qualifyPost(post);
      
      // Delay to respect rate limits (approx 850 tokens per request)
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (aiResult.isSpam || aiResult.isRecruiter || aiResult.isJobSeeker) {
        rejectedCount++;
        continue;
      }

      // Step 2: Live Website Verification
      const webAnalysis = await verifier.verifyWebsite(undefined, post.content);

      // Step 3: Lead Scoring
      const hasPublicContact = Boolean(aiResult.publicEmail || aiResult.publicPhone);
      const scoreResult = scorer.calculateScore(aiResult, webAnalysis.hasWebsite, hasPublicContact, false, 1);

      if (scoreResult.priority === 'Rejected') {
        rejectedCount++;
        continue;
      }

      // Build Lead Object
      const newLead: Lead = {
        id: `lead-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        leadName: aiResult.leadName || post.author,
        companyName: aiResult.companyName || `${post.author} Business`,
        businessType: aiResult.businessType || 'General Business',
        industry: aiResult.industry || 'Technology',
        country: aiResult.country,
        city: aiResult.city || (aiResult.country === 'India' ? 'Bengaluru' : 'Toronto'),
        language: aiResult.language || 'English',
        needSummary: aiResult.needSummary,
        needCategory: aiResult.needCategory,
        estimatedBudget: aiResult.estimatedBudget,
        urgency: aiResult.urgency,
        priority: scoreResult.priority,
        leadScore: scoreResult.score,
        confidenceScore: aiResult.confidenceScore,
        scoreBreakdown: scoreResult.breakdown,
        publicEmail: aiResult.publicEmail || undefined,
        publicPhone: aiResult.publicPhone || undefined,
        socialProfileUrl: post.sourceUrl,
        platform: post.platform,
        sourceUrl: post.sourceUrl,
        sourceTimestamp: post.timestamp,
        rawContent: post.content,
        authorHandle: post.authorHandle,
        websiteAnalysis: webAnalysis,
        aiReasoning: aiResult.aiReasoning,
        verificationStatus: 'Verified Real Business',
        duplicateStatus: 'Unique',
        pipelineStatus: 'New Lead',
        userNotes: [],
        tags: [aiResult.country, aiResult.needCategory],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      store.saveLead(newLead);
      processedLeads.push(newLead);
    }

    const durationMs = Date.now() - startTime;
    const runRecord = {
      id: `run-${Date.now()}`,
      timestamp: new Date().toISOString(),
      region: targetRegion,
      totalIngested: rawPosts.length,
      newQualified: processedLeads.length,
      duplicatesFiltered: duplicateCount,
      rejectedCount,
      sources: ['Algolia HN Search', 'GitHub Public Issues', 'HN JobStream'],
      durationMs,
    };
    store.saveRunRecord(runRecord);

    const updatedMetrics = store.getMetrics();

    return NextResponse.json({
      success: true,
      summary: runRecord,
      newLeads: processedLeads,
      metrics: updatedMetrics,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
