import { UserRepository } from './user.repository';
import { User } from './user.schema';

import { UtilsArray } from '@utils/utils.array';
import DataLoader from 'dataloader';

export function userLoader(
	userRepository: UserRepository,
	utilsArray: UtilsArray,
): DataLoader<string, User, string> {
	return new DataLoader<string, User>(async (ids: string[]) => {
		const users = await userRepository.fetchByIds(ids);
		return utilsArray.getObjectsSortedByIds(users, '_id', ids);
	});
}
