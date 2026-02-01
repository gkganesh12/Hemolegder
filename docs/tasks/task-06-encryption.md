# Task 6: Encryption Layer (AES-256)

## Overview
Implement client-side and server-side AES-256 encryption for sensitive data.

## Status: `[ ] Not Started`

---

## Objectives
- Server-side AES-256-GCM encryption
- Client-side encryption using Web Crypto API
- Secure key management
- SHA-256 hashing for blockchain

---

## Deliverables

### 1. Server-Side Encryption (`src/lib/encryption.ts`)
```typescript
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

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
      encrypted
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
  encryptFields<T extends Record<string, any>>(
    data: T, 
    fields: (keyof T)[]
  ): T {
    const result = { ...data };
    for (const field of fields) {
      if (result[field]) {
        result[field] = this.encrypt(String(result[field])) as any;
      }
    }
    return result;
  }

  /**
   * Decrypt object fields
   */
  decryptFields<T extends Record<string, any>>(
    data: T, 
    fields: (keyof T)[]
  ): T {
    const result = { ...data };
    for (const field of fields) {
      if (result[field]) {
        result[field] = this.decrypt(String(result[field])) as any;
      }
    }
    return result;
  }
}

export const encryptionService = new EncryptionService();
```

### 2. Client-Side Encryption (`src/lib/client-encryption.ts`)
```typescript
/**
 * Client-side encryption using Web Crypto API
 * For encrypting sensitive data before sending to server
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;

export async function generateKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

export async function importKey(keyString: string): Promise<CryptoKey> {
  const keyData = Uint8Array.from(atob(keyString), c => c.charCodeAt(0));
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function encryptClientSide(
  plaintext: string, 
  key: CryptoKey
): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    data
  );
  
  // Combine IV and ciphertext
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  return btoa(String.fromCharCode(...combined));
}

export async function decryptClientSide(
  ciphertext: string, 
  key: CryptoKey
): Promise<string> {
  const combined = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  
  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    data
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

/**
 * Hash data client-side using SHA-256
 */
export async function hashClientSide(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
```

### 3. React Encryption Hook (`src/hooks/useEncryption.ts`)
```typescript
'use client';

import { useState, useCallback } from 'react';
import {
  generateKey,
  exportKey,
  importKey,
  encryptClientSide,
  decryptClientSide,
  hashClientSide,
} from '@/lib/client-encryption';

export function useEncryption() {
  const [key, setKey] = useState<CryptoKey | null>(null);

  const initKey = useCallback(async () => {
    const newKey = await generateKey();
    setKey(newKey);
    return newKey;
  }, []);

  const encrypt = useCallback(async (plaintext: string) => {
    if (!key) throw new Error('Key not initialized');
    return encryptClientSide(plaintext, key);
  }, [key]);

  const decrypt = useCallback(async (ciphertext: string) => {
    if (!key) throw new Error('Key not initialized');
    return decryptClientSide(ciphertext, key);
  }, [key]);

  const hash = useCallback(async (data: string) => {
    return hashClientSide(data);
  }, []);

  const getKeyString = useCallback(async () => {
    if (!key) throw new Error('Key not initialized');
    return exportKey(key);
  }, [key]);

  const loadKey = useCallback(async (keyString: string) => {
    const loadedKey = await importKey(keyString);
    setKey(loadedKey);
    return loadedKey;
  }, []);

  return {
    key,
    initKey,
    encrypt,
    decrypt,
    hash,
    getKeyString,
    loadKey,
  };
}
```

### 4. Key Management Service (`src/services/key-management.ts`)
```typescript
import { prisma } from '@/lib/prisma';
import { encryptionService } from '@/lib/encryption';
import crypto from 'crypto';

export class KeyManagementService {
  /**
   * Generate a new encryption key for a user
   * The key is encrypted with the master key before storage
   */
  async generateUserKey(userId: string): Promise<string> {
    const userKey = crypto.randomBytes(32).toString('base64');
    
    // Encrypt the user key with master key
    const encryptedKey = encryptionService.encrypt(userKey);
    
    // Store in database (would need to add a UserKey model)
    // await prisma.userKey.create(...)
    
    return userKey;
  }

  /**
   * Rotate encryption keys
   */
  async rotateKey(userId: string): Promise<void> {
    // 1. Generate new key
    // 2. Re-encrypt all user data with new key
    // 3. Update stored key
    // 4. Log key rotation in audit
  }
}
```

---

## Data to Encrypt

| Field | Location | Encryption |
|-------|----------|------------|
| Donor name | Donor.encryptedName | Server-side |
| Contact info | Donor.encryptedContact | Server-side |
| Address | Donor.encryptedAddress | Server-side |
| Medical data | Donor.encryptedMedicalData | Client + Server |
| Test results | BloodTest | Server-side |

---

## Acceptance Criteria
- [ ] Server-side encryption/decryption works
- [ ] Client-side encryption/decryption works
- [ ] SHA-256 hashing generates consistent results
- [ ] Encrypted data stored in database
- [ ] Key management in place
- [ ] No plaintext PII in database

---

## Dependencies
- Task 1 (Project setup)

## Blocks
- Task 7-12 (All services storing sensitive data)
