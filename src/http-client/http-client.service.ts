/* eslint-disable unicorn/custom-error-definition */
/* eslint-disable security/detect-object-injection */

import { randomUUID } from 'crypto';

import { Injectable } from '@nestjs/common';

import { Logger } from 'nestjs-pino';
import { Dispatcher, request } from 'undici';

export interface HttpClientOptions {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  params?: Record<string, any>;
}

export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  statusDescription: string;
  headers: Record<string, string>;
  requestId: string;
}

type ValidationIssues = Record<string, string>;

interface ErrorData {
  error: {
    code: string;
    message: string | string[];
    validationIssues?: ValidationIssues;
  };
  statusCode: number;
  message?: string;
  messages?: string;
  stack?: string;
}

export interface ErrorWithResponse {
  response?: {
    error?: any;
    [key: string]: any;
  };
  data?: any;
  [key: string]: any;
}

export interface ErrorMessagesResponse {
  messages?: any;
  [key: string]: any;
}

export class HttpErrorResponse extends Error {
  public constructor(response: Dispatcher.ResponseData<null>, data: ErrorData) {
    super();
    this.status = response.statusCode;
    this.data = data;
  }

  public status: number;
  public data: ErrorData;
}

@Injectable()
export class HttpClientService {
  public constructor(private readonly logger: Logger) {}

  private getStatusText(statusCode: number): string {
    const statusMap: Record<number, string> = {
      100: 'Continue',
      101: 'Switching Protocols',
      102: 'Processing',

      // 2xx Success
      200: 'OK',
      201: 'Created',
      202: 'Accepted',
      203: 'Non-Authoritative Information',
      204: 'No Content',
      205: 'Reset Content',
      206: 'Partial Content',
      207: 'Multi-Status',
      208: 'Already Reported',
      226: 'IM Used',

      // 3xx Redirection
      300: 'Multiple Choices',
      301: 'Moved Permanently',
      302: 'Found',
      303: 'See Other',
      304: 'Not Modified',
      305: 'Use Proxy',
      307: 'Temporary Redirect',
      308: 'Permanent Redirect',

      // 4xx Client Error
      400: 'Bad Request',
      401: 'Unauthorized',
      402: 'Payment Required',
      403: 'Forbidden',
      404: 'Not Found',
      405: 'Method Not Allowed',
      406: 'Not Acceptable',
      407: 'Proxy Authentication Required',
      408: 'Request Timeout',
      409: 'Conflict',
      410: 'Gone',
      411: 'Length Required',
      412: 'Precondition Failed',
      413: 'Payload Too Large',
      414: 'URI Too Long',
      415: 'Unsupported Media Type',
      416: 'Range Not Satisfiable',
      417: 'Expectation Failed',
      418: "I'm a teapot",
      421: 'Misdirected Request',
      422: 'Unprocessable Entity',
      423: 'Locked',
      424: 'Failed Dependency',
      425: 'Too Early',
      426: 'Upgrade Required',
      428: 'Precondition Required',
      429: 'Too Many Requests',
      431: 'Request Header Fields Too Large',
      451: 'Unavailable For Legal Reasons',

      // 5xx Server Error
      500: 'Internal Server Error',
      501: 'Not Implemented',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
      504: 'Gateway Timeout',
      505: 'HTTP Version Not Supported',
      506: 'Variant Also Negotiates',
      507: 'Insufficient Storage',
      508: 'Loop Detected',
      510: 'Not Extended',
      511: 'Network Authentication Required',
    };

    return statusMap[statusCode] || 'Unknown Status';
  }

  private getStatusDescription(statusCode: number): string {
    const descriptionMap: Record<number, string> = {
      100: 'The server has received the request headers and the client should proceed to send the request body.',
      101: 'The server is switching protocols as requested by the client.',
      102: 'The server is processing the request but has not yet completed it.',
      200: 'The request has succeeded.',
      201: 'The request has been fulfilled and resulted in a new resource being created.',
      202: 'The request has been accepted for processing, but the processing has not been completed.',
      203: 'The server successfully processed the request, but is returning information that may be from another source.',
      204: 'The server successfully processed the request, but is not returning any content.',
      205: 'The server successfully processed the request, but is not returning any content and requires the requester to reset the document view.',
      206: 'The server is delivering only part of the resource due to a range header sent by the client.',
      207: 'The message body that follows is an XML message and can contain a number of separate response codes.',
      208: 'The members of a DAV binding have already been enumerated in a previous reply to this request, and are not being included again.',
      226: 'The server has fulfilled a GET request for the resource, and the response is a representation of the result of one or more instance-manipulations applied to the current instance.',
      300: 'The request has more than one possible response. The user or user agent should choose one of them.',
      301: 'The requested resource has been assigned a new permanent URI and any future references to this resource should use one of the returned URIs.',
      302: 'The requested resource resides temporarily under a different URI. Since the redirection might be altered on occasion, the client should continue to use the original URI for future requests.',
      303: 'The response to the request can be found under a different URI and should be retrieved using a GET method on that resource.',
      304: 'The resource has not been modified since the last request, so the client can use its cached version.',
      305: 'The requested resource must be accessed through the proxy given by the Location field.',
      307: 'The requested resource resides temporarily under a different URI. The client should continue to use the original URI for future requests.',
      308: 'The requested resource has been permanently moved to a new URI, and future references should use the new URI.',
      400: 'The server cannot or will not process the request due to a client error (e.g., malformed request syntax, invalid request message framing, or deceptive request routing).',
      401: 'The request has not been applied because it lacks valid authentication credentials for the target resource.',
      402: 'Reserved for future use. The original intention was that this code would be used for digital payment systems, but it is not widely used.',
      403: 'The server understood the request but refuses to authorize it.',
      404: 'The server can not find the requested resource. In the browser, this means the URL is not recognized.',
      405: 'The request method is known by the server but is not supported by the target resource.',
      406: 'The server can only generate a response that is not accepted by the client according to the Accept headers sent in the request.',
      407: 'The client must first authenticate itself with the proxy.',
      408: 'The server timed out waiting for the request. According to HTTP specifications, the client should repeat the request.',
      409: 'The request could not be completed due to a conflict with the current state of the target resource.',
      410: 'The target resource is no longer available at the origin server and that this condition is likely to be permanent.',
      411: 'The server refuses to accept the request without a defined Content-Length.',
      412: 'The server does not meet one of the preconditions that the requester put on the request.',
      413: 'The server is refusing to process a request because the request payload is larger than the server is willing or able to process.',
      414: 'The server is refusing to service the request because the request-target is longer than the server is willing to interpret.',
      415: 'The server is refusing to service the request because the payload is in a format not supported by the server for the HTTP method used.',
      416: 'The server cannot serve the requested range because the current resource does not have that many bytes.',
      417: 'The server cannot meet the requirements of the Expect request-header field.',
      418: 'The server refuses to brew coffee because it is, permanently, a teapot.',
      421: 'The request was directed at a server that is not able to produce a response.',
      422: 'The request was well-formed but was unable to be followed due to semantic errors.',
      423: 'The resource that is being accessed is locked.',
      424: 'The request failed due to failure of a previous request (e.g., a PROPPATCH).',
      425: 'Indicates that the server is unwilling to risk processing a request that might be replayed.',
      426: 'The server refuses to perform the request using the current protocol but might be willing to do so after the client upgrades to a different protocol.',
      428: 'The origin server requires the request to be conditional.',
      429: 'The user has sent too many requests in a given amount of time ("rate limiting").',
      431: 'The server is unwilling to process the request because its header fields are too large.',
      451: 'The user-agent requested a resource that cannot legally be provided, such as a web page censored by a government.',
      500: 'The server encountered an unexpected condition that prevented it from fulfilling the request.',
      501: 'The server does not support the functionality required to fulfill the request.',
      502: 'The server, while acting as a gateway or proxy, received an invalid response from the upstream server it accessed in attempting to fulfill the request.',
      503: 'The server is currently unable to handle the request due to temporary overloading or maintenance of the server.',
      504: 'The server, while acting as a gateway or proxy, did not receive a timely response from the upstream server or some other auxiliary server.',
      505: 'The server does not support the HTTP protocol version that was used in the request message.',
      506: 'The server has an internal configuration error: the chosen variant resource is configured to engage in transparent content negotiation itself, and is therefore not a proper end point in the negotiation process.',
      507: 'The server is unable to store the representation needed to complete the request.',
      508: 'The server detected an infinite loop while processing the request.',
      510: 'The server requires further extensions to fulfill the request.',
      511: 'The client needs to authenticate to gain network access.',
    };

    return descriptionMap[statusCode] || 'No description available';
  }

  async get<T = any>(
    url: string,
    options?: HttpClientOptions,
  ): Promise<HttpResponse<T>> {
    return await this.request<T>('GET', url, undefined, options);
  }

  async post<T = any>(
    url: string,
    body?: Record<string, any>,
    options?: HttpClientOptions,
  ): Promise<HttpResponse<T>> {
    return await this.request<T>('POST', url, body, options);
  }

  async put<T = any>(
    url: string,
    body?: Record<string, any>,
    options?: HttpClientOptions,
  ): Promise<HttpResponse<T>> {
    return await this.request<T>('PUT', url, body, options);
  }

  async patch<T = any>(
    url: string,
    body?: Record<string, any>,
    options?: HttpClientOptions,
  ): Promise<HttpResponse<T>> {
    return await this.request<T>('PATCH', url, body, options);
  }

  async delete<T = any>(
    url: string,
    options?: HttpClientOptions,
  ): Promise<HttpResponse<T>> {
    return await this.request<T>('DELETE', url, undefined, options);
  }

  private buildUrlWithParams(
    url: string,
    params?: Record<string, string | number | boolean>,
  ): string {
    if (!params || Object.keys(params).length === 0) {
      return url;
    }

    const queryString = new URLSearchParams(
      Object.entries(params).reduce(
        (acc, [key, value]) => {
          acc[key] = String(value);
          return acc;
        },
        {} as Record<string, string>,
      ),
    ).toString();

    return url + (url.includes('?') ? '&' : '?') + queryString;
  }

  private buildRequestHeaders(
    headers: Record<string, string>,
    requestId: string,
  ): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-Request-ID': requestId,
      ...headers,
    };
  }

  private normalizeResponseHeaders(
    headers: Record<string, any>,
  ): Record<string, string> {
    const responseHeaders: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers)) {
      responseHeaders[key] = Array.isArray(value)
        ? value.join(', ')
        : (value as string);
    }
    return responseHeaders;
  }

  private async parseResponseData<T>(
    response: Dispatcher.ResponseData<null>,
  ): Promise<T> {
    const contentType = response.headers['content-type'] as string;
    return contentType.includes('application/json')
      ? ((await response.body.json()) as T)
      : ((await response.body.text()) as T);
  }

  private async executeRequest<T>(
    method: string,
    finalUrl: string,
    requestHeaders: Record<string, string>,
    body: Record<string, any> | undefined,
    timeout: number,
    requestId: string,
  ): Promise<HttpResponse<T>> {
    const response = await request(finalUrl, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      headersTimeout: timeout,
      bodyTimeout: timeout,
    });

    const responseHeaders = this.normalizeResponseHeaders(response.headers);
    const data = await this.parseResponseData<T>(response);

    this.logger.debug(
      `[${requestId}] ${method} ${finalUrl} - ${response.statusCode}`,
    );

    if (response.statusCode >= 400) {
      throw new HttpErrorResponse(response, data as ErrorData);
    }

    return {
      data,
      status: response.statusCode,
      statusText: this.getStatusText(response.statusCode),
      statusDescription: this.getStatusDescription(response.statusCode),
      headers: responseHeaders,
      requestId,
    };
  }

  private async request<T>(
    method: string,
    url: string,
    body?: Record<string, any>,
    options: HttpClientOptions = {},
  ): Promise<HttpResponse<T>> {
    const requestId = randomUUID();
    const { headers = {}, timeout = 30_000, retries = 0, params } = options;

    const finalUrl = this.buildUrlWithParams(url, params);
    const requestHeaders = this.buildRequestHeaders(headers, requestId);

    this.logger.debug(`[${requestId}] Starting ${method} request to ${url}`);

    let lastError: Error = new Error(`Request to ${url} failed`);

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await this.executeRequest<T>(
          method,
          finalUrl,
          requestHeaders,
          body,
          timeout,
          requestId,
        );
      } catch (error) {
        lastError = error as Error;

        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000;
          this.logger.warn(
            `[${requestId}] Attempt ${attempt + 1} failed, retrying in ${delay}ms: ${(error as Error).message}`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          this.logger.error(
            `[${requestId}] ${method} ${url} failed after ${attempt + 1} attempts: ${(error as Error).message}`,
          );
        }
      }
    }

    throw lastError;
  }
}
