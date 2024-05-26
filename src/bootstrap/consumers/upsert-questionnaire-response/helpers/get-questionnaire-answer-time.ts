import moment from 'moment';

interface GetQuestionnaireAnswerTimeInMsParams {
	startedAt: Date;
	completedAt: Date;
}

export function getQuestionnaireAnswerTimeInMs({
	completedAt,
	startedAt,
}: GetQuestionnaireAnswerTimeInMsParams): number {
	return moment(completedAt).diff(startedAt);
}
