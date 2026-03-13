import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { SkillsModule } from '../skills/skills.module';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [SkillsModule, FilesModule],
  providers: [JobsService],
  controllers: [JobsController],
  exports: [JobsService],
})
export class JobsModule {}
