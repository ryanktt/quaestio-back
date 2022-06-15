import { QuizDocument, QuizExamDocument, QuizExamModel } from './quiz.schema';
import { EQuizErrorCode } from './quiz.interface';

import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { AppError } from '@utils/*';

@Injectable()
export class QuizRepository {
	constructor(@InjectModel('QuizExam') private readonly examSchema: QuizExamModel) {}

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
}
