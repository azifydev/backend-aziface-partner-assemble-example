import { Test, TestingModule } from '@nestjs/testing';

import { Logger } from 'nestjs-pino';
import { Dispatcher } from 'undici';

import {
  HttpClientService,
  HttpErrorResponse,
  HttpClientOptions,
  HttpResponse,
} from './http-client.service';

// Mock the undici module
jest.mock('undici', () => ({
  request: jest.fn(),
}));

const { request } = require('undici');

describe('HttpClientService', () => {
  let service: HttpClientService;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(async () => {
    // Create logger mock
    mockLogger = {
      debug: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      log: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HttpClientService,
        {
          provide: Logger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<HttpClientService>(HttpClientService);
    jest.clearAllMocks();
  });

  describe('Basic functionality', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('get', () => {
    it('should make a successful GET request', async () => {
      // Arrange
      const url = 'https://api.example.com/users';
      const expectedData = { users: [{ id: 1, name: 'John' }] };

      const mockResponse = {
        statusCode: 200,
        headers: { 'content-type': 'application/json' },
        body: {
          json: jest.fn().mockResolvedValue(expectedData),
        },
      };

      request.mockResolvedValue(mockResponse);

      // Act
      const result = await service.get(url);

      // Assert
      expect(request).toHaveBeenCalledTimes(1);
      expect(request).toHaveBeenCalledWith(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': expect.any(String),
        },
        body: undefined,
        headersTimeout: 30000,
        bodyTimeout: 30000,
      });

      expect(result).toEqual<HttpResponse<typeof expectedData>>({
        data: expectedData,
        status: 200,
        statusText: 'OK',
        statusDescription: 'The request has succeeded.',
        headers: { 'content-type': 'application/json' },
        requestId: expect.any(String),
      });

      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringMatching(/Starting GET request to/),
      );
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringMatching(/GET .* - 200/),
      );
    });

    it('should handle GET request with custom options', async () => {
      // Arrange
      const url = 'https://api.example.com/data';
      const options: HttpClientOptions = {
        headers: { Authorization: 'Bearer token123' },
        timeout: 15000,
        params: { page: 1, limit: 10, active: true },
      };

      const mockResponse = {
        statusCode: 200,
        headers: { 'content-type': 'application/json' },
        body: {
          json: jest.fn().mockResolvedValue({}),
        },
      };

      request.mockResolvedValue(mockResponse);

      // Act
      await service.get(url, options);

      // Assert
      expect(request).toHaveBeenCalledWith(
        'https://api.example.com/data?page=1&limit=10&active=true',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Request-ID': expect.any(String),
            Authorization: 'Bearer token123',
          },
          body: undefined,
          headersTimeout: 15000,
          bodyTimeout: 15000,
        },
      );
    });
  });

  describe('post', () => {
    it('should make a successful POST request with body', async () => {
      // Arrange
      const url = 'https://api.example.com/users';
      const body = { name: 'John Doe', email: 'john@example.com' };
      const expectedData = { id: 1, ...body };

      const mockResponse = {
        statusCode: 201,
        headers: { 'content-type': 'application/json' },
        body: {
          json: jest.fn().mockResolvedValue(expectedData),
        },
      };

      request.mockResolvedValue(mockResponse);

      // Act
      const result = await service.post(url, body);

      // Assert
      expect(request).toHaveBeenCalledWith(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': expect.any(String),
        },
        body: JSON.stringify(body),
        headersTimeout: 30000,
        bodyTimeout: 30000,
      });

      expect(result.data).toEqual(expectedData);
      expect(result.status).toBe(201);
      expect(result.statusText).toBe('Created');
    });

    it('should make POST request without body', async () => {
      // Arrange
      const url = 'https://api.example.com/action';

      const mockResponse = {
        statusCode: 204,
        headers: { 'content-type': 'application/json' },
        body: {
          json: jest.fn().mockResolvedValue({}),
        },
      };

      request.mockResolvedValue(mockResponse);

      // Act
      const result = await service.post(url);

      // Assert
      expect(request).toHaveBeenCalledWith(url, {
        method: 'POST',
        headers: expect.any(Object),
        body: undefined,
        headersTimeout: 30000,
        bodyTimeout: 30000,
      });

      expect(result.status).toBe(204);
      expect(result.statusText).toBe('No Content');
    });
  });

  describe('put', () => {
    it('should make a successful PUT request', async () => {
      // Arrange
      const url = 'https://api.example.com/users/1';
      const body = { name: 'Jane Doe', email: 'jane@example.com' };

      const mockResponse = {
        statusCode: 200,
        headers: { 'content-type': 'application/json' },
        body: {
          json: jest.fn().mockResolvedValue(body),
        },
      };

      request.mockResolvedValue(mockResponse);

      // Act
      const result = await service.put(url, body);

      // Assert
      expect(request).toHaveBeenCalledWith(url, {
        method: 'PUT',
        headers: expect.any(Object),
        body: JSON.stringify(body),
        headersTimeout: 30000,
        bodyTimeout: 30000,
      });

      expect(result.status).toBe(200);
    });
  });

  describe('patch', () => {
    it('should make a successful PATCH request', async () => {
      // Arrange
      const url = 'https://api.example.com/users/1';
      const body = { email: 'newemail@example.com' };

      const mockResponse = {
        statusCode: 200,
        headers: { 'content-type': 'application/json' },
        body: {
          json: jest.fn().mockResolvedValue(body),
        },
      };

      request.mockResolvedValue(mockResponse);

      // Act
      const result = await service.patch(url, body);

      // Assert
      expect(request).toHaveBeenCalledWith(url, {
        method: 'PATCH',
        headers: expect.any(Object),
        body: JSON.stringify(body),
        headersTimeout: 30000,
        bodyTimeout: 30000,
      });

      expect(result.status).toBe(200);
    });
  });

  describe('delete', () => {
    it('should make a successful DELETE request', async () => {
      // Arrange
      const url = 'https://api.example.com/users/1';

      const mockResponse = {
        statusCode: 204,
        headers: { 'content-type': 'application/json' },
        body: {
          json: jest.fn().mockResolvedValue({}),
        },
      };

      request.mockResolvedValue(mockResponse);

      // Act
      const result = await service.delete(url);

      // Assert
      expect(request).toHaveBeenCalledWith(url, {
        method: 'DELETE',
        headers: expect.any(Object),
        body: undefined,
        headersTimeout: 30000,
        bodyTimeout: 30000,
      });

      expect(result.status).toBe(204);
      expect(result.statusText).toBe('No Content');
    });
  });

  describe('error handling', () => {
    it('should throw HttpErrorResponse for 4xx errors', async () => {
      // Arrange
      const url = 'https://api.example.com/not-found';
      const errorData = {
        error: {
          code: 'NOT_FOUND',
          message: 'Resource not found',
          status: 404,
        },
      };

      const mockResponse = {
        statusCode: 404,
        headers: { 'content-type': 'application/json' },
        body: {
          json: jest.fn().mockResolvedValue(errorData),
        },
      };

      request.mockResolvedValue(mockResponse);

      // Act & Assert
      await expect(service.get(url)).rejects.toThrow(HttpErrorResponse);

      try {
        await service.get(url);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpErrorResponse);
        expect((error as HttpErrorResponse).status).toBe(404);
        expect((error as HttpErrorResponse).data).toEqual(errorData);
      }
    });

    it('should throw HttpErrorResponse for 5xx errors', async () => {
      // Arrange
      const url = 'https://api.example.com/server-error';
      const errorData = {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
          status: 500,
        },
      };

      const mockResponse = {
        statusCode: 500,
        headers: { 'content-type': 'application/json' },
        body: {
          json: jest.fn().mockResolvedValue(errorData),
        },
      };

      request.mockResolvedValue(mockResponse);

      // Act & Assert
      await expect(service.get(url)).rejects.toThrow(HttpErrorResponse);

      try {
        await service.get(url);
      } catch (error) {
        expect((error as HttpErrorResponse).status).toBe(500);
      }
    });
  });

  describe('retry logic', () => {
    it('should retry failed requests', async () => {
      // Arrange
      const url = 'https://api.example.com/unstable';
      const options: HttpClientOptions = { retries: 2 };

      // Mock request to fail twice, then succeed
      request
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          statusCode: 200,
          headers: { 'content-type': 'application/json' },
          body: {
            json: jest.fn().mockResolvedValue({ success: true }),
          },
        });

      // Act
      const result = await service.get(url, options);

      // Assert
      expect(request).toHaveBeenCalledTimes(3);
      expect(result.data).toEqual({ success: true });
      expect(mockLogger.warn).toHaveBeenCalledTimes(2);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringMatching(/Attempt .* failed, retrying in/),
      );
    });

    it('should throw error after all retries fail', async () => {
      // Arrange
      const url = 'https://api.example.com/always-fails';
      const options: HttpClientOptions = { retries: 1 };

      request.mockRejectedValue(new Error('Persistent error'));

      // Act & Assert
      await expect(service.get(url, options)).rejects.toThrow(
        'Persistent error',
      );
      expect(request).toHaveBeenCalledTimes(2); // Initial attempt + 1 retry
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringMatching(/failed after .* attempts/),
      );
    });
  });

  describe('response processing', () => {
    it('should handle non-JSON responses', async () => {
      // Arrange
      const url = 'https://api.example.com/text';
      const textResponse = 'Plain text response';

      const mockResponse = {
        statusCode: 200,
        headers: { 'content-type': 'text/plain' },
        body: {
          text: jest.fn().mockResolvedValue(textResponse),
          json: jest.fn().mockRejectedValue(new Error('Not JSON')),
        },
      };

      request.mockResolvedValue(mockResponse);

      // Act
      const result = await service.get(url);

      // Assert
      expect(result.data).toBe(textResponse);
      expect(mockResponse.body.text).toHaveBeenCalled();
    });

    it('should normalize response headers correctly', async () => {
      // Arrange
      const url = 'https://api.example.com/headers';

      const mockResponse = {
        statusCode: 200,
        headers: {
          'content-type': 'application/json',
          'x-custom-header': ['value1', 'value2'],
          'x-single-header': 'single-value',
        },
        body: {
          json: jest.fn().mockResolvedValue({}),
        },
      };

      request.mockResolvedValue(mockResponse);

      // Act
      const result = await service.get(url);

      // Assert
      expect(result.headers).toEqual({
        'content-type': 'application/json',
        'x-custom-header': 'value1, value2',
        'x-single-header': 'single-value',
      });
    });

    it('should include correct status descriptions', async () => {
      // Arrange
      const testCases = [
        { code: 200, text: 'OK', description: 'The request has succeeded.' },
        {
          code: 404,
          text: 'Not Found',
          description:
            'The server can not find the requested resource. In the browser, this means the URL is not recognized.',
        },
        {
          code: 500,
          text: 'Internal Server Error',
          description:
            'The server encountered an unexpected condition that prevented it from fulfilling the request.',
        },
      ];

      for (const testCase of testCases) {
        const mockResponse = {
          statusCode: testCase.code,
          headers: { 'content-type': 'application/json' },
          body: {
            json: jest.fn().mockResolvedValue({}),
          },
        };

        request.mockResolvedValue(mockResponse);

        if (testCase.code >= 400) {
          // For error responses, expect an exception
          await expect(service.get('https://example.com')).rejects.toThrow();
        } else {
          // For success responses, check the status text and description
          const result = await service.get('https://example.com');
          expect(result.statusText).toBe(testCase.text);
          expect(result.statusDescription).toBe(testCase.description);
        }
      }
    });
  });

  describe('URL building with parameters', () => {
    it('should build URL with query parameters', async () => {
      // Arrange
      const baseUrl = 'https://api.example.com/search';
      const params = { q: 'test', page: 1, active: true };

      const mockResponse = {
        statusCode: 200,
        headers: { 'content-type': 'application/json' },
        body: {
          json: jest.fn().mockResolvedValue({}),
        },
      };

      request.mockResolvedValue(mockResponse);

      // Act
      await service.get(baseUrl, { params });

      // Assert
      expect(request).toHaveBeenCalledWith(
        'https://api.example.com/search?q=test&page=1&active=true',
        expect.any(Object),
      );
    });

    it('should append parameters to URL with existing query string', async () => {
      // Arrange
      const baseUrl = 'https://api.example.com/search?existing=param';
      const params = { new: 'value' };

      const mockResponse = {
        statusCode: 200,
        headers: { 'content-type': 'application/json' },
        body: {
          json: jest.fn().mockResolvedValue({}),
        },
      };

      request.mockResolvedValue(mockResponse);

      // Act
      await service.get(baseUrl, { params });

      // Assert
      expect(request).toHaveBeenCalledWith(
        'https://api.example.com/search?existing=param&new=value',
        expect.any(Object),
      );
    });

    it('should handle empty parameters', async () => {
      // Arrange
      const baseUrl = 'https://api.example.com/search';
      const params = {};

      const mockResponse = {
        statusCode: 200,
        headers: { 'content-type': 'application/json' },
        body: {
          json: jest.fn().mockResolvedValue({}),
        },
      };

      request.mockResolvedValue(mockResponse);

      // Act
      await service.get(baseUrl, { params });

      // Assert
      expect(request).toHaveBeenCalledWith(
        baseUrl, // Should remain unchanged
        expect.any(Object),
      );
    });
  });

  describe('edge cases', () => {
    it('should handle request with no options', async () => {
      // Arrange
      const url = 'https://api.example.com/simple';

      const mockResponse = {
        statusCode: 200,
        headers: { 'content-type': 'application/json' },
        body: {
          json: jest.fn().mockResolvedValue({}),
        },
      };

      request.mockResolvedValue(mockResponse);

      // Act
      const result = await service.get(url);

      // Assert
      expect(result).toHaveProperty('requestId');
      expect(result.requestId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });

    it('should handle unknown status codes', async () => {
      // Arrange
      const url = 'https://api.example.com/unknown';

      const mockResponse = {
        statusCode: 999, // Unknown status code
        headers: { 'content-type': 'application/json' },
        body: {
          json: jest.fn().mockResolvedValue({}),
        },
      };

      request.mockResolvedValue(mockResponse);

      // Act & Assert
      await expect(service.get(url)).rejects.toThrow(); // Should treat as error since >= 400
    });
  });
});
