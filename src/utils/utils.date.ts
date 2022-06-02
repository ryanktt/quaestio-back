import { Injectable } from '@nestjs/common';
import moment, { unitOfTime } from 'moment';

@Injectable()
export class UtilsDate {
	addTimeToDate(date: Date, unit: unitOfTime.DurationConstructor, amount: number): Date {
		return moment(date).add(amount, unit).toDate();
	}

	getDateInMs(date: Date): number {
		return moment(date).valueOf();
	}
}
