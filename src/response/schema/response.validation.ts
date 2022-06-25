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
