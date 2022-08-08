import { SessionRepository } from './session.repository';
import { SessionResolver } from './session.resolver';
import { SessionService } from './session.service';
import { SessionSchema } from './session.schema';
import { SessionHelper } from './session.helper';

import { forwardRef, Module } from '@nestjs/common';
import { UtilsDate, UtilsPromise } from '@utils/*';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '@modules/user';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: 'Session', schema: SessionSchema }]),
		forwardRef(() => UserModule),
	],
	providers: [SessionResolver, SessionHelper, SessionService, SessionRepository, UtilsPromise, UtilsDate],
	exports: [SessionHelper, SessionService, SessionRepository],
})
export class SessionModule {}
