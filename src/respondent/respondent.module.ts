import { RespondentRepository } from './respondent.repository';
import { RespondentSchema } from './respondent.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';

@Module({
	imports: [MongooseModule.forFeature([{ name: 'Respondent', schema: RespondentSchema }])],
	providers: [RespondentRepository],
})
export class RespondentModule {}
