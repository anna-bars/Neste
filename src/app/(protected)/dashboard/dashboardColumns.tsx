// src/app/(protected)/dashboard/dashboardColumns.tsx
import React from 'react';
import { renderStatus, renderButton } from '@/app/components/tables/UniversalTable';
import { 
  Package,
  DollarSign,
  CalendarDays,
  Calendar,
  FileText,
  Shield,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Eye,
  Upload
} from 'lucide-react';

export const dashboardColumns = [
  {
    key: 'reference',
    label: 'Reference',
    sortable: true,
    renderDesktop: (_: any, row: any) => {
      const entityType = row.dataType === 'quote' ? 'Insurance Quote' : 'Insurance Policy';
      const Icon = row.dataType === 'quote' ? FileText : Shield;
      
      return (
        <div className="flex items-center gap-2 min-w-[140px]">
          <Icon className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="font-poppins text-sm text-[#2563eb] underline hover:text-[#1d4ed8] transition-colors duration-300 cursor-pointer truncate">
              {row.id}
            </span>
            <span className="font-poppins text-xs text-gray-500 truncate">
              {entityType}
            </span>
          </div>
        </div>
      );
    }
  },
  {
    key: 'cargo',
    label: 'Cargo',
    sortable: true,
    renderDesktop: (_: any, row: any) => (
      <div className="flex items-center gap-2 min-w-[100px]">
        <span className="font-poppins text-sm text-black capitalize truncate">
          {row.cargo || '-'}
        </span>
      </div>
    )
  },
  {
    key: 'amount',
    label: 'Amount',
    sortable: true,
    renderDesktop: (_: any, row: any) => (
      <div className="flex items-center gap-2 min-w-[100px]">
        <span className="font-poppins text-sm text-black font-medium truncate">
          ${row.value?.toLocaleString('en-US') || '0'}
        </span>
      </div>
    )
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    renderDesktop: (status: any, row: any) => {
      const StatusIcon = getStatusIcon(status?.text || '');
      return (
        <div className="flex items-center gap-2 min-w-[120px]">
          {renderStatus(status)}
        </div>
      );
    }
  },
  {
    key: 'validUntil',
    label: 'Valid Until',
    sortable: true,
    renderDesktop: (_: any, row: any) => {
      if (row.expiringDays !== undefined && row.expiringDays !== null) {
        return (
          <div className="flex items-center gap-2 min-w-[110px]">
           
            {row.expiringDays === 0 ? (
              <span className="font-poppins text-sm text-amber-600 font-medium">
                Today
              </span>
            ) : row.expiringDays > 0 ? (
              <span className="font-poppins text-sm text-gray-700">
                {row.expiringDays} day{row.expiringDays !== 1 ? 's' : ''} left
              </span>
            ) : (
              <span className="font-poppins text-sm text-gray-600">
                
              </span>
            )}
          </div>
        );
      }
      
      // Show specific date if available
      const expirationDate = row.rawData?.quote_expires_at || row.rawData?.coverage_end;
      if (expirationDate) {
        const date = new Date(expirationDate);
        const formattedDate = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
        return (
          <div className="flex items-center gap-2 min-w-[110px]">
            <span className="font-poppins text-sm text-gray-700 truncate">
              Until {formattedDate}
            </span>
          </div>
        );
      }
      
      return (
        <div className="flex items-center gap-2 min-w-[110px]">
          <span className="font-poppins text-sm text-gray-400">
            -
          </span>
        </div>
      );
    }
  },
  {
    key: 'created',
    label: 'Created',
    sortable: true,
    renderDesktop: (date: string) => (
      <div className="flex items-center gap-2 min-w-[120px]">
        <span className="font-poppins text-sm text-gray-600 truncate">
          {date}
        </span>
      </div>
    )
  },
  {
    key: 'button',
    label: 'Action',
    renderDesktop: (button: any, row: any) => {
      const ActionIcon = getActionIcon(button?.text || '');
      const enhancedButton = {
        ...button,
        renderContent: (
          <div className="flex items-center justify-center gap-2">
            <span>{button.text}</span>
          </div>
        )
      };
      return renderButton(enhancedButton, row);
    },
    className: 'flex justify-end min-w-[100px]'
  }
];

// Helper functions for icons
const getStatusIcon = (statusText: string) => {
  const text = statusText.toLowerCase();
  if (text.includes('active') || text.includes('approved')) return CheckCircle;
  if (text.includes('pending') || text.includes('waiting')) return Clock;
  if (text.includes('rejected') || text.includes('expired')) return XCircle;
  return AlertCircle;
};

const getActionIcon = (actionText: string) => {
  const text = actionText.toLowerCase();
  if (text.includes('pay')) return DollarSign;
  if (text.includes('view') && text.includes('policy')) return Shield;
  if (text.includes('view') && text.includes('details')) return Eye;
  if (text.includes('view') && text.includes('shipment')) return Package;
  if (text.includes('upload')) return Upload;
  if (text.includes('continue')) return FileText;
  if (text.includes('download')) return FileText;
  return AlertCircle;
};

// Optional: Enhanced renderStatus with icon
export const renderEnhancedStatus = (status: { 
  text: string; 
  color: string; 
  dot: string; 
  textColor: string 
}) => {
  const StatusIcon = getStatusIcon(status.text);
  const iconColor = status.textColor.replace('text-', '');
  
  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[37px] font-poppins text-xs ${status.color} ${status.textColor}`}>
      <StatusIcon className={`w-3 h-3 ${status.textColor}`} />
      <span>{status.text}</span>
    </div>
  );
};