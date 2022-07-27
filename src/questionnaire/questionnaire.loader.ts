import { QuestionnaireRepository } from './questionnaire.repository';
import { Questionnaire } from './schema';

import { UtilsArray } from '@utils/*';
import DataLoader from 'dataloader';

export function questionnaireLoader(
	questionnaireRepository: QuestionnaireRepository,
	utilsArray: UtilsArray,
): DataLoader<string, Questionnaire> {
	return new DataLoader<string, Questionnaire>(async (ids: string[]) => {
		const questionnaires = await questionnaireRepository.fetchByIds(ids);
		return utilsArray.getObjectsSortedByIds(questionnaires, '_id', ids);
	});
}
