import { QuestionnaireDocument, QuestionnaireModel } from '@modules/questionnaire/schema';
import { EQuestionnaireErrorCode } from '@modules/questionnaire/questionnaire.interface';
import { InjectModel } from '@nestjs/mongoose';
import { AppError } from '@utils/utils.error';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ResponseQuestionnaireRepository {
	constructor(@InjectModel('Questionnaire') private readonly questionnaireSchema: QuestionnaireModel) {}

	async fetchById(questionnaireId: string): Promise<QuestionnaireDocument | undefined> {
		const questionnaire = (await this.questionnaireSchema
			.findById(questionnaireId)
			.exec()
			.catch((originalError: Error) => {
				throw new AppError({
					code: EQuestionnaireErrorCode.FETCH_QUESTIONNAIRE_ERROR,
					message: 'fail to fetch questionnaire by id',
					originalError,
				});
			})) as QuestionnaireDocument | null;
		return questionnaire ? questionnaire : undefined;
	}
}
