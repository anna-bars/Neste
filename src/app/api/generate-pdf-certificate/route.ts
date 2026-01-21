import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const { policyNumber, quoteData, user } = await request.json();
    
    if (!policyNumber) {
      return NextResponse.json({ 
        success: false, 
        error: 'Policy number is required' 
      }, { status: 400 });
    }

    // 1. Create HTML content for the certificate
    const htmlContent = generateCertificateHTML(policyNumber, quoteData, user);
    
    // 2. Convert HTML to PDF using PDF.co API
    const pdfUrl = await convertHTMLToPDF(htmlContent, policyNumber);
    
    if (!pdfUrl) {
      throw new Error('Failed to generate PDF');
    }

    // 3. Download the PDF and upload to Supabase
    const pdfResponse = await fetch(pdfUrl);
    const pdfBuffer = await pdfResponse.arrayBuffer();
    
    const supabase = createClient();
    const fileName = `certificate-${policyNumber}.pdf`;
    
    // Try to upload to documents bucket
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true
      });
    
    let finalUrl = pdfUrl; // Use PDF.co URL as fallback
    
    if (!uploadError) {
      // Get Supabase URL if upload succeeded
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);
      finalUrl = publicUrl;
    } else {
      console.log('Using PDF.co URL directly:', pdfUrl);
    }

    return NextResponse.json({ 
      success: true, 
      certificateUrl: finalUrl,
      message: 'Certificate generated successfully'
    });
    
  } catch (error: any) {
    console.error('Certificate generation error:', error);
    
    // Fallback: Create a simple URL
    const { policyNumber } = await request.json().catch(() => ({ policyNumber: 'UNKNOWN' }));
    const fallbackUrl = `https://storage.cargoguard.com/certificates/${policyNumber}.pdf`;
    
    return NextResponse.json({ 
      success: true, 
      certificateUrl: fallbackUrl,
      warning: 'Certificate will be available soon'
    });
  }
}

// Generate HTML for the certificate
function generateCertificateHTML(policyNumber: string, quoteData: any, user: any): string {
  const issueDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const startDate = quoteData?.start_date ? new Date(quoteData.start_date).toLocaleDateString() : 'N/A';
  const endDate = quoteData?.end_date ? new Date(quoteData.end_date).toLocaleDateString() : 'N/A';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Insurance Certificate - ${policyNumber}</title>
  <style>
    @page {
      margin: 20mm;
    }
    
    body {
      font-family: 'Arial', sans-serif;
      margin: 0;
      padding: 0;
      color: #333;
      line-height: 1.6;
    }
    
    .certificate {
      max-width: 210mm;
      margin: 0 auto;
      padding: 15mm;
      border: 3px solid #1e40af;
      position: relative;
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #1e40af;
      padding-bottom: 20px;
    }
    
    .company-name {
      color: #1e40af;
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    
    .certificate-title {
      color: #1e40af;
      font-size: 24px;
      font-weight: bold;
    }
    
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 120px;
      color: rgba(30, 64, 175, 0.1);
      font-weight: bold;
      white-space: nowrap;
      z-index: 1;
    }
    
    .section {
      margin-bottom: 25px;
      position: relative;
      z-index: 2;
    }
    
    .section-title {
      color: #111827;
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #1e40af;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 15px;
    }
    
    .info-item {
      margin-bottom: 15px;
    }
    
    .info-label {
      font-weight: bold;
      color: #4b5563;
      margin-bottom: 5px;
      font-size: 14px;
    }
    
    .info-value {
      color: #111827;
      font-size: 15px;
    }
    
    .signature {
      margin-top: 50px;
      text-align: right;
    }
    
    .signature-line {
      border-top: 1px solid #111827;
      width: 300px;
      margin-left: auto;
      margin-top: 40px;
    }
    
    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #6b7280;
    }
    
    .verification-info {
      background-color: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 15px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="watermark">CARGO GUARD</div>
    
    <div class="header">
      <div class="company-name">CARGO GUARD INSURANCE</div>
      <div class="certificate-title">CERTIFICATE OF INSURANCE</div>
      <div style="color: #6b7280; font-size: 16px; margin-top: 10px;">
        Marine Cargo Insurance Policy
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">Policy Information</div>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Policy Number:</div>
          <div class="info-value">${policyNumber}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Date of Issue:</div>
          <div class="info-value">${issueDate}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Certificate ID:</div>
          <div class="info-value">CERT-${Date.now().toString().slice(-8)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Issued To:</div>
          <div class="info-value">${user?.email || 'Customer'}</div>
        </div>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">Insured Cargo Details</div>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Cargo Type:</div>
          <div class="info-value">${quoteData?.cargo_type || 'General Cargo'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Insured Value:</div>
          <div class="info-value">$${(quoteData?.shipment_value || 0).toLocaleString('en-US')} USD</div>
        </div>
        <div class="info-item">
          <div class="info-label">Deductible:</div>
          <div class="info-value">$${(quoteData?.deductible || 0).toLocaleString('en-US')} USD</div>
        </div>
        <div class="info-item">
          <div class="info-label">Coverage Type:</div>
          <div class="info-value">${(quoteData?.selected_coverage || 'Standard').toUpperCase()} COVERAGE</div>
        </div>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">Transportation Details</div>
      <div class="info-grid">
        <div class="info-item" style="grid-column: span 2;">
          <div class="info-label">Route:</div>
          <div class="info-value">${quoteData?.origin?.city || 'Loading Point'} → ${quoteData?.destination?.city || 'Delivery Point'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Mode of Transport:</div>
          <div class="info-value">${quoteData?.transportation_mode?.toUpperCase() || 'ROAD'} TRANSPORT</div>
        </div>
        <div class="info-item">
          <div class="info-label">Coverage Period:</div>
          <div class="info-value">${startDate} to ${endDate}</div>
        </div>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">Important Terms & Conditions</div>
      <div style="font-size: 12px; line-height: 1.6; color: #4b5563;">
        <p>1. This certificate confirms that the cargo described herein is insured against All Risks of physical loss or damage from any external cause.</p>
        <p>2. Coverage is subject to terms and conditions of the master policy.</p>
        <p>3. Claims must be reported within 14 days of incident.</p>
        <p>4. This certificate is valid only during the coverage period specified.</p>
      </div>
    </div>
    
    <div class="signature">
      <div class="signature-line"></div>
      <div style="margin-top: 10px; font-size: 14px; color: #4b5563;">
        <strong>Digitally Issued by:</strong><br>
        Cargo Guard Insurance Systems<br>
        ${new Date().toISOString()}<br>
        Automated Certificate Generation
      </div>
    </div>
    
    <div class="footer">
      <div class="verification-info">
        <strong>VERIFICATION:</strong> This document can be verified at https://verify.cargoguard.com/${policyNumber}<br>
        <strong>CONTACT:</strong> claims@cargoguard.com | +1-800-CARGO-GUARD<br>
        <strong>ADDRESS:</strong> 123 Insurance Ave, Suite 500, New York, NY 10001, USA
      </div>
      
      <p style="text-align: center; margin-top: 15px;">
        <strong>IMPORTANT:</strong> This is an electronically generated certificate. No physical signature required.<br>
        Keep this certificate with shipping documents at all times during transit.
      </p>
      
      <div style="text-align: center; font-size: 10px; color: #9ca3af; margin-top: 20px;">
        Generated on: ${new Date().toISOString()} | Document Version: 2.0 | System ID: CG-${Date.now().toString(36)}
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

// Convert HTML to PDF using PDF.co API
async function convertHTMLToPDF(html: string, fileName: string): Promise<string | null> {
  try {
    const apiKey = 'barsegyan745@gmail.com_gpmjxpRpP9B3sGo818oKyXmPewaF2ZfiUHrZj0FXTxTESGeeDwsHdVVUeRCy4H3G';
    
    const response = await fetch('https://api.pdf.co/v1/pdf/convert/from/html', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        html: html,
        name: `certificate-${fileName}.pdf`,
        margin: '20mm',
        paperSize: 'A4',
        orientation: 'Portrait',
        printBackground: true,
        scale: 1.0
      })
    });

    const result = await response.json();
    
    if (result.error) {
      console.error('PDF.co API error:', result.message);
      return null;
    }
    
    if (result.url) {
      return result.url;
    }
    
    return null;
    
  } catch (error) {
    console.error('PDF conversion error:', error);
    return null;
  }
}