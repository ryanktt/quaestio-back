import { AnswerDiscriminatorInput, Response } from './schema';
import { ResponseQuestionnaireRepository } from '@modules/shared/response-questionnaire/response-questionnaire.repository';
import { Questionnaire } from '@modules/questionnaire/schema/questionnaire.schema';
import { ResponseService } from './response.service';

import { Resolver, ResolveField, Parent, Context, ObjectType, Field, Args, Mutation } from '@nestjs/graphql';
import { IPublicContext } from '@modules/session/session.interface';

@ObjectType()
class PublicUpsertResponse {
	@Field()
	authToken: string;
}

@Resolver(() => Response)
export class ResponseResolver {
	constructor(
		private readonly responseService: ResponseService,
		private readonly responseQuestRepository: ResponseQuestionnaireRepository
	) { }

	// calls itself to define type in schema.gql so i dont get: '"Response" defined in resolvers, but not in schema.'
	@ResolveField(() => Response)
	self(@Parent() response: Response): Response {
		return response;
	}

	@ResolveField(() => Questionnaire)
	async questionnaire(@Parent() response: Response): Promise<Questionnaire> {
		return this.responseQuestRepository.questionnaireLoader().load(response.questionnaire);
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
