import { registerEnumType } from '@nestjs/graphql';
import { Answer } from './response.schema';

export enum EAnswerType {
	MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
	SINGLE_CHOICE = 'SINGLE_CHOICE',
	TRUE_OR_FALSE = 'TRUE_OR_FALSE',
	TEXT = 'TEXT',
}
export enum EResponseErrorCode {
	CREATE_RESPONSE_ERROR = 'CREATE_RESPONSE_ERROR',
}

registerEnumType(EAnswerType, { name: 'AnswerType' });
registerEnumType(EResponseErrorCode, { name: 'SessionErrorCode' });

export interface ICreateResponseParams {
	questionnaireId: string;
	answers: Answer[];
	sharedId: string;
	userId: string;
}
