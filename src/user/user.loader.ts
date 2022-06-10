import { UserRepository } from './user.repository';
import { UserDocument } from './user.schema';

import { UtilsArray } from '@utils/*';
import DataLoader from 'dataloader';

export function userLoader(
	userRepository: UserRepository,
	utilsArray: UtilsArray,
): DataLoader<string, UserDocument, string> {
	return new DataLoader<string, UserDocument>(async (ids: string[]) => {
		const users = await userRepository.fetchByIds(ids);
		return utilsArray.getObjectsSortedByIds(users, 'id', ids);
	});
}
