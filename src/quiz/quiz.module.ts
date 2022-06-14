import { QuizSchema } from './quiz.schema';

import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from 'src/user';

@Module({
	imports: [MongooseModule.forFeature([{ name: 'Quiz', schema: QuizSchema }]), forwardRef(() => UserModule)],
	providers: [],
	exports: [],
})
export class QuizModule {}
