import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;

export class EncryptionService {
  private key: Buffer;

  constructor() {
    const key = process.env.ENCRYPTION_KEY;
    if (!key || key.length !== 32) {
      throw new Error('ENCRYPTION_KEY must be 32 characters');
    }
    this.key = Buffer.from(key, 'utf-8');
  }

  /**
   * Encrypt data using AES-256-GCM
   */
  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    const tag = cipher.getAuthTag();

    // Format: iv:tag:ciphertext (all base64)
    return [
      iv.toString('base64'),
      tag.toString('base64'),
      encrypted,
    ].join(':');
  }

  /**
   * Decrypt data encrypted with AES-256-GCM
   */
  decrypt(encrypted: string): string {
    const [ivB64, tagB64, ciphertext] = encrypted.split(':');

    const iv = Buffer.from(ivB64, 'base64');
    const tag = Buffer.from(tagB64, 'base64');

    const decipher = crypto.createDecipheriv(ALGORITHM, this.key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Generate SHA-256 hash for blockchain storage
   */
  hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Encrypt object fields
   */
  encryptFields<T extends Record<string, unknown>>(
    data: T,
    fields: (keyof T)[]
  ): T {
    const result = { ...data };
    for (const field of fields) {
      if (result[field]) {
        result[field] = this.encrypt(String(result[field])) as T[keyof T];
      }
    }
    return result;
  }

  /**
   * Decrypt object fields
   */
  decryptFields<T extends Record<string, unknown>>(
    data: T,
    fields: (keyof T)[]
  ): T {
    const result = { ...data };
    for (const field of fields) {
      if (result[field]) {
        result[field] = this.decrypt(String(result[field])) as T[keyof T];
      }
    }
    return result;
  }
}

// Singleton instance - lazy initialization to avoid errors when key is not set
let _encryptionService: EncryptionService | null = null;

export function getEncryptionService(): EncryptionService {
  if (!_encryptionService) {
    _encryptionService = new EncryptionService();
  }
  return _encryptionService;
}

export const encryptionService = {
  encrypt: (plaintext: string) => getEncryptionService().encrypt(plaintext),
  decrypt: (encrypted: string) => getEncryptionService().decrypt(encrypted),
  hash: (data: string) => getEncryptionService().hash(data),
  encryptFields: <T extends Record<string, unknown>>(data: T, fields: (keyof T)[]) =>
    getEncryptionService().encryptFields(data, fields),
  decryptFields: <T extends Record<string, unknown>>(data: T, fields: (keyof T)[]) =>
    getEncryptionService().decryptFields(data, fields),
};
