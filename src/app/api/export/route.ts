import { NextRequest, NextResponse } from 'next/server';
import { LeadStore } from '@/lib/db/store';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const country = searchParams.get('country') || 'All';

    const store = LeadStore.getInstance();
    let leads = store.getAllLeads();

    if (country !== 'All') {
      leads = leads.filter((l) => l.country === country);
    }

    // Filter to qualified leads only (Contact Today & Contact This Week)
    const qualifiedLeads = leads.filter((l) => l.priority === 'Contact Today' || l.priority === 'Contact This Week');

    if (format === 'json') {
      return new NextResponse(JSON.stringify(qualifiedLeads, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="LeadHunter_Leads_${Date.now()}.json"`,
        },
      });
    }

    if (format === 'csv') {
      const headers = [
        'ID',
        'Lead Name',
        'Company Name',
        'Business Type',
        'Industry',
        'Country',
        'City',
        'Need Category',
        'Need Summary',
        'Estimated Budget',
        'Priority',
        'Lead Score',
        'Public Email',
        'Public Phone',
        'Platform',
        'Source URL',
        'Has Website',
        'AI Reasoning',
        'Date Discovered',
      ];

      const rows = qualifiedLeads.map((l) => [
        `"${l.id}"`,
        `"${l.leadName.replace(/"/g, '""')}"`,
        `"${l.companyName.replace(/"/g, '""')}"`,
        `"${l.businessType.replace(/"/g, '""')}"`,
        `"${l.industry}"`,
        `"${l.country}"`,
        `"${l.city}"`,
        `"${l.intentCategory}"`,
        `"${l.needSummary.replace(/"/g, '""')}"`,
        `"${l.estimatedBudget}"`,
        `"${l.priority}"`,
        l.qualityScore?.totalScore || 0,
        `"${l.publicEmail || ''}"`,
        `"${l.publicPhone || ''}"`,
        `"${l.platform}"`,
        `"${l.sourceUrl}"`,
        l.websiteAnalysis?.hasWebsite ? 'Yes' : 'No',
        `"${(l.internalWorkspace?.aiReasoning || '').replace(/"/g, '""')}"`,
        `"${l.createdAt}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="LeadHunter_Leads_${Date.now()}.csv"`,
        },
      });
    }

    // Default JSON fallback
    return NextResponse.json({ success: true, count: qualifiedLeads.length, data: qualifiedLeads });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
