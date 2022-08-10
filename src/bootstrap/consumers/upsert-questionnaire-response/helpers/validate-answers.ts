import { AppError } from '@utils/*';
import { AnswerTypes, EAnswerType, EResponseErrorCode, QuestionnaireTypes } from '../types/types';

interface IValidateAnswers {
	answers: AnswerTypes[];
	questionnaire: QuestionnaireTypes;
}

export function validateAnswers({ answers, questionnaire }: IValidateAnswers): void {
	const questionMap: Record<string, { required: boolean; verified: boolean }> = {};
	questionnaire.questions.forEach(
		(question) => (questionMap[question._id.toString()] = { required: question.required, verified: false }),
	);

	answers.forEach((answer: AnswerTypes) => {
		const questionId = answer.question.toString();

		if (!(questionId in questionMap)) {
			throw new AppError({
				message: 'the question does not exist',
				code: EResponseErrorCode.INVALID_ANSWER,
			});
		}

		if (questionMap[questionId].verified) {
			throw new AppError({
				message: 'answer submitted multiple times for the same question',
				code: EResponseErrorCode.INVALID_ANSWER,
			});
		}

		let isAnswered = false;
		if (answer.type === EAnswerType.SINGLE_CHOICE || answer.type === EAnswerType.TRUE_OR_FALSE) {
			if (answer.option) isAnswered = true;
		}
		if (answer.type === EAnswerType.MULTIPLE_CHOICE) {
			if (answer.options && answer.options.length > 0) isAnswered = true;
		}
		if (answer.type === EAnswerType.TEXT) {
			if (answer.text) isAnswered = true;
		}

		if (questionMap[questionId].required && !isAnswered) {
			throw new AppError({
				message: 'question is required but either no option was selected or no text was filled',
				code: EResponseErrorCode.INVALID_ANSWER,
			});
		}
		questionMap[questionId].verified = true;
	});
}
