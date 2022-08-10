import { AnswerTypes, QuestionnaireTypes, QuestionTypes } from '../types/types';

interface ICorrectAnswers {
	answers: AnswerTypes[];
	questionnaire: QuestionnaireTypes;
}

export function correctAnswers({ answers, questionnaire }: ICorrectAnswers): void {
	const isOptionCorrect = (optionId: string, correctOpIds: string[]): boolean =>
		correctOpIds.includes(optionId);

	const isOptionsCorrect = (optionIds: string[], correctOpIds: string[]): boolean =>
		correctOpIds.every((correctOptionId) => optionIds.includes(correctOptionId));

	const questionMap: Record<string, { correctOptionIds: string[] }> = {};
	const { questions } = questionnaire;

	questions.forEach((question: QuestionTypes) => {
		const questionId = question._id.toString();
		questionMap[questionId] = { correctOptionIds: [] };
		if ('options' in question) {
			questionMap[questionId].correctOptionIds = question.options.reduce((accumulator, option) => {
				return option.correct ? [...accumulator, option._id.toString()] : accumulator;
			}, []);
		}
	});

	answers.forEach((answer: AnswerTypes) => {
		const questionId = answer.question;
		const correctOptionIds = questionMap[questionId].correctOptionIds;

		if ('option' in answer && answer.option) {
			answer.correct = isOptionCorrect(answer.option, correctOptionIds);
		} else if ('options' in answer) {
			answer.correct = isOptionsCorrect(answer.options || [], correctOptionIds);
		} else if ('text' in answer) {
			answer.correct = true;
		}
	});
}
