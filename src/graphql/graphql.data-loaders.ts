import { questionnaireLoader, QuestionnaireRepository } from '@modules/questionnaire';
import { userLoader, UserRepository } from '@modules/user';
import { UtilsArray } from '@utils/';

export interface ILoaders {
	questionnaireLoader: ReturnType<typeof questionnaireLoader>;
	userLoader: ReturnType<typeof userLoader>;
}

export function loaders(
	utilsArray: UtilsArray,
	userRepository: UserRepository,
	questionnaireRepository: QuestionnaireRepository,
): ILoaders {
	return {
		questionnaireLoader: questionnaireLoader(questionnaireRepository, utilsArray),
		userLoader: userLoader(userRepository, utilsArray),
	};
}
