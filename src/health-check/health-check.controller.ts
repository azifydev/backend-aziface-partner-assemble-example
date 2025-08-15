import { timingSafeEqual } from 'crypto';

import {
  Controller,
  Get,
  HttpStatus,
  Headers,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  HealthCheckService,
  HealthCheck,
  MemoryHealthIndicator,
  DiskHealthIndicator,
  HealthCheckResult,
} from '@nestjs/terminus';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Performs health check for the application.
   *
   * @returns Health check results from the following checks:
   * - Memory heap usage (limit: 300MB)
   * - Memory RSS usage (limit: 300MB)
   * - Storage usage (path: '/', threshold: 90%)
   */
  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Check application health status' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Health check successful',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        info: { type: 'object' },
        error: { type: 'object' },
        details: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.SERVICE_UNAVAILABLE,
    description: 'Health check failed',
  })
  async check(
    @Headers('x-api-key') apiKey: string,
  ): Promise<HealthCheckResult> {
    if (!apiKey) {
      throw new BadRequestException('API key is required');
    }

    const response = await this.health.check([
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),

      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),

      () =>
        this.disk.checkStorage('storage', {
          path: '/',
          thresholdPercent: 0.9,
        }),
    ]);

    const storedKey: string = this.configService.getOrThrow<string>('API_KEY');
    const providedKey = apiKey || '';

    if (
      storedKey &&
      providedKey &&
      storedKey.length === providedKey.length &&
      timingSafeEqual(Buffer.from(storedKey), Buffer.from(providedKey))
    ) {
      return response;
    }

    throw new UnauthorizedException('Invalid API key');
  }

  /**
   * Retrieves the liveness status of the application.
   *
   * @returns An object containing the current status ('ok') and a timestamp in ISO format
   * @example
   * // Returns: { status: 'ok', timestamp: '2023-07-21T15:30:45.123Z' }
   */
  @Get('liveness')
  @ApiOperation({ summary: 'Liveness probe for Kubernetes' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Application is alive',
  })
  getLiveness(): { status: string; timestamp: string } {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  /**
   * Performs a readiness health check.
   *
   * This method checks if the application is ready to handle requests by verifying:
   * - Memory heap usage is less than 500MB
   *
   * @returns {Promise<HealthCheckResult>} The result of the health check containing
   * the status of the memory heap check.
   */
  @Get('readiness')
  @HealthCheck()
  @ApiOperation({ summary: 'Readiness probe for Kubernetes' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Application is ready to receive traffic',
  })
  @ApiResponse({
    status: HttpStatus.SERVICE_UNAVAILABLE,
    description: 'Application is not ready',
  })
  getReadiness(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 500 * 1024 * 1024),
    ]);
  }
}
