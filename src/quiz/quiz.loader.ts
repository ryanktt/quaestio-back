import { QuizRepository } from './quiz.repository';
import { QuizDocument } from './quiz.schema';

import { UtilsArray } from '@utils/*';
import DataLoader from 'dataloader';

export function quizLoader(
	quizRepository: QuizRepository,
	utilsArray: UtilsArray,
): DataLoader<string, QuizDocument, string> {
	return new DataLoader<string, QuizDocument>(async (ids: string[]) => {
		const quizzes = await quizRepository.fetchByIds(ids);
		return utilsArray.getObjectsSortedByIds(quizzes, 'id', ids);
	});
}
