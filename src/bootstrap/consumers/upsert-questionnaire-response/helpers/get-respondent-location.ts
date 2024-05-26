import { RespondentLocation } from '../types/types';
import geoIp from 'geoip-lite';

export function getRespondentLocationByIp(respondentIp: string): RespondentLocation | undefined {
	const data = geoIp.lookup(respondentIp);
	if (!data) return undefined;
	return {
		timezone: data.timezone,
		country: data.country,
		region: data.region,
		city: data.city,
	};
}
