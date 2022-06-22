import { AnswerDiscriminatorInput } from './response.input';
import { ResponseService } from './response.service';
import { Response } from './response.schema';

import { Resolver, ResolveField, Parent, Context, Mutation, Args } from '@nestjs/graphql';
import { Questionnaire } from 'src/questionnaire';
import { IRespondentContext } from 'src/session';
import { Admin, AdminDocument } from 'src/user';
import { ILoaders } from 'src/app.loaders';

@Resolver(() => Response)
export class ResponseResolver {
	constructor(private readonly responseService: ResponseService) {}

	@ResolveField(() => Admin)
	async user(
		@Context('loaders') { userLoader }: ILoaders,
		@Parent() response: Response,
	): Promise<AdminDocument> {
		return userLoader.load(response.user) as Promise<AdminDocument>;
	}

	@ResolveField(() => Questionnaire)
	async questionnaire(
		@Context('loaders') { questionnaireLoader }: ILoaders,
		@Parent() response: Response,
	): Promise<Questionnaire> {
		return questionnaireLoader.load(response.questionnaire) as Promise<Questionnaire>;
	}

	@Mutation(() => Response)
	async publicCreateResponse(
		@Context('req') { user }: IRespondentContext,
		@Args('answers', { type: () => [AnswerDiscriminatorInput] }) answers: AnswerDiscriminatorInput[],
		@Args('questionnaireId') questionnaireId: string,
	): Promise<Response> {
		// TODO create guest
		return this.responseService.createResponse({ answers, questionnaireId, user });
	}
}
