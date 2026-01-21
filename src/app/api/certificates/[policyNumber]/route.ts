import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { policyNumber: string } }
) {
  try {
    const { policyNumber } = params;
    
    const supabase = createClient();
    const { data: policy } = await supabase
      .from('policies')
      .select('*')
      .eq('policy_number', policyNumber)
      .single();
    
    if (!policy) {
      return new NextResponse('Policy not found', { status: 404 });
    }
    
    // Generate HTML preview of certificate
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Certificate Preview - ${policy.policy_number}</title>
        <style>
          body { font-family: Arial; margin: 40px; }
          h1 { color: #1e40af; }
          .certificate { border: 2px solid #1e40af; padding: 20px; max-width: 800px; }
          .info { margin: 10px 0; }
          .label { font-weight: bold; color: #555; }
          .watermark { opacity: 0.1; position: fixed; font-size: 80px; transform: rotate(-45deg); top: 200px; left: 50px; color: #1e40af; }
        </style>
      </head>
      <body>
        <div class="watermark">DRAFT</div>
        <div class="certificate">
          <h1>Insurance Certificate</h1>
          <div class="info"><span class="label">Policy:</span> ${policy.policy_number}</div>
          <div class="info"><span class="label">Cargo:</span> ${policy.cargo_type}</div>
          <div class="info"><span class="label">Coverage:</span> $${policy.coverage_amount}</div>
          <div class="info"><span class="label">Period:</span> ${policy.coverage_start} to ${policy.coverage_end}</div>
          <div class="info"><span class="label">Status:</span> ${policy.status}</div>
          <hr>
          <p><em>Final certificate will be available shortly. This is a temporary preview.</em></p>
          <button onclick="window.print()" style="padding: 10px 20px; background: #1e40af; color: white; border: none; cursor: pointer;">
            Print Preview
          </button>
        </div>
      </body>
      </html>
    `;
    
    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    });
    
  } catch (error) {
    return new NextResponse('Server error', { status: 500 });
  }
}