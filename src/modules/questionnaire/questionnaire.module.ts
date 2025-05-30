import {
	QuestionnaireSchema,
	QuestionnaireExamSchema,
	QuestionnaireQuizSchema,
	QuestionnaireSurveySchema,
} from './schema';
import { QuestionnaireMetricsSchema } from './schema/questionnaire-metrics';
import { QuestionnaireRepository } from './questionnaire.repository';
import { OptionResolver, QuestionnaireResolver } from './questionnaire.resolver';
import { QuestionnaireService } from './questionnaire.service';
import { QuestionnaireHelper } from './questionnaire.helper';

import { ResponseQuestionnaireModule } from '@modules/shared/response-questionnaire/response-questionnaire.module';
import { UserSessionModule } from '@modules/shared/user-session/user-session.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UtilsModule } from '@utils/utils.module';
import { Module } from '@nestjs/common';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: 'QuestionnaireMetrics',
				schema: QuestionnaireMetricsSchema,
			},
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
		ResponseQuestionnaireModule,
		UserSessionModule,
		UtilsModule,
	],
	providers: [QuestionnaireResolver, QuestionnaireRepository, QuestionnaireHelper, QuestionnaireService, OptionResolver],
	exports: [QuestionnaireRepository, QuestionnaireHelper, QuestionnaireService],
})
export class QuestionnaireModule { }
