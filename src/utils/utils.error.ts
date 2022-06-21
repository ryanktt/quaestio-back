import { EUserErrorCode, ERespondentErrorCode } from 'src/user';
import { EQuestionnaireErrorCode } from 'src/questionnaire';
import { EResponseErrorCode } from 'src/response';
import { ESessionErrorCode } from 'src/session';

export enum EGeneralErrorCode {
	ACCESS_DENIED = 'ACCESS_DENIED',
}

type EErrorCode =
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

class ErrorCollector {
	errors: IError[] = [];

	collect(err: AppError): void {
		const { code, message, originalError, payload } = err;
		this.errors.push({ code, message, originalError, payload });
	}

	run({ message, code, payload }: IError): void {
		if (this.errors.length > 0) {
			throw new AppError({ message, code, errors: this.errors, payload });
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
