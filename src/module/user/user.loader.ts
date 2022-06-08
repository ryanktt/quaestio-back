import { UserDocument } from './user.schema';
import { UserHelper } from './user.helper';
import { UtilsArray } from '@utils/*';

import DataLoader from 'dataloader';

export function userLoader(
	userHelper: UserHelper,
	utilsArray: UtilsArray,
): DataLoader<string, UserDocument, string> {
	return new DataLoader<string, UserDocument>(async (ids: string[]) => {
		const users = await userHelper.fetchByIds(ids);
		return utilsArray.getObjectsSortedByIds(users, 'id', ids);
	});
}
