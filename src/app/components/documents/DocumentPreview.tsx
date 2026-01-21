'use client';

import { useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Download, Printer } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';

// Set up PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface DocumentPreviewProps {
  url: string;
  fileName: string;
  onClose: () => void;
}

export default function DocumentPreview({ url, fileName, onClose }: DocumentPreviewProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isPdf, setIsPdf] = useState(false);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsPdf(true);
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const isImage = fileName.match(/\.(jpg|jpeg|png|gif)$/i);
  const isPDF = fileName.match(/\.pdf$/i) || url.includes('.pdf');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-6xl max-h-[90vh] w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h3 className="font-semibold text-gray-900 truncate max-w-md">
              {fileName}
            </h3>
            <p className="text-sm text-gray-600">
              {isPDF ? 'PDF Document' : isImage ? 'Image' : 'Document'}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </button>
            
            <button
              onClick={handlePrint}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Print"
            >
              <Printer className="w-5 h-5" />
            </button>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Toolbar */}
        <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            
            <span className="text-sm font-medium text-gray-700 min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </span>
            
            <button
              onClick={handleZoomIn}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleRotate}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors ml-4"
              title="Rotate"
            >
              <RotateCw className="w-5 h-5" />
            </button>
          </div>
          
          {isPDF && numPages && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
                disabled={pageNumber <= 1}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="text-sm text-gray-700">
                Page {pageNumber} of {numPages}
              </span>
              
              <button
                onClick={() => setPageNumber(prev => Math.min(numPages, prev + 1))}
                disabled={pageNumber >= numPages}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
        
        {/* Document Content */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
          {isPDF ? (
            <div className="overflow-auto max-h-[60vh]">
              <Document
                file={url}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-2"></div>
                      <p className="text-gray-600">Loading PDF...</p>
                    </div>
                  </div>
                }
                error={
                  <div className="text-center p-8">
                    <p className="text-red-600">Failed to load PDF</p>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline mt-2 inline-block"
                    >
                      Open in new tab
                    </a>
                  </div>
                }
              >
                <Page 
                  pageNumber={pageNumber} 
                  scale={scale}
                  rotate={rotation}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>
            </div>
          ) : isImage ? (
            <div className="overflow-auto max-h-[60vh]">
              <img
                src={url}
                alt={fileName}
                className="mx-auto"
                style={{
                  transform: `scale(${scale}) rotate(${rotation}deg)`,
                  transition: 'transform 0.2s'
                }}
              />
            </div>
          ) : (
            <div className="text-center p-8">
              <p className="text-gray-600 mb-4">Preview not available for this file type</p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Download to view
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}