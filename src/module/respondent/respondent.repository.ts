import { ERespondentErrorCode, ICreateRespondent } from './respondent.interface';
import { RespondentDocument, RespondentModel } from './respondent.schema';

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

	async create(params: ICreateRespondent): Promise<RespondentDocument> {
		const { userAgent, location, name, email, ip } = params;
		return this.respondentSchema.create({ userAgent, location, name, email, ip }).catch((err: Error) => {
			throw new AppError({
				code: ERespondentErrorCode.CREATE_RESPONDENT_ERROR,
				message: 'fail to create new respondent',
				originalError: err,
			});
		}) as Promise<RespondentDocument>;
	}
}
