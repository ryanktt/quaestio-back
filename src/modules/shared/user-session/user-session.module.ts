import { UserSessionRepository } from './user-session.repository';
import { UserSessionHelper } from './user-session.helper';

import { SessionSchema } from '@modules/session/session.schema';
import { UserSchema } from '@modules/user/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { UtilsModule } from '@utils/utils.module';
import { Module } from '@nestjs/common';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Session', schema: SessionSchema },
			{ name: 'User', schema: UserSchema },
		]),
		UtilsModule,
	],
	providers: [UserSessionHelper, UserSessionRepository],
	exports: [UserSessionHelper, UserSessionRepository],
})
export class UserSessionModule {}
