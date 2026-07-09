import { NextResponse, NextRequest } from 'next/server';
import { LeadStore } from '@/lib/db/store';

export async function GET(request: NextRequest) {
  const store = LeadStore.getInstance();
  const companies = store.getAllCompanies();
  
  // Attach latest lead to each company for preview
  const enriched = companies.map(comp => {
     const leads = comp.leadIds.map((id: string) => store.getLeadById(id)).filter(Boolean);
     return {
        ...comp,
        leads
     };
  });
  
  return NextResponse.json({ companies: enriched });
}
