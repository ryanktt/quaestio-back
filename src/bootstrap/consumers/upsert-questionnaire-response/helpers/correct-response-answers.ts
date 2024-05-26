import { ObjectId } from 'mongodb';
import { AnswerTypes, QuestionnaireTypes, QuestionTypes } from '../types/types';

interface ICorrectAnswers {
	answers: AnswerTypes[];
	questionnaire: QuestionnaireTypes;
}

export function correctQuestionnaireAnswers({ answers, questionnaire }: ICorrectAnswers): void {
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
		const correctOptionIds = questionMap[questionId as string].correctOptionIds;

		answer.question = new ObjectId(answer.question);
		if ('option' in answer && answer.option) {
			answer.correct = isOptionCorrect(answer.option as string, correctOptionIds);
			answer.option = new ObjectId(answer.option);
		} else if ('options' in answer && answer.options && answer.options.length > 0) {
			answer.correct = isOptionsCorrect(answer.options as string[], correctOptionIds);
			answer.options = answer.options.map((option) => new ObjectId(option));
		} else if ('text' in answer) {
			answer.correct = true;
		}

		if (answer.correct === undefined) answer.answeredAt = undefined;
	});
}
