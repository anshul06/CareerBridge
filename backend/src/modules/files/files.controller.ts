import {
  Controller,
  Get,
  Param,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import * as fs from 'fs';
import { FilesService } from './files.service';

@ApiTags('Files')
@ApiBearerAuth()
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get(':id/download')
  @ApiOperation({ summary: 'Download a file by ID' })
  async downloadFile(@Param('id') id: string, @Res() res: Response) {
    const { record, absolutePath } = await this.filesService.getFile(id);
    if (!fs.existsSync(absolutePath)) throw new NotFoundException('File not found');

    res.setHeader('Content-Disposition', `attachment; filename="${record.originalName}"`);
    res.setHeader('Content-Type', record.mimeType);
    res.sendFile(absolutePath);
  }

  @Get(':id/metadata')
  @ApiOperation({ summary: 'Get file metadata' })
  async getFileMetadata(@Param('id') id: string) {
    const { record } = await this.filesService.getFile(id);
    return record;
  }
}
