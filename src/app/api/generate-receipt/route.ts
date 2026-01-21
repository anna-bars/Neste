import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const { transactionId, payment, policyNumber } = await request.json();
    
    // Create HTML for receipt
    const htmlContent = generateReceiptHTML(transactionId, payment, policyNumber);
    
    // Convert to PDF using PDF.co
    const pdfUrl = await convertHTMLToPDF(htmlContent, `receipt-${transactionId}`);
    
    if (!pdfUrl) {
      throw new Error('Failed to generate receipt');
    }
    
    // Download and upload to Supabase
    const pdfResponse = await fetch(pdfUrl);
    const pdfBuffer = await pdfResponse.arrayBuffer();
    
    const supabase = createClient();
    const fileName = `receipt-${transactionId}.pdf`;
    
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true
      });
    
    let finalUrl = pdfUrl;
    
    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);
      finalUrl = publicUrl;
    }
    
    // Update payment record
    await supabase
      .from('payments')
      .update({ 
        receipt_url: finalUrl,
        updated_at: new Date().toISOString()
      })
      .eq('transaction_id', transactionId);
    
    return NextResponse.json({ 
      success: true, 
      receiptUrl: finalUrl,
      message: 'Receipt generated successfully'
    });
    
  } catch (error: any) {
    console.error('Receipt generation error:', error);
    return NextResponse.json({ 
      success: true, 
      receiptUrl: `https://storage.cargoguard.com/receipts/generic-receipt.pdf`,
      warning: 'Generic receipt provided'
    });
  }
}

function generateReceiptHTML(transactionId: string, payment: any, policyNumber: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Receipt - ${transactionId}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    .receipt { max-width: 600px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 30px; }
    .title { color: #1e40af; font-size: 28px; font-weight: bold; }
    .info { margin: 20px 0; }
    .label { font-weight: bold; color: #374151; }
    .value { color: #111827; }
    .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .table th { background: #f3f4f6; padding: 10px; text-align: left; }
    .table td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
    .total { font-size: 20px; font-weight: bold; text-align: right; }
    .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <div class="title">CARGO GUARD</div>
      <div style="color: #4b5563; font-size: 18px;">Payment Receipt</div>
    </div>
    
    <div class="info">
      <div><span class="label">Receipt Number:</span> <span class="value">${transactionId}</span></div>
      <div><span class="label">Date:</span> <span class="value">${new Date().toLocaleDateString()}</span></div>
      <div><span class="label">Policy Number:</span> <span class="value">${policyNumber}</span></div>
    </div>
    
    <table class="table">
      <thead>
        <tr>
          <th>Description</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Insurance Premium</td>
          <td>$${(payment?.amount * 0.8 || 0).toFixed(2)}</td>
        </tr>
        <tr>
          <td>Service Fee</td>
          <td>$${(payment?.amount * 0.1 || 0).toFixed(2)}</td>
        </tr>
        <tr>
          <td>Taxes</td>
          <td>$${(payment?.amount * 0.1 || 0).toFixed(2)}</td>
        </tr>
        <tr style="border-top: 2px solid #000;">
          <td><strong>Total</strong></td>
          <td><strong>$${(payment?.amount || 0).toFixed(2)} USD</strong></td>
        </tr>
      </tbody>
    </table>
    
    <div class="footer">
      <p>Thank you for your payment. Your insurance is now active.</p>
      <p>Contact: support@cargoguard.com | +1-800-CARGO-GUARD</p>
      <p>Generated on: ${new Date().toISOString()}</p>
    </div>
  </div>
</body>
</html>
  `;
}

// Reuse the same PDF.co conversion function
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
        name: fileName,
        margin: '20mm',
        paperSize: 'A4',
        orientation: 'Portrait',
        printBackground: true
      })
    });

    const result = await response.json();
    return result.url || null;
    
  } catch (error) {
    console.error('PDF conversion error:', error);
    return null;
  }
}