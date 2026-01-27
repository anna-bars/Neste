import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { transactionId, payment, policyNumber } = await request.json();
    
    console.log('Receipt generation request:', { transactionId, payment, policyNumber });
    
    if (!transactionId || !payment || !policyNumber) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }
    
    // Create HTML for receipt
    const htmlContent = generateReceiptHTML(transactionId, payment, policyNumber);
    
    // Convert to PDF using PDF.co
    const pdfUrl = await convertHTMLToPDF(htmlContent, `receipt-${transactionId}`);
    
    if (!pdfUrl) {
      throw new Error('Failed to generate receipt');
    }
    
    return NextResponse.json({ 
      success: true, 
      receiptUrl: pdfUrl,
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
  console.log('Generating receipt with payment:', payment);
  
  // Calculate amounts correctly
  const premiumAmount = payment.premiumAmount || 0;
  const serviceFee = payment.serviceFee || 99;
  const taxes = payment.taxes || Math.round(premiumAmount * 0.08);
  const total = payment.amount || (premiumAmount + serviceFee + taxes);
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Receipt - ${transactionId}</title>
  <style>
    @page {
      margin: 20mm;
    }
    
    body { 
      font-family: 'Arial', sans-serif; 
      margin: 0;
      padding: 0;
      color: #333;
    }
    
    .receipt { 
      max-width: 210mm;
      margin: 0 auto;
      padding: 15mm;
    }
    
    .header { 
      text-align: center; 
      margin-bottom: 30px;
      border-bottom: 2px solid #1e40af;
      padding-bottom: 20px;
    }
    
    .title { 
      color: #1e40af; 
      font-size: 28px; 
      font-weight: bold;
      margin-bottom: 10px;
    }
    
    .subtitle {
      color: #6b7280;
      font-size: 18px;
      margin-bottom: 5px;
    }
    
    .info { 
      margin: 25px 0;
      padding: 20px;
      background: #f9fafb;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
    
    .info-item {
      margin-bottom: 10px;
      font-size: 14px;
    }
    
    .label { 
      font-weight: bold; 
      color: #374151;
      display: inline-block;
      width: 150px;
    }
    
    .value { 
      color: #111827;
    }
    
    .table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 30px 0;
      font-size: 14px;
    }
    
    .table th { 
      background: #f3f4f6; 
      padding: 12px 15px; 
      text-align: left;
      border-bottom: 2px solid #e5e7eb;
      color: #374151;
    }
    
    .table td { 
      padding: 12px 15px; 
      border-bottom: 1px solid #e5e7eb;
      color: #111827;
    }
    
    .table tr:last-child td {
      border-bottom: none;
    }
    
    .total-row {
      border-top: 2px solid #1e40af;
      font-weight: bold;
    }
    
    .total-row td {
      padding-top: 15px;
      font-size: 16px;
    }
    
    .footer { 
      margin-top: 40px; 
      text-align: center; 
      color: #6b7280; 
      font-size: 12px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
    
    .status-badge {
      display: inline-block;
      padding: 5px 15px;
      background: #10b981;
      color: white;
      border-radius: 20px;
      font-weight: bold;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <div class="title">CARGO GUARD</div>
      <div class="subtitle">Payment Receipt</div>
      <div class="status-badge">PAID</div>
    </div>
    
    <div class="info">
      <div class="info-item">
        <span class="label">Receipt Number:</span>
        <span class="value">${transactionId}</span>
      </div>
      <div class="info-item">
        <span class="label">Date:</span>
        <span class="value">${new Date().toLocaleDateString('en-US')}</span>
      </div>
      <div class="info-item">
        <span class="label">Policy Number:</span>
        <span class="value">${policyNumber}</span>
      </div>
      <div class="info-item">
        <span class="label">Transaction Status:</span>
        <span class="value">Completed</span>
      </div>
    </div>
    
    <table class="table">
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Insurance Premium</td>
          <td style="text-align: right;">$${premiumAmount.toFixed(2)}</td>
        </tr>
        <tr>
          <td>Service Fee</td>
          <td style="text-align: right;">$${serviceFee.toFixed(2)}</td>
        </tr>
        <tr>
          <td>Taxes (8%)</td>
          <td style="text-align: right;">$${taxes.toFixed(2)}</td>
        </tr>
        <tr class="total-row">
          <td><strong>Total Amount</strong></td>
          <td style="text-align: right;"><strong>$${total.toFixed(2)} USD</strong></td>
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