import { NextRequest, NextResponse } from 'next/server';
import { SourceIntelligenceEngine } from '@/lib/scrapers/SourceIntelligenceEngine';
import { GroqQualifier } from '@/lib/ai/qualifier';
import { WebsiteVerifier } from '@/lib/services/websiteVerifier';
import { LeadScorer } from '@/lib/services/leadScorer';
import { EnrichmentEngine } from '@/lib/ai/enrichmentEngine';
import { LeadStore } from '@/lib/db/store';
import { Lead, RawPost, AILeadQualityAudit } from '@/lib/types/lead';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await request.json().catch(() => ({}));
    const targetRegion: 'India' | 'Canada' | 'All' = body.region || 'All';

    const scraper = new SourceIntelligenceEngine();
    const qualifier = new GroqQualifier();
    const verifier = new WebsiteVerifier();
    const scorer = new LeadScorer();
    const enricher = new EnrichmentEngine();
    const store = LeadStore.getInstance();

    let rawSourceResults: { posts: RawPost[], sourceId: string }[] = [];
    if (targetRegion === 'All' || targetRegion === 'India') {
      const inPosts = await scraper.fetchPostsForRegion('India');
      rawSourceResults.push(...inPosts);
    }
    if (targetRegion === 'All' || targetRegion === 'Canada') {
      const caPosts = await scraper.fetchPostsForRegion('Canada');
      rawSourceResults.push(...caPosts);
    }

    // Prepare source intelligence tracking
    const sourceStats: Record<string, { totalScraped: number; qualifiedCount: number; contactFoundCount: number; spamCount: number }> = {};
    
    // Flatten and limit to 10 posts maximum to prevent hitting Groq's 12000 TPM limit
    // Keep track of which post came from which source for metrics
    const allPostsWithSource: { post: RawPost, sourceId: string }[] = [];
    
    for (const res of rawSourceResults) {
      if (!sourceStats[res.sourceId]) {
        sourceStats[res.sourceId] = { totalScraped: 0, qualifiedCount: 0, contactFoundCount: 0, spamCount: 0 };
      }
      sourceStats[res.sourceId].totalScraped += res.posts.length;
      
      for (const p of res.posts) {
        allPostsWithSource.push({ post: p, sourceId: res.sourceId });
      }
    }
    
    const limitedPosts = allPostsWithSource.sort(() => 0.5 - Math.random()).slice(0, 10);

    const processedLeads: Lead[] = [];
    let rejectedCount = 0;
    let duplicateCount = 0;
    let totalSpam = 0;
    let totalRecruiters = 0;
    let totalAgencies = 0;
    let totalDevelopers = 0;
    let totalStudents = 0;
    let contactVerificationSuccesses = 0;
    let falsePositiveEstimate = 0;

    for (const { post, sourceId } of limitedPosts) {
      // Deduplication check by URL and by Content Hash
      if (store.isDuplicate(post.sourceUrl) || store.isDuplicateByContent(post.content)) {
        duplicateCount++;
        continue;
      }

      // Step 1: AI Qualification via Groq LLaMA 3.3 70B
      const aiResult = await qualifier.qualifyPost(post);
      
      // Delay to respect rate limits (approx 850 tokens per request)
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (aiResult.isSpam) {
        totalSpam++;
        rejectedCount++;
        sourceStats[sourceId].spamCount++;
        continue; // Drop spam completely
      }
      
      let initialPriority: Lead['priority'] = 'Qualified Lead';
      
      if (aiResult.isRecruiter) {
        totalRecruiters++;
        initialPriority = 'Recruiters';
      } else if (aiResult.isAgencySelling) {
        totalAgencies++;
        initialPriority = 'Agencies';
      } else if (aiResult.isJobSeeker) {
        totalDevelopers++;
        initialPriority = 'Developers';
      } else if (aiResult.isStudent) {
        totalStudents++;
        initialPriority = 'Students';
      } else if (aiResult.intentConfidence < 70 || aiResult.businessConfidence < 70) {
        initialPriority = 'Needs Human Review';
        falsePositiveEstimate++;
      } else if (aiResult.intentConfidence >= 90 && aiResult.businessConfidence >= 90) {
        initialPriority = 'Hot Lead';
      }

      // Step 2: Live Website Verification
      const webAnalysis = await verifier.verifyWebsite(undefined, post.content);

      // Step 3: Lead Scoring & Contact Verification
      const hasPublicContact = Boolean(aiResult.publicEmail || aiResult.publicPhone || post.sourceUrl);
      if (hasPublicContact) {
        contactVerificationSuccesses++;
      } else if (initialPriority === 'Hot Lead' || initialPriority === 'Qualified Lead') {
        initialPriority = 'Needs Contact Verification';
      }

      // Track qualified sources
      if (initialPriority === 'Hot Lead' || initialPriority === 'Qualified Lead' || initialPriority === 'Needs Contact Verification' || initialPriority === 'Needs Human Review') {
         sourceStats[sourceId].qualifiedCount++;
         if (hasPublicContact) {
           sourceStats[sourceId].contactFoundCount++;
         }
      }

      const scoreResult = scorer.calculateScore(aiResult, webAnalysis.hasWebsite, hasPublicContact, false, 1);

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
        intentCategory: aiResult.intentCategory,
        estimatedBudget: aiResult.estimatedBudget,
        urgency: aiResult.urgency,
        priority: initialPriority,
        leadScore: scoreResult.score,
        intentConfidence: aiResult.intentConfidence,
        businessConfidence: aiResult.businessConfidence,
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
        humanReasoning: aiResult.humanReasoning,
        explainability: aiResult.explainability,
        verificationStatus: 'Verified Real Business',
        duplicateStatus: 'Unique',
        pipelineStatus: initialPriority,
        userNotes: [],
        tags: [aiResult.country, aiResult.intentCategory],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      store.saveLead(newLead);
      
      // Step 4: Business Enrichment & Outreach Readiness
      const enrichedLead = await enricher.enrichLead(newLead);
      
      store.saveLead(enrichedLead); // Overwrite with enriched
      processedLeads.push(enrichedLead);
    }

    const durationMs = Date.now() - startTime;
    
    const sourceIntelligence = Object.keys(sourceStats).map(sourceId => ({
      sourceId,
      ...sourceStats[sourceId]
    }));

    // Generate AI Lead Quality Audit
    let topSource = 'None';
    let worstSource = 'None';
    let topCount = -1;
    let worstCount = Infinity;
    
    for (const sourceId in sourceStats) {
      const stats = sourceStats[sourceId];
      if (stats.qualifiedCount > topCount) {
        topCount = stats.qualifiedCount;
        topSource = sourceId;
      }
      if (stats.spamCount > worstCount || worstCount === Infinity) {
        worstCount = stats.spamCount;
        worstSource = sourceId;
      }
    }

    const aiLeadQualityAudit: AILeadQualityAudit = {
      totalPosts: limitedPosts.length,
      qualifiedLeads: processedLeads.length,
      hotLeads: processedLeads.filter(l => l.priority === 'Hot Lead').length,
      contactVerifiedLeads: contactVerificationSuccesses,
      needsContactVerification: processedLeads.filter(l => l.priority === 'Needs Contact Verification').length,
      spam: totalSpam,
      recruiters: totalRecruiters,
      agencies: totalAgencies,
      students: totalStudents,
      developers: totalDevelopers,
      falsePositiveEstimate,
      topPerformingSource: topSource,
      worstPerformingSource: worstSource,
      recommendedSourcePriority: [topSource].filter(s => s !== 'None'),
      recommendationReasons: [`${topSource} produced the most qualified leads (${topCount}).`]
    };

    const runRecord = {
      id: `run-${Date.now()}`,
      timestamp: new Date().toISOString(),
      region: targetRegion,
      totalIngested: limitedPosts.length,
      newQualified: processedLeads.length,
      duplicatesFiltered: duplicateCount,
      rejectedCount,
      sources: Object.keys(sourceStats),
      sourceIntelligence,
      durationMs,
      totalSpam,
      totalRecruiters,
      totalAgencies,
      totalDevelopers,
      totalStudents,
      contactVerificationSuccessRate: limitedPosts.length > 0 ? (contactVerificationSuccesses / limitedPosts.length) * 100 : 0,
      falsePositiveEstimate,
      aiLeadQualityAudit
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
