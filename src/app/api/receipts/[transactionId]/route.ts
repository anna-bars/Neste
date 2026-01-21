import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateReceiptPDF } from '@/lib/pdf/generator';

export async function GET(
  request: NextRequest,
  { params }: { params: { transactionId: string } }
) {
  try {
    const transactionId = params.transactionId;
    
    if (!transactionId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Transaction ID is required' 
      }, { status: 400 });
    }
    
    const supabase = await createClient();
    
    // 1. Get payment data with related info
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select(`
        *,
        quotes!payments_quote_id_fkey (
          quote_number,
          shipment_value,
          cargo_type,
          origin,
          destination
        ),
        policies!payments_policy_id_fkey (
          policy_number,
          coverage_amount,
          cargo_type,
          origin,
          destination
        )
      `)
      .eq('transaction_id', transactionId)
      .single();
    
    if (paymentError || !payment) {
      console.error('Payment fetch error:', paymentError);
      return NextResponse.json({ 
        success: false, 
        error: 'Payment not found' 
      }, { status: 404 });
    }
    
    // 2. Check if receipt already exists
    const receiptFileName = `receipt-${transactionId}.pdf`;
    
    // Try to list existing files
    const { data: files } = await supabase.storage
      .from('documents')
      .list('', {
        search: receiptFileName
      });
    
    if (files && files.length > 0) {
      // Receipt already exists, return the URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(receiptFileName);
      
      return NextResponse.json({ 
        success: true, 
        receiptUrl: publicUrl,
        alreadyExists: true
      });
    }
    
    // 3. Generate receipt PDF
    const pdfBuffer = await generateReceiptPDF(payment, transactionId);
    
    // 4. Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(receiptFileName, pdfBuffer, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      console.error('Receipt upload error:', uploadError);
      throw new Error(`Failed to upload receipt: ${uploadError.message}`);
    }
    
    // 5. Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(receiptFileName);
    
    console.log('Receipt generated and uploaded:', publicUrl);
    
    // 6. Update payment with receipt URL if needed
    if (!payment.receipt_url) {
      await supabase
        .from('payments')
        .update({ 
          receipt_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('transaction_id', transactionId);
    }
    
    // 7. Update policy with receipt URL if it exists
    if (payment.policies && payment.policies.length > 0) {
      await supabase
        .from('policies')
        .update({ 
          receipt_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.policies[0].id);
    }
    
    return NextResponse.json({ 
      success: true, 
      receiptUrl: publicUrl,
      message: 'Receipt generated successfully'
    });
    
  } catch (error: any) {
    console.error('Receipt generation error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to generate receipt'
    }, { status: 500 });
  }
}