import {
	QuestionnaireModel,
	QuestionnaireDocument,
	QuestionnaireQuizModel,
	QuestionnaireQuizDocument,
} from './questionnaire.schema';
import { EQuestionnaireErrorCode, ICreateQuestionnareParams } from './questionnaire.interface';

import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { AppError } from '@utils/*';

@Injectable()
export class QuestionnaireRepository {
	constructor(
		@InjectModel('QuestionnaireQuiz') private readonly questionnaireQuizSchema: QuestionnaireQuizModel,
		@InjectModel('Questionnaire') private readonly questionnaireSchema: QuestionnaireModel,
	) {}

	async fetchByIds(questionnaireIds: string[]): Promise<QuestionnaireDocument[]> {
		return this.questionnaireSchema
			.find({ _id: { $in: questionnaireIds } })
			.exec()
			.catch((err: Error) => {
				throw new AppError({
					code: EQuestionnaireErrorCode.FETCH_QUIZZES_ERROR,
					message: 'fail to fetch questionnaires by ids',
					originalError: err,
				});
			}) as Promise<QuestionnaireDocument[]>;
	}

	async createQuiz(params: ICreateQuestionnareParams): Promise<QuestionnaireQuizDocument> {
		return this.questionnaireQuizSchema.create(params).catch((err: Error) => {
			throw new AppError({
				code: EQuestionnaireErrorCode.CREATE_QUIZ_QUIZ_ERROR,
				message: 'fail to create questionnaire quiz',
				originalError: err,
			});
		}) as Promise<QuestionnaireQuizDocument>;
	}
}
