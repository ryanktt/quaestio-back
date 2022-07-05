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

const sumRightAnswerCount = (rightAnswerCount?: number, isCorrect?: boolean): number =>
	isCorrect ? (rightAnswerCount || 0) + 1 : 0;

const sumWrongAnswerCount = (wrongAnswerCount?: number, isCorrect?: boolean): number =>
	isCorrect ? 0 : (wrongAnswerCount || 0) + 1;

const sumSelectedCount = (selectedCount?: number): number => (selectedCount || 0) + 1;

const sumAnswerCount = (answerCount?: number): number => (answerCount || 0) + 1;

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
			responsesMap[response.questionnaire] = {
				responses: [...(responsesMap[response.questionnaire]?.responses || []), response],
				questionnaire: questionnaireMap[response.questionnaire],
			};
		});

		const questionnaireMetrics = Object.values(responsesMap).map(({ responses, questionnaire }) => {
			responses.forEach(({ answers }) =>
				answers.forEach((answer: AnswerTypes) => {
					questionsMetricsMap[answer.question] = { optionsMetrics: {} };
					const metrics = questionsMetricsMap[answer.question];
					metrics.rightAnswerCount = sumRightAnswerCount(metrics?.rightAnswerCount, answer?.correct);
					metrics.wrongAnswerCount = sumWrongAnswerCount(metrics?.wrongAnswerCount, answer?.correct);
					metrics.answerCount = sumAnswerCount(metrics?.answerCount);

					if ('option' in answer && answer.option) {
						metrics.optionsMetrics[answer.option] = {
							selectedCount: sumSelectedCount(metrics.optionsMetrics?.[answer.option]?.selectedCount),
						};
					}
					if ('options' in answer && answer.options) {
						answer.options.forEach((option) => {
							metrics.optionsMetrics[option] = {
								selectedCount: sumSelectedCount(metrics.optionsMetrics?.[option]?.selectedCount),
							};
						});
					}
				}),
			);

			const questionnaireId = questionnaire._id.toString();
			const responseCount = responses.length;

			const questionsMetrics = questionnaire.questions.map((question: QuestionTypes): QuestionMetrics => {
				const questionId = question._id.toString();
				const metrics = questionsMetricsMap[questionId];
				return {
					questionId: questionId,
					unansweredCount: responseCount - (metrics?.answerCount || 0),
					rightAnswerCount: metrics?.rightAnswerCount || 0,
					wrongAnswerCount: metrics?.wrongAnswerCount || 0,
					answerCount: metrics?.answerCount || 0,
					optionsMetrics:
						'options' in question
							? question.options.map((option) => {
									const optionId = option._id.toString();
									return {
										selectedCount: metrics?.optionsMetrics?.[optionId]?.selectedCount || 0,
										optionId,
									};
							  })
							: undefined,
				};
			});

			return { responseCount, questionsMetrics, id: questionnaireId };
		});

		return utilsArray.getObjectsSortedByIds(questionnaireMetrics, 'id', questionnaireIds);
	});
}
