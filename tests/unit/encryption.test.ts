import { encryptionService } from '@/lib/encryption';

describe('Encryption Service', () => {
  const testData = 'Test sensitive data';
  const testKey = 'test-encryption-key-32-chars-ok!';

  beforeAll(() => {
    process.env.ENCRYPTION_KEY = testKey;
  });

  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt data correctly', () => {
      const encrypted = encryptionService.encrypt(testData);
      expect(encrypted).not.toBe(testData);
      expect(encrypted).toContain(':'); // IV:tag:encrypted format

      const decrypted = encryptionService.decrypt(encrypted);
      expect(decrypted).toBe(testData);
    });

    it('should produce different ciphertext for same plaintext', () => {
      const encrypted1 = encryptionService.encrypt(testData);
      const encrypted2 = encryptionService.encrypt(testData);
      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should handle empty strings', () => {
      const encrypted = encryptionService.encrypt('');
      const decrypted = encryptionService.decrypt(encrypted);
      expect(decrypted).toBe('');
    });

    it('should handle special characters', () => {
      const special = 'Test!@#$%^&*()_+-=[]{}|;:\'",./<>?`~';
      const encrypted = encryptionService.encrypt(special);
      const decrypted = encryptionService.decrypt(encrypted);
      expect(decrypted).toBe(special);
    });

    it('should handle unicode characters', () => {
      const unicode = 'Test 日本語 한국어 العربية';
      const encrypted = encryptionService.encrypt(unicode);
      const decrypted = encryptionService.decrypt(encrypted);
      expect(decrypted).toBe(unicode);
    });
  });

  describe('hash', () => {
    it('should produce consistent hash for same input', () => {
      const hash1 = encryptionService.hash(testData);
      const hash2 = encryptionService.hash(testData);
      expect(hash1).toBe(hash2);
    });

    it('should produce different hash for different input', () => {
      const hash1 = encryptionService.hash('data1');
      const hash2 = encryptionService.hash('data2');
      expect(hash1).not.toBe(hash2);
    });

    it('should produce 64 character hex hash (SHA-256)', () => {
      const result = encryptionService.hash(testData);
      expect(result).toHaveLength(64);
      expect(/^[a-f0-9]+$/.test(result)).toBe(true);
    });
  });

  describe('encryptFields and decryptFields', () => {
    it('should encrypt specified fields', () => {
      const data = { name: 'John', email: 'john@example.com', age: 30 };
      const encrypted = encryptionService.encryptFields(data, ['name', 'email']);

      expect(encrypted.name).not.toBe('John');
      expect(encrypted.email).not.toBe('john@example.com');
      expect(encrypted.age).toBe(30);
    });

    it('should decrypt specified fields', () => {
      const data = { name: 'John', email: 'john@example.com', age: 30 };
      const encrypted = encryptionService.encryptFields(data, ['name', 'email']);
      const decrypted = encryptionService.decryptFields(encrypted, ['name', 'email']);

      expect(decrypted.name).toBe('John');
      expect(decrypted.email).toBe('john@example.com');
      expect(decrypted.age).toBe(30);
    });
  });
});
