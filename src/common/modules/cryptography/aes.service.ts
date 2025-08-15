/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable  @typescript-eslint/no-unsafe-member-access */
/* eslint-disable  @typescript-eslint/no-unsafe-call */
/* eslint-disable  @typescript-eslint/no-unnecessary-condition */

import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface EncryptionResult {
  iv: string;
  encrypted: string;
  authTag: string;
}

export abstract class ICryptoProvider {
  abstract generateIv(): Buffer;
  abstract createCipher(key: Buffer, iv: Buffer): any;
  abstract createDecipher(key: Buffer, iv: Buffer, authTag: Buffer): any;
}

@Injectable()
export class CryptoProviderService implements ICryptoProvider {
  private readonly ALGORITHM = 'aes-256-gcm';

  generateIv(): Buffer {
    return randomBytes(12); // GCM standard IV length
  }

  createCipher(key: Buffer, iv: Buffer): any {
    return createCipheriv(this.ALGORITHM, key, iv);
  }

  createDecipher(key: Buffer, iv: Buffer, authTag: Buffer): any {
    const decipher = createDecipheriv(this.ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    return decipher;
  }
}

export abstract class IKeyProvider {
  abstract getEncryptionKey(): Buffer;
}

@Injectable()
export class ConfigKeyProviderService implements IKeyProvider {
  private readonly KEY_LENGTH = 32; // 256 bits

  constructor(private readonly configService: ConfigService) {}

  getEncryptionKey(): Buffer {
    const key = this.configService.get<string>('AES_KEY');
    if (!key) {
      throw new Error('AES_KEY environment variable is not set');
    }
    const buf = Buffer.from(key, 'hex');
    if (buf.length !== this.KEY_LENGTH) {
      throw new Error('AES_KEY must be a 64-character hex string (32 bytes)');
    }
    return buf;
  }
}

@Injectable()
export class AesService {
  private readonly key: Buffer;

  constructor(
    private readonly keyProvider: IKeyProvider,
    private readonly cryptoProvider: ICryptoProvider,
  ) {
    this.key = this.keyProvider.getEncryptionKey();
  }

  encrypt(plainText: string): EncryptionResult {
    const iv = this.cryptoProvider.generateIv();
    const cipher = this.cryptoProvider.createCipher(this.key, iv);

    const encrypted = Buffer.concat([
      cipher.update(plainText, 'utf8'),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return {
      iv: iv.toString('hex'),
      encrypted: encrypted.toString('hex'),
      authTag: authTag.toString('hex'),
    };
  }

  encryptAsString(plainText: string): string {
    const data = this.encrypt(plainText);
    return `${data.iv}:${data.encrypted}:${data.authTag}`;
  }

  decrypt(encrypted: string, iv: string, authTag: string): string {
    const decipher = this.cryptoProvider.createDecipher(
      this.key,
      Buffer.from(iv, 'hex'),
      Buffer.from(authTag, 'hex'),
    );

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encrypted, 'hex')),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }

  decryptString(encryptedString: string): string {
    const [iv, encrypted, authTag] = encryptedString.split(':');
    if (iv === undefined || encrypted === undefined || authTag === undefined) {
      throw new Error('Invalid encrypted string format');
    }
    return this.decrypt(encrypted, iv, authTag);
  }
}
