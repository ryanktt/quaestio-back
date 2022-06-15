import { quizLoader, QuizRepository } from './quiz';
import { userLoader, UserRepository } from 'src/user';
import { UtilsArray } from './utils';

export interface ILoaders {
	quizLoader: ReturnType<typeof quizLoader>;
	userLoader: ReturnType<typeof userLoader>;
}

export function loaders(
	utilsArray: UtilsArray,
	userRepository: UserRepository,
	quizRepository: QuizRepository,
): ILoaders {
	return {
		quizLoader: quizLoader(quizRepository, utilsArray),
		userLoader: userLoader(userRepository, utilsArray),
	};
}
