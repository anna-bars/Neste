import React from 'react';
import { renderStatus, renderButton } from '@/app/components/tables/UniversalTable';
import { renderDocsStatus } from './shipmentsHelpers';

export const policiesColumns = [
  {
    key: 'id',
    label: 'Policy ID',
    sortable: true,
    renderDesktop: (value: string) => (
      <span className="font-poppins text-sm text-[#2563eb] underline hover:text-[#1d4ed8] transition-colors duration-300 cursor-pointer">
        {value}
      </span>
    )
  },
  {
    key: 'cargo',
    label: 'Cargo',
    sortable: true
  },
  {
    key: 'shipmentValue',
    label: 'Value',
    sortable: true
  },
  {
    key: 'premiumAmount',
    label: 'Premium Paid',
    sortable: true
  },
  {
    key: 'expirationDate',
    label: 'Coverage Period',
    sortable: true
  },
  {
    key: 'status',
    label: 'Policy Status',
    sortable: true,
    renderDesktop: (status: any) => renderStatus(status)
  },
  {
    key: 'missingDocs',
    label: 'Docs Status',
    sortable: true,
    renderDesktop: (missingDocs: any) => renderDocsStatus(missingDocs)
  },
  {
    key: 'button',
    label: 'Action',
    renderDesktop: (button: any, row: any) => renderButton(button, row),
    className: 'flex justify-end'
  }
];