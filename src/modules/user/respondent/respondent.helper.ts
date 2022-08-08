import { IRespondentLocation } from './respondent.interface';
import { Injectable } from '@nestjs/common';
import { lookup } from 'geoip-lite';

@Injectable()
export class RespondentHelper {
	getRespondentLocationByIp(ip: string): IRespondentLocation | undefined {
		const location = lookup(ip);
		if (!location) return undefined;

		return {
			timezone: location.timezone,
			country: location.country,
			state: location.region,
			city: location.city,
		};
	}
}
