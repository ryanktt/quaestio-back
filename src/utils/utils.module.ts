import { UtilsPromise } from './utils.promise';
import { UtilsArray } from './utils.array';
import { UtilsDate } from './utils.date';
import { UtilsAWS } from './utils.aws';
import { UtilsDoc } from './utils.doc';

import { Module } from '@nestjs/common';

@Module({
	providers: [UtilsArray, UtilsDate, UtilsPromise, UtilsDoc, UtilsAWS],
	exports: [UtilsArray, UtilsDate, UtilsPromise, UtilsDoc, UtilsAWS],
})
export class UtilsModule {}
