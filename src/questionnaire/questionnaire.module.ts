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

import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResponseModule } from 'src/response';
import { UtilsModule } from '@utils/*';
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
					{ name: 'QuestionnaireQuiz', schema: QuestionnaireQuizSchema },
				],
			},
		]),
		forwardRef(() => ResponseModule),
		forwardRef(() => UtilsModule),
		forwardRef(() => UserModule),
	],
	providers: [QuestionnaireResolver, QuestionnaireRepository, QuestionnaireHelper, QuestionnaireService],
	exports: [QuestionnaireRepository, QuestionnaireHelper, QuestionnaireService],
})
export class QuestionnaireModule {}
