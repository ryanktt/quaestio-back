import {
	AnswerTypes,
	EQuestionType,
	OptionMetrics,
	QuestionnaireTypes,
	QuestionMetricsTypes,
	IMetricsByLocationMap,
	QuestionnaireMetrics,
	QuestionTrueOrFalseMetrics,
	QuestionSingleChoiceMetrics,
	QuestionMultipleChoiceMetrics,
} from '../types/types';
import geoIp from 'geoip-lite';

interface IUpdateQuestionnaireMetrics {
	answers: AnswerTypes[];
	questionnaire: QuestionnaireTypes;
	metrics: QuestionnaireMetrics;
	respondentIp: string;
	attemptCount: number;
	answerTime: number;
}
type IMetricsHasOptions =
	| QuestionMultipleChoiceMetrics
	| QuestionSingleChoiceMetrics
	| QuestionTrueOrFalseMetrics;

export function updateQuestionnaireMetrics({
	questionnaire,
	respondentIp,
	attemptCount,
	answerTime,
	answers,
	metrics,
}: IUpdateQuestionnaireMetrics): void {
	const respondentLocationKey = getRespondentLocationKey(respondentIp);
	const byLocationMap = initByLocationMap(metrics, respondentLocationKey) as IMetricsByLocationMap;
	const byLocation = byLocationMap[respondentLocationKey];

	const byLocationQuestionMetricsMap = getQuestionMetricsMap(byLocation?.questionMetrics);
	const questionMetricsMap = getQuestionMetricsMap(metrics.questionMetrics);
	const questionCorrectionMap: Record<string, { isCorrect?: boolean; isAnswered: boolean }> = {};

	const answeredOptionIds: string[] = [];
	const { questions } = questionnaire;

	answers.forEach((answer: AnswerTypes) => {
		const questionId = answer.question.toString();
		questionCorrectionMap[questionId] = {
			isAnswered: answer.answeredAt ? true : false,
			isCorrect: answer.correct,
		};

		if ('option' in answer && answer.option) {
			answeredOptionIds.push(answer.option.toString());
		} else if ('options' in answer && answer.options && answer.options.length > 0) {
			answer.options.forEach((option) => answeredOptionIds.push(option.toString()));
		}
	});

	questions.forEach((question) => {
		const questionId = question._id.toString();
		let questionMetricsByLocation = byLocationQuestionMetricsMap?.[questionId];
		let questionMetrics = questionMetricsMap[questionId];

		const isCorrect = questionCorrectionMap?.[questionId]?.isCorrect;
		const isAnswered = questionCorrectionMap?.[questionId]?.isAnswered;

		if (isAnswered) {
			questionMetricsByLocation.answerCount++;
			questionMetrics.answerCount++;
		} else {
			questionMetricsByLocation.unansweredCount++;
			questionMetrics.unansweredCount++;
		}

		if ('options' in question) {
			questionMetricsByLocation = questionMetricsByLocation as IMetricsHasOptions;
			questionMetrics = questionMetrics as IMetricsHasOptions;

			if (isCorrect) {
				questionMetricsByLocation.rightAnswerCount++;
				questionMetrics.rightAnswerCount++;
			} else {
				questionMetricsByLocation.wrongAnswerCount++;
				questionMetrics.wrongAnswerCount++;
			}

			const qOptionsMetricsByLocation = getOptionMetricsMap(questionMetricsByLocation.options);
			const qOptionsMetricsMap = getOptionMetricsMap(questionMetrics.options);

			const { options } = question;
			options.forEach((option) => {
				const optionId = option._id.toString();
				if (answeredOptionIds.includes(optionId)) {
					qOptionsMetricsByLocation[optionId].selectedCount++;
					qOptionsMetricsMap[optionId].selectedCount++;
				}
			});
		}
	});

	if (attemptCount === 1) {
		metrics.totalResponseCount++;
		byLocation.totalResponseCount++;
	}
	metrics.totalAttemptCount++;
	metrics.totalAnswerTime += answerTime;
	metrics.avgAttemptCount = metrics.totalAttemptCount / metrics.totalResponseCount;
	metrics.avgAnswerTime = Math.round(metrics.totalAnswerTime / metrics.totalResponseCount);

	byLocation.totalAttemptCount++;
	byLocation.totalAnswerTime += answerTime;
	byLocation.avgAttemptCount = byLocation.totalAttemptCount / byLocation.totalResponseCount;
	byLocation.avgAnswerTime = Math.round(byLocation.totalAnswerTime / byLocation.totalResponseCount);

	metrics.byLocationMap = JSON.stringify(byLocationMap);
}

function getQuestionMetricsMap(
	questionMetrics?: QuestionMetricsTypes[],
): Record<string, QuestionMetricsTypes> {
	const map: Record<string, QuestionMetricsTypes> = {};
	(questionMetrics || []).forEach((metrics) => (map[metrics._id.toString()] = metrics));

	return map;
}

function getOptionMetricsMap(options?: OptionMetrics[]): Record<string, OptionMetrics> {
	const map: Record<string, OptionMetrics> = {};
	(options || []).forEach((option) => (map[option._id.toString()] = option));

	return map;
}

function getRespondentLocationKey(respondentIp: string): string {
	const data = geoIp.lookup(respondentIp);
	if (!data) return 'unknown';
	return `${data.country}:${data.region}:${data.city}`;
}

function initByLocationMap(
	metrics: QuestionnaireMetrics,
	respondentLocationKey: string,
): IMetricsByLocationMap | undefined {
	const byLocationMap = metrics.byLocationMap
		? (JSON.parse(metrics.byLocationMap) as IMetricsByLocationMap)
		: {};

	if (!byLocationMap?.[respondentLocationKey]) {
		byLocationMap[respondentLocationKey] = {
			totalResponseCount: 0,
			totalAttemptCount: 0,
			totalAnswerTime: 0,
			avgAttemptCount: 0,
			avgAnswerTime: 0,
			questionMetrics: [],
		};
		metrics.questionMetrics.forEach((qMetrics) => {
			const qMetricsByLoc: Partial<QuestionMetricsTypes> = {
				_id: qMetrics._id,
				type: qMetrics.type,
				unansweredCount: 0,
				answerCount: 0,
			};
			if (
				(qMetricsByLoc.type === EQuestionType.MULTIPLE_CHOICE ||
					qMetricsByLoc.type === EQuestionType.SINGLE_CHOICE ||
					qMetricsByLoc.type === EQuestionType.TRUE_OR_FALSE) &&
				qMetricsByLoc.type === qMetrics.type
			) {
				qMetricsByLoc.rightAnswerCount = 0;
				qMetricsByLoc.wrongAnswerCount = 0;
				qMetricsByLoc.options = qMetrics.options.map(({ _id, selectedCount }) => ({ _id, selectedCount }));
			}
			byLocationMap[respondentLocationKey].questionMetrics.push(qMetricsByLoc as QuestionMetricsTypes);
		});
	}

	return byLocationMap;
}
