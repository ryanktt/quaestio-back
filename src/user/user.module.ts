import { UserRepository } from './user.repository';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { UserSchema } from './user.schema';
import { UserHelper } from './user.helper';

import { forwardRef, Module } from '@nestjs/common';
import { UtilsArray, UtilsPromise } from '@utils/*';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionModule } from 'src/session';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
		forwardRef(() => SessionModule),
	],
	providers: [UserService, UserResolver, UserHelper, UserRepository, UtilsPromise, UtilsArray],
	exports: [UserHelper, UserService, UserRepository],
})
export class UserModule {}
