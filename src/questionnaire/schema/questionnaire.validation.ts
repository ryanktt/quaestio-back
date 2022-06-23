import { EQuestionnaireType, EQuestionType } from '../questionnaire.interface';
import Joi from 'joi';

export const OptionInputValidator = Joi.object().keys({
	title: Joi.string().required(),
	feedbackAfterSubmit: Joi.string(),
	correct: Joi.boolean(),
});

export const baseQuestionInputValidatorKeys = {
	type: Joi.string()
		.valid(...Object.values(EQuestionType))
		.required(),
	title: Joi.string().required(),
	weight: Joi.number(),
	required: Joi.boolean(),
	description: Joi.string(),
	showCorrectAnswer: Joi.boolean(),
};

export const QuestionInputValidator = Joi.object().keys(baseQuestionInputValidatorKeys);

const QuestionSingleChoiceInputValidator = Joi.object().keys({
	...baseQuestionInputValidatorKeys,
	options: Joi.array().items(OptionInputValidator).required(),
	randomizeOptions: Joi.boolean().required(),
	wrongAnswerFeedback: Joi.string(),
	rightAnswerFeedback: Joi.string(),
});

const QuestionMultipleChoiceInputValidator = Joi.object().keys({
	...baseQuestionInputValidatorKeys,
	options: Joi.array().items(OptionInputValidator).required(),
	randomizeOptions: Joi.boolean().required(),
	wrongAnswerFeedback: Joi.string(),
	rightAnswerFeedback: Joi.string(),
});

const QuestionTrueOrFalseInputValidator = Joi.object().keys({
	...baseQuestionInputValidatorKeys,
	options: Joi.array().items(OptionInputValidator).required(),
	wrongAnswerFeedback: Joi.string(),
	rightAnswerFeedback: Joi.string(),
});

const QuestionTextInputValidator = Joi.object().keys({
	...baseQuestionInputValidatorKeys,
	feedbackAfterSubmit: Joi.string(),
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

export const CreateQuestionnaireValidator = Joi.object().keys({
	type: Joi.string()
		.valid(...Object.values(EQuestionnaireType))
		.required(),
	title: Joi.string().required(),
	user: Joi.object().required(),
	questions: Joi.array().items(QuestionDiscriminatorInputValidator),
	passingGradePercent: Joi.number(),
	randomizeQuestions: Joi.boolean(),
	maxRetryAmount: Joi.number(),
	timeLimit: Joi.number(),
});
