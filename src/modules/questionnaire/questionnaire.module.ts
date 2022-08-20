import {
	QuestionnaireSchema,
	QuestionnaireExamSchema,
	QuestionnaireQuizSchema,
	QuestionnaireSurveySchema,
} from './schema';
import { QuestionnaireRepository } from './questionnaire.repository';
import { QuestionnaireResolver } from './questionnaire.resolver';
import { QuestionnaireService } from './questionnaire.service';
import { QuestionnaireHelper } from './questionnaire.helper';

import { MongooseModule } from '@nestjs/mongoose';
import { UtilsModule } from '@utils/utils.module';
import { Module } from '@nestjs/common';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: 'Questionnaire',
				schema: QuestionnaireSchema,
				discriminators: [
					{ name: 'QuestionnaireSurvey', schema: QuestionnaireSurveySchema },
					{ name: 'QuestionnaireExam', schema: QuestionnaireExamSchema },
					{ name: 'QuestionnaireQuiz', schema: QuestionnaireQuizSchema },
				],
			},
		]),
		UtilsModule,
	],
	providers: [QuestionnaireResolver, QuestionnaireRepository, QuestionnaireHelper, QuestionnaireService],
	exports: [QuestionnaireRepository, QuestionnaireHelper, QuestionnaireService],
})
export class QuestionnaireModule {}
