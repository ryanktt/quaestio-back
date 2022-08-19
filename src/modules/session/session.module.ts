import { SessionRepository } from './session.repository';
import { SessionResolver } from './session.resolver';
import { SessionService } from './session.service';
import { SessionSchema } from './session.schema';
import { SessionHelper } from './session.helper';

import { UserSessionModule } from '@modules/shared/user-session/user-session.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UtilsModule } from '@utils/utils.module';
import { Module } from '@nestjs/common';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: 'Session', schema: SessionSchema }]),
		UserSessionModule,
		UtilsModule,
	],
	providers: [SessionResolver, SessionHelper, SessionService, SessionRepository],
	exports: [SessionHelper, SessionService, SessionRepository],
})
export class SessionModule {}
