/* eslint-disable no-undef */
const dotenv = require('dotenv');
dotenv.config();

exports.local = () => ({
	STAGE: 'local',
	MONGO_URI: process.env.MONGO_URI,
	JWT_SECRET: process.env.JWT_SECRET,
	AWS_UPSERT_RESPONSE_LAMBDA_CONSUMER_REGION: 'us-east-1',
	AWS_UPSERT_RESPONSE_LAMBDA_CONSUMER_ENDPOINT: 'http://localhost:3002',
	AWS_UPSERT_RESPONSE_LAMBDA_CONSUMER_QUEUE_URL:
		'https://sqs.us-east-1.amazonaws.com/874738831934/dev-questionnaire-app-upsert-questionnaire-response-queue',
	AWS_UPSERT_RESPONSE_LAMBDA_CONSUMER_FUNCTION_NAME:
		'questionnaire-app-local-upsert-questionnaire-response-consumer',
});

exports.dev = () => ({
	STAGE: 'dev',
	MONGO_URI: process.env.MONGO_URI,
	JWT_SECRET: process.env.JWT_SECRET,
	AWS_UPSERT_RESPONSE_LAMBDA_CONSUMER_REGION: 'us-east-1',
	AWS_UPSERT_RESPONSE_LAMBDA_CONSUMER_ENDPOINT: 'lambda.us-east-1.amazonaws.com',
	AWS_UPSERT_RESPONSE_LAMBDA_CONSUMER_QUEUE_URL:
		'https://sqs.us-east-1.amazonaws.com/874738831934/dev-questionnaire-app-upsert-questionnaire-response-queue',
	AWS_UPSERT_RESPONSE_LAMBDA_CONSUMER_FUNCTION_NAME:
		'questionnaire-app-dev-upsert-questionnaire-response-consumer',
});

exports.prod = () => ({
	STAGE: 'prod',
	MONGO_URI: process.env.MONGO_URI,
	JWT_SECRET: process.env.JWT_SECRET,
	AWS_UPSERT_RESPONSE_LAMBDA_CONSUMER_REGION: 'us-east-1',
	AWS_UPSERT_RESPONSE_LAMBDA_CONSUMER_ENDPOINT: 'lambda.us-east-1.amazonaws.com',
	AWS_UPSERT_RESPONSE_LAMBDA_CONSUMER_QUEUE_URL:
		'https://sqs.us-east-1.amazonaws.com/874738831934/prod-questionnaire-app-upsert-questionnaire-response-queue',
	AWS_UPSERT_RESPONSE_LAMBDA_CONSUMER_FUNCTION_NAME:
		'questionnaire-app-prod-upsert-questionnaire-response-consumer',
});
