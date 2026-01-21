import { createClient } from '@/lib/supabase/server';

export async function ensureStorageBuckets() {
  try {
    const supabase = await createClient();
    
    const buckets = ['documents', 'shipment-documents'];
    
    for (const bucketName of buckets) {
      const { data: existingBuckets } = await supabase.storage.listBuckets();
      const bucketExists = existingBuckets?.some(b => b.name === bucketName);
      
      if (!bucketExists) {
        console.log(`Creating bucket: ${bucketName}`);
        await supabase.storage.createBucket(bucketName, {
          public: true,
          allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/*'],
          fileSizeLimit: 52428800 // 50MB
        });
      }
    }
    
    console.log('Storage buckets are ready');
    return true;
  } catch (error) {
    console.error('Error setting up storage buckets:', error);
    return false;
  }
}