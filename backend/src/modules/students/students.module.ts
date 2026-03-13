import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { SkillsModule } from '../skills/skills.module';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [SkillsModule, FilesModule],
  providers: [StudentsService],
  controllers: [StudentsController],
  exports: [StudentsService],
})
export class StudentsModule {}
