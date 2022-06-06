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
	providers: [SessionHelper, SessionService, UtilsPromise, UtilsDate],
	exports: [SessionHelper],
})
export class SessionModule {}
