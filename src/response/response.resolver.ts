import { AnswerDiscriminatorInput } from './response.input';
import { ResponseService } from './response.service';
import { Response } from './response.schema';

import { Resolver, Context, Mutation, Args } from '@nestjs/graphql';
import { IRespondentContext } from 'src/session';

@Resolver(() => Response)
export class ResponseResolver {
	constructor(private readonly responseService: ResponseService) {}

	@Mutation(() => Response)
	async publicCreateResponse(
		@Context('req') { user }: IRespondentContext,
		@Args('answers', { type: () => [AnswerDiscriminatorInput] }) answers: AnswerDiscriminatorInput[],
		@Args('questionnaireId') questionnaireId: string,
	): Promise<Response> {
		return this.responseService.createResponse({ answers, questionnaireId, user });
	}
}
