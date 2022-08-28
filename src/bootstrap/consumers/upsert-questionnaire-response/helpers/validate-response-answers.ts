import { AnswerTypes, EAnswerType, EQuestionType, QuestionnaireTypes } from '../types/types';

interface IValidateAnswers {
	answers: AnswerTypes[];
	questionnaire: QuestionnaireTypes;
}

export function validateResponseAnswers(params: IValidateAnswers): void {
	const { answers, questionnaire } = params;
	const questionMap: Record<string, { required: boolean; verified: boolean; type: EQuestionType }> = {};
	questionnaire.questions.forEach(
		(question) =>
			(questionMap[question._id.toString()] = {
				required: question.required,
				verified: false,
				type: question.type,
			}),
	);

	answers.forEach((answer: AnswerTypes) => {
		const questionId = answer.question.toString();
		if (!(questionId in questionMap)) {
			throw new Error('the question does not exist');
		}

		const question = questionMap[questionId];

		if ((question.type as string) !== (answer.type as string)) {
			throw new Error('the question type is different than the answer type');
		}

		if (question.verified) {
			throw new Error('answer submitted multiple times for the same question');
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
			throw new Error('question is required but either no option was selected or no text was filled');
		}
		questionMap[questionId].verified = true;
	});
}
