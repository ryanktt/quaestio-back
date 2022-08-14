import { IGraphqlInjectionParams } from './graphql.interface';
import { questionnaireLoader } from '@modules/questionnaire';
import { userLoader } from '@modules/user';

export interface ILoaders {
	questionnaireLoader: ReturnType<typeof questionnaireLoader>;
	userLoader: ReturnType<typeof userLoader>;
}

export function loaders({
	questionnaireRepository,
	userRepository,
	utilsArray,
}: IGraphqlInjectionParams): ILoaders {
	return {
		questionnaireLoader: questionnaireLoader(questionnaireRepository, utilsArray),
		userLoader: userLoader(userRepository, utilsArray),
	};
}
