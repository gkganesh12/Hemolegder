import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getBloodGroupDisplay(bloodGroup: string): string {
  const displays: Record<string, string> = {
    A_POSITIVE: 'A+',
    A_NEGATIVE: 'A-',
    B_POSITIVE: 'B+',
    B_NEGATIVE: 'B-',
    AB_POSITIVE: 'AB+',
    AB_NEGATIVE: 'AB-',
    O_POSITIVE: 'O+',
    O_NEGATIVE: 'O-',
  };
  return displays[bloodGroup] || bloodGroup;
}

export function getStatusColor(status: string): 'success' | 'warning' | 'danger' | 'info' | 'default' {
  const colors: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
    AVAILABLE: 'success',
    COLLECTED: 'info',
    TESTING: 'warning',
    TESTED_PASS: 'success',
    TESTED_FAIL: 'danger',
    RESERVED: 'warning',
    ISSUED: 'info',
    EXPIRED: 'danger',
    DISCARDED: 'danger',
    PENDING: 'warning',
    APPROVED: 'success',
    FULFILLED: 'success',
    REJECTED: 'danger',
    CANCELLED: 'default',
    GRANTED: 'success',
    REVOKED: 'danger',
  };
  return colors[status] || 'default';
}
