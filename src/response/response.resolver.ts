import { AnswerDiscriminatorInput } from './schema/response.input';
import { ResponseService } from './response.service';
import { Response } from './schema';

import { Resolver, ResolveField, Parent, Context, Mutation, Args, ObjectType, Field } from '@nestjs/graphql';
import { Questionnaire } from 'src/questionnaire';
import { IPublicContext } from 'src/session';
import { ILoaders } from 'src/app.loaders';

@ObjectType()
class PublicUpsertResponse {
	@Field()
	authToken: string;

	@Field(() => Response)
	response: Response;
}

@Resolver(() => Response)
export class ResponseResolver {
	constructor(private readonly responseService: ResponseService) {}

	@ResolveField(() => Questionnaire)
	async questionnaire(
		@Context('loaders') { questionnaireLoader }: ILoaders,
		@Parent() response: Response,
	): Promise<Questionnaire> {
		return questionnaireLoader.load(response.questionnaire) as Promise<Questionnaire>;
	}

	@Mutation(() => PublicUpsertResponse)
	async publicUpsertResponse(
		@Context('req') { authToken }: IPublicContext,
		@Args('answers', { type: () => [AnswerDiscriminatorInput] }) answers: AnswerDiscriminatorInput[],
		@Args('questionnaireId') questionnaireId: string,
	): Promise<PublicUpsertResponse> {
		return this.responseService.publicUpsertResponse({ answers, questionnaireId, authToken });
	}
}
