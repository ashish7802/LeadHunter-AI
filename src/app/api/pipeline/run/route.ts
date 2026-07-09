import { NextRequest, NextResponse } from 'next/server';
import { SourceIntelligenceEngine } from '@/lib/scrapers/SourceIntelligenceEngine';
import { GroqQualifier } from '@/lib/ai/qualifier';
import { LeadStore } from '@/lib/db/store';
import { WebsiteVerifier } from '@/lib/services/websiteVerifier';
import { Lead, RawPost, AILeadQualityAudit, OpportunityPriority } from '@/lib/types/lead';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await request.json().catch(() => ({}));
    const targetRegion = body.region || 'Worldwide';

    const scraper = new SourceIntelligenceEngine();
    const qualifier = new GroqQualifier();
    const store = LeadStore.getInstance();
    const websiteVerifier = new WebsiteVerifier();

    let rawSourceResults: { posts: RawPost[], sourceId: string }[] = [];
    const posts = await scraper.fetchPostsWorldwide();
    rawSourceResults.push(...posts);

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
      
      let initialPriority: OpportunityPriority = aiResult.priority;
      
      if (aiResult.isRecruiter) {
        totalRecruiters++;
        initialPriority = 'Archive';
      } else if (aiResult.isAgencySelling) {
        totalAgencies++;
        initialPriority = 'Archive';
      } else if (aiResult.isJobSeeker) {
        totalDevelopers++;
        initialPriority = 'Archive';
      } else if (aiResult.isStudent) {
        totalStudents++;
        initialPriority = 'Archive';
      }

      const hasPublicContact = Boolean(aiResult.publicEmail || aiResult.publicPhone || post.sourceUrl);
      if (hasPublicContact) {
        contactVerificationSuccesses++;
      }

      // Track qualified sources
      if (initialPriority !== 'Archive') {
         sourceStats[sourceId].qualifiedCount++;
         if (hasPublicContact) {
           sourceStats[sourceId].contactFoundCount++;
         }
      }

      // Perform live website verification
      let liveWebsiteAnalysis = aiResult.websiteAnalysis;
      if (aiResult.websiteAnalysis && aiResult.websiteAnalysis.url) {
        try {
          const verification = await websiteVerifier.verifyWebsite(aiResult.websiteAnalysis.url, post.content);
          liveWebsiteAnalysis = {
            ...aiResult.websiteAnalysis,
            ...verification,
            url: verification.url || aiResult.websiteAnalysis.url,
          };
        } catch (e) {
          console.error('[WebsiteVerifier] error:', e);
        }
      } else {
        // Try to verify if there's any URL hint in the content
        try {
          const verification = await websiteVerifier.verifyWebsite(undefined, post.content);
          liveWebsiteAnalysis = {
            ...aiResult.websiteAnalysis,
            ...verification,
          };
        } catch (e) {
          console.error('[WebsiteVerifier] error:', e);
        }
      }

      // Build Lead Object with full CRM fields
      const isWebsiteVerified = liveWebsiteAnalysis?.hasWebsite && liveWebsiteAnalysis?.url;
      const now = new Date().toISOString();
      const newLead: Lead = {
        id: `lead-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        leadName: aiResult.leadName || post.author,
        companyName: aiResult.companyName || `${post.author} Business`,
        businessType: aiResult.businessType || 'General Business',
        industry: aiResult.industry || 'Technology',
        country: aiResult.country,
        city: aiResult.city || 'Unknown',
        language: aiResult.language || 'English',
        needSummary: aiResult.needSummary,
        intentCategory: aiResult.intentCategory,
        estimatedBudget: aiResult.estimatedBudget || 'Not Estimated',
        urgency: aiResult.urgency || 'Medium',
        priority: initialPriority,

        // Lifecycle
        stage: 'AI Qualified',
        stageHistory: [
          { fromStage: 'New' as const, toStage: 'Discovered' as const, changedBy: 'Pipeline', changedAt: now, note: `Discovered from ${post.platform}` },
          { fromStage: 'Discovered' as const, toStage: 'AI Qualified' as const, changedBy: 'Pipeline', changedAt: now, note: `Qualified by Groq LLaMA (score: ${aiResult.qualityScore?.totalScore})` },
        ],

        qualityScore: aiResult.qualityScore,
        agencyFit: aiResult.agencyFit,
        companyResearch: aiResult.companyResearch,
        websiteAnalysis: liveWebsiteAnalysis,
        internalWorkspace: aiResult.internalWorkspace,
        timelineEvents: aiResult.timelineEvents,

        opportunityValue: aiResult.opportunityValue,
        opportunityConfidence: aiResult.agencyFit.confidence,
        matchedServices: aiResult.agencyFit.secondaryServices || [],

        publicEmail: aiResult.publicEmail || undefined,
        publicPhone: aiResult.publicPhone || undefined,
        socialProfileUrl: post.sourceUrl,
        platform: post.platform,
        sourceUrl: post.sourceUrl,
        sourceTimestamp: post.timestamp,
        rawContent: post.content,
        authorHandle: post.authorHandle,
        verificationStatus: isWebsiteVerified ? 'Verified Real Business' : 'Pending Verification',
        duplicateStatus: 'Unique',
        pipelineStatus: initialPriority,

        // CRM fields
        internalNotes: [],
        userNotes: [],
        tags: aiResult.country ? [aiResult.country] : [],
        customLabels: [],
        assignedTo: null,
        isStarred: false,
        manualScoreOverride: null,
        followUps: [],
        reminderDate: null,
        lastContactDate: null,
        contactAttempts: 0,
        meetingStatus: 'None',
        proposalStatus: 'None',

        // Validation & Critique
        revenueValidation: aiResult.revenueValidation,
        uncertaintyPoints: aiResult.uncertaintyPoints || [],
        userFeedback: null,
        acceptanceReason: aiResult.acceptanceReason || 'AI Qualified',
        rejectionReason: aiResult.rejectionReason || null,

        createdAt: now,
        updatedAt: now,
      };

      store.saveLead(newLead);
      processedLeads.push(newLead);
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
      hotLeads: processedLeads.filter(l => l.priority === 'Contact Today').length,
      contactVerifiedLeads: contactVerificationSuccesses,
      needsContactVerification: processedLeads.filter(l => l.priority === 'Needs Research').length,
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
