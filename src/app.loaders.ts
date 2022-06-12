import { userLoader, UserRepository } from 'src/user';
import { UtilsArray } from './utils';

export interface ILoaders {
	userLoader: ReturnType<typeof userLoader>;
}

export function loaders(userRepository: UserRepository, utilsArray: UtilsArray): ILoaders {
	return { userLoader: userLoader(userRepository, utilsArray) };
}
