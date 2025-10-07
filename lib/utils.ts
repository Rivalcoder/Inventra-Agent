import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useCurrency } from './context/currency-context';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat(
    currency === 'INR' ? 'en-IN' : currency === 'USD' ? 'en-US' : 'en',
    {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  ).format(amount);
}

export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) {
    return 'N/A';
  }
  
  let date: Date;
  
  // Handle different input types
  if (dateString instanceof Date) {
    date = dateString;
  } else if (typeof dateString === 'string') {
    // Handle various date string formats
    if (dateString.includes('T')) {
      // ISO string format
      date = new Date(dateString);
    } else if (dateString.includes('-')) {
      // Date string format (YYYY-MM-DD)
      date = new Date(dateString + 'T00:00:00');
    } else {
      // Try parsing as is
      date = new Date(dateString);
    }
  } else {
    return 'Invalid Date';
  }
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    console.warn('Invalid date provided to formatDate:', dateString);
    return 'Invalid Date';
  }
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

// Helper function to validate and normalize dates
export function normalizeDate(dateInput: any): string {
  if (!dateInput) {
    return new Date().toISOString();
  }
  
  if (dateInput instanceof Date) {
    return dateInput.toISOString();
  }
  
  if (typeof dateInput === 'string') {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string, using current date:', dateInput);
      return new Date().toISOString();
    }
    return date.toISOString();
  }
  
  console.warn('Invalid date input, using current date:', dateInput);
  return new Date().toISOString();
}

export function formatNumber(number: number): string {
  return new Intl.NumberFormat('en-US').format(number);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

export function getApiBase() {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
}

export function convertToCSV(data: any[], headers: { key: string; label: string }[]): string {
  // Create header row
  const headerRow = headers.map(header => header.label).join(',');
  
  // Create data rows
  const dataRows = data.map(item => {
    return headers.map(header => {
      const value = item[header.key];
      // Handle special cases
      if (value === null || value === undefined) return '';
      if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
      return value;
    }).join(',');
  });

  // Combine header and data rows
  return [headerRow, ...dataRows].join('\n');
}

export function downloadCSV(csv: string, filename: string) {
  // Add UTF-8 BOM for proper Excel encoding
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadPDF(content: HTMLElement, filename: string) {
  import('html2pdf.js').then(({ default: html2pdf }) => {
    const opt = {
      margin: 1,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(content).save();
  });
}