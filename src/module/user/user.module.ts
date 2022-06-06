import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { UserSchema } from './user.schema';
import { UserHelper } from './user.helper';

import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionModule } from '@modules/session';
import { UtilsPromise } from '@utils/*';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
		forwardRef(() => SessionModule),
	],
	providers: [UserService, UserResolver, UserHelper, UtilsPromise],
	exports: [UserHelper],
})
export class UserModule {}
