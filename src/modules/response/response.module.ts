import { ResponseRepository } from './response.repository';
import { ResponseResolver } from './response.resolver';
import { ResponseService } from './response.service';
import { ResponseHelper } from './response.helper';
import { ResponseSchema } from './schema';

import { QuestionnaireModule } from '@modules/questionnaire';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionModule } from '@modules/session';
import { UtilsModule } from '@utils/*';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: 'Response', schema: ResponseSchema }]),
		forwardRef(() => QuestionnaireModule),
		forwardRef(() => SessionModule),
		forwardRef(() => UtilsModule),
	],
	providers: [ResponseRepository, ResponseHelper, ResponseService, ResponseResolver],
	exports: [ResponseRepository, ResponseHelper, ResponseService],
})
export class ResponseModule {}
