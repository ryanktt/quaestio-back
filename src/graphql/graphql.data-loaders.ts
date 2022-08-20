import { questionnaireLoader } from '@modules/questionnaire/questionnaire.loader';
import { IGraphqlInjectionParams } from './graphql.interface';
import { userLoader } from '@modules/user/user.loader';

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
