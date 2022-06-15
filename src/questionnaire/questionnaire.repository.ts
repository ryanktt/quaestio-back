import {
	QuestionnaireModel,
	QuestionnaireDocument,
	QuestionnaireExamModel,
	QuestionnaireSurveyModel,
	QuestionnaireExamDocument,
	QuestionnaireSurveyDocument,
} from './questionnaire.schema';
import { EQuestionnaireErrorCode } from './questionnaire.interface';

import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { AppError } from '@utils/*';

@Injectable()
export class QuestionnaireRepository {
	constructor(
		@InjectModel('QuestionnaireSurvey') private readonly surveySchema: QuestionnaireSurveyModel,
		@InjectModel('QuestionnaireExam') private readonly examSchema: QuestionnaireExamModel,
		@InjectModel('Questionnaire') private readonly questionnaireSchema: QuestionnaireModel,
	) {}

	async fetchExamsByIds(examIds: string[]): Promise<QuestionnaireDocument[]> {
		return this.examSchema
			.find({ _id: { $in: examIds } })
			.exec()
			.catch((err: Error) => {
				throw new AppError({
					code: EQuestionnaireErrorCode.FETCH_QUIZZES_ERROR,
					message: 'fail to fetch questionnaire exams by ids',
					originalError: err,
				});
			}) as Promise<QuestionnaireExamDocument[]>;
	}

	async fetchSurveysByIds(surveyIds: string[]): Promise<QuestionnaireSurveyDocument[]> {
		return this.surveySchema
			.find({ _id: { $in: surveyIds } })
			.exec()
			.catch((err: Error) => {
				throw new AppError({
					code: EQuestionnaireErrorCode.FETCH_QUIZZES_ERROR,
					message: 'fail to fetch questionnaire surveys by ids',
					originalError: err,
				});
			}) as Promise<QuestionnaireSurveyDocument[]>;
	}

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
