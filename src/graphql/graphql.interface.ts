import { QuestionnaireRepository } from '@modules/questionnaire/questionnaire.repository';
import { questionnaireLoader } from '@modules/questionnaire/questionnaire.loader';
import { UserRepository } from '@modules/user/user.repository';
import { userLoader } from '@modules/user/user.loader';
import { UtilsArray } from '@utils/utils.array';

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
