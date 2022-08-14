import { ResponseService } from './response.service';
import { AnswerDiscriminatorInput, Response } from './schema';

import { Resolver, ResolveField, Parent, Context, ObjectType, Field, Args, Mutation } from '@nestjs/graphql';
import { Questionnaire } from '@modules/questionnaire';
import { ILoaders } from '@graphql/graphql.interface';
import { IPublicContext } from '@modules/session';

@ObjectType()
class PublicUpsertResponse {
	@Field()
	authToken: string;
}

@Resolver(() => Response)
export class ResponseResolver {
	constructor(private readonly responseService: ResponseService) {}

	// remover
	@ResolveField(() => Response)
	itself(@Parent() response: Response): Response {
		return response;
	}

	@ResolveField(() => Questionnaire)
	async questionnaire(
		@Context('loaders') { questionnaireLoader }: ILoaders,
		@Parent() response: Response,
	): Promise<Questionnaire> {
		return questionnaireLoader.load(response.questionnaire);
	}

	@Mutation(() => PublicUpsertResponse)
	async publicUpsertSurveyResponse(
		@Context() { authToken }: IPublicContext,
		@Args('answers', { type: () => [AnswerDiscriminatorInput] }) answers: AnswerDiscriminatorInput[],
		@Args('questionnaireId') questionnaireId: string,
	): Promise<PublicUpsertResponse> {
		return this.responseService.publicUpsertSurveyResponse({ answers, questionnaireId, authToken });
	}
}
