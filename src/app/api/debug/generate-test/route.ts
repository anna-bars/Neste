import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Readable } from 'stream';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Use dynamic import for pdfkit
    const PDFDocument = (await import('pdfkit')).default;
    
    // Create PDF
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];
    
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    
    // Create a promise to handle PDF generation
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      doc.on('error', reject);
      
      // Add content to PDF
      doc.fontSize(25).text('Test PDF Document', 100, 100);
      doc.fontSize(15).text(`Generated at: ${new Date().toISOString()}`, 100, 150);
      doc.end();
    });
    
    // Upload to storage
    const testFileName = `test-${Date.now()}.pdf`;
    
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(testFileName, pdfBuffer, {
        contentType: 'application/pdf',
        cacheControl: '3600'
      });
    
    if (error) {
      console.error('Test upload error:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        step: 'upload'
      }, { status: 500 });
    }
    
    // Get URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(testFileName);
    
    return NextResponse.json({
      success: true,
      url: publicUrl,
      message: 'Test PDF generated and uploaded successfully'
    });
    
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      step: 'catch',
      stack: error.stack
    }, { status: 500 });
  }
}