import { QuestionnaireRepository, questionnaireLoader } from '@modules/questionnaire';
import { UserRepository, userLoader } from '@modules/user';
import { UtilsArray } from '@utils/*';

export interface ILoaders {
	questionnaireLoader: ReturnType<typeof questionnaireLoader>;
	userLoader: ReturnType<typeof userLoader>;
}

export interface IGraphqlContext {
	userAgent: string;
	authToken: string;
	clientIp: string;
	loaders: ILoaders;
}

export interface IGraphqlInjectionParams {
	questionnaireRepository: QuestionnaireRepository;
	userRepository: UserRepository;
	utilsArray: UtilsArray;
}

export function getParamsAsObjFromInjectionArgs<T extends Record<string, unknown>>(
	...args: T[]
): IGraphqlInjectionParams {
	return args.reduce((loadersParams, arg) => {
		const key = arg.constructor.name.charAt(0).toLowerCase() + arg.constructor.name.slice(1);
		return { ...loadersParams, [key]: arg };
	}, {}) as IGraphqlInjectionParams;
}
