import {
	Questionnaire,
	QuestionnaireExam,
	QuestionnaireQuiz,
	QuestionnaireSurvey,
	QuestionDiscriminatorInput,
} from './schema';
import { QuestionnaireService } from './questionnaire.service';

import { Resolver, ResolveField, Parent, Context, Mutation, Args, Query } from '@nestjs/graphql';
import { EQuestionnaireType } from './questionnaire.interface';
import { Admin, AdminDocument } from 'src/user';
import { IAdminContext } from 'src/session';
import { ILoaders } from 'src/app.loaders';
import { Role } from '@utils/*';

@Resolver(() => Questionnaire)
export class QuestionnaireResolver {
	constructor(private readonly questionnaireService: QuestionnaireService) {}

	@ResolveField(() => Admin)
	async user(
		@Context('loaders') { userLoader }: ILoaders,
		@Parent() questionnaire: Questionnaire,
	): Promise<AdminDocument> {
		return userLoader.load(questionnaire.user) as Promise<AdminDocument>;
	}

	@Role('Admin')
	@Query(() => Questionnaire, { nullable: true })
	async adminFetchQuestionnaire(
		@Context('req') { user }: IAdminContext,
		@Args('questionnaireSharedId', { nullable: true }) questionnaireSharedId?: string,
		@Args('questionnaireId', { nullable: true }) questionnaireId?: string,
	): Promise<Questionnaire | undefined> {
		return this.questionnaireService.fetchQuestionnaire({ questionnaireId, questionnaireSharedId, user });
	}

	@Role('Admin')
	@Mutation(() => QuestionnaireQuiz)
	async adminCreateQuestionnaireQuiz(
		@Context('req') { user }: IAdminContext,
		@Args('questions', { type: () => [QuestionDiscriminatorInput] }) questions: QuestionDiscriminatorInput[],
		@Args('title') title: string,
	): Promise<QuestionnaireQuiz> {
		return this.questionnaireService.createQuestionnaire({
			type: EQuestionnaireType.QuestionnaireQuiz,
			questions,
			title,
			user,
		}) as Promise<QuestionnaireQuiz>;
	}

	@Role('Admin')
	@Mutation(() => QuestionnaireSurvey)
	async adminCreateQuestionnaireSurvey(
		@Context('req') { user }: IAdminContext,
		@Args('questions', { type: () => [QuestionDiscriminatorInput] }) questions: QuestionDiscriminatorInput[],
		@Args('title') title: string,
	): Promise<QuestionnaireSurvey> {
		return this.questionnaireService.createQuestionnaire({
			type: EQuestionnaireType.QuestionnaireSurvey,
			questions,
			title,
			user,
		}) as Promise<QuestionnaireSurvey>;
	}

	@Role('Admin')
	@Mutation(() => QuestionnaireExam)
	async adminCreateQuestionnaireExam(
		@Context('req') { user }: IAdminContext,
		@Args('questions', { type: () => [QuestionDiscriminatorInput] }) questions: QuestionDiscriminatorInput[],
		@Args('title') title: string,
		@Args('randomizeQuestions', { nullable: true, defaultValue: false }) randomizeQuestions?: boolean,
		@Args('passingGradePercent', { nullable: true }) passingGradePercent?: number,
		@Args('maxRetryAmount', { nullable: true }) maxRetryAmount?: number,
		@Args('timeLimit', { nullable: true }) timeLimit?: number,
	): Promise<QuestionnaireExam> {
		return this.questionnaireService.createQuestionnaire({
			type: EQuestionnaireType.QuestionnaireExam,
			passingGradePercent,
			randomizeQuestions,
			maxRetryAmount,
			questions,
			timeLimit,
			title,
			user,
		}) as Promise<QuestionnaireExam>;
	}
}
