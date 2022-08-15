import { EUserErrorCode, ERespondentErrorCode } from '@modules/user';
import { EQuestionnaireErrorCode } from '@modules/questionnaire';
import { EResponseErrorCode } from '@modules/response';
import { ESessionErrorCode } from '@modules/session';

export enum EGeneralErrorCode {
	ACCESS_DENIED = 'ACCESS_DENIED',
	AWS_SEND_TO_KINESIS_ERROR = 'AWS_SEND_TO_KINESIS_ERROR',
	AWS_INVOKE_LAMBDA_ERROR = 'AWS_INVOKE_LAMBDA_ERROR',
}

export const EErrorCode = {
	...EGeneralErrorCode,
	...EQuestionnaireErrorCode,
	...ERespondentErrorCode,
	...EResponseErrorCode,
	...ESessionErrorCode,
	...EUserErrorCode,
};
export type EErrorCode =
	| EGeneralErrorCode
	| EQuestionnaireErrorCode
	| ERespondentErrorCode
	| EResponseErrorCode
	| ESessionErrorCode
	| EUserErrorCode;

interface IError {
	message: string;
	code?: EErrorCode;
	originalError?: Error;
	payload?: unknown;
}

export class ErrorCollector {
	private errors: IError[] = [];

	collect(err: AppError): void {
		const { code, message, originalError, payload } = err;
		this.errors.push({ code, message, originalError, payload });
	}

	run({ message, code, payload }: IError): void {
		if (this.errors.length > 0) {
			throw new AppError({ message, code, errors: this.errors, payload });
		} else {
			this.errors = [];
		}
	}
}

export class AppError extends Error {
	constructor({
		message,
		originalError,
		payload,
		errors,
		code,
	}: {
		message: string;
		originalError?: Error;
		code?: EErrorCode;
		errors?: IError[];
		payload?: unknown;
	}) {
		super(message);
		this.message = message;
		this.originalError = originalError;
		this.payload = payload;
		this.errors = errors;
		this.code = code;
	}
	message: string;
	originalError?: Error;
	code?: EErrorCode;
	errors?: IError[];
	payload?: unknown;

	static collectorInstance(): ErrorCollector {
		return new ErrorCollector();
	}
}
