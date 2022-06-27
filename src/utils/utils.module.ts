import { UtilsPromise } from './utils.promise';
import { UtilsArray } from './utils.array';
import { UtilsDate } from './utils.date';
import { UtilsDoc } from './utils.doc';

import { Module } from '@nestjs/common';

@Module({
	providers: [UtilsArray, UtilsDate, UtilsPromise, UtilsDoc],
	exports: [UtilsArray, UtilsDate, UtilsPromise, UtilsDoc],
})
export class UtilsModule {}
