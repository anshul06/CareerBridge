import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';
import { Roles } from '../../shared/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { PaginationDto } from '../../shared/dto/pagination.dto';

@ApiTags('Companies')
@ApiBearerAuth()
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Roles(Role.ADMIN, Role.RECRUITER)
  @Post()
  @ApiOperation({ summary: 'Create company profile' })
  create(@Body() dto: CreateCompanyDto) {
    return this.companiesService.create(dto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all companies with job count' })
  findAll(@Query() pagination: PaginationDto) {
    return this.companiesService.findAll(pagination);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get company details with open jobs' })
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @Roles(Role.ADMIN, Role.RECRUITER)
  @Put(':id')
  @ApiOperation({ summary: 'Update company profile' })
  update(@Param('id') id: string, @Body() dto: UpdateCompanyDto) {
    return this.companiesService.update(id, dto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete company (soft delete)' })
  remove(@Param('id') id: string) {
    return this.companiesService.remove(id);
  }
}
