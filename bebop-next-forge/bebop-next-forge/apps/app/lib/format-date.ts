/**
 * Format dates consistently between server and client to avoid hydration mismatches
 */

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid date';

  // Use a consistent format that works on both server and client
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();

  return `${month}/${day}/${year}`;
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid date';

  const dateStr = formatDate(d);
  const hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;

  return `${dateStr} at ${displayHours}:${minutes} ${ampm}`;
}

export function formatTime(date: string | Date): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid time';

  const hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;

  return `${displayHours}:${minutes} ${ampm}`;
}
