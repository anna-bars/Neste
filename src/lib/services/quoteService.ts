import { createClient } from '../supabase/client';
import { QuoteProcessor } from './quoteProcessor';

// ✅ Սանիտացնել filename-ը ASCII նիշերի համար
const sanitizeFileName = (fileName: string): string => {
  // Հեռացնել ոչ ASCII նիշերը
  let sanitized = fileName.replace(/[^\x00-\x7F]/g, '');
  
  // Հեռացնել հատուկ նիշերը
  sanitized = sanitized.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '_');
  
  // Հեռացնել բացատները և փոխարինել underscore-ով
  sanitized = sanitized.replace(/\s+/g, '_');
  
  // Եթե արդյունքում դատարկ է, օգտագործել default անուն
  if (!sanitized || sanitized.trim() === '') {
    return 'document_' + Date.now() + '.png';
  }
  
  return sanitized;
};

// ✅ Ստեղծել անվտանգ filename Supabase Storage-ի համար
const createSafeFileName = (quoteId: string, docType: string, originalFileName: string): string => {
  // Ստանալ file extension
  const fileExt = originalFileName.split('.').pop()?.toLowerCase() || 'png';
  
  // Սանիտացնել original filename-ը
  const sanitizedOriginal = sanitizeFileName(originalFileName.replace(`.${fileExt}`, ''));
  
  // Ստեղծել անվտանգ filename
  return `${quoteId}_${docType}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
};

export interface DocumentUpload {
  file: File;
  type: 'commercial_invoice' | 'packing_list' | 'bill_of_lading';
  name: string;
}

export interface QuoteSubmitData {
  quoteId: string;
  cargoType: string;
  shipmentValue: number;
  origin: any;
  destination: any;
  startDate: string;
  endDate: string;
  transportationMode: string;
  selectedCoverage: 'standard' | 'premium' | 'enterprise';
  premium: number;
  deductible: number;
  shipperName: string;
  referenceNumber?: string;
  documents?: DocumentUpload[];
}

export interface QuoteResult {
  success: boolean;
  quoteId?: string;
  message: string;
  data?: any;
  error?: string;
}

export const quoteService = {
  // Submit quote with documents
  async submitQuoteWithDocuments(data: QuoteSubmitData): Promise<QuoteResult> {
    const supabase = createClient();
    
    try {
      // Ստանում ենք current user-ին
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Upload documents if any
      let documentUrls: any[] = [];
      if (data.documents && data.documents.length > 0) {
        for (const doc of data.documents) {
          if (doc.file) {
            try {
              // ✅ Ստեղծել անվտանգ filename
              const safeFileName = createSafeFileName(data.quoteId, doc.type, doc.file.name);
              
              console.log('Uploading document:', {
                original: doc.file.name,
                safe: safeFileName,
                size: doc.file.size,
                type: doc.file.type
              });
              
              // Upload file to Supabase Storage
              const { data: uploadData, error: uploadError } = await supabase.storage
                .from('documents')
                .upload(safeFileName, doc.file, {
                  cacheControl: '3600',
                  upsert: false
                });
              
              if (uploadError) {
                console.error('Upload error details:', uploadError);
                throw uploadError;
              }
              
              // Ստանալ public URL
              const { data: urlData } = supabase.storage
                .from('documents')
                .getPublicUrl(safeFileName);
              
              if (!urlData || !urlData.publicUrl) {
                throw new Error('Failed to get public URL for uploaded file');
              }
              
              documentUrls.push({
                id: Math.random().toString(36).substring(7),
                name: doc.name,
                type: doc.type,
                file_url: urlData.publicUrl,
                file_name: safeFileName,
                file_size: doc.file.size,
                uploaded_at: new Date().toISOString(),
                original_name: doc.file.name // Պահպանել original անունը
              });
              
              console.log('Document uploaded successfully:', {
                name: doc.name,
                url: urlData.publicUrl,
                fileName: safeFileName
              });
              
            } catch (uploadError) {
              console.error(`Failed to upload document ${doc.name}:`, uploadError);
              // Շարունակել մյուս documents-ների upload-ը
              continue;
            }
          }
        }
      }
      
      // Ստեղծել quote expiration (72 ժամ)
      const quoteExpiresAt = new Date();
      quoteExpiresAt.setHours(quoteExpiresAt.getHours() + 72);
      
      // Ստեղծում ենք quote-ը նոր quotes աղյուսակում
      const quoteData = {
        quote_number: data.quoteId,
        user_id: user.id,
        cargo_type: data.cargoType,
        shipment_value: data.shipmentValue,
        origin: data.origin,
        destination: data.destination,
        start_date: data.startDate,
        end_date: data.endDate,
        transportation_mode: data.transportationMode,
        selected_coverage: data.selectedCoverage,
        calculated_premium: data.premium,
        deductible: data.deductible,
        quote_expires_at: quoteExpiresAt.toISOString(),
        status: 'submitted', // Ավտոմատ submitted
        payment_status: 'pending'
      };
      
      console.log('Inserting quote to database:', quoteData);
      
      // Insert into quotes table
      const { data: insertedQuote, error: insertError } = await supabase
        .from('quotes')
        .insert([quoteData])
        .select()
        .single();
      
      if (insertError) {
        console.error('Database insert error:', insertError);
        throw insertError;
      }
      
      // Create documents records if any
      if (documentUrls.length > 0) {
        const documentRecords = documentUrls.map(doc => ({
          quote_id: insertedQuote.id,
          [doc.type + '_url']: doc.file_url,
          [doc.type + '_status']: 'pending',
          uploaded_at: doc.uploaded_at
        }));
        
        // Համակցել բոլոր document fields-ը մեկ record-ում
        const combinedDocRecord = documentUrls.reduce((acc, doc) => {
          acc[doc.type + '_url'] = doc.file_url;
          acc[doc.type + '_status'] = 'pending';
          return acc;
        }, {} as any);
        
        combinedDocRecord.quote_id = insertedQuote.id;
        combinedDocRecord.uploaded_at = new Date().toISOString();
        
        const { error: docsError } = await supabase
          .from('documents')
          .insert([combinedDocRecord]);
        
        if (docsError) {
          console.error('Error saving document records:', docsError);
          // Continue even if document saving fails
        }
      }
      
      // Process quote for auto-approval
      const processedResult = await QuoteProcessor.processQuote(insertedQuote.id);
      
      console.log('Quote submitted successfully:', {
        quoteId: insertedQuote.quote_number,
        status: processedResult.quote.status,
        autoApproved: processedResult.autoApproved,
        documentsCount: documentUrls.length
      });
      
      return {
        success: true,
        quoteId: insertedQuote.quote_number,
        message: processedResult.message,
        data: {
          quote: processedResult.quote,
          autoApproved: processedResult.autoApproved,
          documents: documentUrls
        }
      };
      
    } catch (error) {
      console.error('Error submitting quote:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to submit quote'
      };
    }
  },
  
  // Get quote by ID
  async getQuote(id: string) {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('quotes')
      .select(`
        *,
        documents (*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  // Update quote status
  async updateQuoteStatus(quoteId: string, status: string) {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('quotes')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', quoteId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  // Upload additional documents
  async uploadAdditionalDocument(
    quoteId: string, 
    docType: string, 
    file: File
  ) {
    const supabase = createClient();
    
    // Create safe filename
    const safeFileName = createSafeFileName(quoteId, docType, file.name);
    
    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(safeFileName, file);
    
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(safeFileName);
    
    if (!urlData?.publicUrl) {
      throw new Error('Failed to get document URL');
    }
    
    // Update documents table
    const updateData: any = {
      [docType + '_url']: urlData.publicUrl,
      [docType + '_status']: 'pending',
      updated_at: new Date().toISOString()
    };
    
    const { data: existingDoc } = await supabase
      .from('documents')
      .select('id')
      .eq('quote_id', quoteId)
      .maybeSingle();
    
    if (existingDoc) {
      // Update existing document
      const { data, error } = await supabase
        .from('documents')
        .update(updateData)
        .eq('id', existingDoc.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      // Create new document record
      updateData.quote_id = quoteId;
      const { data, error } = await supabase
        .from('documents')
        .insert([updateData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  }
};