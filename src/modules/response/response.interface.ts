import { AnswerDiscriminatorInput, Answer, AnswerTypes } from './schema';

import { QuestionnaireTypes } from 'src/bootstrap/consumers/upsert-questionnaire-response/types/types';
import { Questionnaire } from '@modules/questionnaire/schema/questionnaire.schema';
import { registerEnumType } from '@nestjs/graphql';
import { User } from '@modules/user/user.schema';
import { PaginationInput } from '@utils/utils.pagination';
// import { RespondentDocument } from '@modules/user';

export enum EAnswerType {
	MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
	SINGLE_CHOICE = 'SINGLE_CHOICE',
	TRUE_OR_FALSE = 'TRUE_OR_FALSE',
	TEXT = 'TEXT',
}
export enum EResponseErrorCode {
	CREATE_RESPONSE_INVALID_PARAMS = 'CREATE_RESPONSE_INVALID_PARAMS',
	FETCH_RESPONSES_INVALID_PARAMS = 'FETCH_RESPONSES_INVALID_PARAMS',
	MISSING_REQUIRED_FIELDS = 'MISSING_REQUIRED_FIELDS',
	CREATE_RESPONSE_ERROR = 'CREATE_RESPONSE_ERROR',
	FETCH_RESPONSES_ERROR = 'FETCH_RESPONSES_ERROR',
	COUNT_RESPONSES_ERROR = 'COUNT_RESPONSES_ERROR',
	FETCH_RESPONSE_ERROR = 'FETCH_RESPONSE_ERROR',
	DELETE_RESPONSES_ERROR = 'DELETE_RESPONSES_ERROR',
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
	questionnaireSharedIds?: string[];
	questionnaireIds?: string[];
	responseIds?: string[];
	textFilter?: string;
	pagination?: PaginationInput;
	user: User;
}

export interface IRepositoryFetchResponseParams {
	responseId?: string;
}

// export interface IRepositoryUpdateResponseParams {
// 	response: RespondentDocument;
// 	completedAt?: Date;
// 	answers?: Answer[];
// 	startedAt?: Date;
// }

export interface IPublicUpsertQuestResponseParams {
	questionnaireId: string;
	answers: AnswerDiscriminatorInput[];
	userAgent: string;
	ip: string;
	completedAt: Date;
	startedAt: Date;
	respondentToken?: string;
	email?: string;
	name?: string;
}

export interface IFetchResponsesParams {
	user: User
	questionnaireSharedIds?: string[];
	questionnaireIds?: string[];
	pagination: PaginationInput;
	textFilter?: string;
}

export interface IValidateAndFetchCorrectedAnswers {
	questionnaireId: string;
	answers: AnswerDiscriminatorInput[];
	completedAt: Date;
	startedAt: Date;
	email?: string;
	name?: string;
}

export interface IFetchResponseParams {
	user: User
	responseId: string
}

export interface IValidateAnswers {
	questionnaire: Questionnaire;
	answers: Answer[];
}

export interface ICorrectAnswers {
	questionnaire: Questionnaire;
	answers: Answer[];
}

export interface IUpdateQuestionnaireMetrics {
	answers: AnswerTypes[];
	questionnaire: QuestionnaireTypes;
}


export interface IResponseCorrection {
	correctedAnswers: AnswerTypes[]
	correctQuestionOptions: {
		questionId: string;
		optionIds: string[];
	}[]
}