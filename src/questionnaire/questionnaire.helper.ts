import { EQuestionnaireErrorCode, EQuestionType } from './questionnaire.interface';
import { QuestionDiscriminatorInput, QuestionInput } from './questionnaire.input';
import { Question } from './questionnaire.schema';

import { AppError, UtilsPromise } from '@utils/*';
import { Injectable } from '@nestjs/common';

@Injectable()
export class QuestionnaireHelper {
	constructor(private readonly utilsPromise: UtilsPromise) {}

	async validateTitle(name: string): Promise<void> {
		return this.utilsPromise.promisify(() => {
			const code = EQuestionnaireErrorCode.INVALID_TITLE;
			if (name.length > 350) throw new AppError({ message: 'invalid name, max character length: 350', code });
			if (name.length < 3) throw new AppError({ message: 'invalid name, min character length: 3', code });
		});
	}
}
