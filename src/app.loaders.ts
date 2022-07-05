import {
	QuestionnaireHelper,
	questionnaireLoader,
	questionnaireMetricsLoader,
	QuestionnaireRepository,
} from './questionnaire';
import { userLoader, UserRepository } from 'src/user';
import { ResponseRepository } from './response';
import { UtilsArray } from './utils';

export interface ILoaders {
	questionnaireMetricsLoader: ReturnType<typeof questionnaireMetricsLoader>;
	questionnaireLoader: ReturnType<typeof questionnaireLoader>;
	userLoader: ReturnType<typeof userLoader>;
}

export function loaders(
	utilsArray: UtilsArray,
	userRepository: UserRepository,
	responseRepository: ResponseRepository,
	questionnaireHelper: QuestionnaireHelper,
	questionnaireRepository: QuestionnaireRepository,
): ILoaders {
	return {
		questionnaireMetricsLoader: questionnaireMetricsLoader(
			questionnaireHelper,
			responseRepository,
			utilsArray,
		),
		questionnaireLoader: questionnaireLoader(questionnaireRepository, utilsArray),
		userLoader: userLoader(userRepository, utilsArray),
	};
}
