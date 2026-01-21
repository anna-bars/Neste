import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  console.log('Certificate generation endpoint called');
  
  try {
    const body = await request.json();
    console.log('Request body received:', { 
      hasPolicyId: !!body.policyId,
      hasPolicyNumber: !!body.policyNumber,
      policyId: body.policyId,
      policyNumber: body.policyNumber
    });
    
    const { policyId, policyNumber, quoteData, user } = body;
    
    if (!policyId || !policyNumber) {
      console.error('Missing required fields:', { policyId, policyNumber });
      return NextResponse.json({ 
        success: false, 
        error: 'Policy ID and Policy Number are required' 
      }, { status: 400 });
    }
    
    const supabase = await createClient();
    console.log('Supabase client created');
    
    // Check bucket access first
    console.log('Checking bucket access...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Bucket list error:', bucketsError);
      return NextResponse.json({ 
        success: false, 
        error: `Storage error: ${bucketsError.message}` 
      }, { status: 500 });
    }
    
    console.log('Available buckets:', buckets?.map(b => b.name));
    
    if (!buckets?.some(b => b.name === 'documents')) {
      console.error('Documents bucket not found');
      return NextResponse.json({ 
        success: false, 
        error: 'Documents bucket not found in storage' 
      }, { status: 500 });
    }
    
    // 1. Try to import PDFKit
    console.log('Importing PDFKit...');
    let PDFDocument;
    try {
      PDFDocument = require('pdfkit');
      console.log('PDFKit imported successfully');
    } catch (importError: any) {
      console.error('PDFKit import error:', importError);
      return NextResponse.json({ 
        success: false, 
        error: `PDFKit import failed: ${importError.message}` 
      }, { status: 500 });
    }
    
    // 2. Generate PDF
    console.log('Generating PDF...');
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50
        });
        
        const buffers: Buffer[] = [];
        doc.on('data', (chunk: Buffer) => buffers.push(chunk));
        doc.on('end', () => {
          const buffer = Buffer.concat(buffers);
          console.log(`PDF generated, size: ${buffer.length} bytes`);
          resolve(buffer);
        });
        doc.on('error', (error: any) => {
          console.error('PDF generation error:', error);
          reject(error);
        });
        
        // Add simple content
        doc.fontSize(25).text('Insurance Certificate', 100, 100);
        doc.fontSize(15).text(`Policy Number: ${policyNumber}`, 100, 150);
        doc.fontSize(15).text(`Date: ${new Date().toLocaleDateString()}`, 100, 180);
        doc.fontSize(12).text(`Generated for: ${user?.email || 'Customer'}`, 100, 210);
        
        doc.end();
        
      } catch (pdfError: any) {
        console.error('PDF creation error:', pdfError);
        reject(pdfError);
      }
    });
    
    // 3. Upload to storage
    console.log('Uploading to storage...');
    const timestamp = Date.now();
    const fileName = `certificate-${policyNumber}-${timestamp}.pdf`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        cacheControl: '3600'
      });
    
    if (uploadError) {
      console.error('Upload error:', uploadError);
      
      // Try with a simpler filename
      const simpleName = `certificate-${policyNumber}.pdf`;
      console.log('Trying with simple name:', simpleName);
      
      const { data: retryData, error: retryError } = await supabase.storage
        .from('documents')
        .upload(simpleName, pdfBuffer, {
          contentType: 'application/pdf',
          cacheControl: '3600',
          upsert: true
        });
      
      if (retryError) {
        console.error('Retry upload error:', retryError);
        return NextResponse.json({ 
          success: false, 
          error: `Upload failed: ${retryError.message}` 
        }, { status: 500 });
      }
      
      // Get URL for simple name
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(simpleName);
      
      console.log('Upload successful (retry):', publicUrl);
      
      // Update policy
      if (policyId) {
        await supabase
          .from('policies')
          .update({ 
            insurance_certificate_url: publicUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', policyId);
      }
      
      return NextResponse.json({ 
        success: true, 
        certificateUrl: publicUrl,
        message: 'Certificate generated successfully'
      });
    }
    
    // 4. Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);
    
    console.log('Upload successful:', publicUrl);
    
    // 5. Update policy
    if (policyId) {
      console.log('Updating policy with certificate URL...');
      const { error: updateError } = await supabase
        .from('policies')
        .update({ 
          insurance_certificate_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', policyId);
      
      if (updateError) {
        console.error('Policy update error:', updateError);
        // Continue anyway
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      certificateUrl: publicUrl,
      message: 'Certificate generated successfully'
    });
    
  } catch (error: any) {
    console.error('Certificate generation endpoint error:', error);
    console.error('Stack trace:', error.stack);
    
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Internal server error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}