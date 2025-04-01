import { Answer, AnswerDiscriminatorInput, AnswerTypes, Response } from './schema';
import { ResponseQuestionnaireRepository } from '@modules/shared/response-questionnaire/response-questionnaire.repository';
import { Questionnaire } from '@modules/questionnaire/schema/questionnaire.schema';
import { ResponseService } from './response.service';

import { Resolver, ResolveField, Parent, Context, ObjectType, Field, Args, Mutation, Query } from '@nestjs/graphql';
import { IAdminContext, IPublicContext } from '@modules/session/session.interface';
import { Role } from '@utils/utils.decorators';
import { defaultPaginationValues, PaginatedResponse, PaginationInput } from '@utils/utils.pagination';


@ObjectType()
class CorrectQuestionOption {
	@Field()
	questionId: string;

	@Field(() => [String])
	optionIds: string[];
}

@ObjectType()
class ResponseCorrection {
	@Field(() => [Answer])
	correctedAnswers: AnswerTypes[];

	@Field(() => [CorrectQuestionOption])
	correctQuestionOptions: CorrectQuestionOption[];
}

export interface IResponseCorrection {
	correctedAnswers: AnswerTypes[]
	correctQuestionOptions: {
		questionId: string;
		optionIds: string[];
	}[]
}

@ObjectType()
class PublicUpsertResponse {
	@Field()
	respondentToken: string;

	@Field(() => ResponseCorrection)
	correction: ResponseCorrection;
}

@ObjectType()
export class PaginatedResponseResponse extends PaginatedResponse(Response) { }

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
	@Query(() => PaginatedResponseResponse)
	async adminFetchResponses(
		@Context() { user }: IAdminContext,
		@Args('pagination', { type: () => PaginationInput, defaultValue: defaultPaginationValues }) pagination: PaginationInput,
		@Args('questionnaireSharedIds', { type: () => [String], nullable: true })
		questionnaireSharedIds?: string[],
		@Args('questionnaireIds', { type: () => [String], nullable: true }) questionnaireIds?: string[],
		@Args('textFilter', { nullable: true }) textFilter?: string,
	): Promise<PaginatedResponseResponse> {
		return this.responseService.adminFetchResponses({
			questionnaireSharedIds,
			questionnaireIds,
			textFilter,
			pagination,
			user,
		});
	}

	@Role('Admin')
	@Query(() => Response, { nullable: true })
	async adminFetchResponse(
		@Context() { user }: IAdminContext,
		@Args('responseId') responseId: string,
	): Promise<Response | undefined> {
		return this.responseService.adminFetchResponse({
			responseId,
			user,
		});
	}
}
