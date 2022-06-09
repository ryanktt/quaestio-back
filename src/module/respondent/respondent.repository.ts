import { RespondentDocument, RespondentModel } from './respondent.schema';
import { ERespondentErrorCode } from './respondent.interface';

import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { AppError } from '@utils/*';

@Injectable()
export class RespondentRepository {
	constructor(@InjectModel('Respondent') private readonly respondentSchema: RespondentModel) {}

	async fetchById(respondentId: string): Promise<RespondentDocument | null> {
		return this.respondentSchema
			.findById(respondentId)
			.exec()
			.catch((err: Error) => {
				throw new AppError({
					code: ERespondentErrorCode.FETCH_RESPONDENT_ERROR,
					message: 'fail to fetch respondent',
					originalError: err,
				});
			}) as Promise<RespondentDocument | null>;
	}
}
