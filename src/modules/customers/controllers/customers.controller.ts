import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentPartner } from 'src/authentication/decorators/current-partner.decorator';
import {
  PartnerApiKeyGuard,
  PartnerInfo,
} from 'src/authentication/guards/partner-api-key.guard';

import {
  CustomersCreateDto,
  CustomersCreateResponseDto,
} from '../schemas/customers.dto';
import { CustomersService } from '../services/customers.service';

@ApiTags('Customers')
@Controller('/customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiSecurity('x-api-key-partner')
  @UseGuards(PartnerApiKeyGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create customer' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Customer created',
    type: CustomersCreateResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not Found' })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal Server Error',
  })
  async create(
    @Body() customer: CustomersCreateDto,
    @CurrentPartner() partner: PartnerInfo,
  ): Promise<CustomersCreateResponseDto | undefined> {
    return await this.customersService.create(customer, partner);
  }
}
