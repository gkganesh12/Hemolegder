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

  const encrypt = useCallback(
    async (plaintext: string) => {
      if (!key) throw new Error('Key not initialized');
      return encryptClientSide(plaintext, key);
    },
    [key]
  );

  const decrypt = useCallback(
    async (ciphertext: string) => {
      if (!key) throw new Error('Key not initialized');
      return decryptClientSide(ciphertext, key);
    },
    [key]
  );

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
    isReady: !!key,
  };
}

export default useEncryption;
