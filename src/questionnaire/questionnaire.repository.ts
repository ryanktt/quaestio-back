import { QuestionnaireModel, QuestionnaireDocument } from './questionnaire.schema';
import { EQuestionnaireErrorCode } from './questionnaire.interface';

import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { AppError } from '@utils/*';

@Injectable()
export class QuestionnaireRepository {
	constructor(@InjectModel('Questionnaire') private readonly questionnaireSchema: QuestionnaireModel) {}

	async fetchByIds(questionnaireIds: string[]): Promise<QuestionnaireDocument[]> {
		return this.questionnaireSchema
			.find({ _id: { $in: questionnaireIds } })
			.exec()
			.catch((err: Error) => {
				throw new AppError({
					code: EQuestionnaireErrorCode.FETCH_QUIZZES_ERROR,
					message: 'fail to fetch questionnairezes by ids',
					originalError: err,
				});
			}) as Promise<QuestionnaireDocument[]>;
	}
}
