import { EQuestionType } from './questionnaire.interface';

import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class OptionInput {
	@Field()
	title: string;

	@Field()
	correct: boolean;

	@Field({ nullable: true })
	feedbackAfterSubmit?: string;
}

@InputType()
export class QuestionInput {
	@Field(() => EQuestionType)
	type: EQuestionType;

	@Field()
	title: string;

	@Field({ nullable: true })
	weight?: number;

	@Field({ defaultValue: false })
	required: boolean;

	@Field({ nullable: true })
	description?: string;

	@Field({ defaultValue: false })
	showCorrectAnswer: boolean;
}

@InputType()
export class QuestionSingleChoiceInput extends QuestionInput {
	@Field(() => EQuestionType)
	type: EQuestionType.SINGLE_CHOICE;

	@Field(() => [OptionInput])
	options: OptionInput[];

	@Field()
	randomizeOptionInputs: boolean;

	@Field({ nullable: true })
	wrongAnswerFeedback?: string;

	@Field({ nullable: true })
	rightAnswerFeedback?: string;
}

@InputType()
export class QuestionMultipleChoiceInput extends QuestionInput {
	@Field(() => EQuestionType)
	type: EQuestionType.MULTIPLE_CHOICE;

	@Field(() => [OptionInput])
	options: OptionInput[];

	@Field({ defaultValue: false })
	randomizeOptionInputs: boolean;

	@Field({ nullable: true })
	wrongAnswerFeedback?: string;

	@Field({ nullable: true })
	correctAnswerFeedback?: string;
}

@InputType()
export class QuestionTrueOrFalseInput extends QuestionInput {
	@Field(() => EQuestionType)
	type: EQuestionType.TRUE_OR_FALSE;

	@Field(() => [OptionInput])
	options: OptionInput[];

	@Field({ nullable: true })
	wrongAnswerFeedback?: string;

	@Field({ nullable: true })
	correctAnswerFeedback?: string;
}

@InputType()
export class QuestionTextInput extends QuestionInput {
	@Field(() => EQuestionType)
	type: EQuestionType.TEXT;

	@Field({ nullable: true })
	feedbackAfterSubmit?: string;
}

@InputType()
export class QuestionDiscriminatorInput {
	@Field(() => EQuestionType)
	type: EQuestionType;

	@Field(() => QuestionMultipleChoiceInput, { nullable: true })
	questionMultipleChoice?: QuestionMultipleChoiceInput;

	@Field(() => QuestionSingleChoiceInput, { nullable: true })
	questionSingleChoice?: QuestionSingleChoiceInput;

	@Field(() => QuestionTrueOrFalseInput, { nullable: true })
	questionTrueOrFalse?: QuestionTrueOrFalseInput;

	@Field(() => QuestionTextInput, { nullable: true })
	questionText?: QuestionTextInput;
}
