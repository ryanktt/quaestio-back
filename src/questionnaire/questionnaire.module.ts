import {
	QuestionnaireSchema,
	QuestionnaireExamSchema,
	QuestionnaireSurveySchema,
} from './questionnaire.schema';
import { QuestionnaireRepository } from './questionnaire.repository';
import { QuestionnaireResolver } from './questionnaire.resolver';

import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from 'src/user';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: 'Questionnaire',
				schema: QuestionnaireSchema,
				discriminators: [
					{ name: 'QuestionnaireSurvey', schema: QuestionnaireSurveySchema },
					{ name: 'QuestionnaireExam', schema: QuestionnaireExamSchema },
				],
			},
		]),
		forwardRef(() => UserModule),
	],
	providers: [QuestionnaireResolver, QuestionnaireRepository],
	exports: [QuestionnaireRepository],
})
export class QuestionnaireModule {}
