import { Questionnaire, QuestionnaireModel } from '@modules/questionnaire/schema';
import { EQuestionnaireErrorCode } from '@modules/questionnaire/questionnaire.interface';
import { UtilsArray } from '@utils/utils.array';
import { InjectModel } from '@nestjs/mongoose';
import { AppError } from '@utils/utils.error';
import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';

@Injectable()
export class ResponseQuestionnaireRepository {
	constructor(
		@InjectModel('Questionnaire') private readonly questionnaireSchema: QuestionnaireModel,
		private readonly utilsArray: UtilsArray,
	) { }

	async fetchQuestionnaireByIds(questionnaireIds: string[]): Promise<Questionnaire[]> {
		return this.questionnaireSchema
			.find({ _id: { $in: questionnaireIds } })
			.lean()
			.exec()
			.catch((originalError: Error) => {
				throw new AppError({
					code: EQuestionnaireErrorCode.FETCH_QUESTIONNAIRES_ERROR,
					message: 'fail to fetch questionnaires by ids',
					originalError,
				});
			}) as Promise<Questionnaire[]>;
	}

	questionnaireLoader(): DataLoader<string, Questionnaire> {
		return new DataLoader<string, Questionnaire>(async (ids: string[]) => {
			const questionnaires = await this.fetchQuestionnaireByIds(ids);
			return this.utilsArray.getObjectsSortedByIds(questionnaires, '_id', ids);
		});
	}
}
