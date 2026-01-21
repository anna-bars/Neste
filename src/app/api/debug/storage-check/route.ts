import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 1. Check if we can connect to Supabase
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    
    // 2. Check storage buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    // 3. Try to list files in documents bucket
    const { data: files, error: filesError } = await supabase.storage
      .from('documents')
      .list('', { limit: 10 });
    
    return NextResponse.json({
      success: true,
      session: session ? 'Connected' : 'No session',
      buckets: buckets?.map(b => ({ name: b.name, public: b.public })) || [],
      bucketCount: buckets?.length || 0,
      files: files?.length || 0,
      hasDocumentsBucket: buckets?.some(b => b.name === 'documents'),
      errors: {
        session: sessionError?.message,
        buckets: bucketsError?.message,
        files: filesError?.message
      }
    });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}