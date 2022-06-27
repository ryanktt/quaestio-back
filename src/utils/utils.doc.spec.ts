import { UtilsPromise } from './utils.promise';
import { DocumentType } from './utils.schema';
import { UtilsDoc } from './utils.doc';

import { Test } from '@nestjs/testing';

type IQuestDocCounterpart = DocumentType<{ user: string }>;
type IUserDoCounterpart = DocumentType<{ id: string }>;

describe('UtilsDoc', () => {
	let utilsDoc: UtilsDoc;

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [UtilsDoc, UtilsPromise],
		}).compile();

		utilsDoc = moduleRef.get<UtilsDoc>(UtilsDoc);
	});

	describe('Asserts equality between mongo document id fields', () => {
		const questionnaireDocCounterpart = { user: '123456789' } as IQuestDocCounterpart;
		const userDocCounterpart = { id: '123456789' } as IUserDoCounterpart;
		questionnaireDocCounterpart.constructor.modelName = 'Questionnaire';

		it('should do nothing', async () => {
			await expect(
				utilsDoc.validateUserDocAccess(questionnaireDocCounterpart, [
					{ doc: userDocCounterpart, refKey: 'user' },
				]),
			).resolves.toBeUndefined();
		});

		it('should throw an error', async () => {
			questionnaireDocCounterpart.user = '987654321';
			await expect(
				utilsDoc.validateUserDocAccess(questionnaireDocCounterpart, [
					{ doc: userDocCounterpart, refKey: 'user' },
				]),
			).rejects.toThrowError('user does not have access to Questionnaire');
		});
	});
});
