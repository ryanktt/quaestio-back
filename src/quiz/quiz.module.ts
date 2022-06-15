import { QuizExamSchema, QuizSchema, QuizSurveySchema } from './quiz.schema';

import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from 'src/user';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: 'Quiz',
				schema: QuizSchema,
				discriminators: [
					{ name: 'QuizSurvey', schema: QuizSurveySchema },
					{ name: 'QuizExam', schema: QuizExamSchema },
				],
			},
		]),
		forwardRef(() => UserModule),
	],
	providers: [],
	exports: [],
})
export class QuizModule {}
