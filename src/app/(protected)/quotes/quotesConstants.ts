export const quotesTypeLabels = {
  approved: 'Converted',
  declined: 'Pending',
  expired: 'Declined'
} as const;

export const quotesChartColors = {
  approved: { start: '#accff0', end: '#66ACEE' },
  declined: { start: '#F8E2BE', end: '#EEDE66' },
  expired: { start: '#F8BEBE', end: '#EE6666' }
} as const;