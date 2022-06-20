import { Field, InputType } from '@nestjs/graphql';
import { EAnswerType } from './response.interface';

@InputType()
class AnswerInput {
	@Field(() => EAnswerType)
	type!: EAnswerType;

	@Field()
	question!: string;

	@Field(() => Date, { nullable: true })
	answeredAt?: Date;
}

@InputType()
class AnswerMultipleChoiceInput extends AnswerInput {
	@Field(() => EAnswerType)
	type!: EAnswerType.MULTIPLE_CHOICE;

	@Field(() => [String], { nullable: true })
	options?: string[];
}

@InputType()
class AnswerSingleChoiceInput extends AnswerInput {
	@Field(() => EAnswerType)
	type!: EAnswerType.SINGLE_CHOICE;

	@Field({ nullable: true })
	option?: string;
}

@InputType()
class AnswerTrueOrFalseInput extends AnswerInput {
	@Field(() => EAnswerType)
	type!: EAnswerType.MULTIPLE_CHOICE;

	@Field({ nullable: true })
	option?: string;
}

@InputType()
class AnswerTextInput extends AnswerInput {
	@Field(() => EAnswerType)
	type!: EAnswerType.TEXT;

	@Field({ nullable: true })
	text?: string;
}

@InputType()
export class AnswerDiscriminatorInput {
	@Field(() => EAnswerType)
	answerType!: EAnswerType;

	@Field(() => AnswerMultipleChoiceInput, { nullable: true })
	answerMultipleChoice?: AnswerMultipleChoiceInput;

	@Field(() => AnswerSingleChoiceInput, { nullable: true })
	answerSingleChoice?: AnswerSingleChoiceInput;

	@Field(() => AnswerTrueOrFalseInput, { nullable: true })
	answerTrueOrFalse?: AnswerTrueOrFalseInput;

	@Field(() => AnswerTextInput, { nullable: true })
	answerText?: AnswerTextInput;
}
