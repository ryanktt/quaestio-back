import { UserHelper, userLoader } from 'src/user';
import { UtilsArray } from './utils';

export interface ILoaders {
	userLoader: ReturnType<typeof userLoader>;
}

export function loaders(userHelper: UserHelper, utilsArray: UtilsArray): ILoaders {
	return { userLoader: userLoader(userHelper, utilsArray) };
}
