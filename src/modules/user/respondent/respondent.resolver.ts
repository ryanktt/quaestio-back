import { Respondent } from './respondent.schema';

import { ResponseQuestionnaireRepository } from '@modules/shared/response-questionnaire/response-questionnaire.repository';
import { ResolveField, Resolver, Parent } from '@nestjs/graphql';
import { Questionnaire } from '@modules/questionnaire/schema';

@Resolver(() => Respondent)
export class RespondentResolver {
	constructor(private readonly responseQuestRepository: ResponseQuestionnaireRepository) {}

	// calls itself to define type in schema.gql so i dont get: '"Respondent" defined in resolvers, but not in schema.'
	@ResolveField(() => Respondent)
	self(@Parent() respondent: Respondent): Respondent {
		return respondent;
	}

	@ResolveField(() => Questionnaire)
	async questionnaire(@Parent() respondent: Respondent): Promise<Questionnaire> {
		return this.responseQuestRepository.questionnaireLoader().load(respondent.questionnaire.toString());
	}
}
