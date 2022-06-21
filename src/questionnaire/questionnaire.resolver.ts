import { Questionnaire, QuestionnaireQuiz } from './questionnaire.schema';
import { QuestionDiscriminatorInput } from './questionnaire.input';
import { QuestionnaireService } from './questionnaire.service';

import { Resolver, ResolveField, Parent, Context, Mutation, Args, Query } from '@nestjs/graphql';
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
		@Args('questionnaireSharedId', { nullable: true }) questionnaireSharedId: string,
		@Args('questionnaireId', { nullable: true }) questionnaireId: string,
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
		return this.questionnaireService.createQuestionnaireQuiz({ questions, title, user });
	}
}
