import { UserRepository } from './user.repository';
import { UserSchema } from './user.schema';
import { UserHelper } from './user.helper';

import { forwardRef, Module } from '@nestjs/common';
import { UtilsArray, UtilsPromise } from '@utils/*';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { SessionModule } from 'src/session';
import { UserResolver } from './user.resolver';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
		forwardRef(() => SessionModule),
	],
	providers: [UserRepository, UserResolver, UserService, UserHelper, UtilsPromise, UtilsArray],
	exports: [UserRepository, UserHelper, UserService],
})
export class UserModule {}
