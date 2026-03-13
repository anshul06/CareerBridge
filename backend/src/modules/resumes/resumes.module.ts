import { Module } from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { ResumesController } from './resumes.controller';
import { StudentsModule } from '../students/students.module';
import { SkillsModule } from '../skills/skills.module';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [StudentsModule, SkillsModule, FilesModule],
  providers: [ResumesService],
  controllers: [ResumesController],
  exports: [ResumesService],
})
export class ResumesModule {}
