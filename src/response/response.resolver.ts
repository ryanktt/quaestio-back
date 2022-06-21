import { AnswerDiscriminatorInput } from './response.input';
import { ResponseService } from './response.service';
import { Response } from './response.schema';

import { Resolver, Context, Mutation, Args } from '@nestjs/graphql';
import { IRespondentContext } from 'src/session';
import { Role } from '@utils/*';

@Resolver(() => Response)
export class ResponseResolver {
	constructor(private readonly responseService: ResponseService) {}

	@Role('Respondent')
	@Mutation(() => Response)
	async createResponse(
		@Context('req') { user }: IRespondentContext,
		@Args('answers', { type: () => [AnswerDiscriminatorInput] }) answers: AnswerDiscriminatorInput[],
		@Args('questionnaireId') questionnaireId: string,
	): Promise<Response> {
		return this.responseService.createResponse({ answers, questionnaireId, user });
	}
}
