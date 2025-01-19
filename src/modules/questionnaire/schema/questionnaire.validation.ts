import { EQuestionnaireType, EQuestionType, EQuestionMethodType } from '../questionnaire.interface';

import Joi from 'joi';

export const OptionInputValidator = Joi.object().keys({
	title: Joi.string().trim().required(),
	feedbackAfterSubmit: Joi.string().trim(),
	correct: Joi.boolean(),
});

export const baseQuestionInputValidatorKeys = {
	type: Joi.string()
		.valid(...Object.values(EQuestionType))
		.required(),
	description: Joi.string().trim(),
	required: Joi.boolean(),
	title: Joi.string().trim(),
	showCorrectAnswer: Joi.boolean(),
	weight: Joi.number().integer().positive(),
};

const QuestionSingleChoiceInputValidator = Joi.object().keys({
	...baseQuestionInputValidatorKeys,
	type: Joi.string().valid(EQuestionType.SINGLE_CHOICE).required(),
	options: Joi.array().items(OptionInputValidator).required(),
	randomizeOptions: Joi.boolean().required(),
	wrongAnswerFeedback: Joi.string().trim(),
	rightAnswerFeedback: Joi.string().trim(),
});

const QuestionMultipleChoiceInputValidator = Joi.object().keys({
	...baseQuestionInputValidatorKeys,
	type: Joi.string().valid(EQuestionType.MULTIPLE_CHOICE).required(),
	options: Joi.array().items(OptionInputValidator).required(),
	randomizeOptions: Joi.boolean().required(),
	wrongAnswerFeedback: Joi.string().trim(),
	rightAnswerFeedback: Joi.string().trim(),
});

const QuestionTrueOrFalseInputValidator = Joi.object().keys({
	...baseQuestionInputValidatorKeys,
	type: Joi.string().valid(EQuestionType.TRUE_OR_FALSE).required(),
	options: Joi.array().items(OptionInputValidator).required(),
	wrongAnswerFeedback: Joi.string().trim(),
	rightAnswerFeedback: Joi.string().trim(),
});

const QuestionTextInputValidator = Joi.object().keys({
	...baseQuestionInputValidatorKeys,
	type: Joi.string().valid(EQuestionType.TEXT).required(),
	feedbackAfterSubmit: Joi.string().trim(),
});

export const QuestionDiscriminatorInputValidator = Joi.object().keys({
	type: Joi.string()
		.valid(...Object.values(EQuestionType))
		.required(),
	questionMultipleChoice: QuestionMultipleChoiceInputValidator.when('type', {
		is: Joi.string().valid(EQuestionType.MULTIPLE_CHOICE),
		then: Joi.required(),
		otherwise: Joi.optional(),
	}),
	questionSingleChoice: QuestionSingleChoiceInputValidator.when('type', {
		is: Joi.string().valid(EQuestionType.SINGLE_CHOICE),
		then: Joi.required(),
		otherwise: Joi.optional(),
	}),
	questionTrueOrFalse: QuestionTrueOrFalseInputValidator.when('type', {
		is: Joi.string().valid(EQuestionType.TRUE_OR_FALSE),
		then: Joi.required(),
		otherwise: Joi.optional(),
	}),
	questionText: QuestionTextInputValidator.when('type', {
		is: Joi.string().valid(EQuestionType.TEXT),
		then: Joi.required(),
		otherwise: Joi.optional(),
	}),
});

export const QuestionMethodValidator = Joi.object().keys({
	type: Joi.string()
		.valid(...Object.values(EQuestionMethodType))
		.required(),
	questionId: Joi.string().when('type', {
		is: Joi.string().valid(EQuestionMethodType.DELETE, EQuestionMethodType.UPDATE),
		then: Joi.required(),
		otherwise: Joi.optional(),
	}),
	questionDiscriminator: QuestionDiscriminatorInputValidator.when('type', {
		is: Joi.string().valid(EQuestionMethodType.CREATE, EQuestionMethodType.UPDATE),
		then: Joi.required(),
		otherwise: Joi.optional(),
	}),
});

export const CreateQuestionnaireValidator = Joi.object().keys({
	type: Joi.string()
		.valid(...Object.values(EQuestionnaireType))
		.required(),
	title: Joi.string().max(250).required(),
	description: Joi.string().trim().required(),
	user: Joi.object().required(),
	questions: Joi.array().items(QuestionDiscriminatorInputValidator).required(),
	passingGradePercent: Joi.number(),
	randomizeQuestions: Joi.boolean(),
	maxRetryAmount: Joi.number(),
	requireEmail: Joi.boolean(),
	requireName: Joi.boolean(),
	timeLimit: Joi.number(),
});

export const UpdateQuestionnaireValidator = Joi.object().keys({
	type: Joi.string()
		.valid(...Object.values(EQuestionnaireType))
		.required(),
	questionnaireId: Joi.string().required(),
	user: Joi.object().required(),
	title: Joi.string().trim().max(250),
	description: Joi.string().trim(),
	questionMethods: Joi.array().items(QuestionMethodValidator),
	randomizeQuestions: Joi.boolean().default(false),
	passingGradePercent: Joi.number().allow(null),
	maxRetryAmount: Joi.number().allow(null),
	requireEmail: Joi.boolean().allow(null),
	requireName: Joi.boolean().allow(null),
	timeLimit: Joi.number().allow(null),
});

export const FetchQuestionnaireValidator = Joi.object()
	.keys({
		user: Joi.object().required(),
		questionnaireSharedId: Joi.string(),
		questionnaireId: Joi.string(),
		latest: Joi.boolean(),
	})
	.or('questionnaireSharedId', 'questionnaireId');

export const FetchQuestionnairesValidator = Joi.object().keys({
	user: Joi.object().required(),
	questionnaireSharedIds: Joi.array().items(Joi.string()),
	questionnaireIds: Joi.array().items(Joi.string()),
});
