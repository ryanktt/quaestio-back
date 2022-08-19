import { AnswerDiscriminatorInput, Answer } from './schema';

import { Questionnaire } from '@modules/questionnaire/schema/questionnaire.schema';
import { registerEnumType } from '@nestjs/graphql';
// import { RespondentDocument } from '@modules/user';

export enum EAnswerType {
	MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
	SINGLE_CHOICE = 'SINGLE_CHOICE',
	TRUE_OR_FALSE = 'TRUE_OR_FALSE',
	TEXT = 'TEXT',
}
export enum EResponseErrorCode {
	CREATE_RESPONSE_INVALID_PARAMS = 'CREATE_RESPONSE_INVALID_PARAMS',
	CREATE_RESPONSE_ERROR = 'CREATE_RESPONSE_ERROR',
	FETCH_RESPONSES_ERROR = 'FETCH_RESPONSES_ERROR',
	FETCH_RESPONSE_ERROR = 'FETCH_RESPONSE_ERROR',
	SAVE_RESPONSE_ERROR = 'SAVE_RESPONSE_ERROR',
	INVALID_ANSWER = 'INVALID_ANSWER',
}

registerEnumType(EAnswerType, { name: 'AnswerType' });
registerEnumType(EResponseErrorCode, { name: 'SessionErrorCode' });

export interface IRepositoryUpsertResponseParams {
	questionnaireId: string;
	answers: Answer[];
	startedAt?: Date;
}

export interface IRepositoryFetchResponsesParams {
	questionnaireIds?: string[];
	responseIds?: string[];
}

export interface IRepositoryFetchResponseParams {
	questionnaireId?: string;
	responseId?: string;
}

// export interface IRepositoryUpdateResponseParams {
// 	response: RespondentDocument;
// 	completedAt?: Date;
// 	answers?: Answer[];
// 	startedAt?: Date;
// }

export interface IUpsertResponseParams {
	answers: AnswerDiscriminatorInput[];
	questionnaireId: string;
	responseId?: string;
}

export interface IPublicUpsertResponseParams {
	answers: AnswerDiscriminatorInput[];
	questionnaireId: string;
	authToken?: string;
}

export interface IValidateAnswers {
	questionnaire: Questionnaire;
	answers: Answer[];
}

export interface ICorrectAnswers {
	questionnaire: Questionnaire;
	answers: Answer[];
}
