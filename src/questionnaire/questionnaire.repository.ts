import {
	QuestionnaireModel,
	QuestionnaireDocument,
	QuestionnaireQuizModel,
	QuestionnaireSurveyModel,
	QuestionnaireQuizDocument,
	QuestionnaireSurveyDocument,
} from './questionnaire.schema';
import { EQuestionnaireErrorCode, IRepositoryCreateQuestionnareParams } from './questionnaire.interface';

import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { AppError } from '@utils/*';

@Injectable()
export class QuestionnaireRepository {
	constructor(
		@InjectModel('QuestionnaireSurvey') private readonly questionnaireSurveySchema: QuestionnaireSurveyModel,
		@InjectModel('QuestionnaireQuiz') private readonly questionnaireQuizSchema: QuestionnaireQuizModel,
		@InjectModel('Questionnaire') private readonly questionnaireSchema: QuestionnaireModel,
	) {}

	async fetchByIds(questionnaireIds: string[]): Promise<QuestionnaireDocument[]> {
		return this.questionnaireSchema
			.find({ _id: { $in: questionnaireIds } })
			.exec()
			.catch((err: Error) => {
				throw new AppError({
					code: EQuestionnaireErrorCode.FETCH_QUESTIONNAIRES_ERROR,
					message: 'fail to fetch questionnaires by ids',
					originalError: err,
				});
			}) as Promise<QuestionnaireDocument[]>;
	}

	async fetchById(questionnaireId: string): Promise<QuestionnaireDocument | undefined> {
		const questionnaire = (await this.questionnaireSchema
			.findById(questionnaireId)
			.exec()
			.catch((err: Error) => {
				throw new AppError({
					code: EQuestionnaireErrorCode.FETCH_QUESTIONNAIRE_ERROR,
					message: 'fail to fetch questionnaire by id',
					originalError: err,
				});
			})) as QuestionnaireDocument | null;
		return questionnaire ? questionnaire : undefined;
	}

	async fetchBySharedId(questionnaireSharedId: string): Promise<QuestionnaireDocument | undefined> {
		const questionnaire = (await this.questionnaireSchema
			.findOne({ sharedId: questionnaireSharedId })
			.exec()
			.catch((err: Error) => {
				throw new AppError({
					code: EQuestionnaireErrorCode.FETCH_QUESTIONNAIRE_ERROR,
					message: 'fail to fetch questionnaire by shared id',
					originalError: err,
				});
			})) as QuestionnaireDocument | null;

		return questionnaire ? questionnaire : undefined;
	}

	async createQuiz({
		questions,
		userId,
		title,
	}: IRepositoryCreateQuestionnareParams): Promise<QuestionnaireQuizDocument> {
		return this.questionnaireQuizSchema.create({ title, questions, user: userId }).catch((err: Error) => {
			throw new AppError({
				code: EQuestionnaireErrorCode.CREATE_QUESTIONNAIRE_QUIZ_ERROR,
				message: 'fail to create questionnaire quiz',
				originalError: err,
			});
		}) as Promise<QuestionnaireQuizDocument>;
	}

	async createSurvey({
		questions,
		userId,
		title,
	}: IRepositoryCreateQuestionnareParams): Promise<QuestionnaireSurveyDocument> {
		return this.questionnaireSurveySchema.create({ title, questions, user: userId }).catch((err: Error) => {
			throw new AppError({
				code: EQuestionnaireErrorCode.CREATE_QUESTIONNAIRE_SURVEY_ERROR,
				message: 'fail to create questionnaire survey',
				originalError: err,
			});
		}) as Promise<QuestionnaireSurveyDocument>;
	}
}
