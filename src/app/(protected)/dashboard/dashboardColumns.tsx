import React from 'react';
import { renderStatus, renderButton } from '@/app/components/tables/UniversalTable';

export const dashboardColumns = [
  {
    key: 'id',
    label: 'ID',
    sortable: true,
    renderDesktop: (value: string) => (
      <span className="font-poppins text-sm text-[#2563eb] underline hover:text-[#1d4ed8] transition-colors duration-300 cursor-pointer">
        {value}
      </span>
    )
  },
  {
    key: 'type',
    label: 'Type',
    sortable: true,
    renderDesktop: (type: string) => (
      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
        type === 'Quote' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
      }`}>
        {type}
      </div>
    )
  },
  {
    key: 'cargo',
    label: 'Cargo',
    sortable: true,
    renderDesktop: (_: any, row: any) => (
      <span className="font-poppins text-sm text-black">
        {row.cargo}
      </span>
    )
  },
  {
    key: 'value',
    label: 'Value',
    sortable: true,
    renderDesktop: (_: any, row: any) => (
      <span className="font-poppins text-sm text-black">
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
    key: 'expiring',
    label: 'Expiring',
    sortable: true,
    renderDesktop: (_: any, row: any) => {
      if (row.expiringDays !== undefined) {
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
      return (
        <span className="font-poppins text-sm text-gray-400">
          -
        </span>
      );
    }
  },
  {
    key: 'date',
    label: 'Created',
    sortable: true
  },
  {
    key: 'button',
    label: 'Action',
    renderDesktop: (button: any, row: any) => renderButton(button, row),
    className: 'flex justify-end'
  }
];