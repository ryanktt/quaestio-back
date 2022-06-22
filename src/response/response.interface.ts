import { AnswerDiscriminatorInput } from './response.input';
import { Answer } from './response.schema';

import { registerEnumType } from '@nestjs/graphql';
import { RespondentDocument } from 'src/user';

export enum EAnswerType {
	MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
	SINGLE_CHOICE = 'SINGLE_CHOICE',
	TRUE_OR_FALSE = 'TRUE_OR_FALSE',
	TEXT = 'TEXT',
}
export enum EResponseErrorCode {
	CREATE_RESPONSE_INVALID_PARAMS = 'CREATE_RESPONSE_INVALID_PARAMS',
	CREATE_RESPONSE_ERROR = 'CREATE_RESPONSE_ERROR',
	INVALID_ANSWER = 'INVALID_ANSWER',
}

registerEnumType(EAnswerType, { name: 'AnswerType' });
registerEnumType(EResponseErrorCode, { name: 'SessionErrorCode' });

export interface IRepositoryCreateResponseParams {
	questionnaireId: string;
	answers: Answer[];
	sharedId?: string;
	userId: string;
}

export interface ICreateResponseParams {
	answers: AnswerDiscriminatorInput[];
	user: RespondentDocument; //user?:
	// TODO quest?: GuestDoc
	questionnaireId: string;
}
