import {
	Questionnaire,
	QuestionTypes,
	QuestionMetrics,
	QuestionnaireMetrics,
	QuestionnaireDocument,
} from './schema';
import { QuestionnaireRepository } from './questionnaire.repository';

import { ResponseRepository, Response, AnswerTypes, MetricsLoaderCtx, MetricsMapRecord } from 'src/response';
import { UtilsArray } from '@utils/*';
import DataLoader from 'dataloader';

export function questionnaireLoader(
	questionnaireRepository: QuestionnaireRepository,
	utilsArray: UtilsArray,
): DataLoader<string, QuestionnaireDocument> {
	return new DataLoader<string, QuestionnaireDocument>(async (ids: string[]) => {
		const questionnaires = await questionnaireRepository.fetchByIds(ids);
		return utilsArray.getObjectsSortedByIds(questionnaires, 'id', ids);
	});
}

export function questionnaireMetricsLoader(
	responseRepository: ResponseRepository,
	utilsArray: UtilsArray,
): DataLoader<MetricsLoaderCtx, QuestionnaireMetrics> {
	return new DataLoader<MetricsLoaderCtx, QuestionnaireMetrics>(async (ctxs: MetricsLoaderCtx[]) => {
		const responsesMap: Record<string, { responses: Response[]; questionnaire: Questionnaire }> = {};
		const questionnaireMap: Record<string, Questionnaire> = {};
		const questionsMetricsMap: MetricsMapRecord = {};

		const questionnaireIds = ctxs.map(({ questionnaire }) => questionnaire._id.toString());
		const responses = await responseRepository.fetchResponses({ questionnaireIds });

		ctxs.forEach(({ questionnaire }) => (questionnaireMap[questionnaire._id.toString()] = questionnaire));
		responses.forEach((response) => {
			questionnaireMap[response.questionnaire].questions.forEach((question: QuestionTypes) => {
				const questionId = question._id.toString();
				questionsMetricsMap[questionId] = {
					answerCount: 0,
					rightAnswerCount: 0,
					wrongAnswerCount: 0,
					unansweredCount: 0,
					optionsMetrics: {},
				};

				if ('options' in question) {
					question.options.forEach((option) => {
						const optionId = option._id.toString();
						questionsMetricsMap[questionId].optionsMetrics[optionId] = { selectedCount: 0 };
					});
				}
			});

			responsesMap[response.questionnaire] = {
				responses: [...(responsesMap[response.questionnaire]?.responses || []), response],
				questionnaire: questionnaireMap[response.questionnaire],
			};
		});

		const questionnaireMetrics = Object.values(responsesMap).map(({ responses, questionnaire }) => {
			responses.forEach(({ answers }) =>
				answers.forEach((answer: AnswerTypes) => {
					const questionMetrics = questionsMetricsMap[answer.question];
					questionMetrics.answerCount = questionMetrics.answerCount + 1;
					questionMetrics.rightAnswerCount = questionMetrics.rightAnswerCount + (answer.correct ? 1 : 0);
					questionMetrics.wrongAnswerCount = questionMetrics.wrongAnswerCount + (answer.correct ? 0 : 1);
					if ('option' in answer && answer.option) {
						const optionMetrics = questionMetrics.optionsMetrics[answer.option];
						optionMetrics.selectedCount = optionMetrics.selectedCount + 1;
					}
				}),
			);

			const questionsMetrics = questionnaire.questions.map((question: QuestionTypes): QuestionMetrics => {
				const questionMetrics = questionsMetricsMap[question._id.toString()];
				const questionMetricsObj: QuestionMetrics = {
					questionId: question._id.toString(),
					unansweredCount: responses.length - questionMetrics.answerCount,
					rightAnswerCount: questionMetrics.rightAnswerCount,
					wrongAnswerCount: questionMetrics.wrongAnswerCount,
					answerCount: questionMetrics.answerCount,
				};
				if ('options' in question) {
					questionMetricsObj.optionsMetrics = question.options.map((option) => ({
						...questionMetrics.optionsMetrics[option._id.toString()],
						optionId: option._id.toString(),
					}));
				} else {
					questionMetricsObj.optionsMetrics = undefined;
				}
				return questionMetricsObj;
			});

			return { responseCount: responses.length, questionsMetrics, id: questionnaire._id.toString() };
		});

		return utilsArray.getObjectsSortedByIds(questionnaireMetrics, 'id', questionnaireIds);
	});
}
