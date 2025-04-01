import { EQuestionType, EQuestionMethodType } from '../questionnaire.interface';

import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class OptionInput {
	@Field(() => String, { nullable: true })
	id?: string;

	@Field()
	title: string;

	@Field({ nullable: true })
	correct?: boolean;

	@Field({ nullable: true, description: 'For true or false questions.' })
	true?: boolean;

	@Field({ nullable: true })
	feedbackAfterSubmit?: string;
}

@InputType()
export class QuestionInput {
	@Field(() => EQuestionType)
	type: EQuestionType;

	@Field({ nullable: true })
	title?: string;

	@Field(() => Int, { nullable: true })
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

	@Field({ nullable: true, defaultValue: false })
	randomizeOptions: boolean;

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
	randomizeOptions: boolean;

	@Field({ nullable: true })
	wrongAnswerFeedback?: string;

	@Field({ nullable: true })
	rightAnswerFeedback?: string;
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
	rightAnswerFeedback?: string;
}

@InputType()
export class QuestionTextInput extends QuestionInput {
	@Field(() => EQuestionType)
	type: EQuestionType.TEXT;

	@Field({ nullable: true })
	feedbackAfterSubmit?: string;
}

@InputType()
export class QuestionRatingInput extends QuestionInput {
	@Field(() => EQuestionType)
	type: EQuestionType.RATING;

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

	@Field(() => QuestionRatingInput, { nullable: true })
	questionRating?: QuestionRatingInput;
}

@InputType()
export class QuestionMethodInput {
	@Field(() => EQuestionMethodType)
	type: EQuestionMethodType;

	@Field(() => String, { nullable: true })
	questionId: string;

	@Field(() => Int, { nullable: true })
	index?: number;

	@Field(() => QuestionDiscriminatorInput, { nullable: true })
	questionDiscriminator: QuestionDiscriminatorInput;
}
@InputType()
export class QuestionOrderInput {
	@Field(() => String, { nullable: true })
	questionId: string;

	@Field(() => Int, { nullable: true })
	index: number;
}