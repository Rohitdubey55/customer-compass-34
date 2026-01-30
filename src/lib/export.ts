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
    'Company',
    'Lead Origin',
    'Team Type',
    'Management Lead',
    'Intro Meeting',
    'Delivery Lead',
    'Weekly Calls',
    'Next Steps',
    'Info',
    'Commodities'
  ];

  const rows = leads.map(l => [
    l.id,
    escapeCsvValue(l.company),
    escapeCsvValue(l.leadOrigin),
    l.teamType,
    escapeCsvValue(l.managementLead),
    l.hasIntroMeeting ? 'Yes' : 'No',
    escapeCsvValue(l.deliveryLead),
    l.hasWeeklyCalls ? 'Yes' : 'No',
    escapeCsvValue(l.nextSteps),
    escapeCsvValue(l.info),
    escapeCsvValue(l.commodities)
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
