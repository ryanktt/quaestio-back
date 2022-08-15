/* eslint-disable no-undef */
const dotenv = require('dotenv');
dotenv.config();

exports.local = () => ({
	STAGE: 'local',
	MONGO_URI: process.env.MONGO_URI,
	JWT_SECRET: process.env.JWT_SECRET,
	AWS_UPSERT_RESPONSE_LAMBDA_CONSUMER_REGION: 'us-east-1',
	AWS_UPSERT_RESPONSE_LAMBDA_CONSUMER_ENDPOINT: 'http://localhost:3002',
	AWS_UPSERT_RESPONSE_LAMBDA_CONSUMER_KINESIS_STREAM_NAME: '',
	AWS_UPSERT_RESPONSE_LAMBDA_CONSUMER_FUNCTION_NAME:
		'questionnaire-app-local-upsert-questionnaire-response-consumer',
});

exports.dev = () => ({
	STAGE: 'dev',
	MONGO_URI: process.env.MONGO_URI,
	JWT_SECRET: process.env.JWT_SECRET,
	AWS_UPSERT_RESPONSE_LAMBDA_CONSUMER_REGION: 'us-east-1',
	AWS_UPSERT_RESPONSE_LAMBDA_CONSUMER_ENDPOINT: 'lambda.us-east-1.amazonaws.com',
	AWS_UPSERT_RESPONSE_LAMBDA_CONSUMER_KINESIS_STREAM_NAME: 'questionnaire-upsert-response-stream',
	AWS_UPSERT_RESPONSE_LAMBDA_CONSUMER_FUNCTION_NAME:
		'questionnaire-app-dev-upsert-questionnaire-response-consumer',
});

exports.prod = () => ({
	STAGE: 'prod',
	MONGO_URI: process.env.MONGO_URI,
	JWT_SECRET: process.env.JWT_SECRET,
	AWS_UPSERT_RESPONSE_LAMBDA_CONSUMER_REGION: 'us-east-1',
	AWS_UPSERT_RESPONSE_LAMBDA_CONSUMER_ENDPOINT: 'lambda.us-east-1.amazonaws.com',
	AWS_UPSERT_RESPONSE_LAMBDA_CONSUMER_KINESIS_STREAM_NAME: 'questionnaire-upsert-response-stream',
	AWS_UPSERT_RESPONSE_LAMBDA_CONSUMER_FUNCTION_NAME:
		'questionnaire-app-prod-upsert-questionnaire-response-consumer',
});
