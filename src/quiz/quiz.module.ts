import { QuizExamSchema, QuizSchema, QuizSurveySchema } from './quiz.schema';
import { QuizRepository } from './quiz.repository';

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
	providers: [QuizRepository],
	exports: [QuizRepository],
})
export class QuizModule {}
