import { SessionResolver } from './session.resolver';
import { SessionService } from './session.service';
import { SessionSchema } from './session.schema';
import { SessionHelper } from './session.helper';

import { UtilsDate, UtilsPromise } from '@utils/*';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '@modules/user';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: 'Session', schema: SessionSchema }]),
		forwardRef(() => UserModule),
	],
	providers: [SessionResolver, SessionHelper, SessionService, UtilsPromise, UtilsDate],
	exports: [SessionHelper, SessionService],
})
export class SessionModule {}
