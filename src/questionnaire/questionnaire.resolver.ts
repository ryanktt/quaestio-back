import { Questionnaire, QuestionnaireQuiz } from './questionnaire.schema';
import { QuestionDiscriminatorInput } from './questionnaire.input';
import { QuestionnaireService } from './questionnaire.service';

import { Resolver, ResolveField, Parent, Context, Mutation, Args } from '@nestjs/graphql';
import { Admin, AdminDocument } from 'src/user';
import { IAdminContext } from 'src/session';
import { ILoaders } from 'src/app.loaders';
import { Role } from '../utils/utils.auth';

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
	@Mutation(() => QuestionnaireQuiz)
	async createQuestionnaireQuiz(
		@Context('req') { user }: IAdminContext,
		@Args('questions', { type: () => [QuestionDiscriminatorInput] }) questions: QuestionDiscriminatorInput[],
		@Args('title') title: string,
	): Promise<QuestionnaireQuiz> {
		return this.questionnaireService.createQuestionnaireQuiz({ questions, title, user });
	}
}
