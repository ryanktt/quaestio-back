import { EAnswerType } from '../response.interface';

import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class AnswerInput {
	@Field(() => EAnswerType)
	type: EAnswerType;

	@Field()
	questionId: string;

	@Field(() => Date, { nullable: true })
	answeredAt?: Date;
}

@InputType()
class AnswerMultipleChoiceInput extends AnswerInput {
	@Field(() => EAnswerType)
	type: EAnswerType.MULTIPLE_CHOICE;

	@Field(() => [String], { nullable: true })
	optionIds?: string[];
}

@InputType()
class AnswerSingleChoiceInput extends AnswerInput {
	@Field(() => EAnswerType)
	type: EAnswerType.SINGLE_CHOICE;

	@Field({ nullable: true })
	optionId?: string;
}

@InputType()
class AnswerTrueOrFalseInput extends AnswerInput {
	@Field(() => EAnswerType)
	type: EAnswerType.MULTIPLE_CHOICE;

	@Field({ nullable: true })
	optionId?: string;
}

@InputType()
class AnswerTextInput extends AnswerInput {
	@Field(() => EAnswerType)
	type: EAnswerType.TEXT;

	@Field({ nullable: true })
	text?: string;
}

@InputType()
class AnswerRatingInput extends AnswerInput {
	@Field(() => EAnswerType)
	type: EAnswerType.RATING;

	@Field(() => Number, { nullable: true })
	rating?: number;
}

@InputType()
export class AnswerDiscriminatorInput {
	@Field(() => EAnswerType)
	type: EAnswerType;

	@Field(() => AnswerMultipleChoiceInput, { nullable: true })
	answerMultipleChoice?: AnswerMultipleChoiceInput;

	@Field(() => AnswerSingleChoiceInput, { nullable: true })
	answerSingleChoice?: AnswerSingleChoiceInput;

	@Field(() => AnswerTrueOrFalseInput, { nullable: true })
	answerTrueOrFalse?: AnswerTrueOrFalseInput;

	@Field(() => AnswerTextInput, { nullable: true })
	answerText?: AnswerTextInput;

	@Field(() => AnswerRatingInput, { nullable: true })
	answerRating?: AnswerRatingInput;
}
