import { ResponseSchema } from './response.schema';

import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';

@Module({
	imports: [MongooseModule.forFeature([{ name: 'Response', schema: ResponseSchema }])],
})
export class ResponseModule {}
