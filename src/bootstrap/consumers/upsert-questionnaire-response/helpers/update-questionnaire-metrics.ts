import { AnswerTypes, QuestionnaireTypes } from '../types/types';

interface IUpdateQuestionnaireMetrics {
	answers: AnswerTypes[];
	questionnaire: QuestionnaireTypes;
}

export function updateQuestionnaireMetrics({ answers, questionnaire }: IUpdateQuestionnaireMetrics): void {
	const questionMap: Record<string, { isCorrect?: boolean; isAnswered: boolean }> = {};
	const answeredOptionIds: string[] = [];
	const { questions } = questionnaire;

	answers.forEach((answer: AnswerTypes) => {
		const questionId = answer.question;
		if (answer.correct)
			questionMap[questionId] = {
				isAnswered: answer.answeredAt ? true : false,
				isCorrect: answer.correct,
			};

		if ('option' in answer && answer.option) {
			answeredOptionIds.push(answer.option);
		} else if ('options' in answer && answer.options && answer.options.length > 0) {
			answer.options.forEach((option) => answeredOptionIds.push(option));
		}
	});

	questionnaire.questions = questions.map((question) => {
		const isCorrect = questionMap?.[question._id.toString()]?.isCorrect;
		const isAnswered = questionMap?.[question._id.toString()]?.isAnswered;

		if (typeof isCorrect !== 'boolean' && !isAnswered) {
			question.unansweredCount++;
			return question;
		}

		question.answerCount++;
		if ('options' in question) {
			if (isCorrect) {
				question.rightAnswerCount++;
			} else {
				question.wrongAnswerCount++;
			}

			const { options } = question;
			question.options = options.map((option) => {
				if (answeredOptionIds.includes(option._id.toString())) {
					option.selectedCount++;
				}
				return option;
			});
		}

		return question;
	});

	if (questions.length > 0) {
		questionnaire.responseCount++;
	}
}
