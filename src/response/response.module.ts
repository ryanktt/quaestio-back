import { ResponseRepository } from './response.repository';
import { ResponseResolver } from './response.resolver';
import { ResponseService } from './response.service';
import { ResponseHelper } from './response.helper';
import { ResponseSchema } from './schema';

import { QuestionnaireModule } from 'src/questionnaire';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionModule } from 'src/session';
import { UtilsPromise } from '@utils/*';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: 'Response', schema: ResponseSchema }]),
		forwardRef(() => SessionModule),
		forwardRef(() => QuestionnaireModule),
	],
	providers: [ResponseRepository, ResponseHelper, ResponseService, ResponseResolver, UtilsPromise],
	exports: [ResponseRepository, ResponseHelper, ResponseService],
})
export class ResponseModule {}
