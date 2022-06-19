import { UtilsPromise } from './utils.promise';
import { DocumentType } from './utils.schema';
import { UtilsAuth } from './utils.auth';

import { Test } from '@nestjs/testing';

type IQuestDocCounterpart = DocumentType<{ user: string }>;
type IUserDoCounterpart = DocumentType<{ id: string }>;

describe('UtilsAuth', () => {
	let utilsAuth: UtilsAuth;

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [UtilsAuth, UtilsPromise],
		}).compile();

		utilsAuth = moduleRef.get<UtilsAuth>(UtilsAuth);
	});

	describe('Asserts equality between mongo document id fields', () => {
		const questionnaireDocCounterpart = { user: '123456789' } as IQuestDocCounterpart;
		const userDocCounterpart = { id: '987654321' } as IUserDoCounterpart;
		questionnaireDocCounterpart.constructor.modelName = 'Questionnaire';

		it('should throw an error', async () => {
			questionnaireDocCounterpart.user = '123456789';

			await expect(
				utilsAuth.validateUserDocAccess(questionnaireDocCounterpart, [
					{ doc: userDocCounterpart, refKey: 'user' },
				]),
			).rejects.toThrowError('user does not have access to the Questionnaire document');
		});

		it('should do nothing', async () => {
			questionnaireDocCounterpart.user = '987654321';

			await expect(
				utilsAuth.validateUserDocAccess(questionnaireDocCounterpart, [
					{ doc: userDocCounterpart, refKey: 'user' },
				]),
			).resolves.toBeUndefined();
		});
	});
});
