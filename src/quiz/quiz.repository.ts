import {
	QuizModel,
	QuizDocument,
	QuizExamModel,
	QuizSurveyModel,
	QuizExamDocument,
	QuizSurveyDocument,
} from './quiz.schema';
import { EQuizErrorCode } from './quiz.interface';

import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { AppError } from '@utils/*';

@Injectable()
export class QuizRepository {
	constructor(
		@InjectModel('QuizSurvey') private readonly surveySchema: QuizSurveyModel,
		@InjectModel('QuizExam') private readonly examSchema: QuizExamModel,
		@InjectModel('Quiz') private readonly quizSchema: QuizModel,
	) {}

	async fetchExamsByIds(examIds: string[]): Promise<QuizDocument[]> {
		return this.examSchema
			.find({ _id: { $in: examIds } })
			.exec()
			.catch((err: Error) => {
				throw new AppError({
					code: EQuizErrorCode.FETCH_QUIZZES_ERROR,
					message: 'fail to fetch quiz exams by ids',
					originalError: err,
				});
			}) as Promise<QuizExamDocument[]>;
	}

	async fetchSurveysByIds(surveyIds: string[]): Promise<QuizSurveyDocument[]> {
		return this.surveySchema
			.find({ _id: { $in: surveyIds } })
			.exec()
			.catch((err: Error) => {
				throw new AppError({
					code: EQuizErrorCode.FETCH_QUIZZES_ERROR,
					message: 'fail to fetch quiz surveys by ids',
					originalError: err,
				});
			}) as Promise<QuizSurveyDocument[]>;
	}

	async fetchByIds(quizIds: string[]): Promise<QuizDocument[]> {
		return this.quizSchema
			.find({ _id: { $in: quizIds } })
			.exec()
			.catch((err: Error) => {
				throw new AppError({
					code: EQuizErrorCode.FETCH_QUIZZES_ERROR,
					message: 'fail to fetch quizzes by ids',
					originalError: err,
				});
			}) as Promise<QuizDocument[]>;
	}
}
