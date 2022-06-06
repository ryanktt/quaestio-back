import { SessionSchema, SessionShared } from '@modules/session';
import { UserSchema, UserShared } from '@modules/user';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'User', schema: UserSchema },
			{ name: 'Session', schema: SessionSchema },
		]),
	],
	providers: [SessionShared, UserShared],
})
export class SharedModule {}
