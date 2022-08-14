import {
	updateQuestionnaireMetrics,
	correctQuestionnaireAnswers,
	validateQuestionnaireAnswers,
} from '../helpers';
import { IUpsertResponsePayload, QuestionnaireTypes } from '../types/types';
import { MongoClient, ObjectId } from 'mongodb';

interface IUpsertResponseParams {
	mongoClient: MongoClient;
	payload: IUpsertResponsePayload;
}

export async function upsertQuestionnaireResponse({
	mongoClient,
	payload,
}: IUpsertResponseParams): Promise<void> {
	const { questionnaireId, guestRespondentId, answers, startedAt = new Date() } = payload;

	const questionnaireObjId = new ObjectId(questionnaireId);

	const db = mongoClient.db();
	const questionnaireCollection = db.collection('questionnaires');
	const responseCollection = db.collection('responses');

	const [questionnaire, response] = await Promise.all([
		questionnaireCollection.findOne({ _id: questionnaireObjId }) as Promise<QuestionnaireTypes>,
		responseCollection.findOne({ guestRespondentId, questionnaire: questionnaireObjId }),
	]);

	if (!questionnaire) {
		throw new Error('questionnaire not found');
	}

	validateQuestionnaireAnswers({ answers, questionnaire });
	correctQuestionnaireAnswers({ answers, questionnaire });
	updateQuestionnaireMetrics({ answers, questionnaire });

	const session = mongoClient.startSession();
	await session.withTransaction(async (session) => {
		if (!response) {
			await responseCollection.insertOne(
				{
					guestRespondentId,
					questionnaire: questionnaireObjId,
					startedAt,
					answers,
				},
				{ session },
			);
		} else {
			await responseCollection.updateOne(
				{ _id: response._id },
				{
					$set: {
						guestRespondentId,
						questionnaire: questionnaireObjId,
						startedAt,
						answers,
					},
				},
				{ session },
			);
		}

		await questionnaireCollection.updateOne(
			{ _id: questionnaireObjId },
			{
				$set: {
					responseCount: questionnaire.responseCount,
					questions: questionnaire.questions,
				},
			},
			{ session },
		);
	});
}
