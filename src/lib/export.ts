import { Customer } from '@/types/customer';

export function exportToJSON(customers: Customer | Customer[], filename: string): void {
  const data = JSON.stringify(customers, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  downloadBlob(blob, `${filename}.json`);
}

export function exportToCSV(customers: Customer[], filename: string): void {
  if (customers.length === 0) return;

  const headers = [
    'ID',
    'Name',
    'Company',
    'Email',
    'Phone',
    'Region',
    'Status',
    'Tier',
    'Last Contacted',
    'Notes',
    'Attachments'
  ];

  const rows = customers.map(c => [
    c.id,
    escapeCsvValue(c.name),
    escapeCsvValue(c.company),
    c.email,
    c.phone,
    c.region,
    c.status,
    c.tier,
    c.last_contacted,
    escapeCsvValue(c.notes),
    c.attachments.join('; ')
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
}

function escapeCsvValue(value: string): string {
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
