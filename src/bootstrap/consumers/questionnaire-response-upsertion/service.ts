import { AnswerDiscriminatorInput } from '@modules/response';
import { MongoClient } from 'mongodb';

interface IUpsertResponsePayload {
	guestRespondentId: string;
	questionnaireId: string;
	answers: AnswerDiscriminatorInput[];
}

interface IUpsertResponseParams {
	mongoClient: MongoClient;
	payload: IUpsertResponsePayload;
}

export async function upsertQuestionnaireResponse({
	mongoClient,
	payload,
}: IUpsertResponseParams): Promise<void> {
	console.log(mongoClient, payload);
	await Promise.all([]);
	// const { answers: answerDiscriminatorInputArray, guestRespondentId, questionnaireId } = payload;
	// verificar se o respondent já tem uma resposta pro questionnario: questionnaire.find({guestRespondentId})
	//  se sim, atualizar essa
	//  se não, criar nova
	// converter respostas input pra answer
	// corrigir as respostas
}
