import { IAWSSendToSQS, IInvokeLambda } from './utils.interface';

import { AppError, EGeneralErrorCode } from './utils.error';
import { Injectable } from '@nestjs/common';
import { Lambda } from '@aws-sdk/client-lambda';
import { SQS } from '@aws-sdk/client-sqs';
// import { Kinesis } from '@aws-sdk/client-kinesis';

@Injectable()
export class UtilsAWS {
	// async sendToKineses({ payload, key, streamName, region }: IAWSSendToKinesis): Promise<void> {
	// 	const kinesis = new Kinesis({ region });
	// 	const params = {
	// 		Data: JSON.stringify(payload),
	// 		StreamName: streamName,
	// 		PartitionKey: key,
	// 	};

	// 	await kinesis
	// 		.putRecord(params)
	// 		.promise()
	// 		.catch((err) => {
	// 			throw new AppError({
	// 				originalError: err instanceof Error ? err : undefined,
	// 				code: EGeneralErrorCode.AWS_SEND_TO_KINESIS_ERROR,
	// 				message: 'fail to send data to aws kinesis stream',
	// 			});
	// 		});
	// }

	async sendToSQS({ region, payload, queueUrl }: IAWSSendToSQS): Promise<void> {
		const sqs = new SQS({
			apiVersion: '2012-11-05',
			region,
		});

		await sqs
			.sendMessage({ MessageBody: JSON.stringify(payload), QueueUrl: queueUrl })
			.catch((err) => {
				throw new AppError({
					originalError: err instanceof Error ? err : undefined,
					code: EGeneralErrorCode.AWS_SEND_TO_SQS_ERROR,
					message: 'fail to send data to aws sqs',
				});
			});
	}

	async invokeLambda({ functionName, endpoint, region, payload }: IInvokeLambda): Promise<void> {
		const lambda = new Lambda({ region, endpoint });
		await lambda
			.invoke({
				FunctionName: functionName,
				Payload: JSON.stringify(payload),
			})
			.catch((err) => {
				throw new AppError({
					originalError: err instanceof Error ? err : undefined,
					code: EGeneralErrorCode.AWS_INVOKE_LAMBDA_ERROR,
					message: 'fail to invoke aws lambda function',
				});
			});
	}
}
