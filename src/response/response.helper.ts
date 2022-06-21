import { AnswerDiscriminatorInput, AnswerInput } from './response.input';
import { EAnswerType } from './response.interface';
import { Answer } from './response.schema';

import { Injectable } from '@nestjs/common';

@Injectable()
export class ResponseHelper {
	getAnswerFromAnswerDiscriminatorInput(
		answerDiscriminatorInput: AnswerDiscriminatorInput,
	): Answer | undefined {
		const map: Record<EAnswerType, AnswerInput | undefined> = {
			[EAnswerType.MULTIPLE_CHOICE]: answerDiscriminatorInput.answerMultipleChoice,
			[EAnswerType.SINGLE_CHOICE]: answerDiscriminatorInput.answerSingleChoice,
			[EAnswerType.TRUE_OR_FALSE]: answerDiscriminatorInput.answerTrueOrFalse,
			[EAnswerType.TEXT]: answerDiscriminatorInput.answerText,
		};

		const answerInput = map[answerDiscriminatorInput.type];
		if (!answerInput) return;

		const answer: Partial<Answer> & Partial<AnswerInput> & Partial<Record<string, unknown>> = {
			...answerInput,
		};

		answer.question = answer.questionId;
		delete answer.questionId;
		if ('optionIds' in answer) {
			answer.options = answer.optionIds;
			delete answer.optionIds;
		}
		if ('optionId' in answer) {
			answer.option = answer.optionId;
			delete answer.optionId;
		}

		return answer as Answer;
	}
}
