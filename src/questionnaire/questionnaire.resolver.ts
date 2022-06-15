import { Questionnaire } from './questionnaire.schema';

import { Resolver, ResolveField, Parent, Context } from '@nestjs/graphql';
import { Admin, AdminDocument } from 'src/user';
import { ILoaders } from 'src/app.loaders';

@Resolver(() => Questionnaire)
export class QuestionnaireResolver {
	@ResolveField(() => Admin)
	async user(
		@Context('loaders') { userLoader }: ILoaders,
		@Parent() questionnaire: Questionnaire,
	): Promise<AdminDocument> {
		return userLoader.load(questionnaire.user) as Promise<AdminDocument>;
	}
}
