import { AdminRepository, AdminResolver, AdminSchema, AdminService } from './admin';
import { UserRepository } from './user.repository';
import { UserSchema } from './user.schema';
import { UserHelper } from './user.helper';

import { forwardRef, Module } from '@nestjs/common';
import { UtilsArray, UtilsPromise } from '@utils/*';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionModule } from 'src/session';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: 'User',
				schema: UserSchema,
				discriminators: [{ name: 'Admin', schema: AdminSchema }],
			},
		]),
		forwardRef(() => SessionModule),
	],
	providers: [
		UserRepository,
		UserHelper,
		UtilsPromise,
		UtilsArray,
		AdminRepository,
		AdminService,
		AdminResolver,
	],
	exports: [UserRepository, UserHelper, AdminRepository, AdminService, AdminResolver],
})
export class UserModule {}
