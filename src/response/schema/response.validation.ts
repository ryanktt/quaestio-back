import { EAnswerType } from '../response.interface';

import Joi from 'joi';

const baseAnswerInputValidatorKeys = {
	type: Joi.string()
		.valid(...Object.values(EAnswerType))
		.required(),
	questionId: Joi.string().required(),
	answeredAt: Joi.string().required(),
};

const AnswerMultipleChoiceInputValidator = Joi.object().keys({
	...baseAnswerInputValidatorKeys,
	optionIds: Joi.array().items(Joi.string()),
});

const AnswerSingleChoiceInputValidator = Joi.object().keys({
	...baseAnswerInputValidatorKeys,
	optionId: Joi.string(),
});

const AnswerTrueOrFalseInputValidator = Joi.object().keys({
	...baseAnswerInputValidatorKeys,
	optionId: Joi.string(),
});

const AnswerTextInputValidator = Joi.object().keys({
	...baseAnswerInputValidatorKeys,
	text: Joi.string(),
});

export const AnswerDiscriminatorInputValidator = Joi.object().keys({
	type: Joi.string()
		.valid(...Object.values(EAnswerType))
		.required(),
	answerMultipleChoice: AnswerMultipleChoiceInputValidator.when('type', {
		is: Joi.string().valid(EAnswerType.MULTIPLE_CHOICE),
		then: Joi.required(),
		otherwise: Joi.optional(),
	}),
	answerSingleChoice: AnswerSingleChoiceInputValidator.when('type', {
		is: Joi.string().valid(EAnswerType.SINGLE_CHOICE),
		then: Joi.required(),
		otherwise: Joi.optional(),
	}),
	answerTrueOrFalse: AnswerTrueOrFalseInputValidator.when('type', {
		is: Joi.string().valid(EAnswerType.TRUE_OR_FALSE),
		then: Joi.required(),
		otherwise: Joi.optional(),
	}),
	answerText: AnswerTextInputValidator.when('type', {
		is: Joi.string().valid(EAnswerType.TEXT),
		then: Joi.required(),
		otherwise: Joi.optional(),
	}),
});

export const CreateResponseValidator = Joi.object().keys({
	answers: Joi.array().items(AnswerDiscriminatorInputValidator).required(),
	questionnaireId: Joi.string().required(),
	user: Joi.object().required(),
	startedAt: Joi.date(),
});
