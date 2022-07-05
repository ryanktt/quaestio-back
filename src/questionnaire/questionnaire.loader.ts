import { QuestionnaireRepository } from './questionnaire.repository';
import { Questionnaire, QuestionnaireMetrics } from './schema';
import { QuestionnaireHelper } from './questionnaire.helper';

import { ResponseRepository, Response, MetricsLoaderCtx } from 'src/response';
import { UtilsArray } from '@utils/*';
import DataLoader from 'dataloader';

export function questionnaireLoader(
	questionnaireRepository: QuestionnaireRepository,
	utilsArray: UtilsArray,
): DataLoader<string, Questionnaire> {
	return new DataLoader<string, Questionnaire>(async (ids: string[]) => {
		const questionnaires = await questionnaireRepository.fetchByIds(ids);
		return utilsArray.getObjectsSortedByIds(questionnaires, '_id', ids);
	});
}

export function questionnaireMetricsLoader(
	questionnaireHelper: QuestionnaireHelper,
	responseRepository: ResponseRepository,
	utilsArray: UtilsArray,
): DataLoader<MetricsLoaderCtx, QuestionnaireMetrics> {
	return new DataLoader<MetricsLoaderCtx, QuestionnaireMetrics>(async (ctxs: MetricsLoaderCtx[]) => {
		const responsesMap: Record<string, { responses: Response[]; questionnaire: Questionnaire }> = {};
		const questionnaireMap: Record<string, Questionnaire> = {};

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
			const questionsMetrics = questionnaireHelper.getQuestionsMetrics({ responses, questionnaire });
			return { responseCount: responses.length, questionsMetrics, id: questionnaire._id.toString() };
		});

		return utilsArray.getObjectsSortedByIds(questionnaireMetrics, 'id', questionnaireIds);
	});
}
