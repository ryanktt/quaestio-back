import { EUserRole, QuestionnaireTypes, QuestionnaireMetrics, IUpsertResponsePayload } from '../types/types';
import { updateQuestionnaireMetrics, correctQuestionnaireAnswers, validateResponseAnswers } from '../helpers';
import { getQuestionnaireAnswerTimeInMs } from '../helpers/get-questionnaire-answer-time';
import { getRespondentLocationByIp } from '../helpers/get-respondent-location';
import { parseRespondentToken } from '../helpers/parse-respondent-token';
import { MongoClient, ObjectId } from 'mongodb';

interface IUpsertResponseParams {
	mongoClient: MongoClient;
	payload: IUpsertResponsePayload;
}

export async function upsertQuestionnaireResponse({
	mongoClient,
	payload,
}: IUpsertResponseParams): Promise<void> {
	const { respondentToken, completedAt, userAgent, startedAt, answers, email, name, ip } = payload;

	const questionnaireId = new ObjectId(payload.questionnaireId);

	try {
		let respondentId: ObjectId | undefined;
		if (respondentToken) {
			const jwtPayload = parseRespondentToken(respondentToken);
			if (jwtPayload.respondentId) respondentId = new ObjectId(jwtPayload.respondentId);
		}

		const db = mongoClient.db();
		const metricsCollection = db.collection('questionnairemetrics');
		const questionnaireCollection = db.collection('questionnaires');
		const respondentCollection = db.collection('respondents');
		const responseCollection = db.collection('responses');

		const [questionnaire, metrics] = await Promise.all([
			questionnaireCollection.findOne({ _id: questionnaireId }) as Promise<QuestionnaireTypes>,
			metricsCollection.findOne({ _id: questionnaireId }) as Promise<QuestionnaireMetrics>,
		]);

		if (!questionnaire) {
			throw new Error('questionnaire not found');
		}
		if (!metrics) {
			throw new Error('metrics not found');
		}

		const attemptCount =
			(await respondentCollection.countDocuments({
				questionnaire: questionnaireId,
				_id: respondentId,
			})) + 1;
		const answerTime = getQuestionnaireAnswerTimeInMs({ startedAt, completedAt });

		validateResponseAnswers({ answers, questionnaire });
		correctQuestionnaireAnswers({ answers, questionnaire });
		updateQuestionnaireMetrics({
			respondentIp: ip,
			questionnaire,
			attemptCount,
			answerTime,
			answers,
			metrics,
		});

		const session = mongoClient.startSession();
		await session.withTransaction(async (session) => {
			await respondentCollection.updateOne(
				{ _id: respondentId },
				{
					$setOnInsert: { _id: respondentId },
					$set: {
						location: getRespondentLocationByIp(ip),
						questionnaire: questionnaireId,
						role: EUserRole.Respondent,
						...(email && { email }),
						...(name && { name }),
					},
				},
				{ session, upsert: true },
			);
			await responseCollection.insertOne(
				{
					questionnaireSharedId: questionnaire.sharedId,
					questionnaire: questionnaireId,
					user: questionnaire.user,
					respondent: respondentId,
					...(email && { respondentEmail: email }),
					...(name && { respondentName: name }),
					completedAt: new Date(completedAt),
					startedAt: new Date(startedAt),
					userAgent,
					answerTime,
					answers: answers.map((answer) => ({
						...answer,
						answeredAt: answer.answeredAt
							? new Date(answer.answeredAt)
							: undefined
					}
					)),
				},
				{ session },
			);
			await metricsCollection.updateOne({ _id: metrics._id }, { $set: metrics }, { session });
		});
	} catch (error) {
		console.log(error);
	}
}
