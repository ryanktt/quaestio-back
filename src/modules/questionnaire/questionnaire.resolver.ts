import {
	Questionnaire,
	QuestionnaireExam,
	QuestionnaireQuiz,
	QuestionnaireSurvey,
	QuestionDiscriminatorInput,
} from './schema';
import { QuestionnaireService } from './questionnaire.service';

import { ResolveField, Resolver, Mutation, Context, Parent, Query, Args } from '@nestjs/graphql';
import { UserSessionRepository } from '@modules/shared/user-session/user-session.repository';
import { Admin, AdminDocument } from '@modules/user/admin/admin.schema';
import { IAdminContext } from '@modules/session/session.interface';
import { EQuestionnaireType } from './questionnaire.interface';
import { Role } from '@utils/utils.decorators';

@Resolver(() => Questionnaire)
export class QuestionnaireResolver {
	constructor(
		private readonly questionnaireService: QuestionnaireService,
		private readonly userSessionRepository: UserSessionRepository
	) { }

	@ResolveField(() => Admin)
	async user(@Parent() questionnaire: Questionnaire): Promise<AdminDocument> {
		return this.userSessionRepository.userLoader().load(questionnaire.user) as Promise<AdminDocument>;
	}

	@Role('Admin')
	@Query(() => Questionnaire, { nullable: true })
	async adminFetchQuestionnaire(
		@Context() { user }: IAdminContext,
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
	@Query(() => [Questionnaire])
	async adminFetchQuestionnaires(
		@Context() { user }: IAdminContext,
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
		@Context() { user }: IAdminContext,
		@Args('questions', { type: () => [QuestionDiscriminatorInput] }) questions: QuestionDiscriminatorInput[],
		@Args('requireEmail', { defaultValue: true }) requireEmail: boolean,
		@Args('requireName', { defaultValue: false }) requireName: boolean,
		@Args('title') title: string,
	): Promise<QuestionnaireQuiz> {
		return this.questionnaireService.createQuestionnaire({
			type: EQuestionnaireType.QuestionnaireQuiz,
			requireEmail,
			requireName,
			questions,
			title,
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
	): Promise<QuestionnaireSurvey> {
		return this.questionnaireService.createQuestionnaire({
			type: EQuestionnaireType.QuestionnaireSurvey,
			requireEmail,
			requireName,
			questions,
			title,
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
		@Args('maxRetryAmount', { nullable: true }) maxRetryAmount?: number,
		@Args('timeLimit', { nullable: true }) timeLimit?: number,
	): Promise<QuestionnaireExam> {
		return this.questionnaireService.createQuestionnaire({
			type: EQuestionnaireType.QuestionnaireExam,
			passingGradePercent,
			randomizeQuestions,
			maxRetryAmount,
			requireEmail,
			requireName,
			questions,
			timeLimit,
			title,
			user,
		}) as Promise<QuestionnaireExam>;
	}

	@Role('Admin')
	@Mutation(() => QuestionnaireQuiz)
	async adminUpdateQuestionnaireQuiz(
		@Context() { user }: IAdminContext,
		@Args('questionnaireId') questionnaireId: string,
		@Args('questions', { type: () => [QuestionDiscriminatorInput], nullable: true })
		questions?: QuestionDiscriminatorInput[],
		@Args('requireEmail', { nullable: true }) requireEmail?: boolean,
		@Args('requireName', { nullable: true }) requireName?: boolean,
		@Args('title', { nullable: true }) title?: string,
	): Promise<QuestionnaireQuiz> {
		return this.questionnaireService.updateQuestionnaire({
			type: EQuestionnaireType.QuestionnaireQuiz,
			questionnaireId,
			requireEmail,
			requireName,
			questions,
			title,
			user,
		}) as Promise<QuestionnaireQuiz>;
	}

	@Role('Admin')
	@Mutation(() => QuestionnaireSurvey)
	async adminUpdateQuestionnaireSurvey(
		@Context() { user }: IAdminContext,
		@Args('questionnaireId') questionnaireId: string,
		@Args('questions', { type: () => [QuestionDiscriminatorInput], nullable: true })
		questions?: QuestionDiscriminatorInput[],
		@Args('requireEmail', { nullable: true }) requireEmail?: boolean,
		@Args('requireName', { nullable: true }) requireName?: boolean,
		@Args('title', { nullable: true }) title?: string,
	): Promise<QuestionnaireSurvey> {
		return this.questionnaireService.updateQuestionnaire({
			type: EQuestionnaireType.QuestionnaireSurvey,
			questionnaireId,
			requireEmail,
			requireName,
			questions,
			title,
			user,
		}) as Promise<QuestionnaireSurvey>;
	}

	@Role('Admin')
	@Mutation(() => QuestionnaireExam)
	async adminUpdateQuestionnaireExam(
		@Context() { user }: IAdminContext,
		@Args('questionnaireId') questionnaireId: string,
		@Args('questions', { type: () => [QuestionDiscriminatorInput], nullable: true })
		questions?: QuestionDiscriminatorInput[],
		@Args('randomizeQuestions', { nullable: true, defaultValue: false }) randomizeQuestions?: boolean,
		@Args('passingGradePercent', { type: () => Number, nullable: true }) passingGradePercent?: number | null,
		@Args('maxRetryAmount', { type: () => Number, nullable: true }) maxRetryAmount?: number | null,
		@Args('timeLimit', { type: () => Number, nullable: true }) timeLimit?: number | null,
		@Args('title', { type: () => Number, nullable: true }) title?: string,
		@Args('requireEmail', { nullable: true }) requireEmail?: boolean,
		@Args('requireName', { nullable: true }) requireName?: boolean,
	): Promise<QuestionnaireExam> {
		return this.questionnaireService.updateQuestionnaire({
			type: EQuestionnaireType.QuestionnaireExam,
			passingGradePercent,
			randomizeQuestions,
			questionnaireId,
			maxRetryAmount,
			requireEmail,
			requireName,
			questions,
			timeLimit,
			title,
			user,
		}) as Promise<QuestionnaireExam>;
	}
}
