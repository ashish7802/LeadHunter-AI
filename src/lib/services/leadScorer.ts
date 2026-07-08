import { LeadScoreBreakdown, LeadPriority, CountryType } from '../types/lead';
import { AIQualificationResult } from '../ai/qualifier';

export class LeadScorer {
  public calculateScore(
    aiResult: AIQualificationResult,
    hasWebsite: boolean,
    hasPublicContact: boolean,
    isDuplicate: boolean = false,
    hoursOld: number = 2
  ): { score: number; priority: LeadPriority; breakdown: LeadScoreBreakdown } {
    let websiteNeed = 0;
    if (!hasWebsite) {
      websiteNeed = 25; // No website is highest need
    } else if (aiResult.intentCategory === 'Website Redesign' || aiResult.intentCategory === 'Website Purchase') {
      websiteNeed = 20;
    } else {
      websiteNeed = 15;
    }

    const businessOwnerIntent = aiResult.isBusinessOwner && aiResult.hasPurchaseIntent ? 20 : 5;
    
    let budgetClarity = 0;
    if (aiResult.estimatedBudget && aiResult.estimatedBudget !== 'Unknown') {
      budgetClarity = 15;
    } else {
      budgetClarity = 5;
    }

    let urgencyScore = 0;
    if (aiResult.urgency === 'Immediate (ASAP)') urgencyScore = 15;
    else if (aiResult.urgency === 'High') urgencyScore = 12;
    else if (aiResult.urgency === 'Medium') urgencyScore = 8;
    else urgencyScore = 5;

    const publicContact = hasPublicContact ? 10 : 0;

    let targetCountryMatch = 0;
    if (aiResult.country === 'India' || aiResult.country === 'Canada') {
      targetCountryMatch = 15;
    } else {
      targetCountryMatch = 5;
    }

    const recentPostBonus = hoursOld <= 12 ? 10 : hoursOld <= 24 ? 5 : 0;

    // Penalties
    const spamPenalty = aiResult.isSpam ? 50 : 0;
    const agencyPenalty = aiResult.isAgencySelling ? 40 : 0;
    const recruiterPenalty = aiResult.isRecruiter || aiResult.isJobSeeker ? 45 : 0;
    const duplicatePenalty = isDuplicate ? 30 : 0;

    const positiveSum = websiteNeed + businessOwnerIntent + budgetClarity + urgencyScore + publicContact + targetCountryMatch + recentPostBonus;
    const penaltySum = spamPenalty + agencyPenalty + recruiterPenalty + duplicatePenalty;

    let totalScore = Math.max(0, Math.min(100, Math.round(positiveSum - penaltySum)));

    let priority: LeadPriority = 'Rejected';
    if (totalScore >= 90) priority = 'Hot Lead';
    else if (totalScore >= 80) priority = 'Qualified Lead';
    else if (totalScore >= 60) priority = 'Needs Human Review';
    else priority = 'Rejected';

    // Enforcement Policy: If there is no public contact method, it MUST NOT be Hot/Qualified.
    if (!hasPublicContact && (priority === 'Hot Lead' || priority === 'Qualified Lead' || priority === 'Needs Human Review')) {
      priority = 'Needs Contact Verification';
    }

    const breakdown: LeadScoreBreakdown = {
      websiteNeed,
      businessOwnerIntent,
      budgetClarity,
      urgency: urgencyScore,
      publicContact,
      targetCountryMatch,
      recentPostBonus,
      spamPenalty,
      agencyPenalty,
      recruiterPenalty,
      duplicatePenalty,
      totalScore,
    };

    return { score: totalScore, priority, breakdown };
  }
}
