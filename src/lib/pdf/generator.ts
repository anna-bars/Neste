import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export async function generateCertificatePDF(
  policyNumber: string,
  quoteData: any,
  user: any
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `Insurance Certificate - ${policyNumber}`,
          Author: 'Cargo Guard Insurance',
          Subject: 'Marine Cargo Insurance Certificate',
          Keywords: 'insurance, cargo, certificate, marine',
          CreationDate: new Date()
        }
      });

      const buffers: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Add watermark
      doc.opacity(0.05);
      doc.fillColor('blue');
      doc.fontSize(120);
      doc.text('CARGO GUARD', -200, 300, {
        align: 'center',
        angle: 45
      });
      doc.opacity(1);
      doc.fillColor('black');

      // Header
      doc.fillColor('#1e40af')
         .fontSize(28)
         .font('Helvetica-Bold')
         .text('CARGO GUARD INSURANCE', {
           align: 'center',
           continued: false
         })
         .moveDown(0.5);

      doc.fillColor('#4b5563')
         .fontSize(14)
         .font('Helvetica')
         .text('Global Cargo Insurance Solutions', {
           align: 'center'
         })
         .moveDown(1);

      doc.fillColor('#1e40af')
         .fontSize(22)
         .font('Helvetica-Bold')
         .text('CERTIFICATE OF INSURANCE', {
           align: 'center'
         })
         .moveDown(0.3);

      doc.fillColor('#6b7280')
         .fontSize(14)
         .text('Marine Cargo Insurance Policy', {
           align: 'center'
         })
         .moveDown(2);

      // Policy Information Section
      doc.fillColor('#111827')
         .fontSize(16)
         .font('Helvetica-Bold')
         .text('Policy Information')
         .moveDown(0.5);

      doc.fillColor('#4b5563')
         .fontSize(11)
         .font('Helvetica-Bold')
         .text('Policy Number:', 50, doc.y, { continued: false })
         .fillColor('#111827')
         .font('Helvetica')
         .text(policyNumber, 180, doc.y)
         .moveDown(0.7);

      doc.fillColor('#4b5563')
         .font('Helvetica-Bold')
         .text('Date of Issue:', 50, doc.y, { continued: false })
         .fillColor('#111827')
         .font('Helvetica')
         .text(new Date().toLocaleDateString('en-US', { 
           year: 'numeric', 
           month: 'long', 
           day: 'numeric' 
         }), 180, doc.y)
         .moveDown(0.7);

      doc.fillColor('#4b5563')
         .font('Helvetica-Bold')
         .text('Certificate ID:', 50, doc.y, { continued: false })
         .fillColor('#111827')
         .font('Helvetica')
         .text(`CERT-${Date.now().toString().slice(-8)}`, 180, doc.y)
         .moveDown(0.7);

      doc.fillColor('#4b5563')
         .font('Helvetica-Bold')
         .text('Issued To:', 50, doc.y, { continued: false })
         .fillColor('#111827')
         .font('Helvetica')
         .text(user?.email || 'Customer', 180, doc.y)
         .moveDown(2);

      // Insured Cargo Details
      doc.fillColor('#111827')
         .fontSize(16)
         .font('Helvetica-Bold')
         .text('Insured Cargo Details')
         .moveDown(0.5);

      doc.fillColor('#4b5563')
         .fontSize(11)
         .font('Helvetica-Bold')
         .text('Cargo Type:', 50, doc.y, { continued: false })
         .fillColor('#111827')
         .font('Helvetica')
         .text(quoteData?.cargo_type || 'General Cargo', 180, doc.y)
         .moveDown(0.7);

      const shipmentValue = quoteData?.shipment_value || 0;
      doc.fillColor('#4b5563')
         .font('Helvetica-Bold')
         .text('Insured Value:', 50, doc.y, { continued: false })
         .fillColor('#111827')
         .font('Helvetica')
         .text(`$${shipmentValue.toLocaleString('en-US')} USD`, 180, doc.y)
         .moveDown(0.7);

      const deductible = quoteData?.deductible || 0;
      doc.fillColor('#4b5563')
         .font('Helvetica-Bold')
         .text('Deductible:', 50, doc.y, { continued: false })
         .fillColor('#111827')
         .font('Helvetica')
         .text(`$${deductible.toLocaleString('en-US')} USD`, 180, doc.y)
         .moveDown(0.7);

      const coverageType = quoteData?.selected_coverage || 'Standard';
      doc.fillColor('#4b5563')
         .font('Helvetica-Bold')
         .text('Coverage Type:', 50, doc.y, { continued: false })
         .fillColor('#111827')
         .font('Helvetica')
         .text(`${coverageType.toUpperCase()} COVERAGE`, 180, doc.y)
         .moveDown(2);

      // Transportation Details
      doc.fillColor('#111827')
         .fontSize(16)
         .font('Helvetica-Bold')
         .text('Transportation Details')
         .moveDown(0.5);

      const origin = quoteData?.origin?.city || 'Loading Point';
      const destination = quoteData?.destination?.city || 'Delivery Point';
      doc.fillColor('#4b5563')
         .fontSize(11)
         .font('Helvetica-Bold')
         .text('Route:', 50, doc.y, { continued: false })
         .fillColor('#111827')
         .font('Helvetica')
         .text(`${origin} → ${destination}`, 180, doc.y)
         .moveDown(0.7);

      const transportMode = quoteData?.transportation_mode || 'Road';
      doc.fillColor('#4b5563')
         .font('Helvetica-Bold')
         .text('Mode of Transport:', 50, doc.y, { continued: false })
         .fillColor('#111827')
         .font('Helvetica')
         .text(`${transportMode.toUpperCase()} TRANSPORT`, 180, doc.y)
         .moveDown(0.7);

      const startDate = new Date(quoteData?.start_date || new Date());
      const endDate = new Date(quoteData?.end_date || new Date());
      doc.fillColor('#4b5563')
         .font('Helvetica-Bold')
         .text('Coverage Period:', 50, doc.y, { continued: false })
         .fillColor('#111827')
         .font('Helvetica')
         .text(`${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`, 180, doc.y)
         .moveDown(3);

      // Terms Section
      doc.fillColor('#111827')
         .fontSize(16)
         .font('Helvetica-Bold')
         .text('Important Terms & Conditions')
         .moveDown(0.5);

      doc.fillColor('#4b5563')
         .fontSize(10)
         .font('Helvetica')
         .text('1. COVERAGE: This certificate confirms that the cargo described herein is insured against All Risks of physical loss or damage from any external cause.', {
           align: 'justify'
         })
         .moveDown(0.5);

      doc.text('2. CLAIMS PROCEDURE: In the event of loss or damage, the insured must notify the carrier immediately in writing and submit claim within 14 days of delivery.', {
           align: 'justify'
         })
         .moveDown(0.5);

      doc.text('3. EXCLUSIONS: War risks, nuclear risks, inherent vice, improper packing, delay, and consequential losses are excluded unless specifically endorsed.', {
           align: 'justify'
         })
         .moveDown(0.5);

      doc.text('4. TERRITORY: Coverage is worldwide unless otherwise specified.', {
           align: 'justify'
         })
         .moveDown(0.5);

      doc.text('5. LEGAL JURISDICTION: All disputes shall be subject to the laws of the State of New York, USA.', {
           align: 'justify'
         })
         .moveDown(2);

      // Footer with signature
      const signatureY = doc.page.height - 150;
      doc.moveTo(400, signatureY)
         .lineTo(550, signatureY)
         .stroke();

      doc.fillColor('#4b5563')
         .fontSize(9)
         .text('Digitally Issued by:', 400, signatureY + 5, {
           align: 'center',
           width: 150
         });

      doc.fillColor('#111827')
         .fontSize(10)
         .font('Helvetica-Bold')
         .text('Cargo Guard Insurance Systems', 400, signatureY + 20, {
           align: 'center',
           width: 150
         });

      doc.fillColor('#4b5563')
         .fontSize(8)
         .text(new Date().toISOString(), 400, signatureY + 35, {
           align: 'center',
           width: 150
         });

      // Verification info at bottom
      doc.fillColor('#6b7280')
         .fontSize(9)
         .text('VERIFICATION: This document can be verified at https://verify.cargoguard.com/', 50, doc.page.height - 70, {
           align: 'center',
           width: 500
         });

      doc.text('CONTACT: claims@cargoguard.com | +1-800-CARGO-GUARD', 50, doc.page.height - 55, {
        align: 'center',
        width: 500
      });

      doc.fillColor('#9ca3af')
         .fontSize(8)
         .text('IMPORTANT: This is an electronically generated certificate. No physical signature required.', 50, doc.page.height - 40, {
           align: 'center',
           width: 500
         });

      doc.text(`Generated on: ${new Date().toISOString()} | Document Version: 2.0 | System ID: CG-${Date.now().toString(36)}`, 
               50, doc.page.height - 25, {
                 align: 'center',
                 width: 500
               });

      doc.end();

    } catch (error) {
      reject(error);
    }
  });
}

export async function generateReceiptPDF(
  payment: any,
  transactionId: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `Payment Receipt - ${transactionId}`,
          Author: 'Cargo Guard Insurance',
          Subject: 'Payment Receipt',
          Keywords: 'receipt, payment, invoice, cargo insurance',
          CreationDate: new Date()
        }
      });

      const buffers: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Header
      doc.fillColor('#1e40af')
         .fontSize(28)
         .font('Helvetica-Bold')
         .text('CARGO GUARD', 50, 50)
         .moveDown(0.5);

      doc.fillColor('#4b5563')
         .fontSize(18)
         .font('Helvetica')
         .text('PAYMENT RECEIPT')
         .moveDown(1);

      // Transaction Details
      doc.fillColor('#111827')
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('Transaction Details')
         .moveDown(0.5);

      doc.fillColor('#4b5563')
         .fontSize(11)
         .font('Helvetica-Bold')
         .text('Receipt Number:', 50, doc.y, { continued: false })
         .fillColor('#111827')
         .font('Helvetica')
         .text(transactionId, 180, doc.y)
         .moveDown(0.7);

      doc.fillColor('#4b5563')
         .font('Helvetica-Bold')
         .text('Date:', 50, doc.y, { continued: false })
         .fillColor('#111827')
         .font('Helvetica')
         .text(new Date(payment.created_at).toLocaleDateString('en-US', { 
           year: 'numeric', 
           month: 'long', 
           day: 'numeric',
           hour: '2-digit',
           minute: '2-digit'
         }), 180, doc.y)
         .moveDown(0.7);

      const paymentMethod = payment.payment_method === 'credit_card' ? 'Credit Card' : 
                           payment.payment_method === 'bank_transfer' ? 'Bank Transfer' : 'Other';
      doc.fillColor('#4b5563')
         .font('Helvetica-Bold')
         .text('Payment Method:', 50, doc.y, { continued: false })
         .fillColor('#111827')
         .font('Helvetica')
         .text(paymentMethod, 180, doc.y)
         .moveDown(0.7);

      if (payment.card_last_four) {
        doc.fillColor('#4b5563')
           .font('Helvetica-Bold')
           .text('Card Ending:', 50, doc.y, { continued: false })
           .fillColor('#111827')
           .font('Helvetica')
           .text(`**** ${payment.card_last_four}`, 180, doc.y)
           .moveDown(0.7);
      }

      if (payment.bank_name) {
        doc.fillColor('#4b5563')
           .font('Helvetica-Bold')
           .text('Bank:', 50, doc.y, { continued: false })
           .fillColor('#111827')
           .font('Helvetica')
           .text(payment.bank_name, 180, doc.y)
           .moveDown(0.7);
      }

      // Policy Information
      doc.moveDown(1);
      doc.fillColor('#111827')
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('Policy Information')
         .moveDown(0.5);

      if (payment.policy && payment.policy.length > 0) {
        const policy = payment.policy[0];
        doc.fillColor('#4b5563')
           .fontSize(11)
           .font('Helvetica-Bold')
           .text('Policy Number:', 50, doc.y, { continued: false })
           .fillColor('#111827')
           .font('Helvetica')
           .text(policy.policy_number, 180, doc.y)
           .moveDown(0.7);

        doc.fillColor('#4b5563')
           .font('Helvetica-Bold')
           .text('Coverage Amount:', 50, doc.y, { continued: false })
           .fillColor('#111827')
           .font('Helvetica')
           .text(`$${(policy.coverage_amount || 0).toLocaleString('en-US')} USD`, 180, doc.y)
           .moveDown(0.7);
      }

      if (payment.quote && payment.quote.length > 0) {
        const quote = payment.quote[0];
        doc.fillColor('#4b5563')
           .font('Helvetica-Bold')
           .text('Quote Number:', 50, doc.y, { continued: false })
           .fillColor('#111827')
           .font('Helvetica')
           .text(quote.quote_number, 180, doc.y)
           .moveDown(0.7);
      }

      // Payment Summary Table
      doc.moveDown(1);
      doc.fillColor('#111827')
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('Payment Summary')
         .moveDown(0.5);

      // Table headers
      const tableY = doc.y;
      doc.fillColor('#1e40af')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('Description', 50, tableY)
         .text('Amount', 400, tableY, { align: 'right' });

      // Table rows
      let currentY = tableY + 20;
      const amount = payment.amount || 0;
      const premium = amount * 0.8;
      const serviceFee = amount * 0.1;
      const taxes = amount * 0.1;

      doc.fillColor('#111827')
         .fontSize(12)
         .font('Helvetica')
         .text('Insurance Premium', 50, currentY)
         .text(`$${premium.toFixed(2)}`, 400, currentY, { align: 'right' });

      currentY += 20;
      doc.text('Service Fee', 50, currentY)
         .text(`$${serviceFee.toFixed(2)}`, 400, currentY, { align: 'right' });

      currentY += 20;
      doc.text('Taxes', 50, currentY)
         .text(`$${taxes.toFixed(2)}`, 400, currentY, { align: 'right' });

      currentY += 25;
      doc.font('Helvetica-Bold')
         .text('Total', 50, currentY)
         .text(`$${amount.toFixed(2)} USD`, 400, currentY, { align: 'right' });

      doc.y = currentY + 40;

      // Thank you message
      doc.fillColor('#4b5563')
         .fontSize(12)
         .font('Helvetica')
         .text('Thank you for your payment! Your insurance coverage is now active.', {
           align: 'center'
         })
         .moveDown(0.5);

      // Contact information
      doc.fillColor('#6b7280')
         .fontSize(10)
         .text('For any questions regarding this receipt, please contact:', {
           align: 'center'
         })
         .moveDown(0.2);

      doc.text('support@cargoguard.com | +1-800-CARGO-GUARD', {
        align: 'center'
      })
         .moveDown(1);

      // Terms
      doc.fillColor('#9ca3af')
         .fontSize(8)
         .text('This is an electronically generated receipt. No physical copy required.', {
           align: 'center'
         })
         .moveDown(0.2);

      doc.text(`Generated on: ${new Date().toISOString()}`, {
        align: 'center'
      });

      doc.end();

    } catch (error) {
      reject(error);
    }
  });
}