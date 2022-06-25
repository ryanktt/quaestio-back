import { ResponseRepository } from './response.repository';
import { ResponseResolver } from './response.resolver';
import { ResponseService } from './response.service';
import { ResponseHelper } from './response.helper';
import { ResponseSchema } from './schema';

import { QuestionnaireModule } from 'src/questionnaire';
import { MongooseModule } from '@nestjs/mongoose';
import { UtilsPromise } from '@utils/*';
import { Module } from '@nestjs/common';

@Module({
	imports: [MongooseModule.forFeature([{ name: 'Response', schema: ResponseSchema }]), QuestionnaireModule],
	providers: [ResponseRepository, ResponseHelper, ResponseService, ResponseResolver, UtilsPromise],
	exports: [ResponseRepository, ResponseHelper, ResponseService],
})
export class ResponseModule {}
