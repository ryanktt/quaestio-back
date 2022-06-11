import { adminLoader, AdminRepository } from 'src/user';
import { UtilsArray } from './utils';

export interface ILoaders {
	adminLoader: ReturnType<typeof adminLoader>;
}

export function loaders(adminRepository: AdminRepository, utilsArray: UtilsArray): ILoaders {
	return { adminLoader: adminLoader(adminRepository, utilsArray) };
}
