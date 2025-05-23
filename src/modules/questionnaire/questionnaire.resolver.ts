import {
	Questionnaire,
	QuestionnaireExam,
	QuestionnaireQuiz,
	QuestionnaireSurvey,
	QuestionDiscriminatorInput,
	QuestionMethodInput,
	QuestionOrderInput,
	Option,
} from './schema';
import { QuestionnaireMetrics } from './schema/questionnaire-metrics';
import { QuestionnaireService } from './questionnaire.service';

import { ResolveField, Resolver, Mutation, Context, Parent, Query, Args, Field, ObjectType, Int } from '@nestjs/graphql';
import { UserSessionRepository } from '@modules/shared/user-session/user-session.repository';
import { QuestionnaireRepository } from './questionnaire.repository';
import { IAdminContext } from '@modules/session/session.interface';
import { EQuestionnaireType } from './questionnaire.interface';
import { Admin } from '@modules/user/admin/admin.schema';
import { Role } from '@utils/utils.decorators';
import { PaginationInput, PaginatedResponse, defaultPaginationValues } from '@utils/utils.pagination';

@ObjectType()
export class DeleteQuestionnaireResponse {
	@Field(() => String)
	status: string;
}

@Resolver(() => Option)
export class OptionResolver {
	@ResolveField(() => Boolean, { nullable: true })
	correct(
		@Context() { user }: IAdminContext,
		@Parent() option: Option
	): boolean | undefined {
		return user ? option.correct : undefined;
	}
}

@ObjectType()
export class PaginatedQuestionnaireResponse extends PaginatedResponse(Questionnaire) { }

@Resolver(() => Questionnaire)
export class QuestionnaireResolver {
	constructor(
		private readonly questionnaireRepository: QuestionnaireRepository,
		private readonly questionnaireService: QuestionnaireService,
		private readonly userSessionRepository: UserSessionRepository,
	) { }

	@ResolveField(() => Admin)
	async user(@Parent() questionnaire: Questionnaire): Promise<Admin> {
		return this.userSessionRepository.userLoader().load(questionnaire.user.toString()) as Promise<Admin>;
	}

	@ResolveField(() => QuestionnaireMetrics)
	async metrics(@Parent() questionnaire: Questionnaire): Promise<QuestionnaireMetrics> {
		return this.questionnaireRepository.questionnaireMetricsLoader().load(questionnaire._id.toString());
	}

	@Role('Admin')
	@Mutation(() => DeleteQuestionnaireResponse, { nullable: true })
	async adminDeleteQuestionnaire(
		@Args('questionnaireSharedId') questionnaireSharedId: string,
	): Promise<DeleteQuestionnaireResponse | undefined> {
		await this.questionnaireService.deleteQuestionnaire({ questionnaireSharedId });
		return { status: 'Success' };
	}

	@Role('Admin')
	@Mutation(() => Questionnaire, { nullable: true })
	async adminToggleQuestionnaireActive(
		@Args('questionnaireSharedId') questionnaireSharedId: string,
		@Args('active', { nullable: true }) active?: boolean,
	): Promise<Questionnaire> {
		return this.questionnaireService.toggleQuestionnaireActive({ questionnaireSharedId, active });
	}

	@Role('Admin')
	@Query(() => Questionnaire, { nullable: true })
	async adminFetchQuestionnaire(
		@Context() { user }: IAdminContext,
		@Args('questionnaireSharedId', { nullable: true }) questionnaireSharedId?: string,
		@Args('questionnaireId', { nullable: true }) questionnaireId?: string,
		@Args('latest', { nullable: true, defaultValue: true }) latest?: boolean,
	): Promise<Questionnaire | undefined> {
		return this.questionnaireService.fetchQuestionnaire({
			questionnaireSharedId,
			questionnaireId,
			latest,
			user,
		});
	}

	@Query(() => Questionnaire, { nullable: true })
	async publicFetchQuestionnaire(
		@Args('questionnaireSharedId', { nullable: true }) questionnaireSharedId?: string,
		@Args('questionnaireId', { nullable: true }) questionnaireId?: string,
	): Promise<Questionnaire | undefined> {
		return this.questionnaireService.fetchQuestionnaire(questionnaireId ? { questionnaireId } : { questionnaireSharedId, latest: true });
	}

	@Role('Admin')
	@Query(() => PaginatedQuestionnaireResponse)
	async adminFetchQuestionnaires(
		@Context() { user }: IAdminContext,
		@Args('pagination', { type: () => PaginationInput, defaultValue: defaultPaginationValues }) pagination: PaginationInput,
		@Args('questionnaireSharedIds', { type: () => [String], nullable: true })
		questionnaireSharedIds?: string[],
		@Args('questionnaireIds', { type: () => [String], nullable: true }) questionnaireIds?: string[],
		@Args('latest', { nullable: true, defaultValue: true }) latest?: boolean,
		@Args('textFilter', { nullable: true }) textFilter?: string,
	): Promise<PaginatedQuestionnaireResponse> {
		return this.questionnaireService.fetchQuestionnaires({
			questionnaireSharedIds,
			questionnaireIds,
			textFilter,
			pagination,
			latest,
			user,
		});
	}

	@Role('Admin')
	@Mutation(() => QuestionnaireQuiz)
	async adminCreateQuestionnaireQuiz(
		@Context() { user }: IAdminContext,
		@Args('questions', { type: () => [QuestionDiscriminatorInput] }) questions: QuestionDiscriminatorInput[],
		@Args('requireEmail', { defaultValue: true }) requireEmail: boolean,
		@Args('requireName', { defaultValue: false }) requireName: boolean,
		@Args('title') title: string,
		@Args('description', { nullable: true }) description?: string,
		@Args('bgColor', { nullable: true }) bgColor?: string,
		@Args('color', { nullable: true }) color?: string,
	): Promise<QuestionnaireQuiz> {
		return this.questionnaireService.createQuestionnaire({
			type: EQuestionnaireType.QuestionnaireQuiz,
			requireEmail,
			requireName,
			description,
			questions,
			title,
			bgColor,
			color,
			user,
		}) as Promise<QuestionnaireQuiz>;
	}

	@Role('Admin')
	@Mutation(() => QuestionnaireSurvey)
	async adminCreateQuestionnaireSurvey(
		@Context() { user }: IAdminContext,
		@Args('questions', { type: () => [QuestionDiscriminatorInput] }) questions: QuestionDiscriminatorInput[],
		@Args('requireEmail', { defaultValue: true }) requireEmail: boolean,
		@Args('requireName', { defaultValue: false }) requireName: boolean,
		@Args('title') title: string,
		@Args('description', { nullable: true }) description?: string,
		@Args('bgColor', { nullable: true }) bgColor?: string,
		@Args('color', { nullable: true }) color?: string,
	): Promise<QuestionnaireSurvey> {
		return this.questionnaireService.createQuestionnaire({
			type: EQuestionnaireType.QuestionnaireSurvey,
			requireEmail,
			requireName,
			description,
			questions,
			bgColor,
			title,
			color,
			user,
		}) as Promise<QuestionnaireSurvey>;
	}

	@Role('Admin')
	@Mutation(() => QuestionnaireExam)
	async adminCreateQuestionnaireExam(
		@Context() { user }: IAdminContext,
		@Args('questions', { type: () => [QuestionDiscriminatorInput] }) questions: QuestionDiscriminatorInput[],
		@Args('requireEmail', { defaultValue: true }) requireEmail: boolean,
		@Args('requireName', { defaultValue: false }) requireName: boolean,
		@Args('title') title: string,
		@Args('randomizeQuestions', { nullable: true, defaultValue: false }) randomizeQuestions?: boolean,
		@Args('passingGradePercent', { nullable: true }) passingGradePercent?: number,
		@Args('maxRetryAmount', { type: () => Int, nullable: true }) maxRetryAmount?: number,
		@Args('description', { nullable: true }) description?: string,
		@Args('timeLimit', { type: () => Int, nullable: true }) timeLimit?: number,
		@Args('bgColor', { nullable: true }) bgColor?: string,
		@Args('color', { nullable: true }) color?: string,
	): Promise<QuestionnaireExam> {
		return this.questionnaireService.createQuestionnaire({
			type: EQuestionnaireType.QuestionnaireExam,
			passingGradePercent,
			randomizeQuestions,
			maxRetryAmount,
			requireEmail,
			requireName,
			description,
			questions,
			timeLimit,
			bgColor,
			color,
			title,
			user,
		}) as Promise<QuestionnaireExam>;
	}

	@Role('Admin')
	@Mutation(() => QuestionnaireQuiz)
	async adminUpdateQuestionnaireQuiz(
		@Context() { user }: IAdminContext,
		@Args('questionnaireId') questionnaireId: string,
		@Args('questionMethods', { type: () => [QuestionMethodInput], nullable: true })
		questionMethods?: QuestionMethodInput[],
		@Args('questionOrder', { type: () => [QuestionOrderInput], nullable: true })
		questionOrder?: QuestionOrderInput[],
		@Args('active', { nullable: true }) active?: boolean,
		@Args('title', { nullable: true }) title?: string,
		@Args('requireEmail', { type: () => Boolean, nullable: true }) requireEmail?: boolean | null,
		@Args('requireName', { type: () => Boolean, nullable: true }) requireName?: boolean | null,
		@Args('description', { type: () => String, nullable: true }) description?: string,
		@Args('bgColor', { nullable: true }) bgColor?: string,
		@Args('color', { nullable: true }) color?: string,
	): Promise<QuestionnaireQuiz> {
		return this.questionnaireService.updateQuestionnaire({
			type: EQuestionnaireType.QuestionnaireQuiz,
			questionnaireId,
			questionMethods,
			questionOrder,
			requireEmail,
			description,
			requireName,
			bgColor,
			color,
			active,
			title,
			user,
		}) as Promise<QuestionnaireQuiz>;
	}

	@Role('Admin')
	@Mutation(() => QuestionnaireSurvey)
	async adminUpdateQuestionnaireSurvey(
		@Context() { user }: IAdminContext,
		@Args('questionnaireId') questionnaireId: string,
		@Args('questionMethods', { type: () => [QuestionMethodInput], nullable: true })
		questionMethods?: QuestionMethodInput[],
		@Args('questionOrder', { type: () => [QuestionOrderInput], nullable: true })
		questionOrder?: QuestionOrderInput[],
		@Args('active', { nullable: true }) active?: boolean,
		@Args('title', { nullable: true }) title?: string,
		@Args('requireEmail', { type: () => Boolean, nullable: true }) requireEmail?: boolean | null,
		@Args('requireName', { type: () => Boolean, nullable: true }) requireName?: boolean | null,
		@Args('description', { type: () => String, nullable: true }) description?: string,
		@Args('bgColor', { nullable: true }) bgColor?: string,
		@Args('color', { nullable: true }) color?: string,
	): Promise<QuestionnaireSurvey> {
		return this.questionnaireService.updateQuestionnaire({
			type: EQuestionnaireType.QuestionnaireSurvey,
			questionnaireId,
			questionMethods,
			questionOrder,
			requireEmail,
			description,
			requireName,
			bgColor,
			color,
			active,
			title,
			user,
		}) as Promise<QuestionnaireSurvey>;
	}

	@Role('Admin')
	@Mutation(() => QuestionnaireExam)
	async adminUpdateQuestionnaireExam(
		@Context() { user }: IAdminContext,
		@Args('questionnaireId') questionnaireId: string,
		@Args('questionMethods', { type: () => [QuestionMethodInput], nullable: true })
		questionMethods?: QuestionMethodInput[],
		@Args('questionOrder', { type: () => [QuestionOrderInput], nullable: true })
		questionOrder?: QuestionOrderInput[],
		@Args('randomizeQuestions', { nullable: true, defaultValue: false }) randomizeQuestions?: boolean,
		@Args('passingGradePercent', { type: () => Number, nullable: true }) passingGradePercent?: number | null,
		@Args('active', { nullable: true }) active?: boolean,
		@Args('title', { type: () => String, nullable: true }) title?: string,
		@Args('requireEmail', { type: () => Boolean, nullable: true }) requireEmail?: boolean | null,
		@Args('requireName', { type: () => Boolean, nullable: true }) requireName?: boolean | null,
		@Args('maxRetryAmount', { type: () => Int, nullable: true }) maxRetryAmount?: number | null,
		@Args('timeLimit', { type: () => Int, nullable: true }) timeLimit?: number | null,
		@Args('description', { type: () => String, nullable: true }) description?: string,
		@Args('bgColor', { nullable: true }) bgColor?: string,
		@Args('color', { nullable: true }) color?: string,
	): Promise<QuestionnaireExam> {
		return this.questionnaireService.updateQuestionnaire({
			type: EQuestionnaireType.QuestionnaireExam,
			passingGradePercent,
			randomizeQuestions,
			questionnaireId,
			questionMethods,
			maxRetryAmount,
			questionOrder,
			requireEmail,
			description,
			requireName,
			timeLimit,
			bgColor,
			color,
			active,
			title,
			user,
		}) as Promise<QuestionnaireExam>;
	}
}
