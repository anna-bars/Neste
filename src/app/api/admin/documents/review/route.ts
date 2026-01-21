import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check if user is admin
    const { data: { user } } = await (await supabase).auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check user role (you need to have a user_roles table)
    const { data: userRole } = await (await supabase)
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    if (userRole?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const body = await request.json();
    const { 
      documentId, 
      documentType, 
      status, 
      rejectedReason,
      rejectedMessage 
    } = body;
    
    if (!documentId || !documentType || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (documentType === 'commercial_invoice') {
      updateData.commercial_invoice_status = status;
      if (status === 'rejected') {
        updateData.commercial_invoice_rejected_reason = rejectedReason;
        updateData.commercial_invoice_rejected_message = rejectedMessage;
      } else {
        updateData.commercial_invoice_rejected_reason = null;
        updateData.commercial_invoice_rejected_message = null;
      }
    } else if (documentType === 'packing_list') {
      updateData.packing_list_status = status;
      if (status === 'rejected') {
        updateData.packing_list_rejected_reason = rejectedReason;
        updateData.packing_list_rejected_message = rejectedMessage;
      } else {
        updateData.packing_list_rejected_reason = null;
        updateData.packing_list_rejected_message = null;
      }
    } else if (documentType === 'bill_of_lading') {
      updateData.bill_of_lading_status = status;
      if (status === 'rejected') {
        updateData.bill_of_lading_rejected_reason = rejectedReason;
        updateData.bill_of_lading_rejected_message = rejectedMessage;
      } else {
        updateData.bill_of_lading_rejected_reason = null;
        updateData.bill_of_lading_rejected_message = null;
      }
    }
    
    const { data, error } = await (await supabase)
      .from('documents')
      .update(updateData)
      .eq('id', documentId)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      document: data 
    });
    
  } catch (error) {
    console.error('Document review error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}