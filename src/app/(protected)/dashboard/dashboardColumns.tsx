// src/app/(protected)/dashboard/dashboardColumns.tsx
import React from 'react';
import { renderStatus, renderButton } from '@/app/components/tables/UniversalTable';

export const dashboardColumns = [
  {
    key: 'reference',
    label: 'Reference',
    sortable: true,
    renderDesktop: (_: any, row: any) => {
      const entityType = row.dataType === 'quote' ? 'Insurance Quote' : 'Insurance Policy';
      return (
        <div className="flex flex-col">
          <span className="font-poppins text-sm text-[#2563eb] underline hover:text-[#1d4ed8] transition-colors duration-300 cursor-pointer">
            {row.id}
          </span>
          <span className="font-poppins text-xs text-gray-500 mt-0.5">
            {entityType}
          </span>
        </div>
      );
    }
  },
  {
    key: 'cargo',
    label: 'Cargo',
    sortable: true,
    renderDesktop: (_: any, row: any) => (
      <span className="font-poppins text-sm text-black capitalize">
        {row.cargo}
      </span>
    )
  },
  {
    key: 'amount',
    label: 'Amount',
    sortable: true,
    renderDesktop: (_: any, row: any) => (
      <span className="font-poppins text-sm text-black font-medium">
        ${row.value?.toLocaleString('en-US') || '0'}
      </span>
    )
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    renderDesktop: (status: any) => renderStatus(status)
  },
  {
    key: 'validUntil',
    label: 'Valid Until',
    sortable: true,
    renderDesktop: (_: any, row: any) => {
      if (row.expiringDays !== undefined && row.expiringDays !== null) {
        if (row.expiringDays === 0) {
          return (
            <span className="font-poppins text-sm text-amber-600 font-medium">
              Today
            </span>
          );
        } else if (row.expiringDays > 0) {
          return (
            <span className="font-poppins text-sm text-gray-700">
              {row.expiringDays} day{row.expiringDays !== 1 ? 's' : ''} left
            </span>
          );
        } else if (row.expiringDays < 0) {
          const daysAgo = Math.abs(row.expiringDays);
          return (
            <span className="font-poppins text-sm text-rose-600">
              {daysAgo} day{daysAgo !== 1 ? 's' : ''} ago
            </span>
          );
        }
      }
      
      // Այլ դեպքերում, եթե կա specific expiration date
      const expirationDate = row.rawData?.quote_expires_at || row.rawData?.coverage_end;
      if (expirationDate) {
        const date = new Date(expirationDate);
        const formattedDate = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
        return (
          <span className="font-poppins text-sm text-gray-700">
            Until {formattedDate}
          </span>
        );
      }
      
      return (
        <span className="font-poppins text-sm text-gray-400">
          -
        </span>
      );
    }
  },
  {
    key: 'created',
    label: 'Created',
    sortable: true,
    renderDesktop: (date: string) => (
      <span className="font-poppins text-sm text-gray-600">
        {date}
      </span>
    )
  },
  {
    key: 'button',
    label: 'Action',
    renderDesktop: (button: any, row: any) => renderButton(button, row),
    className: 'flex justify-end'
  }
];