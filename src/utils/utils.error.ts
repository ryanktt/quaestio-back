import { registerEnumType } from '@nestjs/graphql';

type ErrorCodeEnum = Record<string, unknown>;
const ErrorCodeEnum = {};
registerEnumType(ErrorCodeEnum, {
	description:
		'Error code structure: [Model]:[Action]:[Type]. Ex: "USER:SIGNUP:INVALID_PARAMS"',
	name: 'ErrorCode',
});

class Collector {
	messages: string[] = [];

	collect(message: string): void {
		this.messages.push(message);
	}
	finish({ message, code }: { message: string; code?: ErrorCodeEnum }): void {
		if (this.messages.length > 0) {
			throw new AppError({ message, code, messages: this.messages });
		}
	}
}

export class AppError extends Error {
	constructor({
		message,
		code,
		messages,
		originalError,
	}: {
		message: string;
		code?: ErrorCodeEnum;
		originalError?: Error;
		messages?: string[];
	}) {
		super(message);
		this.message = message;
		this.code = code;
		this.messages = messages;
		this.originalError = originalError;
	}
	message: string;
	code?: ErrorCodeEnum;
	originalError?: Error;
	messages?: string[];

	static collectorInstance(): Collector {
		return new Collector();
	}
}
