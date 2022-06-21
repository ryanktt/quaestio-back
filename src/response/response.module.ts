import { ResponseRepository } from './response.repository';
import { ResponseSchema } from './response.schema';
import { ResponseHelper } from './response.helper';

import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';

@Module({
	imports: [MongooseModule.forFeature([{ name: 'Response', schema: ResponseSchema }])],
	providers: [ResponseRepository, ResponseHelper],
	exports: [ResponseRepository, ResponseHelper],
})
export class ResponseModule {}
