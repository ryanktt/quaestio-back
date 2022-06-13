import { AdminSchema, AdminRepository, AdminService, AdminResolver } from './admin';
import { RespondentRepository, RespondentSchema } from './respondent';
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
				discriminators: [
					{ name: 'Respondent', schema: RespondentSchema },
					{ name: 'Admin', schema: AdminSchema },
				],
			},
		]),
		forwardRef(() => SessionModule),
	],
	providers: [
		UserRepository,
		UserHelper,
		AdminRepository,
		AdminResolver,
		AdminService,
		RespondentRepository,
		UtilsPromise,
		UtilsArray,
	],
	exports: [UserRepository, UserHelper, AdminRepository, AdminService, AdminResolver, RespondentRepository],
})
export class UserModule {}
