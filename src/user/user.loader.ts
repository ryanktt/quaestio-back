import { UserDocument } from './user.schema';
import { AdminRepository } from './admin';

import { UtilsArray } from '@utils/*';
import DataLoader from 'dataloader';

export function adminLoader(
	adminRepository: AdminRepository,
	utilsArray: UtilsArray,
): DataLoader<string, UserDocument, string> {
	return new DataLoader<string, UserDocument>(async (ids: string[]) => {
		const admins = await adminRepository.fetchByIds(ids);
		return utilsArray.getObjectsSortedByIds(admins, 'id', ids);
	});
}
