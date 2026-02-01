import { cn, formatDate, formatDateTime, getBloodGroupDisplay, getStatusColor } from '@/lib/utils';

describe('Utility Functions', () => {
  describe('cn (classnames)', () => {
    it('should merge class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('should handle conditional classes', () => {
      expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
      expect(cn('foo', true && 'bar', 'baz')).toBe('foo bar baz');
    });

    it('should merge tailwind classes correctly', () => {
      expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
    });

    it('should handle undefined and null', () => {
      expect(cn('foo', undefined, null, 'bar')).toBe('foo bar');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date);
      expect(formatted).toContain('2024');
      expect(formatted).toContain('15');
    });

    it('should handle string dates', () => {
      const formatted = formatDate('2024-01-15');
      expect(formatted).toContain('2024');
    });
  });

  describe('formatDateTime', () => {
    it('should format date and time', () => {
      const date = new Date('2024-01-15T14:30:00');
      const formatted = formatDateTime(date);
      expect(formatted).toContain('2024');
    });
  });

  describe('getBloodGroupDisplay', () => {
    it('should convert enum to display format', () => {
      expect(getBloodGroupDisplay('A_POSITIVE')).toBe('A+');
      expect(getBloodGroupDisplay('A_NEGATIVE')).toBe('A-');
      expect(getBloodGroupDisplay('B_POSITIVE')).toBe('B+');
      expect(getBloodGroupDisplay('B_NEGATIVE')).toBe('B-');
      expect(getBloodGroupDisplay('AB_POSITIVE')).toBe('AB+');
      expect(getBloodGroupDisplay('AB_NEGATIVE')).toBe('AB-');
      expect(getBloodGroupDisplay('O_POSITIVE')).toBe('O+');
      expect(getBloodGroupDisplay('O_NEGATIVE')).toBe('O-');
    });

    it('should handle unknown blood groups', () => {
      expect(getBloodGroupDisplay('UNKNOWN')).toBe('UNKNOWN');
    });
  });

  describe('getStatusColor', () => {
    it('should return correct color for each status', () => {
      expect(getStatusColor('AVAILABLE')).toBe('success');
      expect(getStatusColor('COLLECTED')).toBe('info');
      expect(getStatusColor('TESTING')).toBe('warning');
      expect(getStatusColor('EXPIRED')).toBe('danger');
      expect(getStatusColor('DISCARDED')).toBe('danger');
      expect(getStatusColor('PENDING')).toBe('warning');
      expect(getStatusColor('APPROVED')).toBe('success');
      expect(getStatusColor('REJECTED')).toBe('danger');
    });

    it('should return default for unknown status', () => {
      expect(getStatusColor('UNKNOWN')).toBe('default');
    });
  });
});
