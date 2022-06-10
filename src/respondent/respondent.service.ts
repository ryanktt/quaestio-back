import { ISignInRespondentParams } from './respondent.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RespondentService {
	signIn({ email, ip, name, userAgent }: ISignInRespondentParams): void {
		console.log('');
	}
}
