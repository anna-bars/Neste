import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const policyId = formData.get('policyId') as string;
    const documentType = formData.get('type') as string;
    
    if (!file || !policyId || !documentType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }
    
    const supabase = createClient();
    
    // Get policy number for folder structure
    const { data: policy } = await (await supabase)
      .from('policies')
      .select('policy_number')
      .eq('id', policyId)
      .single();
    
    if (!policy) {
      return NextResponse.json({ error: 'Policy not found' }, { status: 404 });
    }
    
    // Upload file
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `${policy.policy_number}/${documentType}/${fileName}`;
    
    const { data: uploadData, error: uploadError } = await (await supabase).storage
      .from('shipment-documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }
    
    // Get public URL
    const { data: { publicUrl } } = (await supabase).storage
      .from('shipment-documents')
      .getPublicUrl(filePath);
    
    // Update database
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (documentType === 'commercial_invoice') {
      updateData.commercial_invoice_url = publicUrl;
      updateData.commercial_invoice_status = 'uploaded';
    } else if (documentType === 'packing_list') {
      updateData.packing_list_url = publicUrl;
      updateData.packing_list_status = 'uploaded';
    } else if (documentType === 'bill_of_lading') {
      updateData.bill_of_lading_url = publicUrl;
      updateData.bill_of_lading_status = 'uploaded';
    }
    
    const { data: updatedDocs, error: updateError } = await (await supabase)
      .from('documents')
      .update(updateData)
      .eq('policy_id', policyId)
      .select()
      .single();
    
    if (updateError) {
      // Try to create record if it doesn't exist
      const { data: newDocs, error: createError } = await (await supabase)
        .from('documents')
        .insert([{
          policy_id: policyId,
          ...updateData
        }])
        .select()
        .single();
      
      if (createError) {
        return NextResponse.json({ error: 'Failed to update database' }, { status: 500 });
      }
      
      return NextResponse.json({ 
        success: true, 
        document: newDocs,
        url: publicUrl 
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      document: updatedDocs,
      url: publicUrl 
    });
    
  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const supabase = createClient();
  
  const { searchParams } = new URL(request.url);
  const policyId = searchParams.get('policyId');
  
  if (!policyId) {
    return NextResponse.json({ error: 'Policy ID required' }, { status: 400 });
  }
  
  const { data, error } = await (await supabase)
    .from('documents')
    .select('*')
    .eq('policy_id', policyId)
    .maybeSingle();
  
  if (error) {
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
  
  return NextResponse.json({ documents: data || null });
}