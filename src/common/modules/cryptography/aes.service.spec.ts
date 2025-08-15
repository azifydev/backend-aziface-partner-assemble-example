import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import {
  AesService,
  CryptoProviderService,
  ConfigKeyProviderService,
  ICryptoProvider,
  IKeyProvider,
  EncryptionResult,
} from './aes.service';

// Mock node:crypto only for unit tests, not integration tests
const mockRandomBytes = jest.fn();
const mockCreateCipheriv = jest.fn();
const mockCreateDecipheriv = jest.fn();

jest.mock('node:crypto', () => ({
  randomBytes: (...args: any[]) => mockRandomBytes(...args),
  createCipheriv: (...args: any[]) => mockCreateCipheriv(...args),
  createDecipheriv: (...args: any[]) => mockCreateDecipheriv(...args),
}));

describe('CryptoProviderService', () => {
  let service: CryptoProviderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CryptoProviderService],
    }).compile();

    service = module.get<CryptoProviderService>(CryptoProviderService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateIv', () => {
    it('should generate an IV with 12 bytes length', () => {
      const mockIv = Buffer.from('mock-iv-12-b', 'utf8');
      mockRandomBytes.mockReturnValue(mockIv);

      const result = service.generateIv();

      expect(mockRandomBytes).toHaveBeenCalledWith(12);
      expect(result).toBe(mockIv);
    });
  });

  describe('createCipher', () => {
    it('should create a cipher with correct algorithm, key, and iv', () => {
      const key = Buffer.from('test-key-32-bytes-long-12345678', 'utf8');
      const iv = Buffer.from('test-iv-12-b', 'utf8');
      const mockCipher = {
        update: jest.fn(),
        final: jest.fn(),
        getAuthTag: jest.fn(),
      };
      mockCreateCipheriv.mockReturnValue(mockCipher as any);

      const result = service.createCipher(key, iv);

      expect(mockCreateCipheriv).toHaveBeenCalledWith('aes-256-gcm', key, iv);
      expect(result).toBe(mockCipher);
    });
  });

  describe('createDecipher', () => {
    it('should create a decipher with correct algorithm, key, iv, and set auth tag', () => {
      const key = Buffer.from('test-key-32-bytes-long-12345678', 'utf8');
      const iv = Buffer.from('test-iv-12-b', 'utf8');
      const authTag = Buffer.from('test-auth-tag', 'utf8');
      const mockDecipher = {
        setAuthTag: jest.fn(),
        update: jest.fn(),
        final: jest.fn(),
      };
      mockCreateDecipheriv.mockReturnValue(mockDecipher as any);

      const result = service.createDecipher(key, iv, authTag);

      expect(mockCreateDecipheriv).toHaveBeenCalledWith('aes-256-gcm', key, iv);
      expect(mockDecipher.setAuthTag).toHaveBeenCalledWith(authTag);
      expect(result).toBe(mockDecipher);
    });
  });
});

describe('ConfigKeyProviderService', () => {
  let service: ConfigKeyProviderService;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigKeyProviderService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<ConfigKeyProviderService>(ConfigKeyProviderService);
    configService = module.get<ConfigService>(
      ConfigService,
    ) as jest.Mocked<ConfigService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getEncryptionKey', () => {
    it('should return a valid 32-byte buffer when AES_KEY is correctly set', () => {
      const validHexKey =
        '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'; // 64 hex chars = 32 bytes
      configService.get.mockReturnValue(validHexKey);

      const result = service.getEncryptionKey();

      expect(configService.get).toHaveBeenCalledWith('AES_KEY');
      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBe(32);
      expect(result.toString('hex')).toBe(validHexKey);
    });

    it('should throw an error when AES_KEY is not set', () => {
      configService.get.mockReturnValue(undefined);

      expect(() => service.getEncryptionKey()).toThrow(
        'AES_KEY environment variable is not set',
      );
      expect(configService.get).toHaveBeenCalledWith('AES_KEY');
    });

    it('should throw an error when AES_KEY is null', () => {
      configService.get.mockReturnValue(null);

      expect(() => service.getEncryptionKey()).toThrow(
        'AES_KEY environment variable is not set',
      );
    });

    it('should throw an error when AES_KEY is empty string', () => {
      configService.get.mockReturnValue('');

      expect(() => service.getEncryptionKey()).toThrow(
        'AES_KEY environment variable is not set',
      );
    });

    it('should throw an error when AES_KEY has incorrect length (too short)', () => {
      const shortKey = '0123456789abcdef'; // 16 hex chars = 8 bytes
      configService.get.mockReturnValue(shortKey);

      expect(() => service.getEncryptionKey()).toThrow(
        'AES_KEY must be a 64-character hex string (32 bytes)',
      );
    });

    it('should throw an error when AES_KEY has incorrect length (too long)', () => {
      const longKey =
        '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'; // 80 hex chars = 40 bytes
      configService.get.mockReturnValue(longKey);

      expect(() => service.getEncryptionKey()).toThrow(
        'AES_KEY must be a 64-character hex string (32 bytes)',
      );
    });

    it('should handle non-hex characters gracefully', () => {
      const invalidHexKey =
        'gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg'; // 64 chars but invalid hex
      configService.get.mockReturnValue(invalidHexKey);

      // Buffer.from with invalid hex will create a buffer, but not with the expected length
      expect(() => service.getEncryptionKey()).toThrow(
        'AES_KEY must be a 64-character hex string (32 bytes)',
      );
    });
  });
});

describe('AesService', () => {
  let service: AesService;
  let mockKeyProvider: jest.Mocked<IKeyProvider>;
  let mockCryptoProvider: jest.Mocked<ICryptoProvider>;
  let mockCipher: any;
  let mockDecipher: any;

  beforeEach(async () => {
    mockCipher = {
      update: jest.fn(),
      final: jest.fn(),
      getAuthTag: jest.fn(),
    };

    mockDecipher = {
      update: jest.fn(),
      final: jest.fn(),
      setAuthTag: jest.fn(),
    };

    mockKeyProvider = {
      getEncryptionKey: jest.fn(),
    };

    mockCryptoProvider = {
      generateIv: jest.fn(),
      createCipher: jest.fn(),
      createDecipher: jest.fn(),
    };

    const testKey = Buffer.from('test-key-32-bytes-long-12345678', 'utf8');
    mockKeyProvider.getEncryptionKey.mockReturnValue(testKey);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AesService,
        {
          provide: IKeyProvider,
          useValue: mockKeyProvider,
        },
        {
          provide: ICryptoProvider,
          useValue: mockCryptoProvider,
        },
      ],
    }).compile();

    service = module.get<AesService>(AesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should initialize with encryption key from key provider', () => {
    expect(mockKeyProvider.getEncryptionKey).toHaveBeenCalled();
  });

  describe('encrypt', () => {
    it('should encrypt plain text and return EncryptionResult', () => {
      const plainText = 'Hello, World!';
      const mockIv = Buffer.from('mock-iv-12-b', 'utf8');
      const mockEncrypted = Buffer.from('encrypted-data', 'utf8');
      const mockAuthTag = Buffer.from('auth-tag', 'utf8');

      mockCryptoProvider.generateIv.mockReturnValue(mockIv);
      mockCryptoProvider.createCipher.mockReturnValue(mockCipher);
      mockCipher.update.mockReturnValue(Buffer.from('part1', 'utf8'));
      mockCipher.final.mockReturnValue(Buffer.from('part2', 'utf8'));
      mockCipher.getAuthTag.mockReturnValue(mockAuthTag);

      const result = service.encrypt(plainText);

      expect(mockCryptoProvider.generateIv).toHaveBeenCalled();
      expect(mockCryptoProvider.createCipher).toHaveBeenCalledWith(
        expect.any(Buffer),
        mockIv,
      );
      expect(mockCipher.update).toHaveBeenCalledWith(plainText, 'utf8');
      expect(mockCipher.final).toHaveBeenCalled();
      expect(mockCipher.getAuthTag).toHaveBeenCalled();

      expect(result).toEqual({
        iv: mockIv.toString('hex'),
        encrypted: Buffer.concat([
          Buffer.from('part1', 'utf8'),
          Buffer.from('part2', 'utf8'),
        ]).toString('hex'),
        authTag: mockAuthTag.toString('hex'),
      });
    });

    it('should handle empty string encryption', () => {
      const plainText = '';
      const mockIv = Buffer.from('mock-iv-12-b', 'utf8');
      const mockAuthTag = Buffer.from('auth-tag', 'utf8');

      mockCryptoProvider.generateIv.mockReturnValue(mockIv);
      mockCryptoProvider.createCipher.mockReturnValue(mockCipher);
      mockCipher.update.mockReturnValue(Buffer.alloc(0));
      mockCipher.final.mockReturnValue(Buffer.alloc(0));
      mockCipher.getAuthTag.mockReturnValue(mockAuthTag);

      const result = service.encrypt(plainText);

      expect(result).toEqual({
        iv: mockIv.toString('hex'),
        encrypted: Buffer.alloc(0).toString('hex'),
        authTag: mockAuthTag.toString('hex'),
      });
    });
  });

  describe('encryptAsString', () => {
    it('should encrypt and return formatted string', () => {
      const plainText = 'Hello, World!';
      const mockResult: EncryptionResult = {
        iv: 'mockiv',
        encrypted: 'mockencrypted',
        authTag: 'mockauthtag',
      };

      jest.spyOn(service, 'encrypt').mockReturnValue(mockResult);

      const result = service.encryptAsString(plainText);

      expect(service.encrypt).toHaveBeenCalledWith(plainText);
      expect(result).toBe('mockiv:mockencrypted:mockauthtag');
    });
  });

  describe('decrypt', () => {
    it('should decrypt encrypted data successfully', () => {
      const encrypted = 'encrypteddata';
      const iv = 'mockiv';
      const authTag = 'mockauthtag';
      const expectedPlainText = 'Hello, World!';

      mockCryptoProvider.createDecipher.mockReturnValue(mockDecipher);
      mockDecipher.update.mockReturnValue(Buffer.from('Hello, ', 'utf8'));
      mockDecipher.final.mockReturnValue(Buffer.from('World!', 'utf8'));

      const result = service.decrypt(encrypted, iv, authTag);

      expect(mockCryptoProvider.createDecipher).toHaveBeenCalledWith(
        expect.any(Buffer),
        Buffer.from(iv, 'hex'),
        Buffer.from(authTag, 'hex'),
      );
      expect(mockDecipher.update).toHaveBeenCalledWith(
        Buffer.from(encrypted, 'hex'),
      );
      expect(mockDecipher.final).toHaveBeenCalled();
      expect(result).toBe(expectedPlainText);
    });

    it('should handle empty encrypted data', () => {
      const encrypted = '';
      const iv = 'mockiv';
      const authTag = 'mockauthtag';

      mockCryptoProvider.createDecipher.mockReturnValue(mockDecipher);
      mockDecipher.update.mockReturnValue(Buffer.alloc(0));
      mockDecipher.final.mockReturnValue(Buffer.alloc(0));

      const result = service.decrypt(encrypted, iv, authTag);

      expect(result).toBe('');
    });
  });

  describe('decryptString', () => {
    it('should decrypt formatted string successfully', () => {
      const encryptedString = 'mockiv:mockencrypted:mockauthtag';
      const expectedPlainText = 'Hello, World!';

      jest.spyOn(service, 'decrypt').mockReturnValue(expectedPlainText);

      const result = service.decryptString(encryptedString);

      expect(service.decrypt).toHaveBeenCalledWith(
        'mockencrypted',
        'mockiv',
        'mockauthtag',
      );
      expect(result).toBe(expectedPlainText);
    });

    it('should throw error for invalid format - missing parts', () => {
      const invalidString = 'mockiv:mockencrypted'; // missing authTag

      expect(() => service.decryptString(invalidString)).toThrow(
        'Invalid encrypted string format',
      );
    });

    it('should throw error for invalid format - too many parts', () => {
      const invalidString = 'mockiv:mockencrypted:mockauthtag:extra';

      // The split will produce 4 parts, but we only check for undefined on first 3
      // This should still call decrypt which will fail differently
      expect(() => service.decryptString(invalidString)).toThrow();
    });

    it('should throw error for invalid format - empty string', () => {
      const invalidString = '';

      expect(() => service.decryptString(invalidString)).toThrow(
        'Invalid encrypted string format',
      );
    });

    it('should throw error for invalid format - only colons', () => {
      const invalidString = '::';

      // This will pass the split test but fail in decrypt
      expect(() => service.decryptString(invalidString)).toThrow();
    });

    it('should handle string with empty parts', () => {
      const encryptedString = ':mockencrypted:'; // empty iv and authTag
      const expectedPlainText = 'Hello, World!';

      jest.spyOn(service, 'decrypt').mockReturnValue(expectedPlainText);

      const result = service.decryptString(encryptedString);

      expect(service.decrypt).toHaveBeenCalledWith('mockencrypted', '', '');
      expect(result).toBe(expectedPlainText);
    });
  });
});

describe('Integration Tests - Mocked Crypto', () => {
  let aesService: AesService;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn(),
    };

    // Set up a valid AES key before module creation
    const validHexKey =
      '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    mockConfigService.get.mockReturnValue(validHexKey);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AesService,
        CryptoProviderService,
        ConfigKeyProviderService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: IKeyProvider,
          useClass: ConfigKeyProviderService,
        },
        {
          provide: ICryptoProvider,
          useClass: CryptoProviderService,
        },
      ],
    }).compile();

    aesService = module.get<AesService>(AesService);
    configService = module.get<ConfigService>(
      ConfigService,
    ) as jest.Mocked<ConfigService>;
  });

  it('should encrypt and decrypt a string successfully with mocked crypto', () => {
    const plainText = 'Hello, World! This is a test message.';

    // Setup mocks for encrypt
    const mockIv = Buffer.from('123456789012', 'utf8');
    const mockEncrypted1 = Buffer.from('encrypted1', 'utf8');
    const mockEncrypted2 = Buffer.from('encrypted2', 'utf8');
    const mockAuthTag = Buffer.from('authtag12345', 'utf8');

    const mockCipher = {
      update: jest.fn().mockReturnValue(mockEncrypted1),
      final: jest.fn().mockReturnValue(mockEncrypted2),
      getAuthTag: jest.fn().mockReturnValue(mockAuthTag),
    };

    mockRandomBytes.mockReturnValue(mockIv);
    mockCreateCipheriv.mockReturnValue(mockCipher);

    const encrypted = aesService.encrypt(plainText);

    expect(encrypted.iv).toBe(mockIv.toString('hex'));
    expect(encrypted.encrypted).toBe(
      Buffer.concat([mockEncrypted1, mockEncrypted2]).toString('hex'),
    );
    expect(encrypted.authTag).toBe(mockAuthTag.toString('hex'));

    // Setup mocks for decrypt
    const mockDecrypted1 = Buffer.from('Hello, ', 'utf8');
    const mockDecrypted2 = Buffer.from(
      'World! This is a test message.',
      'utf8',
    );

    const mockDecipher = {
      setAuthTag: jest.fn(),
      update: jest.fn().mockReturnValue(mockDecrypted1),
      final: jest.fn().mockReturnValue(mockDecrypted2),
    };

    mockCreateDecipheriv.mockReturnValue(mockDecipher);

    const decrypted = aesService.decrypt(
      encrypted.encrypted,
      encrypted.iv,
      encrypted.authTag,
    );

    expect(decrypted).toBe(plainText);
    expect(mockDecipher.setAuthTag).toHaveBeenCalledWith(
      Buffer.from(encrypted.authTag, 'hex'),
    );
  });

  it('should encrypt and decrypt using string format successfully', () => {
    const plainText = 'Hello, World! This is a test message.';

    // Setup mocks for encryptAsString (which calls encrypt)
    const mockIv = Buffer.from('123456789012', 'utf8');
    const mockEncrypted = Buffer.from('encrypteddata', 'utf8');
    const mockAuthTag = Buffer.from('authtag12345', 'utf8');

    const mockCipher = {
      update: jest.fn().mockReturnValue(mockEncrypted),
      final: jest.fn().mockReturnValue(Buffer.alloc(0)),
      getAuthTag: jest.fn().mockReturnValue(mockAuthTag),
    };

    mockRandomBytes.mockReturnValue(mockIv);
    mockCreateCipheriv.mockReturnValue(mockCipher);

    const encryptedString = aesService.encryptAsString(plainText);

    const expectedFormat = `${mockIv.toString('hex')}:${mockEncrypted.toString('hex')}:${mockAuthTag.toString('hex')}`;
    expect(encryptedString).toBe(expectedFormat);

    // Setup mocks for decryptString
    const mockDecrypted = Buffer.from(plainText, 'utf8');

    const mockDecipher = {
      setAuthTag: jest.fn(),
      update: jest.fn().mockReturnValue(mockDecrypted),
      final: jest.fn().mockReturnValue(Buffer.alloc(0)),
    };

    mockCreateDecipheriv.mockReturnValue(mockDecipher);

    const decrypted = aesService.decryptString(encryptedString);

    expect(decrypted).toBe(plainText);
  });

  it('should handle special characters and unicode', () => {
    const plainText = 'Hello 世界! 🌍 Special chars: @#$%^&*()';

    // Setup mocks
    const mockIv = Buffer.from('123456789012', 'utf8');
    const mockEncrypted = Buffer.from('special-encrypted', 'utf8');
    const mockAuthTag = Buffer.from('special-tag', 'utf8');

    const mockCipher = {
      update: jest.fn().mockReturnValue(mockEncrypted),
      final: jest.fn().mockReturnValue(Buffer.alloc(0)),
      getAuthTag: jest.fn().mockReturnValue(mockAuthTag),
    };

    mockRandomBytes.mockReturnValue(mockIv);
    mockCreateCipheriv.mockReturnValue(mockCipher);

    const encryptedString = aesService.encryptAsString(plainText);

    // Setup mocks for decryption
    const mockDecrypted = Buffer.from(plainText, 'utf8');

    const mockDecipher = {
      setAuthTag: jest.fn(),
      update: jest.fn().mockReturnValue(mockDecrypted),
      final: jest.fn().mockReturnValue(Buffer.alloc(0)),
    };

    mockCreateDecipheriv.mockReturnValue(mockDecipher);

    const decrypted = aesService.decryptString(encryptedString);

    expect(decrypted).toBe(plainText);
  });

  it('should generate different encrypted results for same input', () => {
    const plainText = 'Hello, World!';

    // Setup different IVs for each call
    const mockIv1 = Buffer.from('123456789011', 'utf8');
    const mockIv2 = Buffer.from('123456789022', 'utf8');
    const mockEncrypted = Buffer.from('encrypted', 'utf8');
    const mockAuthTag = Buffer.from('authtag', 'utf8');

    const mockCipher = {
      update: jest.fn().mockReturnValue(mockEncrypted),
      final: jest.fn().mockReturnValue(Buffer.alloc(0)),
      getAuthTag: jest.fn().mockReturnValue(mockAuthTag),
    };

    // First call
    mockRandomBytes.mockReturnValueOnce(mockIv1);
    mockCreateCipheriv.mockReturnValue(mockCipher);
    const result1 = aesService.encrypt(plainText);

    // Second call
    mockRandomBytes.mockReturnValueOnce(mockIv2);
    const result2 = aesService.encrypt(plainText);

    // IVs should be different
    expect(result1.iv).not.toBe(result2.iv);
    expect(result1.iv).toBe(mockIv1.toString('hex'));
    expect(result2.iv).toBe(mockIv2.toString('hex'));

    // Setup mocks for decryption to verify both decrypt to the same plaintext
    const mockDecrypted = Buffer.from(plainText, 'utf8');

    const mockDecipher = {
      setAuthTag: jest.fn(),
      update: jest.fn().mockReturnValue(mockDecrypted),
      final: jest.fn().mockReturnValue(Buffer.alloc(0)),
    };

    mockCreateDecipheriv.mockReturnValue(mockDecipher);

    const decrypted1 = aesService.decrypt(
      result1.encrypted,
      result1.iv,
      result1.authTag,
    );
    const decrypted2 = aesService.decrypt(
      result2.encrypted,
      result2.iv,
      result2.authTag,
    );

    expect(decrypted1).toBe(plainText);
    expect(decrypted2).toBe(plainText);
  });
});
