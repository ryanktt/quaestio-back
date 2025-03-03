import { AnswerDiscriminatorInput, Response } from './schema';
import { ResponseQuestionnaireRepository } from '@modules/shared/response-questionnaire/response-questionnaire.repository';
import { Questionnaire } from '@modules/questionnaire/schema/questionnaire.schema';
import { ResponseService } from './response.service';

import { Resolver, ResolveField, Parent, Context, ObjectType, Field, Args, Mutation, Query } from '@nestjs/graphql';
import { IAdminContext, IPublicContext } from '@modules/session/session.interface';
import { Role } from '@utils/utils.decorators';

@ObjectType()
class PublicUpsertResponse {
	@Field()
	respondentToken: string;
}

@Resolver(() => Response)
export class ResponseResolver {
	constructor(
		private readonly responseService: ResponseService,
		private readonly responseQuestRepository: ResponseQuestionnaireRepository,
	) { }

	// calls itself to define type in schema.gql so i dont get: '"Response" defined in resolvers, but not in schema.'
	@ResolveField(() => Response)
	self(@Parent() response: Response): Response {
		return response;
	}

	@ResolveField(() => Questionnaire)
	async questionnaire(@Parent() response: Response): Promise<Questionnaire> {
		return this.responseQuestRepository.questionnaireLoader().load(response.questionnaire.toString());
	}

	@Mutation(() => PublicUpsertResponse)
	publicUpsertQuestionnaireResponse(
		@Context() { clientIp, userAgent, respondentToken }: IPublicContext,
		@Args('answers', { type: () => [AnswerDiscriminatorInput] }) answers: AnswerDiscriminatorInput[],
		@Args('questionnaireId') questionnaireId: string,
		@Args('completedAt') completedAt: Date,
		@Args('startedAt') startedAt: Date,
		@Args('email', { nullable: true }) email: string,
		@Args('name', { nullable: true }) name: string,
	): Promise<PublicUpsertResponse> {
		return this.responseService.publicUpsertQuestionnaireResponse({
			respondentToken,
			questionnaireId,
			ip: clientIp,
			completedAt,
			startedAt,
			userAgent,
			answers,
			email,
			name,
		});
	}

	@Role('Admin')
	@Query(() => [Response])
	async adminFetchResponses(
		@Context() { user }: IAdminContext,
		@Args('questionnaireSharedIds', { type: () => [String], nullable: true })
		questionnaireSharedIds?: string[],
		@Args('questionnaireIds', { type: () => [String], nullable: true }) questionnaireIds?: string[],
		@Args('textFilter', { nullable: true }) textFilter?: string,
	): Promise<Response[]> {
		return this.responseService.adminFetchResponses({
			questionnaireSharedIds,
			questionnaireIds,
			textFilter,
			user,
		});
	}
}
