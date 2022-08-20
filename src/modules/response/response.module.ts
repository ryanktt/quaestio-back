import { ResponseRepository } from './response.repository';
import { ResponseResolver } from './response.resolver';
import { ResponseService } from './response.service';
import { ResponseHelper } from './response.helper';
import { ResponseSchema } from './schema';

import { ResponseQuestionnaireModule } from '../shared/response-questionnaire/response-questionnaire.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UtilsModule } from '@utils/utils.module';
import { Module } from '@nestjs/common';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: 'Response', schema: ResponseSchema }]),
		ResponseQuestionnaireModule,
		UtilsModule,
	],
	providers: [ResponseRepository, ResponseHelper, ResponseService, ResponseResolver],
	exports: [ResponseRepository, ResponseHelper, ResponseService],
})
export class ResponseModule {}
