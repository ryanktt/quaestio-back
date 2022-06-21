import { ResponseRepository } from './response.repository';
import { ResponseService } from './response.service';
import { ResponseSchema } from './response.schema';
import { ResponseHelper } from './response.helper';

import { QuestionnaireModule } from 'src/questionnaire';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UtilsModule } from '@utils/*';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: 'Response', schema: ResponseSchema }]),
		forwardRef(() => UtilsModule),
		QuestionnaireModule,
	],
	providers: [ResponseRepository, ResponseHelper, ResponseService],
	exports: [ResponseRepository, ResponseHelper, ResponseService],
})
export class ResponseModule {}
