// components/DocumentsList.tsx
import { FileText, Upload, Eye, Download } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  file_url: string;
  file_name: string;
  file_size: number;
  uploaded_at: string;
  original_name: string;
}

interface DocumentsListProps {
  documents: Document[];
  status: string;
}

export default function DocumentsList({ documents, status }: DocumentsListProps) {
  const canUpload = status === 'fix_and_resubmit' || status === 'draft';

  // Function to format file type for display
  const formatDocumentType = (type: string) => {
    const typeMap: Record<string, string> = {
      'commercial-invoice': 'Commercial Invoice',
      'packing-list': 'Packing List',
      'bill-of-lading': 'Bill of Lading',
      'certificate-of-origin': 'Certificate of Origin',
      'insurance-certificate': 'Insurance Certificate'
    };
    return typeMap[type] || type.replace(/-/g, ' ').toUpperCase();
  };

  return (
    <div className="bg-white/90 rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Documents</h2>
          <p className="text-sm text-gray-600">
            {documents.length > 0 ? 'Secure verified files' : 'Upload required documents'}
          </p>
        </div>
        {canUpload && (
          <button className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-0.5">
            <Upload className="w-4 h-4 inline mr-2" />
            Upload New
          </button>
        )}
      </div>
      
      {documents.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-4 border border-gray-300">
            <FileText className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-600 mb-6">Upload documents to complete your submission</p>
          {canUpload && (
            <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-0.5">
              <Upload className="w-4 h-4 inline mr-2" />
              Upload Documents
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc, index) => {
            const formattedType = formatDocumentType(doc.type);
            const fileSizeMB = (doc.file_size / 1024 / 1024).toFixed(2);
            const uploadedDate = new Date(doc.uploaded_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });
            
            return (
              <div key={doc.id} className="group bg-gradient-to-r from-gray-50 to-white border border-gray-300 rounded-xl hover:border-blue-500 p-4 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-lg ${
                      index % 3 === 0 ? 'bg-gradient-to-br from-blue-500/10 to-blue-600/10' :
                      index % 3 === 1 ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/10' :
                      'bg-gradient-to-br from-purple-500/10 to-purple-600/10'
                    }`}>
                      <FileText className="w-5 h-5 text-gray-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{formattedType}</h3>
                      <p className="text-sm text-gray-600 truncate">{doc.name}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="text-xs px-2 py-1 bg-gray-200 rounded-full text-gray-700">
                          {fileSizeMB} MB
                        </span>
                        <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                          Uploaded
                        </span>
                        <span className="text-xs text-gray-500 truncate">
                          {doc.original_name}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Uploaded: {uploadedDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    {doc.file_url && (
                      <>
                        <button
                          onClick={() => window.open(doc.file_url, '_blank')}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-300"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <a
                          href={doc.file_url}
                          download={doc.file_name || doc.original_name}
                          className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-all duration-300"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}