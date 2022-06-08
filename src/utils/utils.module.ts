import { UtilsPromise } from './utils.promise';
import { UtilsArray } from './utils.array';
import { UtilsDate } from './utils.date';

import { Module } from '@nestjs/common';

@Module({ providers: [UtilsArray, UtilsDate, UtilsPromise], exports: [UtilsArray, UtilsDate, UtilsPromise] })
export class UtilsModule {}
