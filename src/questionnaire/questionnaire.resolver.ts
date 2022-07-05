import {
	Questionnaire,
	QuestionnaireExam,
	QuestionnaireQuiz,
	QuestionnaireSurvey,
	QuestionnaireMetrics,
	QuestionDiscriminatorInput,
} from './schema';
import { QuestionnaireService } from './questionnaire.service';

import {
	ResolveField,
	ObjectType,
	Resolver,
	Mutation,
	Context,
	Parent,
	Field,
	Args,
	Query,
} from '@nestjs/graphql';
import { EQuestionnaireType } from './questionnaire.interface';
import { Admin, AdminDocument } from 'src/user';
import { IAdminContext } from 'src/session';
import { ILoaders } from 'src/app.loaders';
import { Role } from '@utils/*';

@ObjectType()
class FetchQuestionnaireMetricsResponse {
	@Field(() => Questionnaire)
	questionnaire: Questionnaire;

	@Field(() => QuestionnaireMetrics)
	metrics: QuestionnaireMetrics;
}

@Resolver(() => Questionnaire)
export class QuestionnaireResolver {
	constructor(private readonly questionnaireService: QuestionnaireService) {}

	@ResolveField(() => QuestionnaireMetrics)
	async metrics(
		@Context('loaders') { questionnaireMetricsLoader }: ILoaders,
		@Parent() questionnaire: Questionnaire,
	): Promise<QuestionnaireMetrics> {
		return questionnaireMetricsLoader.load({ questionnaire });
	}

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
		@Args('latest', { nullable: true }) latest?: boolean,
	): Promise<Questionnaire | undefined> {
		return this.questionnaireService.fetchQuestionnaire({
			questionnaireSharedId,
			questionnaireId,
			latest,
			user,
		});
	}

	@Role('Admin')
	@Query(() => FetchQuestionnaireMetricsResponse, { nullable: true })
	async adminFetchQuestionnaireMetrics(
		@Context('req') { user }: IAdminContext,
		@Args('questionnaireId', { nullable: true }) questionnaireId: string,
	): Promise<FetchQuestionnaireMetricsResponse> {
		return this.questionnaireService.fetchQuestionnaireMetrics({ questionnaireId, user });
	}

	@Role('Admin')
	@Query(() => [Questionnaire])
	async adminFetchQuestionnaires(
		@Context('req') { user }: IAdminContext,
		@Args('questionnaireSharedIds', { type: () => [String], nullable: true })
		questionnaireSharedIds?: string[],
		@Args('questionnaireIds', { type: () => [String], nullable: true }) questionnaireIds?: string[],
		@Args('latest', { nullable: true }) latest?: boolean,
	): Promise<Questionnaire[]> {
		return this.questionnaireService.fetchQuestionnaires({
			questionnaireSharedIds,
			questionnaireIds,
			latest,
			user,
		});
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

	@Role('Admin')
	@Mutation(() => QuestionnaireQuiz)
	async adminUpdateQuestionnaireQuiz(
		@Context('req') { user }: IAdminContext,
		@Args('questionnaireId') questionnaireId: string,
		@Args('questions', { type: () => [QuestionDiscriminatorInput], nullable: true })
		questions?: QuestionDiscriminatorInput[],
		@Args('title', { nullable: true }) title?: string,
	): Promise<QuestionnaireQuiz> {
		return this.questionnaireService.updateQuestionnaire({
			type: EQuestionnaireType.QuestionnaireQuiz,
			questionnaireId,
			questions,
			title,
			user,
		}) as Promise<QuestionnaireQuiz>;
	}

	@Role('Admin')
	@Mutation(() => QuestionnaireSurvey)
	async adminUpdateQuestionnaireSurvey(
		@Context('req') { user }: IAdminContext,
		@Args('questionnaireId') questionnaireId: string,
		@Args('questions', { type: () => [QuestionDiscriminatorInput], nullable: true })
		questions?: QuestionDiscriminatorInput[],
		@Args('title', { nullable: true }) title?: string,
	): Promise<QuestionnaireSurvey> {
		return this.questionnaireService.updateQuestionnaire({
			type: EQuestionnaireType.QuestionnaireSurvey,
			questionnaireId,
			questions,
			title,
			user,
		}) as Promise<QuestionnaireSurvey>;
	}

	@Role('Admin')
	@Mutation(() => QuestionnaireExam)
	async adminUpdateQuestionnaireExam(
		@Context('req') { user }: IAdminContext,
		@Args('questionnaireId') questionnaireId: string,
		@Args('questions', { type: () => [QuestionDiscriminatorInput], nullable: true })
		questions?: QuestionDiscriminatorInput[],
		@Args('randomizeQuestions', { nullable: true, defaultValue: false }) randomizeQuestions?: boolean,
		@Args('passingGradePercent', { nullable: true }) passingGradePercent?: number,
		@Args('maxRetryAmount', { nullable: true }) maxRetryAmount?: number,
		@Args('timeLimit', { nullable: true }) timeLimit?: number,
		@Args('title', { nullable: true }) title?: string,
	): Promise<QuestionnaireExam> {
		return this.questionnaireService.updateQuestionnaire({
			type: EQuestionnaireType.QuestionnaireExam,
			passingGradePercent,
			randomizeQuestions,
			questionnaireId,
			maxRetryAmount,
			questions,
			timeLimit,
			title,
			user,
		}) as Promise<QuestionnaireExam>;
	}
}
