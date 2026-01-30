import { Lead } from '@/types/customer';

export function exportToJSON(leads: Lead | Lead[], filename: string): void {
  const data = JSON.stringify(leads, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  downloadBlob(blob, `${filename}.json`);
}

export function exportToCSV(leads: Lead[], filename: string): void {
  if (leads.length === 0) return;

  const headers = [
    'ID',
    'Customer',
    'Lead Origin',
    'PIM or CM',
    'Customer Contact',
    'Strategic Owner',
    'Management Lead',
    'Delivery Lead',
    'Intro Meeting',
    'PPTs Shared',
    'Verbal Agreement',
    'NDA Signed',
    'LOI Issued',
    'LOI Signed',
    'Weekly Calls',
    'Parts & Spend Received',
    'Next Followup',
    'Contract Signed',
    'Current Progress',
    'Commodities',
    'Spend'
  ];

  const rows = leads.map(l => [
    l.id,
    escapeCsvValue(l.customer),
    escapeCsvValue(l.leadOrigin),
    l.pimOrCm,
    escapeCsvValue(l.customerContact),
    escapeCsvValue(l.strategicOwner),
    escapeCsvValue(l.managementLead),
    escapeCsvValue(l.deliveryLead),
    l.introductoryMeeting ? 'Yes' : 'No',
    l.pptsShared,
    l.verbalAgreement,
    l.ndaSigned,
    l.loiIssued ? 'Yes' : 'No',
    l.loiSigned ? 'Yes' : 'No',
    l.weeklyCalls,
    l.partsSpendReceived,
    escapeCsvValue(l.nextFollowup),
    l.contractSigned,
    escapeCsvValue(l.currentProgress),
    escapeCsvValue(l.commodities),
    escapeCsvValue(l.spend)
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
}

function escapeCsvValue(value: string): string {
  if (!value) return '';
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}
