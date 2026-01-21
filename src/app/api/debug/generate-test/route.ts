import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 1. First, just try to create a simple PDF without storage
    const PDFDocument = require('pdfkit');
    
    return new Promise((resolve) => {
      const doc = new PDFDocument();
      const buffers: Buffer[] = [];
      
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', async () => {
        try {
          const pdfBuffer = Buffer.concat(buffers);
          
          // 2. Try to upload to storage
          const testFileName = `test-${Date.now()}.pdf`;
          
          const { data, error } = await supabase.storage
            .from('documents')
            .upload(testFileName, pdfBuffer, {
              contentType: 'application/pdf',
              cacheControl: '3600'
            });
          
          if (error) {
            console.error('Test upload error:', error);
            resolve(NextResponse.json({
              success: false,
              error: error.message,
              step: 'upload'
            }, { status: 500 }));
            return;
          }
          
          // 3. Get URL
          const { data: { publicUrl } } = supabase.storage
            .from('documents')
            .getPublicUrl(testFileName);
          
          resolve(NextResponse.json({
            success: true,
            url: publicUrl,
            message: 'Test PDF generated and uploaded successfully'
          }));
          
        } catch (innerError: any) {
          console.error('Inner error:', innerError);
          resolve(NextResponse.json({
            success: false,
            error: innerError.message,
            step: 'inner_catch'
          }, { status: 500 }));
        }
      });
      
      // Add some content to PDF
      doc.fontSize(25).text('Test PDF Document', 100, 100);
      doc.fontSize(15).text(`Generated at: ${new Date().toISOString()}`, 100, 150);
      doc.end();
      
    });
    
  } catch (error: any) {
    console.error('Outer catch error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      step: 'outer_catch',
      stack: error.stack
    }, { status: 500 });
  }
}