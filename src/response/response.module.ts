import { ResponseRepository } from './response.repository';
import { ResponseSchema } from './response.schema';

import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';

@Module({
	imports: [MongooseModule.forFeature([{ name: 'Response', schema: ResponseSchema }])],
	providers: [ResponseRepository],
	exports: [ResponseRepository],
})
export class ResponseModule {}
