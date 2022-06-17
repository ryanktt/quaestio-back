import { UtilsPromise } from './utils.promise';
import { UtilsArray } from './utils.array';
import { UtilsDate } from './utils.date';
import { UtilsAuth } from './utils.auth';

import { Module } from '@nestjs/common';

@Module({
	providers: [UtilsArray, UtilsDate, UtilsPromise, UtilsAuth],
	exports: [UtilsArray, UtilsDate, UtilsPromise, UtilsAuth],
})
export class UtilsModule {}
