import { EUserErrorCode } from '@modules/user'; 
import { registerEnumType } from '@nestjs/graphql';

type EErrorCode = EUserErrorCode;
const EErrorCode = { ...Object.values(EUserErrorCode) };

registerEnumType(EErrorCode, { name: 'ErrorCode' });

interface IError {
	message: string;
	code?: EErrorCode;
	originalError?: Error;
}

class ErrorCollector {
	errors: IError[] = [];

	collect(err: AppError): void {
		const { code, message, originalError } = err;
		this.errors.push({ code, message, originalError });
	}

	run({ message, code }: { message: string; code?: EErrorCode }): void {
		if (this.errors.length > 0) {
			throw new AppError({ message, code, errors: this.errors });
		}
	}
}

export class AppError extends Error {
	constructor({
		message,
		code,
		errors,
		originalError,
	}: {
		message: string;
		code?: EErrorCode;
		originalError?: Error;
		errors?: IError[];
	}) {
		super(message);
		this.message = message;
		this.code = code;
		this.errors = errors;
		this.originalError = originalError;
	}
	message: string;
	code?: EErrorCode;
	originalError?: Error;
	errors?: IError[];

	static collectorInstance(): ErrorCollector {
		return new ErrorCollector();
	}
}
