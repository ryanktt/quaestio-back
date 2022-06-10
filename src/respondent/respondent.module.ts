import { RespondentRepository } from './respondent.repository';
import { RespondentHelper } from './respondent.helper';
import { RespondentSchema } from './respondent.schema';

import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';

@Module({
	imports: [MongooseModule.forFeature([{ name: 'Respondent', schema: RespondentSchema }])],
	providers: [RespondentRepository, RespondentHelper],
	exports: [RespondentHelper, RespondentRepository],
})
export class RespondentModule {}
