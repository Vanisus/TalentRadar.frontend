// src/shared/dateUtils.ts

// Конвертация из ISO (YYYY-MM-DD) в отображаемый формат dd.mm.yyyy
export function formatDateDisplay(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  if (!year || !month || !day) return dateStr;
  return `${day}.${month}.${year}`;
}

// Конвертация из dd.mm.yyyy обратно в ISO YYYY-MM-DD для отправки на бэк
export function formatDateISO(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  const [day, month, year] = dateStr.split('.');
  if (!day || !month || !year) return null;
  return `${year}-${month}-${day}`;
}
